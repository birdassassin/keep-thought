<!--
  ============================================================
  01 - Vue 3 基础语法完整教程
  ============================================================
  本文件涵盖了 Vue 3 的所有核心基础知识，包括：
  - 创建 Vue 应用（createApp）
  - 模板语法（插值、指令）
  - 计算属性（computed）
  - 侦听器（watch / watchEffect）
  - 生命周期钩子
  - 响应式 API（ref / reactive / toRef / toRefs）
  - <script setup> 语法糖

  适合零基础新手，每个知识点都有详细注释。
  ============================================================
-->
<template>
  <div class="vue-basics">
    <h1>Vue 3 基础语法教程</h1>

    <!-- ============================================
         一、创建 Vue 应用（createApp）
         ============================================
         在实际项目中，createApp 通常在 main.ts 中调用：
         import { createApp } from 'vue'
         import App from './App.vue'
         createApp(App).mount('#app')

         每个 Vue 应用都是通过 createApp 函数创建的，
         它接收一个根组件作为参数，并返回一个应用实例。
    -->

    <!-- ============================================
         二、模板语法 - 文本插值 {{ }}
         ============================================
         使用双大括号 {{ }} 进行文本插值，
         Vue 会自动将表达式的值渲染到页面上。
         表达式支持 JavaScript 语法，如运算、三元表达式等。
    -->
    <section>
      <h2>1. 文本插值 {{ }}</h2>
      <p>普通文本：{{ message }}</p>
      <!-- 插值中可以使用 JavaScript 表达式 -->
      <p>表达式运算：{{ 1 + 1 }}</p>
      <p>三元表达式：{{ isHappy ? '开心' : '难过' }}</p>
      <!-- 插值中可以调用方法 -->
      <p>方法调用：{{ message.split('').reverse().join('') }}</p>
      <!-- 注意：插值中只能使用表达式，不能使用语句（如 if、for） -->
    </section>

    <!-- ============================================
         三、指令 - v-bind（属性绑定）
         ============================================
         v-bind 用于动态绑定 HTML 属性，
         缩写为冒号 :，如 :class、:style、:src 等。
    -->
    <section>
      <h2>2. v-bind 属性绑定（缩写 :）</h2>

      <!-- 完整语法 -->
      <p v-bind:title="tooltipText">鼠标悬停查看提示（完整语法）</p>

      <!-- 缩写语法（推荐） -->
      <p :title="tooltipText">鼠标悬停查看提示（缩写语法）</p>

      <!-- 动态绑定 class - 对象语法 -->
      <!-- 当 isActive 为 true 时，添加 'active' 类名 -->
      <p :class="{ active: isActive, 'text-bold': isBold }">
        动态 class（对象语法）
      </p>

      <!-- 动态绑定 class - 数组语法 -->
      <p :class="[baseClass, isActive ? 'active' : '']">
        动态 class（数组语法）
      </p>

      <!-- 动态绑定 style - 对象语法 -->
      <p :style="{ color: textColor, fontSize: fontSize + 'px' }">
        动态 style（对象语法）
      </p>

      <!-- 动态绑定 style - 数组语法 -->
      <p :style="[styleObj1, styleObj2]">
        动态 style（数组语法）
      </p>

      <!-- 动态属性名（Vue 3 新增） -->
      <p :[dynamicAttr]="dynamicValue">动态属性名</p>
    </section>

    <!-- ============================================
         四、指令 - v-on（事件绑定）
         ============================================
         v-on 用于监听 DOM 事件，
         缩写为 @，如 @click、@input、@keyup.enter 等。
    -->
    <section>
      <h2>3. v-on 事件绑定（缩写 @）</h2>

      <!-- 完整语法 -->
      <button v-on:click="count++">点击 +1（完整语法）：{{ count }}</button>

      <!-- 缩写语法（推荐） -->
      <button @click="count++">点击 +1（缩写语法）：{{ count }}</button>

      <!-- 调用方法 -->
      <button @click="increment">点击调用方法：{{ count }}</button>

      <!-- 内联事件处理器 - 传递参数 -->
      <button @click="sayHello('Vue 3')">传递参数</button>

      <!-- 内联事件处理器 - 访问事件对象 $event -->
      <input @keyup.enter="onEnterKey" placeholder="按回车触发" />

      <!-- 事件修饰符 -->
      <!-- .stop - 阻止事件冒泡 -->
      <!-- .prevent - 阻止默认行为 -->
      <!-- .capture - 使用捕获模式 -->
      <!-- .self - 只在 event.target 是自身时触发 -->
      <!-- .once - 只触发一次 -->
      <!-- .passive - 提升滚动性能 -->
      <button @click.once="onceHandler">只触发一次的按钮</button>
      <a href="https://vuejs.org" @click.prevent>阻止默认跳转</a>
    </section>

    <!-- ============================================
         五、条件渲染 - v-if / v-else-if / v-else / v-show
         ============================================
         v-if：条件为 true 时渲染元素（真正的条件渲染，会销毁/重建 DOM）
         v-show：条件为 false 时添加 display:none（始终渲染 DOM，只切换 CSS）
         v-if 有更高的切换开销，v-show 有更高的初始渲染开销
         频繁切换用 v-show，条件很少改变用 v-if
    -->
    <section>
      <h2>4. 条件渲染</h2>

      <!-- v-if / v-else-if / v-else 必须连续使用 -->
      <div>
        <p v-if="score >= 90">优秀！</p>
        <p v-else-if="score >= 70">良好</p>
        <p v-else-if="score >= 60">及格</p>
        <p v-else>不及格</p>
      </div>

      <!-- v-show - 通过 CSS display 控制显示/隐藏 -->
      <div>
        <p v-show="isVisible">我是通过 v-show 控制的（查看元素，DOM 始终存在）</p>
        <button @click="isVisible = !isVisible">切换 v-show</button>
      </div>

      <!-- v-if 与 template 配合使用（渲染多个元素而不产生额外 DOM 节点） -->
      <template v-if="showGroup">
        <p>元素 1</p>
        <p>元素 2</p>
        <p>元素 3</p>
      </template>
      <button @click="showGroup = !showGroup">切换 template v-if</button>
    </section>

    <!-- ============================================
         六、列表渲染 - v-for
         ============================================
         v-for 用于遍历数组或对象，
         推荐始终提供 :key 属性以提升性能和避免渲染问题。
    -->
    <section>
      <h2>5. 列表渲染 v-for</h2>

      <!-- 遍历数组 -->
      <h3>遍历数组</h3>
      <ul>
        <!-- 语法：v-for="(item, index) in array" -->
        <!-- :key 必须是唯一且稳定的值，推荐使用 id -->
        <li v-for="(fruit, index) in fruits" :key="fruit.id">
          {{ index }} - {{ fruit.name }}（价格：{{ fruit.price }}元）
        </li>
      </ul>

      <!-- 遍历对象 -->
      <h3>遍历对象</h3>
      <ul>
        <!-- 语法：v-for="(value, key, index) in object" -->
        <li v-for="(value, key, index) in userInfo" :key="key">
          {{ index }} - {{ key }}: {{ value }}
        </li>
      </ul>

      <!-- 遍历数字 -->
      <h3>遍历数字</h3>
      <span v-for="n in 5" :key="n" style="margin-right: 8px;">
        {{ n }}
      </span>

      <!-- v-for 与 template 配合使用 -->
      <h3>v-for + template</h3>
      <template v-for="item in fruits" :key="item.id">
        <p>名称：{{ item.name }}</p>
        <p>价格：{{ item.price }}元</p>
        <hr />
      </template>

      <!-- 注意：不要在同一个元素上同时使用 v-if 和 v-for -->
      <!-- 如果需要过滤列表，先用 computed 计算属性过滤 -->
    </section>

    <!-- ============================================
         七、双向绑定 - v-model
         ============================================
         v-model 在表单控件上创建双向数据绑定。
         它是 :value 和 @input 的语法糖。
    -->
    <section>
      <h2>6. 双向绑定 v-model</h2>

      <!-- 文本输入 -->
      <div>
        <label>文本输入：</label>
        <input v-model="textInput" placeholder="输入文本" />
        <span>你输入了：{{ textInput }}</span>
      </div>

      <!-- 多行文本 -->
      <div>
        <label>多行文本：</label>
        <textarea v-model="textareaInput" placeholder="输入多行文本"></textarea>
      </div>

      <!-- 复选框 -->
      <div>
        <label>单个复选框：</label>
        <input type="checkbox" v-model="isChecked" />
        <span>{{ isChecked ? '已选中' : '未选中' }}</span>
      </div>

      <!-- 多个复选框 -->
      <div>
        <label>多个复选框：</label>
        <input type="checkbox" value="苹果" v-model="selectedFruits" /> 苹果
        <input type="checkbox" value="香蕉" v-model="selectedFruits" /> 香蕉
        <input type="checkbox" value="橘子" v-model="selectedFruits" /> 橘子
        <span>选中：{{ selectedFruits.join('、') }}</span>
      </div>

      <!-- 单选按钮 -->
      <div>
        <label>单选按钮：</label>
        <input type="radio" value="male" v-model="gender" /> 男
        <input type="radio" value="female" v-model="gender" /> 女
        <span>选择：{{ gender }}</span>
      </div>

      <!-- 下拉选择 -->
      <div>
        <label>下拉选择：</label>
        <select v-model="selectedCity">
          <option disabled value="">请选择城市</option>
          <option>北京</option>
          <option>上海</option>
          <option>广州</option>
        </select>
        <span>选择：{{ selectedCity }}</span>
      </div>

      <!-- v-model 修饰符 -->
      <div>
        <label>v-model 修饰符：</label>
        <!-- .lazy - 在 change 事件而非 input 事件后同步 -->
        <input v-model.lazy="lazyInput" placeholder=".lazy 修饰符" />
        <!-- .number - 自动将输入值转为数字 -->
        <input v-model.number="age" type="number" placeholder=".number 修饰符" />
        <!-- .trim - 自动去除首尾空格 -->
        <input v-model.trim="trimmedInput" placeholder=".trim 修饰符" />
      </div>

      <!-- Vue 3 中 v-model 支持自定义修饰符（在组件中使用） -->
    </section>

    <!-- ============================================
         八、计算属性 - computed
         ============================================
         computed 基于响应式依赖进行缓存，
         只有当依赖发生变化时才会重新计算。
         适合用于派生状态（根据已有数据计算新数据）。
    -->
    <section>
      <h2>7. 计算属性 computed</h2>

      <!-- 基本用法 -->
      <div>
        <p>姓：<input v-model="lastName" /></p>
        <p>名：<input v-model="firstName" /></p>
        <!-- 计算属性像普通属性一样使用，不需要加 () -->
        <p>全名（计算属性）：{{ fullName }}</p>
      </div>

      <!-- 计算属性 vs 方法 -->
      <!-- 计算属性有缓存，方法每次调用都会执行 -->
      <div>
        <p>调用 3 次计算属性（只计算 1 次）：{{ fullName }}, {{ fullName }}, {{ fullName }}</p>
        <p>调用 3 次方法（计算 3 次）：{{ getFullName() }}, {{ getFullName() }}, {{ getFullName() }}</p>
      </div>

      <!-- 可写计算属性（getter + setter） -->
      <div>
        <p>全名：<input v-model="fullName" /></p>
        <p>修改全名会自动拆分为姓和名：{{ lastName }} {{ firstName }}</p>
      </div>

      <!-- 计算属性示例：过滤列表 -->
      <div>
        <input v-model="searchKeyword" placeholder="搜索水果..." />
        <ul>
          <li v-for="item in filteredFruits" :key="item.id">
            {{ item.name }} - {{ item.price }}元
          </li>
        </ul>
      </div>
    </section>

    <!-- ============================================
         九、侦听器 - watch / watchEffect
         ============================================
         watch：侦听特定的响应式数据源，在变化时执行副作用
         watchEffect：自动追踪回调中使用的响应式依赖，立即执行一次
    -->
    <section>
      <h2>8. 侦听器 watch / watchEffect</h2>

      <!-- watch 基本用法 -->
      <div>
        <h3>watch - 侦听 ref</h3>
        <p>输入关键词：<input v-model="watchKeyword" /></p>
        <p>侦听日志：{{ watchLog }}</p>
      </div>

      <!-- watch 侦听多个源 -->
      <div>
        <h3>watch - 侦听多个源</h3>
        <p>X：<input v-model.number="x" type="number" /></p>
        <p>Y：<input v-model.number="y" type="number" /></p>
        <p>X + Y = {{ x + y }}</p>
      </div>

      <!-- watch 侦听对象的属性 -->
      <div>
        <h3>watch - 深度侦听</h3>
        <p>用户名：<input v-model="user.name" /></p>
        <p>年龄：<input v-model.number="user.age" type="number" /></p>
        <p>侦听日志：{{ deepWatchLog }}</p>
      </div>

      <!-- watchEffect - 自动追踪依赖 -->
      <div>
        <h3>watchEffect - 自动追踪</h3>
        <p>watchEffect 会自动追踪回调中使用的所有响应式依赖</p>
        <p>效果日志：{{ effectLog }}</p>
      </div>

      <!-- watch vs watchEffect 对比 -->
      <!--
        watch：
        - 需要明确指定要侦听的数据源
        - 默认是懒执行的（只在数据变化时才执行）
        - 可以访问变化前后的值（oldVal, newVal）
        - 更精确，适合有条件的副作用

        watchEffect：
        - 自动追踪回调中使用的响应式依赖
        - 立即执行一次（创建时就执行）
        - 无法直接访问变化前的值
        - 更简洁，适合多个依赖需要同时侦听
      -->
    </section>

    <!-- ============================================
         十、生命周期钩子
         ============================================
         Vue 组件有一套完整的生命周期，从创建到销毁。
         在 <script setup> 中，生命周期钩子以 on 前缀导入使用。

         生命周期顺序：
         setup() → onBeforeMount → onMounted →
         onBeforeUpdate → onUpdated →
         onBeforeUnmount → onUnmounted

         还有：
         onActivated / onDeactivated（keep-alive 组件）
         onErrorCaptured（错误捕获）
      -->
    <section>
      <h2>9. 生命周期钩子</h2>
      <p>打开浏览器控制台查看生命周期钩子的执行顺序</p>
      <p>当前生命周期日志：{{ lifecycleLog }}</p>
      <button @click="triggerUpdate">触发更新（查看 onBeforeUpdate / onUpdated）</button>
      <button @click="showLifecycleChild = !showLifecycleChild">
        切换子组件（查看 onMounted / onUnmounted）
      </button>
      <LifecycleChild v-if="showLifecycleChild" />
    </section>

    <!-- ============================================
         十一、响应式 API - ref / reactive / toRef / toRefs
         ============================================
         ref：用于基本类型（string, number, boolean）和引用类型
              在 JS 中需要 .value 访问，模板中自动解包
         reactive：仅用于对象类型（Object, Array, Map, Set）
                   不需要 .value，直接访问属性
         toRef：为 reactive 对象的某个属性创建 ref
         toRefs：将 reactive 对象的所有属性转为 ref（解构时保持响应性）
      -->
    <section>
      <h2>10. 响应式 API</h2>

      <!-- ref - 基本类型 -->
      <div>
        <h3>ref - 基本类型</h3>
        <p>refCount: {{ refCount }}</p>
        <button @click="refCount++">refCount++</button>
        <p class="tip">在 JS 中使用 refCount.value，在模板中自动解包</p>
      </div>

      <!-- ref - 对象类型 -->
      <div>
        <h3>ref - 对象类型</h3>
        <p>refUser.name: {{ refUser.name }}</p>
        <input v-model="refUser.name" />
      </div>

      <!-- reactive - 对象类型 -->
      <div>
        <h3>reactive - 对象类型</h3>
        <p>reactiveUser.name: {{ reactiveUser.name }}</p>
        <p>reactiveUser.age: {{ reactiveUser.age }}</p>
        <input v-model="reactiveUser.name" />
        <input v-model.number="reactiveUser.age" type="number" />
        <p class="tip">reactive 不能用于基本类型，且不能直接替换整个对象</p>
      </div>

      <!-- toRef / toRefs -->
      <div>
        <h3>toRef / toRefs</h3>
        <p>toRef 为 reactive 的单个属性创建 ref</p>
        <p>toRefs 将 reactive 的所有属性转为 ref 对象</p>
        <p>name（通过 toRefs 解构）: {{ name }}</p>
        <p>age（通过 toRefs 解构）: {{ age }}</p>
        <input v-model="name" />
        <input v-model.number="age" type="number" />
        <p class="tip">
          直接解构 reactive 会丢失响应性，需要使用 toRefs
        </p>
      </div>

      <!-- ref vs reactive 选择建议 -->
      <!--
        推荐使用 ref() 作为声明响应式状态的主要 API
        理由：
        1. ref 可以用于任何类型，reactive 只能用于对象
        2. ref 在解构时不会丢失响应性
        3. ref 更容易在函数间传递
        4. reactive 在重新赋值时会丢失响应性

        reactive 适合的场景：
        - 本地的复杂对象状态（如表单数据）
        - 不需要重新赋值的对象
      -->
    </section>

    <!-- ============================================
         十二、<script setup> 语法糖
         ============================================
         <script setup> 是在单文件组件（SFC）中使用
         Composition API 的编译时语法糖。

         优势：
         1. 更简洁的代码，不需要 return
         2. 更好的 TypeScript 支持
         3. 更好的运行时性能

         在 <script setup> 中：
         - 顶层绑定（变量、函数、import）自动暴露给模板
         - 组件导入后可直接在模板中使用
         - 使用 defineProps / defineEmits 声明 props 和 emits
         - 使用 defineExpose 暴露组件的公共方法/属性
      -->
    <section>
      <h2>11. script setup 语法糖</h2>
      <p>本文件就是使用 &lt;script setup&gt; 编写的！</p>
      <p>特点：</p>
      <ul>
        <li>顶层变量、函数自动暴露给模板，无需 return</li>
        <li>导入的组件可直接使用</li>
        <li>使用 defineProps / defineEmits 声明</li>
        <li>代码更简洁，TypeScript 推导更好</li>
      </ul>
    </section>
  </div>
