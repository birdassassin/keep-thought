/**
 * React 表单教程 - 第一章：受控组件基础
 *
 * 本章节介绍 React 中最基础的表单处理方式：受控组件
 * 受控组件是指表单元素的值由 React state 完全控制
 */

import { useState, FormEvent, ChangeEvent } from 'react';

// ============================================================================
// 一、什么是受控组件？
// ============================================================================

/**
 * 受控组件的概念：
 * - 表单元素的值由 React state 控制
 * - 每次用户输入都会触发 state 更新
 * - 组件重新渲染时，表单显示最新的 state 值
 *
 * 与非受控组件的区别：
 * - 受控组件：值由 React state 控制，需要 onChange 处理
 * - 非受控组件：值由 DOM 自身维护，使用 ref 获取值
 */

// ============================================================================
// 二、基础示例：单个输入框
// ============================================================================

/**
 * 最简单的受控组件示例
 * 展示如何使用 useState 和 onChange 处理单个输入框
 */
function SingleInputExample() {
  // 使用 useState 存储输入框的值
  // name 是当前值，setName 是更新函数
  const [name, setName] = useState<string>('');

  // 处理输入变化的事件处理器
  // ChangeEvent<HTMLInputElement> 是 TypeScript 类型，表示 input 元素的 change 事件
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // event.target.value 获取输入框的当前值
    setName(event.target.value);
  };

  return (
    <div className="example-section">
      <h3>单个输入框示例</h3>
      <input
        type="text"
        value={name}           // 受控组件：value 由 state 控制
        onChange={handleChange} // 每次输入都会触发 onChange
        placeholder="请输入你的名字"
      />
      <p>你输入的名字是：<strong>{name}</strong></p>
    </div>
  );
}

// ============================================================================
// 三、完整表单示例：用户注册表单
// ============================================================================

/**
 * 用户注册表单的数据类型定义
 * 使用 TypeScript 接口定义表单数据结构
 */
interface UserFormData {
  username: string;    // 用户名
  email: string;       // 邮箱
  password: string;    // 密码
  confirmPassword: string; // 确认密码
  age: number;         // 年龄
  bio: string;         // 个人简介
  terms: boolean;      // 是否同意条款
}

/**
 * 完整的注册表单组件
 * 展示如何处理多种类型的表单元素
 */
