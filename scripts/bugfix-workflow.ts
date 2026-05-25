import { confirm, input as promptInput, select } from '@inquirer/prompts';
import { consola } from 'consola';
import { config as loadEnv } from 'dotenv';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import process, { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import ora from 'ora';
import {
  assertCleanWorkingTree,
  assignIssueToReporter,
  buildSlackChannelMemberEmailMap,
  buildSlackSummaryMessage,
  commitAllChanges,
  computeNextPatchTag,
  createAndPushTag,
  getCurrentJiraUser,
  getIssueStatusName,
  hasWorkingTreeChanges,
  JiraClientConfig,
  JiraIssue,
  pushCurrentBranch,
  resolveRepoSlug,
  resolveSlackUserIdByEmail,
  resolveSlackUserIdByEmailInChannel,
  searchAssignedBugsInLatestSprint,
  sendSlackMessage,
  TagCiResult,
  transitionIssueToDevDone,
  waitForTagWorkflow,
  WorkflowRecord,
  writeSessionLog,
} from './bugfix-workflow-lib';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const envLocalPath = path.join(repoRoot, '.env.local');
if (existsSync(envLocalPath)) {
  loadEnv({ path: envLocalPath, quiet: true });
}

const log = consola.withTag('bugfix');
const ANSI_RESET = '\x1b[0m';
const ANSI_DIM = '\x1b[2m';
const ANSI_BOLD = '\x1b[1m';
const ANSI_CYAN = '\x1b[36m';

function dimText(text: string): string {
  return `${ANSI_DIM}${text}${ANSI_RESET}`;
}

function questionText(text: string): string {
  return `${ANSI_BOLD}${ANSI_CYAN}❓ ${text}${ANSI_RESET}`;
}

function narrative(message: string): void {
  log.info(dimText(message));
}

async function promptAutoStep(
  rl: readline.Interface,
  label: string,
  detail?: string,
  defaultValue = true,
): Promise<boolean> {
  const message = detail ? `${label}\n${dimText(detail)}` : label;
  if (process.stdin.isTTY) {
    return await confirm({
      message: questionText(message),
      default: defaultValue,
    });
  }
  rl.resume();
  const suffix = defaultValue ? '[Y/n]' : '[y/N]';
  const answer = (await rl.question(`${questionText(message)} ${suffix} `))
    .trim()
    .toLowerCase();
  if (!answer) return defaultValue;
  return answer === 'y' || answer === 'yes';
}

function printUsage() {
  log.box(
    [
      'Bugfix Driver Workflow',
      '',
      'Usage:',
      '  pnpm bugfix:workflow',
      '  pnpm bugfix:workflow --profile tsn',
      '',
      'Required env:',
      '  ATLASSIAN_SITE_URL',
      '  ATLASSIAN_EMAIL',
      '  ATLASSIAN_API_TOKEN',
      '  SLACK_BOT_TOKEN',
      '  SLACK_CHANNEL_ID',
      '',
      'Optional env:',
      '  BUGFIX_PROFILE              defaults to tsn',
      '  JIRA_PROJECT_KEY            defaults to TSN',
      '  JIRA_DEV_DONE_NAME          transition target name (default: Closed)',
      '  BUGFIX_TAG_PREFIX           defaults to tms-fe-v',
      '  BUGFIX_GHA_WORKFLOW_FILE    defaults to tags.yml',
      '  BUGFIX_GHA_TIMEOUT_MINUTES  defaults to 30',
      '  BUGFIX_BATCH_SIZE           defaults to 3 (auto-release when pending >= size)',
      '  BUGFIX_SLACK_MEMBERS_REFRESH set 1 to force refresh local Slack member cache',
      '  BUGFIX_CI_VERBOSE           defaults to on; set 0 to disable jobs/steps progress',
      '  GITHUB_REPO_REMOTE_URL      defaults to `git remote get-url origin`',
      '',
      'Flags:',
      '  --profile <id>              select project profile (fallback: tsn)',
      '  --verbose-ci, -V            print CI jobs/steps progress',
    ].join('\n'),
  );
}

type WorkflowConfig = JiraClientConfig & {
  profileId: string;
  profileName: string;
  tagPrefix: string;
  ghaWorkflowFile: string;
  ghaTimeoutMs: number;
  ciVerbose: boolean;
  githubRemoteUrl?: string;
  slackBotToken: string;
  slackChannelId: string;
  batchSize: number;
  slackMembersRefresh: boolean;
  requireCleanTree: boolean;
  allowAutoPush: boolean;
  allowAutoCommit: boolean;
  messageTemplate: (
    args: Parameters<typeof buildSlackSummaryMessage>[0],
  ) => string;
};

type BugfixWorkflowProfile = {
  id: string;
  name: string;
  enabled: boolean;
  jira: {
    projectKey: string;
    doneStatusName: string;
    issueType: string;
    sprintMode: 'latestActiveOrOpen' | 'openSprintsOnly';
    customJql?: string;
  };
  release: {
    tagPrefix: string;
    workflowFile: string;
    timeoutMinutes: number;
    batchSize: number;
    requireCleanTree: boolean;
  };
  slack: {
    channelIdEnv: string;
    mentionMode: 'email' | 'channel' | 'memberMap';
    messageTemplate?: (
      args: Parameters<typeof buildSlackSummaryMessage>[0],
    ) => string;
  };
  git: {
    remoteName: string;
    allowAutoPush: boolean;
    allowAutoCommit: boolean;
  };
  ux?: {
    title?: string;
    fixedMessage?: string;
  };
};

const TSN_PROFILE: BugfixWorkflowProfile = {
  id: 'tsn',
  name: 'TSN',
  enabled: true,
  jira: {
    projectKey: 'TSN',
    doneStatusName: 'Closed',
    issueType: 'Bug',
    sprintMode: 'latestActiveOrOpen',
  },
  release: {
    tagPrefix: 'tms-fe-v',
    workflowFile: 'tags.yml',
    timeoutMinutes: 30,
    batchSize: 3,
    requireCleanTree: true,
  },
  slack: {
    channelIdEnv: 'SLACK_CHANNEL_ID',
    mentionMode: 'memberMap',
  },
  git: {
    remoteName: 'origin',
    allowAutoPush: true,
    allowAutoCommit: true,
  },
  ux: {
    title: 'TSN Bugfix Driver Workflow',
    fixedMessage:
      'Marked done (code fixed) for {issueKey}. Jira will be updated only after tag CI succeeds.',
  },
};

const BUGFIX_WORKFLOW_PROFILES: BugfixWorkflowProfile[] = [TSN_PROFILE];

type SlackMemberEmailCache = {
  channelId: string;
  fetchedAt: string;
  emailToUserId: Record<string, string>;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function resolveProfileById(profileId: string): BugfixWorkflowProfile {
  const profile = BUGFIX_WORKFLOW_PROFILES.find(
    (item) => item.enabled && item.id === profileId,
  );
  if (!profile) {
    const enabledIds = BUGFIX_WORKFLOW_PROFILES.filter((p) => p.enabled)
      .map((p) => p.id)
      .join(', ');
    throw new Error(
      `Unknown profile "${profileId}". Available profiles: ${enabledIds || '(none)'}.`,
    );
  }
  return profile;
}

function parseArgProfile(args: string[]): string | undefined {
  const profileEq = args.find((arg) => arg.startsWith('--profile='));
  if (profileEq) return profileEq.split('=').slice(1).join('=').trim();
  const idx = args.indexOf('--profile');
  if (idx >= 0) {
    return args[idx + 1]?.trim();
  }
  return undefined;
}

async function resolveSelectedProfile(
  args: string[],
): Promise<BugfixWorkflowProfile> {
  const argProfile = parseArgProfile(args);
  const envProfile = process.env.BUGFIX_PROFILE?.trim();
  const requested = argProfile || envProfile || 'tsn';
  if (argProfile || envProfile || !process.stdin.isTTY) {
    return resolveProfileById(requested);
  }
  const enabledProfiles = BUGFIX_WORKFLOW_PROFILES.filter((p) => p.enabled);
  if (enabledProfiles.length <= 1) {
    return resolveProfileById(requested);
  }
  const selectedId = await select<string>({
    message: questionText('Select bugfix workflow profile'),
    choices: enabledProfiles.map((p) => ({
      name: `${p.name} (${p.id})`,
      value: p.id,
    })),
    default: requested,
  });
  return resolveProfileById(selectedId);
}

function getWorkflowConfig(profile: BugfixWorkflowProfile): WorkflowConfig {
  const timeoutMinutesRaw = process.env.BUGFIX_GHA_TIMEOUT_MINUTES?.trim();
  const timeoutMinutes = timeoutMinutesRaw
    ? Number(timeoutMinutesRaw)
    : profile.release.timeoutMinutes;
  if (!Number.isFinite(timeoutMinutes) || timeoutMinutes <= 0) {
    throw new Error('BUGFIX_GHA_TIMEOUT_MINUTES must be a positive number.');
  }
  const batchSizeRaw = process.env.BUGFIX_BATCH_SIZE?.trim();
  const batchSize = batchSizeRaw
    ? Number(batchSizeRaw)
    : profile.release.batchSize;
  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    throw new Error('BUGFIX_BATCH_SIZE must be a positive number.');
  }
  const slackChannelIdEnv =
    process.env[profile.slack.channelIdEnv]?.trim() ||
    process.env.SLACK_CHANNEL_ID?.trim();
  if (!slackChannelIdEnv) {
    throw new Error(
      `Missing env: ${profile.slack.channelIdEnv} (or fallback SLACK_CHANNEL_ID).`,
    );
  }
  return {
    profileId: profile.id,
    profileName: profile.name,
    siteUrl: requiredEnv('ATLASSIAN_SITE_URL'),
    email: requiredEnv('ATLASSIAN_EMAIL'),
    apiToken: requiredEnv('ATLASSIAN_API_TOKEN'),
    slackBotToken: requiredEnv('SLACK_BOT_TOKEN'),
    slackChannelId: slackChannelIdEnv,
    projectKey: process.env.JIRA_PROJECT_KEY?.trim() || profile.jira.projectKey,
    jiraDevDoneName:
      process.env.JIRA_DEV_DONE_NAME?.trim() || profile.jira.doneStatusName,
    tagPrefix:
      process.env.BUGFIX_TAG_PREFIX?.trim() || profile.release.tagPrefix,
    ghaWorkflowFile:
      process.env.BUGFIX_GHA_WORKFLOW_FILE?.trim() ||
      profile.release.workflowFile,
    ghaTimeoutMs: Math.round(timeoutMinutes * 60_000),
    ciVerbose: process.env.BUGFIX_CI_VERBOSE?.trim() !== '0',
    githubRemoteUrl: process.env.GITHUB_REPO_REMOTE_URL?.trim(),
    batchSize: Math.round(batchSize),
    slackMembersRefresh:
      process.env.BUGFIX_SLACK_MEMBERS_REFRESH?.trim() === '1',
    requireCleanTree: profile.release.requireCleanTree,
    allowAutoPush: profile.git.allowAutoPush,
    allowAutoCommit: profile.git.allowAutoCommit,
    messageTemplate: profile.slack.messageTemplate ?? buildSlackSummaryMessage,
  };
}

function slackMembersCacheFilePath(channelId: string): string {
  return path.resolve(
    process.cwd(),
    'tmp',
    `bugfix-slack-members-${channelId}.json`,
  );
}

async function readSlackMemberEmailCache(
  channelId: string,
): Promise<SlackMemberEmailCache | null> {
  const filePath = slackMembersCacheFilePath(channelId);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as SlackMemberEmailCache;
    if (
      !parsed ||
      parsed.channelId !== channelId ||
      !parsed.emailToUserId ||
      typeof parsed.emailToUserId !== 'object'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function writeSlackMemberEmailCache(
  cache: SlackMemberEmailCache,
): Promise<string> {
  const filePath = slackMembersCacheFilePath(cache.channelId);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(
    `${filePath}`,
    `${JSON.stringify(cache, null, 2)}\n`,
    'utf8',
  );
  return filePath;
}

function formatIssueLine(issue: JiraIssue, index: number): string {
  return `${String(index + 1).padStart(2, ' ')}. [${issue.priority}] ${issue.key} - ${issue.summary} (reporter: ${issue.reporter.displayName}, status: ${issue.status})`;
}

async function promptIssueSelection(
  rl: readline.Interface,
  issues: JiraIssue[],
): Promise<JiraIssue | null> {
  if (issues.length === 0) return null;

  if (process.stdin.isTTY) {
    const pickedKey = await select<string>({
      message: questionText('Select bug to fix (Esc to finish)'),
      choices: [
        ...issues.map((issue, idx) => ({
          name: formatIssueLine(issue, idx),
          value: issue.key,
        })),
        { name: 'Finish session', value: '__finish__' },
      ],
      pageSize: Math.max(7, Math.min(20, issues.length + 1)),
    });
    if (pickedKey === '__finish__') return null;
    return issues.find((i) => i.key === pickedKey) ?? null;
  }

  while (true) {
    const answer = (
      await rl.question('\nSelect bug by number (or q to finish session): ')
    )
      .trim()
      .toLowerCase();

    if (answer === 'q') return null;

    const picked = Number.parseInt(answer, 10);
    if (!Number.isFinite(picked) || picked < 1 || picked > issues.length) {
      log.warn(`Invalid selection: ${answer}`);
      continue;
    }
    return issues[picked - 1];
  }
}

function buildAiPrompt(params: {
  issue: JiraIssue;
  config: WorkflowConfig;
  sprintName: string;
}): string {
  const { issue, config, sprintName } = params;
  const jiraBase = config.siteUrl.replace(/\/+$/, '');
  const issueUrl = `${jiraBase}/browse/${issue.key}`;
  const reporterEmail = issue.reporter.emailAddress || 'unknown';
  const createdAt = issue.createdAt || 'unknown';
  const updatedAt = issue.updatedAt || 'unknown';
  return [
    `# Bugfix Assistant Brief (Atlassian MCP Optimized)`,
    ``,
    `## 1) Known issue context`,
    `- Jira key: ${issue.key}`,
    `- Jira URL: ${issueUrl}`,
    `- Project: ${config.projectKey}`,
    `- Sprint: ${sprintName}`,
    `- Issue type: Bug`,
    `- Summary: ${issue.summary}`,
    `- Priority: ${issue.priority}`,
    `- Status: ${issue.status}`,
    `- Reporter: ${issue.reporter.displayName}`,
    `- Reporter email: ${reporterEmail}`,
    `- Created at: ${createdAt}`,
    `- Updated at: ${updatedAt}`,
    ``,
    `## 2) Use Atlassian MCP to gather missing facts before coding`,
    `Please use Atlassian MCP to fetch and summarize:`,
    `- Full issue description and acceptance criteria`,
    `- Latest comments (especially from reporter/PM/QA)`,
    `- Linked issues, subtasks, and blockers`,
    `- Recent status/assignee changes`,
    `- Related Confluence/spec links (if any)`,
    ``,
    `## 3) Clarify bug context (if missing from Jira)`,
    `- Repro steps:`,
    `- Expected behavior:`,
    `- Actual behavior:`,
    `- Environment/tenant/account:`,
    `- Screenshots / logs / traces:`,
    `- Suspected module / file path:`,
    ``,
    `## 4) Required output format`,
    `Reply in this structure:`,
    `1. Problem framing (1-3 bullets)`,
    `2. Root cause hypothesis (ranked, with confidence)`,
    `3. Minimal safe fix plan (file-level)`,
    `4. Code changes to apply (smallest diff first)`,
    `5. Risk and rollback notes`,
    `6. Verification checklist (unit/manual/regression)`,
    ``,
    `## 5) Constraints`,
    `- Prefer minimal and safe changes; avoid broad refactors.`,
    `- Reuse existing project conventions and components.`,
    `- Explicitly call out assumptions and unknowns.`,
    `- If key data is missing, ask targeted questions before patching.`,
    ``,
    `Start now by using Atlassian MCP on ${issue.key} and provide the structured analysis.`,
  ].join('\n');
}

async function copyToClipboard(text: string): Promise<boolean> {
  if (process.platform !== 'darwin') return false;
  return await new Promise<boolean>((resolve) => {
    const pbcopy: any = spawn('pbcopy');
    pbcopy.on('error', () => resolve(false));
    pbcopy.on('close', (code: number | null) => resolve(code === 0));
    pbcopy.stdin.write(text, 'utf8');
    pbcopy.stdin.end();
  });
}

async function writePromptFile(params: {
  issue: JiraIssue;
  config: WorkflowConfig;
  sprintName: string;
}): Promise<{ filePath: string; promptText: string }> {
  const { issue, config, sprintName } = params;
  const aiPromptText = buildAiPrompt({ issue, config, sprintName });
  const dir = path.resolve(process.cwd(), 'tmp', 'bugfix-prompts');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.resolve(
    dir,
    `${issue.key}-${new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')}.md`,
  );
  const content = `<!-- Copy this into Cursor Chat if needed -->\n\n${aiPromptText}`;
  await fs.writeFile(filePath, content, 'utf8');
  return { filePath, promptText: aiPromptText };
}

async function promptExtraInputEnhanced(
  rl: readline.Interface,
  issue: JiraIssue,
  config: WorkflowConfig,
  sprintName: string,
): Promise<string> {
  if (!process.stdout.isTTY) {
    return '';
  }
  const aiPromptText = buildAiPrompt({ issue, config, sprintName });
  narrative('\nAI prompt (copy to Cursor Chat if you want AI help):\n');
  narrative(aiPromptText);

  const { filePath: promptFile, promptText: promptFromFile } =
    await writePromptFile({ issue, config, sprintName });
  const copied = await copyToClipboard(promptFromFile);
  log.success(`Prompt file saved: ${path.relative(process.cwd(), promptFile)}`);
  if (copied) {
    log.success('Prompt copied to clipboard.');
  } else {
    log.warn('Failed to copy prompt to clipboard automatically.');
  }
  return '';
}

async function promptFixConfirmation(
  rl: readline.Interface,
): Promise<'done' | 'back'> {
  if (process.stdin.isTTY) {
    const raw = (
      await promptInput({
        message: questionText(
          [
            '================================================================================',
            '🛑🛑🛑  STOP  🛑🛑🛑   CRITICAL RELEASE GATE   🛑🛑🛑  STOP  🛑🛑🛑',
            'THIS IS THE MOST IMPORTANT STEP IN THE WHOLE FLOW.',
            'CONFIRM YOU HAVE ACTUALLY FIXED IT IN CODE, REVIEWED THE DIFF, AND IT BUILDS.',
            'CODE FIX VERIFIED IN CODE? [Y/n]  (n returns to list)',
            '================================================================================',
          ].join('\n'),
        ),
        default: 'y',
      })
    )
      .trim()
      .toLowerCase();
    const ok = !raw || raw === 'y' || raw === 'yes';
    narrative(
      [
        '================================================================================',
        `🛑 CRITICAL RELEASE GATE 🛑  CODE FIX CONFIRMED: ${ok ? 'YES' : 'NO'}`,
        '================================================================================',
      ].join('\n'),
    );
    return ok ? 'done' : 'back';
  }
  narrative('\nAfter you finish fixing (manual or AI), come back here.');
  narrative(
    'Type `done` to confirm reviewed code fix, or `back` to return to bug list.',
  );
  rl.resume();
  while (true) {
    const answer = (await rl.question('confirm (done/back): '))
      .trim()
      .toLowerCase();
    if (answer === 'done') return 'done';
    if (answer === 'back') return 'back';
    log.warn(`Invalid input: ${answer}`);
  }
}

async function promptYesNo(
  rl: readline.Interface,
  question: string,
  defaultValue = false,
): Promise<boolean> {
  if (process.stdin.isTTY) {
    return await confirm({
      message: questionText(question),
      default: defaultValue,
    });
  }
  rl.resume();
  const suffix = defaultValue ? '[Y/n]' : '[y/N]';
  const answer = (await rl.question(`${questionText(question)} ${suffix} `))
    .trim()
    .toLowerCase();
  if (!answer) return defaultValue;
  return answer === 'y' || answer === 'yes';
}

async function promptText(
  rl: readline.Interface,
  question: string,
  defaultValue = '',
): Promise<string> {
  if (process.stdin.isTTY) {
    return await promptInput({
      message: questionText(question),
      default: defaultValue,
    });
  }
  rl.resume();
  const answer = await rl.question(
    defaultValue
      ? `${questionText(question)} (${defaultValue}): `
      : `${questionText(question)}: `,
  );
  const trimmed = answer.trim();
  return trimmed || defaultValue;
}

async function prepareSlackMemberEmailMap(
  rl: readline.Interface,
  config: WorkflowConfig,
): Promise<Record<string, string>> {
  const cached = await readSlackMemberEmailCache(config.slackChannelId);
  if (cached && !config.slackMembersRefresh) {
    const useCached = await promptAutoStep(
      rl,
      'Use local Slack member cache for mention matching?',
      `Cache: ${path.relative(process.cwd(), slackMembersCacheFilePath(config.slackChannelId))}\nFetched at: ${cached.fetchedAt}\nSet BUGFIX_SLACK_MEMBERS_REFRESH=1 to force refresh.`,
      true,
    );
    if (useCached) {
      narrative(
        `Loaded Slack member cache (${Object.keys(cached.emailToUserId).length} emails).`,
      );
      return cached.emailToUserId;
    }
  }

  const spinner = ora(
    'Fetching Slack channel members and building email map...',
  ).start();
  const emailToUserId = await buildSlackChannelMemberEmailMap({
    token: config.slackBotToken,
    channelId: config.slackChannelId,
  });
  const filePath = await writeSlackMemberEmailCache({
    channelId: config.slackChannelId,
    fetchedAt: new Date().toISOString(),
    emailToUserId,
  });
  spinner.succeed(
    `Slack member cache updated: ${path.relative(process.cwd(), filePath)} (${Object.keys(emailToUserId).length} emails)`,
  );
  return emailToUserId;
}

async function buildReporterMentions(
  records: WorkflowRecord[],
  slackToken: string,
  slackChannelId: string,
  cachedEmailToSlackId?: Record<string, string>,
): Promise<{ mentions: string[]; missing: string[] }> {
  const seen = new Set<string>();
  const mentions: string[] = [];
  const missing: Array<{
    displayName: string;
    email?: string;
    accountId?: string;
  }> = [];
  for (const record of records) {
    const dedupeKey = record.reporter.accountId || record.reporter.displayName;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    const reporterEmail = record.reporter.emailAddress?.trim().toLowerCase();
    const cachedSlackId = reporterEmail
      ? cachedEmailToSlackId?.[reporterEmail]
      : undefined;
    if (cachedSlackId) {
      mentions.push(`<@${cachedSlackId}>`);
      continue;
    }
    let slackId: string | null = null;
    try {
      slackId = await resolveSlackUserIdByEmailInChannel({
        token: slackToken,
        channelId: slackChannelId,
        email: record.reporter.emailAddress,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Degrade gracefully when token lacks conversations.members scope.
      if (message.includes('missing_scope')) {
        log.warn(
          `Slack channel membership check skipped for ${record.reporter.displayName} due to missing_scope. Falling back to email lookup only.`,
        );
        const fallbackId = await resolveSlackUserIdByEmail(
          slackToken,
          record.reporter.emailAddress,
        ).catch(() => null);
        slackId = fallbackId;
      } else {
        log.warn(
          `Slack mention lookup failed for ${record.reporter.displayName}: ${message}`,
        );
        slackId = null;
      }
    }
    if (!slackId) {
      missing.push({
        displayName: record.reporter.displayName,
        email: record.reporter.emailAddress,
        accountId: record.reporter.accountId,
      });
      continue;
    }
    mentions.push(`<@${slackId}>`);
  }

  const missingLines = missing.map(
    (m) =>
      `- ${m.displayName}${m.email ? ` <${m.email}>` : ''}${m.accountId ? ` (jira:${m.accountId})` : ''}`,
  );
  return { mentions, missing: missingLines };
}

async function maybeTagBatch(params: {
  rl: readline.Interface;
  config: WorkflowConfig;
  records: WorkflowRecord[];
  slackMemberEmailMap?: Record<string, string>;
}): Promise<{
  tagVersion: string;
  tagCiResult: TagCiResult;
  slackMessage: string;
  clearedRecords: boolean;
}> {
  const { rl, config, records, slackMemberEmailMap } = params;
  const batchIssueKeys = Array.from(new Set(records.map((r) => r.issueKey)));
  const defaultCommitMessage = `fix: ${batchIssueKeys.join(', ')} bugfix batch`;
  if (records.length === 0) {
    return {
      tagVersion: 'no-tag',
      tagCiResult: { ciStatus: 'skipped' },
      slackMessage: '',
      clearedRecords: false,
    };
  }

  while (true) {
    try {
      const hasChanges = await hasWorkingTreeChanges();
      if (hasChanges) {
        if (!config.allowAutoCommit) {
          throw new Error(
            'Working tree has changes and profile disallows auto commit.',
          );
        }
        const shouldCommit = await promptAutoStep(
          rl,
          'Detected uncommitted changes. Commit them now?',
          'This will run: git add . && git commit',
          true,
        );
        if (shouldCommit) {
          const message = await promptText(
            rl,
            'Commit message',
            defaultCommitMessage,
          );
          const commitSpinner = ora('Committing local changes...').start();
          const sha = await commitAllChanges(message);
          commitSpinner.succeed(`Committed local changes at ${sha}`);
        } else {
          const proceedWithoutCommit = await promptAutoStep(
            rl,
            'Skip commit and continue (tag will still use current HEAD)?',
            undefined,
            false,
          );
          if (!proceedWithoutCommit) {
            continue;
          }
        }
      }
      break;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`Commit step failed: ${message}`);
      const retryCommit = await promptYesNo(rl, 'Retry commit step?', true);
      if (!retryCommit) {
        return {
          tagVersion: 'no-tag',
          tagCiResult: { ciStatus: 'skipped' },
          slackMessage: '',
          clearedRecords: false,
        };
      }
    }
  }

  if (!config.allowAutoPush) {
    narrative('Skip push: profile disallows auto push.');
  }
  const shouldPush = await promptAutoStep(
    rl,
    'Push current branch to remote before tagging?',
    'This will run: git push (auto-detect upstream; sets -u if needed)',
    config.allowAutoPush,
  );
  if (shouldPush && config.allowAutoPush) {
    while (true) {
      try {
        const pushSpinner = ora('Pushing current branch...').start();
        const pushed = await pushCurrentBranch();
        pushSpinner.succeed(
          `Push done: ${pushed.branch}${pushed.usedUpstream ? '' : ' (upstream set)'}`,
        );
        break;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.error(`Push failed: ${message}`);
        const retryPush = await promptYesNo(rl, 'Retry push?', true);
        if (!retryPush) {
          return {
            tagVersion: 'no-tag',
            tagCiResult: { ciStatus: 'skipped' },
            slackMessage: '',
            clearedRecords: false,
          };
        }
      }
    }
  } else {
    narrative('Skipped push by user choice.');
  }

  const shouldTag = await promptAutoStep(
    rl,
    `Create tag and run CI for current batch (${records.length} bug(s)) now?`,
    `This will run: git tag + git push tag; then wait for GitHub Actions workflow (${config.ghaWorkflowFile}).`,
    true,
  );
  if (!shouldTag) {
    return {
      tagVersion: 'no-tag',
      tagCiResult: { ciStatus: 'skipped' },
      slackMessage: '',
      clearedRecords: false,
    };
  }

  const tagVersion = await computeNextPatchTag(config.tagPrefix);
  if (config.requireCleanTree) {
    while (true) {
      const preflightSpinner = ora(
        'Preflight: validating clean git state before tag...',
      ).start();
      try {
        await assertCleanWorkingTree();
        preflightSpinner.succeed('Preflight OK: working tree clean.');
        break;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        preflightSpinner.fail(`Preflight failed: ${message}`);
        log.warn('Fix the issue (e.g. commit/stash changes), then retry.');
        const retry = await promptYesNo(rl, 'Retry preflight?', true);
        if (!retry) {
          return {
            tagVersion: 'no-tag',
            tagCiResult: { ciStatus: 'skipped' },
            slackMessage: '',
            clearedRecords: false,
          };
        }
      }
    }
  }

  const shouldRunTag = await promptAutoStep(
    rl,
    `Proceed to create & push tag ${tagVersion}?`,
    `This will run: git tag ${tagVersion} && git push origin ${tagVersion}`,
    true,
  );
  if (!shouldRunTag) {
    return {
      tagVersion: 'no-tag',
      tagCiResult: { ciStatus: 'skipped' },
      slackMessage: '',
      clearedRecords: false,
    };
  }
  const tagSpinner = ora(`Creating tag ${tagVersion}...`).start();
  const tagSha = await createAndPushTag(tagVersion);
  tagSpinner.succeed(
    `Tag created & pushed: ${tagVersion} (${tagSha.slice(0, 7)})`,
  );

  const repoSlug = await resolveRepoSlug(config.githubRemoteUrl);
  const ciSpinner = ora(
    `Waiting CI workflow (${config.ghaWorkflowFile}) for ${tagSha.slice(0, 7)}...`,
  ).start();
  let ciResult: TagCiResult;
  let lastProgressKey = '';
  try {
    ciResult = await waitForTagWorkflow(
      repoSlug,
      config.ghaWorkflowFile,
      tagSha,
      config.ghaTimeoutMs,
      (progress) => {
        const progressKey = [
          progress.status,
          progress.runningJob ?? '',
          progress.runningStep ?? '',
          progress.jobsCompleted,
          progress.jobsTotal,
          progress.jobsSuccess,
          progress.jobsFailed,
          progress.jobsInProgress,
          progress.jobsQueued,
          progress.stepsCompleted,
          progress.stepsTotal,
          progress.stepsSuccess,
          progress.stepsFailed,
          progress.stepsInProgress,
          progress.stepsQueued,
        ].join('|');
        if (progressKey === lastProgressKey) return;
        lastProgressKey = progressKey;
        if (progress.status === 'not_found') {
          ciSpinner.text = `Waiting CI workflow (${config.ghaWorkflowFile}) for ${tagSha.slice(0, 7)}... (run not found yet)`;
          return;
        }
        const statusText =
          progress.status === 'completed'
            ? `completed (${progress.conclusion ?? 'unknown'})`
            : progress.status;
        const atText = progress.runningJob
          ? ` | at ${progress.runningJob}${progress.runningStep ? ` > ${progress.runningStep}` : ''}`
          : '';
        ciSpinner.text =
          `CI ${statusText} | jobs ${progress.jobsCompleted}/${progress.jobsTotal}` +
          ` (ok:${progress.jobsSuccess} fail:${progress.jobsFailed} run:${progress.jobsInProgress} q:${progress.jobsQueued})` +
          ` | steps ${progress.stepsCompleted}/${progress.stepsTotal}` +
          ` (ok:${progress.stepsSuccess} fail:${progress.stepsFailed} run:${progress.stepsInProgress} q:${progress.stepsQueued})` +
          atText;

        if (config.ciVerbose && progress.jobs && progress.jobs.length > 0) {
          // Print only the currently running node for readability.
          if (progress.runningJob) {
            narrative(
              `[CI] running: ${progress.runningJob}${progress.runningStep ? ` > ${progress.runningStep}` : ''}`,
            );
          }
        }
      },
    );
    ciSpinner.stop();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ciSpinner.fail(`CI auto-wait unavailable: ${message}`);
    ciResult = {
      ciStatus: 'failed',
      ciConclusion: 'ci_wait_unavailable',
    };
  }
  const tagCiResult: TagCiResult = { ...ciResult, createdTag: tagVersion };
  if (tagCiResult.ciStatus === 'success') {
    ora().succeed(
      `CI success${tagCiResult.runUrl ? `: ${tagCiResult.runUrl}` : ''}`,
    );
  } else if (tagCiResult.ciStatus === 'failed') {
    ora().fail(
      `CI failed${tagCiResult.runUrl ? `: ${tagCiResult.runUrl}` : ''}`,
    );
  } else if (tagCiResult.ciStatus === 'timeout') {
    ora().warn(
      `CI timeout${tagCiResult.runUrl ? `: ${tagCiResult.runUrl}` : ''}`,
    );
  }

  if (ciResult.ciStatus === 'success') {
    const shouldUpdateJira = await promptYesNo(
      rl,
      'CI succeeded. Update Jira statuses (DEV DONE) and reassign to reporters now?',
      true,
    );
    if (shouldUpdateJira) {
      for (const record of records) {
        const jiraSpinner = ora(
          `Updating Jira for ${record.issueKey}...`,
        ).start();
        try {
          const liveStatus = await getIssueStatusName(config, record.issueKey);
          const transition = await transitionIssueToDevDone(
            config,
            record.issueKey,
            liveStatus,
          );
          await assignIssueToReporter(
            config,
            record.issueKey,
            record.reporter.accountId,
          );
          record.statusBefore = liveStatus;
          record.statusAfter = transition.toStatus;
          record.transitionId = transition.transitionId;
          record.jiraUpdatedAt = new Date().toISOString();
          jiraSpinner.succeed(
            `Jira updated: ${record.issueKey} -> ${transition.toStatus}; assignee -> reporter`,
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          jiraSpinner.fail(
            `Jira update failed for ${record.issueKey}: ${message}`,
          );
          // Continue updating other issues in batch.
        }
      }
    } else {
      narrative('Skipped Jira update by user choice.');
    }
  } else {
    log.warn('\nCI not successful. Jira will NOT be updated.');
  }

  const mentionResult = await buildReporterMentions(
    records,
    config.slackBotToken,
    config.slackChannelId,
    slackMemberEmailMap,
  );
  if (mentionResult.missing.length > 0) {
    log.warn(
      [
        `Cannot resolve Slack mentions for ${mentionResult.missing.length} reporter(s) in channel ${config.slackChannelId}.`,
        'Slack message will still be prepared/sent without those mentions.',
        'Tip: ensure they are in the channel and bot scopes include users:read.email + conversations:read.',
        ...mentionResult.missing,
      ].join('\n'),
    );
  }
  const slackMessage = config.messageTemplate({
    tagVersion,
    records,
    reporterMentions: mentionResult.mentions,
    jiraSiteUrl: config.siteUrl,
    ciResult: tagCiResult,
  });
  const slackMessageWithMissing =
    mentionResult.missing.length > 0
      ? `${slackMessage}\n\nMissing Slack mentions:\n${mentionResult.missing.join('\n')}`
      : slackMessage;

  if (tagCiResult.ciStatus === 'success') {
    const shouldSendSlack = await promptYesNo(
      rl,
      'Send Slack summary for this batch now?',
      true,
    );
    if (shouldSendSlack) {
      const slackSpinner = ora('Sending Slack message...').start();
      const sendResult = await sendSlackMessage({
        token: config.slackBotToken,
        channelId: config.slackChannelId,
        message: slackMessageWithMissing,
      });
      slackSpinner.succeed(
        `Slack sent: channel=${sendResult.channel ?? config.slackChannelId} ts=${sendResult.ts ?? 'unknown'}`,
      );
    } else {
      narrative('Skipped Slack send by user choice.');
    }
  } else {
    log.warn('\nCI not successful. Slack message not auto-sent.');
  }

  return {
    tagVersion,
    tagCiResult,
    slackMessage: slackMessageWithMissing,
    clearedRecords: tagCiResult.ciStatus === 'success',
  };
}

async function promptNextActionAfterBug(
  rl: readline.Interface,
  params: { pendingCount: number; batchSize: number; lastIssueKey: string },
): Promise<'continue' | 'release' | 'finish'> {
  const { pendingCount, batchSize, lastIssueKey } = params;
  const hint =
    pendingCount >= batchSize
      ? `Pending batch: ${pendingCount} (reached batch size ${batchSize})`
      : `Pending batch: ${pendingCount} (batch size ${batchSize})`;
  if (process.stdin.isTTY) {
    return await select<'continue' | 'release' | 'finish'>({
      message: questionText(
        `What next after ${lastIssueKey}?\n${dimText(hint)}`,
      ),
      choices: [
        { name: 'Continue with next bug', value: 'continue' },
        {
          name: 'Release current batch now (tag + CI + Jira + Slack)',
          value: 'release',
        },
        { name: 'Finish session', value: 'finish' },
      ],
      pageSize: 7,
    });
  }
  rl.resume();
  narrative(`\n${hint}`);
  while (true) {
    const answer = (
      await rl.question('next action (c=continue, r=release, f=finish): ')
    )
      .trim()
      .toLowerCase();
    if (answer === 'c' || answer === 'continue') return 'continue';
    if (answer === 'r' || answer === 'release') return 'release';
    if (answer === 'f' || answer === 'finish') return 'finish';
    log.warn(`Invalid input: ${answer}`);
  }
}

type WorkflowSessionState = {
  startedAt: string;
  records: WorkflowRecord[];
  pendingBatch: WorkflowRecord[];
  completedInSession: Set<string>;
  sprintName: string;
  lastTagVersion: string;
  lastTagCiResult: TagCiResult;
  lastSlackMessage: string;
};

async function prepareContext(params: {
  rl: readline.Interface;
  config: WorkflowConfig;
  profile: BugfixWorkflowProfile;
}): Promise<{
  currentUser: Awaited<ReturnType<typeof getCurrentJiraUser>>;
  slackMemberEmailMap: Record<string, string>;
}> {
  const { rl, config, profile } = params;
  const currentUser = await getCurrentJiraUser(config);
  log.box(profile.ux?.title || 'Bugfix Driver Workflow');
  narrative(`Profile: ${config.profileName} (${config.profileId})`);
  narrative(`Jira user: ${currentUser.displayName} (${currentUser.accountId})`);
  narrative(`Project: ${config.projectKey}`);
  narrative(`Batch size: ${config.batchSize}`);
  let slackMemberEmailMap: Record<string, string> = {};
  try {
    slackMemberEmailMap = await prepareSlackMemberEmailMap(rl, config);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn(
      `Slack member prefetch failed. Will continue with live Slack lookup during send step. Reason: ${message}`,
    );
  }
  return { currentUser, slackMemberEmailMap };
}

async function issueLoop(params: {
  rl: readline.Interface;
  config: WorkflowConfig;
  profile: BugfixWorkflowProfile;
  state: WorkflowSessionState;
  slackMemberEmailMap: Record<string, string>;
}): Promise<void> {
  const { rl, config, profile, state, slackMemberEmailMap } = params;
  while (true) {
    const query = await searchAssignedBugsInLatestSprint(config, {
      issueType: profile.jira.issueType,
      sprintMode: profile.jira.sprintMode,
      customJql: profile.jira.customJql,
    });
    state.sprintName = query.sprint.name;
    const remainingIssues = query.issues.filter(
      (issue) => !state.completedInSession.has(issue.key),
    );

    if (remainingIssues.length === 0) {
      narrative('\nNo remaining bugs to process in this session.');
      break;
    }

    narrative(`\nCurrent sprint scope: ${state.sprintName}`);
    const selected = await promptIssueSelection(rl, remainingIssues);
    if (!selected) break;

    const extraInput = await promptExtraInputEnhanced(
      rl,
      selected,
      config,
      state.sprintName,
    );

    narrative(`\nNow fix ${selected.key} (manual or AI) outside this script.`);
    const confirmed = await promptFixConfirmation(rl);
    if (confirmed !== 'done') {
      narrative('Not confirmed. Returning to bug list.');
      continue;
    }

    state.records.push({
      issueKey: selected.key,
      summary: selected.summary,
      priority: selected.priority,
      reporter: selected.reporter,
      statusBefore: selected.status,
      extraInput,
      confirmedAt: new Date().toISOString(),
    });
    state.pendingBatch = [
      ...state.pendingBatch,
      state.records[state.records.length - 1],
    ];
    state.completedInSession.add(selected.key);

    const fixedMessage =
      profile.ux?.fixedMessage ||
      'Marked done (code fixed) for {issueKey}. Jira will be updated only after tag CI succeeds.';
    log.success(fixedMessage.replace('{issueKey}', selected.key));

    const shouldAutoRelease = state.pendingBatch.length >= config.batchSize;
    const nextAction = shouldAutoRelease
      ? 'release'
      : await promptNextActionAfterBug(rl, {
          pendingCount: state.pendingBatch.length,
          batchSize: config.batchSize,
          lastIssueKey: selected.key,
        });

    if (nextAction === 'release') {
      const tagAttempt = await maybeTagBatch({
        rl,
        config,
        records: state.pendingBatch,
        slackMemberEmailMap,
      });
      if (tagAttempt.tagCiResult.ciStatus !== 'skipped') {
        state.lastTagVersion = tagAttempt.tagVersion;
        state.lastTagCiResult = tagAttempt.tagCiResult;
        state.lastSlackMessage = tagAttempt.slackMessage;
      }
      if (tagAttempt.clearedRecords) {
        state.pendingBatch = [];
      }
    }

    if (nextAction === 'finish') break;
  }
}

async function finalizeSession(params: {
  rl: readline.Interface;
  config: WorkflowConfig;
  state: WorkflowSessionState;
  currentUser: Awaited<ReturnType<typeof getCurrentJiraUser>>;
  slackMemberEmailMap: Record<string, string>;
}): Promise<void> {
  const { rl, config, state, currentUser, slackMemberEmailMap } = params;
  const endedAt = new Date().toISOString();
  let tagCiResult: TagCiResult = state.lastTagCiResult;
  let tagVersion = state.lastTagVersion;
  let slackMessage = state.lastSlackMessage;

  if (state.records.length === 0) {
    slackMessage = `No bug fixed in this session for ${config.projectKey}.`;
  } else if (state.pendingBatch.length > 0) {
    const shouldReleaseRemaining = await promptAutoStep(
      rl,
      `Release remaining pending batch (${state.pendingBatch.length} bug(s)) before ending?`,
      `This will run: git tag + push tag; wait CI; then optionally update Jira & send Slack.`,
      true,
    );
    if (shouldReleaseRemaining) {
      const tagAttempt = await maybeTagBatch({
        rl,
        config,
        records: state.pendingBatch,
        slackMemberEmailMap,
      });
      if (tagAttempt.tagCiResult.ciStatus !== 'skipped') {
        tagVersion = tagAttempt.tagVersion;
        tagCiResult = tagAttempt.tagCiResult;
        slackMessage = tagAttempt.slackMessage;
      }
    } else {
      narrative('Skipped releasing remaining pending batch.');
    }
  }

  const logPath = await writeSessionLog({
    startedAt: state.startedAt,
    endedAt,
    sprintName: state.sprintName,
    currentUser,
    records: state.records,
    tagCiResult,
    slackMessage,
  });

  log.success('\nSession ended.');
  if (tagCiResult.ciStatus === 'success') {
    log.box(
      [
        'CONGRATS!',
        'You successfully completed this bugfix session.',
        '',
        `Fixed bugs: ${state.records.length}`,
        `Tag: ${tagVersion}`,
        `CI: ${tagCiResult.ciStatus.toUpperCase()}`,
      ].join('\n'),
    );
  }
  narrative(`Processed bugs: ${state.records.length}`);
  if (state.records.length > 0) {
    state.records.forEach((record, idx) => {
      narrative(
        `${idx + 1}. ${record.issueKey} [${record.priority}] - ${record.summary} (${record.statusBefore} -> ${record.statusAfter ?? 'PENDING_JIRA_UPDATE'})`,
      );
    });
    narrative(`Tag: ${tagVersion}`);
    narrative(`CI status: ${tagCiResult.ciStatus}`);
    narrative('\nSlack message template:\n');
    narrative(slackMessage);
  }
  narrative(`Session log: ${path.relative(process.cwd(), logPath)}`);
}

async function runWorkflow(profile: BugfixWorkflowProfile, args: string[]) {
  const config = getWorkflowConfig(profile);
  const verboseCiByArg = args.includes('--verbose-ci') || args.includes('-V');
  if (verboseCiByArg) config.ciVerbose = true;

  const state: WorkflowSessionState = {
    startedAt: new Date().toISOString(),
    records: [],
    pendingBatch: [],
    completedInSession: new Set<string>(),
    sprintName: 'unknown',
    lastTagVersion: 'no-tag',
    lastTagCiResult: { ciStatus: 'skipped' },
    lastSlackMessage: '',
  };

  const rl = readline.createInterface({ input, output });
  try {
    const ctx = await prepareContext({ rl, config, profile });
    await issueLoop({
      rl,
      config,
      profile,
      state,
      slackMemberEmailMap: ctx.slackMemberEmailMap,
    });
    await finalizeSession({
      rl,
      config,
      state,
      currentUser: ctx.currentUser,
      slackMemberEmailMap: ctx.slackMemberEmailMap,
    });
  } finally {
    rl.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    printUsage();
    return;
  }
  const profile = await resolveSelectedProfile(args);
  await runWorkflow(profile, args);
}

main().catch((error) => {
  log.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
