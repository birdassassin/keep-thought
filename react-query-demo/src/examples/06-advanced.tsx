/**
 * ============================================================================
 * 示例 06: React Query v5 高级特性
 * ============================================================================
 *
 * 本文件涵盖以下内容：
 * 1. useSuspenseQuery（v5 新特性）- 原生 Suspense 支持
 * 2. useSuspenseQueries - 并行 Suspense 查询
 * 3. useSuspenseInfiniteQuery - 无限查询的 Suspense 版本
 * 4. queryOptions() - 类型安全的查询选项辅助函数
 * 5. 默认查询选项（defaultOptions / setQueryDefaults）
 * 6. 持久化缓存（PersistQueryClient）
 * 7. SSR 集成（HydrationBoundary / dehydrate）
 * 8. 与 React 19 配合使用
 *
 * 学习建议：学完前面所有示例后再学习本文件。
 *           本文件包含高级特性，适合有一定 React Query 基础的开发者。
 * ============================================================================
 */

import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
  HydrationBoundary,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
  useSuspenseQueries,
} from "@tanstack/react-query";
import React, { Suspense, useState } from "react";

// ============================================================================
// 第一部分：模拟 API
// ============================================================================

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Order {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: "pending" | "shipped" | "delivered";
}

const mockProducts: Product[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `商品 ${i + 1}`,
  price: Math.floor(Math.random() * 1000) + 10,
  category: ["电子产品", "服装", "食品", "图书", "家居"][i % 5],
  stock: Math.floor(Math.random() * 100),
}));

const mockCategories: Category[] = [
  { id: "electronics", name: "电子产品", count: 12 },
  { id: "clothing", name: "服装", count: 8 },
  { id: "food", name: "食品", count: 15 },
  { id: "books", name: "图书", count: 6 },
  { id: "home", name: "家居", count: 9 },
];

let mockOrders: Order[] = [
  { id: 1, productId: 1, quantity: 2, totalPrice: 199.8, status: "delivered" },
  { id: 2, productId: 3, quantity: 1, totalPrice: 299, status: "shipped" },
  { id: 3, productId: 5, quantity: 3, totalPrice: 149.7, status: "pending" },
];

async function fetchProducts(page: number, limit: number): Promise<{ items: Product[]; nextCursor: number | null; total: number }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const start = (page - 1) * limit;
  const items = mockProducts.slice(start, start + limit);
  const totalPages = Math.ceil(mockProducts.length / limit);
  return { items, nextCursor: page < totalPages ? page + 1 : null, total: mockProducts.length };
}

async function fetchProductById(id: number): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const product = mockProducts.find((p) => p.id === id);
  if (!product) throw new Error("商品不存在");
  return { ...product };
}

async function fetchCategories(): Promise<Category[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [...mockCategories];
}

async function fetchOrders(): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [...mockOrders];
}

async function createOrder(productId: number, quantity: number): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const product = mockProducts.find((p) => p.id === productId);
  if (!product) throw new Error("商品不存在");
  const newOrder: Order = {
    id: mockOrders.length + 1,
    productId,
    quantity,
    totalPrice: product.price * quantity,
    status: "pending",
  };
  mockOrders.push(newOrder);
  return newOrder;
}

// ============================================================================
// 第二部分：QueryClient 配置
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      /**
       * retry：失败重试配置
       * 可以传入数字或函数
       */
      retry: (failureCount, error) => {
        // 4xx 错误不重试（客户端错误）
        if ((error as any)?.status >= 400 && (error as any)?.status < 500) {
          return false;
        }
        // 其他错误最多重试 3 次
        return failureCount < 3;
      },
    },
  },
});

// ============================================================================
// 第三部分：useSuspenseQuery（v5 新特性）
// ============================================================================

