/**
 * ES6+ 异步编程示例
 * 
 * 本文件涵盖：
 * - Promise 基础
 * - Promise.all / race / allSettled / any
 * - async/await
 * - 事件循环
 */

console.log('========== ES6+ 异步编程示例 ==========\n');

// ============================================
// 一、Promise 基础
// ============================================

console.log('--- 一、Promise 基础 ---\n');

console.log('1. 创建 Promise：');

// 基本创建方式
const promise1 = new Promise((resolve, reject) => {
    // 模拟异步操作
    setTimeout(() => {
        const success = true;
        if (success) {
            resolve('操作成功！');
        } else {
            reject(new Error('操作失败'));
        }
    }, 100);
});

promise1.then(
    result => console.log('   resolve:', result),
    error => console.log('   reject:', error.message)
);

console.log('   Promise 已创建（异步执行中...）');

console.log('\n2. Promise 的三种状态：');

// Pending（进行中）
const pendingPromise = new Promise(() => {});
console.log('   pending 状态:', pendingPromise); // Promise { <pending> }

// Fulfilled（已成功）
const fulfilledPromise = Promise.resolve('成功值');
console.log('   fulfilled 状态:', fulfilledPromise);

// Rejected（已失败）
const rejectedPromise = Promise.reject('失败原因');
rejectedPromise.catch(() => {}); // 捕获以避免未处理的 rejection
console.log('   rejected 状态:', rejectedPromise);

console.log('\n3. Promise.then() 链式调用：');

Promise.resolve(1)
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

console.log('\n4. 错误处理：');

// 使用 catch 捕获错误
Promise.reject(new Error('出错了'))
    .then(value => {
        console.log('   不会执行');
    })
    .catch(error => {
        console.log('   捕获错误:', error.message);
    })
    .finally(() => {
        console.log('   finally 总是执行');
    });

console.log('\n5. Promise 静态方法：');

// Promise.resolve
const resolved = Promise.resolve('立即解决的 Promise');
resolved.then(v => console.log('   Promise.resolve:', v));

// Promise.reject
const rejected = Promise.reject('立即拒绝的 Promise');
rejected.catch(e => console.log('   Promise.reject:', e));

// ============================================
// 二、Promise 组合方法
// ============================================

console.log('\n--- 二、Promise 组合方法 ---\n');

console.log('1. Promise.all()：');

// 等待所有 Promise 完成，任一失败则整体失败
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = new Promise(resolve => setTimeout(() => resolve(3), 100));

Promise.all([p1, p2, p3])
    .then(results => {
        console.log('   Promise.all 成功:', results);
    });

// 任一失败的情况
const failP1 = Promise.resolve(1);
const failP2 = Promise.reject('失败');
const failP3 = Promise.resolve(3);

Promise.all([failP1, failP2, failP3])
    .catch(error => {
        console.log('   Promise.all 失败:', error);
    });

console.log('\n2. Promise.race()：');

// 返回最先完成的 Promise（无论成功或失败）
const raceP1 = new Promise(resolve => setTimeout(() => resolve('慢'), 200));
const raceP2 = new Promise(resolve => setTimeout(() => resolve('快'), 100));

Promise.race([raceP1, raceP2])
    .then(result => {
        console.log('   Promise.race 结果:', result);
    });

console.log('\n3. Promise.allSettled()（ES2020）：');

// 等待所有 Promise 完成，无论成功或失败
const settledP1 = Promise.resolve('成功');
const settledP2 = Promise.reject('失败');
const settledP3 = Promise.resolve('另一个成功');

Promise.allSettled([settledP1, settledP2, settledP3])
    .then(results => {
        console.log('   Promise.allSettled 结果:');
        results.forEach((result, i) => {
            console.log(`     [${i}] status: ${result.status}, value/reason: ${result.value || result.reason}`);
        });
    });

console.log('\n4. Promise.any()（ES2021）：');

// 返回第一个成功的 Promise，全部失败才失败
const anyP1 = Promise.reject('失败1');
const anyP2 = new Promise(resolve => setTimeout(() => resolve('成功'), 100));
const anyP3 = Promise.reject('失败2');

Promise.any([anyP1, anyP2, anyP3])
    .then(result => {
        console.log('   Promise.any 第一个成功:', result);
    })
    .catch(error => {
        console.log('   Promise.all 全部失败:', error.errors);
    });

console.log('\n5. 实际应用示例：');

// 模拟 API 请求
function fetchUser(id) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (id > 0) {
                resolve({ id, name: `用户${id}` });
            } else {
                reject(new Error('无效的用户ID'));
            }
        }, Math.random() * 200);
    });
}

// 并行请求多个用户
console.log('   并行请求用户数据...');
Promise.all([
    fetchUser(1),
    fetchUser(2),
    fetchUser(3)
]).then(users => {
    console.log('   所有用户:', users);
});

