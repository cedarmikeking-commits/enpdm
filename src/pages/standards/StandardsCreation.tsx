import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Input,
  Select,
  Button,
  message,
  Modal,
  Form,
  Card,
  Space,
  Divider,
  Typography,
  Upload,
  UploadFile,
  Alert,
  List,
  Tooltip,
  Tag
} from 'antd';
import {
  FileTextOutlined,
  BookOutlined,
  SettingOutlined,
  AlignLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  SaveOutlined,
  SendOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  HomeOutlined,
  DeleteOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import {
  getLastUnSubmitDetail,
  saveCareerstandard,
  updateCareerstandard,
  submitCareerstandard,
} from '@/api/careerstandard/index';
import { postResourceGetBylds } from '@/api/standards/index2';

import {
  getCareerStandardMapList,
} from '@/api/careerStandardMap/index';

import StandardMap from '@/components/careerStandardMap/index'

import UploadDraggerFile from '@/components/UploadDraggerFile';
const { Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;
import { useCareerTree } from '@/hooks/useCareerTree';
import { UploadData } from '@/hooks/useOssUpload';
import RichEditor from '@/components/richEditor/RichEditor';
import RichTextRender from '@/components/richEditor/RichTextRender';
interface StandardDocument {
  id?: string;
  domain_id: string;
  standard_name: string;
  version: string;
  introduction: string;
  basic_info: {
    purpose: string;
    scope: string;
  };
  terms_definitions: Array<{
    term: string;
    definition: string;
  }>;
  standard_content: {
    description: string;
  };
  appendix_files: Array<{
    name: string;
    url: string;
    size: number;
  }>;
  status: 'draft' | 'submitted' | 'approved';
  created_at?: string;
  updated_at?: string;
}

const StandardsCreation: React.FC = () => {
  const { getCareerTree, getParent } = useCareerTree();
  const [selectedSection, setSelectedSection] = useState('basic');
  const [form] = Form.useForm();
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [documentStatus, setDocumentStatus] = useState<'draft' | 'submitted' | 'approved'>('draft');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [termsDefinitions, setTermsDefinitions] = useState<Array<{ term: string; definition: string }>>([]);
  const [abilityRequirements, setAbilityRequirements] = useState<Array<any>>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('');
  const [standardName, setStandardName] = useState<string>('');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [mappingDocuments, setMappingDocuments] = useState<any[]>([]);
  const [selectedMappingDocId, setSelectedMappingDocId] = useState<string>('');
  const [selectedMappingDocName, setSelectedMappingDocName] = useState<string>('');
  const [viewMappingModalVisible, setViewMappingModalVisible] = useState('');
  const [selectMappingModalVisible, setSelectMappingModalVisible] = useState(false);
  const [currentMappingDocument, setCurrentMappingDocument] = useState<any>(null);
  const [mappingRows, setMappingRows] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('');
  const [subIndustries, setSubIndustries] = useState<any[]>([]);
  const [selectedSubIndustryId, setSelectedSubIndustryId] = useState<string>('');
  const [filteredDomains, setFilteredDomains] = useState<any[]>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importFileList, setImportFileList] = useState<UploadFile[]>([]);
  const [draftListVisible, setDraftListVisible] = useState(false);
  const [draftList, setDraftList] = useState<any[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [uploadResIDs, setUploadResIDs] = useState<string>('');

  const [professionalDomains] = useState<any[]>(() => {
    let domains: any[] = [];
    getCareerTree().map(firstNote => {
      firstNote.children?.map(secondNote => {
        secondNote.children?.map(thirdNote => domains.push(thirdNote));
      })
    });
    return domains;
  });

  useEffect(() => {
    clearTimeout(window._standardsCreation || 0);
    window._standardsCreation = setTimeout(() => {
      loadIndustries();
      loadDraftData();
    }, 200);
  }, []);



  const loadMappingDocuments = async (domainId: string) => {
    try {
      getCareerStandardMapList({ status: 1, careerId: domainId }).then((data) => {
        setMappingDocuments(data);
      });
    } catch (error) {
      console.error('获取已保存的文档数据时错误:', error);
      message.error('获取已保存的文档数据时发生错误');
    } finally {
      //setLoadingMappingData(false);
    }
  };
  const loadIndustries = () => {
    let data = getCareerTree()
    setIndustries(data || []);
  };

  const handleIndustryChange = async (value: string) => {
    setSelectedIndustryId(value);
    setSelectedSubIndustryId('');
    setSelectedDomainId('');
    setSubIndustries([]);
    setFilteredDomains([]);
    form.setFieldsValue({ sub_industry_id: undefined, domain_id: undefined });

    if (value) {
      let data = getCareerTree().filter((item: any) => item.id === value)[0]?.children || [];
      setSubIndustries(data || []);
    }
  };

  const handleSubIndustryChange = async (value: string) => {
    setSelectedSubIndustryId(value);
    setSelectedDomainId('');
    form.setFieldsValue({ domain_id: undefined });

    if (value) {
      let data = professionalDomains.filter((d) => d.parentId === value);
      setFilteredDomains(data);
    } else {
      setFilteredDomains([]);
    }
  };

  const handleDomainChange = async (value: string) => {
    setSelectedDomainId(value);
    const domain = filteredDomains.find(d => d.id === value);
    if (domain) {
      //标准新命名规则：《深圳协议联盟+职业领域名称+职业领域国际职业教育分级标准》，例如：《深圳协议联盟仓储管理职业领域国际职业教育分级标准》
      // const generatedName = `《<深圳协议>${domain.name}职业领域标准》`;
      const generatedName = `《深圳协议联盟${domain.name}职业领域国际职业教育分级标准》`;
      setStandardName(generatedName);
      form.setFieldsValue({ standard_name: generatedName });
      loadMappingDocuments(value);
      setSelectedMappingDocId('');
      setSelectedMappingDocName('');
    }
  };

  const loadDraftData = async () => {
    try {
      getLastUnSubmitDetail().then((data) => {
        setCurrentDocument(data);
        if (data) {
          setCurrentDocId(data.id);
          setDocumentStatus(data.status == 1 ? 'submitted' : 'draft');
          setStandardName(data.careerStandardFileName);

          let firstIndustryId = getParent(data.industryId)?.id.toString();

          // 加载职业领域信息并恢复三级筛选
          // 1. 设置行业
          setSelectedIndustryId(firstIndustryId || '');
          handleIndustryChange(firstIndustryId || '');
          //2.  设置行业子类
          setSelectedSubIndustryId(data.industryId);
          handleSubIndustryChange(data.industryId);

          // 3. 设置职业领域
          setSelectedDomainId(data.careerId);

          // 6. 使用正确的值设置表单
          form.setFieldsValue({
            industry_id: firstIndustryId,
            sub_industry_id: data.industryId,
            domain_id: data.careerId,

            standard_name: data.careerStandardFileName,
            version: data.standardVersion,
            introduction: data.preface || '',
            purpose: data.corePurpose || '',
            scope: data.scope || '',
            content_description: data.overview || '',
          });

          if (data.careerStandardTermList && Array.isArray(data.careerStandardTermList)) {
            setTermsDefinitions(data.careerStandardTermList.map((term: any) => ({ id: term.id, term: term.termName, definition: term.termDefinition })));
          }
          setSelectedMappingDocId(data.careerStandardMapId);
          setSelectedMappingDocName(data.careerStandardMapName);
          loadMappingDocuments(data.careerId);

          //加载附件列表
          if (data.appendixAttach) {
            setUploadResIDs(data.appendixAttach);
            postResourceGetBylds(data.appendixAttach.split(',')).then(data => {
              setFileList(data.map((item: any) => ({
                id: item.id, name: item.originalName, url: item.signUrl, type: item.type, size: item.resourceSize
              })));
            }).catch((error: any) => {
              message.error(error.response.data.msg);
            }).finally(() => {

            });
          }

          message.success('已加载草稿数据');
        }
        else {
          message.info('暂无草稿数据，可以开始创建新标准');
        }
      })
    } catch (error) {
      console.error('Error loading domain hierarchy:', error);
      message.error('加载标准文件数据时发生错误');
    }
  }

  const handleViewMappingDocument = async (docId: string) => {
    setViewMappingModalVisible(docId);
  };

  const menuItems = [
    {
      key: 'basic',
      icon: <FileTextOutlined />,
      label: '标准基本信息',
    },
    {
      key: 'introduction',
      icon: <BookOutlined />,
      label: '标准文件引言',
    },
    {
      key: 'terms',
      icon: <SettingOutlined />,
      label: '标准术语定义',
    },
    {
      key: 'content',
      icon: <AlignLeftOutlined />,
      label: '领域标准正文',
    },
    {
      key: 'appendix',
      icon: <PlusOutlined />,
      label: '专家论证意见',
    },
  ];


  const handleSaveDraft = async () => {
    try {
      // 从表单获取当前值
      const values = form.getFieldsValue();
      // 使用组件状态进行验证
      if (!selectedDomainId) {
        message.error('请选择职业领域');
        setSelectedSection('basic');
        return;
      }

      if (!standardName) {
        message.error('请先选择职业领域生成标准文件名称');
        setSelectedSection('basic');
        return;
      }

      if (!values.introduction || values.introduction.trim() === '') {
        message.error('请填写引言（必填项）');
        setSelectedSection('introduction');
        return;
      }

      if (!values.purpose || values.purpose.trim() === '') {
        message.error('请填写核心目的（必填项）');
        setSelectedSection('introduction');
        return;
      }


      if (!values.scope || values.scope.trim() === '') {
        message.error('请填写适用范围（必填项）');
        setSelectedSection('introduction');
        return;
      }


      if (!values.content_description || values.content_description.trim() === '') {
        message.error('请填写总述（必填项）');
        setSelectedSection('content');
        return;
      }

      if (!selectedMappingDocId) {
        message.error('请先选择能力分级表文档');
        setSelectedSection('content');
        return;
      }
      if(uploadResIDs==''){
        message.error('请先上传专家论证意见附件');
        setSelectedSection('appendix');
        return;
      }
      let apiData: any = {
        "careerStandardFileName": values.standard_name,
        "standardVersion": "v1.0",
        "careerStandardMapId": selectedMappingDocId,
        "industryId": selectedSubIndustryId,
        "careerId": selectedDomainId,
        "preface": values.introduction,
        "corePurpose": values.purpose,
        "scope": values.scope,
        "overview": values.content_description,
        "appendixAttach": uploadResIDs,
        "careerStandardTermList": termsDefinitions.map((item: any) => ({ id: item.id, termName: item.term, termDefinition: item.definition }))
      };

      if (!currentDocId) {//新建标准
        saveCareerstandard(apiData).then((data) => {
          setCurrentDocId(data);
          message.success('草稿保存成功', () => loadDraftData());
        });
      }
      else {
        apiData = { ...currentDocument, ...apiData };
        updateCareerstandard(apiData).then((data) => {
          message.success('草稿保存成功', () => loadDraftData());

        });
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      if (error.errorFields) {
        message.error('请填写必填字段');
      } else {
        message.error(`保存失败: ${error.message || '未知错误'}`);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      submitCareerstandard({ id: currentDocument.id }).then(() => {
        message.success('提交内审成功');
        setDocumentStatus('submitted');
      });
    } catch (error) {
      console.error('提交内审时错误:', error);
      message.error('提交内审时发生错误');
    } finally {
      //setLoadingMappingData(false);
    }
  };

  const handleNewDocument = () => {
    form.resetFields();
    setCurrentDocId(null);
    setDocumentStatus('draft');
    setTermsDefinitions([]);
    setAbilityRequirements([]);
    setFileList([]);
    setSelectedDomainId('');
    setStandardName('');
    setSelectedMappingDocId('');
    setSelectedMappingDocName('');
    setMappingDocuments([]);
    setSelectedSection('basic');
    message.info('已创建新文档');
  };

  const addTermDefinition = () => {
    setTermsDefinitions([...termsDefinitions, { term: '', definition: '' }]);
  };

  const updateTermDefinition = (index: number, field: 'term' | 'definition', value: string) => {
    const updated = [...termsDefinitions];
    updated[index][field] = value;
    setTermsDefinitions(updated);
  };

  const removeTermDefinition = (index: number) => {
    setTermsDefinitions(termsDefinitions.filter((_, i) => i !== index));
  };

  const addAbilityRequirement = () => {
    if (!selectedDomainId) {
      message.warning('请先选择职业领域');
      setSelectedSection('basic');
      return;
    }
    if (mappingDocuments.length === 0) {
      message.warning('该职业领域暂无可用的能力分级表文档');
      return;
    }
    setSelectMappingModalVisible(true);
  };

  const handleSelectMappingDocument = (docId: string, docTitle: string) => {
    setSelectedMappingDocId(docId);
    setSelectedMappingDocName(docTitle);
    setSelectMappingModalVisible(false);
    message.success(`已选择能力分级表文档: ${docTitle}`);
  };


  const renderBasicInfo = () => (
    <Card title="标准基本信息" bordered={false}>
      <Form.Item
        label="行业"
        name="industry_id"
        rules={[{ required: true, message: '请选择行业' }]}
      >
        <Select
          placeholder="请选择行业"
          showSearch
          allowClear
          optionFilterProp="children"
          value={selectedIndustryId || undefined}
          onChange={handleIndustryChange}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={industries.map(industry => ({
            value: industry.id,
            label: industry.name
          }))}
        />
      </Form.Item>

      <Form.Item
        label="行业子类"
        name="sub_industry_id"
        rules={[{ required: true, message: '请选择行业子类' }]}
      >
        <Select
          placeholder="请选择行业子类"
          showSearch
          allowClear
          disabled={!selectedIndustryId}
          optionFilterProp="children"
          value={selectedSubIndustryId || undefined}
          onChange={handleSubIndustryChange}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={subIndustries.map(subIndustry => {
            const nameParts = subIndustry.name.split(' ');
            const displayName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : subIndustry.name;
            return {
              value: subIndustry.id,
              label: displayName
            };
          })}
        />
      </Form.Item>

      <Form.Item
        label="职业领域"
        name="domain_id"
        rules={[{ required: true, message: '请选择职业领域' }]}
      >
        <Select
          placeholder="请选择职业领域"
          showSearch
          allowClear
          disabled={!selectedSubIndustryId}
          optionFilterProp="children"
          value={selectedDomainId || undefined}
          onChange={handleDomainChange}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={filteredDomains.map(domain => {
            const nameParts = domain.name.split(' ');
            const displayName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : domain.name;
            return {
              value: domain.id,
              label: displayName
            };
          })}
        />
      </Form.Item>

      <Form.Item
        label="标准文件名称"
        name="standard_name"
        tooltip="根据所选职业领域自动生成"
        rules={[{ required: true, message: '请先选择职业领域' }]}
      >
        <Input
          placeholder="选择职业领域后自动生成"
          value={standardName}
          readOnly
        />
      </Form.Item>

      {false && <Form.Item
        label="版本号"
        name="version"
        initialValue="V1.0"
        rules={[{ required: true, message: '请选择版本号' }]}
      >
        <Select placeholder="请选择版本号">
          <Select.Option value="V1.0">V1.0</Select.Option>
          {/* <Select.Option value="V1.1">V1.1</Select.Option>
          <Select.Option value="V1.2">V1.2</Select.Option>
          <Select.Option value="V2.0">V2.0</Select.Option>
          <Select.Option value="V2.1">V2.1</Select.Option>
          <Select.Option value="V2.2">V2.2</Select.Option>
          <Select.Option value="V3.0">V3.0</Select.Option>
          <Select.Option value="V3.0">V3.1</Select.Option>
          <Select.Option value="V3.0">V3.2</Select.Option>
          <Select.Option value="V3.0">V3.3</Select.Option> */}
        </Select>
      </Form.Item>
      }
    </Card>
  );

  const renderIntroduction = () => (
    <Card title={<><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>标准文件引言</>} bordered={false}>
      <Paragraph type="secondary">
        简要阐述本标准制定的主要依据（如《深圳协议》、国家相关标准、行业发展规划等）、核心目的、适用范围（如适用于哪些岗位的从业人员、教育培训机构等）以及与其他相关标准的关系等。
      </Paragraph>
      <Form.Item
        name="introduction"
        label="引言内容"
        required
        rules={[{ required: true, message: '请输入引言' }]}
      >
        <Input.TextArea
          rows={10}
          placeholder="请输入引言内容..."
        />
      </Form.Item>
      <Form.Item
        label="核心目的"
        name="purpose"
        rules={[{ required: true, message: '请输入核心目的' }]}
      >
        <Input.TextArea
          rows={6}
          placeholder="请输入核心目的..."
        />
      </Form.Item>

      <Form.Item
        label="适用范围"
        name="scope"
        rules={[{ required: true, message: '请输入使用范围' }]}
      >
        <Input.TextArea
          rows={6}
          placeholder="如适用于哪些岗位的从业人员、教育培训机构等及与其他相关标准的关系等"
        />
      </Form.Item>
    </Card>
  );

  const renderTermsDefinitions = () => (
    <Card
      title="标准术语和定义"
      bordered={false}
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={addTermDefinition}>
          添加术语
        </Button>
      }
    >
      <Paragraph type="secondary">
        如果本职业领域在标准描述中使用了特定的、需要专门解释的术语定义，应在此部分清晰列出并予以准确界定。
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {termsDefinitions.map((item, index) => (
          <Card
            key={index}
            size="small"
            extra={
              <Button
                type="text"
                danger
                onClick={() => removeTermDefinition(index)}
              >
                删除
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>术语：</Text>
                <Input
                  value={item.term}
                  onChange={(e) => updateTermDefinition(index, 'term', e.target.value)}
                  placeholder="输入术语名称"
                  style={{ marginTop: 8 }}
                />
              </div>
              <div>
                <Text strong>定义：</Text>
                <Input.TextArea
                  value={item.definition}
                  onChange={(e) => updateTermDefinition(index, 'definition', e.target.value)}
                  placeholder="输入术语定义"
                  rows={3}
                  style={{ marginTop: 8 }}
                />
              </div>
            </Space>
          </Card>
        ))}

        {termsDefinitions.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            暂无术语定义，点击上方"添加术语"按钮开始添加
          </div>
        )}
      </Space>
    </Card>
  );

  const renderStandardContent = () => (
    <Card
      title="领域标准正文"
      bordered={false}
      extra={
        <Tooltip title="选择该职业领域对应的能力分级表文档，作为能力要求的参考依据">
          <Button type="primary" icon={<PlusOutlined />} onClick={addAbilityRequirement}>
          </Button>
        </Tooltip>
      }
    >
      <div className="mb-6" >
        <Title level={5}><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>总述</Title>
        <Paragraph type="secondary">
          对本职业领域在选定等级下的总体能力要求、核心特征进行描述。
        </Paragraph>
        <Form.Item
          name="content_description"
          label="总述内容"
          required
          rules={[{ required: true, message: '请输入总述内容' }]}
          trigger="onChange"
          validateTrigger="onBlur"
        >
          {/* <Input.TextArea
            rows={20}
            placeholder="请输入总述内容..."
            maxLength={5000}
            showCount
          /> */}
            <RichEditor
              placeholder="请输入总述内容..."
            />
        </Form.Item>
      </div>

      <Divider />

      <div>
        <Title level={5}>分项能力要求</Title>
        <Paragraph type="secondary">
          点击上方"添加能力要求"按钮，选择该职业领域对应的能力分级表文档。能力分级表文档包含按照《深圳协议方案》组织的基础能力、行动能力、发展能力三个一级维度的详细能力描述。
        </Paragraph>

        {selectedMappingDocName ? (
          <Card className="mt-4" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
            <div className="flex items-center justify-between">
              <div>
                <Text strong style={{ fontSize: '16px' }}>已选择能力分级表文档: </Text>
                <Button
                  type="link"
                  onClick={() => handleViewMappingDocument(selectedMappingDocId)}
                  style={{ fontSize: '16px', padding: 0, height: 'auto' }}
                >
                  {selectedMappingDocName}
                </Button>
              </div>
              <Button
                danger
                onClick={() => {
                  setSelectedMappingDocId('');
                  setSelectedMappingDocName('');
                  message.info('已清除能力分级表文档选择');
                }}
              >
                清除选择
              </Button>
            </div>
          </Card>
        ) : (
          <Alert
            message="尚未选择能力分级表文档"
            description='请点击上方"添加能力要求"按钮，从列表中选择一个能力分级表文档'
            type="info"
            showIcon
            className="mt-4"
          />
        )}
      </div>
    </Card>
  );
  //统一上传文件前的校验
  const beforeUpload = (file: any) => {
    const isAllowedType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
    if (!isAllowedType) {
      message.error('仅支持 PDF、JPG、PNG 格式的文件');
    }
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('单个文件大小不能超过 10MB');
    }
    return isAllowedType && isLt10M;
  };
  const handleUploaded_BusinessLicense = (data: UploadData[]) => {
    console.log('上传完成，返回：', data);
    setFileList(data.map((item: any) => ({ id: item.resourceId, url: item.Location, name: item.file.name, type: item.file.type, size: item.file.size })));
    setUploadResIDs(data.map(item => item.resourceId).join(','));
  };
  const renderAppendix = () => (
    <Card title="专家论证意见" bordered={false}>
      <Paragraph type="secondary" className="mb-4">
        如相关的法律法规、参考文件等。可上传多个附件文档。
      </Paragraph>
      <UploadDraggerFile
        name="file"
        multiple={true}
        beforeUpload={beforeUpload}
        onUploaded={handleUploaded_BusinessLicense}
        uploadResIDs={uploadResIDs}
      >
        <p className="ant-upload-drag-icon">
          <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        </p>
        <p className="ant-upload-text" style={{ fontSize: '16px', marginTop: '16px' }}>
          点击或拖拽文件到此区域上传
        </p>
        <p className="ant-upload-hint" style={{ fontSize: '14px', color: '#999' }}>
          支持单个或批量上传。支持的文件格式：PDF、Word、Excel、图片等，单个文件不超过10MB
        </p>
      </UploadDraggerFile>
    </Card>
  );

  const renderContent = () => {
    return (
      <>
        <div style={{ display: selectedSection === 'basic' ? 'block' : 'none' }}>
          {renderBasicInfo()}
        </div>
        <div style={{ display: selectedSection === 'introduction' ? 'block' : 'none' }}>
          {renderIntroduction()}
        </div>
        <div style={{ display: selectedSection === 'terms' ? 'block' : 'none' }}>
          {renderTermsDefinitions()}
        </div>
        <div style={{ display: selectedSection === 'content' ? 'block' : 'none' }}>
          {renderStandardContent()}
        </div>
        <div style={{ display: selectedSection === 'appendix' ? 'block' : 'none' }}>
          {renderAppendix()}
        </div>
      </>
    );
  };

  const renderPreview = () => {
    const values = form.getFieldsValue();
    const selectedDomain = filteredDomains.find(d => d.id === values.domain_id);

    console.log('=== Preview Debug ===');
    console.log('All form values:', values);
    console.log('introduction:', values.introduction);
    console.log('content_description:', values.content_description);
    console.log('Terms definitions:', termsDefinitions);
    console.log('Ability requirements:', abilityRequirements);

    return (
      <div className="space-y-6">
        <div>
          <Title level={3} className="text-center">
            {values.standard_name || '标准文件名称'}
          </Title>
          <div className="text-center text-gray-500 mb-4">
            版本：{values.version || 'V1.0'}
          </div>
        </div>

        <div>
          <Title level={4}>职业领域</Title>
          <Paragraph>{selectedDomain?.name || <Text type="secondary" italic>未选择</Text>}</Paragraph>
        </div>

        <div>
          <Title level={4}>基本信息</Title>
          {values.purpose && (
            <div className="mb-3">
              <Text strong>目的：</Text>
              <Paragraph>{values.purpose}</Paragraph>
            </div>
          )}
          {values.scope && (
            <div className="mb-3">
              <Text strong>范围：</Text>
              <Paragraph>{values.scope}</Paragraph>
            </div>
          )}
          {!values.purpose && !values.scope && (
            <Paragraph type="secondary" italic>暂无基本信息</Paragraph>
          )}
        </div>

        <div>
          <Title level={4}>引言</Title>
          {values.introduction && values.introduction.trim() !== '' ? (
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{values.introduction}</Paragraph>
          ) : (
            <Paragraph type="secondary" italic>暂无引言内容</Paragraph>
          )}
        </div>

        <div>
          <Title level={4}>术语定义</Title>
          {termsDefinitions.length > 0 ? (
            termsDefinitions.map((item, index) => (
              <div key={index} className="mb-3">
                <Text strong>{item.term}：</Text>
                <Paragraph>{item.definition}</Paragraph>
              </div>
            ))
          ) : (
            <Paragraph type="secondary" italic>暂无术语定义</Paragraph>
          )}
        </div>

        <div>
          <Title level={4}>标准正文</Title>
          {values.content_description && values.content_description.trim() !== '' ? (
            <div className="mb-4">
              <Text strong>总体描述：</Text>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                <RichTextRender content={values.content_description} />
                {/* {values.content_description} */}
                </Paragraph>
            </div>
          ) : (
            <Paragraph type="secondary" italic>暂无总体描述</Paragraph>
          )}

          {selectedMappingDocId != '' ? (
            <div className="mt-4">
              <Text strong className="text-base">分项能力要求：</Text>
              <div style={{ maxWidth: 1150, overflow: 'auto' }}>
                <StandardMap mapId={selectedMappingDocId} />
              </div>
            </div>
          ) : (
            <Paragraph type="secondary" italic className="mt-4">暂无分项能力要求</Paragraph>
          )}
        </div>

        {fileList.length > 0 && (
          <div>
            <Title level={4}>专家论证意见</Title>
            <div className="space-y-2">
              {fileList.map((file, index) => (
                <div key={index}>
                  <Text>{file.name}</Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center space-x-2 text-gray-500">
        <HomeOutlined className="text-base" />
        <span className="hover:text-gray-700 cursor-pointer">首页</span>
        <span className="text-gray-400">/</span>
        <span className="hover:text-gray-700 cursor-pointer">领域标准</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">撰写标准文件</span>
      </div>

      <div className="bg-white px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Title level={4} style={{ margin: 0 }}>撰写标准</Title>
            {currentDocId && (
              <span className={`text-sm px-3 py-1 rounded-full ${documentStatus === 'draft' ? 'bg-blue-50 text-blue-600' :
                documentStatus === 'submitted' ? 'bg-orange-50 text-orange-600' :
                  'bg-green-50 text-green-600'
                }`}>
                {documentStatus === 'draft' && '草稿'}
                {documentStatus === 'submitted' && '已提交审核'}
                {documentStatus === 'approved' && '已批准'}
              </span>
            )}
          </div>
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => setShowGuidelines(!showGuidelines)}
            size="large"
          >
            {showGuidelines ? '隐藏撰写要求' : '查看撰写要求'}
          </Button>
        </div>
      </div>

      {showGuidelines && (
        <div className="px-6 py-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 relative">
            <button
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-blue-100 transition-colors"
              onClick={() => setShowGuidelines(false)}
            >
              <CloseOutlined style={{ fontSize: 11 }} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <InfoCircleOutlined style={{ color: '#1d4ed8', fontSize: 16 }} />
              <span className="font-semibold text-blue-800 text-base">撰写要求</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <Text strong className="text-sm text-gray-700">文字表达</Text>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">力求规范、准确、专业、简洁、易懂，避免歧义。</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <Text strong className="text-sm text-gray-700">逻辑结构</Text>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">确保标准文件内部逻辑清晰、层次分明、结构合理、体系完整。</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <Text strong className="text-sm text-gray-700">内容完整性与准确性</Text>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">必须完整准确地反映《深圳协议方案》的等级体系、目标分类框架以及本职业领域的实际能力需求。</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                  <Text strong className="text-sm text-gray-700">提交材料要求</Text>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">提交材料应包括：<span className="text-gray-800 font-medium">编制说明</span>、<span className="text-gray-800 font-medium">领域标准分级表</span>、<span className="text-gray-800 font-medium">能力分级描述</span>等。</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                <Text strong className="text-sm text-gray-700">领域标准正文结构说明</Text>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                领域标准正文包括
                <span className="mx-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-medium text-xs border border-amber-200">研制时间</span>、
                <span className="mx-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-medium text-xs border border-amber-200">研制依据</span>、
                <span className="mx-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-medium text-xs border border-amber-200">研制过程</span>
             ，提交材料应该包括编制说明、领域标准分级表、专家论证意见。
              </p>
            </div>
          </div>
        </div>
      )}

      <Layout style={{ height: 'calc(100vh - 140px)', overflow: 'hidden' }}>
        <Sider
          width={240}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1, overflow: 'auto' }}>
            <div className="p-3">
              <Title level={5} className="mb-3" style={{ fontSize: '16px' }}>标准文件结构</Title>
              <Menu
                mode="inline"
                selectedKeys={[selectedSection]}
                items={menuItems}
                onClick={({ key }) => setSelectedSection(key)}
                style={{ borderRight: 0 }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px', background: '#fff' }}>
            <div className="space-y-2">
              <div className="mb-3">
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                  文档操作
                </Text>
                <Space direction="vertical" style={{ width: '100%', display: 'flex', alignItems: 'center' }} size="small">
                  {/* <Button
                    icon={<UploadOutlined />}
                    onClick={handleImportFile}
                    style={{ width: '180px' }}
                    size="middle"
                  >
                    导入文件
                  </Button> */}
                  <Button
                    icon={<PlusOutlined />}
                    onClick={handleNewDocument}
                    style={{ width: '180px' }}
                    size="middle"
                  >
                    新建文档
                  </Button>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => setPreviewVisible(true)}
                    style={{ width: '180px' }}
                    size="middle"
                  >
                    预览文档
                  </Button>
                </Space>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                  文档提交
                </Text>
                <Space direction="vertical" style={{ width: '100%', display: 'flex', alignItems: 'center' }} size="small">
                  <Button
                    icon={<SaveOutlined />}
                    onClick={handleSaveDraft}
                    style={{ width: '180px' }}
                    size="middle"
                    disabled={documentStatus === 'submitted' || documentStatus === 'approved'}
                  >
                    保存草稿
                  </Button>
                  {/* <Button
                    icon={<FolderOpenOutlined />}
                    onClick={handleViewDrafts}
                    style={{ width: '180px' }}
                    size="middle"
                  >
                    查看草稿
                  </Button> */}
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    style={{ width: '180px' }}
                    size="middle"
                    disabled={!currentDocId || documentStatus === 'submitted' || documentStatus === 'approved'}
                  >
                    提交内审
                  </Button>
                </Space>
              </div>
            </div>
          </div>
        </Sider>

        <Content style={{
          padding: '24px',
          overflow: 'auto',
          height: '100%',
          display: previewVisible ? 'none' : 'block'
        }}>
          <div className="max-w-5xl mx-auto">
            <Form
              form={form}
              layout="vertical"
              size="large"
            >
              {renderContent()}
            </Form>
          </div>
        </Content>

        {previewVisible && (
          <Content
            style={{
              background: '#fff',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fff'
            }}>
              <Title level={4} style={{ margin: 0 }}>文档预览</Title>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setPreviewVisible(false)}
                size="large"
              />
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
              {renderPreview()}
            </div>
          </Content>
        )}
      </Layout>

      {viewMappingModalVisible != '' && <Modal
        title="查看能力分级表文档"
        open={viewMappingModalVisible != ''}
        onCancel={() => setViewMappingModalVisible('')}
        footer={[
          <Button key="close" onClick={() => setViewMappingModalVisible('')}>
            关闭
          </Button>
        ]}
        width={1150}
      >
        <div style={{ maxWidth: 1200, overflow: 'auto' }}>
          <StandardMap mapId={viewMappingModalVisible} />
        </div>
      </Modal>
      }

      <Modal
        title="选择能力分级表文档"
        open={selectMappingModalVisible}
        onCancel={() => setSelectMappingModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="mb-4">
          <Text type="secondary">
            请选择一个能力分级表文档作为标准正文的能力要求参考。选择后可点击文档名称查看完整内容。
          </Text>
        </div>
        <List
          dataSource={mappingDocuments}
          renderItem={(doc: any) => (
            <List.Item
              key={doc.id}
              actions={[
                <Button
                  type="primary"
                  onClick={() => handleSelectMappingDocument(doc.id, doc.careerStandardMapName)}
                  disabled={selectedMappingDocId === doc.id}
                >
                  {selectedMappingDocId === doc.id ? '已选择' : '选择'}
                </Button>,
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewMappingDocument(doc.id)}
                >
                  查看详情
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Button
                    type="link"
                    onClick={() => handleViewMappingDocument(doc.id)}
                    style={{ padding: 0, height: 'auto', fontSize: '16px' }}
                  >
                    {doc.careerStandardMapName}
                  </Button>
                }
                description={
                  <div>
                    <div>版本: {doc.standardVersion}</div>
                    {doc.description && <div className="mt-1">{doc.remark}</div>}
                    <div className="mt-1 text-gray-400">
                      创建时间: {doc.createTime}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {mappingDocuments.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            该职业领域暂无可用的能力分级表文档
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StandardsCreation;
