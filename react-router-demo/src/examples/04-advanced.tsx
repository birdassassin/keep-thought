/**
 * React Router 7 高级特性教程
 * 
 * 本文件涵盖高级路由特性：
 * - 懒加载 (lazy): 按需加载路由组件和资源
 * - 错误边界 (errorElement): 路由级别的错误处理
 * - 路由守卫: 自定义路由访问控制
 * - 路由配置对象: 使用对象配置路由
 * - useRouteError: 错误信息获取
 * - defer: 延迟数据加载
 * 
 * 这些特性用于构建生产级别的应用
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import {
  // 路由核心
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  Navigate,
  useLocation,
  useNavigate,
  
  // 数据相关
  defer,
  Await,
  useLoaderData,
  useRouteError,
  useNavigation,
  
  // 类型
  RouteObject,
  LoaderFunctionArgs,
} from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// ============================================
// 第一部分：懒加载 (Lazy Loading)
// ============================================

/**
 * 懒加载组件示例
 * 
 * 使用 React.lazy() 动态导入组件
 * 配合 Suspense 显示加载状态
 * 
 * 优点：
 * - 减少初始包大小
 * - 按需加载，提升首屏速度
 * - 代码分割自动化
 */

// 使用 React.lazy 懒加载组件
const LazyDashboard = lazy(() => import('./lazy-components/Dashboard'));
const LazySettings = lazy(() => import('./lazy-components/Settings'));
const LazyProfile = lazy(() => import('./lazy-components/Profile'));

/**
 * 加载中占位组件
 */
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '200px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 10px',
        }} />
        <p>加载中...</p>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * 懒加载包装器
 * 
 * 将懒加载组件包装在 Suspense 中
 * 统一处理加载状态
 */
function lazyComponent(
  LazyComponent: React.LazyExoticComponent<ComponentType>
) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent />
    </Suspense>
  );
}

/**
 * 懒加载路由配置示例
 * 
 * 在路由配置中使用 lazy 函数
 * 同时懒加载组件和 loader
 */
const lazyRoutes: RouteObject[] = [
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        // 使用 lazy 函数同时加载组件和数据函数
        // 这是 React Router 7 推荐的懒加载方式
        path: 'dashboard',
        lazy: () => import('./lazy-components/Dashboard'),
      },
      {
        path: 'settings',
        lazy: () => import('./lazy-components/Settings'),
      },
      {
        path: 'profile',
        lazy: () => import('./lazy-components/Profile'),
      },
    ],
  },
];

// ============================================
// 第二部分：错误边界 (Error Boundary)
// ============================================

/**
 * 路由级别错误边界
 * 
 * 当路由加载、渲染或 loader/action 抛出错误时
 * React Router 会渲染最近的 errorElement
 */
function RouteErrorBoundary() {
  // useRouteError 获取错误对象
  const error = useRouteError();
  
  // 解析错误信息
  let title = '出错了';
  let message = '发生了未知错误';
  let stack = '';
  
  // 判断错误类型
  if (isRouteErrorResponse(error)) {
    // 路由响应错误（如 404、500）
    title = `${error.status} ${error.statusText}`;
    message = error.data?.message || '请求的资源不存在';
  } else if (error instanceof Error) {
    // JavaScript 错误
    title = '应用错误';
    message = error.message;
    stack = error.stack || '';
  }
  
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      backgroundColor: '#fff5f5',
      minHeight: '300px',
    }}>
      <h1 style={{ color: '#c53030' }}>{title}</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>{message}</p>
      
      {/* 开发环境显示错误堆栈 */}
      {stack && process.env.NODE_ENV === 'development' && (
        <pre style={{
          textAlign: 'left',
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '200px',
          fontSize: '12px',
        }}>
          {stack}
        </pre>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          刷新页面
        </button>
        <Link
          to="/"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}

/**
 * 类型守卫：判断是否为路由响应错误
 */
function isRouteErrorResponse(error: unknown): error is { status: number; statusText: string; data?: { message?: string } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'statusText' in error
  );
}