</template>

<!--
  ============================================
  <script setup> 语法糖
  ============================================
  这是 Vue 3 推荐的组件编写方式。
  在 <script setup> 中声明的所有顶层绑定
  （变量、函数、import 的组件等）都会自动
  暴露给模板使用，不需要 return。
-->
<script setup lang="ts">
/**
 * ============================================
 * 导入 Vue 3 的核心 API
 * ============================================
 * 所有需要使用的 API 都需要从 'vue' 中导入
 */
import {
  ref,           // 创建响应式引用（可用于任意类型）
  reactive,      // 创建响应式对象（仅用于对象类型）
  computed,      // 创建计算属性（有缓存）
  watch,         // 侦听特定数据源的变化
  watchEffect,   // 自动追踪依赖并执行副作用
  toRef,         // 为 reactive 对象的单个属性创建 ref
  toRefs,        // 将 reactive 对象的所有属性转为 ref
  onBeforeMount, // 生命周期：挂载前
  onMounted,     // 生命周期：挂载完成
  onBeforeUpdate,// 生命周期：更新前
  onUpdated,     // 生命周期：更新完成
  onBeforeUnmount, // 生命周期：卸载前
  onUnmounted,   // 生命周期：卸载完成
} from 'vue'

// ============================================
// 导入子组件（用于生命周期演示）
// ============================================
// 在 <script setup> 中，导入的组件可以直接在模板中使用
// 不需要注册，编译器会自动处理
import LifecycleChild from './LifecycleChild.vue'

