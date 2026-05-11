# 04 - Vue Router 4 路由管理教程

> Vue Router 是 Vue.js 的官方路由管理器，用于构建单页应用（SPA）。
> 本教程基于 Vue Router 4.x 版本。

---

## 一、安装

```bash
npm install vue-router@4
```

---

## 二、基本配置

### 创建路由实例

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 定义路由规则
// 每个路由规则映射一个组件
const routes: RouteRecordRaw[] = [
  {
    path: '/',           // URL 路径
    name: 'Home',        // 路由名称（用于编程式导航）
    component: () => import('@/views/Home.vue'),  // 路由懒加载
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
  },
]

// 创建路由实例
const router = createRouter({
  // 路由模式（见下文详细说明）
  history: createWebHistory(),
  routes,  // 路由规则
  // 滚动行为（见下文详细说明）
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
})

// 导出路由实例
export default router
```

### 在应用中注册路由

```typescript
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册路由插件
app.use(router)

app.mount('#app')
```

### 在模板中使用路由

```vue
<!-- App.vue -->
<template>
  <!-- 路由出口 - 当前路由匹配的组件将渲染在这里 -->
  <router-view />

  <!-- 或者在有布局的情况下 -->
  <div id="layout">
    <header>
      <!-- 路由链接 - 渲染为 <a> 标签 -->
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/about">关于</router-link>
        <router-link :to="{ name: 'About' }">关于（命名路由）</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>
```

---

## 三、路由模式

### createWebHistory（HTML5 History 模式）

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),  // 默认使用 '/' 作为 base
  // 或指定 base URL（部署到子路径时使用）
  // history: createWebHistory('/my-app/'),
  routes,
})
```

**特点：**
- URL 看起来很干净：`/user/profile`
- 需要服务器配置支持（所有路径都返回 index.html）
- 利用 `history.pushState()` API

**服务器配置示例（Nginx）：**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### createWebHashHistory（Hash 模式）

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})
```

**特点：**
- URL 中包含 `#`：`/#/user/profile`
- 不需要服务器配置
- 兼容性更好（支持 IE10）
- 不利于 SEO（搜索引擎通常忽略 # 后面的内容）

### createWebMemory（内存模式）

```typescript
import { createRouter, createWebMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createWebMemoryHistory(),
  routes,
})
```

**特点：**
- URL 不会变化
- 适用于非浏览器环境（SSR、测试等）

### 模式选择建议

| 场景 | 推荐模式 |
|------|----------|
| 生产环境 SPA | `createWebHistory` |
| 需要 SEO | `createWebHistory` |
| 简单项目 / 不想配置服务器 | `createWebHashHistory` |
| SSR / 测试 | `createWebMemoryHistory` |

---

## 四、动态路由

### 路径参数

```typescript
const routes: RouteRecordRaw[] = [
  {
    // :id 是动态参数，匹配 /user/123、/user/abc 等
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    // 将路由参数作为 props 传递给组件
    props: true,
  },
  {
    // 多个动态参数
    path: '/post/:postId/comment/:commentId',
    name: 'Comment',
    component: () => import('@/views/Comment.vue'),
    props: true,
  },
  {
    // 可选参数（使用 ?）
    path: '/category/:name?',
    name: 'Category',
    component: () => import('@/views/Category.vue'),
  },
  {
    // 正则参数（只匹配数字）
    path: '/user/:id(\\d+)',
    name: 'UserById',
    component: () => import('@/views/UserById.vue'),
  },
  {
    // 正则参数（只匹配特定字符）
    path: '/:lang(en|zh)/about',
    name: 'LocalizedAbout',
    component: () => import('@/views/About.vue'),
  },
]
```

### 在组件中获取路由参数

```vue
<!-- 方式 1：使用 useRoute（推荐） -->
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// 获取路径参数
console.log(route.params.id)       // 路径参数 /user/:id
console.log(route.params.postId)   // 路径参数 /post/:postId/comment/:commentId

// 获取查询参数
console.log(route.query.page)      // 查询参数 ?page=1
console.log(route.query.search)    // 查询参数 ?search=vue
</script>

<!-- 方式 2：使用 props（推荐，组件解耦） -->
<script setup lang="ts">
// 当路由配置了 props: true 时
const props = defineProps<{ id: string }>()
console.log(props.id)
</script>
```

