/**
 * ES6+ 对象与解构示例
 * 
 * 本文件涵盖：
 * - 对象字面量增强
 * - 解构赋值
 * - Object 新方法
 * - Symbol
 * - Proxy/Reflect
 */

console.log('========== ES6+ 对象与解构示例 ==========\n');

// ============================================
// 一、对象字面量增强
// ============================================

console.log('--- 一、对象字面量增强 ---\n');

console.log('1. 属性简写：');

// ES5 写法
const nameES5 = '张三';
const ageES5 = 25;
const personES5 = {
    name: nameES5,
    age: ageES5
};
console.log('   ES5 写法:', personES5);

// ES6 属性简写
const name = '张三';
const age = 25;
const person = { name, age };
console.log('   ES6 简写:', person);

console.log('\n2. 方法简写：');

// ES5 写法
const objES5 = {
    sayHello: function() {
        return 'Hello ES5';
    }
};

// ES6 方法简写
const obj = {
    sayHello() {
        return 'Hello ES6';
    },
    // 箭头函数方法（注意 this 绑定）
    sayHi: () => 'Hi'
};

console.log('   ES5 方法:', objES5.sayHello());
console.log('   ES6 方法:', obj.sayHello());
console.log('   箭头方法:', obj.sayHi());

console.log('\n3. 计算属性名：');

const propKey = 'dynamic';
const index = 1;

const computedObj = {
    // 使用变量作为属性名
    [propKey]: '动态属性值',
    // 使用表达式
    ['key' + index]: 'key1 的值',
    // 使用表达式计算
    [propKey.toUpperCase()]: '大写属性名',
    // 方法也可以使用计算属性名
    ['method' + index]() {
        return '动态方法';
    }
};

console.log('   computedObj:', computedObj);
console.log('   computedObj.dynamic:', computedObj.dynamic);
console.log('   computedObj.key1:', computedObj.key1);
console.log('   computedObj.DYNAMIC:', computedObj.DYNAMIC);
console.log('   computedObj.method1():', computedObj.method1());

console.log('\n4. Getter 和 Setter：');

const user = {
    _firstName: '',
    _lastName: '',
    
    // getter
    get fullName() {
        return `${this._firstName} ${this._lastName}`;
    },
    
    // setter
    set fullName(value) {
        const [first, last] = value.split(' ');
        this._firstName = first || '';
        this._lastName = last || '';
    },
    
    // 单独的 setter
    set firstName(value) {
        this._firstName = value;
    },
    
    get firstName() {
        return this._firstName;
    }
};

user.fullName = '张 三';
console.log('   fullName:', user.fullName);
user.firstName = '李';
console.log('   firstName:', user.firstName);

// ============================================
// 二、解构赋值
// ============================================

console.log('\n--- 二、解构赋值 ---\n');

console.log('1. 对象解构基本用法：');

const student = {
    studentName: '王五',
    studentAge: 20,
    grade: '大三'
};

// 基本解构
const { studentName, studentAge } = student;
console.log('   studentName:', studentName);
console.log('   studentAge:', studentAge);

console.log('\n2. 重命名变量：');

// 使用冒号重命名
const { studentName: sName, studentAge: sAge } = student;
console.log('   sName:', sName);
console.log('   sAge:', sAge);

console.log('\n3. 默认值：');

// 解构时设置默认值
const { grade, major = '计算机科学' } = student;
console.log('   grade:', grade);
console.log('   major:', major);

// undefined 时使用默认值
const { gender = '男' } = { gender: undefined };
console.log('   gender (undefined):', gender);

// null 不触发默认值
const { city = '北京' } = { city: null };
console.log('   city (null):', city);

console.log('\n4. 嵌套解构：');

const company = {
    name: '科技公司',
    address: {
        city: '上海',
        district: '浦东新区'
    },
    employees: [
        { empName: '员工1', position: '工程师' },
        { empName: '员工2', position: '设计师' }
    ]
};

const { 
    address: { city: companyCity, district },
    employees: [firstEmployee, secondEmployee]
} = company;

console.log('   companyCity:', companyCity);
console.log('   district:', district);
console.log('   firstEmployee:', firstEmployee);

