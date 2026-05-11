/**
 * ============================================================
 * TypeScript 高级教程 - 类型模式 (Type Patterns)
 * ============================================================
 * 
 * 本节介绍 TypeScript 中常用的类型模式和技巧，
 * 包括类型守卫、discriminated unions、类型收窄、函数重载和声明合并。
 */

// ============================================================
// 一、类型守卫 (Type Guards)
// ============================================================

/**
 * 1. typeof 类型守卫
 * 
 * 使用 typeof 操作符检查基本类型。
 */

function processValue(value: string | number | boolean) {
  if (typeof value === "string") {
    // 在这个块中，value 被收窄为 string 类型
    console.log("字符串长度:", value.length);
    return value.toUpperCase();
  } else if (typeof value === "number") {
    // 在这个块中，value 被收窄为 number 类型
    console.log("数字值:", value.toFixed(2));
    return value * 2;
  } else {
    // 在这个块中，value 被收窄为 boolean 类型
    console.log("布尔值:", value);
    return value ? "真" : "假";
  }
}

console.log("typeof 守卫:", processValue("hello"), processValue(42), processValue(true));


/**
 * 2. instanceof 类型守卫
 * 
 * 使用 instanceof 操作符检查类实例。
 */

class Dog {
  bark() { console.log("汪汪!"); }
}

class Cat {
  meow() { console.log("喵喵!"); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    // animal 被收窄为 Dog 类型
    animal.bark();
  } else {
    // animal 被收窄为 Cat 类型
    animal.meow();
  }
}

makeSound(new Dog());
makeSound(new Cat());


/**
 * 3. in 操作符类型守卫
 * 
 * 使用 in 操作符检查属性是否存在。
 */

interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function move(animal: Bird | Fish) {
  if ("fly" in animal) {
    // animal 被收窄为 Bird 类型
    animal.fly();
  } else {
    // animal 被收窄为 Fish 类型
    animal.swim();
  }
}

const bird: Bird = { fly: () => console.log("飞翔"), layEggs: () => {} };
const fish: Fish = { swim: () => console.log("游泳"), layEggs: () => {} };

move(bird);
move(fish);


/**
 * 4. 自定义类型守卫
 * 
 * 使用 is 关键字创建自定义类型守卫函数。
 */

// 定义两种用户类型
interface Admin {
  type: "admin";
  permissions: string[];
}

interface RegularUser {
  type: "user";
  role: string;
}

type AppUser = Admin | RegularUser;

// 自定义类型守卫函数
function isAdmin(user: AppUser): user is Admin {
  return user.type === "admin";
}

function isRegularUser(user: AppUser): user is RegularUser {
  return user.type === "user";
}

function checkPermissions(user: AppUser) {
  if (isAdmin(user)) {
    // user 被收窄为 Admin 类型
    console.log("管理员权限:", user.permissions);
  } else if (isRegularUser(user)) {
    // user 被收窄为 RegularUser 类型
    console.log("用户角色:", user.role);
  }
}

const admin: Admin = { type: "admin", permissions: ["read", "write", "delete"] };
const regularUser: RegularUser = { type: "user", role: "editor" };

checkPermissions(admin);
checkPermissions(regularUser);


/**
 * 5. 断言函数
 * 
 * 使用 asserts 关键字创建断言函数。
 */

// 断言函数：如果条件不满足则抛出错误
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("值不是字符串");
  }
}

function processString(value: unknown) {
  assertIsString(value);
  // 此处 value 被收窄为 string 类型
  console.log("处理字符串:", value.toUpperCase());
}

try {
  processString("hello");
} catch (e) {
  console.log("错误:", e);
}


// ============================================================
// 二、Discriminated Unions (可辨识联合)
// ============================================================

/**
 * 1. 基本概念
 * 
 * Discriminated Union 是一种模式，使用公共属性（判别属性）
 * 来区分联合类型中的不同类型。
 */

// 定义不同状态的类型
interface LoadingState {
  status: "loading";
}

interface SuccessState {
  status: "success";
  data: string;
}

interface ErrorState {
  status: "error";
  error: Error;
}

