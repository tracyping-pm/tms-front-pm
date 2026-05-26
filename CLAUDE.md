# TMS Frontend - Agent 工作指南

本项目是 Inteluck TMS 系统的前端工程，Agent 在此项目中协助进行页面开发、组件修改和 UI 调整。

## 技术栈

| 项目 | 技术 |
|------|------|
| 框架 | UmiJS Max (`@umijs/max`) |
| UI 库 | Ant Design 5 + Pro Components |
| 样式 | Less（非 Tailwind） |
| 状态管理 | UmiJS 内置 (dva/model) |
| 包管理器 | pnpm |
| TypeScript | 严格模式 |
| Lint | ESLint + Prettier + Stylelint + Husky |

## 项目结构

```
├── config/
│   ├── routes.tsx          # 路由配置
│   ├── config.ts           # Umi 配置
│   ├── defaultSettings.ts  # ProLayout 默认设置
│   └── proxy.ts            # 代理配置
├── src/
│   ├── pages/              # 页面目录（按业务模块划分）
│   │   ├── billing/        # 账单模块
│   │   ├── customer/       # 客户管理
│   │   ├── vendor/         # 供应商管理
│   │   ├── waybill/        # 运单管理
│   │   ├── project/        # 项目管理
│   │   └── ...
│   ├── components/         # 公共组件
│   ├── api/                # API 请求层
│   ├── services/           # 服务层
│   ├── models/             # 数据模型
│   ├── hooks/              # 自定义 Hooks
│   ├── constants/          # 常量定义
│   ├── enums/              # 枚举定义
│   ├── locales/            # 国际化
│   ├── theme/              # 主题配置
│   │   └── themeConfig.ts  # Antd 主题 Token（主色 #009688）
│   ├── utils/              # 工具函数
│   └── assets/             # 静态资源
├── docs/                   # 技术文档
└── openapi/                # OpenAPI 规范文件
```

## 工作流程

### 场景 1：修改现有页面 / 组件

| 步骤 | 说明 |
|------|------|
| ① 理解现状 | 阅读目标页面/组件代码，理解现有结构、样式、数据流 |
| ② 需求对齐 | 确认修改范围，明确不应破坏的现有功能 |
| ③ 实施修改 | 在现有代码基础上修改，遵循项目已有的代码风格 |
| ④ 验证 | 确保 TypeScript 编译通过，无 lint 错误 |

### 场景 2：新建页面 / 组件

| 步骤 | 说明 |
|------|------|
| ① 阅读参考 | 查看同模块下已有页面的实现方式作为参考 |
| ② 需求对齐 | 确认页面功能、路由路径、权限要求 |
| ③ 开发 | 创建页面文件，注册路由，实现功能 |
| ④ 验证 | TypeScript 编译 + lint 检查 |

## 核心规范

### 1. 样式规范

- **使用 Less**，不使用 Tailwind CSS 或内联样式
- 样式文件与组件同目录，命名为 `index.less`
- 使用 CSS Modules（`:global` 仅在必要时使用）
- 主题色和设计 Token 通过 `src/theme/themeConfig.ts` 统一管理
- 使用 antd 组件的内置 token 系统，避免硬编码颜色值

### 2. 组件规范

- 优先使用 Ant Design / Pro Components 的组件
- 公共组件放 `src/components/`，页面私有组件放 `src/pages/<module>/components/`
- 使用 TypeScript 定义 Props 接口
- 遵循现有组件的命名风格（PascalCase 目录名）

### 3. 路由与权限

- 路由在 `config/routes.tsx` 中配置
- 权限通过 `PermissionEnum` 枚举控制（`src/enums/permission.ts`）
- 新页面必须配置对应的 `access` 权限

### 4. API 与数据

- API 请求层在 `src/api/` 或 `src/services/`
- OpenAPI 类型定义在 `src/api/generated/`
- 使用 `ahooks` 的 `useRequest` 等 hooks 管理请求状态

### 5. Git 工作流

- 功能开发在独立分支上进行
- 提交前确保通过 lint 和 TypeScript 检查
- 不直接修改 `main` 分支

## 重要原则

1. **不破坏现有功能** — 修改前必须理解上下文，修改后确认无回归
2. **遵循现有模式** — 参考同模块已有代码的风格和模式，保持一致性
3. **用户不懂开发** — 用户无法执行 CLI 命令，所有技术操作由 Agent 完成
4. **最小改动原则** — 只修改需求涉及的部分，不做额外重构
5. **主题一致性** — 使用 `src/theme/themeConfig.ts` 中定义的设计 Token，确保视觉一致

## 常用命令

```bash
# 启动开发服务器
pnpm start:dev

# TypeScript 类型检查
pnpm tsc

# Lint 检查
pnpm lint

# 构建
pnpm build
```
