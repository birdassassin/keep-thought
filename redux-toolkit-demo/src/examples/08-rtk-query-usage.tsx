/**
 * ============================================================================
 * 示例 8: RTK Query 进阶 - 在组件中使用 + 缓存策略
 * ============================================================================
 * 
 * 本示例展示：
 * 1. Query Hook 的返回值和使用方式
 * 2. Mutation Hook 的返回值和使用方式
 * 3. 缓存策略（缓存时间、重新获取条件）
 * 4. 懒加载查询
 * 5. 分页和参数化查询
 */

import React, { useState } from 'react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ============================================================================
// 模拟 API（因为实际 API 可能不可用）
// ============================================================================

// 自定义 baseQuery，用本地数据模拟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockPosts = [
  { id: 1, userId: 1, title: '学习 Redux Toolkit', body: 'RTK 让状态管理更简单' },
  { id: 2, userId: 1, title: '学习 RTK Query', body: 'RTK Query 让数据获取更简单' },
  { id: 3, userId: 2, title: 'React 19 新特性', body: 'Actions、use() 等' },
];

const mockBaseQuery = async (args: { url: string; method?: string; body?: any }) => {
  await delay(500);
  const { url, method = 'GET', body } = args;

  if (url === '/posts' && method === 'GET') {
    return { data: [...mockPosts] };
  }
  if (url.startsWith('/posts/') && method === 'GET') {
    const id = Number(url.split('/')[2]);
    const post = mockPosts.find(p => p.id === id);
    return post ? { data: post } : { error: { status: 404, data: 'Not Found' } };
  }
  if (url === '/posts' && method === 'POST') {
    const newPost = { id: Date.now(), ...body };
    mockPosts.unshift(newPost);
    return { data: newPost };
  }
  if (url.startsWith('/posts/') && method === 'PUT') {
    const id = Number(url.split('/')[2]);
    mockPosts = mockPosts.map(p => p.id === id ? { ...p, ...body } : p);
    return { data: { id, ...body } };
  }
  if (url.startsWith('/posts/') && method === 'DELETE') {
    const id = Number(url.split('/')[2]);
    mockPosts = mockPosts.filter(p => p.id !== id);
    return { data: undefined };
  }
  return { error: { status: 400, data: 'Bad Request' } };
};

// ============================================================================
// 创建 API
// ============================================================================

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

interface CreatePostInput {
  userId: number;
  title: string;
  body: string;
}

