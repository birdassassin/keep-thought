/**
 * React Router 7 数据路由教程
 * 
 * 本文件涵盖数据路由的核心概念：
 * - loader: 在路由渲染前加载数据
 * - action: 处理表单提交和数据变更
 * - useLoaderData: 在组件中获取 loader 数据
 * - useActionData: 获取 action 返回的数据
 * - useNavigation: 获取导航状态（加载中、提交中等）
 * - Form 组件: 数据路由专用的表单组件
 * 
 * 数据路由是 React Router 7 的核心特性，实现了数据与路由的深度集成
 */

import React from 'react';
import {
  // 路由组件
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet,
  Link,
  Navigate,
  
  // 数据 Hooks
  useLoaderData,
  useActionData,
  useNavigation,
  useRouteLoaderData,
  useRouteError,
  
  // 表单组件
  Form,
  useFetcher,
  
  // 类型
  LoaderFunction,
  ActionFunction,
} from 'react-router-dom';

// ============================================
// 第一部分：Loader - 数据预加载
// ============================================

/**
 * 模拟 API 请求
 * 在实际项目中，这里会是真实的 API 调用
 */
const mockApi = {
  // 获取用户列表
  getUsers: async (): Promise<{ id: number; name: string; email: string }[]> => {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [
      { id: 1, name: '张三', email: 'zhangsan@example.com' },
      { id: 2, name: '李四', email: 'lisi@example.com' },
      { id: 3, name: '王五', email: 'wangwu@example.com' },
    ];
  },
  
  // 获取单个用户
  getUser: async (id: string): Promise<{ id: number; name: string; email: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const users = await mockApi.getUsers();
    const user = users.find((u) => u.id === parseInt(id));
    if (!user) throw new Error('用户不存在');
    return user;
  },
  
  // 获取产品列表
  getProducts: async (): Promise<{ id: number; name: string; price: number }[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [
      { id: 1, name: '笔记本电脑', price: 5999 },
      { id: 2, name: '智能手机', price: 3999 },
      { id: 3, name: '无线耳机', price: 299 },
    ];
  },
  
  // 创建用户
  createUser: async (data: { name: string; email: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: Date.now(), ...data };
  },
  
  // 更新用户
  updateUser: async (id: string, data: { name?: string; email?: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { id: parseInt(id), ...data };
  },
  
  // 删除用户
  deleteUser: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },
};

// ============================================
// Loader 函数定义
// ============================================

/**
 * 用户列表 Loader
 * 
 * Loader 是一个异步函数，在路由渲染前执行
 * 返回的数据可以通过 useLoaderData 在组件中获取
 * 
 * 参数:
 * - request: Request 对象，包含 URL 等信息
 * - params: 路由参数对象
 */
const usersLoader: LoaderFunction = async ({ request, params }) => {
  console.log('Users Loader 执行');
  console.log('请求 URL:', request.url);
  
  // 获取数据
  const users = await mockApi.getUsers();
  
  // 返回数据，组件中通过 useLoaderData 获取
  return { users };
};

/**
 * 用户详情 Loader
 * 
 * 演示如何使用路由参数获取特定数据
 */
const userDetailLoader: LoaderFunction = async ({ params }) => {
  const { userId } = params;
  
  if (!userId) {
    throw new Error('用户 ID 缺失');
  }
  
  // 获取特定用户
  const user = await mockApi.getUser(userId);
  
  return { user };
};

/**
 * 产品列表 Loader
 */
const productsLoader: LoaderFunction = async () => {
  const products = await mockApi.getProducts();
  return { products };
};

/**
 * 根布局 Loader
 * 
 * 可以在根布局加载全局数据
 * 子路由可以通过 useRouteLoaderData 访问
 */
const rootLoader: LoaderFunction = async () => {
  // 可以加载全局配置、用户信息等
  return {
    appName: 'React Router 7 数据路由示例',
    version: '1.0.0',
  };
};

// ============================================
// 第二部分：Action - 数据操作
// ============================================

/**
 * 用户操作 Action
 * 
 * Action 用于处理数据变更：
 * - 表单提交
 * - 数据创建、更新、删除
 * 
 * 参数:
 * - request: Request 对象，包含表单数据
 * - params: 路由参数
 */
