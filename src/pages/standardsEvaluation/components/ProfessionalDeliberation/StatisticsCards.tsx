import React from 'react';
import { Row, Col, Card } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AuditOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { Statistics } from './types';

interface StatisticsCardsProps {
  statistics: Statistics;
  loading?: boolean;
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ statistics, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">审议总数</p>
            <h3 className="text-3xl font-bold text-gray-800">{statistics.total}</h3>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileTextOutlined className="text-2xl text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">待审议</p>
            <h3 className="text-3xl font-bold text-gray-800">{statistics.pending}</h3>
          </div>
          <div className="w-14 h-14 bg-orange-50 rounded-lg flex items-center justify-center">
            <ClockCircleOutlined className="text-2xl text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">已通过</p>
            <h3 className="text-3xl font-bold text-gray-800">{statistics.approved}</h3>
          </div>
          <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center">
            <CheckCircleOutlined className="text-2xl text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">未通过</p>
            <h3 className="text-3xl font-bold text-gray-800">{statistics.rejected}</h3>
          </div>
          <div className="w-14 h-14 bg-red-50 rounded-lg flex items-center justify-center">
            <CloseCircleOutlined className="text-2xl text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
