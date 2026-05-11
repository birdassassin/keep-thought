/**
 * ============================================================================
 * 04-feedback.tsx - Ant Design 反馈类组件
 * ============================================================================
 *
 * 本文件演示 Ant Design 中用于用户反馈的组件。
 *
 * 涵盖内容：
 *   1. Message 全局提示 - 轻量级全局反馈
 *   2. Notification 通知提醒框 - 带标题和描述的通知
 *   3. Modal 对话框 - 模态弹窗
 *   4. Drawer 抽屉 - 侧边栏弹出面板
 *   5. Popconfirm 气泡确认框 - 轻量级确认
 *   6. Progress 进度条 - 操作进度展示
 *   7. Result 结果页 - 操作结果反馈
 *   8. Skeleton 骨架屏 - 加载占位
 *   9. Spin 加载中 - 局部/全局加载
 *
 * 学习目标：
 *   - 掌握各种反馈组件的使用场景和区别
 *   - 学会使用 App.useApp() 获取上下文感知的静态方法
 *   - 理解 Modal 的各种用法（确认框、自定义内容、异步关闭等）
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Typography,
  Divider,
  Modal,
  Drawer,
  Popconfirm,
  Progress,
  Result,
  Skeleton,
  Spin,
  Card,
  App,
} from 'antd';
import {
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SmileOutlined,
  FrownOutlined,
  PlusOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 第一部分：Message 全局提示
// ============================================================================
/**
 * Message 用于轻量级的全局反馈，显示在页面顶部中央，自动消失。
 *
 * 使用方式（推荐）：
 *   通过 App.useApp() 获取 message 实例：
 *   const { message } = App.useApp();
 *   message.success('操作成功');
 *
 * 静态方法（不推荐，无法读取 ConfigProvider 上下文）：
 *   import { message } from 'antd';
 *   message.success('操作成功');
 *
 * 类型：
 *   - message.success(msg)  成功提示（绿色）
 *   - message.error(msg)    错误提示（红色）
 *   - message.warning(msg)  警告提示（黄色）
 *   - message.info(msg)     信息提示（蓝色）
 *   - message.loading(msg)  加载提示（带旋转图标）
 *
 * 高级用法：
 *   - message.open({ content, type, duration, onClose })  完全自定义
 *   - const hide = message.loading('加载中...'); hide();  手动关闭
 */
