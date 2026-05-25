# Example: Project Skill Output

Minimal example of what the generated SKILL.md should look like (style from awesome-claude-skills).

```markdown
---
name: my-frontend-app
description: React + Umi Max admin app with Ant Design and Less. Use when working on this codebase, adding pages/components, or following its routing and API patterns.
---

# My Frontend App

Admin dashboard built with Umi Max, Ant Design Pro components, and TypeScript.

## Stack

- **Framework**: React 18, Umi Max 4
- **UI**: Ant Design 5, @ant-design/pro-components
- **Language**: TypeScript
- **Styling**: Less, antd theme override
- **State / Data**: ahooks, React state
- **Build**: Umi (max), Webpack
- **Routing**: Config-based in `config/routes.tsx`

## Project Structure
```

src/ api/ # API modules by domain components/ # shared components pages/ # route pages (customer, project, billing, ...) config/ # routes, env config/ routes.tsx # route definitions

```

## Conventions

- **Components**: PascalCase; shared in `src/components/`, feature-specific under `pages/<feature>/components/`.
- **Pages**: One folder per route area; `index.tsx` or `list.tsx` as entry; sub-routes in nested folders.
- **API**: One file per domain under `src/api/`; request client and base URL in shared setup.
- **Styling**: Co-located `index.less` or `styles.less`; BEM or scoped class names; antd overrides in global Less.
- **Imports**: Prefer `@/` for `src/` when configured.

## When to Use This Skill

- Editing or adding features in this repo in Cursor/Claude.
- Matching existing patterns for pages, components, and API calls.
```

Keep real outputs aligned with this structure; expand Stack and Conventions from the actual codebase.
