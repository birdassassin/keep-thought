/**
 * ============================================================
 * TypeScript 高级教程 - 内置工具类型 (Utility Types)
 * ============================================================
 * 
 * TypeScript 提供了丰富的内置工具类型，用于类型转换和操作。
 * 掌握这些工具类型可以大大提高开发效率和代码质量。
 */

// ============================================================
// 一、属性修饰工具类型
// ============================================================

/**
 * 1. Partial<T> - 将所有属性变为可选
 * 
 * 构造一个类型，将 T 的所有属性设为可选。
 */

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// 使用 Partial 创建部分用户
const partialUser: Partial<User> = {
  name: "张三"
  // 其他属性都是可选的
};

console.log("Partial 用户:", partialUser);

// Partial 的实现原理
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};


/**
 * 2. Required<T> - 将所有属性变为必需
 * 
 * 构造一个类型，将 T 的所有属性设为必需。
 */

interface OptionalUser {
  id?: number;
  name?: string;
  email?: string;
}

// 使用 Required 创建必需用户
const requiredUser: Required<OptionalUser> = {
  id: 1,
  name: "李四",
  email: "lisi@example.com"
  // 所有属性都必须提供
};

console.log("Required 用户:", requiredUser);

// Required 的实现原理
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};


/**
 * 3. Readonly<T> - 将所有属性变为只读
 * 
 * 构造一个类型，将 T 的所有属性设为只读。
 */

interface MutableUser {
  id: number;
  name: string;
  preferences: {
    theme: string;
    language: string;
  };
}

// 使用 Readonly 创建只读用户
const readonlyUser: Readonly<MutableUser> = {
  id: 1,
  name: "王五",
  preferences: {
    theme: "dark",
    language: "zh-CN"
  }
};

// readonlyUser.name = "赵六"; // Error: 无法分配到 "name" ，因为它是只读属性
// readonlyUser.id = 2;        // Error

console.log("Readonly 用户:", readonlyUser);

// Readonly 的实现原理
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};


// ============================================================
// 二、属性选择工具类型
// ============================================================

/**
 * 1. Pick<T, K> - 选择特定属性
 * 
 * 从 T 中选择一组属性 K，构造一个新类型。
 */

interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

// 只选择文章的基本信息
type ArticlePreview = Pick<Article, "id" | "title" | "author">;

const preview: ArticlePreview = {
  id: 1,
  title: "TypeScript 高级教程",
  author: "张三"
};

console.log("文章预览:", preview);

// Pick 的实现原理
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};


/**
 * 2. Omit<T, K> - 排除特定属性
 * 
 * 从 T 中排除一组属性 K，构造一个新类型。
 */

interface SensitiveUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

// 排除敏感信息
type PublicUserInfo = Omit<SensitiveUser, "password" | "role">;

const publicInfo: PublicUserInfo = {
  id: 1,
  name: "张三",
  email: "zhangsan@example.com"
};

console.log("公开用户信息:", publicInfo);

// Omit 的实现原理
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;


/**
 * 3. Extract<T, U> - 提取可赋值给 U 的类型
 * 
 * 从 T 中提取可以赋值给 U 的类型。
 */

type AllTypes = string | number | boolean | null | undefined;

// 只提取字符串和数字
type StringOrNumber = Extract<AllTypes, string | number>;
// string | number

// 提取特定字面量
type Status = "pending" | "active" | "completed" | "failed";
type SuccessStatus = Extract<Status, "active" | "completed">;
// "active" | "completed"

console.log("Extract 示例编译通过");


/**
 * 4. Exclude<T, U> - 排除可赋值给 U 的类型
 * 
 * 从 T 中排除可以赋值给 U 的类型。
 */

type MixedTypes = string | number | boolean | null;

// 排除 null
type NonNull = Exclude<MixedTypes, null>;
// string | number | boolean

// 排除多个类型
type Primitive = Exclude<MixedTypes, null | boolean>;
// string | number

console.log("Exclude 示例编译通过");


// ============================================================
// 三、记录类型工具
// ============================================================

/**
 * 1. Record<K, T> - 构造键值对类型
 * 
 * 构造一个对象类型，其属性键为 K，属性值为 T。
 */

// 使用字符串键
type UserRoles = Record<string, "admin" | "user" | "guest">;

const roles: UserRoles = {
  alice: "admin",
  bob: "user",
  charlie: "guest"
};

