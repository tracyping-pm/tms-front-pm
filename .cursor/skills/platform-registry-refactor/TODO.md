# Platform Registry Refactor — TODO

业务侧：运行时从 UAM `POST /auth/bu-origin-url` 获取平台列表；部署侧：**保持现有 CI/CD**（不引入镜像 `jq`、不在容器内 `curl` 注册表）。详细设计见 [SKILL.md](./SKILL.md)。

---

## Phase 0: UAM 后端（前置依赖）

- [ ] **0.1** 确认公开接口 `POST /auth/bu-origin-url` 已就绪（OpenAPI / 联调）
- [ ] **0.2** 各环境经 `/uam-api/` 可达（本地 proxy、线上 nginx upstream）

---

## Phase 1: 前端运行时（TMS 先行）

- [ ] **1.1** `src/api-uam/common.ts` — `getBuOriginUrl()` → `POST /uam-api/auth/bu-origin-url`
- [ ] **1.2** `src/constants/uam.ts` — **不**新增 `services/platform-registry.ts`；用函数 + 模块级状态实现 `setBuOriginUrls` / `getOrigin` / `getUamUrl`；删除 `ENUM_BU_TYPE_PORT` 等硬编码
- [ ] **1.3** `src/app.tsx` — `getInitialState` 中先 `getBuOriginUrl` → `setBuOriginUrls` 再 `fetchUserInfo`；失败不阻塞
- [ ] **1.4** `src/runtime-env.ts` — 与 `public/config.js` / entrypoint 输出字段一致（`APP_ENV`、`XXX_ORIGIN`、端口等），供 `getOrigin` fallback

---

## Phase 2: 本地构建与 proxy（TMS 先行）

- [ ] **2.1** `.env.*.ts` — 编译期常量（如地图 Key）照旧；**面向 Docker 生成器**时仅维护 **`TMS_ORIGIN`、`UAM_ORIGIN`**（供 `generate:runtime-env-defaults` → `runtime-env.defaults.sh`），与 Umi `define` 策略分开（不把多余 URL 打进包若已约定）
- [ ] **2.2** `config/config.ts` — `define` 与运行时注入策略一致（避免把环境 URL 打进包）
- [ ] **2.3** `public/config.js` — **本地**可保留 **全量** `WMS`/`HR`/端口，与 `APP_ENV` 对齐；**与** 镜像内 entrypoint 写出的最小 `config.js` **区分**：生产构建不依赖本地全量文件内容进镜像
- [ ] **2.4** `config/proxy.ts` — 按 `APP_ENV` 生成 target；`proxy.local.ts` 仅路由级覆盖
- [ ] **2.5** `package.json` — `start:*` 设置 `APP_ENV`
- [ ] **2.6** UAM 与前端约定 **localhost 回跳 token**（参数名、换票与否）；TMS 在首屏消费 query/hash → `TOKEN_KEY` Cookie → 清理 URL；手测或 E2E：回跳后已登录、无死循环

---

## Phase 3: Docker / CI/CD — **维持现状，不增加 jq**

> **禁止**：在 `docker-entrypoint.sh` 内 `curl` UAM + `jq` 解析写 `config.js`（不变）。  
> **保持**：`runtime-env.defaults.sh` + shell/heredoc + `envsubst`。

- [ ] **3.1** 确认 `Dockerfile` 仅 `apk add gettext`（或项目既定依赖），**不**添加 `jq`
- [ ] **3.2** 确认 `docker-entrypoint.sh`：**无** `curl` 注册表、**无** `jq`；流程为 `source runtime-env.defaults.sh` → 推导 upstream → 写 `config.js` → `envsubst`
- [ ] **3.3** 保持 `pnpm run generate:runtime-env-defaults` 在 **build 阶段**生成 `docker/runtime-env.defaults.sh`（随镜像发布）；生成器 **输出已收窄** 时，各 `case` 以 **`TMS_ORIGIN` / `UAM_ORIGIN`** 为主（提交更新后的 `runtime-env.defaults.sh`）；**不**因此引入容器内 `curl` 注册表
- [ ] **3.4** 运维文档：部署仍通过 `APP_ENV` + 可选 `API_UPSTREAM` / `UAM_API_UPSTREAM` 注入（与现网一致）

---

## Phase 4: 业务代码替换（TMS 先行）

- [ ] **4.1** `src/app.tsx` — 401/403/808/815 与 `onPageChange` 使用 `getUamUrl`
- [ ] **4.2** `AvatarDropdown.tsx` — 登出 / 切角色
- [ ] **4.3** `OssUpload/index.tsx` — callback 等使用 `getOrigin('UAM')` 或等价
- [ ] **4.4** `src/enums/uam.ts` — 保留 `BU_TYPE_ENUM`、主题色等 UI 枚举

---

## Phase 5: 验证（TMS）

- [ ] **5.1** 本地：`start:dev` / `start:test` / `start:uat` — proxy + 注册表 + fallback
- [ ] **5.2** `proxy.local.ts` — 仅覆盖声明的路由，未覆盖路由仍走默认远程
- [ ] **5.3** Docker 构建产物：`docker build` 成功；`generate:runtime-env-defaults` 成功；`runtime-env.defaults.sh` 与收窄后的 env 一致；镜像内 `which jq` 应失败（无 jq）
- [ ] **5.4** 容器启动：`APP_ENV=prod`（或 test）时 `config.js` 含预期 `APP_ENV` 与 `TMS`/`UAM` 相关字段；`API_UPSTREAM` / `UAM_API_UPSTREAM` 由 entrypoint 推导正确；**无**启动时网络依赖注册表
- [ ] **5.5** 线上冒烟：登录、登出、切角色、OSS 回调 URL
- [ ] **5.6** 非 localhost：`getBuOriginUrl` 成功后跳转走注册表；失败时 `window.ENV` 兜底仍可用
- [ ] **5.7** （与 **2.6** 联调）本地 token 回跳：Cookie 写入、URL 清理、无登录循环（手测步骤见 SKILL「验证清单」）

---

## Phase 6: 推广到其他项目

- [ ] **6.1** WMS — `CURRENT_PLATFORM = 'WMS'`
- [ ] **6.2** HR — `CURRENT_PLATFORM = 'HR'`
- [ ] **6.3** UAM — `CURRENT_PLATFORM = 'UAM'`

---

## Phase 7: 新增平台验收

- [ ] **7.1** UAM 增加新 BU（如 SCM）
- [ ] **7.2** 前端刷新后 `getBuOriginUrl` 能拿到新 `origin`（无需改 Docker 镜像重发即可验证业务；若缓存需刷新）