/**
 * 示例 1：useSuspenseQuery - 原生 Suspense 支持
 *
 * 【教学提示】
 * useSuspenseQuery 是 v5 新增的 Hook，与 React Suspense 原生集成。
 *
 * useQuery vs useSuspenseQuery 的区别：
 *
 * ┌──────────────────┬─────────────────────┬──────────────────────────┐
 * │                  │ useQuery            │ useSuspenseQuery         │
 * ├──────────────────┼─────────────────────┼──────────────────────────┤
 * │ 加载状态         │ isPending = true    │ throw Promise（触发 Suspense）│
 * │ 错误状态         │ isError = true      │ throw Error（触发 ErrorBoundary）│
 * │ 需要 Suspense    │ 不需要              │ 必须有 Suspense 边界       │
 * │ 返回值中的 data  │ 可能是 undefined    │ 始终有值（非 undefined）  │
 * │ 适用场景         │ 通用                │ 数据必须加载完成才能渲染   │
 * └──────────────────┴─────────────────────┴──────────────────────────┘
 *
 * 优势：
 * 1. 不需要手动检查 isPending，data 始终有值
 * 2. 自动与 Suspense 边界配合，显示 fallback UI
 * 3. 代码更简洁，减少条件渲染
 * 4. 支持 React 19 的 Suspense 特性
 *
 * 注意：
 * - 必须在 Suspense 边界内使用
 * - 没有 isPending 状态（因为加载时组件不会渲染）
 * - 仍然有 isFetching 状态（后台刷新时）
 * - 仍然有 isError 状态（但通常用 ErrorBoundary 处理）
 */