// ============================================
// 三、async/await
// ============================================

console.log('\n--- 三、async/await ---\n');

console.log('1. async 函数基础：');

// async 函数返回 Promise
async function asyncFunc() {
    return 'async 函数返回值';
}

asyncFunc().then(result => {
    console.log('   async 函数结果:', result);
});

// 等价于
function promiseFunc() {
    return Promise.resolve('Promise 函数返回值');
}

console.log('\n2. await 等待 Promise：');

// 模拟异步操作
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function awaitDemo() {
    console.log('   开始执行...');
    
    await delay(100);
    console.log('   等待 100ms 后');
    
    await delay(100);
    console.log('   又等待 100ms 后');
    
    return '完成';
}

awaitDemo().then(result => {
    console.log('   ', result);
});

console.log('\n3. 错误处理：');

async function errorHandling() {
    try {
        const result = await Promise.reject(new Error('await 错误'));
        console.log('   不会执行');
    } catch (error) {
        console.log('   捕获错误:', error.message);
    }
}

errorHandling();

console.log('\n4. 并行执行：');

async function parallelDemo() {
    console.log('   并行执行多个 Promise...');
    const start = Date.now();
    
    // 错误方式：串行等待
    // const a = await delay(100);
    // const b = await delay(100);
    // const c = await delay(100);
    
    // 正确方式：并行执行
    const [a, b, c] = await Promise.all([
        delay(100).then(() => 'A'),
        delay(100).then(() => 'B'),
        delay(100).then(() => 'C')
    ]);
    
    const elapsed = Date.now() - start;
    console.log(`   结果: ${a}, ${b}, ${c}`);
    console.log(`   耗时: ${elapsed}ms（应该约100ms）`);
}

parallelDemo();

console.log('\n5. 实际应用：模拟 API 调用：');

// 模拟 API
const api = {
    getUser: (id) => new Promise(resolve => 
        setTimeout(() => resolve({ id, name: `用户${id}` }), 100)
    ),
    getPosts: (userId) => new Promise(resolve => 
        setTimeout(() => resolve([`文章1`, `文章2`]), 100)
    ),
    getComments: (postId) => new Promise(resolve => 
        setTimeout(() => resolve([`评论1`, `评论2`]), 100)
    )
};

async function fetchUserData(userId) {
    try {
        console.log(`   获取用户 ${userId} 的数据...`);
        
        // 获取用户信息
        const user = await api.getUser(userId);
        console.log('   用户:', user);
        
        // 获取用户的文章
        const posts = await api.getPosts(user.id);
        console.log('   文章:', posts);
        
        // 获取文章的评论
        const comments = await api.getComments(posts[0]);
        console.log('   评论:', comments);
        
        return { user, posts, comments };
    } catch (error) {
        console.log('   错误:', error.message);
    }
}

// 延迟执行以观察输出
setTimeout(() => {
    fetchUserData(1);
}, 500);

console.log('\n6. async/await 与循环：');

async function processItems() {
    const items = [1, 2, 3, 4, 5];
    
    // 串行处理
    console.log('   串行处理:');
    for (const item of items) {
        await delay(50);
        console.log(`     处理项目 ${item}`);
    }
    
    // 并行处理
    console.log('   并行处理:');
    await Promise.all(items.map(async (item) => {
        await delay(50);
        console.log(`     处理项目 ${item}`);
    }));
}

setTimeout(() => {
    processItems();
}, 1000);

// ============================================
// 四、事件循环
// ============================================

console.log('\n--- 四、事件循环 ---\n');

console.log('1. 宏任务与微任务：');

console.log('   1. 同步代码开始');

setTimeout(() => {
    console.log('   4. setTimeout（宏任务）');
}, 0);

Promise.resolve()
    .then(() => {
        console.log('   3. Promise.then（微任务）');
    });

console.log('   2. 同步代码结束');

console.log('\n2. 事件循环执行顺序：');

async function eventLoopDemo() {
    console.log('   1. async 函数开始');
    
    await Promise.resolve();
    console.log('   3. await 后的代码（微任务）');
    
    console.log('   4. async 函数结束');
}

console.log('   0. 调用 async 函数前');
eventLoopDemo();
console.log('   2. 调用 async 函数后');

setTimeout(() => {
    console.log('   5. setTimeout（宏任务）');
}, 0);

console.log('\n3. 微任务队列优先级：');

Promise.resolve()
    .then(() => console.log('   微任务 1'))
    .then(() => console.log('   微任务 2'));

Promise.resolve()
    .then(() => console.log('   微任务 3'));

console.log('   同步代码');

console.log('\n4. 实际案例：理解执行顺序');

console.log('   开始');

