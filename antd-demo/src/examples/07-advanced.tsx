/**
 * ============================================================================
 * 07-advanced.tsx - Ant Design 高级用法
 * ============================================================================
 *
 * 本文件演示 Ant Design 5.x 的高级特性和最佳实践。
 *
 * 涵盖内容：
 *   1. 自定义主题（Design Token）- Seed Token、Map Token、Component Token
 *   2. 暗黑模式 - theme.darkAlgorithm、跟随系统
 *   3. CSS-in-JS（antd 5.x）- @ant-design/cssinjs、动态主题
 *   4. 国际化（ConfigProvider + locale）- 多语言切换
 *   5. ProComponents 简介 - 高级业务组件
 *   6. antd 与 React 19 配合 - 并发特性、use() 等
 *
 * 学习目标：
 *   - 掌握 Design Token 主题系统的三层定制
 *   - 学会实现暗黑模式切换
 *   - 理解 antd 5.x CSS-in-JS 架构的优势
 *   - 了解 ProComponents 和 React 19 的配合
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  Card,
  ConfigProvider,
  Space,
  Typography,
  Divider,
  Switch,
  Radio,
  Input,
  Select,
  Form,
  Table,
  Tag,
  Tabs,
  theme,
  App,
  message,
  Flex,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  SunOutlined,
  MoonOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  AppstoreOutlined,
  SmileOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph, Link } = Typography;

// ============================================================================
// 第一部分：自定义主题（Design Token）
// ============================================================================
/**
 * Design Token 是 antd 5.x 的核心主题定制机制。
 * 它分为三个层级：
 *
 * 1. Seed Token（种子变量）：
 *    - 最基础的变量，如 colorPrimary、fontSize、borderRadius 等
 *    - 修改 Seed Token 会影响所有相关的 Map Token 和 Component Token
 *    - 适合全局主题定制
 *
 * 2. Map Token（映射变量）：
 *    - 由 Seed Token 派生而来，如 colorBgContainer、colorText 等
 *    - 可以直接覆盖，但通常通过修改 Seed Token 来间接修改
 *    - 适合精细调整
 *
 * 3. Component Token（组件级变量）：
 *    - 针对特定组件的变量，如 Button 的 controlHeight、Table 的 headerBg 等
 *    - 通过 theme.components 配置
 *    - 适合组件级定制
 *
 * 使用方式：
 *   <ConfigProvider theme={{ token: { ... }, components: { ... } }}>
 *     <App />
 *   </ConfigProvider>
 *
 * 获取 Token：
 *   const { token } = theme.useToken();
 *   可以在组件内获取当前主题的 Token 值
 */
