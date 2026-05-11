/**
 * ============================================================================
 * 01-basics.tsx - Ant Design 基础组件入门
 * ============================================================================
 *
 * 本文件演示 Ant Design 最常用的基础组件，适合刚接触 antd 的新手。
 *
 * 涵盖内容：
 *   1. Button 按钮 - 多种类型、尺寸、状态
 *   2. Input 输入框 - 基础输入、密码框、搜索框、文本域
 *   3. Typography 排版 - 标题、文本、段落
 *   4. Space 间距 - 组件间的间距控制
 *   5. Divider 分割线 - 内容分隔
 *   6. ConfigProvider 全局配置 - 主题定制、国际化、组件尺寸
 *
 * 学习目标：
 *   - 掌握 antd 组件的基本导入和使用方式
 *   - 理解 ConfigProvider 的作用和配置方法
 *   - 学会组合使用多个基础组件
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  // ===== 按钮组件 =====
  Button,
  // ===== 输入组件 =====
  Input,
  // ===== 排版组件 =====
  Typography,
  // ===== 间距组件 =====
  Space,
  // ===== 分割线组件 =====
  Divider,
  // ===== 全局配置组件 =====
  ConfigProvider,
  // ===== 图标（从 @ant-design/icons 导入）=====
  // 图标需要单独安装：npm install @ant-design/icons
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  PlusOutlined,
  DownloadOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';

// Typography 组件提供了便捷的子组件
const { Title, Text, Paragraph, Link } = Typography;

// ============================================================================
// 第一部分：Button 按钮
// ============================================================================
/**
 * Button 是最基础的交互组件，用于触发一个操作。
 *
 * 常用属性：
 *   - type: 按钮类型，可选值 'primary' | 'default' | 'dashed' | 'text' | 'link'
 *   - size: 按钮尺寸，可选值 'large' | 'middle' | 'small'
 *   - disabled: 是否禁用
 *   - loading: 是否加载中（会显示旋转图标）
 *   - danger: 是否显示危险样式（红色）
 *   - icon: 按钮图标
 *   - shape: 按钮形状，可选值 'default' | 'circle' | 'round'
 *   - block: 是否撑满父容器宽度
 */