// ============================================
// 二、文本插值相关数据
// ============================================
const message = ref('Hello, Vue 3!')  // 使用 ref 创建响应式字符串
const isHappy = ref(true)             // 使用 ref 创建响应式布尔值

// ============================================
// 三、v-bind 相关数据
// ============================================
const tooltipText = ref('我是动态绑定的提示文本')
const isActive = ref(true)            // 控制类名是否激活
const isBold = ref(false)             // 控制是否加粗
const baseClass = ref('base-text')    // 基础类名
const textColor = ref('blue')         // 动态颜色
const fontSize = ref(16)              // 动态字号
const styleObj1 = { fontWeight: 'bold' }  // 样式对象 1
const styleObj2 = { fontStyle: 'italic' } // 样式对象 2
const dynamicAttr = ref('title')      // 动态属性名
const dynamicValue = ref('动态属性值')  // 动态属性值

// ============================================
// 四、v-on 相关数据和方法
// ============================================
const count = ref(0)  // 计数器

// 定义方法 - 在 <script setup> 中，函数自动暴露给模板
function increment() {
  count.value++  // 注意：在 JS 中访问 ref 需要 .value
}

function sayHello(name: string) {
  alert(`你好，${name}！`)
}

function onEnterKey(event: KeyboardEvent) {
  console.log('按下了回车键，输入值：', (event.target as HTMLInputElement).value)
}

