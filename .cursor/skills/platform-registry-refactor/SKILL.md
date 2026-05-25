---
name: platform-registry-refactor
description: >-
  Refactors TMS/WMS/HR/UAM frontend projects to use a centralized UAM platform registry API instead of hardcoding per-platform URLs in application code. Use when adding new platforms, modifying cross-platform redirects (login, role switch, 401/403/808/815), updating docker-entrypoint.sh / config.js / runtime-env.ts / constants/uam.ts, or when the user mentions platform registry, 平台注册, service discovery, or "新增平台".
---

# Platform Registry Refactor

将业务代码里硬编码的平台地址（如 `ENUM_BU_TYPE_PORT`、`UAM_SYSTEM_ORIGIN_MAP`）改为：**运行时**从 UAM 后端 `POST /auth/bu-origin-url` 拉取平台列表；**部署侧**仍用现有 Docker + `APP_ENV` + `runtime-env.defaults.sh` 注入静态 fallback（`window.ENV` 中的 `XXX_ORIGIN`），**不在容器内**用 `curl`/`jq` 调注册表。

---

## 设计原则

| 原则 | 说明 |
| --- | --- |
| Single Source of Truth（业务） | 各 BU 的 `code` + `origin` 以 UAM 后端返回为准 |
| Runtime-first（浏览器） | `getInitialState` 中请求一次 `getBuOriginUrl` → 写入 `constants/uam.ts` 内注册表状态（函数式，无独立 `services/platform-registry.ts`） |
| Build Once, Deploy Everywhere | CI 一次 `pnpm build:once`，分环境只改部署参数（`APP_ENV` 等），不重打前端包 |
| Open/Closed | 新增平台 = UAM 加记录；前端业务代码不穷举改配置 |
| **分层数据源** | **构建期**：仓库 `.env.*.ts` 仅向生成器提供 **`TMS_ORIGIN` + `UAM_ORIGIN`**（供 `runtime-env.defaults.sh` / nginx 推导 `API_UPSTREAM`、`UAM_API_UPSTREAM`，与 entrypoint 一致）。**运行时**：各 BU 跳转以 `POST /auth/bu-origin-url` + `setBuOriginUrls` 为准；`getOrigin` / `getUamUrl` 优先 Map，失败再读 `window.ENV`。**本地**：`public/config.js` 可保留 **全量** `WMS`/`HR`/端口，供 `isLocalhost()` 分支与 proxy 对齐；与生产镜像「最小双 origin」不冲突。 |
| 本地与线上分离 | 本地：`APP_ENV` + `proxy.ts`；线上：`APP_ENV` + nginx upstream + `config.js` |
| **CI/CD 尽量维持现状** | 镜像内 **不装 `jq`**；entrypoint **不 `curl` 注册表**；仍用 `runtime-env.defaults.sh` + `envsubst` + 写 `config.js` |

---

## CI/CD 与镜像约束（与现网流程对齐）

以下为**推荐基准**，与当前 TMS `Dockerfile` / `docker/docker-entrypoint.sh` 一致：

| 项 | 做法 |
| --- | --- |
| 构建 | `pnpm run generate:runtime-env-defaults && pnpm run build` → `dist/` |
| 运行镜像 | `nginx:alpine` + **`gettext`（`envsubst`）**，**不**安装 `jq` |
| 容器启动 | `docker-entrypoint.sh`：`APP_ENV` → `source runtime-env.defaults.sh` → 推导 `API_UPSTREAM` / `UAM_API_UPSTREAM`（可由编排覆盖）→ `envsubst` nginx 模板 → **heredoc 写** `/usr/share/nginx/html/config.js` |
| **禁止** | 在 entrypoint 内 `curl` UAM 拉注册表、用 `jq` 解析 JSON 写入 `config.js`（增加失败面、镜像依赖、与「构建期已生成 defaults」重复） |

**运维注入**：部署时传 `-e APP_ENV=prod`，必要时传 `-e API_UPSTREAM=...`、`-e UAM_API_UPSTREAM=...` 覆盖；与现有 K8s/Docker 习惯一致。

