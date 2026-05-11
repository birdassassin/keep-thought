/**
 * ============================================================
 * TypeScript 高级教程 - 条件类型 (Conditional Types)
 * ============================================================
 * 
 * 条件类型是 TypeScript 中最强大的类型系统特性之一，
 * 它允许我们根据类型之间的关系进行条件判断，实现复杂的类型逻辑。
 */

// ============================================================
// 一、条件类型基础
// ============================================================

/**
 * 1. 条件类型语法
 * 
 * 条件类型的语法类似于 JavaScript 的三元表达式：
 * T extends U ? X : Y
 * 
 * 含义：如果 T 可以赋值给 U，则类型为 X，否则为 Y
 */

// 基础示例：判断类型是否为 string
type IsString<T> = T extends string ? "是字符串" : "不是字符串";

type Test1 = IsString<string>;    // "是字符串"
type Test2 = IsString<number>;    // "不是字符串"
type Test3 = IsString<"hello">;   // "是字符串"（字面量类型）
type Test4 = IsString<string | number>; // "是字符串" | "不是字符串"

console.log("条件类型基础示例编译通过");


/**
 * 2. 条件类型与字面量类型
 * 
 * 条件类型可以精确匹配字面量类型。
 */

// 检查是否是特定的字面量类型
type IsHello<T> = T extends "hello" ? true : false;

type HelloCheck = IsHello<"hello">;  // true
type WorldCheck = IsHello<"world">;  // false
type StringCheck = IsHello<string>;  // false（string 是更宽泛的类型）

console.log("字面量类型检查示例编译通过");


/**
 * 3. 嵌套条件类型
 * 
 * 条件类型可以嵌套使用，实现多重判断。
 */

// 类型分类器
type TypeName<T> = 
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  T extends undefined ? "undefined" :
  T extends Function ? "function" :
  "object";

type T1 = TypeName<string>;      // "string"
type T2 = TypeName<number>;      // "number"
type T3 = TypeName<boolean>;     // "boolean"
type T4 = TypeName<undefined>;   // "undefined"
type T5 = TypeName<() => void>;  // "function"
type T6 = TypeName<object>;      // "object"

console.log("类型分类器示例编译通过");


// ============================================================
// 二、infer 关键字
// ============================================================

/**
 * 1. infer 基础
 * 
 * infer 关键字用于在条件类型中推断类型。
 * 它只能在条件类型的 extends 子句中使用。
 */

// 提取函数的返回类型
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 使用示例
function getString(): string { return "hello"; }
function getNumber(): number { return 42; }
function getArray(): string[] { return ["a", "b"]; }

type ReturnString = GetReturnType<typeof getString>;  // string
type ReturnNumber = GetReturnType<typeof getNumber>;  // number
type ReturnArray = GetReturnType<typeof getArray>;    // string[]

console.log("函数返回类型推断:", { ReturnString: "string", ReturnNumber: "number", ReturnArray: "string[]" });


/**
 * 2. 提取函数参数类型
 */

// 提取函数参数类型（元组形式）
type GetParameters<T> = T extends (...args: infer P) => any ? P : never;

function exampleFunction(name: string, age: number, active: boolean): void {}

type Params = GetParameters<typeof exampleFunction>; // [string, number, boolean]

// 提取第一个参数类型
type GetFirstParam<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

type FirstParam = GetFirstParam<typeof exampleFunction>; // string

console.log("参数类型推断示例编译通过");


/**
 * 3. 提取 Promise 内部类型
 */

// 提取 Promise 解析后的类型
type Awaited<T> = T extends Promise<infer U> ? U : T;

type PromiseString = Awaited<Promise<string>>;  // string
type PromiseNumber = Awaited<Promise<number>>;  // number
type DirectString = Awaited<string>;           // string（非 Promise 直接返回）

// 处理嵌套 Promise
type DeepAwaited<T> = T extends Promise<infer U> ? DeepAwaited<U> : T;

type NestedPromise = DeepAwaited<Promise<Promise<Promise<number>>>>; // number

console.log("Promise 类型推断:", { PromiseString: "string", PromiseNumber: "number", NestedPromise: "number" });