function onceHandler() {
  alert('这个按钮只会触发一次！')
}

// ============================================
// 五、条件渲染相关数据
// ============================================
const score = ref(85)          // 分数
const isVisible = ref(true)    // 控制可见性
const showGroup = ref(true)    // 控制组显示

// ============================================
// 六、列表渲染相关数据
// ============================================
// 数组 - 包含 id 作为唯一标识
const fruits = ref([
  { id: 1, name: '苹果', price: 5 },
  { id: 2, name: '香蕉', price: 3 },
  { id: 3, name: '橘子', price: 4 },
  { id: 4, name: '葡萄', price: 8 },
])

// 对象
const userInfo = reactive({
  name: '张三',
  age: 25,
  city: '北京',
})

// ============================================
// 七、v-model 相关数据
// ============================================
const textInput = ref('')
const textareaInput = ref('')
const isChecked = ref(false)
const selectedFruits = ref<string[]>([])  // 多选框绑定数组
const gender = ref('')                     // 单选按钮绑定字符串
const selectedCity = ref('')               // 下拉选择绑定字符串
const lazyInput = ref('')                  // .lazy 修饰符
const age = ref(0)                         // .number 修饰符
const trimmedInput = ref('')               // .trim 修饰符

// ============================================
// 八、计算属性 computed
// ============================================
const lastName = ref('张')
const firstName = ref('三')