**平台列表从哪来**：浏览器经 nginx 反代访问 `POST /uam-api/auth/bu-origin-url`；若接口失败，`getOrigin` / `getUamUrl` **fallback 到 `window.ENV`（entrypoint 写入的 `UAM_ORIGIN` 等）**，保证登录跳转仍可用。

---

## Architecture

### 两种运行模式

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  模式 1: 本地开发 (pnpm start:*)                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Browser → Umi devServer proxy → TMS / UAM 后端                               │
│  proxy：`APP_ENV` + `config/proxy.ts`（+ 可选 `proxy.local.ts` 按路由合并覆盖）  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│  模式 2: CI/CD 部署（保持现有形态）                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  CI: pnpm build:once → Docker build → 镜像含 dist/ + runtime-env.defaults.sh │
│  CD: 部署时 APP_ENV=dev|test|uat|rc|prod（+ 可选上游覆盖 env）              │
│  容器: entrypoint 仅 shell + envsubst — 无 curl / 无 jq                      │
│  浏览器: /api、/uam-api → nginx upstream；平台列表 → POST /uam-api/.../bu-origin-url │
└─────────────────────────────────────────────────────────────────────────────┘
```

**关键点**：

- **本地**：proxy 决定后端地址；`public/config.js` 手工或与团队约定的方式维护，与 `APP_ENV` 一致的 `window.ENV` fallback。
- **线上**：`APP_ENV` + `runtime-env.defaults.sh` 提供各 `XXX_ORIGIN`；nginx 负责 API 反代。
- **注册表**：仅浏览器运行时请求；**不作为容器启动依赖**。

---

## UAM Backend API Contract

> 以 OpenAPI 为准：`src/api/generated/uam-paths.d.ts` — `getBuOriginUrl`

```
POST /auth/bu-origin-url
Authorization: none (public)
Request body: none

