---
name: coding-conventions
description: >-
  Project-level coding conventions for the TMS frontend codebase (React 18 + Umi Max 4 + Ant Design 5 + Less). Use when writing or reviewing React components, hooks, API modules, pages, modals, enums, styles, or any new feature code to ensure consistency with established patterns.
---

# 编码约定（tms_frontend）

本文档记录项目级别的编码约定，所有新增或修改的代码应遵循这些约定。

---

## 技术栈概览

| 层 | 技术 |
| --- | --- |
| 框架 | Umi Max 4（`@umijs/max`） |
| UI | Ant Design 5（新代码直接使用 `antd`；存量代码含 `@ant-design/pro-components`，逐步替换） |
| 语言 | TypeScript 5 + React 18 |
| 样式 | Less（co-located `index.less`），非 CSS Modules |
| 工具库 | `ahooks`、`dayjs`、`lodash`、`classnames`、`bignumber.js` |
| 包管理 | pnpm |
| 代码质量 | ESLint（`@umijs/max/eslint`）、Prettier、Stylelint、Husky + lint-staged |
| 路径别名 | `@/` → `src/` |

---

## 目录结构约定

```
src/
├── api/              # TMS 业务 API（/api/*）
│   ├── types/        # 手写请求/响应 DTO
│   └── generated/    # openapi-typescript 生成的 *-paths.d.ts
├── api-uam/          # UAM API（/uam-api/*）
├── components/       # 全局共享组件
├── constants/        # 常量、路径、正则、表格默认配置
├── context/          # React Context（如 PubSubContext）
├── enums/            # 业务枚举 + 权限枚举
├── hooks/            # 自定义 Hooks
├── models/           # Umi Model（全局共享状态）
├── pages/            # 页面组件（按业务模块分目录）
├── theme/            # 主题配置、Less 变量、字体
├── utils/            # 工具函数
└── app.tsx           # 运行时配置（initialState、layout、request、rootContainer）
```

页面内部结构：

```
pages/<module>/
├── List.tsx 或 index.tsx       # 列表页
├── Detail/index.tsx            # 详情页
├── components/                 # 页面级子组件
│   ├── SomeModal/index.tsx
│   └── SomeModal/index.less
└── store.ts 或 context.ts      # 页面级状态（如有）
```

---

## 组件编写

### 函数组件 + FC 类型

使用 `FC<IProps>` 声明组件，Props 接口以 `I` 前缀命名：

```tsx
import { FC } from 'react';

interface IMyComponent {
  title: string;
  onClose?: () => void;
}

const MyComponent: FC<IMyComponent> = ({ title, onClose }) => {
  return <div>{title}</div>;
};

export default MyComponent;
```

### 导出方式

- **页面组件 / 子组件**：`export default`（一个文件一个组件）。
- **工具函数 / Hooks / API**：`export const` 或 `export function`（命名导出）。
- **枚举 / 类型**：`export enum` / `export interface` / `export type`。

### classnames

样式拼接使用 `classnames`（项目中 import 为 `cls`）：

```tsx
import cls from 'classnames';
import styles from './index.less';

<div className={cls(styles.container, isActive && styles.active)} />;
```

---

## Ant Design 静态方法

使用 `message`、`modal`、`notification` 等 Ant Design 静态方法时，**禁止**直接通过类调用（如 `Modal.confirm()`、`message.success()`），应统一通过 `App.useApp()` Hook 获取实例后使用。

### 正确写法

```tsx
import { App } from 'antd';

const MyComponent = () => {
  const { message, modal } = App.useApp();

  const handleDelete = () => {
    modal.confirm({
      title: 'Confirm',
      content: 'Are you sure?',
      onOk: async () => {
        await deleteItem();
        message.success('Deleted');
      },
    });
  };
};
```

### 禁止写法

```tsx
import { Modal, message } from 'antd';

// ❌ 不要直接使用静态方法
Modal.confirm({ ... });
message.success('...');
```

### 原因

- 直接调用静态方法会脱离 React 上下文，无法消费 `ConfigProvider` 提供的主题、国际化等配置。
- `App.useApp()` 是 Ant Design 5.x 官方推荐方式，确保弹窗/消息与应用主题一致。
- 项目已全面采用此模式，保持一致性。

### 按需解构

只解构实际用到的方法，避免多余引入：

```tsx
const { message } = App.useApp(); // 只需 message
const { modal } = App.useApp(); // 只需 modal
const { message, modal } = App.useApp(); // 两者都需要
```

---

## 列表页（Table）

### 新代码：直接使用 antd `Table`

新增列表页应直接使用 `antd` 的 `Table` 组件，配合 `Form` 实现搜索筛选，不再引入 `@ant-design/pro-components`。

```tsx
import { LAYOUT_HEADER_HEIGHT } from '@/constants';
import { Form, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const ListPage: FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [originData, setOriginData] = useState(DEFAULT_PAGINATION);

  const columns: ColumnsType<IRecord> = [
    { title: 'Name', dataIndex: 'name' },
    // ...
  ];

  return (
    <>
      <Form form={form} layout="inline" onFinish={onSearch}>
        {/* 筛选项 */}
      </Form>
      <Table
        columns={columns}
        dataSource={originData.list}
        loading={loading}
        rowKey="id"
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page, pageSize) => fetchData({ pageNum: page, pageSize }),
        }}
      />
    </>
  );
};
```

