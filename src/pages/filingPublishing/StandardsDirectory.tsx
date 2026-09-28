import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  message,
  Card,
  Statistic,
  Breadcrumb,
  Tabs,
  Modal,
  Input,
  Select,
  Tooltip,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  HomeOutlined,
  FileProtectOutlined,
  SendOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  FolderOpenOutlined,
  CloseCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFilingList,
  getDirectoryList,
  getStandardDetail,
  submitFiling,
  publishStandard,
  unpublishStandard,
  getFilingStatistics,
} from '@/api/filing-publishing';
import type {
  FilingListParams,
  DirectoryListParams,
  CareerStandardVO,
  PageResponse,
} from '@/api/filing-publishing';
import StandardMap from '@/components/careerStandardMap';
import RichTextRender from '@/components/richEditor/RichTextRender';

type TabKey = 'filings' | 'directory';
const getPublishTag = (status: string) => {
  const tags: Record<string, { text: string; type: string }> = {
    '0': { text: '待发布', type: 'default' },
    '1': { text: '已发布', type: 'success' },
    '2': { text: '取消发布', type: 'warning' },
  };
  return <Tag color={tags[status].type}>{tags[status].text}</Tag>;
};
export default function StandardsDirectory() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('filings');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingStandard, setViewingStandard] = useState<CareerStandardVO | null>(null);
  const [mappingDataModal, setMappingDataModal] = useState<{
    visible: boolean;
    data: any;
    title: string;
  }>({ visible: false, data: {}, title: '' });
  // 备案列表筛选和分页
  const [filingSearch, setFilingSearch] = useState('');
  const [filingDomain, setFilingDomain] = useState<number | undefined>(undefined);
  const [filingPagination, setFilingPagination] = useState({ current: 1, pageSize: 10 });

  // 目录列表筛选和分页
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryDomain, setDirectoryDomain] = useState<number | undefined>(undefined);
  const [directoryPagination, setDirectoryPagination] = useState({ current: 1, pageSize: 10 });

  // 构建查询参数
  const filingParams = useMemo<FilingListParams>(
    () => ({
      current: filingPagination.current,
      size: filingPagination.pageSize,
      careerStandardFileNameLike: filingSearch || undefined,
      careerId: filingDomain,
    }),
    [filingPagination, filingSearch, filingDomain]
  );

  const directoryParams = useMemo<DirectoryListParams>(
    () => ({
      current: directoryPagination.current,
      size: directoryPagination.pageSize,
      careerStandardFileNameLike: directorySearch || undefined,
      careerId: directoryDomain,
    }),
    [directoryPagination, directorySearch, directoryDomain]
  );

  // 获取统计数据
  const { data: statistics } = useQuery<{
    readyForFilingNum: number;
    filedNum: number;
    publishedNum: number;
    awaitingPublishNum: number;
  }>({
    queryKey: ['filingStatistics'],
    queryFn: getFilingStatistics,
    staleTime: 30000, // 30秒缓存
  });

  // 获取备案列表
  const {
    data: filingData,
    isLoading: filingLoading,
    refetch: refetchFilings,
  } = useQuery<PageResponse<CareerStandardVO>>({
    queryKey: ['filingList', filingParams],
    queryFn: () => getFilingList(filingParams),
    staleTime: 30000,
  });

  // 获取目录列表
  const {
    data: directoryData,
    isLoading: directoryLoading,
    refetch: refetchDirectory,
  } = useQuery<PageResponse<CareerStandardVO>>({
    queryKey: ['directoryList', directoryParams],
    queryFn: () => getDirectoryList(directoryParams),
    enabled: activeTab === 'directory', // 只在目录标签页激活时查询
    staleTime: 30000,
  });

  // 提交备案 Mutation
  const filingMutation = useMutation({
    mutationFn: (careerStandardId: string) => submitFiling(careerStandardId),
    onSuccess: () => {
      message.success('备案成功');
      queryClient.invalidateQueries({ queryKey: ['filingList'] });
      queryClient.invalidateQueries({ queryKey: ['filingStatistics'] });
    },
    onError: (error: any) => {
      message.error(`备案失败: ${error?.message || '未知错误'}`);
    },
  });

  // 发布标准 Mutation
  const publishMutation = useMutation({
    mutationFn: (careerStandardId: string) => publishStandard(careerStandardId),
    onSuccess: () => {
      message.success('发布成功');
      queryClient.invalidateQueries({ queryKey: ['directoryList'] });
      queryClient.invalidateQueries({ queryKey: ['filingStatistics'] });
    },
    onError: (error: any) => {
      message.error(`发布失败: ${error?.message || '未知错误'}`);
    },
  });

  // 取消发布 Mutation
  const unpublishMutation = useMutation({
    mutationFn: (id: string) => unpublishStandard(id),
    onSuccess: () => {
      message.success('取消发布成功');
      queryClient.invalidateQueries({ queryKey: ['directoryList'] });
      queryClient.invalidateQueries({ queryKey: ['filingStatistics'] });
    },
    onError: (error: any) => {
      message.error(`取消发布失败: ${error?.message || '未知错误'}`);
    },
  });

  // 查看详情
  const handleView = async (record: CareerStandardVO) => {
    try {
      const detail = await getStandardDetail(record.id);
      console.log(detail);
      setViewingStandard(detail as CareerStandardVO);
      setViewModalVisible(true);
    } catch (error: any) {
      message.error(`加载详情失败: ${error?.message || '未知错误'}`);
    }
  };

  // 提交备案
  const handleFilingSubmit = (record: CareerStandardVO) => {
    Modal.confirm({
      title: '确认备案',
      content: `确定要提交备案 "${record.careerStandardFileName}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => filingMutation.mutate(record.id),
    });
  };

  // 发布标准
  const handlePublish = (record: CareerStandardVO) => {
    Modal.confirm({
      title: '确认发布',
      content: `确定要发布标准 "${record.careerStandardFileName}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => publishMutation.mutate(record.id),
    });
  };

  // 取消发布
  const handleUnpublish = (record: CareerStandardVO) => {
    Modal.confirm({
      title: '确认取消发布',
      content: `确定要取消发布 "${record.careerStandardFileName}" 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => unpublishMutation.mutate(record.id),
    });
  };
  // 查看能力分级表
  const handleViewMapping = (record: CareerStandardVO) => {
    setMappingDataModal({
      visible: true,
      data: record.careerStandardMapId,
      title: `${record.careerStandardFileName}（${record.standardVersion}）`,
    });
  };
  // 备案列表列定义
  const filingColumns: ColumnsType<CareerStandardVO> = [
    {
      title: '标准名称',
      dataIndex: 'careerStandardFileName',
      key: 'careerStandardFileName',
      width: 300,
      ellipsis: true,
    },
    {
      title: '版本',
      dataIndex: 'standardVersion',
      key: 'standardVersion',
      width: 100,
    },
    {
      title: '职业领域',
      dataIndex: 'careerName',
      key: 'careerName',
      width: 150,
    },
    {
      title: '审核状态',
      key: 'auditStatus',
      width: 120,
      render: (_, record) => {
        const statusMap: Record<number, { text: string; color: string }> = {
          0: { text: '草稿', color: 'processing' },
          1: { text: '待审核', color: 'processing' },
          2: { text: '已通过', color: 'success' },
          3: { text: '未通过', color: 'error' },
        };
        const status = statusMap[record.auditStatus] || { text: '未知', color: 'default' };
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '备案状态',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const isFiled = record.status == 2; // 如果有发布日期说明已备案
        return isFiled ? <Tag color="success">已备案</Tag> : <Tag color="default">未备案</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: CareerStandardVO) => (
        <Space size="small">
          <Tooltip title={record.publishDate ? '已备案' : '提交备案'}>
            <Button
              type={record.status == 2 ? 'default' : 'primary'}
              size="small"
              icon={<FileProtectOutlined />}
              onClick={() => handleFilingSubmit(record)}
              disabled={record.status == 2}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 目录列表列定义
  const directoryColumns: ColumnsType<CareerStandardVO> = [
    {
      title: '标准编号',
      dataIndex: 'careerStandardFileNo',
      key: 'careerStandardFileNo',
      width: 180,
    },
    {
      title: '标准名称',
      dataIndex: 'careerStandardFileName',
      key: 'careerStandardFileName',
      width: 300,
      ellipsis: true,
    },
    {
      title: '职业领域',
      dataIndex: 'careerName',
      key: 'careerName',
      width: 150,
    },
    {
      title: '版本',
      dataIndex: 'standardVersion',
      key: 'standardVersion',
      width: 100,
    },
    {
      title: '发布日期',
      dataIndex: 'publishDate',
      key: 'publishDate',
      width: 180,
      render: (text) => (text ? new Date(text).toLocaleDateString('zh-CN') : '-'),
    },
    {
      title: '发布状态',
      key: 'publishStatus',
      width: 120,
      render: (_, record) => {
        return getPublishTag(record.publishStatus?.toString() || '0');
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_: any, record: CareerStandardVO) => (
        <Space size="small">
          <Tooltip title="查看标准">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          {record.publishStatus == '0' && (
            <Tooltip title="发布标准">
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={() => handlePublish(record)}
              />
            </Tooltip>
          )}
          {record.publishStatus == '2' && (
            <Tooltip title="取消发布">
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleUnpublish(record)}
              />
            </Tooltip>
          )}
          {record.publishStatus == '3' && (
            <Tooltip title="重新发布">
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={() => handlePublish(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 面包屑导航 */}
      <Breadcrumb
        className="mb-6"
        items={[
          { href: '/', title: <HomeOutlined /> },
          { title: '备案与发布' },
          { title: '标准目录' },
        ]}
      />

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <Statistic
            title="可备案标准"
            value={statistics?.readyForFilingNum || 0}
            valueStyle={{ color: '#1890ff' }}
            prefix={<FileProtectOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="标准目录"
            value={statistics?.filedNum || 0}
            valueStyle={{ color: '#722ed1' }}
            prefix={<FileTextOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="待发布标准"
            value={statistics?.awaitingPublishNum || 0}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<FileTextOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="已发布标准"
            value={statistics?.publishedNum || 0}
            valueStyle={{ color: '#52c41a' }}
            prefix={<FileTextOutlined />}
          />
        </Card>
      </div>

      {/* 主内容区 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          items={[
            {
              key: 'filings',
              label: (
                <span>
                  <FileProtectOutlined />
                  标准备案
                </span>
              ),
              children: (
                <div>
                  {/* 表格 */}
                  <Table
                    columns={filingColumns}
                    dataSource={filingData?.records || []}
                    rowKey="id"
                    loading={filingLoading}
                    pagination={{
                      current: filingPagination.current,
                      pageSize: filingPagination.pageSize,
                      total: filingData?.total || 0,
                      showSizeChanger: true,
                      showTotal: (total) => `共 ${total} 条`,
                      onChange: (current, pageSize) => setFilingPagination({ current, pageSize }),
                    }}
                    scroll={{ x: 1200 }}
                  />
                </div>
              ),
            },
            {
              key: 'directory',
              label: (
                <span>
                  <FolderOpenOutlined />
                  标准目录
                </span>
              ),
              children: (
                <div>
                  {/* 表格 */}
                  <Table
                    columns={directoryColumns}
                    dataSource={directoryData?.records || []}
                    rowKey="id"
                    loading={directoryLoading}
                    pagination={{
                      current: directoryPagination.current,
                      pageSize: directoryPagination.pageSize,
                      total: directoryData?.total || 0,
                      showSizeChanger: true,
                      showTotal: (total) => `共 ${total} 条`,
                      onChange: (current, pageSize) =>
                        setDirectoryPagination({ current, pageSize }),
                    }}
                    scroll={{ x: 1400 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 查看标准弹窗 */}
      <Modal
        title={null}
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewingStandard(null);
        }}
        footer={null}
        width={1200}
        style={{ top: 20 }}
        styles={{ body: { padding: 0 } }}
        closeIcon={<CloseOutlined style={{ fontSize: '16px' }} />}
      >
        {viewingStandard && (
          <div>
            {/* 标题头部 */}
            <div className="border-b bg-white px-8 py-6">
              <Typography.Title level={3} style={{ margin: 0, marginBottom: 12 }}>
                {viewingStandard.careerStandardFileName}
              </Typography.Title>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">标准编号</span>
                <span className="font-medium">{viewingStandard.careerStandardFileNo || '-'}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">版本</span>
                <span className="font-medium">{viewingStandard.standardVersion}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">职业领域</span>
                <span className="font-medium">{viewingStandard.careerName || '未知'}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">审核状态</span>
                <Tag
                  color={
                    viewingStandard.auditStatus === 2
                      ? 'green'
                      : viewingStandard.auditStatus === 3
                        ? 'red'
                        : 'orange'
                  }
                  style={{ margin: 0 }}
                >
                  {viewingStandard.auditStatus === 2
                    ? '已通过'
                    : viewingStandard.auditStatus === 3
                      ? '未通过'
                      : '待审核'}
                </Tag>
              </div>
            </div>

            {/* 内容区域 */}
            <div
              className="px-8 py-6"
              style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}
            >
              <div className="space-y-6">
                {/* 基本信息卡片 */}
                {(viewingStandard.corePurpose || viewingStandard.scope) && (
                  <Card size="small" title={<span className="font-semibold">基本信息</span>}>
                    {viewingStandard.corePurpose && (
                      <div className="mb-3">
                        <div className="text-gray-600 text-sm mb-1">核心目的</div>
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                          {viewingStandard.corePurpose}
                        </Typography.Paragraph>
                      </div>
                    )}
                    {viewingStandard.scope && (
                      <div>
                        <div className="text-gray-600 text-sm mb-1">适用范围</div>
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                          {viewingStandard.scope}
                        </Typography.Paragraph>
                      </div>
                    )}
                  </Card>
                )}

                {/* 前言 */}
                {viewingStandard.preface && viewingStandard.preface.trim() !== '' && (
                  <Card size="small" title={<span className="font-semibold">引言</span>}>
                    <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                      {viewingStandard.preface}
                    </Typography.Paragraph>
                  </Card>
                )}

                {/* 概述 */}

                {/* 术语定义 */}
                {viewingStandard.careerStandardTermList &&
                  viewingStandard.careerStandardTermList.length > 0 && (
                    <Card size="small" title={<span className="font-semibold">术语定义</span>}>
                      <div className="space-y-3">
                        {viewingStandard.careerStandardTermList.map((item: any, index: number) => (
                          <div key={index} className="pb-3 border-b last:border-b-0 last:pb-0">
                            <div className="font-medium text-blue-600 mb-1">{item.termName}</div>
                            <Typography.Paragraph
                              style={{ marginBottom: 0 }}
                              className="text-gray-700"
                            >
                              {item.termDefinition}
                            </Typography.Paragraph>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                {/* 标准正文 */}
                {viewingStandard.overview && viewingStandard.overview.trim() !== '' && (
                  <Card size="small" title={<span className="font-semibold">标准正文</span>}>
                    <Typography.Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
                      {/* {viewingStandard.overview} */}
                      <RichTextRender content={viewingStandard.overview} />
                    </Typography.Paragraph>
                  </Card>
                )}
                {/* 审核详情 */}
                {/* {viewingStandard.auditDetails && viewingStandard.auditDetails.length > 0 && (
                  <Card size="small" title={<span className="font-semibold">审核详情</span>}>
                    <div className="space-y-4">
                      {viewingStandard.auditDetails.map((audit: any, index: number) => (
                        <Card
                          key={index}
                          size="small"
                          className={`border-l-4 ${
                            audit.auditStatus === 2
                              ? 'border-l-green-500'
                              : audit.auditStatus === 3
                                ? 'border-l-red-500'
                                : 'border-l-orange-500'
                          }`}
                        >
                          <div className="grid grid-cols-4 gap-3 mb-3">
                            <div>
                              <div className="text-xs text-gray-500">审核阶段</div>
                              <div className="font-medium">
                                {audit.auditStage === 1
                                  ? '内审'
                                  : audit.auditStage === 2
                                    ? '专家审查'
                                    : audit.auditStage === 3
                                      ? '专业委员会'
                                      : '-'}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">审核状态</div>
                              <Tag
                                color={
                                  audit.auditStatus === 2
                                    ? 'green'
                                    : audit.auditStatus === 3
                                      ? 'red'
                                      : 'orange'
                                }
                              >
                                {audit.auditStatus === 2
                                  ? '通过'
                                  : audit.auditStatus === 3
                                    ? '未通过'
                                    : '待审核'}
                              </Tag>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">审核人</div>
                              <div className="font-medium">{audit.auditUserName || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">审核日期</div>
                              <div className="font-medium">
                                {audit.auditDate
                                  ? new Date(audit.auditDate).toLocaleDateString('zh-CN')
                                  : '-'}
                              </div>
                            </div>
                          </div>
                          {audit.auditUserTitle && (
                            <div className="mb-2">
                              <div className="text-xs text-gray-500">职称</div>
                              <div className="text-sm">{audit.auditUserTitle}</div>
                            </div>
                          )}
                          {audit.auditUserInstitution && (
                            <div className="mb-2">
                              <div className="text-xs text-gray-500">所属机构</div>
                              <div className="text-sm">{audit.auditUserInstitution}</div>
                            </div>
                          )}
                          {audit.auditScope && (
                            <div className="mb-2">
                              <div className="text-xs text-gray-500">审核范围</div>
                              <div className="text-sm">{audit.auditScope}</div>
                            </div>
                          )}
                          {audit.auditReason && (
                            <div className="mb-2">
                              <div className="text-xs text-gray-500">审核原因</div>
                              <Typography.Paragraph
                                style={{ marginBottom: 0 }}
                                className="text-gray-700"
                              >
                                {audit.auditReason}
                              </Typography.Paragraph>
                            </div>
                          )}
                          {audit.suggestion && (
                            <div className="pt-3 border-t">
                              <div className="text-xs text-gray-500 mb-1">审核意见</div>
                              <Typography.Paragraph
                                style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}
                                className="text-gray-700"
                              >
                                {audit.suggestion}
                              </Typography.Paragraph>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </Card>
                )} */}

                {/* 修订详情 */}
                {/* {viewingStandard.reviseDetails && viewingStandard.reviseDetails.length > 0 && (
                  <Card size="small" title={<span className="font-semibold">修订详情</span>}>
                    <div className="space-y-3">
                      {viewingStandard.reviseDetails.map((revise: any, index: number) => (
                        <Card key={index} size="small" className="border-l-4 border-l-blue-500">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <div className="text-xs text-gray-500">修订人</div>
                              <div className="font-medium">{revise.reviseUserName || '-'}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">修订时间</div>
                              <div className="font-medium">
                                {revise.createTime
                                  ? new Date(revise.createTime).toLocaleString('zh-CN')
                                  : '-'}
                              </div>
                            </div>
                          </div>
                          {revise.reviseRemark && (
                            <div className="mb-2">
                              <div className="text-xs text-gray-500">修订说明</div>
                              <Typography.Paragraph style={{ marginBottom: 0 }}>
                                {revise.reviseRemark}
                              </Typography.Paragraph>
                            </div>
                          )}
                          {revise.suggestion && (
                            <div className="pt-3 border-t">
                              <div className="text-xs text-gray-500 mb-1">修订意见</div>
                              <Typography.Paragraph
                                style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}
                              >
                                {revise.suggestion}
                              </Typography.Paragraph>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </Card>
                )} */}

                {/* 专家论证意见 */}
                {/* {viewingStandard.appendixAttach && (
                  <Card size="small" title={<span className="font-semibold">专家论证意见</span>}>
                    <Typography.Paragraph style={{ marginBottom: 0 }}>
                      {viewingStandard.appendixAttach}
                    </Typography.Paragraph>
                  </Card>
                )} */}

                {/* 文档信息 */}
                <Card
                  size="small"
                  title={<span className="font-semibold">文档信息</span>}
                  className="bg-gray-50"
                >
                  <div className="grid grid-cols-2 gap-4">
                    {viewingStandard.careerStandardMapName && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">映射文档</div>
                        <div className="font-medium">
                          {viewingStandard.careerStandardMapName}（{viewingStandard.standardVersion}
                          ）
                          <Tooltip title="查看能力分级表详情">
                            <Button
                              type="text"
                              size="small"
                              icon={<SearchOutlined />}
                              onClick={() => handleViewMapping(viewingStandard)}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    )}
                    {/* {viewingStandard.standardName && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">标准名称</div>
                        <div className="font-medium">{viewingStandard.standardName}</div>
                      </div>
                    )}
                    {viewingStandard.industryName && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">行业</div>
                        <div className="font-medium">
                          {viewingStandard.industryCode
                            ? `${viewingStandard.industryName} (${viewingStandard.industryCode})`
                            : viewingStandard.industryName}
                        </div>
                      </div>
                    )} */}
                    {/* {viewingStandard.publishDate && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">发布时间</div>
                        <div className="font-medium">
                          {new Date(viewingStandard.publishDate).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">创建人</div>
                      <div className="font-medium">{viewingStandard.createUserName || '-'}</div>
                    </div> */}
                    <div>
                      <div className="text-xs text-gray-500 mb-1">创建时间</div>
                      <div className="font-medium">
                        {new Date(viewingStandard.createTime).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    {viewingStandard.updateTime && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">更新时间</div>
                        <div className="font-medium">
                          {new Date(viewingStandard.updateTime).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    )}
                    {/* {viewingStandard.remark && (
                      <div className="col-span-2">
                        <div className="text-xs text-gray-500 mb-1">备注</div>
                        <Typography.Paragraph style={{ marginBottom: 0 }}>
                          {viewingStandard.remark}
                        </Typography.Paragraph>
                      </div>
                    )} */}
                  </div>
                </Card>
              </div>
            </div>

            {/* 底部操作栏 */}
            <div className="border-t px-8 py-4 bg-gray-50 flex justify-end">
              <Button
                type="primary"
                onClick={() => {
                  setViewModalVisible(false);
                  setViewingStandard(null);
                }}
              >
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 查看能力分级表弹窗 */}
      {/* 能力分级表详情弹窗 */}
      <Modal
        title={mappingDataModal.title}
        open={mappingDataModal.visible}
        onCancel={() => {
          setMappingDataModal({ visible: false, data: {}, title: '' });
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setMappingDataModal({ visible: false, data: {}, title: '' });
            }}
          >
            关闭
          </Button>,
        ]}
        width="95%"
        style={{ top: 20 }}
      >
        <StandardMap className="!w-full" mapId={mappingDataModal.data} />
      </Modal>
    </div>
  );
}
