/**
 * React Router 7 嵌套路由教程
 * 
 * 本文件涵盖嵌套路由的核心概念：
 * - 嵌套路由: 在路由中定义子路由
 * - Outlet: 子路由的渲染出口
 * - 相对路径: 子路由的路径相对于父路由
 * - 布局路由: 共享布局的路由模式
 * - 索引路由: 父路由的默认子路由
 * 
 * 嵌套路由是构建复杂应用的关键技术
 */

import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
  useParams,
  useLocation,
  Navigate,
  IndexRouteObject,
} from 'react-router-dom';

// ============================================
// 第一部分：基础嵌套路由
// ============================================

/**
 * 布局组件 - 包含共享的导航和样式
 * 
 * Outlet 组件是嵌套路由的核心：
 * - 它标记了子路由应该渲染的位置
 * - 当 URL 匹配子路由时，子组件会渲染在 Outlet 的位置
 * 
 * 想象成插槽：父组件定义框架，Outlet 是子组件的占位符
 */
function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* 侧边栏导航 - 在所有子页面中共享 */}
      <nav style={{
        width: '200px',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRight: '1px solid #ddd',
      }}>
        <h3>导航菜单</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/">首页</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/dashboard">仪表盘</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/products">产品管理</Link>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <Link to="/settings">系统设置</Link>
          </li>
        </ul>
      </nav>
      
      {/* 主内容区域 */}
      <main style={{
        flex: 1,
        padding: '20px',
        backgroundColor: '#fff',
      }}>
        {/* 
          Outlet 是子路由的渲染出口
          当访问 /dashboard 时，Dashboard 组件会渲染在这里
          当访问 /products 时，ProductsLayout 组件会渲染在这里
        */}
        <Outlet />
      </main>
    </div>
  );
}

/**
 * 首页组件
 */
function HomePage() {
  return (
    <div>
      <h1>欢迎来到管理系统</h1>
      <p>这是一个演示嵌套路由的示例应用。</p>
      <p>请使用左侧导航菜单浏览不同功能模块。</p>
    </div>
  );
}

// ============================================
// 第二部分：多层嵌套路由
// ============================================

/**
 * 仪表盘布局组件
 * 演示多层嵌套路由
 */
function DashboardLayout() {
  return (
    <div>
      <h1>仪表盘</h1>
      
      {/* 子导航 */}
      <nav style={{
        marginBottom: '20px',
        borderBottom: '1px solid #ddd',
        paddingBottom: '10px',
      }}>
        {/* 
          相对路径示例：
          - to="overview" 相对于当前路由 /dashboard
          - 等同于 /dashboard/overview
        */}
        <Link 
          to="overview" 
          style={{ marginRight: '15px' }}
        >
          概览
        </Link>
        <Link 
          to="analytics" 
          style={{ marginRight: '15px' }}
        >
          数据分析
        </Link>
        <Link 
          to="reports" 
          style={{ marginRight: '15px' }}
        >
          报告
        </Link>
      </nav>
      
      {/* 子路由渲染出口 */}
      <Outlet />
    </div>
  );
}

/**
 * 仪表盘概览页面
 */
function DashboardOverview() {
  return (
    <div>
      <h2>概览</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
      }}>
        <StatCard title="总用户" value="1,234" />
        <StatCard title="活跃用户" value="856" />
        <StatCard title="新增用户" value="123" />
      </div>
    </div>
  );
}

/**
 * 统计卡片组件
 */
function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      textAlign: 'center',
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{value}</p>
    </div>
  );
}

/**
 * 数据分析页面
 */
function AnalyticsPage() {
  return (
    <div>
      <h2>数据分析</h2>
      <p>这里显示各种数据图表和分析结果。</p>
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '40px',
        textAlign: 'center',
        borderRadius: '8px',
      }}>
        [图表区域 - 实际项目中可集成图表库]
      </div>
    </div>
  );
}

/**
 * 报告列表页面
 */
