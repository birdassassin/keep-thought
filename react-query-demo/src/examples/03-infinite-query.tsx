/**
 * ============================================================================
 * 示例 03: React Query 无限查询（Infinite Query）
 * ============================================================================
 *
 * 本文件涵盖以下内容：
 * 1. useInfiniteQuery 基础用法
 * 2. 分页实现（传统翻页模式）
 * 3. 无限滚动实现（滚动加载更多）
 * 4. getNextPageParam 详解
 * 5. maxPages 限制（v5 新特性）
 * 6. fetchNextPage / hasNextPage / hasPreviousPage / fetchPreviousPage
 * 7. 分页缓存的数据结构
 *
 * 学习建议：学完 01-basics.tsx 后再来学习本文件。
 *           无限查询是处理分页数据的标准方式。
 * ============================================================================
 */

import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// 第一部分：模拟 API
// ============================================================================

/** 文章类型 */
interface Article {
  id: number;
  title: string;
  summary: string;
  author: string;
  createdAt: string;
  likes: number;
}

/** 分页响应类型 */
interface PageResponse<T> {
  items: T[];
  nextCursor: number | null;  // 下一页的游标（null 表示没有更多数据）
  prevCursor: number | null;  // 上一页的游标
  total: number;              // 总数
}

/**
 * 模拟文章数据库
 * 总共 100 篇文章
 */
const TOTAL_ARTICLES = 100;

function generateArticle(id: number): Article {
  return {
    id,
    title: `文章标题 ${id}: React Query 深入浅出`,
    summary: `这是第 ${id} 篇文章的摘要。本文将详细介绍 React Query 的各种用法和最佳实践。`,
    author: `作者 ${Math.ceil(id / 10)}`,
    createdAt: new Date(2025, 0, 1 + (id % 30)).toLocaleDateString("zh-CN"),
    likes: Math.floor(Math.random() * 1000),
  };
}

/**
 * 模拟分页获取文章（基于游标的分页）
 *
 * @param cursor - 当前页游标（页码）
 * @param limit - 每页数量
 * @returns 分页响应
 *
 * 【教学提示】
 * 基于游标的分页 vs 基于偏移量的分页：
 * - 游标分页：使用上一页最后一条记录的 ID 作为下一页的起点
 *   优点：性能好，不受数据增删影响
 *   缺点：不支持跳页
 * - 偏移分页：使用 page 和 limit 参数
 *   优点：支持跳页
 *   缺点：数据增删可能导致重复或遗漏
 *
 * 这里为了简化，使用页码作为游标
 */
async function fetchArticles(
  cursor: number = 1,
  limit: number = 10
): Promise<PageResponse<Article>> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 600));

  const start = (cursor - 1) * limit;
  const items = Array.from({ length: limit }, (_, i) =>
    generateArticle(start + i + 1)
  ).filter((article) => article.id <= TOTAL_ARTICLES);

  const totalPages = Math.ceil(TOTAL_ARTICLES / limit);

  return {
    items,
    nextCursor: cursor < totalPages ? cursor + 1 : null,
    prevCursor: cursor > 1 ? cursor - 1 : null,
    total: TOTAL_ARTICLES,
  };
}

// ============================================================================
// 第二部分：QueryClient 配置
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
    },
  },
});

// ============================================================================
// 第三部分：useInfiniteQuery 基础 - 传统翻页
// ============================================================================

/**
 * 示例 1：传统翻页模式
 *
 * 【教学提示】
 * useInfiniteQuery vs useQuery 的区别：
 * - useQuery：获取一页数据，切换页面时旧数据被替换
 * - useInfiniteQuery：获取多页数据，所有页面都保留在缓存中
 *
 * useInfiniteQuery 的核心概念：
 * - pageParams: 每一页的参数数组，如 [1, 2, 3]
 * - pages: 每一页的数据数组，与 pageParams 一一对应
 * - getNextPageParam: 根据最后一页的数据，决定下一页的参数
 *
 * 数据结构：
 * {
 *   pages: [
 *     { items: [...], nextCursor: 2, ... },  // 第 1 页
 *     { items: [...], nextCursor: 3, ... },  // 第 2 页
 *     { items: [...], nextCursor: null, ... }, // 第 3 页（最后一页）
 *   ],
 *   pageParams: [1, 2, 3]  // 每页对应的参数
 * }
 */
