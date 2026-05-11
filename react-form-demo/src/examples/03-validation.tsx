/**
 * React 表单教程 - 第三章：表单验证
 *
 * 本章节介绍使用 Zod 进行表单验证
 * Zod 是一个 TypeScript 优先的 schema 声明和验证库
 */

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ============================================================================
// 一、Zod 简介
// ============================================================================

/**
 * Zod 是一个 TypeScript 优先的 schema 声明和验证库
 * 
 * 核心优势：
 * 1. 类型推断：从 schema 自动推断 TypeScript 类型
 * 2. 链式 API：优雅的链式调用语法
 * 3. 丰富的验证规则：内置大量验证方法
 * 4. 错误消息自定义：灵活的错误消息配置
 * 5. 与 React Hook Form 无缝集成：通过 @hookform/resolvers/zod
 */

// ============================================================================
// 二、基础 Zod Schema
// ============================================================================

/**
 * 基础的 Zod Schema 定义
 * 
 * Zod 提供了多种基础类型：
 * - z.string()：字符串
 * - z.number()：数字
 * - z.boolean()：布尔值
 * - z.date()：日期
 * - z.array()：数组
 * - z.object()：对象
 * - z.enum()：枚举
 * - z.union()：联合类型
 * - z.optional()：可选
 * - z.nullable()：可为空
 */

// 定义用户注册表单的 schema
const userRegistrationSchema = z.object({
  // 字符串验证
  username: z
    .string()
    .min(3, '用户名至少需要 3 个字符')
    .max(20, '用户名不能超过 20 个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),

  // 邮箱验证
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址'),

  // 密码验证
  password: z
    .string()
    .min(8, '密码至少需要 8 个字符')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字')
    .regex(/[^A-Za-z0-9]/, '密码必须包含至少一个特殊字符'),

  // 确认密码 - 使用 refine 进行跨字段验证
  confirmPassword: z.string(),
  
  // 年龄验证
  age: z
    .number({
      required_error: '年龄不能为空',
      invalid_type_error: '年龄必须是数字',
    })
    .min(18, '年龄必须满 18 岁')
    .max(120, '请输入有效的年龄'),

  // 可选字段
  bio: z.string().max(500, '简介不能超过 500 字符').optional(),

  // 布尔值验证
  terms: z
    .boolean()
    .refine(val => val === true, {
      message: '请阅读并同意服务条款',
    }),
});

// 使用 refine 进行跨字段验证
const registrationSchemaWithConfirm = userRegistrationSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'], // 错误显示在 confirmPassword 字段
  }
);

// 从 schema 推断 TypeScript 类型
type UserRegistrationFormData = z.infer<typeof registrationSchemaWithConfirm>;

/**
 * 使用 Zod schema 的表单示例
 */
function ZodBasicExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserRegistrationFormData>({
    // 使用 zodResolver 将 Zod schema 与 React Hook Form 集成
    resolver: zodResolver(registrationSchemaWithConfirm),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 18,
      bio: '',
      terms: false,
    },
  });

  const onSubmit: SubmitHandler<UserRegistrationFormData> = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('提交数据：', data);
    alert('注册成功！');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="zod-form">
      <h3>Zod Schema 验证示例</h3>

      <div className="form-group">
        <label>用户名：</label>
        <input type="text" {...register('username')} />
        {errors.username && <span className="error">{errors.username.message}</span>}
      </div>

      <div className="form-group">
        <label>邮箱：</label>
        <input type="email" {...register('email')} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div className="form-group">
        <label>密码：</label>
        <input type="password" {...register('password')} />
        {errors.password && <span className="error">{errors.password.message}</span>}
        <small>密码需包含大小写字母、数字和特殊字符</small>
      </div>

      <div className="form-group">
        <label>确认密码：</label>
        <input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
      </div>

      <div className="form-group">
        <label>年龄：</label>
        <input type="number" {...register('age', { valueAsNumber: true })} />
        {errors.age && <span className="error">{errors.age.message}</span>}
      </div>

      <div className="form-group">
        <label>个人简介（可选）：</label>
        <textarea {...register('bio')} />
        {errors.bio && <span className="error">{errors.bio.message}</span>}
      </div>

      <div className="form-group">
        <label>
          <input type="checkbox" {...register('terms')} />
          我同意服务条款
        </label>
        {errors.terms && <span className="error">{errors.terms.message}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '注册'}
        </button>
        <button type="button" onClick={() => reset()}>
          重置
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// 三、自定义验证规则
// ============================================================================

