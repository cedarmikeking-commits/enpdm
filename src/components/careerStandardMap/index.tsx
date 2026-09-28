import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Modal, message, Spin, Empty } from 'antd';
import { ZoomInOutlined } from '@ant-design/icons';

import { getLevelFontColor, getLevelBgColor } from '@/api/standards/util';
import { getCareerStandardMapDetail } from '@/api/careerStandardMap/index';
const { Text } = Typography;

const StandardMap: React.FC<{ mapId: string; className?: string }> = ({ mapId, className }) => {
  const [loading, setLoading] = useState(false);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [zoomContent, setZoomContent] = useState<{ title: string; content: string }>({
    title: '',
    content: '',
  });
  const [mappingData, setMappingData] = useState<any>(null);
  const [mappingDoc, setMappingDoc] = useState<any>(null);
  const fetchDocument = async () => {
    setLoading(true);
    try {
      getCareerStandardMapDetail({ mapId: mapId }).then((data) => {
        setMappingDoc(data);
        let { standardMappingVO } = data;
        let buildData = buildMappingData(standardMappingVO);
        setMappingData(buildData);
      });
    } catch (error) {
      console.error('加载文档数据时错误:', error);
      message.error('加载文档时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const buildMappingData = (data: any): any => {
    //数据加工
    let { standardMappingValueList } = data;
    let oneLevels: any[] = [];
    const twoLevels: any[] = [];
    standardMappingValueList.map((item: any) => {
      //一级
      let oneLevel = oneLevels.find((a) => a.abilityCode === item.abilityOneCode);
      if (!oneLevel) {
        oneLevel = {
          abilityCode: item.abilityOneCode,
          abilityName: item.abilityOneName,
          childrenNum: 1,
          level: 1,
        };
        oneLevels.push(oneLevel);
      } else {
        oneLevel.childrenNum += 1;
      }

      //二级
      let twoLevel = twoLevels.find((a) => a.abilityCode === item.abilityTwoCode);
      if (!twoLevel) {
        twoLevel = {
          abilityCode: item.abilityTwoCode,
          abilityName: item.abilityTwoName,
          childrenNum: 1,
          level: 2,
        };
        twoLevels.push(twoLevel);
      } else {
        twoLevel.childrenNum += 1;
      }
    });

    return { ...data, oneLevels, twoLevels };
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const handleZoomClick = (title: string, content: string) => {
    setZoomContent({ title, content });
    setZoomModalVisible(true);
  };
  const renderMappingTable = () => {
    let currentOneLevel: any = {};
    let currentTwoLevel: any = {};
    return (
      <div className={className} style={{ width: '100%' }}>
        <table className="w-full border-collapse border border-slate-300">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
            <tr>
              <th rowSpan={2} className="border border-slate-300 px-4 py-4 text-center font-bold text-slate-700 w-24">
                <div className="text-sm">一级维度</div>
              </th>
              <th rowSpan={2} className="border border-slate-300 px-4 py-4 text-center font-bold text-slate-700 w-32">
                <div className="text-sm">二级维度</div>
                {/* <div className="text-xs text-slate-500 font-normal mt-1">(代码/名称)</div> */}
              </th>
              <th rowSpan={2} className="border border-slate-300 px-4 py-4 text-center font-bold text-slate-700 w-32">
                <div className="text-sm">三级维度</div>
                {/* <div className="text-xs text-slate-500 font-normal mt-1">(代码/名称)</div> */}
              </th>
              <th rowSpan={2} className="border border-slate-300 px-4 py-4 text-center font-bold text-slate-700 w-48">
                <div className="text-sm">内涵</div>
              </th>
              {/* {(mappingData?.levelNameList || []).map((levelInfo: any, index: number) => {
                return (
                  <th
                    key={index}
                    className="border border-slate-300 px-4 py-4 text-center font-bold text-slate-700 w-48"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span
                        className={`px-2 py-1 ${getLevelBgColor(levelInfo.levelColor)} ${getLevelFontColor(levelInfo.levelColor)} rounded text-xs font-bold`}
                      >
                        {levelInfo.levelName}
                      </span>
                    </div>
                  </th>
                );
              })} */}
               {/* 合并4列：能力等级标准 */}
                <th
                  colSpan={4}
                  className="border border-slate-300 px-4 py-4 text-center font-bold text-slate-700"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="px-2 py-1 rounded text-xs font-bold">
                      能力等级标准
                    </span>
                  </div>
                </th>
            </tr>
             {/* 第二行：四级子表头 */}
              <tr>
                <th
                  className="border border-slate-300 px-4 py-3 text-center font-bold text-slate-700"
                  style={{ minWidth: 120 }}
                >
                  <div className="text-sm">一级</div>
                </th>
                <th
                  className="border border-slate-300 px-4 py-3 text-center font-bold text-slate-700"
                  style={{ minWidth: 120 }}
                >
                  <div className="text-sm">二级</div>
                </th>
                <th
                  className="border border-slate-300 px-4 py-3 text-center font-bold text-slate-700"
                  style={{ minWidth: 120 }}
                >
                  <div className="text-sm">三级</div>
                </th>
                <th
                  className="border border-slate-300 px-4 py-3 text-center font-bold text-slate-700"
                  style={{ minWidth: 120 }}
                >
                  <div className="text-sm">四级</div>
                </th>
              </tr>
          </thead>
          <tbody>
            {(mappingData?.standardMappingValueList || []).map((row: any, index: number) => {
              let findOneLevel = mappingData?.oneLevels.find(
                (one: any) => one.abilityCode === row.abilityOneCode
              );
              if (findOneLevel.abilityCode != currentOneLevel.abilityCode) {
                currentOneLevel = { ...findOneLevel, renderCount: 0 };
              } else {
                currentOneLevel = findOneLevel;
              }
              currentOneLevel.renderCount++;

              let findTwoLevel = mappingData?.twoLevels.find(
                (two: any) => two.abilityCode === row.abilityTwoCode
              );
              if (findTwoLevel.abilityCode != currentTwoLevel.abilityCode) {
                currentTwoLevel = { ...findTwoLevel, renderCount: 0 };
              } else {
                currentTwoLevel = findTwoLevel;
              }
              currentTwoLevel.renderCount++;

              return (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                  {/* 一级维度 */}
                  {currentOneLevel.renderCount === 1 && (
                    <td
                      className={`border border-slate-300 px-3 py-4 text-center font-bold align-middle`}
                      rowSpan={currentOneLevel.childrenNum}
                    >
                      <div className="flex items-center justify-center">
                        <span className="text-base font-bold">{currentOneLevel.abilityName}</span>
                      </div>
                    </td>
                  )}

                  {/* 二级维度 */}
                  {currentTwoLevel.renderCount === 1 && (
                    <td
                      className="border border-slate-300 px-3 py-4 text-center font-semibold bg-slate-50 align-middle"
                      rowSpan={currentTwoLevel.childrenNum}
                    >
                      <div className="space-y-2">
                        <div className="inline-flex items-center justify-center px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-xs font-bold">
                          {currentTwoLevel.abilityCode}
                        </div>
                        <div className="text-sm text-slate-800 font-semibold">
                          {currentTwoLevel.abilityName}
                        </div>
                      </div>
                    </td>
                  )}

                  {/* 三级组件 */}
                  <td className="border border-slate-300 px-3 py-4 text-center font-medium bg-white align-middle">
                    <div className="space-y-2">
                      <div className="inline-flex items-center justify-center px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">
                        {row.abilityThreeCode}
                      </div>
                      <div className="text-sm text-slate-800 font-semibold">
                        {row.abilityThreeName}
                      </div>
                    </div>
                  </td>

                  {/* 概念释义 */}
                  <td
                    className="border border-slate-300 px-4 py-4 text-sm text-slate-700 leading-relaxed align-middle bg-amber-50/30"
                    style={{
                      position: 'relative',
                    }}
                  // onClick={() => {
                  //   if (row.abilityConcept && row.abilityConcept !== '-') {
                  //     handleZoomClick('概念释义', row.abilityConcept);
                  //   }
                  // }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="flex-1"
                        style={{
                          maxWidth: '130px',
                          whiteSpace: 'wrap',
                          display: 'inline-block',
                        }}
                      >
                        {row.abilityConcept || '-'}
                      </span>
                      {false && row.abilityConcept && row.abilityConcept !== '-' && (
                        <ZoomInOutlined
                          style={{
                            marginLeft: '4px',
                            color: '#1890ff',
                            fontSize: '14px',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  </td>

                  {/* IVRL1-4 描述 */}
                  {(mappingData?.levelNameList || []).map((levelInfo: any, levelIndex: number) => {
                    let findDataItem = row.standardMappingLevelList.find(
                      (a: any) => a.levelName === levelInfo.levelName
                    );
                    return (
                      <td
                        key={`levelData${levelIndex}`}
                        className="border border-slate-300 px-4 py-4 text-sm text-slate-700 leading-relaxed align-top bg-green-50/20"
                        style={{
                          position: 'relative',
                        }}
                        // onClick={() => {
                        //   if (row.abilityConcept && row.abilityConcept !== '-') {
                        //     handleZoomClick(levelInfo.levelName, row.abilityConcept);
                        //   }
                        // }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="flex-1"
                            style={{
                              maxWidth: '130px',
                              whiteSpace: 'wrap',
                              display: 'inline-block',
                            }}
                          >
                            {findDataItem?.abilityLevelRemark || '-'}
                          </span>
                          {false && row.findDataItem?.abilityLevelRemark !== '-' && (
                            <ZoomInOutlined
                              style={{
                                marginLeft: '4px',
                                color: '#1890ff',
                                fontSize: '14px',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };
  return (
    <>
      <Spin spinning={loading}>
        {mappingDoc ? (
          <div>
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>文档标题：</Text>
                  <Text>{mappingDoc.careerStandardMapVO.careerStandardMapName}</Text>
                </div>
                <div>
                  <Text strong>版本：</Text>
                  <Text>{mappingDoc.careerStandardMapVO.standardVersion}</Text>
                </div>
                {mappingDoc.description && (
                  <div>
                    <Text strong>描述：</Text>
                    <Text>{mappingDoc.careerStandardMapVO.remark}</Text>
                  </div>
                )}
              </Space>
            </div>

            {mappingData ? renderMappingTable() : <Empty description="该能力分级表暂无数据" />}
          </div>
        ) : (
          <Empty description="该文档未关联能力分级表" />
        )}
      </Spin>
      {/* 放大镜弹窗 */}
      <Modal
        title={
          <Space>
            <ZoomInOutlined style={{ color: '#1890ff' }} />
            <span>{zoomContent.title}</span>
          </Space>
        }
        open={zoomModalVisible}
        onCancel={() => setZoomModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setZoomModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            maxHeight: '500px',
            overflowY: 'auto',
          }}
        >
          <Typography.Paragraph
            style={{
              fontSize: '14px',
              lineHeight: '1.8',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {zoomContent.content}
          </Typography.Paragraph>
        </div>
      </Modal>
    </>
  );
};

export default StandardMap;
