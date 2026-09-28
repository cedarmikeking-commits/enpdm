import React from 'react';
import { Card, Descriptions, Tag, Divider, Tabs, Button, Timeline, Empty, Typography } from 'antd';
import {
  FileTextOutlined,
  AuditOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import type { StandardDocument, MappingRow } from './types';
import StandardMap from '@/components/careerStandardMap';
import RichTextRender from '@/components/richEditor/RichTextRender';

const { Text } = Typography;

interface StandardDetailViewProps {
  document: StandardDocument;
  mappingRows: MappingRow[];
  onBack: () => void;
  onDeliberate?: () => void;
  showDeliberateButton?: boolean;
  hideHeader?: boolean; // 是否隐藏面包屑和操作栏
  showFullscreenButton?: boolean; // 是否显示全屏按钮
  isFullscreen?: boolean; // 是否全屏状态
  onFullscreenToggle?: () => void; // 全屏切换回调
}

export const StandardDetailView: React.FC<StandardDetailViewProps> = ({
  document,
  onBack,
  onDeliberate,
  showDeliberateButton = true,
  hideHeader = false,
  showFullscreenButton = false,
  isFullscreen = false,
  onFullscreenToggle,
}) => {
  // 从 auditDetails 中分离内审和专家审核记录
  const internalReviews = document.auditDetails?.filter((audit) => audit.auditStage === 1) || [];
  const expertReviews = document.auditDetails?.filter((audit) => audit.auditStage === 2) || [];

  console.log('🔍 StandardDetailView 渲染');
  console.log('审核详情数组:', document.auditDetails);
  console.log('内审记录数量:', internalReviews.length);
  console.log('内审记录:', internalReviews);
  console.log('专家审查数量:', expertReviews.length);
  console.log('专家审查:', expertReviews);
  console.log('专家审查数量:', expertReviews.length);
  console.log('专家审查:', expertReviews);

  return (
    <div className="min-h-screen">
      {/* 面包屑导航 */}
      {!hideHeader && (
        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
          <span>/</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">标准管理</span>
          <span>/</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={onBack}>
            专家委员会审议
          </span>
          <span>/</span>
          <span className="text-blue-600 font-medium">标准详情</span>
        </div>
      )}

      {/* 顶部操作栏 */}
      {!hideHeader && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <Button icon={<ArrowLeftOutlined />} onClick={onBack} size="large">
              返回列表
            </Button>
            {showDeliberateButton && onDeliberate && (
              <Button type="primary" size="large" icon={<AuditOutlined />} onClick={onDeliberate}>
                进行审议
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div>
        <Card
          className="bg-white rounded-xl shadow-sm border border-slate-200"
          bodyStyle={{ padding: '32px' }}
          title={
            showFullscreenButton && (
              <span className="text-lg font-semibold">
                <FileTextOutlined /> 标准内容
              </span>
            )
          }
          extra={
            showFullscreenButton &&
            onFullscreenToggle && (
              <Button
                type="text"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={onFullscreenToggle}
              >
                {isFullscreen ? '退出全屏' : '全屏查看'}
              </Button>
            )
          }
        >
          <Tabs
            defaultActiveKey="basic"
            size="large"
            type="card"
            items={[
              {
                key: 'basic',
                label: (
                  <span>
                    <FileTextOutlined /> 标准内容
                  </span>
                ),
                children: (
                  <div className="space-y-6 pt-4">
                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">基本信息</div>
                      <Descriptions bordered column={2}>
                        <Descriptions.Item label="标准文件名称" span={2}>
                          {document.careerStandardFileName ||
                            `《${document.careerName || ''}职业领域标准（送审稿）》`}
                        </Descriptions.Item>
                        <Descriptions.Item label="文件版本">
                          {document.standardVersion || '未知'}
                        </Descriptions.Item>
                        <Descriptions.Item label="归属职业领域">
                          {document.careerName || ''}
                        </Descriptions.Item>
                        <Descriptions.Item label="撰写人">
                          {document.createUserName || '未知'}
                        </Descriptions.Item>
                        <Descriptions.Item label="提交时间">
                          {document.createTime
                            ? new Date(document.createTime).toLocaleString('zh-CN')
                            : '未知'}
                        </Descriptions.Item>
                        <Descriptions.Item label="状态">
                          <Tag color="blue">{document.searchStatusTitle || '待专业审议'}</Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">引言</div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                        {document.preface || '暂无内容'}
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">核心目的</div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                        {document.corePurpose || '暂无内容'}
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">适用范围</div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                        {document.scope || '暂无内容'}
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">术语定义</div>
                      {document.careerStandardTermList &&
                      document.careerStandardTermList.length > 0 ? (
                        <Descriptions bordered column={1}>
                          {document.careerStandardTermList.map((term: any, index: number) => (
                            <Descriptions.Item
                              label={term.termName || `术语 ${index + 1}`}
                              key={index}
                            >
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
                        {/* {document.overview || '暂无内容'} */}

       <RichTextRender content={document.overview || '暂无内容'} />
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <div className="text-lg font-semibold mb-4 text-gray-900">专家论证意见</div>
                      {document.appendixAttach ? (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
                          {document.appendixAttach}
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
                label: (
                  <span>
                    <FileSearchOutlined /> 能力分级表
                  </span>
                ),
                children: (
                  <div className="pt-4">
                    {document.careerStandardMapId ? (
                      <StandardMap
                        className="!w-full"
                        mapId={String(document.careerStandardMapId)}
                      />
                    ) : (
                      <Empty description="暂无映射数据" />
                    )}
                  </div>
                ),
              },
              {
                key: 'reviews',
                label: (
                  <span>
                    <AuditOutlined /> 审查记录({internalReviews.length + expertReviews.length})
                  </span>
                ),
                children: (
                  <div className="pt-4">
                    <div className="text-lg font-semibold mb-6 text-gray-900">审批流程</div>
                    <Timeline>
                      {/* 内审阶段 */}
                      <Timeline.Item
                        color={
                          internalReviews.length > 0 &&
                          internalReviews.some((r) => r.auditStatus === 1)
                            ? 'green'
                            : 'gray'
                        }
                        dot={
                          internalReviews.length > 0 &&
                          internalReviews.some((r) => r.auditStatus === 1) ? (
                            <CheckCircleOutlined style={{ fontSize: '16px' }} />
                          ) : (
                            <ClockCircleOutlined style={{ fontSize: '16px' }} />
                          )
                        }
                      >
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">内部审查</span>
                          {internalReviews.length > 0 &&
                            internalReviews.some((r) => r.auditStatus === 1) && (
                              <Tag color="green" className="ml-2">
                                通过
                              </Tag>
                            )}
                        </div>
                        {internalReviews.length > 0 ? (
                          <div className="space-y-3">
                            {internalReviews.map((review) => {
                              // 解析打分数据
                              let scores: any[] = [];
                              try {
                                scores = review.auditScope ? JSON.parse(review.auditScope) : [];
                              } catch (e) {
                                console.error('解析打分数据失败:', e);
                              }

                              return (
                                <Card key={review.id} size="small" className="shadow-sm">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <UserOutlined className="text-gray-400" />
                                        <Text strong>{review.auditUserName}</Text>
                                        {review.auditUserTitle && (
                                          <Tag color="blue">{review.auditUserTitle}</Tag>
                                        )}
                                        <Tag color={review.auditStatus === 1 ? 'green' : 'red'}>
                                          {review.auditStatus === 1 ? '通过' : '未通过'}
                                        </Tag>
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {review.auditDate
                                          ? new Date(review.auditDate).toLocaleString('zh-CN')
                                          : '-'}
                                      </div>
                                    </div>
                                    {review.auditUserInstitution && (
                                      <div className="text-sm text-gray-600">
                                        所属单位: {review.auditUserInstitution}
                                      </div>
                                    )}
                                    {scores.length > 0 && (
                                      <>
                                        <Divider className="my-2" />
                                        <div className="text-sm text-gray-600">
                                          <div className="flex gap-4 flex-wrap">
                                            {scores.map((score: any, idx: number) => (
                                              <span key={idx}>
                                                {score.category}: {score.scope}分
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                    {review.auditReason && (
                                      <>
                                        <Divider className="my-2" />
                                        <div className="text-sm">
                                          <div className="text-gray-500 mb-1">审查意见:</div>
                                          <div className="text-gray-700 whitespace-pre-wrap">
                                            {review.auditReason}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <Empty description="暂无内审记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                      </Timeline.Item>

                      {/* 行业专家审查阶段 */}
                      <Timeline.Item
                        color={
                          expertReviews.length > 0 && expertReviews.some((r) => r.auditStatus === 1)
                            ? 'green'
                            : 'gray'
                        }
                        dot={
                          expertReviews.length > 0 &&
                          expertReviews.some((r) => r.auditStatus === 1) ? (
                            <CheckCircleOutlined style={{ fontSize: '16px' }} />
                          ) : (
                            <ClockCircleOutlined style={{ fontSize: '16px' }} />
                          )
                        }
                      >
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">行业专家审查</span>
                          {expertReviews.length > 0 &&
                            expertReviews.some((r) => r.auditStatus === 1) && (
                              <Tag color="green" className="ml-2">
                                通过
                              </Tag>
                            )}
                        </div>
                        {expertReviews.length > 0 ? (
                          <div className="space-y-3">
                            {expertReviews.map((review) => {
                              // 解析打分数据
                              let scores: any[] = [];
                              try {
                                scores = review.auditScope ? JSON.parse(review.auditScope) : [];
                              } catch (e) {
                                console.error('解析打分数据失败:', e);
                              }

                              // 解析修改建议
                              let suggestions: any[] = [];
                              try {
                                suggestions = review.suggestion
                                  ? JSON.parse(review.suggestion)
                                  : [];
                              } catch (e) {
                                console.error('解析修改建议失败:', e);
                              }

                              return (
                                <Card key={review.id} size="small" className="shadow-sm">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <UserOutlined className="text-gray-400" />
                                        <Text strong>{review.auditUserName}</Text>
                                        {review.auditUserTitle && (
                                          <Tag color="blue">{review.auditUserTitle}</Tag>
                                        )}
                                        <Tag color={review.auditStatus === 1 ? 'green' : 'red'}>
                                          {review.auditStatus === 1 ? '通过' : '未通过'}
                                        </Tag>
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {review.auditDate
                                          ? new Date(review.auditDate).toLocaleString('zh-CN')
                                          : '-'}
                                      </div>
                                    </div>
                                    {review.auditUserInstitution && (
                                      <div className="text-sm text-gray-600">
                                        所属机构: {review.auditUserInstitution}
                                      </div>
                                    )}
                                    {scores.length > 0 && (
                                      <>
                                        <Divider className="my-2" />
                                        <div className="text-sm text-gray-600">
                                          <div className="flex gap-4 flex-wrap">
                                            {scores.map((score: any, idx: number) => (
                                              <span key={idx}>
                                                {score.category}: {score.scope}分
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                    {review.auditReason && (
                                      <>
                                        <Divider className="my-2" />
                                        <div className="text-sm">
                                          <div className="text-gray-500 mb-1">评审意见:</div>
                                          <div className="text-gray-700 whitespace-pre-wrap">
                                            {review.auditReason}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                    {suggestions.length > 0 && (
                                      <>
                                        <Divider className="my-2" />
                                        <div className="text-sm">
                                          <div className="text-gray-500 mb-2">修改建议:</div>
                                          <div className="space-y-2">
                                            {suggestions.map((sug: any, idx: number) => (
                                              <div
                                                key={idx}
                                                className="pl-3 border-l-2 border-blue-400"
                                              >
                                                {sug.chapter && (
                                                  <div className="font-medium text-gray-700">
                                                    章节: {sug.chapter}
                                                  </div>
                                                )}
                                                {sug.issueFound && (
                                                  <div className="text-gray-600 text-xs mt-1">
                                                    发现的问题: {sug.issueFound}
                                                  </div>
                                                )}
                                                {sug.revSuggestion && (
                                                  <div className="text-gray-600 text-xs mt-1">
                                                    修改建议: {sug.revSuggestion}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        ) : (
                          <Empty
                            description="暂无专家审查记录"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        )}
                      </Timeline.Item>

                      {/* 专业审议阶段 */}
                      <Timeline.Item
                        color="blue"
                        dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}
                      >
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">专家委员会审议</span>
                        </div>
                        <Card size="small" className="shadow-sm bg-blue-50 border-blue-200">
                          <div className="text-center text-gray-600">
                            <ClockCircleOutlined className="text-2xl text-blue-500 mb-2" />
                            <div>待专家委员会审议...</div>
                          </div>
                        </Card>
                      </Timeline.Item>
                    </Timeline>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};
