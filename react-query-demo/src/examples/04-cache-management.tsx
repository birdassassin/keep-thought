/**
 * ============================================================================
 * 示例 04: React Query 缓存管理
 * ============================================================================
 *
 * 本文件涵盖以下内容：
 * 1. 缓存失效（invalidateQueries / removeQueries / resetQueries）
 * 2. 预获取（prefetchQuery / prefetchInfiniteQuery）
 * 3. 缓存时间配置（staleTime / gcTime 详解）
 * 4. 乐观更新（setQueryData 直接修改缓存）
 * 5. 分页缓存管理
 * 6. getQueryData / setQueryData 读写缓存
 * 7. 缓存匹配规则（queryKey 过滤）
 *
 * 学习建议：这是 React Query 最重要的概念之一，理解缓存机制是高效使用 React Query 的关键。
 * ============================================================================
 */

import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState } from "react";

// ============================================================================
// 第一部分：模拟 API
// ============================================================================

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  likes: number;
}

interface Comment {
  id: number;
  postId: number;
  text: string;
  author: string;
}

let mockPosts: Post[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `文章 ${i + 1}：React Query 缓存管理详解`,
  content: `这是文章 ${i + 1} 的内容。缓存管理是 React Query 的核心能力之一。`,
  author: `作者 ${Math.ceil((i + 1) / 5)}`,
  likes: Math.floor(Math.random() * 500),
}));

let mockComments: Comment[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  postId: (i % 10) + 1,
  text: `评论 ${i + 1}：写得好！`,
  author: `评论者 ${(i % 8) + 1}`,
}));

let nextPostId = 21;
let nextCommentId = 51;

async function fetchPosts(): Promise<Post[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...mockPosts];
}

async function fetchPostById(id: number): Promise<Post> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const post = mockPosts.find((p) => p.id === id);
  if (!post) throw new Error("文章不存在");
  return { ...post };
}

async function fetchComments(postId: number): Promise<Comment[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockComments.filter((c) => c.postId === postId);
}

async function addPost(title: string): Promise<Post> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const newPost: Post = {
    id: nextPostId++,
    title,
    content: `这是新文章的内容`,
    author: "当前用户",
    likes: 0,
  };
  mockPosts.unshift(newPost);
  return newPost;
}

async function likePost(id: number): Promise<Post> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const post = mockPosts.find((p) => p.id === id);
  if (!post) throw new Error("文章不存在");
  post.likes += 1;
  return { ...post };
}

async function addComment(postId: number, text: string): Promise<Comment> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const newComment: Comment = {
    id: nextCommentId++,
    postId,
    text,
    author: "当前用户",
  };
  mockComments.push(newComment);
  return newComment;
}

// ============================================================================
// 第二部分：QueryClient 配置
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,   // 30 秒内数据视为新鲜
      gcTime: 5 * 60 * 1000,  // 5 分钟后垃圾回收
    },
  },
});

// ============================================================================
// 第三部分：缓存失效（invalidateQueries）
// ============================================================================

/**
 * 示例 1：invalidateQueries - 使缓存失效
 *
 * 【教学提示】
 * invalidateQueries 是最常用的缓存操作：
 * - 将匹配的查询标记为"过期"（stale）
 * - 如果有组件正在使用该查询，会自动重新获取
 * - 如果没有组件使用，下次使用时会重新获取
 *
 * 三种缓存操作的区别：
 * - invalidateQueries: 标记为过期，触发重新获取
 * - removeQueries: 直接从缓存中删除，下次需要时重新加载
 * - resetQueries: 重置为初始状态（data 变为 undefined），触发重新获取
 */
