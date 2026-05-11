# Tailwind CSS v3 → v4 完整迁移指南

> 本指南帮助你将项目从 Tailwind CSS v3 平滑升级到 v4。

---

## 目录

- [一、升级前准备](#一升级前准备)
- [二、自动升级工具](#二自动升级工具)
- [三、手动迁移步骤](#三手动迁移步骤)
  - [3.1 更新依赖](#31-更新依赖)
  - [3.2 更新构建工具配置](#32-更新构建工具配置)
  - [3.3 替换导入语法](#33-替换导入语法)
  - [3.4 迁移主题配置](#34-迁移主题配置)
  - [3.5 更新类名](#35-更新类名)
- [四、类名变更对照表](#四类名变更对照表)
  - [4.1 重命名的类名](#41-重命名的类名)
  - [4.2 移除的类名](#42-移除的类名)
  - [4.3 新增的类名](#43-新增的类名)
- [五、配置文件变更对照表](#五配置文件变更对照表)
- [六、破坏性变更详解](#六破坏性变更详解)
- [七、常见问题](#七常见问题)

---

## 一、升级前准备

在开始迁移之前，请确保：

1. **备份项目**：创建一个 Git 分支或备份副本
2. **检查依赖兼容性**：确认其他依赖（如 UI 组件库）支持 Tailwind v4
3. **阅读升级指南**：了解所有破坏性变更
4. **预留时间**：根据项目大小，预留 1-4 小时的迁移时间

### v4 的最低要求

| 要求 | 说明 |
|------|------|
| Node.js | >= 18.0.0 |
| PostCSS | >= 8.4.31（如果使用 PostCSS） |
| Vite | >= 5.0（如果使用 Vite） |

---

## 二、自动升级工具

Tailwind CSS v4 提供了官方自动升级工具，可以处理大部分迁移工作。

### 使用方法

```bash
# 在项目根目录运行
npx tailwindcss@latest upgrade
```

### 升级工具会自动完成

- 更新 `package.json` 中的 Tailwind CSS 版本
- 将 `tailwind.config.js` 转换为 CSS `@theme` 配置
- 替换 `@tailwind` 指令为 `@import "tailwindcss"`
- 更新已变更的类名（如 `shadow-sm` → `shadow-xs`）
- 移除已废弃的类名
- 更新 PostCSS 配置

### 升级工具不会处理

- 自定义 JavaScript 插件（需要手动适配）
- 复杂的 `@apply` 规则中的类名更新
- 第三方组件库的兼容性问题
- 自定义 `addUtilities` / `addComponents` 插件

---

## 三、手动迁移步骤

如果你需要手动迁移或升级工具未能完全处理，请按以下步骤操作。

### 3.1 更新依赖

#### 步骤 1：卸载旧版本

```bash
npm uninstall tailwindcss postcss autoprefixer
```

#### 步骤 2：安装 v4

```bash
# Vite 项目
npm install tailwindcss @tailwindcss/vite

# Webpack / PostCSS 项目
npm install tailwindcss @tailwindcss/postcss

# CLI 项目
npm install -D tailwindcss
```

#### 步骤 3：更新 package.json

```json
{
  "dependencies": {
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

---

### 3.2 更新构建工具配置

#### Vite 项目

**v3 配置（旧）：**

```js
// vite.config.js
import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
})
```

**v4 配置（新）：**

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

> **注意**：v4 的 Vite 插件直接作为 Vite 插件使用，不再通过 PostCSS。

#### PostCSS 项目

**v3 配置（旧）：**

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**v4 配置（新）：**

```js
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

> **注意**：不再需要 `autoprefixer`，v4 内置了浏览器前缀支持。

#### CLI 项目

```bash
# v3
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch

# v4（命令相同，但功能更强大）
npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch
```

---

### 3.3 替换导入语法

#### CSS 文件变更

**v3（旧）：**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium;
  }
}
```

**v4（新）：**

```css
@import "tailwindcss";

/* @layer 在 v4 中仍然支持 */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium;
  }
}
```

#### 带前缀的导入

**v3（旧）：**

```js
// tailwind.config.js
module.exports = {
  prefix: 'tw-',
}
```

**v4（新）：**

```css
@import "tailwindcss" prefix(tw);
```

#### 指定扫描路径

**v3（旧）：**

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
    './components/**/*.{html,js}',
  ],
}
```

**v4（新）：**

```css
/* v4 自动检测源文件，通常无需配置 */
/* 如果需要指定，使用 @source 指令 */
@import "tailwindcss";
@source "../components";
@source "../pages";
```

---

### 3.4 迁移主题配置

这是迁移中最重要的一步。v4 使用 CSS `@theme` 指令替代了 `tailwind.config.js`。

#### 颜色配置迁移

**v3（旧）：**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
}
```

**v4（新）：**

```css
@import "tailwindcss";

@theme {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
}
```

#### 字体配置迁移

**v3（旧）：**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
}
```

**v4（新）：**

```css
@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Playfair Display', serif;
}
```

#### 间距配置迁移

**v3（旧）：**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
}
```

**v4（新）：**

```css
@theme {
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
}
```

#### 断点配置迁移

**v3（旧）：**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
      },
    },
  },
}
```

**v4（新）：**

```css
@theme {
  --breakpoint-3xl: 1920px;
}
```

#### 阴影配置迁移

**v3（旧）：**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
      },
    },
  },
}
```

**v4（新）：**

```css
@theme {
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.5);
}
```

#### 动画配置迁移

**v3（旧）：**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
}
```

**v4（新）：**

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@theme {
  --animate-fade-in: fadeIn 0.5s ease-out;
}
```

#### 暗黑模式配置迁移

**v3（旧）：**

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
}
```

**v4（新）：**

```css
@custom-variant dark (&:where(.dark, .dark *));
```

#### 完整配置迁移示例

**v3 tailwind.config.js（旧）：**

```js
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
```

**v4 CSS 配置（新）：**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --font-sans: 'Inter', sans-serif;
  --spacing-18: 4.5rem;
}
```

---

### 3.5 更新类名

升级后，部分类名发生了变化。请参照下方的 [类名变更对照表](#四类名变更对照表) 进行更新。

---

## 四、类名变更对照表

### 4.1 重命名的类名

以下类名在 v4 中被重命名，升级工具会自动处理这些变更。

#### 阴影相关

| v3 类名 | v4 类名 | 说明 |
|---------|---------|------|
| `shadow-sm` | `shadow-xs` | 小阴影重命名为 xs |
| `shadow` | `shadow-sm` | 默认阴影重命名为 sm |
| `shadow-md` | `shadow-md` | 不变 |
| `shadow-lg` | `shadow-lg` | 不变 |
| `shadow-xl` | `shadow-xl` | 不变 |
| `shadow-2xl` | `shadow-2xl` | 不变 |
| `shadow-none` | `shadow-none` | 不变 |
| `shadow-inner` | `shadow-inner` | 不变 |

#### 圆角相关

| v3 类名 | v4 类名 | 说明 |
|---------|---------|------|
| `rounded-sm` | `rounded-xs` | 小圆角重命名为 xs |
| `rounded` | `rounded-sm` | 默认圆角重命名为 sm |
| 不存在 | `rounded-md` | v4 新增 |
| `rounded-lg` | `rounded-lg` | 不变 |
| `rounded-xl` | `rounded-xl` | 不变 |
| `rounded-2xl` | `rounded-2xl` | 不变 |
| `rounded-3xl` | `rounded-3xl` | 不变 |

#### 边框宽度相关

| v3 类名 | v4 类名 | 说明 |
|---------|---------|------|
| `border` | `border` | 不变（1px） |
| `border-2` | `border-2` | 不变 |
| `border-4` | `border-4` | 不变 |
| `border-8` | `border-8` | 不变 |
| `border-dashed` | `border-dashed` | 不变 |

#### 渐变相关（重要变更）

| v3 类名 | v4 类名 | 说明 |
|---------|---------|------|
| `bg-gradient-to-r` | `bg-linear-to-r` | 渐变语法更新 |
| `bg-gradient-to-l` | `bg-linear-to-l` | 渐变语法更新 |
| `bg-gradient-to-t` | `bg-linear-to-t` | 渐变语法更新 |
| `bg-gradient-to-b` | `bg-linear-to-b` | 渐变语法更新 |
| `bg-gradient-to-tr` | `bg-linear-to-tr` | 渐变语法更新 |
| `bg-gradient-to-tl` | `bg-linear-to-tl` | 渐变语法更新 |
| `bg-gradient-to-br` | `bg-linear-to-br` | 渐变语法更新 |
| `bg-gradient-to-bl` | `bg-linear-to-bl` | 渐变语法更新 |
| `bg-gradient-to-r` | `bg-linear-to-r` | 渐变语法更新 |
| `bg-none` | `bg-none` | 不变 |

#### 逻辑属性（RTL 支持）

| v3 类名 | v4 类名 | 说明 |
|---------|---------|------|
| `ml-*` | `ms-*` | margin-left → margin-inline-start |
| `mr-*` | `me-*` | margin-right → margin-inline-end |
| `pl-*` | `ps-*` | padding-left → padding-inline-start |
| `pr-*` | `pe-*` | padding-right → padding-inline-end |
| `left-*` | `start-*` | left → inset-inline-start |
| `right-*` | `end-*` | right → inset-inline-end |
| `rounded-l-*` | `rounded-s-*` | 左圆角 → 起始圆角 |
| `rounded-r-*` | `rounded-e-*` | 右圆角 → 结束圆角 |
| `border-l-*` | `border-s-*` | 左边框 → 起始边框 |
| `border-r-*` | `border-e-*` | 右边框 → 结束边框 |

> **注意**：v3 的 `ml-*`、`mr-*` 等物理方向类名在 v4 中仍然可用，但推荐使用新的逻辑属性类名以获得更好的 RTL 支持。

#### 过渡相关

| v3 类名 | v4 类名 | 说明 |
|---------|---------|------|
| `transition` | `transition` | 不变 |
| `transition-all` | `transition-all` | 不变 |
| `transition-colors` | `transition-colors` | 不变 |
| `transition-opacity` | `transition-opacity` | 不变 |
| `transition-shadow` | `transition-shadow` | 不变 |
| `transition-transform` | `transition-transform` | 不变 |
| `ease-linear` | `ease-linear` | 不变 |
| `ease-in` | `ease-in` | 不变 |
| `ease-out` | `ease-out` | 不变 |
| `ease-in-out` | `ease-in-out` | 不变 |

#### 其他变更

| v3 类名 | v4 类名 | 说明 |
|---------|---------|------|
| `decoration-slice` | `box-decoration-slice` | 更准确的命名 |
| `decoration-clone` | `box-decoration-clone` | 更准确的命名 |
| `flex-shrink-0` | `shrink-0` | 简化命名 |
| `flex-shrink` | `shrink` | 简化命名 |
| `flex-grow` | `grow` | 简化命名 |
| `flex-grow-0` | `grow-0` | 简化命名 |
| `overflow-ellipsis` | `text-ellipsis` | 更准确的命名 |
| `flex-1` | `flex-1` | 不变 |

---

### 4.2 移除的类名

以下类名在 v4 中被完全移除。

| 移除的类名 | 替代方案 | 说明 |
|-----------|---------|------|
| `blur-sm` | `blur-[2px]` | 使用任意值替代 |
| `blur` | `blur-[4px]` | 使用任意值替代 |
| `blur-md` | `blur-12px` 或 `blur-[12px]` | 使用任意值替代 |
| `blur-lg` | `blur-16px` 或 `blur-[16px]` | 使用任意值替代 |
| `blur-xl` | `blur-24px` 或 `blur-[24px]` | 使用任意值替代 |
| `blur-2xl` | `blur-40px` 或 `blur-[40px]` | 使用任意值替代 |
| `blur-3xl` | `blur-64px` 或 `blur-[64px]` | 使用任意值替代 |
| `scale-x-*` | 保留 | 不变 |
| `scale-y-*` | 保留 | 不变 |
| `ring-offset-*` | `ring-offset-*` | 保留 |
| `grayscale` | `grayscale` | 保留 |
| `transform-3d` | 不需要 | v4 默认支持 3D 变换 |
| `transform` | 不需要 | v4 自动添加 |
| `placeholder-*` | `placeholder-*` | 保留（语法不变） |

#### v3 中已废弃的类名

以下类名在 v3 中已被标记为废弃，在 v4 中被正式移除：

| 移除的类名 | 替代方案 |
|-----------|---------|
| `shadow-outline` | `shadow-[0_0_0_1px_rgba(0,0,0,0.05)]` |
| `ring-transparent` | `ring-[transparent]` |
| `stroke-current` | `stroke-current` | 保留 |
| `text-opacity-*` | 使用颜色透明度 `text-blue-500/50` |
| `bg-opacity-*` | 使用颜色透明度 `bg-blue-500/50` |
| `border-opacity-*` | 使用颜色透明度 `border-blue-500/50` |
| `divide-opacity-*` | 使用颜色透明度 `divide-blue-500/50` |
| `ring-opacity-*` | 使用颜色透明度 `ring-blue-500/50` |
| `placeholder-opacity-*` | 使用颜色透明度 |

> **重要**：`*-opacity-*` 类名在 v4 中被完全移除。请使用新的颜色透明度语法：`text-blue-500/50` 替代 `text-blue-500 text-opacity-50`。

---

### 4.3 新增的类名

以下类名是 v4 新增的。

#### 容器查询相关

| 新增类名 | 说明 |
|---------|------|
| `@container` | 定义容器查询容器 |
| `@container/name` | 定义命名容器 |
| `@sm:` | 容器宽度 >= 640px 时生效 |
| `@md:` | 容器宽度 >= 768px 时生效 |
| `@lg:` | 容器宽度 >= 1024px 时生效 |
| `@xl:` | 容器宽度 >= 1280px 时生效 |
| `@2xl:` | 容器宽度 >= 1536px 时生效 |
| `@[300px]:` | 自定义容器断点 |

#### 颜色透明度语法

| 新增语法 | 说明 |
|---------|------|
| `bg-blue-500/50` | 背景色 50% 透明度 |
| `text-red-500/75` | 文字色 75% 透明度 |
| `border-green-500/30` | 边框色 30% 透明度 |
| `shadow-blue-500/20` | 阴影色 20% 透明度 |
| `ring-purple-500/40` | 环色 40% 透明度 |

#### 3D 变换（默认启用）

| 新增类名 | 说明 |
|---------|------|
| `rotate-x-*` | 绕 X 轴旋转 |
| `rotate-y-*` | 绕 Y 轴旋转 |
| `rotate-z-*` | 绕 Z 轴旋转 |
| `perspective-*` | 透视距离 |
| `perspective-origin-*` | 透视原点 |
| `backface-hidden` | 隐藏背面 |
| `transform-3d` | 不再需要，默认启用 |

#### 动画控制

| 新增类名 | 说明 |
|---------|------|
| `play-running` | 播放动画 |
| `play-paused` | 暂停动画 |
| `iteration-*` | 播放次数 |
| `direction-*` | 播放方向 |
| `fill-*` | 填充模式 |

#### 其他新增

| 新增类名 | 说明 |
|---------|------|
| `text-balance` | `text-wrap: balance` |
| `text-pretty` | `text-wrap: pretty` |
| `text-wrap` | `text-wrap: wrap` |
| `text-nowrap` | `white-space: nowrap` |
| `line-clamp-*` | 内置多行截断（v3 需要插件） |
| `appearance-*` | 表单外观控制 |
| `field-sizing-*` | 表单字段尺寸 |
| `inert` | `inert` 属性 |

---

## 五、配置文件变更对照表

### tailwind.config.js → CSS @theme

| v3 配置项 | v4 等价写法 |
|-----------|------------|
| `content: [...]` | `@source "...";` 或自动检测 |
| `darkMode: 'class'` | `@custom-variant dark (&:where(.dark, .dark *));` |
| `prefix: 'tw-'` | `@import "tailwindcss" prefix(tw);` |
| `important: true` | `@import "tailwindcss" important;` |
| `theme.colors.*` | `@theme { --color-*: ...; }` |
| `theme.fontFamily.*` | `@theme { --font-*: ...; }` |
| `theme.spacing.*` | `@theme { --spacing-*: ...; }` |
| `theme.screens.*` | `@theme { --breakpoint-*: ...; }` |
| `theme.boxShadow.*` | `@theme { --shadow-*: ...; }` |
| `theme.animation.*` | `@theme { --animate-*: ...; }` |
| `theme.keyframes.*` | `@keyframes ... { }` + `@theme { --animate-*: ...; }` |
| `theme.borderRadius.*` | `@theme { --radius-*: ...; }` |
| `theme.fontSize.*` | `@theme { --text-*: ...; }` |
| `theme.lineHeight.*` | `@theme { --leading-*: ...; }` |
| `theme.letterSpacing.*` | `@theme { --tracking-*: ...; }` |
| `plugins: [...]` | 使用 CSS 原生功能替代 |

### PostCSS 配置变更

| v3 | v4 |
|----|----|
| `tailwindcss` + `autoprefixer` | `@tailwindcss/postcss`（不需要 autoprefixer） |

### Vite 配置变更

| v3 | v4 |
|----|----|
| PostCSS 插件 `tailwindcss()` | Vite 插件 `@tailwindcss/vite` |

---

## 六、破坏性变更详解

### 1. 不再需要 tailwind.config.js

v4 完全移除了对 `tailwind.config.js` 的依赖。所有配置都在 CSS 中完成。

**影响**：如果你的项目有复杂的 JavaScript 配置逻辑，需要转换为 CSS 语法。

### 2. 不再需要 PostCSS（使用 Vite 时）

使用 Vite 时，Tailwind v4 直接作为 Vite 插件运行，不再通过 PostCSS。

**影响**：移除 `postcss.config.js` 中的 Tailwind 配置，改用 Vite 插件。

### 3. 不再需要 autoprefixer

v4 内置了浏览器前缀支持，无需单独安装 `autoprefixer`。

**影响**：从 `package.json` 和 PostCSS 配置中移除 `autoprefixer`。

### 4. 自动内容检测

v4 使用 Oxide 引擎自动检测模板文件，不再需要手动配置 `content` 选项。

**影响**：通常无需任何操作。如果需要包含非标准路径，使用 `@source` 指令。

### 5. 颜色默认使用 OKLCH

v4 的默认调色板使用 OKLCH 颜色空间，而不是 v3 的 RGB/HSL。

**影响**：颜色值可能有细微差异。如果需要完全匹配 v3 颜色，可以手动覆盖 CSS 变量。

### 6. 渐变语法变更

`bg-gradient-to-*` 改为 `bg-linear-to-*`。

**影响**：需要全局替换类名。升级工具会自动处理。

### 7. 透明度语法变更

`text-opacity-*`、`bg-opacity-*` 等被移除，改用 `text-blue-500/50` 语法。

**影响**：需要全局替换。升级工具会自动处理。

### 8. JavaScript 插件 API 变更

v3 的 `addUtilities`、`addComponents`、`addVariant` 等 JavaScript 插件 API 不再可用。

**影响**：需要使用 CSS 原生功能（`@layer`、`@custom-variant`、`@theme`）替代。

### 9. `@apply` 行为变更

`@apply` 在 v4 中仍然可用，但有一些细微的行为变化：
- 不再支持 `@apply` 引用 `@layer` 中定义的自定义类
- 建议尽量减少 `@apply` 的使用，优先使用组件类

### 10. `!important` 修饰符变更

v3 中使用 `!` 前缀添加 `!important`：`!text-red-500`

v4 中在 `@import` 中全局设置：`@import "tailwindcss" important;`

---

## 七、常见问题

### Q1：升级后样式丢失了怎么办？

**A**：检查以下几点：
1. 确认 `@import "tailwindcss"` 是否正确添加
2. 确认构建工具配置是否正确更新
3. 检查浏览器控制台是否有 CSS 解析错误
4. 确认 `@source` 指令是否包含了所有模板文件路径

### Q2：升级工具报错怎么办？

**A**：
1. 确保在项目根目录运行命令
2. 先提交所有未提交的更改
3. 尝试手动迁移（参照上面的步骤）

### Q3：暗黑模式不工作怎么办？

**A**：v4 默认使用 `media` 策略。如果你使用 `class` 策略，需要添加：

```css
@custom-variant dark (&:where(.dark, .dark *));
```

### Q4：自定义插件不兼容怎么办？

**A**：v4 不再支持 JavaScript 插件。你需要：
1. 将 `addUtilities` 转换为 `@layer utilities { }` 中的 CSS
2. 将 `addComponents` 转换为 `@layer components { }` 中的 CSS
3. 将 `addVariant` 转换为 `@custom-variant`

### Q5：颜色看起来不一样了？

**A**：v4 默认使用 OKLCH 颜色空间。如果需要完全匹配 v3 颜色：

```css
:root {
  --color-blue-500: #3b82f6; /* 使用 HEX 值覆盖 */
}
```

### Q6：如何回退到 v3？

**A**：

```bash
npm install tailwindcss@3
```

然后恢复 `tailwind.config.js` 和 PostCSS 配置。

### Q7：v4 支持哪些浏览器？

**A**：v4 支持所有现代浏览器：
- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

不再支持 IE 11。

### Q8：性能真的提升了多少？

**A**：根据官方基准测试：
- 首次构建速度提升约 5-10 倍
- 增量构建速度提升约 10 倍
- 内存使用减少约 60%
- CSS 输出体积通常更小（得益于更好的 tree-shaking）

---

## 参考资源

- [Tailwind CSS v4 官方升级指南](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind CSS v4 官方文档](https://tailwindcss.com/docs)
- [Tailwind CSS v4 发布公告](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS GitHub Discussions](https://github.com/tailwindlabs/tailwindcss/discussions)
