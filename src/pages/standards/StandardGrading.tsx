import React, { useState, useEffect } from 'react';
import { Award, Plus, Search, Filter, Eye, CreditCard as Edit, Trash2, ChevronDown, ChevronRight, Target, Layers, BookOpen, Users, Settings, FileText, Download, Upload, XCircle, Send } from 'lucide-react';
import { message, Tooltip } from 'antd';

import { getGradingStandardStatistics, getStandardLevelList, getStandardAbilityList, getStandardCurrentVersion, postGradingStandardPublish } from '@/api/standards';
import { StandardGradingStatistics } from '@/api/standards/type';
import { getLevelFontColor, getLevelBgColor } from '@/api/standards/util';
const StandardGrading: React.FC = () => {
  const [statsData, setStatsData] = useState({} as StandardGradingStatistics);
  const [frameworkData, setFrameworkData] = useState({} as any);
  const [standardAbilityListData, setStandardAbilityListData] = useState({} as any);
  const [activeTab, setActiveTab] = useState<string>('framework');
  const [loadingFramework, setLoadingFramework] = useState(true);
  const [standardCurrentVersion, setStandardCurrentVersion] = useState({} as any);
  //const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchStatisticsData();
    fetchStandardAbilityListData();
    fetchFrameworkData();
    fetchStandardCurrentVersion();
  }, []);
  const fetchStandardCurrentVersion = async () => {
    try {
      getStandardCurrentVersion()
        .then(data => {
          setStandardCurrentVersion(data);
        })
    } catch (error) {
      console.error('获取职业教育标准-当前版本数据时错误:', error);
      message.error('获取职业教育标准-当前版本数据时发生错误');
    } finally {
      //setLoadingFramework(false);
    }
  };
  const fetchStatisticsData = async () => {
    try {
      getGradingStandardStatistics()
        .then(data => {
          setStatsData(data);
        })
    } catch (error) {
      console.error('获取分级标准统计数据时错误:', error);
      message.error('获取分级标准统计数据时发生错误');
    } finally {
      //setLoadingFramework(false);
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
      console.error('获取标准框架数据时错误:', error);
      message.error('获取标准框架数据时发生错误');
    } finally {
      setLoadingFramework(false);
    }
  };
  const fetchStandardAbilityListData = async () => {
    try {
      //setLoadingFramework(true);
      getStandardAbilityList()
        .then(data => {
          setStandardAbilityListData(data);
        })
    } catch (error) {
      console.error('获取分级数据时错误:', error);
      message.error('获取分级数据时发生错误');
    } finally {
      //setLoadingFramework(false);
    }
  };
  const handlePublish = async () => {
    try {
      //setPublishing(true);
      postGradingStandardPublish({ status: 1 })
        .then(_ => {
          fetchStandardCurrentVersion();
        })
    } catch (error) {
      console.error('提交发布时发生错误:', error);
      message.error('提交发布时发生错误');
    } finally {
      //setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      //setPublishing(true);
      postGradingStandardPublish({ status: 0 })
        .then(_ => {
          fetchStandardCurrentVersion();
        })
    } catch (error) {
      console.error('取消发布时发生错误:', error);
      message.error('取消发布时发生错误');
    } finally {
      //setPublishing(false);
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

  const renderStandardAbilityListTable = (abilityListData: any, abilityListDataAllChildren: any[]) => {
    let lastSubItem = {} as any;
    return <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-slate-400">
        <thead className="bg-slate-100">
          <tr>
            <th className="border border-slate-400 px-4 py-4 text-center font-bold text-slate-800" rowSpan={2}>
              二级维度<br />
              <span className="text-sm font-normal">Sub-Dimensions</span>
            </th>
            <th className="border border-slate-400 px-4 py-3 text-center font-bold text-slate-800" colSpan={frameworkData?.standardLevelList.length + 1}>
              三级维度编号、名称、英文及缩写<br />
              <span className="text-sm font-normal">Competency Components: Number, Name, English, and Abbreviation</span>
            </th>
          </tr>
          <tr className="bg-slate-50">
            <th className="border border-slate-400 px-4 py-3 text-center font-semibold text-slate-700">
              名称及编码
            </th>
            {
              (standardAbilityListData?.standardLevelNameList || []).map((item: any, index: number) => (
                <th className="border border-slate-400 px-4 py-3 text-center font-semibold text-slate-700">
                  {/* {item.columName} */}
                  {`FC${index + 1}`}
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {abilityListDataAllChildren.length == 0 ? <tr>
            <td className="border border-slate-400 px-4 py-8 text-center text-slate-500" colSpan={6}>
              暂无数据
            </td>
          </tr> :
            abilityListDataAllChildren.map((threeItem: any) => {
              let isFirstRow = false;
              if (threeItem.parentAbilityid !== lastSubItem?.id) {
                isFirstRow = true;
                lastSubItem = abilityListData.find((a: any) => a.id === threeItem.parentAbilityid);
              }
              return <tr key={lastSubItem.id} className="hover:bg-slate-50 transition-colors">
                {isFirstRow && <td id={`sub-${lastSubItem.id}-1`}
                  className="border border-slate-400 px-4 py-3 font-medium text-slate-800 bg-slate-50 align-top text-center"
                  rowSpan={lastSubItem?.children.length}
                >
                  <div className="space-y-2">
                    <div className="font-bold text-lg">{lastSubItem?.abilityCode} {lastSubItem?.abilityName}</div>
                    <div className="text-sm italic text-slate-600">{lastSubItem?.abilityEname}</div>
                    <div className="flex justify-center">
                      <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center">
                        <span className="text-xs font-bold">{lastSubItem?.children.length}</span>
                      </div>
                    </div>
                  </div>
                </td>
                }
                <td className="border border-slate-400 px-4 py-3" >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{threeItem.abilityCode}</span>
                      <span className="font-medium text-slate-800">{threeItem.abilityName}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                        {threeItem.abilityAbbr}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 italic">{threeItem.abilityEname}</div>
                  </div>
                </td>
                {(standardAbilityListData?.standardLevelNameList || []).map((abilityLeveItem: any) => {
                  let findItem = threeItem.abilityLevelList.find((a: any) => a.levelId === abilityLeveItem.levelId);
                  return findItem ? <td className="border border-slate-400 px-3 py-3 text-center">
                    <span className={`px-2 py-1 ${getLevelBgColor(abilityLeveItem.levelColor)} ${getLevelFontColor(abilityLeveItem.levelColor)} rounded text-sm font-mono>}`}>
                      {findItem.abilityLevelName}
                    </span>
                  </td> : <td className="border border-slate-400 px-3 py-3 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-mono">
                    </span>
                  </td>
                })}
              </tr>
            }
            )}
        </tbody>
      </table>
    </div >
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">首页</span>
            <ChevronRight className="w-4 h-4" />
            <span className="hover:text-blue-600 cursor-pointer transition-colors">领域标准</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-blue-600 font-medium">分级标准</span>
          </div>
        </div>

        {/* {standardCurrentVersion && <div className="flex space-x-2">
          {standardCurrentVersion.abilityGradeStatus === 0 && <Tooltip title="提交分级标准">
            <button
              onClick={handlePublish}
              className="bg-blue-500 hover:bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </Tooltip>
          }
          {standardCurrentVersion.abilityGradeStatus === 1 && <Tooltip title="取消提交">
            <button
              onClick={handleUnpublish}
              className="bg-orange-500 hover:bg-orange-600 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </Tooltip>
          }
        </div>
        } */}
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">一级维度</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statsData?.oneNum}</p>
            </div>
            <Layers className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">二级维度</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statsData?.twoNum}</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">三级维度</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statsData?.threeNum}</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">等级水平</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{statsData?.levelNum}</p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('framework')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'framework'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              标准框架
            </button>
            {(standardAbilityListData?.standardGradingList || []).map((tabItem: any) => {
              return <button
                onClick={() => setActiveTab(tabItem.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tabItem.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                {`${tabItem.abilityName}`}分组
              </button>
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'framework' && (
            <div>
              {renderFrameworkTable()}
            </div>
          )}

          {(standardAbilityListData?.standardGradingList || []).map((tabItem: any, index: number) => {
            let abilityListData = standardAbilityListData?.standardAbilityGradingMap[tabItem.abilityName];
            let abilityListDataAllChildren: any = [];
            abilityListData?.map((a: any) => abilityListDataAllChildren.push(...a.children));

            // 根据索引分配颜色（第一个蓝色，第二个绿色，第三个橙色）
            let bgColor, borderColor, titleColor, btnColor, shadowColor;
            if (index === 0) {
              bgColor = 'bg-blue-50';
              borderColor = 'border-blue-200';
              titleColor = 'text-blue-800';
              btnColor = '#0ea5e9';
              shadowColor = 'rgba(14, 165, 233, 0.3)';
            } else if (index === 1) {
              bgColor = 'bg-green-50';
              borderColor = 'border-green-200';
              titleColor = 'text-green-800';
              btnColor = '#22c55e';
              shadowColor = 'rgba(34, 197, 94, 0.3)';
            } else if (index === 2) {
              bgColor = 'bg-orange-50';
              borderColor = 'border-orange-200';
              titleColor = 'text-orange-800';
              btnColor = '#f97316';
              shadowColor = 'rgba(249, 115, 22, 0.3)';
            } else {
              // 其他使用默认灰色
              bgColor = 'bg-gray-50';
              borderColor = 'border-gray-200';
              titleColor = 'text-gray-800';
              btnColor = '#6b7280';
              shadowColor = 'rgba(107, 114, 128, 0.3)';
            }

            return activeTab === tabItem.id && (
              <div key={tabItem.id}>
                <div className="mb-6">
                  <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-semibold ${titleColor} mb-1`}>{tabItem.abilityName}</h3>
                        <p className="text-gray-700 text-sm">{tabItem.remark}</p>
                      </div>
                      <button
                        type="button"
                        className="flex items-center justify-center w-11 h-11 rounded-lg text-white shadow-md hover:scale-105 transition-transform"
                        style={{ backgroundColor: btnColor, borderColor: btnColor, boxShadow: `${shadowColor} 0px 2px 8px`, fontWeight: 500 }}
                      >
                        <BookOpen className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                {renderStandardAbilityListTable(abilityListData, abilityListDataAllChildren)}
              </div>
            );
          })}
        </div>
      </div>

      {/* 框架说明 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">框架说明</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">基础能力维度</h4>
            <p className="text-blue-700 text-sm mb-3">
              涵盖职业素养和专业知识技能，是职业教育的基础要素
            </p>
            <div className="text-sm text-blue-600">
              • 职业素养：职业观念、行为素养<br />
              • 专业能力：理论知识、技能应用
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">行动能力维度</h4>
            <p className="text-green-700 text-sm mb-3">
              包含工作准备、执行和应变能力，强调实际操作技能
            </p>
            <div className="text-sm text-green-600">
              • 工作准备：任务理解、明确责任等<br />
              • 工作执行：有效沟通、数据驱动等<br />
              • 工作应变：情境适应、问题解决等
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">发展能力维度</h4>
            <p className="text-purple-700 text-sm mb-3">
              注重个人发展、人际交往和创新能力的培养
            </p>
            <div className="text-sm text-purple-600">
              • 个人能力：自我学习、自我管理<br />
              • 人际能力：人际沟通、与人合作<br />
              • 创新能力：创新思维、创新实践、数智应用
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};


export default StandardGrading;