/**
 * 自定义验证规则示例
 * 使用 Zod 的 refine 和 superRefine 创建自定义验证
 */

// 自定义验证函数
const validatePhoneNumber = (phone: string) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const validateIdCard = (idCard: string) => {
  const idCardRegex = /^\d{17}[\dXx]$/;
  return idCardRegex.test(idCard);
};

// 带自定义验证的 schema
const customValidationSchema = z.object({
  // 手机号验证
  phone: z
    .string()
    .refine(validatePhoneNumber, {
      message: '请输入有效的手机号码',
    }),

  // 身份证验证
  idCard: z
    .string()
    .refine(validateIdCard, {
      message: '请输入有效的身份证号码',
    }),

  // 用户名验证 - 多个条件
  username: z
    .string()
    .min(3, '用户名至少 3 个字符')
    .max(20, '用户名最多 20 个字符')
    .refine(
      (val) => !val.includes('admin'),
      '用户名不能包含 admin'
    )
    .refine(
      (val) => !val.includes(' '),
      '用户名不能包含空格'
    ),

  // 使用 superRefine 进行复杂验证
  password: z.string().superRefine((password, ctx) => {
    // 添加多个验证条件，每个条件可以独立报错
    if (password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码至少需要 8 个字符',
      });
    }
    if (!/[A-Z]/.test(password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码必须包含大写字母',
      });
    }
    if (!/[a-z]/.test(password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码必须包含小写字母',
      });
    }
    if (!/[0-9]/.test(password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码必须包含数字',
      });
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码必须包含特殊字符',
      });
    }
  }),

  // 日期验证
  birthDate: z
    .string()
    .refine(
      (date) => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 18 && age <= 120;
      },
      { message: '年龄必须在 18-120 岁之间' }
    ),
});

type CustomValidationFormData = z.infer<typeof customValidationSchema>;

/**
 * 自定义验证表单示例
 */
function CustomValidationExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomValidationFormData>({
    resolver: zodResolver(customValidationSchema),
  });

  const onSubmit: SubmitHandler<CustomValidationFormData> = (data) => {
    console.log('验证通过：', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="custom-validation-form">
      <h3>自定义验证规则</h3>

      <div className="form-group">
        <label>手机号：</label>
        <input type="tel" {...register('phone')} placeholder="请输入手机号" />
        {errors.phone && <span className="error">{errors.phone.message}</span>}
      </div>

      <div className="form-group">
        <label>身份证号：</label>
        <input type="text" {...register('idCard')} placeholder="请输入身份证号" />
        {errors.idCard && <span className="error">{errors.idCard.message}</span>}
      </div>

      <div className="form-group">
        <label>用户名：</label>
        <input type="text" {...register('username')} placeholder="3-20字符，不能包含admin或空格" />
        {errors.username && <span className="error">{errors.username.message}</span>}
      </div>

      <div className="form-group">
        <label>密码：</label>
        <input type="password" {...register('password')} placeholder="至少8位，包含大小写字母、数字和特殊字符" />
        {/* 显示多个密码错误 */}
        {errors.password && (
          <div className="error-list">
            {typeof errors.password.message === 'string' ? (
              <span className="error">{errors.password.message}</span>
            ) : null}
          </div>
        )}
      </div>

      <div className="form-group">
        <label>出生日期：</label>
        <input type="date" {...register('birthDate')} />
        {errors.birthDate && <span className="error">{errors.birthDate.message}</span>}
      </div>

      <button type="submit">验证</button>
    </form>
  );
}

// ============================================================================
// 四、异步验证
// ============================================================================

/**
 * 异步验证示例
 * 使用 Zod 的 refine 进行异步验证（如检查用户名是否已存在）
 */

// 模拟 API 检查用户名是否可用
const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟已占用的用户名列表
  const takenUsernames = ['admin', 'user', 'test', 'demo'];
  return !takenUsernames.includes(username.toLowerCase());
};

// 模拟 API 检查邮箱是否已注册
const checkEmailAvailability = async (email: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const takenEmails = ['test@example.com', 'admin@example.com'];
  return !takenEmails.includes(email.toLowerCase());
};

