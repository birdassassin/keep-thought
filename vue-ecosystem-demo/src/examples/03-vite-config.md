# 03 - Vite 6 构建工具配置教程

> Vite 是 Vue 3 官方推荐的构建工具，由 Vue 作者尤雨溪开发。
> 它利用浏览器原生 ES Module 实现极速开发体验。

---

## 一、创建 Vite 项目

### 使用 create-vue（官方推荐）

```bash
# 创建 Vue + TypeScript 项目
npm create vue@latest my-project

# 交互式选项：
# ✔ Add TypeScript? Yes
# ✔ Add JSX Support? No
# ✔ Add Vue Router for Single Page Application development? Yes
# ✔ Add Pinia for state management? Yes
# ✔ Add Vitest for Unit testing? Yes
# ✔ Add an End-to-End Testing Solution? No
# ✔ Add ESLint for code quality? Yes
# ✔ Add Prettier for code formatting? Yes
```

### 使用 Vite 直接创建

```bash
# Vue + JavaScript
npm create vite@latest my-project -- --template vue

# Vue + TypeScript
npm create vite@latest my-project -- --template vue-ts
```

### 手动创建

```bash
mkdir my-project && cd my-project
npm init -y

# 安装依赖
npm install vue
npm install -D vite @vitejs/plugin-vue typescript
```

---

## 二、项目结构

```
my-project/
├── public/                  # 静态资源（不经过构建处理）
│   └── favicon.ico
├── src/
│   ├── assets/              # 静态资源（会被构建处理，如图片、CSS）
│   ├── components/          # 公共组件
│   ├── composables/         # 组合式函数
│   ├── router/              # 路由配置
│   ├── stores/              # Pinia 状态管理
│   ├── views/               # 页面组件
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── index.html               # HTML 入口
├── vite.config.ts           # Vite 配置文件
├── tsconfig.json            # TypeScript 配置
├── tsconfig.app.json        # 应用 TS 配置
├── tsconfig.node.json       # Node TS 配置
├── env.d.ts                 # 环境变量类型声明
└── package.json
```

---

