/**
 * React 表单教程 - 第二章：React Hook Form 入门
 *
 * 本章节介绍 React Hook Form 库的核心用法
 * React Hook Form 是一个高性能、灵活的表单管理库
 */

import { useForm, SubmitHandler, FieldErrors, UseFormRegister, UseFormHandleSubmit, FormState } from 'react-hook-form';

// ============================================================================
// 一、React Hook Form 简介
// ============================================================================

/**
 * React Hook Form 的核心优势：
 * 
 * 1. 性能优化
 *    - 使用非受控组件，减少不必要的重渲染
 *    - 只在需要时更新组件（如验证错误）
 * 
 * 2. 代码简洁
 *    - 使用 register 自动绑定输入框
 *    - 内置验证规则，无需手动编写验证逻辑
 * 
 * 3. 类型安全
 *    - 完整的 TypeScript 支持
 *    - 自动类型推断
 * 
 * 4. 生态系统
 *    - 支持多种验证库（Zod、Yup、Joi 等）
 *    - 与 UI 库良好集成
 */

// ============================================================================
// 二、基础用法：useForm 和 register
// ============================================================================

/**
 * 表单数据类型定义
 * 使用泛型让 useForm 知道表单的数据结构
 */
interface BasicFormData {
  username: string;
  email: string;
  password: string;
}

/**
 * 最基础的 React Hook Form 示例
 * 展示 useForm、register、handleSubmit 的基本用法
 */
function BasicFormExample() {
  /**
   * useForm Hook 返回多个有用的方法和状态
   * 
   * - register: 注册输入框，返回需要展开到 input 的属性
   * - handleSubmit: 处理表单提交，自动验证
   * - formState: 表单状态（错误、是否提交过等）
   * - reset: 重置表单
   * - watch: 监听表单值变化
   * - getValues: 获取表单当前值
   * - setValue: 设置表单值
   * - setError: 手动设置错误
   * - clearErrors: 清除错误
   */
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset 
  } = useForm<BasicFormData>({
    // 默认值
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    // 表单模式：onChange | onBlur | onSubmit | all
    mode: 'onBlur', // 在失去焦点时验证
  });

  /**
   * 表单提交处理函数
   * handleSubmit 会自动验证表单，只有验证通过才会调用此函数
   * 
   * @param data - 验证通过的表单数据，类型由泛型决定
   */
  const onSubmit: SubmitHandler<BasicFormData> = async (data) => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('表单提交数据：', data);
    alert(`提交成功！\n用户名: ${data.username}\n邮箱: ${data.email}`);
  };

  /**
   * 错误处理函数（可选）
   * 当表单验证失败时调用
   */
  const onError = (errors: FieldErrors<BasicFormData>) => {
    console.log('表单验证失败：', errors);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="basic-form">
      <h3>基础表单示例</h3>

      {/* 用户名输入框 */}
      <div className="form-group">
        <label htmlFor="username">用户名：</label>
        <input
          id="username"
          type="text"
          /**
           * register 返回的对象包含：
           * - onChange: 变化事件处理器
           * - onBlur: 失焦事件处理器
           * - name: 字段名称
           * - ref: 引用，用于获取 DOM 元素
           * 
           * 使用展开运算符 ... 将这些属性应用到 input
           */
          {...register('username', {
            // 验证规则
            required: '用户名不能为空',
            minLength: {
              value: 3,
              message: '用户名至少需要 3 个字符',
            },
            maxLength: {
              value: 20,
              message: '用户名不能超过 20 个字符',
            },
          })}
          placeholder="请输入用户名"
        />
        {/* 显示错误信息 */}
        {errors.username && (
          <span className="error">{errors.username.message}</span>
        )}
      </div>

      {/* 邮箱输入框 */}
      <div className="form-group">
        <label htmlFor="email">邮箱：</label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: '邮箱不能为空',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '请输入有效的邮箱地址',
            },
          })}
          placeholder="请输入邮箱"
        />
        {errors.email && (
          <span className="error">{errors.email.message}</span>
        )}
      </div>

      {/* 密码输入框 */}
      <div className="form-group">
        <label htmlFor="password">密码：</label>
        <input
          id="password"
          type="password"
          {...register('password', {
            required: '密码不能为空',
            minLength: {
              value: 6,
              message: '密码至少需要 6 个字符',
            },
          })}
          placeholder="请输入密码"
        />
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}
      </div>

      {/* 提交按钮 */}
      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交'}
        </button>
        <button type="button" onClick={() => reset()}>
          重置
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// 三、register 验证规则详解
// ============================================================================

/**
 * register 的验证规则选项
 */
interface ValidationRulesFormData {
  requiredField: string;      // 必填字段
  minLengthField: string;     // 最小长度
  maxLengthField: string;     // 最大长度
  minField: number;           // 最小值
  maxField: number;           // 最大值
  patternField: string;       // 正则匹配
  customValidateField: string; // 自定义验证
}