function SuspenseQueryContent() {
  /**
   * useSuspenseQuery 用法与 useQuery 几乎相同
   *
   * 【教学提示】
   * 关键区别：
   * 1. 组件首次渲染时，如果数据未缓存，会 throw Promise
   * 2. Suspense 边界捕获这个 Promise，显示 fallback
   * 3. 数据加载完成后，组件重新渲染，data 保证有值
   * 4. 如果 enabled: false，不会 throw（但通常不推荐在 Suspense 中使用 enabled）
   */
  const { data: categories, isFetching, error } = useSuspenseQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    /**
     * useSuspenseQuery 没有 isPending 状态
     * 因为加载时组件根本不会渲染（被 Suspense 边界拦截了）
     *
     * 但仍然有 isFetching（后台刷新）和 error（错误状态）
     */
  });

  if (error) {
    throw error; // 抛出错误，由 ErrorBoundary 捕获
  }

  return (
    <div>
      {isFetching && (
        <div style={{ color: "#1890ff", fontSize: "12px", marginBottom: "8px" }}>
          后台刷新中...
        </div>
      )}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              padding: "12px 16px",
              backgroundColor: "#fafafa",
              borderRadius: "4px",
              border: "1px solid #e8e8e8",
              minWidth: "120px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>{cat.count}</div>
            <div style={{ fontSize: "13px", color: "#666" }}>{cat.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuspenseQueryExample() {
  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 1：useSuspenseQuery（v5 新特性）</h3>

      <div style={{ backgroundColor: "#f9f0ff", padding: "12px", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
        <strong>useSuspenseQuery 的优势：</strong>
        <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
          <li>data 始终有值，不需要检查 isPending</li>
          <li>自动与 Suspense 配合，显示 loading fallback</li>
          <li>代码更简洁，减少条件渲染</li>
        </ul>
      </div>

      {/**
       * Suspense 边界
       * 当 useSuspenseQuery throw Promise 时，显示 fallback
       *
       * 【教学提示】
       * Suspense 边界可以放在任何层级：
       * - 紧挨着使用 useSuspenseQuery 的组件（细粒度控制）
       * - 页面级别（整页 loading）
       * - 应用级别（全局 loading）
       */}
      <Suspense fallback={<div style={{ padding: "20px", textAlign: "center", color: "#999" }}>加载分类数据中...</div>}>
        <SuspenseQueryContent />
      </Suspense>

      {/* 代码对比 */}
      <details style={{ marginTop: "12px", fontSize: "13px" }}>
        <summary style={{ cursor: "pointer", color: "#1890ff" }}>
          useQuery vs useSuspenseQuery 代码对比
        </summary>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
          <div>
            <strong>useQuery（需要手动检查状态）：</strong>
            <pre style={{
              backgroundColor: "#fff1f0",
              padding: "12px",
              borderRadius: "4px",
              fontSize: "12px",
              overflow: "auto",
            }}>
{`const { data, isPending, error }
  = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

if (isPending) return <Spinner />;
if (error) return <Error />;
if (!data) return null;

// 现在才能安全使用 data
return <div>{data.map(...)}</div>`}
            </pre>
          </div>
          <div>
            <strong>useSuspenseQuery（自动处理）：</strong>
            <pre style={{
              backgroundColor: "#f6ffed",
              padding: "12px",
              borderRadius: "4px",
              fontSize: "12px",
              overflow: "auto",
            }}>
{`// Suspense 边界处理 loading
// ErrorBoundary 处理错误
const { data } = useSuspenseQuery({
  queryKey: ['categories'],
  queryFn: fetchCategories,
});

// data 始终有值！直接使用
return <div>{data.map(...)}</div>`}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
}

// ============================================================================
// 第四部分：useSuspenseQueries
// ============================================================================

/**
 * 示例 2：useSuspenseQueries - 并行 Suspense 查询
 *
 * 【教学提示】
 * useSuspenseQueries 是 useQueries 的 Suspense 版本。
 * 所有查询都完成后才会渲染组件。
 * 如果任一查询失败，throw Error。
 *
 * vs useQueries：
 * - useQueries: 每个查询独立管理状态，部分成功也能渲染
 * - useSuspenseQueries: 所有查询必须全部成功才渲染
 */
function SuspenseQueriesContent() {
  const results = useSuspenseQueries({
    queries: [
      { queryKey: ["categories"], queryFn: fetchCategories },
      { queryKey: ["orders"], queryFn: fetchOrders },
    ],
  });

  const [categories, orders] = results;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <h4 style={{ fontSize: "14px" }}>分类 ({categories.data.length})</h4>
          {categories.data.map((cat) => (
            <div key={cat.id} style={{ padding: "4px 0", fontSize: "13px" }}>
              {cat.name}: {cat.count}
            </div>
          ))}
        </div>
        <div>
          <h4 style={{ fontSize: "14px" }}>订单 ({orders.data.length})</h4>
          {orders.data.map((order) => (
            <div key={order.id} style={{ padding: "4px 0", fontSize: "13px" }}>
              订单 #{order.id}: {order.status === "pending" ? "待处理" : order.status === "shipped" ? "已发货" : "已送达"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuspenseQueriesExample() {
  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 2：useSuspenseQueries - 并行 Suspense 查询</h3>

      <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
        所有查询都完成后才渲染。任一查询失败则显示错误。
      </p>

      <Suspense fallback={<div style={{ padding: "20px", textAlign: "center", color: "#999" }}>并行加载分类和订单数据中...</div>}>
        <SuspenseQueriesContent />
      </Suspense>
    </div>
  );
}

// ============================================================================
// 第五部分：useSuspenseInfiniteQuery
// ============================================================================

/**
 * 示例 3：useSuspenseInfiniteQuery - 无限查询的 Suspense 版本
 *
 * 【教学提示】
 * useSuspenseInfiniteQuery 是 useInfiniteQuery 的 Suspense 版本。
 * 与 useSuspenseQuery 类似，首次加载时 throw Promise 触发 Suspense。
 * 加载完成后，data.pages 保证有值。
 */
function SuspenseInfiniteContent() {
  const {
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery({
    queryKey: ["products", "suspense-infinite"],
    queryFn: ({ pageParam }) => fetchProducts(pageParam, 5),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // data.pages 始终有值（至少有一个元素）
  const allProducts = data.pages.flatMap((page) => page.items);

  return (
    <div>
      <div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
        已加载 {allProducts.length} / {data.pages[0]?.total} 件商品
      </div>

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        style={{ padding: "6px 16px", marginBottom: "12px" }}
      >
        {isFetchingNextPage ? "加载中..." : hasNextPage ? "加载更多" : "已全部加载"}
      </button>

      {allProducts.map((product) => (
        <div
          key={product.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderBottom: "1px solid #f0f0f0",
            fontSize: "14px",
          }}
        >
          <span>{product.name}</span>
          <span style={{ color: "#666" }}>
            {product.category} | ¥{product.price} | 库存: {product.stock}
          </span>
        </div>
      ))}
    </div>
  );
}

function SuspenseInfiniteExample() {
  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 3：useSuspenseInfiniteQuery</h3>

      <Suspense fallback={<div style={{ padding: "20px", textAlign: "center", color: "#999" }}>加载商品列表中...</div>}>
        <SuspenseInfiniteContent />
      </Suspense>
    </div>
  );
}

// ============================================================================
// 第六部分：queryOptions() - 类型安全辅助函数
// ============================================================================

/**
 * 示例 4：queryOptions() - 类型安全的查询选项
 *
 * 【教学提示】
 * queryOptions() 是 v5 新增的辅助函数，用于创建类型安全的查询选项。
 *
 * 好处：
 * 1. 完整的 TypeScript 类型推断
 * 2. queryKey 和 queryFn 的参数类型自动关联
 * 3. 可以在多个地方复用相同的查询配置
 * 4. 与自定义 Hook 配合使用效果最佳
 *
 * 使用方式：
 * 1. 使用 queryOptions() 定义查询选项
 * 2. 在 useQuery 中展开使用：useQuery(productOptions(id))
 * 3. 在 queryClient 中使用：queryClient.prefetchQuery(productOptions(id))
 * 4. 在 invalidateQueries 中使用：queryClient.invalidateQueries({ queryKey: productOptions(id).queryKey })
 */

/**
 * 定义商品查询选项
 *
 * 【教学提示】
 * queryOptions() 会自动推断类型：
 * - TQueryKey: queryKey 的类型
 * - TQueryFnData: queryFn 返回的数据类型
 * - TError: 错误类型
 * - TData: 最终 data 的类型（经过 select 转换后）
 */
const productOptions = (id: number) =>
  queryClient.queryOptions({
    queryKey: ["product", id] as const,
    queryFn: () => fetchProductById(id),
    staleTime: 2 * 60 * 1000,
  });

const categoriesOptions = () =>
  queryClient.queryOptions({
    queryKey: ["categories"] as const,
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

function QueryOptionsExample() {
  const [productId, setProductId] = useState(1);

  /**
   * 使用 queryOptions 定义的选项
   *
   * 【教学提示】
   * 使用展开运算符 ... 将 queryOptions 的结果传入 useQuery
   * TypeScript 会自动推断 data 的类型为 Product
   */
  const { data: product, isPending } = useQuery({
    ...productOptions(productId),
    enabled: productId !== null,
  });

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 4：queryOptions() - 类型安全辅助函数（v5）</h3>

      <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
        {[1, 2, 3, 4, 5].map((id) => (
          <button
            key={id}
            onClick={() => setProductId(id)}
            style={{
              padding: "4px 12px",
              fontSize: "13px",
              backgroundColor: productId === id ? "#1890ff" : "#f0f0f0",
              color: productId === id ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            商品 {id}
          </button>
        ))}
      </div>

      {isPending && <div>加载中...</div>}
      {product && (
        <div style={{ backgroundColor: "#fafafa", padding: "12px", borderRadius: "4px" }}>
          <h4>{product.name}</h4>
          <p style={{ fontSize: "13px" }}>
            价格: ¥{product.price} | 分类: {product.category} | 库存: {product.stock}
          </p>
          <p style={{ fontSize: "12px", color: "#999" }}>
            TypeScript 自动推断 product 类型为 Product，无需手动标注
          </p>
        </div>
      )}

      <details style={{ marginTop: "12px", fontSize: "13px" }}>
        <summary style={{ cursor: "pointer", color: "#1890ff" }}>
          查看 queryOptions 代码
        </summary>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
          marginTop: "8px",
        }}>
{`// 定义查询选项（类型安全）
const productOptions = (id: number) =>
  queryClient.queryOptions({
    queryKey: ["product", id] as const,
    queryFn: () => fetchProductById(id),
    staleTime: 2 * 60 * 1000,
  });

// 在 useQuery 中使用（自动推断类型）
const { data } = useQuery({
  ...productOptions(1),
  // data 自动推断为 Product 类型！
});

// 在 prefetchQuery 中使用（类型一致）
queryClient.prefetchQuery(productOptions(1));

// 在 invalidateQueries 中使用
queryClient.invalidateQueries({
  queryKey: productOptions(1).queryKey,
});`}
        </pre>
      </details>
    </div>
  );
}

// ============================================================================
// 第七部分：持久化缓存
// ============================================================================

/**
 * 示例 5：持久化缓存（PersistQueryClient）
 *
 * 【教学提示】
 * 默认情况下，React Query 的缓存存储在内存中，页面刷新后丢失。
 * 使用 PersistQueryClient 可以将缓存持久化到 localStorage、sessionStorage 或其他存储中。
 *
 * 工作原理：
 * 1. 创建 PersistedClient 时，从存储中读取缓存
 * 2. 使用 hydratePersister 将缓存恢复到 QueryClient
 * 3. 每次缓存变化时，自动将缓存写入存储
 *
 * 安装：
 * npm install @tanstack/react-query-persist-client
 * npm install @tanstack/query-async-storage-persister  (或 b64-storage-persister)
 *
 * 注意：
 * - 持久化的缓存会在页面刷新后恢复
 * - staleTime 仍然有效，过期的缓存会被重新获取
 * - 序列化的数据不能包含函数、Symbol 等不可序列化的值
 * - 需要考虑存储大小限制（localStorage 通常 5-10MB）
 */
function PersistCacheExample() {
  const [persistInfo, setPersistInfo] = useState<string>("");

  const handleCheckStorage = () => {
    try {
      const stored = localStorage.getItem("react-query-cache");
      if (stored) {
        const parsed = JSON.parse(stored);
        setPersistInfo(
          `缓存大小: ${(stored.length / 1024).toFixed(2)} KB\n` +
          `查询数量: ${Object.keys(parsed.queries || {}).length}\n` +
          `时间戳: ${new Date(parsed.timestamp || 0).toLocaleString("zh-CN")}`
        );
      } else {
        setPersistInfo("localStorage 中没有缓存数据");
      }
    } catch {
      setPersistInfo("读取 localStorage 失败");
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem("react-query-cache");
    setPersistInfo("已清除 localStorage 中的缓存");
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 5：持久化缓存</h3>

      <div style={{ backgroundColor: "#e6f7ff", padding: "12px", borderRadius: "4px", fontSize: "13px", marginBottom: "12px" }}>
        <strong>持久化缓存说明：</strong>
        <p>将 React Query 缓存保存到 localStorage，页面刷新后缓存不会丢失。</p>
        <p>需要安装: <code>@tanstack/react-query-persist-client</code></p>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={handleCheckStorage} style={{ padding: "6px 16px" }}>
          检查 localStorage
        </button>
        <button onClick={handleClearStorage} style={{ padding: "6px 16px" }}>
          清除缓存
        </button>
      </div>

      {persistInfo && (
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          whiteSpace: "pre-wrap",
        }}>
          {persistInfo}
        </pre>
      )}

      {/* 配置代码 */}
      <details style={{ marginTop: "12px", fontSize: "13px" }}>
        <summary style={{ cursor: "pointer", color: "#1890ff" }}>
          查看持久化缓存配置代码
        </summary>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
          marginTop: "8px",
        }}>
{`import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

// 1. 创建 QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 小时（持久化时建议设长一些）
    },
  },
})

// 2. 创建 persister（存储到 localStorage）
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'react-query-cache',  // localStorage 的 key
})

// 3. 使用 PersistQueryClientProvider 替代 QueryClientProvider
function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <YourApp />
    </PersistQueryClientProvider>
  )
}`}
        </pre>
      </details>
    </div>
  );
}

// ============================================================================
// 第八部分：SSR 集成（HydrationBoundary）
// ============================================================================

/**
 * 示例 6：SSR 集成（HydrationBoundary / dehydrate）
 *
 * 【教学提示】
 * React Query 支持服务端渲染（SSR），核心流程：
 *
 * 1. 服务端：
 *    - 使用 queryClient.fetchQuery() 预获取数据
 *    - 使用 dehydrate(queryClient) 将缓存序列化为普通对象
 *    - 将序列化后的数据注入 HTML（通常通过 __NEXT_DATA__ 等方式）
 *
 * 2. 客户端：
 *    - 从 HTML 中读取序列化的数据
 *    - 使用 HydrationBoundary 将数据注入 QueryClient
 *    - 组件使用 useQuery 时，直接使用注入的数据（不重新请求）
 *
 * 好处：
 * - 首屏渲染不需要等待数据加载
 * - SEO 友好（HTML 中包含完整数据）
 * - 客户端和服务端共享数据
 */
function SSRExample() {
  /**
   * 模拟 SSR 流程
   *
   * 【教学提示】
   * 在真实的 SSR 框架（如 Next.js）中，这些步骤由框架自动完成。
   * 这里手动演示完整流程，帮助你理解原理。
   */
  const [ssrState, setSsrState] = useState<"idle" | "server" | "client">("idle");
  const [dehydratedData, setDehydratedData] = useState<any>(null);

  const simulateSSR = async () => {
    setSsrState("server");

    // 步骤 1：服务端创建独立的 QueryClient
    const serverQueryClient = new QueryClient();

    try {
      // 步骤 2：服务端预获取数据
      await serverQueryClient.prefetchQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
      });
      await serverQueryClient.prefetchQuery({
        queryKey: ["orders"],
        queryFn: fetchOrders,
      });

      // 步骤 3：使用 dehydrate 将缓存序列化
      const dehydrated = dehydrate(serverQueryClient);
      setDehydratedData(dehydrated);

      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSsrState("client");
    } catch (error) {
      console.error("SSR 预获取失败:", error);
      setSsrState("idle");
    }
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 6：SSR 集成（HydrationBoundary / dehydrate）</h3>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button onClick={simulateSSR} disabled={ssrState !== "idle"} style={{ padding: "6px 16px" }}>
          模拟 SSR 流程
        </button>
        <button onClick={() => { setSsrState("idle"); setDehydratedData(null); }} style={{ padding: "6px 16px" }}>
          重置
        </button>
      </div>

      {/* SSR 流程展示 */}
      <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
        <div style={{
          padding: "12px",
          borderRadius: "4px",
          marginBottom: "8px",
          backgroundColor: ssrState === "server" ? "#fffbe6" : ssrState === "client" ? "#f6ffed" : "#f5f5f5",
        }}>
          <strong>当前步骤：</strong>
          {ssrState === "idle" && "等待开始（点击按钮模拟 SSR）"}
          {ssrState === "server" && "服务端：预获取数据 + dehydrate 序列化..."}
          {ssrState === "client" && "客户端：HydrationBoundary 注入数据 → 组件直接使用缓存"}
        </div>
      </div>

      {/* 客户端 Hydration 演示 */}
      {ssrState === "client" && dehydratedData && (
        <>
          {/**
           * HydrationBoundary 组件
           *
           * 【教学提示】
           * HydrationBoundary 将服务端预获取的数据注入到 QueryClient 中。
           * 其子组件中的 useQuery 如果匹配到注入的数据，会直接使用缓存，
           * 不会发起新的网络请求。
           *
           * 属性：
           * - state: dehydrate() 返回的序列化数据
           * - options: 可选，可以设置 queryClient
           */}
          <HydrationBoundary state={dehydratedData}>
            <HydratedContent />
          </HydrationBoundary>

          {/* dehydrated 数据展示 */}
          <details style={{ marginTop: "12px", fontSize: "13px" }}>
            <summary style={{ cursor: "pointer", color: "#1890ff" }}>
              查看 dehydrate 序列化后的数据
            </summary>
            <pre style={{
              backgroundColor: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
              fontSize: "11px",
              overflow: "auto",
              maxHeight: "200px",
              marginTop: "8px",
            }}>
              {JSON.stringify(dehydratedData, null, 2)}
            </pre>
          </details>
        </>
      )}

      {/* SSR 配置代码 */}
      <details style={{ marginTop: "12px", fontSize: "13px" }}>
        <summary style={{ cursor: "pointer", color: "#1890ff" }}>
          查看 SSR 配置代码（Next.js App Router）
        </summary>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
          marginTop: "8px",
        }}>
{`// app/providers.tsx（客户端组件）
'use client'
import { QueryClient, HydrationBoundary } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
    </QueryClientProvider>
  )
}

// app/page.tsx（服务端组件）
import { dehydrate } from '@tanstack/react-query'
import { HydrationBoundary } from '@tanstack/react-query'
import { getQueryClient } from './getQueryClient'

export default async function Page() {
  const queryClient = getQueryClient()

  // 服务端预获取数据
  await queryClient.prefetchQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CategoriesList />
    </HydrationBoundary>
  )
}`}
        </pre>
      </details>
    </div>
  );
}

/**
 * 被 HydrationBoundary 包裹的组件
 * useQuery 会直接使用注入的缓存数据
 */
function HydratedContent() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  return (
    <div style={{ backgroundColor: "#f6ffed", padding: "12px", borderRadius: "4px" }}>
      <p style={{ fontSize: "13px", color: "#52c41a", fontWeight: "bold" }}>
        数据来自 HydrationBoundary 注入的缓存（未发起新的网络请求）
      </p>
      <p style={{ fontSize: "13px" }}>
        分类: {categories?.length} 条 | 订单: {orders?.length} 条
      </p>
    </div>
  );
}

