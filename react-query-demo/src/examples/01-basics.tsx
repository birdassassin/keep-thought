/**
 * ============================================================================
 * 示例 01: React Query 基础用法
 * ============================================================================
 *
 * 本文件涵盖以下内容：
 * 1. QueryClient 的创建与配置
 * 2. QueryClientProvider 的使用
 * 3. useQuery 的基础用法
 * 4. queryKey 的设计原则
 * 5. queryFn 的编写
 * 6. loading / error / data 三种状态的处理
 * 7. staleTime 和 gcTime 的配置与区别
 *
 * 学习建议：这是最基础的示例，请务必先理解本文件的内容再继续后续学习。
 * ============================================================================
 */

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState } from "react";

// ============================================================================
// 第一部分：模拟 API 数据
// ============================================================================
// 在实际项目中，这些函数会调用真实的后端 API（如 fetch、axios）。
// 这里我们用模拟数据来演示，方便你独立运行本文件。

/** 用户类型定义 */
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

/** 待办事项类型定义 */
interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

/**
 * 模拟获取用户列表
 * @param page - 页码（从 1 开始）
 * @param limit - 每页数量
 * @returns 用户列表
 *
 * 【教学提示】
 * queryFn 必须返回一个 Promise。可以是：
 * - fetch() 返回的 Promise
 * - axios.get() 返回的 Promise
 * - 自己 new Promise() 包装的异步操作
 */