console.log('\n5. 数组解构：');

const colors = ['红', '绿', '蓝', '黄'];

// 基本解构
const [red, green, blue] = colors;
console.log('   red:', red);
console.log('   green:', green);
console.log('   blue:', blue);

// 跳过元素
const [, , third] = colors;
console.log('   third:', third);

// rest 元素
const [firstColor, ...restColors] = colors;
console.log('   firstColor:', firstColor);
console.log('   restColors:', restColors);

console.log('\n6. 默认值与 rest：');

const [a = 1, b = 2, c = 3, d = 4] = [10, 20];
console.log('   a:', a, 'b:', b, 'c:', c, 'd:', d);

console.log('\n7. 函数参数解构：');

// 对象参数解构
function printUserInfo({ name, age, city = '未知' } = {}) {
    console.log(`   姓名: ${name}, 年龄: ${age}, 城市: ${city}`);
}

printUserInfo({ name: '赵六', age: 28 });
printUserInfo({ name: '钱七' });

// 数组参数解构
function printCoordinates([x, y, z = 0]) {
    console.log(`   坐标: (${x}, ${y}, ${z})`);
}

printCoordinates([1, 2, 3]);
printCoordinates([1, 2]);

console.log('\n8. 交换变量：');

let x = 10;
let y = 20;
console.log('   交换前: x =', x, ', y =', y);

// 使用解构交换变量
[x, y] = [y, x];
console.log('   交换后: x =', x, ', y =', y);

// ============================================
// 三、Object 新方法
// ============================================

console.log('\n--- 三、Object 新方法 ---\n');

console.log('1. Object.keys() / values() / entries()：');

const book = {
    title: 'JavaScript 高级程序设计',
    author: 'Nicholas C. Zakas',
    year: 2020
};

// 获取所有键
console.log('   Object.keys:', Object.keys(book));

// 获取所有值（ES2017）
console.log('   Object.values:', Object.values(book));

// 获取键值对数组（ES2017）
console.log('   Object.entries:', Object.entries(book));

console.log('\n2. Object.fromEntries()：');

// 将键值对数组转回对象（ES2019）
const entries = [['a', 1], ['b', 2], ['c', 3]];
const fromEntries = Object.fromEntries(entries);
console.log('   Object.fromEntries:', fromEntries);

// 实际应用：过滤对象属性
const filtered = Object.fromEntries(
    Object.entries(book).filter(([key, value]) => key !== 'year')
);
console.log('   过滤后:', filtered);

console.log('\n3. Object.assign()：');

// 合并对象
const target = { a: 1, b: 2 };
const source = { b: 3, c: 4 };
const assigned = Object.assign({}, target, source);
console.log('   Object.assign:', assigned);

// 注意：Object.assign 是浅拷贝
const deepObj = { inner: { value: 1 } };
const shallowCopy = Object.assign({}, deepObj);
shallowCopy.inner.value = 100;
console.log('   原对象受影响:', deepObj.inner.value);

// 使用展开运算符更简洁
const spreadObj = { ...target, ...source };
console.log('   展开运算符:', spreadObj);

console.log('\n4. Object.freeze() 和 Object.seal()：');

// Object.freeze：完全冻结对象
const frozen = Object.freeze({ x: 1, y: 2 });
// frozen.x = 100; // 静默失败或报错
// frozen.z = 3;   // 无法添加新属性
console.log('   冻结对象:', frozen);

// Object.seal：密封对象（可修改现有属性，但不能添加/删除）
const sealed = Object.seal({ a: 1, b: 2 });
sealed.a = 100; // 可以修改
// delete sealed.a; // 无法删除
// sealed.c = 3;    // 无法添加
console.log('   密封对象:', sealed);

console.log('\n5. Object.getOwnPropertyDescriptors()：');

const descriptorObj = {
    get value() { return this._value; },
    set value(v) { this._value = v; },
    _value: 10
};

const descriptors = Object.getOwnPropertyDescriptors(descriptorObj);
console.log('   属性描述符:');
console.log('   ', descriptors);

console.log('\n6. Object.defineProperty() 和 defineProperties()：');

