/**
 * ============================================================
 * TypeScript 高级教程 - 模板字面量类型 (Template Literal Types)
 * ============================================================
 * 
 * 模板字面量类型是 TypeScript 4.1 引入的强大特性，
 * 它允许我们在类型层面操作字符串，实现字符串的类型级编程。
 */

// ============================================================
// 一、模板字面量类型基础
// ============================================================

/**
 * 1. 基本语法
 * 
 * 模板字面量类型使用反引号 ` ` 定义，语法与 JavaScript 的模板字符串类似。
 */

// 简单的模板字面量类型
type Greeting = `hello ${string}`;

const message1: Greeting = "hello world";     // OK
const message2: Greeting = "hello TypeScript"; // OK
// const message3: Greeting = "hi world";      // Error: 不匹配模式

console.log("模板字面量类型:", message1, message2);


/**
 * 2. 内置字符串类型
 * 
 * TypeScript 提供了四种内置的字符串类型：
 * - string：任意字符串
 * - number：数字（会被转换为字符串）
 * - boolean：布尔值（会被转换为字符串）
 * - bigint：大整数（会被转换为字符串）
 */

// 使用不同的内置类型
type StringTemplate = `value is ${string}`;
type NumberTemplate = `count is ${number}`;
type BooleanTemplate = `enabled is ${boolean}`;

const str: StringTemplate = "value is anything";
const num: NumberTemplate = "count is 42";
const bool: BooleanTemplate = "enabled is true";

console.log("内置类型模板:", { str, num, bool });


/**
 * 3. 字面量联合类型
 * 
 * 当模板字面量中包含联合类型时，会自动展开为所有可能的组合。
 */

// 联合类型展开
type Color = "red" | "blue" | "green";
type Size = "small" | "medium" | "large";

type ColorSize = `${Color}-${Size}`;
// 展开为：
// "red-small" | "red-medium" | "red-large" |
// "blue-small" | "blue-medium" | "blue-large" |
// "green-small" | "green-medium" | "green-large"

const style: ColorSize = "red-large";
console.log("颜色尺寸:", style);


/**
 * 4. 数字字面量联合
 */

// 数字联合类型
type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type TwoDigit = `${Digit}${Digit}`;
// 展开为 "00" | "01" | "02" ... | "99"

const score: TwoDigit = "42";
console.log("两位数:", score);


// ============================================================
// 二、字符串推断
// ============================================================

/**
 * 1. infer 关键字与模板字面量
 * 
 * 我们可以在模板字面量类型中使用 infer 来推断字符串的某部分。
 */

// 提取字符串的某部分
type ExtractPrefix<T extends string> = T extends `${infer Prefix}_${string}` 
  ? Prefix 
  : T;

type Prefix1 = ExtractPrefix<"user_name">;     // "user"
type Prefix2 = ExtractPrefix<"product_id">;    // "product"
type Prefix3 = ExtractPrefix<"simple">;        // "simple"

console.log("前缀提取:", { Prefix1: "user", Prefix2: "product", Prefix3: "simple" });


/**
 * 2. 提取后缀
 */

// 提取后缀
type ExtractSuffix<T extends string> = T extends `${string}_${infer Suffix}` 
  ? Suffix 
  : T;

type Suffix1 = ExtractSuffix<"user_name">;   // "name"
type Suffix2 = ExtractSuffix<"config_json">; // "json"

console.log("后缀提取:", { Suffix1: "name", Suffix2: "json" });


/**
 * 3. 分割字符串
 */

// 将字符串按分隔符分割
type Split<S extends string, D extends string> = 
  S extends `${infer Head}${D}${infer Tail}` 
    ? [Head, ...Split<Tail, D>] 
    : S extends '' 
      ? [] 
      : [S];

type Parts = Split<"a-b-c-d", "-">; // ["a", "b", "c", "d"]
type Words = Split<"hello world", " ">; // ["hello", "world"]

console.log("字符串分割:", { Parts: ["a", "b", "c", "d"], Words: ["hello", "world"] });


/**
 * 4. 替换字符串
 */

// 替换第一个匹配
type Replace<S extends string, From extends string, To extends string> = 
  From extends '' 
    ? S 
    : S extends `${infer Before}${From}${infer After}` 
      ? `${Before}${To}${After}` 
      : S;

type Replaced = Replace<"hello world", "world", "TypeScript">; // "hello TypeScript"

// 替换所有匹配
type ReplaceAll<S extends string, From extends string, To extends string> = 
  From extends '' 
    ? S 
    : S extends `${infer Before}${From}${infer After}` 
      ? ReplaceAll<`${Before}${To}${After}`, From, To> 
      : S;