/**
 * 展示所有验证规则的示例
 */
function ValidationRulesExample() {
  const { register, handleSubmit, formState: { errors } } = useForm<ValidationRulesFormData>();

  const onSubmit: SubmitHandler<ValidationRulesFormData> = (data) => {
    console.log('验证通过：', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="validation-rules-form">
      <h3>验证规则详解</h3>

      {/* required: 必填验证 */}
      <div className="form-group">
        <label>required - 必填验证：</label>
        <input
          type="text"
          {...register('requiredField', {
            // 布尔值：只验证是否填写
            // required: true
            // 字符串：验证失败时显示的消息
            required: '此字段为必填项',
          })}
          placeholder="必填字段"
        />
        {errors.requiredField && <span className="error">{errors.requiredField.message}</span>}
      </div>

      {/* minLength / maxLength: 长度验证 */}
      <div className="form-group">
        <label>minLength/maxLength - 长度验证：</label>
        <input
          type="text"
          {...register('minLengthField', {
            minLength: {
              value: 3,
              message: '最少 3 个字符',
            },
            maxLength: {
              value: 10,
              message: '最多 10 个字符',
            },
          })}
          placeholder="3-10 个字符"
        />
        {errors.minLengthField && <span className="error">{errors.minLengthField.message}</span>}
      </div>

      {/* min / max: 数值范围验证 */}
      <div className="form-group">
        <label>min/max - 数值范围：</label>
        <input
          type="number"
          {...register('minField', {
            min: {
              value: 0,
              message: '最小值为 0',
            },
            max: {
              value: 100,
              message: '最大值为 100',
            },
            valueAsNumber: true, // 将值转换为数字类型
          })}
          placeholder="0-100"
        />
        {errors.minField && <span className="error">{errors.minField.message}</span>}
      </div>

      {/* pattern: 正则验证 */}
      <div className="form-group">
        <label>pattern - 正则验证：</label>
        <input
          type="text"
          {...register('patternField', {
            pattern: {
              value: /^1[3-9]\d{9}$/,
              message: '请输入有效的手机号码',
            },
          })}
          placeholder="手机号码"
        />
        {errors.patternField && <span className="error">{errors.patternField.message}</span>}
      </div>

      {/* validate: 自定义验证 */}
      <div className="form-group">
        <label>validate - 自定义验证：</label>
        <input
          type="text"
          {...register('customValidateField', {
            validate: {
              // 可以定义多个验证函数
              // 返回 true 表示验证通过，返回字符串表示错误消息
              notAdmin: (value) => 
                value !== 'admin' || '不能使用 admin 作为用户名',
              noSpaces: (value) => 
                !value.includes(' ') || '不能包含空格',
              // 可以是异步验证
              checkUnique: async (value) => {
                // 模拟 API 检查
                await new Promise(resolve => setTimeout(resolve, 100));
                return value !== 'taken' || '该用户名已被使用';
              },
            },
          })}
          placeholder="自定义验证（不能是 admin，不能有空格）"
        />
        {errors.customValidateField && <span className="error">{errors.customValidateField.message}</span>}
      </div>

      <button type="submit">验证并提交</button>
    </form>
  );
}

// ============================================================================
// 四、表单状态管理
// ============================================================================

/**
 * 展示 formState 的各种状态
 */
interface FormStateData {
  name: string;
  email: string;
}

function FormStateExample() {
  const { 
    register, 
    handleSubmit, 
    formState,
    reset,
    watch,
  } = useForm<FormStateData>({
    defaultValues: {
      name: '',
      email: '',
    },
  });

  /**
   * formState 包含以下状态：
   * 
   * - isDirty: 表单是否被修改过
   * - dirtyFields: 被修改过的字段对象
   * - isSubmitted: 是否已提交过
   * - isSubmitSuccessful: 提交是否成功
   * - isSubmitting: 是否正在提交
   * - submitCount: 提交次数
   * - touchedFields: 被触摸过的字段
   * - touched: 是否有字段被触摸过
   * - errors: 验证错误对象
   * - isValid: 表单是否有效（验证通过）
   * - isValidating: 是否正在验证
   */
  const {
    isDirty,
    dirtyFields,
    isSubmitted,
    isSubmitSuccessful,
    isSubmitting,
    submitCount,
    touchedFields,
    errors,
    isValid,
  } = formState;

  // 监听表单值变化
  const watchedValues = watch();

  const onSubmit: SubmitHandler<FormStateData> = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('提交：', data);
  };

  return (
    <div className="form-state-example">
      <h3>表单状态管理</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>姓名：</label>
          <input
            type="text"
            {...register('name', { required: '姓名不能为空' })}
          />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label>邮箱：</label>
          <input
            type="email"
            {...register('email', { 
              required: '邮箱不能为空',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: '邮箱格式不正确',
              },
            })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? '提交中...' : '提交'}
          </button>
          <button 
            type="button" 
            onClick={() => reset()}
            disabled={!isDirty}
          >
            重置
          </button>
        </div>
      </form>

      {/* 显示表单状态 */}
      <div className="state-display">
        <h4>当前表单状态：</h4>
        <pre>{JSON.stringify({
          isDirty,
          dirtyFields,
          isSubmitted,
          isSubmitSuccessful,
          submitCount,
          touchedFields,
          isValid,
          currentValues: watchedValues,
        }, null, 2)}</pre>
      </div>
    </div>
  );
}

