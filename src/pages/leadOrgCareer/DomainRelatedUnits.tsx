import React, { useState, useEffect, useMemo } from 'react';
import {
  Select, Spin, Empty, Tooltip, Badge,
  Avatar, Divider,
  message,
} from 'antd';
import {
  HomeOutlined, RightOutlined,
  BankOutlined, TeamOutlined, ApartmentOutlined,
  PhoneOutlined, UserOutlined,
  IdcardOutlined,
  CrownOutlined, FlagOutlined, ShopOutlined,
  GlobalOutlined, DownOutlined, UpOutlined,
} from '@ant-design/icons';
import { getCareerList, getRelatedDeptByCareerId } from '@/api/leadOrgCareer/relatedDept';
import { useDict } from '@/hooks/useDict';

const { Option } = Select;

/* ─── Types ─── */

interface LeadingUnit {
  id: string;
  school_name: string;
  domain_name: string;
  domain_code: string;
  team_leader_name: string;
  team_leader_gender: string;
  team_leader_admin_position: string;
  team_leader_tech_position: string;
  team_leader_phone: string;
  contact_name: string;
  contact_position: string;
  contact_phone: string;
  contact_email: string;
  advantage_major: string;
  status: string;
}

interface ParticipatingUnit {
  rel_id: string;
  participating_unit_name: string;
  domain_name: string;
  leading_unit_name: string;
  status: string;
  leader_name: string | null;
  leader_phone: string | null;
  leader_admin_position: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  cooperation_list: { enterprise: string; content: string }[] | null;
}

interface EnterpriseItem {
  enterprise: string;
  content: string;
  source_unit: string;
  source_type: 'leading' | 'participating';
}

interface AssociationItem {
  id: string;
  association_name: string;
  association_name_english: string | null;
  association_code: string | null;
  registration_address: string | null;
  association_unit_count: string | null;
  organization_level: string | null;
  organization_tier: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  unit_brief: string | null;
}

type MenuKey = 'leading' | 'participating' | 'enterprise' | 'industry';