const postsApi = createApi({
  reducerPath: 'postsApi',
  baseQuery: mockBaseQuery as any,
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    // 获取文章列表（带分页参数）
    getPosts: builder.query<Post[], { _start?: number; _limit?: number } | void>({
      query: (params) => ({
        url: '/posts',
        // params 会被序列化为查询参数
        // 例如: /posts?_start=0&_limit=10
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Post' as const, id })), { type: 'Post', id: 'LIST' }]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    // 获取单篇文章
    getPostById: builder.query<Post, number>({
      query: (id) => ({ url: `/posts/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Post', id }],
    }),

    // 创建文章
    createPost: builder.mutation<Post, CreatePostInput>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
      // 乐观更新（后续示例详细讲解）
      // async onQueryStarted(_, { dispatch, queryFulfilled }) { ... }
    }),

    // 更新文章
    updatePost: builder.mutation<Post, Partial<Post> & { id: number }>({
      query: ({ id, ...body }) => ({ url: `/posts/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Post', id }, { type: 'Post', id: 'LIST' }],
    }),

    // 删除文章
    deletePost: builder.mutation<void, number>({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Post', id }, { type: 'Post', id: 'LIST' }],
    }),
  }),
});

const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useLazyGetPostByIdQuery, // 懒加载版本
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postsApi;

// ============================================================================
// 组件示例 1: 使用 Query Hook 获取数据
// ============================================================================

/**
 * 【useGetPostsQuery 的返回值】
 * 
 * {
 *   data: Post[] | undefined,    // 返回的数据
 *   isLoading: boolean,           // 第一次加载中
 *   isFetching: boolean,          // 正在获取（包括后台刷新）
 *   isSuccess: boolean,           // 请求成功
 *   isError: boolean,             // 请求失败
 *   error: any,                   // 错误信息
 *   refetch: () => void,          // 手动重新获取
 * }
 * 
 * 【isLoading vs isFetching 的区别】
 * - isLoading: 第一次加载，还没有任何缓存数据时为 true
 * - isFetching: 正在获取数据（包括后台刷新），即使已有缓存也可能为 true
 * 
 * 简单记忆：
 * - 显示初始加载动画 → 用 isLoading
 * - 显示后台刷新指示器 → 用 isFetching
 */

function PostsList() {
  // 调用 Query Hook，RTK Query 自动处理一切
  const { data: posts, isLoading, isFetching, isError, error, refetch } = useGetPostsQuery();

  // 加载中
  if (isLoading) {
    return <div>加载中...</div>;
  }

  // 出错
  if (isError) {
    return <div>出错了: {String(error)}</div>;
  }

  return (
    <div>
      {/* isFetching 表示后台正在刷新 */}
      {isFetching && <div style={{ color: '#888' }}>后台刷新中...</div>}

      <button onClick={() => refetch()}>🔄 重新获取</button>

      <ul>
        {posts?.map(post => (
          <li key={post.id}>
            <strong>{post.title}</strong>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// 组件示例 2: 使用 Mutation Hook 修改数据
// ============================================================================

/**
 * 【useCreatePostMutation 的返回值】
 * 
 * 返回一个数组: [trigger, result]
 * 
 * trigger: 触发 mutation 的函数
 *   - trigger(payload) 返回 Promise
 *   - trigger(payload, { optimisticUpdate: true }) 可以传选项
 * 
 * result: 当前 mutation 的状态
 *   {
 *     data: Post | undefined,     // 返回的数据
 *     isLoading: boolean,          // 是否正在执行
 *     isSuccess: boolean,          // 是否成功
 *     isError: boolean,            // 是否失败
 *     error: any,                  // 错误信息
 *     reset: () => void,           // 重置状态
 *   }
 */

function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // 解构出 trigger 函数和状态
  const [createPost, { isLoading, isSuccess, isError }] = useCreatePostMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      // 调用 trigger，传入 payload
      await createPost({ userId: 1, title, body }).unwrap();
      // .unwrap() 会解包 Promise，成功返回 data，失败抛出 error
      setTitle('');
      setBody('');
    } catch (err) {
      console.error('创建失败:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="标题"
      />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="内容"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? '提交中...' : '创建文章'}
      </button>
      {isSuccess && <div style={{ color: 'green' }}>创建成功！</div>}
      {isError && <div style={{ color: 'red' }}>创建失败</div>}
    </form>
  );
}

// ============================================================================
// 组件示例 3: 懒加载查询
// ============================================================================

/**
 * 【useLazyGetPostByIdQuery】
 * 
 * 普通的 Query Hook（useGetPostByIdQuery）在组件挂载时自动发送请求。
 * 
 * 懒加载版本（useLazy + Query）不会自动发送请求，
 * 而是返回一个 trigger 函数，手动调用时才发送请求。
 * 
 * 适用场景：
 * - 点击按钮后才加载数据
 * - 根据条件加载数据
 * - 搜索功能
 */

function LazyPostLoader() {
  const [postId, setPostId] = useState('');

  // 懒加载 Hook，返回 [fetch, { data, isLoading, ... }]
  const [fetchPost, { data: post, isLoading, isFetching }] = useLazyGetPostByIdQuery();

  const handleSearch = () => {
    if (postId) {
      fetchPost(Number(postId));
    }
  };

  return (
    <div>
      <div>
        <input
          value={postId}
          onChange={e => setPostId(e.target.value)}
          placeholder="输入文章 ID"
          type="number"
        />
        <button onClick={handleSearch}>搜索</button>
      </div>

      {isLoading && <div>加载中...</div>}
      {isFetching && !isLoading && <div>刷新中...</div>}
      {post && (
        <div>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 组件示例 4: 文章详情（带删除和编辑）
// ============================================================================

function PostDetail({ postId }: { postId: number }) {
  const { data: post, isLoading } = useGetPostByIdQuery(postId);
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  if (isLoading) return <div>加载中...</div>;
  if (!post) return <div>文章不存在</div>;

  const handleUpdate = async () => {
    await updatePost({ id: post.id, title: editTitle }).unwrap();
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('确定删除？')) {
      await deletePost(post.id).unwrap();
    }
  };

  return (
    <div>
      {isEditing ? (
        <div>
          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          <button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? '保存中...' : '保存'}
          </button>
          <button onClick={() => setIsEditing(false)}>取消</button>
        </div>
      ) : (
        <div>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <button onClick={() => { setIsEditing(true); setEditTitle(post.title); }}>
            ✏️ 编辑
          </button>
          <button onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? '删除中...' : '🗑️ 删除'}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 【缓存策略详解】
// ============================================================================

/**
 * RTK Query 的缓存机制：
 * 
 * 1. 默认缓存时间：60 秒
 *    - 60 秒内再次请求相同数据，直接返回缓存
 *    - 60 秒后再次请求，会先返回缓存，同时后台刷新
 * 
 * 2. 引用计数：
 *    - 每个组件使用某个查询时，引用计数 +1
 *    - 组件卸载时，引用计数 -1
 *    - 引用计数为 0 时，启动缓存过期计时器
 * 
 * 3. keepUnusedDataFor: 自定义缓存时间
 *    keepUnusedDataFor: 30,  // 30 秒后清除未使用的缓存
 * 
 * 4. refetchOnMountOrArgChange: 挂载时是否重新获取
 *    refetchOnMountOrArgChange: true,  // 总是重新获取
 *    refetchOnMountOrArgChange: 30,    // 30 秒内不重新获取
 * 
 * 5. refetchOnFocus: 窗口重新获得焦点时重新获取
 *    refetchOnFocus: true,  // 默认 true
 * 
 * 6. refetchOnReconnect: 网络重新连接时重新获取
 *    refetchOnReconnect: true,  // 默认 true
 * 
 * 配置示例：
 * 
 * getPosts: builder.query({
 *   query: () => '/posts',
 *   keepUnusedDataFor: 120,        // 缓存 2 分钟
 *   refetchOnMountOrArgChange: 60, // 60 秒内不重新获取
 *   refetchOnFocus: true,           // 窗口聚焦时刷新
 *   refetchOnReconnect: true,       // 网络恢复时刷新
 * }),
 */

// ============================================================================
// 【重要知识点总结】
// ============================================================================
/**
 * 1. Query Hook 返回值
 *    - data: 返回的数据
 *    - isLoading: 第一次加载（无缓存时）
 *    - isFetching: 正在获取（包括后台刷新）
 *    - refetch: 手动重新获取
 * 
 * 2. Mutation Hook 返回值
 *    - [trigger, result] 数组形式
 *    - trigger(payload).unwrap() 获取结果或抛出错误
 * 
 * 3. 懒加载 Hook
 *    - useLazy + Query: 手动触发，不自动请求
 *    - 返回 [fetch, result]
 * 
 * 4. 缓存策略
 *    - keepUnusedDataFor: 缓存保留时间
 *    - refetchOnMountOrArgChange: 挂载时是否刷新
 *    - refetchOnFocus: 窗口聚焦时刷新
 *    - refetchOnReconnect: 网络恢复时刷新
 */

export default postsApi;