async function fetchUsers(page = 1, limit = 10): Promise<User[]> {
  // 模拟网络延迟（800ms）
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 模拟数据
  const allUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `用户 ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? "管理员" : i % 3 === 1 ? "编辑" : "普通用户",
  }));

  const start = (page - 1) * limit;
  return allUsers.slice(start, start + limit);
}

/**
 * 模拟获取单个用户详情
 * @param id - 用户 ID
 * @returns 用户详情
 */
async function fetchUserById(id: number): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    id,
    name: `用户 ${id}`,
    email: `user${id}@example.com`,
    role: id % 3 === 0 ? "管理员" : id % 3 === 1 ? "编辑" : "普通用户",
  };
}

/**
 * 模拟获取待办事项列表
 * @returns 待办事项数组
 */
async function fetchTodos(): Promise<Todo[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `待办事项 ${i + 1}`,
    completed: i % 3 === 0,
    userId: (i % 5) + 1,
  }));
}

// ============================================================================
// 第二部分：创建和配置 QueryClient
// ============================================================================
/**
 * QueryClient 是 React Query 的核心。
 * 它管理着所有的查询缓存（QueryCache）和变更缓存（MutationCache）。
 *
 * 【教学提示】
 * - 通常在应用的最外层创建一个 QueryClient 实例
 * - 使用 React.useRef 或在组件外部创建，避免每次渲染都创建新实例
 * - 可以通过 defaultOptions 设置全局默认配置
 */
const queryClient = new QueryClient({
  defaultOptions: {
    /**
     * queries 全局默认配置
     * 这些配置会应用到所有 useQuery 调用中，
     * 但每个 useQuery 可以单独覆盖这些配置
     */
    queries: {
      /**
       * staleTime（数据新鲜时间）
       * - 默认值：0（数据立即过期）
       * - 含义：在这个时间窗口内，React Query 认为数据是"新鲜的"，
       *         不会重新请求，直接使用缓存
       * - 单位：毫秒
       *
       * 【教学提示】
       * 设为 0：每次组件挂载都会重新请求（适合频繁变化的数据）
       * 设为 5 * 60 * 1000（5分钟）：5分钟内不会重新请求
       * 设为 Infinity：永远不会自动重新请求（完全手动控制）
       */
      staleTime: 0,

      /**
       * gcTime（垃圾回收时间，v5 之前叫 cacheTime）
       * - 默认值：5 * 60 * 1000（5分钟）
       * - 含义：当查询数据不再被任何组件使用时，
       *         数据会在缓存中保留这么长时间，之后被垃圾回收
       * - 单位：毫秒
       *
       * 【教学提示】
       * staleTime vs gcTime 的区别：
       * - staleTime 控制"数据什么时候过期"（过期后会在后台重新获取）
       * - gcTime 控制"数据什么时候从缓存中删除"（删除后需要重新加载）
       *
       * gcTime 必须大于 staleTime，否则数据还没过期就被删除了
       */
      gcTime: 5 * 60 * 1000,

      /**
       * retry（失败重试次数）
       * - 默认值：3
       * - 设为 false 表示不重试
       * - 也可以传入函数：retry: (failureCount, error) => failureCount < 3
       */
      retry: 3,

      /**
       * refetchOnWindowFocus（窗口聚焦时重新获取）
       * - 默认值：true
       * - 当用户切换到其他标签页再切回来时，自动重新获取数据
       * - 适合大多数场景，但某些数据（如表单草稿）可能不需要
       */
      refetchOnWindowFocus: true,

      /**
       * refetchOnReconnect（网络重连时重新获取）
       * - 默认值：true
       * - 当网络断开后重新连接时，自动重新获取数据
       */
      refetchOnReconnect: true,

      /**
       * refetchOnMount（组件挂载时重新获取）
       * - 默认值：true（如果数据过期）
       * - 设为 true：组件每次挂载时，如果数据过期就重新获取
       * - 设为 false：组件挂载时不重新获取，直接用缓存
       * - 设为 "always"：无论数据是否过期都重新获取
       */
      refetchOnMount: true,
    },
  },
});

// ============================================================================
// 第三部分：queryKey 设计原则
// ============================================================================
/**
 * queryKey 是查询的唯一标识符，用于：
 * 1. 缓存匹配：相同 queryKey 的查询共享缓存
 * 2. 缓存操作：invalidateQueries、removeQueries 等通过 queryKey 定位缓存
 * 3. 依赖追踪：React Query 内部通过 queryKey 追踪查询依赖
 *
 * 【设计原则】
 * 1. 必须是数组（推荐）或字符串
 * 2. 从一般到具体，层级结构
 * 3. 包含所有影响查询结果的参数
 * 4. 保持序列化（不要放函数、DOM 元素等）
 *
 * 【示例】
 * ['todos']                          → 所有待办事项
 * ['todos', { status: 'done' }]      → 已完成的待办事项
 * ['todos', { page: 1, limit: 10 }]  → 第1页待办事项
 * ['user', 42]                       → ID 为 42 的用户
 * ['user', 42, 'posts']              → ID 为 42 的用户的文章
 */

// ============================================================================
// 第四部分：基础查询示例组件
// ============================================================================

/**
 * 示例 1：最简单的 useQuery 用法
 *
 * 【教学提示】
 * useQuery 接收一个配置对象，必须包含：
 * - queryKey: 查询键（数组格式）
 * - queryFn: 查询函数（返回 Promise）
 *
 * 返回值包含：
 * - data: 查询返回的数据
 * - isPending (v5推荐) / isLoading: 是否正在加载
 * - error: 错误对象
 * - isError: 是否有错误
 * - isSuccess: 是否成功
 * - isFetching: 是否正在获取（包括后台刷新）
 */
function BasicQueryExample() {
  const {
    data: todos,
    isPending,    // v5 推荐使用 isPending 替代 isLoading
    isLoading,    // v5 中仍可用，但语义上 isPending 更准确
    error,
    isError,
    isSuccess,
    isFetching,   // 是否正在获取数据（包括后台刷新）
  } = useQuery({
    queryKey: ["todos"],           // 查询键：标识这个查询
    queryFn: fetchTodos,           // 查询函数：实际获取数据
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 1：基础查询 - 待办事项列表</h3>

      {/* 状态 1：加载中 */}
      {isPending && (
        <div style={{ color: "#666" }}>
          加载中...（isPending: {String(isPending)}, isLoading: {String(isLoading)}）
        </div>
      )}

      {/* 状态 2：加载失败 */}
      {isError && (
        <div style={{ color: "red" }}>
          出错了: {error?.message}
        </div>
      )}

      {/* 状态 3：加载成功 */}
      {isSuccess && (
        <div>
          {/* isFetching 表示是否正在获取数据（包括后台刷新） */}
          {isFetching && (
            <div style={{ color: "#1890ff", fontSize: "12px" }}>
              正在后台刷新数据...
            </div>
          )}
          <p>共获取 {todos?.length} 条待办事项：</p>
          <ul>
            {todos?.map((todo) => (
              <li key={todo.id} style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
                {todo.title} {todo.completed ? "(已完成)" : "(未完成)"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 2：带参数的查询
 *
 * 【教学提示】
 * 当查询需要参数时，将参数放入 queryKey 中。
 * 这样不同的参数会产生不同的缓存条目。
 *
 * 注意：queryFn 中如何获取 queryKey 的参数？
 * - 方式 1：使用 useQuery 的对象形式，在 queryFn 中通过闭包获取参数（推荐）
 * - 方式 2：使用函数形式的 queryKey，在 queryFn 中通过 queryKey 参数获取
 */
function QueryWithParamsExample() {
  const [page, setPage] = useState(1);

  const {
    data: users,
    isPending,
    isError,
    error,
    isSuccess,
  } = useQuery({
    /**
     * queryKey 包含查询参数
     * 当 page 变化时，queryKey 变化，React Query 会自动发起新的请求
     *
     * 【教学提示】
     * queryKey 的变化会触发新的查询，但旧的缓存不会被删除（受 gcTime 控制）
     */
    queryKey: ["users", { page, limit: 5 }],
    queryFn: () => fetchUsers(page, 5),
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 2：带参数的查询 - 用户列表（分页）</h3>

      {/* 分页控制 */}
      <div style={{ marginBottom: "12px" }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          上一页
        </button>
        <span style={{ margin: "0 12px" }}>第 {page} 页</span>
        <button onClick={() => setPage((p) => p + 1)}>下一页</button>
      </div>

      {/* 当前 queryKey 显示（帮助理解缓存机制） */}
      <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
        当前 queryKey: ["users", {"{ page: "}{page}{", limit: 5 }}"]
      </div>

      {isPending && <div>加载用户列表中...</div>}
      {isError && <div style={{ color: "red" }}>出错了: {error?.message}</div>}

      {isSuccess && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>姓名</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>邮箱</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>角色</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.id}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.name}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.email}</td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/**
 * 示例 3：条件查询（enabled 选项）
 *
 * 【教学提示】
 * 有时候我们不想在组件挂载时立即发起查询，而是等待某个条件满足后再查询。
 * 例如：用户选择了某个选项后才查询详情。
 *
 * 使用 enabled 选项：
 * - enabled: false → 查询不会自动执行
 * - enabled: true → 查询正常执行（默认值）
 * - enabled: someCondition → 根据条件决定是否执行
 */
function ConditionalQueryExample() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const {
    data: user,
    isPending,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["user", selectedUserId],
    queryFn: () => fetchUserById(selectedUserId!),
    /**
     * enabled 选项：
     * - 当 selectedUserId 为 null 时，查询不会执行
     * - 当 selectedUserId 有值时，查询才会执行
     *
     * 【教学提示】
     * 即使 enabled 为 false，如果缓存中有匹配的数据，data 仍然可用
     * 这意味着切换用户时，会先显示上一个用户的缓存数据，然后更新为新数据
     */
    enabled: selectedUserId !== null,
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 3：条件查询 - 用户详情</h3>

      {/* 用户选择按钮 */}
      <div style={{ marginBottom: "12px" }}>
        <span>选择用户：</span>
        {[1, 2, 3, 4, 5].map((id) => (
          <button
            key={id}
            onClick={() => setSelectedUserId(id)}
            style={{
              margin: "0 4px",
              fontWeight: selectedUserId === id ? "bold" : "normal",
              backgroundColor: selectedUserId === id ? "#1890ff" : "#f0f0f0",
              color: selectedUserId === id ? "white" : "black",
              border: "none",
              padding: "4px 12px",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            用户 {id}
          </button>
        ))}
      </div>

      {/* 未选择用户时的提示 */}
      {!selectedUserId && (
        <div style={{ color: "#999" }}>请点击上方按钮选择一个用户查看详情</div>
      )}

      {/* 查询结果 */}
      {selectedUserId && isPending && <div>加载用户详情中...</div>}
      {selectedUserId && isError && (
        <div style={{ color: "red" }}>出错了: {error?.message}</div>
      )}
      {selectedUserId && isSuccess && user && (
        <div style={{ backgroundColor: "#f9f9f9", padding: "12px", borderRadius: "4px" }}>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>姓名:</strong> {user.name}</p>
          <p><strong>邮箱:</strong> {user.email}</p>
          <p><strong>角色:</strong> {user.role}</p>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 4：staleTime 和 gcTime 的区别演示
 *
 * 【教学提示】
 * staleTime 和 gcTime 是 React Query 中最容易混淆的两个概念：
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    数据生命周期                               │
 * │                                                             │
 * │  获取数据 ──→ [新鲜期: staleTime] ──→ [过期期] ──→ [垃圾回收]  │
 * │                  ↑                      │                    │
 * │            不重新请求               后台重新请求              │
 * │            直接用缓存               但先显示旧数据            │
 * │                                                             │
 * │  ─────────────────────────────────────────────────────────  │
 * │  如果在 gcTime 内没有组件使用这个缓存 → 数据被删除              │
 * └─────────────────────────────────────────────────────────────┘
 *
 * - staleTime: 数据被视为"新鲜"的时间。在这个时间内，不会重新请求。
 * - gcTime: 缓存数据在内存中保留的时间（即使没有组件在使用）。
 */
function StaleTimeVsGcTimeExample() {
  const [fetchCount, setFetchCount] = useState(0);

  const {
    data,
    isPending,
    dataUpdatedAt,    // 数据最后更新的时间戳
  } = useQuery({
    queryKey: ["stale-demo"],
    queryFn: async () => {
      // 每次实际请求时增加计数
      setFetchCount((c) => c + 1);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return `数据获取于 ${new Date().toLocaleTimeString()}`;
    },
    /**
     * staleTime: 10 秒
     * 在 10 秒内，即使组件重新渲染或重新挂载，也不会发起新请求
     * 10 秒后，如果组件重新挂载，会在后台发起新请求
     */
    staleTime: 10 * 1000,

    /**
     * gcTime: 30 秒
     * 即使没有组件在使用这个查询，缓存也会保留 30 秒
     * 30 秒后，缓存被清除，下次需要时必须重新加载
     */
    gcTime: 30 * 1000,
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 4：staleTime vs gcTime</h3>

      <div style={{ marginBottom: "12px", fontSize: "13px", lineHeight: "1.8" }}>
        <p><strong>配置：</strong>staleTime = 10秒, gcTime = 30秒</p>
        <p><strong>实际请求次数：</strong>{fetchCount}</p>
        <p><strong>数据最后更新：</strong>{dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "无"}</p>
        <p><strong>当前数据：</strong>{data || "暂无数据"}</p>
      </div>

      <div style={{ backgroundColor: "#fffbe6", padding: "12px", borderRadius: "4px", fontSize: "13px" }}>
        <strong>试试看：</strong>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>在 10 秒内反复点击下面的按钮 → 请求次数不会增加（数据还是新鲜的）</li>
          <li>等待 10 秒后再点击 → 请求次数会增加（数据过期了）</li>
          <li>卸载组件 30 秒后再挂载 → 请求次数会增加（缓存被回收了）</li>
        </ul>
      </div>

      {isPending && <div>加载中...</div>}
      {data && <div style={{ marginTop: "8px" }}>数据: {data}</div>}
    </div>
  );
}

/**
 * 示例 5：手动刷新和禁用自动刷新
 */
function ManualRefreshExample() {
  const {
    data,
    isPending,
    isFetching,
    refetch,          // 手动触发重新获取
  } = useQuery({
    queryKey: ["manual-refresh"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        time: new Date().toLocaleTimeString(),
        random: Math.random().toFixed(4),
      };
    },
    /**
     * 禁用所有自动刷新行为
     * - refetchOnWindowFocus: false → 切换标签页不刷新
     * - refetchOnReconnect: false → 网络重连不刷新
     * - refetchOnMount: false → 组件挂载不刷新
     *
     * 【教学提示】
     * 这种配置适合：数据几乎不变、需要用户手动控制刷新的场景
     */
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 5：手动刷新</h3>

      <p style={{ fontSize: "13px", color: "#666" }}>
        已禁用所有自动刷新，只有点击按钮才会获取新数据
      </p>

      <button
        onClick={() => refetch()}
        disabled={isFetching}
        style={{
          marginTop: "8px",
          padding: "6px 16px",
          cursor: isFetching ? "not-allowed" : "pointer",
        }}
      >
        {isFetching ? "刷新中..." : "手动刷新"}
      </button>

      {isPending && <div>首次加载中...</div>}
      {data && (
        <div style={{ marginTop: "8px", fontSize: "13px" }}>
          <p>获取时间: {data.time}</p>
          <p>随机数: {data.random}</p>
        </div>
      )}
    </div>
  );
}

/**
 * 示例 6：在组件外使用 queryClient（命令式操作）
 *
 * 【教学提示】
 * 除了在组件内使用 useQuery，你还可以在组件外部通过 queryClient
 * 进行命令式的缓存操作。这在事件处理器、路由守卫等场景中很有用。
 */
function ImperativeQueryExample() {
  const queryClient = useQueryClient();

  const handlePrefetch = () => {
    /**
     * prefetchQuery：预获取数据
     * 在数据被需要之前就获取并缓存，用户看到时直接显示缓存
     *
     * 【教学提示】
     * 常见场景：
     * - 鼠标悬停在链接上时预获取详情页数据
     * - 分页列表中预获取下一页
     */
    queryClient.prefetchQuery({
      queryKey: ["users", { page: 2, limit: 5 }],
      queryFn: () => fetchUsers(2, 5),
    });
    alert("已预获取第 2 页用户数据（查看 DevTools 可确认）");
  };

  const handleSetData = () => {
    /**
     * setQueryData：直接设置缓存数据
     * 不发起网络请求，直接修改缓存中的数据
     *
     * 【教学提示】
     * 常见场景：
     * - 乐观更新：先更新 UI，再发送请求
     * - 初始化缓存：SSR 时将服务端数据注入缓存
     */
    queryClient.setQueryData<Todo[]>(["todos"], (oldData) => {
      if (!oldData) return oldData;
      // 在列表开头添加一条新的待办事项
      return [
        {
          id: Date.now(),
          title: "通过 setQueryData 添加的待办",
          completed: false,
          userId: 1,
        },
        ...oldData,
      ];
    });
    alert("已通过 setQueryData 向 todos 缓存添加了一条数据");
  };

  const handleGetData = () => {
    /**
     * getQueryData：读取缓存数据
     * 不发起网络请求，直接从缓存中读取
     *
     * 【教学提示】
     * 返回值可能是 undefined（缓存中没有数据时）
     */
    const data = queryClient.getQueryData<Todo[]>(["todos"]);
    alert(
      `缓存中的 todos 数据：\n${JSON.stringify(data?.slice(0, 3), null, 2)}...`
    );
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 6：命令式缓存操作</h3>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button onClick={handlePrefetch}>预获取第 2 页</button>
        <button onClick={handleSetData}>向缓存添加数据</button>
        <button onClick={handleGetData}>读取缓存数据</button>
      </div>

      <p style={{ fontSize: "13px", color: "#666", marginTop: "8px" }}>
        提示：操作后查看 React Query DevTools 可以看到缓存变化
      </p>
    </div>
  );
}

// ============================================================================
// 第五部分：应用根组件
// ============================================================================

/**
 * App 组件 - 整合所有示例
 *
 * 【教学提示】
 * QueryClientProvider 必须包裹在所有使用 React Query 的组件之外。
 * 通常放在应用的根组件中。
 *
 * 属性说明：
 * - client: 传入 QueryClient 实例
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <h1>React Query v5 基础教程</h1>
        <p style={{ color: "#666" }}>
          本文件演示了 React Query 的核心概念和基础用法。
          每个示例都是独立的，可以单独学习。
        </p>

        <hr style={{ margin: "20px 0" }} />

        {/* 示例 1：最简单的查询 */}
        <BasicQueryExample />

        {/* 示例 2：带参数的查询 */}
        <QueryWithParamsExample />

        {/* 示例 3：条件查询 */}
        <ConditionalQueryExample />

        {/* 示例 4：staleTime vs gcTime */}
        <StaleTimeVsGcTimeExample />

        {/* 示例 5：手动刷新 */}
        <ManualRefreshExample />

        {/* 示例 6：命令式操作 */}
        <ImperativeQueryExample />
      </div>
    </QueryClientProvider>
  );
}