function ReportsPage() {
  const reports = [
    { id: 1, title: '月度销售报告', date: '2024-01-01' },
    { id: 2, title: '用户增长报告', date: '2024-01-15' },
    { id: 3, title: '系统性能报告', date: '2024-02-01' },
  ];
  
  return (
    <div>
      <h2>报告列表</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>报告名称</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>日期</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{report.title}</td>
              <td style={{ padding: '10px' }}>{report.date}</td>
              <td style={{ padding: '10px' }}>
                <Link to={`/dashboard/reports/${report.id}`}>
                  查看详情
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 报告详情页面
 * 演示在多层嵌套路由中使用参数
 */
function ReportDetail() {
  const { reportId } = useParams<{ reportId: string }>();
  
  return (
    <div>
      <h2>报告详情</h2>
      <p>报告 ID: {reportId}</p>
      <Link to="/dashboard/reports">返回报告列表</Link>
    </div>
  );
}

// ============================================
// 第三部分：产品管理 - 另一个嵌套路由示例
// ============================================

/**
 * 产品管理布局
 */
function ProductsLayout() {
  return (
    <div>
      <h1>产品管理</h1>
      
      {/* 子导航 */}
      <nav style={{ marginBottom: '20px' }}>
        <Link to="list" style={{ marginRight: '15px' }}>产品列表</Link>
        <Link to="categories">产品分类</Link>
      </nav>
      
      <Outlet />
    </div>
  );
}

/**
 * 产品列表页面
 */
function ProductList() {
  const products = [
    { id: 1, name: '笔记本电脑', price: 5999, stock: 100 },
    { id: 2, name: '智能手机', price: 3999, stock: 200 },
    { id: 3, name: '无线耳机', price: 299, stock: 500 },
  ];
  
  return (
    <div>
      <h2>产品列表</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>产品名称</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>价格</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>库存</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{product.name}</td>
              <td style={{ padding: '10px' }}>¥{product.price}</td>
              <td style={{ padding: '10px' }}>{product.stock}</td>
              <td style={{ padding: '10px' }}>
                <Link to={`${product.id}`}>编辑</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 产品编辑页面
 */
function ProductEdit() {
  const { productId } = useParams<{ productId: string }>();
  
  return (
    <div>
      <h2>编辑产品</h2>
      <p>正在编辑产品 ID: {productId}</p>
      <Link to="/products/list">返回列表</Link>
    </div>
  );
}

/**
 * 产品分类页面
 */
function ProductCategories() {
  const categories = [
    { id: 1, name: '电子产品', count: 150 },
    { id: 2, name: '服装', count: 300 },
    { id: 3, name: '食品', count: 200 },
  ];
  
  return (
    <div>
      <h2>产品分类</h2>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id} style={{ marginBottom: '10px' }}>
            {cat.name} ({cat.count} 个产品)
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// 第四部分：索引路由
// ============================================

/**
 * 设置页面布局
 */
function SettingsLayout() {
  return (
    <div>
      <h1>系统设置</h1>
      
      {/* 子导航 */}
      <nav style={{ marginBottom: '20px' }}>
        {/* 
          索引路由链接：
          to="." 或 to="" 表示当前路由
          点击后会匹配索引路由
        */}
        <Link to="" style={{ marginRight: '15px' }}>基本设置</Link>
        <Link to="security" style={{ marginRight: '15px' }}>安全设置</Link>
        <Link to="notifications">通知设置</Link>
      </nav>
      
      <Outlet />
    </div>
  );
}

/**
 * 基本设置页面 - 索引路由组件
 * 
 * 索引路由是父路由的默认子路由
 * 当访问 /settings 时，这个组件会被渲染
 * 不需要额外的路径
 */
function SettingsGeneral() {
  return (
    <div>
      <h2>基本设置</h2>
      <p>这是设置页面的默认内容（索引路由）。</p>
      
      <div style={{ marginTop: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          网站名称：
          <input type="text" defaultValue="我的应用" style={{ marginLeft: '10px' }} />
        </label>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          语言：
          <select style={{ marginLeft: '10px' }}>
            <option>中文</option>
            <option>English</option>
          </select>
        </label>
      </div>
    </div>
  );
}

/**
 * 安全设置页面
 */
function SettingsSecurity() {
  return (
    <div>
      <h2>安全设置</h2>
      <p>管理密码和两步验证等安全选项。</p>
      
      <div style={{ marginTop: '20px' }}>
        <button style={{ padding: '10px 20px', marginRight: '10px' }}>
          修改密码
        </button>
        <button style={{ padding: '10px 20px' }}>
          启用两步验证
        </button>
      </div>
    </div>
  );
}

/**
 * 通知设置页面
 */
function SettingsNotifications() {
  return (
    <div>
      <h2>通知设置</h2>
      <p>配置邮件和推送通知。</p>
      
      <div style={{ marginTop: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input type="checkbox" defaultChecked /> 接收邮件通知
        </label>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input type="checkbox" defaultChecked /> 接收推送通知
        </label>
      </div>
    </div>
  );
}

// ============================================
// 第五部分：布局路由模式
// ============================================

/**
 * 无布局路由示例
 * 演示如何在某些路由中跳过共享布局
 */

/**
 * 全屏登录页面
 * 不使用主布局
 */
function FullScreenLogin() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
    }}>
      <div style={{
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '300px',
      }}>
        <h2 style={{ textAlign: 'center' }}>登录</h2>
        <form>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="用户名"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="password"
              placeholder="密码"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="button"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            登录
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/">返回首页</Link>
        </p>
      </div>
    </div>
  );
}

// ============================================
// 第六部分：完整路由配置
// ============================================

/**
 * 主应用组件
 * 
 * 展示完整的嵌套路由配置
 * 注意观察路由的嵌套结构
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 
          根路由 - 使用 Layout 作为布局
          所有子路由都会继承这个布局
        */}
        <Route path="/" element={<Layout />}>
          {/* 
            索引路由
            当访问 / 时渲染
            index 属性表示这是父路由的默认路由
          */}
          <Route index element={<HomePage />} />
          
          {/* 
            登录页面 - 无布局
            使用绝对路径，不继承父布局
          */}
          <Route path="login" element={<FullScreenLogin />} />
          
          {/* 
            仪表盘 - 多层嵌套路由
            path="dashboard" 是相对路径
            完整路径: /dashboard
          */}
          <Route path="dashboard" element={<DashboardLayout />}>
            {/* 索引路由 - 访问 /dashboard 时显示 */}
            <Route index element={<DashboardOverview />} />
            
            {/* 
              子路由 - 相对路径
              完整路径: /dashboard/analytics
            */}
            <Route path="overview" element={<DashboardOverview />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            
            {/* 
              带参数的子路由
              完整路径: /dashboard/reports/:reportId
            */}
            <Route path="reports/:reportId" element={<ReportDetail />} />
          </Route>
          
          {/* 产品管理 - 另一个嵌套路由示例 */}
          <Route path="products" element={<ProductsLayout />}>
            {/* 索引路由 - 默认显示产品列表 */}
            <Route index element={<ProductList />} />
            <Route path="list" element={<ProductList />} />
            <Route path="categories" element={<ProductCategories />} />
            
            {/* 
              产品编辑 - 相对路径
              完整路径: /products/:productId
            */}
            <Route path=":productId" element={<ProductEdit />} />
          </Route>
          
          {/* 设置页面 - 索引路由示例 */}
          <Route path="settings" element={<SettingsLayout />}>
            {/* 
              索引路由
              当访问 /settings 时显示基本设置
            */}
            <Route index element={<SettingsGeneral />} />
            <Route path="security" element={<SettingsSecurity />} />
            <Route path="notifications" element={<SettingsNotifications />} />
          </Route>
          
          {/* 404 页面 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/**
 * 404 页面
 */
function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h1>404</h1>
      <p>页面未找到</p>
      <Link to="/">返回首页</Link>
    </div>
  );
}

// ============================================
// 第七部分：路由配置对象（可选方式）
// ============================================

/**
 * 使用配置对象定义路由
 * 
 * 这种方式适合：
 * - 需要动态生成路由
 * - 路由配置需要从后端获取
 * - 更喜欢配置式的开发风格
 * 
 * 使用 createBrowserRouter 和 RouterProvider
 */
const routeConfig = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'reports/:reportId', element: <ReportDetail /> },
        ],
      },
      {
        path: 'products',
        element: <ProductsLayout />,
        children: [
          { index: true, element: <ProductList /> },
          { path: 'categories', element: <ProductCategories /> },
          { path: ':productId', element: <ProductEdit /> },
        ],
      },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <SettingsGeneral /> },
          { path: 'security', element: <SettingsSecurity /> },
          { path: 'notifications', element: <SettingsNotifications /> },
        ],
      },
    ],
  },
];