type ReplacedAll = ReplaceAll<"a-b-c-d", "-", "_">; // "a_b_c_d"

console.log("字符串替换:", { Replaced: "hello TypeScript", ReplacedAll: "a_b_c_d" });


// ============================================================
// 三、内置字符串工具类型
// ============================================================

/**
 * TypeScript 4.1+ 提供了四个内置的字符串工具类型：
 * - Uppercase：转大写
 * - Lowercase：转小写
 * - Capitalize：首字母大写
 * - Uncapitalize：首字母小写
 */

/**
 * 1. Uppercase - 转大写
 */
type UppercaseHello = Uppercase<"hello">;        // "HELLO"
type UppercaseWorld = Uppercase<"world">;       // "WORLD"
type UppercaseMixed = Uppercase<"Hello World">; // "HELLO WORLD"

console.log("大写转换:", { UppercaseHello: "HELLO", UppercaseWorld: "WORLD" });


/**
 * 2. Lowercase - 转小写
 */
type LowercaseHello = Lowercase<"HELLO">;       // "hello"
type LowercaseWorld = Lowercase<"WORLD">;       // "world"
type LowercaseMixed = Lowercase<"Hello World">; // "hello world"

console.log("小写转换:", { LowercaseHello: "hello", LowercaseWorld: "world" });


/**
 * 3. Capitalize - 首字母大写
 */
type CapitalizeHello = Capitalize<"hello">;     // "Hello"
type CapitalizeWorld = Capitalize<"world">;     // "World"

console.log("首字母大写:", { CapitalizeHello: "Hello", CapitalizeWorld: "World" });


/**
 * 4. Uncapitalize - 首字母小写
 */
type UncapitalizeHello = Uncapitalize<"Hello">; // "hello"
type UncapitalizeWorld = Uncapitalize<"World">; // "world"

console.log("首字母小写:", { UncapitalizeHello: "hello", UncapitalizeWorld: "world" });


// ============================================================
// 四、联合分发
// ============================================================

/**
 * 1. 联合类型自动展开
 * 
 * 当模板字面量中包含联合类型时，会自动进行笛卡尔积展开。
 */

// 方法名生成
type Methods = "get" | "post" | "put" | "delete";
type ApiMethod = `${Uppercase<Methods>}Request`;
// "GETRequest" | "POSTRequest" | "PUTRequest" | "DELETERequest"

const apiCall: ApiMethod = "GETRequest";
console.log("API方法:", apiCall);


/**
 * 2. 事件名生成
 */

// 事件处理器命名
type EventName = "click" | "focus" | "blur" | "change";
type EventHandler = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur" | "onChange"

const handler: EventHandler = "onClick";
console.log("事件处理器:", handler);


/**
 * 3. 状态管理
 */

// 状态动作命名
type State = "pending" | "loading" | "success" | "error";
type Action = `set${Capitalize<State>}` | `is${Capitalize<State>}`;
// "setPending" | "setLoading" | "setSuccess" | "setError" |
// "isPending" | "isLoading" | "isSuccess" | "isError"

const action: Action = "setLoading";
console.log("状态动作:", action);


/**
 * 4. 复杂联合展开
 */

// 多重联合展开
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiVersion = "v1" | "v2" | "v3";
type Endpoint = "users" | "products" | "orders";

type ApiPath = `/${ApiVersion}/${Endpoint}`;
// "/v1/users" | "/v1/products" | "/v1/orders" |
// "/v2/users" | "/v2/products" | "/v2/orders" |
// "/v3/users" | "/v3/products" | "/v3/orders"

type ApiRoute = `${HttpMethod} ${ApiPath}`;
// "GET /v1/users" | "GET /v1/products" | ... (共 36 种组合)

const route: ApiRoute = "GET /v1/users";
console.log("API路由:", route);


// ============================================================
// 五、高级应用
// ============================================================

/**
 * 1. 驼峰转换
 */

// 下划线转驼峰
type SnakeToCamel<S extends string> = 
  S extends `${infer T}_${infer U}` 
    ? `${T}${Capitalize<SnakeToCamel<U>>}` 
    : S;

type CamelCase1 = SnakeToCamel<"user_name">;           // "userName"
type CamelCase2 = SnakeToCamel<"user_profile_id">;     // "userProfileId"
type CamelCase3 = SnakeToCamel<"api_endpoint_url">;    // "apiEndpointUrl"

console.log("下划线转驼峰:", { CamelCase1: "userName", CamelCase2: "userProfileId" });


/**
 * 2. 驼峰转下划线
 */

// 驼峰转下划线
type CamelToSnake<S extends string> = 
  S extends `${infer T}${infer U}` 
    ? T extends Uppercase<T> 
      ? `${Lowercase<T>}${CamelToSnake<U>}` 
      : `_${Lowercase<T>}${CamelToSnake<U>}` 
    : S;