type AsyncState = LoadingState | SuccessState | ErrorState;

// 使用判别属性进行类型收窄
function handleState(state: AsyncState) {
  switch (state.status) {
    case "loading":
      // state 被收窄为 LoadingState
      console.log("加载中...");
      break;
    case "success":
      // state 被收窄为 SuccessState
      console.log("数据:", state.data);
      break;
    case "error":
      // state 被收窄为 ErrorState
      console.log("错误:", state.error.message);
      break;
  }
}

handleState({ status: "loading" });
handleState({ status: "success", data: "用户数据" });
handleState({ status: "error", error: new Error("网络错误") });


/**
 * 2. 实际应用：Redux Action
 */

// 使用 discriminated union 定义 Redux actions
interface AddTodoAction {
  type: "ADD_TODO";
  payload: {
    id: number;
    text: string;
  };
}

interface RemoveTodoAction {
  type: "REMOVE_TODO";
  payload: {
    id: number;
  };
}

interface ToggleTodoAction {
  type: "TOGGLE_TODO";
  payload: {
    id: number;
  };
}

type TodoAction = AddTodoAction | RemoveTodoAction | ToggleTodoAction;

// 类型安全的 reducer
function todoReducer(state: string[], action: TodoAction): string[] {
  switch (action.type) {
    case "ADD_TODO":
      // action 被收窄为 AddTodoAction
      return [...state, action.payload.text];
    case "REMOVE_TODO":
      // action 被收窄为 RemoveTodoAction
      return state.filter((_, i) => i !== action.payload.id);
    case "TOGGLE_TODO":
      // action 被收窄为 ToggleTodoAction
      return state; // 简化示例
    default:
      return state;
  }
}

console.log("Redux Action 示例编译通过");


/**
 * 3. 实际应用：API 响应
 */

// 定义 API 响应类型
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: {
    code: number;
    message: string;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// 处理 API 响应
function handleApiResponse<T>(response: ApiResponse<T>) {
  if (response.success) {
    // response 被收窄为 SuccessResponse<T>
    console.log("成功数据:", response.data);
    return response.data;
  } else {
    // response 被收窄为 ErrorResponse
    console.log("错误:", response.error.code, response.error.message);
    throw new Error(response.error.message);
  }
}

const successResponse: ApiResponse<string> = {
  success: true,
  data: "用户数据"
};

const errorResponse: ApiResponse<string> = {
  success: false,
  error: { code: 404, message: "未找到" }
};

handleApiResponse(successResponse);


/**
 * 4. 穷尽性检查
 * 
 * 使用 never 类型确保处理了所有可能的情况。
 */

// 穷尽性检查函数
function assertNever(value: never): never {
  throw new Error(`未处理的值: ${value}`);
}

// 使用穷尽性检查
function exhaustiveCheck(state: AsyncState) {
  switch (state.status) {
    case "loading":
      return "加载中";
    case "success":
      return state.data;
    case "error":
      return state.error.message;
    default:
      // 如果有未处理的情况，编译器会报错
      return assertNever(state);
  }
}

console.log("穷尽性检查:", exhaustiveCheck({ status: "loading" }));


// ============================================================
// 三、类型收窄 (Type Narrowing)
// ============================================================

/**
 * 1. 条件语句收窄
 */

// 使用 if 语句收窄类型
function narrowByCondition(value: string | number | null) {
  if (value === null) {
    console.log("值为 null");
    return;
  }

  if (typeof value === "string") {
    // value 被收窄为 string
    console.log("字符串:", value.length);
  } else {
    // value 被收窄为 number
    console.log("数字:", value.toFixed(2));
  }
}

narrowByCondition("hello");
narrowByCondition(42);
narrowByCondition(null);


/**
 * 2. 真值收窄
 */

// 使用真值检查收窄类型
function narrowByTruthy(value: string | null | undefined) {
  if (value) {
    // value 被收窄为 string（排除了 null、undefined 和空字符串）
    console.log("非空字符串:", value);
  } else {
    console.log("空值或空字符串");
  }
}

narrowByTruthy("hello");
narrowByTruthy(null);
narrowByTruthy("");


/**
 * 3. 相等性收窄
 */

// 使用相等性检查收窄类型
function narrowByEquality(a: string | number, b: string | boolean) {
  if (a === b) {
    // 当 a === b 时，两者都必须是 string
    console.log("相等的字符串:", a.toUpperCase());
  } else {
    console.log("不相等");
  }
}

narrowByEquality("hello", "hello");
narrowByEquality("hello", true);


/**
 * 4. 数组过滤收窄
 */

// 使用 filter 过滤类型
function filterArray(items: (string | number)[]) {
  // 使用类型守卫过滤
  const strings = items.filter((item): item is string => typeof item === "string");
  const numbers = items.filter((item): item is number => typeof item === "number");

  console.log("字符串数组:", strings);
  console.log("数字数组:", numbers);
}

filterArray(["a", 1, "b", 2, "c", 3]);


/**
 * 5. 赋值收窄
 */

// 通过赋值收窄类型
let variable: string | number;

variable = "hello";
// variable 被收窄为 string
console.log("字符串变量:", variable.length);

variable = 42;
// variable 被收窄为 number
console.log("数字变量:", variable.toFixed(2));


// ============================================================
// 四、函数重载 (Function Overloads)
// ============================================================

/**
 * 1. 基本函数重载
 * 
 * 函数重载允许同一个函数接受不同类型或数量的参数，
 * 并返回相应类型的值。
 */

// 定义重载签名
function makeDate(timestamp: number): Date;
function makeDate(year: number, month: number, day: number): Date;
// 实现签名
function makeDate(yearOrTimestamp: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    // 年月日模式
    return new Date(yearOrTimestamp, month - 1, day);
  } else {
    // 时间戳模式
    return new Date(yearOrTimestamp);
  }
}