const definedObj = {};

// 定义单个属性
Object.defineProperty(definedObj, 'name', {
    value: '定义的属性',
    writable: false,      // 不可写
    enumerable: true,     // 可枚举
    configurable: false   // 不可配置
});

console.log('   name:', definedObj.name);
// definedObj.name = '新值'; // 无法修改

// 定义多个属性
Object.defineProperties(definedObj, {
    age: {
        value: 25,
        writable: true
    },
    id: {
        get() { return this._id; },
        set(value) { this._id = value; }
    }
});

definedObj.id = '001';
console.log('   id:', definedObj.id);

// ============================================
// 四、Symbol
// ============================================

console.log('\n--- 四、Symbol ---\n');

console.log('1. Symbol 基本用法：');

// 创建 Symbol
const sym1 = Symbol();
const sym2 = Symbol('description'); // 带描述的 Symbol

console.log('   Symbol():', sym1);
console.log('   Symbol("description"):', sym2);
console.log('   sym2.description:', sym2.description);

// 每个 Symbol 都是唯一的
const sym3 = Symbol('description');
console.log('   sym2 === sym3:', sym2 === sym3); // false

console.log('\n2. Symbol 作为属性键：');

const symKey = Symbol('secret');

const symObj = {
    [symKey]: '这是 Symbol 属性',
    normalProp: '普通属性'
};

console.log('   普通属性:', symObj.normalProp);
console.log('   Symbol 属性:', symObj[symKey]);

// Symbol 属性不会出现在常规枚举中
console.log('   Object.keys:', Object.keys(symObj));
console.log('   for...in:', []);
for (let key in symObj) {
    console.log('     ' + key);
}

// 获取 Symbol 属性
console.log('   Object.getOwnPropertySymbols:', Object.getOwnPropertySymbols(symObj));

console.log('\n3. Symbol.for() 和 Symbol.keyFor()：');

// Symbol.for 在全局注册表中查找或创建
const globalSym1 = Symbol.for('app.id');
const globalSym2 = Symbol.for('app.id');
console.log('   globalSym1 === globalSym2:', globalSym1 === globalSym2); // true

// Symbol.keyFor 获取全局 Symbol 的 key
console.log('   Symbol.keyFor(globalSym1):', Symbol.keyFor(globalSym1));
console.log('   Symbol.keyFor(sym1):', Symbol.keyFor(sym1)); // undefined（非全局）

console.log('\n4. 内置 Symbol：');

// Symbol.iterator
const iterableObj = {
    data: [1, 2, 3],
    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.data.length) {
                    return { value: this.data[index++], done: false };
                }
                return { done: true };
            }
        };
    }
};

console.log('   自定义迭代器:');
for (const item of iterableObj) {
    console.log('     ' + item);
}

// Symbol.toStringTag
class CustomClass {
    get [Symbol.toStringTag]() {
        return 'CustomClass';
    }
}
console.log('   toString:', Object.prototype.toString.call(new CustomClass()));

// Symbol.toPrimitive
const toPrimitiveObj = {
    [Symbol.toPrimitive](hint) {
        console.log('   hint:', hint);
        if (hint === 'number') return 42;
        if (hint === 'string') return 'custom string';
        return true;
    }
};

console.log('   +toPrimitiveObj:', +toPrimitiveObj);
console.log('   String(toPrimitiveObj):', String(toPrimitiveObj));
console.log('   toPrimitiveObj + "":', toPrimitiveObj + '');

// ============================================
// 五、Proxy 和 Reflect
// ============================================

console.log('\n--- 五、Proxy 和 Reflect ---\n');

console.log('1. Proxy 基本用法：');

const targetObj = {
    name: '目标对象',
    value: 100
};

// 创建代理
const proxy = new Proxy(targetObj, {
    // 拦截属性读取
    get(target, prop, receiver) {
        console.log(`   读取属性: ${prop}`);
        return Reflect.get(target, prop, receiver);
    },
    
    // 拦截属性设置
    set(target, prop, value, receiver) {
        console.log(`   设置属性: ${prop} = ${value}`);
        return Reflect.set(target, prop, value, receiver);
    },
    
    // 拦截属性检查
    has(target, prop) {
        console.log(`   检查属性: ${prop}`);
        return Reflect.has(target, prop);
    }
});