## 三、vite.config.ts 配置详解

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  // mode: 'development' | 'production'
  // 第三个参数 '' 表示加载所有前缀的环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    // ============================================
    // 1. 插件配置
    // ============================================
    plugins: [
      // Vue 单文件组件支持（必需）
      vue(),

      // 其他常用插件：
      // import VueDevTools from 'vite-plugin-vue-devtools'
      // VueDevTools(),  // Vue 开发者工具

      // import Components from 'unplugin-vue-components/vite'
      // Components(),   // 组件自动导入

      // import AutoImport from 'unplugin-auto-import/vite'
      // AutoImport(),   // API 自动导入
    ],

    // ============================================
    // 2. 路径别名配置
    // ============================================
    resolve: {
      // 配置路径别名，避免使用相对路径
      alias: {
        '@': resolve(__dirname, 'src'),           // @ 指向 src 目录
        '@components': resolve(__dirname, 'src/components'),
        '@views': resolve(__dirname, 'src/views'),
        '@stores': resolve(__dirname, 'src/stores'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@assets': resolve(__dirname, 'src/assets'),
      },
      // 配置文件扩展名，导入时可以省略
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },

    // ============================================
    // 3. 开发服务器配置
    // ============================================
    server: {
      // 开发服务器端口
      port: 3000,

      // 启动时自动打开浏览器
      open: true,

      // 服务器主机名
      host: '0.0.0.0',  // 允许局域网访问

      // 代理配置（解决开发环境跨域问题）
      proxy: {
        // 代理规则：将 /api 开头的请求转发到后端服务器
        '/api': {
          target: 'http://localhost:8080',  // 后端服务器地址
          changeOrigin: true,                // 是否改变请求头中的 Origin
          rewrite: (path) => path.replace(/^\/api/, ''),  // 重写路径
          // secure: false,  // 如果后端是 HTTPS 但证书无效，设为 false
        },
        // 可以配置多个代理
        '/socket.io': {
          target: 'http://localhost:8080',
          ws: true,  // 代理 WebSocket
        },
      },

      // CORS 配置
      cors: true,

      // HTTPS 配置
      // https: true,  // 使用自签名证书
      // 或者指定证书
      // https: {
      //   key: fs.readFileSync('key.pem'),
      //   cert: fs.readFileSync('cert.pem'),
      // },
    },

    // ============================================
    // 4. 构建配置
    // ============================================
    build: {
      // 构建输出目录
      outDir: 'dist',

      // 构建前清空输出目录
      emptyOutDir: true,

      // 小于此阈值的资源内联为 base64（默认 4096 = 4KB）
      assetsInlineLimit: 4096,

      // 构建后静态资源的子目录
      assetsDir: 'assets',

      // 启用/禁用 CSS 代码拆分
      cssCodeSplit: true,

      // 构建目标（浏览器兼容性）
      // 'modules' | 'esnext' | 具体版本号
      target: 'modules',

      // 当构建目标为 esnext 时，minify 默认使用 esbuild
      // 可选值：'esbuild' | 'terser' | false
      minify: 'esbuild',

      // 生成 sourcemap
      // 'inline' | 'hidden' | true | false
      sourcemap: false,

      // 设置最终构建的浏览器兼容性
      // 类似于 Browserslist
      cssTarget: 'chrome61',

      // chunk 大小警告的阈值（KB）
      chunkSizeWarningLimit: 500,

      // Rollup 打包配置
      rollupOptions: {
        // 入口文件
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        // 输出配置
        output: {
          // 静态资源文件名
          // [name] - 文件名
          // [hash] - 内容哈希
          // [ext] - 扩展名
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',

          // 手动分包（代码拆分策略）
          manualChunks(id) {
            // 将 vue 相关的库打包到同一个 chunk
            if (id.includes('node_modules/vue') ||
                id.includes('node_modules/@vue') ||
                id.includes('node_modules/pinia') ||
                id.includes('node_modules/vue-router')) {
              return 'vendor-vue'
            }
            // 将其他第三方库打包到另一个 chunk
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },

      // 库模式（开发组件库时使用）
      // lib: {
      //   entry: resolve(__dirname, 'src/index.ts'),
      //   name: 'MyLib',
      //   fileName: (format) => `my-lib.${format}.js`,
      // },
      // rollupOptions: {
      //   external: ['vue'],
      //   output: {
      //     globals: { vue: 'Vue' },
      //   },
      // },
    },

    // ============================================
    // 5. CSS 配置
    // ============================================
    css: {
      // 开发时是否启用 CSS Modules
      modules: {
        // CSS Modules 的类名生成规则
        localsConvention: 'camelCase',  // camelCase | camelCaseOnly | dashes | dashesOnly
      },
      // 预处理器配置
      preprocessorOptions: {
        scss: {
          // 全局 SCSS 变量（所有 SCSS 文件都可以使用）
          additionalData: `@import "@/assets/styles/variables.scss";`,
        },
        less: {
          // 全局 LESS 变量
          additionalData: `@import "@/assets/styles/variables.less";`,
        },
      },
      // 是否启用 PostCSS
      postcss: {},
    },

    // ============================================
    // 6. 依赖优化配置
    // ============================================
    optimizeDeps: {
      // 强制预构建的依赖
      include: ['vue', 'vue-router', 'pinia', 'axios'],

      // 不需要预构建的依赖
      exclude: [],

      // 预构建时使用的 ESBuild 选项
      esbuildOptions: {
        target: 'es2020',
      },
    },

    // ============================================
    // 7. 预览服务器配置（构建后预览）
    // ============================================
    preview: {
      port: 4173,
      open: true,
      host: '0.0.0.0',
    },

    // ============================================
    // 8. 静态资源处理
    // ============================================
    // publicDir: 'public',  // 静态资源目录
    // base: '/',            // 应用的基础路径（部署到子路径时修改）

    // ============================================
    // 9. JSON 配置
    // ============================================
    json: {
      // 是否支持从 JSON 文件中按名称导入
      namedExports: true,
      // 是否将 JSON 转为 ES Module
      isMergeable: false,
    },

    // ============================================
    // 10. ESBuild 配置
    // ============================================
    esbuild: {
      // 开发时移除 console 和 debugger
      drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
      // JSX 转换
      jsxFactory: 'h',
      jsxFragment: 'Fragment',
    },
  }
})
```

---

## 四、环境变量

### 环境变量文件

```
.env                  # 所有模式都会加载
.env.development      # 仅在 development 模式加载
.env.production       # 仅在 production 模式加载
.env.staging          # 仅在 staging 模式加载（自定义模式）
```

### 环境变量命名规则

```bash
# .env.development
# 只有 VITE_ 前缀的变量才会暴露给客户端代码
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=Vue App (Dev)