type SnakeCase1 = CamelToSnake<"userName">;        // "user_name"
type SnakeCase2 = CamelToSnake<"userProfileId">;   // "user_profile_id"

console.log("驼峰转下划线:", { SnakeCase1: "user_name", SnakeCase2: "user_profile_id" });


/**
 * 3. 类型安全的 getter/setter
 */

// 自动生成 getter 和 setter 方法名
type GetterSetter<T extends string> = {
  [K in T as `get${Capitalize<K>}`]: () => void;
} & {
  [K in T as `set${Capitalize<K>}`]: (value: any) => void;
};

type UserMethods = GetterSetter<"name" | "age" | "email">;
// {
//   getName: () => void;
//   getAge: () => void;
//   getEmail: () => void;
//   setName: (value: any) => void;
//   setAge: (value: any) => void;
//   setEmail: (value: any) => void;
// }

console.log("Getter/Setter 生成示例编译通过");


/**
 * 4. 类型安全的对象路径
 */

// 深度路径类型
type Path<T, K extends keyof T = keyof T> = 
  K extends string | number 
    ? T[K] extends object 
      ? K | `${K}.${Path<T[K]>}` 
      : K 
    : never;

interface DeepObject {
  user: {
    profile: {
      name: string;
      age: number;
    };
    settings: {
      theme: string;
    };
  };
  app: {
    version: string;
  };
}

type DeepPath = Path<DeepObject>;
// "user" | "user.profile" | "user.profile.name" | "user.profile.age" | 
// "user.settings" | "user.settings.theme" | "app" | "app.version"

console.log("深度路径类型示例编译通过");


/**
 * 5. 字符串验证
 */

// 邮箱格式验证（简化版）
type Email = `${string}@${string}.${string}`;

const validEmail: Email = "user@example.com";
// const invalidEmail: Email = "invalid-email"; // Error

console.log("邮箱验证:", validEmail);


// URL 格式验证（简化版）
type HttpUrl = `http${"s" | ""}://${string}`;

const secureUrl: HttpUrl = "https://example.com";
const normalUrl: HttpUrl = "http://example.com";

console.log("URL验证:", { secureUrl, normalUrl });


/**
 * 6. CSS 类名生成
 */

// CSS BEM 命名
type BEM<Block extends string, Element extends string, Modifier extends string> = 
  `${Block}__${Element}${Modifier extends string ? `--${Modifier}` : ""}`;

type ButtonClass = BEM<"button", "icon", "active">;  // "button__icon--active"
type InputClass = BEM<"input", "label", "">;         // "input__label"

const buttonClass: ButtonClass = "button__icon--active";
console.log("BEM类名:", buttonClass);


// ============================================================
// 六、实战案例
// ============================================================

/**
 * 1. 类型安全的路由系统
 */

// 路由参数提取
type ExtractParams<Path extends string> = 
  Path extends `${string}:${infer Param}/${infer Rest}` 
    ? Param | ExtractParams<Rest> 
    : Path extends `${string}:${infer Param}` 
      ? Param 
      : never;

type UserParams = ExtractParams<"/users/:id/posts/:postId">; // "id" | "postId"

// 路由配置类型
interface RouteConfig<Path extends string> {
  path: Path;
  params: Record<ExtractParams<Path>, string>;
}

const userRoute: RouteConfig<"/users/:id"> = {
  path: "/users/:id",
  params: { id: "123" }
};

console.log("路由配置:", userRoute);


/**
 * 2. 类型安全的 CSS-in-JS
 */

// CSS 属性类型
type CSSProperty = 
  | "color" 
  | "background" 
  | "fontSize" 
  | "margin" 
  | "padding";

// 自动生成 CSS 属性类型
type CSSProperties = {
  [K in CSSProperty]?: string;
} & {
  [K in CSSProperty as `${K}Top`]?: string;
} & {
  [K in CSSProperty as `${K}Bottom`]?: string;
} & {
  [K in CSSProperty as `${K}Left`]?: string;
} & {
  [K in CSSProperty as `${K}Right`]?: string;
};

const styles: CSSProperties = {
  color: "red",
  marginTop: "10px",
  padding: "20px"
};

console.log("CSS样式:", styles);


/**
 * 3. 类型安全的 Redux Action
 */

// 自动生成 action 类型
type ActionCreator<T extends string> = {
  type: T;
} & {
  [K in `${T}Action`]: () => { type: T };
};

type UserAction = ActionCreator<"SET_USER">;
// { type: "SET_USER"; SET_USERAction: () => { type: "SET_USER" } }

