import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Typography,
  Breadcrumb,
  Modal,
  Descriptions,
  message,
  Spin,
  Tooltip,
  Tabs,
  Empty,
  Divider,
  List,
  Timeline,
  Card as AntCard,
  Pagination
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  BookOutlined,
  FileSearchOutlined,
  PaperClipOutlined,
  LinkOutlined,
  ZoomInOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { ChevronRight, FileCheck, FileClock, FileX, Files } from 'lucide-react';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
// import { supabase } from '../lib/supabase';
import { getCareerstandardDetail, getCareerstandardList, getCareerStandardStatistics, getPageByIndustry, getPageByInternal, postResourceGetBylds } from '@/api/standards/index2';
import dayjs from 'dayjs';
import StandardMap from '@/components/careerStandardMap';
import { useCareerTree } from '@/hooks/useCareerTree';
import RichTextRender from '@/components/richEditor/RichTextRender';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;




const statusConfig: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
  0: { text: '草稿', color: 'default', icon: <FileTextOutlined /> },
  1: { text: '待内审', color: 'processing', icon: <SyncOutlined spin /> },
  2: { text: '待行业专家审查', color: 'blue', icon: <ClockCircleOutlined /> },
  3: { text: '待专业委员会审议', color: 'blue', icon: <ClockCircleOutlined /> },
  4: { text: '已定稿', color: 'cyan', icon: <ClockCircleOutlined /> },
  5: { text: '修订中', color: 'orange', icon: <ClockCircleOutlined /> },

};