function RegistrationForm() {
  // 初始化表单状态
  // 使用一个对象来存储所有表单字段
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 18,
    bio: '',
    terms: false,
  });

  // 表单验证错误信息
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  /**
   * 通用输入变化处理器
   * 使用 event.target.name 和 event.target.value 来动态更新对应字段
   * 
   * @param event - 输入事件对象
   */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    
    // 处理不同类型的输入
    // checkbox 使用 checked 属性，其他使用 value
    const inputValue = type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked 
      : type === 'number' 
        ? parseInt(value, 10) || 0 
        : value;

    // 使用展开运算符更新特定字段
    // 这确保了其他字段的值不会被覆盖
    setFormData(prev => ({
      ...prev,
      [name]: inputValue,
    }));

    // 清除该字段的错误信息
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({
        ...prev,
        [name as keyof UserFormData]: undefined,
      }));
    }
  };

  /**
   * 表单验证函数
   * 在提交前验证所有字段
   * 
   * @returns 验证是否通过
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    // 用户名验证：必填，长度 3-20
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = '用户名长度需要在 3-20 个字符之间';
    }

    // 邮箱验证：必填，格式检查
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    // 密码验证：必填，长度至少 6
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少需要 6 个字符';
    }

    // 确认密码验证：必须与密码一致
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    // 年龄验证：必须大于 0
    if (formData.age < 1 || formData.age > 150) {
      newErrors.age = '请输入有效的年龄';
    }

    // 条款验证：必须同意
    if (!formData.terms) {
      newErrors.terms = '请阅读并同意服务条款';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 表单提交处理器
   * 使用 FormEvent<HTMLFormElement> 类型
   * 
   * @param event - 表单提交事件
   */
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // 阻止表单默认提交行为（页面刷新）
    event.preventDefault();

    // 验证表单
    if (!validateForm()) {
      console.log('表单验证失败');
      return;
    }

    // 提交表单数据
    console.log('表单提交成功：', formData);
    alert(`注册成功！\n用户名: ${formData.username}\n邮箱: ${formData.email}`);

    // 重置表单（可选）
    // setFormData(initialState);
  };

  /**
   * 重置表单
   * 将所有字段恢复到初始值
   */
  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 18,
      bio: '',
      terms: false,
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <h3>用户注册表单</h3>

      {/* 用户名输入框 */}
      <div className="form-group">
        <label htmlFor="username">用户名：</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="请输入用户名（3-20个字符）"
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>

      {/* 邮箱输入框 */}
      <div className="form-group">
        <label htmlFor="email">邮箱：</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="请输入邮箱地址"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      {/* 密码输入框 */}
      <div className="form-group">
        <label htmlFor="password">密码：</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="请输入密码（至少6个字符）"
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      {/* 确认密码输入框 */}
      <div className="form-group">
        <label htmlFor="confirmPassword">确认密码：</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="请再次输入密码"
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
      </div>

      {/* 年龄输入框 */}
      <div className="form-group">
        <label htmlFor="age">年龄：</label>
        <input
          type="number"
          id="age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          min="1"
          max="150"
        />
        {errors.age && <span className="error">{errors.age}</span>}
      </div>

      {/* 个人简介文本域 */}
      <div className="form-group">
        <label htmlFor="bio">个人简介：</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="介绍一下你自己（可选）"
          rows={4}
        />
      </div>

      {/* 同意条款复选框 */}
      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleInputChange}
          />
          我已阅读并同意服务条款
        </label>
        {errors.terms && <span className="error">{errors.terms}</span>}
      </div>

      {/* 提交和重置按钮 */}
      <div className="form-actions">
        <button type="submit">注册</button>
        <button type="button" onClick={handleReset}>重置</button>
      </div>
    </form>
  );
}

// ============================================================================
// 四、下拉选择框示例
// ============================================================================

/**
 * 下拉选择框（select）的受控组件示例
 */