// ============================================================================
// 五、错误处理
// ============================================================================

/**
 * 完整的错误处理示例
 */
interface ErrorHandlingData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function ErrorHandlingExample() {
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<ErrorHandlingData>({
    mode: 'all', // 在 onChange 和 onBlur 时都验证
  });

  // 监听密码字段用于确认密码验证
  const password = watch('password');

  const onSubmit: SubmitHandler<ErrorHandlingData> = async (data) => {
    try {
      // 模拟 API 调用
      const response = await mockApiCall(data);
      
      if (response.error) {
        // 设置服务器返回的错误
        // 可以设置特定字段的错误
        setError('username', {
          type: 'server',
          message: response.error,
        });
      } else {
        alert('注册成功！');
      }
    } catch (error) {
      // 设置全局错误（不关联特定字段）
      setError('root', {
        type: 'network',
        message: '网络错误，请稍后重试',
      });
    }
  };

  // 模拟 API 调用
  const mockApiCall = async (data: ErrorHandlingData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (data.username === 'admin') {
      return { error: '用户名已被占用' };
    }
    return { success: true };
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="error-handling-form">
      <h3>错误处理示例</h3>

      {/* 全局错误显示 */}
      {errors.root && (
        <div className="global-error">
          {errors.root.message}
        </div>
      )}

      <div className="form-group">
        <label>用户名：</label>
        <input
          type="text"
          {...register('username', {
            required: '用户名不能为空',
            minLength: {
              value: 3,
              message: '用户名至少 3 个字符',
            },
          })}
          className={errors.username ? 'input-error' : ''}
        />
        {/* 多种错误显示方式 */}
        {errors.username?.types && (
          <div className="error-list">
            {Object.entries(errors.username.types).map(([type, message]) => (
              <span key={type} className="error">{message}</span>
            ))}
          </div>
        )}
        {errors.username && !errors.username.types && (
          <span className="error">{errors.username.message}</span>
        )}
      </div>

      <div className="form-group">
        <label>邮箱：</label>
        <input
          type="email"
          {...register('email', {
            required: '邮箱不能为空',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '邮箱格式不正确',
            },
          })}
          className={errors.email ? 'input-error' : ''}
        />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div className="form-group">
        <label>密码：</label>
        <input
          type="password"
          {...register('password', {
            required: '密码不能为空',
            minLength: {
              value: 6,
              message: '密码至少 6 个字符',
            },
          })}
          className={errors.password ? 'input-error' : ''}
        />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      <div className="form-group">
        <label>确认密码：</label>
        <input
          type="password"
          {...register('confirmPassword', {
            required: '请确认密码',
            validate: (value) => 
              value === password || '两次密码不一致',
          })}
          className={errors.confirmPassword ? 'input-error' : ''}
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
      </div>

      <button type="submit">注册</button>
    </form>
  );
}

// ============================================================================
// 六、性能优化
// ============================================================================

/**
 * React Hook Form 性能优势展示
 */
function PerformanceExample() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: 'onChange',
  });

  // 使用 watch 监听特定字段
  // 只在这些字段变化时重新渲染
  const username = watch('username');
  const email = watch('email');

  /**
   * 性能优化技巧：
   * 
   * 1. 使用 watch 的选择性监听
   *    watch('fieldName') - 只监听一个字段
   *    watch(['field1', 'field2']) - 监听多个字段
   *    watch() - 监听所有字段（谨慎使用）
   * 
   * 2. 使用 useWatch 替代 watch（更优性能）
   *    useWatch 只在监听的字段变化时触发重渲染
   * 
   * 3. 避免在渲染时调用 getValues
   *    getValues 不会触发重渲染
   * 
   * 4. 使用 Controller 处理复杂组件
   *    对于需要完全控制的组件使用 Controller
   */

  const onSubmit = (data: any) => {
    console.log('提交：', data);
  };

  return (
    <div className="performance-example">
      <h3>性能优化示例</h3>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>用户名：</label>
          <input
            type="text"
            {...register('username', { required: '必填' })}
          />
          {errors.username && <span className="error">{errors.username.message}</span>}
        </div>

        <div className="form-group">
          <label>邮箱：</label>
          <input
            type="email"
            {...register('email', { required: '必填' })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label>简介：</label>
          <textarea
            {...register('bio')}
            placeholder="这个字段不会触发额外的重渲染"
          />
        </div>

        <button type="submit">提交</button>
      </form>

      <div className="watched-values">
        <h4>监听的值（只有 username 和 email 变化时更新）：</h4>
        <p>用户名：{username}</p>
        <p>邮箱：{email}</p>
      </div>
    </div>
  );
}

