/**
 * ============================================================
 * TypeScript 高级教程 - 泛型 (Generics)
 * ============================================================
 * 
 * 泛型是 TypeScript 中最强大的特性之一，它允许我们编写
 * 可重用的、类型安全的代码，同时保持类型的灵活性。
 */

// ============================================================
// 一、泛型函数 (Generic Functions)
// ============================================================

/**
 * 1. 基础泛型函数
 * 
 * 泛型允许我们在定义函数时不预先指定具体类型，
 * 而是在调用时由编译器自动推断或由开发者显式指定。
 */

// 一个简单的泛型函数示例：返回传入的值
function identity<T>(arg: T): T {
  return arg;
}

// 使用方式一：让 TypeScript 自动推断类型
const result1 = identity("hello"); // 类型推断为 string
const result2 = identity(42);      // 类型推断为 number

// 使用方式二：显式指定类型参数
const result3 = identity<string>("hello"); // 明确指定 T 为 string
const result4 = identity<number>(100);     // 明确指定 T 为 number

console.log("泛型函数示例:", result1, result2, result3, result4);


/**
 * 2. 泛型函数与数组
 * 
 * 当我们需要处理数组时，泛型特别有用。
 */

// 获取数组长度的函数
function getArrayLength<T>(items: T[]): number {
  return items.length;
}

// 在数组中查找元素
function findInArray<T>(items: T[], predicate: (item: T) => boolean): T | undefined {
  return items.find(predicate);
}

const numbers = [1, 2, 3, 4, 5];
const found = findInArray(numbers, n => n > 3);
console.log("查找到的元素:", found); // 4


/**
 * 3. 多类型参数
 * 
 * 泛型函数可以有多个类型参数。
 */

// 将两个值组合成元组
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const nameAge = pair("张三", 25);
console.log("键值对:", nameAge); // ["张三", 25]

// 交换元组中的两个元素
function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}

const swapped = swap([1, "hello"]);
console.log("交换后:", swapped); // ["hello", 1]


// ============================================================
// 二、泛型接口 (Generic Interfaces)
// ============================================================

/**
 * 1. 基础泛型接口
 * 
 * 接口也可以使用泛型，这在定义数据结构时非常有用。
 */

// 定义一个通用的响应接口
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

// 用户类型
interface User {
  id: number;
  name: string;
  email: string;
}

// 使用泛型接口
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: "张三", email: "zhangsan@example.com" },
  success: true,
  message: "获取用户成功"
};

const usersResponse: ApiResponse<User[]> = {
  data: [
    { id: 1, name: "张三", email: "zhangsan@example.com" },
    { id: 2, name: "李四", email: "lisi@example.com" }
  ],
  success: true,
  message: "获取用户列表成功"
};

console.log("API响应:", userResponse, usersResponse);


/**
 * 2. 泛型函数类型接口
 * 
 * 我们可以定义描述函数形状的泛型接口。
 */

// 定义一个通用的函数类型
interface GenericFunction<T> {
  (arg: T): T;
}

// 使用泛型函数类型
const stringIdentity: GenericFunction<string> = (arg) => arg;
const numberIdentity: GenericFunction<number> = (arg) => arg + 1;

console.log("泛型函数类型:", stringIdentity("test"), numberIdentity(10));


/**
 * 3. 多属性泛型接口
 */

// 定义一个通用的存储接口
interface Storage<T> {
  items: T[];
  add: (item: T) => void;
  remove: (id: string) => void;
  find: (predicate: (item: T) => boolean) => T | undefined;
  getAll: () => T[];
}

// 实现存储接口
class ItemStorage<T extends { id: string }> implements Storage<T> {
  items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  remove(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  getAll(): T[] {
    return [...this.items];
  }
}

// 使用存储类
interface Product {
  id: string;
  name: string;
  price: number;
}

const productStorage = new ItemStorage<Product>();
productStorage.add({ id: "p1", name: "笔记本电脑", price: 5999 });
productStorage.add({ id: "p2", name: "手机", price: 3999 });

console.log("所有产品:", productStorage.getAll());


// ============================================================
// 三、泛型类 (Generic Classes)
// ============================================================

/**
 * 1. 基础泛型类
 * 
 * 类也可以使用泛型，在实例化时指定具体类型。
 */

// 一个简单的栈数据结构
class Stack<T> {
  private items: T[] = [];

