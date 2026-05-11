/**
 * ============================================================
 * TypeScript 高级教程 - 映射类型 (Mapped Types)
 * ============================================================
 * 
 * 映射类型允许我们基于现有类型创建新类型，
 * 通过遍历类型的属性来转换类型，是 TypeScript 类型系统的核心特性之一。
 */

// ============================================================
// 一、映射类型基础
// ============================================================

/**
 * 1. 基本语法
 * 
 * 映射类型的基本语法：
 * type MappedType<T> = { [P in keyof T]: T[P] }
 * 
 * 这会遍历 T 的所有属性键 P，并创建相同的新类型。
 */

// 定义一个基础类型
interface Person {
  name: string;
  age: number;
  email: string;
}

// 创建一个简单的映射类型（复制类型）
type CopyPerson = { [P in keyof Person]: Person[P] };
// CopyPerson 与 Person 完全相同

console.log("映射类型基础示例编译通过");


/**
 * 2. keyof 操作符
 * 
 * keyof 用于获取类型的所有属性键组成的联合类型。
 */

interface User {
  id: number;
  username: string;
  isActive: boolean;
}

// keyof User 等价于 "id" | "username" | "isActive"
type UserKeys = keyof User;

// 使用 keyof 创建键类型
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { id: 1, username: "张三", isActive: true };
const userId = getProperty(user, "id");       // number
const userName = getProperty(user, "username"); // string

console.log("keyof 示例:", { userId, userName });


/**
 * 3. in 操作符
 * 
 * in 操作符用于遍历联合类型中的每个类型。
 */

// in 操作符遍历字符串联合类型
type Direction = "up" | "down" | "left" | "right";

// 创建一个方向到坐标变化的对象类型
type DirectionMap = {
  [K in Direction]: [number, number];
};

const moves: DirectionMap = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0]
};

console.log("方向映射:", moves);


// ============================================================
// 二、修饰符 (Modifiers)
// ============================================================

/**
 * 1. readonly 修饰符
 * 
 * 使用 readonly 修饰符可以将所有属性变为只读。
 */

// 将所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

interface Product {
  id: number;
  name: string;
  price: number;
}

type ReadonlyProduct = Readonly<Product>;
// 等价于：
// {
//   readonly id: number;
//   readonly name: string;
//   readonly price: number;
// }

const product: ReadonlyProduct = {
  id: 1,
  name: "笔记本电脑",
  price: 5999
};

// product.price = 4999; // Error: 无法分配到 "price" ，因为它是只读属性

console.log("只读产品:", product);


/**
 * 2. 可选修饰符 (?)
 * 
 * 使用 ? 修饰符可以将所有属性变为可选。
 */

// 将所有属性变为可选
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

interface Config {
  host: string;
  port: number;
  debug: boolean;
}

type PartialConfig = MyPartial<Config>;
// 等价于：
// {
//   host?: string;
//   port?: number;
//   debug?: boolean;
// }

const config: PartialConfig = {
  host: "localhost"
  // port 和 debug 是可选的
};

console.log("部分配置:", config);


/**
 * 3. 移除修饰符 (-)
 * 
 * 使用 - 可以移除修饰符。
 */

// 移除 readonly 修饰符
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

interface ReadonlyUser {
  readonly id: number;
  readonly name: string;
}

type MutableUser = Mutable<ReadonlyUser>;
// id 和 name 不再是只读的

// 移除可选修饰符
type Required<T> = {
  [P in keyof T]-?: T[P];
};

interface OptionalFields {
  name?: string;
  age?: number;
}

type RequiredFields = Required<OptionalFields>;
// name 和 age 变为必需的

console.log("移除修饰符示例编译通过");


/**
 * 4. 组合修饰符
 */

// 同时添加 readonly 和可选修饰符
type ReadonlyPartial<T> = {
  readonly [P in keyof T]?: T[P];
};

interface Article {
  title: string;
  content: string;
  author: string;
}

type ReadonlyPartialArticle = ReadonlyPartial<Article>;

const articleUpdate: ReadonlyPartialArticle = {
  title: "更新后的标题"
  // 其他字段可选且只读
};

console.log("组合修饰符:", articleUpdate);


// ============================================================
// 三、条件映射 (Conditional Mapping)
// ============================================================

/**
 * 1. 根据值类型筛选属性
 */

// 只保留字符串类型的属性
type StringProperties<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface MixedType {
  name: string;
  age: number;
  email: string;
  active: boolean;
}

type OnlyStrings = StringProperties<MixedType>;
// { name: string; email: string; }

const stringOnly: OnlyStrings = {
  name: "张三",
  email: "zhangsan@example.com"
};

console.log("只保留字符串属性:", stringOnly);


/**
 * 2. 根据值类型转换属性
 */

// 将所有字符串属性变为可选
type OptionalStrings<T> = {
  [K in keyof T]: T[K] extends string ? T[K] | undefined : T[K];
};

interface Form {
  name: string;
  age: number;
  email: string;
}

type FormWithOptionalStrings = OptionalStrings<Form>;
// { name: string | undefined; age: number; email: string | undefined; }

