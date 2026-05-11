/**
 * React 表单教程 - 第四章：高级用法
 *
 * 本章节介绍 React Hook Form 的高级功能
 * 包括动态字段、表单联动、条件字段、FormProvider 等
 */

import { 
  useForm, 
  useFieldArray, 
  FormProvider, 
  useFormContext,
  useWatch,
  SubmitHandler,
  Controller,
  Control,
  FieldArrayWithId,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';

// ============================================================================
// 一、useFieldArray - 动态字段
// ============================================================================

/**
 * useFieldArray 用于管理动态字段数组
 * 
 * 适用场景：
 * - 添加/删除多个相同类型的输入项
 * - 动态表单字段
 * - 列表编辑
 */

// 定义单个联系人的 schema
const contactItemSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  email: z.string().email('请输入有效的邮箱').optional().or(z.literal('')),
});

// 定义表单 schema，包含联系人数组
const contactsFormSchema = z.object({
  contacts: z.array(contactItemSchema).min(1, '至少添加一个联系人'),
});

type ContactsFormData = z.infer<typeof contactsFormSchema>;

/**
 * 动态联系人列表示例
 */
function DynamicContactsExample() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactsFormData>({
    resolver: zodResolver(contactsFormSchema),
    defaultValues: {
      contacts: [
        { name: '', phone: '', email: '' },
      ],
    },
  });

  /**
   * useFieldArray 返回的方法和属性：
   * 
   * - fields: 字段数组，包含 id 和原始数据
   * - append: 在末尾添加字段
   * - prepend: 在开头添加字段
   * - insert: 在指定位置插入字段
   * - remove: 删除指定索引的字段
   * - swap: 交换两个字段的位置
   * - move: 移动字段到新位置
   * - update: 更新指定字段
   * - replace: 替换所有字段
   */
  const { fields, append, remove, insert, swap, move } = useFieldArray({
    control,
    name: 'contacts', // 字段数组名称
  });

  const onSubmit: SubmitHandler<ContactsFormData> = (data) => {
    console.log('提交的联系人：', data.contacts);
    alert(`成功提交 ${data.contacts.length} 个联系人！`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="dynamic-contacts-form">
      <h3>动态联系人列表</h3>
      <p className="hint">可以动态添加、删除、排序联系人</p>

      {/* 联系人列表 */}
      {fields.map((field, index) => (
        <div key={field.id} className="contact-item">
          <h4>联系人 {index + 1}</h4>

          {/* 姓名 */}
          <div className="form-group">
            <label>姓名：</label>
            <input
              type="text"
              {...register(`contacts.${index}.name`)}
              placeholder="请输入姓名"
            />
            {errors.contacts?.[index]?.name && (
              <span className="error">{errors.contacts[index]?.name?.message}</span>
            )}
          </div>

          {/* 电话 */}
          <div className="form-group">
            <label>电话：</label>
            <input
              type="tel"
              {...register(`contacts.${index}.phone`)}
              placeholder="请输入手机号"
            />
            {errors.contacts?.[index]?.phone && (
              <span className="error">{errors.contacts[index]?.phone?.message}</span>
            )}
          </div>

          {/* 邮箱 */}
          <div className="form-group">
            <label>邮箱：</label>
            <input
              type="email"
              {...register(`contacts.${index}.email`)}
              placeholder="请输入邮箱（可选）"
            />
            {errors.contacts?.[index]?.email && (
              <span className="error">{errors.contacts[index]?.email?.message}</span>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="field-actions">
            {index > 0 && (
              <button type="button" onClick={() => move(index, index - 1)}>
                上移
              </button>
            )}
            {index < fields.length - 1 && (
              <button type="button" onClick={() => move(index, index + 1)}>
                下移
              </button>
            )}
            {fields.length > 1 && (
              <button 
                type="button" 
                onClick={() => remove(index)}
                className="danger"
              >
                删除
              </button>
            )}
          </div>
        </div>
      ))}

      {/* 全局错误 */}
      {errors.contacts && !Array.isArray(errors.contacts) && (
        <span className="error">{errors.contacts.message}</span>
      )}

      {/* 添加按钮 */}
      <div className="add-buttons">
        <button
          type="button"
          onClick={() => append({ name: '', phone: '', email: '' })}
        >
          添加联系人（末尾）
        </button>
        <button
          type="button"
          onClick={() => insert(0, { name: '', phone: '', email: '' })}
        >
          添加联系人（开头）
        </button>
      </div>

      <button type="submit">提交所有联系人</button>
    </form>
  );
}

// ============================================================================
// 二、FormProvider 和 useFormContext
// ============================================================================

/**
 * FormProvider 用于在组件树中共享表单上下文
 * 
 * 优势：
 * - 避免逐层传递 props
 * - 组件更易复用
 * - 代码更清晰
 */

/**
 * 使用 useFormContext 的自定义输入组件
 * 无需通过 props 传递 control 或 register
 */
function FormInput({ 
  name, 
  label, 
  type = 'text',
  placeholder,
  rules,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  rules?: any;
}) {
  // 从上下文获取表单方法
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}：</label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, rules)}
        className={errors[name] ? 'input-error' : ''}
      />
      {errors[name] && (
        <span className="error">{errors[name]?.message as string}</span>
      )}
    </div>
  );
}

