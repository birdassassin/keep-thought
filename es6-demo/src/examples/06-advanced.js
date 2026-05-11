/**
 * ES6+ 高级特性示例
 * 
 * 本文件涵盖：
 * - 迭代器
 * - 生成器
 * - Map/Set
 * - WeakMap/WeakSet
 * - 私有字段
 */

console.log('========== ES6+ 高级特性示例 ==========\n');

// ============================================
// 一、迭代器（Iterator）
// ============================================

console.log('--- 一、迭代器 ---\n');

console.log('1. 什么是迭代器：');

console.log('   迭代器是一个对象，定义了如何遍历集合');
console.log('   它实现了 Iterator 接口：拥有 next() 方法');
console.log('   next() 返回 { value: any, done: boolean }');

console.log('\n2. 手动创建迭代器：');

// 创建一个简单的迭代器
function createIterator(arr) {
    let index = 0;
    
    return {
        next() {
            if (index < arr.length) {
                return { value: arr[index++], done: false };
            }
            return { value: undefined, done: true };
        }
    };
}

const iterator = createIterator([1, 2, 3]);
console.log('   iterator.next():', iterator.next()); // { value: 1, done: false }
console.log('   iterator.next():', iterator.next()); // { value: 2, done: false }
console.log('   iterator.next():', iterator.next()); // { value: 3, done: false }
console.log('   iterator.next():', iterator.next()); // { value: undefined, done: true }

console.log('\n3. 可迭代对象（Iterable）：');

// 可迭代对象实现了 Symbol.iterator 方法
const iterableObj = {
    data: ['a', 'b', 'c'],
    
    [Symbol.iterator]() {
        let index = 0;
        const data = this.data;
        
        return {
            next() {
                if (index < data.length) {
                    return { value: data[index++], done: false };
                }
                return { done: true };
            }
        };
    }
};

console.log('   使用 for...of 遍历:');
for (const item of iterableObj) {
    console.log('     ', item);
}

// 使用展开运算符
console.log('   展开运算符:', [...iterableObj]);

// 使用 Array.from
console.log('   Array.from:', Array.from(iterableObj));

console.log('\n4. 内置可迭代对象：');

// 数组、字符串、Map、Set、arguments 等都是可迭代的
console.log('   数组迭代:');
for (const num of [1, 2, 3]) {
    console.log('     ', num);
}

console.log('   字符串迭代:');
for (const char of 'Hello') {
    console.log('     ', char);
}

console.log('\n5. 迭代器协议：');

// 完整的迭代器还支持 return 和 throw 方法
const advancedIterable = {
    data: [1, 2, 3, 4, 5],
    
    [Symbol.iterator]() {
        let index = 0;
        const data = this.data;
        
        return {
            next() {
                if (index < data.length) {
                    return { value: data[index++], done: false };
                }
                return { done: true };
            },
            
            // 当迭代提前终止时调用（如 break、return）
            return() {
                console.log('   迭代器提前终止');
                return { done: true };
            }
        };
    }
};

console.log('   提前终止迭代:');
for (const num of advancedIterable) {
    console.log('     ', num);
    if (num === 2) break;
}

// ============================================
// 二、生成器（Generator）
// ============================================

console.log('\n--- 二、生成器 ---\n');

console.log('1. 生成器函数基础：');

// 生成器函数使用 function* 声明
function* simpleGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = simpleGenerator();
console.log('   gen.next():', gen.next()); // { value: 1, done: false }
console.log('   gen.next():', gen.next()); // { value: 2, done: false }
console.log('   gen.next():', gen.next()); // { value: 3, done: false }
console.log('   gen.next():', gen.next()); // { value: undefined, done: true }

console.log('\n2. 生成器是可迭代的：');

function* numberGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

console.log('   for...of 遍历生成器:');
for (const num of numberGenerator()) {
    console.log('     ', num);
}

console.log('\n3. yield 表达式：');

function* yieldExpression() {
    const a = yield '第一个值';
    console.log('   接收到的 a:', a);
    
    const b = yield '第二个值';
    console.log('   接收到的 b:', b);
    
    return '结束';
}

const exprGen = yieldExpression();
console.log('   第一次 next():', exprGen.next());        // { value: '第一个值', done: false }
console.log('   第二次 next(100):', exprGen.next(100));  // 接收 100 作为 yield 的返回值
console.log('   第三次 next(200):', exprGen.next(200));  // 接收 200 作为 yield 的返回值

console.log('\n4. yield* 委托：');

// yield* 用于委托给另一个生成器或可迭代对象
function* innerGenerator() {
    yield '内部1';
    yield '内部2';
}