/**
 * 4. 提取数组元素类型
 */

// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : T;

type StringElement = ElementType<string[]>;   // string
type NumberElement = ElementType<number[]>;   // number
type TupleElement = ElementType<[string, number]>; // string | number

// 提取元组第一个元素
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;

type First = Head<[string, number, boolean]>; // string

// 提取元组最后一个元素
type Tail<T extends any[]> = T extends [...any[], infer L] ? L : never;

type Last = Tail<[string, number, boolean]>; // boolean

console.log("数组元素类型推断:", { StringElement: "string", First: "string", Last: "boolean" });


/**
 * 5. 提取对象属性类型
 */

// 提取对象某个属性的类型
type PropertyType<T, K extends keyof T> = T extends { [P in K]: infer V } ? V : never;

interface User {
  id: number;
  name: string;
  email: string;
}

type UserIdType = PropertyType<User, "id">;    // number
type UserNameType = PropertyType<User, "name">; // string

console.log("属性类型推断示例编译通过");


// ============================================================
// 三、分布式条件类型 (Distributive Conditional Types)
// ============================================================

/**
 * 1. 分布式条件类型基础
 * 
 * 当条件类型作用于联合类型时，条件会自动分发到联合类型的每个成员上。
 * 这是 TypeScript 条件类型的一个重要特性。
 */

// 一个简单的条件类型
type ToArray<T> = T extends any ? T[] : never;

// 当 T 是联合类型时，条件类型会分发
type StrOrNumArray = ToArray<string | number>; 
// 等价于：ToArray<string> | ToArray<number>
// 结果为：string[] | number[]

console.log("分布式条件类型:", "string[] | number[]");


/**
 * 2. 分布式条件类型的应用
 */

// 过滤联合类型中的某些类型
type Exclude<T, U> = T extends U ? never : T;

type Result1 = Exclude<"a" | "b" | "c", "a">;  // "b" | "c"
type Result2 = Exclude<string | number | boolean, number>; // string | boolean

// 提取联合类型中的某些类型
type Extract<T, U> = T extends U ? T : never;

type Result3 = Extract<"a" | "b" | "c", "a" | "b">;  // "a" | "b"
type Result4 = Extract<string | number | boolean, string | number>; // string | number

console.log("类型过滤:", { Result1: '"b" | "c"', Result3: '"a" | "b"' });


/**
 * 3. NonNullable 实现
 */

// 从类型中排除 null 和 undefined
type NonNullable<T> = T extends null | undefined ? never : T;

type NonNullResult = NonNullable<string | null | undefined>; // string

console.log("NonNullable 示例:", "string");


/**
 * 4. 阻止分布式行为
 * 
 * 如果不想要分布式行为，可以用元组包裹类型
 */

// 普通的分布式条件类型
type Distributed<T> = T extends any ? T[] : never;
type DResult = Distributed<string | number>; // string[] | number[]

// 阻止分布式行为
type NonDistributed<T> = [T] extends [any] ? T[] : never;
type NDResult = NonDistributed<string | number>; // (string | number)[]

console.log("阻止分布式:", { DResult: "string[] | number[]", NDResult: "(string | number)[]" });


/**
 * 5. 高级分布式示例
 */

// 检查联合类型中是否包含某个类型
type Includes<T, U> = T extends U ? true : false;

type HasString = Includes<string | number, string>; // true
type HasBoolean = Includes<string | number, boolean>; // boolean（分布式结果）

// 更精确的实现
type HasType<T, U> = Exclude<T, U> extends never ? true : false;

type Check1 = HasType<"a" | "b", "a" | "b">; // true
type Check2 = HasType<"a" | "b", "a">;       // false

console.log("类型包含检查示例编译通过");


// ============================================================
// 四、类型推断实战
// ============================================================

/**
 * 1. 提取构造函数实例类型
 */

// 提取构造函数的实例类型
type InstanceType<T extends new (...args: any[]) => any> = T extends new (...args: any[]) => infer R ? R : any;

class PersonClass {
  constructor(public name: string, public age: number) {}
}

