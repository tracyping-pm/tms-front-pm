---
name: commit-message
description: >-
  TMS 前端仓库的 Git commit message 格式：精简英文/中文 Subject，多行 Body 罗列变更与优化点。 在用户要求提交、写 commit、整理 changelog、或提到 commit msg / conventional commits 时使用。
---

# Commit message 格式（tms_frontend）

## Subject（第一行）

- **一行**，尽量 **≤ 72 字符**（终端与工具展示友好）。
- 推荐：`type(scope): 简短说明`
  - **type**：`feat` | `fix` | `refactor` | `perf` | `chore` | `docs` | `style` | `test` | `build` | `ci` 等。
  - **scope**：模块或领域，如 `uam`、`proxy`、`docker`、`api`；单模块可省略但建议保留。
  - **说明**：用 **祈使/动宾** 短句，说明「做了什么」，避免句号结尾。
- 语言：与团队习惯一致即可（本项目示例为 **中文**）。

示例：

```text
feat(uam): 平台 origin 运行时注册表
```

## Body（空一行后）

- **不要**写「为什么改代码」的长篇设计文档；**要**写 **本次提交实际动到的行为与范围**，便于 review 与日后 `git log` / cherry-pick。
- **一条一行**，按 **重要性或模块** 排序（用户可见行为 → 配置/部署 → 依赖/文档）。
- 每条尽量 **自洽**：谁（文件/能力）→ 做了什么 → 关键约束（若有）。
- 可 **不加** 行首 `-`（与 Subject 区分）；若仓库已有列表习惯，**统一加** `- ` 亦可。

示例（与 Subject 配套）：

```text
feat(uam): 平台 origin 运行时注册表

首屏 getBuOriginUrl → setBuOriginUrls，失败不阻塞；getOrigin/getUamUrl 替代 ENUM_BU_TYPE_PORT/UAM_ABSOLUTE_PATHS
401/403/808/815 与登录/无权限/切角色/改密跳转统一 getUamUrl
移除 runtime-env、public/config.js；entrypoint 不写 config.js，仅 defaults + 推导 upstream + envsubst nginx
runtime-env.defaults / generate-runtime-env-defaults 收窄 TMS_ORIGIN、UAM_ORIGIN；Docker 仍无 jq/curl 注册表
consumeLocalhostRedirectToken；AvatarDropdown/OssUpload/HeaderLogo/运单自动化等改用新 origin 工具
config define、legacy、package 与 SKILL/TODO 同步
```

## 不要写进 commit 的内容

- 与本提交 **无关** 的提醒（例如「需要时 git push」「本地分支超前」）——那是协作说明，不是 commit body。
- 与本次 diff **无关** 的假设、待办、个人备忘。

## 与「plan / TODO」的关系

若存在 `.cursor/skills/**/TODO.md` 或任务清单，Body 可从对应 **Phase / 条目** 压缩为 **结果导向** 的短句（去掉未完成的 `[ ]` 项），只描述 **本 commit 已落地** 的部分。

## 多提交拆分原则（简述）

- 一个 commit 尽量 **一个主题**；机械重命名与功能变更 **分开**。
- 超大改动：可按 **运行时 / Docker / 配置 / 业务替换** 拆 commit，每条 Subject+Body 仍按本格式。