function DesignTokenDemo() {
  // 使用 theme.useToken() 获取当前主题的 Token
  // 返回值包含 token（Map Token）、hashId（CSS hash）等
  const { token } = theme.useToken();

  return (
    <div>
      <Title level={4}>1. 自定义主题（Design Token）</Title>
      <Paragraph>
        antd 5.x 使用 Design Token 系统进行主题定制，分为三层：
        Seed Token（种子变量）、Map Token（映射变量）、Component Token（组件级变量）。
      </Paragraph>

      {/* 1.1 Seed Token 定制 */}
      <Title level={5}>1.1 Seed Token 定制（全局主题）</Title>
      <Paragraph>
        修改 Seed Token（如 <Text code>colorPrimary</Text>）会级联影响所有相关组件。
      </Paragraph>

      <Row gutter={[16, 16]}>
        {/* 蓝色主题 */}
        <Col xs={24} sm={12} lg={8}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1677ff',
                borderRadius: 6,
              },
            }}
          >
            <Card title="蓝色主题（默认）" size="small">
              <Space direction="vertical">
                <Button type="primary">主要按钮</Button>
                <Button>默认按钮</Button>
                <Input placeholder="输入框" />
                <Tag color="blue">标签</Tag>
              </Space>
            </Card>
          </ConfigProvider>
        </Col>

        {/* 绿色主题 */}
        <Col xs={24} sm={12} lg={8}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#52c41a',
                borderRadius: 12,
              },
            }}
          >
            <Card title="绿色主题" size="small">
              <Space direction="vertical">
                <Button type="primary">主要按钮</Button>
                <Button>默认按钮</Button>
                <Input placeholder="输入框" />
                <Tag color="green">标签</Tag>
              </Space>
            </Card>
          </ConfigProvider>
        </Col>

        {/* 紫色主题 */}
        <Col xs={24} sm={12} lg={8}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#722ed1',
                borderRadius: 20,
              },
            }}
          >
            <Card title="紫色主题" size="small">
              <Space direction="vertical">
                <Button type="primary">主要按钮</Button>
                <Button>默认按钮</Button>
                <Input placeholder="输入框" />
                <Tag color="purple">标签</Tag>
              </Space>
            </Card>
          </ConfigProvider>
        </Col>
      </Row>

      {/* 1.2 Component Token 定制 */}
      <Title level={5}>1.2 Component Token 定制（组件级）</Title>
      <Paragraph>
        通过 <Text code>theme.components</Text> 可以针对特定组件进行定制。
        以下示例定制了 Button 和 Input 的样式。
      </Paragraph>

      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#eb2f96',
          },
          components: {
            // 定制 Button 组件
            Button: {
              controlHeight: 44,           // 按钮高度
              borderRadius: 22,            // 按钮圆角
              fontWeight: 600,             // 字体粗细
              primaryShadow: '0 2px 8px rgba(235, 47, 150, 0.4)', // 主按钮阴影
            },
            // 定制 Input 组件
            Input: {
              controlHeight: 44,
              borderRadius: 22,
              colorBgContainer: '#fff0f6',  // 输入框背景色
              activeBorderColor: '#eb2f96', // 激活边框色
            },
            // 定制 Card 组件
            Card: {
              borderRadiusLG: 16,
            },
          },
        }}
      >
        <Card title="组件级定制" size="small" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary">定制的主按钮</Button>
            <Button>定制的默认按钮</Button>
            <Input placeholder="定制的输入框" style={{ maxWidth: 300 }} />
          </Space>
        </Card>
      </ConfigProvider>

      {/* 1.3 使用 theme.useToken() */}
      <Title level={5}>1.3 在组件内获取 Token</Title>
      <Paragraph>
        使用 <Text code>theme.useToken()</Text> Hook 可以在组件内获取当前主题的 Token 值，
        用于自定义样式中保持与主题一致。
      </Paragraph>

      <Card size="small">
        <Space direction="vertical">
          <Text>当前主色调：<Text style={{ color: token.colorPrimary }}>{token.colorPrimary}</Text></Text>
          <Text>圆角大小：{token.borderRadius}px</Text>
          <Text>字体大小：{token.fontSize}px</Text>
          <Text>字体族：{token.fontFamily}</Text>
          <div
            style={{
              background: token.colorPrimary,
              color: '#fff',
              padding: '8px 16px',
              borderRadius: token.borderRadius,
              display: 'inline-block',
            }}
          >
            使用 Token 创建的自定义元素
          </div>
        </Space>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第二部分：暗黑模式
// ============================================================================
/**
 * antd 5.x 内置了暗黑模式支持，通过 theme.darkAlgorithm 实现。
 *
 * 实现方式：
 *   1. 使用 theme.darkAlgorithm：
 *      <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
 *
 *   2. 跟随系统主题：
 *      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
 *      根据系统主题偏好自动切换
 *
 *   3. 动态切换：
 *      通过 state 控制算法，实现手动切换
 *
 * 注意事项：
 *   - 暗黑模式下，背景色和文字色会自动反转
 *   - 自定义颜色在暗黑模式下可能需要额外调整
 *   - 可以通过 theme.darkAlgorithm 和自定义 token 结合使用
 *   - 建议同时设置 body 的背景色
 */
