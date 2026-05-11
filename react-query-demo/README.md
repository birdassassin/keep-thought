# TanStack React Query v5 完整教程示例

> **版本**: `@tanstack/react-query` 5.91.x
> **适用人群**: React 开发者，从零开始学习服务端状态管理
> **前置知识**: React Hooks 基础（useState、useEffect）、TypeScript 基础、async/await

---

## 目录

- [什么是 React Query？](#什么是-react-query)
- [为什么需要 React Query？](#为什么需要-react-query)
- [核心概念](#核心概念)
- [v5 新特性与重大变更](#v5-新特性与重大变更)
- [安装](#安装)
- [示例目录](#示例目录)
- [学习路线建议](#学习路线建议)

---

## 什么是 React Query？

TanStack React Query（原名 React Query）是一个用于 **管理服务端状态** 的 React 库。它帮你处理数据获取、缓存、同步和更新，让你不再手动编写 `useEffect` + `fetch` 的样板代码。

简单来说：
- **React 自身的状态管理**（useState、useReducer）擅长管理 **客户端状态**（如：弹窗开关、表单输入、选中项）
- **React Query** 擅长管理 **服务端状态**（如：用户列表、文章详情、订单数据）

## 为什么需要 React Query？

在没有 React Query 之前，我们通常这样获取数据：

```tsx
// 传统方式：问题多多
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  // 问题：
  // 1. 没有缓存 - 每次组件挂载都重新请求
  // 2. 没有去重 - 多个组件请求同一数据会发多次请求
  // 3. 没有后台更新 - 数据过期后不会自动刷新
  // 4. 没有分页/无限滚动支持
  // 5. loading/error 状态管理繁琐
  // 6. 乐观更新难以实现

  if (loading) return <div>加载中...</div>;
  if (error) return <div>出错了: {error.message}</div>;
  return <div>{/* 渲染用户列表 */}</div>;
}
```

使用 React Query 后：

```tsx
// React Query 方式：简洁强大
function UserList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>出错了: {error.message}</div>;
  return <div>{/* 渲染用户列表 */}</div>;
}
```

---

## 核心概念

### 1. Query（查询）

**Query** 用于 **获取（读取）** 数据。每次查询由以下部分组成：

- **queryKey**: 查询的唯一标识符（数组格式），用于缓存和匹配
- **queryFn**: 实际获取数据的异步函数，必须返回一个 Promise
- **返回值**: `{ data, isLoading, error, isError, isSuccess, ... }`

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['todos'],           // 查询键，唯一标识
  queryFn: fetchTodos,           // 查询函数，返回 Promise
  staleTime: 5 * 60 * 1000,     // 数据被视为"新鲜"的时间（5分钟）
  gcTime: 30 * 60 * 1000,       // 未使用数据在缓存中保留的时间（30分钟）
});
```

### 2. Mutation（变更）

**Mutation** 用于 **修改（写入）** 数据，如创建、更新、删除操作。

```tsx
const addTodoMutation = useMutation({
  mutationFn: (newTodo) => axios.post('/api/todos', newTodo),
  onSuccess: () => {
    // 变更成功后，使相关查询缓存失效，触发重新获取
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

### 3. QueryClient（查询客户端）

**QueryClient** 是 React Query 的核心实例，负责管理所有查询和变更。通常在应用根组件创建一个实例并通过 Context 提供。

```tsx
// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 全局默认 staleTime
      retry: 3,                     // 失败重试次数
      refetchOnWindowFocus: false,  // 窗口聚焦时不自动重新获取
    },
  },
});

// 在根组件中提供
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyApp />
    </QueryClientProvider>
  );
}
```

### 4. QueryCache（查询缓存）

**QueryCache** 是 QueryClient 内部的缓存存储，所有查询数据都存储在这里。每个缓存条目包含：

- **data**: 查询返回的数据
- **dataUpdatedAt**: 数据最后更新的时间戳
- **state**: `{ data, status, fetchStatus, error, ... }`

你可以通过 `queryClient.getQueryCache()` 访问缓存。

---

## v5 新特性与重大变更

### 新增特性

| 特性 | 说明 |
|------|------|
| **useSuspenseQuery** | 原生支持 React Suspense，自动 throw Promise 触发 Suspense 边界 |
| **useSuspenseQueries** | 并行 Suspense 查询 |
| **useSuspenseInfiniteQuery** | 无限查询的 Suspense 版本 |
| **useMutationState** | 获取所有 mutation 的状态 |
| **maxPages** | `useInfiniteQuery` 中限制最大页数，自动丢弃旧页面 |
| **initialData** | v5 中 `initialData` 行为改进，支持函数形式 |
| **queryOptions()** | 类型安全的查询选项辅助函数 |

### 重大变更（从 v4 迁移）

| v4 | v5 | 说明 |
|----|----|------|
| `cacheTime` | `gcTime` | 重命名，含义更清晰（垃圾回收时间） |
| `keepPreviousData` | `placeholderData: keepPreviousData` | 移至 `placeholderData` 选项 |
| `isLoading` | `isPending`（推荐） | 语义更准确，`isLoading` 仍可用 |
| `isIdle` + `isLoading` | `fetchStatus` | 使用 `fetchStatus: 'idle' \| 'fetching'` 替代 |
| `useIsFetching()` | `useIsFetching()` | 现在可以按 `queryKey` 过滤 |
| `QueryClientProvider` | `QueryClientProvider` | 不再需要 `context` 属性 |
| `hydrate` | `HydrationBoundary` | SSR 预取数据使用 `HydrationBoundary` 组件 |

### 其他改进

- **更好的 TypeScript 支持**: `queryOptions()` 辅助函数提供完整类型推断
- **更小的包体积**: Tree-shaking 友好，按需引入
- **React 19 兼容**: 支持 React 19 的并发特性
- **改进的错误处理**: `useErrorBoundary` 选项

---

## 安装

```bash
# 安装核心包
npm install @tanstack/react-query

# 安装开发工具（仅开发环境）
npm install -D @tanstack/react-query-devtools

# 如果使用 TypeScript（通常已包含在 React 项目中）
# npm install -D typescript @types/react @types/react-dom
```

---

## 示例目录

| 文件 | 主题 | 核心内容 |
|------|------|----------|
| [01-basics.tsx](./src/examples/01-basics.tsx) | 基础用法 | QueryClientProvider 配置、useQuery、queryKey 设计、loading/error/data 状态、staleTime/gcTime |
| [02-mutations.tsx](./src/examples/02-mutations.tsx) | 数据变更 | useMutation、回调函数、乐观更新、mutation 状态重置、useMutationState |
| [03-infinite-query.tsx](./src/examples/03-infinite-query.tsx) | 无限查询 | useInfiniteQuery、分页实现、无限滚动、getNextPageParam、maxPages |
| [04-cache-management.tsx](./src/examples/04-cache-management.tsx) | 缓存管理 | invalidateQueries、prefetchQuery、setQueryData、缓存时间配置 |
| [05-devtools.tsx](./src/examples/05-devtools.tsx) | 开发工具 | DevTools 配置、QueryObserver、useQueries、useIsFetching、自定义 Hook |
| [06-advanced.tsx](./src/examples/06-advanced.tsx) | 高级特性 | useSuspenseQuery、HydrationBoundary、持久化缓存、默认查询选项、React 19 |

---

## 学习路线建议

```
新手入门路线：

1. 01-basics.tsx        ← 从这里开始！理解核心概念
2. 02-mutations.tsx     ← 学习如何修改数据
3. 04-cache-management.tsx  ← 理解缓存机制（建议在无限查询之前学习）
4. 03-infinite-query.tsx    ← 学习分页和无限滚动
5. 05-devtools.tsx      ← 掌握调试技巧和高级组合
6. 06-advanced.tsx      ← 进阶：Suspense、SSR、持久化
```

---

## 常用 API 速查

### useQuery 返回值

```tsx
const {
  data,              // 查询返回的数据
  error,             // 错误对象（如果有）
  isError,           // 是否有错误
  isPending,         // 是否正在加载（推荐使用，替代 isLoading）
  isLoading,         // 同 isPending（v5 仍可用）
  isSuccess,         // 是否成功
  isFetching,        // 是否正在后台获取数据
  isStale,           // 数据是否过期
  isPlaceholderData, // 是否显示的是占位数据
  refetch,           // 手动重新获取
  dataUpdatedAt,     // 数据最后更新时间
} = useQuery({ ... });
```

### useMutation 返回值

```tsx
const {
  data,              // mutation 返回的数据
  error,             // 错误对象
  isError,           // 是否有错误
  isIdle,            // 是否空闲
  isPending,         // 是否正在进行中
  isSuccess,         // 是否成功
  isPaused,          // 是否暂停（离线时）
  variables,         // 传入 mutationFn 的变量
  reset,             // 重置 mutation 状态
  mutate,            // 触发 mutation
  mutateAsync,       // 触发 mutation（返回 Promise）
} = useMutation({ ... });
```

### QueryClient 常用方法

```tsx
queryClient.invalidateQueries({ queryKey: ['todos'] });  // 使缓存失效
queryClient.removeQueries({ queryKey: ['todos'] });       // 移除缓存
queryClient.resetQueries({ queryKey: ['todos'] });        // 重置缓存
queryClient.prefetchQuery({ queryKey: ['todos'], queryFn: fetchTodos }); // 预获取
queryClient.setQueryData(['todos', id], newData);         // 直接设置缓存
queryClient.getQueryData(['todos', id]);                  // 读取缓存
```

---

## 参考资源

- [官方文档](https://tanstack.com/query/latest/docs/react/overview)
- [GitHub 仓库](https://github.com/TanStack/query)
- [迁移指南 v4 → v5](https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5)
- [社区示例](https://tanstack.com/query/latest/docs/react/examples)
