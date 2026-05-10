/**
 * ============================================================================
 * 示例 9: RTK Query 高级 - 乐观更新、轮询、认证拦截
 * ============================================================================
 * 
 * 本示例展示 RTK Query 的高级功能：
 * 1. 乐观更新（Optimistic Updates）
 * 2. 轮询（Polling）
 * 3. 无限滚动/分页
 * 4. 自定义 baseQuery（添加认证 token）
 * 5. 错误处理
 */

import { createApi, fetchBaseQuery, QueryReturnValue } from '@reduxjs/toolkit/query/react';

// ============================================================================
// 高级功能 1: 乐观更新（Optimistic Updates）
// ============================================================================
/**
 * 【什么是乐观更新？】
 * 
 * 当用户执行操作（如点赞、编辑）时：
 * - 不等服务器响应，立即更新 UI
 * - 如果服务器返回成功，保持更新
 * - 如果服务器返回失败，回滚到之前的状态
 * 
 * 【RTK Query 如何实现？】
 * 使用 mutation 的 onQueryStarted 选项
 */

interface Post {
  id: number;
  title: string;
  body: string;
  reactions: { thumbsUp: number };
}

// 模拟数据
let posts: Post[] = [
  { id: 1, title: '文章1', body: '内容1', reactions: { thumbsUp: 5 } },
  { id: 2, title: '文章2', body: '内容2', reactions: { thumbsUp: 3 } },
];

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const mockQuery = async (args: any): Promise<QueryReturnValue> => {
  await delay(300);
  if (args.url === '/posts') return { data: [...posts] };
  if (args.url.startsWith('/posts/') && args.method === 'PATCH') {
    const id = Number(args.url.split('/')[2]);
    posts = posts.map(p => p.id === id ? { ...p, ...args.body } : p);
    return { data: posts.find(p => p.id === id) };
  }
  return { data: {} };
};

const optimisticApi = createApi({
  reducerPath: 'optimisticApi',
  baseQuery: mockQuery as any,
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: 'Post' as const, id })), { type: 'Post', id: 'LIST' }]
        : [{ type: 'Post', id: 'LIST' }],
    }),

    // 乐观更新：点赞
    reactToPost: builder.mutation<Post, { id: number; reaction: keyof Post['reactions'] }>({
      query: ({ id, reaction }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body: { [`reactions.${reaction}`]: true }, // 告诉服务器增加点赞
      }),

      /**
       * 【onQueryStarted 详解】
       * 
       * onQueryStarted 在 mutation 发送之前执行
       * 参数：
       * - arg: 传入 mutation 的参数
       * - api: 包含 dispatch, queryFulfilled, getState 等工具
       * 
       * api.dispatch: 可以 dispatch 任何 action（包括其他 thunk）
       * api.queryFulfilled: 一个 Promise，在 mutation 完成后 resolve
       * api.getState: 获取当前 state
       */
      onQueryStarted({ id, reaction }, { dispatch, queryFulfilled }) {
        /**
         * 【乐观更新的实现步骤】
         * 
         * 1. patchQueryData: 立即修改缓存中的数据（乐观更新）
         *    - 接收 endpoint 名称和参数，找到对应的缓存
         *    - 接收一个回调函数，修改缓存数据
         * 
         * 2. queryFulfilled: 等待服务器响应
         * 
         * 3. 如果成功：用服务器返回的数据更新缓存
         *    updateQueryData: 用新数据替换缓存
         * 
         * 4. 如果失败：撤销乐观更新
         *    patchResult.undo(): 撤销之前的修改
         */

        // 步骤 1: 乐观更新 - 立即更新 UI
        const patchResult = dispatch(
          optimisticApi.util.updateQueryData('getPosts', undefined, (draft) => {
            // draft 是 Immer 的代理对象，可以直接修改
            const post = draft.find(p => p.id === id);
            if (post) {
              post.reactions[reaction] += 1;
            }
          })
        );

        // 步骤 2: 等待服务器响应
        queryFulfilled
          .then(() => {
            // 成功：服务器已确认，乐观更新生效
            // 也可以选择用服务器返回的数据更新：
            // dispatch(
            //   optimisticApi.util.updateQueryData('getPosts', undefined, (draft) => {
            //     const post = draft.find(p => p.id === id);
            //     if (post) post = serverData;
            //   })
            // );
          })
          .catch(() => {
            // 失败：撤销乐观更新
            patchResult.undo();
          });
      },
    }),
  }),
});

// ============================================================================
// 高级功能 2: 轮询（Polling）
// ============================================================================
/**
 * 【什么是轮询？】
 * 每隔一段时间自动重新获取数据。
 * 
 * 适用场景：
 * - 实时数据（股票价格、在线人数）
 * - 通知/消息（新消息提醒）
 * - 长时间运行的任务状态
 */

const pollingApi = createApi({
  reducerPath: 'pollingApi',
  baseQuery: mockQuery as any,
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    // 方式 1: 在 endpoint 定义中设置轮询
    getPostsWithPolling: builder.query<Post[], void>({
      query: () => '/posts',
      // pollingInterval: 每 5 秒自动重新获取
      pollingInterval: 5000, // 单位：毫秒
      // 注意：轮询只在组件挂载时才会执行
      // 组件卸载后自动停止
    }),

    // 方式 2: 在组件中动态控制轮询
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
    }),
  }),
});

/**
 * 在组件中动态控制轮询：
 * 
 * function PollingComponent() {
 *   // skipPollingIfUnfocused: 窗口不聚焦时暂停轮询
 *   const { data } = useGetPostsQuery(undefined, {
 *     pollingInterval: 3000,              // 每 3 秒轮询
 *     skipPollingIfUnfocused: true,       // 窗口不聚焦时暂停
 *   });
 *   
 *   return <div>{data?.map(p => <div key={p.id}>{p.title}</div>)}</div>;
 * }
 */