console.log("用户角色:", roles);

// 使用字面量键
type HttpStatus = Record<200 | 404 | 500, string>;

const statusMessages: HttpStatus = {
  200: "OK",
  404: "Not Found",
  500: "Internal Server Error"
};

console.log("HTTP状态:", statusMessages);

// Record 的实现原理
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};


/**
 * 2. Record 与映射结合
 */

// 创建配置映射
type Environment = "development" | "staging" | "production";

interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
}

type DatabaseConfigs = Record<Environment, DatabaseConfig>;

const dbConfigs: DatabaseConfigs = {
  development: { host: "localhost", port: 5432, name: "dev_db" },
  staging: { host: "staging.db.com", port: 5432, name: "staging_db" },
  production: { host: "prod.db.com", port: 5432, name: "prod_db" }
};

console.log("数据库配置:", dbConfigs);


// ============================================================
// 四、函数类型工具
// ============================================================

/**
 * 1. ReturnType<T> - 获取函数返回类型
 * 
 * 获取函数类型 T 的返回类型。
 */

function fetchUser() {
  return { id: 1, name: "张三", email: "zhangsan@example.com" };
}

// 自动推断返回类型
type UserResponse = ReturnType<typeof fetchUser>;
// { id: number; name: string; email: string; }

const user: UserResponse = fetchUser();
console.log("用户响应:", user);

// 异步函数返回类型
async function fetchProducts() {
  return [
    { id: 1, name: "产品1", price: 100 },
    { id: 2, name: "产品2", price: 200 }
  ];
}

type ProductsResponse = ReturnType<typeof fetchProducts>;
// Promise<{ id: number; name: string; price: number }[]>

// ReturnType 的实现原理
type MyReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : any;


/**
 * 2. Parameters<T> - 获取函数参数类型
 * 
 * 获取函数类型 T 的参数类型组成的元组。
 */

function createUser(name: string, age: number, active: boolean = true) {
  return { name, age, active };
}

type CreateUserParams = Parameters<typeof createUser>;
// [string, number, boolean?]

const params: CreateUserParams = ["李四", 25];
console.log("创建用户参数:", params);

// Parameters 的实现原理
type MyParameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;


/**
 * 3. ConstructorParameters<T> - 获取构造函数参数类型
 * 
 * 获取构造函数类型 T 的参数类型组成的元组。
 */

class Person {
  constructor(
    public name: string,
    public age: number,
    public city: string = "北京"
  ) {}
}

type PersonParams = ConstructorParameters<typeof Person>;
// [string, number, string?]

const personParams: PersonParams = ["王五", 30];
console.log("Person 参数:", personParams);


/**
 * 4. InstanceType<T> - 获取构造函数实例类型
 * 
 * 获取构造函数类型 T 的实例类型。
 */

type PersonInstance = InstanceType<typeof Person>;
// Person

const person: PersonInstance = new Person("赵六", 25);
console.log("Person 实例:", person);

// InstanceType 的实现原理
type MyInstanceType<T extends new (...args: any) => any> = 
  T extends new (...args: any) => infer R ? R : any;


// ============================================================
// 五、其他内置工具类型
// ============================================================

/**
 * 1. NonNullable<T> - 排除 null 和 undefined
 * 
 * 从 T 中排除 null 和 undefined。
 */

type NullableString = string | null | undefined;
type NonNullableString = NonNullable<NullableString>;
// string

// 在处理可能为空的值时很有用
function processValue<T>(value: NonNullable<T>) {
  return value;
}

// processValue(null);      // Error
// processValue(undefined); // Error
processValue("hello");      // OK

console.log("NonNullable 示例编译通过");


/**
 * 2. Awaited<T> - 获取 Promise 解析类型
 * 
 * 获取 Promise 解析后的类型（TypeScript 4.5+）。
 */

type PromiseResult = Awaited<Promise<string>>;
// string

type NestedPromise = Awaited<Promise<Promise<number>>>;
// number

// 实际应用
async function getData() {
  const result: Awaited<ReturnType<typeof fetchProducts>> = await fetchProducts();
  return result;
}

console.log("Awaited 示例编译通过");


/**
 * 3. Uppercase<T> / Lowercase<T> - 字符串大小写转换
 */