type PersonInstance = InstanceType<typeof PersonClass>; // PersonClass

console.log("构造函数实例类型推断示例编译通过");


/**
 * 2. 提取类的属性类型
 */

// 提取类的所有方法名
type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T];

class ExampleClass {
  name: string = "";
  
  getName(): string {
    return this.name;
  }
  
  setName(name: string): void {
    this.name = name;
  }
  
  value: number = 0;
}

type Methods = MethodNames<ExampleClass>; // "getName" | "setName"

console.log("方法名提取:", Methods);


/**
 * 3. 提取函数重载信息
 */

// 提取函数的所有重载签名
type OverloadInfo<T> = T extends {
  (...args: infer A1): infer R1;
  (...args: infer A2): infer R2;
} ? { args: A1 | A2; return: R1 | R2 } : never;

// 注意：这个示例展示了概念，实际使用中可能需要更复杂的处理

console.log("函数重载信息提取示例编译通过");


/**
 * 4. 递归类型推断
 */

// 递归提取所有属性的类型
type DeepValue<T, Path extends string> = 
  Path extends `${infer K}.${infer Rest}` 
    ? K extends keyof T 
      ? DeepValue<T[K], Rest> 
      : never 
    : Path extends keyof T 
      ? T[Path] 
      : never;

interface DeepObject {
  user: {
    profile: {
      name: string;
      age: number;
    };
  };
}

type UserName = DeepValue<DeepObject, "user.profile.name">; // string
type UserAge = DeepValue<DeepObject, "user.profile.age">;   // number

console.log("递归类型推断:", { UserName: "string", UserAge: "number" });


// ============================================================
// 五、条件类型工具
// ============================================================

/**
 * 1. 自定义条件类型工具
 */

// 检查类型是否相等
type Equals<X, Y> = 
  (<T>() => T extends X ? 1 : 2) extends 
  (<T>() => T extends Y ? 1 : 2) ? true : false;

type Eq1 = Equals<string, string>;   // true
type Eq2 = Equals<string, number>;   // false
type Eq3 = Equals<{ a: 1 }, { a: 1 }>; // true

console.log("类型相等检查:", { Eq1: true, Eq2: false, Eq3: true });


/**
 * 2. 检查类型是否为 any
 */

type IsAny<T> = 0 extends (1 & T) ? true : false;

type AnyCheck1 = IsAny<any>;     // true
type AnyCheck2 = IsAny<string>;  // false
type AnyCheck3 = IsAny<unknown>; // false

console.log("IsAny 检查:", { AnyCheck1: true, AnyCheck2: false });


/**
 * 3. 检查类型是否为 never
 */

type IsNever<T> = [T] extends [never] ? true : false;

type NeverCheck1 = IsNever<never>;   // true
type NeverCheck2 = IsNever<string>;  // false
type NeverCheck3 = IsNever<null>;    // false

console.log("IsNever 检查:", { NeverCheck1: true, NeverCheck2: false });


/**
 * 4. 检查类型是否为元组
 */

type IsTuple<T> = T extends readonly any[] 
  ? number extends T['length'] 
    ? false 
    : true 
  : false;

type TupleCheck1 = IsTuple<[string, number]>;  // true
type TupleCheck2 = IsTuple<string[]>;          // false
type TupleCheck3 = IsTuple<number[]>;          // false

console.log("IsTuple 检查:", { TupleCheck1: true, TupleCheck2: false });


/**
 * 5. 检查类型是否为联合类型
 */

type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type UnionCheck1 = IsUnion<string | number>;  // true
type UnionCheck2 = IsUnion<string>;           // false
type UnionCheck3 = IsUnion<"a" | "b">;        // true

console.log("IsUnion 检查:", { UnionCheck1: true, UnionCheck2: false });


// ============================================================
// 六、条件类型实战案例
// ============================================================

/**
 * 1. 类型安全的 Object.keys
 */

// 更安全的 Object.keys
type SafeObjectKeys<T extends object> = keyof T;

function safeKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

const userObj = {
  name: "张三",
  age: 25,
  city: "北京"
};