// ============================================
// 导出
// ============================================

export default App;

// 导出路由配置，供 createBrowserRouter 使用
export { routeConfig };

// 导出各组件
export {
  Layout,
  HomePage,
  DashboardLayout,
  DashboardOverview,
  AnalyticsPage,
  ReportsPage,
  ReportDetail,
  ProductsLayout,
  ProductList,
  ProductEdit,
  ProductCategories,
  SettingsLayout,
  SettingsGeneral,
  SettingsSecurity,
  SettingsNotifications,
  FullScreenLogin,
};

/**
 * ============================================
 * 学习总结
 * ============================================
 * 
 * 1. Outlet 组件
 *    - 子路由的渲染出口
 *    - 必须在父路由组件中使用
 *    - 子组件会渲染在 Outlet 的位置
 * 
 * 2. 嵌套路由结构
 *    - Route 可以嵌套在 Route 内部
 *    - 子路由继承父路由的路径
 *    - 形成清晰的 URL 层级结构
 * 
 * 3. 相对路径
 *    - 子路由的 path 默认相对于父路由
 *    - path="dashboard" 等同于 /父路径/dashboard
 *    - 使用 Link 时，to="xxx" 也是相对路径
 * 
 * 4. 索引路由 (index)
 *    - 父路由的默认子路由
 *    - 不需要 path 属性
 *    - 访问父路径时渲染
 * 
 * 5. 布局路由
 *    - 父路由作为布局容器
 *    - 子路由共享父路由的 UI
 *    - 通过 Outlet 渲染子内容
 * 
 * 6. 多层嵌套
 *    - 可以无限层级嵌套
 *    - 每层都可以有自己的 Outlet
 *    - 适合复杂的应用结构
 * 
 * 7. 路由配置对象
 *    - 使用 JS 对象定义路由
 *    - 配合 createBrowserRouter 使用
 *    - 更适合动态路由场景
 * 
 * 下一步：学习 03-data-routing.tsx 了解数据路由
 */
