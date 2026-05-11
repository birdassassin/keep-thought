/**
 * ============================================================================
 * 02-form.tsx - Ant Design 表单完整用法
 * ============================================================================
 *
 * 本文件演示 Ant Design Form 组件的各种用法，从基础到高级。
 *
 * 涵盖内容：
 *   1. Form 基础用法 - 创建表单、获取/设置表单值
 *   2. Form.Item 验证规则 - 内置规则、自定义验证
 *   3. 表单布局 - horizontal / vertical / inline
 *   4. 动态表单项 - Form.List 增删表单项
 *   5. 自定义表单控件 - 与 Form.Item 集成
 *   6. 表单联动 - 字段间相互影响
 *   7. 异步验证 - 异步校验用户名、手机号等
 *
 * 学习目标：
 *   - 掌握 Form 组件的核心 API（form 实例、onFinish、rules）
 *   - 学会使用 Form.List 实现动态表单
 *   - 理解表单联动和异步验证的实现方式
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Radio,
  Checkbox,
  DatePicker,
  Switch,
  InputNumber,
  Space,
  Divider,
  Typography,
  Card,
  message,
  MinusCircleOutlined,
  PlusOutlined,
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ============================================================================
// 第一部分：Form 基础用法
// ============================================================================
/**
 * Form 组件是 antd 中最复杂的组件之一，用于数据收集、验证和提交。
 *
 * 核心概念：
 *   - Form 实例：通过 Form.useForm() 创建，用于编程式操作表单
 *   - Form.Item：表单项容器，负责数据绑定和验证
 *   - onFinish：表单提交且验证通过后的回调
 *   - onFinishFailed：表单提交但验证失败后的回调
 *
 * Form 实例的常用方法：
 *   - getFieldValue(name): 获取字段值
 *   - getFieldsValue(): 获取所有字段值
 *   - setFieldValue(name, value): 设置字段值
 *   - setFieldsValue(values): 批量设置字段值
 *   - resetFields(): 重置所有字段
 *   - validateFields(): 手动触发验证
 *   - isFieldTouched(name): 判断字段是否被修改过
 *
 * Form.Item 的常用属性：
 *   - name: 字段名（对应表单值的 key）
 *   - label: 标签文本
 *   - rules: 验证规则数组
 *   - initialValue: 初始值
 *   - tooltip: 标签旁边的提示信息
 *   - extra: 额外的提示文字
 *   - hidden: 是否隐藏
 *   - dependencies: 依赖的字段（用于联动）
 *   - shouldUpdate: 是否在任意字段变化时重新渲染
 *   - valuePropName: 子组件的值属性名（默认 'value'）
 *   - trigger: 子组件触发收集值的事件名（默认 'onChange'）
 *   - getValueFromEvent: 从事件中获取值的方式
 */