function InvalidateQueriesExample() {
  const queryClient = useQueryClient();

  // 查询文章列表
  const { data: posts = [], isPending, dataUpdatedAt } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  // 查询文章详情
  const [selectedPostId, setSelectedPostId] = useState<number>(1);
  const { data: postDetail, isPending: isDetailPending } = useQuery({
    queryKey: ["post", selectedPostId],
    queryFn: () => fetchPostById(selectedPostId),
  });

  // 查询评论
  const { data: comments = [] } = useQuery({
    queryKey: ["comments", selectedPostId],
    queryFn: () => fetchComments(selectedPostId),
  });

  /**
   * 使所有文章相关查询失效
   *
   * 【教学提示】
   * queryKey 匹配是"前缀匹配"：
   * - { queryKey: ["posts"] } → 匹配 ["posts"], ["posts", 1], ["posts", "detail", 2] 等
   * - { queryKey: ["posts"], exact: true } → 只匹配 ["posts"]
   * - { queryKey: ["posts"], type: "active" } → 只匹配正在被使用的查询
   * - { queryKey: ["posts"], type: "inactive" } → 只匹配没有被使用的查询
   * - { queryKey: ["posts"], predicate: (query) => ... } → 自定义过滤条件
   */
  const invalidateAllPosts = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    console.log("已使所有 ['posts'] 相关查询失效");
  };

  /**
   * 只使文章列表失效（精确匹配）
   */
  const invalidatePostsList = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"], exact: true });
    console.log("已使文章列表失效（精确匹配）");
  };

  /**
   * 使特定文章详情失效
   */
  const invalidatePostDetail = () => {
    queryClient.invalidateQueries({ queryKey: ["post", selectedPostId] });
    console.log(`已使文章 ${selectedPostId} 的详情失效`);
  };

  /**
   * 使所有查询失效（慎用！）
   */
  const invalidateAll = () => {
    queryClient.invalidateQueries();
    console.log("已使所有查询失效");
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 1：invalidateQueries - 缓存失效</h3>

      {/* 缓存操作按钮 */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        <button onClick={invalidateAllPosts} style={{ padding: "6px 12px", fontSize: "13px" }}>
          失效所有文章查询
        </button>
        <button onClick={invalidatePostsList} style={{ padding: "6px 12px", fontSize: "13px" }}>
          失效文章列表（精确）
        </button>
        <button onClick={invalidatePostDetail} style={{ padding: "6px 12px", fontSize: "13px" }}>
          失效当前文章详情
        </button>
        <button onClick={invalidateAll} style={{ padding: "6px 12px", fontSize: "13px", color: "red" }}>
          失效所有查询
        </button>
      </div>

      <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
        数据最后更新: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "无"}
      </div>

      {/* 文章选择 */}
      <div style={{ marginBottom: "12px" }}>
        <span style={{ fontSize: "13px" }}>选择文章：</span>
        {[1, 2, 3, 4, 5].map((id) => (
          <button
            key={id}
            onClick={() => setSelectedPostId(id)}
            style={{
              margin: "0 2px",
              padding: "2px 10px",
              fontSize: "13px",
              backgroundColor: selectedPostId === id ? "#1890ff" : "#f0f0f0",
              color: selectedPostId === id ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            文章 {id}
          </button>
        ))}
      </div>

      {/* 文章详情 */}
      {isDetailPending && <div>加载详情中...</div>}
      {postDetail && (
        <div style={{ backgroundColor: "#fafafa", padding: "12px", borderRadius: "4px", marginBottom: "12px" }}>
          <h4>{postDetail.title}</h4>
          <p style={{ fontSize: "13px", color: "#666" }}>{postDetail.content}</p>
          <p style={{ fontSize: "13px" }}>点赞: {postDetail.likes} | 作者: {postDetail.author}</p>
        </div>
      )}

      {/* 评论列表 */}
      <div style={{ fontSize: "13px" }}>
        <strong>评论 ({comments.length}):</strong>
        {comments.map((c) => (
          <div key={c.id} style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0" }}>
            {c.author}: {c.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 第四部分：removeQueries 和 resetQueries
// ============================================================================

/**
 * 示例 2：removeQueries 和 resetQueries
 *
 * 【教学提示】
 * invalidateQueries vs removeQueries vs resetQueries：
 *
 * ┌──────────────────┬────────────────┬────────────────┬──────────────────┐
 * │                  │ invalidateQueries │ removeQueries  │ resetQueries     │
 * ├──────────────────┼────────────────┼────────────────┼──────────────────┤
 * │ 数据是否保留      │ 是（标记过期）   │ 否（删除）      │ 否（重置为初始）  │
 * │ 是否重新获取      │ 是（如果有观察者）│ 下次使用时获取  │ 是（如果有观察者）│
 * │ 适用场景          │ 数据可能已变化   │ 数据不再需要    │ 完全重置状态      │
 * └──────────────────┴────────────────┴────────────────┴──────────────────┘
 */
function RemoveAndResetExample() {
  const queryClient = useQueryClient();

  const { data, isPending, isFetching, isStale } = useQuery({
    queryKey: ["cache-demo"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return `数据获取于 ${new Date().toLocaleTimeString()}`;
    },
  });

  const handleInvalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cache-demo"] });
  };

  const handleRemove = () => {
    /**
     * removeQueries：直接从缓存中删除查询
     * 删除后，如果有组件在使用，会显示 loading 状态并重新获取
     */
    queryClient.removeQueries({ queryKey: ["cache-demo"] });
  };

  const handleReset = () => {
    /**
     * resetQueries：重置查询状态
     * 数据被清除，状态回到初始值，如果有观察者会重新获取
     */
    queryClient.resetQueries({ queryKey: ["cache-demo"] });
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 2：removeQueries / resetQueries</h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={handleInvalidate} style={{ padding: "6px 12px", fontSize: "13px" }}>
          invalidateQueries
        </button>
        <button onClick={handleRemove} style={{ padding: "6px 12px", fontSize: "13px" }}>
          removeQueries
        </button>
        <button onClick={handleReset} style={{ padding: "6px 12px", fontSize: "13px" }}>
          resetQueries
        </button>
      </div>

      <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
        <p><strong>数据：</strong>{data || "无"}</p>
        <p><strong>isPending：</strong>{String(isPending)}</p>
        <p><strong>isFetching：</strong>{String(isFetching)}</p>
        <p><strong>isStale：</strong>{String(isStale)}</p>
      </div>

      <div style={{ backgroundColor: "#fffbe6", padding: "12px", borderRadius: "4px", fontSize: "13px", marginTop: "12px" }}>
        <strong>试试看：</strong>
        <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
          <li>invalidateQueries → 数据保留，后台刷新</li>
          <li>removeQueries → 数据删除，重新加载</li>
          <li>resetQueries → 数据清除，重新加载</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// 第五部分：预获取（prefetchQuery）
// ============================================================================

/**
 * 示例 3：prefetchQuery - 预获取数据
 *
 * 【教学提示】
 * prefetchQuery 在数据被需要之前就获取并缓存。
 * 当用户实际需要数据时，可以直接从缓存中读取，无需等待。
 *
 * 常见使用场景：
 * 1. 鼠标悬停在链接上时预获取详情页数据
 * 2. 分页列表中预获取下一页
 * 3. 路由变化前预获取目标页面数据
 * 4. 搜索框输入时预获取搜索建议
 *
 * prefetchQuery 不会触发组件重新渲染（因为没有观察者）
 */
function PrefetchExample() {
  const queryClient = useQueryClient();

  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const { data: post, isPending } = useQuery({
    queryKey: ["post", selectedPostId],
    queryFn: () => fetchPostById(selectedPostId!),
    enabled: selectedPostId !== null,
  });

  /**
   * 鼠标悬停时预获取
   *
   * 【教学提示】
   * prefetchQuery 的配置和 useQuery 类似：
   * - queryKey: 查询键
   * - queryFn: 查询函数
   * - staleTime: 可选，覆盖全局配置
   *
   * 如果数据已经在缓存中且未过期，不会重新获取
   */
  const handleMouseEnter = (postId: number) => {
    queryClient.prefetchQuery({
      queryKey: ["post", postId],
      queryFn: () => fetchPostById(postId),
      // staleTime: 10 * 1000, // 可选：设置预获取数据的新鲜时间
    });
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 3：prefetchQuery - 预获取</h3>

      <div style={{ backgroundColor: "#e6f7ff", padding: "12px", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
        <strong>使用说明：</strong>将鼠标悬停在文章标题上（不要点击），数据会预获取。
        然后点击标题，会发现数据瞬间显示（因为已经预获取了）。
      </div>

      {/* 文章列表 - 悬停预获取 */}
      <div style={{ marginBottom: "12px" }}>
        {[1, 2, 3, 4, 5].map((id) => (
          <div
            key={id}
            onMouseEnter={() => handleMouseEnter(id)}
            onClick={() => setSelectedPostId(id)}
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid #f0f0f0",
              cursor: "pointer",
              backgroundColor: selectedPostId === id ? "#e6f7ff" : "transparent",
            }}
          >
            文章 {id}（悬停预获取，点击查看详情）
          </div>
        ))}
      </div>

      {/* 文章详情 */}
      {selectedPostId && isPending && <div>加载中...（如果预获取成功，这里不会出现）</div>}
      {post && (
        <div style={{ backgroundColor: "#fafafa", padding: "12px", borderRadius: "4px" }}>
          <h4>{post.title}</h4>
          <p style={{ fontSize: "13px" }}>{post.content}</p>
          <p style={{ fontSize: "13px" }}>点赞: {post.likes}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 第六部分：setQueryData 直接修改缓存
// ============================================================================

/**
 * 示例 4：setQueryData - 直接修改缓存（非乐观更新场景）
 *
 * 【教学提示】
 * setQueryData 可以直接修改缓存中的数据，不发起网络请求。
 *
 * 除了乐观更新，setQueryData 还适用于：
 * 1. WebSocket 推送更新：收到推送后直接更新缓存
 * 2. 服务端事件（SSE）：收到事件后更新缓存
 * 3. SSR 数据注入：将服务端数据注入客户端缓存
 * 4. 简单的本地状态更新：如点赞数增加
 */
function SetQueryDataExample() {
  const queryClient = useQueryClient();

  const { data: post, isPending } = useQuery({
    queryKey: ["post", 1],
    queryFn: () => fetchPostById(1),
  });

  /**
   * 直接增加点赞数（不发送请求）
   *
   * 【教学提示】
   * setQueryData 的两种用法：
   * 1. setQueryData(queryKey, newData) - 直接替换数据
   * 2. setQueryData(queryKey, updater) - 使用函数更新（推荐）
   *
   * 使用函数更新更安全，因为：
   * - 可以基于当前数据计算新数据
   * - 避免覆盖其他来源的更新
   * - updater 接收旧数据作为参数
   */
  const handleLocalLike = () => {
    queryClient.setQueryData<Post>(["post", 1], (oldData) => {
      if (!oldData) return oldData;
      return { ...oldData, likes: oldData.likes + 1 };
    });
  };

  /**
   * 使用 mutation + setQueryData（乐观更新 + 服务端同步）
   */
  const likeMutation = useMutation({
    mutationFn: () => likePost(1),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", 1] });
      const previous = queryClient.getQueryData<Post>(["post", 1]);
      queryClient.setQueryData<Post>(["post", 1], (old) => {
        if (!old) return old;
        return { ...old, likes: old.likes + 1 };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["post", 1], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["post", 1] });
    },
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 4：setQueryData - 直接修改缓存</h3>

      {isPending && <div>加载中...</div>}

      {post && (
        <div style={{ backgroundColor: "#fafafa", padding: "12px", borderRadius: "4px", marginBottom: "12px" }}>
          <h4>{post.title}</h4>
          <p style={{ fontSize: "13px" }}>
            点赞数: <strong>{post.likes}</strong>
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={handleLocalLike} style={{ padding: "6px 16px" }}>
          本地点赞（只改缓存，不发请求）
        </button>
        <button
          onClick={() => likeMutation.mutate()}
          disabled={likeMutation.isPending}
          style={{ padding: "6px 16px" }}
        >
          {likeMutation.isPending ? "同步中..." : "服务端点赞（乐观更新 + 同步）"}
        </button>
      </div>

      <div style={{ fontSize: "13px", color: "#666", marginTop: "8px" }}>
        <p>- "本地点赞"：立即增加点赞数，但刷新后会丢失（只改了缓存）</p>
        <p>- "服务端点赞"：乐观更新 + 同步到服务端，刷新后数据保留</p>
      </div>
    </div>
  );
}

// ============================================================================
// 第七部分：getQueryData 读取缓存
// ============================================================================

/**
 * 示例 5：getQueryData - 读取缓存数据
 *
 * 【教学提示】
 * getQueryData 从缓存中读取数据，不发起网络请求。
 * 如果缓存中没有数据，返回 undefined。
 *
 * 常见用途：
 * 1. 在 mutation 回调中读取当前缓存数据
 * 2. 在事件处理器中快速访问缓存
 * 3. 调试时查看缓存内容
 */
function GetQueryDataExample() {
  const queryClient = useQueryClient();

  // 先确保数据已加载
  const { data: posts = [], isPending } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const handleReadCache = () => {
    /**
     * getQueryData 读取缓存
     *
     * 【教学提示】
     * 返回值类型需要手动指定泛型参数
     * 如果缓存中没有匹配的数据，返回 undefined
     */
    const cachedPosts = queryClient.getQueryData<Post[]>(["posts"]);
    const cachedPost1 = queryClient.getQueryData<Post>(["post", 1]);

    alert(
      `缓存中的文章列表: ${cachedPosts?.length ?? 0} 条\n` +
      `缓存中的文章 1: ${cachedPost1 ? cachedPost1.title : "未缓存"}`
    );
  };

  const handleCheckExists = () => {
    /**
     * getQueryState 获取查询的完整状态
     *
     * 【教学提示】
     * getQueryState 返回查询的完整状态对象：
     * - data: 缓存的数据
     * - status: 'pending' | 'error' | 'success'
     * - fetchStatus: 'idle' | 'fetching'
     * - dataUpdatedAt: 数据最后更新时间
     * - error: 错误对象
     * 等
     */
    const state = queryClient.getQueryState(["posts"]);

    alert(
      `查询状态:\n` +
      `- 数据存在: ${state ? "是" : "否"}\n` +
      `- 状态: ${state?.status}\n` +
      `- 数据是否过期: ${state?.isInvalidated ? "是" : "否"}\n` +
      `- 数据更新时间: ${state?.dataUpdatedAt ? new Date(state.dataUpdatedAt).toLocaleTimeString() : "无"}`
    );
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 5：getQueryData / getQueryState - 读取缓存</h3>

      {isPending && <div>加载中...</div>}

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={handleReadCache} style={{ padding: "6px 16px" }}>
          读取缓存数据
        </button>
        <button onClick={handleCheckExists} style={{ padding: "6px 16px" }}>
          检查查询状态
        </button>
      </div>

      <div style={{ fontSize: "13px", color: "#666" }}>
        <p>当前缓存了 {posts.length} 篇文章。点击按钮查看缓存读取结果。</p>
      </div>
    </div>
  );
}

// ============================================================================
// 第八部分：分页缓存管理
// ============================================================================

/**
 * 示例 6：分页缓存管理
 *
 * 【教学提示】
 * 分页缓存的 queryKey 设计很重要：
 * - ['posts', { page: 1 }] → 第 1 页
 * - ['posts', { page: 2 }] → 第 2 页
 *
 * 当添加新文章时，需要考虑：
 * 1. 是否需要使所有分页缓存失效？（通常需要）
 * 2. 是否需要回到第 1 页？（通常需要）
 * 3. 是否需要更新总数？（通常需要）
 */
function PaginationCacheExample() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { data: posts = [], isPending } = useQuery({
    queryKey: ["posts", "paginated", { page, pageSize }],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const start = (page - 1) * pageSize;
      return mockPosts.slice(start, start + pageSize);
    },
  });

  const addMutation = useMutation({
    mutationFn: addPost,
    onSuccess: () => {
      /**
       * 使所有分页缓存失效
       *
       * 【教学提示】
       * 因为新文章会影响所有分页（第 1 页多了一条，后面的页码可能偏移），
       * 所以需要使所有分页查询失效。
       *
       * 使用 queryKey 前缀匹配：
       * { queryKey: ["posts", "paginated"] }
       * 会匹配 ["posts", "paginated", { page: 1 }],
       *      ["posts", "paginated", { page: 2 }] 等
       */
      queryClient.invalidateQueries({ queryKey: ["posts", "paginated"] });
      // 添加后回到第 1 页
      setPage(1);
    },
  });

  const totalPages = Math.ceil(mockPosts.length / pageSize);

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 6：分页缓存管理</h3>

      {/* 添加文章 */}
      <div style={{ marginBottom: "12px" }}>
        <button
          onClick={() => addMutation.mutate(`新文章 ${Date.now()}`)}
          disabled={addMutation.isPending}
          style={{ padding: "6px 16px" }}
        >
          {addMutation.isPending ? "添加中..." : "添加新文章"}
        </button>
        <span style={{ fontSize: "13px", color: "#666", marginLeft: "8px" }}>
          （添加后所有分页缓存会失效，自动回到第 1 页）
        </span>
      </div>

      {/* 分页控制 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{ padding: "4px 12px" }}
        >
          上一页
        </button>
        <span style={{ fontSize: "13px" }}>
          第 {page} / {totalPages} 页
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          style={{ padding: "4px 12px" }}
        >
          下一页
        </button>
      </div>

      {/* queryKey 显示 */}
      <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
        当前 queryKey: ["posts", "paginated", {"{ page: "}{page}{", pageSize: "}{pageSize} {"}"}]
      </div>

      {isPending && <div>加载中...</div>}

      {/* 文章列表 */}
      {posts.map((post) => (
        <div
          key={post.id}
          style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0", fontSize: "14px" }}
        >
          <span style={{ color: "#999", marginRight: "8px" }}>#{post.id}</span>
          {post.title}
          <span style={{ float: "right", color: "#999", fontSize: "12px" }}>
            {post.likes} 赞
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 第九部分：缓存时间配置详解
// ============================================================================

/**
 * 示例 7：staleTime / gcTime 配置详解
 *
 * 【教学提示】
 * staleTime 和 gcTime 可以在不同层级配置：
 * 1. QueryClient defaultOptions（全局默认）
 * 2. useQuery 选项（单个查询覆盖）
 * 3. queryClient.setQueryDefaults()（按 queryKey 前缀设置默认值）
 */
function CacheTimeConfigExample() {
  const queryClient = useQueryClient();

  /**
   * 使用 setQueryDefaults 为特定 queryKey 前缀设置默认值
   *
   * 【教学提示】
   * setQueryDefaults 允许你为匹配特定前缀的查询设置默认选项。
   * 这比全局 defaultOptions 更精细，比每个 useQuery 单独设置更方便。
   */
  React.useEffect(() => {
    queryClient.setQueryDefaults(["user-profile"], {
      staleTime: 2 * 60 * 1000,  // 用户数据 2 分钟内不过期
      gcTime: 10 * 60 * 1000,     // 缓存保留 10 分钟
    });
  }, [queryClient]);

  // 这个查询会自动使用上面的默认配置
  const { data, isPending, isFetching, isStale, dataUpdatedAt } = useQuery({
    queryKey: ["user-profile", 1],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        name: "张三",
        email: "zhangsan@example.com",
        fetchedAt: new Date().toLocaleTimeString(),
      };
    },
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 7：缓存时间配置详解</h3>

      <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
        <p>
          <strong>setQueryDefaults 配置：</strong>
          ["user-profile"] 前缀的查询 → staleTime: 2分钟, gcTime: 10分钟
        </p>
        <p><strong>数据：</strong>{data ? JSON.stringify(data) : "无"}</p>
        <p><strong>isPending：</strong>{String(isPending)}</p>
        <p><strong>isFetching：</strong>{String(isFetching)}</p>
        <p><strong>isStale：</strong>{String(isStale)}</p>
        <p><strong>dataUpdatedAt：</strong>{dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "无"}</p>
      </div>

      <div style={{ backgroundColor: "#f6ffed", padding: "12px", borderRadius: "4px", fontSize: "13px", marginTop: "12px" }}>
        <strong>配置层级（优先级从低到高）：</strong>
        <ol style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
          <li>QueryClient defaultOptions（全局默认）</li>
          <li>queryClient.setQueryDefaults()（按 queryKey 前缀）</li>
          <li>useQuery 选项（单个查询，最高优先级）</li>
        </ol>
      </div>
    </div>
  );
}

// ============================================================================
// 第十部分：应用根组件
// ============================================================================

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <h1>React Query v5 - 缓存管理教程</h1>
        <p style={{ color: "#666" }}>
          本文件演示了 React Query 的缓存管理机制，包括缓存失效、预获取、直接修改缓存等。
        </p>

        <hr style={{ margin: "20px 0" }} />

        <InvalidateQueriesExample />
        <RemoveAndResetExample />
        <PrefetchExample />
        <SetQueryDataExample />
        <GetQueryDataExample />
        <PaginationCacheExample />
        <CacheTimeConfigExample />
      </div>
    </QueryClientProvider>
  );
}
