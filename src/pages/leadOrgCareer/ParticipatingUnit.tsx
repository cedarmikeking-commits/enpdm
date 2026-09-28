import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Tag, Space, Tooltip,
  message, Select,
  Drawer, Empty, Popconfirm, Steps, DatePicker,
  Modal, Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined, HomeOutlined, RightOutlined,
  FileTextOutlined, TeamOutlined, GlobalOutlined,
  BuildOutlined, FilterOutlined, SendOutlined,
  PlusOutlined, DeleteOutlined, BankOutlined,
  CheckCircleOutlined, SafetyCertificateOutlined,
  FormOutlined, LoadingOutlined, AuditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { entryJoinDeptBuild, getList, joinApply, saveOrUpdate, submit } from '@/api/leadOrgCareer/joinDept';

const { Option } = Select;
const { TextArea } = Input;

const STEPS = [
  { key: 'basic', label: '基本信息', icon: <FileTextOutlined /> },
  { key: 'team', label: '建设团队', icon: <TeamOutlined /> },
  { key: 'coop', label: '校企合作', icon: <BankOutlined /> },
  { key: 'intl', label: '国际化基础', icon: <GlobalOutlined /> },
  { key: 'plan', label: '建设计划', icon: <BuildOutlined /> },
  { key: 'opinion', label: '单位意见', icon: <SafetyCertificateOutlined /> },
];

const SecTitle: React.FC<{ num: string; title: string; sub?: string }> = ({ num, title, sub }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
      {num}
    </div>
    <div>
      <div className="font-semibold text-gray-800 text-base">{title}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; className?: string }> =
  ({ label, required, children, className = '' }) => (
    <div className={className}>
      <div className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-0.5">
        {required && <span className="text-red-400">*</span>}
        {label}
      </div>
      {children}
    </div>
  );

const InfoChip: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex flex-col gap-0.5">
    <span className="text-xs text-blue-400 flex items-center gap-1">{icon}{label}</span>
    <span className="text-sm font-medium text-blue-700 truncate">{value || '—'}</span>
  </div>
);

/* ══════════════════════════════════════════════ */

