<!--
  ============================================================
  02 - Vue 3 组件系统完整教程
  ============================================================
  本文件涵盖了 Vue 3 组件系统的所有核心概念，包括：
  - 组件注册（全局注册 / 局部注册）
  - Props 定义（defineProps + 类型验证）
  - Emits 定义（defineEmits）
  - Slots 插槽（默认 / 具名 / 作用域）
  - Provide / Inject 跨层级通信
  - 动态组件（component :is）
  - 异步组件（defineAsyncComponent + Suspense）
  - Teleport 传送门

  适合有一定 Vue 基础的开发者学习组件化开发。
  ============================================================
-->
<template>
  <div class="component-system">
    <h1>Vue 3 组件系统教程</h1>

    <!-- ============================================
         一、组件注册
         ============================================

         【全局注册】在 main.ts 中使用 app.component() 注册：
         -----------------------------------------------
         import { createApp } from 'vue'
         import App from './App.vue'
         import MyButton from './components/MyButton.vue'

         const app = createApp(App)

         // 全局注册 - 所有组件模板中都可以直接使用
         app.component('MyButton', MyButton)
         app.component('MyCard', MyCard)

         app.mount('#app')

         优点：注册后全局可用，不需要在每个组件中 import
         缺点：即使没有使用也会被打包，增加包体积
         适用场景：频繁使用的基础组件（如按钮、图标等）

         【局部注册】在 <script setup> 中直接 import：
         -----------------------------------------------
         import MyButton from './components/MyButton.vue'
         // 导入后直接在模板中使用，无需额外注册

         优点：按需引入，支持 Tree-shaking，包体积更小
         缺点：每个使用的地方都需要 import
         适用场景：大多数业务组件

         推荐使用局部注册！
    -->
    <section>
      <h2>1. 组件注册</h2>
      <p>本文件中的 LifecycleChild 组件就是通过局部注册（import）使用的。</p>
      <p>全局注册示例请查看文件顶部注释中的 main.ts 代码。</p>
      <div class="tip">
        <strong>推荐：</strong>优先使用局部注册（import），支持 Tree-shaking，
        只有非常频繁使用的基础组件才考虑全局注册。
      </div>
    </section>

    <!-- ============================================
         二、Props 定义（defineProps）
         ============================================
         Props 是父组件向子组件传递数据的方式。
         在 <script setup> 中使用 defineProps 宏来声明。
    -->
    <section>
      <h2>2. Props 定义（defineProps）</h2>

      <!-- 基本用法 - 传递字符串 -->
      <ChildBasicProps title="Hello from Parent" />

      <!-- 传递动态值 -->
      <ChildBasicProps :title="dynamicTitle" :count="5" />

      <!-- 传递对象 -->
      <ChildBasicProps :user="{ name: '张三', age: 25 }" />

      <!-- 类型验证 - 传递不同类型的值 -->
      <ChildPropsValidation
        name="测试用户"
        :age="25"
        :is-active="true"
        :tags="['Vue', 'React']"
      />

      <!-- Props 默认值 -->
      <ChildPropsValidation name="只有名字" />
    </section>

    <!-- ============================================
         三、Emits 定义（defineEmits）
         ============================================
         Emits 是子组件向父组件发送事件的方式。
         在 <script setup> 中使用 defineEmits 宏来声明。
    -->
    <section>
      <h2>3. Emits 定义（defineEmits）</h2>

      <!-- 父组件监听子组件的事件 -->
      <ChildEmits
        @increment="onChildIncrement"
        @custom-event="onCustomEvent"
      />
      <p>子组件触发的计数：{{ childCounter }}</p>
      <p>自定义事件数据：{{ customEventData }}</p>
    </section>

    <!-- ============================================
         四、v-model 组件双向绑定
         ============================================
         Vue 3 中 v-model 在组件上的用法更加灵活。
         默认绑定的 prop 名为 modelValue，事件名为 update:modelValue。
         可以通过 v-model:title 这样的方式绑定多个 v-model。
    -->
    <section>
      <h2>4. v-model 组件双向绑定</h2>

      <!-- 单个 v-model -->
      <ChildVModel v-model="parentMessage" />
      <p>父组件中的值：{{ parentMessage }}</p>

      <!-- 多个 v-model（Vue 3 新增） -->
      <ChildMultiVModel
        v-model:title="bookTitle"
        v-model:author="bookAuthor"
      />
      <p>书名：{{ bookTitle }}，作者：{{ bookAuthor }}</p>
    </section>

    <!-- ============================================
         五、Slots 插槽
         ============================================
         插槽允许父组件向子组件传递模板内容。
         Vue 3 提供了三种插槽：
         1. 默认插槽
         2. 具名插槽
         3. 作用域插槽
    -->
    <section>
      <h2>5. Slots 插槽</h2>

      <!-- 默认插槽 -->
      <h3>5.1 默认插槽</h3>
      <ChildDefaultSlot>
        <p>这是通过默认插槽传递的内容</p>
        <p>可以传递任意模板内容</p>
      </ChildDefaultSlot>

      <!-- 具名插槽 -->
      <h3>5.2 具名插槽</h3>
      <ChildNamedSlot>
        <!-- 使用 v-slot:#name 或 #name 指定插槽名 -->
        <template #header>
          <h4>自定义标题</h4>
        </template>
        <template #default>
          <p>默认插槽内容</p>
        </template>
        <template #footer>
          <small>自定义页脚信息</small>
        </template>
      </ChildNamedSlot>

      <!-- 作用域插槽 -->
      <h3>5.3 作用域插槽</h3>
      <!-- 子组件通过 slot props 向父组件传递数据 -->
      <ChildScopedSlot>
        <!-- 接收子组件传递的 slot props -->
        <template #default="{ item, index }">
          <span style="color: blue;">
            [{{ index }}] {{ item.name }} - {{ item.price }}元
          </span>
        </template>
      </ChildScopedSlot>
    </section>

    <!-- ============================================
         六、Provide / Inject 跨层级通信
         ============================================
         Provide / Inject 用于跨层级组件通信，
         祖先组件 provide 数据，后代组件 inject 数据。
         不需要逐层传递 props，适合深层嵌套的组件树。

         注意：Provide / Inject 不是响应式的！
         如果需要响应式，需要 provide 一个 ref 或 reactive。
    -->
    <section>
      <h2>6. Provide / Inject 跨层级通信</h2>

      <!-- 祖先组件 provide 数据 -->
      <ProvideParent>
        <!-- 中间组件不需要传递任何 props -->
        <ProvideMiddle>
          <!-- 后代组件 inject 数据 -->
          <ProvideChild />
        </ProvideMiddle>
      </ProvideParent>
    </section>

    <!-- ============================================
         七、动态组件（component :is）
         ============================================
         使用 <component :is="..."> 来动态切换组件。
         配合 <keep-alive> 可以缓存组件状态。
    -->
    <section>
      <h2>7. 动态组件</h2>

      <!-- 切换按钮 -->
      <div class="tab-buttons">
        <button
          v-for="tab in tabs"
          :key="tab.name"
          :class="{ active: currentTab === tab.name }"
          @click="currentTab = tab.name"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 动态组件 - :is 绑定组件名或组件对象 -->
      <!-- keep-alive 缓存组件，切换时不会销毁 -->
      <keep-alive>
        <component :is="currentTab" />
      </keep-alive>

      <!-- keep-alive 的属性 -->
      <!-- include - 只有匹配的组件会被缓存 -->
      <!-- exclude - 匹配的组件不会被缓存 -->
      <!-- max - 最多缓存多少个组件实例 -->
      <!--
        <keep-alive :include="['TabA', 'TabB']" :max="5">
          <component :is="currentTab" />
        </keep-alive>
      -->
    </section>

    <!-- ============================================
         八、异步组件（defineAsyncComponent + Suspense）
         ============================================
         异步组件只有在需要时才会加载，可以减少初始包体积。
         defineAsyncComponent 用于定义异步组件。
         Suspense 用于处理异步组件的加载状态。
    -->
    <section>
      <h2>8. 异步组件</h2>

      <!-- Suspense 提供两个插槽 -->
      <!-- #default - 异步组件加载完成后显示 -->
      <!-- #fallback - 异步组件加载期间显示 -->
      <Suspense>
        <template #default>
          <!-- 异步组件 - 只有在需要时才会加载 -->
          <AsyncChild />
        </template>
        <template #fallback>
          <div class="loading">加载中...</div>
        </template>
      </Suspense>

      <!-- defineAsyncComponent 的高级用法 -->
      <!--
        const AsyncComp = defineAsyncComponent({
          loader: () => import('./AsyncComp.vue'),  // 加载函数
          loadingComponent: LoadingComp,             // 加载中显示的组件
          errorComponent: ErrorComp,                 // 加载失败显示的组件
          delay: 200,                                // 延迟显示 loading（毫秒）
          timeout: 3000,                             // 超时时间（毫秒）
          onError(error, retry, fail, attempts) {    // 错误回调
            if (attempts <= 3) retry()               // 最多重试 3 次
            else fail()
          },
        })
      -->
    </section>

    <!-- ============================================
         九、Teleport 传送门
         ============================================
         Teleport 将组件的内容渲染到 DOM 的其他位置，
         而不受当前组件 DOM 层级的限制。
         常用于模态框、通知、全屏遮罩等场景。
    -->
    <section>
      <h2>9. Teleport 传送门</h2>

      <button @click="showModal = true">打开模态框（Teleport）</button>
      <p class="tip">
        模态框的内容会被渲染到 body 下，而不是当前组件内部。
        这解决了模态框的 z-index 和样式隔离问题。
      </p>

      <!-- Teleport 将内容传送到指定目标 -->
      <!-- to - 目标选择器（CSS 选择器） -->
      <!-- disabled - 是否禁用传送 -->
      <Teleport to="body">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal-content">
            <h3>模态框</h3>
            <p>这个模态框通过 Teleport 渲染到了 body 下。</p>
            <p>它的 DOM 位置不受父组件限制。</p>
            <button @click="showModal = false">关闭</button>
          </div>
        </div>
      </Teleport>

      <!-- Vue 3.5 新增：Deferred Teleport -->
      <!-- 当目标元素在初始渲染时不存在，可以使用 deferred Teleport -->
      <!-- 它会在目标元素可用时自动传送 -->
      <!--
        <Teleport defer to="#deferred-target">
          <p>延迟传送的内容</p>
        </Teleport>
      -->
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * ============================================
 * 导入 Vue 3 核心 API
 * ============================================
 */