// ============================================================================
// 高级功能 3: 自定义 baseQuery（添加认证）
// ============================================================================
/**
 * 【实际项目中的 baseQuery 配置】
 * 
 * 通常需要：
 * 1. 统一的 baseUrl
 * 2. 自动添加认证 token
 * 3. 统一的错误处理
 * 4. 请求/响应拦截
 */

// 自定义 baseQuery，添加 token 和错误处理
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: 'https://api.example.com',
  prepareHeaders: (headers, { getState }) => {
    // 从 Redux Store 获取 token
    // const token = (getState() as any).auth.token;
    // if (token) {
    //   headers.set('Authorization', `Bearer ${token}`);
    // }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * 【更高级：自动刷新 token】
 * 
 * 当请求返回 401 时，自动尝试刷新 token，然后重试原请求
 */
// const baseQueryWithReauth = async (args, api, extraOptions) => {
//   let result = await baseQueryWithAuth(args, api, extraOptions);
// 
//   // 如果返回 401，尝试刷新 token
//   if (result.error && result.error.status === 401) {
//     // 尝试获取新的 token
//     const refreshResult = await baseQueryWithAuth('/auth/refresh', api, extraOptions);
// 
//     if (refreshResult.data) {
//       // 保存新 token
//       api.dispatch(setCredentials(refreshResult.data));
//       // 用新 token 重试原请求
//       result = await baseQueryWithAuth(args, api, extraOptions);
//     } else {
//       // 刷新失败，登出
//       api.dispatch(logout());
//     }
//   }
// 
//   return result;
// };

// ============================================================================
// 高级功能 4: 分页和无限滚动
// ============================================================================
/**
 * 【分页的实现方式】
 * 
 * 方式 1: 传统分页（页码）
 * - query: (page) => `/posts?_page=${page}&_limit=10`
 * - 使用 keepUnusedDataFor 缓存每页数据
 * 
 * 方式 2: 无限滚动（游标）
 * - 使用 serializeQueryArgs 自定义缓存 key
 * - 合并新旧数据
 */

const paginationApi = createApi({
  reducerPath: 'paginationApi',
  baseQuery: mockQuery as any,
  tagTypes: ['Post'],
  endpoints: (builder) => ({
    // 传统分页
    getPostsByPage: builder.query<{ data: Post[]; total: number }, number>({
      query: (page) => `/posts?_page=${page}&_limit=10`,
      
      /**
       * 【serializeQueryArgs】
       * 自定义缓存 key 的生成方式
       * 默认会将所有参数序列化，导致不同页码的缓存不共享
       * 
       * 如果想让分页数据共享缓存（用于无限滚动），可以统一 key：
       */
      serializeQueryArgs: ({ endpointName }) => {
        // 所有页码使用同一个缓存 key
        return endpointName;
      },
      
      /**
       * 【merge】
       * 当缓存命中时，如何合并新旧数据
       * 用于无限滚动：新数据追加到旧数据后面
       */
      merge: (currentCache, newCache, args) => {
        // 第一次请求，直接使用新数据
        if (!currentCache.data.length) {
          return newCache;
        }
        // 后续请求，追加数据
        return {
          ...newCache,
          data: [...currentCache.data, ...newCache.data],
        };
      },
      
      // 缓存时间设长一些，避免翻页时缓存丢失
      keepUnusedDataFor: 300,
    }),
  }),
});

// ============================================================================
// 高级功能 5: 全局错误处理
// ============================================================================
/**
 * 【自定义 baseQuery 处理错误】
 * 
 * 可以在 baseQuery 中统一处理错误格式
 */

// const baseQueryWithErrorHandling = fetchBaseQuery({
//   baseUrl: 'https://api.example.com',
// });
// 
// const baseQuery = async (args, api, extraOptions) => {
//   const result = await baseQueryWithErrorHandling(args, api, extraOptions);
// 
//   if (result.error) {
//     // 统一错误格式
//     const { status, data } = result.error;
//     
//     // 显示错误通知
//     if (status === 401) {
//       api.dispatch(showNotification({ message: '请重新登录', type: 'error' }));
//     } else if (status === 403) {
//       api.dispatch(showNotification({ message: '没有权限', type: 'error' }));
//     } else if (status >= 500) {
//       api.dispatch(showNotification({ message: '服务器错误', type: 'error' }));
//     }
//   }
// 
//   return result;
// };

// ============================================================================
// 【重要知识点总结】
// ============================================================================
/**
 * 1. 乐观更新
 *    - 使用 onQueryStarted 钩子
 *    - updateQueryData 立即修改缓存
 *    - queryFulfilled.then/.catch 处理成功/失败
 *    - patchResult.undo() 撤销修改
 * 
 * 2. 轮询
 *    - pollingInterval: 设置轮询间隔
 *    - skipPollingIfUnfocused: 窗口不聚焦时暂停
 *    - 组件卸载后自动停止
 * 
 * 3. 分页
 *    - serializeQueryArgs: 自定义缓存 key
 *    - merge: 合并新旧数据（无限滚动）
 *    - keepUnusedDataFor: 延长缓存时间
 * 
 * 4. 认证
 *    - prepareHeaders: 添加 token
 *    - 401 时自动刷新 token 并重试
 * 
 * 5. 错误处理
 *    - 在自定义 baseQuery 中统一处理
 *    - dispatch 通知 action
 */

export default optimisticApi;
