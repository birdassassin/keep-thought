/**
 * ============================================================================
 * 05-navigation.tsx - Ant Design 导航类组件
 * ============================================================================
 *
 * 本文件演示 Ant Design 中用于页面导航的组件。
 *
 * 涵盖内容：
 *   1. Menu 菜单 - 顶部导航、侧边导航、子菜单
 *   2. Tabs 标签页 - 基础用法、卡片式、位置、新增/关闭
 *   3. Breadcrumb 面包屑 - 路径导航
 *   4. Pagination 分页 - 页码切换
 *   5. Steps 步骤条 - 流程引导
 *   6. Dropdown 下拉菜单 - 操作菜单
 *
 * 学习目标：
 *   - 掌握 Menu 的各种模式和配置方式
 *   - 学会使用 Tabs 组织内容区域
 *   - 理解 Steps 在流程引导中的使用
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Menu,
  Tabs,
  Breadcrumb,
  Pagination,
  Steps,
  Dropdown,
  Button,
  Space,
  Typography,
  Divider,
  Card,
  message,
} from 'antd';
import type { MenuProps, TabsProps } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  MailOutlined,
  AppstoreOutlined,
  PlusOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  MoreOutlined,
  FileOutlined,
  TeamOutlined,
  NotificationOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 第一部分：Menu 菜单
// ============================================================================
/**
 * Menu 是导航菜单组件，支持顶部导航和侧边导航。
 *
 * 模式（mode）：
 *   - vertical: 垂直菜单（默认）
 *   - horizontal: 水平菜单（适合顶部导航）
 *   - inline: 内嵌菜单（子菜单缩进展开）
 *
 * 主题（theme）：
 *   - light: 亮色主题
 *   - dark: 暗色主题
 *
 * 核心概念：
 *   - items: 菜单项数组（antd 5.x 推荐方式，替代 Menu.Item / Menu.SubMenu 子组件）
 *   - onClick: 点击菜单项的回调
 *   - selectedKeys: 当前选中的菜单项
 *   - openKeys: 当前展开的子菜单
 *   - defaultSelectedKeys: 默认选中的菜单项
 *   - defaultOpenKeys: 默认展开的子菜单
 *
 * MenuItem 的类型：
 *   - 普通项：{ key, icon, label }
 *   - 分组：{ key, type: 'group', label, children }
 *   - 分割线：{ key, type: 'divider' }
 *   - 子菜单：{ key, icon, label, children }
 */
function MenuDemo() {
  const [current, setCurrent] = useState('mail');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // 水平菜单项
  const horizontalItems: MenuProps['items'] = [
    {
      key: 'mail',
      icon: <MailOutlined />,
      label: '邮件',
    },
    {
      key: 'app',
      icon: <AppstoreOutlined />,
      label: '应用',
    },
    {
      key: 'setting',
      icon: <SettingOutlined />,
      label: '设置',
      // children 定义子菜单
      children: [
        { key: 'setting:1', label: '个人设置' },
        { key: 'setting:2', label: '系统设置' },
        { key: 'setting:3', label: '安全设置' },
      ],
    },
  ];

  // 侧边菜单项（更复杂的结构）
  const sideItems: MenuProps['items'] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: 'user',
      icon: <UserOutlined />,
      label: '用户管理',
      children: [
        { key: 'user:list', label: '用户列表' },
        { key: 'user:role', label: '角色管理' },
        { key: 'user:permission', label: '权限管理' },
      ],
    },
    {
      key: 'content',
      icon: <FileOutlined />,
      label: '内容管理',
      children: [
        { key: 'content:article', label: '文章管理' },
        { key: 'content:category', label: '分类管理' },
        { key: 'content:tag', label: '标签管理' },
      ],
    },
    {
      key: 'team',
      icon: <TeamOutlined />,
      label: '团队管理',
    },
    {
      key: 'notification',
      icon: <NotificationOutlined />,
      label: '消息通知',
    },
    // 分组菜单
    {
      key: 'group',
      type: 'group',
      label: '其他',
      children: [
        { key: 'other:help', label: '帮助中心' },
        { key: 'other:about', label: '关于我们' },
      ],
    },
  ];

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
    message.info(`点击了菜单项：${e.key}`);
  };

  return (
    <div>
      <Title level={4}>1. Menu 菜单</Title>
      <Paragraph>
        Menu 支持水平、垂直、内嵌三种模式。antd 5.x 推荐使用 <Text code>items</Text> 属性
        配置菜单项，替代之前的 JSX 子组件方式。
      </Paragraph>

      {/* 水平菜单 */}
      <Title level={5}>1.1 水平菜单</Title>
      <Menu
        mode="horizontal"
        items={horizontalItems}
        onClick={onClick}
        selectedKeys={[current]}
        style={{ marginBottom: 16 }}
      />

      {/* 侧边菜单 */}
      <Title level={5}>1.2 侧边菜单（内嵌模式）</Title>
      <Space style={{ marginBottom: 8 }}>
        <span>主题切换：</span>
        <Button
          size="small"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? '切换暗色' : '切换亮色'}
        </Button>
      </Space>
      <div style={{ width: 256 }}>
        <Menu
          mode="inline"
          theme={theme}
          items={sideItems}
          onClick={onClick}
          defaultSelectedKeys={['home']}
          defaultOpenKeys={['user']}
          style={{ borderRight: 0 }}
        />
      </div>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第二部分：Tabs 标签页