const MENU_ITEMS: { key: MenuKey; label: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
  { key: 'leading', label: '牵头单位', icon: <CrownOutlined />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'participating', label: '参与单位', icon: <TeamOutlined />, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
  { key: 'enterprise', label: '合作企业', icon: <ShopOutlined />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'industry', label: '行业组织', icon: <GlobalOutlined />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

const EDU_PARENT_KEYS: MenuKey[] = ['leading', 'participating'];

/* ─── Helpers ─── */
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string | number | null }> = ({ icon, label, value }) => {
  if (value == null || value === '') return null;
  return (
    <div className="flex items-start gap-2 text-xs text-gray-600">
      <span className="flex-shrink-0 w-3.5 mt-0.5 text-gray-400">{icon}</span>
      <span className="text-gray-400 flex-shrink-0 whitespace-nowrap">{label}</span>
      <span className="text-gray-700 font-medium break-all">{value}</span>
    </div>
  );
};

const DetailChip: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
    <div className="text-[10px] text-gray-400 mb-0.5">{label}</div>
    <div className="text-xs font-medium text-gray-700">{value ?? '—'}</div>
  </div>
);

const ExpandToggle: React.FC<{ expanded: boolean; onClick: () => void }> = ({ expanded, onClick }) => (
  <Tooltip title={expanded ? '收起基本信息' : '展开基本信息'} placement="left" mouseEnterDelay={0.3}>
    <button
      onClick={onClick}
      className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-200 ${expanded
        ? 'bg-blue-50 border-blue-200 text-blue-500 shadow-sm'
        : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500'
        }`}
    >
      {expanded
        ? <UpOutlined style={{ fontSize: 10 }} />
        : <DownOutlined style={{ fontSize: 10 }} />}
    </button>
  </Tooltip>
);

/* ─── School Expanded Panel (shared by leading & participating) ─── */
const SchoolExpandedPanel: React.FC<{ deptInfo: any }> = ({ deptInfo }) => {
  const { getLabel } = useDict(['charge_dept_type', 'project_apply_study_level', 'edu_org_type']);

  if (!deptInfo) return <div className="px-5 py-2 text-xs text-gray-400">未找到该机构注册信息</div>;

  return (
    <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3 bg-gray-50/50">
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">机构基本信息</div>
      <div className="grid grid-cols-2 gap-2">
        <DetailChip label="机构负责人" value={deptInfo.chargeMan} />
        <DetailChip label="统一社会信用代码" value={deptInfo.uscc} />
        <DetailChip label="所在地" value={deptInfo.regionCode} />
        <DetailChip label="联系电话" value={deptInfo.chargePhone} />
      </div>
      {(deptInfo.chargeDeptType || deptInfo.governing_body_name) && (
        <div className="grid grid-cols-2 gap-2">
          <DetailChip label="主管部门类型" value={getLabel('charge_dept_type', deptInfo.chargeDeptType)} />
          <DetailChip label="主管部门名称" value={deptInfo.chargeDeptName} />
        </div>
      )}
      {(deptInfo.studentNum != null || deptInfo.teacherNum != null || deptInfo.fulltimeTeacherNum != null) && (
        <div className="grid grid-cols-3 gap-2">
          <DetailChip label="在校生数" value={deptInfo.studentNum != null ? `${deptInfo.studentNum} 人` : null} />
          <DetailChip label="教职工总数" value={deptInfo.teacherNum != null ? `${deptInfo.teacherNum} 人` : null} />
          <DetailChip label="专任教师" value={deptInfo.fulltimeTeacherNum != null ? `${deptInfo.fulltimeTeacherNum} 人` : null} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {deptInfo.universityStudyLevel && <DetailChip label="办学层次" value={
          deptInfo.universityStudyLevel == '4' ? deptInfo.universityStudyLevelOther : getLabel('project_apply_study_level', deptInfo.universityStudyLevel)} />}
        {deptInfo.eduOrgType && <DetailChip label="院校类型" value={
          deptInfo.eduOrgType == '4' ? deptInfo.eduOrgTypeOther : getLabel('edu_org_type', deptInfo.eduOrgType)
        } />}
        {deptInfo.email && <DetailChip label="电子邮箱" value={deptInfo.email} />}
        {deptInfo.officialSite && <DetailChip label="官网" value={deptInfo.officialSite} />}
      </div>
    </div>
  );
};

/* ─── Company Expanded Panel ─── */
const CompanyExpandedPanel: React.FC<{ companyName: string; item: any }> = ({ item }) => {
   const { getLabel } = useDict(['company_org_type','cooperate_type']);

  return (
    <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3 bg-gray-50/50">
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">合作信息</div>
      <div className="bg-amber-50/60 rounded-lg px-3 py-2 border border-amber-100/60">
        <div className="text-[10px] text-amber-600 mb-1">合作内容</div>
        <div className="text-xs text-gray-700">{item?.cooperateType=='4'?item.cooperateTypeOther: getLabel('cooperate_type',item?.cooperateType) || '暂无描述'}</div>
      </div>
      {/* <div className="flex items-center gap-1.5">
        <BankOutlined style={{ fontSize: 10, color: '#9ca3af' }} />
        <span className="text-xs text-gray-500">{item.source_unit}</span>
        <span className="text-[10px] text-gray-400">({item.source_type === 'leading' ? '牵头' : '参与'})</span>
      </div> */}
      {item && (
        <>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide pt-1">企业基本信息</div>
          {item.deptEname && (
            <div className="text-xs text-gray-500 italic">{item.deptEname}</div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <DetailChip label="统一社会信用代码" value={item.uscc} />
            <DetailChip label="证件有效期" value={item.endDate} />
            <DetailChip label="企业类型" value={item.companyOrgType=='6'?item.companyOrgTypeOther: getLabel('company_org_type', item.companyOrgType)}  />
            <DetailChip label="企业规模" value={item.companySize} />
            <DetailChip label="注册地址" value={item.address} />
            <DetailChip label="经营地址" value={item.businessAddress} />
          </div>
          {(item.contactMan || item.contactPhone || item.email) && (
            <>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-2">联系方式</div>
              <div className="grid grid-cols-3 gap-2">
                <DetailChip label="联系人" value={item.contactMan} />
                <DetailChip label="电话" value={item.contactPhone} />
                <DetailChip label="邮箱" value={item.email} />
              </div>
            </>
          )}
          {item.businessArea && (
            <div className="bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-2">
              <div className="text-[10px] text-amber-600 mb-1">主营业务</div>
              <div className="text-xs text-gray-700">{item.businessArea}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

/* ─── Association Expanded Panel ─── */
const AssociationExpandedPanel: React.FC<{ data: any }> = ({ data }) => {
     const { getLabel } = useDict(['dept_level','dept_layer']);
  return (
  <div className="px-5 pb-4 space-y-3 border-t border-gray-100 pt-3 bg-gray-50/50">
    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">组织基本信息</div>
    {data.deptName && (
      <div className="text-xs text-gray-500 italic">{data.deptName}</div>
    )}
    <div className="grid grid-cols-2 gap-2">
      <DetailChip label="统一社会信用代码" value={data.uscc} />
      <DetailChip label="下属单位数" value={data.orgnum} />
      <DetailChip label="组织级别" value={getLabel('dept_level', data.deptLevel)} />
      <DetailChip label="组织层级" value={getLabel('dept_layer', data.deptLayer)} />
      {data.address && <DetailChip label="注册地址" value={data.address} />}
    </div>
    {(data.contactMan || data.contactPhone || data.email) && (
      <>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-2">联系方式</div>
        <div className="grid grid-cols-3 gap-2">
          <DetailChip label="联系人" value={data.contactMan} />
          <DetailChip label="电话" value={data.contactPhone} />
          <DetailChip label="邮箱" value={data.email} />
        </div>
      </>
    )}
    {data.remark && (
      <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg px-3 py-2">
        <div className="text-[10px] text-emerald-600 mb-1">单位简介</div>
        <div className="text-xs text-gray-700 line-clamp-4">{data.remark}</div>
      </div>
    )}
  </div>
)};

/* ─── Leading Unit Card ─── */
const LeadingUnitCard: React.FC<{ unit: any; index: number, career: any }> = ({ unit, index, career }) => {
  const [expanded, setExpanded] = useState(false);
  const initials = unit.deptName?.slice(0, 2) ?? '学';

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${expanded ? 'border-blue-200 shadow-md' : 'border-gray-200 hover:border-blue-200 hover:shadow-md'}`}>
      <div className="px-5 pt-5 pb-4 flex items-start gap-4">
        <Avatar size={44} style={{ background: `hsl(${(index * 47) % 360}, 60%, 55%)`, flexShrink: 0, fontWeight: 700, fontSize: 14 }}>
          {initials}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 leading-tight">{unit.deptName}</div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {career.careerCode && (
                  <span className="font-mono text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded">{career.careerCode}</span>
                )}
              </div>
            </div>
            <ExpandToggle expanded={expanded} onClick={() => setExpanded(e => !e)} />
          </div>
        </div>
      </div>

      {expanded && <SchoolExpandedPanel deptInfo={unit} />}
    </div>
  );
};