### 存量代码：CustomTable（基于 ProTable）

存量列表页使用项目封装的 `CustomTable`（基于 `ProTable`），维护时可沿用，但**新页面不再使用**。

存量代码中常见的 Pro Components 类型（`ActionType`、`ProColumns`、`ProFormInstance`）在维护旧页面时仍可使用，但新代码应使用 antd 原生类型（`ColumnsType`、`FormInstance` 等）。

### 分页

使用 `DEFAULT_PAGINATION`（来自 `@/constants`）初始化，字段为 `list / pageNum / pageSize / total / pages`。

---

## 弹窗（Modal）

### Props 约定

```tsx
interface IMyModal {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void; // 操作成功后的回调（通常用于刷新列表）
  // ...业务 props
}
```

### 常见模式

```tsx
const MyModal: FC<IMyModal> = ({ open, onCancel, onSuccess }) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onOk = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const res = await submitApi(values);
      if (res.code === 200) {
        message.success('Success');
        onSuccess?.();
        onCancel();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Title"
      destroyOnClose
      maskClosable={false}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        ...
      </Form>
    </Modal>
  );
};
```

### 要点

- 使用 `open` prop（非旧版 `visible`）。
- `destroyOnClose` 确保关闭时重置表单状态。
- `maskClosable={false}` 防止误关。
- 表单使用 `Form.useForm()` 配合 `validateFields`。
- 成功后先 `message.success`，再 `onSuccess?.()` 通知父组件刷新，最后 `onCancel()` 关闭。

---

## API 层

### 文件组织

- **TMS API**：`src/api/<domain>.ts`（如 `customer.ts`、`waybill.ts`）。
- **UAM API**：`src/api-uam/<domain>.ts`。
- **DTO 类型**：`src/api/types/<domain>.ts` 或 `src/api-uam/types/<domain>.ts`。
- **生成类型**：`src/api/generated/tms-paths.d.ts`、`uam-paths.d.ts`（由 `openapi-typescript` 生成，勿手动修改）。

### 请求函数签名

```tsx
import { request } from '@umijs/max';
import { RequestPromise } from './types/common';

export const getCustomerList = (
  params: ICustomerListParams,
): RequestPromise<PaginationResponse<ICustomerRecord>> => {
  return request('/api/customer/list', {
    method: 'post',
    data: params,
  });
};
```

### 类型体系

| 类型 | 定义位置 | 说明 |
| --- | --- | --- |
| `APIJSON<T>` | `typings.d.ts`（全局） | `{ code, msg, data: T }` |
| `RequestPromise<T>` | `src/api/types/common.ts` | `Promise<APIJSON<T>>` |
| `PaginationResponse<T>` | `typings.d.ts`（全局） | `{ list, pageNum, pageSize, total, ... }` |

### 约定

- 所有 API 函数使用**命名导出**（`export const`）。
- 返回类型显式标注为 `RequestPromise<T>`，`T` 是 `data` 的类型。
- 列表接口 `T` 通常为 `PaginationResponse<ItemType>`。
- HTTP 客户端统一使用 `request` from `@umijs/max`，不直接引入 axios。
- 请求/响应拦截在 `src/app.tsx` 的 `request` 配置中统一处理（token 注入、错误码跳转）。

---

## 枚举

### 文件组织

| 文件 | 内容 |
| --- | --- |
| `src/enums/index.ts` | 业务领域枚举（状态、类型等）+ 配套 `*EnumText` / `*EnumColor` / `*Options` |
| `src/enums/permission.ts` | 权限枚举 `PermissionEnum`（与 UAM `elementNameList` 对齐） |
| `src/enums/claim.ts` | 理赔相关枚举 |
| `src/enums/uam.ts` | BU 类型、区域 ID 等 UAM 枚举 |

### 命名约定

枚举名统一以 `Enum` 前缀开头（如 `EnumXxx`），这样在导入处按字母排序时所有枚举会自然聚合，便于查找和管理。

```tsx
export enum EnumWaybillStatus {
  PENDING = 'Pending',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
}

// 配套文本映射
export const WaybillStatusEnumText = {
  [EnumWaybillStatus.PENDING]: 'Pending',
  [EnumWaybillStatus.IN_TRANSIT]: 'In Transit',
  [EnumWaybillStatus.DELIVERED]: 'Delivered',
};

// 配套颜色映射（用于 Tag / Badge）
export const WaybillStatusEnumColor = {
  [EnumWaybillStatus.PENDING]: '#FFA940',
  [EnumWaybillStatus.IN_TRANSIT]: '#1890FF',
  [EnumWaybillStatus.DELIVERED]: '#52C41A',
};

// 配套 Options 数组（用于 Select / Radio）
export const WaybillStatusOptions = [
  { label: 'Pending', value: EnumWaybillStatus.PENDING },
  { label: 'In Transit', value: EnumWaybillStatus.IN_TRANSIT },
  { label: 'Delivered', value: EnumWaybillStatus.DELIVERED },
];
```

