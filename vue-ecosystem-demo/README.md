# Vue 3 生态系统完整教程示例

> 面向新手的 Vue 3 及其生态系统的全面教学示例，每个文件都包含详细的中文注释。

---

## 版本信息

| 包名 | 版本 | 说明 |
|------|------|------|
| **Vue** | 3.5.x | 渐进式 JavaScript 框架（当前稳定版） |
| **Vite** | 6.x | 下一代前端构建工具 |
| **Vue Router** | 4.x | Vue.js 官方路由管理器 |
| **Pinia** | 2.x | Vue.js 官方状态管理库 |
| **TypeScript** | 5.x | JavaScript 的超集，提供类型安全 |

> **注意：** Vue 3.6 目前处于 Beta 阶段，引入了 Vapor Mode（无虚拟 DOM 模式），本教程也会进行介绍。

---

## Vue 3 核心特性

### 1. Composition API（组合式 API）
- `ref` / `reactive`：响应式数据声明
- `computed`：计算属性
- `watch` / `watchEffect`：侦听器
- 生命周期钩子：`onMounted`、`onUpdated`、`onUnmounted` 等
- `<script setup>` 语法糖：更简洁的组件编写方式

### 2. 性能提升
- 基于 Proxy 的响应式系统（替代 Vue 2 的 `Object.defineProperty`）
- Tree-shaking 支持，打包体积更小
- 静态提升（Static Hoisting）
- Patch Flags（补丁标记），精确更新

### 3. 更好的 TypeScript 支持
- 原生 TypeScript 支持
- `defineProps<T>()` 和 `defineEmits<T>()` 泛型推导
- IDE 智能提示更完善

### 4. 新内置组件
- `<Teleport>`：将组件内容渲染到 DOM 的其他位置
- `<Suspense>`：处理异步组件加载状态
- `<Transition>` / `<TransitionGroup>`：过渡动画

### 5. Vue 3.5 新特性
- **Reactive Props Destructure**：响应式 Props 解构
- **`useId()`**：生成唯一 ID
- **`useTemplateRef()`**：模板引用的更安全方式
- **`useModel()`**：简化的双向绑定
- **`Deferred Teleport`**：延迟传送门

### 6. Vue 3.6 Beta - Vapor Mode
- 无虚拟 DOM 渲染模式
- 更接近原生 JavaScript 性能
- 编译时优化，减少运行时开销

---

## 示例目录

```
vue-ecosystem-demo/
├── README.md                          # 本文件 - 项目概览
└── src/
    └── examples/
        ├── 01-vue-basics.vue          # Vue 基础语法
        ├── 02-component-system.vue    # 组件系统
        ├── 03-vite-config.md          # Vite 构建工具配置
        ├── 04-vue-router.md           # Vue Router 路由管理
        ├── 05-pinia.md                # Pinia 状态管理
        ├── 06-composables.md          # 组合式函数（Composables）
        └── 07-advanced.md             # 高级特性与性能优化
```

### 各文件内容概览

| 文件 | 主要内容 |
|------|----------|
| `01-vue-basics.vue` | createApp、模板语法、computed、watch、生命周期、ref/reactive、script setup |
| `02-component-system.vue` | 组件注册、Props/Emits、插槽、Provide/Inject、动态组件、异步组件、Teleport |
| `03-vite-config.md` | 项目创建、配置详解、环境变量、HMR、构建优化、插件系统、Vite vs Webpack |
| `04-vue-router.md` | 路由配置、动态路由、嵌套路由、导航守卫、懒加载、滚动行为 |
| `05-pinia.md` | Store 定义、State/Getters/Actions、插件、StoreToRefs、跨 Store 调用 |
| `06-composables.md` | Composable 封装、常用 Hooks、与 React Hooks 对比、命名规范 |
| `07-advanced.md` | Vue 3.5 新特性、Vapor Mode、自定义指令、渲染函数、TypeScript、性能优化、SSR |

---

## 快速开始

### 创建新项目

```bash
# 使用 create-vue（官方推荐脚手架）
npm create vue@latest my-project

# 或使用 Vite 直接创建
npm create vite@latest my-project -- --template vue-ts
```

### 安装依赖

```bash
cd my-project
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

---

## 学习路线建议

1. **基础入门** → `01-vue-basics.vue`：掌握 Vue 的基本语法和响应式系统
2. **组件化开发** → `02-component-system.vue`：理解组件通信和复用机制
3. **工程化** → `03-vite-config.md`：学会配置构建工具
4. **路由** → `04-vue-router.md`：掌握单页应用的路由管理
5. **状态管理** → `05-pinia.md`：学会全局状态管理
6. **逻辑复用** → `06-composables.md`：掌握组合式函数的封装
7. **进阶** → `07-advanced.md`：了解高级特性和性能优化

---

## 推荐学习资源

- [Vue 3 官方文档（中文）](https://cn.vuejs.org/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [Vue Router 官方文档](https://router.vuejs.org/zh/)
- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [VueUse 工具库](https://vueuse.org/) - 实用的 Vue Composition API 工具集

---

## 许可证

MIT
