/**
 * ES6+ 函数进阶示例
 * 
 * 本文件涵盖：
 * - 箭头函数深入
 * - rest 参数
 * - 解构参数
 * - 函数绑定（bind/call/apply）
 * - 尾调用优化
 */

console.log('========== ES6+ 函数进阶示例 ==========\n');

// ============================================
// 一、箭头函数深入
// ============================================

console.log('--- 一、箭头函数深入 ---\n');

console.log('1. 箭头函数返回对象：');

// 返回对象字面量需要用括号包裹
const createUser = (name, age) => ({ name, age });
console.log('   createUser("张三", 25):', createUser('张三', 25));

// 如果不用括号，大括号会被解释为函数体
// const wrongUser = (name, age) => { name, age }; // undefined（没有 return）

console.log('\n2. 箭头函数与数组方法：');

const numbers = [1, 2, 3, 4, 5];

// map 使用箭头函数
const doubled = numbers.map(n => n * 2);
console.log('   map 箭头函数:', doubled);

// filter 使用箭头函数
const evens = numbers.filter(n => n % 2 === 0);
console.log('   filter 箭头函数:', evens);

// reduce 使用箭头函数
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log('   reduce 箭头函数:', sum);

// find 使用箭头函数
const found = numbers.find(n => n > 3);
console.log('   find 箭头函数:', found);

// sort 使用箭头函数（降序）
const sorted = [...numbers].sort((a, b) => b - a);
console.log('   sort 箭头函数:', sorted);

console.log('\n3. 箭头函数与 this 的实际应用：');

// 在对象方法中使用箭头函数的正确方式
const counter = {
    count: 0,
    
    // 正确：传统方法中嵌套箭头函数
    start: function() {
        console.log('   计时器开始...');
        
        // 箭头函数保持外层 this
        this.timer = setInterval(() => {
            this.count++;
            console.log(`   当前计数: ${this.count}`);
            
            if (this.count >= 3) {
                clearInterval(this.timer);
                console.log('   计时器停止');
            }
        }, 100);
    }
};

// 延迟执行以观察输出
setTimeout(() => {
    counter.start();
}, 500);

console.log('\n4. 箭头函数作为回调：');

// Promise 链中使用箭头函数
const promiseChain = Promise.resolve(1)
    .then(value => {
        console.log('   第一步:', value);
        return value + 1;
    })
    .then(value => {
        console.log('   第二步:', value);
        return value * 2;
    })
    .then(value => {
        console.log('   第三步:', value);
    });

// ============================================
// 二、rest 参数
// ============================================

console.log('\n--- 二、rest 参数 ---\n');

console.log('1. rest 参数基本用法：');

