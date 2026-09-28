import React from 'react';
import { Form, Radio, Input, Button, Card } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  SendOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { DeliberationDecision } from './types';

const { TextArea } = Input;

interface DeliberationFormProps {
  form: FormInstance;
  deliberationDecision: DeliberationDecision;
  onDecisionChange: (decision: DeliberationDecision) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export const DeliberationForm: React.FC<DeliberationFormProps> = ({
  form,
  deliberationDecision,
  onDecisionChange,
  onSubmit,
  loading,
}) => {
  return (
    <Card
      className="bg-white rounded-xl shadow-sm border border-slate-200 sticky top-4"
      title={
        <span className="text-lg font-semibold">
          <AuditOutlined /> 审议决定
        </span>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="审议决定"
          name="decision"
          rules={[{ required: true, message: '请选择审议决定' }]}
        >
          <Radio.Group
            onChange={(e) => onDecisionChange(e.target.value)}
            value={deliberationDecision}
            size="large"
          >
            <Radio.Button
              value="approved"
              style={{
                marginRight: 16,
                borderColor: deliberationDecision === 'approved' ? '#52c41a' : undefined,
                color: deliberationDecision === 'approved' ? '#52c41a' : undefined,
              }}
            >
              <CheckCircleOutlined /> 审议通过
            </Radio.Button>
            <Radio.Button
              value="rejected"
              style={{
                borderColor: deliberationDecision === 'rejected' ? '#ff4d4f' : undefined,
                color: deliberationDecision === 'rejected' ? '#ff4d4f' : undefined,
              }}
            >
              <CloseCircleOutlined /> 审议不通过
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="委员会成员姓名"
          name="auditUserName"
          rules={[{ required: true, message: '请输入委员会成员姓名' }]}
        >
          <Input placeholder="请输入您的姓名" prefix={<UserOutlined />} size="large" />
        </Form.Item>
        <Form.Item
          label="审议意见"
          name="auditReason"
          rules={[{ required: true, message: '请输入审议意见' }]}
        >
          <TextArea
            rows={6}
            placeholder="请详细说明审议意见，包括标准的优点、不足、改进建议等..."
            maxLength={2000}
            showCount
          />
        </Form.Item>

        {deliberationDecision === 'rejected' && (
          <Form.Item
            label="具体修改建议"
            name="suggestions"
            rules={[{ required: true, message: '请输入具体修改建议' }]}
          >
            <TextArea
              rows={4}
              placeholder="请列举具体的修改点和建议..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
        )}

        <div className="flex space-x-3 mt-6">
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={onSubmit}
            loading={loading}
            block
            style={{
              background:
                deliberationDecision === 'approved'
                  ? '#52c41a'
                  : deliberationDecision === 'rejected'
                    ? '#ff4d4f'
                    : undefined,
            }}
          >
            {deliberationDecision === 'approved' ? '确认通过' : '确认不通过'}
          </Button>
        </div>

        {deliberationDecision === 'approved' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-green-800 text-sm">
              <strong>提示：</strong>
              审议通过后，标准将进入发布流程，请确认标准内容符合《深圳协议》要求。
            </div>
          </div>
        )}

        {deliberationDecision === 'rejected' && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-800 text-sm">
              <strong>提示：</strong>
              审议不通过后，标准将退回修订环节，请提供详细的修改建议以便撰写人改进。
            </div>
          </div>
        )}
      </Form>
    </Card>
  );
};