import { ref, provide, markRaw, type Component } from 'vue'
import { defineAsyncComponent } from 'vue'

// ============================================
// 导入子组件（局部注册）
// ============================================

// 同步导入子组件
import LifecycleChild from './LifecycleChild.vue'

// Props 演示组件
import ChildBasicProps from './ChildBasicProps.vue'
import ChildPropsValidation from './ChildPropsValidation.vue'

// Emits 演示组件
import ChildEmits from './ChildEmits.vue'

// v-model 演示组件
import ChildVModel from './ChildVModel.vue'
import ChildMultiVModel from './ChildMultiVModel.vue'

// Slots 演示组件
import ChildDefaultSlot from './ChildDefaultSlot.vue'
import ChildNamedSlot from './ChildNamedSlot.vue'
import ChildScopedSlot from './ChildScopedSlot.vue'

// Provide/Inject 演示组件
import ProvideParent from './ProvideParent.vue'
import ProvideMiddle from './ProvideMiddle.vue'
import ProvideChild from './ProvideChild.vue'

// ============================================
// 异步组件（defineAsyncComponent）
// ============================================
// 异步组件只有在需要时才会加载对应的代码块
// 适合用于大型组件或条件渲染的组件
const AsyncChild = defineAsyncComponent(
  () => import('./AsyncChild.vue')
)

