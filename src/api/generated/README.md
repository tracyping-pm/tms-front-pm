# 由 OpenAPI 生成的类型

- 来源：`openapi/tms.openapi.json`、`openapi/uam.openapi.json`（或 pull 脚本写入的同名文件）。
- 命令：`pnpm openapi:generate`
- **请勿手改** `*-paths.d.ts`；需要调整时改 spec 后重新生成。

业务代码中推荐：

- `import type { operations, components } from '@/api/generated/tms-paths'`
- 配合 `@/api/types/openapi-bridge` 中的 `ApiJsonPromiseFromOp`、`UnwrapApiEnvelope` 等与 `RequestPromise` / `PaginationResponse` 对齐。
