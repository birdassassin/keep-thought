/**
 * ============================================================================
 * 03-table.tsx - Ant Design 表格完整用法
 * ============================================================================
 *
 * 本文件演示 Ant Design Table 组件的各种用法。
 *
 * 涵盖内容：
 *   1. Table 基础用法 - 数据定义、列配置、基本渲染
 *   2. 列定义 - dataIndex、render、width、fixed、align 等
 *   3. 排序 - 本地排序、多列排序
 *   4. 筛选 - 本地筛选、自定义筛选
 *   5. 分页 - 前端分页、后端分页
 *   6. 选择行 - 单选、多选、跨页选择
 *   7. 自定义渲染 - render 函数、Tag、Badge、Tooltip
 *   8. 可展开行 - expandable 配置
 *   9. 树形数据 - 树形表格展示
 *  10. Table 与 Form 结合 - 行内编辑
 *
 * 学习目标：
 *   - 掌握 columns 和 dataSource 的配置方式
 *   - 学会排序、筛选、分页的组合使用
 *   - 理解行内编辑的实现思路
 * ============================================================================
 */

import React, { useState, useRef } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Typography,
  Divider,
  Popconfirm,
  message,
  Tooltip,
  Badge,
  Progress,
} from 'antd';
import type { TableProps, InputRef } from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// 模拟数据
// ============================================================================

/**
 * 用户数据类型定义
 * 在实际项目中，通常会有对应的 TypeScript 接口定义
 */
interface UserRecord {
  key: string;
  name: string;
  age: number;
  gender: '男' | '女';
  email: string;
  department: string;
  role: '管理员' | '编辑' | '查看者';
  status: '在职' | '离职' | '休假';
  joinDate: string;
  salary: number;
}

/**
 * 生成模拟用户数据
 */
const generateMockData = (): UserRecord[] => {
  const departments = ['技术部', '产品部', '设计部', '市场部', '运营部'];
  const roles: UserRecord['role'][] = ['管理员', '编辑', '查看者'];
  const statuses: UserRecord['status'][] = ['在职', '在职', '在职', '离职', '休假'];
  const names = [
    '张三', '李四', '王五', '赵六', '孙七',
    '周八', '吴九', '郑十', '陈一', '林二',
    '黄三', '刘四', '杨五', '马六', '何七',
  ];

  return names.map((name, index) => ({
    key: String(index + 1),
    name,
    age: 22 + Math.floor(Math.random() * 20),
    gender: (index % 2 === 0 ? '男' : '女') as UserRecord['gender'],
    email: `${name.toLowerCase()}@example.com`,
    department: departments[index % departments.length],
    role: roles[index % roles.length],
    status: statuses[index % statuses.length],
    joinDate: `202${Math.floor(Math.random() + 2)}-0${Math.floor(Math.random() * 9) + 1}-15`,
    salary: 8000 + Math.floor(Math.random() * 20000),
  }));
};

const mockData = generateMockData();

// ============================================================================
// 第一部分：Table 基础用法
// ============================================================================
/**
 * Table 组件的核心属性：
 *   - columns: 列定义数组，每列描述一个数据字段
 *   - dataSource: 数据源数组，每个元素是一行数据
 *   - rowKey: 行的唯一标识字段名或函数
 *   - bordered: 是否显示边框
 *   - size: 表格大小，可选值 'large' | 'middle' | 'small'
 *   - loading: 是否加载中
 *   - pagination: 分页配置，设为 false 禁用分页
 *   - scroll: 滚动配置，如 { x: 1200, y: 300 }
 *
 * Column 的核心属性：
 *   - title: 列标题
 *   - dataIndex: 数据字段名（对应 dataSource 中的字段）
 *   - key: 列的唯一标识
 *   - render: 自定义渲染函数 (value, record, index) => ReactNode
 *   - width: 列宽度
 *   - fixed: 固定列，可选值 'left' | 'right'
 *   - align: 对齐方式，可选值 'left' | 'center' | 'right'
 *   - ellipsis: 超出宽度是否省略
 *   - sorter: 排序函数
 *   - filters: 筛选选项
 *   - onFilter: 筛选函数
 */
