import React, { useEffect, useState } from 'react';

import { Activity, BookOpen, Brain, Building2, Calendar, CheckCircle, Edit, FileText, Globe, Layers, Network, Send, Target, Users, Zap } from 'lucide-react';
import { getHomeStatistics } from '@/api/dashboard';
import { message } from 'antd';
import { getStandardLevelList } from '@/api/standards';
import { getLevelBgColor, getLevelColor, getLevelFontColor } from '@/api/standards/util';

const Dashboard: React.FC = () => {
  const [statsData, setstatsData] = useState({} as any);
  const [frameworkData, setFrameworkData] = useState({} as any);
  const [loadingFramework, setLoadingFramework] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
              {/* 第一行：放大加粗 */}
              <th className="border border-slate-400 px-4 py-4 text-center text-base font-bold text-slate-800" rowSpan={2}>
                国际职业教育分级
              </th>
              <th className="border border-slate-400 px-4 py-3 text-center text-base font-bold text-slate-800" colSpan={frameworkData?.educationGradingList?.length || 0}>
                对应国际教育分级
              </th>
              <th className="border border-slate-400 px-4 py-3 text-center text-base font-bold text-slate-800" colSpan={frameworkData?.standardGradingList?.length || 0}>
                分级标准
              </th>
            </tr>
            <tr className="bg-slate-50">
              {/* 第二行：放大加粗 */}
              {(frameworkData?.educationGradingList || []).map((item: string) => (
                <th id={item} className="border border-slate-400 px-4 py-3 text-center text-base font-bold text-slate-700">
                  {item}
                </th>
              ))
              }
              {(frameworkData?.standardGradingList || []).map((item: any) => (
                <th id={item.id} className="border border-slate-400 px-4 py-3 text-center text-base font-bold text-slate-700">
                  {item.abilityName}
                </th>
              ))
              }
            </tr>
          </thead>
          <tbody>
            {(frameworkData?.standardLevelList || []).map((row: any) => (
              <tr key={row?.levelCode} className="hover:bg-slate-50 transition-colors">
                {/* 第一列：放大加粗 */}
                <td className="border border-slate-400 px-4 py-4 text-center text-base font-bold text-slate-800 bg-slate-50">
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

  const handleStepChange = (step: number) => {
    if (step <= currentStep + 1) {
      setCurrentStep(step);
    }
  };
  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };
  const steps = [
    {
      id: 1,
      title: '准备阶段',
      subtitle: '熟悉深圳协议方案',
      description: '学习深圳协议方案1.2.3章内容，掌握IVRL等级水平和目标分类框架',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      stats: { count: 1, label: '核心内容' }
    },
    {
      id: 2,
      title: '构建能力分级表',
      subtitle: '建立精准映射关系',
      description: '参照深圳协议方案，构建本职业领域与IVRL框架的映射对照表',
      icon: Network,
      color: 'from-purple-500 to-purple-600',
      stats: { count: 2, label: '映射维度' }
    },
    {
      id: 3,
      title: '撰写标准文件',
      subtitle: '编制标准文档',
      description: '按照深圳协议职业领域标准文件结构撰写完整标准文件',
      icon: FileText,
      color: 'from-green-500 to-green-600',
      stats: { count: 3, label: '文件结构' }
    },
    {
      id: 4,
      title: '内部审查',
      subtitle: '专业委员会审查',
      description: '组织专业委员会核心专家对标准草案进行严谨审查',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      stats: { count: 4, label: '审查要点' }
    },
    {
      id: 5,
      title: '行业审查',
      subtitle: '行业专家论证',
      description: '邀请行业专家、企业技术负责人等组成审查专家组进行全面审查',
      icon: Target,
      color: 'from-cyan-500 to-cyan-600',
      stats: { count: 5, label: '审查重点' }
    },
    {
      id: 6,
      title: '修订完善',
      subtitle: '根据意见修订',
      description: '根据内外部审查意见对标准草案进行认真修订和完善',
      icon: Edit,
      color: 'from-pink-500 to-pink-600',
      stats: { count: 6, label: '修订要点' }
    },
    {
      id: 7,
      title: '提交送审',
      subtitle: '提交秘书处审批',
      description: '提交经过充分修订和完善的职业领域标准送审稿',
      icon: Send,
      color: 'from-indigo-500 to-indigo-600',
      stats: { count: 7, label: '提交材料' }
    }
  ];

  const coreFeatures = [
    {
      id: 'protocol-framework',
      title: '深圳协议框架',
      icon: Brain,
      description: 'IVRL等级水平与目标分类'
    },
    {
      id: 'mapping-construction',
      title: '能力分级表构建',
      icon: Activity,
      description: '精准映射关系建立'
    },
    {
      id: 'standard-writing',
      title: '标准文件撰写',
      icon: Globe,
      description: '规范化标准文档编制'
    },
    {
      id: 'review-process',
      title: '审查流程',
      icon: Zap,
      description: '内外部专业审查论证'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      </div> */}

      {/* 深圳协议框架核心 */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white shadow-2xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br  from-blue-500/20 to-cyan-500/20" />
            <div className="absolute top-4 left-4 w-32 h-32 bg-blue-400/10 rounded-full blur-xl" />
            <div className="absolute bottom-4 right-4 w-40 h-40 bg-cyan-400/10 rounded-full blur-xl" />
          </div>

          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center mb-6">
              <Network className="w-12 h-12 text-blue-400 mr-4" />
              <h2 className="text-3xl font-bold">深圳协议国际职业教育标准</h2>
            </div>

            <p className="text-xl text-gray-300 mb-8">
              基于IVRL等级水平与目标分类的标准体系
            </p>

            {/* Core Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {coreFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
                  >
                    <Icon className="w-8 h-8 text-blue-400 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300" />
                    {/* 核心标题放大加粗 */}
                    <h4 className="text-base font-bold mb-2">{feature.title}</h4>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </div>
                );
              })}
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

      {/* 步骤导航 */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">职业领域标准制定流程</h3>
          <div className="text-sm text-gray-600">
            步骤 {currentStep} / {steps.length}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(step.id);

              return (
                <div key={step.id} className="flex flex-col items-center relative">
                  <button
                    onClick={() => handleStepChange(step.id)}
                    disabled={step.id > currentStep + 1}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${status === 'completed'
                      ? 'bg-green-500 text-white shadow-lg'
                      : status === 'current'
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg scale-110`
                        : 'bg-gray-200 text-gray-400'
                      } ${step.id <= currentStep + 1 ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                  >
                    {status === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </button>

                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${status === 'current' ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 max-w-20">
                      {step.subtitle}
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className={`absolute top-6 left-12 w-full h-0.5 ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                      }`} style={{ width: 'calc(100vw / 7 - 3rem)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;