Response 200:
{
  "code": 200,
  "data": [
    { "code": "UAM", "origin": "https://dev.hades.inteluck.com" },
    { "code": "TMS", "origin": "https://dev.gaia.inteluck.com" }
  ],
  "msg": "success",
  "traceId": "..."
}
```

前端请求路径经 proxy/nginx 为 **`/uam-api/auth/bu-origin-url`**（`pathRewrite` 将 `/uam-api` → 后端 `/api` 时按实际网关调整）。

**要点**：

- `data` 为 **数组** `BuOriginUrlVo[]`（不是 `{ platforms: [...] }` 包装，除非后端约定变更）
- **无需 `port`**：非本机当前项目一律用 `origin`；本机当前项目用 `location.origin`（含端口）

---

## Key File Changes（各前端项目）

### 1. `src/api-uam/common.ts` — `getBuOriginUrl`

```typescript
export async function getBuOriginUrl(): Promise<BuOriginUrlVo[]> {
  const res = await request<{ code?: number; data?: BuOriginUrlVo[] }>(
    '/uam-api/auth/bu-origin-url',
    { method: 'POST', skipErrorHandler: true },
  );
  return res?.data ?? [];
}
```

### 2. `src/constants/uam.ts` — 函数式注册表（**不**新增 `src/services/platform-registry.ts`）

- 用**函数 + 模块级闭包状态**（如模块内 `Map` + `setBuOriginUrls(list)` / `getOrigin` / `getUamUrl`），避免单独 service 文件与 OOP 封装。
- `getOrigin`：优先 API 写入的 Map；失败或未命中时用 `runtimeEnv`（`src/runtime-env.ts` / `window.ENV`）与 Skill 约定的本机兜底。
- 删除 `ENUM_BU_TYPE_PORT`、`UAM_SYSTEM_ORIGIN_MAP` 等硬编码端口映射。

### 3. `src/app.tsx` — `getInitialState`

先 `getBuOriginUrl` → `setBuOriginUrls`（或等价命名），再 `fetchUserInfo`；catch 中 `console.warn`，不阻塞。

### 4. `config/proxy.ts` / `proxy.local.ts`

按环境生成 upstream；`proxy.local.ts` 仅**按路由**覆盖默认 target（避免整段 env 被覆盖导致 `/uam-api` 丢失）。详见仓库 `config/proxy.ts`。

### 5. `package.json`

`start:*` 设置 `APP_ENV`；本地 `public/config.js` 与 proxy 对齐需自行维护（仓库无自动生成脚本）。

---

## Docker / 前端静态配置（不增加 jq）

| 文件 | 职责 |
| --- | --- |
| `docker/docker-entrypoint.sh` | `APP_ENV`、`source runtime-env.defaults.sh`、写 `config.js`、**无 curl/jq**；由 origin 推导 `API_UPSTREAM` / `UAM_API_UPSTREAM`（可被编排覆盖） |
| `docker/runtime-env.defaults.sh` | 由 `scripts/generate-runtime-env-defaults.ts` **仅从** `.env.*.ts` 抽取 **`TMS_ORIGIN`、`UAM_ORIGIN`** 写入各 `case`（收窄后的最小集） |
| `Dockerfile` | `apk add gettext`；**不要**为注册表加 `jq` |
| `public/config.js` | **仅本地**：可含完整 `WMS`/`HR`/端口；**Docker** 由 entrypoint 覆盖，镜像内 `WMS`/`HR` 等可为空；非 localhost 下 **`getBuOriginUrl` 成功则走注册表**，`window.ENV` 中对应字段为空为预期 |

**与注册表的关系**：`WMS`、`HR` 等平台 origin **以运行时** `POST /auth/bu-origin-url` 为主；容器 `config.js` 不要求预填全平台 URL。

---

## 本地开发：跨域登录与 token

本地多端口时，UAM 可约定重定向回 TMS 时携带 **token**（query 或 hash，参数名需与 UAM 契约一致，如 `token` / `access_token` / `code` 换票）。

**前端**（宜在 `getInitialState` 之前或 `app.tsx` 极早执行）：`isLocalhost()` 时从 URL 解析 token → `Cookie.set(TOKEN_KEY, …)`（与 `src/constants/index.ts` 一致）→ `history.replace` / `replaceState` 去掉敏感参数，避免泄露与重复消费、防止登录死循环。UAM 未就绪前可用占位或开关关闭。

**安全**：仅信任约定参数；HTTPS、短 TTL；若改为 `postMessage` 等需单独适配。

---

## 迁移策略

1. **Phase A**：接入 `getBuOriginUrl` + `constants/uam.ts` 内函数式注册表 + 业务改用 `getUamUrl` / `getOrigin`。
2. **Phase B**：清理 `.env.*.ts` 中不再需要的 define（若与 config 策略一致）。
3. **CI/CD**：保持 `build:once` → 同一镜像 → 多环境部署；**不**引入容器内注册表拉取。

---

## Verification Checklist

### 本地

- [ ] `APP_ENV` 切换后 proxy 与 `public/config.js` 一致
- [ ] `getBuOriginUrl` 成功 → 角色切换/跳转使用 API 数据
- [ ] API 失败 → fallback `window.ENV` 仍可登录/跳转
- [ ] （token 联调后）UAM 带 token 回跳 → Cookie 有值、地址栏已清理、无登录循环

### CI/CD（现状）

- [ ] `pnpm run generate:runtime-env-defaults` 成功；`runtime-env.defaults.sh` 各 `case` 仅为 **`TMS_ORIGIN` / `UAM_ORIGIN`**（或与团队约定的收窄字段）
- [ ] 镜像内 **无 `jq`**
- [ ] entrypoint **无 `curl` 注册表**
- [ ] `docker run -e APP_ENV=prod`（+ 可选 `API_UPSTREAM` / `UAM_API_UPSTREAM`）行为与改造前一致；容器内 `config.js` 中 **upstream 由 entrypoint 从 origin 推导正确**

### 浏览器（非 localhost）

- [ ] `getBuOriginUrl` 成功后切角色/跨平台跳转走注册表；失败时 `getOrigin` / `getUamUrl` 仍能从 `TMS`/`UAM` 的 `window.ENV` 兜底

### 平台 Registry

- [ ] UAM 新增 BU 记录后，刷新页面即可（无需改镜像、无需容器重启拉配置）