type Upper = Uppercase<"hello">;     // "HELLO"
type Lower = Lowercase<"WORLD">;     // "world"
type Cap = Capitalize<"hello">;      // "Hello"
type Uncap = Uncapitalize<"Hello">;  // "hello"

console.log("字符串转换:", { Upper: "HELLO", Lower: "world", Cap: "Hello", Uncap: "hello" });


/**
 * 4. ThisParameterType<T> - 获取 this 参数类型
 * 
 * 获取函数类型 T 中 this 参数的类型。
 */

interface Dog {
  name: string;
  bark(this: Dog): void;
}

type DogThis = ThisParameterType<Dog["bark"]>;
// Dog

console.log("ThisParameterType 示例编译通过");


/**
 * 5. OmitThisParameter<T> - 移除 this 参数
 * 
 * 从函数类型 T 中移除 this 参数。
 */

type BarkWithoutThis = OmitThisParameter<Dog["bark"]>;
// () => void

console.log("OmitThisParameter 示例编译通过");


/**
 * 6. ThisType<T> - this 类型标记
 * 
 * 用于标记对象的 this 类型（需要在 noImplicitThis 选项下使用）。
 */

interface PersonContext {
  name: string;
  greet(): void;
}

const personContext: PersonContext & ThisType<PersonContext> = {
  name: "张三",
  greet() {
    console.log(`你好，我是 ${this.name}`);
  }
};

personContext.greet();


// ============================================================
// 六、自定义工具类型
// ============================================================

/**
 * 1. 深度 Partial
 */

// 递归地将所有属性变为可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface DeepConfig {
  server: {
    host: string;
    port: number;
    options: {
      ssl: boolean;
      timeout: number;
    };
  };
  database: {
    name: string;
    url: string;
  };
}

const partialConfig: DeepPartial<DeepConfig> = {
  server: {
    host: "localhost"
    // port 和 options 都是可选的
  }
  // database 是可选的
};

console.log("深度 Partial:", partialConfig);


/**
 * 2. 深度 Readonly
 */

// 递归地将所有属性变为只读
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

interface MutableNested {
  user: {
    profile: {
      name: string;
      age: number;
    };
  };
}

const readonlyNested: DeepReadonly<MutableNested> = {
  user: {
    profile: {
      name: "李四",
      age: 30
    }
  }
};

// readonlyNested.user.profile.name = "王五"; // Error

console.log("深度 Readonly:", readonlyNested);


/**
 * 3. 必需键和可选键提取
 */

// 获取所有必需键
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// 获取所有可选键
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface MixedProps {
  required: string;
  optional?: number;
  anotherRequired: boolean;
  anotherOptional?: Date;
}

type Requireds = RequiredKeys<MixedProps>;   // "required" | "anotherRequired"
type Optionals = OptionalKeys<MixedProps>;   // "optional" | "anotherOptional"

console.log("必需键和可选键:", { Requireds: '"required" | "anotherRequired"', Optionals: '"optional" | "anotherOptional"' });


/**
 * 4. 类型合并
 */

// 合并两个类型（后者覆盖前者）
type Merge<T, U> = Omit<T, keyof U> & U;

interface DefaultOptions {
  host: string;
  port: number;
  debug: boolean;
}

interface UserOptions {
  port: number;
  debug: boolean;
}

type MergedOptions = Merge<DefaultOptions, UserOptions>;
// { host: string; port: number; debug: boolean; }

console.log("类型合并示例编译通过");


/**
 * 5. 值类型提取
 */

// 提取特定值类型的键
type KeysByValueType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

interface MixedValueTypes {
  name: string;
  age: number;
  email: string;
  active: boolean;
  count: number;
}

type StringKeys = KeysByValueType<MixedValueTypes, string>;
// "name" | "email"

type NumberKeys = KeysByValueType<MixedValueTypes, number>;
// "age" | "count"

console.log("值类型键:", { StringKeys: '"name" | "email"', NumberKeys: '"age" | "count"' });


/**
 * 6. 不可变类型
 */

// 创建完全不可变的类型
type Immutable<T> = {
  readonly [P in keyof T]: T[P] extends Function 
    ? T[P] 
    : T[P] extends object 
      ? Immutable<T[P]> 
      : T[P];
};

interface State {
  count: number;
  items: string[];
  nested: {
    value: number;
  };
  increment(): void;
}

const immutableState: Immutable<State> = {
  count: 0,
  items: ["a", "b"],
  nested: {
    value: 42
  },
  increment: () => {}
};

