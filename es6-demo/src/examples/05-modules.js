/**
 * ES6+ 模块化示例
 * 
 * 本文件涵盖：
 * - import/export 基础
 * - 动态导入
 * - 循环依赖
 * - 命名空间导入
 * 
 * 注意：此文件需要在 ES 模块环境中运行
 * 可以在 Node.js 中使用 .mjs 扩展名，或在浏览器中使用 <script type="module">
 */

console.log('========== ES6+ 模块化示例 ==========\n');

// ============================================
// 一、export 导出
// ============================================

console.log('--- 一、export 导出 ---\n');

console.log('1. 命名导出：');

// 导出变量
export const PI = 3.14159;
export const E = 2.71828;

// 导出函数
export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}

// 导出类
export class Calculator {
    add(a, b) { return a + b; }
    subtract(a, b) { return a - b; }
}

// 先声明后导出
const name = '模块名称';
const version = '1.0.0';
export { name, version };

// 导出时重命名
export { name as moduleName, version as moduleVersion };

console.log('   命名导出已定义');

console.log('\n2. 默认导出：');

// 默认导出（每个模块只能有一个）
export default class Logger {
    log(message) {
        console.log(`[LOG] ${message}`);
    }
    
    error(message) {
        console.error(`[ERROR] ${message}`);
    }
}

// 默认导出也可以是表达式
// export default function() { return '匿名函数'; }

// 默认导出也可以是值
// export default { name: '默认对象' };

console.log('   默认导出已定义');

console.log('\n3. 聚合导出（重新导出）：');

// 从其他模块重新导出
// export { add, multiply } from './math.js';
// export * from './utils.js';  // 导出全部
// export * as utils from './utils.js';  // 导出为命名空间
// export { default } from './logger.js';  // 重新导出默认

console.log('   聚合导出语法示例（需要实际模块文件）');

// ============================================
// 二、import 导入
// ============================================

console.log('\n--- 二、import 导入 ---\n');

console.log('1. 命名导入：');

// 导入特定的命名导出
// import { add, multiply } from './math.js';

// 导入时重命名
// import { add as addNumbers } from './math.js';

// 导入所有命名导出
// import * as math from './math.js';
// math.add(1, 2);

console.log('   命名导入语法示例');

console.log('\n2. 默认导入：');

// 导入默认导出
// import Logger from './logger.js';

// 同时导入默认导出和命名导出
// import Logger, { name, version } from './logger.js';

console.log('   默认导入语法示例');

console.log('\n3. 仅执行模块（副作用导入）：');

// 仅执行模块代码，不导入任何内容
// import './setup.js';

console.log('   副作用导入语法示例');

// ============================================
// 三、动态导入
// ============================================

console.log('\n--- 三、动态导入 ---\n');

console.log('1. 基本用法：');

// 动态导入返回 Promise
// import('./math.js').then(math => {
//     console.log(math.add(1, 2));
// });

// 使用 async/await
// async function loadModule() {
//     const math = await import('./math.js');
//     return math.add(1, 2);
// }

console.log('   动态导入语法示例');

console.log('\n2. 条件导入：');

// 根据条件加载不同模块
// async function loadFeature(featureName) {
//     if (featureName === 'math') {
//         return await import('./math.js');
//     } else if (featureName === 'utils') {
//         return await import('./utils.js');
//     }
// }

console.log('   条件导入示例');

console.log('\n3. 按需加载示例：');

// 模拟按需加载
class ModuleLoader {
    constructor() {
        this.cache = new Map();
    }
    
    async load(moduleName) {
        if (this.cache.has(moduleName)) {
            return this.cache.get(moduleName);
        }
        
        console.log(`   加载模块: ${moduleName}`);
        
        // 模拟动态导入
        const module = await this.mockImport(moduleName);
        this.cache.set(moduleName, module);
        return module;
    }
    
    async mockImport(moduleName) {
        // 模拟异步加载
        return new Promise(resolve => {
            setTimeout(() => {
                const modules = {
                    math: { add: (a, b) => a + b, multiply: (a, b) => a * b },
                    utils: { formatDate: (d) => d.toISOString() }
                };
                resolve(modules[moduleName] || {});
            }, 100);
        });
    }
}

const loader = new ModuleLoader();

async function demoDynamicImport() {
    const math = await loader.load('math');
    console.log('   math.add(1, 2) =', math.add(1, 2));
    
    // 第二次从缓存加载
    const math2 = await loader.load('math');
    console.log('   从缓存加载:', math2 === math);
}

demoDynamicImport();

// ============================================
// 四、循环依赖
// ============================================

console.log('\n--- 四、循环依赖 ---\n');

console.log('1. 循环依赖问题：');

console.log('   模块 A 导入模块 B，模块 B 又导入模块 A');
console.log('   这可能导致未初始化的值被使用');

console.log('\n2. 解决方案：');

console.log('   方案1：重构代码，消除循环依赖');
console.log('   方案2：将共享逻辑提取到第三个模块');
console.log('   方案3：延迟访问（在函数内部导入）');

// 模拟循环依赖
// moduleA.js
// import { b } from './moduleB.js';
// export const a = 'A';
// export function useB() { return b; }

// moduleB.js  
// import { a } from './moduleA.js';
// export const b = 'B';
// export function useA() { return a; }

console.log('\n3. 延迟导入解决循环依赖：');

// 在函数内部导入
// export function useOtherModule() {
//     const other = require('./otherModule.js');
//     return other.doSomething();
// }

// 或者使用动态导入
// export async function useOtherModule() {
//     const other = await import('./otherModule.js');
//     return other.doSomething();
// }

// ============================================
// 五、命名空间导入
// ============================================