/**
 * 抛出错误的 Loader 示例
 * 
 * 演示如何在 loader 中处理错误
 */
async function errorProneLoader({ params }: LoaderFunctionArgs) {
  const { id } = params;
  
  // 验证参数
  if (!id) {
    // 抛出 Response，React Router 会自动处理
    throw new Response('缺少必要参数', { status: 400 });
  }
  
  // 模拟 API 调用
  const response = await fetch(`/api/items/${id}`);
  
  if (response.status === 404) {
    // 404 错误
    throw new Response('资源不存在', { status: 404 });
  }
  
  if (!response.ok) {
    // 其他错误
    throw new Response('服务器错误', { status: 500 });
  }
  
  return response.json();
}

// ============================================
// 第三部分：路由守卫 (Route Guards)
// ============================================

/**
 * 认证状态（模拟）
 */
interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; name: string; role: string } | null;
}

// 模拟认证上下文
const AuthContext = React.createContext<AuthState>({
  isAuthenticated: false,
  user: null,
});

/**
 * 认证 Provider
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = React.useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  
  // 模拟登录
  const login = () => {
    setAuth({
      isAuthenticated: true,
      user: { id: '1', name: '测试用户', role: 'admin' },
    });
  };
  
  // 模拟登出
  const logout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
    });
  };
  
  return (
    <AuthContext.Provider value={auth}>
      <div>
        {/* 登录/登出按钮 */}
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1000,
        }}>
          {auth.isAuthenticated ? (
            <div>
              <span style={{ marginRight: '10px' }}>
                欢迎，{auth.user?.name}
              </span>
              <button onClick={logout}>登出</button>
            </div>
          ) : (
            <button onClick={login}>登录</button>
          )}
        </div>
        {children}
      </div>
    </AuthContext.Provider>
  );
}

/**
 * 使用认证状态的 Hook
 */
function useAuth() {
  return React.useContext(AuthContext);
}

/**
 * 受保护路由组件
 * 
 * 实现路由守卫的核心组件
 * 检查用户是否已登录，未登录则重定向
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;  // 可选的角色要求
  redirectTo?: string;    // 重定向路径
}

function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const auth = useAuth();
  const location = useLocation();
  
  // 未登录，重定向到登录页
  if (!auth.isAuthenticated) {
    // 保存当前路径，登录后可以返回
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }
  
  // 检查角色权限
  if (requiredRole && auth.user?.role !== requiredRole) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>权限不足</h1>
        <p>您没有访问此页面的权限。</p>
        <Link to="/">返回首页</Link>
      </div>
    );
  }
  
  // 验证通过，渲染子组件
  return <>{children}</>;
}

/**
 * 登录页面
 */
function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 获取来源路径
  const from = (location.state as { from?: string })?.from || '/';
  
  // 如果已登录，重定向
  if (auth.isAuthenticated) {
    return <Navigate to={from} replace />;
  }
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    }}>
      <div style={{
        padding: '40px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        textAlign: 'center',
      }}>
        <h1>请先登录</h1>
        <p>您需要登录才能访问 {from}</p>
        <Link to="/">返回首页</Link>
      </div>
    </div>
  );
}

/**
 * 管理员页面 - 需要特定角色
 */
function AdminPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>管理员面板</h1>
      <p>只有管理员才能看到这个页面。</p>
    </div>
  );
}

// ============================================
// 第四部分：延迟数据加载 (defer)
// ============================================

/**
 * defer 和 Await 示例
 * 
 * defer 允许延迟加载部分数据
 * 适合：
 * - 关键数据优先加载
 * - 次要数据后台加载
 * - 流式渲染
 */

/**
 * 延迟加载的 Loader
 */
async function deferredLoader() {
  // 关键数据 - 立即返回
  const criticalData = await fetchCriticalData();
  
  // 次要数据 - 延迟加载
  // defer 返回一个 Promise，组件中用 Await 处理
  const deferredData = defer({
    // 关键数据立即可用
    user: criticalData.user,
    
    // 次要数据延迟加载
    posts: fetchPosts(),        // 不 await，返回 Promise
    comments: fetchComments(),  // 不 await，返回 Promise
  });
  
  return deferredData;
}

