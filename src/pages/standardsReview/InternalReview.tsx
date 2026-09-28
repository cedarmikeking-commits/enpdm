import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Rate, message, Space, Tag, Descriptions, Divider, Select, Row, Col, Statistic, Typography, Tabs, Tooltip, Popover, Timeline, Pagination } from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileSearchOutlined,
  SearchOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  ZoomInOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { getCareerstandardAudit, getCareerstandardDetail, getInternalAuditStatistics, getPageByInternal, postResourceGetBylds } from '@/api/standards/index2';
import { ColumnsType } from 'antd/es/table';
import StandardMap from '@/components/careerStandardMap';
import { useCareerTree } from '@/hooks/useCareerTree';
import RichTextRender from '@/components/richEditor/RichTextRender';

const { TextArea } = Input;
const { Search } = Input;



interface MappingRow {
  id: string;
  first_dimension: string;
  first_dimension_code?: string;
  second_dimension: string;
  second_dimension_code?: string;
  third_dimension: string;
  third_dimension_code?: string;
  concept_definition: string;
  ivrl1_description: string;
  ivrl2_description: string;
  ivrl3_description: string;
  ivrl4_description: string;
  sort_order: number;
}



export default function any() {
  const { getCareerTree, getParent } = useCareerTree();
  const [documents, setDocuments] = useState<any>();
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [form] = Form.useForm();
  const [selectedDomain, setSelectedDomain] = useState<any>();

  const [statistics, setStatistics] = useState({
    internalAuditTotalNum: 0,
    underReviewNum: 0,
    reviewNoPassNum: 0,
    reviewPassNum: 0
  });
  const [totalNum, setTotalNum] = useState<any>(0);

  const [pagination, setPagination] = useState<{ size: number, current: number }>({ size: 10, current: 1 });
  const [query, setQuery] = useState<{ keyword: string, careerId: any | null }>({ keyword: '', careerId: null, });
  const [appendixAttach, setAppendixAttach] = useState<any>([]);

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
    fetchDocuments();
  }, [pagination]);



  const fetchDocuments = async () => {
    setLoading(true);
    getPageByInternal({
      ...query,
      ...pagination,

    }).then(data => {
      setDocuments(data);
      setFilteredDocuments(data.records)
      setTotalNum(data.total)
    })
    //统计
    getInternalAuditStatistics({})
      .then(data => {
        setStatistics(data);
      })

    setLoading(false);
  };

  const handleView = async (record: any) => {

    getCareerstandardDetail({
      id: record.id
    }).then(data => {
      setSelectedDoc(data);

      if (data.appendixAttach && data.appendixAttach.split(',').length > 0) {
        postResourceGetBylds(
          [...data.appendixAttach.split(',')]
        ).then(data => {
          setLoading(true);
          const rs3 = data.filter((a: any) => record.appendixAttach.includes(a.id));
          setAppendixAttach(rs3);
          setLoading(false);
        }).catch((error: any) => {
          message.error(error.response.data.msg);
        }).finally(() => {
          setLoading(false);
        });

      }

    })

    setViewMode(true);
  };

  //审查
  const handleReview = (record: any) => {
    setViewMode(false)
    setSelectedDoc(record);
    form.resetFields();
    setReviewModalVisible(true);
  };



  const handleSubmitReview = async () => {
    try {
      const values = await form.validateFields();
      const currentModel = {
        careerStandardId: selectedDoc.id,
        auditStatus: values.auditStatus,
        auditStage: 1,
        auditReason: values.auditReason,
        auditUserName: values.auditUserName,
        auditScope: JSON.stringify([
          { category: '科学性', scope: values.scientific_score },
          { category: '前瞻性', scope: values.forward_looking_score },
          { category: '完整性', scope: values.completeness_score },
          { category: '可操作性', scope: values.operability_score },
        ])

      }
      getCareerstandardAudit(currentModel).then(() => {
        message.success('审查提交成功');

      }).catch((error: any) => {
        message.error(error.response.data.msg);
      }).finally(() => {
        setLoading(false);
      });
      setReviewModalVisible(false);
      fetchDocuments();
    } catch (error) {
      message.error('提交审查失败');
    }
  };



  const columns: ColumnsType<any> = [
    {
      title: '标准文件名称',
      dataIndex: 'careerStandardFileName',
      key: 'careerStandardFileName',
      width: 420,
      fixed: 'left' as const,
    },
    {
      title: '文件版本',
      dataIndex: 'standardVersion',
      key: 'standardVersion',
      width: 120,
    },
    {
      title: '职业领域',
      dataIndex: 'careerName',
      key: 'careerName',
      width: 180,

    },
    {
      title: '提交时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '内审状态',
      key: 'searchStatusTitle',
      dataIndex: 'searchStatusTitle',
      width: 130,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_: any, record: any) => {
        return (
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
                type="text"
                icon={<EyeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />}
                onClick={() => handleView(record)}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              />
            </Tooltip>

            <Tooltip
              title="审查"
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
                type="text"
                icon={<FileTextOutlined style={{ fontSize: '18px', color: '#1890ff' }} />}
                onClick={() => handleReview(record)}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              />
            </Tooltip>

          </Space>
        );
      },
    },
  ];

  // 根据条件查询
  const handleQueryChange = (obj: Record<any, any>) => {
    setQuery((prev) => ({ ...prev, ...obj }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }

  // 如果是查看模式，显示详情页
  if (viewMode && selectedDoc) {
    return (
      <div className="bg-gray-50">
        {/* 顶部导航栏 */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm -mx-6 -mt-6 px-4 py-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => setViewMode(false)}
                type="text"
                size="large"
              >
                返回列表
              </Button>
            </div>

            {/* <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleReview(selectedDoc)}
              size="large"
            >
              提交到行业专家审查
            </Button> */}

          </div>
        </div>

        {/* 主内容区 */}
        <div className="px-4 py-4">
          <Tabs
            defaultActiveKey="basic"
            size="large"
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: (
                  <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">基本信息</div>
                      <Descriptions bordered column={2}>
                        <Descriptions.Item label="标准文件名称" span={2}>
                          {selectedDoc.careerStandardFileName}
                        </Descriptions.Item>
                        <Descriptions.Item label="文件版本">
                          {selectedDoc.standardVersion}
                        </Descriptions.Item>
                        <Descriptions.Item label="归属职业领域">
                          {selectedDoc.careerName}
                        </Descriptions.Item>
                        <Descriptions.Item label="提交时间">
                          {new Date(selectedDoc.updateTime).toLocaleString('zh-CN')}
                        </Descriptions.Item>
                        <Descriptions.Item label="撰写人">
                          系统管理员
                        </Descriptions.Item>
                      </Descriptions>
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">引言</div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                        {selectedDoc.preface || '暂无内容'}
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <Descriptions bordered column={1}>
                        <Descriptions.Item label="核心目的">
                          {selectedDoc.corePurpose || '暂无'}
                        </Descriptions.Item>
                        <Descriptions.Item label="适用范围">
                          {selectedDoc.scope || '暂无'}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">术语定义</div>
                      {selectedDoc.careerStandardTermList && selectedDoc.careerStandardTermList.length > 0 ? (
                        <Descriptions bordered column={1}>
                          {selectedDoc.careerStandardTermList.map((term: any, index: number) => (
                            <Descriptions.Item label={term.termName || `术语 ${index + 1}`} key={index}>
                              {term.termDefinition || '暂无定义'}
                            </Descriptions.Item>
                          ))}
                        </Descriptions>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-center">
                          暂无术语定义
                        </div>
                      )}
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">标准正文</div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
                        {/* {selectedDoc.overview || '暂无内容'} */}
                              <RichTextRender content={selectedDoc.overview || '暂无内容'} />
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">专家论证意见</div>
                      {selectedDoc.appendixAttach && appendixAttach ? (
                        <div className="space-y-3">
                          {appendixAttach.map((file: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 mb-1">
                                    专家论证意见 {String.fromCharCode(65 + index)}:<a href={file.signUrl}> {file.originalName || `专家论证意见 ${index + 1}`}</a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-500 text-center">
                          暂无专家论证意见
                        </div>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: 'mapping',
                label: '能力分级表内容',
                children: (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <StandardMap mapId={selectedDoc.careerStandardMapId} />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* 面包屑导航 */}
      <div className="flex items-center space-x-2 text-gray-500">
        <HomeOutlined className="text-base" />
        <span className="hover:text-gray-700 cursor-pointer">首页</span>
        <span className="text-gray-400">/</span>
        <span className="hover:text-gray-700 cursor-pointer">标准审查</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">研制团队核查</span>
      </div>

      <div style={{ padding: '24px' }}>
        {/* 统计卡片区域 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="hover:shadow-md transition-all" style={{ border: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>审查总数</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000' }}>{statistics.internalAuditTotalNum}</div>
                </div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileSearchOutlined style={{ fontSize: '32px', color: '#7b1fa2' }} />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="hover:shadow-md transition-all" style={{ border: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>待内审</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000' }}>{statistics.underReviewNum}</div>
                </div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ClockCircleOutlined style={{ fontSize: '32px', color: '#f57c00' }} />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="hover:shadow-md transition-all" style={{ border: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>已通过</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000' }}>{statistics.reviewPassNum}</div>
                </div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircleOutlined style={{ fontSize: '32px', color: '#388e3c' }} />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="hover:shadow-md transition-all" style={{ border: '1px solid #e8e8e8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>未通过</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000' }}>{statistics.reviewNoPassNum}</div>
                </div>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #fcdfdfea 0%, #ffcdd2 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CloseOutlined style={{ fontSize: '32px', color: '#d32f2f' }} />
                </div>
              </div>
            </Card>
          </Col>

        </Row>

        {/* 搜索和筛选区域 */}
        <Card bordered={false} style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} md={12} lg={8}>
              <Search
                placeholder="搜索标准名称或版本"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                //onSearch={setSearchText}
                onChange={(e) => handleQueryChange({ keyword: e.target.value })}
              />
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Select
                size="large"
                placeholder="选择职业领域"
                style={{ width: '100%' }}
                value={selectedDomain}
                onChange={(v) => { setSelectedDomain(v); handleQueryChange({ careerId: v }) }}
              >
                <Select.Option value={null}>全部领域</Select.Option>
                {professionalDomains.map(domain => (
                  <Select.Option key={domain.id} value={domain.id}>
                    {domain.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        {/* 标准列表 */}
        <Card
          bordered={false}
          title={
            <Space>
              <FileSearchOutlined style={{ color: '#1890ff' }} />
              <span>待审查标准列表</span>
              {documents && documents.total !== totalNum && (
                <Tag color="blue">
                  筛选结果: {documents.total} / {totalNum}
                </Tag>
              )}
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={filteredDocuments}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 1000 }}
          />
          {/* 分页 */}
          <div className="px-2 py-4 border-t border-slate-200 mt-2 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              共 {documents?.total} 条记录
            </div>
            <div className="flex items-center space-x-2">
              <Pagination
                current={pagination.current}
                pageSize={pagination.size}
                total={documents?.total || 0}
                showLessItems
                showSizeChanger={false}
                onChange={(page) => {
                  setPagination((prev) => ({ ...prev, current: page }))
                }
                }
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 审查弹窗 */}
      <Modal
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={handleSubmitReview}
        width={800}
        okText="提交审查"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="审查人姓名"
            name="auditUserName"
            rules={[{ required: true, message: '请输入审查人姓名' }]}
          >
            <Input placeholder="请输入审查人姓名" />
          </Form.Item>

          <Divider>评分标准</Divider>

          <Form.Item
            label="科学性（标准内容是否符合行业发展规律与技术技能演进趋势）"
            name="scientific_score"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            label="前瞻性（标准是否能适应未来技术发展和职业技能需求的变化）"
            name="forward_looking_score"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            label="完整性（是否全面覆盖了本职业领域在相应 IVRL 等级下的核心能力要求）"
            name="completeness_score"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            label="可操作性（标准描述是否清晰、具体，是否便于后续的课程开发、教学组织实施和学习成果的评价与认定）"
            name="operability_score"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            label="审查意见"
            name="auditReason"
            rules={[{ required: true, message: '请输入审查意见' }]}
          >
            <TextArea rows={6} placeholder="请输入详细的审查意见，包括具体的问题和建议" />
          </Form.Item>

          <Form.Item
            label="审查结果"
            name="auditStatus"
            rules={[{ required: true, message: '请选择审查结果' }]}
          >
            <Select placeholder="请选择审查结果">
              <Select.Option value={2}>
                <Space>
                  <CheckOutlined style={{ color: '#52c41a' }} />
                  <span>通过（提交行业专家审查）</span>
                </Space>
              </Select.Option>
              <Select.Option value={3}>
                <Space>
                  <CloseOutlined style={{ color: '#ff4d4f' }} />
                  <span>不通过（需要修订）</span>
                </Space>
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>


    </div>
  );
}