const userAction: ActionFunction = async ({ request, params }) => {
  // 获取请求方法
  const method = request.method;
  
  // 获取表单数据
  const formData = await request.formData();
  
  // 将 FormData 转换为对象
  const data = Object.fromEntries(formData);
  
  console.log('Action 执行');
  console.log('请求方法:', method);
  console.log('表单数据:', data);
  
  // 根据方法执行不同操作
  switch (method) {
    case 'POST': {
      // 创建用户
      const newUser = await mockApi.createUser({
        name: data.name as string,
        email: data.email as string,
      });
      return { success: true, user: newUser, message: '用户创建成功！' };
    }
    
    case 'PUT':
    case 'PATCH': {
      // 更新用户
      const userId = params.userId || data.id as string;
      const updatedUser = await mockApi.updateUser(userId, {
        name: data.name as string,
        email: data.email as string,
      });
      return { success: true, user: updatedUser, message: '用户更新成功！' };
    }
    
    case 'DELETE': {
      // 删除用户
      const userId = params.userId || data.id as string;
      await mockApi.deleteUser(userId);
      return { success: true, message: '用户删除成功！' };
    }
    
    default:
      return { success: false, message: '不支持的请求方法' };
  }
};

// ============================================
// 第三部分：使用数据的组件
// ============================================

/**
 * 用户列表页面
 * 
 * 演示 useLoaderData 和 useNavigation 的使用
 */
function UsersPage() {
  // 获取 loader 返回的数据
  // 类型会自动推断（如果使用 TypeScript）
  const { users } = useLoaderData<typeof usersLoader>() as { users: { id: number; name: string; email: string }[] };
  
  // 获取导航状态
  // 用于显示加载状态
  const navigation = useNavigation();
  
  // 获取 action 返回的数据
  const actionData = useActionData<typeof userAction>() as 
    | { success: boolean; message: string; user?: { id: number; name: string } }
    | undefined;
  
  // 判断是否正在加载
  const isLoading = navigation.state === 'loading';
  const isSubmitting = navigation.state === 'submitting';
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>用户管理</h1>
      
      {/* 显示 action 返回的消息 */}
      {actionData && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: actionData.success ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
        }}>
          {actionData.message}
        </div>
      )}
      
      {/* 加载状态指示器 */}
      {(isLoading || isSubmitting) && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          marginBottom: '20px',
          borderRadius: '4px',
        }}>
          {isLoading ? '正在加载数据...' : '正在提交数据...'}
        </div>
      )}
      
      {/* 用户列表 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>ID</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>姓名</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>邮箱</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{user.id}</td>
              <td style={{ padding: '10px' }}>{user.name}</td>
              <td style={{ padding: '10px' }}>{user.email}</td>
              <td style={{ padding: '10px' }}>
                <Link 
                  to={`/users/${user.id}`} 
                  style={{ marginRight: '10px' }}
                >
                  查看
                </Link>
                
                {/* 删除按钮 - 使用 Form 组件 */}
                <Form 
                  method="delete" 
                  style={{ display: 'inline' }}
                  onSubmit={(e) => {
                    if (!confirm('确定要删除这个用户吗？')) {
                      e.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={user.id} />
                  <button 
                    type="submit" 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'red', 
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    删除
                  </button>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* 添加用户表单 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
      }}>
        <h3>添加新用户</h3>
        
        {/*
          Form 组件 - 数据路由的核心
          
          特点:
          - 自动处理表单提交
          - 调用当前路由的 action
          - 支持各种 HTTP 方法
          - 自动处理加载状态
        */}
        <Form method="post">
          <div style={{ marginBottom: '10px' }}>
            <label>
              姓名：
              <input 
                name="name" 
                type="text" 
                required 
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>
              邮箱：
              <input 
                name="email" 
                type="email" 
                required 
                style={{ marginLeft: '10px', padding: '5px' }}
              />
            </label>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: isSubmitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? '提交中...' : '添加用户'}
          </button>
        </Form>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/">返回首页</Link>
      </div>
    </div>
  );
}

/**
 * 用户详情页面
 * 
 * 演示带参数的 loader 使用
 */
