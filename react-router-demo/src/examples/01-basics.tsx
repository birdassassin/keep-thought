/**
 * React Router 7 基础教程
 * 
 * 本文件涵盖 React Router 的核心基础概念：
 * - BrowserRouter: 路由容器，使用 HTML5 History API
 * - Routes/Route: 路由配置组件
 * - Link: 声明式导航链接
 * - useNavigate: 编程式导航 Hook
 * - useParams: 获取动态路由参数
 * 
 * 适合新手入门学习
 */

import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
  Navigate,
} from 'react-router-dom';

// ============================================
// 第一部分：基本页面组件
// ============================================

/**
 * 首页组件
 * 展示基本的 JSX 渲染和 Link 导航
 */
function HomePage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>欢迎来到 React Router 7 教程</h1>
      <p>这是首页，你可以通过导航栏访问其他页面。</p>
      
      {/* Link 组件用于声明式导航，不会刷新页面 */}
      <nav style={{ marginTop: '20px' }}>
        <Link to="/about" style={{ marginRight: '10px' }}>
          关于我们
        </Link>
        <Link to="/users" style={{ marginRight: '10px' }}>
          用户列表
        </Link>
        <Link to="/products/laptop">
          产品详情（动态路由示例）
        </Link>
      </nav>
    </div>
  );
}

/**
 * 关于页面组件
 */
function AboutPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>关于我们</h1>
      <p>React Router 是 React 生态中最流行的路由库。</p>
      <p>版本: v7.x</p>
      
      {/* 返回首页的链接 */}
      <Link to="/">返回首页</Link>
    </div>
  );
}

// ============================================
// 第二部分：useNavigate - 编程式导航
// ============================================

/**
 * 登录页面组件
 * 演示 useNavigate Hook 的使用
 * 
 * useNavigate 返回一个函数，用于编程式导航
 * 常用于：登录后跳转、表单提交后跳转等场景
 */
function LoginPage() {
  // useNavigate Hook 返回导航函数
  const navigate = useNavigate();
  
  // 模拟登录状态
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  /**
   * 处理登录逻辑
   * 登录成功后使用 navigate 跳转到首页
   */
  const handleLogin = () => {
    // 模拟登录操作
    setIsLoggedIn(true);
    
    // 方式1: 使用路径字符串导航
    navigate('/');
    
    // 方式2: 导航并替换历史记录（用户无法返回）
    // navigate('/', { replace: true });
    
    // 方式3: 导航并传递状态
    // navigate('/', { state: { from: 'login' } });
  };
  
  /**
   * 处理延迟跳转示例
   */
  const handleDelayedNavigation = () => {
    // 3秒后跳转
    setTimeout(() => {
      navigate('/about');
    }, 3000);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>登录页面</h1>
      <p>演示 useNavigate 编程式导航</p>
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleLogin} style={{ marginRight: '10px' }}>
          登录并跳转到首页
        </button>
        <button onClick={handleDelayedNavigation}>
          3秒后跳转到关于页
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/">返回首页</Link>
      </div>
    </div>
  );
}

// ============================================
// 第三部分：useParams - 动态路由参数
// ============================================

/**
 * 用户详情页面
 * 演示 useParams 获取动态路由参数
 * 
 * 动态路由格式: /users/:userId
 * :userId 是动态参数，可通过 useParams 获取
 */
function UserDetailPage() {
  // useParams 返回一个对象，包含所有路由参数
  const { userId } = useParams<{ userId: string }>();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>用户详情</h1>
      
      {/* 显示从 URL 中获取的用户 ID */}
      <p>当前用户 ID: <strong>{userId}</strong></p>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/users">返回用户列表</Link>
      </div>
    </div>
  );
}

/**
 * 产品详情页面
 * 演示多个动态参数的使用
 * 
 * 路由格式: /products/:category/:productId?
 * 可以有多个动态参数，也可以有可选参数
 */
function ProductDetailPage() {
  // 获取所有路由参数
  const { category, productId } = useParams<{
    category: string;
    productId?: string;
  }>();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>产品详情</h1>
      
      <p>产品类别: <strong>{category}</strong></p>
      {productId && <p>产品 ID: <strong>{productId}</strong></p>}
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/">返回首页</Link>
      </div>
    </div>
  );
}

// ============================================
// 第四部分：useLocation 和 useSearchParams
// ============================================

