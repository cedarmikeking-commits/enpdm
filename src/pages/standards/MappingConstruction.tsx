import React, { useState, useEffect } from 'react';

import { Modal, Input, Button, message, Spin, Alert, Collapse, Select, Tooltip, Form } from 'antd';
import {
  Save,
  FileText,
  Eye,
  CreditCard as Edit,
  Maximize2,
  Minimize2,
  AlertCircle,
  Trash2,
  Home,
  RefreshCw,
  Info,
  Download,
  UploadIcon,
} from 'lucide-react';

import {
  getStandardMappingList,
  getCareerStandardMapList,
  getCareerStandardMapDetail,
  removeCareerStandardMap,
  publishCareerStandardMap,
  saveOrUpdateCareerStandardMap,
  importStandardMappingWord,
} from '@/api/careerStandardMap/index';
import {
  getAnimationMappingExample,
} from '@/api/careerStandardMap/MappingExampleData';
import { getLevelFontColor, getLevelBgColor } from '@/api/standards/util';
import { useCareerTree } from '@/hooks/useCareerTree';
import Dragger from 'antd/es/upload/Dragger';
const { TextArea } = Input;
const MappingConstruction: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mappingDoc, setMappingDoc] = useState<any>(null);
  const [standardMappingData, setStandardMappingData] = useState({} as any);
  const [mappingData, setMappingData] = useState<any>(null);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; levelId: string } | null>(
    null
  );
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentDocumentStatus, setCurrentDocumentStatus] = useState<number>(0); // 0: draft, 1: submitted, 2: approved

  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [showInitButton, setShowInitButton] = useState(true);
  const [documentVersion, setDocumentVersion] = useState('V1.0');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterDomainId, setFilterDomainId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [industries, setIndustries] = useState<any[]>([]);
  const [subIndustries, setSubIndustries] = useState<any[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<any[]>([]);
  const [filterIndustryId, setFilterIndustryId] = useState<string>('');
  const [filterSubIndustryId, setFilterSubIndustryId] = useState<string>('');

  const [saveIndustryId, setSaveIndustryId] = useState<string>('');
  const [saveSubIndustryId, setSaveSubIndustryId] = useState<string>('');
  const [saveSubIndustries, setSaveSubIndustries] = useState<any[]>([]);
  const [saveFilteredDomains, setSaveFilteredDomains] = useState<any[]>([]);
  const [exampleModalVisible, setExampleModalVisible] = useState(false);
  const [showTipAlert, setShowTipAlert] = useState(true);

  //导入word文档
  const [importModalVisible, setImportModalVisible] = useState(false);

  const { getCareerTree } = useCareerTree();
  const [professionalDomains] = useState<any[]>(() => {
    let domains: any[] = [];
    getCareerTree().map(firstNote => {
      firstNote.children?.map(secondNote => {
        secondNote.children?.map(thirdNote => domains.push(thirdNote));
      })
    });
    return domains;
  });
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
  const fetchStandardMappingData = async () => {
    try {
      //setLoadingMappingData(true);
      getStandardMappingList().then((data) => {
        let buildData = buildMappingData(data);
        setStandardMappingData(buildData);
      });
    } catch (error) {
      console.error('获取映射数据数据时错误:', error);
      message.error('获取映射数据数据时发生错误');
    } finally {
      //setLoadingMappingData(false);
    }
  };

  const renderMappingTable = () => {
    let currentOneLevel: any = {};
    let currentTwoLevel: any = {};
    return (
      <div style={{ width: 2500 }}>
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
              {/* {(mappingData?.levelNameList || []).map((levelInfo: any, index: number) => {
                return (
                  <th
                    key={index}
                    className="border border-slate-300 px-4 py-4 text-center font-bold text-slate-700"
                    style={{ minWidth: 300 }}
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
                  <td className="border border-slate-300 px-4 py-4 text-sm text-slate-700 leading-relaxed align-middle bg-amber-50/30">
                    {row.abilityConcept}
                  </td>

                  {/* IVRL1-4 描述 */}
                  {(mappingData?.levelNameList || []).map((levelInfo: any, levelIndex: number) => {
                    let findDataItem = row.standardMappingLevelList != null && row.standardMappingLevelList.find(
                      (a: any) => a.levelName === levelInfo.levelName
                    );
                    return (
                      <td
                        key={`levelData${levelIndex}`}
                        className="border border-slate-300 px-4 py-4 text-sm text-slate-700 leading-relaxed align-top bg-green-50/20"
                      >
                        {renderEditableCell(findDataItem?.abilityLevelRemark, findDataItem, {
                          rowIndex: index,
                          levelId: levelInfo.levelId,
                        })}
                        {/* <div className="min-h-[80px]">{findDataItem?.abilityLevelRemark}</div> */}
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

  const generateDocumentTitle = (domainId: string) => {
    const domain =
      filteredDomains.find((d) => d.id === domainId) ||
      saveFilteredDomains.find((d) => d.id === domainId);
    if (domain) {
      const nameParts = domain.name.split(' ');
      const domainName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : domain.name;
      //新命名规则：《深圳协议联盟+职业领域名称+职业领域国际职业教育能力分级表》，例如：《深圳协议联盟仓储管理职业领域国际职业教育能力分级表》
      // return `《${domainName}职业标准与<深圳协议>国际职业教育标准映射对照表》`;
      return `《深圳协议联盟${domainName}职业领域国际职业教育能力分级表》`;
    }
    return '';
  };

  const handleDomainChange = (domainId: string) => {
    setSelectedDomainId(domainId);
    const title = generateDocumentTitle(domainId);
    setDocumentTitle(title);
  };

  const handleInitMapping = () => {
    //如果没有默认映射数据，则提示用户导入
    if (standardMappingData.standardMappingValueList === undefined) {
      message.warning('请先导入映射数据');
      return;
    }
    setMappingData(JSON.parse(JSON.stringify(standardMappingData)));
    setShowInitButton(false);
    setCurrentDocumentId(null);
    setDocumentTitle('');
    setDocumentDescription('');
    setSelectedDomainId('');
    setCurrentDocumentStatus(0);
    message.success('已加载默认映射数据，请填写文档信息并保存');
  };

  useEffect(() => {
    //先不获取标准映射，需要先从word文档导入
    // fetchStandardMappingData();
    loadDocuments();
  }, []);

  const handleSaveIndustryChange = async (value: string) => {
    setSaveIndustryId(value);
    setSaveSubIndustryId('');
    setSelectedDomainId('');
    setDocumentTitle('');
    setSaveSubIndustries([]);
    setSaveFilteredDomains([]);

    if (value) {
      try {
        let data = getCareerTree().filter((item: any) => item.id === value)[0]?.children || [];
        setSaveSubIndustries(data || []);
      } catch (error) {
        console.error('Error loading sub industries:', error);
      }
    }
  };

  const handleSaveSubIndustryChange = async (value: string) => {
    setSaveSubIndustryId(value);
    setSelectedDomainId('');
    setDocumentTitle('');

    if (value) {
      let data = professionalDomains.filter((d) => d.parentId === value);
      setSaveFilteredDomains(data);

    } else {
      setSaveFilteredDomains([]);
    }
  };

  const loadDocuments = async () => {
    try {
      getCareerStandardMapList().then((data) => {
        setDocuments(data);
      });
    } catch (error) {
      console.error('获取已保存的文档数据时错误:', error);
      message.error('获取已保存的文档数据时发生错误');
    } finally {
      //setLoadingMappingData(false);
    }
  };

  const getFilteredDocuments = () => {
    return documents.filter((doc) => {
      const matchKeyword =
        !searchKeyword ||
        doc.careerStandardMapName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        doc.remark?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        doc.standardVersion?.toLowerCase().includes(searchKeyword.toLowerCase()) //||
      //doc.industry_categories?.name?.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchDomain = !filterDomainId || doc.careerId === filterDomainId;

      const matchStatus = !filterStatus || doc.status == filterStatus;

      return (matchKeyword && matchDomain && matchStatus);
    });
  };

  const loadDocument = async (mapId: string) => {
    setLoading(true);
    try {
      getCareerStandardMapDetail({ mapId: mapId }).then((data) => {
        setMappingDoc(data);
        let { careerStandardMapVO, standardMappingVO } = data;
        let { id, remark, careerStandardMapName, status, standardVersion, firstIndustryId, industryId, careerId } =
          careerStandardMapVO;
        setCurrentDocumentId(id);
        setDocumentDescription(remark || '');
        setCurrentDocumentStatus(status);
        // setSaveIndustryId(firstIndustryId);
        // setSaveSubIndustryId(industryId);
        // setSelectedDomainId(careerId);
        if (status == 0) {
          setDocumentVersion(standardVersion || 'V1.0');
          handleSaveIndustryChange(firstIndustryId);
          handleSaveSubIndustryChange(industryId);
          handleDomainChange(careerId);
        }
        setDocumentTitle(careerStandardMapName || '');
        let buildData = buildMappingData(standardMappingVO);
        setMappingData(buildData);
        setShowInitButton(false);
        message.success('文档加载成功');
      });
    } catch (error) {
      console.error('加载文档数据时错误:', error);
      message.error('加载文档时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个草稿吗？此操作无法撤销。',
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        //setLoading(true);
        try {
          removeCareerStandardMap({ ids: documentId }).then(() => {
            message.success('删除成功');
            loadDocuments();
            if (currentDocumentId === documentId) {
              handleSaveIndustryChange('');
              setMappingDoc(null);
              setCurrentDocumentId(null);
              setDocumentTitle('');
              setDocumentDescription('');
              setCurrentDocumentStatus(0);
              setDocumentVersion('');
            }
          });
        } catch (error) {
          console.error('删除文档数据时错误:', error);
          message.error('删除文档时发生错误');
        } finally {
          //setLoadingMappingData(false);
        }
      },
    });
  };

  const handleCellEdit = (
    record: any,
    field: { rowIndex: number; levelId: string },
    value: string
  ) => {
    let _mappingData = { ...mappingData };
    _mappingData.standardMappingValueList.map((row: any, _rowIndex: number) => {
      if (_rowIndex === field.rowIndex) {
        row.standardMappingLevelList.map((levelItem: any) => {
          if (levelItem.levelId === field.levelId) {
            levelItem.abilityLevelRemark = value;
          }
        });
      }
    });
    setMappingData(_mappingData);
  };

  // Helper function to determine first dimension code

  const handleSaveDraft = async () => {
    //setLoading(true);

    //mappingDoc
    if (!selectedDomainId) {
      message.error('请选择职业领域');
      return;
    }

    const finalTitle = generateDocumentTitle(selectedDomainId);
    if (!finalTitle) {
      message.error('无法生成文档标题');
      return;
    }

    if (!documentVersion.trim()) {
      message.error('请输入版本号');
      return;
    }

    try {
      let apiData = {
        careerStandardMapVO: mappingDoc?.careerStandardMapVO || {
          "careerStandardMapName": documentTitle,
          "standardVersion": documentVersion,
          "standardId": null,
          "firstIndustryId": saveIndustryId,
          "industryId": saveSubIndustryId,
          "careerId": selectedDomainId,
          "remark": documentDescription,
        },
        standardMappingVO: {
          levelNameList: mappingData.levelNameList,
          standardMappingValueList: mappingData.standardMappingValueList,
          standardId: mappingData.standardId
        },
      };
      saveOrUpdateCareerStandardMap(apiData).then((data) => {
        setSaveModalVisible(false);
        message.success('保存草稿成功', 2, () => {
          loadDocument(data);
          loadDocuments();
        });
      });
    } catch (error) {
      console.error('保存草稿时错误:', error);
      message.error('保存草稿发生错误');
    } finally {
      //setLoadingMappingData(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentDocumentId) {
      message.error('请先保存草稿');
      return;
    }

    Modal.confirm({
      title: '确认提交',
      content: '提交后将无法修改文档内容，确定要提交吗？',
      okText: '确认提交',
      cancelText: '取消',
      onOk: async () => {
        //setLoading(true);
        try {
          publishCareerStandardMap({ mapId: currentDocumentId }).then(() => {
            message.success('能力分级表提交成功');
            loadDocuments();
            setMappingDoc(null);
            setMappingData(null);
            setCurrentDocumentId(null);
            setDocumentTitle('');
            setDocumentDescription('');
            setCurrentDocumentStatus(0);
            handleSaveIndustryChange('');
            setDocumentVersion('');
          });
        } catch (error) {
          console.error('能力分级表提交时错误:', error);
          message.error('能力分级表提交发生错误');
        } finally {
          //setLoadingMappingData(false);
        }
      },
    });
  };

  //导入word接口
  const handleImportFile = async (file: File) => {
    try {
      importStandardMappingWord({ wordFile: file }).then((data) => {
        message.success('能力分级表导入成功');
        let buildData = buildMappingData(data);
        setStandardMappingData(buildData);
        setMappingData(JSON.parse(JSON.stringify(buildData)));
        setShowInitButton(false);
        setCurrentDocumentId(null);
        setDocumentTitle('');
        setDocumentDescription('');
        setSelectedDomainId('');
        setCurrentDocumentStatus(0);
      });
    } catch (error) {
      console.error('能力分级表导入时错误:', error);
      message.error(`能力分级表导入发生错误:${error}`);
    } finally {
      //setLoadingMappingData(false);
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const renderEditableCell = (
    text: string,
    record: any,
    field: { rowIndex: number; levelId: string }
  ) => {
    const isEditing =
      editingCell?.rowIndex === field.rowIndex && editingCell?.levelId === field.levelId;
    const isReadOnly = currentDocumentStatus === 1;
    const MAX_LENGTH = 150;
    const currentLength = text?.length || 0;

    return (
      <div
        className={`min-h-[80px] p-2 transition-colors relative group ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:bg-gray-50'
          }`}
        onDoubleClick={() => {
          if (!isReadOnly) {
            setEditingCell({ rowIndex: field.rowIndex, levelId: field.levelId });
          }
        }}
      >
        {isEditing && !isReadOnly ? (
          <div>
            <TextArea
              value={text}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= MAX_LENGTH) {
                  handleCellEdit(record, field, newValue);
                } else {
                  message.warning(`内容不能超过${MAX_LENGTH}字`);
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                message.warning('此单元格不允许粘贴外部内容，请手动输入');
              }}
              onBlur={() => setEditingCell(null)}
              autoFocus
              rows={4}
              maxLength={MAX_LENGTH}
              className="w-full text-sm text-black"
              showCount={{
                formatter: ({ count }) => (
                  <span style={{ color: count > MAX_LENGTH * 0.9 ? '#ff4d4f' : '#999' }}>
                    {count}/{MAX_LENGTH}
                  </span>
                ),
              }}
            />
          </div>
        ) : (
          <>
            <div className="text-sm leading-relaxed text-black">{text}</div>
            {!isReadOnly && (
              <>
                <Edit className="w-3 h-3 text-gray-400 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                {currentLength >= 0 && (
                  <div
                    className="absolute bottom-1 right-2 text-xs"
                    style={{ color: currentLength > MAX_LENGTH * 0.9 ? '#ff4d4f' : '#999' }}
                  >
                    {currentLength}/{MAX_LENGTH}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

  // Helper function to add separator border for first-level dimensions

  const RequirementsSection = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <Collapse
        defaultActiveKey={['1']}
        ghost
        expandIconPosition="end"
        items={[
          {
            key: '1',
            label: (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-800">文件描述要求（点击展开查看）</span>
              </div>
            ),
            children: (
              <div className="space-y-4 pl-7">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">（1）层级递进性</h4>
                  <p className="text-gray-700 leading-relaxed">
                    确保描述符的层级递进性。更高等级的能力描述应体现出比低等级更为复杂的技能要求、更广阔的知识范围、更强的独立工作能力或更大的责任担当，等级之间的能力差异应明确可辨。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">（2）行为动词使用</h4>
                  <p className="text-gray-700 leading-relaxed">
                    使用清晰、可测量的行为动词。能力描述应力求清晰、具体、可操作，避免使用模糊不清或主观性过强的词汇。
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">（3）可观察性</h4>
                  <p className="text-gray-700 leading-relaxed">
                    尽量使用可观察、可评估的行为动词来描述能力表现，例如：
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      能够识别
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      能够操作
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      能够分析
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      能够设计
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      能够管理
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      能够评估
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      能够创新
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">（4）相关要求</h4>
                  <div className="space-y-2 text-gray-700">
                    <p className="leading-relaxed">
                      •
                      确保描述符的层级递进性。更高等级的能力描述应体现出比低等级更为复杂的技能要求、更广阔的知识范围、更强的独立工作能力或更大的责任担当，等级之间的能力差异应明确可辨。
                    </p>
                    <p className="leading-relaxed">
                      •
                      使用清晰、可测量的行为动词。能力描述应力求清晰、具体、可操作，避免使用模糊不清或主观性过强的词汇。尽量使用可观察、可评估的行为动词来描述能力表现（例如：能够识别......、能够操作......、能够分析......、能够设计......、能够管理......、能够评估......、能够创新......等）
                    </p>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );


  const tableContent = (
    <div
      className="bg-white border border-gray-300"
      style={{ borderWidth: '0.25px', borderRadius: 0 }}
    >
      <div
        className="p-4 border-b border-gray-300 flex items-center justify-between bg-white"
        style={{ borderBottomWidth: '0.25px' }}
      >
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-black">
            {documentTitle || '职业领域标准能力分级表'}
          </h3>
          {documentDescription && (
            <span className="text-sm text-gray-700">- {documentDescription}</span>
          )}
        </div>
        <Button
          icon={
            isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />
          }
          onClick={toggleFullscreen}
          type="text"
          className="hover:bg-gray-100"
        >
          {isFullscreen ? '退出全屏' : '全屏查看'}
        </Button>
      </div>
      <div className="p-6 bg-slate-50/50 overflow-x-auto">{renderMappingTable()}</div>
    </div>
  );

  let modalItems = [];
  if (saveModalVisible) {
    modalItems.push(
      <Modal
        title="保存草稿"
        open={saveModalVisible}
        onOk={handleSaveDraft}
        onCancel={() => {
          setSaveModalVisible(false);
          setSaveIndustryId('');
          setSaveSubIndustryId('');
          setSaveSubIndustries([]);
          setSaveFilteredDomains([]);
        }}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              行业 <span className="text-red-500">*</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择行业"
              value={saveIndustryId || undefined}
              onChange={handleSaveIndustryChange}
              showSearch
              allowClear
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={getCareerTree().map((industry: any) => ({
                value: industry.id,
                label: industry.name
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              行业子类 <span className="text-red-500">*</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择行业子类"
              value={saveSubIndustryId || undefined}
              onChange={handleSaveSubIndustryChange}
              showSearch
              allowClear
              disabled={!saveIndustryId}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={saveSubIndustries.map(subIndustry => {
                const nameParts = subIndustry.name.split(' ');
                const displayName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : subIndustry.name;
                return {
                  value: subIndustry.id,
                  label: displayName
                };
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              职业领域 <span className="text-red-500">*</span>
            </label>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择职业领域"
              value={selectedDomainId || undefined}
              onChange={handleDomainChange}
              showSearch
              allowClear
              disabled={!saveSubIndustryId}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={saveFilteredDomains.map(domain => {
                const nameParts = domain.name.split(' ');
                const displayName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : domain.name;
                return {
                  value: domain.id,
                  label: displayName
                };
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文档标题
            </label>
            <Input.TextArea
              value={documentTitle}
              readOnly
              placeholder="请先选择职业领域"
              className="bg-gray-50"
              autoSize={{ minRows: 1, maxRows: 3 }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              版本号 <span className="text-red-500">*</span>
            </label>
            <Input
              value={documentVersion}
              onChange={(e) => setDocumentVersion(e.target.value)}
              placeholder="例如：V1.0, V1.1, V2.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              文档描述
            </label>
            <TextArea
              value={documentDescription}
              onChange={(e) => setDocumentDescription(e.target.value)}
              placeholder="请输入文档描述（可选）"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    );
  }
  modalItems.push(
    <Modal
      title="已保存的文档"
      open={viewModalVisible}
      onCancel={() => {
        setViewModalVisible(false);
        setSearchKeyword('');
        setFilterDomainId('');
        setFilterStatus('');
        setFilterIndustryId('');
        setFilterSubIndustryId('');
        setSubIndustries([]);
        setFilteredDomains(professionalDomains);
      }}
      footer={null}
      width={900}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="搜索标题、版本号、职业领域..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
          />
          <Select
            placeholder="筛选职业领域"
            value={filterDomainId || undefined}
            onChange={(value) => setFilterDomainId(value || '')}
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              { value: '', label: '全部领域' },
              ...professionalDomains.map((domain) => ({
                value: domain.id,
                label: domain.name,
              })),
            ]}
          />
          <Select
            placeholder="筛选状态"
            value={filterStatus || undefined}
            onChange={(value) => setFilterStatus(value || '')}
            allowClear
            options={[
              { value: '', label: '全部状态' },
              { value: '0', label: '草稿' },
              { value: '1', label: '已提交' },
            ]}
          />
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {getFilteredDocuments().map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-all hover:shadow-md"
              onClick={() => {
                loadDocument(doc.id);
                setViewModalVisible(false);
                setSearchKeyword('');
                setFilterDomainId('');
                setFilterStatus('');
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{doc.careerStandardMapName}</h4>
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap">
                      {doc.standardVersion}
                    </span>
                  </div>
                  {doc.professional_domains && (
                    <p className="text-xs text-blue-600 mb-1">{doc.professional_domains.name}</p>
                  )}
                  {doc.description && (
                    <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">更新时间: {doc.updateTime}</p>
                </div>
                <div className="ml-4 flex items-start gap-2 flex-shrink-0">
                  {doc.status === 0 && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                      草稿
                    </span>
                  )}
                  {doc.status === 1 && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                      已提交
                    </span>
                  )}
                  {doc.status === 'approved' && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                      已批准
                    </span>
                  )}
                  {doc.status === 0 && (
                    <Button
                      danger
                      size="small"
                      icon={<Trash2 className="w-3 h-3" />}
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          {getFilteredDocuments().length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{documents.length === 0 ? '暂无保存的文档' : '未找到符合条件的文档'}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );

  modalItems.push(
    <Modal
      title="能力分级表样例 - 3D动画师职业标准映射"
      open={exampleModalVisible}
      onCancel={() => setExampleModalVisible(false)}
      footer={[
        <Button key="close" type="primary" onClick={() => setExampleModalVisible(false)}>
          关闭
        </Button>,
      ]}
      width="95%"
      style={{ top: 20 }}
    >
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">说明</h4>
          <p className="text-sm text-blue-800 mb-2">
            本样例展示了《动画制作》职业标准与《深圳协议》国际职业教育标准的完整映射关系。
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              border: '1px solid #d9d9d9',
            }}
          >
            <thead>
              <tr style={{ background: '#fafafa' }}>
                <th rowSpan={2}
                  style={{
                    border: '1px solid #d9d9d9',
                    padding: '12px 8px',
                    fontWeight: 600,
                    minWidth: '100px',
                  }}
                >
                  一级维度
                </th>
                <th rowSpan={2}
                  style={{
                    border: '1px solid #d9d9d9',
                    padding: '12px 8px',
                    fontWeight: 600,
                    minWidth: '100px',
                  }}
                >
                  二级维度
                </th>
                <th rowSpan={2}
                  style={{
                    border: '1px solid #d9d9d9',
                    padding: '12px 8px',
                    fontWeight: 600,
                    minWidth: '100px',
                  }}
                >
                  三级维度
                </th>
                <th rowSpan={2}
                  style={{
                    border: '1px solid #d9d9d9',
                    padding: '12px 8px',
                    fontWeight: 600,
                    minWidth: '180px',
                  }}
                >
                  内涵
                </th>
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
                {/* <th
                  style={{
                    border: '1px solid #d9d9d9',
                    padding: '12px 8px',
                    fontWeight: 600,
                    minWidth: '200px',
                    background: '#f0f9ff',
                  }}
                >
                  IVEL 1
                </th>
                <th
                  style={{
                    border: '1px solid #d9d9d9',
                    padding: '12px 8px',
                    fontWeight: 600,
                    minWidth: '200px',
                    background: '#f0f9ff',
                  }}
                >
                  IVEL 2
                </th>
                <th
                  style={{
                    border: '1px solid #d9d9d9',
                    padding: '12px 8px',
                    fontWeight: 600,
                    minWidth: '200px',
                    background: '#f0f9ff',
                  }}
                >
                  IVEL 3
                </th>
                <th
                  style={{
                    border: '1px solid #d9d9d9',
                    padding: '12px 8px',
                    fontWeight: 600,
                    minWidth: '200px',
                    background: '#f0f9ff',
                  }}
                >
                  IVEL 4
                </th> */}
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
              {getAnimationMappingExample().map((row) => {
                const tdStyle = {
                  border: '1px solid #d9d9d9',
                  padding: '8px',
                  lineHeight: '1.6',
                };

                return (
                  <tr key={row.key}>
                    <td colSpan={row.colSpan1} style={tdStyle}>
                      {row.一级维度}
                    </td>
                    <td colSpan={row.colSpan2} style={{ ...tdStyle }}>
                      {row.二级维度}
                    </td>
                    <td style={tdStyle}>{row.三级维度}</td>
                    <td style={{ ...tdStyle, minWidth: '180px' }}>{row.概念释义}</td>
                    <td style={{ ...tdStyle, minWidth: '200px', background: '#fcfcfc' }}>
                      {row.IVRL1}
                    </td>
                    <td style={{ ...tdStyle, minWidth: '200px', background: '#fcfcfc' }}>
                      {row.IVRL2}
                    </td>
                    <td style={{ ...tdStyle, minWidth: '200px', background: '#fcfcfc' }}>
                      {row.IVRL3}
                    </td>
                    <td style={{ ...tdStyle, minWidth: '200px', background: '#fcfcfc' }}>
                      {row.IVRL4}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="mb-2">
            <strong>表格说明：</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>一级维度：职业能力的最高层级分类（3个）</li>
            <li>二级维度：对一级维度的细化分类，带有代号标识（8个）</li>
            <li>三级维度：具体的能力要素或技能点，带有代号标识（24个）</li>
          </ul>
        </div>
      </div>
    </Modal>
  );

  //导入word
  modalItems.push(
    <Modal
      title="导入数据"
      open={importModalVisible}
      onCancel={() => setImportModalVisible(false)}
      footer={[
        <Button key="close" onClick={() => setImportModalVisible(false)}>
          取消
        </Button>
      ]}
      width={600}
    >
      <div className="py-4">
        <Dragger
          accept=".docx,.json"
          showUploadList={false}
          beforeUpload={(file) => {
            handleImportFile(file);
            setImportModalVisible(false);
            return false;
          }}
          style={{
            background: 'linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%)',
            border: '2px dashed #f59e0b',
            borderRadius: '12px',
            padding: '40px 20px'
          }}
          className="hover:border-fbbf24"
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <UploadIcon className="w-16 h-16 text-amber-500" />
            <p className="text-lg font-semibold text-amber-700">拖拽文件到此处上传</p>
            <p className="text-base text-amber-600">或点击选择文件</p>
            <p className="text-sm text-gray-500 mt-2">支持 .docx </p>
          </div>
        </Dragger>
        <div className="mt-4 flex items-center justify-center">
          <a
            href="/01 国际职业教育领域分级标准模板.docx"
            download="01 国际职业教育领域分级标准模板.docx"
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:underline"
          >
            <Download className="w-4 h-4" />
            <span>下载模板文件</span>
          </a>
        </div>
        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>提示：</strong>可以导入标准的 Word 文档（.docx）
          </p>
        </div>
      </div>
    </Modal>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-auto">
        <Spin spinning={loading}>
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">《深圳协议》职业教育标准能力分级表</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-600">双击任意单元格即可编辑内容</p>
                  <Alert
                    message="编辑提示：每个单元格最多150字，不支持粘贴外部内容"
                    type="info"
                    showIcon
                    closable={false}
                    style={{ padding: '4px 12px', fontSize: '12px' }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tooltip
                  title="能力分级表样例"
                  color="#000000"
                  overlayInnerStyle={{ fontSize: '12px' }}
                >
                  <Button
                    icon={<FileText className="w-4 h-4" />}
                    onClick={() => setExampleModalVisible(true)}
                    style={{
                      background: 'linear-gradient(90deg, #3b5bdb 0%, #4dabf7 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(59, 91, 219, 0.25)',
                    }}
                    className="hover:opacity-90 transition-opacity"
                  />
                </Tooltip>
                <Tooltip title="导入数据" color="#000000" overlayInnerStyle={{ fontSize: '12px' }}>
                  <Button
                    icon={<UploadIcon className="w-4 h-4" />}
                    onClick={() => setImportModalVisible(true)}
                    style={{
                      background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
                    }}
                    className="hover:opacity-90 transition-opacity"
                  />
                </Tooltip>
                <Tooltip
                  title="查看已保存"
                  color="#000000"
                  overlayInnerStyle={{ fontSize: '12px' }}
                >
                  <Button
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => setViewModalVisible(true)}
                  />
                </Tooltip>
                <Tooltip title="保存草稿" color="#000000" overlayInnerStyle={{ fontSize: '12px' }}>
                  <Button
                    type="primary"
                    icon={<Save className="w-4 h-4" />}
                    onClick={() => setSaveModalVisible(true)}
                    disabled={!mappingData || currentDocumentStatus === 1}
                  />
                </Tooltip>
                <Tooltip
                  title={currentDocumentId ? '提交能力分级表' : '请先保存草稿'}
                  color="#000000"
                  overlayInnerStyle={{ fontSize: '12px' }}
                >
                  <Button
                    type="primary"
                    icon={<FileText className="w-4 h-4" />}
                    onClick={handleSubmit}
                    disabled={currentDocumentStatus === 1 || !(currentDocumentId && currentDocumentStatus === 0)}
                  />
                </Tooltip>
              </div>
            </div>
            {tableContent}
            {modalItems}
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <Spin spinning={loading}>
      <div className="space-y-6">
        {/* 面包屑导航 */}
        <div className="flex items-center space-x-2 text-gray-500">
          <Home className="w-4 h-4" />
          <span className="hover:text-gray-700 cursor-pointer">首页</span>
          <span className="text-gray-400">/</span>
          <span className="hover:text-gray-700 cursor-pointer">领域标准</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">构建映射</span>
        </div>

        {/* 页面标题和操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Tooltip title="重新构建" color="#000000" overlayInnerStyle={{ fontSize: '12px' }}>
              <Button
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={handleInitMapping}
                size="large"
                style={{
                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                }}
                className="hover:opacity-90 transition-opacity"
              >
                重新构建
              </Button>
            </Tooltip>
            {!showTipAlert && currentDocumentStatus !== 1 && (
              <Tooltip
                title="显示操作提示"
                color="#000000"
                overlayInnerStyle={{ fontSize: '12px' }}
              >
                <Button
                  icon={<Info className="w-4 h-4" />}
                  onClick={() => setShowTipAlert(true)}
                  size="large"
                />
              </Tooltip>
            )}
            <Tooltip title="能力分级表样例" color="#000000" overlayInnerStyle={{ fontSize: '12px' }}>
              <Button
                icon={<FileText className="w-4 h-4" />}
                onClick={() => setExampleModalVisible(true)}
                size="large"
                style={{
                  background: 'linear-gradient(90deg, #3b5bdb 0%, #4dabf7 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(59, 91, 219, 0.25)',
                }}
                className="hover:opacity-90 transition-opacity"
              >
                能力分级表样例
              </Button>
            </Tooltip>
            <Tooltip title="导入数据" color="#000000" overlayInnerStyle={{ fontSize: '12px' }}>
              <Button
                icon={<UploadIcon className="w-4 h-4" />}
                onClick={() => setImportModalVisible(true)}
                size="large"
                style={{
                  background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)'
                }}
                className="hover:opacity-90 transition-opacity"
              >
                导入数据
              </Button>
            </Tooltip>
            <Tooltip title="查看已保存" color="#000000" overlayInnerStyle={{ fontSize: '12px' }}>
              <Button
                icon={<Eye className="w-4 h-4" />}
                onClick={() => setViewModalVisible(true)}
                size="large"
              >
                查看已保存
              </Button>
            </Tooltip>
            <Tooltip title="保存草稿" color="#000000" overlayInnerStyle={{ fontSize: '12px' }}>
              <Button
                type="primary"
                icon={<Save className="w-4 h-4" />}
                onClick={() => setSaveModalVisible(true)}
                size="large"
                disabled={!mappingData || currentDocumentStatus === 1}
              >
                保存草稿
              </Button>
            </Tooltip>
            <Tooltip
              title={
                currentDocumentStatus === 1
                  ? '文档已提交'
                  : !currentDocumentId
                    ? '请先保存草稿'
                    : '提交能力分级表'
              }
              color="#000000"
              overlayInnerStyle={{ fontSize: '12px' }}
            >
              <Button
                type="primary"
                icon={<FileText className="w-4 h-4" />}
                onClick={handleSubmit}
                disabled={currentDocumentStatus === 1 || !(currentDocumentId && currentDocumentStatus === 0)}
                size="large"
              >
                {
                  currentDocumentStatus === 1
                    ? '文档已提交'
                    : !currentDocumentId
                      ? '请先保存草稿'
                      : '提交能力分级表'
                }
              </Button>
            </Tooltip>
          </div>
        </div>

        <RequirementsSection />

        {currentDocumentStatus === 1 ? (
          <Alert
            message="只读模式"
            description="此文档已提交审核或已批准，无法编辑。如需修改，请联系管理员。"
            type="warning"
            showIcon
            closable
          />
        ) : (
          (mappingData && showTipAlert) && (
            <Alert
              message="操作提示"
              description="双击任意单元格即可编辑内容。每个单元格最多150字，不支持粘贴外部内容，请手动输入。本表展示了完整的24个三级维度在IVRL1-4各等级的能力描述。点击右上角全屏查看获得更好的编辑体验。"
              type="info"
              showIcon
              closable
              onClose={() => setShowTipAlert(false)}
            />
          )
        )}

        {!mappingData || showInitButton ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">暂无映射数据</p>
              <Button
                type="primary"
                size="large"
                onClick={handleInitMapping}
                icon={<FileText className="w-4 h-4" />}
              >
                开始构建能力分级表
              </Button>
            </div>
          </div>
        ) : (
          tableContent
        )}

        {modalItems}
      </div>
    </Spin>
  );
};

export default MappingConstruction;
