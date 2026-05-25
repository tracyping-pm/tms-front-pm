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

## Environment Prepare

Install `node_modules`:

```bash
pnpm install
```

or

```bash
yarn
```

## Provided Scripts

Ant Design Pro provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

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