function BasicFormDemo() {
  // 使用 Form.useForm() 创建表单实例
  // 这个实例可以用于编程式操作表单（获取值、设置值、重置等）
  const [form] = Form.useForm();

  // 表单提交处理函数
  // 当用户点击提交按钮且所有验证通过后，会调用此函数
  // values 参数包含了所有表单字段的值
  const onFinish = (values: any) => {
    console.log('表单提交成功，值：', values);
    message.success('表单提交成功！请查看控制台输出');
  };

  // 表单验证失败处理函数
  // errorInfo 包含了验证失败的详细信息
  const onFinishFailed = (errorInfo: any) => {
    console.log('表单验证失败：', errorInfo);
    message.error('请检查表单填写是否正确');
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    message.info('表单已重置');
  };

  // 填充表单（模拟编辑场景）
  const handleFill = () => {
    form.setFieldsValue({
      username: '张三',
      email: 'zhangsan@example.com',
      age: 25,
      gender: 'male',
    });
    message.info('已填充示例数据');
  };

  return (
    <div>
      <Title level={4}>1. Form 基础用法</Title>
      <Paragraph>
        Form 组件通过 <Text code>Form.useForm()</Text> 创建表单实例，
        使用 <Text code>Form.Item</Text> 包裹输入控件来实现数据绑定和验证。
      </Paragraph>

      <Card>
        {/* form 属性绑定表单实例 */}
        {/* layout="vertical" 设置标签在输入框上方 */}
        {/* onFinish 绑定提交回调 */}
        {/* onFinishFailed 绑定验证失败回调 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          style={{ maxWidth: 500 }}
        >
          {/* Form.Item 的 name 属性是字段名，会作为表单值的 key */}
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, max: 20, message: '用户名长度为 2-20 个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          {/* rules 数组中的每个对象是一条验证规则 */}
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="年龄"
            name="age"
            rules={[
              { required: true, message: '请输入年龄' },
              { type: 'number', min: 1, max: 120, message: '年龄范围为 1-120' },
            ]}
          >
            <InputNumber placeholder="请输入年龄" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="性别"
            name="gender"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Radio.Group>
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="备注"
            name="remark"
          >
            <TextArea rows={3} placeholder="请输入备注信息（选填）" />
          </Form.Item>

          {/* 表单操作按钮 */}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button onClick={handleFill}>填充数据</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第二部分：Form.Item 验证规则
// ============================================================================
/**
 * Form.Item 的 rules 属性支持多种内置验证规则：
 *
 * 常用规则：
 *   - required: true       - 必填
 *   - type: 'email'        - 邮箱格式
 *   - type: 'url'          - URL 格式
 *   - type: 'number'       - 数字类型
 *   - min / max            - 最小/最大值（数字）或最小/最大长度（字符串）
 *   - len                  - 精确长度
 *   - pattern: /regex/     - 正则表达式验证
 *   - whitespace: true     - 不能只有空白字符
 *   - enum: [值列表]       - 枚举值验证
 *   - validator: 自定义函数 - 自定义异步/同步验证
 *
 * 规则对象的其他属性：
 *   - message: 验证失败时的提示信息
 *   - trigger: 触发验证的时机，默认 'onChange'，可选 'onBlur'、'onFocus'
 *   - warningOnly: true    - 仅显示警告，不阻止提交
 */
function ValidationRulesDemo() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('验证通过：', values);
    message.success('所有验证通过！');
  };

  return (
    <div>
      <Title level={4}>2. Form.Item 验证规则</Title>
      <Paragraph>
        rules 属性支持多种内置验证规则，也可以通过 <Text code>validator</Text> 自定义验证逻辑。
      </Paragraph>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 500 }}
        >
          {/* 必填 + 长度限制 */}
          <Form.Item
            label="用户名（必填 + 长度限制）"
            name="username"
            rules={[
              { required: true, message: '用户名不能为空' },
              { min: 3, message: '用户名至少 3 个字符' },
              { max: 15, message: '用户名最多 15 个字符' },
              // whitespace: true 表示不能只有空格
              { whitespace: true, message: '用户名不能只有空格' },
            ]}
          >
            <Input placeholder="3-15 个字符" />
          </Form.Item>

          {/* 邮箱格式验证 */}
          <Form.Item
            label="邮箱（格式验证）"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="example@mail.com" />
          </Form.Item>

          {/* 正则表达式验证 - 手机号 */}
          <Form.Item
            label="手机号（正则验证）"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入有效的手机号',
              },
            ]}
          >
            <Input placeholder="请输入 11 位手机号" maxLength={11} />
          </Form.Item>

          {/* URL 验证 */}
          <Form.Item
            label="个人网站（URL 验证）"
            name="website"
            rules={[
              { type: 'url', message: '请输入有效的 URL' },
            ]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          {/* 数字范围验证 */}
          <Form.Item
            label="评分（数字范围）"
            name="score"
            rules={[
              { type: 'number', message: '请输入数字' },
              { required: true, message: '请输入评分' },
              { min: 0, max: 100, message: '评分范围为 0-100' },
            ]}
          >
            <InputNumber placeholder="0-100" style={{ width: '100%' }} />
          </Form.Item>

          {/* 枚举值验证 */}
          <Form.Item
            label="角色（枚举值验证）"
            name="role"
            rules={[
              {
                type: 'enum',
                enum: ['admin', 'editor', 'viewer'],
                message: '请选择有效的角色',
              },
            ]}
          >
            <Select placeholder="请选择角色" allowClear>
              <Option value="admin">管理员</Option>
              <Option value="editor">编辑者</Option>
              <Option value="viewer">查看者</Option>
            </Select>
          </Form.Item>

          {/* 自定义验证函数 */}
          <Form.Item
            label="确认密码（自定义验证）"
            name="confirmPassword"
            dependencies={['password']} // 声明依赖字段
            rules={[
              { required: true, message: '请确认密码' },
              // validator 是自定义验证函数
              // rule: 当前规则对象
              // value: 当前字段值
              // callback: 回调函数，callback() 表示通过，callback('错误信息') 表示失败
              // 注意：推荐使用 Promise 方式
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少 8 个字符' },
            ]}
          >
            <Input.Password placeholder="至少 8 个字符" />
          </Form.Item>

          {/* trigger 属性：指定触发验证的时机 */}
          <Form.Item
            label="昵称（失焦时验证）"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
            // trigger="onBlur" 表示在失去焦点时才触发验证
            // 默认是 "onChange"，即每次输入都会验证
            trigger="onBlur"
          >
            <Input placeholder="失焦时才验证" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交验证
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第三部分：表单布局
// ============================================================================
/**
 * Form 支持三种布局模式：
 *   - horizontal（默认）：水平排列，标签在左，控件在右
 *   - vertical：垂直排列，标签在上，控件在下
 *   - inline：行内排列，所有表单项在一行
 *
 * 在 horizontal 布局中，可以通过以下属性控制布局：
 *   - labelCol: 标签的栅格布局配置，如 { span: 4 }
 *   - wrapperCol: 控件的栅格布局配置，如 { span: 20 }
 *   - colon: 是否显示标签后的冒号
 */
function FormLayoutDemo() {
  const [form] = Form.useForm();
  const [layout, setLayout] = useState<'horizontal' | 'vertical' | 'inline'>('vertical');

  const onFinish = (values: any) => {
    console.log('布局表单提交：', values);
  };

  return (
    <div>
      <Title level={4}>3. 表单布局</Title>
      <Paragraph>
        Form 支持 <Text code>horizontal</Text>、<Text code>vertical</Text>、
        <Text code>inline</Text> 三种布局模式。
      </Paragraph>

      <Card>
        {/* 切换布局的按钮 */}
        <Form.Item label="选择布局">
          <Radio.Group value={layout} onChange={(e) => setLayout(e.target.value)}>
            <Radio.Button value="horizontal">水平布局</Radio.Button>
            <Radio.Button value="vertical">垂直布局</Radio.Button>
            <Radio.Button value="inline">行内布局</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Divider />

        <Form
          form={form}
          layout={layout}
          onFinish={onFinish}
          // horizontal 布局时，控制标签和控件的宽度比例
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ type: 'email', message: '请输入有效的邮箱' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="城市"
            name="city"
          >
            <Select placeholder="请选择城市">
              <Option value="beijing">北京</Option>
              <Option value="shanghai">上海</Option>
              <Option value="guangzhou">广州</Option>
              <Option value="shenzhen">深圳</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第四部分：动态表单项（Form.List）
// ============================================================================
/**
 * Form.List 用于创建动态增减的表单项，例如：
 *   - 添加多个联系方式
 *   - 添加多个收货地址
 *   - 动态添加教育经历
 *
 * Form.List 的用法：
 *   <Form.List name="fieldName">
 *     {(fields, { add, remove, move }) => (
 *       // fields 是当前的字段列表
 *       // add() 添加一个新字段
 *       // remove(index) 移除指定索引的字段
 *       // move(from, to) 移动字段位置
 *     )}
 *   </Form.List>
 *
 * 每个字段（field）包含：
 *   - key: 唯一标识
 *   - name: 字段索引（用于 Form.Item 的 name）
 *   - fieldKey: 字段 key（用于列表 key）
 *   - isListField: 是否是列表字段
 */
function DynamicFormDemo() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('动态表单提交：', values);
    message.success('提交成功！查看控制台');
  };

  return (
    <div>
      <Title level={4}>4. 动态表单项（Form.List）</Title>
      <Paragraph>
        <Text code>Form.List</Text> 用于创建可以动态增减的表单项列表。
        常用于添加多个联系方式、地址、教育经历等场景。
      </Paragraph>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          {/* Form.List 创建动态列表 */}
          {/* name 属性指定在表单值中的字段名 */}
          <Form.List name="contacts">
            {(fields, { add, remove, move }) => (
              <>
                <div style={{ marginBottom: 8 }}>
                  <Title level={5}>联系方式</Title>
                  <Text type="secondary">
                    可以添加多个联系方式，支持上下移动顺序
                  </Text>
                </div>

                {/* 遍历 fields 渲染每个表单项 */}
                {fields.map((field, index) => (
                  <Space
                    key={field.key}
                    style={{ display: 'flex', marginBottom: 8 }}
                    align="baseline"
                  >
                    {/* field.name 是索引，field.key 是唯一标识 */}
                    <Form.Item
                      {...field}
                      label={index === 0 ? '类型' : ''}
                      name={[field.name, 'type']}
                      rules={[{ required: true, message: '请选择类型' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Select placeholder="选择类型" style={{ width: 120 }}>
                        <Option value="phone">手机</Option>
                        <Option value="email">邮箱</Option>
                        <Option value="wechat">微信</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label={index === 0 ? '内容' : ''}
                      name={[field.name, 'value']}
                      rules={[{ required: true, message: '请输入内容' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="请输入联系方式" style={{ width: 200 }} />
                    </Form.Item>

                    {/* 上移按钮（第一个不可上移） */}
                    {index > 0 && (
                      <Button
                        type="link"
                        onClick={() => move(index, index - 1)}
                      >
                        上移
                      </Button>
                    )}

                    {/* 下移按钮（最后一个不可下移） */}
                    {index < fields.length - 1 && (
                      <Button
                        type="link"
                        onClick={() => move(index, index + 1)}
                      >
                        下移
                      </Button>
                    )}

                    {/* 删除按钮 */}
                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        style={{ color: '#ff4d4f', fontSize: 18 }}
                      />
                    )}
                  </Space>
                ))}

                {/* 添加按钮 */}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加联系方式
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* 嵌套 Form.List 示例：教育经历 */}
          <Divider />
          <Form.List name="education">
            {(fields, { add, remove }) => (
              <>
                <div style={{ marginBottom: 8 }}>
                  <Title level={5}>教育经历</Title>
                </div>

                {fields.map((field) => (
                  <Card
                    key={field.key}
                    size="small"
                    title={`教育经历 ${field.name + 1}`}
                    style={{ marginBottom: 16 }}
                    extra={
                      fields.length > 0 && (
                        <Button
                          type="link"
                          danger
                          onClick={() => remove(field.name)}
                        >
                          删除
                        </Button>
                      )
                    }
                  >
                    <Form.Item
                      {...field}
                      label="学校"
                      name={[field.name, 'school']}
                      rules={[{ required: true, message: '请输入学校名称' }]}
                    >
                      <Input placeholder="请输入学校名称" />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label="专业"
                      name={[field.name, 'major']}
                    >
                      <Input placeholder="请输入专业" />
                    </Form.Item>

                    <Form.Item
                      {...field}
                      label="学历"
                      name={[field.name, 'degree']}
                      rules={[{ required: true, message: '请选择学历' }]}
                    >
                      <Select placeholder="请选择学历">
                        <Option value="high_school">高中</Option>
                        <Option value="bachelor">本科</Option>
                        <Option value="master">硕士</Option>
                        <Option value="phd">博士</Option>
                      </Select>
                    </Form.Item>
                  </Card>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加教育经历
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第五部分：自定义表单控件
// ============================================================================
/**
 * 有时候 antd 内置的表单控件不能满足需求，需要自定义控件。
 * 自定义控件需要满足以下条件才能与 Form.Item 正常配合：
 *
 * 1. 接收 value 属性（当前值）
 * 2. 接收 onChange 属性（值变化时的回调）
 *
 * Form.Item 会自动将 value 和 onChange 注入到子组件中。
 * 如果子组件的值属性名不是 'value'（如 Checkbox 的 checked），
 * 可以通过 valuePropName 属性指定。
 *
 * 如果子组件触发值变化的事件名不是 'onChange'，
 * 可以通过 trigger 属性指定。
 */
function CustomControlDemo() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('自定义控件表单：', values);
    message.success('提交成功！');
  };

  return (
    <div>
      <Title level={4}>5. 自定义表单控件</Title>
      <Paragraph>
        自定义控件需要接收 <Text code>value</Text> 和 <Text code>onChange</Text> 属性。
        如果值属性名不同，使用 <Text code>valuePropName</Text> 指定。
      </Paragraph>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 500 }}
        >
          {/* Switch 的值属性是 checked 而不是 value */}
          <Form.Item
            label="是否启用通知"
            name="notification"
            valuePropName="checked"  // 指定值属性名
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          {/* Checkbox 的值属性也是 checked */}
          <Form.Item
            label="同意用户协议"
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('请先同意用户协议')),
              },
            ]}
          >
            <Checkbox>我已阅读并同意用户协议</Checkbox>
          </Form.Item>

          {/* DatePicker 的值是 dayjs 对象 */}
          <Form.Item
            label="出生日期"
            name="birthday"
            rules={[{ required: true, message: '请选择出生日期' }]}
          >
            {/* DatePicker 需要安装 dayjs：npm install dayjs */}
            {/* antd 5.x 使用 dayjs 替代了 moment */}
          </Form.Item>

          {/* 自定义标签选择器 */}
          <Form.Item label="标签" name="tags">
            <Select
              mode="tags"
              placeholder="输入后按回车添加标签"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第六部分：表单联动
// ============================================================================
/**
 * 表单联动是指一个字段的值变化时，影响其他字段的显示、选项或验证规则。
 *
 * 实现方式：
 * 1. Form.Item 的 dependencies + shouldUpdate
 *    - dependencies 声明依赖的字段
 *    - shouldUpdate: true 表示当依赖字段变化时重新渲染
 * 2. Form.useWatch() Hook（antd 5.x 推荐）
 *    - 监听指定字段的变化，返回当前值
 * 3. 在 Form.Item 的 rules 中使用 validator 获取其他字段值
 */
function FormLinkageDemo() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('联动表单：', values);
    message.success('提交成功！');
  };

  // 方式一：使用 Form.useWatch 监听字段变化（antd 5.x 推荐）
  // Form.useWatch 会返回被监听字段的当前值
  // 当字段值变化时，使用该 Hook 的组件会自动重新渲染
  const cityValue = Form.useWatch('city', form);
  const planType = Form.useWatch('planType', form);

  // 城市与区域的映射关系
  const areaOptions: Record<string, string[]> = {
    beijing: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区'],
    shanghai: ['黄浦区', '徐汇区', '长宁区', '静安区', '浦东新区'],
    guangzhou: ['天河区', '越秀区', '荔湾区', '海珠区', '白云区'],
  };

  return (
    <div>
      <Title level={4}>6. 表单联动</Title>
      <Paragraph>
        表单联动是指一个字段的值变化时，影响其他字段。
        antd 5.x 推荐使用 <Text code>Form.useWatch()</Text> Hook 实现联动。
      </Paragraph>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 500 }}
        >
          {/* 场景一：选择城市后联动区域选项 */}
          <Title level={5}>场景一：城市-区域联动</Title>
          <Form.Item
            label="城市"
            name="city"
            rules={[{ required: true, message: '请选择城市' }]}
          >
            <Select
              placeholder="请选择城市"
              onChange={() => {
                // 城市变化时，清空已选区域
                form.setFieldValue('area', undefined);
              }}
            >
              <Option value="beijing">北京</Option>
              <Option value="shanghai">上海</Option>
              <Option value="guangzhou">广州</Option>
            </Select>
          </Form.Item>

          {/* 区域选项根据城市动态变化 */}
          {/* 只有选择了城市才显示区域选择 */}
          <Form.Item
            label="区域"
            name="area"
            rules={[{ required: true, message: '请选择区域' }]}
          >
            <Select
              placeholder="请先选择城市"
              disabled={!cityValue}
              options={
                cityValue
                  ? areaOptions[cityValue]?.map((area) => ({
                      label: area,
                      value: area,
                    }))
                  : []
              }
            />
          </Form.Item>

          <Divider />

          {/* 场景二：根据选择显示/隐藏字段 */}
          <Title level={5}>场景二：条件显示字段</Title>
          <Form.Item
            label="计划类型"
            name="planType"
            rules={[{ required: true, message: '请选择计划类型' }]}
          >
            <Radio.Group>
              <Radio value="free">免费版</Radio>
              <Radio value="pro">专业版</Radio>
              <Radio value="enterprise">企业版</Radio>
            </Radio.Group>
          </Form.Item>

          {/* 只有选择专业版或企业版时才显示公司名称字段 */}
          {/* 使用 Form.useWatch 监听 planType 的变化 */}
          {planType === 'pro' && (
            <Form.Item
              label="团队名称"
              name="teamName"
              rules={[{ required: true, message: '请输入团队名称' }]}
            >
              <Input placeholder="请输入团队名称" />
            </Form.Item>
          )}

          {planType === 'enterprise' && (
            <>
              <Form.Item
                label="公司名称"
                name="companyName"
                rules={[{ required: true, message: '请输入公司名称' }]}
              >
                <Input placeholder="请输入公司名称" />
              </Form.Item>
              <Form.Item
                label="联系人"
                name="contactPerson"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </>
          )}

          <Divider />

          {/* 场景三：使用 shouldUpdate 实现联动 */}
          <Title level={5}>场景三：shouldUpdate 方式</Title>
          <Form.Item label="密码强度" name="password">
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          {/* shouldUpdate: true 表示任意字段变化都会重新渲染 */}
          <Form.Item shouldUpdate>
            {() => {
              const password = form.getFieldValue('password') || '';
              // 根据密码长度判断强度
              let strength = '无';
              let color = '#d9d9d9';
              if (password.length >= 8) {
                strength = '强';
                color = '#52c41a';
              } else if (password.length >= 6) {
                strength = '中';
                color = '#faad14';
              } else if (password.length > 0) {
                strength = '弱';
                color = '#ff4d4f';
              }
              return (
                <Text style={{ color }}>
                  密码强度：{strength}
                  {password.length > 0 && `（${password.length} 个字符）`}
                </Text>
              );
            }}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第七部分：异步验证
// ============================================================================
/**
 * 异步验证用于需要向后端请求的验证场景，例如：
 *   - 检查用户名是否已被注册
 *   - 验证手机号是否已被使用
 *   - 检查邀请码是否有效
 *
 * 实现方式：
 * 在 rules 中使用 validator 函数，返回 Promise：
 *   - Promise.resolve() 表示验证通过
 *   - Promise.reject(new Error('错误信息')) 表示验证失败
 */

// 模拟异步检查用户名是否已存在
const checkUsernameExists = (username: string): Promise<boolean> => {
  return new Promise((resolve) => {
    // 模拟网络请求延迟
    setTimeout(() => {
      // 模拟：admin、test、user 这三个用户名已被占用
      const existingUsernames = ['admin', 'test', 'user'];
      resolve(existingUsernames.includes(username));
    }, 1000);
  });
};

// 模拟异步验证邀请码
const verifyInviteCode = (code: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(code === 'ANTD2024');
    }, 800);
  });
};

function AsyncValidationDemo() {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('异步验证表单：', values);
    message.success('注册成功！');
  };

  return (
    <div>
      <Title level={4}>7. 异步验证</Title>
      <Paragraph>
        通过 <Text code>validator</Text> 返回 Promise 实现异步验证。
        常用于检查用户名是否已注册、验证邀请码等需要后端确认的场景。
      </Paragraph>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 500 }}
        >
          {/* 异步验证用户名 */}
          <Form.Item
            label="用户名"
            name="username"
            hasFeedback  // 显示验证状态图标（成功/失败/加载中）
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少 3 个字符' },
              // 异步验证：检查用户名是否已被注册
              {
                validator: async (_, value) => {
                  if (!value) return Promise.resolve();
                  // 调用模拟的异步接口
                  const exists = await checkUsernameExists(value);
                  if (exists) {
                    return Promise.reject(
                      new Error(`用户名 "${value}" 已被注册，请更换`)
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            // validateTrigger 指定触发验证的时机
            // 默认是 'onChange'，但异步验证建议使用 'onBlur' 避免频繁请求
            validateTrigger="onBlur"
          >
            <Input placeholder="请输入用户名（admin/test/user 已被占用）" />
          </Form.Item>

          {/* 异步验证邀请码 */}
          <Form.Item
            label="邀请码"
            name="inviteCode"
            hasFeedback
            rules={[
              { required: true, message: '请输入邀请码' },
              {
                validator: async (_, value) => {
                  if (!value) return Promise.resolve();
                  const valid = await verifyInviteCode(value);
                  if (!valid) {
                    return Promise.reject(new Error('邀请码无效，请检查后重试'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            validateTrigger="onBlur"
            extra="提示：有效的邀请码为 ANTD2024"
          >
            <Input placeholder="请输入邀请码" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少 8 个字符' },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="至少 8 个字符" />
          </Form.Item>

          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              注册
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

// ============================================================================
// 主组件：整合所有表单示例
// ============================================================================
export default function FormDemo() {
  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <Title level={2}>Ant Design 5.x 表单完整教程</Title>
      <Paragraph>
        Form 是 antd 中功能最丰富的组件之一。本教程从基础用法到高级特性，
        涵盖了表单验证、布局、动态表单、联动和异步验证等核心内容。
      </Paragraph>

      <Divider />

      <BasicFormDemo />
      <ValidationRulesDemo />
      <FormLayoutDemo />
      <DynamicFormDemo />
      <CustomControlDemo />
      <FormLinkageDemo />
      <AsyncValidationDemo />
    </div>
  );
}
