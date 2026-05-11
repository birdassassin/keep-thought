/**
 * ============================================================================
 * 示例 05: React Query DevTools、并行查询、全局状态、自定义 Hook
 * ============================================================================
 *
 * 本文件涵盖以下内容：
 * 1. React Query DevTools 的配置和使用
 * 2. QueryObserver - 在组件外部观察查询状态
 * 3. useQueries - 并行执行多个查询
 * 4. useIsFetching - 全局加载状态
 * 5. useIsMutating - 全局 mutation 状态
 * 6. 自定义 Hook 封装查询逻辑
 *
 * 学习建议：学完前面的基础内容后再学习本文件。
 *           本文件侧重于开发效率和代码组织。
 * ============================================================================
 */

import {
  QueryClient,
  QueryClientProvider,
  QueryObserver,
  useIsFetching,
  useIsMutating,
  useMutation,
  useQuery,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";

// ============================================================================
// 第一部分：模拟 API
// ============================================================================

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

interface Stat {
  label: string;
  value: number;
  trend: "up" | "down" | "stable";
}

interface Notification {
  id: number;
  message: string;
  read: boolean;
  createdAt: string;
}

async function fetchUser(id: number): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 500));
  return {
    id,
    name: `用户 ${id}`,
    email: `user${id}@example.com`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${id}`,
  };
}

async function fetchStats(): Promise<Stat[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [
    { label: "总用户数", value: 12847, trend: "up" },
    { label: "今日活跃", value: 3421, trend: "up" },
    { label: "新增用户", value: 156, trend: "down" },
    { label: "转化率", value: 23, trend: "stable" },
  ];
}

async function fetchNotifications(): Promise<Notification[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    message: `通知 ${i + 1}: 你有新的消息`,
    read: i > 2,
    createdAt: new Date(Date.now() - i * 3600000).toLocaleString("zh-CN"),
  }));
}

async function markNotificationRead(id: number): Promise<Notification> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { id, message: "", read: true, createdAt: "" };
}

// ============================================================================
// 第二部分：QueryClient 配置
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    },
  },
});

// ============================================================================
// 第三部分：React Query DevTools 配置
// ============================================================================

/**
 * 示例 1：React Query DevTools
 *
 * 【教学提示】
 * React Query DevTools 是一个开发工具，帮助你：
 * - 查看所有查询的状态（fresh / stale / inactive / fetching）
 * - 查看查询的 queryKey、data、error
 * - 手动使查询失效、删除查询
 * - 查看查询的详细时间信息
 *
 * 安装：
 * npm install -D @tanstack/react-query-devtools
 *
 * 使用方式：
 * import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
 *
 * 放置位置：
 * 通常放在 QueryClientProvider 内部的最外层。
 * DevTools 会渲染一个浮动按钮，点击后展开面板。
 *
 * 注意：DevTools 只应在开发环境中使用！
 */

/**
 * DevTools 配置选项：
 *
 * <ReactQueryDevtools
 *   initialIsOpen={false}     // 初始是否展开面板
 *   position="bottom"         // 面板位置: "bottom" | "top" | "left" | "right"
 *   buttonPosition="bottom-right" // 按钮位置
 *   client={queryClient}      // 可选：指定 QueryClient
 * />
 *
 * 【教学提示】
 * 在生产环境中排除 DevTools：
 * 方式 1：使用条件渲染
 *   {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
 *
 * 方式 2：动态导入
 *   const ReactQueryDevtools = React.lazy(() =>
 *     import('@tanstack/react-query-devtools').then(d => ({
 *       default: d.ReactQueryDevtools
 *     }))
 *   );
 */

function DevToolsExample() {
  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 1：React Query DevTools 配置</h3>

      <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
        <p>
          <strong>安装：</strong>
          <code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: "3px" }}>
            npm install -D @tanstack/react-query-devtools
          </code>
        </p>

        <p><strong>基本用法：</strong></p>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
        }}>
{`import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      {/* DevTools 放在 Provider 内部 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}`}
        </pre>

        <p><strong>生产环境排除：</strong></p>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
        }}>
{`// 方式 1：条件渲染
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}

// 方式 2：动态导入（推荐）
import { lazy, Suspense } from 'react'
const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools')
    .then(d => ({ default: d.ReactQueryDevtools }))
)
// 使用时包裹 Suspense
<Suspense fallback={null}>
  <ReactQueryDevtools />
</Suspense>`}
        </pre>

        <p style={{ color: "#666" }}>
          提示：如果项目正确安装了 DevTools，页面右下角会出现一个花朵图标按钮。
          点击后可以查看所有查询的实时状态。
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 第四部分：useQueries - 并行查询
// ============================================================================

/**
 * 示例 2：useQueries - 并行执行多个查询
 *
 * 【教学提示】
 * useQueries 用于同时执行多个查询，每个查询有独立的 queryKey 和 queryFn。
 *
 * useQuery vs useQueries：
 * - useQuery: 执行单个查询
 * - useQueries: 执行多个查询，返回结果数组
 *
 * 使用场景：
 * 1. 仪表盘页面需要同时获取多个独立的数据源
 * 2. 用户列表需要获取每个用户的详细信息
 * 3. 任何需要并行获取多个独立数据的场景
 *
 * vs 多个 useQuery：
 * - useQueries 更灵活，查询数量可以动态变化
 * - useQueries 返回统一的结果数组，方便处理
 * - 多个 useQuery 适合查询数量固定的场景
 */
function UseQueriesExample() {
  const [userIds, setUserIds] = useState([1, 2, 3, 4, 5]);

  /**
   * useQueries 接收一个查询配置数组
   *
   * 【教学提示】
   * 每个查询配置和 useQuery 的配置类似，但不需要 queryKey 包裹在对象中。
   * 返回值是一个数组，每个元素对应一个查询的结果。
   *
   * 返回值类型：UseQueryResult[]
   * 每个元素包含：data, isPending, isError, error, isSuccess 等
   */
  const results = useQueries({
    queries: userIds.map((id) => ({
      queryKey: ["user", id],
      queryFn: () => fetchUser(id),
      /**
       * staleTime: 每个查询可以有自己的配置
       * 也可以不设置，使用全局默认值
       */
      staleTime: 60 * 1000,
    })),
  });

  /**
   * 计算整体状态
   *
   * 【教学提示】
   * useQueries 返回的是数组，你需要自己计算整体状态：
   * - 全部加载完成：every(result => !result.isPending)
   * - 任一加载失败：some(result => result.isError)
   * - 全部成功：every(result => result.isSuccess)
   */
  const allPending = results.every((r) => r.isPending);
  const anyError = results.some((r) => r.isError);
  const allSuccess = results.every((r) => r.isSuccess);
  const fetchingCount = results.filter((r) => r.isFetching).length;

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 2：useQueries - 并行查询</h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
        <span style={{ fontSize: "13px" }}>查询用户：</span>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((id) => (
          <button
            key={id}
            onClick={() => {
              setUserIds((prev) =>
                prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              );
            }}
            style={{
              padding: "2px 10px",
              fontSize: "13px",
              backgroundColor: userIds.includes(id) ? "#1890ff" : "#f0f0f0",
              color: userIds.includes(id) ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {id}
          </button>
        ))}
      </div>

      {/* 整体状态 */}
      <div style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
        查询数量: {results.length} |
        正在获取: {fetchingCount} |
        状态: {allPending ? "全部加载中" : anyError ? "部分失败" : allSuccess ? "全部成功" : "加载中"}
      </div>

      {/* 查询结果 */}
      {results.map((result, index) => (
        <div
          key={userIds[index]}
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {result.isPending && <span style={{ color: "#999" }}>加载用户 {userIds[index]} 中...</span>}
          {result.isError && <span style={{ color: "red" }}>用户 {userIds[index]} 加载失败</span>}
          {result.isSuccess && (
            <>
              <span style={{ fontWeight: "bold" }}>{result.data.name}</span>
              <span style={{ color: "#666" }}>{result.data.email}</span>
              {result.isFetching && (
                <span style={{ fontSize: "12px", color: "#1890ff" }}>刷新中...</span>
              )}
            </>
          )}
        </div>
      ))}

      <div style={{ backgroundColor: "#e6f7ff", padding: "12px", borderRadius: "4px", fontSize: "13px", marginTop: "12px" }}>
        <strong>useQueries 的优势：</strong>
        <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
          <li>查询数量可以动态变化（如上面的按钮切换）</li>
          <li>所有查询并行执行，不会互相阻塞</li>
          <li>返回统一的结果数组，方便统一处理</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// 第五部分：useIsFetching / useIsMutating - 全局状态
// ============================================================================

/**
 * 示例 3：useIsFetching / useIsMutating - 全局加载状态
 *
 * 【教学提示】
 * useIsFetching：返回当前正在获取的查询数量
 * - 不传参数：返回所有查询的获取数量
 * - 传入 filters：返回匹配查询的获取数量
 *
 * useIsMutating：返回当前正在进行的 mutation 数量
 *
 * 使用场景：
 * 1. 全局 loading 指示器（顶部进度条）
 * 2. 防止重复提交（有 mutation 进行中时禁用按钮）
 * 3. 在导航栏显示数据同步状态
 */
function GlobalStateExample() {
  /**
   * useIsFetching：获取正在进行的查询数量
   *
   * 【教学提示】
   * 返回值是一个数字，表示当前正在 fetching 的查询数量
   * 当没有任何查询在获取时，返回 0
   *
   * 可以传入 filters 参数来筛选：
   * useIsFetching({ queryKey: ['users'] })  → 只统计 users 相关的查询
   * useIsFetching({ status: 'stale' })      → 只统计过期的查询
   */
  const isFetching = useIsFetching();

  /**
   * useIsMutating：获取正在进行的 mutation 数量
   */
  const isMutating = useIsMutating();

  // 演示用：创建一些查询和 mutation
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 3：useIsFetching / useIsMutating - 全局状态</h3>

      {/* 全局状态指示器 */}
      <div style={{
        padding: "12px",
        borderRadius: "4px",
        marginBottom: "12px",
        backgroundColor: isFetching > 0 || isMutating > 0 ? "#fffbe6" : "#f6ffed",
        border: `1px solid ${isFetching > 0 || isMutating > 0 ? "#ffe58f" : "#b7eb8f"}`,
      }}>
        <div style={{ display: "flex", gap: "16px", fontSize: "14px" }}>
          <span>
            正在获取的查询数: <strong>{isFetching}</strong>
          </span>
          <span>
            正在进行的 mutation 数: <strong>{isMutating}</strong>
          </span>
        </div>
        {(isFetching > 0 || isMutating > 0) && (
          <div style={{ marginTop: "8px", fontSize: "13px", color: "#666" }}>
            有数据正在同步中...
          </div>
        )}
      </div>

      {/* 统计数据 */}
      {stats && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#fafafa",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: "bold" }}>{stat.value}</div>
              <div style={{ fontSize: "13px", color: "#666" }}>{stat.label}</div>
              <div style={{
                fontSize: "12px",
                color: stat.trend === "up" ? "#52c41a" : stat.trend === "down" ? "#ff4d4f" : "#999",
              }}>
                {stat.trend === "up" ? "上升" : stat.trend === "down" ? "下降" : "稳定"}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 通知列表 */}
      {notifications && (
        <div style={{ marginBottom: "12px" }}>
          <strong style={{ fontSize: "14px" }}>通知：</strong>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "8px 12px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: n.read ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: "13px" }}>{n.message}</span>
              {!n.read && (
                <button
                  onClick={() => markReadMutation.mutate(n.id)}
                  style={{ fontSize: "12px", padding: "2px 8px" }}
                >
                  标为已读
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: "13px", color: "#666" }}>
        <p>提示：刷新页面时观察上方的全局状态指示器变化。</p>
      </div>
    </div>
  );
}

// ============================================================================
// 第六部分：QueryObserver - 在组件外部观察查询
// ============================================================================

/**
 * 示例 4：QueryObserver - 组件外部的查询观察
 *
 * 【教学提示】
 * QueryObserver 允许你在 React 组件外部观察查询状态。
 * 它不会触发组件重新渲染，但可以通过回调获取状态变化。
 *
 * 使用场景：
 * 1. 在非 React 代码中集成 React Query
 * 2. 在事件处理器中获取查询状态
 * 3. 在第三方库中观察 React Query 的查询
 * 4. 创建自定义的订阅机制
 *
 * QueryObserver vs useQuery：
 * - useQuery: React Hook，自动触发重新渲染
 * - QueryObserver: 类实例，手动订阅/取消订阅，不触发渲染
 */
function QueryObserverExample() {
  const queryClient = useQueryClient();
  const [log, setLog] = useState<string[]>([]);
  const observerRef = useRef<QueryObserver | null>(null);

  /**
   * 创建 QueryObserver
   *
   * 【教学提示】
   * QueryObserver 构造函数接收 QueryClient 和查询配置。
   * 它不会自动开始观察，需要调用 subscribe() 方法。
   */
  const startObserving = () => {
    if (observerRef.current) {
      setLog((prev) => [...prev, "已经在观察中了"]);
      return;
    }

    const observer = new QueryObserver(queryClient, {
      queryKey: ["observer-demo"],
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return `观察数据 ${new Date().toLocaleTimeString()}`;
      },
    });

    /**
     * subscribe 方法订阅查询状态变化
     *
     * 【教学提示】
     * subscribe 返回一个 unsubscribe 函数。
     * 每次查询状态变化时，回调会被调用。
     * 回调参数包含：data, error, isPending, isFetching, isSuccess 等。
     */
    const unsubscribe = observer.subscribe((result) => {
      setLog((prev) => [
        ...prev.slice(-9), // 只保留最近 10 条日志
        `[${new Date().toLocaleTimeString()}] 状态变化: fetching=${String(result.isFetching)}, pending=${String(result.isPending)}, data=${result.data ?? "无"}`,
      ]);
    });

    observerRef.current = observer;
    setLog((prev) => [...prev, "开始观察 ['observer-demo'] 查询"]);
  };

  const stopObserving = () => {
    if (observerRef.current) {
      observerRef.current.unsubscribe();
      observerRef.current = null;
      setLog((prev) => [...prev, "停止观察"]);
    }
  };

  const triggerRefetch = () => {
    /**
     * 使用 QueryObserver 触发重新获取
     *
     * 【教学提示】
     * observer.refetch() 可以手动触发重新获取
     * 也可以通过 queryClient.invalidateQueries 触发
     */
    queryClient.invalidateQueries({ queryKey: ["observer-demo"] });
    setLog((prev) => [...prev, "手动触发 invalidateQueries"]);
  };

  // 清理
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.unsubscribe();
      }
    };
  }, []);

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 4：QueryObserver - 组件外部观察</h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={startObserving} style={{ padding: "6px 16px" }}>
          开始观察
        </button>
        <button onClick={stopObserving} style={{ padding: "6px 16px" }}>
          停止观察
        </button>
        <button onClick={triggerRefetch} style={{ padding: "6px 16px" }}>
          触发刷新
        </button>
      </div>

      {/* 观察日志 */}
      <div style={{
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        padding: "12px",
        borderRadius: "4px",
        fontFamily: "monospace",
        fontSize: "12px",
        maxHeight: "200px",
        overflowY: "auto",
      }}>
        {log.length === 0 ? (
          <span style={{ color: "#666" }}>点击"开始观察"查看日志...</span>
        ) : (
          log.map((entry, i) => (
            <div key={i} style={{ marginBottom: "2px" }}>{entry}</div>
          ))
        )}
      </div>

      <div style={{ fontSize: "13px", color: "#666", marginTop: "8px" }}>
        <p>QueryObserver 不会触发 React 组件重新渲染，适合在非 React 环境中使用。</p>
      </div>
    </div>
  );
}