function TraditionalPaginationExample() {
  /**
   * useInfiniteQuery 配置
   */
  const {
    data,               // 包含 pages 和 pageParams 的对象
    isPending,          // 首次加载中
    isError,            // 是否有错误
    error,              // 错误对象
    isFetchingNextPage, // 是否正在获取下一页
    isFetchingPreviousPage, // 是否正在获取上一页
    hasNextPage,        // 是否有下一页
    hasPreviousPage,    // 是否有上一页
    fetchNextPage,      // 获取下一页
    fetchPreviousPage,  // 获取上一页
  } = useInfiniteQuery({
    /**
     * queryKey：查询键
     * 注意：不要把页码放在 queryKey 里！页码由 useInfiniteQuery 内部管理
     */
    queryKey: ["articles", "traditional"],

    /**
     * queryFn：查询函数
     *
     * 【教学提示】
     * 与 useQuery 不同，useInfiniteQuery 的 queryFn 接收一个包含 pageParam 的对象
     * - pageParam: 当前页的参数（由 getNextPageParam 返回）
     * - direction: 获取方向（'forward' | 'backward'）
     *
     * 第一次调用时，pageParam 的值来自 initialPageParam
     */
    queryFn: ({ pageParam }) => fetchArticles(pageParam, 10),

    /**
     * initialPageParam：第一页的参数
     * v5 新增：必须显式指定
     */
    initialPageParam: 1,

    /**
     * getNextPageParam：决定下一页参数的函数
     *
     * 【教学提示】
     * 参数：
     * - lastPage: 最后一页的数据（即 pages[pages.length - 1]）
     * - allPages: 所有页面的数据数组
     * - lastPageParam: 最后一页的参数（即 pageParams[pageParams.length - 1]）
     * - allPageParams: 所有页面的参数数组
     *
     * 返回值：
     * - 返回下一页的参数 → hasNextPage 为 true，可以调用 fetchNextPage
     * - 返回 undefined → hasNextPage 为 false，没有更多数据
     *
     * 这里我们使用 lastPage.nextCursor 作为下一页的参数
     * 如果 nextCursor 为 null，说明没有更多数据了
     */
    getNextPageParam: (lastPage) => lastPage.nextCursor,

    /**
     * getPreviousPageParam：决定上一页参数的函数（可选）
     * 与 getNextPageParam 类似，但用于向前翻页
     */
    getPreviousPageParam: (firstPage) => firstPage.prevCursor,
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 1：传统翻页模式</h3>

      {isPending && <div>加载中...</div>}
      {isError && <div style={{ color: "red" }}>出错了: {error?.message}</div>}

      {data && (
        <>
          {/* 文章列表 - 只显示当前最后一页 */}
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
            已加载 {data.pages.length} 页，
            共 {data.pages.reduce((sum, page) => sum + page.items.length, 0)} 条数据
            （总计 {data.pages[0]?.total} 条）
          </div>

          {/* 翻页控制 */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button
              onClick={() => fetchPreviousPage()}
              disabled={!hasPreviousPage || isFetchingPreviousPage}
              style={{ padding: "6px 16px" }}
            >
              {isFetchingPreviousPage ? "加载中..." : "上一页"}
            </button>
            <span style={{ lineHeight: "32px" }}>
              第 {data.pageParams.length} 页
            </span>
            <button
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              style={{ padding: "6px 16px" }}
            >
              {isFetchingNextPage ? "加载中..." : "下一页"}
            </button>
          </div>

          {/* 显示最后一页的数据 */}
          {data.pages[data.pages.length - 1]?.items.map((article) => (
            <div
              key={article.id}
              style={{
                padding: "12px",
                borderBottom: "1px solid #eee",
                backgroundColor: "#fafafa",
                marginBottom: "4px",
                borderRadius: "4px",
              }}
            >
              <h4 style={{ margin: "0 0 4px 0" }}>
                {article.id}. {article.title}
              </h4>
              <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: "13px" }}>
                {article.summary}
              </p>
              <div style={{ fontSize: "12px", color: "#999" }}>
                作者: {article.author} | 日期: {article.createdAt} | 点赞: {article.likes}
              </div>
            </div>
          ))}

          {/* 缓存数据结构展示 */}
          <details style={{ marginTop: "16px", fontSize: "13px" }}>
            <summary style={{ cursor: "pointer", color: "#1890ff" }}>
              查看缓存数据结构（pages 和 pageParams）
            </summary>
            <pre style={{
              backgroundColor: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
              overflow: "auto",
              maxHeight: "300px",
              fontSize: "12px",
            }}>
              {JSON.stringify({
                pageParams: data.pageParams,
                pagesCount: data.pages.length,
                pagesSummary: data.pages.map((p, i) => ({
                  pageIndex: i,
                  itemCount: p.items.length,
                  firstItemId: p.items[0]?.id,
                  lastItemId: p.items[p.items.length - 1]?.id,
                  nextCursor: p.nextCursor,
                })),
              }, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

// ============================================================================
// 第四部分：无限滚动实现
// ============================================================================

/**
 * 示例 2：无限滚动（向下滚动自动加载更多）
 *
 * 【教学提示】
 * 无限滚动的实现原理：
 * 1. 监听滚动事件（或使用 IntersectionObserver）
 * 2. 当用户滚动到列表底部时，调用 fetchNextPage()
 * 3. 新数据追加到已有数据后面
 *
 * IntersectionObserver 方式（推荐）：
 * - 性能更好，不需要频繁监听 scroll 事件
 * - 在列表底部放一个"哨兵"元素
 * - 当哨兵元素进入视口时，触发 fetchNextPage()
 */
function InfiniteScrollExample() {
  /**
   * 哨兵元素的 ref
   * 当这个元素进入视口时，触发加载更多
   */
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isPending,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["articles", "infinite-scroll"],
    queryFn: ({ pageParam }) => fetchArticles(pageParam, 5),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  /**
   * 使用 IntersectionObserver 监听哨兵元素
   *
   * 【教学提示】
   * IntersectionObserver 是浏览器原生 API，当目标元素进入/离开视口时触发回调。
   * 这比监听 scroll 事件性能更好。
   */
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      // 当哨兵元素进入视口，且还有更多数据，且没有正在加载
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1, // 当 10% 的元素可见时触发
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver]);

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 2：无限滚动</h3>

      <div style={{ backgroundColor: "#e6f7ff", padding: "12px", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
        <strong>使用说明：</strong>向下滚动列表，当到达底部时自动加载更多数据。
        使用 IntersectionObserver 监听哨兵元素实现。
      </div>

      {isPending && <div>加载中...</div>}
      {isError && <div style={{ color: "red" }}>出错了: {error?.message}</div>}

      {data && (
        <>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
            已加载 {data.pages.reduce((sum, page) => sum + page.items.length, 0)} / {data.pages[0]?.total} 条
          </div>

          {/* 所有页面的数据合并展示 */}
          <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #eee", borderRadius: "4px" }}>
            {data.pages.flatMap((page) => page.items).map((article) => (
              <div
                key={article.id}
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid #f0f0f0",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#999", marginRight: "8px" }}>#{article.id}</span>
                <span>{article.title}</span>
                <span style={{ float: "right", color: "#999", fontSize: "12px" }}>
                  {article.author}
                </span>
              </div>
            ))}

            {/* 哨兵元素 - 放在列表最底部 */}
            <div
              ref={observerRef}
              style={{
                padding: "16px",
                textAlign: "center",
                color: "#999",
                fontSize: "13px",
              }}
            >
              {isFetchingNextPage && "加载更多中..."}
              {!hasNextPage && data.pages.length > 0 && "已加载全部数据"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// 第五部分：maxPages 限制（v5 新特性）
// ============================================================================

/**
 * 示例 3：maxPages 限制最大页数
 *
 * 【教学提示】
 * maxPages 是 v5 新增的选项，用于限制 useInfiniteQuery 保留的最大页数。
 *
 * 为什么需要 maxPages？
 * - 无限滚动可能会积累大量页面数据，占用内存
 * - 设置 maxPages 后，超过限制的旧页面会被自动丢弃
 * - 适合"只往前看"的场景（如社交媒体信息流）
 *
 * 工作原理：
 * - maxPages: 3 → 只保留最新的 3 页数据
 * - 当获取第 4 页时，第 1 页的数据会被丢弃
 * - pageParams 也会相应更新
 */
function MaxPagesExample() {
  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["articles", "max-pages"],
    queryFn: ({ pageParam }) => fetchArticles(pageParam, 3),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,

    /**
     * maxPages: 限制保留的最大页数
     *
     * 【教学提示】
     * 设为 3：只保留最新的 3 页
     * 当加载第 4 页时，第 1 页被丢弃
     * pages 数组长度永远不会超过 3
     *
     * 注意：
     * - maxPages 只影响向前获取（fetchNextPage）
     * - 向后获取（fetchPreviousPage）不受影响
     * - 被丢弃的页面数据无法恢复，需要重新获取
     */
    maxPages: 3,
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 3：maxPages 限制（v5 新特性）</h3>

      <div style={{ backgroundColor: "#f9f0ff", padding: "12px", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
        <strong>maxPages = 3：</strong>只保留最新的 3 页数据。加载第 4 页后，第 1 页会被丢弃。
        观察下方"已加载页数"的变化。
      </div>

      {isPending && <div>加载中...</div>}

      {data && (
        <>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
            已加载页数: {data.pages.length} / 3（maxPages 限制）
            <br />
            已加载数据: {data.pages.reduce((sum, page) => sum + page.items.length, 0)} 条
          </div>

          <button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            style={{ padding: "6px 16px", marginBottom: "12px" }}
          >
            {isFetchingNextPage ? "加载中..." : hasNextPage ? "加载下一页" : "已全部加载"}
          </button>

          {/* 显示每页的摘要信息 */}
          {data.pages.map((page, index) => (
            <div
              key={data.pageParams[index]}
              style={{
                padding: "8px 12px",
                marginBottom: "4px",
                backgroundColor: "#fafafa",
                borderRadius: "4px",
                fontSize: "13px",
                borderLeft: "3px solid #722ed1",
              }}
            >
              第 {data.pageParams[index]} 页（共 {page.items.length} 条）：
              {page.items.map((a) => a.id).join(", ")}
            </div>
          ))}

          {/* pageParams 展示 */}
          <details style={{ marginTop: "12px", fontSize: "13px" }}>
            <summary style={{ cursor: "pointer", color: "#1890ff" }}>
              查看 pageParams 变化
            </summary>
            <pre style={{ backgroundColor: "#f5f5f5", padding: "12px", borderRadius: "4px" }}>
              {JSON.stringify({
                pageParams: data.pageParams,
                pagesCount: data.pages.length,
              }, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
}

// ============================================================================
// 第六部分：手动触发加载更多 + 重置
// ============================================================================

/**
 * 示例 4：手动加载更多 + 重置到第一页
 *
 * 【教学提示】
 * 有时候我们不使用无限滚动，而是用"加载更多"按钮。
 * 同时可能需要"重置"功能，回到第一页。
 */
function LoadMoreExample() {
  const queryClient = useQueryClient();

  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["articles", "load-more"],
    queryFn: ({ pageParam }) => fetchArticles(pageParam, 5),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  /**
   * 重置到第一页
   *
   * 【教学提示】
   * 使用 removeQueries 删除查询缓存，然后组件会重新挂载并从第一页开始获取。
   * 或者使用 resetInfiniteQuery（v5 中已移除，使用 removeQueries 替代）。
   */
  const handleReset = () => {
    queryClient.removeQueries({ queryKey: ["articles", "load-more"] });
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 4：手动加载更多 + 重置</h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          style={{ padding: "6px 16px" }}
        >
          {isFetchingNextPage ? "加载中..." : hasNextPage ? "加载更多" : "已全部加载"}
        </button>
        <button onClick={handleReset} style={{ padding: "6px 16px" }}>
          重置到第一页
        </button>
      </div>

      {isPending && <div>加载中...</div>}

      {data && (
        <>
          <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
            已加载 {data.pages.reduce((sum, page) => sum + page.items.length, 0)} / {data.pages[0]?.total} 条
          </div>

          {data.pages.flatMap((page) => page.items).map((article) => (
            <div
              key={article.id}
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #f0f0f0",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#999", marginRight: "8px" }}>#{article.id}</span>
              {article.title}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================================
// 第七部分：useInfiniteQuery 返回值详解
// ============================================================================

/**
 * 示例 5：返回值和状态详解
 *
 * 【教学提示】
 * useInfiniteQuery 返回的值比 useQuery 多了一些：
 * - data.pages: 所有页面的数据数组
 * - data.pageParams: 所有页面的参数数组
 * - fetchNextPage(): 获取下一页
 * - fetchPreviousPage(): 获取上一页
 * - hasNextPage: 是否有下一页（由 getNextPageParam 决定）
 * - hasPreviousPage: 是否有上一页（由 getPreviousPageParam 决定）
 * - isFetchingNextPage: 是否正在获取下一页
 * - isFetchingPreviousPage: 是否正在获取上一页
 */
function ReturnValueExample() {
  const result = useInfiniteQuery({
    queryKey: ["articles", "return-values"],
    queryFn: ({ pageParam }) => fetchArticles(pageParam, 5),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 5：useInfiniteQuery 返回值详解</h3>

      <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>属性</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>值</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>isPending</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{String(result.isPending)}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>首次加载中</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>isFetching</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{String(result.isFetching)}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>正在获取（含后台刷新）</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>isFetchingNextPage</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{String(result.isFetchingNextPage)}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>正在获取下一页</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>hasNextPage</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{String(result.hasNextPage)}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>是否有下一页</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>pages.length</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{result.data?.pages.length ?? 0}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>已加载的页数</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>pageParams</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>[{result.data?.pageParams.join(", ")}]</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>每页的参数</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>isError</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{String(result.isError)}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>是否有错误</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        onClick={() => result.fetchNextPage()}
        disabled={!result.hasNextPage || result.isFetchingNextPage}
        style={{ marginTop: "12px", padding: "6px 16px" }}
      >
        加载下一页
      </button>
    </div>
  );
}

// ============================================================================
// 第八部分：应用根组件
// ============================================================================

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <h1>React Query v5 - 无限查询教程</h1>
        <p style={{ color: "#666" }}>
          本文件演示了 useInfiniteQuery 的各种用法，包括传统翻页、无限滚动、maxPages 限制等。
        </p>

        <hr style={{ margin: "20px 0" }} />

        <TraditionalPaginationExample />
        <InfiniteScrollExample />
        <MaxPagesExample />
        <LoadMoreExample />
        <ReturnValueExample />
      </div>
    </QueryClientProvider>
  );
}
