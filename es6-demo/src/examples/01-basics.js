/**
 * ES6+ 基础语法示例
 * 
 * 本文件涵盖：
 * - let 和 const 声明
 * - 箭头函数
 * - 模板字符串
 * - 展开运算符
 * - 默认参数
 */

console.log('========== ES6+ 基础语法示例 ==========\n');

// ============================================
// 一、let 和 const 声明
// ============================================

console.log('--- 一、let 和 const 声明 ---\n');

// 1. var 的问题（ES5 及之前）
// var 声明的变量存在变量提升，且没有块级作用域
console.log('1. var 的问题演示：');
function varDemo() {
    // 变量提升：在声明之前就可以访问，但值为 undefined
    console.log('   var 声明前访问 myVar:', myVar); // undefined（不会报错）
    var myVar = '我是 var 声明的变量';
    console.log('   var 声明后访问 myVar:', myVar);
    
    // var 没有块级作用域，只有函数作用域
    if (true) {
        var blockVar = '我在代码块内声明的 var';
    }
    console.log('   代码块外访问 blockVar:', blockVar); // 可以访问！
}
varDemo();

console.log('\n2. let 声明（块级作用域）：');

// let 声明的变量具有块级作用域
function letDemo() {
    let letVar = '我是 let 声明的变量';
    console.log('   函数内访问 letVar:', letVar);
    
    if (true) {
        let blockLet = '我在代码块内声明的 let';
        console.log('   代码块内访问 blockLet:', blockLet);
    }
    // console.log(blockLet); // 报错！blockLet 在此作用域不存在
    
    // let 不存在变量提升
    // console.log(temporalLet); // 报错！在声明前访问会报 ReferenceError
    let temporalLet = '暂时性死区演示';
}
letDemo();

console.log('\n3. const 声明（常量）：');

// const 声明一个只读的常量，必须初始化
const PI = 3.14159;
console.log('   const PI =', PI);
// PI = 3.14; // 报错！不能重新赋值

// 注意：const 保证的是变量指向的内存地址不变
// 对于对象和数组，其内容是可以修改的
const person = { name: '张三', age: 25 };
person.age = 26; // 这是允许的！修改的是对象内部的属性
console.log('   修改后的 person:', person);

// person = {}; // 报错！不能重新赋值整个对象

const numbers = [1, 2, 3];
numbers.push(4); // 允许！修改数组内容
console.log('   修改后的 numbers:', numbers);

// 如果想完全冻结对象，使用 Object.freeze()
const frozenObj = Object.freeze({ x: 1 });
// frozenObj.x = 2; // 严格模式下会报错，非严格模式静默失败
console.log('   冻结的对象 frozenObj:', frozenObj);

// ============================================
// 二、箭头函数
// ============================================

console.log('\n--- 二、箭头函数 ---\n');

console.log('1. 箭头函数的基本语法：');

// 传统函数表达式
const traditionalFunc = function(a, b) {
    return a + b;
};

// 箭头函数
const arrowFunc = (a, b) => {
    return a + b;
};

// 简写：当函数体只有一条 return 语句时，可以省略大括号和 return
const arrowFuncShort = (a, b) => a + b;

// 单个参数可以省略括号
const double = x => x * 2;

// 无参数需要空括号
const sayHello = () => console.log('   Hello from arrow function!');

console.log('   traditionalFunc(1, 2) =', traditionalFunc(1, 2));
console.log('   arrowFunc(1, 2) =', arrowFunc(1, 2));
console.log('   arrowFuncShort(1, 2) =', arrowFuncShort(1, 2));
console.log('   double(5) =', double(5));
sayHello();

console.log('\n2. 箭头函数的 this 绑定：');

// 箭头函数没有自己的 this，它会捕获定义时外层的 this 值
const obj = {
    name: '我的对象',
    
    // 传统方法：this 指向调用者
    traditionalMethod: function() {
        console.log('   传统方法中的 this.name:', this.name);
        
        // 传统函数中的 this 问题
        setTimeout(function() {
            console.log('   setTimeout 中传统函数的 this.name:', this?.name); // undefined（this 指向全局或 undefined）
        }, 100);
        
        // 使用箭头函数解决 this 问题
        setTimeout(() => {
            console.log('   setTimeout 中箭头函数的 this.name:', this.name); // 正确！
        }, 100);
    },
    
    // 箭头函数方法：this 捕获外层作用域的 this
    arrowMethod: () => {
        // 注意：这里的 this 是定义对象时外层的 this（通常是全局对象）
        console.log('   箭头方法中的 this.name:', this?.name); // 可能是 undefined
    }
};

