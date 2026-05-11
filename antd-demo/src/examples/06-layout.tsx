/**
 * ============================================================================
 * 06-layout.tsx - Ant Design 布局类组件
 * ============================================================================
 *
 * 本文件演示 Ant Design 中用于页面布局的组件。
 *
 * 涵盖内容：
 *   1. Layout 布局 - Header / Sider / Content / Footer 经典后台布局
 *   2. Grid 栅格系统 - Row / Col 响应式栅格布局
 *   3. Space 组件 - 组件间距控制（补充用法）
 *   4. Flex 布局 - antd 5.x 新增的 Flex 组件
 *   5. Card 卡片 - 信息容器
 *   6. Carousel 走马灯 - 内容轮播
 *   7. Collapse 折叠面板 - 内容折叠/展开
 *
 * 学习目标：
 *   - 掌握 Layout 组件构建经典后台布局
 *   - 学会使用 Grid 栅格系统进行响应式布局
 *   - 理解 Flex、Space、Card 等辅助布局组件的使用
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Layout,
  Row,
  Col,
  Space,
  Flex,
  Card,
  Carousel,
  Collapse,
  Button,
  Typography,
  Divider,
  Menu,
  Avatar,
  Badge,
  Tag,
  Input,
  List,
  ConfigProvider,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  BarChartOutlined,
  CloudOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ShopOutlined,
  SettingOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BellOutlined,
  SearchOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Header, Sider, Content, Footer } = Layout;

// ============================================================================
// 第一部分：Layout 布局
// ============================================================================
/**
 * Layout 是 antd 提供的布局容器组件，用于构建经典的后台管理页面布局。
 *
 * 子组件：
 *   - Layout.Header: 顶部导航栏
 *   - Layout.Sider: 侧边栏
 *   - Layout.Content: 内容区域
 *   - Layout.Footer: 底部
 *
 * Layout 属性：
 *   - hasSider: 是否包含 Sider（当 Sider 不在 Layout 直接子元素时需要设置）
 *
 * Sider 属性：
 *   - collapsible: 是否可折叠
 *   - collapsed: 是否折叠（受控）
 *   - defaultCollapsed: 默认是否折叠
 *   - onCollapse: 折叠/展开回调
 *   - trigger: 自定义折叠触发器
 *   - width: 展开宽度
 *   - collapsedWidth: 折叠宽度
 *   - breakpoint: 响应式断点，可选值 xs | sm | md | lg | xl | xxl
 *   - theme: 主题，可选值 'light' | 'dark'
 *   - reverseArrow: 是否反转折叠箭头方向
 */