const keys = safeKeys(userObj); // ("name" | "age" | "city")[]
console.log("安全的 keys:", keys);


/**
 * 2. 类型安全的路径访问
 */

// 安全的对象路径访问
type PathValue<T, P extends string> = 
  P extends `${infer K}.${infer Rest}` 
    ? K extends keyof T 
      ? PathValue<T[K], Rest> 
      : never 
    : P extends keyof T 
      ? T[P] 
      : never;

function getNestedValue<T extends object, P extends string>(
  obj: T, 
  path: P
): PathValue<T, P> {
  const keys = path.split(".");
  let result: any = obj;
  for (const key of keys) {
    result = result[key];
  }
  return result;
}

const nestedObj = {
  user: {
    profile: {
      name: "李四",
      age: 30
    }
  }
};

const nestedName = getNestedValue(nestedObj, "user.profile.name"); // string
console.log("嵌套值:", nestedName);


/**
 * 3. 类型转换器
 */

// 根据输入类型自动转换
type Transform<T> = 
  T extends string ? number :
  T extends number ? string :
  T extends boolean ? string :
  T extends Array<any> ? { length: number } :
  never;

function transformValue<T>(value: T): Transform<T> {
  if (typeof value === "string") {
    return value.length as any;
  } else if (typeof value === "number") {
    return value.toString() as any;
  } else if (typeof value === "boolean") {
    return value.toString() as any;
  } else if (Array.isArray(value)) {
    return { length: value.length } as any;
  }
  throw new Error("Unsupported type");
}

const transformedString = transformValue("hello"); // number (5)
const transformedNumber = transformValue(42);      // string ("42")
const transformedArray = transformValue([1, 2, 3]); // { length: 3 }

console.log("类型转换:", { transformedString, transformedNumber, transformedArray });


/**
 * 4. 事件处理器类型推断
 */

// 从事件处理器推断事件类型
type ExtractEvent<T> = T extends (event: infer E) => any ? E : never;

type ClickEvent = { type: "click"; x: number; y: number };
type KeyEvent = { type: "key"; key: string };

function handleClick(event: ClickEvent): void {}
function handleKey(event: KeyEvent): void {}

type ClickEventType = ExtractEvent<typeof handleClick>; // ClickEvent
type KeyEventType = ExtractEvent<typeof handleKey>;     // KeyEvent

console.log("事件类型推断示例编译通过");


// ============================================================
// 七、条件类型与泛型结合
// ============================================================

/**
 * 1. 条件泛型函数
 */

// 根据输入类型返回不同类型
function process<T extends string | number>(input: T): T extends string ? string[] : number {
  if (typeof input === "string") {
    return input.split("") as any;
  }
  return (input as number) * 2 as any;
}

const processResult1 = process("abc"); // string[]
const processResult2 = process(10);    // number

console.log("条件泛型函数:", { processResult1, processResult2 });


/**
 * 2. 重载解析
 */

// 使用条件类型模拟函数重载
type Overload<T extends string | number> = 
  T extends string ? (input: string) => string[] :
  T extends number ? (input: number) => number :
  never;

const overloadedFunc: Overload<string> = (input) => input.split("");
const overloadedFunc2: Overload<number> = (input) => input * 2;

console.log("重载解析示例编译通过");


// ============================================================
// 总结
// ============================================================
/**
 * 条件类型要点回顾：
 * 
 * 1. 基础语法：T extends U ? X : Y
 * 2. infer 关键字：在条件类型中推断类型
 * 3. 分布式条件类型：条件类型作用于联合类型时会自动分发
 * 4. 类型推断：可以提取函数返回值、参数、数组元素、Promise 值等
 * 
 * 常用模式：
 * - 提取类型：ReturnType, Parameters, InstanceType
 * - 过滤类型：Exclude, Extract, NonNullable
 * - 类型检查：IsAny, IsNever, IsUnion
 * 
 * 最佳实践：
 * - 避免过于复杂的条件类型
 * - 使用有意义的类型变量名
 * - 注意分布式条件类型的行为
 * - 使用元组阻止不需要的分布式行为
 */
