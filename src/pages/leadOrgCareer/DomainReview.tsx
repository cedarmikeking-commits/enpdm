import React, { useState, useEffect, useCallback } from 'react';
import { Input, Tag, Select, Empty, message, Spin, Tooltip, Modal } from 'antd';
import {
  SearchOutlined, HomeOutlined, RightOutlined,
  EyeOutlined, AuditOutlined,
  CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined, DownOutlined, ExclamationCircleOutlined,
  FilterOutlined,
} from '@ant-design/icons';
// import { supabase } from '../lib/supabase';
import DomainReviewDetail from '@/components/DomainReview/DomainReviewDetail';
import { auditApply, getApplyPage, getAuditStatistics, getJoinDeptListByAudit } from '@/api/leadOrgCareer';

const { Option } = Select;
const { TextArea } = Input;


const STATUS_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode; dot: string }> = {
  1: { color: 'orange', label: '待审核', icon: <ClockCircleOutlined />, dot: 'bg-amber-500' },
  2: { color: 'green', label: '已通过', icon: <CheckCircleOutlined />, dot: 'bg-emerald-500' },
  3: { color: 'red', label: '已驳回', icon: <CloseCircleOutlined />, dot: 'bg-red-500' },
};

const STAT_DEFS = [
  { key: 'applyTotal', label: '申请总数', sub: '牵头单位', icon: '📋', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-blue-600', filter: () => true },
  { key: 'waitAuditTotal', label: '待审核', sub: '待处理', icon: '⏳', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-500', filter: () => true },
  { key: 'auditPassTotal', label: '已通过', sub: '审核完成', icon: '✅', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500', filter: () => true },
  { key: 'auditNoPassTotal', label: '已驳回', sub: '未通过', icon: '❌', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', accent: 'bg-red-500', filter: () => true },
];

type DetailMode =
  | { type: 'leading'; applyInfo: any, joinDeptInfo: any }
  | { type: 'participating'; joinDeptInfo: any; applyInfo: any };

/* ── Audit Modal ── */
const AuditModal: React.FC<{
  record: any | null;
  onClose: () => void;
  onConfirm: (id: string, action: '2' | '3', comment: string) => Promise<void>;
}> = ({ record, onClose, onConfirm }) => {
  const [submitting, setSubmitting] = useState<'2' | '3' | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (record) setComment(record.auditReason ?? '');
  }, [record]);

  if (!record) return null;

  const handleAction = async (action: '2' | '3') => {
    if (action == '3' && !comment.trim()) {
      message.warning('驳回时请填写审核意见');
      return;
    }
    setSubmitting(action);
    await onConfirm(record.id, action, comment.trim());
    setSubmitting(null);
  };

  const canAudit = !['2', '3'].includes(record.auditStatus);
  const cfg = STATUS_CONFIG[record.auditStatus] ?? { color: 'default', label: record.status, dot: 'bg-gray-400' };

  return (
    <Modal
      open={!!record}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      closable
      maskClosable={!submitting}
      styles={{ content: { borderRadius: 12, padding: 0, overflow: 'hidden' } }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <AuditOutlined style={{ color: '#fff', fontSize: 16 }} />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">内容审核</div>
          <div className="text-xs text-gray-400">请填写审核意见并确认结果</div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Record info */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center mt-0.5">
              <span className="text-white text-xs font-bold">{record.deptName?.[0]}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-gray-800">{record.deptName}</div>
              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{record.careerName}</span>
                {record.careerCode && (
                  <span className="font-mono bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">
                    {record.careerCode}
                  </span>
                )}
              </div>
            </div>
            <Tag
              icon={cfg.icon}
              color={cfg.color}
              style={{ margin: 0, fontSize: 11, borderRadius: 5, flexShrink: 0 }}
            >
              {cfg.label}
            </Tag>
          </div>
        </div>

        {/* Review comment */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            审核意见
            {!canAudit && <span className="ml-1 text-gray-400 font-normal">（只读）</span>}
            {canAudit && <span className="ml-1 text-red-400">驳回时必填</span>}
          </label>
          <TextArea
            rows={4}
            placeholder="请输入审核意见，如有修改要求请详细说明..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={!canAudit || !!submitting}
            style={{ borderRadius: 8, fontSize: 13 }}
          />
        </div>

        {!canAudit ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
            <ExclamationCircleOutlined style={{ color: '#d97706', fontSize: 14 }} />
            <span className="text-xs text-amber-700">该申请已完成审核，无需重复操作</span>
          </div>
        ) : (
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => handleAction('3')}
              disabled={!!submitting}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border font-medium text-sm transition-all duration-150 ${submitting == '3'
                ? 'border-red-200 bg-red-50 text-red-300 cursor-wait'
                : 'border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 active:scale-[0.98]'
                }`}
            >
              {submitting == '3' ? <Spin size="small" /> : <CloseCircleOutlined />}
              驳回
            </button>
            <button
              onClick={() => handleAction('2')}
              disabled={!!submitting}
              className={`flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${submitting == '2'
                ? 'bg-blue-300 text-white cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                }`}
            >
              {submitting == '2' ? <Spin size="small" /> : <CheckCircleOutlined />}
              审核通过
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

/* ── Accordion row ── */
const AccordionRow: React.FC<{
  record: any;
  index: number;
  isExpanded: boolean;
  participants: any[];
  loadingPart: boolean;
  onToggle: () => void;
  onViewLeading: () => void;
  onViewParticipating: (relId: string) => void;
  onAudit: () => void;
}> = ({ record, index, isExpanded, participants, loadingPart, onToggle, onViewLeading, onViewParticipating, onAudit }) => {
  const cfg = STATUS_CONFIG[record.auditStatus] ?? { color: 'default', label: record.status, dot: 'bg-gray-400' };

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${isExpanded
      ? 'border-blue-200 shadow-md'
      : 'border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md'
      }`}>
      {/* Main row */}
      <div
        className={`flex items-center gap-4 px-5 py-4 cursor-pointer select-none transition-colors duration-150 ${isExpanded ? 'bg-blue-50/40' : 'bg-white hover:bg-gray-50'
          }`}
        onClick={onToggle}
      >
        {/* Index badge */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 ${isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
          {index}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">{record.deptName}</span>
            {record.careerCode && (
              <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                {record.careerCode}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{record.careerName}</div>
        </div>

        {/* Status */}
        <Tag
          icon={cfg.icon}
          color={cfg.color}
          style={{ margin: 0, fontSize: 11, borderRadius: 5, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
        >
          {cfg.label}
        </Tag>

        {/* Date */}
        <div className="flex-shrink-0 text-right hidden lg:block min-w-[80px]">
          <div className="text-xs text-gray-500">
            {record.updateTime
              ? new Date(record.updateTime).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
              : '—'}
          </div>
          <div className="text-[10px] text-gray-400">
            {record.updateTime
              ? new Date(record.updateTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
              : ''}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <Tooltip title="查看申请详情" placement="top">
            <button
              onClick={onViewLeading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150"
            >
              <EyeOutlined style={{ fontSize: 14 }} />
            </button>
          </Tooltip>
          <Tooltip title="内容审核" placement="top">
            <button
              onClick={onAudit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150"
            >
              <AuditOutlined style={{ fontSize: 14 }} />
            </button>
          </Tooltip>
        </div>

        {/* Expand arrow */}
        <div className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <DownOutlined style={{ fontSize: 11, color: isExpanded ? '#475569' : '#94a3b8' }} />
        </div>
      </div>

      {/* Review comment strip (if exists and not expanded) */}
      {!isExpanded && record.review_comment && (
        <div className="px-5 pb-3 pt-0 bg-white border-t border-dashed border-gray-100">
          <div className="text-[11px] text-gray-400">
            <span className="font-medium text-gray-500">审核意见：</span>
            {record.review_comment}
          </div>
        </div>
      )}

      {/* Participating units */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
          {/* Review comment in expanded state */}
          {record.review_comment && (
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="text-xs font-medium text-gray-500 mb-1">审核意见</div>
              <div className="text-sm text-gray-700">{record.review_comment}</div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="w-0.5 h-3.5 bg-blue-400 rounded-full" />
            <span className="text-xs font-medium text-gray-500">参与单位</span>
            {!loadingPart && (
              <span className="text-[11px] text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                {participants.length} 个
              </span>
            )}
          </div>

          {loadingPart ? (
            <div className="flex items-center justify-center py-5">
              <Spin size="small" />
              <span className="ml-2 text-xs text-gray-400">加载中...</span>
            </div>
          ) : participants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-5 text-gray-400 gap-1">
              <TeamOutlined style={{ fontSize: 18, opacity: 0.3 }} />
              <span className="text-xs">暂无参与单位</span>
            </div>
          ) : (
            <div className="space-y-1.5 pl-3">
              {participants.map((p, pi) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 bg-white rounded-lg px-4 py-2.5 border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-150"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded bg-blue-50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-500">{pi + 1}</span>
                  </div>
                  <span className="text-sm text-gray-700 flex-1 truncate">{p.deptName}</span>
                  <Tooltip title="查看申请详情" placement="left">
                    <button
                      onClick={() => onViewParticipating(p)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150"
                    >
                      <EyeOutlined style={{ fontSize: 12 }} />
                    </button>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main component ── */
const DomainReview: React.FC = () => {
  const [detail, setDetail] = useState<DetailMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [participantsCache, setParticipantsCache] = useState<Record<string, any[]>>({});
  const [loadingPartIds, setLoadingPartIds] = useState<Set<string>>(new Set());
  const [auditTarget, setAuditTarget] = useState<any | null>(null);
  const [allRecords, setAllRecords] = useState<any>({});
  const [statistics, setStatistics] = useState<any>({});
  const [pagingSearch, setPagingSearch] = useState({ size: 10, current: 1, keyword: "", auditStatus: undefined });

  useEffect(() => {
    fetchStatistics();
    fetchRecords();
  }, []);
  const fetchStatistics = async () => {
    setLoading(true);
    getAuditStatistics().then(res => {
      setStatistics(res);
    }).catch(err => {
      message.error('加载数据失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setLoading(false);
    })
  }
  const fetchRecords = async (searchParams?: any) => {
    setLoading(true);
    getApplyPage({ ...pagingSearch, ...searchParams }).then(res => {
      setAllRecords(res);
      setPagingSearch({ ...pagingSearch, ...searchParams });
    }).catch(err => {
      message.error('加载记录失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setLoading(false);
    })
  }

  /**审核 */
  const handleAuditConfirm = async (id: string, action: '2' | '3', comment: string) => {
    setLoading(true);
    auditApply({ applyId: id, status: action, auditReason: comment }).then(() => {
      message.success(action === '2' ? '已审核通过' : '已驳回');
      setAuditTarget(null);
      fetchRecords();
    }).catch(err => {
      message.error('操作失败:' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setLoading(false);
    })
  };
  /** 查参与单位 */
  const toggleExpand = (rec: any) => {
    const id = rec.id;
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    loadParticipants(rec);
  };

  const loadParticipants = useCallback(async (rec: any) => {
    if (participantsCache[rec.id] !== undefined || loadingPartIds.has(rec.id)) return;
    setLoadingPartIds(prev => new Set(prev).add(rec.id));
    getJoinDeptListByAudit({ careerId: rec.careerId, leadOrgId: rec.deptId }).then(res => {
      setParticipantsCache(prev => ({ ...prev, [rec.id]: res || [] }));
    }).catch(err => {
      message.error('加载参与单位失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setLoadingPartIds(prev => { const next = new Set(prev); next.delete(rec.id); return next; });
    })

  }, [participantsCache, loadingPartIds]);

  if (detail) {
    return (
      <DomainReviewDetail
        recordInfo={detail}
        leadOrgInfo={detail.applyInfo}
        onBack={() => setDetail(null)}
      />
    );
  }

  const totalPages = Math.ceil(allRecords?.total / pagingSearch.size);

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <HomeOutlined style={{ fontSize: 12 }} />
          <RightOutlined style={{ fontSize: 9 }} />
          <span>领域建设</span>
          <RightOutlined style={{ fontSize: 9 }} />
          <span className="text-gray-700 font-medium">建设内容审核</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">建设内容审核</h1>
            <p className="text-xs text-gray-400 mt-0.5">审核各牵头单位提交的职业领域建设申请</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {STAT_DEFS.map(s => {
            return (
              <div key={s.key} className={`bg-white rounded-xl border ${s.border} p-5 flex items-center gap-4 shadow-sm`}>
                <div className={`w-11 h-11 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-xl font-bold ${s.color}`}>{
                    s.key == 'applyTotal' ? statistics?.applyTotal : s.key == 'pendingTotal' ? statistics?.waitAuditTotal : s.key == 'approvedTotal' ? statistics?.auditPassTotal : statistics?.auditNoPassTotal}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{s.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3 flex items-center gap-3 flex-wrap">
          <FilterOutlined style={{ color: '#94a3b8', fontSize: 13 }} />
          <Input
            placeholder="搜索牵头单位、职业领域、领域代码..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={pagingSearch.keyword}
            onChange={e => {
              setPagingSearch({ ...pagingSearch, keyword: e.target.value, current: 1 });
              fetchRecords({ ...pagingSearch, keyword: e.target.value, current: 1 });
              setPage(1);

            }}
            allowClear
            style={{ width: 280, borderRadius: 8 }}
            size="small"
          />
          <Select
            placeholder="审核状态"
            value={pagingSearch.auditStatus}
            onChange={v => {
              setPagingSearch({ ...pagingSearch, auditStatus: v, current: 1 });
              fetchRecords({ ...pagingSearch, auditStatus: v, current: 1 });
              setPage(1);
            }}
            allowClear
            onClear={() => {
              setPagingSearch({ ...pagingSearch, auditStatus: undefined, current: 1 });
              fetchRecords({ ...pagingSearch, auditStatus: undefined, current: 1 });
              setPage(1);
            }}
            style={{ width: 120 }}
            size="small"
          >
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <Option key={k} value={k}>
                <Tag color={v.color} style={{ margin: 0, fontSize: 11 }}>{v.label}</Tag>
              </Option>
            ))}
          </Select>
          {(
            <button
              onClick={() => {
                setPagingSearch({ ...pagingSearch, auditStatus: undefined, keyword: '', current: 1 });
                fetchRecords({ ...pagingSearch, auditStatus: undefined, keyword: '', current: 1 });
                setPage(1);
              }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              清除筛选
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">
            共 <span className="font-medium text-gray-600">{allRecords?.total}</span> 条
          </span>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-0.5 bg-blue-500 rounded-t-xl" />

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spin />
            </div>
          ) : allRecords?.total === 0 ? (
            <div className="py-16">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-gray-400 text-sm">{'暂无审核数据'}</span>}
              />
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {allRecords?.records?.map((rec: any, idx: number) => (
                <AccordionRow
                  key={rec.id}
                  record={rec}
                  index={(pagingSearch.current - 1) * pagingSearch.size + idx + 1}
                  isExpanded={expandedIds.has(rec.id)}
                  participants={participantsCache[rec.id] ?? []}
                  loadingPart={loadingPartIds.has(rec.id)}
                  onToggle={() => toggleExpand(rec)}
                  onViewLeading={() => setDetail({ type: 'leading', applyInfo: rec, joinDeptInfo: null })}
                  onViewParticipating={joinDept => setDetail({ type: 'participating', joinDeptInfo: joinDept, applyInfo: rec })}
                  onAudit={() => setAuditTarget(rec)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {allRecords?.total > pagingSearch.size && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">共 {allRecords?.total} 条，每页 {pagingSearch.size} 条</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => {
                    setPage(p => p - 1);
                    setPagingSearch({ ...pagingSearch, current: page - 1 });
                    fetchRecords({ ...pagingSearch, current: page - 1 });
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  上一页
                </button>
                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: allRecords?.pages ?? 1 }, (_, i) => {
                    let p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setPage(p);
                          setPagingSearch({ ...pagingSearch, current: p });
                          fetchRecords({ ...pagingSearch, current: p });
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-all duration-150 ${p === page ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                          }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() => {
                    setPage(p => p + 1)
                    setPagingSearch({ ...pagingSearch, current: page + 1 });
                    fetchRecords({ ...pagingSearch, current: page + 1 });
                  }
                  }
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuditModal
        record={auditTarget}
        onClose={() => setAuditTarget(null)}
        onConfirm={handleAuditConfirm}
      />
    </div>
  );
};

export default DomainReview;
