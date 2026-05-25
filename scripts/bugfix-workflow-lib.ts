import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type PriorityName =
  | 'Highest'
  | 'High'
  | 'Medium'
  | 'Low'
  | 'Lowest'
  | string;

export type JiraUser = {
  accountId: string;
  displayName: string;
  emailAddress?: string;
};

export type JiraIssue = {
  id: string;
  key: string;
  summary: string;
  priority: PriorityName;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  reporter: JiraUser;
};

export type SprintInfo = {
  id?: number;
  name: string;
  source: 'activeSprint' | 'fallbackOpenSprints';
};

export type JiraClientConfig = {
  siteUrl: string;
  email: string;
  apiToken: string;
  projectKey: string;
  jiraDevDoneName?: string;
};

export type TransitionResult = {
  transitioned: boolean;
  fromStatus: string;
  toStatus: string;
  transitionId?: string;
  note: string;
};

export type WorkflowRecord = {
  issueKey: string;
  summary: string;
  priority: PriorityName;
  reporter: JiraUser;
  statusBefore: string;
  statusAfter?: string;
  transitionId?: string;
  extraInput: string;
  confirmedAt: string;
  jiraUpdatedAt?: string;
};

export type TagCiResult = {
  createdTag?: string;
  runUrl?: string;
  ciStatus: 'success' | 'failed' | 'timeout' | 'skipped';
  ciConclusion?: string;
};

export type WorkflowProgress = {
  runId?: number;
  runUrl?: string;
  status: 'queued' | 'in_progress' | 'completed' | 'not_found';
  conclusion?: string;
  runningJob?: string;
  runningStep?: string;
  jobsTotal: number;
  jobsCompleted: number;
  jobsSuccess: number;
  jobsFailed: number;
  jobsInProgress: number;
  jobsQueued: number;
  stepsTotal: number;
  stepsCompleted: number;
  stepsSuccess: number;
  stepsFailed: number;
  stepsInProgress: number;
  stepsQueued: number;
  jobs?: Array<{
    name: string;
    status: string;
    conclusion?: string;
    steps?: Array<{
      name: string;
      status: string;
      conclusion?: string;
    }>;
  }>;
  updatedAt: string;
};

type JiraSearchResponse = {
  issues: Array<{
    id: string;
    key: string;
    fields: {
      summary?: string;
      priority?: { name?: string };
      status?: { name?: string };
      created?: string;
      updated?: string;
      reporter?: {
        accountId?: string;
        displayName?: string;
        emailAddress?: string;
      };
    };
  }>;
};

type JiraTransitionResponse = {
  transitions: Array<{
    id: string;
    name: string;
    to?: { name?: string };
  }>;
};

type JiraIssueGetResponse = {
  fields?: {
    status?: { name?: string };
  };
};

type JiraBoardListResponse = {
  values?: Array<{ id: number; name?: string }>;
};

type JiraSprintListResponse = {
  values?: Array<{
    id?: number;
    name?: string;
    state?: string;
    startDate?: string;
    endDate?: string;
    completeDate?: string;
  }>;
};

type GitHubWorkflowRunsResponse = {
  workflow_runs?: Array<{
    id: number;
    html_url?: string;
    status?: string;
    conclusion?: string;
    head_sha?: string;
    created_at?: string;
  }>;
};

type GitHubWorkflowJobsResponse = {
  jobs?: Array<{
    id: number;
    name?: string;
    status?: string;
    conclusion?: string | null;
    steps?: Array<{
      name?: string;
      status?: string;
      conclusion?: string | null;
    }>;
  }>;
};

type SlackUsersLookupResponse = {
  ok: boolean;
  error?: string;
  user?: { id?: string };
};

type SlackConversationMembersResponse = {
  ok: boolean;
  error?: string;
  members?: string[];
  response_metadata?: { next_cursor?: string };
};

type SlackUserInfoResponse = {
  ok: boolean;
  error?: string;
  user?: {
    id?: string;
    profile?: {
      email?: string;
    };
  };
};