  // 入栈
  push(item: T): void {
    this.items.push(item);
  }

  // 出栈
  pop(): T | undefined {
    return this.items.pop();
  }

  // 查看栈顶元素
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  // 检查是否为空
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  // 获取大小
  size(): number {
    return this.items.length;
  }
}

// 使用泛型类
const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);
console.log("栈顶元素:", numberStack.peek()); // 3
console.log("出栈:", numberStack.pop());      // 3

const stringStack = new Stack<string>();
stringStack.push("a");
stringStack.push("b");
console.log("字符串栈:", stringStack.peek()); // b


/**
 * 2. 泛型类与静态成员
 * 
 * 注意：类的静态成员不能使用类的泛型类型参数。
 */

class Container<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }

  // 静态方法不能使用 T，因为它属于类本身而不是实例
  static create<U>(value: U): Container<U> {
    return new Container(value);
  }
}

const container = Container.create<number>(42);
console.log("容器值:", container.getValue()); // 42


// ============================================================
// 四、泛型约束 (Generic Constraints)
// ============================================================

/**
 * 1. 基础泛型约束
 * 
 * 有时我们需要限制泛型的范围，确保传入的类型具有某些属性。
 */

// 定义一个约束：必须有 length 属性
interface HasLength {
  length: number;
}

// 使用 extends 关键字进行约束
function getLength<T extends HasLength>(arg: T): number {
  return arg.length; // 现在可以安全地访问 length 属性
}

// 以下调用都是合法的，因为它们都有 length 属性
console.log("字符串长度:", getLength("hello"));        // 5
console.log("数组长度:", getLength([1, 2, 3]));        // 3
console.log("对象长度:", getLength({ length: 10 }));   // 10

// 以下调用会报错，因为数字没有 length 属性
// getLength(123); // Error: Argument of type 'number' is not assignable


/**
 * 2. 在泛型约束中使用类型参数
 * 
 * 我们可以在一个类型参数的约束中使用另一个类型参数。
 */

// 从对象中获取属性值（安全的属性访问）
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = {
  name: "张三",
  age: 25,
  city: "北京"
};

console.log("姓名:", getProperty(person, "name")); // 张三
console.log("年龄:", getProperty(person, "age"));   // 25

// 以下调用会报错，因为 "address" 不是 person 的属性
// getProperty(person, "address"); // Error


/**
 * 3. 使用泛型约束确保构造函数存在
 */

// 创建实例的工厂函数
function createInstance<T>(c: new (...args: any[]) => T, ...args: any[]): T {
  return new c(...args);
}

class PersonClass {
  constructor(public name: string, public age: number) {}
  
  greet() {
    return `你好，我是 ${this.name}，今年 ${this.age} 岁`;
  }
}

const personInstance = createInstance(PersonClass, "李四", 30);
console.log("创建的实例:", personInstance.greet());


/**
 * 4. 高级泛型约束示例
 */

// 约束：对象必须包含指定的属性
type WithProperty<T, P extends string> = T & Record<P, unknown>;

function processObject<T extends Record<string, unknown>>(
  obj: T,
  requiredKey: keyof T
): void {
  console.log(`处理对象，必需的键 "${String(requiredKey)}" 的值:`, obj[requiredKey]);
}

processObject({ id: 1, name: "测试" }, "name");


// ============================================================
// 五、条件泛型 (Conditional Generics)
// ============================================================

/**
 * 1. 条件类型基础
 * 
 * 条件类型允许我们根据类型关系进行条件判断。
 * 语法：T extends U ? X : Y
 */

// 一个简单的条件类型
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
type C = IsString<"hello">; // true (字面量类型也是 string 的子类型)

console.log("IsString 示例编译时检查通过");


/**
 * 2. 条件泛型函数
 * 
 * 我们可以在泛型函数中使用条件类型。
 */

// 根据输入类型返回不同类型的值
function transform<T extends string | number>(input: T): T extends string ? string[] : number[] {
  if (typeof input === "string") {
    return input.split("") as any;
  } else {
    return [input, input * 2] as any;
  }
}

const stringResult = transform("abc");   // 类型为 string[]
const numberResult = transform(5);       // 类型为 number[]