// 只读计算属性 - 基于 lastName 和 firstName 计算
// 只有当依赖变化时才会重新计算，否则使用缓存
const fullName = computed({
  // getter - 读取时调用
  get() {
    return `${lastName.value}${firstName.value}`
  },
  // setter - 修改时调用
  set(newVal: string) {
    // 将全名拆分为姓和名
    lastName.value = newVal.charAt(0)
    firstName.value = newVal.slice(1)
  },
})

// 普通方法 - 每次调用都会执行
function getFullName(): string {
  return `${lastName.value}${firstName.value}`
}

// 计算属性示例：过滤列表
const searchKeyword = ref('')
const filteredFruits = computed(() => {
  // 根据搜索关键词过滤水果列表
  return fruits.value.filter(fruit =>
    fruit.name.includes(searchKeyword.value)
  )
})

// ============================================
// 九、侦听器 watch / watchEffect
// ============================================
const watchKeyword = ref('')
const watchLog = ref('')

// watch 侦听 ref - 接收两个参数：回调函数和选项
watch(watchKeyword, (newVal, oldVal) => {
  watchLog.value = `关键词从 "${oldVal}" 变为 "${newVal}"`
}, {
  // immediate: true  // 创建时立即执行一次
  // deep: true       // 深度侦听（用于对象/数组）
})

