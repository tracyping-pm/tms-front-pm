# Bugfix Driver Workflow Skill

## Purpose

Run an interactive, CI-gated bugfix release loop (profile-driven) that:

- fetches current user's unresolved sprint bugs,
- lets human/AI fix them one by one,
- batches them into a release tag,
- waits GitHub Actions result,
- then conditionally updates Jira + sends Slack summary.

This skill maps to `scripts/bugfix-workflow.ts` + `scripts/bugfix-workflow-lib.ts`.

## When To Use

Use this skill when user asks for any of the following:

- "batch fix TSN bugs" / "run bugfix workflow"
- "pick unresolved bugs from current sprint"
- "after CI success, close Jira + reassign to reporter"
- "auto create tag and post Slack bugfix summary"
- "guide me through one-by-one bugfix and release"

Do **not** use this skill for:

- single issue manual update only (no batching/tag/CI),
- non-bugfix one-off updates.

## Required Inputs

- 可将下列变量写入项目根 `.env.local`：`bugfix-workflow.ts` 启动时会自动加载（`dotenv`，不覆盖已存在的环境变量）。
- `ATLASSIAN_SITE_URL`
- `ATLASSIAN_EMAIL`
- `ATLASSIAN_API_TOKEN`
- `SLACK_BOT_TOKEN`
- `SLACK_CHANNEL_ID` (or profile-specific channel env)

## Optional Inputs / Behavior Toggles

- `BUGFIX_PROFILE` (default `tsn`)
- `JIRA_PROJECT_KEY` (override profile Jira project key)
- `JIRA_DEV_DONE_NAME` (override profile transition target)
- `BUGFIX_TAG_PREFIX` (override profile tag prefix)
- `BUGFIX_GHA_WORKFLOW_FILE` (override profile workflow file)
- `BUGFIX_GHA_TIMEOUT_MINUTES` (override profile timeout minutes)
- `BUGFIX_BATCH_SIZE` (override profile batch size; auto release when pending batch reaches size)
- `BUGFIX_SLACK_MEMBERS_REFRESH=1` (force refresh cached channel email map)
- `BUGFIX_CI_VERBOSE=0` (disable CI running job/step progress)
- `GITHUB_REPO_REMOTE_URL` (override git remote parsing)
- CLI flag: `--verbose-ci` / `-V` (force CI progress logs on)
- CLI flag: `--profile <id>` (explicit profile selection)

## Command

```bash
pnpm bugfix:workflow
pnpm bugfix:workflow --profile tsn
```

## Exact Workflow (Code-Accurate)

0. Resolve profile (`--profile` > `BUGFIX_PROFILE` > default `tsn`).
1. Resolve Jira current user (`/myself`), print session header.
2. Prepare Slack member email cache:
   - read `tmp/bugfix-slack-members-<channel>.json` if exists,
   - ask whether to reuse cache,
   - or rebuild from Slack API and write cache.
3. Query unresolved issues assigned to current user:
   - strategy comes from profile (`sprintMode`, `issueType`, optional `customJql`),
   - sort by priority desc (`Highest -> Lowest`) then updated/created desc.
4. Interactive bug loop:
   - choose issue (or finish session),
   - generate AI helper prompt text and write `tmp/bugfix-prompts/<ISSUE>-<timestamp>.md`,
   - user fixes issue outside script,
   - user confirms "Reviewed and fixed in code?"; only confirmed issues enter pending batch.
5. Batch handling:
   - pending issues accumulate,
   - if pending count >= `BUGFIX_BATCH_SIZE`, force `release`,
   - otherwise ask: `continue` / `release now` / `finish`.
6. On release (`releaseBatch` / `maybeTagBatch`):
   - detect git dirty state; optionally `git add . && git commit`,
   - optionally push current branch (auto `-u` if upstream missing),
   - compute next semver tag from existing tags (`<profile.tagPrefix>X.Y.Z + patch`),
   - clean-tree preflight can be profile-configured,
   - create + push tag,
   - poll GitHub Actions workflow run by tag SHA until success/fail/timeout.
7. Post-CI actions:
   - only when CI success: optionally transition each issue to DEV DONE target + reassign to reporter,
   - build Slack mentions from reporter emails (cache first, then live lookup/fallback),
   - only when CI success: optionally send Slack summary.
8. End session (`finalizeSession`):
   - if pending batch still exists, ask whether to release before exit,
   - write session log `tmp/bugfix-session-<timestamp>.json`,
   - print processed issues / tag / CI / Slack template.

## Critical Guarantees

- Jira status/assignee updates happen **after CI success** and explicit user confirmation.
- Slack auto-send happens **after CI success** and explicit user confirmation.
- Transition ID is resolved dynamically from available transitions (no hardcoded ID).
- If CI failed/timeout/skipped, script keeps Jira/Slack as manual follow-up.
- Partial Jira failures do not block other issues in the same batch.

## Failure/Retry Semantics

- Commit step failure: user can retry or skip release.
- Push failure: user can retry or abort release.
- Preflight dirty tree before tagging: user can fix then retry.
- CI wait API transient errors: keep polling; timeout returns `ciStatus=timeout`.
- Slack lookup missing scope: degrade gracefully to email-only lookup and continue.

## Output Contract

- Prompt helper file:
  - `tmp/bugfix-prompts/<ISSUE>-<timestamp>.md`
- Session log:
  - `tmp/bugfix-session-<timestamp>.json`
- Slack message template shape:

```text
<@reporterA> <@reporterB> tms-fe-vX.Y.Z:
Bugfix:
1. <JIRA_LINK|[TSN-1234]> Summary (StatusBefore -> StatusAfterOrPending)
2. <JIRA_LINK|[TSN-5678]> Summary (StatusBefore -> StatusAfterOrPending)
```

## Agent Usage Instructions

When user asks to "run/assist bugfix workflow", agent should:

1. Verify required env vars exist (or explicitly ask user to provide missing ones).
2. Choose profile (`--profile` or `BUGFIX_PROFILE`; fallback `tsn`) and run in repo root.
3. During prompts, guide user with safe defaults:
   - do not skip commit/push/tag unless user intentionally chooses so,
   - do not update Jira/Slack if CI not success.
4. If workflow exits with unresolved pending batch, suggest re-run or manual release path.
5. If script output includes prompt file path, use it to support root-cause + fix plan in Cursor.

## Add New Project Profile (Template)

Use this shape in `scripts/bugfix-workflow.ts` (`BUGFIX_WORKFLOW_PROFILES`):

```ts
{
  id: 'your-project',
  name: 'Your Project',
  enabled: true,
  jira: {
    projectKey: 'ABC',
    doneStatusName: 'Closed',
    issueType: 'Bug',
    sprintMode: 'latestActiveOrOpen',
    customJql: undefined,
  },
  release: {
    tagPrefix: 'your-tag-v',
    workflowFile: 'tags.yml',
    timeoutMinutes: 30,
    batchSize: 3,
    requireCleanTree: true,
  },
  slack: {
    channelIdEnv: 'SLACK_CHANNEL_ID',
    mentionMode: 'memberMap',
    messageTemplate: undefined,
  },
  git: {
    remoteName: 'origin',
    allowAutoPush: true,
    allowAutoCommit: true,
  },
}
```