function* outerGenerator() {
    yield '外部开始';
    yield* innerGenerator(); // 委托给内部生成器
    yield* [4, 5, 6];        // 委托给数组
    yield '外部结束';
}

console.log('   yield* 委托:');
for (const value of outerGenerator()) {
    console.log('     ', value);
}

console.log('\n5. 生成器作为迭代器工厂：');

// 创建无限序列
function* idGenerator() {
    let id = 1;
    while (true) {
        yield id++;
    }
}

const ids = idGenerator();
console.log('   无限 ID 生成器:');
console.log('     ', ids.next().value);
console.log('     ', ids.next().value);
console.log('     ', ids.next().value);

// 斐波那契数列
function* fibonacciGenerator() {
    let [prev, curr] = [0, 1];
    while (true) {
        yield curr;
        [prev, curr] = [curr, prev + curr];
    }
}

const fib = fibonacciGenerator();
console.log('   斐波那契数列:');
for (let i = 0; i < 10; i++) {
    console.log('     ', fib.next().value);
}

console.log('\n6. 生成器的 return 和 throw：');

function* returnableGenerator() {
    try {
        yield 1;
        yield 2;
        yield 3;
    } catch (e) {
        console.log('   捕获错误:', e);
        yield '错误后继续';
    }
}

const retGen = returnableGenerator();
console.log('   next():', retGen.next());
console.log('   return("提前结束"):', retGen.return('提前结束'));
console.log('   next():', retGen.next()); // 迭代已结束

const throwGen = returnableGenerator();
console.log('   next():', throwGen.next());
console.log('   throw(new Error("测试")):', throwGen.throw(new Error('测试')));

console.log('\n7. 异步生成器：');

// 异步生成器使用 async function*
async function* asyncGenerator() {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    yield '开始';
    await delay(100);
    yield '100ms 后';
    await delay(100);
    yield '200ms 后';
}

// 使用 for await...of 遍历
(async () => {
    console.log('   异步生成器:');
    for await (const value of asyncGenerator()) {
        console.log('     ', value);
    }
})();

console.log('\n8. 生成器实现异步流程控制：');

// 模拟旧式的异步流程控制（async/await 出现之前）
function* asyncFlow() {
    try {
        const user = yield fetchUser(1);
        console.log('   用户:', user);
        
        const posts = yield fetchPosts(user.id);
        console.log('   文章:', posts);
        
        return '完成';
    } catch (error) {
        console.log('   错误:', error.message);
    }
}

function fetchUser(id) {
    return new Promise(resolve => {
        setTimeout(() => resolve({ id, name: '张三' }), 100);
    });
}

function fetchPosts(userId) {
    return new Promise(resolve => {
        setTimeout(() => resolve(['文章1', '文章2']), 100);
    });
}

// 运行生成器
function runGenerator(genFn) {
    const gen = genFn();
    
    function handle(result) {
        if (result.done) return Promise.resolve(result.value);
        
        return Promise.resolve(result.value)
            .then(data => handle(gen.next(data)))
            .catch(error => handle(gen.throw(error)));
    }
    
    return handle(gen.next());
}

setTimeout(() => {
    runGenerator(asyncFlow);
}, 500);

// ============================================
// 三、Map 和 Set
// ============================================

console.log('\n--- 三、Map 和 Set ---\n');

console.log('1. Map 基础：');

// Map 是键值对集合，键可以是任意类型
const map = new Map();

// 设置值
map.set('name', '张三');
map.set(1, '数字键');
map.set(true, '布尔键');
map.set({ key: 'object' }, '对象键');

console.log('   map.size:', map.size);
console.log('   map.get("name"):', map.get('name'));
console.log('   map.get(1):', map.get(1));
console.log('   map.has("name"):', map.has('name'));

// 删除
map.delete(true);
console.log('   删除后 map.has(true):', map.has(true));

console.log('\n2. Map 迭代：');

const userMap = new Map([
    ['id', 1],
    ['name', '李四'],
    ['age', 25]
]);

console.log('   for...of 遍历:');
for (const [key, value] of userMap) {
    console.log(`     ${key}: ${value}`);
}

console.log('   keys():', [...userMap.keys()]);
console.log('   values():', [...userMap.values()]);
console.log('   entries():', [...userMap.entries()]);

// forEach
console.log('   forEach:');
userMap.forEach((value, key) => {
    console.log(`     ${key} => ${value}`);
});

console.log('\n3. Map 与 Object 的区别：');

console.log('   Map:');
console.log('   - 键可以是任意类型');
console.log('   - 有 size 属性');
console.log('   - 可直接迭代');
console.log('   - 频繁增删键值对性能更好');