/* ─── Participating Unit Card ─── */
const ParticipatingUnitCard: React.FC<{ unit: any; index: number, career: any, leadOrgName: string, joinDeptBuildList: any }> = ({ unit, index, leadOrgName, joinDeptBuildList }) => {
  const [expanded, setExpanded] = useState(false);
  const initials = unit.deptName?.slice(0, 2) ?? '单';
  const deptBuildInfo =joinDeptBuildList && joinDeptBuildList.find((item: any) => item.deptId === unit.deptId);
  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${expanded ? 'border-cyan-200 shadow-md' : 'border-gray-200 hover:border-cyan-200 hover:shadow-md'}`}>
      <div className="px-5 pt-5 pb-4 flex items-start gap-4">
        <Avatar size={44} style={{ background: `hsl(${(index * 53 + 160) % 360}, 55%, 55%)`, flexShrink: 0, fontWeight: 700, fontSize: 14 }}>
          {initials}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 leading-tight">{unit.deptName}</div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="text-[11px] text-gray-400">牵头：{leadOrgName}</span>
              </div>
            </div>
            <ExpandToggle expanded={expanded} onClick={() => setExpanded(e => !e)} />
          </div>
        </div>
      </div>

      {deptBuildInfo?.chargeMan && (
        <>
          <Divider style={{ margin: '0 20px', width: 'calc(100% - 40px)', minWidth: 'auto', borderColor: '#f0f0f0' }} />
          <div className="px-5 py-3 space-y-1.5">
            <div className="flex items-center gap-1.5 bg-cyan-50 rounded-lg px-3 py-1.5">
              <UserOutlined style={{ fontSize: 11, color: '#0891b2' }} />
              <span className="text-xs text-gray-500">负责人</span>
              <span className="text-xs font-semibold text-gray-800 ml-1">{deptBuildInfo?.chargeMan}</span>
            </div>
            <div className="space-y-1.5 pl-1">
              <InfoRow icon={<IdcardOutlined />} label="行政职务" value={deptBuildInfo?.administrationPosition} />
              <InfoRow icon={<PhoneOutlined />} label="电话" value={deptBuildInfo?.chargeManPhone} />
            </div>
          </div>
        </>
      )}

      {(deptBuildInfo?.contactMan || unit.contactPhone) && (
        <>
          <Divider style={{ margin: '0 20px', width: 'calc(100% - 40px)', minWidth: 'auto', borderColor: '#f0f0f0' }} />
          <div className="px-5 py-3 space-y-1.5 bg-gray-50/60">
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-2">联系人</div>
            <InfoRow icon={<UserOutlined />} label="姓名" value={unit.contactMan} />
            <InfoRow icon={<PhoneOutlined />} label="电话" value={unit.contactPhone} />
          </div>
        </>
      )}

      {deptBuildInfo?.joinDeptBuildCompanyList && deptBuildInfo?.joinDeptBuildCompanyList?.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100">
          <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-2">
            合作企业 <span className="ml-1 text-gray-300">({deptBuildInfo?.joinDeptBuildCompanyList?.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {deptBuildInfo?.joinDeptBuildCompanyList?.map((c:any, i:number) => (
              <Tooltip key={i} title={c.cooperateContent} placement="top">
                <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-md cursor-default">
                  {c.company}
                </span>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {expanded && <SchoolExpandedPanel deptInfo={unit} />}
    </div>
  );
};

/* ─── Enterprise Card ─── */
const EnterpriseCard: React.FC<{ item: any; index: number, career: any }> = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false);
  const initials = item.deptName?.slice(0, 2) ?? '企';

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${expanded ? 'border-amber-200 shadow-md' : 'border-gray-200 hover:border-amber-200 hover:shadow-md'}`}>
      <div className="px-5 pt-5 pb-4 flex items-start gap-4">
        <Avatar
          size={44}
          shape="square"
          style={{ background: `hsl(${(index * 41 + 30) % 60 + 20}, 70%, 55%)`, flexShrink: 0, fontWeight: 700, fontSize: 14, borderRadius: 10 }}
        >
          {initials}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900">{item.deptName}</div>
              <div className="flex items-center gap-1.5 mt-1">
                <ShopOutlined style={{ fontSize: 10, color: '#d97706' }} />
                <span className="text-[11px] text-amber-600">合作企业</span>
              </div>
            </div>
            <ExpandToggle expanded={expanded} onClick={() => setExpanded(e => !e)} />
          </div>
        </div>
      </div>
      {expanded && <CompanyExpandedPanel companyName={item.deptName} item={item} />}
    </div>
  );
};