const dateFromTimestamp = makeDate(1609459200000);  // 时间戳
const dateFromYMD = makeDate(2024, 1, 1);           // 年月日

console.log("日期:", dateFromTimestamp, dateFromYMD);


/**
 * 2. 返回类型重载
 */

// 根据参数类型返回不同类型
function parseValue(value: string): string;
function parseValue(value: number): number;
function parseValue(value: string | number): string | number {
  return value;
}

const stringResult = parseValue("hello"); // string
const numberResult = parseValue(42);      // number

console.log("解析结果:", stringResult, numberResult);


/**
 * 3. 对象参数重载
 */

// 定义不同的参数类型
interface StringOptions {
  type: "string";
  value: string;
}

interface NumberOptions {
  type: "number";
  value: number;
}

// 重载签名
function processOptions(options: StringOptions): string;
function processOptions(options: NumberOptions): number;
function processOptions(options: StringOptions | NumberOptions): string | number {
  if (options.type === "string") {
    return options.value.toUpperCase();
  } else {
    return options.value * 2;
  }
}

const strOpt: StringOptions = { type: "string", value: "hello" };
const numOpt: NumberOptions = { type: "number", value: 21 };

console.log("选项处理:", processOptions(strOpt), processOptions(numOpt));


/**
 * 4. 方法重载
 */

// 在接口中定义方法重载
interface Calculator {
  calculate(value: number): number;
  calculate(value: string): string;
  calculate(value: number | string): number | string;
}

const calculator: Calculator = {
  calculate(value: number | string): number | string {
    if (typeof value === "number") {
      return value * 2;
    }
    return value.toUpperCase();
  }
};

console.log("计算器:", calculator.calculate(10), calculator.calculate("test"));


/**
 * 5. 构造函数重载
 */

// 构造函数重载
class Point {
  x: number;
  y: number;

  // 重载签名
  constructor();
  constructor(x: number, y: number);
  constructor(x?: number, y?: number) {
    this.x = x ?? 0;
    this.y = y ?? 0;
  }
}

const origin = new Point();        // (0, 0)
const point = new Point(10, 20);   // (10, 20)

console.log("点:", origin, point);


/**
 * 6. 重载最佳实践
 */