const ParticipatingUnit: React.FC = () => {
  /* ── domain list ── */
  const [domains, setDomains] = useState<any>({});
  const [loadingDomains, setLoadingDomains] = useState(false);

  /* ── apply modal (申请参与) ── */
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyDomain, setApplyDomain] = useState<any | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);

  /* ── join modal (信息建设，已有记录) ── */
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [joinDomain, setJoinDomain] = useState<any | null>(null);
  // const [selectedJoinSchool, setSelectedJoinSchool] = useState<string>('');
  const [joining, setJoining] = useState(false);
  const [joinProgress, setJoinProgress] = useState(0);

  /* ── construction drawer ── */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [pagingSearch, setPagingSearch] = useState({ size: 10, current: 1, keyword: "" });
  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async (searchParams?: any) => {
    setLoadingDomains(true);
    getList({ ...pagingSearch, ...searchParams }).then(res => {
      setDomains(res);
      setPagingSearch({ ...pagingSearch, ...searchParams });
    }).catch(err => {
      message.error('加载记录失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setLoadingDomains(false);
    })
  }

  /* ── open apply modal ── */
  const openApplyModal = async (domain: any) => {
    setApplyDomain(domain);
    setApplyProgress(0);
    setApplyModalOpen(true);

    // Load approved schools as leading unit options
    // setLoadingLeadingUnits(true);
    // const { data: leadData } = await supabase
    //   .from('school_applications')
    //   .select('id, school_name')
    //   .eq('registration_status', 'approved')
    //   .order('school_name');
    // setLeadingUnitOptions(leadData || []);
    // setLoadingLeadingUnits(false);
  };

  /* ── handle apply (申请参与) ── */
  const handleApply = async () => {
    setApplying(true);
    joinApply({ careerId: applyDomain?.careerId, leadOrgId: applyDomain?.deptId }).then(() => {
      message.success('申请成功');
      setApplyModalOpen(false);
    }).catch(err => {
      message.error('申请失败: ' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setApplying(false);
    })
  };

  /* ── open build modal (信息建设，需 approved) ── */
  const openJoinModal = async (domain: any) => {
    setJoinDomain(domain);
    setJoinProgress(0);
    setJoinModalOpen(true);
  };

  /* ── handle join construction ── */
  const handleJoin = async () => {
    setJoinModalOpen(false);
    setJoining(true);
    setLoadingForm(true);
    entryJoinDeptBuild({ careerId: joinDomain?.careerId, leadOrgId: joinDomain?.deptId }).then(res => {
      setJoinDomain({ ...joinDomain, ...res });
      message.success('已找到审批记录，进入建设表单...');
      setTimeout(() => openDrawer({ ...joinDomain, ...res }), 200);
    }).catch(err => {
      message.error('失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setJoining(false);
      setLoadingForm(false);
    })
    // if (!joinDomain || !selectedJoinSchool) {
    //   message.warning('请选择教育机构');
    //   return;
    // }
    // const school = joinSchools.find(s => s.id === selectedJoinSchool);
    // if (!school) return;

    // setJoining(true);
    // setJoinProgress(20);

    // // Look for an approved relationship record
    // const { data: existing } = await supabase
    //   .from('participating_unit_relationship')
    //   .select('*')
    //   .eq('participating_unit_name', school.school_name)
    //   .eq('domain_name', joinDomain.name)
    //   .eq('status', 'approved')
    //   .maybeSingle();

    // setJoinProgress(60);

    // if (!existing) {
    //   setJoining(false);
    //   setJoinProgress(0);
    //   setJoinModalOpen(false);
    //   message.warning('该申请牵头单位还未准予申请，请耐心等待审核');
    //   return;
    // }

    // setJoinProgress(100);
    // await new Promise(r => setTimeout(r, 300));
    // setJoining(false);
    // setJoinModalOpen(false);
    // message.success('已找到审批记录，正在进入建设表单...');
    // setTimeout(() => openDrawer(existing as ParticipatingRecord, joinDomain ?? undefined), 200);
  };

  /* ── open construction drawer ── */
  const openDrawer = async (rec: any) => {
    setSelectedRecord(rec);
    setActiveStep(0);
    setDrawerOpen(true);
    setFormData(rec);
    // setLoadingForm(true);
    // setLeadingInfo(null);

    // const { data: existing } = await supabase
    //   .from('participating_unit_domain_construction')
    //   .select('*')
    //   .eq('relationship_id', rec.id)
    //   .maybeSingle();

    // if (existing) {
    //   setFormData({
    //     id: existing.id,
    //     advantage_major: existing.advantage_major || '',
    //     contact_name: existing.contact_name || '',
    //     contact_position: existing.contact_position || '',
    //     contact_phone: existing.contact_phone || '',
    //     contact_email: existing.contact_email || '',
    //     industry_subclass: existing.industry_subclass || '',
    //     domain_code: existing.domain_code || '',
    //     leader_name: existing.leader_name || '',
    //     leader_gender: existing.leader_gender || '',
    //     leader_ethnicity: existing.leader_ethnicity || '',
    //     leader_birth_date: existing.leader_birth_date || '',
    //     leader_admin_position: existing.leader_admin_position || '',
    //     leader_tech_position: existing.leader_tech_position || '',
    //     leader_politics: existing.leader_politics || '',
    //     leader_education: existing.leader_education || '',
    //     leader_degree: existing.leader_degree || '',
    //     leader_enterprise_years: existing.leader_enterprise_years || '',
    //     leader_research_specialty: existing.leader_research_specialty || '',
    //     leader_address: existing.leader_address || '',
    //     leader_postal_code: existing.leader_postal_code || '',
    //     leader_phone: existing.leader_phone || '',
    //     leader_wechat: existing.leader_wechat || '',
    //     team_members: existing.team_members?.length ? existing.team_members : [{ name: '', gender: '', birth_month: '', title: '', degree: '', work_unit: '', phone: '' }],
    //     cooperation_list: existing.cooperation_list?.length ? existing.cooperation_list : [{ enterprise: '', content: '' }],
    //     international_list: existing.international_list?.length ? existing.international_list : [{ country: '', content: '' }],
    //     domain_plan: existing.domain_plan || '',
    //     unit_opinion: existing.unit_opinion || '',
    //     sign_date: existing.sign_date || '',
    //   });
    // } else {
    //   setFormData(EMPTY_DATA());
    // }
    // setLoadingForm(false);
  };

  /* ── save construction form ── */
  const handleSave = async () => {
    if (!selectedRecord) return;
    const err = validateStep(activeStep);
    if (err) { message.warning(err); return; }
    setSaving(true);
    // const payload = {
    //   relationship_id: selectedRecord.id,
    //   ...formData,
    //   updated_at: new Date().toISOString(),
    // };
    // let error;
    // if (formData.id) {
    //   ({ error } = await supabase.from('participating_unit_domain_construction').update(payload).eq('id', formData.id));
    // } else {
    //   const { data: ins, error: e } = await supabase.from('participating_unit_domain_construction').insert(payload).select('id').single();
    //   error = e;
    //   if (ins) setFormData(d => ({ ...d, id: ins.id }));
    // }

    saveOrUpdate({
      ...selectedRecord, ...formData,
      birthday: formData.birthday ? dayjs(formData.birthday).format('YYYY-MM-DD HH:mm:ss') : undefined,
    }).then(res => {
      setFormData((d: any) => ({ ...d, id: res }));
      message.success('已成功保存');
    }).catch(err => {
      message.error('保存失败:' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setSaving(false);
    })
  };

  /* ── submit ── */
  const handleSubmit = async (rec: any) => {
    // const { error } = await supabase
    //   .from('participating_unit_relationship')
    //   .update({ status: 'approved', updated_at: new Date().toISOString() })
    //   .eq('id', rec.id);
    // if (error) message.error('提交失败，请重试');
    // else { message.success('已成功提交'); setDrawerOpen(false); }
    //如果第六步的数据为空，不允许提交
    if(!formData.opinion || formData.opinion.trim() == '') {
      message.warning('请填写完整信息后再提交');
      return;
    }
    setSaving(true);
    submit({
      ...rec, ...formData,
      birthday: formData.birthday ? dayjs(formData.birthday).format('YYYY-MM-DD HH:mm:ss') : undefined,
    }).then(() => {
      message.success('已成功提交');
    }).catch(err => {
      message.error('提交失败:' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setDrawerOpen(false);
      setSaving(false);
    })
  };

  /* ── form helpers ── */
  const set = (field: any) => (v: string) => setFormData((d: any) => ({ ...d, [field]: v }));

  // const updTM = (i: number, f: keyof TeamMember, v: string) =>
  //   setFormData(d => ({ ...d, team_members: d.team_members.map((r, j) => j === i ? { ...r, [f]: v } : r) }));
  // const addTM = () => setFormData(d => ({ ...d, team_members: [...d.team_members, { name: '', gender: '', birth_month: '', title: '', degree: '', work_unit: '', phone: '' }] }));
  // const delTM = (i: number) => setFormData(d => ({ ...d, team_members: d.team_members.filter((_, j) => j !== i) }));
  const updCoop = (i: number, f: any, v: string) =>
    setFormData((d: any) => ({ ...d, joinDeptBuildCompanyList: d.joinDeptBuildCompanyList.map((r: any, j: any) => j === i ? { ...r, [f]: v } : r) }));
  const addCoop = () => setFormData((d: any) => ({ ...d, joinDeptBuildCompanyList: d.joinDeptBuildCompanyList && d.joinDeptBuildCompanyList.length > 0 ? [...d.joinDeptBuildCompanyList, { company: '', cooperateContent: '' }] : [{ company: '', cooperateContent: '' }] }));
  const delCoop = (i: number) => setFormData((d: any) => ({ ...d, joinDeptBuildCompanyList: d.joinDeptBuildCompanyList.filter((_: any, j: any) => j !== i) }));

  const updIntl = (i: number, f: any, v: string) =>
    setFormData((d: any) => ({ ...d, joinDeptBuildCountryList: d.joinDeptBuildCountryList.map((r: any, j: any) => j === i ? { ...r, [f]: v } : r) }));
  const addIntl = () => setFormData((d: any) => ({ ...d, joinDeptBuildCountryList: d.joinDeptBuildCountryList && d.joinDeptBuildCountryList.length > 0 ? [...d.joinDeptBuildCountryList, { country: '', cooperateContent: '' }] : [{ country: '', cooperateContent: '' }] }));
  const delIntl = (i: number) => setFormData((d: any) => ({ ...d, joinDeptBuildCountryList: d.joinDeptBuildCountryList.filter((_: any, j: any) => j !== i) }));

  const isReadOnly = selectedRecord?.status == '1';

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 0:
        return !formData.advantageMajor?.trim() ? '请填写优势专业' :
          !formData.contactMan?.trim() ? '请填写联系人姓名' :
            !formData.position?.trim() ? '请填写职务' :
              !formData.contactPhone?.trim() ? '请填写联系电话' : !(/^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/.test(formData.contactPhone)) ? '联系电话格式不正确' :
                !formData.email?.trim() ? '请填写电子邮箱' : !(/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(formData.email)) ? '电子邮箱格式不正确' :
                  null;
      case 1: return !formData.chargeMan?.trim() ? '请填写团队负责人姓名' : null;
      case 2: {
        if (formData.joinDeptBuildCompanyList.length == 0) {
          return '请填写在该职业领域的校企合作基础信息';
        }
        for (let i = 0; i < formData.joinDeptBuildCompanyList.length; i++) {
          if (!formData.joinDeptBuildCompanyList[i].company.trim()) return `请填写第 ${i + 1} 条合作记录的主要合作企业`;
        }
        return null;
      }
      case 3: {
        if (formData.joinDeptBuildCountryList.length == 0) {
          return '请填写在该职业领域的国际化基础信息';
        }
        for (let i = 0; i < formData.joinDeptBuildCountryList.length; i++) {
          if (!formData.joinDeptBuildCountryList[i].country.trim()) return `请填写第 ${i + 1} 条国际合作记录的合作国家/地区`;
        }
        return null;
      }
      case 4: return !formData.plan?.trim() ? '请填写职业领域建设工作计划和建议' : null;
      case 5: return !formData.opinion?.trim() ? '请填写单位意见' : null;
      default: return null;
    }
  };

  const handleNext = () => {
    if (isReadOnly) { setActiveStep(s => s + 1); return; }
    const err = validateStep(activeStep);
    if (err) { message.warning(err); return; }
    setActiveStep(s => s + 1);
  };

  /* ── domain table columns ── */
  const domainColumns: ColumnsType<any> = [
    {
      title: '职业领域名称',
      dataIndex: 'careerName',
      render: (v: string) => <span className="font-medium text-gray-800 text-sm">{v}</span>,
    },
    {
      title: '职业领域代码',
      dataIndex: 'careerCode',
      width: 140,
      render: (v: string) => (
        <Tag color="blue" style={{ borderRadius: 6, fontFamily: 'monospace', fontSize: 12 }}>{v}</Tag>
      ),
    },
    {
      title: '牵头组织',
      dataIndex: 'deptName',
      width: 260,
      render: (v: string) => <span className="text-sm text-gray-600">{v || '—'}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, rec: any) => (
        <Space size={8}>
          {/* 申请参与 */}
          {rec.id && rec.id != null && <Button
            size="small"
            icon={<AuditOutlined />}
            onClick={() => openApplyModal(rec)}
            style={{ borderRadius: 6, borderColor: '#22c55e', color: '#16a34a', fontSize: 12 }}
          >
            申请参与
          </Button>}
          {/* 信息建设 — only meaningful after approved */}
          {rec.id && rec.id != null && <Tooltip title="需审核通过后方可进行信息建设">
            <Button
              type="primary"
              size="small"
              icon={<BuildOutlined />}
              onClick={() => openJoinModal(rec)}
              style={{ borderRadius: 6, background: 'linear-gradient(135deg,#1677ff,#0958d9)', border: 'none', fontSize: 12 }}
            >
              信息建设
            </Button>
          </Tooltip>}
        </Space>
      ),
    },
  ];

  /* ── drawer section renderers ── */
  const renderBasic = () => (
    <div className="space-y-6">
      <SecTitle num="一" title="基本信息" sub="填写参与单位的基础资料及联系方式" />
      <div className="grid grid-cols-2 gap-3">
        <InfoChip label="参与单位" value={selectedRecord?.deptName || ''} icon={<TeamOutlined />} />
        <InfoChip label="拟参与建设的职业领域" value={selectedRecord?.careerName || ''} icon={<GlobalOutlined />} />
        <InfoChip label="职业领域所属行业子类" value={selectedRecord?.industryName || ''} icon={<BankOutlined />} />
        <InfoChip label="职业领域编码" value={selectedRecord?.careerCode || ''} icon={<FileTextOutlined />} />
      </div>
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <Field label="优势专业" required>
          <Input value={formData.advantageMajor} onChange={e => set('advantageMajor')(e.target.value)}
            placeholder="按实际情况填写" style={{ borderRadius: 8 }} disabled={isReadOnly} />
        </Field>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full" />
          <span className="text-sm font-semibold text-gray-700">参与建设团队联系人</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
          <Field label="姓名" required>
            <Input value={formData.contactMan} onChange={e => set('contactMan')(e.target.value)} placeholder="联系人姓名" style={{ borderRadius: 8 }} disabled={isReadOnly} />
          </Field>
          <Field label="职务" required>
            <Input value={formData.position} onChange={e => set('position')(e.target.value)} placeholder="担任职务" style={{ borderRadius: 8 }} disabled={isReadOnly} />
          </Field>
          <Field label="联系电话" required>
            <Input value={formData.contactPhone} onChange={e => set('contactPhone')(e.target.value)} placeholder="手机 / 办公电话" style={{ borderRadius: 8 }} disabled={isReadOnly} />
          </Field>
          <Field label="电子邮箱" required>
            <Input value={formData.email} onChange={e => set('email')(e.target.value)} placeholder="邮箱地址" style={{ borderRadius: 8 }} disabled={isReadOnly} />
          </Field>
        </div>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-6">
      <SecTitle num="二" title="职业领域参与建设团队信息" sub="填写团队负责人详细信息及其他成员名单" />
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full" />
          <span className="text-sm font-semibold text-gray-700">团队负责人</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Field label="姓名" required>
              <Input value={formData.chargeMan} onChange={e => set('chargeMan')(e.target.value)} placeholder="负责人姓名" style={{ borderRadius: 8 }} disabled={isReadOnly} />
            </Field>
            <Field label="性别">
              <Select value={formData.sex || undefined} onChange={set('sex')} placeholder="请选择" style={{ width: '100%' }} disabled={isReadOnly}>
                <Option value="1">男</Option><Option value="2">女</Option>
              </Select>
            </Field>
            <Field label="民族">
              <Input value={formData.nation} onChange={e => set('nation')(e.target.value)} placeholder="如：汉族" style={{ borderRadius: 8 }} disabled={isReadOnly} />
            </Field>
            <Field label="出生日期">
              <DatePicker value={formData.birthday ? dayjs(formData.birthday) : null}
                onChange={d => set('birthday')(d ? d.format('YYYY-MM-DD') : '')}
                style={{ width: '100%', borderRadius: 8 }} format="YYYY年MM月DD日" placeholder="选择日期" disabled={isReadOnly} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="行政职务"><Input value={formData.administrationPosition} onChange={e => set('administrationPosition')(e.target.value)} placeholder="行政职务" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
            <Field label="专业技术职务"><Input value={formData.technicalPosition} onChange={e => set('technicalPosition')(e.target.value)} placeholder="专业技术职务" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
            <Field label="政治面貌"><Input value={formData.politicalStatus} onChange={e => set('politicalStatus')(e.target.value)} placeholder="如：中共党员" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="最后学历"><Input value={formData.finalEducation} onChange={e => set('finalEducation')(e.target.value)} placeholder="如：大学本科" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
            <Field label="最后学位">
              <Select value={formData.finalDegree || undefined} onChange={set('finalDegree')} placeholder="请选择" style={{ width: '100%' }} disabled={isReadOnly}>
                <Option value="学士">学士</Option><Option value="硕士">硕士</Option>
                <Option value="博士">博士</Option><Option value="其他">其他</Option>
              </Select>
            </Field>
            <Field label="企业工作经历（年）"><Input value={formData.workYear} onChange={e => set('workYear')(e.target.value)} placeholder="填写年数" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
          </div>
          <Field label="研究专长"><Input value={formData.researchExpertise} onChange={e => set('researchExpertise')(e.target.value)} placeholder="填写研究专长方向" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="通讯地址"><Input value={formData.address} onChange={e => set('address')(e.target.value)} placeholder="详细通讯地址" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
            <Field label="邮政编码"><Input value={formData.zipcode} onChange={e => set('zipcode')(e.target.value)} placeholder="6位邮政编码" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
            <Field label="联系电话"><Input value={formData.chargeManPhone} onChange={e => set('chargeManPhone')(e.target.value)} placeholder="手机 / 办公电话" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
            <Field label="微信号"><Input value={formData.wechatId} onChange={e => set('wechatId')(e.target.value)} placeholder="微信号" style={{ borderRadius: 8 }} disabled={isReadOnly} /></Field>
          </div>
        </div>
      </div>
      {/* <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full" />
            <span className="text-sm font-semibold text-gray-700">团队其他成员（含企业人员）</span>
            <span className="ml-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{formData.joinDeptBuildCompanyList?.length} 人</span>
          </div>
          {!isReadOnly && <Button size="small" icon={<PlusOutlined />} onClick={addTM} style={{ borderRadius: 6, borderColor: '#93c5fd', color: '#3b82f6' }}>添加成员</Button>}
        </div>
        <div className="space-y-3">
          {formData.joinDeptBuildCompanyList?.map((m:any, i:number) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative group">
              {!isReadOnly && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => delTM(i)} disabled={formData.joinDeptBuildCompanyList.length === 1} />
                </div>
              )}
              <div className="text-xs font-medium text-gray-400 mb-3">成员 {i + 1}</div>
              <div className="grid grid-cols-4 gap-3">
                <Field label="姓名"><Input size="small" value={m.name} onChange={e => updTM(i, 'name', e.target.value)} placeholder="姓名" style={{ borderRadius: 6 }} disabled={isReadOnly} /></Field>
                <Field label="性别">
                  <Select size="small" value={m.gender || undefined} onChange={v => updTM(i, 'gender', v)} placeholder="性别" style={{ width: '100%' }} disabled={isReadOnly}>
                    <Option value="男">男</Option><Option value="女">女</Option>
                  </Select>
                </Field>
                <Field label="出生年月">
                  <DatePicker size="small" value={m.birth_month ? dayjs(m.birth_month, 'YYYY-MM') : null}
                    onChange={d => updTM(i, 'birth_month', d ? d.format('YYYY-MM') : '')}
                    picker="month" style={{ width: '100%', borderRadius: 6 }} placeholder="选择年月" disabled={isReadOnly} />
                </Field>
                <Field label="职称"><Input size="small" value={m.title} onChange={e => updTM(i, 'title', e.target.value)} placeholder="职称" style={{ borderRadius: 6 }} disabled={isReadOnly} /></Field>
                <Field label="学位">
                  <Select size="small" value={m.degree || undefined} onChange={v => updTM(i, 'degree', v)} placeholder="学位" style={{ width: '100%' }} disabled={isReadOnly}>
                    <Option value="学士">学士</Option><Option value="硕士">硕士</Option>
                    <Option value="博士">博士</Option><Option value="其他">其他</Option>
                  </Select>
                </Field>
                <Field label="工作单位" className="col-span-2"><Input size="small" value={m.work_unit} onChange={e => updTM(i, 'work_unit', e.target.value)} placeholder="工作单位全称" style={{ borderRadius: 6 }} disabled={isReadOnly} /></Field>
                <Field label="联系电话"><Input size="small" value={m.phone} onChange={e => updTM(i, 'phone', e.target.value)} placeholder="联系电话" style={{ borderRadius: 6 }} disabled={isReadOnly} /></Field>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );

  const renderCoop = () => (
    <div className="space-y-6">
      <SecTitle num="三" title="在该职业领域的校企合作基础" sub="填写本单位与企业的合作情况，可按需添加" />
      <div className="space-y-3">
        {formData.joinDeptBuildCompanyList?.map((row: any, i: number) => (
          <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative group">
            {!isReadOnly && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => delCoop(i)} disabled={formData.joinDeptBuildCompanyList?.length === 1} />
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <span className="text-xs font-medium text-gray-500">合作记录</span>
            </div>
            <div className="flex gap-4">
              <div style={{ width: '30%', flexShrink: 0 }}>
                <Field label="主要合作企业" required>
                  <Input value={row.company} onChange={e => updCoop(i, 'company', e.target.value)} placeholder="企业全称" style={{ borderRadius: 8 }} disabled={isReadOnly} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-xs font-medium text-gray-500 mb-1.5">合作内容</div>
                <TextArea value={row.cooperateContent} onChange={e => updCoop(i, 'cooperateContent', e.target.value)}
                  placeholder="描述合作内容、合作形式、成果等" autoSize={{ minRows: 3, maxRows: 6 }}
                  style={{ borderRadius: 8, resize: 'none', width: '100%' }} disabled={isReadOnly} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {!isReadOnly && (
        <Button icon={<PlusOutlined />} onClick={addCoop}
          style={{ borderRadius: 8, borderColor: '#93c5fd', color: '#3b82f6', width: '100%', height: 40 }}>
          添加合作记录
        </Button>
      )}
    </div>
  );

  const renderIntl = () => (
    <div className="space-y-6">
      <SecTitle num="四" title="在该职业领域的国际化基础" sub="填写本单位在该领域的国际合作情况，可按需添加" />
      <div className="space-y-3">
        {formData.joinDeptBuildCountryList?.map((row: any, i: number) => (
          <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4 relative group">
            {!isReadOnly && (
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => delIntl(i)} disabled={formData.joinDeptBuildCountryList?.length === 1} />
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <span className="text-xs font-medium text-gray-500">国际合作记录</span>
            </div>
            <div className="flex gap-4">
              <div style={{ width: '30%', flexShrink: 0 }}>
                <Field label="合作国家 / 地区" required>
                  <Input value={row.country} onChange={e => updIntl(i, 'country', e.target.value)} placeholder="如：德国、新加坡" style={{ borderRadius: 8 }} disabled={isReadOnly} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-xs font-medium text-gray-500 mb-1.5">合作内容</div>
                <TextArea value={row.cooperateContent} onChange={e => updIntl(i, 'cooperateContent', e.target.value)}
                  placeholder="描述合作内容、合作机构、成果等" autoSize={{ minRows: 3, maxRows: 6 }}
                  style={{ borderRadius: 8, resize: 'none', width: '100%' }} disabled={isReadOnly} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {!isReadOnly && (
        <Button icon={<PlusOutlined />} onClick={addIntl}
          style={{ borderRadius: 8, borderColor: '#67e8f9', color: '#0891b2', width: '100%', height: 40 }}>
          添加国际合作记录
        </Button>
      )}
    </div>
  );

  const renderPlan = () => (
    <div className="space-y-6">
      <SecTitle num="五" title="职业领域建设工作计划和建议" sub="详细描述参与建设的整体计划和工作建议" />
      <div className="bg-gray-50 rounded-xl p-4">
        <TextArea value={formData.plan} onChange={e => set('plan')(e.target.value)}
          placeholder="请详细填写职业领域建设工作计划和建议..."
          autoSize={{ minRows: 12 }}
          style={{ borderRadius: 10, fontSize: 13, background: 'white' }}
          disabled={isReadOnly} />
      </div>
    </div>
  );

  const renderOpinion = () => (
    <div className="space-y-6">
      <SecTitle num="六" title="单位意见" sub="填写本单位对参与职业领域建设的正式意见" />
      <div className="bg-gray-50 rounded-xl p-4">
        <TextArea value={formData.opinion} onChange={e => set('opinion')(e.target.value)}
          placeholder="请填写单位意见..."
          autoSize={{ minRows: 10 }}
          style={{ borderRadius: 10, fontSize: 13, background: 'white' }}
          disabled={isReadOnly} />
      </div>
      {/* <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 shadow-sm">
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">（签字盖章）</span>
            <div className="w-32 h-16 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-300">盖章处</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">签章日期</span>
            <DatePicker
              value={formData.sign_date ? dayjs(formData.sign_date) : null}
              onChange={d => set('sign_date')(d ? d.format('YYYY-MM-DD') : '')}
              placeholder="年  月  日" format="YYYY年MM月DD日"
              style={{ width: 200, borderRadius: 8 }} disabled={isReadOnly} />
          </div>
        </div>
      </div> */}
    </div>
  );

  const SECTION_RENDERERS = [renderBasic, renderTeam, renderCoop, renderIntl, renderPlan, renderOpinion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
          <HomeOutlined style={{ fontSize: 13 }} />
          <span>首页</span>
          <RightOutlined style={{ fontSize: 10 }} />
          <span>领域建设</span>
          <RightOutlined style={{ fontSize: 10 }} />
          <span className="text-gray-700 font-medium">参与单位建设</span>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 mb-4 flex items-center gap-3 flex-wrap">
          <FilterOutlined style={{ color: '#94a3b8' }} />
          <Input
            placeholder="搜索职业领域名称、代码、牵头组织..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={pagingSearch.keyword}
            onChange={e => {
              setPagingSearch({ ...pagingSearch, keyword: e.target.value, current: 1 });
              fetchList({ keyword: e.target.value, current: 1 });
            }}
            allowClear
            style={{ width: 320, borderRadius: 8 }}
          />
          {(
            <Button size="small" onClick={() => {
              setPagingSearch({ ...pagingSearch, keyword: '', current: 1 });
              fetchList({ keyword: '', current: 1 });
            }} style={{ borderRadius: 6, color: '#94a3b8' }}>清除</Button>
          )}
          <span className="ml-auto text-sm text-gray-400">共 {domains?.total} 个职业领域</span>
        </div>

        {/* Domain Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <Table
            columns={domainColumns}
            dataSource={domains?.records}
            rowKey="careerId"
            loading={loadingDomains}
            scroll={{ x: 880 }}
            pagination={{
              current: pagingSearch.current,
              pageSize: pagingSearch.size,
              total: domains?.total,
              onChange: (page, pageSize) => {
                if (pageSize !== pagingSearch.size) {
                  setPagingSearch((prev: any) => ({ ...prev, current: 1, size: pageSize }))
                } else {
                  setPagingSearch((prev: any) => ({ ...prev, current: page }))
                }
                fetchList({ current: page, size: pageSize });
              },
              showSizeChanger: false,
              showTotal: () => `共 ${domains?.total} 条`,
              style: { padding: '12px 16px' },
            }}
            rowClassName={(_, idx) => idx % 2 === 0 ? '' : 'bg-gray-50/40'}
            locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-gray-400 text-sm">{'暂无职业领域数据'}</span>} /> }}
          />
        </div>
      </div>

      {/* ══ Apply Modal (申请参与) ══ */}
      <Modal
        open={applyModalOpen}
        onCancel={() => { if (!applying) setApplyModalOpen(false); }}
        footer={null}
        width={500}
        title={null}
        closable={!applying}
        maskClosable={!applying}
        styles={{ body: { padding: 0 } }}
      >
        <div className="rounded-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-400">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <AuditOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <div>
                <div className="text-white font-semibold text-base">申请参与建设</div>
                <div className="text-white/75 text-xs mt-0.5">选择牵头单位后提交申请</div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Domain info */}
            {applyDomain && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 space-y-1">
                <div className="text-xs text-emerald-500">目标职业领域</div>
                <div className="text-sm font-semibold text-emerald-800">{applyDomain.careerName}</div>
                <div className="flex items-center gap-3 mt-1">
                  <Tag color="green" style={{ borderRadius: 4, fontFamily: 'monospace', fontSize: 11, margin: 0 }}>{applyDomain.careerCode}</Tag>
                </div>
              </div>
            )}

            {/* Progress */}
            {applying && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <LoadingOutlined style={{ color: '#10b981' }} />
                  <span>正在提交申请...</span>
                </div>
                <Progress
                  percent={applyProgress}
                  strokeColor={{ '0%': '#10b981', '100%': '#0d9488' }}
                  trailColor="#d1fae5"
                  showInfo={false}
                  strokeWidth={6}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
              <Button onClick={() => setApplyModalOpen(false)} disabled={applying} style={{ borderRadius: 8 }}>取消</Button>
              <Button
                type="primary"
                onClick={handleApply}
                loading={applying}
                style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)', border: 'none', borderRadius: 8 }}
              >
                {applying ? '提交中...' : '确认参与'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ══ Build Modal (信息建设) ══ */}
      <Modal
        open={joinModalOpen}
        onCancel={() => { if (!joining) setJoinModalOpen(false); }}
        footer={null}
        width={480}
        title={null}
        closable={!joining}
        maskClosable={!joining}
        styles={{ body: { padding: 0 } }}
      >
        <div className="rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-400">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <BuildOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <div>
                <div className="text-white font-semibold text-base">信息建设</div>
                <div className="text-white/75 text-xs mt-0.5">需已审批通过方可进行信息建设</div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* 审核状态提示 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-blue-400 mt-0.5 text-xs">提示</span>
              <span className="text-xs text-blue-600">信息建设仅对状态为"准予参与"的申请开放。请先申请参与并等待审核通过。</span>
            </div>

            {joinDomain && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-1">
                <div className="text-xs text-blue-400">职业领域</div>
                <div className="text-sm font-semibold text-blue-700">{joinDomain.careerName}</div>
                <Tag color="blue" style={{ borderRadius: 4, fontFamily: 'monospace', fontSize: 11, margin: 0 }}>{joinDomain.careerCode}</Tag>
              </div>
            )}

            {/* <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-400 mr-0.5">*</span>选择参与单位教育机构
              </div>
              <Select
                value={selectedJoinSchool || undefined}
                onChange={setSelectedJoinSchool}
                placeholder="请选择已审批的教育机构"
                showSearch
                optionFilterProp="label"
                loading={loadingJoinSchools}
                style={{ width: '100%', borderRadius: 8 }}
                size="large"
                options={joinSchools.map(s => ({ value: s.id, label: s.school_name }))}
              />
            </div> */}

            {joining && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <LoadingOutlined style={{ color: '#3b82f6' }} />
                  <span>正在验证申请状态...</span>
                </div>
                <Progress
                  percent={joinProgress}
                  strokeColor={{ '0%': '#3b82f6', '100%': '#06b6d4' }}
                  trailColor="#e0f2fe"
                  showInfo={false}
                  strokeWidth={6}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1 border-t border-gray-100">
              <Button onClick={() => setJoinModalOpen(false)} disabled={joining} style={{ borderRadius: 8 }}>取消</Button>
              <Button
                type="primary"
                onClick={handleJoin}
                loading={joining}
                // disabled={!selectedJoinSchool || joining}
                style={{ background: 'linear-gradient(135deg,#1677ff,#0958d9)', border: 'none', borderRadius: 8 }}
              >
                {joining ? '验证中...' : '进入建设'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ══ Construction Drawer ══ */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={820}
        title={null}
        styles={{ body: { padding: 0, background: '#f8fafc', display: 'flex', flexDirection: 'column', height: '100%' } }}
        closable={false}
      >
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <FormOutlined style={{ color: '#fff', fontSize: 16 }} />
                </div>
                <div>
                  <div className="text-white font-semibold text-base flex items-center gap-2">
                    参与单位职业领域建设申请表
                    {isReadOnly && <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-normal">只读</span>}
                  </div>
                  <div className="text-white/70 text-xs mt-0.5 flex items-center gap-3">
                    <span>{selectedRecord?.deptName}</span>
                    <span>·</span>
                    <span>{selectedRecord?.careerName}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white text-xl transition-colors leading-none">
                ×
              </button>
            </div>

            {/* Steps */}
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
              <Steps
                current={activeStep}
                onChange={(target) => {
                  if (isReadOnly || target <= activeStep) { setActiveStep(target); return; }
                  for (let i = activeStep; i < target; i++) {
                    const err = validateStep(i);
                    if (err) { message.warning(err); return; }
                  }
                  setActiveStep(target);
                }}
                size="small"
                items={STEPS.map((s, i) => ({
                  title: s.label,
                  icon: (
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === activeStep ? 'bg-blue-500 text-white' : i < activeStep ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {i < activeStep ? <CheckCircleOutlined /> : i + 1}
                    </span>
                  ),
                }))}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
              {loadingForm ? (
                <div className="flex items-center justify-center h-40 text-gray-400">加载中...</div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  {SECTION_RENDERERS[activeStep]()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between flex-shrink-0">
              <Space>
                {activeStep > 0 && <Button onClick={() => setActiveStep(s => s - 1)} style={{ borderRadius: 8 }}>上一步</Button>}
                {activeStep < STEPS.length - 1 && <Button onClick={handleNext} style={{ borderRadius: 8 }}>下一步</Button>}
              </Space>
              <Space>
                <Button onClick={() => setDrawerOpen(false)} style={{ borderRadius: 8 }}>关闭</Button>
                {!isReadOnly && (
                  <>
                    <Button type="default" loading={saving} onClick={handleSave} style={{ borderRadius: 8 }}>保存</Button>
                    <Popconfirm
                      title="确认提交？" description="请检查相关内容是否完成，是否继续？"
                      okText="确认提交" cancelText="取消"
                      onConfirm={() => handleSubmit(selectedRecord)}
                    >
                      <Button
                        type="primary" icon={<SendOutlined />}
                        loading={saving}
                        style={{ background: 'linear-gradient(to right,#3b82f6,#06b6d4)', border: 0, borderRadius: 8 }}
                      >
                        提交
                      </Button>
                    </Popconfirm>
                  </>
                )}
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ParticipatingUnit;
