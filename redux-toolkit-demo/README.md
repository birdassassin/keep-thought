# Redux Toolkit 完整新手教程

> 从零开始学习 Redux Toolkit，每个知识点都有详细注释，无需再看官方文档。

## 📚 教程目录

### 基础知识
1. **什么是 Redux？** - 理解核心概念
2. **什么是 Redux Toolkit？** - 为什么用它
3. **Store** - 数据仓库的创建
4. **Slice** - 状态切片管理
5. **Reducer** - 状态修改逻辑
6. **Action** - 触发状态变化

### 核心 Hooks
7. **useSelector** - 读取状态
8. **useDispatch** - 触发动作
9. **Provider** - 注入 Store

### 进阶用法
10. **createAsyncThunk** - 异步操作
11. **extraReducers** - 处理异步状态
12. **中间件** - Redux 中间件
13. **DevTools** - 调试工具

### 实战示例
14. **完整 Todo 应用** - 综合练习

## 🚀 快速开始

```bash
# 进入项目目录
cd redux-toolkit-demo

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📖 学习建议

1. 按顺序阅读 `src/examples/` 下的示例文件
2. 每个文件都是独立的，可以直接运行
3. 注释中有详细的解释和注意事项
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

## 📄 文件结构

```
src/
├── examples/           # 学习示例（按顺序阅读）
│   ├── 01-what-is-redux.tsx
│   ├── 02-store-basics.ts
│   ├── 03-slice-basics.ts
│   ├── 04-counter-slice.ts
│   ├── 05-using-hooks.tsx
│   ├── 06-async-thunk.ts
│   └── 07-complete-todo/
│
├── store/             # 实际项目的 Store 配置
│   └── index.ts
│
├── features/          # 按功能模块组织的 Slice
│   ├── counter/
│   ├── todo/
│   └── user/
│
└── components/        # React 组件
    ├── Counter.tsx
    ├── TodoList.tsx
    └── UserProfile.tsx
```

## 🔗 相关链接

- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [Redux 官方文档](https://redux.js.org/)