function ButtonDemo() {
  const [loading, setLoading] = useState(false);

  // 模拟异步操作，展示 loading 状态
  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div>
      <Title level={4}>1. Button 按钮</Title>

      {/* --- 1.1 按钮类型 --- */}
      <Title level={5}>1.1 按钮类型（type）</Title>
      <Paragraph>
        Button 有多种类型，<Text code>primary</Text> 用于主要操作，{' '}
        <Text code>default</Text> 用于次要操作，<Text code>dashed</Text> 用于添加操作，
        <Text code>text</Text> 和 <Text code>link</Text> 用于不突出的操作。
      </Paragraph>
      <Space wrap>
        <Button type="primary">主要按钮 Primary</Button>
        <Button>默认按钮 Default</Button>
        <Button type="dashed">虚线按钮 Dashed</Button>
        <Button type="text">文字按钮 Text</Button>
        <Button type="link">链接按钮 Link</Button>
      </Space>

      {/* --- 1.2 危险按钮 --- */}
      <Title level={5}>1.2 危险按钮（danger）</Title>
      <Paragraph>
        添加 <Text code>danger</Text> 属性可以将按钮变为红色，常用于删除等危险操作。
      </Paragraph>
      <Space wrap>
        <Button type="primary" danger>危险主要按钮</Button>
        <Button danger>危险默认按钮</Button>
        <Button type="dashed" danger>危险虚线按钮</Button>
        <Button type="text" danger>危险文字按钮</Button>
        <Button type="link" danger>危险链接按钮</Button>
      </Space>

      {/* --- 1.3 按钮尺寸 --- */}
      <Title level={5}>1.3 按钮尺寸（size）</Title>
      <Space>
        <Button type="primary" size="large">大号 Large</Button>
        <Button type="primary" size="middle">中号 Middle</Button>
        <Button type="primary" size="small">小号 Small</Button>
      </Space>

      {/* --- 1.4 按钮形状 --- */}
      <Title level={5}>1.4 按钮形状（shape）</Title>
      <Paragraph>
        <Text code>circle</Text> 创建圆形按钮（适合放图标），<Text code>round</Text> 创建圆角按钮。
      </Paragraph>
      <Space>
        <Button shape="circle" icon={<PlusOutlined />} />
        <Button shape="round" icon={<DownloadOutlined />}>
          下载
        </Button>
        <Button type="primary" icon={<PoweroffOutlined />} loading={loading} onClick={handleLoadingClick}>
          {loading ? '加载中...' : '点击加载'}
        </Button>
      </Space>

      {/* --- 1.5 禁用与块级按钮 --- */}
      <Title level={5}>1.5 禁用与块级按钮</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button disabled>禁用按钮</Button>
        <Button type="primary" disabled>禁用主要按钮</Button>
        <Button type="primary" block>块级按钮（撑满宽度）</Button>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第二部分：Input 输入框
// ============================================================================
/**
 * Input 用于文本输入，是最常用的表单控件之一。
 *
 * 常用属性：
 *   - placeholder: 占位文本
 *   - value / onChange: 受控模式
 *   - defaultValue: 非受控模式的默认值
 *   - prefix / suffix: 前缀/后缀图标
 *   - prefixCls: 前缀样式类名
 *   - allowClear: 是否显示清除按钮
 *   - disabled: 是否禁用
 *   - status: 校验状态，可选值 'error' | 'warning'
 *   - size: 尺寸
 *
 * 扩展组件：
 *   - Input.Search: 带搜索按钮的输入框
 *   - Input.TextArea: 多行文本输入框
 *   - Input.Password: 密码输入框
 *   - Input.OTP: 验证码输入框（antd 5.x 新增）
 *   - Input.Number: 数字输入框（独立组件）
 */
function InputDemo() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <Title level={4}>2. Input 输入框</Title>

      {/* --- 2.1 基础输入框 --- */}
      <Title level={5}>2.1 基础输入框</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="请输入内容"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          allowClear  // 显示清除按钮
        />
        <Text type="secondary">当前输入值：{inputValue || '（空）'}</Text>
      </Space>

      {/* --- 2.2 带图标的输入框 --- */}
      <Title level={5}>2.2 带前缀/后缀图标</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="请输入用户名"
          prefix={<UserOutlined />}
        />
        <Input.Password
          placeholder="请输入密码"
          iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Space>

      {/* --- 2.3 搜索框 --- */}
      <Title level={5}>2.3 搜索框（Input.Search）</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.Search
          placeholder="搜索内容..."
          enterButton  // 将搜索按钮放在输入框内
          onSearch={(value) => console.log('搜索：', value)}
        />
        <Input.Search
          placeholder="自定义搜索按钮"
          enterButton="查询"
          allowClear
        />
      </Space>

      {/* --- 2.4 文本域 --- */}
      <Title level={5}>2.4 文本域（Input.TextArea）</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.TextArea
          rows={4}
          placeholder="请输入多行文本，最多 100 字"
          maxLength={100}
          showCount  // 显示字数统计
          allowClear
        />
      </Space>

      {/* --- 2.5 输入框状态 --- */}
      <Title level={5}>2.5 输入框状态</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input status="error" placeholder="错误状态" value="无效的邮箱" />
        <Input status="warning" placeholder="警告状态" value="请检查格式" />
        <Input disabled placeholder="禁用状态" defaultValue="不可编辑" />
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第三部分：Typography 排版
// ============================================================================
/**
 * Typography 用于展示文本内容，提供统一的排版规范。
 *
 * 子组件：
 *   - Title: 标题，level 属性控制级别（1-5，对应 h1-h5）
 *   - Text: 文本，支持多种预设颜色和样式
 *   - Paragraph: 段落，支持展开/收起、省略号等
 *   - Link: 链接
 *
 * 常用属性：
 *   - type: 预设颜色类型，可选值 'secondary' | 'success' | 'warning' | 'danger'
 *   - style: 自定义样式
 *   - code: 是否以代码样式显示（仅 Text）
 *   - mark: 是否添加标记高亮（仅 Text）
 *   - delete: 是否添加删除线（仅 Text）
 *   - underline: 是否添加下划线（仅 Text）
 *   - strong: 是否加粗（仅 Text）
 *   - italic: 是否斜体（仅 Text）
 *   - copyable: 是否可复制（Text、Paragraph、Title 均支持）
 *   - editable: 是否可编辑（Text、Paragraph、Title 均支持）
 *   - ellipsis: 是否自动省略（Paragraph 支持）
 */
function TypographyDemo() {
  return (
    <div>
      <Title level={4}>3. Typography 排版</Title>

      {/* --- 3.1 标题 --- */}
      <Title level={5}>3.1 标题（Title）</Title>
      <Space direction="vertical">
        <Title level={1}>一级标题 H1</Title>
        <Title level={2}>二级标题 H2</Title>
        <Title level={3}>三级标题 H3</Title>
        <Title level={4}>四级标题 H4</Title>
        <Title level={5}>五级标题 H5</Title>
      </Space>

      {/* --- 3.2 文本样式 --- */}
      <Title level={5}>3.2 文本样式（Text）</Title>
      <Paragraph>
        <Text>默认文本 </Text>
        <Text type="secondary">次要文本 </Text>
        <Text type="success">成功文本 </Text>
        <Text type="warning">警告文本 </Text>
        <Text type="danger">危险文本 </Text>
      </Paragraph>
      <Paragraph>
        <Text mark>标记文本 </Text>
        <Text code>代码文本 </Text>
        <Text keyboard>键盘文本 </Text>
        <Text underline>下划线文本 </Text>
        <Text delete>删除线文本 </Text>
        <Text strong>加粗文本 </Text>
        <Text italic>斜体文本 </Text>
      </Paragraph>

      {/* --- 3.3 可复制和可编辑文本 --- */}
      <Title level={5}>3.3 可复制和可编辑文本</Title>
      <Space direction="vertical">
        <Text copyable>点击复制这段文本</Text>
        <Text copyable={{ text: '自定义复制内容' }}>显示文本（复制内容不同）</Text>
        <Text editable>点击编辑这段文本</Text>
        <Paragraph editable={{ maxLength: 50 }}>
          这是一段可编辑的段落，最大长度 50 字。
        </Paragraph>
      </Space>

      {/* --- 3.4 链接 --- */}
      <Title level={5}>3.4 链接（Link）</Title>
      <Space>
        <Link href="https://ant.design" target="_blank">Ant Design 官网</Link>
        <Link disabled>禁用链接</Link>
      </Space>

      {/* --- 3.5 文本省略 --- */}
      <Title level={5}>3.5 文本省略（ellipsis）</Title>
      <Paragraph
        ellipsis={{ rows: 2, expandable: 'collapsible', symbol: '展开' }}
      >
        这是一段很长的文本，用于演示省略号效果。Ant Design 是一套企业级 UI 设计语言和
        React 组件库，由阿里巴巴前端团队开发和维护。它提供了丰富的组件，可以帮助开发者
        快速构建高质量的企业级中后台产品。在 antd 5.x 中，采用了全新的 CSS-in-JS 方案，
        使得主题定制更加灵活和强大。同时，Design Token 主题系统的引入，让开发者可以通过
        简单的配置来实现个性化的界面风格。无论是颜色、字体、间距还是圆角，都可以轻松定制。
      </Paragraph>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第四部分：Space 间距
// ============================================================================
/**
 * Space 用于设置组件之间的间距，是最常用的布局辅助组件。
 *
 * 常用属性：
 *   - size: 间距大小，可选值 'small' | 'middle' | 'large' | number | [number, number]
 *   - direction: 间距方向，可选值 'horizontal' | 'vertical'
 *   - align: 对齐方式，可选值 'start' | 'end' | 'center' | 'baseline'
 *   - wrap: 是否自动换行（水平模式下）
 *   - split: 设置分隔符
 */
function SpaceDemo() {
  return (
    <div>
      <Title level={4}>4. Space 间距</Title>

      {/* --- 4.1 基础间距 --- */}
      <Title level={5}>4.1 间距大小（size）</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text type="secondary">小间距 small：</Text>
          <Space size="small">
            <Button>按钮1</Button>
            <Button>按钮2</Button>
            <Button>按钮3</Button>
          </Space>
        </div>
        <div>
          <Text type="secondary">中间距 middle（默认）：</Text>
          <Space size="middle">
            <Button>按钮1</Button>
            <Button>按钮2</Button>
            <Button>按钮3</Button>
          </Space>
        </div>
        <div>
          <Text type="secondary">大间距 large：</Text>
          <Space size="large">
            <Button>按钮1</Button>
            <Button>按钮2</Button>
            <Button>按钮3</Button>
          </Space>
        </div>
        <div>
          <Text type="secondary">自定义间距（16px）：</Text>
          <Space size={16}>
            <Button>按钮1</Button>
            <Button>按钮2</Button>
            <Button>按钮3</Button>
          </Space>
        </div>
      </Space>

      {/* --- 4.2 垂直间距 --- */}
      <Title level={5}>4.2 垂直间距（direction="vertical"）</Title>
      <Space direction="vertical">
        <Button>垂直按钮 1</Button>
        <Button>垂直按钮 2</Button>
        <Button>垂直按钮 3</Button>
      </Space>

      {/* --- 4.3 自动换行 --- */}
      <Title level={5}>4.3 自动换行（wrap）</Title>
      <Paragraph>
        当水平空间不足时，<Text code>wrap</Text> 属性可以让子元素自动换行。
      </Paragraph>
      <div style={{ width: 300 }}>
        <Space wrap>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Button key={i}>按钮 {i}</Button>
          ))}
        </Space>
      </div>

      {/* --- 4.4 分隔符 --- */}
      <Title level={5}>4.4 分隔符（split）</Title>
      <Space split={<Divider type="vertical" />}>
        <Link href="#">链接1</Link>
        <Link href="#">链接2</Link>
        <Link href="#">链接3</Link>
        <Link href="#">链接4</Link>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第五部分：Divider 分割线
// ============================================================================
/**
 * Divider 用于分割内容区域，可以水平或垂直使用。
 *
 * 常用属性：
 *   - type: 分割线类型，可选值 'horizontal' | 'vertical'
 *   - orientation: 分割线标题位置，可选值 'left' | 'right' | 'center'
 *   - orientationMargin: 标题与边缘的距离
 *   - dashed: 是否使用虚线
 *   - plain: 标题是否使用普通样式（不加粗）
 *   - variant: antd 5.x 新增，可选值 'solid' | 'dashed' | 'dotted'（替代 dashed 属性）
 */
function DividerDemo() {
  return (
    <div>
      <Title level={4}>5. Divider 分割线</Title>

      {/* --- 5.1 基础分割线 --- */}
      <Title level={5}>5.1 基础分割线</Title>
      <Paragraph>上方内容</Paragraph>
      <Divider />
      <Paragraph>下方内容</Paragraph>

      {/* --- 5.2 带标题的分割线 --- */}
      <Title level={5}>5.2 带标题的分割线</Title>
      <Divider>居中文字</Divider>
      <Divider orientation="left">左侧文字</Divider>
      <Divider orientation="right">右侧文字</Divider>
      <Divider orientation="left" plain>
        左侧文字（普通样式）
      </Divider>

      {/* --- 5.3 虚线分割线 --- */}
      <Title level={5}>5.3 虚线分割线</Title>
      <Divider dashed />
      {/* antd 5.x 也支持 variant 属性 */}
      <Divider variant="dotted" />

      {/* --- 5.4 垂直分割线 --- */}
      <Title level={5}>5.4 垂直分割线</Title>
      <Space>
        <Text>文本1</Text>
        <Divider type="vertical" />
        <Text>文本2</Text>
        <Divider type="vertical" dashed />
        <Text>文本3</Text>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第六部分：ConfigProvider 全局配置
// ============================================================================
/**
 * ConfigProvider 是 antd 的全局配置组件，用于统一设置组件的主题、语言、尺寸等。
 * 它采用 React Context 机制，所有子组件都会继承这些配置。
 *
 * 核心配置项：
 *   - theme: 主题配置（Design Token）
 *     - token: 全局 Design Token（如颜色、字体、圆角等）
 *     - components: 组件级别的 Token 定制
 *     - algorithm: 主题算法（默认/暗黑/紧凑）
 *   - locale: 语言包
 *   - componentSize: 全局组件尺寸（small | middle | large）
 *   - prefixCls: 组件类名前缀（用于避免样式冲突）
 *   - getPopupContainer: 弹出层挂载容器
 *   - form: 表单全局配置
 *   - space: Space 全局配置
 */

/**
 * 6.1 主题定制示例
 * 通过 theme.token 可以修改全局 Design Token
 */
function ThemeConfigDemo() {
  return (
    <div>
      <Title level={5}>6.1 主题定制（theme.token）</Title>
      <Paragraph>
        修改 <Text code>colorPrimary</Text> 可以改变所有组件的主色调。
        以下示例展示了蓝色和绿色两种主题。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 蓝色主题（默认） */}
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1677ff',  // 主色调
              borderRadius: 8,          // 全局圆角
              colorBgContainer: '#ffffff', // 容器背景色
            },
          }}
        >
          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
            <Text type="secondary">蓝色主题：</Text>
            <Space>
              <Button type="primary">主要按钮</Button>
              <Button>默认按钮</Button>
              <Input placeholder="输入框" style={{ width: 200 }} />
            </Space>
          </div>
        </ConfigProvider>

        {/* 绿色主题 */}
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#52c41a',  // 绿色主色调
              borderRadius: 16,         // 更大的圆角
            },
          }}
        >
          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
            <Text type="secondary">绿色主题：</Text>
            <Space>
              <Button type="primary">主要按钮</Button>
              <Button>默认按钮</Button>
              <Input placeholder="输入框" style={{ width: 200 }} />
            </Space>
          </div>
        </ConfigProvider>

        {/* 紫色主题 + 组件级定制 */}
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#722ed1',  // 紫色主色调
            },
            // components 属性可以针对特定组件进行定制
            components: {
              Button: {
                // 仅修改 Button 的圆角
                borderRadius: 20,
                // 修改 Button 的高度
                controlHeight: 40,
              },
              Input: {
                // 仅修改 Input 的背景色
                colorBgContainer: '#f5f0ff',
              },
            },
          }}
        >
          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
            <Text type="secondary">紫色主题（组件级定制）：</Text>
            <Space>
              <Button type="primary">圆角按钮</Button>
              <Button>默认按钮</Button>
              <Input placeholder="紫色背景输入框" style={{ width: 200 }} />
            </Space>
          </div>
        </ConfigProvider>
      </Space>
    </div>
  );
}

