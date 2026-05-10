# React 19 新特性演示项目

这是一个展示 React 19 新特性的交互式演示项目，包含了 React 19 所有重要更新的代码示例。

## React 19 主要新特性

### 1. Actions
Actions 是 React 19 中处理异步操作的新范式，可以自动管理 pending 状态、错误处理和乐观更新。

**核心 API：**
- `useActionState` - 简化 Action 状态管理
- `useTransition` - 现在支持异步函数
- 表单支持直接传递函数给 action 属性

### 2. useOptimistic
用于实现乐观更新，让用户操作后立即看到结果，提供更流畅的用户体验。

```tsx
const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (currentState, optimisticValue) => newState
);
```

### 3. use() API
全新的资源读取 API，可以在渲染时读取 Promise 或 Context。

**与 Hooks 的区别：**
- 可以在条件语句中使用
- 可以在循环中使用
- 支持读取 Promise 和 Context

### 4. ref 作为 prop
不再需要 `forwardRef`，ref 可以直接作为 prop 传递。

```tsx
// React 19 新写法
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
```

### 5. Form Actions
表单现在支持直接传递函数给 action 属性，配合 `useFormStatus` 轻松管理表单状态。

### 6. 文档元数据支持
可以在任意组件中直接写 `<title>`、`<meta>`、`<link>` 等标签，React 会自动将它们提升到 document head。

### 7. 其他改进
- Server Components 正式稳定
- Server Actions 支持
- React Compiler（实验性）
- Suspense 改进
- 自定义元素支持

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── demos/
│   ├── ActionsDemo.tsx       # Actions 演示
│   ├── UseOptimisticDemo.tsx # useOptimistic 演示
│   ├── UseDemo.tsx           # use() API 演示
│   ├── RefAsPropDemo.tsx     # ref 作为 prop 演示
│   ├── FormActionsDemo.tsx   # Form Actions 演示
│   ├── MetadataDemo.tsx      # 元数据支持演示
│   └── index.ts              # 导出所有演示
├── App.tsx                   # 主应用组件
├── App.css                   # 样式文件
└── main.tsx                  # 入口文件
```

## 演示说明

项目包含 6 个主要演示模块：

1. **Actions** - 展示 useActionState 和 useTransition 的使用
2. **useOptimistic** - 展示乐观更新的实现
3. **use()** - 展示新的 use API 读取 Promise 和 Context
4. **ref as prop** - 展示无需 forwardRef 的新写法
5. **Form Actions** - 展示表单 Action 和 useFormStatus
6. **Metadata** - 展示文档元数据支持

## 技术栈

- React 19.0.0
- TypeScript
- Vite
- CSS3

## 参考资源

- [React 19 官方发布博客](https://react.dev/blog/2024/12/05/react-19)
- [React 19 升级指南](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React 官方文档](https://react.dev)

## 许可证

MIT
