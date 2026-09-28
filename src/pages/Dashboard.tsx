import React, { useEffect, useState } from 'react';

import { Building2, Calendar, FileText, Layers, Users } from 'lucide-react';
import { getHomeStatistics } from '@/api/dashboard';
import { message } from 'antd';
import { getStandardLevelList } from '@/api/standards';
import { getLevelBgColor, getLevelColor, getLevelFontColor } from '@/api/standards/util';

const Dashboard: React.FC = () => {
  const [statsData, setstatsData] = useState({} as any);
  const [frameworkData, setFrameworkData] = useState({} as any);
  const [loadingFramework, setLoadingFramework] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchFrameworkData()

  }, []);

  const fetchData = async () => {
    try {
      getHomeStatistics()
        .then(data => {
          setstatsData(data);
        })
    } catch (error) {
      message.error('获取等级列表时发生错误');
    } finally {
    }
  };
  const fetchFrameworkData = async () => {
    try {
      setLoadingFramework(true);
      getStandardLevelList()
        .then(data => {
          setFrameworkData(data);
        })
    } catch (error) {
      message.error('获取标准框架数据时发生错误');
    } finally {
      setLoadingFramework(false);
    }
  };

  const renderFrameworkTable = () => {
    let block = (<div className="overflow-x-auto">
      {loadingFramework ? (
        <div className="text-center py-8 text-slate-600">加载中...</div>
      ) : (
        <table className="w-full border-collapse border border-slate-400">
          <thead className="bg-slate-100">
            <tr>
              <th className="border border-slate-400 px-4 py-4 text-center font-bold text-slate-800" rowSpan={2}>
                国际职业教育分级
              </th>
              <th className="border border-slate-400 px-4 py-3 text-center font-bold text-slate-800" colSpan={frameworkData?.educationGradingList?.length || 0}>
                对应国际教育分级
              </th>
              <th className="border border-slate-400 px-4 py-3 text-center font-bold text-slate-800" colSpan={frameworkData?.standardGradingList?.length || 0}>
                分级标准
              </th>
            </tr>
            <tr className="bg-slate-50">
              {(frameworkData?.educationGradingList || []).map((item: string) => (
                <th id={item} className="border border-slate-400 px-4 py-3 text-center font-semibold text-slate-700">
                  {item}
                </th>
              ))
              }
              {(frameworkData?.standardGradingList || []).map((item: any) => (
                <th id={item.id} className="border border-slate-400 px-4 py-3 text-center font-semibold text-slate-700">
                  {item.abilityName}
                </th>
              ))
              }
            </tr>
          </thead>
          <tbody>
            {(frameworkData?.standardLevelList || []).map((row: any) => (
              <tr key={row?.levelCode} className="hover:bg-slate-50 transition-colors">
                <td className="border border-slate-400 px-4 py-4 text-center font-semibold text-slate-800 bg-slate-50">
                  {row?.levelName}（{row?.levelCode}）
                </td>
                {(frameworkData?.educationGradingList || []).map((item: string) => (
                  <td className="border border-slate-400 px-4 py-3 text-center font-medium text-slate-700">
                    {row[item.toLowerCase()]}
                  </td>
                ))
                }
                {(frameworkData?.standardGradingList || []).map((item: any) => {
                  let find = (row?.abilityLevelList || []).find((a: any) => a.abilityId === item.id);
                  if (find) {
                    return (<td className="border border-slate-400 px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelBgColor(row?.levelColor)} ${getLevelFontColor(row?.levelColor)}`}
                      >
                        {find?.abilityLevelValue}
                      </span>
                    </td>);
                  }
                  else {
                    return (<td className="border border-slate-400 px-4 py-3 text-center"></td>);
                  }
                })
                }
              </tr>
            ))}
          </tbody>
        </table>
      )
      }
    </div >);
    return block;
  };

  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">用户总数</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statsData?.userNum}</p>
            </div>
            <div className={`${getLevelColor('blue')} p-3 rounded-xl`}>
              <Layers className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">学习者数</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statsData?.studentNum}</p>
            </div>
            <div className={`${getLevelColor('orange')} p-3 rounded-xl`}>
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">签约机构数</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statsData?.orgNum}</p>
            </div>
            <div className={`${getLevelColor('cyan')} p-3 rounded-xl`}>
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">职业领域数</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statsData?.careerNum}</p>
            </div>
            <div className={`${getLevelColor('green')} p-3 rounded-xl`}>
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 国际职业教育分级标准框架 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">国际职业教育分级标准框架</h2>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            {/* <Calendar className="w-4 h-4" />
            <span>最后更新: {new Date().toLocaleDateString('zh-CN')}</span> */}
          </div>
        </div>

        {/* 框架说明 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">国际职业教育分级标准的完整体系结构（3个一级维度、8个二级维度、24个三级维度），包含对应国际教育分级和分级标准的映射关系</h3>
        </div>

        {/* IVRL框架表格 */}
        {renderFrameworkTable()}

        {/* 框架说明 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">基础能力维度</h4>
            <p className="text-blue-700 text-sm">
              涵盖职业素养和专业知识技能，是职业教育的基础要素
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">行动能力维度</h4>
            <p className="text-green-700 text-sm">
              包含工作准备、执行和应变能力，强调实际操作技能
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">发展能力维度</h4>
            <p className="text-purple-700 text-sm">
              注重个人发展、人际交往和创新能力的培养
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