setTimeout(() => console.log('   setTimeout 1'), 0);

Promise.resolve()
    .then(() => console.log('   Promise 1'))
    .then(() => {
        console.log('   Promise 2');
        setTimeout(() => console.log('   setTimeout 2（在 Promise 内）'), 0);
    });

Promise.resolve().then(() => console.log('   Promise 3'));

console.log('   结束');

// ============================================
// 五、异步编程最佳实践
// ============================================

console.log('\n--- 五、异步编程最佳实践 ---\n');

console.log('1. 错误处理模式：');

// 使用 try/catch
async function goodErrorHandling() {
    try {
        const result = await riskyOperation();
        return result;
    } catch (error) {
        console.log('   处理错误:', error.message);
        return null; // 返回默认值
    }
}

function riskyOperation() {
    return Promise.reject(new Error('操作失败'));
}

goodErrorHandling();

// 使用 .catch()
async function withCatch() {
    const result = await riskyOperation().catch(error => {
        console.log('   .catch 捕获:', error.message);
        return '默认值';
    });
    console.log('   结果:', result);
}

setTimeout(() => withCatch(), 100);

console.log('\n2. 超时处理：');

function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`超时 ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeout]);
}

async function timeoutDemo() {
    const slowOperation = new Promise(resolve => 
        setTimeout(() => resolve('慢操作完成'), 200)
    );
    
    try {
        const result = await withTimeout(slowOperation, 100);
        console.log('   结果:', result);
    } catch (error) {
        console.log('   ', error.message);
    }
}

setTimeout(() => timeoutDemo(), 200);

console.log('\n3. 重试机制：');

async function retry(fn, maxRetries = 3, delayMs = 100) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            console.log(`   重试 ${i + 1}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

let attempts = 0;
function unreliableOperation() {
    attempts++;
    console.log(`   尝试 ${attempts}`);
    if (attempts < 3) {
        return Promise.reject(new Error('失败'));
    }
    return Promise.resolve('成功');
}

setTimeout(async () => {
    try {
        const result = await retry(unreliableOperation, 5);
        console.log('   最终结果:', result);
    } catch (error) {
        console.log('   全部失败:', error.message);
    }
}, 500);

console.log('\n4. 并发控制：');

async function concurrentLimit(tasks, limit) {
    const results = [];
    const executing = [];
    
    for (const task of tasks) {
        const promise = Promise.resolve().then(() => task());
        results.push(promise);
        
        if (limit <= tasks.length) {
            const exec = promise.then(() => {
                executing.splice(executing.indexOf(exec), 1);
            });
            executing.push(exec);
            
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }
    
    return Promise.all(results);
}

// ============================================
// 六、顶层 await（ES2022）
// ============================================

console.log('\n--- 六、顶层 await（ES2022）---\n');

console.log('1. 顶层 await 说明：');

console.log('   在 ES 模块中，可以直接在顶层使用 await');
console.log('   示例（需要在 .mjs 文件中运行）：');
console.log('   ');
console.log('   // module.mjs');
console.log('   const data = await fetch("/api/data");');
console.log('   export default data;');
console.log('   ');
console.log('   这使得模块会等待异步操作完成后再导出');

console.log('\n2. 动态导入配合顶层 await：');

console.log('   动态导入示例：');
console.log('   const module = await import("./some-module.js");');

// ============================================
// 七、Promise.withResolvers()（ES2024）
// ============================================

console.log('\n--- 七、Promise.withResolvers()（ES2024）---\n');

console.log('1. 传统方式创建可外部解决的 Promise：');

// 传统方式
let resolveTraditional, rejectTraditional;
const promiseTraditional = new Promise((resolve, reject) => {
    resolveTraditional = resolve;
    rejectTraditional = reject;
});

resolveTraditional('传统方式解决');
promiseTraditional.then(v => console.log('   传统:', v));

console.log('\n2. 使用 Promise.withResolvers()：');

// ES2024 新方法
const { promise: newPromise, resolve: newResolve, reject: newReject } = Promise.withResolvers();

newResolve('新方式解决');
newPromise.then(v => console.log('   新方法:', v));

console.log('\n3. 实际应用场景：');

// 创建一个可取消的延迟
function createCancellableDelay(ms) {
    const { promise, resolve, reject } = Promise.withResolvers();
    
    const timeoutId = setTimeout(() => {
        resolve('延迟完成');
    }, ms);
    
    return {
        promise,
        cancel: () => {
            clearTimeout(timeoutId);
            reject(new Error('已取消'));
        }
    };
}

const delay1 = createCancellableDelay(1000);
delay1.promise
    .then(v => console.log('   ', v))
    .catch(e => console.log('   ', e.message));

// delay1.cancel(); // 取消延迟

console.log('\n========== 异步编程示例结束 ==========\n');
