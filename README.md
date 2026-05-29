# README

项目使用`@umijs/max` 搭建，更多功能参考文档 [Umi Max 简介](https://umijs.org/docs/max/introduce)

## 项目结构

更多的目录结构及其功能参考文档 [Umi Max 目录结构](https://umijs.org/docs/guides/directory-structure)

```bash

├── config          # 项目配置文件，dev、test、prod为部署配置，local为本地配置
  ├── config.test.ts     # 部署测试环境配置文件
  ├── config.dev.ts      # 部署开发环境配置文件
  ├── config.prod.ts     # 部署生产环境配置文件
  ├── config.ts     # 本地开发环境配置文件
  ├── routes.tsx     # 项目页面路由配置文件
  └── proxy.ts     # 本地开发接口代理

├── public          # 存放固定的静态资源，构建后会被拷贝到输出文件夹

├── src             # 项目主要文件目录
  ├── api        # 项目业务接口请求
  ├── assets        # 项目静态资源目录
  ├── components    # 项目公共组件目录
  ├── constants     # 项目公共常量目录
  ├── models        # 项目全局共享数据目录
  ├── pages         # 项目路由页面目录
  ├── services      # 项目服务请求目录
  ├── utils         # 项目公共方法目录
  ├── access.ts     # 项目权限管理文件
  ├── app.ts        # 项目运行时配置文件
  ├── global.les    # 项目全局通用样式文件
  ├── overrides.les    # 高优先级全局样式文件。
  └── loading.tsx   # 项目全局加载组件

├── env.[type].ts     # 环境变量文件
├── legacy.d.ts     # 全局变量声明文件
├── package.json    # 项目依赖和脚本命令
└── README.md       # 项目开发简介
```

## permission

项目权限分为路由权限和操作权限，权限配置的页面路由地址是：PATHS.DEPARTMENT，即 /permission/department。

### 查看当前权限

想知道当前自己的权限list，有2种方式可以查看：

1. 通过 getUserInfo 接口返回的字段 elementNameList
2. 通过界面 /permission/department 下面的权限配置按钮修改自己的权限；

### 权限控制

前端会根据 elementNameList 返回的权限列表往 src/access.ts 文件注入全局状态，并同时维护 src/enums/permission.ts 文件里的枚举。

1. 控制路由权限（页面、菜单权限），需要在 config/routes.tsx 的路由配置添加 access 关键字。
2. 控制操作权限，需要在具体操作下通过 useAccess hook 来控制具体的业务操作，也可以用 Access 组件包裹来控制：

```jsx
// import { Access, useAccess } from '@umijs/max';

// ...

// const access = useAccess();

// <Access accessible={access[PermissionEnum.CUSTOMER_CONTACT_CHANGE]}>
// <Button>Edit Contact</Button>
// </Access>

// or

// access[PermissionEnum.CUSTOMER_CONTACT_CHANGE] && <Button>Edit Contact</Button>
```

## 本地启动（Demo 演示模式）

TMS 和 VP 两个项目需要**同时启动**，数据才能互通。两者对外统一暴露在 `localhost:8000`，共享同一个 localStorage，状态变更实时同步。

**端口分工：**
- TMS 直接监听 **8000**
- VP 监听 **8001**，TMS 通过 proxy 将 `/vp/*` 转发到 8001，浏览器侧统一走 8000

### 前置要求

- Node.js ≥ 18
- pnpm（如未安装：`npm install -g pnpm`）

### 第一步：启动 TMS（主系统）

```bash
# 在 tms_frontend-main 目录下
pnpm install
pnpm start:dev     # 监听 http://localhost:8000
```

### 第二步：启动 VP（供应商门户）

```bash
# 在 vp_frontend-main 目录下
pnpm install
npm run start:tms-proxy   # 监听 http://localhost:8001，通过 TMS proxy 对外
```

> VP 使用 `start:tms-proxy` 脚本运行在 8001 端口，TMS 的 proxy 配置（`config/proxy.ts`）将 `/vp/` 路径转发到 8001，确保两者共享同一个 `localhost:8000` origin，localStorage 数据互通。

### 演示入口

| 系统 | 地址 |
|------|------|
| TMS（内部操作侧） | http://localhost:8000/home |
| VP（供应商侧） | http://localhost:8000/vp/home |

### 数据流转说明

两个项目通过 `localStorage` 同步以下数据：

- **AP Statement**：VP 创建并提交 → TMS 审核、比对、创建 RFP → VP 查看状态更新
- **Advance Payment**：VP 发起申请 → TMS 审批 → VP 查看结果
- **Claim Tickets**：TMS 侧发起 → VP 确认或 Dispute

本地启动无需登录，直接访问即可。

---

## Environment Prepare

Install `node_modules`:

```bash
pnpm install
```

## Provided Scripts

### Start project

```bash
pnpm start:dev
```

### Build project

```bash
pnpm build:dev
```

### Check code style

```bash
pnpm lint
```

### Check ts style

```bash
pnpm tsc
```