// 带异步验证的 schema
const asyncValidationSchema = z.object({
  username: z
    .string()
    .min(3, '用户名至少 3 个字符')
    .refine(
      async (username) => {
        const isAvailable = await checkUsernameAvailability(username);
        return isAvailable;
      },
      { message: '该用户名已被使用' }
    ),

  email: z
    .string()
    .email('请输入有效的邮箱')
    .refine(
      async (email) => {
        const isAvailable = await checkEmailAvailability(email);
        return isAvailable;
      },
      { message: '该邮箱已被注册' }
    ),
});

type AsyncValidationFormData = z.infer<typeof asyncValidationSchema>;

/**
 * 异步验证表单示例
 */
function AsyncValidationExample() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValidating },
    trigger,
  } = useForm<AsyncValidationFormData>({
    resolver: zodResolver(asyncValidationSchema),
    mode: 'onBlur', // 失去焦点时验证
  });

  const onSubmit: SubmitHandler<AsyncValidationFormData> = async (data) => {
    console.log('提交：', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="async-validation-form">
      <h3>异步验证示例</h3>
      <p className="hint">
        异步验证会在失去焦点时触发。已占用的用户名：admin, user, test, demo
      </p>

      <div className="form-group">
        <label>用户名：</label>
        <div className="input-with-status">
          <input type="text" {...register('username')} placeholder="输入用户名" />
          {isValidating && <span className="validating">验证中...</span>}
        </div>
        {errors.username && <span className="error">{errors.username.message}</span>}
      </div>

      <div className="form-group">
        <label>邮箱：</label>
        <div className="input-with-status">
          <input type="email" {...register('email')} placeholder="输入邮箱" />
          {isValidating && <span className="validating">验证中...</span>}
        </div>
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <button type="submit">提交</button>
    </form>
  );
}

// ============================================================================
// 五、错误消息国际化
// ============================================================================

/**
 * 错误消息国际化示例
 * 支持多语言的错误消息配置
 */

// 定义支持的语言类型
type Language = 'zh' | 'en';

// 错误消息映射
const errorMessages = {
  zh: {
    required: '此字段为必填项',
    invalidEmail: '请输入有效的邮箱地址',
    minLength: (min: number) => `至少需要 ${min} 个字符`,
    maxLength: (max: number) => `不能超过 ${max} 个字符`,
    passwordStrength: '密码必须包含大小写字母、数字和特殊字符',
    passwordMatch: '两次输入的密码不一致',
  },
  en: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    minLength: (min: number) => `Minimum ${min} characters required`,
    maxLength: (max: number) => `Maximum ${max} characters allowed`,
    passwordStrength: 'Password must contain uppercase, lowercase, number and special character',
    passwordMatch: 'Passwords do not match',
  },
};

/**
 * 创建带国际化支持的 schema
 * @param lang - 语言代码
 */
const createLocalizedSchema = (lang: Language) => {
  const messages = errorMessages[lang];

  return z.object({
    username: z
      .string()
      .min(1, messages.required)
      .min(3, messages.minLength(3))
      .max(20, messages.maxLength(20)),

    email: z
      .string()
      .min(1, messages.required)
      .email(messages.invalidEmail),

    password: z
      .string()
      .min(1, messages.required)
      .min(8, messages.minLength(8))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        messages.passwordStrength
      ),

    confirmPassword: z.string(),
  }).refine(
    (data) => data.password === data.confirmPassword,
    {
      message: messages.passwordMatch,
      path: ['confirmPassword'],
    }
  );
};

type LocalizedFormData = z.infer<ReturnType<typeof createLocalizedSchema>>;

/**
 * 国际化表单示例
 */
