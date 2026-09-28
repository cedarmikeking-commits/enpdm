import React, { useMemo } from 'react';
import { Table, Button, Space, Tag, Tooltip } from 'antd';
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import type { StandardRevision } from './types';

interface StandardsTableProps {
  data: StandardRevision[];
  loading: boolean;
  onView: (record: StandardRevision) => void;
  onDeliberate: (record: StandardRevision) => void;
}

export const StandardsTable: React.FC<StandardsTableProps> = ({
  data,
  loading,
  onView,
  onDeliberate,
}) => {
  const columns = useMemo(
    () => [
      {
        title: '标准文件名称',
        dataIndex: 'careerStandardFileName',
        key: 'careerStandardFileName',
        width: 380,
        fixed: 'left' as const,
        ellipsis: true,
      },
      {
        title: '文件版本',
        dataIndex: 'standardVersion',
        key: 'standardVersion',
        width: 100,
      },
      {
        title: '归属职业领域',
        dataIndex: 'careerName',
        key: 'careerName',
        width: 200,
      },
      {
        title: '文件状态',
        key: 'status',
        width: 150,
        render: () => <Tag color="blue">待专业审议</Tag>,
      },
      {
        title: '提交时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 180,
        render: (date: string) => (date ? new Date(date).toLocaleString('zh-CN') : '-'),
      },
      {
        title: '审议时间',
        key: 'deliberation_time',
        width: 180,
        render: () => <span className="text-gray-400">-</span>,
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right' as const,
        render: (_: any, record: StandardRevision) => (
          <Space size="small">
            <Tooltip
              title="查看详情"
              placement="top"
              styles={{
                body: {
                  backgroundColor: '#1f2937',
                  color: 'white',
                  fontSize: '13px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <Button
                type="text"
                icon={<EyeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />}
                onClick={() => onView(record)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  padding: 0,
                }}
              />
            </Tooltip>
            <Tooltip
              title="进行审议"
              placement="top"
              overlayInnerStyle={{
                backgroundColor: '#1f2937',
                color: 'white',
                fontSize: '13px',
                padding: '6px 10px',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Button
                type="text"
                icon={<FileTextOutlined style={{ fontSize: '18px', color: '#52c41a' }} />}
                onClick={() => onDeliberate(record)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  padding: 0,
                }}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [onView, onDeliberate]
  );

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1400 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
    />
  );
};

// 使用 React.memo 避免不必要的重渲染
export default React.memo(StandardsTable);