console.log('\n   Object:');
console.log('   - 键只能是字符串或 Symbol');
console.log('   - 无 size 属性');
console.log('   - 需要转换才能迭代');
console.log('   - 适合存储固定结构的数据');

console.log('\n4. Set 基础：');

// Set 是值的集合，值唯一
const set = new Set();

set.add(1);
set.add(2);
set.add(2); // 重复值不会被添加
set.add('hello');
set.add({ x: 1 });

console.log('   set.size:', set.size);
console.log('   set.has(1):', set.has(1));
console.log('   set.has(3):', set.has(3));

// 数组去重
const unique = [...new Set([1, 2, 2, 3, 3, 3])];
console.log('   数组去重:', unique);

console.log('\n5. Set 迭代：');

const letterSet = new Set(['a', 'b', 'c']);

console.log('   for...of:');
for (const letter of letterSet) {
    console.log('     ', letter);
}

console.log('   keys():', [...letterSet.keys()]);
console.log('   values():', [...letterSet.values()]); // 与 keys() 相同

console.log('\n6. Set 操作：');

const setA = new Set([1, 2, 3]);
const setB = new Set([2, 3, 4]);

// 并集
const union = new Set([...setA, ...setB]);
console.log('   并集:', [...union]);

// 交集
const intersection = new Set([...setA].filter(x => setB.has(x)));
console.log('   交集:', [...intersection]);

// 差集
const difference = new Set([...setA].filter(x => !setB.has(x)));
console.log('   差集 (A - B):', [...difference]);

// ============================================
// 四、WeakMap 和 WeakSet
// ============================================

console.log('\n--- 四、WeakMap 和 WeakSet ---\n');

console.log('1. WeakMap 特点：');

console.log('   - 键必须是对象');
console.log('   - 键是弱引用，不阻止垃圾回收');
console.log('   - 不可迭代（无 keys/values/entries/size）');
console.log('   - 适合存储对象关联数据');

console.log('\n2. WeakMap 使用场景：');

const weakMap = new WeakMap();

let obj1 = { id: 1 };
let obj2 = { id: 2 };

weakMap.set(obj1, '对象1的数据');
weakMap.set(obj2, { metadata: '对象2的元数据' });

console.log('   weakMap.get(obj1):', weakMap.get(obj1));
console.log('   weakMap.has(obj2):', weakMap.has(obj2));

// 模拟私有数据存储
const privateData = new WeakMap();

class PersonWithPrivate {
    constructor(name, secret) {
        this.name = name;
        privateData.set(this, { secret });
    }
    
    getSecret() {
        return privateData.get(this).secret;
    }
}

const personWithPrivate = new PersonWithPrivate('王五', '我的秘密');
console.log('   私有数据:', personWithPrivate.getSecret());
console.log('   公开属性:', personWithPrivate.name);

console.log('\n3. WeakSet 特点：');

console.log('   - 值必须是对象');
console.log('   - 值是弱引用');
console.log('   - 不可迭代');
console.log('   - 适合标记对象');

console.log('\n4. WeakSet 使用场景：');

const activeUsers = new WeakSet();

let user1 = { name: '用户1' };
let user2 = { name: '用户2' };

activeUsers.add(user1);
activeUsers.add(user2);

console.log('   user1 是否活跃:', activeUsers.has(user1));
console.log('   user2 是否活跃:', activeUsers.has(user2));

// 模拟对象标记
const processed = new WeakSet();

function processObject(obj) {
    if (processed.has(obj)) {
        console.log('   对象已处理过');
        return;
    }
    processed.add(obj);
    console.log('   处理对象:', obj.name);
}

processObject(user1);
processObject(user1); // 不会重复处理

// ============================================
// 五、私有字段（ES2022）
// ============================================

console.log('\n--- 五、私有字段（ES2022）---\n');

console.log('1. 私有字段语法：');

class BankAccount {
    // 私有字段以 # 开头
    #balance = 0;
    #pin;
    
    constructor(initialBalance, pin) {
        this.#balance = initialBalance;
        this.#pin = pin;
    }
    
    // 公共方法访问私有字段
    getBalance() {
        return this.#balance;
    }
    
    deposit(amount) {
        if (amount > 0) {
            this.#balance += amount;
            console.log(`   存入 ${amount}，余额: ${this.#balance}`);
        }
    }
    
    withdraw(amount, pin) {
        if (pin !== this.#pin) {
            console.log('   密码错误');
            return false;
        }
        if (amount > this.#balance) {
            console.log('   余额不足');
            return false;
        }
        this.#balance -= amount;
        console.log(`   取出 ${amount}，余额: ${this.#balance}`);
        return true;
    }
    
    // 私有方法
    #validateAmount(amount) {
        return amount > 0;
    }
}

