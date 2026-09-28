import React from 'react';
import { Timeline, Card, Tag, Empty, Row, Col } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import type { InternalReview, ExpertReview } from './types';

interface ReviewRecordsProps {
  internalReviews: InternalReview[];
  expertReviews: ExpertReview[];
}

export const ReviewRecords: React.FC<ReviewRecordsProps> = ({ internalReviews, expertReviews }) => {
  return (
    <div className="space-y-6">
      {/* 内部审查记录 */}
      <div>
        <div className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <div className="w-1 h-5 bg-blue-500 mr-3 rounded" />
          内部审查记录
        </div>
        {internalReviews.length > 0 ? (
          <Card className="shadow-sm">
            <Timeline>
              {internalReviews.map((review) => (
                <Timeline.Item
                  key={review.id}
                  dot={
                    review.status === 'approved' ? (
                      <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />
                    )
                  }
                  color={review.status === 'approved' ? 'green' : 'red'}
                >
                  <div className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <UserOutlined className="text-gray-400" />
                        <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                        <Tag color={review.status === 'approved' ? 'success' : 'error'}>
                          {review.status === 'approved' ? '通过' : '未通过'}
                        </Tag>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <CalendarOutlined className="mr-1" />
                        {new Date(review.review_date).toLocaleString('zh-CN')}
                      </div>
                    </div>

                    <Row gutter={16} className="mb-3">
                      <Col span={6}>
                        <div className="text-xs text-gray-500">科学性</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {review.scientific_score}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="text-xs text-gray-500">前瞻性</div>
                        <div className="text-lg font-semibold text-green-600">
                          {review.forward_looking_score}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="text-xs text-gray-500">完整性</div>
                        <div className="text-lg font-semibold text-purple-600">
                          {review.completeness_score}
                        </div>
                      </Col>
                      <Col span={6}>
                        <div className="text-xs text-gray-500">可操作性</div>
                        <div className="text-lg font-semibold text-orange-600">
                          {review.operability_score}
                        </div>
                      </Col>
                    </Row>

                    {review.review_comments && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start">
                          <CommentOutlined className="text-gray-400 mt-1 mr-2" />
                          <div className="flex-1 text-gray-700 text-sm">
                            {review.review_comments}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        ) : (
          <Empty description="暂无内部审查记录" />
        )}
      </div>

      {/* 专家审查记录 */}
      <div>
        <div className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
          <div className="w-1 h-5 bg-purple-500 mr-3 rounded" />
          专家审查记录
        </div>
        {expertReviews.length > 0 ? (
          <Card className="shadow-sm">
            <Timeline>
              {expertReviews.map((review) => (
                <Timeline.Item
                  key={review.id}
                  dot={
                    review.status === 'approved' ? (
                      <CheckCircleOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                    ) : (
                      <CloseCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />
                    )
                  }
                  color={review.status === 'approved' ? 'green' : 'red'}
                >
                  <div className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <UserOutlined className="text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900">{review.expert_name}</span>
                          <span className="text-gray-500 text-sm ml-2">{review.expert_title}</span>
                          <span className="text-gray-400 text-sm ml-2">
                            {review.expert_organization}
                          </span>
                        </div>
                        <Tag color={review.status === 'approved' ? 'success' : 'error'}>
                          {review.status === 'approved' ? '通过' : '未通过'}
                        </Tag>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <CalendarOutlined className="mr-1" />
                        {new Date(review.review_date).toLocaleString('zh-CN')}
                      </div>
                    </div>

                    <Row gutter={16} className="mb-3">
                      <Col span={5}>
                        <div className="text-xs text-gray-500">科学性</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {review.scientific_score || 0}
                        </div>
                      </Col>
                      <Col span={5}>
                        <div className="text-xs text-gray-500">前瞻性</div>
                        <div className="text-lg font-semibold text-green-600">
                          {review.forward_looking_score || 0}
                        </div>
                      </Col>
                      <Col span={5}>
                        <div className="text-xs text-gray-500">完整性</div>
                        <div className="text-lg font-semibold text-purple-600">
                          {review.completeness_score || 0}
                        </div>
                      </Col>
                      <Col span={5}>
                        <div className="text-xs text-gray-500">可操作性</div>
                        <div className="text-lg font-semibold text-orange-600">
                          {review.operability_score || 0}
                        </div>
                      </Col>
                      <Col span={4}>
                        <div className="text-xs text-gray-500">综合评分</div>
                        <div className="text-lg font-semibold text-red-600">
                          {review.comprehensive_score || 0}
                        </div>
                      </Col>
                    </Row>

                    {review.review_comments && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start">
                          <CommentOutlined className="text-gray-400 mt-1 mr-2" />
                          <div className="flex-1 text-gray-700 text-sm">
                            {review.review_comments}
                          </div>
                        </div>
                      </div>
                    )}

                    {review.suggestions && review.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-sm font-medium text-gray-700">修改建议：</div>
                        {review.suggestions.map((suggestion: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                          >
                            <div className="text-sm text-gray-700">{suggestion.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        ) : (
          <Empty description="暂无专家审查记录" />
        )}
      </div>
    </div>
  );
};