/**
 * 搜索页面
 * 演示 useLocation 和 useSearchParams 的使用
 * 
 * useLocation: 获取当前 URL 信息
 * useSearchParams: 获取和修改查询参数
 */
function SearchPage() {
  // useLocation 返回当前 URL 的完整信息
  const location = useLocation();
  
  // useSearchParams 返回数组和设置函数
  // 类似 useState，用于读取和修改查询参数
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 获取查询参数
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const page = searchParams.get('page') || '1';
  
  /**
   * 更新搜索参数
   * setSearchParams 会更新 URL 查询字符串
   */
  const handleSearch = (newQuery: string) => {
    setSearchParams({
      q: newQuery,
      category: category,
      page: '1', // 搜索时重置页码
    });
  };
  
  /**
   * 切换分类
   */
  const handleCategoryChange = (newCategory: string) => {
    setSearchParams({
      q: query,
      category: newCategory,
      page: '1',
    });
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>搜索页面</h1>
      
      {/* 显示当前 URL 信息 */}
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '10px', 
        marginBottom: '20px' 
      }}>
        <h3>useLocation 信息:</h3>
        <p>pathname: {location.pathname}</p>
        <p>search: {location.search}</p>
        <p>hash: {location.hash}</p>
      </div>
      
      {/* 搜索输入 */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="输入搜索关键词..."
          style={{ padding: '8px', width: '300px' }}
        />
      </div>
      
      {/* 分类选择 */}
      <div style={{ marginBottom: '20px' }}>
        <span>分类: </span>
        {['all', 'electronics', 'books', 'clothing'].map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              marginRight: '5px',
              padding: '5px 10px',
              backgroundColor: category === cat ? '#007bff' : '#fff',
              color: category === cat ? '#fff' : '#000',
              border: '1px solid #007bff',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {/* 显示当前查询参数 */}
      <div>
        <h3>当前查询参数:</h3>
        <p>关键词: {query || '(空)'}</p>
        <p>分类: {category}</p>
        <p>页码: {page}</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/">返回首页</Link>
      </div>
    </div>
  );
}

// ============================================
// 第五部分：用户列表和 404 页面
// ============================================

/**
 * 用户列表页面
 * 包含用户链接，演示动态路由的生成
 */
function UsersPage() {
  // 模拟用户数据
  const users = [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
    { id: '3', name: '王五' },
  ];
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>用户列表</h1>
      
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {/* 动态生成用户详情链接 */}
            <Link to={`/users/${user.id}`}>
              {user.name} (ID: {user.id})
            </Link>
          </li>
        ))}
      </ul>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/">返回首页</Link>
      </div>
    </div>
  );
}

/**
 * 404 页面
 * 当没有匹配的路由时显示
 */
function NotFoundPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>404 - 页面未找到</h1>
      <p>抱歉，您访问的页面不存在。</p>
      <Link to="/">返回首页</Link>
    </div>
  );
}

// ============================================
// 第六部分：Navigate 组件和重定向
// ============================================

/**
 * 旧版页面（演示重定向）
 * Navigate 组件用于声明式重定向
 */
function OldPageRedirect() {
  return (
    <div>
      <h2>正在重定向...</h2>
      {/* Navigate 组件用于声明式重定向 */}
      <Navigate to="/about" replace />
    </div>
  );
}

/**
 * 受保护的路由组件（路由守卫示例）
 * 演示如何实现需要登录才能访问的路由
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

function ProtectedRoute({ children, isAuthenticated }: ProtectedRouteProps) {
  // 如果未登录，重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // 已登录，渲染子组件
  return <>{children}</>;
}

/**
 * 受保护的页面
 */
function ProtectedPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>受保护的页面</h1>
      <p>只有登录用户才能看到这个页面。</p>
      <Link to="/">返回首页</Link>
    </div>
  );
}

// ============================================
// 第七部分：路由配置
// ============================================

/**
 * 导航栏组件
 * 显示当前激活的路由状态
 */