// watch 侦听多个数据源 - 使用数组
const x = ref(0)
const y = ref(0)
watch([x, y], ([newX, newY]) => {
  console.log(`x: ${newX}, y: ${newY}, sum: ${newX + newY}`)
})

// watch 侦听 reactive 对象的属性
const user = reactive({ name: '李四', age: 30 })
const deepWatchLog = ref('')

// 使用 getter 函数侦听对象的属性
watch(
  () => ({ ...user }),  // 返回对象的副本以获取旧值
  (newVal, oldVal) => {
    deepWatchLog.value = `用户信息变化：${JSON.stringify(oldVal)} → ${JSON.stringify(newVal)}`
  },
  { deep: true }  // 深度侦听
)

// watchEffect - 自动追踪依赖
const effectLog = ref('')
watchEffect(() => {
  // 自动追踪回调中使用的所有响应式依赖
  // 当 x、y 或 watchKeyword 变化时，这个回调会重新执行
  effectLog.value = `x=${x.value}, y=${y.value}, keyword="${watchKeyword.value}"`
})

// ============================================
// 十、生命周期钩子
// ============================================
const lifecycleLog = ref<string[]>([])
const showLifecycleChild = ref(true)

// 添加日志的辅助函数
function addLog(msg: string) {
  lifecycleLog.value.push(msg)
  console.log(`[生命周期] ${msg}`)
}