// 好的重载示例：类型安全的 DOM 操作
function getElement(selector: string): HTMLElement | null;
function getElement<T extends HTMLElement>(selector: string, elementType: new () => T): T | null;
function getElement<T extends HTMLElement>(
  selector: string,
  elementType?: new () => T
): HTMLElement | T | null {
  const element = document.querySelector(selector);
  if (!element) return null;
  
  if (elementType && element instanceof elementType) {
    return element;
  }
  
  return element;
}

console.log("DOM 操作示例编译通过");


// ============================================================
// 五、声明合并 (Declaration Merging)
// ============================================================

/**
 * 1. 接口合并
 * 
 * 同名的接口会自动合并其成员。
 */

// 定义第一个接口
interface User {
  id: number;
  name: string;
}

// 扩展接口
interface User {
  email: string;
  age: number;
}

// 合并后的 User 接口包含所有成员
const mergedUser: User = {
  id: 1,
  name: "张三",
  email: "zhangsan@example.com",
  age: 25
};

console.log("合并后的用户:", mergedUser);


/**
 * 2. 函数合并
 * 
 * 接口可以描述函数，也可以描述函数的属性。
 */

interface Counter {
  (): number;           // 函数签名
  value: number;        // 属性
  reset(): void;        // 方法
}

// 实现带属性的函数
const counter = (() => {
  const fn = () => fn.value;
  fn.value = 0;
  fn.reset = () => { fn.value = 0; };
  return fn as Counter;
})();

counter.value = 10;
console.log("计数器:", counter()); // 10
counter.reset();
console.log("重置后:", counter()); // 0


/**
 * 3. 类与接口合并
 * 
 * 类可以实现多个接口，接口也可以扩展类。
 */

// 定义接口
interface Serializable {
  serialize(): string;
}

interface Comparable<T> {
  compareTo(other: T): number;
}

// 类实现多个接口
class Product implements Serializable, Comparable<Product> {
  constructor(
    public id: number,
    public name: string,
    public price: number
  ) {}

  serialize(): string {
    return JSON.stringify({ id: this.id, name: this.name, price: this.price });
  }

  compareTo(other: Product): number {
    return this.price - other.price;
  }
}

const product1 = new Product(1, "产品A", 100);
const product2 = new Product(2, "产品B", 200);

console.log("序列化:", product1.serialize());
console.log("比较:", product1.compareTo(product2));


/**
 * 4. 命名空间合并
 * 
 * 同名的命名空间会合并其成员。
 */

// 第一个命名空间
namespace Utils {
  export function log(message: string): void {
    console.log("[LOG]", message);
  }
}

// 扩展命名空间
namespace Utils {
  export function error(message: string): void {
    console.error("[ERROR]", message);
  }
}

// 使用合并后的命名空间
Utils.log("信息消息");
Utils.error("错误消息");


/**
 * 5. 命名空间与函数合并
 * 
 * 命名空间可以与函数声明合并。
 */

function buildName(firstName: string, lastName: string) {
  return `${buildName.prefix}${firstName} ${lastName}`;
}

namespace buildName {
  export let prefix = "Mr. ";
  export function setPrefix(newPrefix: string) {
    prefix = newPrefix;
  }
}

console.log("构建名称:", buildName("张", "三"));
buildName.setPrefix("Dr. ");
console.log("更新后:", buildName("李", "四"));


/**
 * 6. 命名空间与类合并
 * 
 * 命名空间可以与类声明合并。
 */

class Album {
  label: Album.AlbumLabel;

  constructor(label: Album.AlbumLabel) {
    this.label = label;
  }
}

namespace Album {
  export interface AlbumLabel {
    name: string;
    year: number;
  }

  export function create(name: string, year: number): Album {
    return new Album({ name, year });
  }
}

const album = Album.create("专辑名称", 2024);
console.log("专辑:", album);


/**
 * 7. 模块扩展
 * 
 * 使用 declare module 扩展现有模块。
 */

// 假设有一个 express 模块
declare module "express" {
  interface Request {
    user?: {
      id: number;
      name: string;
    };
  }
}

// 现在可以在 express 的 Request 对象上访问 user 属性
console.log("模块扩展示例编译通过");


