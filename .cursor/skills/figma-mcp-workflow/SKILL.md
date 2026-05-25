---
name: figma-mcp-workflow
description: Converts Figma designs into production-ready code using Cursor + Figma MCP. Use when given figma.com links, fileKey/nodeId, “design context”, screenshots, or when asked to match Figma UI precisely in this repo (React + Ant Design + Less).
---

# Figma MCP Workflow (Cursor)

Turn a Figma node into maintainable, pixel-accurate UI code while staying aligned with the project stack and conventions.

## Quick Start

When a user provides a Figma link or `{fileKey,nodeId}`:

1. **Extract identifiers**
   - From `figma.com/design/:fileKey/...?...node-id=13211-245020` → `fileKey=:fileKey`, `nodeId=13211:245020` (replace `-` with `:`).
2. **Fetch context**
   - Use the Figma MCP “design context” first (screenshot + structure hints + possible Code Connect mappings).
3. **Treat generated code as reference only**
   - **Do not** introduce Tailwind if the repo doesn’t use it.
   - Use screenshot + hints to implement with the repo’s stack (here: **React + AntD + Less**).
4. **Implement by mapping semantics**
   - Container: `Modal/Drawer/Card/Flex/Space`
   - Text: `Typography.Text` (default/secondary)
   - Actions: `Button` (default/primary)
   - Icons: `@ant-design/icons` (e.g. `CloseCircleFilled`, `CheckCircleFilled`)
5. **Validate**
   - Compare against screenshot: spacing, typography, colors, states, and interactions.
   - Run lint/type checks scoped to touched files when possible.

## Project Fit Rules (important)

- **UI library**: Ant Design (prefer props/tokens over custom CSS).
- **Styling**: Less (prefer component-local `index.less`; avoid global overrides unless required).
- **Don’t copy Tailwind classes** from MCP output; rewrite into AntD + Less.
- **Prefer existing patterns** in nearby components/pages over inventing new abstractions.

## Design-to-Code Checklist

- **Structure**
  - Header/body/footer regions (e.g. AntD `Modal` title + `footer`).
  - Correct alignment (`Flex`/`Space`), consistent gaps.
- **Typography**
  - Use `Typography.Text` and `type="secondary"` where the design uses secondary text.
  - Ensure multi-line behavior matches the screenshot (e.g. `white-space: pre-line` when the design shows line breaks).
- **Icons**
  - Use the closest AntD icon; match size/color (error: `#ff4d4f`, success: `#52c41a` by default).
- **States**
  - Identify required states (success/failure/loading/empty). If not wired to APIs, support them via props.
- **Interactions**
  - Close behaviors (X, Cancel, ESC, maskClosable policy).
  - Primary action callback semantics (`onSuccess`, etc.).

## Output Templates (copy/paste)

### A. Ask for missing details (minimal)

Use this when requirements are ambiguous:

```markdown
I can match the Figma node precisely. Please confirm:

- Should this be UI-only (no API) or wired to real endpoints?
- Which states must be supported (success/failure/loading/empty)?
```

### B. Implementation plan skeleton

```markdown
## Plan

- Fetch Figma design context (screenshot + hints) for {fileKey,nodeId}
- Locate the target component/file(s) in repo and existing UI patterns
- Implement AntD structure (Modal header/body/footer) and map Typography/Icon/Button
- Add component-scoped Less for pixel-level adjustments only
- Validate against screenshot + run lint/type checks for touched files
```

## Common Pitfalls

- **Overfitting to generated code**: treat it as structural hints; screenshot wins.
- **Global CSS overrides**: avoid `:global(.ant-...)` unless necessary; keep styles local.
- **No long-text handling**: ensure help text and results don’t break layout.
- **Hardcoding time-sensitive assets**: MCP asset URLs expire; don’t depend on them long-term.

## Optional: supporting files

- For team-readable guidance, create/extend docs under `docs/` (short, actionable, indexed in `docs/README.md`).
