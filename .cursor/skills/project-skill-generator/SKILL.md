---
name: project-skill-generator
description: Analyzes a codebase's structure, conventions, and tech stack, then outputs a project Skill document (SKILL.md) for AI assistants. Use when the user wants to document the project for Cursor/Claude, generate a project skill, or analyze frontend/modern code structure to produce skill-style documentation. Reference style from awesome-claude-skills.
---

# Project Skill Generator

Generates a **project Skill** (SKILL.md) that describes the codebase so AI assistants can work consistently with the project. Follow the format and tone of [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) frontend skills: concise, third-person description, clear stack and structure.

## When to Use

- User asks to "分析项目结构并输出 Skill" or "generate project skill"
- User wants to document the project for Cursor/Claude
- User references awesome-claude-skills or "前端项目的 SKILL"

## Analysis Workflow

### 1. Explore the Codebase

Gather the following (read files, do not guess):

| What to check | Where to look |
| --- | --- |
| Framework & runtime | `package.json` (dependencies, scripts), `config.*`, `vite.config.*`, `next.config.*` |
| Routing | `config/routes.*`, `src/routes.*`, router config in framework |
| Entry & layout | `src/app.*`, `src/layouts`, `src/pages`, `index.html` |
| API layer | `src/api`, `src/services`, `src/request`, fetch/axios setup |
| State | `src/store`, `src/models`, Redux/Zustand/Context usage |
| Styling | `*.less`, `*.css`, `*.module.css`, Tailwind config, theme files |
| Conventions | Naming (PascalCase files, folder per feature), existing README or CONTRIBUTING |

### 2. Identify Conventions

- **Naming**: components (PascalCase?), pages (kebab or Pascal?), API modules
- **Folder structure**: feature-based vs layer-based (e.g. `pages/`, `components/`, `api/`)
- **Imports**: path aliases (`@/`, `~`), barrel files (`index.ts`)
- **Lint/format**: ESLint, Prettier, Stylelint — mention in skill if they define style

### 3. Output: Project SKILL.md

Write a single **SKILL.md** with YAML frontmatter and sections below. Use **third person** in the description. Keep it under ~300 lines; link to repo or docs for deep detail.

**Required structure:**

```markdown
---
name: <project-slug>
description: <One sentence: what the project is. Use when [trigger scenarios].>
---

# <Project Display Name>

<1–2 sentence purpose.>

## Stack

- **Framework**: e.g. React 18, Umi Max, Next.js
- **UI**: e.g. Ant Design, shadcn/ui
- **Language**: TypeScript / JavaScript
- **Styling**: e.g. Less, CSS Modules, Tailwind
- **State / Data**: e.g. ahooks, Redux, React Query
- **Build**: e.g. Vite, Umi, Webpack
- **Other**: routing, API client, key libs

## Project Structure

\`\`\` <key dirs only, 1–2 levels> src/ api/ # API modules components/ # shared components pages/ # route pages (or app/, views/) ... \`\`\`

- **Routes**: Where routes are defined (file path) and pattern (file-based vs config).
- **Entry**: Main entry and layout (e.g. `src/app.tsx`, `config/routes.tsx`).

## Conventions

- **Components**: Where they live; naming (PascalCase); preferred pattern (function components + TypeScript).
- **Pages/Features**: How features are grouped (e.g. by domain: customer, project, billing).
- **API**: How requests are organized (per-domain files, base URL, auth).
- **Styling**: File naming (`index.less`, `styles.less`), scoping (BEM, modules), theme/antd override if any.
- **Imports**: Path alias (e.g. `@/` → `src/`), barrel exports.

## When to Use This Skill

- Working on this codebase in Cursor or Claude.
- Adding or modifying pages, components, or API calls.
- Following existing patterns and stack.
```

## Quality Checks

- **Description**: Third person, includes "Use when..." with 1–3 trigger scenarios.
- **Stack**: Accurate (from package.json/config), no invented deps.
- **Structure**: Matches real folders; route and entry paths correct.
- **Conventions**: Short bullets; no generic advice the model already knows.
- **Tone**: Same as awesome-claude-skills — concise, instructional, no marketing fluff.

## Reference

- **Example output**: See [example-output.md](example-output.md) for a minimal SKILL.md template.
- Frontend skill examples: [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) (e.g. `artifacts-builder`, `theme-factory`).
- Skill format: YAML frontmatter (`name`, `description`) + markdown sections; keep SKILL.md focused and under ~500 lines.