obj.traditionalMethod();
setTimeout(() => {
    obj.arrowMethod();
}, 200);

console.log('\n3. 箭头函数的注意事项：');

// 箭头函数不能用作构造函数
const ArrowConstructor = (name) => {
    this.name = name;
};
// new ArrowConstructor('test'); // 报错！箭头函数不能使用 new

// 箭头函数没有 arguments 对象
const showArguments = () => {
    // console.log(arguments); // 报错！arguments 未定义
    console.log('   箭头函数没有 arguments 对象，请使用 rest 参数代替');
};
showArguments();

// 箭头函数不能用作 Generator 函数
// const generatorArrow = *() => { yield 1; }; // 语法错误

// ============================================
// 三、模板字符串
// ============================================

console.log('\n--- 三、模板字符串 ---\n');

console.log('1. 基本用法：');

// 传统字符串拼接
const name = '李四';
const age = 30;
const traditionalStr = '我叫' + name + '，今年' + age + '岁。';
console.log('   传统拼接:', traditionalStr);

// 模板字符串（使用反引号）
const templateStr = `我叫${name}，今年${age}岁。`;
console.log('   模板字符串:', templateStr);

console.log('\n2. 多行字符串：');

// 传统多行字符串需要使用 \n
const traditionalMulti = '第一行\n第二行\n第三行';
console.log('   传统多行字符串:');
console.log('   ' + traditionalMulti.split('\n').join('\n   '));

// 模板字符串可以直接换行
const templateMulti = `第一行
第二行
第三行`;
console.log('\n   模板字符串多行:');
console.log('   ' + templateMulti.split('\n').join('\n   '));

console.log('\n3. 表达式嵌入：');

const a = 10;
const b = 20;
console.log(`   ${a} + ${b} = ${a + b}`);
console.log(`   ${a} > ${b} 是 ${a > b}`);

// 可以调用函数
function toUpperCase(str) {
    return str.toUpperCase();
}
console.log(`   转换为大写: ${toUpperCase('hello world')}`);

// 三元表达式
const score = 85;
console.log(`   考试结果: ${score >= 60 ? '及格' : '不及格'}`);

console.log('\n4. 标签模板：');

// 标签模板是一个函数调用，模板字符串作为参数
function tagFunc(strings, ...values) {
    console.log('   strings:', strings); // 字符串部分数组
    console.log('   values:', values);   // 表达式值数组
    
    let result = '';
    strings.forEach((str, i) => {
        result += str;
        if (values[i] !== undefined) {
            result += `[${values[i]}]`;
        }
    });
    return result;
}

const taggedResult = tagFunc`你好，${name}！你今年${age}岁。`;
console.log('   标签模板结果:', taggedResult);

// ============================================
// 四、展开运算符（Spread Operator）
// ============================================

console.log('\n--- 四、展开运算符 ---\n');

console.log('1. 数组展开：');

const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];

// 合并数组
const merged = [...arr1, ...arr2];
console.log('   合并数组:', merged);

// 复制数组（浅拷贝）
const arr1Copy = [...arr1];
console.log('   复制数组:', arr1Copy);
console.log('   是否相同引用:', arr1 === arr1Copy); // false

// 在任意位置插入元素
const inserted = [0, ...arr1, 4, ...arr2, 7];
console.log('   插入元素:', inserted);

// 将字符串展开为数组
const strArr = [...'hello'];
console.log('   字符串展开:', strArr);

console.log('\n2. 对象展开：');

const obj1 = { x: 1, y: 2 };
const obj2 = { z: 3 };

// 合并对象
const mergedObj = { ...obj1, ...obj2 };
console.log('   合并对象:', mergedObj);

// 复制对象（浅拷贝）
const obj1Copy = { ...obj1 };
console.log('   复制对象:', obj1Copy);

// 覆盖属性
const override = { ...obj1, y: 100 }; // y 被覆盖
console.log('   覆盖属性:', override);