// 模拟数据获取函数
async function fetchCriticalData() {
  await new Promise((r) => setTimeout(r, 100));
  return { user: { name: '张三' } };
}

async function fetchPosts() {
  await new Promise((r) => setTimeout(r, 1000));
  return [
    { id: 1, title: '文章 1' },
    { id: 2, title: '文章 2' },
  ];
}

async function fetchComments() {
  await new Promise((r) => setTimeout(r, 1500));
  return [
    { id: 1, text: '评论 1' },
    { id: 2, text: '评论 2' },
  ];
}

/**
 * 使用延迟数据的组件
 */
function DeferredDataPage() {
  const data = useLoaderData() as {
    user: { name: string };
    posts: Promise<{ id: number; title: string }[]>;
    comments: Promise<{ id: number; text: string }[]>;
  };
  
  return (
    <div style={{ padding: '20px' }}>
      {/* 关键数据立即可用 */}
      <h1>欢迎，{data.user.name}</h1>
      
      {/* 延迟数据使用 Await 组件 */}
      <div style={{ marginTop: '20px' }}>
        <h2>文章列表</h2>
        <Await resolve={data.posts}>
          {(posts) => (
            <ul>
              {posts.map((post) => (
                <li key={post.id}>{post.title}</li>
              ))}
            </ul>
          )}
        </Await>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>评论</h2>
        <Await resolve={data.comments}>
          {(comments) => (
            <ul>
              {comments.map((comment) => (
                <li key={comment.id}>{comment.text}</li>
              ))}
            </ul>
          )}
        </Await>
      </div>
    </div>
  );
}

// ============================================
// 第五部分：路由配置对象
// ============================================

/**
 * 完整的路由配置对象
 * 
 * 使用 createBrowserRouter 的配置方式
 * 适合复杂应用和需要动态路由的场景
 */
const appRoutes: RouteObject[] = [
  {
    // 路由 ID - 用于 useRouteLoaderData
    id: 'root',
    
    // 路径
    path: '/',
    
    // 布局组件
    element: <RootLayout />,
    
    // 错误边界
    errorElement: <RouteErrorBoundary />,
    
    // 根 loader
    loader: async () => {
      return {
        appName: 'React Router 7 高级示例',
        timestamp: Date.now(),
      };
    },
    
    // 子路由
    children: [
      // 首页
      {
        index: true,
        element: <HomePage />,
      },
      
      // 登录页
      {
        path: 'login',
        element: <LoginPage />,
      },
      
      // 受保护的路由组
      {
        path: 'app',
        element: <ProtectedRoute><Outlet /></ProtectedRoute>,
        children: [
          // 仪表盘
          {
            path: 'dashboard',
            element: lazyComponent(LazyDashboard),
            loader: async () => {
              return { stats: { users: 100, orders: 50 } };
            },
          },
          
          // 设置
          {
            path: 'settings',
            element: lazyComponent(LazySettings),
          },
          
          // 个人资料
          {
            path: 'profile',
            element: lazyComponent(LazyProfile),
            loader: deferredLoader,
            // 使用 defer 时需要 Suspense 包装
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <DeferredDataPage />
              </Suspense>
            ),
          },
        ],
      },
      
      // 管理员路由 - 需要特定角色
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminPage />,
          },
        ],
      },
      
      // 404 页面
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

// ============================================
// 第六部分：布局组件
// ============================================

/**
 * 根布局组件
 */
