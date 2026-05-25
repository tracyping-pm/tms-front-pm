---
name: page-permission-workflow
description: >-
  Adds or updates TMS frontend page/feature permission points: PermissionEnum in src/enums/permission.ts, matching entries in src/access.ts, route access in config/routes.tsx, aligned with UAM user info elementNameList. Use when adding menu routes, access-controlled pages, PermissionEnum values, access.ts rules, routes access fields, or when the user mentions 权限点, permission point, elementNameList, or UAM page permissions.
---

# 页面 / 功能权限点工作流（tms_frontend）

## 数据流（必读）

1. **UAM** 接口 `getUserInfo`（`src/api-uam/common.ts` → `/uam-api/user/info`）返回 **`UserInfo.elementNameList: string[]`**（见 `typings.d.ts`）。
2. `src/app.tsx` 中 `getInitialState` → `fetchUserInfo` → `buildCurrentInfo(res.data)` 将用户信息放入 **`initialState.currentUser`**，`elementNameList` **原样透传**，**无需**为每个新权限点在 `app.tsx` 里增删代码。
3. **`src/access.ts`** 以 `initialState.currentUser.elementNameList` 为数据源，把每个 **`PermissionEnum` 枚举值（字符串）** 映射为布尔：`permission?.includes(PermissionEnum.XXX)`。
4. **路由** `config/routes.tsx` 的 `access: PermissionEnum.XXX` 与 Umi **Access** 插件配合，无权限则不可进入对应路由。
5. 页面内细粒度按钮/区块：使用 **`useAccess()`** 或 **`<Access>`**（`@umijs/max`），键名与 `access.ts` 返回的字段一致（即 `PermissionEnum` 成员名在运行时的 key）。

**约定**：`PermissionEnum` 的 **字符串值**（如 `'claimTickets'`）必须与 **UAM/后端配置的权限码** 一致，且需出现在对应角色的 **`elementNameList`** 中，前端校验才会为 `true`。新增权限通常需要 **后端/UAM 同步配置**；本技能侧重 **前端三处代码** 与 **插入位置**。

---

## 修改顺序（推荐）

按同一 **业务模块 / 页面层级** 在下列三处 **同步、相邻插入**，保持与兄弟权限点一致顺序；**禁止**在文件末尾或无关区域随手追加一行。

| 顺序 | 文件 | 做什么 |
| --- | --- | --- |
| 1 | `src/enums/permission.ts` | 在对应 `// ... --start--` / `--end--` 区块内新增 `ENUM_NAME = 'backendCode'` |
| 2 | `src/access.ts` | 在同一业务分组注释下新增 `[PermissionEnum.XXX]: permission?.includes(PermissionEnum.XXX)`（多行格式与相邻项一致） |
| 3 | `config/routes.tsx` | 在同级 `routes` 数组里，把新路由 `access` 写在 **同一模块相邻路由** 旁，**不要**丢到文件底部 |

若仅重命名或废弃权限：三处同步改名/删除；并确认 UAM 与产品是否仍下发旧码。

---

## 放置规则（重要）

- **对齐「兄弟」权限**：先全文搜索目标模块（如 `CLAIM_TICKETS`、`Project`）在 `permission.ts`、`access.ts`、`routes.tsx` 中的现有条目，**紧挨相关页面/父级菜单** 插入新枚举、新 `access` 映射、新路由项。
- **禁止**：在 `permission.ts` / `access.ts` 末尾、`routes` 数组末尾单独 `append` 新权限（除非该模块本身就在文件末尾且无更近邻）。
- **区块注释**：`permission.ts` 内已有 `🚀🚀🚀 --start--` / `--end--` 分区时，新枚举留在对应分区内；不要随意新开分区除非新业务域。
- **格式**：与相邻项保持相同缩进、换行风格（单行 vs 多行 `permission?.includes`）和逗号位置。

---

## `config/routes.tsx` 要点

- 已 `import { PermissionEnum } from '../src/enums/permission'`。
- 需要权限的路由设置 **`access: PermissionEnum.XXX`**；与菜单层级一致时，父级 layout 路由与子路由可分别绑定不同 `PermissionEnum`（见现有 Customer / Project 等结构）。
- 新增 `path` / `component` 后，将 **`access` 与相邻同类路由写在一起**，便于 diff 与评审。

---

## 页面内使用（可选）

- `const access = useAccess();` → `access[PermissionEnum.XXX]` 控制按钮或 Tab。
- 或 `<Access accessible={access[PermissionEnum.XXX]}>...</Access>`。

仅路由级控制时可不写页面内判断；需要 **隐藏按钮** 时必须加。

---

## 自检清单

- [ ] `PermissionEnum` 字符串与 UAM/产品文档中的 **权限码** 一致。
- [ ] `access.ts` 中已为该枚举增加 **`includes`** 映射。
- [ ] `routes.tsx` 中对应路由已设置 **`access`**，且位置与模块结构相邻。
- [ ] 三处修改 **顺序与分组** 一致，无孤立在文件末尾的新行。
- [ ] 如需按钮级控制，页面已接 **`useAccess` / `Access`**。
- [ ] 后端/UAM 已配置该权限并下发到 **`elementNameList`**（否则前端永远为 `false`）。

---

## 与 `app.tsx` 的关系

- **不要**在 `app.tsx` 为每个权限增加列表或分支；权限来源是 **`getUserInfo` 返回数据中的 `elementNameList`**。
- 若类型变化（极少见），才需改 **`typings.d.ts`** 中 `UserInfo`；一般仅改 `permission.ts` + `access.ts` + `routes.tsx`。
