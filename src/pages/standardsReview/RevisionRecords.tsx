import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Space, message, Modal, Descriptions, Typography, Divider, Timeline, Pagination, Tooltip } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
// import { supabase } from '../lib/supabase';
import dayjs from 'dayjs';
import { getCareerStandardReviseReviseList, postResourceGetBylds } from '@/api/standards/index2';

const { Text, Paragraph } = Typography;



const anys: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);

  const [pagination, setPagination] = useState<{ size: number, current: number }>({ size: 10, current: 1 });
  const [totalNum, setTotalNum] = useState<any>(0);
  const [appendixAttach, setAppendixAttach] = useState<any>([]);

  useEffect(() => {
    loadRecords();
  }, [pagination]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      setLoading(true);
      getCareerStandardReviseReviseList({
        ...pagination,
      }).then(data => {
        setRecords(data || []);
        setFilteredDocuments(data.records)
        setTotalNum(data.total)
      })

    } catch (error: any) {
      console.error('Load records error:', error);
      message.error('加载修订记录失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const getfiles = (record: any) => {
    if (record.content.专家论证意见 && record.content.专家论证意见.split(',').length > 0) {
      postResourceGetBylds(
        [...record.content.专家论证意见.split(',')]
      ).then(data => {
        const rs3 = data.filter((a: any) => record.content.专家论证意见.includes(a.id));
        setAppendixAttach(rs3);

      }).catch((error: any) => {
        message.error(error.response.data.msg);
      });
    }

  }
  const handleView = (record: any) => {
    setSelectedRecord(record);
    getfiles(record);
    setViewModalVisible(true);
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      0: { color: 'default', icon: <FileTextOutlined />, text: '草稿' },
      1: { color: 'processing', icon: <CheckCircleOutlined />, text: '提交' },

    };
    return config[status] || { color: 'default', icon: <ClockCircleOutlined />, text: status };
  };

  const columns: ColumnsType<any> = [
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
          {record.careerName || '未知领域'}
        </Tag>
      )
    },
    {
      title: '修订人',
      dataIndex: 'reviseUserName',
      key: 'reviseUserName',
      width: 120,
      render: (text: string) => <Text>{text || '-'}</Text>
    },
    {
      title: '修订时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '状态',
      dataIndex: 'statusTitle',
      key: 'statusTitle',
      width: 150,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
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
              onClick={() => handleView(record)}
            >
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  /**修改内容 */
  const modifyContent = () => {
    const targetTerm = selectedRecord.content?.术语定义;
    const s1 = selectedRecord.content.引言;
    const s2 = selectedRecord.content.总述;
    const s3 = selectedRecord.content.适用范围;
    const s4 = selectedRecord.content.制定目的;
    const s5 = selectedRecord.content.分项能力要求;
    const s6 = selectedRecord.content.专家论证意见;
    // var arrayResult: any = [];
    // targetTerm && targetTerm.map((o: any) => {
    //   const result = {
    //     termName: o.termName,
    //     termDefinition: o.termDefinition
    //   };

    //   arrayResult = [...arrayResult, result];
    // })
    // const result = { 引言: s1, 总述: s2, 适用范围: s3, 术语定义: arrayResult, 制定目的: s4, 分项能力要求: s5, 专家论证意见: s6 }

    const str3 = s3 ? <div className='mb-4'><span className='text-gray-400'>适用范围：</span>{s3}</div> : null;
    const str4 = s4 ? <div className='mb-4'><span className='text-gray-400'>核心目的：</span>{s4}</div> : null;
    const str1 = s1 ? <div className='mb-4'><span className='text-gray-400'>引言：</span>{s1}</div> : null;
    const str5 = s5 ? <div className='mb-4'><span className='text-gray-400'>分项能力要求：</span>{s5}</div> : null;
    // const str6 = s6 ? <div className='mb-4'><span className='text-gray-400'>专家论证意见：</span>{s6}</div> : null;

    //const Jsoncontent = JSON.stringify(result, null, 2);
    //const textContent = Jsoncontent.replace(/^\{|\}$/g, '');
    return <div>
      {str1 || str3 || str4 || str5 || appendixAttach.length > 0 || targetTerm.length > 0 ? (
        <>
          {str1}
          {str3}
          {str4}
          {str5}

          {appendixAttach.length > 0 && <div><span className='text-gray-400'>专家论证意见：</span></div>}
          {appendixAttach.length > 0 && appendixAttach.map((item: any) => {
            return <div className='ml-4' ><span >{item.originalName}</span></div>;
          })}
          <div className='mb-2' ></div>
          {targetTerm.length > 0 && <div><span className='text-gray-400'>术语：</span></div>}
          {targetTerm.length > 0 && targetTerm.map((item: any) => {
            return <div className='ml-4' ><span >{item.termName}：{item.termDefinition}</span></div>;
          })}

        </>
      ) : (
        '无修订内容'
      )}
    </div>;
  }

  return (
    <div className="space-y-6"  >
      {/* 面包屑导航 */}
      <div className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
        <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
        <span>/</span>
        <span className="hover:text-blue-600 cursor-pointer transition-colors">标准审查</span>
        <span>/</span>
        <span className="text-blue-600 font-medium">修订记录</span>
      </div>

      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <FileTextOutlined className="text-white text-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold">修订记录</div>
              <div className="text-sm text-gray-500 font-normal">
                查看所有标准的修订历史记录
              </div>
            </div>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredDocuments}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1400 }}
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
      </Card>

      {/* 查看详情弹窗 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-blue-500" />
            <span>修订记录详情</span>
          </div>
        }
        open={viewModalVisible}
        onCancel={() => {
          setAppendixAttach([]);
          setViewModalVisible(false);
        }}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={900}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="标准名称" span={2}>
                <Text strong>{selectedRecord.careerStandardFileName || '未知标准'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="版本">
                <Tag color="blue">{selectedRecord.standardVersion || '-'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="职业领域">
                <Tag color="cyan">
                  {selectedRecord.careerName || '未知领域'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="修订人">
                <Text>{selectedRecord.reviseUserName || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="修订日期">
                <Text>{selectedRecord.createTime ? dayjs(selectedRecord.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="状态" span={2}>
                {(() => {
                  const { color, icon, text } = getStatusConfig(selectedRecord.status);
                  return <Tag color={color} icon={icon}>{text}</Tag>;
                })()}
              </Descriptions.Item>
            </Descriptions>

            <Divider>修订说明</Divider>

            <Card size="small" className="bg-white">
              <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {selectedRecord.reviseRemark || '无修订说明'}
              </Paragraph>
            </Card>

            <Divider>修订内容</Divider>

            <Card size="small" className="bg-white" title="基本信息">
              <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {modifyContent()}

              </Paragraph>
            </Card>


            {(() => {
              const s2 = selectedRecord.content.总述;

              const str1 = s2 ? { s2 } : null;
              return <div>
                {str1 ? (
                  <Card size="small" className="bg-white" title="标准正文">
                    {s2}
                  </Card>
                ) : (
                  ''
                )}
              </div>;
            })()}




            <Divider>时间线</Divider>

            <Timeline
              items={[
                {
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong>创建时间</Text>
                      <div className="text-gray-500">
                        {dayjs(selectedRecord.createTime).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    </div>
                  )
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>最后更新</Text>
                      <div className="text-gray-500">
                        {dayjs(selectedRecord.updateTime).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default anys;