### 动态添加路由

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 动态添加路由（常用于权限控制）
router.addRoute({
  path: '/admin',
  name: 'Admin',
  component: () => import('@/views/Admin.vue'),
})

// 添加嵌套路由
router.addRoute('ParentRoute', {
  path: 'child',
  name: 'ChildRoute',
  component: () => import('@/views/Child.vue'),
})

// 检查路由是否存在
router.hasRoute('Admin')  // true / false

// 删除路由
router.removeRoute('Admin')
```

---

## 五、嵌套路由

### 基本嵌套

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/user',
    component: () => import('@/views/user/Layout.vue'),  // 父组件（包含 <router-view>）
    children: [
      {
        // 完整路径为 /user/profile
        path: '',  // 空路径表示默认子路由
        name: 'UserHome',
        component: () => import('@/views/user/Home.vue'),
      },
      {
        path: 'profile',  // 不需要加 /，会自动拼接
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('@/views/user/Settings.vue'),
      },
    ],
  },
]
```

### 嵌套路由的组件结构

```vue
<!-- src/views/user/Layout.vue（父组件） -->
<template>
  <div class="user-layout">
    <h2>用户中心</h2>

    <!-- 子路由导航 -->
    <nav class="user-nav">
      <router-link to="/user">首页</router-link>
      <router-link to="/user/profile">个人资料</router-link>
      <router-link to="/user/settings">设置</router-link>
    </nav>

    <!-- 子路由出口 - 子路由组件渲染在这里 -->
    <router-view />
  </div>
</template>
```

### 命名视图（多个 router-view）

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    components: {
      // 命名为 default 的 router-view
      default: () => import('@/views/DashboardMain.vue'),
      // 命名为 sidebar 的 router-view
      sidebar: () => import('@/views/DashboardSidebar.vue'),
      // 命名为 header 的 router-view
      header: () => import('@/views/DashboardHeader.vue'),
    },
  },
]
```

```vue
<!-- App.vue -->
<template>
  <!-- 命名 router-view -->
  <router-view name="header" />
  <div class="content">
    <router-view name="sidebar" />
    <router-view />  <!-- 默认 router-view（name="default"） -->
  </div>
</template>
```

### 嵌套命名视图

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/settings',
    component: () => import('@/views/SettingsLayout.vue'),
    children: [
      {
        path: '',
        components: {
          default: () => import('@/views/SettingsOverview.vue'),
          nav: () => import('@/views/SettingsNav.vue'),
        },
      },
      {
        path: 'profile',
        components: {
          default: () => import('@/views/SettingsProfile.vue'),
          nav: () => import('@/views/SettingsNav.vue'),
        },
      },
    ],
  },
]
```

---

## 六、编程式导航

### router.push（跳转到新路由，添加历史记录）

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// 字符串路径
router.push('/user/123')

// 对象形式
router.push({ path: '/user/123' })

// 命名路由 + 参数
router.push({ name: 'UserProfile', params: { id: '123' } })

// 带查询参数
router.push({ path: '/user', query: { page: '1', sort: 'name' } })
// 结果：/user?page=1&sort=name

// 命名路由 + 查询参数
router.push({ name: 'UserList', query: { page: '2' } })

// 替换当前路由（不添加历史记录）
router.push({ path: '/user', replace: true })
// 等同于 router.replace('/user')
```

### router.replace（替换当前路由，不添加历史记录）

```typescript
// 与 push 类似，但不会在浏览器历史中留下记录
router.replace('/login')
router.replace({ name: 'Home' })
```

### router.go（在历史记录中前进/后退）

```typescript
// 前进 1 页（等同于浏览器的前进按钮）
router.go(1)

// 后退 1 页（等同于浏览器的后退按钮）
router.go(-1)

// 前进 3 页
router.go(3)

// 如果没有足够的记录，会静默失败
router.go(-100)  // 什么也不做
```

### 导航方法返回 Promise

```typescript
// push 和 replace 都返回 Promise
const result = await router.push('/user/123')
  .then(() => {
    console.log('导航成功')
  })
  .catch((err) => {
    console.log('导航失败', err)
    // 常见错误：NavigationDuplicated（重复导航）
    // 可以忽略这个错误
  })