function LayoutSection() {
  const [collapsed, setCollapsed] = useState(false);

  // 侧边菜单项
  const menuItems = [
    {
      key: '1',
      icon: <BarChartOutlined />,
      label: '数据看板',
    },
    {
      key: '2',
      icon: <CloudOutlined />,
      label: '云服务',
    },
    {
      key: 'sub1',
      icon: <AppstoreOutlined />,
      label: '应用管理',
      children: [
        { key: '3', label: '应用列表' },
        { key: '4', label: '应用配置' },
      ],
    },
    {
      key: 'sub2',
      icon: <TeamOutlined />,
      label: '用户管理',
      children: [
        { key: '5', label: '用户列表' },
        { key: '6', label: '角色管理' },
      ],
    },
    {
      key: '7',
      icon: <ShopOutlined />,
      label: '商城管理',
    },
    {
      key: '8',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  return (
    <div>
      <Title level={4}>1. Layout 布局</Title>
      <Paragraph>
        Layout 提供了 <Text code>Header</Text>、<Text code>Sider</Text>、
        <Text code>Content</Text>、<Text code>Footer</Text> 四个子组件，
        用于构建经典的后台管理布局。Sider 支持折叠和响应式。
      </Paragraph>

      {/* 模拟经典后台布局 */}
      <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
        <Layout style={{ minHeight: 400 }}>
          {/* 侧边栏 */}
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            theme="dark"
            // trigger={null} 可以隐藏默认的折叠按钮，自定义折叠触发器
            style={{
              // 限制高度，避免撑开页面
              height: 400,
              overflow: 'auto',
            }}
          >
            <div
              style={{
                height: 32,
                margin: 16,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: collapsed ? 14 : 16,
              }}
            >
              {collapsed ? 'AD' : 'Ant Design'}
            </div>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              items={menuItems}
            />
          </Sider>

          <Layout>
            {/* 顶部栏 */}
            <Header
              style={{
                padding: '0 16px',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
              <Space size="middle">
                <Input
                  placeholder="搜索..."
                  prefix={<SearchOutlined />}
                  style={{ width: 200 }}
                />
                <Badge count={5}>
                  <BellOutlined style={{ fontSize: 18 }} />
                </Badge>
                <Avatar icon={<UserOutlined />} />
              </Space>
            </Header>

            {/* 内容区域 */}
            <Content
              style={{
                margin: 16,
                padding: 24,
                background: '#fff',
                borderRadius: 8,
                minHeight: 200,
              }}
            >
              <Title level={5}>欢迎使用 Ant Design</Title>
              <Paragraph>
                这是一个经典的后台管理布局示例。左侧是可折叠的侧边栏，
                顶部是导航栏，中间是内容区域。
              </Paragraph>
              <Space>
                <Tag color="blue">React 19</Tag>
                <Tag color="green">Ant Design 5.x</Tag>
                <Tag color="orange">TypeScript</Tag>
              </Space>
            </Content>

            {/* 底部 */}
            <Footer style={{ textAlign: 'center', background: '#f5f5f5' }}>
              Ant Design Demo - Layout 示例
            </Footer>
          </Layout>
        </Layout>
      </div>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第二部分：Grid 栅格系统
// ============================================================================
/**
 * Grid 栅格系统基于 24 栅格体系，通过 Row 和 Col 进行布局。
 *
 * Row 属性：
 *   - gutter: 栅格间隔，可以是数字（像素）或数组 [水平间距, 垂直间距]
 *   - justify: 水平排列方式，可选值 'start' | 'end' | 'center' | 'space-around' | 'space-between'
 *   - align: 垂直对齐方式，可选值 'top' | 'middle' | 'bottom' | 'stretch'
 *   - wrap: 是否自动换行（默认 true）
 *
 * Col 属性：
 *   - span: 栅格占位格数（1-24）
 *   - offset: 栅格左侧的间隔格数
 *   - order: 栅格顺序
 *   - pull: 栅格向左移动格数
 *   - push: 栅格向右移动格数
 *   - xs: 屏幕 < 576px 时的响应式配置
 *   - sm: 屏幕 >= 576px 时的响应式配置
 *   - md: 屏幕 >= 768px 时的响应式配置
 *   - lg: 屏幕 >= 992px 时的响应式配置
 *   - xl: 屏幕 >= 1200px 时的响应式配置
 *   - xxl: 屏幕 >= 1600px 时的响应式配置
 *
 * 响应式配置示例：
 *   <Col xs={24} sm={12} md={8} lg={6}>
 *   表示：手机全宽、平板半宽、中屏 1/3、大屏 1/4
 */
function GridDemo() {
  return (
    <div>
      <Title level={4}>2. Grid 栅格系统</Title>
      <Paragraph>
        Grid 基于 24 栅格体系。<Text code>Row</Text> 定义行，<Text code>Col</Text> 定义列。
        支持响应式布局，通过 <Text code>xs</Text>、<Text code>sm</Text>、<Text code>md</Text>、
        <Text code>lg</Text>、<Text code>xl</Text>、<Text code>xxl</Text> 设置不同屏幕下的列宽。
      </Paragraph>

      {/* 基础栅格 */}
      <Title level={5}>2.1 基础栅格</Title>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ background: '#1677ff', padding: 16, color: '#fff', textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-12 (50%)
          </div>
        </Col>
        <Col span={12}>
          <div style={{ background: '#1677ff', padding: 16, color: '#fff', textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-12 (50%)
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <div style={{ background: '#4096ff', padding: 16, color: '#fff', textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-8 (33.3%)
          </div>
        </Col>
        <Col span={8}>
          <div style={{ background: '#4096ff', padding: 16, color: '#fff', textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-8 (33.3%)
          </div>
        </Col>
        <Col span={8}>
          <div style={{ background: '#4096ff', padding: 16, color: '#fff', textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-8 (33.3%)
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <div style={{ background: '#69b1ff', padding: 16, color: '#fff', textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-6 (25%)
          </div>
        </Col>
        <Col span={6}>
          <div style={{ background: '#69b1ff', padding: 16, color: '#fff', textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-6 (25%)
          </div>
        </Col>
        <Col span={6}>
          <div style={{ background: '#69b1ff', padding: 16, color: '#fff', textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-6 (25%)
          </div>
        </Col>
        <Col span={6}>
          <div style={{ background: '#69b1ff', padding: 16, color: '#fff', textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-6 (25%)
          </div>
        </Col>
      </Row>

      {/* 栅格间隔 */}
      <Title level={5}>2.2 栅格间隔（gutter）</Title>
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Col span={8} key={i}>
            <div style={{ background: '#95de64', padding: 16, textAlign: 'center', borderRadius: 4 }}>
              Col {i}
            </div>
          </Col>
        ))}
      </Row>

      {/* 左右偏移 */}
      <Title level={5}>2.3 栅格偏移（offset）</Title>
      <Row gutter={16}>
        <Col span={8}>
          <div style={{ background: '#ffa940', padding: 16, textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-8
          </div>
        </Col>
        <Col span={8} offset={8}>
          <div style={{ background: '#ffa940', padding: 16, textAlign: 'center', borderRadius: 4, marginBottom: 8 }}>
            col-8, offset-8
          </div>
        </Col>
      </Row>

      {/* 对齐方式 */}
      <Title level={5}>2.4 对齐方式</Title>
      <Paragraph>
        <Text code>justify</Text> 控制水平排列，<Text code>align</Text> 控制垂直对齐。
      </Paragraph>

      <Text type="secondary">居中对齐：</Text>
      <Row justify="center" style={{ marginBottom: 8 }}>
        <Col span={6}>
          <div style={{ background: '#b37feb', padding: 16, textAlign: 'center', borderRadius: 4, color: '#fff' }}>
            col-6
          </div>
        </Col>
        <Col span={6}>
          <div style={{ background: '#b37feb', padding: 16, textAlign: 'center', borderRadius: 4, color: '#fff' }}>
            col-6
          </div>
        </Col>
      </Row>

      <Text type="secondary">两端对齐：</Text>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Col span={6}>
          <div style={{ background: '#ff85c0', padding: 16, textAlign: 'center', borderRadius: 4, color: '#fff' }}>
            col-6
          </div>
        </Col>
        <Col span={6}>
          <div style={{ background: '#ff85c0', padding: 16, textAlign: 'center', borderRadius: 4, color: '#fff' }}>
            col-6
          </div>
        </Col>
      </Row>

      {/* 响应式栅格 */}
      <Title level={5}>2.5 响应式栅格</Title>
      <Paragraph>
        通过 <Text code>xs</Text>、<Text code>sm</Text>、<Text code>md</Text>、<Text code>lg</Text>、
        <Text code>xl</Text> 设置不同屏幕断点下的列宽。尝试调整浏览器宽度查看效果。
      </Paragraph>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <div style={{ background: '#36cfc9', padding: 16, textAlign: 'center', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
            xs:24 sm:12 md:8 lg:6 xl:4
          </div>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <div style={{ background: '#36cfc9', padding: 16, textAlign: 'center', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
            xs:24 sm:12 md:8 lg:6 xl:4
          </div>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <div style={{ background: '#36cfc9', padding: 16, textAlign: 'center', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
            xs:24 sm:12 md:8 lg:6 xl:4
          </div>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <div style={{ background: '#36cfc9', padding: 16, textAlign: 'center', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
            xs:24 sm:12 md:8 lg:6 xl:4
          </div>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <div style={{ background: '#36cfc9', padding: 16, textAlign: 'center', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
            xs:24 sm:12 md:8 lg:6 xl:4
          </div>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <div style={{ background: '#36cfc9', padding: 16, textAlign: 'center', borderRadius: 4, marginBottom: 8, color: '#fff' }}>
            xs:24 sm:12 md:8 lg:6 xl:4
          </div>
        </Col>
      </Row>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第三部分：Space 组件（补充用法）
// ============================================================================
/**
 * Space 组件的补充用法，展示更多配置选项。
 * 基础用法已在 01-basics.tsx 中介绍。
 */
function SpaceAdvancedDemo() {
  return (
    <div>
      <Title level={4}>3. Space 组件（补充用法）</Title>

      {/* 垂直对齐 */}
      <Title level={5}>3.1 对齐方式（align）</Title>
      <Space align="start">
        <div style={{ background: '#f0f0f0', padding: '4px 8px' }}>Start</div>
        <div style={{ background: '#f0f0f0', padding: '20px 8px' }}>中间高</div>
        <div style={{ background: '#f0f0f0', padding: '8px 8px' }}>End</div>
      </Space>

      <Divider />

      {/* 填充模式 */}
      <Title level={5}>3.2 填充模式（block）</Title>
      <Paragraph>
        <Text code>block</Text> 属性使 Space 成为块级元素，撑满父容器宽度。
        配合 <Text code>justify</Text> 可以控制子元素的水平分布。
      </Paragraph>
      <Space block style={{ width: '100%', background: '#f9f9f9', padding: 8 }}>
        <Button>按钮1</Button>
        <Button>按钮2</Button>
        <Button>按钮3</Button>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第四部分：Flex 布局
// ============================================================================
/**
 * Flex 是 antd 5.x 新增的布局组件，基于 CSS Flexbox。
 * 它是对 CSS Flexbox 的简单封装，提供声明式的 API。
 *
 * 常用属性：
 *   - vertical: 是否垂直排列（flex-direction: column）
 *   - gap: 间距
 *   - wrap: 是否换行
 *   - justify: 主轴对齐，可选值 'start' | 'end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
 *   - align: 交叉轴对齐，可选值 'start' | 'end' | 'center' | 'stretch' | 'baseline'
 *   - flex: flex 属性值
 *   - style: 自定义样式
 *
 * 与 Space 的区别：
 *   - Space 主要用于组件之间的间距
 *   - Flex 更接近原生 CSS Flexbox，功能更强大
 *   - Flex 支持子元素的 flex-grow / flex-shrink 等属性
 */
function FlexDemo() {
  return (
    <div>
      <Title level={4}>4. Flex 布局（antd 5.x 新增）</Title>
      <Paragraph>
        Flex 是 antd 5.x 新增的布局组件，基于 CSS Flexbox。
        比 Space 更强大，支持 flex-grow、flex-shrink 等属性。
      </Paragraph>

      {/* 基础用法 */}
      <Title level={5}>4.1 基础用法</Title>
      <Flex gap="small" style={{ marginBottom: 16 }}>
        <Button type="primary">按钮 1</Button>
        <Button>按钮 2</Button>
        <Button>按钮 3</Button>
      </Flex>

      {/* 垂直排列 */}
      <Title level={5}>4.2 垂直排列（vertical）</Title>
      <Flex vertical gap="small" style={{ marginBottom: 16 }}>
        <Button>按钮 1</Button>
        <Button>按钮 2</Button>
        <Button>按钮 3</Button>
      </Flex>

      {/* 主轴对齐 */}
      <Title level={5}>4.3 主轴对齐（justify）</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text type="secondary">space-between：</Text>
          <Flex justify="space-between" style={{ background: '#f0f0f0', padding: 8, borderRadius: 4 }}>
            <div style={{ padding: '4px 16px', background: '#1677ff', color: '#fff', borderRadius: 4 }}>左</div>
            <div style={{ padding: '4px 16px', background: '#1677ff', color: '#fff', borderRadius: 4 }}>右</div>
          </Flex>
        </div>
        <div>
          <Text type="secondary">center：</Text>
          <Flex justify="center" style={{ background: '#f0f0f0', padding: 8, borderRadius: 4 }}>
            <div style={{ padding: '4px 16px', background: '#52c41a', color: '#fff', borderRadius: 4 }}>居中</div>
          </Flex>
        </div>
        <div>
          <Text type="secondary">space-evenly：</Text>
          <Flex justify="space-evenly" style={{ background: '#f0f0f0', padding: 8, borderRadius: 4 }}>
            <div style={{ padding: '4px 16px', background: '#faad14', borderRadius: 4 }}>1</div>
            <div style={{ padding: '4px 16px', background: '#faad14', borderRadius: 4 }}>2</div>
            <div style={{ padding: '4px 16px', background: '#faad14', borderRadius: 4 }}>3</div>
          </Flex>
        </div>
      </Space>

      {/* 自动填充 */}
      <Title level={5}>4.4 自动填充（flex="auto"）</Title>
      <Paragraph>
        子元素设置 <Text code>flex="auto"</Text> 可以自动填充剩余空间。
      </Paragraph>
      <Flex gap="small">
        <div style={{ padding: '8px 16px', background: '#1677ff', color: '#fff', borderRadius: 4, whiteSpace: 'nowrap' }}>
          固定宽度
        </div>
        <div style={{ flex: 'auto', padding: 8, background: '#4096ff', color: '#fff', borderRadius: 4, textAlign: 'center' }}>
          flex: auto（自动填充剩余空间）
        </div>
        <div style={{ padding: '8px 16px', background: '#1677ff', color: '#fff', borderRadius: 4, whiteSpace: 'nowrap' }}>
          固定宽度
        </div>
      </Flex>

      {/* 等分布局 */}
      <Title level={5}>4.5 等分布局（flex={1}）</Title>
      <Flex gap="small">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{ flex: 1, padding: 16, background: '#95de64', textAlign: 'center', borderRadius: 4 }}
          >
            flex: 1（等分 {i}）
          </div>
        ))}
      </Flex>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第五部分：Card 卡片
// ============================================================================
/**
 * Card 是最基础的信息容器组件，用于包裹内容。
 *
 * 常用属性：
 *   - title: 标题
 *   - extra: 标题右侧额外操作区域
 *   - bordered: 是否显示边框
 *   - size: 尺寸，可选值 'default' | 'small'
 *   - hoverable: 鼠标悬停时是否显示浮起效果
 *   - loading: 是否加载中
 *   - cover: 封面（通常放图片）
 *   - actions: 底部操作区（数组，最多 3 个）
 *   - type: 卡片类型，可选值 'inner'（内嵌模式）
 *   - children: 内容
 *
 * Card.Grid: 网格卡片，在 Card 内部使用
 * Card.Meta: 卡片元信息，用于展示头像、标题、描述
 */
function CardDemo() {
  return (
    <div>
      <Title level={4}>5. Card 卡片</Title>
      <Paragraph>
        Card 是通用的信息容器。支持标题、封面、操作区、网格等多种形态。
      </Paragraph>

      <Row gutter={[16, 16]}>
        {/* 基础卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="基础卡片" bordered>
            <p>卡片内容区域</p>
            <p>可以放置任何内容</p>
          </Card>
        </Col>

        {/* 带额外操作的卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            title="带操作的卡片"
            extra={<a href="#">更多</a>}
          >
            <p>标题右侧可以放置操作按钮</p>
            <p>通过 extra 属性设置</p>
          </Card>
        </Col>

        {/* 悬停效果卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="悬停效果" hoverable>
            <p>设置 hoverable 属性</p>
            <p>鼠标悬停时会有浮起效果</p>
          </Card>
        </Col>

        {/* 带封面的卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            cover={
              <div
                style={{
                  height: 140,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 24,
                }}
              >
                封面图片区域
              </div>
            }
            actions={[
              <SettingOutlined key="setting" />,
              <EditOutlined key="edit" />,
              <EllipsisOutlined key="ellipsis" />,
            ]}
          >
            <Card.Meta
              avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
              title="卡片标题"
              description="这是卡片的描述信息，Card.Meta 组件可以方便地展示头像、标题和描述。"
            />
          </Card>
        </Col>

        {/* 小尺寸卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="小尺寸卡片" size="small">
            <p>通过 size="small" 设置小尺寸</p>
            <p>适合信息密度较高的场景</p>
          </Card>
        </Col>

        {/* 无边框卡片 */}
        <Col xs={24} sm={12} lg={8}>
          <Card title="无边框卡片" bordered={false} style={{ background: '#f5f5f5' }}>
            <p>设置 bordered={false}</p>
            <p>移除边框，更加简洁</p>
          </Card>
        </Col>
      </Row>

      {/* 网格卡片 */}
      <Title level={5}>5.1 网格卡片（Card.Grid）</Title>
      <Card title="网格卡片">
        <Card.Grid style={{ width: '25%', textAlign: 'center' }}>内容 1</Card.Grid>
        <Card.Grid style={{ width: '25%', textAlign: 'center' }}>内容 2</Card.Grid>
        <Card.Grid style={{ width: '25%', textAlign: 'center' }}>内容 3</Card.Grid>
        <Card.Grid style={{ width: '25%', textAlign: 'center' }}>内容 4</Card.Grid>
        <Card.Grid style={{ width: '50%', textAlign: 'center' }}>内容 5（跨两列）</Card.Grid>
        <Card.Grid style={{ width: '50%', textAlign: 'center' }}>内容 6（跨两列）</Card.Grid>
      </Card>

      {/* 加载中卡片 */}
      <Title level={5}>5.2 加载中卡片</Title>
      <Card title="加载中" loading>
        <p>内容正在加载中...</p>
      </Card>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第六部分：Carousel 走马灯
// ============================================================================
/**
 * Carousel 用于循环展示一组内容（图片、卡片等）。
 *
 * 常用属性：
 *   - autoplay: 是否自动切换
 *   - autoplaySpeed: 自动切换速度（毫秒）
 *   - dots: 是否显示指示器
 *   - dotPosition: 指示器位置，可选值 'top' | 'bottom' | 'left' | 'right'
 *   - easing: 动画效果
 *   - effect: 切换效果，可选值 'scrollx' | 'fade'
 *   - pauseOnHover: 鼠标悬停时是否暂停自动播放
 *   - afterChange: 切换完成后的回调
 *   - beforeChange: 切换前的回调
 *
 * 方法（通过 ref 调用）：
 *   - prev(): 切换到上一张
 *   - next(): 切换到下一张
 *   - goTo(slideNumber): 切换到指定张
 */
function CarouselDemo() {
  const carouselRef = useState<any>(null)[0];

  return (
    <div>
      <Title level={4}>6. Carousel 走马灯</Title>
      <Paragraph>
        Carousel 用于循环展示一组内容。支持自动播放、指示器、淡入淡出等效果。
      </Paragraph>

      {/* 基础走马灯 */}
      <Title level={5}>6.1 基础走马灯</Title>
      <Carousel autoplay>
        <div>
          <div style={{
            height: 200,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 24,
            borderRadius: 8,
          }}>
            第 1 页
          </div>
        </div>
        <div>
          <div style={{
            height: 200,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 24,
            borderRadius: 8,
          }}>
            第 2 页
          </div>
        </div>
        <div>
          <div style={{
            height: 200,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 24,
            borderRadius: 8,
          }}>
            第 3 页
          </div>
        </div>
        <div>
          <div style={{
            height: 200,
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 24,
            borderRadius: 8,
          }}>
            第 4 页
          </div>
        </div>
      </Carousel>

      {/* 淡入淡出效果 */}
      <Title level={5}>6.2 淡入淡出效果</Title>
      <Carousel effect="fade" autoplay>
        <div>
          <div style={{
            height: 150,
            background: '#1677ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            borderRadius: 8,
          }}>
            淡入淡出 1
          </div>
        </div>
        <div>
          <div style={{
            height: 150,
            background: '#52c41a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            borderRadius: 8,
          }}>
            淡入淡出 2
          </div>
        </div>
      </Carousel>

      {/* 指示器位置 */}
      <Title level={5}>6.3 指示器位置</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Carousel dotPosition="top">
          <div>
            <div style={{
              height: 100,
              background: '#faad14',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
            }}>
              指示器在顶部
            </div>
          </div>
          <div>
            <div style={{
              height: 100,
              background: '#ff4d4f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              borderRadius: 8,
            }}>
              指示器在顶部
            </div>
          </div>
        </Carousel>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第七部分：Collapse 折叠面板
// ============================================================================
/**
 * Collapse 用于将内容区域折叠/展开，节省页面空间。
 *
 * 常用属性：
 *   - items: 面板项数组（antd 5.x 推荐）
 *   - activeKey: 当前展开的面板 key（受控）
 *   - defaultActiveKey: 默认展开的面板 key
 *   - accordion: 是否使用手风琴模式（一次只展开一个）
 *   - bordered: 是否显示边框
 *   - ghost: 是否使用透明背景
 *   - expandIcon: 自定义展开图标
 *   - expandIconPosition: 展开图标位置，可选值 'start' | 'end'
 *   - collapsible: 是否可折叠，可选值 'header' | 'icon' | 'disabled'
 *   - onChange: 面板展开/折叠的回调
 *   - destroyInactivePanel: 折叠时是否销毁子面板
 *
 * CollapsePanel 属性：
 *   - key: 唯一标识
 *   - label: 标题
 *   - children: 内容
 *   - extra: 标题右侧额外内容
 *   - showArrow: 是否显示箭头
 *   - forceRender: 是否强制渲染
 *   - disabled: 是否禁用
 */
function CollapseDemo() {
  // 基础折叠面板
  const basicItems = [
    {
      key: '1',
      label: '什么是 Ant Design？',
      children: (
        <p>
          Ant Design 是一套企业级 UI 设计语言和 React 组件库，由阿里巴巴前端团队开发和维护。
          它提供了丰富的组件，可以帮助开发者快速构建高质量的企业级中后台产品。
        </p>
      ),
    },
    {
      key: '2',
      label: 'Ant Design 5.x 有什么新特性？',
      children: (
        <ul>
          <li>采用 CSS-in-JS 方案，移除了 Less 依赖</li>
          <li>全新的 Design Token 主题系统</li>
          <li>内置暗黑模式</li>
          <li>静态方法支持通过 App 组件获取上下文</li>
          <li>支持 React 19</li>
        </ul>
      ),
    },
    {
      key: '3',
      label: '如何安装 Ant Design？',
      children: (
        <p>
          使用 npm 安装：<Text code>npm install antd</Text>
          <br />
          图标库需要单独安装：<Text code>npm install @ant-design/icons</Text>
        </p>
      ),
    },
  ];

  // 带额外内容的折叠面板
  const extraItems = [
    {
      key: '1',
      label: '用户管理',
      extra: <Tag color="blue">12 个用户</Tag>,
      children: <p>用户管理模块的内容...</p>,
    },
    {
      key: '2',
      label: '角色管理',
      extra: <Tag color="green">5 个角色</Tag>,
      children: <p>角色管理模块的内容...</p>,
    },
    {
      key: '3',
      label: '权限管理',
      extra: <Tag color="orange">30 个权限</Tag>,
      children: <p>权限管理模块的内容...</p>,
    },
  ];

  return (
    <div>
      <Title level={4}>7. Collapse 折叠面板</Title>
      <Paragraph>
        Collapse 用于折叠/展开内容区域。支持手风琴模式、自定义图标、额外内容等。
      </Paragraph>

      {/* 基础折叠面板 */}
      <Title level={5}>7.1 基础折叠面板</Title>
      <Collapse
        defaultActiveKey={['1']}
        items={basicItems}
        style={{ marginBottom: 16 }}
      />

      {/* 手风琴模式 */}
      <Title level={5}>7.2 手风琴模式（accordion）</Title>
      <Paragraph>
        <Text code>accordion</Text> 模式下，一次只能展开一个面板。
      </Paragraph>
      <Collapse
        accordion
        items={basicItems}
        style={{ marginBottom: 16 }}
      />

      {/* 带额外内容 */}
      <Title level={5}>7.3 带额外内容（extra）</Title>
      <Collapse
        items={extraItems}
        style={{ marginBottom: 16 }}
      />

      {/* 无边框模式 */}
      <Title level={5}>7.4 无边框 / 透明背景</Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Collapse
          bordered={false}
          defaultActiveKey={['1']}
          items={[
            {
              key: '1',
              label: '无边框面板',
              children: <p>设置 bordered={false} 移除边框</p>,
            },
            {
              key: '2',
              label: '另一个面板',
              children: <p>更加简洁的外观</p>,
            },
          ]}
        />
        <Collapse
          ghost
          defaultActiveKey={['1']}
          items={[
            {
              key: '1',
              label: '透明背景面板',
              children: <p>设置 ghost 属性使用透明背景</p>,
            },
            {
              key: '2',
              label: '另一个面板',
              children: <p>适合嵌入到其他组件中</p>,
            },
          ]}
        />
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 主组件：整合所有布局组件示例
// ============================================================================

export default function LayoutDemo() {
  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      <Title level={2}>Ant Design 5.x 布局类组件教程</Title>
      <Paragraph>
        布局类组件用于构建页面的整体结构和内容排列。本教程涵盖了 Layout、Grid、
        Space、Flex、Card、Carousel、Collapse 七种布局组件。
      </Paragraph>

      <Divider />

      <LayoutSection />
      <GridDemo />
      <SpaceAdvancedDemo />
      <FlexDemo />
      <CardDemo />
      <CarouselDemo />
      <CollapseDemo />
    </div>
  );
}