const StandardsSearch: React.FC = () => {
  const { getCareerTree, getParent } = useCareerTree();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>();
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [keyword, setSearchText] = useState<any>(null);
  const [searchStatus, setStatusFilter] = useState<number | null>(null);
  const [careerId, setDomainFilter] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [domainNames, setDomainNames] = useState<any[]>([]);
  const [mappingDoc, setMappingDoc] = useState<any>(null);
  const [mappingRows, setMappingRows] = useState<any[]>([]);
  const [loadingMapping, setLoadingMapping] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [zoomContent, setZoomContent] = useState<{ title: string; content: string }>({ title: '', content: '' });
  const [revisionsModalVisible, setRevisionsModalVisible] = useState(false);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filingInfo, setFilingInfo] = useState<any>(null);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [industries, setIndustries] = useState<any[]>([]);

  const [pagination, setPagination] = useState<{ size: number, current: number }>({ size: 10, current: 1 });
  const [query, setQuery] = useState<{ keyword: string, searchStatus: any | null, careerId: any | null }>({ keyword: '', searchStatus: null, careerId: null, });
  const [stats, setStats] = useState<any>({ totalCount: 0, auditIngCount: 0, auditPassCount: 0, auditNotPassCount: 0 });
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

  // const fetchDomains = async () => {
  //   let data = getCareerTree()
  //   setIndustries(data || []);
  // };

  const fetchData = async () => {
    setLoading(true);
    try {


      getCareerstandardList({
        ...query,
        ...pagination,
      }).then(data => {
        setData(data);
        setFilteredData(data.records)
      })
      //统计
      getCareerStandardStatistics({})
        .then(data => {
          setStats(data);
        })

      setLoading(false);
    } catch (error: any) {
      message.error('加载数据失败：' + error.message);
    } finally {

    }
  };

  useEffect(() => {
    //fetchDomains();
    fetchData();
  }, [pagination]);



  const handleViewDetail = async (record: any) => {
    setSelectedRecord(record);
    if (record.appendixAttach && record.appendixAttach.split(',').length > 0) {
      postResourceGetBylds(
        [...record.appendixAttach.split(',')]
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

    setDetailVisible(true);

    // 如果有能力分级表文档ID，加载能力分级表数据
    // if (record.mapping_document_id) {
    //   await loadMappingDocument(record.mapping_document_id);
    // } else {
    //   setMappingDoc(null);
    //   setMappingRows([]);
    // }
  };

  // 加载能力分级表文档信息
  // const loadMappingDocument = async (mappingDocId: string) => {
  //   setLoadingMapping(true);
  //   // try {
  //   //   // 加载能力分级表文档信息
  //   //   const { data: docData, error: docError } = await supabase
  //   //     .from('mapping_documents')
  //   //     .select('*')
  //   //     .eq('id', mappingDocId)
  //   //     .maybeSingle();

  //   //   if (docError) throw docError;
  //   //   setMappingDoc(docData);

  //   //   // 加载能力分级表行数据
  //   //   if (docData) {
  //   //     const { data: rowsData, error: rowsError } = await supabase
  //   //       .from('mapping_rows')
  //   //       .select('*')
  //   //       .eq('document_id', mappingDocId)
  //   //       .order('sort_order', { ascending: true });

  //   //     if (rowsError) throw rowsError;
  //   //     setMappingRows(rowsData || []);
  //   //   }
  //   // } catch (error: any) {
  //   //   console.error('加载能力分级表失败：', error);
  //   //   message.error('加载能力分级表失败');
  //   // } finally {
  //   //   setLoadingMapping(false);
  //   // }
  // };

  const handleReset = () => {
    setSearchText(null);
    setStatusFilter(null);
    setDomainFilter(null);
    setPagination((prev) => ({ ...prev, keyword: null, searchStatus: null, careerId: null, }));

  };

  const handleZoomClick = (title: string, content: string) => {
    setZoomContent({ title, content });
    setZoomModalVisible(true);
  };

  // 获取修订记录
  const handleViewRevisions = async (id: any) => {

    try {

      setRevisions([]);
      setReviews([]);
      setLoadingRevisions(true);
      setRevisionsModalVisible(true);


      getCareerstandardDetail(
        { id: id }
      ).then(data => {
        setReviews(data.auditDetails);
        setRevisions(data.reviseDetails);
        setFilingInfo({
          careerStandardFileName: data.careerStandardFileName,  //标准名称
          careerName: data.careerName,
          createTime: data.createTime,   //职业领域
          standardVersion: data.standardVersion,
        });
        setLoading(false);
      }).catch((error: any) => {
        message.error(error.response.data.msg);
      }).finally(() => {
        setLoading(false);
      });

    } catch (error: any) {
      message.error('加载修订记录失败：' + error.message);
    } finally {
      setLoadingRevisions(false);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: '标准文件名称',
      dataIndex: 'careerStandardFileName',
      key: 'careerStandardFileName',
      ellipsis: true,
      render: (text: string) => (
        <Text strong style={{ color: '#7f7f7f' }}>{text}</Text>
      )
    },
    {
      title: '归属职业领域',
      dataIndex: 'careerName',
      key: 'careerName',
      width: 160,
      render: (careerName: string) => (
        <Tag color="blue">{careerName || '未知领域'}</Tag>
      )
    },
    {
      title: '文件版本',
      dataIndex: 'standardVersion',
      key: 'standardVersion',
      width: 100,
      align: 'left',
      render: (text: string) => (
        <Tag color="purple">{text}</Tag>
      )
    },
    {
      title: '文件状态',
      dataIndex: 'searchStatus ',
      key: 'searchStatus ',
      width: 110,
      align: 'left',
      render: (_, record) => {
        const config = statusConfig[record.searchStatus];
        if (!config) {
          return <Tag color="default">{record.searchStatusTitle}</Tag>;
        }
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (date: string) => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: '#999' }} />
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
          </Text>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'left',
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined style={{ fontSize: '16px' }} />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.searchStatus !== 0 && (
            <Tooltip title="修订记录">
              <Button
                type="text"
                size="small"
                icon={<HistoryOutlined style={{ fontSize: '16px', color: '#fa8c16' }} />}
                onClick={() => handleViewRevisions(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  const statsCards = [
    {
      title: '总文档数',
      value: stats.totalNum || 0,
      icon: Files,
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      title: '已批准',
      value: stats.approvedNum || 0,
      icon: FileCheck,
      color: 'from-green-500 to-emerald-400',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600'
    },
    {
      title: '待审核',
      value: stats.waitAuditNum || 0,
      icon: FileClock,
      color: 'from-orange-500 to-amber-400',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600'
    },
    {
      title: '草稿',
      value: stats.draftNum || 0,
      icon: FileX,
      color: 'from-gray-500 to-slate-400',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-600'
    }
  ];
  // 根据条件查询
  const handleQueryChange = (obj: Record<any, any>) => {
    setQuery((prev) => ({ ...prev, ...obj }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  }
  const getStatusConfig = (auditStatus: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      1: { color: 'success', icon: <CheckCircleOutlined />, text: '通过' },
      2: { color: 'error', icon: <CloseCircleOutlined />, text: '未通过' },
    };
    return config[auditStatus] || { color: 'default', icon: null, text: auditStatus };
  };
  return (
    <div className="space-y-6">
      {/* 面包屑 */}
      <div>
        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
          <ChevronRight className="w-4 h-4" />
          <span className="hover:text-blue-600 cursor-pointer transition-colors">领域标准</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-blue-600 font-medium">标准检索</span>
        </div>
      </div>

      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <Title level={2} style={{ margin: 0, color: '#1f2937' }}></Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
          </Text>
        </div>
      </div>

      {/* 统计卡片  {`${stat.bgColor} border ${stat.borderColor} rounded-xl p-6 hover:shadow-md transition-all duration-300`*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-800">{stat.value}</h3>
                </div>
                <div className={`w-14 h-14 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={10}>
            <Search
              placeholder="搜索标准名称或版本号..."
              allowClear
              enterButton={
                <Button type="primary" icon={<SearchOutlined />} >
                  搜索
                </Button>
              }
              size="large"
              value={keyword}
              onChange={(e) => { setSearchText(e.target.value); handleQueryChange({ keyword: e.target.value }) }}
            />
          </Col>
          <Col xs={12} sm={8} md={5}>
            <Select
              placeholder="文件状态"
              size="large"
              style={{ width: '100%' }}
              value={searchStatus}
              onChange={(v) => {
                setStatusFilter(v);
                handleQueryChange({ searchStatus: v })
              }}
            >
              <Option value={null}>全部状态</Option>
              <Option value={0}>草稿</Option>
              <Option value={1}>待内审</Option>
              <Option value={2}>待行业专家审查</Option>
              <Option value={3}>待专家委员会审议</Option>
              <Option value={4}>已定稿</Option>
              <Option value={5}>修订中</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8} md={5}>
            <Select
              placeholder="职业领域"
              size="large"
              style={{ width: '100%' }}
              value={careerId}
              onChange={(v) => {
                setDomainFilter(v)
                handleQueryChange({ careerId: v })
              }}
              showSearch
              optionFilterProp="children"
            >
              <Select.Option value={null}>全部领域</Select.Option>
              {professionalDomains.map(domain => (
                <Select.Option key={domain.id} value={domain.id}>
                  {domain.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Space style={{ width: '100%' }}>
              <Button
                icon={<FilterOutlined />}
                size="large"
                onClick={handleReset}
              >
                重置
              </Button>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                size="large"
                onClick={fetchData}
              />
            </Space>
          </Col>
        </Row>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="middle"
        />
        {/* 分页 */}
        <div className="px-2 py-4 border-t border-slate-200 mt-2 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            共 {data?.total} 条记录
          </div>
          <div className="flex items-center space-x-2">
            <Pagination
              current={pagination.current}
              pageSize={pagination.size}
              total={data?.total || 0}
              showLessItems
              showSizeChanger={false}
              onChange={(page) => {
                setPagination((prev) => ({ ...prev, current: page }))
              }
              }
            />
          </div>
        </div>

      </div>

      {/* 详情弹窗 - 专业版本 */}
      <Modal
        title={null}
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false);
          setMappingDoc(null);
          setMappingRows([]);
        }}
        footer={null}
        width="90%"
        style={{ top: 20, maxWidth: '1400px' }}
        bodyStyle={{ padding: 0 }}
      >
        {selectedRecord && (
          <div>
            <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', padding: '24px 32px' }}>
              {/* 核心信息卡片 */}
              <Card
                style={{
                  marginBottom: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <Title level={4} style={{ margin: 0, fontSize: '18px', color: '#1f2937' }}>
                    {selectedRecord.careerStandardFileName}
                  </Title>
                </div>

                <Row gutter={[24, 20]}>
                  <Col xs={24} sm={12} lg={8}>
                    <div style={{
                      padding: '16px',
                      background: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd'
                    }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOutlined style={{ fontSize: '16px', color: '#0284c7' }} />
                        <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>归属职业领域</Text>
                      </div>
                      <Text strong style={{ fontSize: '14px', color: '#1f2937' }}>
                        {selectedRecord.careerName || '未知领域'}
                      </Text>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} lg={8}>
                    <div style={{
                      padding: '16px',
                      background: '#faf5ff',
                      borderRadius: '8px',
                      border: '1px solid #e9d5ff'
                    }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <FileTextOutlined style={{ fontSize: '16px', color: '#9333ea' }} />
                        <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>文件版本</Text>
                      </div>
                      <Tag color="purple" style={{ fontSize: '13px', padding: '4px 12px' }}>
                        {selectedRecord.standardVersion}
                      </Tag>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} lg={8}>
                    <div style={{
                      padding: '16px',
                      background: statusConfig[selectedRecord.searchStatus]?.color === 'success' ? '#f0fdf4' :
                        statusConfig[selectedRecord.searchStatus]?.color === 'processing' ? '#fef3c7' :
                          statusConfig[selectedRecord.searchStatus]?.color === 'error' ? '#fef2f2' : '#f9fafb',
                      borderRadius: '8px',
                      border: `1px solid ${statusConfig[selectedRecord.searchStatus]?.color === 'success' ? '#bbf7d0' :
                        statusConfig[selectedRecord.searchStatus]?.color === 'processing' ? '#fde68a' :
                          statusConfig[selectedRecord.searchStatus]?.color === 'error' ? '#fecaca' : '#e5e7eb'}`
                    }}>
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircleOutlined style={{
                          fontSize: '16px',
                          color: statusConfig[selectedRecord.searchStatus]?.color === 'success' ? '#16a34a' :
                            statusConfig[selectedRecord.searchStatus]?.color === 'processing' ? '#ca8a04' :
                              statusConfig[selectedRecord.searchStatus]?.color === 'error' ? '#dc2626' : '#6b7280'
                        }} />
                        <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>文件状态</Text>
                      </div>
                      <Tag
                        color={statusConfig[selectedRecord.searchStatus]?.color || 'default'}
                        icon={statusConfig[selectedRecord.searchStatus]?.icon}
                        style={{ fontSize: '13px', padding: '4px 12px' }}
                      >
                        {statusConfig[selectedRecord.searchStatus]?.text || selectedRecord.searchStatusTitle}
                      </Tag>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} lg={8}>
                    <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fafafa' }}>
                      <div className="flex items-center space-x-2 mb-1">
                        <ClockCircleOutlined style={{ fontSize: '14px', color: '#6b7280' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>创建时间</Text>
                      </div>
                      <Text style={{ fontSize: '13px', color: '#374151' }}>
                        {dayjs(selectedRecord.createTime).format('YYYY-MM-DD HH:mm:ss')}
                      </Text>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} lg={8}>
                    <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fafafa' }}>
                      <div className="flex items-center space-x-2 mb-1">
                        <ClockCircleOutlined style={{ fontSize: '14px', color: '#6b7280' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>更新时间</Text>
                      </div>
                      <Text style={{ fontSize: '13px', color: '#374151' }}>
                        {dayjs(selectedRecord.updateTime).format('YYYY-MM-DD HH:mm:ss')}
                      </Text>
                    </div>
                  </Col>

                  <Col xs={24} sm={12} lg={8}>
                    <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fafafa' }}>
                      <div className="flex items-center space-x-2 mb-1">
                        <FileTextOutlined style={{ fontSize: '14px', color: '#6b7280' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>撰写人</Text>
                      </div>
                      <Text style={{ fontSize: '13px', color: '#374151' }}>系统管理员</Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* 文档内容区域 */}
              <Card
                style={{
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                bodyStyle={{ padding: '32px' }}
              >
                <Tabs
                  defaultActiveKey="introduction"
                  size="large"
                  tabBarStyle={{
                    borderBottom: '2px solid #e5e7eb',
                    marginBottom: '24px',
                    fontSize: '15px'
                  }}
                  items={[
                    {
                      key: 'introduction',
                      label: (
                        <span>
                          <BookOutlined />
                          标准文件引言
                        </span>
                      ),
                      children: (
                        <section style={{ marginBottom: '32px' }}>
                          <Title level={4} style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1f2937',
                            marginBottom: '24px',
                            borderBottom: '2px solid #3b82f6',
                            paddingBottom: '8px'
                          }}>
                            标准文件引言
                          </Title>
                          {selectedRecord.preface && selectedRecord.preface.trim() !== '' ? (
                            <Typography.Paragraph style={{
                              fontSize: '15px',
                              lineHeight: '2',
                              textIndent: '2em',
                              color: '#374151',
                              textAlign: 'justify',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {selectedRecord.preface}
                            </Typography.Paragraph>
                          ) : (
                            <Empty description="暂无引言内容" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )}
                        </section>
                      )
                    },
                    {
                      key: 'purpose',
                      label: (
                        <span>
                          <FileTextOutlined />
                          核心目的
                        </span>
                      ),
                      children: (
                        <section style={{ marginBottom: '32px' }}>
                          <Title level={4} style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1f2937',
                            marginBottom: '24px',
                            borderBottom: '2px solid #3b82f6',
                            paddingBottom: '8px'
                          }}>
                            核心目的
                          </Title>
                          {selectedRecord.corePurpose && selectedRecord.corePurpose.trim() !== '' ? (
                            <Typography.Paragraph style={{
                              fontSize: '15px',
                              lineHeight: '2',
                              textIndent: '2em',
                              color: '#374151',
                              textAlign: 'justify',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {selectedRecord.corePurpose}
                            </Typography.Paragraph>
                          ) : (
                            <Empty description="暂无核心目的" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )}
                        </section>
                      )
                    },
                    {
                      key: 'scope',
                      label: (
                        <span>
                          <FileSearchOutlined />
                          适用范围
                        </span>
                      ),
                      children: (
                        <section style={{ marginBottom: '32px' }}>
                          <Title level={4} style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1f2937',
                            marginBottom: '24px',
                            borderBottom: '2px solid #3b82f6',
                            paddingBottom: '8px'
                          }}>
                            适用范围
                          </Title>
                          {selectedRecord.scope && selectedRecord.scope.trim() !== '' ? (
                            <Typography.Paragraph style={{
                              fontSize: '15px',
                              lineHeight: '2',
                              textIndent: '2em',
                              color: '#374151',
                              textAlign: 'justify',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {selectedRecord.scope}
                            </Typography.Paragraph>
                          ) : (
                            <Empty description="暂无适用范围" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )}
                        </section>
                      )
                    },
                    {
                      key: 'terms',
                      label: (
                        <span>
                          <FileSearchOutlined />
                          标准术语和定义
                        </span>
                      ),
                      children: (
                        <section style={{ marginBottom: '32px' }}>
                          <Title level={4} style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1f2937',
                            marginBottom: '24px',
                            borderBottom: '2px solid #3b82f6',
                            paddingBottom: '8px'
                          }}>
                            标准术语定义
                          </Title>
                          {selectedRecord.careerStandardTermList && selectedRecord.careerStandardTermList.length > 0 ? (
                            <div style={{ paddingLeft: '24px' }}>
                              {selectedRecord.careerStandardTermList.map((item: any, index: number) => (
                                <div key={index} style={{ marginBottom: '20px' }}>
                                  <Text strong style={{ fontSize: '15px', color: '#1f2937' }}>
                                    {index + 1}. {item.termName}
                                  </Text>
                                  <Typography.Paragraph style={{
                                    fontSize: '15px',
                                    lineHeight: '2',
                                    color: '#374151',
                                    marginTop: '8px',
                                    marginBottom: 0,
                                    paddingLeft: '24px'
                                  }}>
                                    {item.termDefinition}
                                  </Typography.Paragraph>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Empty description="暂无术语定义" />
                          )}
                        </section>
                      )
                    },
                    {
                      key: 'content',
                      label: (
                        <span>
                          <FileTextOutlined />
                          领域标准正文
                        </span>
                      ),
                      children: (
                        <section style={{ marginBottom: '32px' }}>
                          <Title level={4} style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1f2937',
                            marginBottom: '24px',
                            borderBottom: '2px solid #3b82f6',
                            paddingBottom: '8px'
                          }}>
                            领域标准正文
                          </Title>
                          {selectedRecord.overview && selectedRecord.overview.trim() !== '' ? (
                            <div>
                              <Typography.Paragraph style={{
                                fontSize: '15px',
                                lineHeight: '2',
                                textIndent: '2em',
                                color: '#374151',
                                textAlign: 'justify',
                                whiteSpace: 'pre-wrap',
                                marginBottom: '32px'
                              }}>
                                {/* {selectedRecord.overview} */}
                                <RichTextRender content={selectedRecord.overview} />
                              </Typography.Paragraph>

                              {/* {selectedRecord.standard_content.ability_requirements && selectedRecord.standard_content.ability_requirements.length > 0 && (
                                <div>
                                  <Title level={5} style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#1f2937',
                                    marginBottom: '20px'
                                  }}>
                                    能力要求
                                  </Title>
                                  <div style={{ paddingLeft: '24px' }}>
                                    {selectedRecord.standard_content.ability_requirements.map((item: any, index: number) => (
                                      <div key={index} style={{
                                        marginBottom: '24px',
                                        borderLeft: '3px solid #e5e7eb',
                                        paddingLeft: '16px',
                                        backgroundColor: '#fafafa',
                                        padding: '16px',
                                        borderRadius: '4px'
                                      }}>
                                        <Text strong style={{ fontSize: '15px', color: '#1f2937', display: 'block', marginBottom: '12px' }}>
                                          能力要求 {index + 1}
                                        </Text>
                                        <Row gutter={[16, 8]} style={{ marginBottom: '12px' }}>
                                          <Col span={12}>
                                            <Text type="secondary">等级：</Text>
                                            <Text>{item.level || '-'}</Text>
                                          </Col>
                                          <Col span={12}>
                                            <Text type="secondary">IVRL：</Text>
                                            <Text>{item.ivrl || '-'}</Text>
                                          </Col>
                                          <Col span={12}>
                                            <Text type="secondary">一级维度：</Text>
                                            <Text>{item.primary_ability || '-'}</Text>
                                          </Col>
                                          <Col span={12}>
                                            <Text type="secondary">二级维度：</Text>
                                            <Text>{item.secondary_ability || '-'}</Text>
                                          </Col>
                                          <Col span={24}>
                                            <Text type="secondary">三级组件：</Text>
                                            <Text>{item.tertiary_ability || '-'}</Text>
                                          </Col>
                                        </Row>
                                        <Divider style={{ margin: '12px 0' }} />
                                        <div>
                                          <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>能力描述：</Text>
                                          <Typography.Paragraph style={{
                                            fontSize: '14px',
                                            lineHeight: '1.8',
                                            color: '#6b7280',
                                            marginBottom: 0,
                                            whiteSpace: 'pre-wrap'
                                          }}>
                                            {item.description || '-'}
                                          </Typography.Paragraph>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )} */}
                            </div>
                          ) : (
                            <Empty description="暂无标准正文内容" />
                          )}
                        </section>
                      )
                    },
                    {
                      key: 'appendix',
                      label: (
                        <span>
                          <PaperClipOutlined />
                          专家论证意见
                        </span>
                      ),
                      children: (
                        <section style={{ marginBottom: '32px' }}>
                          <Title level={4} style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1f2937',
                            marginBottom: '24px',
                            borderBottom: '2px solid #3b82f6',
                            paddingBottom: '8px'
                          }}>
                            专家论证意见
                          </Title>
                          {selectedRecord.appendixAttach && appendixAttach ? (
                            <List
                              dataSource={appendixAttach}
                              renderItem={(item: any) => (
                                <List.Item
                                  actions={[
                                    item.signUrl ? (
                                      <Button
                                        type="link"
                                        icon={<LinkOutlined />}
                                        href={item.signUrl}
                                        target="_blank"
                                      >
                                        下载
                                      </Button>
                                    ) : null
                                  ]}
                                >
                                  <List.Item.Meta
                                    avatar={<PaperClipOutlined style={{ fontSize: '20px', color: '#1890ff' }} />}
                                    title={item.originalName}
                                    description={`文件大小: ${(item.resourceSize / 1024).toFixed(2)} KB`}
                                  />
                                </List.Item>
                              )}
                            />
                          ) : (
                            <Empty description="暂无专家论证意见文件" />
                          )}
                        </section>
                      )
                    },
                    //能力分级表等薛来处理
                    {
                      key: 'mapping',
                      label: (
                        <span>
                          <FileSearchOutlined />
                          能力分级表
                        </span>
                      ),
                      children: (
                        <section style={{ marginBottom: '32px' }}>
                          <Title level={4} style={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#1f2937',
                            marginBottom: '24px',
                            borderBottom: '2px solid #3b82f6',
                            paddingBottom: '8px'
                          }}>
                            能力分级表
                          </Title>
                          <StandardMap mapId={selectedRecord.careerStandardMapId} />
                        </section>
                      )
                    }
                  ]}
                />
              </Card>

              {/* 底部操作栏 */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                {/* <Button
                  size="large"
                  onClick={() => {
                    setDetailVisible(false);
                    setMappingDoc(null);
                    setMappingRows([]);
                  }}
                >
                  取消
                </Button> */}
                <Button
                  type="primary"
                  size="large"
                  onClick={() => {
                    setDetailVisible(false);
                    setMappingDoc(null);
                    setMappingRows([]);
                  }}
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 放大镜弹窗 */}
      <Modal
        title={
          <Space>
            <ZoomInOutlined style={{ color: '#1890ff' }} />
            <span>{zoomContent.title}</span>
          </Space>
        }
        open={zoomModalVisible}
        onCancel={() => setZoomModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setZoomModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        <div style={{
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          <Typography.Paragraph style={{
            fontSize: '14px',
            lineHeight: '1.8',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {zoomContent.content}
          </Typography.Paragraph>
        </div>
      </Modal>

      {/* 修订历史弹窗 */}
      <Modal
        title={"修订记录"}
        open={revisionsModalVisible}
        onCancel={() => setRevisionsModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setRevisionsModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        <Spin spinning={loadingRevisions}>
          <Tabs
            defaultActiveKey="revisions"
            items={[
              {
                key: 'revisions',
                label: `修订历史 (${revisions.length})`,
                children: (
                  <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                    {revisions.length > 0 ? (
                      <Timeline>
                        {revisions.map((revision) => (
                          <Timeline.Item key={revision.id}>
                            <AntCard size="small">
                              <p><strong>修订人：</strong>{revision.reviseUserName}</p>
                              <p><strong>修订时间：</strong>{new Date(revision.updateTime).toLocaleString('zh-CN')}</p>
                              <p><strong>状态：</strong>
                                <Tag color={revision.status === 1 ? 'green' : 'orange'}>
                                  {revision.status === 1 ? '已提交' : '草稿'}
                                </Tag>
                              </p>
                              <Divider style={{ margin: '8px 0' }} />
                              <p><strong>修订说明：</strong></p>
                              <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                                {revision.reviseRemark}
                              </div>
                            </AntCard>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    ) : (
                      <Empty description="暂无修订历史" />
                    )}
                  </div>
                )
              },
              {
                key: 'reviews',
                label: `审查记录 (${reviews.length})`,
                children: (
                  <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                    {reviews.length > 0 ? (
                      <Timeline>
                        {reviews.map((review) => {
                          const isRejected = review.auditStatus === 3
                          return (
                            <Timeline.Item
                              key={review.id}
                              color={isRejected ? 'red' : 'green'}
                            >
                              <AntCard size="small">
                                <div style={{ marginBottom: '8px' }}>
                                  <Tag color={
                                    review.auditStage === 1 ? 'blue' :
                                      review.auditStage === 3 ? 'orange' : 'purple'
                                  }>
                                    {review.auditStage === 1 ? '内部审查' :
                                      review.auditStage === 3 ? '专家委员会审议' : '行业专家审查'}
                                  </Tag>
                                  {(() => {
                                    const { color, icon, text } = getStatusConfig(review.auditStatus);
                                    return <Tag color={color} icon={icon}>{text}</Tag>;
                                  })()}
                                </div>

                                {review.auditStage === 1 ? (
                                  <div>
                                    <p><strong>审查人：</strong>{review.auditUserName}</p>
                                  </div>
                                ) : review.auditStage === 3 ? (
                                  <div>
                                    <p><strong>专家：</strong>{review.auditUserName || review.auditUserName}</p>
                                  </div>
                                ) : (
                                  <div>
                                    <p><strong>专家：</strong>{review.auditUserName} - {review.auditUserTitle} - {review.auditUserInstitution}</p>
                                  </div>
                                )}

                                <p><strong>审查日期：</strong>{new Date(review.auditDate).toLocaleString('zh-CN')}</p>
                                <Divider style={{ margin: '8px 0' }} />
                                <p><strong>审查意见：</strong></p>
                                <div style={{ padding: '8px', background: isRejected ? '#fff1f0' : '#f6ffed', borderRadius: '4px' }}>
                                  {review.auditReason || review.suggestion}
                                </div>

                                {review.auditStage === 3 && review.review_suggestions && (
                                  <>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <p><strong>修改建议：</strong></p>
                                    <div style={{ padding: '8px', background: '#f0f9ff', borderRadius: '4px' }}>
                                      {review.suggestion}
                                    </div>
                                  </>
                                )}

                                {review.auditStage !== 3 && review.revSuggestion && review.revSuggestion.length > 0 && (
                                  <>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <p><strong>修改建议：</strong></p>
                                    <List
                                      size="small"
                                      dataSource={review.revSuggestion}
                                      renderItem={(item: any) => (
                                        <List.Item>
                                          <div>
                                            <div><strong>章节：</strong>{item.chapter}</div>
                                            <div><strong>问题：</strong>{item.issueFound}</div>
                                            <div><strong>建议：</strong>{item.revSuggestion}</div>
                                          </div>
                                        </List.Item>
                                      )}
                                    />
                                  </>
                                )}
                              </AntCard>
                            </Timeline.Item>
                          );
                        })}
                      </Timeline>
                    ) : (
                      <Empty description="暂无审查记录" />
                    )}
                  </div>
                )
              },
              {
                key: 'filing',
                label: '备案信息',
                children: (
                  <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
                    {filingInfo ? (
                      <AntCard>

                        {filingInfo && (
                          <>
                            <div>
                              <h4 style={{ marginBottom: '12px' }}>备案内容</h4>
                              {filingInfo && (
                                <div style={{ marginBottom: '16px' }}>
                                  <Text strong>标准基本信息</Text>
                                  <div style={{ marginTop: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                                    <p><strong>标准名称：</strong>{filingInfo.careerStandardFileName || '-'}</p>
                                    {/* <p><strong>标准编号：</strong>{filingInfo.id || '-'}</p> */}
                                    <p><strong>职业领域：</strong>{filingInfo.careerName || '-'}</p>
                                    <p><strong>版本号：</strong>{filingInfo.standardVersion}</p>
                                    <p><strong>创建时间：</strong>{filingInfo.createTime}</p>
                                  </div>
                                </div>
                              )}

                              {/* {filingInfo.fling_remark && (
                                <div style={{ marginTop: '16px' }}>
                                  <Text strong>协议内容</Text>
                                  <div style={{ marginTop: '8px', padding: '12px', background: '#f0f9ff', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                                    {filingInfo.fling_remark}
                                  </div>
                                </div>
                              )} */}
                            </div>
                          </>
                        )}
                      </AntCard>
                    ) : (
                      <Empty description="暂无备案信息" />
                    )}
                  </div>
                )
              }
            ]}
          />
        </Spin>
      </Modal>
    </div>
  );
};

export default StandardsSearch;