// 检测导航是否被中止
const navigationResult = await router.push('/user/123')
if (navigationResult) {
  // 导航被中止（如被导航守卫拦截）
  console.log('导航被中止')
}
```

---

## 七、路由守卫

### 全局前置守卫（beforeEach）

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({ /* ... */ })

// 全局前置守卫 - 在每次导航前执行
// 返回 false 取消导航
// 返回路由地址重定向到其他位置
// 不返回或返回 true / undefined 放行导航
router.beforeEach((to, from) => {
  // to: 即将进入的目标路由
  // from: 当前正要离开的路由

  console.log(`从 ${from.path} 导航到 ${to.path}`)

  // 示例：需要登录的页面进行权限检查
  if (to.meta.requiresAuth && !isLoggedIn()) {
    // 重定向到登录页，并携带原目标路径
    return {
      name: 'Login',
      query: { redirect: to.fullPath },
    }
  }

  // 示例：已登录用户不能访问登录页
  if (to.name === 'Login' && isLoggedIn()) {
    return { name: 'Home' }
  }

  // 放行导航
  return true
})
```

### 全局后置守卫（afterEach）

```typescript
// 全局后置守卫 - 在导航完成后执行
// 不能修改导航
router.afterEach((to, from, failure) => {
  // failure: 导航失败时的错误信息

  // 示例：修改页面标题
  document.title = (to.meta.title as string) || 'Vue App'

  // 示例：发送页面访问统计
  if (!failure) {
    analytics.trackPageView(to.fullPath)
  }
})
```

### 全局解析守卫（beforeResolve）

```typescript
// 在导航被确认前，且所有组件内守卫和异步路由组件被解析之后调用
router.beforeResolve(async (to) => {
  // 示例：确保数据预加载完成
  if (to.meta.requiresData) {
    try {
      await store.dispatch('fetchData', to.params.id)
    } catch (error) {
      return { name: 'Error', params: { code: '500' } }
    }
  }
})
```

### 路由独享守卫（beforeEnter）

```typescript
const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/views/Admin.vue'),
    // 路由独享守卫 - 只在进入该路由时执行
    beforeEnter: (to, from) => {
      // 检查管理员权限
      if (!isAdmin()) {
        return { name: 'Forbidden' }
      }
    },
  },
  {
    path: '/post/:id',
    component: () => import('@/views/Post.vue'),
    // 可以接收多个守卫函数
    beforeEnter: [removeQueryParams, removeTrailingSlash],
  },
]

// 守卫函数示例
function removeQueryParams(to: RouteLocationNormalized) {
  if (Object.keys(to.query).length) {
    return { path: to.path, query: {}, hash: to.hash }
  }
}

function removeTrailingSlash(to: RouteLocationNormalized) {
  if (to.path.endsWith('/') && to.path.length > 1) {
    return { path: to.path.slice(0, -1), query: to.query, hash: to.hash }
  }
}
```

### 组件内守卫

```vue
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 在当前路由改变，但该组件被复用时调用
// 例如：/user/1 → /user/2（同一个组件，不同参数）
onBeforeRouteUpdate((to, from) => {
  // 根据新的参数获取数据
  fetchData(to.params.id as string)
})

// 在导航离开该组件的对应路由时调用
// 常用于阻止用户在未保存时离开
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('你有未保存的更改，确定要离开吗？')
    if (!answer) return false  // 取消导航
  }
})
</script>
```

### 完整的导航解析流程

```
1. 导航被触发
2. 在失活的组件里调用 beforeRouteLeave 守卫
3. 调用全局的 beforeEach 守卫
4. 在重用的组件里调用 beforeRouteUpdate 守卫
5. 在路由配置里调用 beforeEnter
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter
8. 调用全局的 beforeResolve 守卫
9. 导航被确认
10. 调用全局的 afterEach 钩子
11. 触发 DOM 更新
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数
```

---

## 八、路由懒加载

### 基本用法