type SlackUsersListResponse = {
  ok: boolean;
  error?: string;
  members?: Array<{
    id?: string;
    deleted?: boolean;
    is_bot?: boolean;
    profile?: {
      email?: string;
    };
  }>;
  response_metadata?: { next_cursor?: string };
};

type SlackPostResponse = {
  ok: boolean;
  error?: string;
  channel?: string;
  ts?: string;
};

const PRIORITY_ORDER: Record<string, number> = {
  Highest: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Lowest: 1,
};

const DEFAULT_HTTP_TIMEOUT_MS = 30_000;

function withTimeoutSignal(timeoutMs: number): {
  signal: AbortSignal;
  cancel: () => void;
} {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(t),
  };
}

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, '');
}

function getJiraAuthHeader(config: JiraClientConfig): string {
  const basic = Buffer.from(`${config.email}:${config.apiToken}`).toString(
    'base64',
  );
  return `Basic ${basic}`;
}

async function jiraRequest<T>(
  config: JiraClientConfig,
  apiPath: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT';
    body?: unknown;
    useAgileApi?: boolean;
    timeoutMs?: number;
  },
): Promise<T> {
  const basePath = options?.useAgileApi ? '/rest/agile/1.0' : '/rest/api/3';
  const url = `${normalizeSiteUrl(config.siteUrl)}${basePath}${apiPath}`;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_HTTP_TIMEOUT_MS;
  const { signal, cancel } = withTimeoutSignal(timeoutMs);
  let response: Response;
  try {
    response = await fetch(url, {
      method: options?.method ?? 'GET',
      headers: {
        Authorization: getJiraAuthHeader(config),
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal,
    });
  } catch (err) {
    if (signal.aborted) {
      throw new Error(`Jira request timeout after ${timeoutMs}ms: ${apiPath}`);
    }
    throw err;
  } finally {
    cancel();
  }
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Jira ${response.status} ${response.statusText}: ${message}`,
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function getCurrentJiraUser(
  config: JiraClientConfig,
): Promise<JiraUser> {
  const user = await jiraRequest<{
    accountId?: string;
    displayName?: string;
    emailAddress?: string;
  }>(config, '/myself');
  if (!user.accountId || !user.displayName) {
    throw new Error('Unable to resolve current Jira user.');
  }
  return {
    accountId: user.accountId,
    displayName: user.displayName,
    emailAddress: user.emailAddress,
  };
}

function pickLatestSprint(sprints: JiraSprintListResponse['values']): {
  id?: number;
  name?: string;
} | null {
  if (!sprints || sprints.length === 0) return null;
  const active = sprints.filter((s) => s.state === 'active');
  const candidates = active.length > 0 ? active : sprints;
  const sorted = [...candidates].sort((a, b) => {
    const aTime =
      Date.parse(a.startDate ?? a.endDate ?? a.completeDate ?? '') || 0;
    const bTime =
      Date.parse(b.startDate ?? b.endDate ?? b.completeDate ?? '') || 0;
    return bTime - aTime;
  });
  return sorted[0] ?? null;
}

export async function resolveLatestSprint(
  config: JiraClientConfig,
): Promise<SprintInfo> {
  try {
    const boards = await jiraRequest<JiraBoardListResponse>(
      config,
      `/board?projectKeyOrId=${encodeURIComponent(config.projectKey)}&type=scrum&maxResults=50`,
      { useAgileApi: true },
    );
    const boardId = boards.values?.[0]?.id;
    if (!boardId) {
      return { name: 'openSprints()', source: 'fallbackOpenSprints' };
    }
    const sprintList = await jiraRequest<JiraSprintListResponse>(
      config,
      `/board/${boardId}/sprint?state=active,future,closed&maxResults=50`,
      { useAgileApi: true },
    );
    const latest = pickLatestSprint(sprintList.values);
    if (!latest?.id) {
      return { name: 'openSprints()', source: 'fallbackOpenSprints' };
    }
    return {
      id: latest.id,
      name: latest.name ?? `sprint-${latest.id}`,
      source: 'activeSprint',
    };
  } catch {
    return { name: 'openSprints()', source: 'fallbackOpenSprints' };
  }
}

function mapIssue(item: JiraSearchResponse['issues'][number]): JiraIssue {
  const reporter = item.fields.reporter;
  return {
    id: item.id,
    key: item.key,
    summary: item.fields.summary?.trim() ?? '',
    priority: item.fields.priority?.name?.trim() ?? 'Unknown',
    status: item.fields.status?.name?.trim() ?? 'Unknown',
    createdAt: item.fields.created,
    updatedAt: item.fields.updated,
    reporter: {
      accountId: reporter?.accountId ?? '',
      displayName: reporter?.displayName ?? 'Unknown Reporter',
      emailAddress: reporter?.emailAddress,
    },
  };
}

function priorityRank(priority: PriorityName): number {
  return PRIORITY_ORDER[priority] ?? 0;
}

function issueTimestamp(issue: JiraIssue): number {
  const updated = issue.updatedAt ? Date.parse(issue.updatedAt) : Number.NaN;
  if (Number.isFinite(updated)) return updated;
  const created = issue.createdAt ? Date.parse(issue.createdAt) : Number.NaN;
  if (Number.isFinite(created)) return created;
  return 0;
}

function sortIssues(issues: JiraIssue[]): JiraIssue[] {
  return [...issues].sort((a, b) => {
    const byPriority = priorityRank(b.priority) - priorityRank(a.priority);
    if (byPriority !== 0) return byPriority;
    return issueTimestamp(b) - issueTimestamp(a);
  });
}

export async function searchAssignedBugsInLatestSprint(
  config: JiraClientConfig,
  options?: {
    issueType?: string;
    sprintMode?: 'latestActiveOrOpen' | 'openSprintsOnly';
    customJql?: string;
  },
): Promise<{ sprint: SprintInfo; issues: JiraIssue[] }> {
  const issueType = options?.issueType?.trim() || 'Bug';
  const sprintMode = options?.sprintMode ?? 'latestActiveOrOpen';
  if (options?.customJql?.trim()) {
    const result = await jiraRequest<JiraSearchResponse>(
      config,
      '/search/jql',
      {
        method: 'POST',
        body: {
          jql: options.customJql,
          maxResults: 100,
          fields: [
            'summary',
            'priority',
            'status',
            'created',
            'updated',
            'reporter',
          ],
        },
      },
    );
    return {
      sprint: { name: 'customJql', source: 'fallbackOpenSprints' },
      issues: sortIssues(result.issues.map(mapIssue)),
    };
  }
  const sprint = await resolveLatestSprint(config);
  const useOpenSprintsOnly = sprintMode === 'openSprintsOnly';
  const jql =
    !useOpenSprintsOnly && sprint.source === 'activeSprint' && sprint.id
      ? `project = ${config.projectKey} AND issuetype = ${issueType} AND assignee = currentUser() AND statusCategory != Done AND sprint = ${sprint.id}`
      : `project = ${config.projectKey} AND issuetype = ${issueType} AND assignee = currentUser() AND statusCategory != Done AND sprint in openSprints()`;
  const result = await jiraRequest<JiraSearchResponse>(config, '/search/jql', {
    method: 'POST',
    body: {
      jql,
      maxResults: 100,
      fields: [
        'summary',
        'priority',
        'status',
        'created',
        'updated',
        'reporter',
      ],
    },
  });
  const issues = result.issues.map(mapIssue);
  return { sprint, issues: sortIssues(issues) };
}

export async function getIssueStatusName(
  config: JiraClientConfig,
  issueKey: string,
): Promise<string> {
  const result = await jiraRequest<JiraIssueGetResponse>(
    config,
    `/issue/${encodeURIComponent(issueKey)}?fields=status`,
  );
  const status = result.fields?.status?.name?.trim();
  if (!status) {
    throw new Error(`Unable to resolve Jira status for ${issueKey}.`);
  }
  return status;
}

export async function transitionIssueToDevDone(
  config: JiraClientConfig,
  issueKey: string,
  currentStatus: string,
): Promise<TransitionResult> {
  const transitions = await jiraRequest<JiraTransitionResponse>(
    config,
    `/issue/${encodeURIComponent(issueKey)}/transitions`,
  );
  const desiredRaw = config.jiraDevDoneName?.trim() || 'Closed';
  const desired = desiredRaw.toLowerCase();
  const match = transitions.transitions.find((item) => {
    const target = item.to?.name?.trim().toLowerCase();
    const name = item.name?.trim().toLowerCase();
    return target === desired || name === desired;
  });
  if (!match) {
    const available = transitions.transitions
      .map((t) => t.to?.name?.trim() || t.name?.trim())
      .filter(Boolean)
      .join(', ');
    throw new Error(
      `Transition "${desiredRaw}" not found for ${issueKey}. Available transitions: ${available || '(none)'}. You can set JIRA_DEV_DONE_NAME to match your Jira workflow.`,
    );
  }
  await jiraRequest<void>(
    config,
    `/issue/${encodeURIComponent(issueKey)}/transitions`,
    {
      method: 'POST',
      body: { transition: { id: match.id } },
    },
  );
  return {
    transitioned: true,
    fromStatus: currentStatus,
    toStatus: match.to?.name ?? match.name ?? 'DEV DONE',
    transitionId: match.id,
    note: 'Issue transitioned to DEV DONE.',
  };
}

export async function assignIssueToReporter(
  config: JiraClientConfig,
  issueKey: string,
  reporterAccountId: string,
): Promise<void> {
  if (!reporterAccountId) {
    throw new Error(
      `Cannot reassign ${issueKey}: reporter accountId is empty.`,
    );
  }
  await jiraRequest<void>(
    config,
    `/issue/${encodeURIComponent(issueKey)}/assignee`,
    {
      method: 'PUT',
      body: { accountId: reporterAccountId },
    },
  );
}

export function parseRepoSlugFromRemote(remoteUrl: string): string | null {
  const trimmed = remoteUrl.trim();
  const ssh = /^git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/.exec(trimmed);
  if (ssh) return `${ssh[1]}/${ssh[2]}`;
  const https = /^https:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/.exec(
    trimmed,
  );
  if (https) return `${https[1]}/${https[2]}`;
  return null;
}

async function getOriginRemoteUrl(): Promise<string> {
  const { stdout } = await execFileAsync('git', [
    'remote',
    'get-url',
    'origin',
  ]);
  return stdout.trim();
}

function parseSemverTag(
  tag: string,
  prefix: string,
): [number, number, number] | null {
  if (!tag.startsWith(prefix)) return null;
  const raw = tag.slice(prefix.length);
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(raw);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function compareVersion(
  a: [number, number, number],
  b: [number, number, number],
): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
}

export async function computeNextPatchTag(prefix: string): Promise<string> {
  const { stdout } = await execFileAsync('git', [
    'tag',
    '--list',
    `${prefix}*`,
  ]);
  const all = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const parsed = all
    .map((tag) => ({ tag, version: parseSemverTag(tag, prefix) }))
    .filter(
      (item): item is { tag: string; version: [number, number, number] } =>
        Boolean(item.version),
    );
  if (parsed.length === 0) return `${prefix}0.0.1`;
  parsed.sort((a, b) => compareVersion(a.version, b.version));
  const latest = parsed[parsed.length - 1].version;
  return `${prefix}${latest[0]}.${latest[1]}.${latest[2] + 1}`;
}

export async function assertCleanWorkingTree(): Promise<void> {
  const { stdout } = await execFileAsync('git', ['status', '--porcelain']);
  if (stdout.trim()) {
    throw new Error(
      'Working tree is not clean. Please commit/stash your changes before tagging.',
    );
  }
}

export async function hasWorkingTreeChanges(): Promise<boolean> {
  const { stdout } = await execFileAsync('git', ['status', '--porcelain']);
  return Boolean(stdout.trim());
}

export async function commitAllChanges(message: string): Promise<string> {
  const commitMessage = message.trim();
  if (!commitMessage) {
    throw new Error('Commit message cannot be empty.');
  }
  await execFileAsync('git', ['add', '.']);
  await execFileAsync('git', ['commit', '-m', commitMessage]);
  const { stdout } = await execFileAsync('git', [
    'rev-parse',
    '--short',
    'HEAD',
  ]);
  return stdout.trim();
}

export async function pushCurrentBranch(): Promise<{
  branch: string;
  usedUpstream: boolean;
}> {
  const { stdout: branchStdout } = await execFileAsync('git', [
    'rev-parse',
    '--abbrev-ref',
    'HEAD',
  ]);
  const branch = branchStdout.trim();
  if (!branch || branch === 'HEAD') {
    throw new Error('Cannot determine current branch (detached HEAD).');
  }

  // If upstream exists, normal push is fine. Otherwise set upstream to origin/branch.
  try {
    await execFileAsync('git', [
      'rev-parse',
      '--abbrev-ref',
      '--symbolic-full-name',
      '@{u}',
    ]);
    await execFileAsync('git', ['push']);
    return { branch, usedUpstream: true };
  } catch {
    await execFileAsync('git', ['push', '-u', 'origin', 'HEAD']);
    return { branch, usedUpstream: false };
  }
}

export async function createAndPushTag(tag: string): Promise<string> {
  await execFileAsync('git', ['tag', tag]);
  await execFileAsync('git', ['push', 'origin', tag]);
  const { stdout } = await execFileAsync('git', ['rev-list', '-n', '1', tag]);
  return stdout.trim();
}

export async function resolveExistingTagSha(tag: string): Promise<string> {
  const { stdout } = await execFileAsync('git', ['rev-list', '-n', '1', tag]);
  const sha = stdout.trim();
  if (!sha) {
    throw new Error(`Tag not found or has no commit: ${tag}`);
  }
  return sha;
}

export async function resolveRepoSlug(
  explicitRemoteUrl?: string,
): Promise<string> {
  const remote = explicitRemoteUrl?.trim() || (await getOriginRemoteUrl());
  const slug = parseRepoSlugFromRemote(remote);
  if (!slug) {
    throw new Error(`Cannot parse GitHub repo from remote: ${remote}`);
  }
  return slug;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function waitForTagWorkflow(
  repoSlug: string,
  workflowFile: string,
  headSha: string,
  timeoutMs: number,
  onProgress?: (progress: WorkflowProgress) => void,
): Promise<TagCiResult> {
  const started = Date.now();
  let matchedRun:
    | {
        id: number;
        htmlUrl?: string;
      }
    | undefined;
  while (Date.now() - started < timeoutMs) {
    let stdout: string;
    try {
      const result = await execFileAsync('gh', [
        'api',
        `repos/${repoSlug}/actions/workflows/${workflowFile}/runs?event=push&per_page=50`,
      ]);
      stdout = result.stdout;
    } catch (error) {
      const code =
        typeof error === 'object' && error && 'code' in error
          ? String((error as { code?: string }).code)
          : '';
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message?: string }).message)
          : String(error);
      if (code === 'ENOENT') {
        throw new Error(
          'GitHub CLI (`gh`) is not installed or not in PATH. Install it from https://cli.github.com/ or skip CI auto-wait.',
        );
      }
      // Transient network issues should not immediately fail CI waiting.
      if (
        message.includes('i/o timeout') ||
        message.includes('TLS handshake timeout') ||
        message.includes('connection reset by peer') ||
        message.includes('temporary failure in name resolution') ||
        message.includes('context deadline exceeded')
      ) {
        onProgress?.({
          status: 'not_found',
          jobsTotal: 0,
          jobsCompleted: 0,
          jobsSuccess: 0,
          jobsFailed: 0,
          jobsInProgress: 0,
          jobsQueued: 0,
          stepsTotal: 0,
          stepsCompleted: 0,
          stepsSuccess: 0,
          stepsFailed: 0,
          stepsInProgress: 0,
          stepsQueued: 0,
          jobs: [],
          updatedAt: new Date().toISOString(),
        });
        await sleep(5000);
        continue;
      }
      throw error;
    }
    const json = JSON.parse(stdout) as GitHubWorkflowRunsResponse;
    const runs = json.workflow_runs ?? [];
    const run = runs.find((item) => item.head_sha === headSha);
    if (run) {
      matchedRun = { id: run.id, htmlUrl: run.html_url };
      let jobsSummary: Omit<
        WorkflowProgress,
        'runId' | 'runUrl' | 'status' | 'conclusion' | 'updatedAt'
      > = {
        jobsTotal: 0,
        jobsCompleted: 0,
        jobsSuccess: 0,
        jobsFailed: 0,
        jobsInProgress: 0,
        jobsQueued: 0,
        stepsTotal: 0,
        stepsCompleted: 0,
        stepsSuccess: 0,
        stepsFailed: 0,
        stepsInProgress: 0,
        stepsQueued: 0,
        jobs: [],
      };
      try {
        const jobsResp = await execFileAsync('gh', [
          'api',
          `repos/${repoSlug}/actions/runs/${run.id}/jobs?per_page=100`,
        ]);
        const jobsJson = JSON.parse(
          jobsResp.stdout,
        ) as GitHubWorkflowJobsResponse;
        const jobs = jobsJson.jobs ?? [];
        for (const job of jobs) {
          jobsSummary.jobsTotal += 1;
          const normalizedStatus = job.status ?? 'unknown';
          const normalizedConclusion = job.conclusion ?? undefined;
          jobsSummary.jobs?.push({
            name: job.name ?? `job-${job.id}`,
            status: normalizedStatus,
            conclusion: normalizedConclusion,
            steps:
              job.steps?.map((s) => ({
                name: s.name ?? 'unnamed-step',
                status: s.status ?? 'unknown',
                conclusion: s.conclusion ?? undefined,
              })) ?? [],
          });

          const steps = job.steps ?? [];
          for (const step of steps) {
            jobsSummary.stepsTotal += 1;
            if (step.status === 'completed') {
              jobsSummary.stepsCompleted += 1;
              if (step.conclusion === 'success') jobsSummary.stepsSuccess += 1;
              else jobsSummary.stepsFailed += 1;
            } else if (step.status === 'in_progress') {
              jobsSummary.stepsInProgress += 1;
            } else {
              jobsSummary.stepsQueued += 1;
            }
          }
          if (job.status === 'completed') {
            jobsSummary.jobsCompleted += 1;
            if (job.conclusion === 'success') jobsSummary.jobsSuccess += 1;
            else jobsSummary.jobsFailed += 1;
          } else if (job.status === 'in_progress') {
            jobsSummary.jobsInProgress += 1;
          } else {
            jobsSummary.jobsQueued += 1;
          }
        }
      } catch {
        // Keep waiting even when jobs detail API intermittently fails.
      }

      const inProgressJob = jobsSummary.jobs?.find(
        (j) => j.status === 'in_progress',
      );
      const inProgressStep = inProgressJob?.steps?.find(
        (s) => s.status === 'in_progress',
      );

      onProgress?.({
        runId: run.id,
        runUrl: run.html_url,
        status:
          run.status === 'completed'
            ? 'completed'
            : run.status === 'in_progress'
              ? 'in_progress'
              : 'queued',
        conclusion: run.conclusion ?? undefined,
        runningJob: inProgressJob?.name,
        runningStep: inProgressStep?.name,
        updatedAt: new Date().toISOString(),
        ...jobsSummary,
      });

      if (run.status === 'completed') {
        return {
          runUrl: run.html_url,
          ciStatus: run.conclusion === 'success' ? 'success' : 'failed',
          ciConclusion: run.conclusion,
        };
      }
    } else {
      onProgress?.({
        status: 'not_found',
        jobsTotal: 0,
        jobsCompleted: 0,
        jobsSuccess: 0,
        jobsFailed: 0,
        jobsInProgress: 0,
        jobsQueued: 0,
        stepsTotal: 0,
        stepsCompleted: 0,
        stepsSuccess: 0,
        stepsFailed: 0,
        stepsInProgress: 0,
        stepsQueued: 0,
        jobs: [],
        updatedAt: new Date().toISOString(),
      });
    }
    await sleep(5000);
  }
  return {
    runUrl: matchedRun?.htmlUrl,
    ciStatus: 'timeout',
    ciConclusion: matchedRun ? 'timed_out_waiting_completion' : 'run_not_found',
  };
}

export async function resolveSlackUserIdByEmail(
  token: string,
  email?: string,
): Promise<string | null> {
  if (!email) return null;
  const { signal, cancel } = withTimeoutSignal(DEFAULT_HTTP_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch('https://slack.com/api/users.lookupByEmail', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ email }).toString(),
      signal,
    });
  } catch (err) {
    if (signal.aborted) return null;
    throw err;
  } finally {
    cancel();
  }
  const json = (await response.json()) as SlackUsersLookupResponse;
  if (!response.ok || !json.ok) return null;
  return json.user?.id ?? null;
}

const slackChannelMembersCache = new Map<string, Set<string>>();

async function getSlackChannelMembers(
  token: string,
  channelId: string,
): Promise<Set<string>> {
  const cacheKey = `${token.slice(0, 12)}:${channelId}`;
  const cached = slackChannelMembersCache.get(cacheKey);
  if (cached) return cached;

  const members = new Set<string>();
  let cursor = '';

  while (true) {
    const { signal, cancel } = withTimeoutSignal(DEFAULT_HTTP_TIMEOUT_MS);
    let response: Response;
    try {
      const qs = new URLSearchParams({
        channel: channelId,
        limit: '1000',
      });
      if (cursor) qs.set('cursor', cursor);

      response = await fetch(
        `https://slack.com/api/conversations.members?${qs.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          signal,
        },
      );
    } catch (err) {
      if (signal.aborted) {
        throw new Error('Slack conversations.members timeout');
      }
      throw err;
    } finally {
      cancel();
    }

    const json = (await response.json()) as SlackConversationMembersResponse;
    if (!response.ok || !json.ok) {
      throw new Error(
        `Slack conversations.members failed: ${json.error ?? response.statusText}`,
      );
    }
    for (const id of json.members ?? []) {
      members.add(id);
    }
    cursor = json.response_metadata?.next_cursor?.trim() || '';
    if (!cursor) break;
  }

  slackChannelMembersCache.set(cacheKey, members);
  return members;
}