function NavBar() {
  const location = useLocation();
  
  // 定义导航链接
  const links = [
    { to: '/', label: '首页' },
    { to: '/about', label: '关于' },
    { to: '/users', label: '用户' },
    { to: '/search', label: '搜索' },
    { to: '/login', label: '登录' },
    { to: '/protected', label: '受保护页面' },
  ];
  
  return (
    <nav style={{
      padding: '10px 20px',
      backgroundColor: '#f0f0f0',
      marginBottom: '20px',
    }}>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          style={{
            marginRight: '15px',
            color: location.pathname === link.to ? '#007bff' : '#333',
            fontWeight: location.pathname === link.to ? 'bold' : 'normal',
            textDecoration: 'none',
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * 主应用布局组件
 */
function AppLayout() {
  return (
    <div>
      <NavBar />
      
      {/* Outlet 用于渲染匹配的子路由 */}
      {/* 在这个简单示例中，我们直接使用 Routes */}
    </div>
  );
}

/**
 * 主应用组件
 * 
 * BrowserRouter 是路由的根容器
 * 它使用 HTML5 History API 来保持 UI 与 URL 同步
 */
function App() {
  // 模拟认证状态
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  return (
    <BrowserRouter>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* 全局导航栏 */}
        <NavBar />
        
        {/* 登录状态切换按钮 */}
        <div style={{ padding: '0 20px', marginBottom: '10px' }}>
          <button onClick={() => setIsAuthenticated(!isAuthenticated)}>
            {isAuthenticated ? '登出' : '模拟登录'}
          </button>
          <span style={{ marginLeft: '10px' }}>
            状态: {isAuthenticated ? '已登录' : '未登录'}
          </span>
        </div>
        
        {/* 
          Routes 组件是路由匹配的容器
          它会遍历所有子 Route，找到最佳匹配并渲染
        */}
        <Routes>
          {/* 
            Route 组件定义单个路由
            - path: URL 路径
            - element: 匹配时渲染的组件
          */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/users" element={<UsersPage />} />
          
          {/* 
            动态路由 - 使用 :paramName 语法定义参数
            访问 /users/123 时，userId 参数值为 "123"
          */}
          <Route path="/users/:userId" element={<UserDetailPage />} />
          
          {/* 
            多个动态参数
            访问 /products/electronics/laptop 时
            category = "electronics", productId = "laptop"
          */}
          <Route 
            path="/products/:category" 
            element={<ProductDetailPage />} 
          />
          <Route 
            path="/products/:category/:productId" 
            element={<ProductDetailPage />} 
          />
          
          {/* 搜索页面 - 演示查询参数 */}
          <Route path="/search" element={<SearchPage />} />
          
          {/* 
            受保护的路由
            使用包装组件实现路由守卫
          */}
          <Route
            path="/protected"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProtectedPage />
              </ProtectedRoute>
            }
          />
          
          {/* 重定向示例 */}
          <Route path="/old-page" element={<OldPageRedirect />} />
          
          {/* 
            404 路由 - 使用 * 匹配所有未匹配的路径
            必须放在最后
          */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

// ============================================
// 导出示例
// ============================================

export default App;

// 导出各个组件，方便单独使用
export {
  HomePage,
  AboutPage,
  LoginPage,
  UsersPage,
  UserDetailPage,
  ProductDetailPage,
  SearchPage,
  NotFoundPage,
  ProtectedRoute,
};

/**
 * ============================================
 * 学习总结
 * ============================================
 * 
 * 1. BrowserRouter
 *    - 路由的根容器，必须包裹所有路由相关组件
 *    - 使用 HTML5 History API
 *    - 替代方案：HashRouter（使用 URL hash）
 * 
 * 2. Routes 和 Route
 *    - Routes: 路由匹配容器，选择最佳匹配
 *    - Route: 定义单个路由，path + element
 * 
 * 3. Link
 *    - 声明式导航，类似 <a> 标签
 *    - 不会导致页面刷新
 *    - to 属性指定目标路径
 * 
 * 4. useNavigate
 *    - 编程式导航 Hook
 *    - 返回 navigate 函数
 *    - 支持路径、选项（replace、state）
 * 
 * 5. useParams
 *    - 获取动态路由参数
 *    - 返回包含所有参数的对象
 *    - 参数名对应路由定义中的 :paramName
 * 
 * 6. useLocation
 *    - 获取当前 URL 信息
 *    - 返回 { pathname, search, hash, state }
 * 
 * 7. useSearchParams
 *    - 读取和修改查询参数
 *    - 类似 useState 的 API
 *    - 自动更新 URL
 * 
 * 8. Navigate
 *    - 声明式重定向组件
 *    - 用于路由守卫、条件跳转
 * 
 * 下一步：学习 02-nested-routing.tsx 了解嵌套路由
 */
