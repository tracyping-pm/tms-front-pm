---
name: openapi-typescript-workflow
description: >-
  Maintains TMS/UAM frontend API types from Spring OpenAPI 3 specs using openapi-typescript, dotenv-loaded .env.local, and src/api/types/openapi-bridge. Use when adding or changing API typings, running openapi:generate or openapi:pull:generate, wiring request() to operations or components schemas, aligning RequestPromise/APIJSON/PaginationResponse with CommonResponse DTOs, or when the user mentions OpenAPI, SpringDoc, swagger, tms-paths.d.ts, or uam-paths.d.ts.
---

# OpenAPI → TypeScript Workflow（tms_frontend）

## 技术栈与约定

- **HTTP**：`@umijs/max` 的 `request`（见各 `src/api/*.ts`）。
- **全局类型**（`typings.d.ts`）：`APIJSON<T>`、`PaginationResponse<T>`、`RequestPromise<T>`（即 `Promise<APIJSON<T>>`）。
- **Spec 来源**：Java **SpringDoc**（`springdoc-openapi-starter-webmvc-ui`），JSON 一般为 **`/v3/api-docs`**（若 `server.servlet.context-path=/api` 则完整路径常为 `https://host/api/v3/api-docs`）。
- **生成器**：**openapi-typescript** → 只生成类型声明，不生成运行时 client。
- **双服务**：TMS → `openapi/tms.openapi.json` → `src/api/generated/tms-paths.d.ts`；UAM → `openapi/uam.openapi.json` → `src/api/generated/uam-paths.d.ts`。

## 必须遵守

1. **禁止手改** `src/api/generated/*-paths.d.ts`；修改应来自更新后的 `openapi/*.openapi.json` 再执行 `pnpm openapi:generate`。
2. **拉取 + 生成**：`pnpm openapi:pull:generate`（见 `scripts/openapi-pull-and-generate.mjs`）会读取项目根 **`.env.local`** 中的 `OPENAPI_TMS_URL` / `OPENAPI_UAM_URL`（**dotenv**，不覆盖已存在的环境变量）；未设置 URL 时跳过拉取，仅用本地 JSON 生成。
3. 业务里引用生成类型时使用：`import type { operations, components } from '@/api/generated/tms-paths'`（UAM 同理 `uam-paths`）。
4. 与 `RequestPromise` / `APIJSON` 对齐时优先使用 **`@/api/types/openapi-bridge`**（`ApiJsonPromiseFromOp`、`UnwrapApiEnvelope` 等）；若 Spring 文档里 **200 的 content 键为通配符 `*/*`** 而非 `application/json`，`OpenApiResponseJson200` 不适用，应对 `responses[200]['content']['*/*']` 或 `components['schemas'][...]` 显式建模。
5. 筛选条件 / 表单若与某 DTO 一致，可直接用 **`components['schemas']['XxxDto']`** 的字段类型（例如 `WayBillQueryDto['statusList']`），避免 `string[]` 与 OpenAPI **字面量联合**不兼容。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm openapi:generate` | 根据 `openapi/tms.openapi.json`、`openapi/uam.openapi.json` 重写两个 `*-paths.d.ts` |
| `pnpm openapi:pull:generate` | 可选：按 env 拉取 JSON 后执行同上 |

## 实现新接口时的推荐模式

1. 在 spec 中确认 **path、method、operationId、request/response schema**。
2. 在 `src/api/<domain>.ts` 中写 `request(url, { method, data })`；入参/出参类型来自 `operations['operationId']` 或 `components['schemas']`。
3. 若需与旧版手写对比，可保留 `xxx` 与 `xxxFromSpec` 并列，待统一后删除其一。

## 与 `src/enums` 的关系

`src/enums` 多为 **UI 展示**（文案、颜色、选项）。OpenAPI 字段常为 **string literal union**；对接时以 **spec 为准**，必要时在边界做类型断言或让筛选 state 使用 `components['schemas']['WayBillQueryDto']` 等字段类型。

## 参考文档

仓库内完整说明：**`docs/engineering/openapi-typescript-workflow.md`**。简要约定：**`openapi/README.md`**。