// rest 参数收集剩余参数为数组
function sumAll(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log('   sumAll(1, 2, 3):', sumAll(1, 2, 3));
console.log('   sumAll(1, 2, 3, 4, 5):', sumAll(1, 2, 3, 4, 5));
console.log('   sumAll():', sumAll());

console.log('\n2. rest 参数与普通参数结合：');

function greetAll(greeting, ...names) {
    return names.map(name => `${greeting}, ${name}!`);
}

console.log('   greetAll("你好", "张三", "李四", "王五"):');
greetAll('你好', '张三', '李四', '王五').forEach(msg => {
    console.log('     ' + msg);
});

console.log('\n3. rest 参数与箭头函数：');

// 箭头函数没有 arguments，使用 rest 参数代替
const multiplyAll = (...factors) => {
    return factors.reduce((product, factor) => product * factor, 1);
};

console.log('   multiplyAll(2, 3, 4):', multiplyAll(2, 3, 4));

console.log('\n4. rest 参数用于解构：');

const [first, second, ...rest] = [1, 2, 3, 4, 5];
console.log('   first:', first);
console.log('   second:', second);
console.log('   rest:', rest);

const { a: propA, b: propB, ...remaining } = { a: 1, b: 2, c: 3, d: 4 };
console.log('   propA:', propA);
console.log('   propB:', propB);
console.log('   remaining:', remaining);

console.log('\n5. rest 参数的限制：');

// rest 参数必须是最后一个参数
// function wrong(a, ...rest, b) {} // 语法错误！

// 函数只能有一个 rest 参数
// function alsoWrong(...a, ...b) {} // 语法错误！

console.log('   rest 参数必须是最后一个参数');
console.log('   函数只能有一个 rest 参数');

// ============================================
// 三、解构参数
// ============================================

console.log('\n--- 三、解构参数 ---\n');

console.log('1. 对象解构参数：');

// 传统方式
function createUserOld(options) {
    const name = options.name || '匿名';
    const age = options.age || 0;
    const email = options.email || '';
    return { name, age, email };
}

// 解构参数方式
function createUserNew({ name = '匿名', age = 0, email = '' } = {}) {
    return { name, age, email };
}

console.log('   传统方式:', createUserOld({ name: '张三', age: 25 }));
console.log('   解构方式:', createUserNew({ name: '张三', age: 25 }));
console.log('   空参数:', createUserNew());

console.log('\n2. 数组解构参数：');

function getCoordinates([x, y, z = 0] = []) {
    return { x, y, z };
}

console.log('   getCoordinates([1, 2]):', getCoordinates([1, 2]));
console.log('   getCoordinates([1, 2, 3]):', getCoordinates([1, 2, 3]));

console.log('\n3. 嵌套解构参数：');

function processConfig({
    server: {
        host = 'localhost',
        port = 3000
    } = {},
    database: {
        name = 'mydb',
        user = 'root'
    } = {}
} = {}) {
    return { server: { host, port }, database: { name, user } };
}

const config1 = processConfig({
    server: { host: 'example.com' },
    database: { name: 'production' }
});
console.log('   嵌套解构:', config1);

console.log('\n4. 解构参数与 rest 结合：');

function extractData({ id, ...details }) {
    return { id, details };
}

const extracted = extractData({ id: 1, name: '张三', age: 25, city: '北京' });
console.log('   提取结果:', extracted);

console.log('\n5. 实际应用示例：');

// 模拟 API 请求函数
function apiRequest(url, {
    method = 'GET',
    headers = {},
    body = null,
    timeout = 5000
} = {}) {
    console.log(`   请求 URL: ${url}`);
    console.log(`   方法: ${method}`);
    console.log(`   超时: ${timeout}ms`);
    if (body) console.log(`   请求体:`, body);
    return { url, method, headers, body, timeout };
}

apiRequest('/api/users', { method: 'POST', body: { name: '张三' } });

// ============================================
// 四、函数绑定（bind/call/apply）
// ============================================

console.log('\n--- 四、函数绑定 ---\n');

console.log('1. call 方法：');

// call 立即调用函数，并指定 this
const person = {
    name: '张三',
    greet: function(greeting, punctuation) {
        console.log(`   ${greeting}, 我是${this.name}${punctuation}`);
    }
};

const anotherPerson = { name: '李四' };

person.greet('你好', '！'); // 正常调用
person.greet.call(anotherPerson, '你好', '！'); // 改变 this

console.log('\n2. apply 方法：');

// apply 与 call 类似，但参数以数组形式传递
person.greet.apply(anotherPerson, ['早上好', '。']);

// apply 常用于将数组展开为参数
const maxNumber = Math.max.apply(null, [1, 5, 3, 9, 2]);
console.log('   Math.max.apply(null, [1, 5, 3, 9, 2]):', maxNumber);

// ES6 更推荐使用展开运算符
const maxNumberES6 = Math.max(...[1, 5, 3, 9, 2]);
console.log('   Math.max(...[1, 5, 3, 9, 2]):', maxNumberES6);

console.log('\n3. bind 方法：');

// bind 返回一个新函数，this 被永久绑定
const greetLiSi = person.greet.bind(anotherPerson);
greetLiSi('欢迎', '~');

// bind 可以预设参数（柯里化）
const greetLiSiWithHello = person.greet.bind(anotherPerson, '你好');
greetLiSiWithHello('！');
greetLiSiWithHello('...');

console.log('\n4. 箭头函数与 bind：');

// 箭头函数的 this 不能被改变
const arrowGreet = () => {
    console.log(`   箭头函数中的 this.name: ${this?.name}`);
};

const boundArrow = arrowGreet.bind({ name: '测试' });
boundArrow(); // this 仍然是外层作用域的 this

console.log('\n5. 实际应用场景：');

// 在事件处理中保持 this
class Button {
    constructor(text) {
        this.text = text;
        this.clickCount = 0;
    }
    
    // 使用 bind 绑定 this
    handleClick() {
        this.clickCount++;
        console.log(`   按钮被点击 ${this.clickCount} 次`);
    }
    
    getBoundHandler() {
        return this.handleClick.bind(this);
    }
}

const button = new Button('提交');
const handler = button.getBoundHandler();
handler();
handler();

// ============================================
// 五、尾调用优化
// ============================================

console.log('\n--- 五、尾调用优化 ---\n');

console.log('1. 什么是尾调用：');

// 尾调用：函数的最后一步是调用另一个函数
function tailCallExample() {
    const result = '尾调用示例';
    return result; // 不是尾调用，最后一步是返回变量
}

function properTailCall() {
    return anotherFunction(); // 尾调用，最后一步是调用函数
}

function anotherFunction() {
    return '另一个函数的结果';
}

console.log('   properTailCall():', properTailCall());

console.log('\n2. 尾递归示例：');

// 普通递归（可能导致栈溢出）
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1); // 不是尾递归
}