# 非前缀变量只在 vite.config.ts 中可用
DATABASE_URL=postgresql://localhost:5432/mydb
SECRET_KEY=abc123
```

### 在代码中使用环境变量

```typescript
// 在 vite.config.ts 中
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log(env.DATABASE_URL)  // 可以访问所有变量

  return {
    define: {
      // 注入全局常量
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  }
})

// 在组件中使用（只有 VITE_ 前缀的变量可用）
const apiUrl = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE

// 内置变量
console.log(import.meta.env.MODE)           // 当前模式
console.log(import.meta.env.BASE_URL)       // 基础路径
console.log(import.meta.env.PROD)           // 是否生产环境
console.log(import.meta.env.DEV)            // 是否开发环境
console.log(import.meta.env.SSR)            // 是否 SSR
```

### TypeScript 类型声明

```typescript
// src/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  // 自定义其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 五、HMR 热模块替换

### 什么是 HMR

HMR（Hot Module Replacement）允许在开发时修改代码后，
浏览器自动更新模块，而不需要刷新整个页面。

Vite 的 HMR 是开箱即用的，无需额外配置。

### HMR API

```typescript
// 在组件中接受 HMR 更新
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 模块更新时的回调
    console.log('模块已更新', newModule)
  })
}

// 主动触发 HMR
// import.meta.hot.invalidate()
```

### HMR 注意事项

- 状态不会自动保留（除非使用 `import.meta.hot.accept`）
- CSS 的 HMR 是自动的，修改样式不会丢失状态
- Vue 组件的 HMR 由 `@vitejs/plugin-vue` 自动处理

---

## 六、构建优化

### 代码拆分策略

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 策略 1：按第三方库分包
          if (id.includes('node_modules')) {
            return 'vendor'
          }

          // 策略 2：按功能分包
          if (id.includes('src/views/')) {
            return 'views'
          }
          if (id.includes('src/components/')) {
            return 'components'
          }

          // 策略 3：将大型库单独分包
          if (id.includes('node_modules/lodash')) {
            return 'vendor-lodash'
          }
          if (id.includes('node_modules/echarts')) {
            return 'vendor-echarts'
          }
        },
      },
    },
  },
})
```

### 压缩配置

```typescript
// 使用 terser 替代 esbuild 进行压缩（更小的体积，但更慢）
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,    // 移除 console
        drop_debugger: true,   // 移除 debugger
        pure_funcs: ['console.log'],  // 移除特定的函数调用
      },
    },
  },
})
```

### 构建分析

```bash
# 安装 rollup-plugin-visualizer
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,              // 构建后自动打开报告
      gzipSize: true,          // 显示 gzip 大小
      brotliSize: true,        // 显示 brotli 大小
      filename: 'stats.html',  // 报告文件名
    }),
  ],
})
```

---

## 七、插件系统

### 官方插件

| 插件 | 说明 |
|------|------|
| `@vitejs/plugin-vue` | Vue 3 单文件组件支持 |
| `@vitejs/plugin-vue-jsx` | Vue 3 JSX 支持 |
| `@vitejs/plugin-vue-docs` | Vue 文档支持 |
| `@vitejs/plugin-legacy` | 传统浏览器兼容 |

### 社区常用插件

```typescript
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),

    // Vue 开发者工具
    VueDevTools(),

    // 组件自动导入（不需要手动 import 组件）
    Components({
      resolvers: [
        // UI 库组件自动导入
        ElementPlusResolver(),
      ],
      // 指定组件搜索路径
      dirs: ['src/components'],
      // 生成类型声明文件
      dts: 'src/components.d.ts',
    }),

    // API 自动导入（不需要手动 import Vue API）
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        VueRouterAutoImports,
      ],
      // 生成类型声明文件
      dts: 'src/auto-imports.d.ts',
    }),
  ],
})
```

### 自定义插件

```typescript
// vite.config.ts
import type { Plugin } from 'vite'

