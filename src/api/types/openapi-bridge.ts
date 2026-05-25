/**
 * 把 OpenAPI 生成类型（`src/api/generated/*-paths.d.ts`）接到现有请求约定上。
 *
 * 全局约定（`typings.d.ts`）：
 * - `APIJSON<T>`：`{ code; msg; data: T }`，与 `@umijs/max` 的 `request` 一致。
 * - `PaginationResponse<T>`：分页时 **`data` 的内层** 常用形状（`list`、`pageNum`、`pageSize`、`total` 等）。
 *
 * SpringDoc 常见两种描述方式：
 * 1. 只描述 **内层 `data`** → 手写返回类型用 `RequestPromise<ThatDto>`（与现有一致）。
 * 2. 描述 **整包 `{ code, msg, data }`** → 用 `UnwrapApiEnvelope` 取出 `T` 再套 `RequestPromise<T>`，
 *    或用 `ApiJsonPromiseFromOp` 一次性得到 `Promise<APIJSON<…>>`。
 *
 * 分页：若文档里是 Spring `Page`（`content`、`totalElements`），与全局 `PaginationResponse` 不一致时，
 * 优先在后端用 DTO/`@Schema` 对齐运行时 JSON；否则在前端做一层字段映射。
 */

/** OpenAPI `operations['someOp']` 上 200 + application/json 的 body 类型 */
export type OpenApiResponseJson200<Op extends { responses?: object }> =
  Op extends {
    responses: {
      200: { content: { 'application/json': infer Body } };
    };
  }
    ? Body
    : never;

/**
 * 若 body 含 `data`，视为整包 envelope，取出内层；否则视为已是 `data` 载荷。
 * 用于把情况 2 规范到与 `RequestPromise<T>` / `APIJSON<T>` 一致。
 */
export type UnwrapApiEnvelope<T> = T extends { data: infer D } ? D : T;

/** 由单个 operation 推断 `request()` 的 Promise 类型（内层为 `data` 类型） */
export type ApiJsonPromiseFromOp<Op extends { responses?: object }> = Promise<
  APIJSON<UnwrapApiEnvelope<OpenApiResponseJson200<Op>>>
>;

/** 显式标注「spec 里的就是 `APIJSON.data`」 */
export type ApiJsonData<T> = T;

/** 与手写 `RequestPromise` 同义，便于在领域类型旁注释来源 */
export type ApiJsonPromise<T> = Promise<APIJSON<T>>;

/**
 * 分页内层：与全局 `PaginationResponse<Item>` 一致。
 * 生成 schema 里 `list` 的 item 类型即列表元素类型。
 */
export type PaginatedRows<Item> = PaginationResponse<Item>;