// ============================================================================
// 七、useWatch 和 useController
// ============================================================================

import { useWatch, useController, Control } from 'react-hook-form';

/**
 * useWatch 示例
 * useWatch 比 watch 性能更好，只在监听的值变化时触发重渲染
 */
function UseWatchExample() {
  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  // 使用 useWatch 监听字段
  // 这会创建一个独立的渲染边界
  const { firstName, lastName } = useWatch({
    control,
    name: ['firstName', 'lastName'],
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <h3>useWatch 示例</h3>
      
      <input {...register('firstName')} placeholder="名" />
      <input {...register('lastName')} placeholder="姓" />
      
      {/* 只有 firstName 或 lastName 变化时这部分才会重渲染 */}
      <p>全名：{firstName} {lastName}</p>
      
      <button type="submit">提交</button>
    </form>
  );
}

/**
 * useController 示例
 * 用于需要完全控制的自定义输入组件
 */
interface ControlledInputProps {
  control: Control<any>;
  name: string;
  label: string;
  rules?: any;
}

/**
 * 自定义受控输入组件
 * 使用 useController 将自定义组件接入 React Hook Form
 */
function ControlledInput({ control, name, label, rules }: ControlledInputProps) {
  /**
   * useController 返回：
   * - field: 包含 onChange, onBlur, value, name, ref
   * - fieldState: 包含 error, invalid, isDirty, isTouched
   * - formState: 表单状态
   */
  const { 
    field, 
    fieldState: { error, isDirty, isTouched } 
  } = useController({
    name,
    control,
    rules,
  });

  return (
    <div className="controlled-input">
      <label>{label}</label>
      <input
        {...field}
        className={error ? 'input-error' : isDirty ? 'input-dirty' : ''}
      />
      {isTouched && error && <span className="error">{error.message}</span>}
      {isDirty && !error && <span className="success">✓</span>}
    </div>
  );
}

/**
 * 使用自定义 ControlledInput 的表单
 */
function ControllerFormExample() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: '',
      email: '',
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <h3>useController 示例</h3>
      
      <ControlledInput
        control={control}
        name="username"
        label="用户名"
        rules={{ required: '用户名不能为空' }}
      />
      
      <ControlledInput
        control={control}
        name="email"
        label="邮箱"
        rules={{
          required: '邮箱不能为空',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: '邮箱格式不正确',
          },
        }}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}

// ============================================================================
// 八、主组件导出
// ============================================================================

export default function ReactHookFormDemo() {
  return (
    <div className="react-hook-form-demo">
      <h1>第二章：React Hook Form 入门</h1>
      <p className="intro">
        React Hook Form 是一个高性能、灵活的表单库。它通过使用非受控组件
        和原生 DOM 事件来减少重渲染次数，提供更好的用户体验。
      </p>

      <BasicFormExample />
      <hr />
      <ValidationRulesExample />
      <hr />
      <FormStateExample />
      <hr />
      <ErrorHandlingExample />
      <hr />
      <PerformanceExample />
      <hr />
      <UseWatchExample />
      <hr />
      <ControllerFormExample />

      <div className="navigation">
        <p>上一章：<a href="./01-controlled.tsx">受控组件基础</a></p>
        <p>下一章：<a href="./03-validation.tsx">表单验证</a></p>
      </div>
    </div>
  );
}

/**
 * 本章要点总结：
 * 
 * 1. React Hook Form 核心概念
 *    - useForm：主 Hook，返回表单方法和状态
 *    - register：注册输入框，自动绑定事件
 *    - handleSubmit：处理提交，自动验证
 * 
 * 2. 验证规则
 *    - required：必填验证
 *    - minLength/maxLength：长度验证
 *    - min/max：数值验证
 *    - pattern：正则验证
 *    - validate：自定义验证
 * 
 * 3. 表单状态
 *    - isDirty：是否修改过
 *    - isSubmitting：是否正在提交
 *    - errors：错误信息
 *    - isValid：是否有效
 * 
 * 4. 性能优化
 *    - watch：监听字段变化
 *    - useWatch：更高效的监听
 *    - useController：自定义受控组件
 * 
 * 下一章我们将学习如何使用 Zod 进行更强大的表单验证！
 */