function DarkModeDemo() {
  const [isDark, setIsDark] = useState(false);

  // 跟随系统主题
  const [followSystem, setFollowSystem] = useState(false);

  // 检测系统主题偏好
  useEffect(() => {
    if (!followSystem) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [followSystem]);

  // 切换暗黑模式
  const toggleDark = () => {
    setIsDark(!isDark);
  };

  return (
    <div>
      <Title level={4}>2. 暗黑模式</Title>
      <Paragraph>
        antd 5.x 内置暗黑模式，通过 <Text code>theme.darkAlgorithm</Text> 一行配置即可启用。
        支持手动切换和跟随系统主题。
      </Paragraph>

      {/* 切换控制 */}
      <Space style={{ marginBottom: 16 }}>
        <Switch
          checked={isDark}
          onChange={toggleDark}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
        />
        <Text>{isDark ? '暗黑模式' : '亮色模式'}</Text>
        <Divider type="vertical" />
        <Switch
          checked={followSystem}
          onChange={setFollowSystem}
          checkedChildren="跟随系统"
          unCheckedChildren="手动切换"
        />
      </Space>

      {/* 使用暗黑算法 */}
      <ConfigProvider
        theme={{
          // 根据状态选择算法
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          // 可以在暗黑模式下进一步自定义 token
          token: {
            // 暗黑模式下可以调整一些颜色
            ...(isDark ? {
              colorPrimary: '#1668dc',
            } : {}),
          },
        }}
      >
        <Card title={isDark ? '暗黑模式预览' : '亮色模式预览'}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space>
              <Button type="primary">主要按钮</Button>
              <Button>默认按钮</Button>
              <Button type="dashed">虚线按钮</Button>
              <Button danger>危险按钮</Button>
            </Space>

            <Space>
              <Tag color="success">成功</Tag>
              <Tag color="processing">进行中</Tag>
              <Tag color="error">错误</Tag>
              <Tag color="warning">警告</Tag>
            </Space>

            <Input placeholder="输入框" style={{ maxWidth: 300 }} />

            <Table
              dataSource={[
                { key: '1', name: '张三', age: 28, status: '在职' },
                { key: '2', name: '李四', age: 32, status: '休假' },
              ]}
              columns={[
                { title: '姓名', dataIndex: 'name' },
                { title: '年龄', dataIndex: 'age' },
                {
                  title: '状态',
                  dataIndex: 'status',
                  render: (status: string) => (
                    <Tag color={status === '在职' ? 'green' : 'orange'}>{status}</Tag>
                  ),
                },
              ]}
              pagination={false}
              size="small"
            />
          </Space>
        </Card>
      </ConfigProvider>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第三部分：CSS-in-JS（antd 5.x）
// ============================================================================
/**
 * antd 5.x 采用 CSS-in-JS 方案（基于 @ant-design/cssinjs），取代了 4.x 的 Less。
 *
 * 核心变化：
 *   1. 不再需要引入样式文件（如 import 'antd/dist/antd.css'）
 *   2. 样式随组件自动注入，支持 SSR
 *   3. 支持运行时动态修改主题，无需重新编译
 *   4. 通过 hashId 避免样式冲突
 *
 * 优势：
 *   - 动态主题：无需重新编译即可切换主题
 *   - 按需加载：只注入使用到的组件样式
 *   - 样式隔离：通过 hashId 避免全局样式冲突
 *   - SSR 友好：支持服务端渲染
 *
 * 注意事项：
 *   - 如果需要提取 CSS 文件（如 SSR 场景），可以使用 @ant-design/cssinjs 的 extractStyle
 *   - 自定义样式建议使用 CSS Modules 或 styled-components，避免全局样式污染
 *   - prefixCls 属性可以修改组件的 CSS 类名前缀
 */
function CssInJsDemo() {
  const { token } = theme.useToken();

  return (
    <div>
      <Title level={4}>3. CSS-in-JS（antd 5.x）</Title>
      <Paragraph>
        antd 5.x 采用 CSS-in-JS 方案，样式随组件自动注入，无需手动引入样式文件。
        这使得动态主题切换成为可能，无需重新编译。
      </Paragraph>

      <Alert
        type="info"
        showIcon
        message="CSS-in-JS 优势"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>无需引入样式文件，组件自带样式</li>
            <li>支持运行时动态主题切换</li>
            <li>通过 hashId 实现样式隔离</li>
            <li>支持 SSR（服务端渲染）</li>
          </ul>
        }
        style={{ marginBottom: 16 }}
      />

      {/* 动态主题切换示例 */}
      <Title level={5}>3.1 动态主题切换</Title>
      <Paragraph>
        以下示例展示了运行时动态修改主题色。在 antd 4.x 中需要重新编译 Less，
        而在 5.x 中可以即时生效。
      </Paragraph>

      <DynamicThemeExample />

      {/* prefixCls 演示 */}
      <Title level={5}>3.2 自定义类名前缀（prefixCls）</Title>
      <Paragraph>
        通过 <Text code>prefixCls</Text> 属性可以修改组件的 CSS 类名前缀，
        用于避免与其他 UI 库的样式冲突。
      </Paragraph>

      <ConfigProvider prefixCls="custom-antd">
        <Card title="使用自定义前缀" size="small">
          <Space>
            <Button type="primary">自定义前缀按钮</Button>
            <Input placeholder="自定义前缀输入框" style={{ width: 200 }} />
          </Space>
          <Paragraph type="secondary" style={{ marginTop: 8 }}>
            查看浏览器开发者工具，可以看到这些组件的类名前缀是 "custom-antd" 而不是 "ant"。
          </Paragraph>
        </Card>
      </ConfigProvider>

      <Divider />
    </div>
  );
}

/**
 * 动态主题切换示例组件
 */
function DynamicThemeExample() {
  const [primaryColor, setPrimaryColor] = useState('#1677ff');

  // 使用 useMemo 缓存 theme 配置，避免不必要的重渲染
  const themeConfig = useMemo(() => ({
    token: {
      colorPrimary: primaryColor,
    },
  }), [primaryColor]);

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Text>选择主题色：</Text>
        {['#1677ff', '#52c41a', '#eb2f96', '#faad14', '#722ed1', '#13c2c2'].map((color) => (
          <div
            key={color}
            onClick={() => setPrimaryColor(color)}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: color,
              cursor: 'pointer',
              border: primaryColor === color ? '2px solid #000' : '2px solid transparent',
              transition: 'all 0.3s',
            }}
          />
        ))}
        <Input
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          style={{ width: 100 }}
          placeholder="自定义颜色"
        />
      </Space>

      <ConfigProvider theme={themeConfig}>
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button type="primary">主要按钮</Button>
              <Button>默认按钮</Button>
              <Button type="dashed">虚线按钮</Button>
            </Space>
            <Input placeholder="输入框" style={{ maxWidth: 300 }} />
            <Tag color={primaryColor}>自定义颜色标签</Tag>
          </Space>
        </Card>
      </ConfigProvider>
    </div>
  );
}