```typescript
// 使用动态 import() 实现路由懒加载
// 每个路由对应的组件会被打包到单独的 JS 文件中
// 只有在访问该路由时才会加载对应的代码
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),  // 懒加载
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),  // 懒加载
  },
]
```

### 分组打包

```typescript
// 将多个路由组件打包到同一个 chunk
const Home = () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue')

// Vite 中使用魔法注释
const Dashboard = () => import(
  /* viteChunkName: "dashboard" */ '@/views/Dashboard.vue'
)

// 或者使用 webpackChunkName（兼容两种构建工具）
const UserList = () => import(
  /* webpackChunkName: "user" */ '@/views/UserList.vue'
)
const UserProfile = () => import(
  /* webpackChunkName: "user" */ '@/views/UserProfile.vue'
)
```

### 预加载

```vue
<!-- 使用 router-link 的 prefetch 属性 -->
<router-link to="/about" prefetch>关于</router-link>

<!-- 或者在组件中手动预加载 -->
<script setup lang="ts">
const router = useRouter()

// 预加载某个路由的组件
router.resolve('/about').matched.forEach(record => {
  if (record.components) {
    Object.values(record.components).forEach(component => {
      component()  // 触发动态 import
    })
  }
})
</script>
```

---

## 九、路由元信息（Meta）

### 定义元信息

```typescript
interface RouteMeta {
  title?: string           // 页面标题
  requiresAuth?: boolean   // 是否需要登录
  roles?: string[]         // 允许的角色
  icon?: string            // 菜单图标
  keepAlive?: boolean      // 是否缓存
  transition?: string      // 过渡动画名称
}

const routes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '仪表盘',
      requiresAuth: true,
      roles: ['admin', 'user'],
      icon: 'dashboard',
      keepAlive: true,
      transition: 'fade',
    },
  },
]
```

### 使用元信息

```typescript
// 在导航守卫中使用
router.beforeEach((to) => {
  // 获取路由元信息
  const meta = to.meta

  // 设置页面标题
  document.title = meta.title || '默认标题'

  // 权限检查
  if (meta.requiresAuth && !isLoggedIn()) {
    return { name: 'Login' }
  }

  // 角色检查
  if (meta.roles && !meta.roles.includes(currentUser.role)) {
    return { name: 'Forbidden' }
  }
})

// 在组件中使用
import { useRoute } from 'vue-router'
const route = useRoute()
console.log(route.meta.title)  // '仪表盘'
```

---

## 十、滚动行为

### 基本滚动行为

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // savedPosition: 浏览器前进/后退时记录的位置

    // 始终滚动到顶部
    return { top: 0 }

    // 或者返回选择器
    return { el: '#main-content', top: 80 }

    // 浏览器前进/后退时恢复之前的滚动位置
    if (savedPosition) {
      return savedPosition
    }

    // 平滑滚动
    return { top: 0, behavior: 'smooth' }

    // 异步滚动（等待过渡完成）
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ top: 0 })
      }, 300)
    })
  },
})
```

### 滚动到锚点

```typescript
scrollBehavior(to, from, savedPosition) {
  if (to.hash) {
    // 滚动到锚点
    return {
      el: to.hash,
      behavior: 'smooth',
      top: 80,  // 顶部偏移（如固定导航栏高度）
    }
  }

  return { top: 0 }
}
```

---

## 十一、路由过渡动画

```vue
<template>
  <!-- 使用 Transition 包裹 router-view -->
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<style>
/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滑动 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
}
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
```

---

## 十二、TypeScript 类型增强

```typescript
// src/router/index.ts
import 'vue-router'

// 扩展 RouteMeta 类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: string[]
    icon?: string
    keepAlive?: boolean
  }
}
```

---

## 十三、完整项目路由配置示例

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由规则
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: { title: '关于' },
      },
    ],
  },
  {
    path: '/user',
    component: () => import('@/layouts/UserLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'UserHome',
        component: () => import('@/views/user/Home.vue'),
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('@/views/user/Settings.vue'),
      },
    ],
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

// 全局前置守卫
router.beforeEach((to, from) => {
  document.title = (to.meta.title as string) || 'Vue App'

  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})

export default router
```