function UserDetailPage() {
  // 获取 loader 数据
  const { user } = useLoaderData<typeof userDetailLoader>() as { user: { id: number; name: string; email: string } };
  
  // 获取导航状态
  const navigation = useNavigation();
  
  // 获取 action 数据
  const actionData = useActionData<typeof userAction>() as 
    | { success: boolean; message: string }
    | undefined;
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>用户详情</h1>
      
      {/* 成功消息 */}
      {actionData && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: '#d4edda',
          borderRadius: '4px',
        }}>
          {actionData.message}
        </div>
      )}
      
      {/* 用户信息编辑表单 */}
      <Form method="put" style={{
        maxWidth: '400px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            ID: {user.id}
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            姓名：
            <input 
              name="name" 
              type="text" 
              defaultValue={user.name}
              required 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            邮箱：
            <input 
              name="email" 
              type="email" 
              defaultValue={user.email}
              required 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </label>
        </div>
        
        <button 
          type="submit"
          disabled={navigation.state === 'submitting'}
          style={{
            padding: '10px 20px',
            backgroundColor: navigation.state === 'submitting' ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            cursor: navigation.state === 'submitting' ? 'not-allowed' : 'pointer',
            marginRight: '10px',
          }}
        >
          {navigation.state === 'submitting' ? '保存中...' : '保存修改'}
        </button>
      </Form>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/users">返回用户列表</Link>
      </div>
    </div>
  );
}

// ============================================
// 第四部分：useFetcher - 不导航的数据操作
// ============================================

/**
 * 产品列表页面
 * 
 * 演示 useFetcher 的使用
 * 
 * useFetcher 用于：
 * - 不需要导航的数据操作
 * - 后台数据同步
 * - 搜索建议等场景
 */
function ProductsPage() {
  const { products } = useLoaderData<typeof productsLoader>() as { products: { id: number; name: string; price: number }[] };
  
  // useFetcher 用于不触发导航的数据操作
  const fetcher = useFetcher();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>产品列表</h1>
      
      {/* 
        fetcher.Form - 不会触发导航的表单
        适合搜索、过滤、后台操作等场景
      */}
      <fetcher.Form method="get" style={{ marginBottom: '20px' }}>
        <input 
          name="search" 
          type="text" 
          placeholder="搜索产品..."
          style={{ padding: '8px', width: '200px' }}
        />
        <button 
          type="submit"
          style={{ marginLeft: '10px', padding: '8px 15px' }}
        >
          搜索
        </button>
      </fetcher.Form>
      
      {/* 显示 fetcher 状态 */}
      {fetcher.state !== 'idle' && (
        <div style={{ padding: '10px', backgroundColor: '#fff3cd', marginBottom: '20px' }}>
          正在处理...
        </div>
      )}
      
      {/* 产品列表 */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>产品名称</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>价格</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{product.name}</td>
              <td style={{ padding: '10px' }}>¥{product.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/">返回首页</Link>
      </div>
    </div>
  );
}

// ============================================
// 第五部分：错误处理
// ============================================

/**
 * 错误边界组件
 * 
 * 当 loader 或 action 抛出错误时
 * React Router 会渲染最近的 errorElement
 */
function ErrorBoundary() {
  // useRouteError 获取抛出的错误
  const error = useRouteError();
  
  // 判断错误类型
  const is404 = error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 404;
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>{is404 ? '404 - 页面未找到' : '出错了！'}</h1>
      <p style={{ color: '#666' }}>
        {error instanceof Error ? error.message : '发生了未知错误'}
      </p>
      <Link to="/">返回首页</Link>
    </div>
  );
}

// ============================================
// 第六部分：布局和导航
// ============================================

/**
 * 根布局组件
 */