// ============================================================================
// 第四部分：国际化（ConfigProvider + locale）
// ============================================================================
/**
 * antd 内置了 50+ 种语言的国际化支持。
 *
 * 使用方式：
 *   import zhCN from 'antd/locale/zh_CN';
 *   import enUS from 'antd/locale/en_US';
 *
 *   <ConfigProvider locale={zhCN}>
 *     <App />
 *   </ConfigProvider>
 *
 * 常用语言包：
 *   - zh_CN: 简体中文
 *   - zh_TW: 繁体中文
 *   - en_US: 英语
 *   - ja_JP: 日语
 *   - ko_KR: 韩语
 *   - fr_FR: 法语
 *   - de_DE: 德语
 *   - ru_RU: 俄语
 *
 * 注意事项：
 *   - DatePicker 等日期组件还需要设置 dayjs 的语言：
 *     import 'dayjs/locale/zh-cn';
 *   - 自定义语言包可以通过合并默认语言包实现
 *   - 语言包会影响组件内置文本（如确认按钮、空数据提示等）
 */
function I18nDemo() {
  const [locale, setLocale] = useState<'zh_CN' | 'en_US' | 'ja_JP'>('zh_CN');

  // 动态导入语言包（实际项目中可以静态导入）
  // 这里为了演示效果，使用条件渲染
  const localeLabel: Record<string, string> = {
    zh_CN: '简体中文',
    en_US: 'English',
    ja_JP: '日本語',
  };

  return (
    <div>
      <Title level={4}>4. 国际化（ConfigProvider + locale）</Title>
      <Paragraph>
        antd 内置了 50+ 种语言包。通过 <Text code>ConfigProvider</Text> 的{' '}
        <Text code>locale</Text> 属性切换语言。语言包会影响组件的内置文本，
        如分页的"条/页"、表格的"筛选"、日期选择器的星期名称等。
      </Paragraph>

      <Alert
        type="warning"
        showIcon
        message="注意"
        description="实际使用时需要动态导入语言包。此处仅演示切换效果。"
        style={{ marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16 }}>
        <GlobalOutlined />
        <Text>选择语言：</Text>
        <Radio.Group
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          <Radio.Button value="zh_CN">简体中文</Radio.Button>
          <Radio.Button value="en_US">English</Radio.Button>
          <Radio.Button value="ja_JP">日本語</Radio.Button>
        </Radio.Group>
      </Space>

      <Card title={`当前语言：${localeLabel[locale]}`} size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>语言切换会影响以下组件的内置文本：</Text>
          <ul>
            <li>Table 的分页、筛选、排序提示</li>
            <li>Pagination 的"条/页"文本</li>
            <li>DatePicker 的星期、月份名称</li>
            <li>Modal 的"确定"/"取消"按钮</li>
            <li>Upload 的"点击上传"提示</li>
            <li>Empty 的"暂无数据"提示</li>
            <li>TimePicker 的时间格式</li>
          </ul>
        </Space>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第五部分：ProComponents 简介
// ============================================================================
/**
 * ProComponents 是 antd 团队推出的高级业务组件库，
 * 基于 antd 封装了常用的业务场景组件。
 *
 * 核心组件：
 *   1. ProLayout - 专业布局
 *      - 内置了侧边栏菜单、面包屑、标签页等
 *      - 支持多标签页、权限菜单、国际化
 *
 *   2. ProTable - 高级表格
 *      - 内置了搜索栏、工具栏、分页
 *      - 支持一键请求数据、批量操作、树形表格
 *      - 极大简化了 CRUD 页面的开发
 *
 *   3. ProForm - 高级表单
 *      - 内置了表单布局、分组、步骤表单
 *      - 支持丰富的表单控件（ProFormText、ProFormSelect 等）
 *      - 支持表单联动、异步验证
 *
 *   4. ProList - 高级列表
 *      - 支持搜索、筛选、无限滚动
 *
 *   5. ProCard - 高级卡片
 *      - 支持分栏、折叠、加载
 *
 *   6. ProDescriptions - 高级描述列表
 *      - 支持请求加载、可编辑
 *
 * 安装：
 *   npm install @ant-design/pro-components
 *   或单独安装某个组件：
 *   npm install @ant-design/pro-table
 *
 * 官网：https://procomponents.ant.design/
 */
function ProComponentsDemo() {
  return (
    <div>
      <Title level={4}>5. ProComponents 简介</Title>
      <Paragraph>
        ProComponents 是 antd 团队推出的高级业务组件库，封装了常用的业务场景。
        它不是 antd 的一部分，需要单独安装。
      </Paragraph>

      <Alert
        type="info"
        showIcon
        icon={<AppstoreOutlined />}
        message="ProComponents 是独立包"
        description="ProComponents 需要单独安装：npm install @ant-design/pro-components"
        style={{ marginBottom: 16 }}
      />

      {/* ProTable 对比 */}
      <Card title="ProTable vs 原生 Table" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>原生 Table（antd）</Title>
            <Paragraph type="secondary">
              需要手动实现：
              <ul>
                <li>搜索栏</li>
                <li>工具栏（新增、导出按钮）</li>
                <li>数据请求逻辑</li>
                <li>分页逻辑</li>
                <li>批量操作</li>
                <li>行内编辑</li>
              </ul>
              适合：简单的数据展示场景
            </Paragraph>
          </Col>
          <Col span={12}>
            <Title level={5}>ProTable（ProComponents）</Title>
            <Paragraph type="secondary">
              内置提供：
              <ul>
                <li>搜索栏（自动生成）</li>
                <li>工具栏（可配置）</li>
                <li>数据请求（request 属性）</li>
                <li>分页（自动处理）</li>
                <li>批量操作（rowSelection）</li>
                <li>行内编辑（editable）</li>
              </ul>
              适合：CRUD 管理页面
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* ProForm 对比 */}
      <Card title="ProForm vs 原生 Form" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Title level={5}>原生 Form（antd）</Title>
            <Paragraph type="secondary">
              需要手动实现：
              <ul>
                <li>表单布局</li>
                <li>表单分组</li>
                <li>步骤表单</li>
                <li>查询表单</li>
                <li>轻量表单</li>
              </ul>
              适合：自定义程度高的表单
            </Paragraph>
          </Col>
          <Col span={12}>
            <Title level={5}>ProForm（ProComponents）</Title>
            <Paragraph type="secondary">
              内置提供：
              <ul>
                <li>表单布局（自动网格）</li>
                <li>表单分组（ProFormGroupBox）</li>
                <li>步骤表单（StepsForm）</li>
                <li>查询表单（QueryFilter）</li>
                <li>轻量表单（LightFilter）</li>
              </ul>
              适合：标准 CRUD 表单
            </Paragraph>
          </Col>
        </Row>
      </Card>

      {/* ProLayout 示例说明 */}
      <Card title="ProLayout" size="small">
        <Paragraph>
          ProLayout 提供了开箱即用的中后台布局方案，内置了：
        </Paragraph>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small" type="inner">
              <Text strong>侧边栏菜单</Text>
              <Paragraph type="secondary">
                支持多级菜单、图标、徽标、权限过滤
              </Paragraph>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" type="inner">
              <Text strong>多标签页</Text>
              <Paragraph type="secondary">
                支持标签页缓存、关闭、右键菜单
              </Paragraph>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" type="inner">
              <Text strong>国际化</Text>
              <Paragraph type="secondary">
                内置多语言支持，菜单标题可配置
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第六部分：antd 与 React 19 配合
// ============================================================================
/**
 * antd 5.x 已支持 React 19，包括以下特性：
 *
 * 1. 兼容性：
 *    - antd 5.x 的所有组件均兼容 React 19
 *    - 包括 Hooks、Context、并发特性等
 *
 * 2. 并发特性：
 *    - React 19 的 useTransition、useDeferredValue 等
 *    - antd 组件在并发模式下表现良好
 *    - 可以配合 Suspense 实现更好的加载体验
 *
 * 3. use() Hook：
 *    - React 19 新增的 use() Hook
 *    - 可以在组件中直接使用 Promise
 *    - antd 的数据请求场景可以受益
 *
 * 4. Server Components：
 *    - React 19 的 Server Components
 *    - antd 5.x 的 CSS-in-JS 方案对 SSR 更友好
 *    - 可以使用 extractStyle 提取样式
 *
 * 5. 新的 React API：
 *    - useFormStatus
 *    - useFormState
 *    - useOptimistic
 *    - useActionState
 *
 * 注意事项：
 *   - 确保 antd 版本 >= 5.0
 *   - @ant-design/icons 也需要兼容版本
 *   - 某些第三方 antd 生态库可能尚未适配 React 19
 */
function React19Demo() {
  return (
    <div>
      <Title level={4}>6. antd 与 React 19 配合</Title>
      <Paragraph>
        antd 5.x 已完全支持 React 19。CSS-in-JS 架构对并发特性和 SSR 更加友好。
      </Paragraph>

      <Alert
        type="success"
        showIcon
        icon={<ThunderboltOutlined />}
        message="React 19 兼容"
        description="antd 5.x 已全面支持 React 19，包括并发特性、Server Components 等新功能。"
        style={{ marginBottom: 16 }}
      />

      {/* 兼容性说明 */}
      <Card title="兼容性概览" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card size="small" type="inner" title="Hooks">
              <Space direction="vertical">
                <Tag color="green">useState</Tag>
                <Tag color="green">useEffect</Tag>
                <Tag color="green">useContext</Tag>
                <Tag color="green">useMemo</Tag>
                <Tag color="green">useCallback</Tag>
                <Tag color="green">useRef</Tag>
                <Tag color="green">Form.useForm()</Tag>
                <Tag color="green">theme.useToken()</Tag>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card size="small" type="inner" title="React 19 新特性">
              <Space direction="vertical">
                <Tag color="blue">useTransition</Tag>
                <Tag color="blue">useDeferredValue</Tag>
                <Tag color="blue">use()</Tag>
                <Tag color="blue">useActionState</Tag>
                <Tag color="blue">useOptimistic</Tag>
                <Tag color="blue">useFormStatus</Tag>
                <Tag color="blue">Server Components</Tag>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card size="small" type="inner" title="antd 5.x 特性">
              <Space direction="vertical">
                <Tag color="purple">CSS-in-JS</Tag>
                <Tag color="purple">Design Token</Tag>
                <Tag color="purple">暗黑模式</Tag>
                <Tag color="purple">App 组件</Tag>
                <Tag color="purple">SSR 支持</Tag>
                <Tag color="purple">静态方法改进</Tag>
                <Tag color="purple">Flex 组件</Tag>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 最佳实践 */}
      <Card title="最佳实践" size="small">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>1. 使用 App 组件包裹应用</Text>
            <Paragraph type="secondary">
              <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`import { ConfigProvider, App } from 'antd';

<ConfigProvider theme={{ ... }}>
  <App>
    <YourApp />
  </App>
</ConfigProvider>`}
              </pre>
            </Paragraph>
          </div>

          <div>
            <Text strong>2. 使用 App.useApp() 获取静态方法</Text>
            <Paragraph type="secondary">
              <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`function MyComponent() {
  const { message, notification, modal } = App.useApp();

  const handleClick = () => {
    message.success('操作成功');
  };

  return <Button onClick={handleClick}>点击</Button>;
}`}
              </pre>
            </Paragraph>
          </div>

          <div>
            <Text strong>3. 使用 theme.useToken() 获取主题变量</Text>
            <Paragraph type="secondary">
              <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`function MyComponent() {
  const { token } = theme.useToken();

  return (
    <div style={{ color: token.colorPrimary }}>
      使用主题色的文字
    </div>
  );
}`}
              </pre>
            </Paragraph>
          </div>

          <div>
            <Text strong>4. 使用 Form.useWatch() 实现表单联动</Text>
            <Paragraph type="secondary">
              <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
{`function MyForm() {
  const [form] = Form.useForm();
  const city = Form.useWatch('city', form);

  return (
    <Form form={form}>
      <Form.Item name="city">
        <Select options={cityOptions} />
      </Form.Item>
      <Form.Item name="area">
        <Select options={getAreasByCity(city)} />
      </Form.Item>
    </Form>
  );
}`}
              </pre>
            </Paragraph>
          </div>
        </Space>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 主组件：整合所有高级用法示例
// ============================================================================
export default function AdvancedDemo() {
  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>Ant Design 5.x 高级用法教程</Title>
      <Paragraph>
        本教程涵盖 antd 5.x 的高级特性，包括 Design Token 主题系统、暗黑模式、
        CSS-in-JS 架构、国际化、ProComponents 以及与 React 19 的配合。
      </Paragraph>

      <Divider />

      <DesignTokenDemo />
      <DarkModeDemo />
      <CssInJsDemo />
      <I18nDemo />
      <ProComponentsDemo />
      <React19Demo />
    </div>
  );
}
