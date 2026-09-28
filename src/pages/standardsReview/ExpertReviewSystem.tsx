import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Rate, message, Space, Tag, Descriptions, Divider, Select, List, Row, Col, Tabs, Typography, Tooltip, Popover, Pagination } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, FileTextOutlined, PlusOutlined, DeleteOutlined, HomeOutlined, SearchOutlined, FileSearchOutlined, ClockCircleOutlined, ArrowLeftOutlined, ZoomInOutlined, InfoCircleOutlined } from '@ant-design/icons';
// import { supabase } from '../lib/supabase';
import { getCareerstandardAudit, getCareerstandardDetail, getExpertCommitteeReviewStatistics, getExpertReviewStatistics, getPageByIndustry, postResourceGetBylds } from '@/api/standards/index2';
import StandardMap from '@/components/careerStandardMap';
import { useCareerTree } from '@/hooks/useCareerTree';
import RichTextRender from '@/components/richEditor/RichTextRender';
const { TextArea } = Input;
const { Title } = Typography;



interface Suggestion {
  chapter: string;
  issueFound: string;
  revSuggestion: string;
}

export default function ExpertReviewSystem() {
  const { getCareerTree, getParent } = useCareerTree();
  const [documents, setDocuments] = useState<any>();
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [internalReviews, setInternalReviews] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>();
  const [statistics, setStatistics] = useState({
    expertReviewTotalNum: 0,
    underReviewNum: 0,
    reviewPassNum: 0,
    reviewNoPassNum: 0
  });

  const [reviewStatus, setReviewStatus] = useState<number | null>(null);

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
    getPageByIndustry({
      ...query,
      ...pagination,

    }).then(data => {
      setDocuments(data);
      setFilteredDocuments(data.records)
    })
    //统计
    getExpertReviewStatistics({})
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
      const rs1 = data.auditDetails.filter((a: any) => a.auditStage == 1);  //内部审查
      const rs2 = data.auditDetails.filter((a: any) => a.auditStage == 2);  //行业专家
      setInternalReviews(rs1);
      setReviews(rs2);
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

    })

    setViewMode(true);
  };

  const handleReview = (record: any) => {
    setSelectedDoc(record);
    form.resetFields();
    setSuggestions([]);
    // setReviewStatus('approved');
    setReviewModalVisible(true);
  };

  const addSuggestion = () => {
    setSuggestions([...suggestions, { chapter: '', issueFound: '', revSuggestion: '' }]);
  };

  const removeSuggestion = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index));
  };

  const updateSuggestion = (index: number, field: keyof Suggestion, value: string) => {
    const newSuggestions = [...suggestions];
    newSuggestions[index][field] = value;
    setSuggestions(newSuggestions);
  };

  //提交审查
  const handleSubmitReview = async () => {
    try {
      const values = await form.validateFields();
      const currentModel = {
        careerStandardId: selectedDoc.id,
        auditStatus: values.auditStatus,
        auditStage: 2,
        auditReason: values.auditReason,
        auditUserName: values.auditUserName,
        auditUserInstitution: values.auditUserInstitution,
        auditUserTitle: values.auditUserTitle,
        suggestion: JSON.stringify(suggestions),
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



  const columns = [
    {
      title: '标准文件名称',
      dataIndex: 'careerStandardFileName',
      key: 'careerStandardFileName',
      width: 300,
      fixed: 'left' as const,
      ellipsis: true,
    },
    {
      title: '版本号',
      dataIndex: 'standardVersion',
      key: 'standardVersion',
      width: 100,
    },
    {
      title: '所属职业领域名称',
      dataIndex: 'careerName',
      key: 'careerName',
      width: 150,

    },
    {
      title: '提交时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '文件状态',
      key: 'searchStatusTitle',
      dataIndex: 'searchStatusTitle',
      width: 140,

    },
    {
      title: '审议时间',
      key: 'auditDate',
      width: 180,
      render: (_: any, record: any) => {
        return new Date(record.auditDate).toLocaleString('zh-CN');
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => {
        // 基于文档当前状态判断是否可以审查
        // 当文档状态为 internal_approved 时，表示可以进行专家审查
        const canReview = record.auditStatus === 1;
        const isApproved = record.auditStatus === 2;

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
              title={isApproved ? '已审查' : canReview ? '专家审查' : '不可审查'}
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
                icon={<FileTextOutlined style={{ fontSize: '18px', color: canReview ? '#52c41a' : '#d9d9d9' }} />}
                onClick={() => handleReview(record)}
                disabled={!canReview}
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
                      <div className="text-lg font-semibold mb-4 text-gray-900">文档信息</div>
                      <Descriptions bordered column={2}>
                        <Descriptions.Item label="标准名称" span={2}>
                          {selectedDoc.careerStandardFileName}
                        </Descriptions.Item>
                        <Descriptions.Item label="版本">
                          {selectedDoc.standardVersion}
                        </Descriptions.Item>
                        <Descriptions.Item label="职业领域">
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
                        <Descriptions.Item label="目的">
                          {selectedDoc?.corePurpose || '暂无'}
                        </Descriptions.Item>
                        <Descriptions.Item label="范围">
                          {selectedDoc?.scope || '暂无'}
                        </Descriptions.Item>
                      </Descriptions>
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">术语定义</div>
                      {selectedDoc.careerStandardTermList && selectedDoc.careerStandardTermList.length > 0 ? (
                        <div className="space-y-3">
                          {selectedDoc.careerStandardTermList.map((term: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="font-medium text-gray-900 mb-2">{term.termName}</div>
                              <div className="text-gray-700">{term.termDefinition}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
                          暂无术语与定义
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
                      {selectedDoc.appendixAttach && appendixAttach > 0 ? (
                        <div className="space-y-2">
                          {appendixAttach.map((file: any, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">专家论证意见 {String.fromCharCode(65 + index)}:<a href={file.signUrl}> {file.originalName || `专家论证意见 ${index + 1}`}</a></div>
                              </div>
                              {/* {file.url && (
                                <Button type="link" href={file.url} target="_blank">
                                  查看
                                </Button>
                              )} */}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
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
              {
                key: 'reviews',
                label: `审查记录 (${internalReviews.length + reviews.length})`,
                children: (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="space-y-8">
                      {/* 内部审查记录部分 */}
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold mr-3">1</div>
                          <Title level={4} style={{ margin: 0 }}>内部审查</Title>
                        </div>
                        {internalReviews.length > 0 ? (
                          <div className="ml-11 space-y-4">
                            {internalReviews.map((review) => (
                              <Card key={review.id} className="shadow-sm border-l-4 border-l-blue-500">
                                <Descriptions column={2} size="small" bordered>
                                  <Descriptions.Item label="审查人">{review.auditUserName}</Descriptions.Item>
                                  <Descriptions.Item label="审查日期">
                                    {new Date(review.auditDate).toLocaleString('zh-CN')}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="审查状态">
                                    <Tag color={review.auditStatus === 2 ? 'green' : review.status === 3 ? 'red' : 'orange'}>
                                      {review.auditStatus === 2 ? '通过' : review.auditStatus === 3 ? '不通过' : '待审核'}
                                    </Tag>
                                  </Descriptions.Item>
                                  <Descriptions.Item label="审查意见" span={2}>
                                    {review.auditReason || '无'}
                                  </Descriptions.Item>
                                </Descriptions>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="ml-11 text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            暂无内部审查记录
                          </div>
                        )}
                      </div>

                      {/* 专家审查记录部分 */}
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold mr-3">2</div>
                          <Title level={4} style={{ margin: 0 }}>行业专家审查</Title>
                        </div>
                        {reviews.length > 0 ? (
                          <div className="ml-11 space-y-4">
                            {reviews.map((review) => (

                              <Card key={review.id} className="shadow-sm border-l-4 border-l-green-500">
                                <Descriptions column={2} size="small" bordered>
                                  <Descriptions.Item label="专家姓名">{review.auditUserName}</Descriptions.Item>
                                  <Descriptions.Item label="职称">{review.auditUserTitle}</Descriptions.Item>
                                  <Descriptions.Item label="工作单位" span={2}>{review.auditUserInstitution}</Descriptions.Item>
                                  <Descriptions.Item label="审查日期" span={2}>
                                    {new Date(review.auditDate).toLocaleString('zh-CN')}
                                  </Descriptions.Item>
                                  <Descriptions.Item label="科学性">{JSON.parse(review.auditScope)[0].scope} 分</Descriptions.Item>
                                  <Descriptions.Item label="前瞻性">{JSON.parse(review.auditScope)[1].scope} 分</Descriptions.Item>
                                  <Descriptions.Item label="完整性">{JSON.parse(review.auditScope)[2].scope} 分</Descriptions.Item>
                                  <Descriptions.Item label="可操作性">{JSON.parse(review.auditScope)[3].scope} 分</Descriptions.Item>
                                  <Descriptions.Item label="总体评分" span={2}>
                                    <Rate disabled value={(JSON.parse(review.auditScope)[0].scope + JSON.parse(review.auditScope)[1].scope + JSON.parse(review.auditScope)[2].scope + JSON.parse(review.auditScope)[3].scope) / 4} />
                                    <span className="ml-2">{(JSON.parse(review.auditScope)[0].scope + JSON.parse(review.auditScope)[1].scope + JSON.parse(review.auditScope)[2].scope + JSON.parse(review.auditScope)[3].scope) / 4} 分</span>
                                  </Descriptions.Item>
                                  <Descriptions.Item label="审查状态">
                                    <Tag color={review.auditStatus === 2 ? 'green' : review.auditStatus === 3 ? 'red' : 'orange'}>
                                      {review.auditStatus === 2 ? '通过' : review.auditStatus === 3 ? '不通过' : '待定'}
                                    </Tag>
                                  </Descriptions.Item>
                                  <Descriptions.Item label="审查意见" span={2}>
                                    {review.auditReason}
                                  </Descriptions.Item>
                                  {review.suggestion && review.suggestion.length > 0 && (
                                    <Descriptions.Item label="修改建议" span={2}>
                                      <div className="space-y-2">
                                        {JSON.parse(review.suggestion).map((sug: Suggestion, idx: number) => (
                                          <Card key={idx} size="small" className="bg-gray-50">
                                            <div><strong>章节：</strong>{sug.chapter}</div>
                                            <div><strong>问题：</strong>{sug.issueFound}</div>
                                            <div><strong>建议：</strong>{sug.revSuggestion}</div>
                                          </Card>
                                        ))}
                                      </div>
                                    </Descriptions.Item>
                                  )}
                                </Descriptions>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="ml-11 text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            暂无专家审查记录
                          </div>
                        )}
                      </div>
                    </div>
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
        <span className="text-gray-900">行业专家审查</span>
      </div>

      {/* 统计区域 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-all" style={{ border: '1px solid #e8e8e8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>审查总数</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#000' }}>{statistics.expertReviewTotalNum}</div>
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
                <FileTextOutlined style={{ fontSize: '32px', color: '#7b1fa2' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="hover:shadow-md transition-all" style={{ border: '1px solid #e8e8e8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>待审查</div>
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
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>审查通过</div>
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
                <CheckOutlined style={{ fontSize: '32px', color: '#388e3c' }} />
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

      {/* 主内容区域 */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <FileSearchOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>行业专家审查</span>
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
              专家审查说明
            </div>
            <div style={{ fontSize: '14px', color: '#595959', lineHeight: '1.6' }}>
              正式邀请本职业领域的资深行业专家、龙头企业技术负责人、经验丰富的技能大师、相关职业院校骨干教师以及潜在的用人单位代表等组成审查专家组，对标准草案进行全面的审查和论证。
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
                //onChange={setSelectedDomain}
                size="large"
                style={{ width: '100%', borderRadius: '8px' }}
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
        </div>

        <Table
          columns={columns}
          dataSource={filteredDocuments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          scroll={{ x: 1400 }}
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

      {/* 专家审查弹窗 */}
      <Modal
        title="行业专家审查"
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          //setReviewStatus('approved');
        }}
        onOk={handleSubmitReview}
        width={900}
        okText={reviewStatus === 3 ? '返回修订' : '提交专业审议'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="专家姓名"
                name="auditUserName"
                rules={[{ required: true, message: '请输入专家姓名' }]}
              >
                <Input placeholder="请输入专家姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="职称"
                name="auditUserTitle"
                rules={[{ required: true, message: '请输入职称' }]}
              >
                <Input placeholder="如：教授、高级工程师" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="所属单位"
                name="auditUserInstitution"
                rules={[{ required: true, message: '请输入所属单位' }]}
              >
                <Input placeholder="请输入所属单位" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>评分标准</Divider>

          <Form.Item
            label="科学性 - 标准内容是否符合行业发展规律与技术技能演进趋势"
            name="scientific_score"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            label="前瞻性 - 标准是否能适应未来技术发展和职业技能需求的变化"
            name="forward_looking_score"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            label="完整性 - 是否全面覆盖了本职业领域在相应 IVRL等级下的核心能力要求"
            name="completeness_score"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            label="可操作性 - 标准描述是否清晰、具体，是否便于后续的课程开发、教学组织实施和学习成果的评价与认定"
            name="operability_score"
            rules={[{ required: true, message: '请评分' }]}
          >
            <Rate />
          </Form.Item>

          <Divider>修改建议（可选）</Divider>

          <div style={{ marginBottom: '16px' }}>
            <Button type="dashed" onClick={addSuggestion} icon={<PlusOutlined />} block>
              添加修改建议
            </Button>
          </div>

          {suggestions.map((suggestion, index) => (
            <Card key={index} size="small" style={{ marginBottom: '12px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="章节（如：引言、术语定义、能力要求等）"
                  value={suggestion.chapter}
                  onChange={(e) => updateSuggestion(index, 'chapter', e.target.value)}
                />
                <Input
                  placeholder="发现的问题"
                  value={suggestion.issueFound}
                  onChange={(e) => updateSuggestion(index, 'issueFound', e.target.value)}
                />
                <Input.TextArea
                  placeholder="修改建议"
                  rows={2}
                  value={suggestion.revSuggestion}
                  onChange={(e) => updateSuggestion(index, 'revSuggestion', e.target.value)}
                />
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeSuggestion(index)}
                >
                  删除
                </Button>
              </Space>
            </Card>
          ))}

          <Form.Item
            label="总体审查意见"
            name="auditReason"
            rules={[{ required: true, message: '请输入审查意见' }]}
          >
            <TextArea rows={6} placeholder="请输入详细的审查意见和论证结果" />
          </Form.Item>

          <Form.Item
            label="审查结果"
            name="auditStatus"
            rules={[{ required: true, message: '请选择审查结果' }]}
          >
            <Select onChange={(value) => setReviewStatus(value)}>
              <Select.Option value={2}>
                <CheckOutlined style={{ color: '#52c41a' }} /> 通过
              </Select.Option>
              <Select.Option value={3}>
                <CloseOutlined style={{ color: '#ff4d4f' }} /> 不通过（需要修订）
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 内容查看弹窗 */}
      {/* <Modal
        title={contentModalTitle}
        open={contentModalVisible}
        onCancel={() => setContentModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setContentModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
          {contentModalText}
        </div>
      </Modal> */}
    </div>
  );
}
