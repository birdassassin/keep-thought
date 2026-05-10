/**
 * React 19 文档元数据支持演示
 * 可以在任意组件中直接写 title、meta、link 等标签
 * React 会自动将它们提升到 document head
 */

import { useState } from 'react';

// ========== 博客文章组件 ==========
interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
}

const samplePost: Post = {
  id: 1,
  title: '深入理解 React 19 新特性',
  excerpt: 'React 19 带来了 Actions、useOptimistic、use() 等众多激动人心的新特性...',
  content: `
    React 19 是 React 框架的重大更新，带来了许多开发者期待已久的特性。

    本文将详细介绍 Actions、useOptimistic、use() API、ref as prop 等新特性，
    帮助你快速掌握 React 19 的核心概念。

    Actions 让异步操作变得前所未有的简单...
  `,
  author: 'React 团队',
  tags: ['React', '前端', 'JavaScript']
};

function BlogPost({ post }: { post: Post }) {
  return (
    <article className="blog-post">
      {/* React 19: 直接在组件中写 title 和 meta */}
      <title>{post.title} | React 19 博客</title>
      <meta name="description" content={post.excerpt} />
      <meta name="author" content={post.author} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />

      {/* 动态添加标签 meta */}
      {post.tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>作者: {post.author}</span>
        <span>标签: {post.tags.join(', ')}</span>
      </div>
      <div className="post-content">
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph.trim()}</p>
        ))}
      </div>
    </article>
  );
}

// ========== 产品页面组件 ==========
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

const sampleProduct: Product = {
  id: 1,
  name: 'React 19 学习指南',
  price: 99.99,
  description: '全面掌握 React 19 新特性的实战指南',
  image: 'https://example.com/react19-guide.jpg'
};

function ProductPage({ product }: { product: Product }) {
  return (
    <div className="product-page">
      {/* 产品页面的元数据 */}
      <title>{product.name} - 仅售 ¥{product.price}</title>
      <meta name="description" content={product.description} />
      <meta property="og:price:amount" content={product.price.toString()} />
      <meta property="og:price:currency" content="CNY" />

      {/* 预加载产品图片 */}
      <link rel="preload" as="image" href={product.image} />

      <div className="product-card">
        <h2>{product.name}</h2>
        <p className="price">¥{product.price}</p>
        <p className="description">{product.description}</p>
        <button className="buy-btn">立即购买</button>
      </div>
    </div>
  );
}

// ========== 样式表加载组件 ==========
function StyledComponent() {
  return (
    <div className="styled-section">
      {/* React 19: 在组件中直接加载样式表 */}
      <link
        rel="stylesheet"
        href="/styles/special.css"
        precedence="default"
      />

      <h3>样式表加载演示</h3>
      <p>
        React 19 支持在组件中直接加载样式表，
        precedence 属性控制样式优先级。
      </p>
    </div>
  );
}

// ========== 脚本加载组件 ==========
function ScriptComponent() {
  return (
    <div className="script-section">
      {/* React 19: 在组件中直接加载脚本 */}
      <script
        src="/scripts/analytics.js"
        async
      />

      <h3>脚本加载演示</h3>
      <p>
        React 19 支持在组件中直接加载脚本，
        配合 Suspense 可以实现智能加载。
      </p>
    </div>
  );
}

// ========== 主组件 ==========
export default function MetadataDemo() {
  const [currentView, setCurrentView] = useState<'blog' | 'product' | 'styled'>('blog');

  return (
    <div className="demo-container">
      <h2>React 19 文档元数据支持</h2>
      <p className="intro">
        React 19 允许在任意组件中直接编写 title、meta、link 等标签，
        React 会自动将它们提升到 document head。这让 SEO 和元数据管理变得前所未有的简单。
      </p>

      {/* 全局元数据 */}
      <title>React 19 演示 - 元数据支持</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#61dafb" />

      <div className="view-switcher">
        <button
          onClick={() => setCurrentView('blog')}
          className={currentView === 'blog' ? 'active' : ''}
        >
          博客文章
        </button>
        <button
          onClick={() => setCurrentView('product')}
          className={currentView === 'product' ? 'active' : ''}
        >
          产品页面
        </button>
        <button
          onClick={() => setCurrentView('styled')}
          className={currentView === 'styled' ? 'active' : ''}
        >
          资源加载
        </button>
      </div>

      <div className="demo-content">
        {currentView === 'blog' && <BlogPost post={samplePost} />}
        {currentView === 'product' && <ProductPage product={sampleProduct} />}
        {currentView === 'styled' && (
          <>
            <StyledComponent />
            <ScriptComponent />
          </>
        )}
      </div>

      <div className="code-explanation">
        <h4>支持的元数据标签：</h4>
        <ul>
          <li><code>&lt;title&gt;</code> - 页面标题</li>
          <li><code>&lt;meta&gt;</code> - 元数据标签</li>
          <li><code>&lt;link&gt;</code> - 外部资源链接</li>
          <li><code>&lt;style&gt;</code> - 内联样式</li>
          <li><code>&lt;script&gt;</code> - 脚本加载</li>
        </ul>

        <h4>SSR 支持：</h4>
        <p>
          这些元数据标签在服务端渲染时同样有效，
          React 会确保它们出现在正确的位置。
        </p>

        <h4>与 Suspense 配合：</h4>
        <p>
          样式表和脚本可以放在 Suspense 边界内，
          不会阻塞渲染，提供更好的用户体验。
        </p>
      </div>
    </div>
  );
}