// ============================================
// 二、Props 相关数据
// ============================================
const dynamicTitle = ref('动态标题')

// ============================================
// 三、Emits 相关数据和方法
// ============================================
const childCounter = ref(0)
const customEventData = ref('')

function onChildIncrement(count: number) {
  childCounter.value = count
}

function onCustomEvent(data: string) {
  customEventData.value = data
}

// ============================================
// 四、v-model 相关数据
// ============================================
const parentMessage = ref('Hello from Parent')
const bookTitle = ref('Vue 3 实战')
const bookAuthor = ref('张三')

// ============================================
// 七、动态组件相关
// ============================================

// 定义标签页组件映射
// 使用 markRaw 避免组件被 Vue 的响应式系统代理
// （组件对象不需要也不应该被代理）
const tabs = [
  { name: 'TabA', label: '标签 A', component: markRaw(defineAsyncComponent(() => import('./TabA.vue'))) },
  { name: 'TabB', label: '标签 B', component: markRaw(defineAsyncComponent(() => import('./TabB.vue'))) },
  { name: 'TabC', label: '标签 C', component: markRaw(defineAsyncComponent(() => import('./TabC.vue'))) },
]

const currentTab = ref<Component>('TabA')

// ============================================
// 九、Teleport 相关
// ============================================
const showModal = ref(false)

// ============================================
// Provide / Inject 示例（在祖先组件中 provide）
// ============================================
// provide 的第一个参数是注入名（字符串或 Symbol）
// 第二个参数是要提供的值
// 使用 ref 确保数据是响应式的
const themeColor = ref('#42b883')
provide('themeColor', themeColor)

const userInfo = ref({ name: '祖先组件用户', role: 'admin' })
provide('userInfo', userInfo)
</script>

<style scoped>
.component-system {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

h1 {
  color: #42b883;
  border-bottom: 2px solid #42b883;
  padding-bottom: 10px;
}

h2 {
  color: #35495e;
  margin-top: 30px;
}

h3 {
  color: #2c3e50;
}

section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #42b883;
}

button {
  padding: 6px 16px;
  margin: 4px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #35495e;
}

.tab-buttons {
  margin-bottom: 16px;
}

.tab-buttons button.active {
  background: #35495e;
}

.tip {
  color: #666;
  font-size: 14px;
  font-style: italic;
  padding: 8px;
  background: #fff3cd;
  border-radius: 4px;
  margin-top: 8px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* 模态框样式 - 即使组件在深层嵌套中，样式也能正常工作 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}
</style>

<!--
  ============================================================
  以下为内联的子组件定义（实际项目中应拆分为独立文件）
  ============================================================
  为了让本教程文件可以独立运行，这里使用内联方式定义子组件。
  在实际项目中，每个组件都应该是一个独立的 .vue 文件。
-->

<!--
  ============================================================
  子组件：ChildBasicProps - 基础 Props 演示
  ============================================================
-->
<script lang="ts">
/**
 * 全局注册示例（在实际项目中通常在 main.ts 中完成）
 * 这里仅作为演示，展示全局注册的语法
 */
// import { defineComponent } from 'vue'
// export const ChildBasicPropsGlobal = defineComponent({
//   name: 'ChildBasicPropsGlobal',
//   props: { title: String },
//   template: '<h3>{{ title }}</h3>'
// })
</script>