// ============================================================================
// 第九部分：与 React 19 配合
// ============================================================================

/**
 * 示例 7：与 React 19 配合使用
 *
 * 【教学提示】
 * React Query v5 完全兼容 React 19。主要配合点：
 *
 * 1. Suspense：
 *    - React 19 增强了 Suspense 的能力
 *    - useSuspenseQuery / useSuspenseQueries / useSuspenseInfiniteQuery
 *      与 React 19 的 Suspense 完美配合
 *
 * 2. use() Hook：
 *    - React 19 新增的 use() Hook 可以在渲染期间读取 Promise
 *    - 可以与 React Query 的 fetchQuery 配合使用
 *
 * 3. Server Components：
 *    - React 19 的 Server Components 可以直接使用 queryClient.fetchQuery
 *    - 然后通过 HydrationBoundary 传递给客户端
 *
 * 4. 并发特性：
 *    - React Query 的缓存机制与 React 19 的并发渲染兼容
 *    - useTransition 可以包裹会触发查询的操作
 */
function React19Example() {
  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 7：与 React 19 配合使用</h3>

      <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
        <div style={{ backgroundColor: "#f9f0ff", padding: "12px", borderRadius: "4px", marginBottom: "12px" }}>
          <strong>React Query v5 + React 19 的关键配合点：</strong>
        </div>

        <h4>1. Suspense 集成</h4>
        <p style={{ color: "#666" }}>
          React 19 增强了 Suspense。useSuspenseQuery 与之完美配合，
          支持嵌套 Suspense、选择性 Hydration 等特性。
        </p>

        <h4>2. use() Hook</h4>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
        }}>
{`// React 19 的 use() Hook
import { use } from 'react'

function ProductDetail({ productPromise }) {
  // use() 可以在渲染期间读取 Promise
  const product = use(productPromise)
  return <div>{product.name}</div>
}

// 在父组件中创建 Promise
function Page() {
  const queryClient = useQueryClient()
  const productPromise = queryClient.fetchQuery({
    queryKey: ['product', 1],
    queryFn: () => fetchProductById(1),
  })
  return (
    <Suspense fallback={<Spinner />}>
      <ProductDetail productPromise={productPromise} />
    </Suspense>
  )
}`}
        </pre>

        <h4>3. useTransition</h4>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
        }}>
{`import { useTransition } from 'react'

function SearchPage() {
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (term: string) => {
    // 使用 startTransition 包裹状态更新
    // React 19 会将查询标记为低优先级
    startTransition(() => {
      setSearchTerm(term)
    })
  }

  const { data } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => searchProducts(searchTerm),
  })

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <span>搜索中...</span>}
      {/* 渲染结果 */}
    </div>
  )
}`}
        </pre>

        <h4>4. Server Components</h4>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
        }}>
{`// React 19 Server Component
// 服务端组件可以直接使用 async/await
async function ProductPage({ id }: { id: number }) {
  // 直接在服务端组件中获取数据
  const queryClient = getQueryClient()
  const product = await queryClient.fetchQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClientProductDetail product={product} />
    </HydrationBoundary>
  )
}`}
        </pre>
      </div>
    </div>
  );
}