// Action 类型生成器
type ActionTypes<Action extends string> = {
  [K in Action as `${Capitalize<K>}`]: { type: K };
};

type TodoActions = ActionTypes<"add_todo" | "remove_todo" | "toggle_todo">;
// {
//   Add_todo: { type: "add_todo" };
//   Remove_todo: { type: "remove_todo" };
//   Toggle_todo: { type: "toggle_todo" };
// }

console.log("Redux Action 示例编译通过");


/**
 * 4. 类型安全的 API 客户端
 */

// HTTP 方法
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// API 端点配置
interface ApiEndpoint<Method extends HTTPMethod, Path extends string> {
  method: Method;
  path: Path;
  params: ExtractParams<Path>;
}

// API 客户端类型
type ApiClient = {
  [M in HTTPMethod as Lowercase<M>]: <Path extends string>(
    path: Path,
    params?: Record<ExtractParams<Path>, string>
  ) => Promise<any>;
};

// 模拟 API 客户端
const apiClient: ApiClient = {
  get: async (path, params) => ({ data: {} }),
  post: async (path, params) => ({ data: {} }),
  put: async (path, params) => ({ data: {} }),
  delete: async (path, params) => ({ data: {} }),
  patch: async (path, params) => ({ data: {} })
};

console.log("API客户端示例编译通过");


/**
 * 5. 国际化键生成
 */

// 国际化键类型
type I18nKey<T extends string> = `i18n.${T}`;

type TranslationKey = I18nKey<"welcome" | "goodbye" | "error">;
// "i18n.welcome" | "i18n.goodbye" | "i18n.error"

// 嵌套翻译键
type NestedI18nKey<T extends object, Prefix extends string = ""> = 
  T extends string 
    ? Prefix 
    : {
        [K in keyof T]: T[K] extends object 
          ? NestedI18nKey<T[K], `${Prefix}${K}.`> 
          : `${Prefix}${K}`;
      }[keyof T];

interface Translations {
  common: {
    save: string;
    cancel: string;
  };
  errors: {
    notFound: string;
    serverError: string;
  };
}

type TranslationKeys = NestedI18nKey<Translations>;
// "common.save" | "common.cancel" | "errors.notFound" | "errors.serverError"

console.log("国际化键示例编译通过");


// ============================================================
// 七、模板字面量类型最佳实践
// ============================================================

/**
 * 1. 避免过度展开
 */

// 注意：联合类型展开可能导致类型数量爆炸
// 例如：10 个联合类型各 10 个选项 = 10^10 种组合

// 好的做法：限制联合类型的规模
type LimitedColor = "red" | "blue" | "green";  // 3 个选项
type LimitedSize = "sm" | "md" | "lg";          // 3 个选项
type SafeCombination = `${LimitedColor}-${LimitedSize}`; // 9 种组合

console.log("安全组合示例编译通过");


/**
 * 2. 使用类型推断
 */

// 让 TypeScript 推断模板字面量类型
function createApiPath<Endpoint extends string>(endpoint: Endpoint): `/api/${Endpoint}` {
  return `/api/${endpoint}` as any;
}

const usersPath = createApiPath("users"); // 类型为 "/api/users"
const productsPath = createApiPath("products"); // 类型为 "/api/products"

console.log("API路径:", { usersPath, productsPath });


/**
 * 3. 结合映射类型
 */

// 使用模板字面量和映射类型创建类型安全的配置
type ConfigKeys = "host" | "port" | "debug";

type EnvConfig = {
  [K in ConfigKeys as `VITE_${Uppercase<K>}`]: string;
};

const envConfig: EnvConfig = {
  VITE_HOST: "localhost",
  VITE_PORT: "3000",
  VITE_DEBUG: "true"
};

console.log("环境配置:", envConfig);


// ============================================================
// 总结
// ============================================================
/**
 * 模板字面量类型要点回顾：
 * 
 * 1. 基本语法：使用反引号 ` ` 定义，支持 ${} 插值
 * 2. 内置类型：string, number, boolean, bigint
 * 3. 联合展开：联合类型自动进行笛卡尔积展开
 * 4. 字符串工具：Uppercase, Lowercase, Capitalize, Uncapitalize
 * 5. infer 推断：在模板字面量中推断字符串部分
 * 
 * 高级应用：
 * - 字符串转换（驼峰、下划线等）
 * - 类型安全的路由系统
 * - 自动生成方法名
 * - CSS 类名生成
 * - 国际化键管理
 * 
 * 最佳实践：
 * - 避免联合类型过度展开
 * - 利用类型推断减少显式标注
 * - 结合映射类型实现复杂转换
 * - 保持模板字面量的可读性
 */
