import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, message, Space, Tag, Descriptions, Divider, Tabs, Alert, Timeline, List, Row, Col, Select, Statistic, Tooltip, Pagination } from 'antd';
import { EyeOutlined, EditOutlined, SaveOutlined, SendOutlined, HistoryOutlined, HomeOutlined, SearchOutlined, FileTextOutlined, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabase';
// import PublicationSubmission from './PublicationSubmission';
// import StandardRevisionDetail from './StandardRevisionDetail';
import StandardRevisionEdit from '@/components/StandardRevisionEdit';
import { getCareerStandardReviseDetail, getCareerStandardReviseList, postResourceGetBylds } from '@/api/standards/index2';
import { CareerOptionList } from '@/api/standards/dataArray';
import StandardRevisionDetail from './StandardRevisionDetail';

const { TextArea } = Input;
const { TabPane } = Tabs;

interface StandardDocument {
  id: string;
  standard_name: string;
  version: string;
  domain_id: string;
  introduction: string;
  basic_info: any;
  terms_definitions: any[];
  standard_content: any;
  appendix_files: any[];
  status: string;
  created_at: string;
  revision_source?: string;
  mapping_document_id?: string;
}

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

interface Review {
  id: string;
  reviewer_name?: string;
  expert_name?: string;
  expert_title?: string;
  expert_organization?: string;
  review_date: string;
  review_comments: string;
  suggestions?: any[];
  status: string;
  type: 'internal' | 'expert';
}

interface Revision {
  id: string;
  revision_description: string;
  revised_by: string;
  revision_date: string;
  status: string;
}

export default function StandardRevision() {
  const [documents, setDocuments] = useState<any>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [revisionModalVisible, setRevisionModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [form] = Form.useForm();
  const [domains, setDomains] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<number>();
  const [allExpertReviews, setAllExpertReviews] = useState<any[]>([]);
  const [allDeliberationSubmissions, setAllDeliberationSubmissions] = useState<any[]>([]);
  const [showSubmissionPage, setShowSubmissionPage] = useState(false);
  // const [statistics, setStatistics] = useState({
  //   pending: 0,
  //   revising: 0,
  //   completed: 0,
  //   total: 0
  // });
  const [revisionHistoryVisible, setRevisionHistoryVisible] = useState(false);
  const [revisionHistory, setRevisionHistory] = useState<any[]>([]);
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([]);
  const [showRevisionEdit, setShowRevisionEdit] = useState(false);
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ size: number, current: number }>({ size: 10, current: 1 });
  const [query, setQuery] = useState<{ keyword: string, careerId: any | null }>({ keyword: '', careerId: null, });
  const [appendixAttach, setAppendixAttach] = useState<any>([]);

  useEffect(() => {
    fetchDomains();
    fetchDocuments();
  }, [pagination]);



  const fetchDomains = async () => {
    setDomains(CareerOptionList);

  };

  const fetchDocuments = async () => {
    setLoading(true);
    setLoading(true);
    getCareerStandardReviseList({
      ...query,
      ...pagination,
    }).then(data => {
      setDocuments(data);
      setFilteredDocuments(data.records)
    })


    setLoading(false);
  };


  // const fetchReviews = async (docId: string) => {
  //   const allReviews: Review[] = [];

  //   // 获取内部审查
  //   const { data: internalData } = await supabase
  //     .from('internal_reviews')
  //     .select('*')
  //     .eq('standard_document_id', docId)
  //     .order('created_at', { ascending: false });

  //   if (internalData) {
  //     allReviews.push(...internalData.map(r => ({ ...r, type: 'internal' as const })));
  //   }

  //   // 获取专家审查
  //   const { data: expertData } = await supabase
  //     .from('expert_reviews')
  //     .select('*')
  //     .eq('standard_document_id', docId)
  //     .order('created_at', { ascending: false });

  //   if (expertData) {
  //     allReviews.push(...expertData.map(r => ({ ...r, type: 'expert' as const })));
  //   }

  //   // 按日期排序
  //   allReviews.sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime());
  //   setReviews(allReviews);
  // };



  const handleView = async (record: any) => {
    getCareerStandardReviseDetail({
      careerStandardId: record.id
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
    }
    )

    setViewMode(true);





  };

  const handleRevision = async (record: StandardDocument) => {
    setSelectedDoc(record);
    setShowRevisionEdit(true);
  };


  // const handleSaveDraft = async () => {
  //   try {
  //     // 保存草稿不验证必填字段，直接获取表单值
  //     const values = form.getFieldsValue();

  //     // 至少需要修订人和修订说明
  //     if (!values.revised_by || !values.revision_description) {
  //       message.warning('请至少填写修订人和修订说明');
  //       return;
  //     }

  //     // 确定修订来源（review_type）
  //     let reviewType = 'internal';
  //     const rejectedReviews = reviews.filter(r => r.status === 'rejected');
  //     if (rejectedReviews.length > 0) {
  //       rejectedReviews.sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime());
  //       reviewType = rejectedReviews[0].type === 'expert' ? 'expert' : 'internal';
  //     } else if (selectedDoc?.status === 'professional_review_rejected') {
  //       reviewType = 'professional';
  //     }

  //     // 更新标准文档状态为修订中
  //     const { error: updateError } = await supabase
  //       .from('standard_documents')
  //       .update({ status: 'revising' })
  //       .eq('id', selectedDoc?.id);

  //     if (updateError) {
  //       console.error('更新文档状态错误:', updateError);
  //       throw updateError;
  //     }

  //     const { error } = await supabase
  //       .from('standard_revisions')
  //       .insert([{
  //         standard_document_id: selectedDoc?.id,
  //         revision_content: {
  //           introduction: values.introduction || '',
  //           basic_info: {
  //             purpose: values.purpose || '',
  //             scope: values.scope || '',
  //           },
  //           standard_content: {
  //             description: values.content_description || '',
  //           },
  //         },
  //         revision_description: values.revision_description,
  //         revised_by: values.revised_by,
  //         status: 'draft',
  //         review_type: reviewType,
  //       }]);

  //     if (error) {
  //       console.error('保存草稿错误:', error);
  //       throw error;
  //     }

  //     message.success('修订草稿保存成功');
  //     setSelectedDoc(null);
  //     form.resetFields();
  //     fetchDocuments();
  //   } catch (error: any) {
  //     console.error('保存草稿失败:', error);
  //     message.error(`保存失败: ${error?.message || '请重试'}`);
  //   }
  // };

  // const handleSubmitRevision = async () => {
  //   try {
  //     const values = await form.validateFields();

  //     // 确定修订来源（review_type）
  //     let reviewType = 'internal';
  //     const rejectedReviews = reviews.filter(r => r.status === 'rejected');
  //     if (rejectedReviews.length > 0) {
  //       rejectedReviews.sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime());
  //       reviewType = rejectedReviews[0].type === 'expert' ? 'expert' : 'internal';
  //     } else if (selectedDoc?.status === 'professional_review_rejected') {
  //       reviewType = 'professional';
  //     }

  //     // 更新标准文档
  //     const { error: updateError } = await supabase
  //       .from('standard_documents')
  //       .update({
  //         introduction: values.introduction,
  //         basic_info: {
  //           purpose: values.purpose,
  //           scope: values.scope,
  //         },
  //         standard_content: {
  //           description: values.content_description,
  //           ability_requirements: selectedDoc?.standard_content?.ability_requirements || [],
  //         },
  //         status: 'submitted', // 重新提交审查
  //       })
  //       .eq('id', selectedDoc?.id);

  //     if (updateError) throw updateError;

  //     // 记录修订
  //     const { error: revisionError } = await supabase
  //       .from('standard_revisions')
  //       .insert([{
  //         standard_document_id: selectedDoc?.id,
  //         revision_content: {
  //           introduction: values.introduction,
  //           basic_info: {
  //             purpose: values.purpose,
  //             scope: values.scope,
  //           },
  //           standard_content: {
  //             description: values.content_description,
  //           },
  //         },
  //         revision_description: values.revision_description,
  //         revised_by: values.revised_by,
  //         status: 'submitted',
  //         review_type: reviewType,
  //       }]);

  //     if (revisionError) throw revisionError;

  //     message.success('修订提交成功，已重新提交审查');
  //     setRevisionModalVisible(false);
  //     fetchDocuments();
  //   } catch (error) {
  //     message.error('提交失败');
  //   }
  // };




  // 根据条件查询
  const handleQueryChange = (obj: Record<any, any>) => {
    setQuery((prev) => ({ ...prev, ...obj }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }

  const columns = [
    {
      title: '标准文件名称',
      dataIndex: 'careerStandardFileName',
      key: 'careerStandardFileName',
      width: 360,
      fixed: 'left' as const,
      ellipsis: true,
    },
    {
      title: '文件版本号',
      dataIndex: 'standardVersion',
      key: 'standardVersion',
      width: 140,
    },
    {
      title: '职业领域',
      dataIndex: 'careerName',
      key: 'careerName',
      width: 180,

    },
    {
      title: '修订来源',
      dataIndex: 'reviseSource',
      key: 'reviseSource',
      width: 150,
      render: (source: string) => {
        let color = 'default';
        if (source === '内部审查') {
          color = 'blue';
        } else if (source === '行业专家审查') {
          color = 'orange';
        } else if (source === '专家委员会审议') {
          color = 'purple';
        }
        return <Tag color={color}>{source}</Tag>;
      },
    },
    {
      title: '文件状态',
      dataIndex: 'searchStatusTitle',
      key: 'searchStatusTitle',
      width: 150,
      render: (_: any, record: any) => {

        return <Tag color="orange">修订中</Tag>;

      },
    },
    {
      title: '最新修订时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: any, record: StandardDocument) => {


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
              title="继续修订"
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
                icon={<EditOutlined style={{ fontSize: '18px', color: '#52c41a' }} />}
                onClick={() => handleRevision(record)}
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


  // 如果显示修订编辑页面
  if (showRevisionEdit && selectedDoc) {
    return (
      <StandardRevisionEdit
        id={selectedDoc.id}
        onBack={() => {
          setShowRevisionEdit(false);
          fetchDocuments();
        }}
      />
    );
  }


  // 如果是查看模式，显示详情页
  if (viewMode && selectedDoc) {
    return (
      <StandardRevisionDetail
        selectedDoc={selectedDoc}
        appendixAttach={appendixAttach}
        onBack={() => setViewMode(false)}
      />
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
        <span className="text-gray-900">标准修订</span>
      </div>


      <div style={{ padding: '24px' }}>
        {/* 主内容区域 */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <EditOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
              <span style={{ fontSize: '18px', fontWeight: 600 }}>标准修订</span>
            </div>
          }
          bordered={false}
          className="shadow-sm"
        >
          <div
            style={{
              marginBottom: '24px',
              padding: '16px',
              background: '#fafafa',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <InfoCircleOutlined style={{ fontSize: '20px', color: '#595959', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#262626', marginBottom: '8px' }}>
                修订说明
              </div>
              <div style={{ fontSize: '14px', color: '#595959', lineHeight: '1.6' }}>
                根据内部审查或行业专家的反馈意见，对标准草案进行修订完善。修订完成后将重新提交审查流程。
              </div>
            </div>
          </div>

          {/* 搜索和筛选区域 */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <Row gutter={16}>
              <Col span={12}>
                <Input
                  placeholder="搜索标准名称或版本号..."
                  prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                  onChange={(e) => handleQueryChange({ keyword: e.target.value })}
                  allowClear
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col span={12}>
                <Select
                  placeholder="选择职业领域"
                  value={selectedDomain}
                  onChange={(v) => { setSelectedDomain(v); handleQueryChange({ careerId: v }) }}
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                >
                  <Select.Option value={null}>全部领域</Select.Option>
                  {domains.map(domain => (
                    <Select.Option key={domain.id} value={domain.value}>
                      {domain.label}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>

          <Table
            columns={columns}
            dataSource={filteredDocuments}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 1200 }}
            className="modern-table"
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

      {/* 修订弹窗
      <Modal
        title="标准修订"
        open={revisionModalVisible}
        onCancel={() => setRevisionModalVisible(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setRevisionModalVisible(false)}>
            取消
          </Button>,
          <Button key="draft" icon={<SaveOutlined />} onClick={handleSaveDraft}>
            保存草稿
          </Button>,
          <Button key="submit" type="primary" icon={<SendOutlined />} onClick={handleSubmitRevision}>
            提交修订
          </Button>,
        ]}
      >
        <div style={{ marginBottom: '16px' }}>
          <Alert
            message="审查意见汇总"
            description={
              <div>
                {reviews.filter(r => r.status === 'rejected').map((review, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <Tag color={review.type === 'internal' ? 'blue' : 'purple'}>
                      {review.type === 'internal' ? '内部审查' : '专家审查'}
                    </Tag>
                    <span>{review.review_comments}</span>
                  </div>
                ))}
              </div>
            }
            type="warning"
            showIcon
            icon={<HistoryOutlined />}
          />
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label="修订人"
            name="revised_by"
            rules={[{ required: true, message: '请输入修订人姓名' }]}
          >
            <Input placeholder="请输入修订人姓名" />
          </Form.Item>

          <Form.Item
            label="修订说明"
            name="revision_description"
            rules={[{ required: true, message: '请输入修订说明' }]}
          >
            <TextArea rows={3} placeholder="请简要说明本次修订的主要内容和依据" />
          </Form.Item>

          <Divider>修订内容</Divider>

          <Form.Item
            label="引言"
            name="introduction"
            rules={[{ required: true, message: '请输入引言' }]}
          >
            <TextArea rows={4} placeholder="请输入引言内容" />
          </Form.Item>

          <Form.Item
            label="目的"
            name="purpose"
            rules={[{ required: true, message: '请输入目的' }]}
          >
            <TextArea rows={3} placeholder="请输入标准制定的目的" />
          </Form.Item>

          <Form.Item
            label="范围"
            name="scope"
            rules={[{ required: true, message: '请输入范围' }]}
          >
            <TextArea rows={3} placeholder="请输入标准适用的范围" />
          </Form.Item>

          <Form.Item
            label="标准正文（总述）"
            name="content_description"
            rules={[{ required: true, message: '请输入标准正文' }]}
          >
            <TextArea rows={6} placeholder="请输入标准正文内容" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={revisionHistoryVisible}
        onCancel={() => setRevisionHistoryVisible(false)}
        footer={null}
        width={1000}
        title={
          <div className="text-lg font-semibold">
            行业专家审查反馈 - {selectedDoc?.standard_name}
          </div>
        }
      >
        {revisionHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            暂无修订记录
          </div>
        ) : (
          <Timeline
            mode="left"
            items={revisionHistory.map((record) => {
              const getTypeLabel = () => {
                switch (record.type) {
                  case 'internal':
                    return { text: '内部审查', color: 'blue' };
                  case 'expert':
                    return { text: '行业专家审查', color: 'purple' };
                  case 'deliberation':
                    return { text: '专家委员会审议', color: 'orange' };
                  default:
                    return { text: '未知', color: 'gray' };
                }
              };

              const typeInfo = getTypeLabel();

              return {
                color: 'red',
                dot: <InfoCircleOutlined style={{ fontSize: '16px' }} />,
                label: (
                  <div className="text-sm text-gray-500">
                    {new Date(record.date).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                ),
                children: (
                  <Card
                    size="small"
                    className="shadow-sm"
                    style={{ marginBottom: '8px' }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Space size="small">
                          <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
                          {record.reviewer && (
                            <>
                              <span className="text-gray-500 text-sm">审查人：</span>
                              <span className="font-medium text-gray-900 text-sm">{record.reviewer}</span>
                              {record.title && <span className="text-gray-500 text-sm">{record.title}</span>}
                              {record.organization && <span className="text-gray-400 text-sm">{record.organization}</span>}
                            </>
                          )}
                        </Space>
                        <Tag color="red">需要修订</Tag>
                      </div>

                      {record.scores && (
                        <>
                          <div className="mb-2">
                            <div className="text-xs text-gray-500 mb-2">评分详情</div>
                            <Row gutter={12}>
                              <Col span={6}>
                                <div className="border border-gray-200 rounded p-2 text-center">
                                  <div className="text-xs text-gray-500 mb-1">科学性</div>
                                  <div className="text-xl font-semibold text-gray-900">{record.scores.scientific}</div>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div className="border border-gray-200 rounded p-2 text-center">
                                  <div className="text-xs text-gray-500 mb-1">前瞻性</div>
                                  <div className="text-xl font-semibold text-gray-900">{record.scores.forwardLooking}</div>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div className="border border-gray-200 rounded p-2 text-center">
                                  <div className="text-xs text-gray-500 mb-1">完整性</div>
                                  <div className="text-xl font-semibold text-gray-900">{record.scores.completeness}</div>
                                </div>
                              </Col>
                              <Col span={6}>
                                <div className="border border-gray-200 rounded p-2 text-center">
                                  <div className="text-xs text-gray-500 mb-1">可操作性</div>
                                  <div className="text-xl font-semibold text-gray-900">{record.scores.operability}</div>
                                </div>
                              </Col>
                            </Row>
                          </div>
                          <div className="mb-3 flex items-center justify-center py-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-500 mr-2">综合评分：</span>
                            <span className="text-2xl font-bold text-gray-900">{record.scores.overall.toFixed(1)}</span>
                            <span className="text-sm text-gray-400 ml-1">/ 5.0</span>
                          </div>
                        </>
                      )}

                      {record.votingResults && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-2">投票结果</div>
                          <Row gutter={12}>
                            <Col span={8}>
                              <div className="border border-gray-200 rounded p-2 text-center">
                                <div className="text-xs text-gray-500 mb-1">赞成</div>
                                <div className="text-lg font-semibold text-gray-900">{record.votingResults.agree || 0}</div>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div className="border border-gray-200 rounded p-2 text-center">
                                <div className="text-xs text-gray-500 mb-1">反对</div>
                                <div className="text-lg font-semibold text-gray-900">{record.votingResults.disagree || 0}</div>
                              </div>
                            </Col>
                            <Col span={8}>
                              <div className="border border-gray-200 rounded p-2 text-center">
                                <div className="text-xs text-gray-500 mb-1">弃权</div>
                                <div className="text-lg font-semibold text-gray-900">{record.votingResults.abstain || 0}</div>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}

                      <div>
                        <div className="text-xs text-gray-500 mb-2">修订意见</div>
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-gray-700 leading-relaxed text-sm" style={{ whiteSpace: 'pre-wrap' }}>
                          {record.comments}
                        </div>
                      </div>
                    </div>
                  </Card>
                ),
              };
            })}
          />
        )}
      </Modal> */}
    </div>
  );
}