/**
 * 6.2 组件尺寸配置示例
 * 通过 componentSize 可以统一设置所有组件的尺寸
 */
function SizeConfigDemo() {
  return (
    <div>
      <Title level={5}>6.2 全局组件尺寸（componentSize）</Title>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 大尺寸 */}
        <ConfigProvider componentSize="large">
          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
            <Text type="secondary">大尺寸 large：</Text>
            <Space>
              <Button type="primary">大按钮</Button>
              <Input placeholder="大输入框" style={{ width: 200 }} />
            </Space>
          </div>
        </ConfigProvider>

        {/* 中尺寸（默认） */}
        <ConfigProvider componentSize="middle">
          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
            <Text type="secondary">中尺寸 middle（默认）：</Text>
            <Space>
              <Button type="primary">中按钮</Button>
              <Input placeholder="中输入框" style={{ width: 200 }} />
            </Space>
          </div>
        </ConfigProvider>

        {/* 小尺寸 */}
        <ConfigProvider componentSize="small">
          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
            <Text type="secondary">小尺寸 small：</Text>
            <Space>
              <Button type="primary">小按钮</Button>
              <Input placeholder="小输入框" style={{ width: 200 }} />
            </Space>
          </div>
        </ConfigProvider>
      </Space>
    </div>
  );
}

