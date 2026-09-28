import { useState } from 'react';
import { Table, Card, Tag, Button, Space, Modal, Descriptions, Typography, Divider } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import {
  getPendingStandards,
  getStandardAudits,
  type AuditListParams,
} from '@/api/standards-evaluation';
import type { CareerStandardAuditDetailVO } from '@/api/standards-evaluation/type.d';

const { Text, Paragraph } = Typography;

const DeliberationRecords = () => {
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CareerStandardAuditDetailVO | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 查询参数
  const queryParams: AuditListParams = {
    current: pagination.current,
    size: pagination.pageSize,
  };

  // 获取审议记录
  const { data: recordsResponse, isLoading } = useQuery({
    queryKey: ['deliberationRecords', queryParams],
    queryFn: () => getStandardAudits(queryParams),
  });

  const records = recordsResponse?.records || [];
  const total = recordsResponse?.total || 0;

  const handleView = (record: CareerStandardAuditDetailVO) => {
    setSelectedRecord(record);
    setViewModalVisible(true);
  };

  // 解析审核打分
  const parseAuditScope = (scopeStr?: string): Array<{ category: string; scope: number }> => {
    if (!scopeStr) return [];
    try {
      return JSON.parse(scopeStr);
    } catch {
      return [];
    }
  };

  // 解析修改建议
  const parseSuggestion = (
    suggestionStr?: string
  ): Array<{ chapter: string; issueFound: string; revSuggestion: string }> => {
    if (!suggestionStr) return [];
    try {
      return JSON.parse(suggestionStr);
    } catch {
      return [];
    }
  };

  const columns: ColumnsType<CareerStandardAuditDetailVO> = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      align: 'left',
      render: (_: any, __: any, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '标准名称',
      dataIndex: 'careerStandardFileName',
      key: 'careerStandardFileName',
      width: 300,
      ellipsis: true,
      render: (text: string) => <Text strong>{text || '未知标准'}</Text>,
    },
    {
      title: '标准编号',
      dataIndex: 'careerStandardFileNo',
      key: 'careerStandardFileNo',
      width: 150,
      render: (text: string) => <Text>{text || '-'}</Text>,
    },
    {
      title: '版本',
      dataIndex: 'standardVersion',
      key: 'standardVersion',
      width: 100,
      align: 'left',
      render: (text: string) => <Tag color="blue">{text || '-'}</Tag>,
    },
    {
      title: '职业领域',
      dataIndex: 'careerName',
      key: 'careerName',
      width: 150,
      render: (text: string) => <Tag color="cyan">{text || '未知领域'}</Tag>,
    },
    {
      title: '审核人',
      dataIndex: 'auditUserName',
      key: 'auditUserName',
      width: 120,
      render: (text: string) => <Text>{text || '-'}</Text>,
    },
    {
      title: '审核环节',
      dataIndex: 'auditStage',
      key: 'auditStage',
      width: 120,
      align: 'left',
      render: (stage: number) => {
        const stageMap: Record<number, { color: string; text: string }> = {
          1: { color: 'blue', text: '内审' },
          2: { color: 'green', text: '行业专家审核' },
          3: { color: 'purple', text: '专业委员会审议' },
        };
        const info = stageMap[stage] || { color: 'default', text: '未知' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '审核时间',
      dataIndex: 'auditDate',
      key: 'auditDate',
      width: 170,
      render: (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '审核结果',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      width: 120,
      align: 'left',
      render: (status: number) => {
        if (status === 1) {
          return (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              通过
            </Tag>
          );
        } else if (status === 2) {
          return (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              未通过
            </Tag>
          );
        }
        return <Tag color="warning">待审核</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: CareerStandardAuditDetailVO) => (
        <Button style={{padding: 0, margin: 0}} type="link" icon={<EyeOutlined />} onClick={() => handleView(record)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
        <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
        <span>/</span>
        <span className="hover:text-blue-600 cursor-pointer transition-colors">标准审议</span>
        <span>/</span>
        <span className="text-blue-600 font-medium">标准审议记录</span>
      </div>

      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <CheckCircleOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold">标准审议记录</div>
              <div className="text-sm text-gray-500 font-normal">查看所有标准的审议历史记录</div>
            </div>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showTotal: (total) => `共 ${total} 条记录`,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize });
            },
          }}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-blue-500" />
            <span>审议记录详情</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="标准名称" span={2}>
                <Text strong>{selectedRecord.careerStandardFileName || '未知标准'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="标准编号">
                {selectedRecord.careerStandardFileNo || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="版本">
                <Tag color="blue">{selectedRecord.standardVersion || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="职业领域" span={2}>
                <Tag color="cyan">{selectedRecord.careerName || '未知领域'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审核环节">
                {selectedRecord.auditStage === 1
                  ? '内审'
                  : selectedRecord.auditStage === 2
                    ? '行业专家审核'
                    : selectedRecord.auditStage === 3
                      ? '专业委员会审议'
                      : '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="审核人">
                {selectedRecord.auditUserName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="职称">
                {selectedRecord.auditUserTitle || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="所在单位">
                {selectedRecord.auditUserInstitution || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="审核结果" span={2}>
                {selectedRecord.auditStatus === 1 ? (
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    通过
                  </Tag>
                ) : selectedRecord.auditStatus === 2 ? (
                  <Tag color="error" icon={<CloseCircleOutlined />}>
                    未通过
                  </Tag>
                ) : (
                  <Tag color="warning">待审核</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="审核日期" span={2}>
                {selectedRecord.auditDate
                  ? new Date(selectedRecord.auditDate).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* 审核打分 */}
            {selectedRecord.auditScope && parseAuditScope(selectedRecord.auditScope).length > 0 && (
              <>
                <Divider>审核打分</Divider>
                <Card size="small" className="bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    {parseAuditScope(selectedRecord.auditScope).map((score, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-white rounded"
                      >
                        <Text>{score.category}</Text>
                        <Text strong className="text-blue-600">
                          {score.scope} 分
                        </Text>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* 审核意见 */}
            {selectedRecord.auditReason && (
              <>
                <Divider>审核意见</Divider>
                <Card size="small" className="bg-blue-50">
                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {selectedRecord.auditReason}
                  </Paragraph>
                </Card>
              </>
            )}

            {/* 修改建议 */}
            {selectedRecord.suggestion && parseSuggestion(selectedRecord.suggestion).length > 0 && (
              <>
                <Divider>修改建议</Divider>
                <div className="space-y-2">
                  {parseSuggestion(selectedRecord.suggestion).map((sug, idx) => (
                    <Card key={idx} size="small" className="bg-orange-50">
                      <div className="mb-2">
                        <Tag color="orange">{sug.chapter}</Tag>
                      </div>
                      <div className="text-sm space-y-1">
                        {sug.issueFound && (
                          <div>
                            <Text type="secondary">问题：</Text>
                            <Text>{sug.issueFound}</Text>
                          </div>
                        )}
                        <div>
                          <Text type="secondary">建议：</Text>
                          <Text>{sug.revSuggestion}</Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <div className="text-xs text-gray-400 text-right">
              记录创建时间：
              {selectedRecord.createTime
                ? new Date(selectedRecord.createTime).toLocaleString('zh-CN')
                : '-'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DeliberationRecords;