function SelectExample() {
  // 选中的值
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  // 国家数据
  const countries = [
    { value: '', label: '请选择国家' },
    { value: 'china', label: '中国' },
    { value: 'usa', label: '美国' },
    { value: 'japan', label: '日本' },
    { value: 'uk', label: '英国' },
  ];

  // 城市数据（根据国家动态变化）
  const citiesByCountry: Record<string, string[]> = {
    china: ['北京', '上海', '广州', '深圳'],
    usa: ['纽约', '洛杉矶', '芝加哥', '旧金山'],
    japan: ['东京', '大阪', '京都', '横滨'],
    uk: ['伦敦', '曼彻斯特', '伯明翰', '利物浦'],
  };

  // 处理国家选择变化
  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const country = event.target.value;
    setSelectedCountry(country);
    // 重置城市选择
    setSelectedCities([]);
  };

  // 处理城市多选变化
  const handleCitiesChange = (event: ChangeEvent<HTMLSelectElement>) => {
    // 多选框需要从 selectedOptions 获取所有选中项
    const selected = Array.from(event.target.selectedOptions, option => option.value);
    setSelectedCities(selected);
  };

  return (
    <div className="example-section">
      <h3>下拉选择框示例</h3>

      {/* 单选下拉框 */}
      <div className="form-group">
        <label htmlFor="country">选择国家：</label>
        <select
          id="country"
          value={selectedCountry}
          onChange={handleCountryChange}
        >
          {countries.map(country => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      {/* 多选下拉框（仅在选择国家后显示） */}
      {selectedCountry && (
        <div className="form-group">
          <label htmlFor="cities">选择城市（按住 Ctrl 多选）：</label>
          <select
            id="cities"
            multiple
            value={selectedCities}
            onChange={handleCitiesChange}
            size={4}
          >
            {citiesByCountry[selectedCountry]?.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}

      <p>选中的国家：{selectedCountry || '未选择'}</p>
      <p>选中的城市：{selectedCities.length > 0 ? selectedCities.join('、') : '未选择'}</p>
    </div>
  );
}

// ============================================================================
// 五、单选框和复选框组示例
// ============================================================================

/**
 * 单选框（radio）和复选框组（checkbox group）示例
 */
function RadioAndCheckboxExample() {
  // 单选框状态
  const [gender, setGender] = useState<string>('');
  
  // 复选框组状态
  const [hobbies, setHobbies] = useState<string[]>([]);

  // 爱好选项
  const hobbyOptions = [
    { value: 'reading', label: '阅读' },
    { value: 'gaming', label: '游戏' },
    { value: 'music', label: '音乐' },
    { value: 'sports', label: '运动' },
    { value: 'travel', label: '旅行' },
  ];

  // 处理单选框变化
  const handleGenderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGender(event.target.value);
  };

  // 处理复选框组变化
  const handleHobbyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    
    if (checked) {
      // 添加选中项
      setHobbies(prev => [...prev, value]);
    } else {
      // 移除取消选中项
      setHobbies(prev => prev.filter(hobby => hobby !== value));
    }
  };

  return (
    <div className="example-section">
      <h3>单选框和复选框组示例</h3>

      {/* 单选框组 */}
      <div className="form-group">
        <label>性别：</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === 'male'}
              onChange={handleGenderChange}
            />
            男
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === 'female'}
              onChange={handleGenderChange}
            />
            女
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="other"
              checked={gender === 'other'}
              onChange={handleGenderChange}
            />
            其他
          </label>
        </div>
      </div>

      {/* 复选框组 */}
      <div className="form-group">
        <label>爱好：</label>
        <div className="checkbox-group">
          {hobbyOptions.map(option => (
            <label key={option.value}>
              <input
                type="checkbox"
                value={option.value}
                checked={hobbies.includes(option.value)}
                onChange={handleHobbyChange}
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      <p>性别：{gender || '未选择'}</p>
      <p>爱好：{hobbies.length > 0 ? hobbies.map(h => hobbyOptions.find(o => o.value === h)?.label).join('、') : '未选择'}</p>
    </div>
  );
}

// ============================================================================
// 六、受控组件的优缺点分析
// ============================================================================

/**
 * 受控组件优缺点总结组件
 */
function ControlledComponentsProsCons() {
  return (
    <div className="pros-cons-section">
      <h3>受控组件优缺点分析</h3>

      <div className="pros">
        <h4>优点：</h4>
        <ul>
          <li>
            <strong>实时验证</strong>
            <p>可以在用户输入时即时验证，提供即时反馈</p>
          </li>
          <li>
            <strong>状态同步</strong>
            <p>表单值与组件状态完全同步，便于追踪和调试</p>
          </li>
          <li>
            <strong>条件禁用</strong>
            <p>可以根据表单状态动态禁用提交按钮或其他控件</p>
          </li>
          <li>
            <strong>格式化输入</strong>
            <p>可以在 onChange 中对输入进行格式化（如电话号码、金额）</p>
          </li>
          <li>
            <strong>易于测试</strong>
            <p>状态完全由 React 管理，便于编写单元测试</p>
          </li>
        </ul>
      </div>

      <div className="cons">
        <h4>缺点：</h4>
        <ul>
          <li>
            <strong>性能问题</strong>
            <p>每次输入都会触发 state 更新和组件重渲染，大型表单可能有性能问题</p>
          </li>
          <li>
            <strong>代码冗余</strong>
            <p>需要为每个输入框编写 onChange 处理器，代码量较大</p>
          </li>
          <li>
            <strong>状态管理复杂</strong>
            <p>表单字段多时，状态管理变得复杂</p>
          </li>
          <li>
            <strong>需要手动验证</strong>
            <p>需要自己实现验证逻辑，没有内置验证支持</p>
          </li>
        </ul>
      </div>

      <div className="best-practices">
        <h4>最佳实践建议：</h4>
        <ul>
          <li>简单表单可以使用受控组件，复杂表单建议使用 React Hook Form</li>
          <li>对于需要实时验证的场景，受控组件是不错的选择</li>
          <li>使用通用处理器减少代码冗余</li>
          <li>考虑使用防抖（debounce）优化频繁输入的场景</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================================================
// 七、防抖优化示例
// ============================================================================

/**
 * 使用防抖优化输入处理的示例
 * 防抖可以减少频繁输入时的状态更新次数
 */
function DebouncedInputExample() {
  const [immediateValue, setImmediateValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  /**
   * 自定义防抖 Hook（简化版）
   * 在实际项目中建议使用 lodash.debounce 或 useDebouncedValue
   */
  const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useState(() => {
      const timer = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(timer);
      };
    });

    return debouncedValue;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // 立即更新即时值
    setImmediateValue(event.target.value);
    // 防抖值会延迟更新
  };

  return (
    <div className="example-section">
      <h3>防抖优化示例</h3>
      <p>在输入框中快速输入，观察即时值和防抖值的区别：</p>
      
      <div className="form-group">
        <input
          type="text"
          value={immediateValue}
          onChange={handleChange}
          placeholder="快速输入测试防抖效果"
        />
      </div>

      <p>即时值（每次输入都更新）：<strong>{immediateValue}</strong></p>
      <p>防抖值（延迟 500ms 更新）：<strong>{debouncedValue}</strong></p>
      
      <p className="hint">
        防抖适用于：搜索建议、API 调用、复杂计算等场景
      </p>
    </div>
  );
}

// ============================================================================
// 八、主组件导出
// ============================================================================

/**
 * 主组件：整合所有示例
 */
export default function ControlledComponentsDemo() {
  return (
    <div className="controlled-components-demo">
      <h1>第一章：受控组件基础</h1>
      <p className="intro">
        受控组件是 React 表单处理的基础方式。在本章中，你将学习如何使用
        useState 和 onChange 来创建和管理表单。
      </p>

      <SingleInputExample />
      <hr />
      <RegistrationForm />
      <hr />
      <SelectExample />
      <hr />
      <RadioAndCheckboxExample />
      <hr />
      <DebouncedInputExample />
      <hr />
      <ControlledComponentsProsCons />

      <div className="navigation">
        <p>下一章：<a href="./02-react-hook-form.tsx">React Hook Form 入门</a></p>
      </div>
    </div>
  );
}

/**
 * 本章要点总结：
 * 
 * 1. 受控组件的核心概念
 *    - 表单值由 React state 控制
 *    - 通过 value/checked 和 onChange 实现双向绑定
 * 
 * 2. 基本用法
 *    - 使用 useState 存储表单值
 *    - 使用 onChange 更新状态
 *    - 使用 onSubmit 处理表单提交
 * 
 * 3. 各种表单元素的处理
 *    - text/password/email 等文本输入框
 *    - number 数字输入框
 *    - checkbox 复选框
 *    - radio 单选框
 *    - select 下拉框（单选/多选）
 *    - textarea 文本域
 * 
 * 4. 表单验证
 *    - 提交前验证
 *    - 实时验证
 *    - 错误消息显示
 * 
 * 5. 性能优化
 *    - 防抖处理
 *    - 避免不必要的重渲染
 * 
 * 下一章我们将学习 React Hook Form，它提供了更优雅的方式来处理表单！
 */