// 自定义插件示例：在控制台打印构建时间
function buildTimePlugin(): Plugin {
  return {
    name: 'build-time',
    buildStart() {
      console.log(`[build] 开始构建: ${new Date().toLocaleTimeString()}`)
    },
    buildEnd() {
      console.log(`[build] 构建完成: ${new Date().toLocaleTimeString()}`)
    },
    closeBundle() {
      console.log(`[build] 文件写入完成: ${new Date().toLocaleTimeString()}`)
    },
  }
}

export default defineConfig({
  plugins: [buildTimePlugin()],
})
```

---

## 八、Vite vs Webpack 对比

| 特性 | Vite | Webpack |
|------|------|---------|
| **开发启动速度** | 极快（毫秒级） | 较慢（秒级到分钟级） |
| **热更新速度** | 极快（只更新修改的模块） | 较慢（重新编译受影响的模块链） |
| **构建工具** | 开发用 esbuild，生产用 Rollup | 自身打包 |
| **配置复杂度** | 简单，开箱即用 | 较复杂，需要配置 loader 和 plugin |
| **生态成熟度** | 快速增长中 | 非常成熟 |
| **代码拆分** | Rollup 原生支持 | 需要配置 SplitChunksPlugin |
| **生产构建** | Rollup（优秀） | 自身打包（优秀） |
| **兼容性** | 现代浏览器 | 支持旧浏览器（通过 Babel） |
| **TypeScript** | 原生支持（esbuild 转换） | 需要 ts-loader 或 babel-loader |
| **CSS 处理** | 原生支持 CSS Modules、预处理器 | 需要 css-loader、style-loader 等 |
| **大型项目** | 适合（开发体验好） | 适合（生态成熟） |
| **学习曲线** | 低 | 中高 |

### 为什么 Vite 这么快？

1. **开发模式使用原生 ES Module**：浏览器直接加载源文件，不需要打包
2. **esbuild 预构建**：esbuild 用 Go 编写，比 JS 编写的打包器快 10-100 倍
3. **按需编译**：只编译当前页面需要的模块
4. **智能 HMR**：无论应用大小，HMR 速度始终很快

### 何时选择 Webpack？

- 需要支持非常旧的浏览器（IE 11）
- 项目已经深度使用 Webpack 生态
- 需要一些 Webpack 独有的高级功能
- 企业级项目，稳定性要求极高

---

## 九、常用命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run dev --host   # 允许局域网访问

# 构建
npm run build        # 生产构建
npm run build --mode staging  # 使用 staging 模式构建

# 预览构建结果
npm run preview      # 预览生产构建

# 代码检查
npm run lint         # ESLint 检查
npm run format       # Prettier 格式化

# 类型检查
npm run type-check   # TypeScript 类型检查
```

---

## 十、常见问题

### 1. 路径别名在 TypeScript 中报错

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    }
  }
}
```

### 2. 构建后图片路径错误

```typescript
// vite.config.ts
export default defineConfig({
  base: '/your-sub-path/',  // 部署到子路径时设置
})
```

### 3. 开发环境代理不生效

```typescript
// 确保请求路径以代理前缀开头
// 如果代理配置为 '/api'，则请求必须是 '/api/xxx'
// 而不是 'http://localhost:8080/api/xxx'
```

### 4. 构建后白屏

```typescript
// 检查以下几点：
// 1. base 配置是否正确
// 2. 服务器是否正确配置了 SPA 回退
// 3. 资源路径是否正确
```