/**
 * 8. 全局扩展
 * 
 * 使用 global 扩展全局作用域。
 */

// 扩展全局对象
declare global {
  interface Array<T> {
    first(): T | undefined;
    last(): T | undefined;
  }
}

// 实现扩展方法
if (!Array.prototype.first) {
  Array.prototype.first = function<T>(): T | undefined {
    return this[0];
  };
}

if (!Array.prototype.last) {
  Array.prototype.last = function<T>(): T | undefined {
    return this[this.length - 1];
  };
}

const arr = [1, 2, 3, 4, 5];
console.log("第一个:", arr.first()); // 1
console.log("最后一个:", arr.last()); // 5


// ============================================================
// 六、综合实战案例
// ============================================================

/**
 * 类型安全的 EventEmitter
 */

// 定义事件映射
interface EventMap {
  "user:created": { id: number; name: string };
  "user:deleted": { id: number };
  "message:sent": { from: string; to: string; content: string };
}

// 类型安全的 EventEmitter
class TypedEventEmitter<T extends Record<string, any>> {
  private listeners: Map<keyof T, Set<Function>> = new Map();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
    }
  }
}

// 使用类型安全的 EventEmitter
const emitter = new TypedEventEmitter<EventMap>();

emitter.on("user:created", (data) => {
  // data 的类型自动推断为 { id: number; name: string }
  console.log("用户创建:", data.name);
});

emitter.on("message:sent", (data) => {
  // data 的类型自动推断为 { from: string; to: string; content: string }
  console.log(`消息从 ${data.from} 发送到 ${data.to}: ${data.content}`);
});

emitter.emit("user:created", { id: 1, name: "张三" });
emitter.emit("message:sent", { from: "张三", to: "李四", content: "你好！" });


/**
 * 类型安全的路由系统
 */

// 定义路由配置
interface RouteConfig {
  path: string;
  handler: (params: Record<string, string>) => void;
}

// 路由参数提取
type ExtractParams<T extends string> = 
  T extends `${string}:${infer Param}/${infer Rest}` 
    ? Param | ExtractParams<Rest> 
    : T extends `${string}:${infer Param}` 
      ? Param 
      : never;

// 类型安全的路由器
class Router {
  private routes: Map<string, RouteConfig> = new Map();

  add<T extends string>(path: T, handler: (params: Record<ExtractParams<T>, string>) => void): void {
    this.routes.set(path, { path, handler: handler as any });
  }

  navigate(path: string): void {
    const route = this.routes.get(path);
    if (route) {
      route.handler({});
    }
  }
}

const router = new Router();
router.add("/users/:id", (params) => {
  console.log("用户ID:", params.id);
});

console.log("路由系统示例编译通过");


// ============================================================
// 总结
// ============================================================
/**
 * 类型模式要点回顾：
 * 
 * 1. 类型守卫：
 *    - typeof：检查基本类型
 *    - instanceof：检查类实例
 *    - in：检查属性存在
 *    - 自定义类型守卫：使用 is 关键字
 *    - 断言函数：使用 asserts 关键字
 * 
 * 2. Discriminated Unions：
 *    - 使用公共判别属性区分类型
 *    - 配合 switch 语句进行类型收窄
 *    - 使用 never 类型进行穷尽性检查
 * 
 * 3. 类型收窄：
 *    - 条件语句收窄
 *    - 真值收窄
 *    - 相等性收窄
 *    - 数组过滤收窄
 *    - 赋值收窄
 * 
 * 4. 函数重载：
 *    - 定义多个重载签名
 *    - 实现签名处理所有情况
 *    - 返回类型根据参数类型变化
 * 
 * 5. 声明合并：
 *    - 接口合并
 *    - 函数与命名空间合并
 *    - 类与命名空间合并
 *    - 模块扩展
 *    - 全局扩展
 * 
 * 最佳实践：
 * - 使用 discriminated unions 代替复杂的条件判断
 * - 为类型守卫使用有意义的命名
 * - 避免过度使用函数重载
 * - 使用声明合并扩展现有类型
 * - 保持类型的可读性和可维护性
 */