// ============================================================================
// 第七部分：自定义 Hook 封装
// ============================================================================

/**
 * 示例 5：自定义 Hook 封装查询逻辑
 *
 * 【教学提示】
 * 自定义 Hook 是组织 React Query 代码的最佳实践。
 *
 * 好处：
 * 1. 复用查询逻辑（多个组件共享相同的查询）
 * 2. 封装 queryKey 和 queryFn，保持一致性
 * 3. 提供类型安全的 API
 * 4. 隐藏实现细节，提供简洁的接口
 *
 * 命名约定：
 * - 查询 Hook: use + 名词，如 useUser、usePosts
 * - Mutation Hook: use + 动词 + 名词，如 useCreatePost、useDeleteUser
 */

/**
 * 自定义 Hook: useUser
 * 封装用户查询逻辑
 *
 * 【教学提示】
 * 将 queryKey 和 queryFn 封装在 Hook 内部，
 * 外部只需要传入 id 即可，不需要关心查询细节。
 */
function useUser(id: number | null) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id!),
    enabled: id !== null,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * 自定义 Hook: useStats
 * 封装统计数据查询
 */
function useStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 自定义 Hook: useMarkNotificationRead
 * 封装标记已读的 mutation
 */
function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * 自定义 Hook: useUsers (批量)
 * 使用 useQueries 批量获取多个用户
 */