function I18nValidationExample() {
  const [language, setLanguage] = useState<Language>('zh');
  const [schema, setSchema] = useState(createLocalizedSchema('zh'));

  // 当语言变化时更新 schema
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setSchema(createLocalizedSchema(lang));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocalizedFormData>({
    resolver: zodResolver(schema),
  });

  // 语言切换时重置表单
  const switchLanguage = (lang: Language) => {
    handleLanguageChange(lang);
    reset();
  };

  const onSubmit: SubmitHandler<LocalizedFormData> = (data) => {
    console.log('提交：', data);
  };

  return (
    <div className="i18n-validation-form">
      <h3>错误消息国际化</h3>

      {/* 语言切换 */}
      <div className="language-switch">
        <button 
          type="button" 
          className={language === 'zh' ? 'active' : ''}
          onClick={() => switchLanguage('zh')}
        >
          中文
        </button>
        <button 
          type="button" 
          className={language === 'en' ? 'active' : ''}
          onClick={() => switchLanguage('en')}
        >
          English
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>{language === 'zh' ? '用户名' : 'Username'}：</label>
          <input type="text" {...register('username')} />
          {errors.username && <span className="error">{errors.username.message}</span>}
        </div>

        <div className="form-group">
          <label>{language === 'zh' ? '邮箱' : 'Email'}：</label>
          <input type="email" {...register('email')} />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label>{language === 'zh' ? '密码' : 'Password'}：</label>
          <input type="password" {...register('password')} />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <div className="form-group">
          <label>{language === 'zh' ? '确认密码' : 'Confirm Password'}：</label>
          <input type="password" {...register('confirmPassword')} />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit">
          {language === 'zh' ? '提交' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// 六、复杂 Schema 示例
// ============================================================================

/**
 * 复杂表单 Schema 示例
 * 包含嵌套对象、数组、条件验证等
 */

// 地址 schema
const addressSchema = z.object({
  province: z.string().min(1, '请选择省份'),
  city: z.string().min(1, '请选择城市'),
  district: z.string().min(1, '请选择区县'),
  detail: z.string().min(5, '详细地址至少 5 个字符'),
});

// 联系人 schema
const contactSchema = z.object({
  name: z.string().min(1, '联系人姓名不能为空'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  relationship: z.enum(['parent', 'spouse', 'friend', 'other'], {
    errorMap: () => ({ message: '请选择与联系人的关系' }),
  }),
});

// 完整的复杂表单 schema
const complexFormSchema = z.object({
  // 基本信息
  basicInfo: z.object({
    fullName: z.string().min(2, '姓名至少 2 个字符'),
    gender: z.enum(['male', 'female'], {
      errorMap: () => ({ message: '请选择性别' }),
    }),
    birthday: z.string().min(1, '请选择出生日期'),
  }),

  // 联系方式
  contactInfo: z.object({
    phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
    email: z.string().email('请输入有效的邮箱').optional().or(z.literal('')),
    wechat: z.string().optional(),
  }),

  // 地址信息
  address: addressSchema,

  // 紧急联系人（数组）
  emergencyContacts: z.array(contactSchema).min(1, '至少添加一个紧急联系人').max(3, '最多添加 3 个紧急联系人'),

  // 条件验证：如果选择了其他关系，需要填写说明
  additionalInfo: z.object({
    hasMedicalHistory: z.boolean(),
    medicalHistory: z.string().optional(),
  }).refine(
    (data) => {
      if (data.hasMedicalHistory) {
        return data.medicalHistory && data.medicalHistory.length >= 10;
      }
      return true;
    },
    {
      message: '请详细描述病史（至少 10 个字符）',
      path: ['medicalHistory'],
    }
  ),

  // 同意条款
  agreements: z.object({
    privacy: z.boolean().refine(val => val, { message: '请同意隐私政策' }),
    terms: z.boolean().refine(val => val, { message: '请同意服务条款' }),
  }),
});

type ComplexFormData = z.infer<typeof complexFormSchema>;

/**
 * 复杂表单示例（简化版展示）
 */
function ComplexFormExample() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ComplexFormData>({
    resolver: zodResolver(complexFormSchema),
    defaultValues: {
      basicInfo: {
        fullName: '',
        gender: undefined,
        birthday: '',
      },
      contactInfo: {
        phone: '',
        email: '',
        wechat: '',
      },
      address: {
        province: '',
        city: '',
        district: '',
        detail: '',
      },
      emergencyContacts: [{ name: '', phone: '', relationship: undefined }],
      additionalInfo: {
        hasMedicalHistory: false,
        medicalHistory: '',
      },
      agreements: {
        privacy: false,
        terms: false,
      },
    },
  });

  // 监听病史选项
  const hasMedicalHistory = watch('additionalInfo.hasMedicalHistory');

  const onSubmit: SubmitHandler<ComplexFormData> = (data) => {
    console.log('复杂表单提交：', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="complex-form">
      <h3>复杂表单验证示例</h3>

      {/* 基本信息 */}
      <fieldset>
        <legend>基本信息</legend>
        
        <div className="form-group">
          <label>姓名：</label>
          <input type="text" {...register('basicInfo.fullName')} />
          {errors.basicInfo?.fullName && (
            <span className="error">{errors.basicInfo.fullName.message}</span>
          )}
        </div>

        <div className="form-group">
          <label>性别：</label>
          <select {...register('basicInfo.gender')}>
            <option value="">请选择</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
          {errors.basicInfo?.gender && (
            <span className="error">{errors.basicInfo.gender.message}</span>
          )}
        </div>

        <div className="form-group">
          <label>出生日期：</label>
          <input type="date" {...register('basicInfo.birthday')} />
          {errors.basicInfo?.birthday && (
            <span className="error">{errors.basicInfo.birthday.message}</span>
          )}
        </div>
      </fieldset>

      {/* 联系方式 */}
      <fieldset>
        <legend>联系方式</legend>
        
        <div className="form-group">
          <label>手机号：</label>
          <input type="tel" {...register('contactInfo.phone')} />
          {errors.contactInfo?.phone && (
            <span className="error">{errors.contactInfo.phone.message}</span>
          )}
        </div>

        <div className="form-group">
          <label>邮箱（可选）：</label>
          <input type="email" {...register('contactInfo.email')} />
          {errors.contactInfo?.email && (
            <span className="error">{errors.contactInfo.email.message}</span>
          )}
        </div>
      </fieldset>

      {/* 病史信息（条件显示） */}
      <fieldset>
        <legend>健康信息</legend>
        
        <div className="form-group">
          <label>
            <input type="checkbox" {...register('additionalInfo.hasMedicalHistory')} />
            是否有既往病史
          </label>
        </div>

        {hasMedicalHistory && (
          <div className="form-group">
            <label>病史描述：</label>
            <textarea {...register('additionalInfo.medicalHistory')} />
            {errors.additionalInfo?.medicalHistory && (
              <span className="error">{errors.additionalInfo.medicalHistory.message}</span>
            )}
          </div>
        )}
      </fieldset>

      {/* 同意条款 */}
      <fieldset>
        <legend>协议</legend>
        
        <div className="form-group">
          <label>
            <input type="checkbox" {...register('agreements.privacy')} />
            我已阅读并同意隐私政策
          </label>
          {errors.agreements?.privacy && (
            <span className="error">{errors.agreements.privacy.message}</span>
          )}
        </div>

        <div className="form-group">
          <label>
            <input type="checkbox" {...register('agreements.terms')} />
            我已阅读并同意服务条款
          </label>
          {errors.agreements?.terms && (
            <span className="error">{errors.agreements.terms.message}</span>
          )}
        </div>
      </fieldset>

      <button type="submit">提交</button>
    </form>
  );
}

// ============================================================================
// 七、主组件导出
// ============================================================================

import { useState } from 'react';

export default function ValidationDemo() {
  return (
    <div className="validation-demo">
      <h1>第三章：表单验证</h1>
      <p className="intro">
        本章介绍如何使用 Zod 进行强大的表单验证。Zod 是一个 TypeScript 优先的
        schema 验证库，与 React Hook Form 无缝集成。
      </p>

      <ZodBasicExample />
      <hr />
      <CustomValidationExample />
      <hr />
      <AsyncValidationExample />
      <hr />
      <I18nValidationExample />
      <hr />
      <ComplexFormExample />

      <div className="navigation">
        <p>上一章：<a href="./02-react-hook-form.tsx">React Hook Form 入门</a></p>
        <p>下一章：<a href="./04-advanced.tsx">高级用法</a></p>
      </div>
    </div>
  );
}

/**
 * 本章要点总结：
 * 
 * 1. Zod 基础
 *    - 使用 z.object() 定义 schema
 *    - 使用 z.infer 推断类型
 *    - 使用 zodResolver 集成 React Hook Form
 * 
 * 2. 验证规则
 *    - min/max：长度/数值验证
 *    - regex：正则验证
 *    - email/url：内置格式验证
 *    - refine：自定义验证
 *    - superRefine：多条件验证
 * 
 * 3. 高级特性
 *    - 异步验证：支持 API 检查
 *    - 跨字段验证：refine 访问其他字段
 *    - 条件验证：根据条件动态验证
 *    - 错误消息国际化：多语言支持
 * 
 * 4. 复杂表单
 *    - 嵌套对象验证
 *    - 数组验证
 *    - 条件字段显示
 * 
 * 下一章我们将学习 React Hook Form 的高级用法！
 */