function RootLayout() {
  // 获取根 loader 的数据
  const rootData = useRouteLoaderData('root') as { appName: string; version: string } | undefined;
  const navigation = useNavigation();
  
  return (
    <div>
      {/* 顶部导航 */}
      <header style={{
        padding: '15px 20px',
        backgroundColor: '#333',
        color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>
            {rootData?.appName || 'React Router 7'}
          </h1>
          <nav>
            <Link to="/" style={{ color: 'white', marginRight: '15px' }}>首页</Link>
            <Link to="/users" style={{ color: 'white', marginRight: '15px' }}>用户管理</Link>
            <Link to="/products" style={{ color: 'white' }}>产品列表</Link>
          </nav>
        </div>
      </header>
      
      {/* 全局加载指示器 */}
      {navigation.state !== 'idle' && (
        <div style={{
          height: '3px',
          backgroundColor: '#007bff',
          animation: 'loading 1s ease-in-out infinite',
        }} />
      )}
      
      {/* 主内容区域 */}
      <main style={{ padding: '20px' }}>
        <Outlet />
      </main>
      
      {/* 页脚 */}
      <footer style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        textAlign: 'center',
        marginTop: '40px',
      }}>
        <p>版本: {rootData?.version || '1.0.0'}</p>
      </footer>
      
      {/* 加载动画样式 */}
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

/**
 * 首页组件
 */
function HomePage() {
  const rootData = useRouteLoaderData('root') as { appName: string } | undefined;
  
  return (
    <div>
      <h1>欢迎来到 {rootData?.appName}</h1>
      <p>这是一个演示 React Router 7 数据路由功能的示例应用。</p>
      
      <h2>核心功能</h2>
      <ul>
        <li><strong>Loader</strong>: 在路由渲染前加载数据</li>
        <li><strong>Action</strong>: 处理表单提交和数据变更</li>
        <li><strong>Form</strong>: 数据路由专用的表单组件</li>
        <li><strong>useNavigation</strong>: 跟踪导航和加载状态</li>
      </ul>
      
      <h2>示例页面</h2>
      <ul>
        <li><Link to="/users">用户管理</Link> - CRUD 操作示例</li>
        <li><Link to="/products">产品列表</Link> - useFetcher 示例</li>
      </ul>
    </div>
  );
}

// ============================================
// 第七部分：路由配置
// ============================================

/**
 * 创建路由配置
 * 
 * 使用 createBrowserRouter 创建路由实例
 * 这是 React Router 7 推荐的方式
 */
const router = createBrowserRouter([
  {
    // 路由 ID，用于 useRouteLoaderData
    id: 'root',
    
    // 路径
    path: '/',
    
    // 布局组件
    element: <RootLayout />,
    
    // 错误边界
    errorElement: <ErrorBoundary />,
    
    // 根 loader
    loader: rootLoader,
    
    // 子路由
    children: [
      // 首页 - 索引路由
      {
        index: true,
        element: <HomePage />,
      },
      
      // 用户管理
      {
        path: 'users',
        element: <Outlet />,
        children: [
          // 用户列表
          {
            index: true,
            element: <UsersPage />,
            loader: usersLoader,
            action: userAction,
          },
          
          // 用户详情
          {
            path: ':userId',
            element: <UserDetailPage />,
            loader: userDetailLoader,
            action: userAction,
          },
        ],
      },
      
      // 产品列表
      {
        path: 'products',
        element: <ProductsPage />,
        loader: productsLoader,
      },
    ],
  },
]);

/**
 * 主应用组件
 * 
 * 使用 RouterProvider 提供路由实例
 */
function App() {
  return <RouterProvider router={router} />;
}

// ============================================
// 导出
// ============================================

export default App;

// 导出路由配置
export { router };

// 导出 loaders 和 actions
export {
  rootLoader,
  usersLoader,
  userDetailLoader,
  productsLoader,
  userAction,
};

// 导出组件
export {
  RootLayout,
  HomePage,
  UsersPage,
  UserDetailPage,
  ProductsPage,
  ErrorBoundary,
};

/**
 * ============================================
 * 学习总结
 * ============================================
 * 
 * 1. Loader
 *    - 在路由渲染前执行的数据加载函数
 *    - 返回的数据通过 useLoaderData 获取
 *    - 支持参数、查询字符串等
 *    - 可以抛出错误，触发错误边界
 * 
 * 2. Action
 *    - 处理数据变更的函数
 *    - 接收 Request 对象和路由参数
 *    - 支持 POST、PUT、DELETE 等方法
 *    - 返回的数据通过 useActionData 获取
 * 
 * 3. Form 组件
 *    - 数据路由专用的表单组件
 *    - 自动调用当前路由的 action
 *    - 支持 method 属性（get、post、put、delete）
 *    - 自动处理导航和加载状态
 * 
 * 4. useNavigation
 *    - 返回当前导航状态
 *    - state: 'idle' | 'loading' | 'submitting'
 *    - 用于显示加载指示器
 * 
 * 5. useFetcher
 *    - 不触发导航的数据操作
 *    - 适合搜索、过滤等场景
 *    - fetcher.Form 不会改变 URL
 * 
 * 6. useRouteLoaderData
 *    - 通过路由 ID 获取任意 loader 的数据
 *    - 用于跨路由共享数据
 * 
 * 7. 错误处理
 *    - errorElement 定义错误边界
 *    - useRouteError 获取错误信息
 *    - loader/action 抛出的错误会被捕获
 * 
 * 下一步：学习 04-advanced.tsx 了解高级特性
 */