console.log("字符串转换:", stringResult); // ["a", "b", "c"]
console.log("数字转换:", numberResult);   // [5, 10]


/**
 * 3. 类型推断与条件泛型
 * 
 * 结合 infer 关键字，可以在条件类型中推断类型。
 */

// 提取函数返回类型
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function greet(): string { return "Hello"; }
function count(): number { return 42; }

type GreetReturn = GetReturnType<typeof greet>; // string
type CountReturn = GetReturnType<typeof count>; // number

console.log("返回类型推断示例编译通过");


/**
 * 4. 实用的条件泛型示例
 */

// 深度可选类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface Config {
  server: {
    host: string;
    port: number;
  };
  database: {
    name: string;
    url: string;
  };
}

const partialConfig: DeepPartial<Config> = {
  server: {
    host: "localhost"
    // port 是可选的
  }
};

console.log("深度可选配置:", partialConfig);


// ============================================================
// 六、泛型默认类型 (Generic Default Types)
// ============================================================

/**
 * 泛型可以有默认类型，类似于函数参数的默认值。
 */

// 定义一个带有默认类型的泛型接口
interface RequestConfig<T = any, R = T> {
  data: T;
  transform?: (data: T) => R;
}

// 使用默认类型
const config1: RequestConfig = {
  data: "some data"
};

// 指定具体类型
const config2: RequestConfig<string, number> = {
  data: "123",
  transform: (d) => parseInt(d)
};

console.log("请求配置:", config1, config2);


// ============================================================
// 七、泛型最佳实践
// ============================================================

/**
 * 1. 使用有意义的类型参数名称
 */

// 推荐：使用描述性的名称
interface KeyValuePair<TKey, TValue> {
  key: TKey;
  value: TValue;
}

// 也可以使用简短的名称（常见约定）
// T - Type（类型）
// K - Key（键）
// V - Value（值）
// E - Element（元素）
// R - Return（返回值）


/**
 * 2. 尽可能让编译器推断类型
 */

// 好的做法：让 TypeScript 推断类型
const inferredResult = identity("auto inferred");

// 在复杂情况下显式指定类型
const explicitResult = identity<string[]>(["a", "b", "c"]);


/**
 * 3. 使用泛型约束而不是 any
 */

// 不好的做法
function badExample(arg: any): any {
  return arg;
}

// 好的做法：使用泛型保持类型信息
function goodExample<T>(arg: T): T {
  return arg;
}


// ============================================================
// 八、综合示例
// ============================================================

/**
 * 实现一个通用的 API 客户端
 */

interface ApiClient {
  get<T>(url: string): Promise<T>;
  post<T, R>(url: string, data: T): Promise<R>;
  put<T, R>(url: string, data: T): Promise<R>;
  delete<T>(url: string): Promise<T>;
}

class HttpClient implements ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(url: string): Promise<T> {
    const response = await fetch(this.baseUrl + url);
    return response.json();
  }

  async post<T, R>(url: string, data: T): Promise<R> {
    const response = await fetch(this.baseUrl + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async put<T, R>(url: string, data: T): Promise<R> {
    const response = await fetch(this.baseUrl + url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(this.baseUrl + url, {
      method: "DELETE"
    });
    return response.json();
  }
}

// 使用示例
// const client = new HttpClient("https://api.example.com");
// const users = await client.get<User[]>("/users");
// const newUser = await client.post<CreateUserDto, User>("/users", { name: "王五" });

console.log("泛型教程示例执行完成！");


// ============================================================
// 总结
// ============================================================
/**
 * 泛型要点回顾：
 * 
 * 1. 泛型函数：使用 <T> 定义类型参数，在调用时确定具体类型
 * 2. 泛型接口：接口可以包含类型参数，用于描述数据结构
 * 3. 泛型类：类可以使用泛型，创建类型安全的实例
 * 4. 泛型约束：使用 extends 限制类型参数的范围
 * 5. 条件泛型：结合条件类型实现更复杂的类型逻辑
 * 6. 泛型默认值：为类型参数提供默认类型
 * 
 * 最佳实践：
 * - 使用有意义的类型参数名称
 * - 尽可能让编译器推断类型
 * - 使用约束而不是 any
 * - 保持泛型的简单性和可读性
 */
