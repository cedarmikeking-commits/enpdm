import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, message, Modal, Descriptions, Typography, Divider, Tabs, Breadcrumb, Form, Input, DatePicker, Select, Row, Col, Pagination, Tooltip } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, HomeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
//import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';
import { getcareerStandardAuditDetailPageByIndustry, getcareerStandardAuditDetailPageByInternal, getPageByIndustry, getPageByInternal } from '@/api/standards/index2';
import { CareerOptionList } from '@/api/standards/dataArray';
import { RangePickerProps } from 'antd/es/date-picker';
import { useCareerTree } from '@/hooks/useCareerTree';

const { Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;



interface SearchFilters {
  careerStandardNameLike?: string;
  careerId?: string;
  auditDateBegin?: string;
  auditDateEnd?: string;
}



const ReviewRecords: React.FC = () => {
  const { getCareerTree, getParent } = useCareerTree();
  const [internalRecords, setInternalRecords] = useState<any[]>([]);
  const [expertRecords, setExpertRecords] = useState<any[]>([]);
  const [filteredInternalRecords, setFilteredInternalRecords] = useState<any[]>([]);
  const [filteredExpertRecords, setFilteredExpertRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInternalRecord, setSelectedInternalRecord] = useState<any | null>(null);
  const [selectedExpertRecord, setSelectedExpertRecord] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('internal');
  const [searchFilters, setSearchFilters] = useState<any>({});
  const [domains, setDomains] = useState<any[]>([]);
  const [form] = Form.useForm();

  const [totalNum, setTotalNum] = useState<any>(0);

  const [pagination, setPagination] = useState<{ size: number, current: number }>({ size: 10, current: 1 });
  const [query, setQuery] = useState<SearchFilters>({});

  const [professionalDomains] = useState<any[]>(() => {
    let domains: any[] = [];
    getCareerTree().map(firstNote => {
      firstNote.children?.map(secondNote => {
        secondNote.children?.map(thirdNote => domains.push(thirdNote));
      })
    });
    return domains;
  });

  useEffect(() => {
    loadRecords(activeTab);
  }, [pagination, activeTab, query]);





  const loadRecords = async (activeTab: string) => {
    setLoading(true);
    try {
      if (activeTab === 'internal') {
        getcareerStandardAuditDetailPageByInternal({
          ...query,
          ...pagination,

        }).then(data => {
          setInternalRecords(data);
          setFilteredInternalRecords(data.records)
          setTotalNum(data.total)
        })

      } else if (activeTab === 'expert') {

        getcareerStandardAuditDetailPageByIndustry({
          ...query,
          ...pagination,

        }).then(data => {
          setExpertRecords(data);
          setFilteredExpertRecords(data.records);
          setTotalNum(data.total)
        })
      }
    } catch (error: any) {
      console.error('Load records error:', error);
      message.error('加载审查记录失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };



  const handleSearch = (values: any) => {
    loadRecords(activeTab);
  };

  const handleReset = () => {
    form.resetFields();
    setQuery({});
    setPagination({ size: 10, current: 1 })
  };

  const handleViewInternal = (record: any) => {
    setSelectedInternalRecord(record);
    setSelectedExpertRecord(null);
    setViewModalVisible(true);
  };

  const handleViewExpert = (record: any) => {
    setSelectedExpertRecord(record);
    setSelectedInternalRecord(null);
    setViewModalVisible(true);
  };

  const getStatusConfig = (auditStatus: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      1: { color: 'success', icon: <CheckCircleOutlined />, text: '通过' },
      2: { color: 'error', icon: <CloseCircleOutlined />, text: '未通过' },
    };
    return config[auditStatus] || { color: 'default', icon: null, text: auditStatus };
  };

  // 根据条件查询
  const handleQueryChange = (obj: Record<any, any>) => {
    setQuery((prev) => ({ ...prev, ...obj }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }

  const internalColumns: ColumnsType<any> = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '标准名称',
      key: 'careerStandardFileName',
      width: 360,
      ellipsis: true,
      render: (_: any, record: any) => (
        <Text strong>{record.careerStandardFileName || '未知标准'}</Text>
      )
    },
    {
      title: '版本',
      key: 'standardVersion',
      width: 100,
      align: 'center',
      render: (_: any, record: any) => (
        <Tag color="blue">{record.standardVersion || '-'}</Tag>
      )
    },
    {
      title: '职业领域',
      key: 'careerName',
      width: 150,
      render: (_: any, record: any) => (
        <Tag color="cyan">
          {record?.careerName || '未知领域'}
        </Tag>
      )
    },
    {
      title: '审查人',
      dataIndex: 'auditUserName',
      key: 'auditUserName',
      width: 120,
      render: (text: string) => <Text>{text || '-'}</Text>
    },
    {
      title: '审查意见',
      dataIndex: 'auditReason',
      key: 'auditReason',
      width: 200,
      ellipsis: true,
      render: (text: string) => <Text ellipsis>{text || '-'}</Text>
    },
    {
      title: '审查状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      width: 120,
      align: 'center',
      render: (auditStatus: string) => {
        const { color, icon, text } = getStatusConfig(auditStatus);
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: '审查时间',
      dataIndex: 'auditDate',
      key: 'auditDate',
      width: 170,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip
            title="查看详情"
            placement="top"
            overlayInnerStyle={{
              backgroundColor: '#1f2937',
              color: 'white',
              fontSize: '13px',
              padding: '6px 10px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewInternal(record)}
            >

            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  const expertColumns: ColumnsType<any> = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '标准名称',
      key: 'careerStandardFileName',
      width: 320,
      ellipsis: true,
      render: (_: any, record: any) => {
        const standardName = record.careerStandardFileName || '未知标准';
        return <Text strong>{standardName}</Text>;
      }
    },
    {
      title: '版本',
      key: 'standardVersion',
      width: 100,
      align: 'center',
      render: (_: any, record: any) => {
        const standardVersion = record.standardVersion || '-';
        return <Tag color="blue">{standardVersion}</Tag>;
      }
    },
    {
      title: '职业领域',
      key: 'careerName',
      width: 150,
      render: (_: any, record: any) => {
        //const categoryName = record.standard_revisions?.standard_documents?.industry_categories?.name || record.standard_documents?.industry_categories?.name || '未知领域';
        return <Tag color="cyan">{record.careerName}</Tag>;
      }
    },
    {
      title: '专家姓名',
      dataIndex: 'auditUserName',
      key: 'auditUserName',
      width: 120,
      render: (text: string) => <Text>{text || '-'}</Text>
    },
    {
      title: '审查意见',
      dataIndex: 'auditReason',
      key: 'auditReason',
      width: 200,
      ellipsis: true,
      render: (text: string) => <Text ellipsis>{text || '-'}</Text>
    },
    {
      title: '审查状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      width: 120,
      align: 'center',
      render: (auditStatus: string) => {
        const { color, icon, text } = getStatusConfig(auditStatus);
        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      }
    },
    {
      title: '审查时间',
      dataIndex: 'auditDate',
      key: 'auditDate',
      width: 170,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip
            title="查看详情"
            placement="top"
            overlayInnerStyle={{
              backgroundColor: '#1f2937',
              color: 'white',
              fontSize: '13px',
              padding: '6px 10px',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewExpert(record)}
            >
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];
  const handleDateChange: RangePickerProps['onChange'] = (dates, dateStrings) => {
    if (dates) {
      const [startDate, endDate] = dates;
      const [startDateString, endDateString] = dateStrings;

      handleQueryChange({ auditDateBegin: dayjs(startDateString).format('YYYY-MM-DD HH:mm:ss'), auditDateEnd: dayjs(endDateString).format('YYYY-MM-DD HH:mm:ss') })
    }
  };


  return (
    <div className="space-y-6">
      <Breadcrumb
        style={{ marginBottom: '24px' }}
        items={[
          {
            title: (
              <span>
                <HomeOutlined /> 首页
              </span>
            ),
          },
          { title: '标准审查' },
          { title: '审查记录' },
        ]}
      />

      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <CheckCircleOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold">审查记录</div>
              <div className="text-sm text-gray-500 font-normal">
                查看所有标准的审查历史记录
              </div>
            </div>
          </div>
        }
      >
        <Form
          form={form}
          onFinish={handleSearch}
          className="mb-6"
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="标准名称" name="standardName">
                <Input placeholder="请输入标准名称" allowClear onChange={(e) => handleQueryChange({ careerStandardNameLike: e.target.value })} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="职业领域" name="careerName">
                <Select
                  placeholder="请选择职业领域"
                  allowClear
                  showSearch
                  onChange={(v) => { handleQueryChange({ careerId: v }) }}
                >
                  <Select.Option value={null}>全部领域</Select.Option>
                  {professionalDomains.map(domain => (
                    <Select.Option key={domain.id} value={domain.id}>
                      {domain.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="审核时间" name="dateRange">
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label=" ">
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="内部审查记录" key="internal">
            <Table
              columns={internalColumns}
              dataSource={filteredInternalRecords}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1500 }}
            />
            {/* 分页 */}
            <div className="px-2 py-4 border-t border-slate-200 mt-2 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                共 {totalNum} 条记录
              </div>
              <div className="flex items-center space-x-2">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.size}
                  total={totalNum}
                  showLessItems
                  showSizeChanger={false}
                  onChange={(page) => {
                    setPagination((prev) => ({ ...prev, current: page }))
                  }
                  }
                />
              </div>
            </div>
          </TabPane>
          <TabPane tab="行业专家审查记录" key="expert">
            <Table
              columns={expertColumns}
              dataSource={filteredExpertRecords}
              rowKey="id"
              loading={loading}
              pagination={false}
              scroll={{ x: 1500 }}
            />
            {/* 分页 */}
            <div className="px-2 py-4 border-t border-slate-200 mt-2 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                共 {totalNum} 条记录
              </div>
              <div className="flex items-center space-x-2">
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.size}
                  total={totalNum}
                  showLessItems
                  showSizeChanger={false}
                  onChange={(page) => {
                    setPagination((prev) => ({ ...prev, current: page }))
                  }
                  }
                />
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-blue-500" />
            <span>审查记录详情</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedInternalRecord && (
          <div className="space-y-4">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="标准名称" span={2}>
                <Text strong>{selectedInternalRecord.careerStandardFileName || '未知标准'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="版本">
                <Tag color="blue">{selectedInternalRecord.standardVersion || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="职业领域">
                <Tag color="cyan">
                  {selectedInternalRecord.careerName || '未知领域'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审查类型">
                <Tag color="purple">内部审查</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审查人">
                <Text>{selectedInternalRecord.auditUserName || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="审查状态">
                {(() => {
                  const { color, icon, text } = getStatusConfig(selectedInternalRecord.auditStatus);
                  return <Tag color={color} icon={icon}>{text}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="审查时间">
                {selectedInternalRecord.auditDate
                  ? dayjs(selectedInternalRecord.auditDate).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>审查意见</Divider>

            <Card size="small" className="bg-gray-50">
              <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedInternalRecord.auditReason || '无审查意见'}
              </Paragraph>
            </Card>

            <div className="text-xs text-gray-400 text-right">
              记录创建时间：{dayjs(selectedInternalRecord.createTime).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        )}
        {selectedExpertRecord && (
          <div className="space-y-4">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="标准名称" span={2}>
                <Text strong>
                  {selectedExpertRecord.careerStandardFileName ||
                    selectedExpertRecord.careerStandardFileName || '未知标准'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="版本">
                <Tag color="blue">
                  {selectedExpertRecord.standardVersion ||
                    selectedExpertRecord.standardVersion || '-'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="职业领域">
                <Tag color="cyan">
                  {selectedExpertRecord.careerName ||
                    selectedExpertRecord.careerName || '未知领域'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审查类型">
                <Tag color="purple">行业专家审查</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="专家姓名">
                {selectedExpertRecord.auditUserName || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="专家职称">
                {selectedExpertRecord.auditUserTitle || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="所属机构">
                {selectedExpertRecord.auditUserInstitution || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="审查状态">
                {(() => {
                  const { color, icon, text } = getStatusConfig(selectedExpertRecord.auditStatus);
                  return <Tag color={color} icon={icon}>{text}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="审查时间">
                {selectedExpertRecord.auditDate
                  ? dayjs(selectedExpertRecord.auditDate).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>审查意见</Divider>

            <Card size="small" className="bg-gray-50">
              <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedExpertRecord.auditReason || '无审查意见'}
              </Paragraph>
            </Card>

            <div className="text-xs text-gray-400 text-right">
              记录创建时间：{dayjs(selectedExpertRecord.createTime).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewRecords;