function MessageDemo() {
  // 使用 App.useApp() 获取 message 实例（推荐方式）
  // 这样 message 就能读取 ConfigProvider 的主题和语言配置
  const { message } = App.useApp();

  const showSuccess = () => {
    message.success('操作成功！数据已保存。');
  };

  const showError = () => {
    message.error('操作失败，请稍后重试。');
  };

  const showWarning = () => {
    message.warning('请注意，此操作不可撤销。');
  };

  const showInfo = () => {
    message.info('这是一条普通信息提示。');
  };

  const showLoading = () => {
    const hide = message.loading('正在处理中...', 0); // duration=0 表示不自动关闭
    // 模拟异步操作
    setTimeout(hide, 2000); // 2 秒后手动关闭
  };

  // 使用 message.open 自定义提示
  const showCustom = () => {
    message.open({
      content: '自定义样式的提示消息',
      icon: <SmileOutlined style={{ color: '#eb2f96' }} />,
      duration: 3,
      style: {
        marginTop: '20vh',
      },
    });
  };

  return (
    <div>
      <Title level={4}>1. Message 全局提示</Title>
      <Paragraph>
        Message 用于轻量级的全局反馈，自动消失。推荐通过 <Text code>App.useApp()</Text> 获取实例，
        以便读取 <Text code>ConfigProvider</Text> 的上下文配置。
      </Paragraph>

      <Space wrap>
        <Button onClick={showSuccess} icon={<CheckCircleOutlined />}>
          成功提示
        </Button>
        <Button onClick={showError} danger icon={<CloseCircleOutlined />}>
          错误提示
        </Button>
        <Button onClick={showWarning} icon={<WarningOutlined />}>
          警告提示
        </Button>
        <Button onClick={showInfo} icon={<InfoCircleOutlined />}>
          信息提示
        </Button>
        <Button onClick={showLoading}>
          加载提示（2秒后关闭）
        </Button>
        <Button onClick={showCustom}>
          自定义提示
        </Button>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第二部分：Notification 通知提醒框
// ============================================================================
/**
 * Notification 用于展示需要用户关注的通知信息，显示在页面右上角。
 * 与 Message 相比，Notification 可以包含更多的内容和更长的展示时间。
 *
 * 使用方式（推荐）：
 *   const { notification } = App.useApp();
 *   notification.success({ message: '标题', description: '描述内容' });
 *
 * 类型（与 Message 相同）：
 *   - notification.success({ message, description })
 *   - notification.error({ message, description })
 *   - notification.warning({ message, description })
 *   - notification.info({ message, description })
 *   - notification.open({ message, description, ... })
 *
 * 常用配置：
 *   - message: 标题
 *   - description: 描述内容
 *   - duration: 自动关闭时间（秒），默认 4.5，设为 0 不自动关闭
 *   - placement: 位置，可选值 topLeft | topRight | bottomLeft | bottomRight
 *   - icon: 自定义图标
 *   - btn: 自定义关闭按钮
 *   - onClose: 关闭时的回调
 *   - onClick: 点击通知时的回调
 */
function NotificationDemo() {
  const { notification } = App.useApp();

  const openNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const config: Record<string, { title: string; desc: string }> = {
      success: { title: '操作成功', desc: '您的数据已成功保存到服务器。' },
      error: { title: '操作失败', desc: '网络连接超时，请检查网络后重试。' },
      warning: { title: '警告', desc: '您的账户存储空间即将用完，请及时清理。' },
      info: { title: '系统通知', desc: '系统将于今晚 22:00 进行维护升级。' },
    };

    notification[type]({
      message: config[type].title,
      description: config[type].desc,
      placement: 'topRight',
    });
  };

  // 自定义通知（带操作按钮）
  const openCustomNotification = () => {
    const key = 'openCustom';
    notification.open({
      message: '新消息',
      description: '您有一条新的系统消息，请及时查看。',
      key,
      // btn 属性可以添加自定义按钮
      btn: (
        <Space>
          <Button type="primary" size="small" onClick={() => notification.close(key)}>
            查看详情
          </Button>
          <Button size="small" onClick={() => notification.close(key)}>
            关闭
          </Button>
        </Space>
      ),
      duration: 0, // 不自动关闭
    });
  };

  return (
    <div>
      <Title level={4}>2. Notification 通知提醒框</Title>
      <Paragraph>
        Notification 显示在页面右上角，适合展示需要用户关注的信息。
        可以包含标题、描述和操作按钮。
      </Paragraph>

      <Space wrap>
        <Button onClick={() => openNotification('success')} icon={<CheckCircleOutlined />}>
          成功通知
        </Button>
        <Button onClick={() => openNotification('error')} danger icon={<CloseCircleOutlined />}>
          错误通知
        </Button>
        <Button onClick={() => openNotification('warning')} icon={<WarningOutlined />}>
          警告通知
        </Button>
        <Button onClick={() => openNotification('info')} icon={<InfoCircleOutlined />}>
          信息通知
        </Button>
        <Button onClick={openCustomNotification}>
          自定义通知（带按钮）
        </Button>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第三部分：Modal 对话框
// ============================================================================
/**
 * Modal 是模态对话框，用于重要信息的展示或需要用户明确确认的操作。
 *
 * 使用方式：
 *   1. 声明式：<Modal open={visible} onOk={handleOk} onCancel={handleCancel}>
 *   2. 命令式：Modal.confirm({ title, content, onOk, onCancel })
 *
 * 常用属性：
 *   - open: 是否显示（antd 5.x 使用 open 替代了 visible）
 *   - title: 标题
 *   - content: 内容
 *   - onOk: 点击确定按钮的回调
 *   - onCancel: 点击取消按钮或遮罩层的回调
 *   - okText: 确定按钮文字
 *   - cancelText: 取消按钮文字
 *   - okButtonProps: 确定按钮的 props
 *   - cancelButtonProps: 取消按钮的 props
 *   - width: 宽度
 *   - footer: 自定义底部按钮（设为 null 隐藏底部）
 *   - centered: 是否垂直居中
 *   - closable: 是否显示右上角关闭按钮
 *   - maskClosable: 点击遮罩层是否关闭
 *   - destroyOnClose: 关闭时销毁子元素
 *   - forceRender: 强制渲染
 *   - afterOpenChange: 打开/关闭动画结束后的回调
 */
function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [asyncOpen, setAsyncOpen] = useState(false);

  // 基础弹窗
  const showModal = () => setOpen(true);
  const handleOk = () => {
    setOpen(false);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  // 异步关闭弹窗（模拟提交操作）
  const showAsyncModal = () => setAsyncOpen(true);
  const handleAsyncOk = () => {
    setConfirmLoading(true);
    // 模拟异步操作
    setTimeout(() => {
      setConfirmLoading(false);
      setAsyncOpen(false);
    }, 2000);
  };

  // 命令式调用：确认对话框
  const showConfirm = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？此操作不可恢复。',
      okText: '确定删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        console.log('确认删除');
      },
      onCancel() {
        console.log('取消删除');
      },
    });
  };

  // 命令式调用：信息对话框
  const showInfoModal = () => {
    Modal.info({
      title: '使用说明',
      content: (
        <div>
          <p>这是一个信息对话框。</p>
          <p>可以展示丰富的内容，包括列表、链接等。</p>
        </div>
      ),
      width: 500,
    });
  };

  // 自定义底部按钮
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <div>
      <Title level={4}>3. Modal 对话框</Title>
      <Paragraph>
        Modal 是模态对话框，支持声明式和命令式两种使用方式。
        antd 5.x 使用 <Text code>open</Text> 属性替代了 <Text code>visible</Text>。
      </Paragraph>

      <Space wrap>
        {/* 基础弹窗 */}
        <Button type="primary" onClick={showModal}>
          基础弹窗
        </Button>

        {/* 异步关闭弹窗 */}
        <Button onClick={showAsyncModal}>
          异步关闭弹窗
        </Button>

        {/* 命令式调用 */}
        <Button onClick={showConfirm} danger>
          确认对话框
        </Button>
        <Button onClick={showInfoModal}>
          信息对话框
        </Button>

        {/* 自定义底部 */}
        <Button onClick={() => setCustomOpen(true)}>
          自定义底部弹窗
        </Button>
      </Space>

      {/* 基础弹窗 */}
      <Modal
        title="基础弹窗"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
      >
        <p>这是一个基础的模态对话框。</p>
        <p>可以放置任何内容，如表单、表格、图片等。</p>
      </Modal>

      {/* 异步关闭弹窗 */}
      <Modal
        title="异步关闭"
        open={asyncOpen}
        onOk={handleAsyncOk}
        onCancel={() => setAsyncOpen(false)}
        confirmLoading={confirmLoading}
        okText="提交"
        cancelText="取消"
      >
        <p>点击确定后会模拟 2 秒的异步操作。</p>
        <p>提交按钮会显示 loading 状态，防止重复提交。</p>
      </Modal>

      {/* 自定义底部弹窗 */}
      <Modal
        title="自定义底部按钮"
        open={customOpen}
        onCancel={() => setCustomOpen(false)}
        // footer={null} 可以完全隐藏底部按钮
        footer={[
          <Button key="back" onClick={() => setCustomOpen(false)}>
            返回
          </Button>,
          <Button key="submit" type="primary" onClick={() => setCustomOpen(false)}>
            提交
          </Button>,
          <Button key="link" type="link">
            帮助文档
          </Button>,
        ]}
      >
        <p>通过 <Text code>footer</Text> 属性可以自定义底部按钮。</p>
        <p>设为 <Text code>null</Text> 可以完全隐藏底部。</p>
      </Modal>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第四部分：Drawer 抽屉
