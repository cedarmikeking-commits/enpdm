import { useState, useMemo, useCallback } from 'react';
import { Card, Form, message, Alert, Breadcrumb } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPendingStandards,
  getExpertCommitteeReviewStatistics,
  getCareerStandardDetail,
  submitCareerStandardAudit,
  type AuditListParams,
} from '@/api/standards-evaluation';
import {
  StatisticsCards,
  SearchFilters,
  StandardsTable,
  StandardDetailView,
  DeliberationView,
  type StandardDocument,
  type StandardRevision,
  type MappingRow,
  type Statistics,
  type ViewMode,
  type DeliberationDecision,
} from './components/ProfessionalDeliberation';

export default function ProfessionalDeliberation() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // State
  const [selectedDoc, setSelectedDoc] = useState<StandardDocument | null>(null);
  const [selectedRevision, setSelectedRevision] = useState<StandardRevision | null>(null);
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchText, setSearchText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<number | undefined>(undefined);
  const [deliberationDecision, setDeliberationDecision] = useState<DeliberationDecision>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 查询参数 - 使用 useMemo 避免每次渲染都创建新对象
  const queryParams = useMemo<AuditListParams>(() => {
    const params: AuditListParams = {
      current: pagination.current,
      size: pagination.pageSize,
    };

    if (searchText) {
      params.keyword = searchText;
    }

    if (selectedDomain) {
      params.careerId = selectedDomain;
    }

    return params;
  }, [searchText, selectedDomain, pagination.current, pagination.pageSize]);

  // 获取统计数据
  const { data: statisticsData } = useQuery({
    queryKey: ['expertCommitteeReviewStatistics'],
    queryFn: () => getExpertCommitteeReviewStatistics(),
  });

  // 获取待审议标准列表
  const { data: standardsResponse, isLoading: standardsLoading } = useQuery({
    queryKey: ['pendingStandards', queryParams],
    queryFn: () => getPendingStandards(queryParams),
    staleTime: 30000, // 30秒内不重新请求
    gcTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // 直接使用 useMemo 派生统计数据
  const statistics = useMemo<Statistics>(() => {
    if (!statisticsData) {
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      };
    }
    return {
      total: statisticsData.pendingReviewTotalNum,
      pending: statisticsData.pendingReviewNum,
      approved: statisticsData.reviewPassNum,
      rejected: statisticsData.reviewNoPassNum,
    };
  }, [statisticsData]);

  // 直接使用后端返回的数据，不做字段映射
  const revisions = useMemo(() => {
    if (!standardsResponse?.records) return [];
    return standardsResponse.records;
  }, [standardsResponse]);

  // 使用 useMemo 计算过滤后的数据
  const filteredRevisions = useMemo(() => {
    let filtered = [...revisions];

    if (searchText) {
      filtered = filtered.filter((record) => {
        return (
          record.careerStandardFileName?.toLowerCase().includes(searchText.toLowerCase()) ||
          record.standardVersion?.toLowerCase().includes(searchText.toLowerCase())
        );
      });
    }

    if (selectedDomain) {
      filtered = filtered.filter((record) => {
        return record.careerId === selectedDomain;
      });
    }

    return filtered;
  }, [revisions, searchText, selectedDomain]);

  // 使用 useCallback 包装事件处理函数
  const handleView = useCallback(async (record: any) => {
    setSelectedRevision(record);

    try {
      // 获取标准详情（包含审核流水）
      const detailResponse = await getCareerStandardDetail(record.id);

      console.log('🔥 API 返回数据:', detailResponse);
      console.log('🔥 审核流水:', detailResponse?.auditDetails);

      // 直接使用后端返回的数据
      setSelectedDoc(detailResponse as any);

      setMappingRows([]);
    } catch (error) {
      console.error('获取标准详情失败:', error);
      setMappingRows([]);
    }

    setViewMode('view');
  }, []);

  const handleDeliberate = useCallback(
    async (record: any) => {
      setSelectedRevision(record);

      try {
        // 获取标准详情（包含审核流水）
        const detailResponse = await getCareerStandardDetail(record.id);

        console.log('🔥 API 返回数据 (deliberate):', detailResponse);
        console.log('🔥 审核流水 (deliberate):', detailResponse?.auditDetails);

        // 直接使用后端返回的数据
        setSelectedDoc(detailResponse as any);

        setMappingRows([]);
      } catch (error) {
        console.error('获取标准详情失败:', error);
        setMappingRows([]);
      }

      form.resetFields();
      setDeliberationDecision(null);
      setViewMode('deliberate');
    },
    [form]
  );

  const handleSubmitDeliberation = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (!selectedDoc || !selectedRevision) {
        message.error('未选中标准');
        return;
      }

      // 准备审议数据
      const auditData: any = {
        careerStandardId: selectedDoc.id,
        auditStage: 3, // 3=专业委员会审议
        auditStatus: deliberationDecision === 'approved' ? 2 : 3, // 2=通过, 3=未通过
        auditUserName: values.auditUserName,
        auditReason: values.auditReason,
        auditScope: '[]', // 委员会审议不需要打分，传空数组
      };

      // 添加可选字段
      if (values.auditUserTitle) {
        auditData.auditUserTitle = values.auditUserTitle;
      }
      if (values.auditUserInstitution) {
        auditData.auditUserInstitution = values.auditUserInstitution;
      }

      // 如果审议不通过，需要添加修改建议（格式化为JSON）
      if (deliberationDecision === 'rejected' && values.suggestions) {
        // 将修改建议格式化为API要求的JSON格式
        // 简化处理：将整个建议作为一个条目
        auditData.suggestion = JSON.stringify([
          {
            chapter: '整体修改建议',
            issueFound: '需要改进',
            revSuggestion: values.suggestions,
          },
        ]);
      }

      await submitCareerStandardAudit(auditData);

      message.success('审议结果已提交');
      form.resetFields();
      setViewMode('list');
      setSelectedDoc(null);
      setSelectedRevision(null);
      setDeliberationDecision(null);

      // 刷新列表数据
      queryClient.invalidateQueries({ queryKey: ['pendingStandards'] });
      queryClient.invalidateQueries({ queryKey: ['expertCommitteeReviewStatistics'] });
    } catch (error: any) {
      console.error('提交失败详情:', error);
      message.error(`提交失败: ${error?.message || '请重试'}`);
    }
  }, [selectedDoc, selectedRevision, deliberationDecision, form, queryClient]);

  // 渲染
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {viewMode === 'list' && (
        <>
          {/* 面包屑导航 */}
          <Breadcrumb
            items={[{ title: '首页' }, { title: '标准审议' }, { title: '专家委员会审议' }]}
            className="mb-6"
          />

          {/* 页面标题 */}
          {/* <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">专家委员会审议</h1>
            <p className="text-gray-600">
              对已通过专家审查的职业标准送审稿进行最终专业审议，决定是否批准发布
            </p>
          </div> */}

          {/* 统计卡片 */}
          <StatisticsCards statistics={statistics} loading={standardsLoading} />

          {/* 说明提示 */}
          <Alert
            message="审议说明"
            description="《深圳协议》专家委员会对提交的职业领域标准送审稿进行专业审议，决定是否批准发布。审议通过后标准将进入发布流程，未通过则需重新修订。"
            type="info"
            showIcon
            className="mb-6"
            style={{ borderRadius: '12px' }}
          />

          {/* 搜索和筛选 */}
          <Card className="mb-6">
            <SearchFilters
              searchText={searchText}
              onSearchChange={setSearchText}
              selectedDomain={selectedDomain}
              onDomainChange={setSelectedDomain}
              loading={standardsLoading}
            />
          </Card>

          {/* 数据表格 */}
          <Card>
            <StandardsTable
              data={filteredRevisions as any}
              loading={standardsLoading}
              onView={handleView}
              onDeliberate={handleDeliberate}
            />
          </Card>
        </>
      )}

      {/* 查看详情页面 */}
      {viewMode === 'view' && selectedDoc && (
        <StandardDetailView
          document={selectedDoc}
          mappingRows={mappingRows}
          onBack={() => setViewMode('list')}
          onDeliberate={() => handleDeliberate(selectedRevision!)}
        />
      )}

      {/* 审议页面 */}
      {viewMode === 'deliberate' && selectedDoc && (
        <DeliberationView
          document={selectedDoc}
          form={form}
          deliberationDecision={deliberationDecision}
          isFullscreen={isFullscreen}
          onBack={() => setViewMode('list')}
          onDecisionChange={setDeliberationDecision}
          onSubmit={handleSubmitDeliberation}
          onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
        />
      )}
    </div>
  );
}