proxy.name;        // 触发 get
proxy.value = 200; // 触发 set
console.log('   "name" in proxy:', 'name' in proxy); // 触发 has

console.log('\n2. 常用拦截操作：');

const reactiveObj = { count: 0 };

const reactive = new Proxy(reactiveObj, {
    // 拦截删除属性
    deleteProperty(target, prop) {
        console.log(`   删除属性: ${prop}`);
        return Reflect.deleteProperty(target, prop);
    },
    
    // 拦截 Object.keys 等
    ownKeys(target) {
        console.log('   获取属性列表');
        return Reflect.ownKeys(target);
    },
    
    // 拦截属性描述符获取
    getOwnPropertyDescriptor(target, prop) {
        console.log(`   获取属性描述符: ${prop}`);
        return Reflect.getOwnPropertyDescriptor(target, prop);
    }
});

reactive.newProp = '新属性';
delete reactive.newProp;
console.log('   Object.keys:', Object.keys(reactive));

console.log('\n3. 实现响应式对象：');

function createReactive(target) {
    return new Proxy(target, {
        get(target, prop, receiver) {
            const result = Reflect.get(target, prop, receiver);
            console.log(`   [GET] ${String(prop)}: ${result}`);
            return result;
        },
        
        set(target, prop, value, receiver) {
            const oldValue = Reflect.get(target, prop, receiver);
            const result = Reflect.set(target, prop, value, receiver);
            if (result && oldValue !== value) {
                console.log(`   [SET] ${String(prop)}: ${oldValue} -> ${value}`);
            }
            return result;
        }
    });
}

const state = createReactive({ 
    username: '', 
    isLoggedIn: false 
});

state.username = '张三';
state.isLoggedIn = true;
console.log('   当前用户:', state.username);

console.log('\n4. Reflect API：');

const reflectTarget = { x: 1, y: 2 };

// Reflect 提供与 Proxy handler 对应的方法
console.log('   Reflect.get:', Reflect.get(reflectTarget, 'x'));
console.log('   Reflect.set:', Reflect.set(reflectTarget, 'x', 100));
console.log('   Reflect.has:', Reflect.has(reflectTarget, 'y'));
console.log('   Reflect.ownKeys:', Reflect.ownKeys(reflectTarget));

// Reflect.apply 调用函数
function greet(greeting, name) {
    return `${greeting}, ${name}!`;
}
console.log('   Reflect.apply:', Reflect.apply(greet, null, ['你好', '世界']));

// Reflect.construct 调用构造函数
class Person {
    constructor(name) {
        this.name = name;
    }
}
const person = Reflect.construct(Person, ['张三']);
console.log('   Reflect.construct:', person);

console.log('\n5. 可撤销代理：');

const { proxy: revocableProxy, revoke } = Proxy.revocable(
    { secret: '机密数据' },
    {
        get(target, prop) {
            return target[prop];
        }
    }
);

console.log('   代理访问:', revocableProxy.secret);
revoke(); // 撤销代理
// revocableProxy.secret; // 报错！TypeError

console.log('   代理已撤销');

console.log('\n6. 实际应用：验证代理：');

const validator = {
    set(target, prop, value) {
        if (prop === 'age') {
            if (!Number.isInteger(value)) {
                throw new TypeError('年龄必须是整数');
            }
            if (value < 0 || value > 150) {
                throw new RangeError('年龄必须在 0-150 之间');
            }
        }
        if (prop === 'email') {
            if (!/@/.test(value)) {
                throw new Error('邮箱格式不正确');
            }
        }
        return Reflect.set(target, prop, value);
    }
};

const validatedUser = new Proxy({}, validator);
validatedUser.age = 25;
validatedUser.email = 'test@example.com';
console.log('   验证后的用户:', validatedUser);

try {
    validatedUser.age = -5;
} catch (e) {
    console.log('   错误:', e.message);
}

console.log('\n========== 对象与解构示例结束 ==========\n');