/* ─── Industry Org Card ─── */
const IndustryCard: React.FC<{ item: any; index: number, career: any }> = ({ item, index }) => {
  const [expanded, setExpanded] = useState(false);
  const initials = item.deptName?.slice(0, 2) ?? '组';
  const {getLabel} = useDict(['dept_level','dept_layer']);
  const levelColor: Record<string, string> = {
    '1': 'text-red-500',
    '2': 'text-orange-500',
    '3': 'text-yellow-600',
  };

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${expanded ? 'border-emerald-200 shadow-md' : 'border-gray-200 hover:border-emerald-200 hover:shadow-md'}`}>
      <div className="px-5 pt-5 pb-4 flex items-start gap-4">
        <Avatar size={44} style={{ background: `hsl(${140 + (index * 20) % 60}, 55%, 48%)`, flexShrink: 0, fontWeight: 700, fontSize: 13 }}>
          {initials}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 leading-tight">{item.deptName}</div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {item.deptLevel && (
                  <span className={`text-[11px] font-medium ${levelColor[item.deptLevel] ?? 'text-emerald-600'}`}>
                    <FlagOutlined style={{ fontSize: 9, marginRight: 2 }} />
                    {getLabel('dept_level', item.deptLevel)}
                  </span>
                )}
                {item.deptLayer && (
                  <span className="text-[11px] text-gray-400">{getLabel('dept_layer', item.deptLayer)}</span>
                )}
              </div>
            </div>
            <ExpandToggle expanded={expanded} onClick={() => setExpanded(e => !e)} />
          </div>
        </div>
      </div>
      {expanded && <AssociationExpandedPanel data={item} />}
    </div>
  );
};

/* ─── Main Component ─── */
const DomainRelatedUnits: React.FC = () => {
  const [domains, setDomains] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [activeMenu, setActiveMenu] = useState<MenuKey>('leading');
  const [loading, setLoading] = useState(false);

  const [leadingUnits, setLeadingUnits] = useState<LeadingUnit[]>([]);
  const [participatingUnits, setParticipatingUnits] = useState<ParticipatingUnit[]>([]);
  const [associations, setAssociations] = useState<AssociationItem[]>([]);
  const [relatedDepts, setRelatedDepts] = useState<any>({});
  useEffect(() => {
    getCareerList().then(res => {
      setDomains(res);
      if (res.length > 0) setSelectedDomain(res[0].id || '');
    }).catch((err) => {
      message.error('加载记录失败：' + err?.response?.data?.msg || err?.message);
    })
  }, []);

  useEffect(() => {
    if (!selectedDomain) return;
    setLoading(true);
    getRelatedDeptByCareerId({ careerId: selectedDomain }).then(res => {
      setRelatedDepts(res);
    }).catch(err => {
      message.error('加载记录失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() =>
      setLoading(false)
    )
  }, [selectedDomain]);

  const enterprises = useMemo<EnterpriseItem[]>(() => {
    const map = new Map<string, EnterpriseItem>();
    participatingUnits.forEach(pu => {
      (pu.cooperation_list ?? []).forEach(c => {
        if (c.enterprise && !map.has(c.enterprise)) {
          map.set(c.enterprise, { enterprise: c.enterprise, content: c.content, source_unit: pu.participating_unit_name, source_type: 'participating' });
        }
      });
    });
    return Array.from(map.values());
  }, [participatingUnits]);

  const selectedDomainObj = domains.find(d => d.id === selectedDomain);

  const counts: Record<MenuKey, number> = {
    leading: relatedDepts?.leadOrgList?.length ?? 0,
    participating: relatedDepts?.joinOrgList?.length ?? 0,
    enterprise: relatedDepts?.partnerOrgList?.length ?? 0,
    industry: relatedDepts?.industryOrgList?.length ?? 0,
  };

  const renderCards = () => {
    if (loading) return <div className="flex items-center justify-center py-24"><Spin size="large" /></div>;
    if (!selectedDomain) return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <ApartmentOutlined style={{ fontSize: 40, opacity: 0.2 }} />
        <div className="mt-3 text-sm">请先选择职业领域</div>
      </div>
    );

    if (activeMenu === 'leading') {
      if (relatedDepts?.leadOrgList?.length === 0) return <EmptyState text="该领域暂无牵头单位" />;
      return <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{relatedDepts?.leadOrgList?.map((u: any, i: number) => <LeadingUnitCard key={u.id} unit={u} index={i} career={selectedDomainObj} />)}</div>;
    }
    if (activeMenu === 'participating') {
      if (relatedDepts?.joinOrgList?.length === 0) return <EmptyState text="该领域暂无参与单位" />;
      return <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{relatedDepts?.joinOrgList?.map((u: any, i: number) =>
        <ParticipatingUnitCard key={u.id} unit={u} index={i} career={selectedDomainObj}
          leadOrgName={relatedDepts?.leadOrgList?.length > 0 ? relatedDepts?.leadOrgList[0].deptName : ''}
          joinDeptBuildList={relatedDepts?.joinDeptBuildList}
        />)}</div>;
    }
    if (activeMenu === 'enterprise') {
      if (relatedDepts?.partnerOrgList?.length === 0) return <EmptyState text="该领域暂无合作企业信息" />;
      return <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{relatedDepts?.partnerOrgList?.map((u: any, i: number) => <EnterpriseCard key={u.id} item={u} index={i} career={selectedDomainObj} />)}</div>;
    }
    if (activeMenu === 'industry') {
      if (relatedDepts?.industryOrgList?.length === 0) return <EmptyState text="暂无行业组织信息" />;
      return <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{relatedDepts?.industryOrgList?.map((u: any, i: number) => <IndustryCard key={u.id} item={u} index={i} career={selectedDomainObj} />)}</div>;
    }
    return null;
  };

  const activeConfig = MENU_ITEMS.find(m => m.key === activeMenu)!;

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
          <HomeOutlined style={{ fontSize: 12 }} />
          <RightOutlined style={{ fontSize: 9 }} />
          <span>领域建设</span>
          <RightOutlined style={{ fontSize: 9 }} />
          <span className="text-gray-700 font-medium">领域相关单位</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">领域相关单位</h1>
            <p className="text-xs text-gray-400 mt-0.5">按职业领域查看牵头、参与单位及合作企业等信息</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-105px)]">
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
          <div className="px-4 pt-5 pb-4 border-b border-gray-100">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">职业领域</div>
            <Select
              showSearch
              placeholder="选择职业领域"
              value={selectedDomain || undefined}
              onChange={v => setSelectedDomain(v)}
              optionFilterProp="children"
              style={{ width: '100%' }}
              size="middle"
            >
              {domains.map(d => (
                <Option key={d.id} value={d.id}>
                  <div className="flex items-center gap-1.5">
                    {d.careerCode && <span className="font-mono text-[10px] text-blue-500 bg-blue-50 px-1 rounded flex-shrink-0">{d.careerCode}</span>}
                    <span className="truncate text-sm">{d.careerName}</span>
                  </div>
                </Option>
              ))}
            </Select>
            {relatedDepts?.leadOrgList?.length > 0 && (
              <div className="mt-2.5 text-[11px] text-gray-400 flex items-center gap-1">
                <BankOutlined style={{ fontSize: 10 }} />
                <span className="truncate">{relatedDepts?.leadOrgList?.[0].deptName}</span>
              </div>
            )}
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            <div className="px-2 mb-1">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <BankOutlined style={{ fontSize: 10 }} />教育机构
              </div>
            </div>
            {MENU_ITEMS.filter(m => EDU_PARENT_KEYS.includes(m.key)).map(item => {
              const isActive = activeMenu === item.key;
              return (
                <button key={item.key} onClick={() => setActiveMenu(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${isActive ? `${item.bg} ${item.border} border ${item.color} font-semibold shadow-sm` : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
                >
                  <span className={`text-base ${isActive ? item.color : 'text-gray-400'}`}>{item.icon}</span>
                  <span className="text-sm flex-1">{item.label}</span>
                  <Badge count={counts[item.key]} showZero style={{ backgroundColor: isActive ? undefined : '#e5e7eb', color: isActive ? undefined : '#6b7280', boxShadow: 'none', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18, padding: '0 5px' }} />
                </button>
              );
            })}

            <div className="px-2 mt-4 mb-1">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShopOutlined style={{ fontSize: 10 }} />企业与组织
              </div>
            </div>
            {MENU_ITEMS.filter(m => !EDU_PARENT_KEYS.includes(m.key)).map(item => {
              const isActive = activeMenu === item.key;
              return (
                <button key={item.key} onClick={() => setActiveMenu(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${isActive ? `${item.bg} ${item.border} border ${item.color} font-semibold shadow-sm` : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}
                >
                  <span className={`text-base ${isActive ? item.color : 'text-gray-400'}`}>{item.icon}</span>
                  <span className="text-sm flex-1">{item.label}</span>
                  <Badge count={counts[item.key]} showZero style={{ backgroundColor: isActive ? undefined : '#e5e7eb', color: isActive ? undefined : '#6b7280', boxShadow: 'none', fontSize: 10, height: 18, lineHeight: '18px', minWidth: 18, padding: '0 5px' }} />
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${activeConfig.bg} ${activeConfig.border} border flex items-center justify-center`}>
                <span className={activeConfig.color}>{activeConfig.icon}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{activeConfig.label}</div>
                {selectedDomainObj && <div className="text-xs text-gray-400">{selectedDomainObj?.careerName}</div>}
              </div>
            </div>
            {selectedDomain && (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${activeConfig.bg} ${activeConfig.border} ${activeConfig.color}`}>
                共 {counts[activeMenu]} 条
              </span>
            )}
          </div>
          <div className="p-6">{renderCards()}</div>
        </main>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-24">
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-gray-400 text-sm">{text}</span>} />
  </div>
);

export default DomainRelatedUnits;