// onBeforeMount - 组件挂载到 DOM 之前调用
// 此时模板已编译，但还未渲染到页面上
onBeforeMount(() => {
  addLog('onBeforeMount - 组件即将挂载')
})

// onMounted - 组件挂载到 DOM 之后调用
// 此时可以访问 DOM 元素，常用于发起 API 请求
onMounted(() => {
  addLog('onMounted - 组件已挂载')
  console.log('组件已挂载，可以安全地操作 DOM')
})

// onBeforeUpdate - 响应式数据变化后，DOM 更新之前调用
onBeforeUpdate(() => {
  addLog('onBeforeUpdate - 组件即将更新')
})

// onUpdated - DOM 更新完成后调用
// 注意：避免在此修改状态，可能导致无限循环
onUpdated(() => {
  addLog('onUpdated - 组件已更新')
})

// onBeforeUnmount - 组件卸载之前调用
// 常用于清理定时器、取消事件监听等
onBeforeUnmount(() => {
  addLog('onBeforeUnmount - 组件即将卸载')
})

// onUnmounted - 组件卸载完成后调用
onUnmounted(() => {
  addLog('onUnmounted - 组件已卸载')
})

// 触发更新的方法（用于演示 onBeforeUpdate / onUpdated）
function triggerUpdate() {
  count.value++
}

// ============================================
// 十一、响应式 API 演示数据
// ============================================

// ref - 基本类型
const refCount = ref(0)

// ref - 对象类型
const refUser = ref({ name: '王五', age: 28 })

// reactive - 对象类型
const reactiveUser = reactive({
  name: '赵六',
  age: 32,
})

// toRefs - 解构 reactive 对象并保持响应性
const { name, age } = toRefs(reactiveUser)

// ============================================
// 补充：shallowRef 和 shallowReactive
// ============================================
// shallowRef - 只追踪 .value 的变化，不深度追踪
// 适用于大型对象，避免不必要的响应式开销
// const shallowData = shallowRef({ count: 0 })
// shallowData.value = { count: 1 }  // 触发更新（替换整个 .value）
// shallowData.value.count++          // 不触发更新（修改深层属性）

// shallowReactive - 只追踪第一层属性的变化
// const shallowObj = shallowReactive({ nested: { count: 0 } })
// shallowObj.nested = { count: 1 }   // 触发更新
// shallowObj.nested.count++           // 不触发更新
</script>

<!--
  ============================================
  <style scoped>
  ============================================
  scoped 表示样式只作用于当前组件，
  Vue 会自动为当前组件的元素添加唯一属性（如 data-v-xxxx），
  确保样式不会泄漏到其他组件。
-->
<style scoped>
.vue-basics {
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

input, select, textarea {
  padding: 6px 10px;
  margin: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.active {
  color: #42b883;
  font-weight: bold;
}

.text-bold {
  font-weight: bold;
}

.tip {
  color: #666;
  font-size: 14px;
  font-style: italic;
}

hr {
  border: none;
  border-top: 1px dashed #ddd;
  margin: 8px 0;
}
</style>
