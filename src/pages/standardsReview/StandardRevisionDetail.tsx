import React from 'react';
import { Button, Descriptions, Divider, Tabs, Card, Tag, Timeline, List, Table, Popover } from 'antd';
import { ArrowLeftOutlined, ZoomInOutlined } from '@ant-design/icons';
import StandardMap from '@/components/careerStandardMap';
import RichTextRender from '@/components/richEditor/RichTextRender';







interface StandardRevisionDetailProps {
  selectedDoc: any;
  appendixAttach: any;
  onBack: () => void;
}

export default function StandardRevisionDetail({
  selectedDoc,
  appendixAttach,
  onBack
}: StandardRevisionDetailProps) {
  const revisions = selectedDoc.reviseDetails;
  const reviews = selectedDoc.auditDetails;
  return (
    <div className="bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm -mx-6 -mt-6 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
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
                          <Descriptions.Item label={term.term || `术语 ${index + 1}`} key={index}>
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
                        专家论证意见
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
              key: 'revisions',
              label: `修订历史 (${revisions?.length})`,
              children: (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {revisions?.length > 0 ? (
                    <Timeline>
                      {revisions.map((revision: any) => (
                        <Timeline.Item key={revision.id} color="blue">
                          <Card size="small" className="shadow-sm">
                            <Descriptions column={2} size="small" bordered>
                              <Descriptions.Item label="修订人">{revision.reviseUserName}</Descriptions.Item>
                              <Descriptions.Item label="修订日期">
                                {new Date(revision.updateTime).toLocaleString('zh-CN')}
                              </Descriptions.Item>
                              <Descriptions.Item label="状态">
                                <Tag color={revision.status === 1 ? 'green' : 'orange'}>
                                  {revision.status === 1 ? '已提交' : '草稿'}
                                </Tag>
                              </Descriptions.Item>
                              <Descriptions.Item label="修订说明" span={2}>
                                {revision.reviseRemark}
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      暂无修订历史
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'reviews',
              label: `审查记录 (${reviews?.length})`,
              children: (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {reviews?.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <Card key={review.id} className="shadow-sm">
                          <div style={{ marginBottom: '12px' }}>
                            <Tag color={review.auditStage === 1 ? 'blue' : review.auditStage === 2 ? 'purple' : 'cyan'}>
                              {review.auditStage === 1 ? '内部审查' : review.auditStage === 2 ? '行业专家审查' : '专家委员会审议'}
                            </Tag>
                            <Tag color={review.auditStatus === 3 ? 'red' : 'green'}>
                              {review.auditStatus === 3 ? '不通过' : '通过'}
                            </Tag>
                          </div>
                          {review.auditStage === 1 ? (
                            <Descriptions column={2} size="small" bordered>
                              <Descriptions.Item label="审查人">{review.auditUserName}</Descriptions.Item>
                              <Descriptions.Item label="审查日期">
                                {new Date(review.auditDate).toLocaleString('zh-CN')}
                              </Descriptions.Item>
                              <Descriptions.Item label="审查意见" span={2}>
                                {review.auditReason}
                              </Descriptions.Item>
                            </Descriptions>
                          ) : (
                            <Descriptions column={2} size="small" bordered>
                              <Descriptions.Item label="专家姓名">{review.auditUserName}</Descriptions.Item>
                              <Descriptions.Item label="职称">{review.auditUserTitle}</Descriptions.Item>
                              <Descriptions.Item label="工作单位">{review.auditUserInstitution}</Descriptions.Item>
                              <Descriptions.Item label="审查日期">
                                {new Date(review.auditDate).toLocaleString('zh-CN')}
                              </Descriptions.Item>
                              <Descriptions.Item label="审查意见" span={2}>
                                {review.auditReason}
                              </Descriptions.Item>
                              {review.suggestion && (
                                <Descriptions.Item label="修改建议" span={2}>
                                  <List
                                    size="small"
                                    dataSource={JSON.parse(review.suggestion)}
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
                                </Descriptions.Item>
                              )}
                            </Descriptions>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      暂无审查记录
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