// 添加新属性
const extended = { ...obj1, ...obj2, w: 4 };
console.log('   添加属性:', extended);

console.log('\n3. 函数调用时展开：');

function sum(x, y, z) {
    return x + y + z;
}

const nums = [1, 2, 3];
console.log('   sum(...nums) =', sum(...nums));
// 等价于 sum(1, 2, 3)

// 配合 Math 方法
const maxNum = Math.max(...[5, 1, 8, 2, 9]);
console.log('   Math.max(...[5, 1, 8, 2, 9]) =', maxNum);

// ============================================
// 五、默认参数
// ============================================

console.log('\n--- 五、默认参数 ---\n');

console.log('1. 基本默认参数：');

// ES5 方式
function greetES5(name) {
    name = name || '访客'; // 如果 name 是 falsy 值，使用默认值
    console.log('   ES5 方式: 你好，' + name);
}

// ES6 默认参数
function greetES6(name = '访客') {
    console.log('   ES6 方式: 你好，' + name);
}

greetES5();          // 使用默认值
greetES5('王五');    // 使用传入值
greetES6();          // 使用默认值
greetES6('王五');    // 使用传入值

console.log('\n2. 默认参数与 undefined：');

// 默认参数只在参数为 undefined 时生效
function test(name = '默认值') {
    console.log(`   name = "${name}"`);
}

test();              // 使用默认值
test(undefined);     // 使用默认值（undefined 触发默认值）
test(null);          // null 不触发默认值
test('');            // 空字符串不触发默认值
test(0);             // 0 不触发默认值

console.log('\n3. 默认参数表达式：');

// 默认值可以是表达式
function getValue() {
    console.log('   计算默认值...');
    return '计算后的默认值';
}

function lazyDefault(value = getValue()) {
    console.log('   value:', value);
}

console.log('   第一次调用（使用默认值）:');
lazyDefault();
console.log('   第二次调用（传入值）:');
lazyDefault('传入的值');

console.log('\n4. 默认参数引用其他参数：');

// 默认参数可以引用前面的参数
function createUser(name, age, greeting = `你好，我是${name}`) {
    return { name, age, greeting };
}

const user1 = createUser('张三', 25);
console.log('   ', user1);

const user2 = createUser('李四', 30, '自定义问候语');
console.log('   ', user2);

console.log('\n5. 解构参数配合默认值：');

// 对象解构参数 + 默认值
function printUser({ name = '匿名', age = 0 } = {}) {
    console.log(`   姓名: ${name}, 年龄: ${age}`);
}

printUser();                      // 全部使用默认值
printUser({});                    // 全部使用默认值
printUser({ name: '王五' });      // 部分使用默认值
printUser({ name: '赵六', age: 28 }); // 全部使用传入值

// ============================================
// 六、其他 ES6+ 基础特性
// ============================================

console.log('\n--- 六、其他 ES6+ 基础特性 ---\n');

console.log('1. 块级作用域的最佳实践：');

// 建议：默认使用 const，需要重新赋值时使用 let，避免使用 var
const API_URL = 'https://api.example.com'; // 常量用 const
let isLoading = false; // 需要改变的变量用 let

console.log('   API_URL:', API_URL);
console.log('   isLoading:', isLoading);

console.log('\n2. 暂时性死区（Temporal Dead Zone）：');

// 在代码块内，使用 let/const 声明变量之前，该变量是不可用的
function tdzDemo() {
    // console.log(myVar); // 报错！ReferenceError
    let myVar = 'TDZ 结束';
    console.log('   ', myVar);
}
tdzDemo();

console.log('\n3. 循环中的 let：');

// 使用 let 在 for 循环中创建每次迭代的独立作用域
console.log('   使用 var:');
var funcsVar = [];
for (var i = 0; i < 3; i++) {
    funcsVar.push(function() { console.log('     ' + i); });
}
funcsVar.forEach(f => f()); // 输出三个 3

console.log('   使用 let:');
var funcsLet = [];
for (let j = 0; j < 3; j++) {
    funcsLet.push(function() { console.log('     ' + j); });
}
funcsLet.forEach(f => f()); // 输出 0, 1, 2

console.log('\n========== 基础语法示例结束 ==========\n');