console.log('\n--- 五、命名空间导入 ---\n');

console.log('1. 导入整个模块为命名空间：');

// import * as Math from './math.js';
// Math.add(1, 2);
// Math.multiply(3, 4);

console.log('   命名空间导入语法示例');

console.log('\n2. 模拟命名空间：');

// 创建命名空间对象
const MathNS = {
    PI: 3.14159,
    E: 2.71828,
    
    add(a, b) { return a + b; },
    subtract(a, b) { return a - b; },
    multiply(a, b) { return a * b; },
    divide(a, b) { return a / b; },
    
    square(x) { return x * x; },
    cube(x) { return x * x * x; }
};

console.log('   MathNS.PI:', MathNS.PI);
console.log('   MathNS.add(1, 2):', MathNS.add(1, 2));
console.log('   MathNS.square(5):', MathNS.square(5));

console.log('\n3. 嵌套命名空间：');

const App = {
    Utils: {
        formatDate(date) {
            return date.toLocaleDateString();
        },
        formatNumber(num) {
            return num.toLocaleString();
        }
    },
    
    API: {
        async get(url) {
            // 模拟 API 调用
            return { data: 'response' };
        },
        async post(url, data) {
            return { success: true };
        }
    },
    
    Config: {
        apiUrl: 'https://api.example.com',
        timeout: 5000
    }
};

console.log('   App.Config.apiUrl:', App.Config.apiUrl);
console.log('   App.Utils.formatDate(new Date()):', App.Utils.formatDate(new Date()));

// ============================================
// 六、模块模式对比
// ============================================

console.log('\n--- 六、模块模式对比 ---\n');

console.log('1. ES 模块 vs CommonJS：');

console.log('   ES 模块（ESM）：');
console.log('   - 使用 import/export 语法');
console.log('   - 静态分析，编译时确定依赖');
console.log('   - 支持 tree-shaking');
console.log('   - this 不指向模块，而是 undefined');
console.log('   - 异步加载');

console.log('\n   CommonJS：');
console.log('   - 使用 require/module.exports');
console.log('   - 动态加载，运行时确定依赖');
console.log('   - 不支持 tree-shaking');
console.log('   - this 指向当前模块');
console.log('   - 同步加载');

console.log('\n2. 语法对比：');

// ES 模块
// export const value = 1;
// import { value } from './module.js';

// CommonJS
// const value = 1;
// module.exports = { value };
// const { value } = require('./module.js');

console.log('\n3. 互操作性：');

// 在 ES 模块中导入 CommonJS
// import cjsModule from './cjs-module.cjs';

// 在 CommonJS 中导入 ES 模块（Node.js）
// const esm = await import('./esm-module.mjs');

// ============================================
// 七、模块最佳实践
// ============================================

console.log('\n--- 七、模块最佳实践 ---\n');

console.log('1. 模块设计原则：');

console.log('   - 单一职责：每个模块只做一件事');
console.log('   - 高内聚：相关功能放在一起');
console.log('   - 低耦合：模块间依赖最小化');
console.log('   - 明确的接口：清晰的导出');

console.log('\n2. 导出建议：');

console.log('   - 优先使用命名导出（便于 tree-shaking）');
console.log('   - 只在模块代表单一实体时使用默认导出');
console.log('   - 避免导出可变状态');

console.log('\n3. 导入建议：');

console.log('   - 只导入需要的成员');
console.log('   - 使用具描述性的重命名');
console.log('   - 将导入语句放在文件顶部');

console.log('\n4. 模块结构示例：');

// 推荐：模块入口文件
// index.js
// export { addUser, deleteUser, getUser } from './user.js';
// export { addPost, deletePost, getPost } from './post.js';
// export { default as Database } from './database.js';

console.log('   模块入口文件示例：');
console.log('   // index.js');
console.log('   export { addUser, deleteUser } from "./user.js";');
console.log('   export { addPost, deletePost } from "./post.js";');
console.log('   export { default as Database } from "./database.js";');

// ============================================
// 八、实际模块示例
// ============================================

console.log('\n--- 八、实际模块示例 ---\n');

// 模拟一个完整的模块
const MyModule = {
    // 私有变量（模拟）
    _privateVar: '私有',
    
    // 公共常量
    VERSION: '1.0.0',
    
    // 工具函数
    utils: {
        debounce(fn, delay) {
            let timer;
            return function(...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
        },
        
        throttle(fn, delay) {
            let last = 0;
            return function(...args) {
                const now = Date.now();
                if (now - last >= delay) {
                    last = now;
                    return fn.apply(this, args);
                }
            };
        }
    },
    
    // 类
    EventEmitter: class {
        constructor() {
            this.events = {};
        }
        
        on(event, listener) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(listener);
        }
        
        emit(event, ...args) {
            if (this.events[event]) {
                this.events[event].forEach(listener => listener(...args));
            }
        }
        
        off(event, listener) {
            if (this.events[event]) {
                this.events[event] = this.events[event].filter(l => l !== listener);
            }
        }
    }
};

console.log('   MyModule.VERSION:', MyModule.VERSION);

// 测试 EventEmitter
const emitter = new MyModule.EventEmitter();
emitter.on('test', (data) => console.log('   事件触发:', data));
emitter.emit('test', 'Hello World!');

// 测试 debounce
let counter = 0;
const debouncedFn = MyModule.utils.debounce(() => {
    console.log('   debounce 执行:', ++counter);
}, 100);

debouncedFn();
debouncedFn();
debouncedFn(); // 只会执行一次

console.log('\n========== 模块化示例结束 ==========\n');

// 导出示例（供其他模块使用）
export default MyModule;
