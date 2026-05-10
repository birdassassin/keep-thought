# Redux Toolkit 完整新手教程

> 从零开始学习 Redux Toolkit + RTK Query，每个知识点都有详细注释，无需再看官方文档。

## 📚 教程目录

### 基础知识
1. **[01-what-is-redux.tsx](src/examples/01-what-is-redux.tsx)** - Redux 核心概念、工作流程图解
2. **[02-store-basics.ts](src/examples/02-store-basics.ts)** - Store 创建、Reducer、Action、Dispatch
3. **[03-slice-basics.ts](src/examples/03-slice-basics.ts)** - Slice、PayloadAction、多个 Slice 组合
4. **[04-using-hooks.tsx](src/examples/04-using-hooks.tsx)** - useSelector、useDispatch、Provider、性能优化
5. **[05-async-thunk.ts](src/examples/05-async-thunk.ts)** - createAsyncThunk、extraReducers、三种异步状态

### RTK Query（数据获取与缓存）
6. **[07-rtk-query-basics.ts](src/examples/07-rtk-query-basics.ts)** - createApi、fetchBaseQuery、Tag 系统、Query vs Mutation
7. **[08-rtk-query-usage.tsx](src/examples/08-rtk-query-usage.tsx)** - 组件中使用、缓存策略、懒加载、分页
8. **[09-rtk-query-advanced.ts](src/examples/09-rtk-query-advanced.ts)** - 乐观更新、轮询、认证拦截、无限滚动

### 高级用法
9. **[10-advanced-patterns.ts](src/examples/10-advanced-patterns.ts)** - createSelector、自定义中间件、性能优化、常见陷阱

### 实战示例
10. **[06-complete-todo/](src/examples/06-complete-todo/)** - 完整 Todo 应用（综合所有知识点）

## 🚀 快速开始

```bash
cd redux-toolkit-demo
npm install
npm run dev
```

## 📖 学习建议

1. **按顺序阅读** `src/examples/` 下的示例文件
2. 每个文件都有**详细中文注释**，解释原理和注意事项
3. 代码可以直接复制到项目中使用
4. 最后通过 Todo 应用综合练习

## 🎯 核心概念速记

| 概念 | 作用 | 类比 |
|------|------|------|
| Store | 存储所有状态 | 数据库 |
| Slice | 状态的分片 | 数据表 |
| Reducer | 修改状态的函数 | SQL 语句 |
| Action | 触发修改的指令 | API 请求 |
| Dispatch | 发送 Action | 调用 API |
| Selector | 读取状态 | 查询语句 |
| createApi | 定义 API 接口 | API 客户端 |
| Tag | 缓存失效标记 | 缓存键 |

## 📄 文件结构

```
src/
├── examples/                    # 学习示例（按顺序阅读）
│   ├── 01-what-is-redux.tsx     # Redux 概念介绍
│   ├── 02-store-basics.ts       # Store 基础
│   ├── 03-slice-basics.ts       # Slice 核心概念
│   ├── 04-using-hooks.tsx       # React Hooks 使用
│   ├── 05-async-thunk.ts        # 异步操作
│   ├── 06-complete-todo/        # 完整 Todo 应用
│   ├── 07-rtk-query-basics.ts   # RTK Query 基础
│   ├── 08-rtk-query-usage.tsx   # RTK Query 组件使用
│   ├── 09-rtk-query-advanced.ts # RTK Query 高级功能
│   └── 10-advanced-patterns.ts  # 高级模式和最佳实践
│
├── store/                       # Store 配置
│   └── index.ts
│
├── features/                    # 按功能模块组织的 Slice
│   ├── counter/
│   ├── todo/
│   └── user/
│
└── components/                  # React 组件
```

## 🔗 相关链接

- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [RTK Query 官方文档](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux 官方文档](https://redux.js.org/)