function BasicTableDemo() {
  // 定义列
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      // render 函数用于自定义单元格内容
      // 参数：value（当前字段值）、record（整行数据）、index（行索引）
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      // sorter: true 表示启用客户端排序（antd 会自动处理）
      sorter: (a: UserRecord, b: UserRecord) => a.age - b.age,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      // ellipsis: true 会在内容超出时显示省略号
      ellipsis: true,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
  ];

  return (
    <div>
      <Title level={4}>1. Table 基础用法</Title>
      <Paragraph>
        Table 通过 <Text code>columns</Text> 定义列，<Text code>dataSource</Text> 提供数据。
        每列的 <Text code>dataIndex</Text> 对应数据字段名。
      </Paragraph>

      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="key"
        bordered
        // pagination 设为 false 可以禁用分页
        pagination={false}
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第二部分：列定义详解
// ============================================================================
/**
 * 本节详细展示列的各种配置方式
 */
function ColumnDefinitionDemo() {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      // fixed: 'left' 将列固定在左侧（需要设置 scroll.x）
      fixed: 'left' as const,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 80,
      align: 'center' as const, // 居中对齐
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: {
        showTitle: false, // 不显示原生 title 提示
      },
      // 使用 Tooltip 包裹省略文本，鼠标悬停时显示完整内容
      render: (email: string) => (
        <Tooltip placement="topLeft" title={email}>
          {email}
        </Tooltip>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      // 使用 Tag 组件美化角色显示
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          '管理员': 'red',
          '编辑': 'blue',
          '查看者': 'green',
        };
        return <Tag color={colorMap[role]}>{role}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      // 使用 Badge 显示状态
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          '在职': { text: '运行中', color: 'success' },
          '离职': { text: '已停止', color: 'default' },
          '休假': { text: '暂停', color: 'warning' },
        };
        const config = statusMap[status] || { text: status, color: 'default' };
        return <Badge status={config.color as any} text={status} />;
      },
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
      width: 120,
      align: 'right' as const,
      // 格式化数字显示
      render: (salary: number) => `¥ ${salary.toLocaleString()}`,
    },
    {
      title: '入职日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      // fixed 列不设置 dataIndex
      fixed: 'right' as const,
      width: 150,
      // render 函数不接收 value（因为没有 dataIndex），直接使用 record
      render: (_: any, record: UserRecord) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除？"
            description={`确定要删除 ${record.name} 吗？`}
            onConfirm={() => message.success(`已删除 ${record.name}`)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>2. 列定义详解</Title>
      <Paragraph>
        展示了列的各种配置：<Text code>width</Text>（宽度）、<Text code>fixed</Text>（固定列）、
        <Text code>align</Text>（对齐）、<Text code>ellipsis</Text>（省略）、
        <Text code>render</Text>（自定义渲染）等。
      </Paragraph>

      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="key"
        bordered
        size="small"
        // scroll.x 启用水平滚动（当列总宽度超过容器时）
        // scroll.y 启用垂直滚动（固定表头）
        scroll={{ x: 1300, y: 300 }}
        pagination={false}
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第三部分：排序
// ============================================================================
function SortDemo() {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      // sorter: true 表示使用 antd 内置的排序功能
      // antd 会根据数据类型自动排序（数字按大小，字符串按字母序）
      sorter: true,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      // sorter 可以是一个比较函数，用于自定义排序逻辑
      sorter: (a: UserRecord, b: UserRecord) => a.age - b.age,
      // defaultSortOrder 设置默认排序方向
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
      sorter: (a: UserRecord, b: UserRecord) => a.salary - b.salary,
      render: (salary: number) => `¥ ${salary.toLocaleString()}`,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      sorter: (a: UserRecord, b: UserRecord) =>
        a.department.localeCompare(b.department),
    },
    {
      title: '入职日期',
      dataIndex: 'joinDate',
      key: 'joinDate',
      sorter: (a: UserRecord, b: UserRecord) =>
        a.joinDate.localeCompare(b.joinDate),
    },
  ];

  return (
    <div>
      <Title level={4}>3. 排序</Title>
      <Paragraph>
        设置 <Text code>sorter</Text> 属性启用排序。
        可以是 <Text code>true</Text>（使用内置排序）或自定义比较函数。
        点击表头即可切换升序/降序。
      </Paragraph>

      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="key"
        // 多列排序配置
        sortDirections={['ascend', 'descend']}
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第四部分：筛选
// ============================================================================
function FilterDemo() {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      // 搜索筛选：使用自定义筛选 UI
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="搜索姓名"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={confirm}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={confirm}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              搜索
            </Button>
            <Button
              onClick={() => clearFilters && clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              重置
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
      ),
      onFilter: (value: any, record: UserRecord) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      // filters 定义筛选选项
      filters: [
        { text: '技术部', value: '技术部' },
        { text: '产品部', value: '产品部' },
        { text: '设计部', value: '设计部' },
        { text: '市场部', value: '市场部' },
        { text: '运营部', value: '运营部' },
      ],
      // onFilter 定义筛选逻辑
      onFilter: (value: any, record: UserRecord) => record.department === value,
      // filterMultiple: false 表示单选筛选
      // filterMultiple: true（默认）表示多选筛选
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: '管理员', value: '管理员' },
        { text: '编辑', value: '编辑' },
        { text: '查看者', value: '查看者' },
      ],
      onFilter: (value: any, record: UserRecord) => record.role === value,
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          '管理员': 'red',
          '编辑': 'blue',
          '查看者': 'green',
        };
        return <Tag color={colorMap[role]}>{role}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: '在职', value: '在职' },
        { text: '离职', value: '离职' },
        { text: '休假', value: '休假' },
      ],
      onFilter: (value: any, record: UserRecord) => record.status === value,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      sorter: (a: UserRecord, b: UserRecord) => a.age - b.age,
    },
  ];

  return (
    <div>
      <Title level={4}>4. 筛选</Title>
      <Paragraph>
        通过 <Text code>filters</Text> 定义筛选选项，<Text code>onFilter</Text> 定义筛选逻辑。
        也可以通过 <Text code>filterDropdown</Text> 自定义筛选 UI（如搜索框）。
      </Paragraph>

      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="key"
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第五部分：分页
// ============================================================================
function PaginationDemo() {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <div>
      <Title level={4}>5. 分页</Title>
      <Paragraph>
        通过 <Text code>pagination</Text> 属性配置分页。
        设为 <Text code>false</Text> 禁用分页，或传入对象自定义分页行为。
      </Paragraph>

      <Title level={5}>5.1 前端分页（默认）</Title>
      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="key"
        pagination={{
          pageSize: 5,           // 每页条数
          showSizeChanger: true,  // 显示每页条数切换器
          pageSizeOptions: [3, 5, 10, 20], // 可选的每页条数
          showQuickJumper: true,  // 显示快速跳转
          showTotal: (total) => `共 ${total} 条`, // 显示总数
          defaultCurrent: 1,      // 默认当前页
        }}
      />

      <Title level={5}>5.2 禁用分页</Title>
      <Table
        columns={columns}
        dataSource={mockData.slice(0, 5)}
        rowKey="key"
        pagination={false}
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第六部分：选择行
// ============================================================================
function RowSelectionDemo() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 多选配置
  const rowSelection = {
    // 选中的行 key 数组（受控模式）
    selectedRowKeys,
    // 选中变化时的回调
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: UserRecord[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      console.log('选中的行：', selectedRows);
    },
    // 选择配置
    type: 'checkbox' as const, // 'checkbox' | 'radio'
    // 跨页选择（需要设置 rowSelection.preserveSelectedRowKeys）
    // preserveSelectedRowKeys: true,
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  // 批量删除处理
  const handleBatchDelete = () => {
    message.success(`已删除 ${selectedRowKeys.length} 条记录`);
    setSelectedRowKeys([]);
  };

  return (
    <div>
      <Title level={4}>6. 选择行</Title>
      <Paragraph>
        通过 <Text code>rowSelection</Text> 属性启用行选择。
        支持 <Text code>checkbox</Text>（多选）和 <Text code>radio</Text>（单选）。
      </Paragraph>

      <Space style={{ marginBottom: 16 }}>
        <span>已选择 {selectedRowKeys.length} 项</span>
        <Button
          type="primary"
          danger
          disabled={selectedRowKeys.length === 0}
          onClick={handleBatchDelete}
        >
          批量删除
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="key"
        rowSelection={rowSelection}
        pagination={false}
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第七部分：自定义渲染
// ============================================================================
function CustomRenderDemo() {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      // render 函数的三个参数：
      // 1. value: 当前字段的值
      // 2. record: 整行数据对象
      // 3. index: 行索引
      render: (name: string, record: UserRecord) => (
        <Space>
          <span>{name}</span>
          {record.role === '管理员' && (
            <Tag color="gold" style={{ marginLeft: 4 }}>VIP</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      render: (age: number) => {
        // 根据年龄范围显示不同颜色
        let color = 'green';
        if (age >= 35) color = 'orange';
        if (age >= 40) color = 'red';
        return <Text style={{ color }}>{age}</Text>;
      },
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
      sorter: (a: UserRecord, b: UserRecord) => a.salary - b.salary,
      render: (salary: number) => {
        // 使用 Progress 组件显示薪资占比
        const maxSalary = 30000;
        const percent = Math.round((salary / maxSalary) * 100);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress
              percent={percent}
              size="small"
              style={{ width: 100, marginBottom: 0 }}
            />
            <Text>¥{salary.toLocaleString()}</Text>
          </div>
        );
      },
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const config: Record<string, { color: string }> = {
          '管理员': { color: 'red' },
          '编辑': { color: 'blue' },
          '查看者': { color: 'default' },
        };
        return <Tag color={config[role]?.color}>{role}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      // 使用不同颜色的 Tag 表示状态
      render: (status: string) => {
        const config: Record<string, string> = {
          '在职': 'green',
          '离职': 'default',
          '休假': 'orange',
        };
        return <Tag color={config[status]}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Title level={4}>7. 自定义渲染</Title>
      <Paragraph>
        通过 <Text code>render</Text> 函数自定义单元格内容。
        render 接收 <Text code>(value, record, index)</Text> 三个参数。
      </Paragraph>

      <Table
        columns={columns}
        dataSource={mockData}
        rowKey="key"
        pagination={false}
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第八部分：可展开行
// ============================================================================
function ExpandableDemo() {
  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '角色', dataIndex: 'role', key: 'role' },
  ];

  return (
    <div>
      <Title level={4}>8. 可展开行</Title>
      <Paragraph>
        通过 <Text code>expandable</Text> 属性配置行展开功能。
        可以自定义展开内容、图标、是否可展开等。
      </Paragraph>

      <Table
        columns={columns}
        dataSource={mockData.slice(0, 5)}
        rowKey="key"
        expandable={{
          // expandedRowRender 定义展开后显示的内容
          expandedRowRender: (record: UserRecord) => (
            <div style={{ padding: '8px 0' }}>
              <p><Text strong>详细信息：</Text></p>
              <p>邮箱：{record.email}</p>
              <p>状态：{record.status}</p>
              <p>入职日期：{record.joinDate}</p>
              <p>薪资：¥{record.salary.toLocaleString()}</p>
            </div>
          ),
          // rowExpandable 控制哪些行可以展开
          rowExpandable: (record: UserRecord) => record.name !== '赵六',
          // 展开图标（默认是 > 箭头）
          // columnWidth 展开列的宽度
          columnWidth: 50,
        }}
        pagination={false}
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第九部分：树形数据
// ============================================================================
function TreeDataDemo() {
  // 树形数据需要 children 字段
  const treeData = [
    {
      key: '1',
      name: '技术部',
      department: '技术部',
      memberCount: 25,
      children: [
        {
          key: '1-1',
          name: '前端组',
          department: '前端组',
          memberCount: 10,
          children: [
            { key: '1-1-1', name: 'React 小组', department: 'React 小组', memberCount: 5 },
            { key: '1-1-2', name: 'Vue 小组', department: 'Vue 小组', memberCount: 5 },
          ],
        },
        {
          key: '1-2',
          name: '后端组',
          department: '后端组',
          memberCount: 10,
          children: [
            { key: '1-2-1', name: 'Java 小组', department: 'Java 小组', memberCount: 5 },
            { key: '1-2-2', name: 'Go 小组', department: 'Go 小组', memberCount: 5 },
          ],
        },
        { key: '1-3', name: '测试组', department: '测试组', memberCount: 5 },
      ],
    },
    {
      key: '2',
      name: '产品部',
      department: '产品部',
      memberCount: 15,
      children: [
        { key: '2-1', name: '产品设计组', department: '产品设计组', memberCount: 8 },
        { key: '2-2', name: '用户研究组', department: '用户研究组', memberCount: 7 },
      ],
    },
    {
      key: '3',
      name: '设计部',
      department: '设计部',
      memberCount: 10,
    },
  ];

  const columns = [
    {
      title: '部门/小组',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '人数',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 100,
      align: 'center' as const,
    },
  ];

  return (
    <div>
      <Title level={4}>9. 树形数据</Title>
      <Paragraph>
        数据中包含 <Text code>children</Text> 字段时，Table 会自动渲染为树形结构。
        可以通过 <Text code>expandable.defaultExpandAllRows</Text> 默认展开所有行。
      </Paragraph>

      <Table
        columns={columns}
        dataSource={treeData}
        rowKey="key"
        // defaultExpandAllRows 默认展开所有行
        defaultExpandAllRows
        pagination={false}
      />

      <Divider />
    </div>
  );
}

// ============================================================================
// 第十部分：Table 与 Form 结合（行内编辑）
// ============================================================================
/**
 * 行内编辑的实现思路：
 * 1. 使用 state 记录当前正在编辑的行的 key
 * 2. 点击"编辑"按钮时，将该行设为编辑状态
 * 3. 在 render 函数中，根据是否是编辑状态渲染不同的组件
 *    - 编辑状态：渲染 Input / Select 等输入组件
 *    - 非编辑状态：渲染普通文本
 * 4. 点击"保存"时，收集编辑数据并更新
 * 5. 点击"取消"时，恢复原始数据
 */
interface EditableCellProps {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: 'text' | 'number';
  record: UserRecord;
  index: number;
  children: React.ReactNode;
}

// 可编辑单元格组件
const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputRef = useRef<InputRef>(null);

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[{ required: true, message: `请输入${title}` }]}
        >
          {inputType === 'number' ? (
            <InputNumber />
          ) : (
            <Input ref={inputRef} />
          )}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

function InlineEditDemo() {
  // 使用 Form 管理编辑状态
  const [form] = Form.useForm();
  // 记录当前正在编辑的行的 key
  const [editingKey, setEditingKey] = useState('');
  // 表格数据（可编辑的副本）
  const [data, setData] = useState(mockData.slice(0, 5));

  // 判断某行是否处于编辑状态
  const isEditing = (record: UserRecord) => record.key === editingKey;

  // 开始编辑
  const edit = (record: UserRecord) => {
    // 先将当前行的数据填充到表单中
    form.setFieldsValue({
      name: record.name,
      age: record.age,
      department: record.department,
      role: record.role,
    });
    setEditingKey(record.key);
  };

  // 保存编辑
  const save = async (key: string) => {
    try {
      // 验证表单
      const row = await form.validateFields();
      // 更新数据
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
        message.success('保存成功');
      }
    } catch (errInfo) {
      console.log('验证失败：', errInfo);
    }
  };

  // 取消编辑
  const cancel = () => {
    setEditingKey('');
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      editable: true,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      editable: true,
      inputType: 'number' as const,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      editable: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      editable: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserRecord) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size="small">
            <Button
              type="link"
              size="small"
              onClick={() => save(record.key)}
            >
              保存
            </Button>
            <Popconfirm title="确定取消？" onConfirm={cancel}>
              <Button type="link" size="small">
                取消
              </Button>
            </Popconfirm>
          </Space>
        ) : (
          <Space size="small">
            <Button
              type="link"
              size="small"
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              icon={<EditOutlined />}
            >
              编辑
            </Button>
          </Space>
        );
      },
    },
  ];

  // 合并可编辑列配置
  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record: UserRecord) => ({
        record,
        inputType: col.inputType || 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div>
      <Title level={4}>10. Table 与 Form 结合（行内编辑）</Title>
      <Paragraph>
        行内编辑的核心思路：使用 state 记录编辑状态，在 render 中根据状态切换
        显示文本和输入组件，使用 Form 管理编辑数据的收集和验证。
      </Paragraph>

      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          columns={mergedColumns}
          dataSource={data}
          rowKey="key"
          pagination={false}
        />
      </Form>

      <Divider />
    </div>
  );
}

// ============================================================================
// 主组件：整合所有表格示例
// ============================================================================
export default function TableDemo() {
  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>Ant Design 5.x 表格完整教程</Title>
      <Paragraph>
        Table 是 antd 中最复杂的展示组件之一。本教程从基础用法到行内编辑，
        涵盖了排序、筛选、分页、选择、展开、树形数据等核心功能。
      </Paragraph>

      <Divider />

      <BasicTableDemo />
      <ColumnDefinitionDemo />
      <SortDemo />
      <FilterDemo />
      <PaginationDemo />
      <RowSelectionDemo />
      <CustomRenderDemo />
      <ExpandableDemo />
      <TreeDataDemo />
      <InlineEditDemo />
    </div>
  );
}