// ============================================================================
// 第十部分：默认查询选项与最佳实践
// ============================================================================

/**
 * 示例 8：默认查询选项与最佳实践总结
 */
function BestPracticesExample() {
  return (
    <div style={{ border: "1px solid #ddd", padding: "16px", margin: "8px 0" }}>
      <h3>示例 8：最佳实践总结</h3>

      <div style={{ fontSize: "13px", lineHeight: "1.8" }}>
        <h4>1. QueryClient 配置</h4>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
        }}>
{`const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 根据业务场景调整
      staleTime: 1 * 60 * 1000,     // 1 分钟
      gcTime: 5 * 60 * 1000,        // 5 分钟
      retry: 3,                       // 重试 3 次
      refetchOnWindowFocus: false,    // 按需开启
      refetchOnReconnect: true,       // 推荐
      refetchOnMount: true,           // 推荐
    },
    mutations: {
      retry: false,  // mutation 通常不重试
    },
  },
})`}
        </pre>

        <h4>2. queryKey 设计规范</h4>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
        }}>
{`// 推荐：层级结构，从一般到具体
['todos']                              // 列表
['todos', { filter: 'done' }]          // 过滤列表
['todos', { page: 1, limit: 10 }]     // 分页列表
['todo', 42]                           // 详情
['todo', 42, 'comments']               // 子资源

// 使用 queryOptions() 保持一致性
const todoOptions = (id: number) =>
  queryOptions({
    queryKey: ['todo', id] as const,
    queryFn: () => fetchTodo(id),
  })`}
        </pre>

        <h4>3. 自定义 Hook 封装</h4>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
        }}>
{`// 查询 Hook
function useTodo(id: number) {
  return useQuery({ ...todoOptions(id) })
}

// Mutation Hook
function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['todos']
      })
    },
  })
}`}
        </pre>

        <h4>4. 错误处理</h4>
        <pre style={{
          backgroundColor: "#f5f5f5",
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          overflow: "auto",
        }}>
{`// 方式 1：组件内处理
const { data, error } = useQuery(...)
if (error) return <ErrorDisplay error={error} />

// 方式 2：ErrorBoundary（推荐配合 Suspense）
<ErrorBoundary fallback={<ErrorPage />}>
  <Suspense fallback={<Loading />}>
    <SuspenseComponent />
  </Suspense>
</ErrorBoundary>

// 方式 3：全局错误处理
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error, query) => {
        // 只对特定查询抛出错误
        return query.meta?.critical === true
      },
    },
  },
})`}
        </pre>
      </div>
    </div>
  );
}

// ============================================================================
// 第十一部分：应用根组件
// ============================================================================

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
        <h1>React Query v5 - 高级特性教程</h1>
        <p style={{ color: "#666" }}>
          本文件演示了 React Query v5 的高级特性，包括 Suspense 集成、SSR、持久化缓存等。
        </p>

        <hr style={{ margin: "20px 0" }} />

        <SuspenseQueryExample />
        <SuspenseQueriesExample />
        <SuspenseInfiniteExample />
        <QueryOptionsExample />
        <PersistCacheExample />
        <SSRExample />
        <React19Example />
        <BestPracticesExample />
      </div>
    </QueryClientProvider>
  );
}