// immutableState.count = 1;        // Error
// immutableState.items.push("c");  // Error

console.log("不可变状态:", immutableState);


/**
 * 7. 函数重载工具
 */

// 提取函数重载的所有返回类型
type AllReturnTypes<T> = T extends (...args: any[]) => infer R ? R : never;

// 将同步函数转换为异步
type Promisify<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R 
    ? (...args: A) => Promise<R> 
    : T[K];
};

interface SyncApi {
  getUser(id: number): User;
  saveUser(user: User): boolean;
  deleteUser(id: number): void;
}

type AsyncApi = Promisify<SyncApi>;
// {
//   getUser: (id: number) => Promise<User>;
//   saveUser: (user: User) => Promise<boolean>;
//   deleteUser: (id: number) => Promise<void>;
// }

console.log("异步 API 示例编译通过");


/**
 * 8. 联合类型转交叉类型
 */

// 将联合类型转换为交叉类型
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type Union = { a: string } | { b: number };
type Intersection = UnionToIntersection<Union>;
// { a: string } & { b: number }

console.log("联合转交叉示例编译通过");


// ============================================================
// 七、工具类型实战案例
// ============================================================

/**
 * 1. 类型安全的 Object.keys
 */

// 更安全的 Object.keys
function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3
};

const keys = typedKeys(config); // ("apiUrl" | "timeout" | "retries")[]
console.log("类型安全的 keys:", keys);


/**
 * 2. 类型安全的 assign
 */

// 类型安全的对象合并
function typedAssign<T extends object, U extends object>(target: T, source: U): T & U {
  return { ...target, ...source };
}

const base = { name: "张三", age: 25 };
const extra = { city: "北京", active: true };

const merged = typedAssign(base, extra);
console.log("合并对象:", merged);


/**
 * 3. 类型安全的 pick
 */

// 类型安全的属性选择
function typedPick<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const fullUser = { id: 1, name: "李四", email: "lisi@example.com", password: "secret" };
const safeUser = typedPick(fullUser, "id", "name", "email");
console.log("安全用户:", safeUser);


/**
 * 4. 类型安全的 omit
 */

// 类型安全的属性排除
function typedOmit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

const sensitiveUser = { id: 1, name: "王五", password: "secret", role: "admin" };
const publicUser = typedOmit(sensitiveUser, "password", "role");
console.log("公开用户:", publicUser);


/**
 * 5. 类型安全的冻结
 */

// 深度冻结对象
function deepFreeze<T extends object>(obj: T): Readonly<T> {
  const result = { ...obj };
  Object.keys(result).forEach(key => {
    const value = (result as any)[key];
    if (typeof value === "object" && value !== null) {
      (result as any)[key] = deepFreeze(value);
    }
  });
  return Object.freeze(result) as Readonly<T>;
}

const mutableConfig = {
  server: { host: "localhost", port: 3000 },
  features: { auth: true }
};

const frozenConfig = deepFreeze(mutableConfig);
console.log("冻结配置:", frozenConfig);


// ============================================================
// 总结
// ============================================================
/**
 * 内置工具类型要点回顾：
 * 
 * 1. 属性修饰：
 *    - Partial<T>：所有属性可选
 *    - Required<T>：所有属性必需
 *    - Readonly<T>：所有属性只读
 * 
 * 2. 属性选择：
 *    - Pick<T, K>：选择特定属性
 *    - Omit<T, K>：排除特定属性
 *    - Extract<T, U>：提取可赋值的类型
 *    - Exclude<T, U>：排除可赋值的类型
 * 
 * 3. 记录类型：
 *    - Record<K, T>：构造键值对类型
 * 
 * 4. 函数类型：
 *    - ReturnType<T>：获取返回类型
 *    - Parameters<T>：获取参数类型
 *    - ConstructorParameters<T>：获取构造函数参数
 *    - InstanceType<T>：获取实例类型
 * 
 * 5. 其他：
 *    - NonNullable<T>：排除 null 和 undefined
 *    - Awaited<T>：获取 Promise 解析类型
 *    - Uppercase/Lowercase/Capitalize/Uncapitalize：字符串转换
 * 
 * 最佳实践：
 * - 优先使用内置工具类型
 * - 组合使用多个工具类型
 * - 为特定需求创建自定义工具类型
 * - 保持工具类型的可读性和可维护性
 */