/**
 * 使用 useFormContext 的自定义选择框组件
 */
function FormSelect({
  name,
  label,
  options,
  rules,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  rules?: any;
}) {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="form-group">
      <label htmlFor={name}>{label}：</label>
      <select
        id={name}
        {...register(name, rules)}
        className={errors[name] ? 'input-error' : ''}
      >
        <option value="">请选择</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <span className="error">{errors[name]?.message as string}</span>
      )}
    </div>
  );
}

/**
 * 使用 FormProvider 的表单示例
 */
function FormProviderExample() {
  // 定义表单 schema
  const userFormSchema = z.object({
    firstName: z.string().min(1, '名不能为空'),
    lastName: z.string().min(1, '姓不能为空'),
    email: z.string().email('请输入有效的邮箱'),
    phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
    gender: z.enum(['male', 'female'], {
      errorMap: () => ({ message: '请选择性别' }),
    }),
  });

  type UserFormData = z.infer<typeof userFormSchema>;

  const methods = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gender: undefined,
    },
  });

  const onSubmit: SubmitHandler<UserFormData> = (data) => {
    console.log('提交：', data);
    alert('提交成功！');
  };

  // 性别选项
  const genderOptions = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
  ];

  return (
    /**
     * FormProvider 包裹表单内容
     * 所有子组件都可以通过 useFormContext 访问表单方法
     */
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="form-provider-example">
        <h3>FormProvider 示例</h3>
        <p className="hint">子组件通过 useFormContext 获取表单方法，无需 props 传递</p>

        <div className="name-row">
          <FormInput
            name="lastName"
            label="姓"
            placeholder="请输入姓"
            rules={{ required: '姓不能为空' }}
          />
          <FormInput
            name="firstName"
            label="名"
            placeholder="请输入名"
            rules={{ required: '名不能为空' }}
          />
        </div>

        <FormInput
          name="email"
          label="邮箱"
          type="email"
          placeholder="请输入邮箱"
        />

        <FormInput
          name="phone"
          label="手机号"
          type="tel"
          placeholder="请输入手机号"
        />

        <FormSelect
          name="gender"
          label="性别"
          options={genderOptions}
        />

        <button type="submit">提交</button>
      </form>
    </FormProvider>
  );
}

// ============================================================================
// 三、自定义组件封装
// ============================================================================

/**
 * 使用 Controller 封装复杂的自定义输入组件
 * Controller 提供完全的受控组件控制
 */

/**
 * 自定义评分组件
 */