export async function resolveSlackUserIdByEmailInChannel(params: {
  token: string;
  channelId: string;
  email?: string;
}): Promise<string | null> {
  const slackId = await resolveSlackUserIdByEmail(params.token, params.email);
  if (!slackId) return null;

  const members = await getSlackChannelMembers(params.token, params.channelId);
  if (!members.has(slackId)) return null;
  return slackId;
}

async function getSlackUserEmailById(
  token: string,
  userId: string,
): Promise<string | null> {
  const { signal, cancel } = withTimeoutSignal(DEFAULT_HTTP_TIMEOUT_MS);
  let response: Response;
  try {
    const qs = new URLSearchParams({ user: userId });
    response = await fetch(
      `https://slack.com/api/users.info?${qs.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        signal,
      },
    );
  } catch (err) {
    if (signal.aborted) {
      throw new Error('Slack users.info timeout');
    }
    throw err;
  } finally {
    cancel();
  }
  const json = (await response.json()) as SlackUserInfoResponse;
  if (!response.ok || !json.ok) {
    throw new Error(
      `Slack users.info failed: ${json.error ?? response.statusText}`,
    );
  }
  const email = json.user?.profile?.email?.trim().toLowerCase();
  return email || null;
}

export async function buildSlackChannelMemberEmailMap(params: {
  token: string;
  channelId: string;
}): Promise<Record<string, string>> {
  const emailMap: Record<string, string> = {};
  try {
    const members = await getSlackChannelMembers(
      params.token,
      params.channelId,
    );
    for (const userId of members) {
      try {
        const email = await getSlackUserEmailById(params.token, userId);
        if (email) {
          emailMap[email] = userId;
        }
      } catch {
        // Keep best-effort behavior; unresolved users are skipped.
      }
    }
    return emailMap;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('missing_scope')) {
      throw error;
    }
  }

  // Fallback: when conversations.members scope is missing, build from workspace users.
  let cursor = '';
  while (true) {
    const { signal, cancel } = withTimeoutSignal(DEFAULT_HTTP_TIMEOUT_MS);
    let response: Response;
    try {
      const qs = new URLSearchParams({ limit: '200' });
      if (cursor) qs.set('cursor', cursor);
      response = await fetch(
        `https://slack.com/api/users.list?${qs.toString()}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${params.token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          signal,
        },
      );
    } catch (err) {
      if (signal.aborted) {
        throw new Error('Slack users.list timeout');
      }
      throw err;
    } finally {
      cancel();
    }

    const json = (await response.json()) as SlackUsersListResponse;
    if (!response.ok || !json.ok) {
      throw new Error(
        `Slack users.list failed: ${json.error ?? response.statusText}`,
      );
    }
    for (const member of json.members ?? []) {
      if (!member.id || member.deleted || member.is_bot) continue;
      const email = member.profile?.email?.trim().toLowerCase();
      if (email) {
        emailMap[email] = member.id;
      }
    }
    cursor = json.response_metadata?.next_cursor?.trim() || '';
    if (!cursor) break;
  }

  return emailMap;
}

