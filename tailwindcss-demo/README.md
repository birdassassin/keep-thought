# Tailwind CSS v4 完整教程示例

> **版本**: Tailwind CSS v4.x
> **引擎**: Oxide (全新高性能编译引擎)
> **更新日期**: 2025

---

## 目录

- [什么是 Tailwind CSS v4](#什么是-tailwind-css-v4)
- [v4 重大变更](#v4-重大变更)
- [快速开始](#快速开始)
- [示例目录](#示例目录)
- [从 v3 迁移到 v4](#从-v3-迁移到-v4)
- [学习资源](#学习资源)

---

## 什么是 Tailwind CSS v4

Tailwind CSS v4 是 Tailwind CSS 的第四个主要版本，于 2025 年 1 月正式发布。这是自 v3 以来最重大的更新，引入了全新的 Oxide 引擎，带来了显著的性能提升和更现代化的开发体验。

**核心特点**:
- 基于 Rust 编写的全新 Oxide 引擎，构建速度提升 10 倍
- 不再依赖 PostCSS 插件，使用原生 CSS 导入
- 配置从 JavaScript 迁移到 CSS，更符合 CSS 原生开发习惯
- 原生支持 CSS 变量（自定义属性）
- 内置容器查询支持
- 更智能的自动内容检测

---

## v4 重大变更

### 1. Oxide 引擎

v4 使用全新的 Oxide 引擎（基于 Rust 编写），替代了之前的 PostCSS 插件架构。

```css
/* v4 不再需要 postcss.config.js 和 tailwind.config.js */
/* 直接在 CSS 文件中导入即可 */
@import "tailwindcss";
```

**性能提升**:
- 构建速度提升约 10 倍
- 增量编译更快
- 内存占用更低
- 支持流式处理

### 2. CSS 配置替代 JS 配置

v3 时代需要在 `tailwind.config.js` 中配置主题：

```js
// v3 - tailwind.config.js (已废弃)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
      }
    }
  }
}
```

v4 改为在 CSS 文件中使用 `@theme` 指令：

```css
/* v4 - 直接在 CSS 中配置 */
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --font-sans: "Inter", sans-serif;
}
```

### 3. @import 替代 @tailwind 指令

```css
/* v3 - 使用 @tailwind 指令 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 - 使用 @import 导入 */
@import "tailwindcss";
```

v4 的 `@import "tailwindcss"` 一行代码就替代了 v3 中的三个 `@tailwind` 指令。

### 4. 原生 CSS 变量

v4 全面拥抱 CSS 自定义属性（CSS Variables），所有设计令牌都基于 CSS 变量：

```css
/* v4 内置的 CSS 变量 */
/* --color-blue-500: #3b82f6; */
/* --spacing-4: 1rem; */
/* --font-size-lg: 1.125rem; */

/* 可以直接在任意地方使用 */
.custom-element {
  color: var(--color-blue-500);
  padding: var(--spacing-4);
}
```

### 5. 容器查询（Container Queries）

v4 原生支持容器查询，无需额外配置：

```css
/* 定义容器 */
.card-container {
  @container;
}

/* 容器查询工具类 */
@container (min-width: 400px) {
  .card-title {
    @apply text-xl;
  }
}
```

```html
<!-- 使用 @container 工具类 -->
<div class="@container">
  <div class="@md:flex @md:gap-4">
    <!-- 在容器宽度 >= 768px 时生效 -->
  </div>
</div>
```

### 6. 其他重要变更

| 变更项 | v3 | v4 |
|--------|----|----|
| 引擎 | PostCSS 插件 | Oxide (Rust) |
| 配置方式 | `tailwind.config.js` | CSS `@theme` 指令 |
| 导入方式 | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| 前缀配置 | `prefix` 选项 | `@import "tailwindcss" prefix(tw)` |
| 内容检测 | `content` 配置项 | 自动检测源文件 |
| 浏览器前缀 | `autoprefixer` | 内置支持 |
| 变体排序 | 需要手动配置 | 自动排序 |
| 3D 变换 | `transform-3d` | 默认支持 |

---

## 快速开始

### 方式一：Vite 项目（推荐）

```bash
# 创建 Vite 项目
npm create vite@latest my-app -- --template vanilla

# 进入项目目录
cd my-app

# 安装 Tailwind CSS v4
npm install tailwindcss @tailwindcss/vite

# 在 vite.config.js 中添加插件
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

```css
/* 在 CSS 文件中导入 Tailwind */
@import "tailwindcss";
```

### 方式二：CLI 方式

```bash
# 安装 Tailwind CSS v4 CLI
npm install -D tailwindcss

# 直接编译 CSS
npx tailwindcss -i input.css -o output.css --watch
```

### 方式三：CDN 方式（仅用于原型开发）

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <h1 class="text-3xl font-bold text-blue-500">Hello Tailwind v4!</h1>
</body>
</html>
```

> **注意**: CDN 方式仅建议用于快速原型和演示，生产环境请使用构建工具。

---

## 示例目录

```
tailwindcss-demo/
├── README.md                          # 本文件 - 项目说明与教程索引
└── src/
    └── examples/
        ├── 01-basics.css              # 基础教程 - 安装、工具类、响应式、状态
        ├── 02-layout.css              # 布局教程 - Flexbox、Grid、容器查询、定位
        ├── 03-components.css          # 组件教程 - Button、Card、Form、Nav、Modal、Table
        ├── 04-theme.css               # 主题教程 - @theme、自定义颜色、暗黑模式
        ├── 05-animations.css          # 动画教程 - 过渡、变换、动画、hover效果
        └── 06-migration.md            # 迁移指南 - v3 到 v4 完整迁移指南
```

### 各文件说明

| 文件 | 内容 | 难度 |
|------|------|------|
| `01-basics.css` | 安装方式、基础工具类、响应式设计、交互状态 | 入门 |
| `02-layout.css` | Flexbox、Grid、容器查询、定位系统 | 入门 |
| `03-components.css` | 按钮、卡片、表单、导航、弹窗、表格 | 进阶 |
| `04-theme.css` | 主题配置、自定义设计令牌、暗黑模式 | 进阶 |
| `05-animations.css` | 过渡效果、变换、动画关键帧、加载动画 | 进阶 |
| `06-migration.md` | v3 到 v4 迁移指南、类名变更对照表 | 参考 |

---

## 从 v3 迁移到 v4

### 自动升级工具

Tailwind CSS v4 提供了官方升级工具：

```bash
# 运行官方升级命令
npx tailwindcss@latest upgrade
```

该工具会自动：
- 更新 `package.json` 中的依赖版本
- 将 `tailwind.config.js` 转换为 CSS `@theme` 配置
- 替换 `@tailwind` 指令为 `@import`
- 更新已变更的类名
- 移除已废弃的类名

### 手动迁移步骤

1. **更新依赖**: 将 `tailwindcss` 升级到 `^4.0.0`
2. **移除 PostCSS 配置**: 删除 `postcss.config.js` 和 `autoprefixer`
3. **更新构建工具**: 使用 `@tailwindcss/vite` 或 `@tailwindcss/postcss` 插件
4. **迁移配置**: 将 `tailwind.config.js` 转换为 CSS `@theme`
5. **替换导入**: `@tailwind` 改为 `@import "tailwindcss"`
6. **更新类名**: 参照迁移指南更新已变更的类名

详细的迁移指南请参考 [06-migration.md](src/examples/06-migration.md)。

---

## 学习资源

- [Tailwind CSS v4 官方文档](https://tailwindcss.com/docs)
- [Tailwind CSS v4 升级指南](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind CSS GitHub](https://github.com/tailwindlabs/tailwindcss)
- [Tailwind CSS Playground](https://play.tailwindcss.com/)

---

## 许可证

本教程示例代码仅供学习参考。Tailwind CSS 本身遵循 MIT 许可证。
