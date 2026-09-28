import React from 'react';
import { Card, Tabs, Button, Empty, Timeline, Tag, Typography } from 'antd';
import {
  FileTextOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  FileSearchOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import type { StandardDocument } from './types';
import StandardMap from '@/components/careerStandardMap';
import RichTextRender from '@/components/richEditor/RichTextRender';

const { Text } = Typography;

interface DeliberationContentViewProps {
  document: StandardDocument;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}

export const DeliberationContentView: React.FC<DeliberationContentViewProps> = ({
  document,
  isFullscreen,
  onFullscreenToggle,
}) => {
  // 从 auditDetails 中分离内审和专家审核记录
  const internalReviews = document.auditDetails?.filter((audit) => audit.auditStage === 1) || [];
  const expertReviews = document.auditDetails?.filter((audit) => audit.auditStage === 2) || [];

  return (
    <Card
      className="bg-white rounded-xl shadow-sm border border-slate-200"
      title={
        <span className="text-lg font-semibold">
          <FileTextOutlined /> 标准内容
        </span>
      }
      extra={
        <Button
          type="text"
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={onFullscreenToggle}
        >
          {isFullscreen ? '退出全屏' : '全屏查看'}
        </Button>
      }
    >
      <Tabs
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
              <div
                className="max-h-[600px] overflow-y-auto bg-white p-6"
                style={{ fontFamily: 'SimSun, serif' }}
              >
                <div className="space-y-6">
                  {/* 一、引言 */}
                  <div>
                    <h3 className="text-base font-bold mb-3 text-gray-900">一、引言</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                      {document.preface || '暂无内容'}
                    </div>
                  </div>

                  {/* 二、核心目的 */}
                  <div>
                    <h3 className="text-base font-bold mb-3 text-gray-900">二、核心目的</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                      {document.corePurpose || '暂无内容'}
                    </div>
                  </div>

                  {/* 三、适用范围 */}
                  <div>
                    <h3 className="text-base font-bold mb-3 text-gray-900">三、适用范围</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                      {document.scope || '暂无内容'}
                    </div>
                  </div>

                  {/* 四、术语语义 */}
                  <div>
                    <h3 className="text-base font-bold mb-3 text-gray-900">四、术语语义</h3>
                    <div className="text-gray-700 leading-relaxed">
                      {document.careerStandardTermList &&
                        document.careerStandardTermList.length > 0 ? (
                        <div className="space-y-2">
                          {document.careerStandardTermList.map((term: any, index: number) => (
                            <div key={index} className="text-justify">
                              <span className="font-medium">{term.termName}：</span>
                              <span>{term.termDefinition}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span>暂无内容</span>
                      )}
                    </div>
                  </div>

                  {/* 五、正文 */}
                  <div>
                    <h3 className="text-base font-bold mb-3 text-gray-900">五、正文</h3>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                      {/* {document.overview || '暂无内容'} */}
                      <RichTextRender content={document.overview || '暂无内容'} />
                    </div>
                  </div>

                  {/* 六、附录 */}
                  <div>
                    <h3 className="text-base font-bold mb-3 text-gray-900">六、专家论证意见</h3>
                    {document.appendixAttach ? (
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                        {document.appendixAttach}
                      </div>
                    ) : (
                      <div className="text-gray-700">暂无内容</div>
                    )}
                  </div>
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
              <div className="max-h-[600px] overflow-y-auto p-4">
                {document.careerStandardMapId ? (
                  <StandardMap mapId={String(document.careerStandardMapId)} />
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
              <div className="max-h-[600px] overflow-y-auto p-4">
                <Timeline>
                  {/* 内部审查记录 */}
                  {internalReviews.map((review, index) => {
                    // 解析打分数据
                    let scores: any[] = [];
                    try {
                      scores = review.auditScope ? JSON.parse(review.auditScope) : [];
                    } catch (e) {
                      console.error('解析打分数据失败:', e);
                    }

                    return (
                      <Timeline.Item
                        key={`internal-${index}`}
                        dot={
                          review.auditStatus === 1 ? (
                            <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                          ) : (
                            <CloseCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />
                          )
                        }
                      >
                        <Card size="small" className="mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Text strong className="text-base">
                                内部审查 - {review.auditUserName}
                              </Text>
                              <Tag color={review.auditStatus === 1 ? 'success' : 'error'}>
                                {review.auditStatus === 1 ? '通过' : '未通过'}
                              </Tag>
                            </div>
                            <div className="text-gray-600">
                              <UserOutlined /> 审查人：{review.auditUserName}
                            </div>
                            <div className="text-gray-500 text-sm">
                              审查时间：
                              {review.auditDate
                                ? new Date(review.auditDate).toLocaleString('zh-CN')
                                : '-'}
                            </div>
                            {scores.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <div className="flex gap-4 flex-wrap">
                                  {scores.map((score: any, idx: number) => (
                                    <span key={idx}>
                                      {score.category}: {score.scope}分
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {review.auditReason && (
                              <div className="mt-2 p-3 bg-gray-50 rounded">
                                <Text type="secondary">审查意见：</Text>
                                <div className="mt-1 whitespace-pre-wrap">{review.auditReason}</div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Timeline.Item>
                    );
                  })}

                  {/* 专家审查记录 */}
                  {expertReviews.map((review, index) => {
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
                      suggestions = review.suggestion ? JSON.parse(review.suggestion) : [];
                    } catch (e) {
                      console.error('解析修改建议失败:', e);
                    }

                    return (
                      <Timeline.Item
                        key={`expert-${index}`}
                        dot={
                          review.auditStatus === 1 ? (
                            <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                          ) : (
                            <CloseCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />
                          )
                        }
                      >
                        <Card size="small" className="mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Text strong className="text-base">
                                行业专家审查 - {review.auditUserName}
                              </Text>
                              <Tag color={review.auditStatus === 1 ? 'success' : 'error'}>
                                {review.auditStatus === 1 ? '通过' : '未通过'}
                              </Tag>
                            </div>
                            <div className="text-gray-600">
                              <UserOutlined /> 专家：{review.auditUserName}
                            </div>
                            <div className="text-gray-500 text-sm">
                              审查时间：
                              {review.auditDate
                                ? new Date(review.auditDate).toLocaleString('zh-CN')
                                : '-'}
                            </div>
                            {scores.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <div className="flex gap-4 flex-wrap">
                                  {scores.map((score: any, idx: number) => (
                                    <span key={idx}>
                                      {score.category}: {score.scope}分
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {review.auditReason && (
                              <div className="mt-2 p-3 bg-gray-50 rounded">
                                <Text type="secondary">审查意见：</Text>
                                <div className="mt-1 whitespace-pre-wrap">{review.auditReason}</div>
                              </div>
                            )}
                            {suggestions.length > 0 && (
                              <div className="mt-2 p-3 bg-blue-50 rounded">
                                <Text type="secondary">修改建议：</Text>
                                <div className="mt-1 space-y-2">
                                  {suggestions.map((sug: any, idx: number) => (
                                    <div key={idx} className="pl-3 border-l-2 border-blue-400">
                                      {sug.chapter && (
                                        <div className="font-medium">章节: {sug.chapter}</div>
                                      )}
                                      {sug.issueFound && (
                                        <div className="text-xs mt-1">
                                          发现的问题: {sug.issueFound}
                                        </div>
                                      )}
                                      {sug.revSuggestion && (
                                        <div className="text-xs mt-1">
                                          修改建议: {sug.revSuggestion}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Timeline.Item>
                    );
                  })}

                  {/* 如果没有任何审查记录 */}
                  {internalReviews.length === 0 && expertReviews.length === 0 && (
                    <Empty description="暂无审查记录" />
                  )}
                </Timeline>
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
};