export async function sendSlackMessage(params: {
  token: string;
  channelId: string;
  message: string;
}): Promise<{ channel?: string; ts?: string }> {
  const { signal, cancel } = withTimeoutSignal(DEFAULT_HTTP_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        channel: params.channelId,
        text: params.message,
        mrkdwn: true,
      }),
      signal,
    });
  } catch (err) {
    if (signal.aborted) {
      throw new Error(`Slack send timeout after ${DEFAULT_HTTP_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    cancel();
  }
  const json = (await response.json()) as SlackPostResponse;
  if (!response.ok || !json.ok) {
    throw new Error(`Slack send failed: ${json.error ?? response.statusText}`);
  }
  return { channel: json.channel, ts: json.ts };
}

export function buildSlackSummaryMessage(args: {
  tagVersion: string;
  records: WorkflowRecord[];
  reporterMentions: string[];
  jiraSiteUrl?: string;
  ciResult: TagCiResult;
}): string {
  const title = `${args.reporterMentions.join(' ')} ${args.tagVersion}:`;
  const jiraBase = args.jiraSiteUrl?.trim()
    ? args.jiraSiteUrl.trim().replace(/\/+$/, '')
    : '';
  const bugLines = args.records.map(
    (record, idx) =>
      `${idx + 1}. ${
        jiraBase
          ? `<${jiraBase}/browse/${record.issueKey}|[${record.issueKey}]>`
          : `[${record.issueKey}]`
      } ${record.summary} (${record.statusBefore} -> ${record.statusAfter ?? 'PENDING_JIRA_UPDATE'})`,
  );
  return [title, 'Bugfix:', ...bugLines].join('\n');
}

export async function writeSessionLog(params: {
  startedAt: string;
  endedAt: string;
  sprintName: string;
  currentUser: JiraUser;
  records: WorkflowRecord[];
  tagCiResult: TagCiResult;
  slackMessage: string;
}): Promise<string> {
  const compact = params.startedAt.replaceAll(':', '-').replaceAll('.', '-');
  const filePath = path.resolve(
    process.cwd(),
    `tmp/bugfix-session-${compact}.json`,
  );
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(
    filePath,
    `${JSON.stringify(
      {
        startedAt: params.startedAt,
        endedAt: params.endedAt,
        sprintName: params.sprintName,
        currentUser: params.currentUser,
        records: params.records,
        tagCiResult: params.tagCiResult,
        slackMessage: params.slackMessage,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  return filePath;
}
