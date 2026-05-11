# React Router 7 完整教程

## 版本信息

- **当前版本**: v7.x
- **发布时间**: 2024年
- **官方文档**: https://reactrouter.com/

React Router 7 是 React 生态系统中最流行的路由库，提供了完整的路由解决方案，支持客户端路由、服务端渲染(SSR)和静态站点生成(SSG)。

---

## 核心特性

### 1. 三种使用模式

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| **声明式模式** | 使用 `<Routes>` 和 `<Route>` 组件声明路由 | 简单应用、快速原型 |
| **数据模式** | 使用 `loader`、`action` 进行数据管理 | 需要数据预加载的应用 |
| **框架模式** | 基于 Remix 的全栈框架模式 | SSR、SSG、全栈应用 |

### 2. 主要功能

- **路由配置**: 支持声明式和配置式两种方式
- **嵌套路由**: 通过 `<Outlet>` 实现布局复用
- **动态路由**: 支持参数路由 `/users/:id`
- **数据加载**: `loader` 在路由渲染前加载数据
- **数据操作**: `action` 处理表单提交和数据变更
- **代码分割**: 内置懒加载支持
- **错误处理**: 路由级别的错误边界
- **类型安全**: 完整的 TypeScript 支持

### 3. 核心 API 速查

```
组件:
  <BrowserRouter>  - 路由容器
  <Routes>         - 路由匹配容器
  <Route>          - 单个路由定义
  <Link>           - 声明式导航
  <Navigate>       - 编程式导航组件
  <Outlet>         - 嵌套路由出口
  <Form>           - 数据表单组件

Hooks:
  useNavigate()    - 编程式导航
  useParams()      - 获取路由参数
  useLocation()    - 获取当前位置
  useSearchParams() - 获取查询参数
  useLoaderData()  - 获取 loader 数据
  useActionData()  - 获取 action 返回数据
  useNavigation()  - 获取导航状态
```

---

## 示例目录

### 基础示例

| 文件 | 内容 | 学习目标 |
|------|------|----------|
| [01-basics.tsx](./src/examples/01-basics.tsx) | 基础路由配置 | BrowserRouter、Routes/Route、Link、useNavigate、useParams |

### 进阶示例

| 文件 | 内容 | 学习目标 |
|------|------|----------|
| [02-nested-routing.tsx](./src/examples/02-nested-routing.tsx) | 嵌套路由 | Outlet、相对路径、布局路由、索引路由 |
| [03-data-routing.tsx](./src/examples/03-data-routing.tsx) | 数据路由 | loader、action、useLoaderData、Form组件 |

### 高级示例

| 文件 | 内容 | 学习目标 |
|------|------|----------|
| [04-advanced.tsx](./src/examples/04-advanced.tsx) | 高级特性 | 懒加载、错误边界、路由守卫、配置对象 |
| [05-framework-mode.md](./src/examples/05-framework-mode.md) | 框架模式 | 文件路由、SSR配置、类型安全 |

---

## 快速开始

### 安装

```bash
# 使用 npm
npm install react-router-dom

# 使用 yarn
yarn add react-router-dom

# 使用 pnpm
pnpm add react-router-dom
```

### 最简示例

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 学习路径建议

```
1. 基础路由 (01-basics.tsx)
   ↓
2. 嵌套路由 (02-nested-routing.tsx)
   ↓
3. 数据路由 (03-data-routing.tsx)
   ↓
4. 高级特性 (04-advanced.tsx)
   ↓
5. 框架模式 (05-framework-mode.md)
```

---

## 从 v6 迁移到 v7

React Router 7 与 v6 高度兼容，主要变化：

1. **框架模式增强**: 新增 `createBrowserRouter` 的更多配置选项
2. **类型安全改进**: 更好的 TypeScript 类型推断
3. **性能优化**: 路由匹配和导航性能提升
4. **新增 API**: `useRouteLoaderData`、`useRouteError` 等

```tsx
// v6 写法仍然有效
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
  </Routes>
</BrowserRouter>

// v7 推荐的数据路由写法
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    loader: homeLoader,
  }
]);
```

---

## 相关资源

- [官方文档](https://reactrouter.com/)
- [GitHub 仓库](https://github.com/remix-run/react-router)
- [Remix 框架](https://remix.run/)