const account = new BankAccount(1000, '1234');
console.log('   初始余额:', account.getBalance());
account.deposit(500);
account.withdraw(200, '1234');
account.withdraw(100, 'wrong'); // 密码错误

// account.#balance; // 语法错误！私有字段无法从外部访问

console.log('\n2. 私有静态字段：');

class Counter {
    // 私有静态字段
    static #count = 0;
    
    constructor() {
        Counter.#count++;
    }
    
    static getCount() {
        return Counter.#count;
    }
}

new Counter();
new Counter();
new Counter();
console.log('   创建的实例数:', Counter.getCount());

console.log('\n3. 私有字段与继承：');

class Animal {
    #name;
    
    constructor(name) {
        this.#name = name;
    }
    
    getName() {
        return this.#name;
    }
}

class Dog extends Animal {
    #breed;
    
    constructor(name, breed) {
        super(name);
        this.#breed = breed;
    }
    
    getInfo() {
        // 子类无法访问父类的私有字段
        // return `${this.#name} - ${this.#breed}`; // 错误！
        return `${this.getName()} - ${this.#breed}`;
    }
}

const dog = new Dog('旺财', '柴犬');
console.log('   狗狗信息:', dog.getInfo());

console.log('\n4. 私有字段的存在性检查：');

class OptionalPrivate {
    #data;
    
    hasData() {
        return #data in this;
    }
    
    setData(value) {
        this.#data = value;
    }
}

const opt = new OptionalPrivate();
console.log('   初始是否有 #data:', opt.hasData());
opt.setData('数据');
console.log('   设置后是否有 #data:', opt.hasData());

// ============================================
// 六、其他高级特性
// ============================================

console.log('\n--- 六、其他高级特性 ---\n');

console.log('1. 可选链操作符（?.）：');

const deepObj = {
    user: {
        address: {
            city: '北京'
        }
    }
};

// 传统方式
const cityOld = deepObj && deepObj.user && deepObj.user.address && deepObj.user.address.city;

// 可选链
const cityNew = deepObj?.user?.address?.city;
console.log('   可选链访问:', cityNew);

// 不存在的属性返回 undefined
const zipCode = deepObj?.user?.address?.zipCode;
console.log('   不存在的属性:', zipCode);

// 函数调用
const obj = {
    method: () => '方法结果'
};
console.log('   可选链调用方法:', obj.method?.());
console.log('   不存在的方法:', obj.nonExistent?.());

console.log('\n2. 空值合并操作符（??）：');

// 只在 null 或 undefined 时使用默认值
const value1 = null ?? '默认值';
const value2 = undefined ?? '默认值';
const value3 = '' ?? '默认值';
const value4 = 0 ?? '默认值';

console.log('   null ?? "默认值":', value1);
console.log('   undefined ?? "默认值":', value2);
console.log('   "" ?? "默认值":', value3);
console.log('   0 ?? "默认值":', value4);

// 与 || 的区别
console.log('   "" || "默认值":', '' || '默认值'); // "默认值"
console.log('   0 || "默认值":', 0 || '默认值');   // "默认值"

console.log('\n3. 逻辑赋值运算符：');

let a = null;
a ??= '新值';
console.log('   ??= (null 时赋值):', a);

let b = '原值';
b ??= '新值';
console.log('   ??= (有值时不赋值):', b);

let c = false;
c ||= true;
console.log('   ||= (falsy 时赋值):', c);

let d = true;
d &&= false;
console.log('   &&= (truthy 时赋值):', d);

console.log('\n4. 数字分隔符：');

const largeNumber = 1_000_000_000;
const binary = 0b1010_1010;
const hex = 0xFF_FF;
const decimal = 3.141_592_653;

console.log('   大数字:', largeNumber);
console.log('   二进制:', binary);
console.log('   十六进制:', hex);
console.log('   小数:', decimal);

console.log('\n5. BigInt：');

// BigInt 用于表示大于 Number.MAX_SAFE_INTEGER 的整数
const bigNum = 9007199254740993n; // 后缀 n
const bigNum2 = BigInt('9007199254740994');

console.log('   BigInt:', bigNum);
console.log('   BigInt 运算:', bigNum + 1n);

// 注意：BigInt 不能与普通数字混合运算
// bigNum + 1; // TypeError

console.log('\n6. Array.prototype.at()：');

const arr = ['a', 'b', 'c', 'd', 'e'];

console.log('   arr.at(0):', arr.at(0));   // 第一个元素
console.log('   arr.at(-1):', arr.at(-1)); // 最后一个元素
console.log('   arr.at(-2):', arr.at(-2)); // 倒数第二个

console.log('\n========== 高级特性示例结束 ==========\n');