// ============================================================================
/**
 * Tabs 用于在同一区域切换不同内容面板。
 *
 * 类型（type）：
 *   - line: 线条型（默认）
 *   - card: 卡片型
 *   - editable-card: 可编辑卡片（支持新增和删除）
 *
 * 位置（tabPosition）：
 *   - top: 上方（默认）
 *   - bottom: 下方
 *   - left: 左侧
 *   - right: 右侧
 *
 * 核心属性：
 *   - items: 标签页数组（antd 5.x 推荐）
 *   - activeKey: 当前激活的标签页 key
 *   - onChange: 切换标签页的回调
 *   - onEdit: 新增/删除标签页的回调（editable-card 模式）
 *   - tabBarExtraContent: 标签栏右侧额外内容
 *   - size: 尺寸，可选值 'large' | 'middle' | 'small'
 *   - animated: 是否使用动画切换
 *   - destroyInactiveTabPane: 切换时是否销毁非活动面板
 *
 * TabItem 属性：
 *   - key: 唯一标识
 *   - label: 标签标题
 *   - children: 内容
 *   - icon: 图标
 *   - disabled: 是否禁用
 *   - closable: 是否可关闭（editable-card 模式）
 *   - forceRender: 是否强制渲染
 */
function TabsDemo() {
  // 基础标签页
  const [activeTab, setActiveTab] = useState('1');

  const basicItems: TabsProps['items'] = [
    {
      key: '1',
      label: '基本信息',
      children: (
        <div>
          <p>这里是基本信息标签页的内容。</p>
          <p>可以放置表单、表格、描述列表等组件。</p>
        </div>
      ),
    },
    {
      key: '2',
      label: '详细配置',
      children: (
        <div>
          <p>这里是详细配置标签页的内容。</p>
          <p>可以放置更详细的设置选项。</p>
        </div>
      ),
    },
    {
      key: '3',
      label: '操作日志',
      children: (
        <div>
          <p>这里是操作日志标签页的内容。</p>
          <p>可以展示用户的操作历史记录。</p>
        </div>
      ),
      disabled: true, // 禁用此标签页
    },
  ];

  // 带图标的标签页
  const iconItems: TabsProps['items'] = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          个人资料
        </span>
      ),
      children: <p>个人资料内容</p>,
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined />
          账户设置
        </span>
      ),
      children: <p>账户设置内容</p>,
    },
    {
      key: 'notification',
      label: (
        <span>
          <NotificationOutlined />
          消息通知
        </span>
      ),
      children: <p>消息通知内容</p>,
    },
  ];

  // 可编辑标签页
  const [editableItems, setEditableItems] = useState<TabsProps['items']>([
    { key: '1', label: '标签页 1', children: '标签页 1 的内容' },
    { key: '2', label: '标签页 2', children: '标签页 2 的内容' },
    { key: '3', label: '标签页 3', children: '标签页 3 的内容' },
  ]);

  const [activeEditableKey, setActiveEditableKey] = useState('1');

  // 新增标签页
  const addTab = () => {
    const newKey = `newTab-${Date.now()}`;
    const newTab = {
      key: newKey,
      label: `新标签页`,
      children: `新标签页 ${newKey} 的内容`,
    };
    setEditableItems([...editableItems, newTab]);
    setActiveEditableKey(newKey);
  };

  // 删除标签页
  const removeTab = (targetKey: string) => {
    const targetIndex = editableItems.findIndex((item) => item?.key === targetKey);
    if (targetIndex === -1) return;

    const newItems = editableItems.filter((item) => item?.key !== targetKey);
    if (newItems.length === 0) return;

    // 如果删除的是当前激活的标签页，切换到相邻标签页
    if (targetKey === activeEditableKey) {
      const newActiveKey =
        newItems[targetIndex]?.key || newItems[targetIndex - 1]?.key;
      setActiveEditableKey(newActiveKey);
    }
    setEditableItems(newItems);
  };

  // 卡片式标签页（带额外内容）
  const cardItems: TabsProps['items'] = [
    { key: '1', label: '全部', children: '全部订单内容' },
    { key: '2', label: '待付款', children: '待付款订单' },
    { key: '3', label: '待发货', children: '待发货订单' },
    { key: '4', label: '已完成', children: '已完成订单' },
  ];

  return (
    <div>
      <Title level={4}>2. Tabs 标签页</Title>
      <Paragraph>
        Tabs 用于在同一区域切换不同内容。支持线条型、卡片型、可编辑卡片三种样式。
      </Paragraph>

      {/* 基础标签页 */}
      <Title level={5}>2.1 基础标签页（线条型）</Title>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={basicItems}
        // tabBarExtraContent 在标签栏右侧添加额外内容
        tabBarExtraContent={<Button size="small">刷新</Button>}
      />

      {/* 带图标的标签页 */}
      <Title level={5}>2.2 带图标的标签页</Title>
      <Tabs items={iconItems} />

      {/* 卡片式标签页 */}
      <Title level={5}>2.3 卡片式标签页</Title>
      <Tabs type="card" items={cardItems} />

      {/* 可编辑标签页 */}
      <Title level={5}>2.4 可编辑标签页（新增/删除）</Title>
      <Tabs
        type="editable-card"
        activeKey={activeEditableKey}
        onChange={setActiveEditableKey}
        onEdit={(targetKey, action) => {
          if (action === 'add') addTab();
          else removeTab(targetKey as string);
        }}
        items={editableItems}
      />

      {/* 不同位置的标签页 */}
      <Title level={5}>2.5 不同位置的标签页</Title>
      <Tabs
        tabPosition="left"
        items={[
          { key: '1', label: '左侧标签 1', children: '左侧标签 1 的内容' },
          { key: '2', label: '左侧标签 2', children: '左侧标签 2 的内容' },
          { key: '3', label: '左侧标签 3', children: '左侧标签 3 的内容' },
        ]}
        style={{ marginBottom: 16 }}
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第三部分：Breadcrumb 面包屑
// ============================================================================
/**
 * Breadcrumb 用于显示当前页面在层级结构中的位置，提供返回上级的快捷方式。
 *
 * 常用属性：
 *   - items: 面包屑项数组（antd 5.x 推荐）
 *   - separator: 分隔符，默认为 '/'
 *   - params: 路由参数（配合 react-router 使用）
 *
 * BreadcrumbItem 属性：
 *   - title: 标题（支持 JSX）
 *   - href: 链接地址
 *   - path: 路由路径
 *   - icon: 图标
 *   - dropdown: 下拉菜单（用于大量面包屑项时）
 */
function BreadcrumbDemo() {
  // 基础面包屑
  const basicItems = [
    { title: <a href="#">首页</a> },
    { title: <a href="#">用户管理</a> },
    { title: '用户列表' },
  ];

  // 带图标的面包屑
  const iconItems = [
    { title: <a href="#"><HomeOutlined /></a> },
    { title: <a href="#"><UserOutlined /> 用户管理</a> },
    { title: '用户详情' },
  ];

  // 带下拉菜单的面包屑
  const dropdownItems = [
    { title: <a href="#">首页</a> },
    {
      title: (
        <Dropdown
          menu={{
            items: [
              { key: '1', label: '用户管理' },
              { key: '2', label: '内容管理' },
              { key: '3', label: '系统设置' },
            ],
          }}
        >
          <span>
            应用中心 <DownOutlined />
          </span>
        </Dropdown>
      ),
    },
    { title: '子应用' },
    { title: '详情页' },
  ];

  return (
    <div>
      <Title level={4}>3. Breadcrumb 面包屑</Title>
      <Paragraph>
        Breadcrumb 显示当前页面在层级结构中的位置。
        antd 5.x 推荐使用 <Text code>items</Text> 属性配置面包屑项。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 基础面包屑 */}
        <div>
          <Text type="secondary">基础用法：</Text>
          <Breadcrumb items={basicItems} />
        </div>

        {/* 带图标的面包屑 */}
        <div>
          <Text type="secondary">带图标：</Text>
          <Breadcrumb items={iconItems} />
        </div>

        {/* 自定义分隔符 */}
        <div>
          <Text type="secondary">自定义分隔符：</Text>
          <Breadcrumb separator=">" items={basicItems} />
        </div>

        {/* 带下拉菜单 */}
        <div>
          <Text type="secondary">带下拉菜单：</Text>
          <Breadcrumb items={dropdownItems} />
        </div>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第四部分：Pagination 分页
// ============================================================================
/**
 * Pagination 用于分页导航，常与 Table 配合使用，也可单独使用。
 *
 * 常用属性：
 *   - current: 当前页码（受控）
 *   - defaultCurrent: 默认当前页码
 *   - total: 数据总数
 *   - pageSize: 每页条数
 *   - defaultPageSize: 默认每页条数
 *   - onChange: 页码改变的回调 (page, pageSize)
 *   - onShowSizeChange: 每页条数改变的回调
 *   - showSizeChanger: 是否显示每页条数切换器
 *   - showQuickJumper: 是否显示快速跳转
 *   - showTotal: 是否显示总数
 *   - pageSizeOptions: 每页条数选项
 *   - showLessItems: 是否显示较少的页码
 *   - simple: 简洁模式
 *   - size: 尺寸，可选值 'default' | 'small'
 *   - disabled: 是否禁用
 */
function PaginationDemo() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <div>
      <Title level={4}>4. Pagination 分页</Title>
      <Paragraph>
        Pagination 用于分页导航。可以单独使用，也可以与 Table 配合。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 基础分页 */}
        <Card title="基础分页" size="small">
          <Pagination
            total={100}
            current={current}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrent(page);
              setPageSize(size);
              message.info(`切换到第 ${page} 页，每页 ${size} 条`);
            }}
          />
        </Card>

        {/* 完整功能分页 */}
        <Card title="完整功能" size="small">
          <Pagination
            total={500}
            current={current}
            pageSize={pageSize}
            onChange={(page, size) => {
              setCurrent(page);
              setPageSize(size);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} / 共 ${total} 条`}
            pageSizeOptions={[5, 10, 20, 50, 100]}
          />
        </Card>

        {/* 简洁模式 */}
        <Card title="简洁模式" size="small">
          <Pagination simple total={50} defaultCurrent={1} />
        </Card>

        {/* 小尺寸 */}
        <Card title="小尺寸" size="small">
          <Pagination
            size="small"
            total={100}
            showSizeChanger
            showQuickJumper
          />
        </Card>

        {/* 迷你模式 */}
        <Card title="迷你模式（showLessItems）" size="small">
          <Pagination
            total={100}
            current={5}
            showLessItems
          />
        </Card>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第五部分：Steps 步骤条
// ============================================================================
/**
 * Steps 用于引导用户按照流程完成任务的分步导航条。
 *
 * 方向（direction）：
 *   - horizontal: 水平方向（默认）
 *   - vertical: 垂直方向
 *
 * 状态：
 *   - wait: 等待（未开始）
 *   - process: 进行中（当前步骤）
 *   - finish: 已完成
 *   - error: 出错
 *
 * 常用属性：
 *   - items: 步骤项数组（antd 5.x 推荐）
 *   - current: 当前步骤（从 0 开始）
 *   - direction: 方向
 *   - labelPlacement: 标签位置，可选值 'horizontal' | 'vertical'
 *   - size: 尺寸，可选值 'default' | 'small'
 *   - status: 整体状态，用于设置当前步骤之后的所有步骤状态
 *   - progressDot: 是否使用点状步骤条
 *   - type: 类型，可选值 'default' | 'navigation' | 'inline'
 *   - onChange: 点击步骤的回调
 *
 * StepItem 属性：
 *   - title: 标题
 *   - description: 描述
 *   - icon: 自定义图标
 *   - status: 单独设置状态
 *   - subTitle: 子标题
 *   - disabled: 是否禁用
 */
function StepsDemo() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div>
      <Title level={4}>5. Steps 步骤条</Title>
      <Paragraph>
        Steps 引导用户按照流程完成任务。支持水平、垂直、导航式等多种样式。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 基础步骤条 */}
        <Card title="基础步骤条" size="small">
          <Steps
            current={currentStep}
            onChange={setCurrentStep}
            items={[
              { title: '创建账户', description: '填写基本信息' },
              { title: '验证邮箱', description: '输入验证码' },
              { title: '完善资料', description: '补充个人信息' },
              { title: '完成', description: '开始使用' },
            ]}
          />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Space>
              {currentStep > 0 && (
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  上一步
                </Button>
              )}
              {currentStep < 3 && (
                <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                  下一步
                </Button>
              )}
              {currentStep === 3 && (
                <Button type="primary" onClick={() => setCurrentStep(0)}>
                  重新开始
                </Button>
              )}
            </Space>
          </div>
        </Card>

        {/* 带图标的步骤条 */}
        <Card title="带图标的步骤条" size="small">
          <Steps
            items={[
              { title: '登录', icon: <UserOutlined /> },
              { title: '验证', icon: <MailOutlined /> },
              { title: '支付', icon: <SettingOutlined /> },
              { title: '完成', icon: <HomeOutlined /> },
            ]}
          />
        </Card>

        {/* 小尺寸步骤条 */}
        <Card title="小尺寸步骤条" size="small">
          <Steps
            size="small"
            current={1}
            items={[
              { title: '步骤 1' },
              { title: '步骤 2' },
              { title: '步骤 3' },
              { title: '步骤 4' },
            ]}
          />
        </Card>

        {/* 垂直步骤条 */}
        <Card title="垂直步骤条" size="small">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Steps
              direction="vertical"
              current={1}
              items={[
                { title: '提交申请', description: '2024-01-01 10:00' },
                { title: '部门审批', description: '2024-01-02 14:30' },
                { title: '财务审核', description: '等待中...' },
                { title: '完成', description: '' },
              ]}
              style={{ maxWidth: 300 }}
            />
          </div>
        </Card>

        {/* 点状步骤条 */}
        <Card title="点状步骤条" size="small">
          <Steps
            current={1}
            progressDot
            items={[
              { title: '开始', description: '这里是描述信息' },
              { title: '进行中', description: '这里是描述信息' },
              { title: '待处理', description: '这里是描述信息' },
            ]}
          />
        </Card>

        {/* 导航式步骤条 */}
        <Card title="导航式步骤条" size="small">
          <Steps
            type="navigation"
            current={1}
            onChange={setCurrentStep}
            items={[
              { title: '步骤 1', subTitle: '描述 1' },
              { title: '步骤 2', subTitle: '描述 2' },
              { title: '步骤 3', subTitle: '描述 3' },
              { title: '步骤 4', subTitle: '描述 4' },
            ]}
          />
        </Card>

        {/* 错误状态 */}
        <Card title="错误状态" size="small">
          <Steps
            current={1}
            status="error"
            items={[
              { title: '已完成', description: '此步骤已完成' },
              { title: '出错', description: '此步骤出现错误' },
              { title: '等待中', description: '等待上一步完成' },
            ]}
          />
        </Card>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第六部分：Dropdown 下拉菜单
// ============================================================================
/**
 * Dropdown 是下拉菜单组件，点击或悬停时弹出菜单。
 * 适合放置一组操作命令。
 *
 * 常用属性：
 *   - menu: 菜单配置（使用 Menu 组件的 menu 属性）
 *   - trigger: 触发方式，可选值 'click' | 'hover' | 'contextMenu'
 *   - placement: 弹出位置
 *   - disabled: 是否禁用
 *   - overlayClassName: 下拉菜单的类名
 *   - dropdownRender: 自定义下拉内容
 *
 * Menu 配置项：
 *   - items: 菜单项数组
 *     - key: 唯一标识
 *     - label: 菜单项文字
 *     - icon: 图标
 *     - disabled: 是否禁用
 *     - danger: 是否显示危险样式
 *     - divider: 是否显示分割线（{ type: 'divider' }）
 *     - children: 子菜单
 *   - onClick: 点击菜单项的回调
 *   - selectable: 是否允许选中
 *   - multiple: 是否允许多选
 */
function DropdownDemo() {
  // 基础下拉菜单
  const basicMenuItems = {
    items: [
      {
        key: '1',
        label: '编辑',
        icon: <EditOutlined />,
      },
      {
        key: '2',
        label: '复制',
      },
      {
        key: '3',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true, // 危险样式（红色）
      },
      { type: 'divider' as const }, // 分割线
      {
        key: '4',
        label: '导出',
        icon: <ExportOutlined />,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      message.info(`点击了菜单项：${key}`);
    },
  };

  // 带子菜单的下拉菜单
  const nestedMenuItems = {
    items: [
      {
        key: 'export',
        label: '导出',
        icon: <ExportOutlined />,
        children: [
          { key: 'export:excel', label: '导出 Excel' },
          { key: 'export:csv', label: '导出 CSV' },
          { key: 'export:pdf', label: '导出 PDF' },
        ],
      },
      {
        key: 'import',
        label: '导入',
        children: [
          { key: 'import:excel', label: '从 Excel 导入' },
          { key: 'import:csv', label: '从 CSV 导入' },
        ],
      },
    ],
    onClick: ({ key }: { key: string }) => {
      message.info(`点击了：${key}`);
    },
  };

  // 多选下拉菜单
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const multiMenuItems = {
    items: [
      { key: 'bold', label: '加粗' },
      { key: 'italic', label: '斜体' },
      { key: 'underline', label: '下划线' },
      { key: 'strikethrough', label: '删除线' },
    ],
    selectable: true,
    multiple: true,
    selectedKeys,
    onClick: ({ selectedKeys: keys }: { selectedKeys: string[] }) => {
      setSelectedKeys(keys as string[]);
    },
  };

  return (
    <div>
      <Title level={4}>6. Dropdown 下拉菜单</Title>
      <Paragraph>
        Dropdown 是下拉菜单组件，适合放置一组操作命令。
        通过 <Text code>menu</Text> 属性配置菜单项。
      </Paragraph>

      <Space wrap>
        {/* 基础下拉菜单 */}
        <Dropdown menu={basicMenuItems}>
          <Button>
            操作 <DownOutlined />
          </Button>
        </Dropdown>

        {/* 触发方式为 hover */}
        <Dropdown menu={basicMenuItems} trigger={['hover']}>
          <Button>
            悬停触发 <DownOutlined />
          </Button>
        </Dropdown>

        {/* 带子菜单 */}
        <Dropdown menu={nestedMenuItems}>
          <Button>
            文件操作 <DownOutlined />
          </Button>
        </Dropdown>

        {/* 多选菜单 */}
        <Dropdown menu={multiMenuItems}>
          <Button>
            文本样式 <DownOutlined />
          </Button>
        </Dropdown>

        {/* 右键菜单 */}
        <Dropdown menu={basicMenuItems} trigger={['contextMenu']}>
          <div
            style={{
              padding: '8px 16px',
              border: '1px dashed #d9d9d9',
              borderRadius: 4,
              cursor: 'context-menu',
            }}
          >
            右键点击此区域
          </div>
        </Dropdown>

        {/* 按钮组中的下拉菜单 */}
        <Button.Group>
          <Button type="primary">新建</Button>
          <Dropdown
            menu={{
              items: [
                { key: 'project', label: '新建项目' },
                { key: 'document', label: '新建文档' },
                { key: 'folder', label: '新建文件夹' },
              ],
              onClick: ({ key }) => message.info(`新建：${key}`),
            }}
          >
            <Button type="primary" icon={<DownOutlined />} />
          </Dropdown>
        </Button.Group>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 主组件：整合所有导航组件示例
// ============================================================================
export default function NavigationDemo() {
  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <Title level={2}>Ant Design 5.x 导航类组件教程</Title>
      <Paragraph>
        导航类组件用于页面的导航和流程引导。本教程涵盖了 Menu、Tabs、
        Breadcrumb、Pagination、Steps、Dropdown 六种导航组件。
      </Paragraph>

      <Divider />

      <MenuDemo />
      <TabsDemo />
      <BreadcrumbDemo />
      <PaginationDemo />
      <StepsDemo />
      <DropdownDemo />
    </div>
  );
}