// 尾递归优化版本
function factorialOptimized(n, accumulator = 1) {
    if (n <= 1) return accumulator;
    return factorialOptimized(n - 1, n * accumulator); // 尾递归
}

console.log('   factorial(5):', factorial(5));
console.log('   factorialOptimized(5):', factorialOptimized(5));

console.log('\n3. 斐波那契数列尾递归：');

// 普通递归（效率低）
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 尾递归优化版本
function fibonacciOptimized(n, a = 0, b = 1) {
    if (n === 0) return a;
    if (n === 1) return b;
    return fibonacciOptimized(n - 1, b, a + b);
}

console.log('   fibonacci(10):', fibonacci(10));
console.log('   fibonacciOptimized(10):', fibonacciOptimized(10));

console.log('\n4. 尾调用优化的条件：');

console.log('   尾调用优化的条件：');
console.log('   1. 必须在严格模式下');
console.log('   2. 尾调用函数不能引用外层函数的变量');
console.log('   3. 尾调用函数是最后一步操作');

// 严格模式示例
// 'use strict';
// function strictTailCall(n) {
//     if (n <= 0) return 'done';
//     return strictTailCall(n - 1); // 可以被优化
// }

console.log('\n5. 蹦床函数（Trampoline）：');

// 对于不支持尾调用优化的环境，使用蹦床函数
function trampoline(fn) {
    return function(...args) {
        let result = fn.apply(this, args);
        while (typeof result === 'function') {
            result = result();
        }
        return result;
    };
}

// 使用蹦床的递归
function factorialTrampoline(n, accumulator = 1) {
    if (n <= 1) return accumulator;
    return () => factorialTrampoline(n - 1, n * accumulator);
}

const safeFactorial = trampoline(factorialTrampoline);
console.log('   safeFactorial(5):', safeFactorial(5));

// ============================================
// 六、函数的其他高级特性
// ============================================

console.log('\n--- 六、函数的其他高级特性 ---\n');

console.log('1. 函数的 length 属性：');

// length 返回没有默认值的参数个数
function func1(a, b, c) {}
console.log('   func1.length:', func1.length); // 3

function func2(a, b, c = 1) {}
console.log('   func2.length:', func2.length); // 2

function func3(a = 1, b, c) {}
console.log('   func3.length:', func3.length); // 0

function func4(...args) {}
console.log('   func4.length:', func4.length); // 0

console.log('\n2. 函数的 name 属性：');

function namedFunction() {}
const anonymousFunction = function() {};
const arrowFunctionName = () => {};

console.log('   namedFunction.name:', namedFunction.name);
console.log('   anonymousFunction.name:', anonymousFunction.name);
console.log('   arrowFunctionName.name:', arrowFunctionName.name);

// 方法简写的 name
const obj = {
    method() {}
};
console.log('   obj.method.name:', obj.method.name);

console.log('\n3. 函数柯里化：');

// 手动柯里化
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function(...moreArgs) {
            return curried.apply(this, args.concat(moreArgs));
        };
    };
}

function add(a, b, c) {
    return a + b + c;
}

const curriedAdd = curry(add);
console.log('   curriedAdd(1)(2)(3):', curriedAdd(1)(2)(3));
console.log('   curriedAdd(1, 2)(3):', curriedAdd(1, 2)(3));
console.log('   curriedAdd(1)(2, 3):', curriedAdd(1)(2, 3));

console.log('\n4. 函数组合：');

const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const double = x => x * 2;
const addOne = x => x + 1;
const square = x => x * x;

const composedFn = compose(double, addOne, square);
const pipedFn = pipe(square, addOne, double);

console.log('   compose(double, addOne, square)(3):', composedFn(3)); // ((3^2 + 1) * 2) = 20
console.log('   pipe(square, addOne, double)(3):', pipedFn(3));       // ((3^2 + 1) * 2) = 20

console.log('\n========== 函数进阶示例结束 ==========\n');