console.log("可选字符串属性示例编译通过");


/**
 * 3. 重映射键名 (Key Remapping)
 * 
 * 使用 as 子句可以重映射键名。
 */

// 为所有属性名添加前缀
type Prefixed<T, P extends string> = {
  [K in keyof T as `${P}${Capitalize<K & string>}`]: T[K];
};

interface ApiData {
  id: number;
  name: string;
}

type PrefixedApiData = Prefixed<ApiData, "api">;
// { apiId: number; apiName: string; }

const prefixedData: PrefixedApiData = {
  apiId: 1,
  apiName: "测试数据"
};

console.log("前缀重映射:", prefixedData);


/**
 * 4. 过滤特定键
 */

// 排除特定键
type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

interface SystemConfig {
  name: string;
  version: number;
  debug: boolean;
  count: number;
}

// 排除所有 number 类型的属性
type WithoutNumbers = OmitByType<SystemConfig, number>;
// { name: string; debug: boolean; }

console.log("排除数字类型属性示例编译通过");


// ============================================================
// 四、高级映射类型
// ============================================================

/**
 * 1. 深度映射类型
 */

// 深度可选
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface NestedConfig {
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

type PartialNestedConfig = DeepPartial<NestedConfig>;

const partialNested: PartialNestedConfig = {
  server: {
    host: "localhost",
    options: {
      ssl: true
      // timeout 是可选的
    }
    // port 是可选的
  }
  // database 是可选的
};

console.log("深度可选配置:", partialNested);


/**
 * 2. 深度只读
 */

// 深度只读
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

type ReadonlyNested = DeepReadonly<MutableNested>;

const readonlyNested: ReadonlyNested = {
  user: {
    profile: {
      name: "李四",
      age: 30
    }
  }
};

// readonlyNested.user.profile.name = "王五"; // Error: 只读属性

console.log("深度只读示例编译通过");


/**
 * 3. 值类型转换
 */

// 将所有属性类型转换
type ValueTransformer<T, From, To> = {
  [K in keyof T]: T[K] extends From ? To : T[K];
};

interface StringConfig {
  id: string;
  name: string;
  count: string;
  active: boolean;
}

// 将所有 string 类型转换为 number
type NumberConfig = ValueTransformer<StringConfig, string, number>;
// { id: number; name: number; count: number; active: boolean; }

console.log("值类型转换示例编译通过");


/**
 * 4. 提取/排除属性
 */

// 提取特定类型的属性
type ExtractByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

// Pick 实现
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit 实现
type MyOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

interface FullUser {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 提取用户公开信息
type PublicUser = MyOmit<FullUser, "password">;
// { id: number; name: string; email: string; createdAt: Date; }

// 只提取基本信息
type BasicUser = MyPick<FullUser, "id" | "name">;
// { id: number; name: string; }

console.log("属性提取/排除示例编译通过");


// ============================================================
// 五、映射类型与条件类型结合
// ============================================================

/**
 * 1. 条件属性类型
 */

// 根据属性名决定类型
type PropertyType<T, K extends keyof T> = T[K];

// 根据属性名模式匹配
type GetByPattern<T, Pattern extends string> = {
  [K in keyof T as K extends Pattern ? K : never]: T[K];
};

interface ApiEndpoints {
  getUser: () => User;
  postUser: (user: User) => void;
  getArticle: (id: number) => Article;
  deleteArticle: (id: number) => void;
}

// 提取所有 get 开头的方法
type GetMethods = GetByPattern<ApiEndpoints, `get${string}`>;

console.log("模式匹配属性示例编译通过");


/**
 * 2. 函数类型映射
 */

// 将对象的所有方法变为异步
type AsyncMethods<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R 
    ? (...args: A) => Promise<R> 
    : T[K];
};

interface SyncService {
  getData(): string;
  saveData(data: string): boolean;
  value: number;
}

type AsyncService = AsyncMethods<SyncService>;
// {
//   getData: () => Promise<string>;
//   saveData: (data: string) => Promise<boolean>;
//   value: number;
// }

console.log("异步方法映射示例编译通过");


/**
 * 3. 联合类型分发
 */

// 为联合类型的每个成员创建属性
type UnionToProperties<T extends string> = {
  [K in T]: K;
};

type StatusProperties = UnionToProperties<"pending" | "active" | "completed">;
// { pending: "pending"; active: "active"; completed: "completed"; }

const statusMap: StatusProperties = {
  pending: "pending",
  active: "active",
  completed: "completed"
};

console.log("联合类型映射:", statusMap);


// ============================================================
// 六、实用映射类型示例
// ============================================================

/**
 * 1. 类型安全的 Object.entries
 */

// 获取对象的键值对数组类型
type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

function getEntries<T extends object>(obj: T): Entries<T> {
  return Object.entries(obj) as Entries<T>;
}

const settings = {
  theme: "dark",
  fontSize: 14,
  notifications: true
};

const entries = getEntries(settings);
// 类型为：(["theme", string] | ["fontSize", number] | ["notifications", boolean])[]

console.log("对象条目:", entries);


/**
 * 2. 类型合并
 */

// 合并两个类型（后者覆盖前者）
type Merge<T, U> = Omit<T, keyof U> & U;

interface DefaultConfig {
  host: string;
  port: number;
  debug: boolean;
}

interface UserConfig {
  host: string;
  port: number;
}

type FinalConfig = Merge<DefaultConfig, UserConfig>;
// { debug: boolean; host: string; port: number; }

console.log("类型合并示例编译通过");


/**
 * 3. 必需与可选分离
 */

// 分离必需和可选属性
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface MixedInterface {
  required: string;
  optional?: number;
  anotherRequired: boolean;
  anotherOptional?: Date;
}

type Requireds = RequiredKeys<MixedInterface>;   // "required" | "anotherRequired"
type Optionals = OptionalKeys<MixedInterface>;   // "optional" | "anotherOptional"

console.log("必需键:", Requireds, "可选键:", Optionals);


/**
 * 4. 不可变数据结构
 */

// 创建完全不可变的类型
type Immutable<T> = {
  readonly [P in keyof T]: T[P] extends Function 
    ? T[P] 
    : T[P] extends object 
      ? Immutable<T[P]> 
      : T[P];
};

interface MutableState {
  count: number;
  items: string[];
  nested: {
    value: number;
  };
  increment(): void;
}

type ImmutableState = Immutable<MutableState>;

const state: ImmutableState = {
  count: 0,
  items: ["a", "b"],
  nested: {
    value: 42
  },
  increment: () => {}
};

// state.count = 1;           // Error
// state.items.push("c");      // Error
// state.nested.value = 100;   // Error

console.log("不可变状态:", state);


/**
 * 5. 属性重命名
 */

// 将下划线命名转换为驼峰命名
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;

type CamelCaseKeys<T> = {
  [K in keyof T as SnakeToCamel<K & string>]: T[K];
};

interface SnakeCaseApi {
  user_id: number;
  user_name: string;
  created_at: string;
  is_active: boolean;
}

type CamelCaseApi = CamelCaseKeys<SnakeCaseApi>;
// { userId: number; userName: string; createdAt: string; isActive: boolean; }

console.log("驼峰转换示例编译通过");


/**
 * 6. 类型安全的合并
 */

// 深度合并类型
type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: 
    K extends keyof T 
      ? K extends keyof U 
        ? T[K] extends object 
          ? U[K] extends object 
            ? DeepMerge<T[K], U[K]> 
            : U[K]
          : U[K]
        : T[K]
      : K extends keyof U 
        ? U[K] 
        : never;
};

