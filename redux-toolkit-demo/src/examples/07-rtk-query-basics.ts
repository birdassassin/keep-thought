/**
 * ============================================================================
 * 示例 7: RTK Query 基础 - 什么是 RTK Query？
 * ============================================================================
 * 
 * 【RTK Query 是什么？】
 * RTK Query 是 Redux Toolkit 内置的数据获取和缓存解决方案。
 * 它可以替代 Axios + 手写 loading/error 状态 + 手动缓存管理。
 * 
 * 【为什么用 RTK Query？】
 * 
 * 之前（用 createAsyncThunk）：
 * - 手动写 loading / error / data 状态
 * - 手动管理缓存
 * - 手动处理重复请求
 * - 手动实现轮询、自动刷新
 * 
 * 用 RTK Query 之后：
 * - ✅ 自动管理 loading / error / data
 * - ✅ 自动缓存，相同请求不重复发送
 * - ✅ 自动去重，组件卸载后取消请求
 * - ✅ 内置轮询、自动刷新、乐观更新
 * - ✅ 代码量减少 60%+
 * 
 * 【核心概念】
 * 
 * 1. createApi        - 创建 API 服务（定义所有接口）
 * 2. fetchBaseQuery   - 基础请求封装（类似 Axios）
 * 3. builder.query    - 定义查询（GET 请求）
 * 4. builder.mutation - 定义变更（POST/PUT/DELETE 请求）
 * 5. tagTypes         - 标签类型（用于缓存失效）
 * 6. providesTags     - 查询提供标签（数据来源）
 * 7. invalidatesTags  - 变更使标签失效（触发重新获取）
 * 
 * 【工作流程】
 * 
 *   组件调用 hook          RTK Query 内部处理
 *       │                      │
 *       │  useGetPostsQuery()  │
 *       ├─────────────────────>│
 *       │                      │ 1. 检查缓存
 *       │                      │ 2. 有缓存？直接返回
 *       │                      │ 3. 无缓存？发送请求
 *       │                      │ 4. 缓存结果
 *       │  返回 { data, ... }  │
 *       │<─────────────────────│
 *       │                      │
 *       │  useUpdatePostMutation()
 *       ├─────────────────────>│
 *       │                      │ 1. 发送请求
 *       │                      │ 2. 使相关标签失效
 *       │                      │ 3. 自动重新获取关联数据
 *       │  返回结果            │
 *       │<─────────────────────│
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ============================================================================
// 第一步：创建 API 服务
// ============================================================================

/**
 * createApi 是 RTK Query 的核心函数
 * 它接收一个配置对象，返回一个包含 reducer、middleware、hooks 的 API 对象
 */
export const apiSlice = createApi({
  // --------------------------------------------------------------------------
  // reducerPath: 这个 API 在 Redux Store 中的路径
  // 默认是 'api'，一般不需要改
  // --------------------------------------------------------------------------
  reducerPath: 'api',

  // --------------------------------------------------------------------------
  // baseQuery: 基础请求函数
  // fetchBaseQuery 是 RTK Query 提供的轻量级请求封装
  // 它基于 fetch API，类似一个迷你版 Axios
  // --------------------------------------------------------------------------
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://jsonplaceholder.typicode.com', // API 基础地址
    
    // prepareHeaders: 可以在这里添加统一的请求头
    // 例如：添加认证 token
    prepareHeaders: (headers) => {
      // 从 localStorage 获取 token
      // const token = localStorage.getItem('token');
      // if (token) {
      //   headers.set('Authorization', `Bearer ${token}`);
      // }
      return headers;
    },
  }),

  // --------------------------------------------------------------------------
  // tagTypes: 定义标签类型
  // 标签用于控制缓存失效和自动重新获取
  // --------------------------------------------------------------------------
  tagTypes: ['Post', 'User', 'Comment'],

  // --------------------------------------------------------------------------
  // endpoints: 定义所有的 API 端点
  // builder 提供了 query() 和 mutation() 两个方法
  // --------------------------------------------------------------------------
  endpoints: (builder) => ({
    // ========================================================================
    // Query: 查询操作（GET 请求）
    // 用于获取数据，结果会被自动缓存
    // ========================================================================

    // 获取文章列表
    getPosts: builder.query<Post[], void>({
      // query 函数返回请求的 URL 路径（会拼接到 baseUrl 后面）
      query: () => '/posts',
      
      // providesTags: 声明这个查询提供了哪些标签
      // 当这些标签被 invalidate 时，会自动重新获取数据
      providesTags: (result) =>
        // 如果有数据，为每篇文章提供具体的标签
        // 这样修改单篇文章时只会重新获取那篇
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' }, // 列表标签
            ]
          : [{ type: 'Post', id: 'LIST' }], // 无数据时只提供列表标签
    }),

    // 获取单篇文章
    getPostById: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    // 获取用户信息
    getUserById: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // 带参数的查询
    getPostsByUserId: builder.query<Post[], number>({
      query: (userId) => `/posts?userId=${userId}`,
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'Post' as const, id }))
          : [],
    }),

    // ========================================================================
    // Mutation: 变更操作（POST/PUT/DELETE 请求）
    // 用于修改数据，可以触发缓存失效
    // ========================================================================

    // 创建文章
    createPost: builder.mutation<Post, Omit<Post, 'id'>>({
      // mutation 的 query 返回 { url, method, body }
      query: (newPost) => ({
        url: '/posts',
        method: 'POST',
        body: newPost,
      }),
      // invalidatesTags: 使指定标签失效，触发重新获取
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    // 更新文章
    updatePost: builder.mutation<Post, Partial<Post> & { id: number }>({
      query: ({ id, ...body }) => ({
        url: `/posts/${id}`,
        method: 'PUT',
        body,
      }),
      // 使特定文章的缓存失效
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    // 删除文章
    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),
  }),
});