// ============================================================================
/**
 * Drawer 是从屏幕边缘滑出的浮层面板。
 * 与 Modal 类似，但更适合展示详情信息或表单。
 *
 * 常用属性：
 *   - open: 是否显示
 *   - placement: 弹出位置，可选值 'left' | 'right' | 'top' | 'bottom'
 *   - title: 标题
 *   - width: 宽度（左右方向时）
 *   - height: 高度（上下方向时）
 *   - onClose: 关闭回调
 *   - footer: 底部内容
 *   - mask: 是否显示遮罩
 *   - maskClosable: 点击遮罩是否关闭
 *   - extra: 标题右侧额外内容
 *   - closable: 是否显示关闭按钮
 */
function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'left' | 'right' | 'top' | 'bottom'>('right');

  const showDrawer = () => setOpen(true);

  return (
    <div>
      <Title level={4}>4. Drawer 抽屉</Title>
      <Paragraph>
        Drawer 从屏幕边缘滑出，适合展示详情、表单等内容。
        通过 <Text code>placement</Text> 属性控制弹出方向。
      </Paragraph>

      <Space wrap>
        <Radio.Group
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
          style={{ marginBottom: 8 }}
        >
          <Radio.Button value="top">上方</Radio.Button>
          <Radio.Button value="right">右侧</Radio.Button>
          <Radio.Button value="bottom">下方</Radio.Button>
          <Radio.Button value="left">左侧</Radio.Button>
        </Radio.Group>
      </Space>

      <Space wrap>
        <Button type="primary" onClick={showDrawer}>
          打开抽屉
        </Button>
      </Space>

      <Drawer
        title="用户详情"
        placement={placement}
        width={placement === 'left' || placement === 'right' ? 500 : undefined}
        height={placement === 'top' || placement === 'bottom' ? 300 : undefined}
        onClose={() => setOpen(false)}
        open={open}
        // extra 属性在标题右侧添加额外内容
        extra={
          <Space>
            <Button>编辑</Button>
            <Button type="primary">保存</Button>
          </Space>
        }
        // footer 属性添加底部内容
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setOpen(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={() => setOpen(false)}>
              确定
            </Button>
          </div>
        }
      >
        <Paragraph>
          这是抽屉的内容区域。可以放置任何内容，例如用户详情、编辑表单等。
        </Paragraph>
        <Paragraph>
          Drawer 与 Modal 的区别：
        </Paragraph>
        <ul>
          <li>Drawer 从边缘滑出，Modal 从中心弹出</li>
          <li>Drawer 更适合展示详情和表单</li>
          <li>Modal 更适合确认操作和重要提示</li>
        </ul>
      </Drawer>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第五部分：Popconfirm 气泡确认框
// ============================================================================
/**
 * Popconfirm 是轻量级的确认弹出框，点击目标元素时弹出。
 * 适合简单的确认操作，比 Modal 更轻量。
 *
 * 常用属性：
 *   - title: 确认内容
 *   - description: 补充描述（antd 5.x 新增）
 *   - onConfirm: 点击确认的回调
 *   - onCancel: 点击取消的回调
 *   - okText: 确认按钮文字
 *   - cancelText: 取消按钮文字
 *   - okType: 确认按钮类型
 *   - icon: 自定义图标
 *   - placement: 弹出位置
 *   - disabled: 是否禁用
 */
function PopconfirmDemo() {
  return (
    <div>
      <Title level={4}>5. Popconfirm 气泡确认框</Title>
      <Paragraph>
        Popconfirm 是轻量级的确认框，点击目标元素时弹出气泡。
        比 Modal 更轻量，适合简单的确认操作。
      </Paragraph>

      <Space wrap>
        {/* 基础用法 */}
        <Popconfirm
          title="确定删除这条记录吗？"
          onConfirm={() => console.log('确认删除')}
          onCancel={() => console.log('取消删除')}
          okText="确定"
          cancelText="取消"
        >
          <Button danger>删除</Button>
        </Popconfirm>

        {/* 带描述的确认框（antd 5.x 新增） */}
        <Popconfirm
          title="确定要提交吗？"
          description="提交后将无法修改，请确认信息无误。"
          onConfirm={() => console.log('确认提交')}
          okText="确认提交"
          cancelText="再看看"
        >
          <Button type="primary">提交</Button>
        </Popconfirm>

        {/* 自定义图标 */}
        <Popconfirm
          title="确定要重置密码吗？"
          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          onConfirm={() => console.log('确认重置')}
        >
          <Button>重置密码</Button>
        </Popconfirm>

        {/* 异步确认（模拟 API 请求） */}
        <Popconfirm
          title="确定要发布吗？"
          description="发布后将对所有用户可见。"
          okText="发布"
          cancelText="取消"
          onConfirm={() => new Promise((resolve) => {
            // 模拟异步操作
            setTimeout(resolve, 2000);
          })}
        >
          <Button type="primary">发布</Button>
        </Popconfirm>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第六部分：Progress 进度条
// ============================================================================
/**
 * Progress 用于展示操作的当前进度。
 *
 * 类型：
 *   - line: 线形进度条（默认）
 *   - circle: 圆形进度条
 *   - dashboard: 仪表盘进度条
 *
 * 常用属性：
 *   - percent: 百分比（0-100）
 *   - type: 类型
 *   - status: 状态，可选值 'success' | 'exception' | 'normal' | 'active'
 *   - showInfo: 是否显示百分比文字
 *   - strokeColor: 进度条颜色
 *   - trailColor: 未完成部分的颜色
 *   - size: 尺寸（circle/dashboard 类型）
 *   - format: 格式化百分比显示
 *   - steps: 步骤进度条（antd 5.x 增强）
 */
function ProgressDemo() {
  const [percent, setPercent] = useState(0);

  // 模拟进度变化
  const increase = () => {
    setPercent((prev) => {
      const newPercent = prev + 10;
      if (newPercent > 100) return 0;
      return newPercent;
    });
  };

  return (
    <div>
      <Title level={4}>6. Progress 进度条</Title>
      <Paragraph>
        Progress 用于展示操作进度，支持线形、圆形和仪表盘三种样式。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 线形进度条 */}
        <Card title="线形进度条" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Progress percent={30} />
            <Progress percent={50} status="active" />
            <Progress percent={70} status="exception" />
            <Progress percent={100} status="success" />
            {/* 不显示百分比 */}
            <Progress percent={60} showInfo={false} />
            {/* 自定义颜色 */}
            <Progress percent={60} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
          </Space>
        </Card>

        {/* 圆形进度条 */}
        <Card title="圆形进度条" size="small">
          <Space>
            <Progress type="circle" percent={75} />
            <Progress type="circle" percent={70} status="exception" />
            <Progress type="circle" percent={100} status="success" />
            {/* 自定义大小 */}
            <Progress type="circle" percent={60} size={80} />
          </Space>
        </Card>

        {/* 仪表盘进度条 */}
        <Card title="仪表盘进度条" size="small">
          <Space>
            <Progress type="dashboard" percent={66} />
            <Progress type="dashboard" percent={100} status="success" />
          </Space>
        </Card>

        {/* 动态进度条 */}
        <Card title="动态进度条" size="small">
          <Progress percent={percent} />
          <Space>
            <Button onClick={increase}>
              +10%
            </Button>
            <Button onClick={() => setPercent(0)}>
              重置
            </Button>
          </Space>
        </Card>

        {/* 步骤进度条 */}
        <Card title="步骤进度条" size="small">
          <Progress percent={60} steps={5} />
        </Card>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第七部分：Result 结果页
// ============================================================================
/**
 * Result 用于反馈一系列操作任务的处理结果。
 * 常见于表单提交成功、支付完成、错误页面等场景。
 *
 * 预设类型：
 *   - success: 成功
 *   - error: 错误
 *   - info: 信息
 *   - warning: 警告
 *   - 404: 页面不存在
 *   - 403: 无权限
 *   - 500: 服务器错误
 *
 * 常用属性：
 *   - status: 状态
 *   - title: 标题
 *   - subTitle: 副标题
 *   - icon: 自定义图标
 *   - extra: 操作区域
 */
function ResultDemo() {
  return (
    <div>
      <Title level={4}>7. Result 结果页</Title>
      <Paragraph>
        Result 用于反馈操作结果，内置了成功、失败、404、403、500 等常见状态。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 成功结果 */}
        <Card size="small">
          <Result
            status="success"
            title="操作成功"
            subTitle="您的订单已创建成功，订单号：20240001。我们将尽快处理。"
            extra={[
              <Button type="primary" key="console">
                查看订单
              </Button>,
              <Button key="buy">继续购买</Button>,
            ]}
          />
        </Card>

        {/* 错误结果 */}
        <Card size="small">
          <Result
            status="error"
            title="提交失败"
            subTitle="请检查并修改以下信息后重新提交。"
            extra={[
              <Button type="primary" key="retry">
                重新提交
              </Button>,
              <Button key="back">返回首页</Button>,
            ]}
          />
        </Card>

        {/* 404 页面 */}
        <Card size="small">
          <Result
            status="404"
            title="404"
            subTitle="抱歉，您访问的页面不存在。"
            extra={<Button type="primary">返回首页</Button>}
          />
        </Card>

        {/* 403 页面 */}
        <Card size="small">
          <Result
            status="403"
            title="403"
            subTitle="抱歉，您没有权限访问此页面。"
            extra={<Button type="primary">返回首页</Button>}
          />
        </Card>

        {/* 自定义结果 */}
        <Card size="small">
          <Result
            icon={<SmileOutlined />}
            title="自定义结果页"
            subTitle="可以使用自定义图标和内容创建结果页。"
            extra={<Button type="primary">下一步</Button>}
          />
        </Card>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第八部分：Skeleton 骨架屏
// ============================================================================
/**
 * Skeleton 用于在内容加载过程中展示占位效果，提升用户体验。
 *
 * 常用属性：
 *   - active: 是否展示动画效果
 *   - loading: 是否显示骨架屏（设为 false 显示真实内容）
 *   - avatar: 头像骨架，设为 true 或 { size, shape }
 *   - title: 标题骨架，设为 true 或 false
 *   - paragraph: 段落骨架，设为 true 或 { rows, width }
 *   - round: 是否使用圆角
 *
 * Skeleton.Input: 输入框骨架
 * Skeleton.Image: 图片骨架
 * Skeleton.Avatar: 头像骨架
 * Skeleton.Button: 按钮骨架
 */
function SkeletonDemo() {
  const [loading, setLoading] = useState(true);

  // 模拟加载完成
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <Title level={4}>8. Skeleton 骨架屏</Title>
      <Paragraph>
        Skeleton 在内容加载时展示占位效果。<Text code>active</Text> 属性启用闪烁动画。
        通过 <Text code>loading</Text> 属性切换骨架屏和真实内容。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 基础骨架屏 */}
        <Card title="基础骨架屏" size="small">
          <Skeleton active />
        </Card>

        {/* 带头像的骨架屏 */}
        <Card title="带头像的骨架屏" size="small">
          <Skeleton avatar active paragraph={{ rows: 2 }} />
        </Card>

        {/* 切换加载状态 */}
        <Card title="加载切换（3秒后显示内容）" size="small">
          <Skeleton loading={loading} active avatar>
            <div>
              <h4>Ant Design</h4>
              <p>
                Ant Design 是一套企业级 UI 设计语言和 React 组件库。
                它提供了丰富的组件，可以帮助开发者快速构建高质量的企业级中后台产品。
              </p>
            </div>
          </Skeleton>
        </Card>

        {/* 各种骨架组件 */}
        <Card title="各种骨架组件" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Skeleton.Input active size="large" style={{ width: 300 }} />
            <Skeleton.Input active style={{ width: 200 }} />
            <Skeleton.Avatar active size={64} shape="square" />
            <Skeleton.Button active size="large" shape="round" />
            <Skeleton.Image active style={{ width: 200, height: 120 }} />
          </Space>
        </Card>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 第九部分：Spin 加载中
// ============================================================================
/**
 * Spin 用于在页面或区域加载时显示加载指示器。
 *
 * 常用属性：
 *   - spinning: 是否显示加载状态
 *   - size: 尺寸，可选值 'small' | 'default' | 'large'
 *   - indicator: 自定义加载指示器
 *   - tip: 加载提示文字（包裹内容时才显示）
 *   - delay: 延迟显示加载状态（毫秒），避免闪烁
 *   - fullscreen: antd 5.x 新增，全屏加载
 *
 * 使用方式：
 *   1. 包裹内容：<Spin spinning={loading}>内容</Spin>
 *   2. 单独使用：<Spin />（只显示加载图标）
 */
function SpinDemo() {
  const [loading, setLoading] = useState(false);
  const [delayLoading, setDelayLoading] = useState(false);

  const toggleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const toggleDelayLoading = () => {
    setDelayLoading(true);
    setTimeout(() => setDelayLoading(false), 2000);
  };

  return (
    <div>
      <Title level={4}>9. Spin 加载中</Title>
      <Paragraph>
        Spin 用于显示加载状态。可以包裹内容或单独使用。
        <Text code>delay</Text> 属性可以延迟显示，避免快速加载时的闪烁。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 不同尺寸 */}
        <Card title="不同尺寸" size="small">
          <Space size="large">
            <Spin size="small" />
            <Spin />
            <Spin size="large" />
          </Space>
        </Card>

        {/* 包裹内容 */}
        <Card title="包裹内容" size="small">
          <Spin spinning={loading} tip="加载中...">
            <div style={{ padding: 50, textAlign: 'center', background: '#f5f5f5', borderRadius: 4 }}>
              <p>这里是加载完成后显示的内容。</p>
              <Button onClick={toggleLoading}>切换加载状态（2秒）</Button>
            </div>
          </Spin>
        </Card>

        {/* 延迟显示 */}
        <Card title="延迟显示（delay=500ms）" size="small">
          <Spin spinning={delayLoading} delay={500}>
            <div style={{ padding: 50, textAlign: 'center', background: '#f5f5f5', borderRadius: 4 }}>
              <p>如果加载在 500ms 内完成，不会显示 Spin。</p>
              <Button onClick={toggleDelayLoading}>快速切换（2秒）</Button>
            </div>
          </Spin>
        </Card>

        {/* 自定义加载指示器 */}
        <Card title="自定义加载指示器" size="small">
          <Space size="large">
            <Spin indicator={<PlusOutlined style={{ fontSize: 24 }} spin />} />
            <Spin
              indicator={
                <div style={{ fontSize: 24 }}>
                  <LoadingOutlined />
                </div>
              }
            />
          </Space>
        </Card>
      </Space>

      <Divider />
    </div>
  );
}

// ============================================================================
// 主组件：整合所有反馈组件示例
// ============================================================================
export default function FeedbackDemo() {
  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <Title level={2}>Ant Design 5.x 反馈类组件教程</Title>
      <Paragraph>
        反馈类组件用于向用户展示操作结果、状态变化等信息。
        本教程涵盖了 Message、Notification、Modal、Drawer、Popconfirm、
        Progress、Result、Skeleton、Spin 九种反馈组件。
      </Paragraph>

      <Divider />

      {/* Message 和 Notification 需要在 App 上下文中使用 */}
      <MessageDemo />
      <NotificationDemo />
      <ModalDemo />
      <DrawerDemo />
      <PopconfirmDemo />
      <ProgressDemo />
      <ResultDemo />
      <SkeletonDemo />
      <SpinDemo />
    </div>
  );
}

// 注意：使用 App.useApp() 的组件需要被 <App> 组件包裹
// 在 main.tsx 中：
// import { ConfigProvider, App } from 'antd';
// <ConfigProvider>
//   <App>
//     <FeedbackDemo />
//   </App>
// </ConfigProvider>