function useUsers(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["user", id] as const,
      queryFn: () => fetchUser(id),
      staleTime: 2 * 60 * 1000,
    })),
  });
}

/**
 * 使用自定义 Hook 的组件
 */
function CustomHookExample() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(1);

  // 使用自定义 Hook - 简洁清晰
  const { data: user, isPending: isUserPending } = useUser(selectedUserId);
  const { data: stats, isPending: isStatsPending } = useStats();
  const markRead = useMarkNotificationRead();

  // 批量获取用户
  const teamResults = useUsers([1, 2, 3]);

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 5：自定义 Hook 封装</h3>

      <div style={{ backgroundColor: "#f6ffed", padding: "12px", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
        <strong>自定义 Hook 的好处：</strong>
        <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
          <li>复用查询逻辑，多个组件共享</li>
          <li>封装 queryKey 和 queryFn，保持一致性</li>
          <li>提供类型安全的 API</li>
          <li>隐藏实现细节</li>
        </ul>
      </div>

      {/* 使用 useUser Hook */}
      <div style={{ marginBottom: "16px" }}>
        <h4 style={{ fontSize: "14px" }}>useUser Hook</h4>
        <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
          {[1, 2, 3, 4, 5].map((id) => (
            <button
              key={id}
              onClick={() => setSelectedUserId(id)}
              style={{
                padding: "2px 10px",
                fontSize: "13px",
                backgroundColor: selectedUserId === id ? "#1890ff" : "#f0f0f0",
                color: selectedUserId === id ? "white" : "black",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              用户 {id}
            </button>
          ))}
        </div>
        {isUserPending && <div style={{ fontSize: "13px" }}>加载用户中...</div>}
        {user && (
          <div style={{ fontSize: "13px", backgroundColor: "#fafafa", padding: "8px", borderRadius: "4px" }}>
            {user.name} - {user.email}
          </div>
        )}
      </div>

      {/* 使用 useStats Hook */}
      <div style={{ marginBottom: "16px" }}>
        <h4 style={{ fontSize: "14px" }}>useStats Hook</h4>
        {isStatsPending && <div style={{ fontSize: "13px" }}>加载统计中...</div>}
        {stats && (
          <div style={{ display: "flex", gap: "8px" }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                padding: "8px",
                backgroundColor: "#fafafa",
                borderRadius: "4px",
                fontSize: "13px",
                textAlign: "center",
              }}>
                <div style={{ fontWeight: "bold" }}>{s.value}</div>
                <div style={{ color: "#666" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 使用 useUsers Hook (批量) */}
      <div style={{ marginBottom: "16px" }}>
        <h4 style={{ fontSize: "14px" }}>useUsers Hook (批量)</h4>
        <div style={{ fontSize: "13px" }}>
          {teamResults.map((result, i) => (
            <span key={i} style={{ marginRight: "12px" }}>
              {result.isPending ? "加载中..." : result.data?.name}
            </span>
          ))}
        </div>
      </div>

      {/* 代码示例 */}
      <details style={{ fontSize: "13px" }}>
        <summary style={{ cursor: "pointer", color: "#1890ff" }}>
          查看自定义 Hook 代码
        </summary>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
          marginTop: "8px",
        }}>
{`// 自定义查询 Hook
function useUser(id: number | null) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id!),
    enabled: id !== null,
    staleTime: 2 * 60 * 1000,
  });
}

// 自定义 mutation Hook
function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"]
      });
    },
  });
}

// 批量查询 Hook
function useUsers(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["user", id] as const,
      queryFn: () => fetchUser(id),
      staleTime: 2 * 60 * 1000,
    })),
  });
}`}
        </pre>
      </details>
    </div>
  );
}

// ============================================================================
// 第八部分：全局 Loading 指示器
// ============================================================================

/**
 * 示例 6：全局 Loading 指示器
 *
 * 【教学提示】
 * 这是一个实际应用中常见的模式：
 * 在应用顶部显示一个全局 loading 条，当有任何查询在获取时显示。
 */
function GlobalLoadingIndicator() {
  const isFetching = useIsFetching();

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: "3px",
      backgroundColor: "#e8e8e8",
      zIndex: 9999,
    }}>
      {isFetching > 0 && (
        <div
          style={{
            height: "100%",
            backgroundColor: "#1890ff",
            transition: "width 0.3s ease",
            width: isFetching > 0 ? "100%" : "0%",
            animation: "loading 1.5s ease-in-out infinite",
          }}
        />
      )}
      <style>{`
        @keyframes loading {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// 第九部分：应用根组件
// ============================================================================

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 全局 Loading 指示器 */}
      <GlobalLoadingIndicator />

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <h1>React Query v5 - DevTools 与高级模式教程</h1>
        <p style={{ color: "#666" }}>
          本文件演示了 DevTools 配置、并行查询、全局状态、QueryObserver 和自定义 Hook。
        </p>

        <hr style={{ margin: "20px 0" }} />

        <DevToolsExample />
        <UseQueriesExample />
        <GlobalStateExample />
        <QueryObserverExample />
        <CustomHookExample />
      </div>

      {/*
        取消下面注释以启用 DevTools（需要先安装 @tanstack/react-query-devtools）：

        import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
        ...
        <ReactQueryDevtools initialIsOpen={false} />
      */}
    </QueryClientProvider>
  );
}