/**
 * 6.3 国际化配置示例
 * 通过 locale 属性设置组件的语言
 */
function LocaleConfigDemo() {
  return (
    <div>
      <Title level={5}>6.3 国际化（locale）</Title>
      <Paragraph>
        通过 <Text code>locale</Text> 属性可以切换 antd 组件的内置语言。
        antd 内置了 50+ 种语言包，位于 <Text code>antd/locale/</Text> 目录下。
      </Paragraph>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 中文 */}
        <ConfigProvider locale={undefined}>
          <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 8 }}>
            <Text type="secondary">中文（默认）：</Text>
            <Space>
              <Button>按钮</Button>
              <Input.Search placeholder="搜索" enterButton />
            </Space>
          </div>
        </ConfigProvider>
      </Space>
    </div>
  );
}

// ============================================================================
// 主组件：整合所有示例
// ============================================================================
/**
 * 将所有基础组件示例整合到一个页面中展示。
 * 在实际项目中，你可以将每个 Demo 拆分为独立的页面组件。
 */
export default function BasicsDemo() {
  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <Title level={2}>Ant Design 5.x 基础组件教程</Title>
      <Paragraph>
        本页面展示了 Ant Design 最常用的基础组件。每个组件都有详细的中文注释，
        适合刚接触 antd 的新手学习。建议按顺序阅读，从上到下依次了解每个组件的用法。
      </Paragraph>

      <Divider />

      {/* 依次渲染各个组件示例 */}
      <ButtonDemo />
      <InputDemo />
      <TypographyDemo />
      <SpaceDemo />
      <DividerDemo />

      {/* ConfigProvider 示例 */}
      <Title level={3}>6. ConfigProvider 全局配置</Title>
      <Paragraph>
        ConfigProvider 是 antd 的全局配置组件，用于统一设置主题、语言、尺寸等。
        它使用 React Context 机制，所有子组件都会继承配置。ConfigProvider 支持嵌套，
        内层配置会覆盖外层配置。
      </Paragraph>
      <ThemeConfigDemo />
      <SizeConfigDemo />
      <LocaleConfigDemo />
    </div>
  );
}