// ============================================================================
// 第二步：自动生成的 Hooks
// ============================================================================
// createApi 会自动为每个 endpoint 生成对应的 React Hook
// 
// 命名规则：
// - query endpoint  → use + EndpointName + Query   Hook
// - mutation endpoint → use + EndpointName + Mutation Hook
// 
// 例如：
// - getPosts    → useGetPostsQuery
// - getPostById → useGetPostByIdQuery
// - createPost  → useCreatePostMutation
// - updatePost  → useUpdatePostMutation
// - deletePost  → useDeletePostMutation

// 导出自动生成的 Hooks（推荐做法）
export const {
  // Query Hooks
  useGetPostsQuery,
  useGetPostByIdQuery,
  useGetUserByIdQuery,
  useGetPostsByUserIdQuery,
  // Mutation Hooks
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  // 其他导出（后续示例会用到）
  // useLazyGetPostByIdQuery,  // 懒加载版本
  // usePrefetch,              // 手动预获取
} = apiSlice;

// ============================================================================
// 第三步：类型定义
// ============================================================================

// 文章类型
interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// 用户类型
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
}

// ============================================================================
// 第四步：在 Store 中注册（重要！）
// ============================================================================
/**
 * RTK Query 需要在 Store 中注册两样东西：
 * 1. reducer: 存储缓存数据
 * 2. middleware: 处理请求拦截、缓存失效等
 * 
 * 在 store/index.ts 中：
 * 
 * import { apiSlice } from './services/api';
 * 
 * export const store = configureStore({
 *   reducer: {
 *     [apiSlice.reducerPath]: apiSlice.reducer,
 *   },
 *   middleware: (getDefaultMiddleware) =>
 *     getDefaultMiddleware().concat(apiSlice.middleware),
 * });
 */

// ============================================================================
// 【重要知识点总结】
// ============================================================================
/**
 * 1. createApi vs createAsyncThunk
 *    - createAsyncThunk: 手动管理状态，适合简单场景
 *    - createApi: 自动管理缓存、去重、刷新，适合 API 密集型应用
 * 
 * 2. query vs mutation
 *    - query: 获取数据（GET），结果自动缓存
 *    - mutation: 修改数据（POST/PUT/DELETE），触发缓存失效
 * 
 * 3. Tag 系统
 *    - providesTags: 声明查询提供了哪些数据
 *    - invalidatesTags: 声明变更使哪些数据失效
 *    - 匹配规则：type 匹配或 type + id 精确匹配
 * 
 * 4. 自动生成的 Hooks
 *    - useXxxQuery: 返回 { data, isLoading, error, refetch }
 *    - useXxxMutation: 返回 [trigger, { data, isLoading, error }]
 *    - useLazyXxxQuery: 懒加载版本，手动触发
 */

export default apiSlice;