function RootLayout() {
  const navigation = useNavigation();
  
  return (
    <div>
      {/* 导航栏 */}
      <nav style={{
        padding: '15px 20px',
        backgroundColor: '#333',
        color: 'white',
      }}>
        <Link to="/" style={{ color: 'white', marginRight: '15px' }}>
          首页
        </Link>
        <Link to="/app/dashboard" style={{ color: 'white', marginRight: '15px' }}>
          仪表盘
        </Link>
        <Link to="/app/settings" style={{ color: 'white', marginRight: '15px' }}>
          设置
        </Link>
        <Link to="/admin" style={{ color: 'white' }}>
          管理员
        </Link>
      </nav>
      
      {/* 全局加载指示器 */}
      {navigation.state !== 'idle' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: '#007bff',
          zIndex: 9999,
        }} />
      )}
      
      {/* 主内容 */}
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}

/**
 * 应用布局
 */
function AppLayout() {
  return (
    <div>
      <aside style={{
        width: '200px',
        float: 'left',
        padding: '20px',
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
      }}>
        <h3>应用菜单</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/app/dashboard">仪表盘</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/app/settings">设置</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/app/profile">个人资料</Link>
          </li>
        </ul>
      </aside>
      
      <div style={{ marginLeft: '220px', padding: '20px' }}>
        <Outlet />
      </div>
    </div>
  );
}

/**
 * 首页
 */
function HomePage() {
  return (
    <div>
      <h1>React Router 7 高级特性示例</h1>
      <p>本示例演示以下高级特性：</p>
      <ul>
        <li><strong>懒加载</strong>: 按需加载路由组件</li>
        <li><strong>错误边界</strong>: 路由级别的错误处理</li>
        <li><strong>路由守卫</strong>: 认证和权限控制</li>
        <li><strong>延迟加载</strong>: defer 和 Await</li>
      </ul>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '4px',
      }}>
        <strong>提示：</strong>点击右上角的"登录"按钮测试路由守卫功能。
      </div>
    </div>
  );
}

/**
 * 404 页面
 */
function NotFoundPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>404 - 页面未找到</h1>
      <p>您访问的页面不存在。</p>
      <Link to="/">返回首页</Link>
    </div>
  );
}

// ============================================
// 第七部分：创建路由实例
// ============================================

/**
 * 创建路由实例
 */
const router = createBrowserRouter(appRoutes);

/**
 * 主应用组件
 */
function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

// ============================================
// 导出
// ============================================

export default App;

// 导出路由配置
export { appRoutes, router };

// 导出组件
export {
  RootLayout,
  AppLayout,
  HomePage,
  LoginPage,
  AdminPage,
  ProtectedRoute,
  RouteErrorBoundary,
  LoadingFallback,
  DeferredDataPage,
};

// 导出工具函数
export { useAuth, lazyComponent };

/**
 * ============================================
 * 学习总结
 * ============================================
 * 
 * 1. 懒加载 (Lazy Loading)
 *    - React.lazy() 动态导入组件
 *    - Suspense 处理加载状态
 *    - 路由 lazy 函数同时加载组件和 loader
 *    - 减少初始包大小，提升首屏速度
 * 
 * 2. 错误边界 (Error Boundary)
 *    - errorElement 定义错误 UI
 *    - useRouteError 获取错误信息
 *    - loader/action 中抛出 Response
 *    - 支持嵌套错误边界
 * 
 * 3. 路由守卫 (Route Guards)
 *    - 自定义认证检查组件
 *    - Navigate 重定向未授权用户
 *    - 支持角色权限检查
 *    - 保存来源路径用于登录后返回
 * 
 * 4. 延迟数据加载 (defer)
 *    - defer 返回 Promise 包装的数据
 *    - Await 组件处理延迟数据
 *    - 关键数据优先，次要数据延迟
 *    - 支持流式渲染
 * 
 * 5. 路由配置对象
 *    - createBrowserRouter 创建路由
 *    - RouteObject 定义路由结构
 *    - id 用于 useRouteLoaderData
 *    - 支持动态路由配置
 * 
 * 6. 最佳实践
 *    - 使用 TypeScript 类型检查
 *    - 合理使用懒加载
 *    - 全局错误边界 + 局部错误边界
 *    - 关键数据优先加载
 * 
 * 下一步：学习 05-framework-mode.md 了解框架模式
 */