function RatingInput({
  control,
  name,
  label,
  maxRating = 5,
}: {
  control: Control<any>;
  name: string;
  label: string;
  maxRating?: number;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="form-group rating-input">
          <label>{label}：</label>
          <div className="stars">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map(star => (
              <button
                key={star}
                type="button"
                className={`star ${value >= star ? 'active' : ''}`}
                onClick={() => onChange(star)}
              >
                ★
              </button>
            ))}
          </div>
          {error && <span className="error">{error.message}</span>}
        </div>
      )}
    />
  );
}

/**
 * 自定义标签选择组件
 */
function TagsInput({
  control,
  name,
  label,
  availableTags,
}: {
  control: Control<any>;
  name: string;
  label: string;
  availableTags: string[];
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value = [] }, fieldState: { error } }) => (
        <div className="form-group tags-input">
          <label>{label}：</label>
          <div className="tags">
            {availableTags.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag ${value.includes(tag) ? 'active' : ''}`}
                onClick={() => {
                  if (value.includes(tag)) {
                    onChange(value.filter((t: string) => t !== tag));
                  } else {
                    onChange([...value, tag]);
                  }
                }}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="selected">已选择：{value.join('、') || '无'}</p>
          {error && <span className="error">{error.message}</span>}
        </div>
      )}
    />
  );
}

/**
 * 自定义日期范围选择组件
 */
function DateRangeInput({
  control,
  name,
  label,
}: {
  control: Control<any>;
  name: string;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value = { start: '', end: '' } }, fieldState: { error } }) => (
        <div className="form-group date-range-input">
          <label>{label}：</label>
          <div className="date-range">
            <input
              type="date"
              value={value.start}
              onChange={(e) => onChange({ ...value, start: e.target.value })}
            />
            <span>至</span>
            <input
              type="date"
              value={value.end}
              onChange={(e) => onChange({ ...value, end: e.target.value })}
              min={value.start}
            />
          </div>
          {error && <span className="error">{error.message}</span>}
        </div>
      )}
    />
  );
}

/**
 * 使用自定义组件的表单示例
 */
function CustomComponentsExample() {
  const feedbackSchema = z.object({
    rating: z.number().min(1, '请选择评分'),
    tags: z.array(z.string()).min(1, '请至少选择一个标签'),
    dateRange: z.object({
      start: z.string().min(1, '请选择开始日期'),
      end: z.string().min(1, '请选择结束日期'),
    }).refine(
      (data) => new Date(data.start) <= new Date(data.end),
      { message: '开始日期不能晚于结束日期', path: ['end'] }
    ),
    comment: z.string().min(10, '请输入至少 10 个字的评价'),
  });

  type FeedbackFormData = z.infer<typeof feedbackSchema>;

  const { control, register, handleSubmit, formState: { errors } } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      tags: [],
      dateRange: { start: '', end: '' },
      comment: '',
    },
  });

  const availableTags = ['服务好', '环境优美', '性价比高', '交通便利', '设施齐全', '推荐'];

  const onSubmit: SubmitHandler<FeedbackFormData> = (data) => {
    console.log('反馈提交：', data);
    alert('感谢您的反馈！');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="custom-components-form">
      <h3>自定义组件封装</h3>

      {/* 评分组件 */}
      <RatingInput
        control={control}
        name="rating"
        label="整体评分"
      />

      {/* 标签选择组件 */}
      <TagsInput
        control={control}
        name="tags"
        label="选择标签"
        availableTags={availableTags}
      />

      {/* 日期范围组件 */}
      <DateRangeInput
        control={control}
        name="dateRange"
        label="入住日期"
      />

      {/* 评价文本 */}
      <div className="form-group">
        <label>详细评价：</label>
        <textarea
          {...register('comment')}
          placeholder="请输入您的详细评价（至少 10 个字）"
          rows={4}
        />
        {errors.comment && <span className="error">{errors.comment.message}</span>}
      </div>

      <button type="submit">提交反馈</button>
    </form>
  );
}

// ============================================================================
// 四、表单联动
// ============================================================================

/**
 * 表单联动示例
 * 一个字段的值影响另一个字段的选项或显示
 */

// 省市数据
const locationData: Record<string, string[]> = {
  '北京市': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区'],
  '上海市': ['黄浦区', '徐汇区', '长宁区', '静安区', '浦东新区'],
  '广东省': ['广州市', '深圳市', '珠海市', '东莞市', '佛山市'],
  '浙江省': ['杭州市', '宁波市', '温州市', '绍兴市', '嘉兴市'],
  '江苏省': ['南京市', '苏州市', '无锡市', '常州市', '南通市'],
};

const deliverySchema = z.object({
  province: z.string().min(1, '请选择省份'),
  city: z.string().min(1, '请选择城市'),
  deliveryMethod: z.enum(['express', 'pickup', 'self']),
  pickupPoint: z.string().optional(),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

/**
 * 地址联动表单示例
 */
function LinkedFieldsExample() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      province: '',
      city: '',
      deliveryMethod: 'express',
      pickupPoint: '',
    },
  });

  // 监听省份变化
  const selectedProvince = watch('province');
  const deliveryMethod = watch('deliveryMethod');

  // 当省份变化时，重置城市选择
  useEffect(() => {
    setValue('city', '');
  }, [selectedProvince, setValue]);

  // 获取城市列表
  const cities = selectedProvince ? locationData[selectedProvince] || [] : [];

  const onSubmit: SubmitHandler<DeliveryFormData> = (data) => {
    console.log('配送信息：', data);
    alert('配送信息已保存！');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="linked-fields-form">
      <h3>表单联动示例</h3>
      <p className="hint">选择省份后，城市选项会自动更新</p>

      {/* 省份选择 */}
      <div className="form-group">
        <label>省份：</label>
        <select {...register('province')}>
          <option value="">请选择省份</option>
          {Object.keys(locationData).map(province => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
        {errors.province && <span className="error">{errors.province.message}</span>}
      </div>

      {/* 城市选择（根据省份动态变化） */}
      <div className="form-group">
        <label>城市：</label>
        <select {...register('city')} disabled={!selectedProvince}>
          <option value="">请选择城市</option>
          {cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        {errors.city && <span className="error">{errors.city.message}</span>}
      </div>

      {/* 配送方式 */}
      <div className="form-group">
        <label>配送方式：</label>
        <div className="radio-group">
          <label>
            <input type="radio" value="express" {...register('deliveryMethod')} />
            快递配送
          </label>
          <label>
            <input type="radio" value="pickup" {...register('deliveryMethod')} />
            网点自提
          </label>
          <label>
            <input type="radio" value="self" {...register('deliveryMethod')} />
            上门自取
          </label>
        </div>
      </div>

      {/* 自提点选择（仅当选择网点自提时显示） */}
      {deliveryMethod === 'pickup' && (
        <div className="form-group">
          <label>选择自提点：</label>
          <select {...register('pickupPoint')}>
            <option value="">请选择自提点</option>
            <option value="point1">城东自提点 - 东城区XX路XX号</option>
            <option value="point2">城西自提点 - 西城区XX路XX号</option>
            <option value="point3">城南自提点 - 朝阳区XX路XX号</option>
          </select>
        </div>
      )}

      <button type="submit">保存配送信息</button>
    </form>
  );
}

// ============================================================================
// 五、条件字段
// ============================================================================

/**
 * 条件字段示例
 * 根据条件显示或隐藏字段，并动态调整验证规则
 */

const conditionalFormSchema = z.object({
  accountType: z.enum(['personal', 'business']),
  
  // 个人账户字段
  personalInfo: z.object({
    fullName: z.string().optional(),
    idNumber: z.string().optional(),
  }).optional(),
  
  // 企业账户字段
  businessInfo: z.object({
    companyName: z.string().optional(),
    businessLicense: z.string().optional(),
    contactPerson: z.string().optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  // 根据账户类型验证不同字段
  if (data.accountType === 'personal') {
    if (!data.personalInfo?.fullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '请输入姓名',
        path: ['personalInfo', 'fullName'],
      });
    }
    if (!data.personalInfo?.idNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '请输入身份证号',
        path: ['personalInfo', 'idNumber'],
      });
    }
  } else if (data.accountType === 'business') {
    if (!data.businessInfo?.companyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '请输入公司名称',
        path: ['businessInfo', 'companyName'],
      });
    }
    if (!data.businessInfo?.businessLicense) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '请输入营业执照号',
        path: ['businessInfo', 'businessLicense'],
      });
    }
    if (!data.businessInfo?.contactPerson) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '请输入联系人',
        path: ['businessInfo', 'contactPerson'],
      });
    }
  }
});

type ConditionalFormData = z.infer<typeof conditionalFormSchema>;

/**
 * 条件字段表单示例
 */
function ConditionalFieldsExample() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ConditionalFormData>({
    resolver: zodResolver(conditionalFormSchema),
    defaultValues: {
      accountType: 'personal',
      personalInfo: {
        fullName: '',
        idNumber: '',
      },
      businessInfo: {
        companyName: '',
        businessLicense: '',
        contactPerson: '',
      },
    },
  });

  // 监听账户类型
  const accountType = watch('accountType');

  // 切换账户类型时重置相关字段
  const handleAccountTypeChange = (type: 'personal' | 'business') => {
    reset({
      accountType: type,
      personalInfo: { fullName: '', idNumber: '' },
      businessInfo: { companyName: '', businessLicense: '', contactPerson: '' },
    });
  };

  const onSubmit: SubmitHandler<ConditionalFormData> = (data) => {
    console.log('提交：', data);
    alert('账户创建成功！');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="conditional-fields-form">
      <h3>条件字段示例</h3>
      <p className="hint">根据账户类型显示不同的表单字段</p>

      {/* 账户类型选择 */}
      <div className="form-group">
        <label>账户类型：</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="personal"
              checked={accountType === 'personal'}
              onChange={() => handleAccountTypeChange('personal')}
            />
            个人账户
          </label>
          <label>
            <input
              type="radio"
              value="business"
              checked={accountType === 'business'}
              onChange={() => handleAccountTypeChange('business')}
            />
            企业账户
          </label>
        </div>
      </div>

      {/* 个人账户字段 */}
      {accountType === 'personal' && (
        <div className="conditional-section">
          <h4>个人信息</h4>
          
          <div className="form-group">
            <label>姓名：</label>
            <input
              type="text"
              {...register('personalInfo.fullName')}
              placeholder="请输入真实姓名"
            />
            {errors.personalInfo?.fullName && (
              <span className="error">{errors.personalInfo.fullName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>身份证号：</label>
            <input
              type="text"
              {...register('personalInfo.idNumber')}
              placeholder="请输入身份证号"
            />
            {errors.personalInfo?.idNumber && (
              <span className="error">{errors.personalInfo.idNumber.message}</span>
            )}
          </div>
        </div>
      )}

      {/* 企业账户字段 */}
      {accountType === 'business' && (
        <div className="conditional-section">
          <h4>企业信息</h4>
          
          <div className="form-group">
            <label>公司名称：</label>
            <input
              type="text"
              {...register('businessInfo.companyName')}
              placeholder="请输入公司名称"
            />
            {errors.businessInfo?.companyName && (
              <span className="error">{errors.businessInfo.companyName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>营业执照号：</label>
            <input
              type="text"
              {...register('businessInfo.businessLicense')}
              placeholder="请输入营业执照号"
            />
            {errors.businessInfo?.businessLicense && (
              <span className="error">{errors.businessInfo.businessLicense.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>联系人：</label>
            <input
              type="text"
              {...register('businessInfo.contactPerson')}
              placeholder="请输入联系人姓名"
            />
            {errors.businessInfo?.contactPerson && (
              <span className="error">{errors.businessInfo.contactPerson.message}</span>
            )}
          </div>
        </div>
      )}

      <button type="submit">创建账户</button>
    </form>
  );
}

// ============================================================================
// 六、表单计算字段
// ============================================================================

/**
 * 计算字段示例
 * 某些字段的值由其他字段计算得出
 */

const orderFormSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
  })),
  discountCode: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

/**
 * 订单计算表单示例
 */
function ComputedFieldsExample() {
  const { control, register, watch } = useForm<OrderFormData>({
    defaultValues: {
      items: [
        { name: '商品A', price: 100, quantity: 1 },
        { name: '商品B', price: 200, quantity: 2 },
        { name: '商品C', price: 150, quantity: 1 },
      ],
      discountCode: '',
    },
  });

  const { fields } = useFieldArray({ control, name: 'items' });

  // 监听所有商品数据
  const items = watch('items');
  const discountCode = watch('discountCode');

  // 计算小计
  const calculateItemTotal = (index: number) => {
    const item = items?.[index];
    if (item) {
      return (item.price * item.quantity).toFixed(2);
    }
    return '0.00';
  };

  // 计算总价
  const calculateTotal = () => {
    const subtotal = items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    
    // 应用折扣
    let discount = 0;
    if (discountCode === 'SAVE10') {
      discount = subtotal * 0.1;
    } else if (discountCode === 'SAVE20') {
      discount = subtotal * 0.2;
    }
    
    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      total: (subtotal - discount).toFixed(2),
    };
  };

  const totals = calculateTotal();

  return (
    <div className="computed-fields-form">
      <h3>计算字段示例</h3>
      <p className="hint">总价自动根据商品数量和折扣码计算</p>

      <table className="order-table">
        <thead>
          <tr>
            <th>商品</th>
            <th>单价</th>
            <th>数量</th>
            <th>小计</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={field.id}>
              <td>{field.name}</td>
              <td>¥{field.price}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  className="quantity-input"
                />
              </td>
              <td>¥{calculateItemTotal(index)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="discount-section">
        <label>折扣码：</label>
        <input
          type="text"
          {...register('discountCode')}
          placeholder="输入折扣码（SAVE10 或 SAVE20）"
        />
      </div>

      <div className="totals">
        <p>小计：¥{totals.subtotal}</p>
        {parseFloat(totals.discount) > 0 && (
          <p className="discount">折扣：-¥{totals.discount}</p>
        )}
        <p className="total">总计：¥{totals.total}</p>
      </div>
    </div>
  );
}

// ============================================================================
// 七、主组件导出
// ============================================================================

export default function AdvancedFormDemo() {
  return (
    <div className="advanced-form-demo">
      <h1>第四章：高级用法</h1>
      <p className="intro">
        本章介绍 React Hook Form 的高级功能，包括动态字段、表单联动、
        条件字段、自定义组件封装等。
      </p>

      <DynamicContactsExample />
      <hr />
      <FormProviderExample />
      <hr />
      <CustomComponentsExample />
      <hr />
      <LinkedFieldsExample />
      <hr />
      <ConditionalFieldsExample />
      <hr />
      <ComputedFieldsExample />

      <div className="navigation">
        <p>上一章：<a href="./03-validation.tsx">表单验证</a></p>
        <p>下一章：<a href="./05-server-actions.tsx">React 19 Server Actions</a></p>
      </div>
    </div>
  );
}

/**
 * 本章要点总结：
 * 
 * 1. useFieldArray
 *    - 管理动态字段数组
 *    - append/prepend/insert/remove/swap/move 方法
 *    - 适用于列表编辑场景
 * 
 * 2. FormProvider 和 useFormContext
 *    - 在组件树中共享表单上下文
 *    - 避免逐层传递 props
 *    - 提高组件复用性
 * 
 * 3. 自定义组件封装
 *    - 使用 Controller 封装复杂组件
 *    - 完全控制组件的渲染和状态
 * 
 * 4. 表单联动
 *    - 使用 watch/useWatch 监听字段变化
 *    - 动态更新关联字段的选项
 * 
 * 5. 条件字段
 *    - 根据条件显示/隐藏字段
 *    - 使用 superRefine 实现条件验证
 * 
 * 6. 计算字段
 *    - 实时计算衍生值
 *    - 使用 watch 获取依赖字段的值
 * 
 * 下一章我们将学习 React 19 的 Form Actions 新特性！
 */