interface BaseConfig {
  server: {
    host: string;
    port: number;
  };
  features: {
    auth: boolean;
  };
}

interface OverrideConfig {
  server: {
    port: number;
    ssl: boolean;
  };
  features: {
    auth: boolean;
    logging: boolean;
  };
}

type MergedConfig = DeepMerge<BaseConfig, OverrideConfig>;
// {
//   server: { host: string; port: number; ssl: boolean };
//   features: { auth: boolean; logging: boolean };
// }

console.log("深度合并示例编译通过");


// ============================================================
// 七、映射类型最佳实践
// ============================================================

/**
 * 1. 保持简单
 */

// 好的做法：简单的映射类型
type SimplePartial<T> = {
  [K in keyof T]?: T[K];
};

// 避免：过于复杂的映射类型
// 如果映射类型难以理解，考虑拆分成多个步骤


/**
 * 2. 使用内置工具类型
 */

// TypeScript 提供了许多内置工具类型
// 在自定义之前，检查是否有内置的可以使用

// 内置：Partial, Required, Readonly, Pick, Omit, Record, etc.

// 示例：使用内置类型
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;
type TodoUpdate = Partial<Todo>;

console.log("内置工具类型示例编译通过");


/**
 * 3. 类型推断优先
 */

// 让 TypeScript 推断类型，而不是显式指定
function createConfig<T extends object>(config: T): Readonly<T> {
  return Object.freeze({ ...config });
}

// 类型会自动推断
const appConfig = createConfig({
  apiUrl: "https://api.example.com",
  timeout: 5000
});
// appConfig 的类型自动推断为 Readonly<{ apiUrl: string; timeout: number; }>

console.log("类型推断配置:", appConfig);


// ============================================================
// 总结
// ============================================================
/**
 * 映射类型要点回顾：
 * 
 * 1. 基础语法：{ [P in keyof T]: T[P] }
 * 2. keyof 操作符：获取类型的所有属性键
 * 3. in 操作符：遍历联合类型
 * 4. 修饰符：readonly, ?, -readonly, -?
 * 5. 键重映射：as 子句重命名或过滤键
 * 6. 条件映射：结合条件类型进行复杂转换
 * 
 * 常用模式：
 * - Partial/Required/Readonly：修改属性修饰符
 * - Pick/Omit：选择或排除属性
 * - Record：创建键值对类型
 * - 深度映射：递归处理嵌套对象
 * 
 * 最佳实践：
 * - 优先使用内置工具类型
 * - 保持映射类型的简单性
 * - 利用类型推断减少显式类型标注
 * - 将复杂映射拆分为多个步骤
 */