### 权限枚举

`PermissionEnum` 成员使用 `SCREAMING_SNAKE`，值为 `camelCase` 字符串（与后端/UAM 权限码一致）：

```tsx
export enum PermissionEnum {
  HOME_PAGE = 'homePage',
  CUSTOMER_LIST = 'customerList',
}
```

---

## 样式

### Less + co-located 文件

每个组件目录下放置 `index.less`，通过 `import styles from './index.less'` 引入：

```tsx
import styles from './index.less';

<div className={styles.container}>...</div>;
```

### 命名

- 根类名使用 **camelCase**（如 `.claimTicketList`）。
- Ant Design 覆盖样式放在 `:global { }` 块内。
- 主题色使用 `#009688`（teal），与 `defaultSettings.ts` 中 `colorPrimary` 一致。

### 示例

```less
.myComponent {
  padding: 16px;

  :global {
    .ant-form-item {
      margin-bottom: 0 !important;
    }
  }

  .title {
    font-size: 16px;
    font-weight: 600;
  }
}
```

---

## Import 顺序

Prettier 插件 `prettier-plugin-organize-imports` 自动排序，一般遵循：

1. `@/api*`、`@/components`、`@/constants`、`@/enums`、`@/hooks`、`@/utils`（项目内 `@/` 别名）
2. `@ant-design/icons`（存量代码可能有 `@ant-design/pro-components`）
3. `@umijs/max`（`history`、`useParams`、`useModel`、`Access`、`request` 等）
4. `ahooks`
5. `antd`
6. 第三方库（`lodash`、`dayjs`、`classnames` 等）
7. `react`
8. 相对路径导入（`../components/...`、`./store`）
9. 样式文件（`./index.less`）放最后

---

## Hooks 使用

### ahooks 优先

项目大量使用 `ahooks`，优先使用其提供的 Hook 而非手写：

- `useSetState` — 合并式 setState（替代多个 `useState`）
- `useMount` / `useUnmount` — 生命周期
- `useRequest` — 异步请求（部分场景使用）
- `useDebounceFn` / `useThrottleFn` — 防抖节流
- `useUrlState`（`@ahooksjs/use-url-state`）— URL 参数同步

### 自定义 Hooks

放在 `src/hooks/` 下，命名以 `use` 开头，使用命名导出或默认导出均可（跟随现有文件风格）。

---

## 状态管理

### 页面级

- 简单场景：`useState` / `useSetState`。
- 跨子组件共享：React Context（如 `StateContext`）或通过 props 传递。
- 复杂表单流程：Umi Model（`src/models/`）+ `useModel`。

### 全局

- **用户信息 / 权限**：`getInitialState` → `useModel('@@initialState')`。
- **跨页面事件**：`PubSubContext`（`src/context/pubsub.tsx`）。

---

## 路由与权限

- 路由定义在 `config/routes.tsx`，使用 `PermissionEnum` 作为 `access` 字段。
- 页面内按钮级权限：`const access = useAccess()` → `access[PermissionEnum.XXX]`。
- 详见 `page-permission-workflow` Skill。

---

## 常量

集中在 `src/constants/` 下：

| 常量 | 说明 |
| --- | --- |
| `PATHS` | 路由路径字符串 |
| `DEFAULT_PAGINATION` | 分页初始值 `{ list: [], pageNum: 1, pageSize: 20, total: 0, pages: 0 }` |
| `COMMON_TABLE_FORM_SETTING` | 存量 ProTable 搜索表单默认配置（新代码不再使用） |
| `MAX_LENGTH` | 各类输入框最大长度 |
| `TOKEN_KEY` | Cookie token key（含环境前缀） |
| `REGEXP` | 常用正则 |

---

## 格式化与 Lint

- **Prettier**：`printWidth: 80`、`singleQuote: true`、`trailingComma: 'all'`。
- **ESLint**：继承 `@umijs/max/eslint`，额外启用 `no-shadow`、`nonblock-statement-body-position`、`no-confusing-arrow`、`no-prototype-builtins`、`no-undef-init`。
- **Stylelint**：Less 语法。
- **提交前**：Husky + lint-staged 自动检查。

---

## 其他约定

- **日期库**：统一使用 `dayjs`（非 moment）。
- **数值计算**：涉及金额精度时使用 `bignumber.js`。
- **新标签页打开**：使用 `openNewTag(relativePath)` 工具函数（`@/utils/utils`）。
- **文件上传**：使用 `OssUpload` 或 `CustomUpload` 组件，OSS 签名通过 `ossGetUploadSignature` 获取。
- **国际化**：UI 文案直接写英文（项目 locale 文件仅有占位），无需 `formatMessage`。
- **环境变量**：编译时常量通过 `.env.*.ts` + `config.ts` 的 `define` 注入；运行时变量通过 `/config.js`（`window.ENV`）+ `src/runtime-env.ts` 读取。
