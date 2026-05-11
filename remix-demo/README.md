# Remix 完整教程示例

## 版本信息

- **Remix 版本**: v2.x (最新稳定版)
- **React 版本**: v18.x
- **Node.js 要求**: >= 18.0.0
- **包管理器**: npm / yarn / pnpm

## Remix 简介

Remix 是一个全栈 Web 框架，由 React Router 团队开发。它专注于：

- **服务端渲染 (SSR)**: 默认在服务端渲染页面
- **渐进增强**: 即使 JavaScript 加载失败，表单仍可工作
- **嵌套路由**: 每个路由可以独立加载数据
- **优秀的数据处理**: loader 和 action 模式

## 核心特性

### 1. 路由系统
- 基于文件系统的路由
- 支持嵌套路由和动态路由
- 自动代码分割

### 2. 数据加载
- `loader` - 服务端数据加载
- `useLoaderData` - 客户端获取数据
- 并行数据加载

### 3. 数据变更
- `action` - 处理表单提交和数据变更
- `useActionData` - 获取 action 返回的数据
- 乐观 UI 更新

### 4. 错误处理
- `ErrorBoundary` - 错误边界组件
- `CatchBoundary` - 捕获特定状态码

### 5. 性能优化
- 自动预加载
- 智能缓存
- 增量静态生成

## 示例目录

```
src/examples/
├── 01-basics.md          # Remix 基础入门
│   ├── Remix 简介
│   ├── 项目创建
│   ├── 目录结构
│   ├── 路由基础
│   └── loader/action
│
├── 02-routing.md         # 路由系统详解
│   ├── 嵌套路由
│   ├── 动态路由
│   ├── 路由文件
│   ├── 布局嵌套
│   └── 链接导航
│
├── 03-data-loading.md    # 数据加载
│   ├── useLoaderData
│   ├── useRouteLoaderData
│   ├── 并行加载
│   ├── 错误边界
│   └── 缓存策略
│
├── 04-mutations.md       # 数据变更
│   ├── 表单处理
│   ├── useActionData
│   ├── useNavigation
│   ├── 乐观UI
│   └── 重定向
│
└── 05-advanced.md        # 高级特性
    ├── Session管理
    ├── Cookie
    ├── 中间件
    ├── 资源路由
    └── API路由
```

## 快速开始

```bash
# 创建新项目
npx create-remix@latest my-app

# 进入项目目录
cd my-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 学习路径

1. **初学者**: 从 `01-basics.md` 开始，了解 Remix 基本概念
2. **进阶**: 学习 `02-routing.md` 掌握路由系统
3. **数据处理**: 阅读 `03-data-loading.md` 和 `04-mutations.md`
4. **高级应用**: 探索 `05-advanced.md` 中的高级特性

## 相关资源

- [Remix 官方文档](https://remix.run/docs)
- [Remix GitHub](https://github.com/remix-run/remix)
- [React Router 文档](https://reactrouter.com)

## 与其他框架对比

| 特性 | Remix | Next.js | Gatsby |
|------|-------|---------|--------|
| 渐进增强 | ✅ | ❌ | ❌ |
| 嵌套路由 | ✅ 原生 | ✅ 需配置 | ✅ 插件 |
| 表单处理 | ✅ 原生 | ✅ Server Actions | ❌ |
| SSR | ✅ | ✅ | ✅ |
| SSG | ✅ | ✅ | ✅ 主要 |
| 学习曲线 | 中等 | 中等 | 较低 |

## 许可证

MIT License
