import React, { useState, useEffect } from 'react';
import {
  Button, Spin,
  message,
} from 'antd';
import {
  HomeOutlined, RightOutlined, ArrowLeftOutlined,
  FileTextOutlined, TeamOutlined, GlobalOutlined,
  BankOutlined, SafetyCertificateOutlined, BuildOutlined,
  PhoneOutlined, UserOutlined, BookOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getApplyDetail, getJoinOrgBuildInfo } from '@/api/leadOrgCareer';

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> =
  ({ label, children, className = '' }) => (
    <div className={className}>
      <div className="text-xs font-medium text-gray-500 mb-1.5">{label}</div>
      {children}
    </div>
  );

const ReadVal: React.FC<{ value?: string | number | null; placeholder?: string }> = ({ value, placeholder = '—' }) => (
  <div className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 min-h-[34px] flex items-center">
    {value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-gray-300">{placeholder}</span>}
  </div>
);

const InfoChip: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex flex-col gap-0.5">
    <span className="text-xs text-blue-400 flex items-center gap-1">{icon}{label}</span>
    <span className="text-sm font-medium text-blue-700 truncate">{value || '—'}</span>
  </div>
);

const SectionBar: React.FC<{ icon: React.ReactNode; title: string; badge?: string }> = ({ icon, title, badge }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full" />
    <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">{icon}{title}</span>
    {badge && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{badge}</span>}
  </div>
);

/* tab nav shared */
const TabNav: React.FC<{
  tabs: { key: string; label: string; icon: React.ReactNode }[];
  active: string;
  onChange: (k: string) => void;
}> = ({ tabs, active, onChange }) => (
  <div className="border-b border-gray-100 px-6 bg-white sticky top-0 z-10">
    <div className="flex gap-0 -mb-px overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${active === t.key
            ? 'border-blue-500 text-blue-600 bg-blue-50/30'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200 hover:bg-gray-50/50'
            }`}
        >
          <span className="text-xs">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════
   PAGE HEADER
═══════════════════════════════════════ */
const PageHeader: React.FC<{
  onBack: () => void;
  breadcrumbs: string[];
  title: string;
  subtitle?: string;
  accentColor?: string;
}> = ({ onBack, breadcrumbs }) => (
  <div className="bg-white border-b border-gray-100 px-8 py-5 flex-shrink-0">
    <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
      <HomeOutlined style={{ fontSize: 13 }} />
      {breadcrumbs.map((b, i) => (
        <React.Fragment key={i}>
          <RightOutlined style={{ fontSize: 10 }} />
          {i === breadcrumbs.length - 2 ? (
            <button className="hover:text-blue-500 transition-colors" onClick={onBack}>{b}</button>
          ) : i === breadcrumbs.length - 1 ? (
            <span className="text-gray-700 font-medium">{b}</span>
          ) : (
            <span>{b}</span>
          )}
        </React.Fragment>
      ))}
    </div>
    <div className="flex items-center gap-4">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ borderRadius: 8 }}
      >
        返回列表
      </Button>
    </div>
  </div>
);

/* ═══════════════════════════════════════
   LEADING UNIT DETAIL VIEW
═══════════════════════════════════════ */
const LeadingDetailPage: React.FC<{ data: any; onBack: () => void }> = ({ data, onBack }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { key: 'basic', label: '基本信息', icon: <FileTextOutlined /> },
    { key: 'team', label: '开发团队', icon: <TeamOutlined /> },
    { key: 'members', label: '团队成员', icon: <UserOutlined /> },
    { key: 'intl', label: '国际化基础', icon: <GlobalOutlined /> },
    { key: 'plan', label: '建设计划', icon: <BuildOutlined /> },
    { key: 'opinion', label: '单位意见', icon: <SafetyCertificateOutlined /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <PageHeader
        onBack={onBack}
        breadcrumbs={['首页', '领域建设', '建设内容审核', '牵头单位信息']}
        title={data.deptName}
        subtitle={`职业领域：${data.careerName}${data.careerCode ? `　${data.careerCode}` : ''}`}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Card */}
        <div className="mx-8 mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 mb-6">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400 flex-shrink-0" />

          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-sm">
              <span className="text-white text-base font-bold">{data.deptName?.[0]}</span>
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-base">{data.deptName}</div>
              <div className="text-xs text-gray-400 mt-0.5">牵头单位建设申请</div>
            </div>
          </div>

          <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-4xl">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoChip label="学校名称" value={data.deptName} icon={<BankOutlined />} />
                    <InfoChip label="拟开发职业领域" value={data.careerName} icon={<GlobalOutlined />} />
                    <InfoChip label="职业领域所属行业子类" value={data.industryName} icon={<BookOutlined />} />
                    <InfoChip label="职业领域编码" value={data.careerCode} icon={<FileTextOutlined />} />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <Field label="优势专业"><ReadVal value={data.advantageMajor} /></Field>
                    <Field label="职业领域内涵">
                      <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed min-h-[80px]">
                        {data.careerDepth || <span className="text-gray-300">—</span>}
                      </div>
                    </Field>
                  </div>
                  <div>
                    <SectionBar icon={<PhoneOutlined />} title="职业领域联络人" />
                    <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                      <Field label="姓名"><ReadVal value={data.careerMan} /></Field>
                      <Field label="职务"><ReadVal value={data.careerPosition} /></Field>
                      <Field label="联系电话"><ReadVal value={data.careerPhone} /></Field>
                      <Field label="邮箱"><ReadVal value={data.careerEmail} /></Field>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <Field label="姓名"><ReadVal value={data.chargeMan} /></Field>
                      <Field label="性别"><ReadVal value={data.sex == '1' ? '男' : '女'} /></Field>
                      <Field label="民族"><ReadVal value={data.nation} /></Field>
                      <Field label="出生日期">
                        <ReadVal value={data.birthday ? dayjs(data.birthday).format('YYYY年MM月DD日') : ''} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="行政职务"><ReadVal value={data.administrationPosition} /></Field>
                      <Field label="专业技术职务"><ReadVal value={data.technicalPosition} /></Field>
                      <Field label="政治面貌"><ReadVal value={data.politicalStatus} /></Field>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="最后学历"><ReadVal value={data.finalEducation} /></Field>
                      <Field label="最后学位"><ReadVal value={data.finalDegree} /></Field>
                      <Field label="企业工作经历（年）"><ReadVal value={data.workYear} /></Field>
                    </div>
                    <Field label="研究专长"><ReadVal value={data.researchExpertise} /></Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="通讯地址"><ReadVal value={data.address} /></Field>
                      <Field label="邮政编码"><ReadVal value={data.zipcode} /></Field>
                      <Field label="联系电话"><ReadVal value={data.chargeManPhone} /></Field>
                      <Field label="微信号"><ReadVal value={data.wechatId} /></Field>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {(data.leadOrgApplyPeopleList ?? []).length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">暂无团队成员信息</div>
                    ) : (data.leadOrgApplyPeopleList ?? []).map((m: any, i: number) => (
                      <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                          <span className="text-xs font-semibold text-gray-500">成员 {i + 1}</span>
                          {m.name && <span className="text-xs text-gray-600 font-medium">{m.name}</span>}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <Field label="姓名"><ReadVal value={m.name} /></Field>
                          <Field label="性别"><ReadVal value={m.sex ? (m.sex == '1' ? '男' : '女') : ''} /></Field>
                          <Field label="出生年月"><ReadVal value={m.birthday ? dayjs(m.birthday).format('YYYY年MM月DD日') : ''} /></Field>
                          <Field label="职称"><ReadVal value={m.technicalTitle} /></Field>
                          <Field label="学位"><ReadVal value={m.degree} /></Field>
                          <Field label="工作单位" className="col-span-2"><ReadVal value={m.employer} /></Field>
                          <Field label="联系电话"><ReadVal value={m.contactPhone} /></Field>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'intl' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {(data.leadOrgApplyCountryList ?? []).length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-sm">暂无国际合作记录</div>
                    ) : (data.leadOrgApplyCountryList ?? []).map((r: any, i: number) => (
                      <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                          <span className="text-xs font-medium text-gray-500">国际合作记录</span>
                        </div>
                        <div className="flex gap-4">
                          <div style={{ width: '28%', flexShrink: 0 }}>
                            <Field label="合作国家 / 地区"><ReadVal value={r.country} /></Field>
                          </div>
                          <div className="flex-1">
                            <Field label="合作内容">
                              <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                                {r.cooperateContent || <span className="text-gray-300">—</span>}
                              </div>
                            </Field>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'plan' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-xl px-4 py-3 whitespace-pre-wrap leading-relaxed min-h-[200px]">
                      {data.plan || <span className="text-gray-300">暂无建设计划内容</span>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'opinion' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-xl px-4 py-3 whitespace-pre-wrap leading-relaxed min-h-[160px]">
                      {data.opinion || <span className="text-gray-300">暂无单位意见</span>}
                    </div>
                  </div>
                  {/* <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 shadow-sm">
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium">（签字盖章）</span>
                        <div className="w-32 h-16 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-300">盖章处</div>
                      </div>
                      <div className="text-sm text-gray-400">
                        {data.updated_at ? dayjs(data.updated_at).format('YYYY 年 MM 月 DD 日') : '年   月   日'}
                      </div>
                    </div>
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   PARTICIPATING UNIT DETAIL VIEW
═══════════════════════════════════════ */
const ParticipatingDetailPage: React.FC<{
  joinDeptInfo: any | null;
  leadOrgInfo: any
  onBack: () => void;
}> = ({ joinDeptInfo, leadOrgInfo, onBack }) => {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { key: 'basic', label: '基本信息', icon: <FileTextOutlined /> },
    { key: 'team', label: '建设团队', icon: <TeamOutlined /> },
    { key: 'coop', label: '校企合作', icon: <BankOutlined /> },
    { key: 'intl', label: '国际化基础', icon: <GlobalOutlined /> },
    { key: 'plan', label: '建设计划', icon: <BuildOutlined /> },
    { key: 'opinion', label: '单位意见', icon: <SafetyCertificateOutlined /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <PageHeader
        onBack={onBack}
        breadcrumbs={['首页', '领域建设', '建设内容审核', '参与单位信息']}
        title={joinDeptInfo?.deptName}
        subtitle={`所属领域：${joinDeptInfo?.careerName}　　牵头单位：${leadOrgInfo?.deptName}`}
        accentColor="from-blue-400 to-cyan-300"
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="mx-8 mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col flex-1 mb-6">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-300 flex-shrink-0" />

          {/* Card header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center shadow-sm">
              <span className="text-white text-base font-bold">{joinDeptInfo?.deptName?.[0]}</span>
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-base">{joinDeptInfo?.deptName}</div>
              <div className="text-xs text-gray-400 mt-0.5">参与单位建设申请</div>
            </div>
          </div>

          {!joinDeptInfo && joinDeptInfo == null ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
              <FileTextOutlined style={{ fontSize: 40, opacity: 0.2 }} />
              <div className="text-sm font-medium">该参与单位尚未填写建设信息</div>
            </div>
          ) : (
            <>
              <TabNav tabs={tabs} active={activeTab} onChange={setActiveTab} />

              <div className="flex-1 overflow-y-auto">
                <div className="p-6 max-w-4xl">
                  {activeTab === 'basic' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        <InfoChip label="参与单位" value={joinDeptInfo.deptName} icon={<TeamOutlined />} />
                        <InfoChip label="拟参与建设职业领域" value={joinDeptInfo.careerName} icon={<GlobalOutlined />} />
                        <InfoChip label="职业领域所属行业子类" value={joinDeptInfo.industryName || '—'} icon={<BankOutlined />} />
                        <InfoChip label="职业领域编码" value={joinDeptInfo.careerCode || '—'} icon={<FileTextOutlined />} />
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                        <Field label="优势专业"><ReadVal value={joinDeptInfo.advantageMajor} /></Field>
                      </div>
                      <div>
                        <SectionBar icon={<PhoneOutlined />} title="参与建设团队联系人" />
                        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                          <Field label="姓名"><ReadVal value={joinDeptInfo.contactMan} /></Field>
                          <Field label="职务"><ReadVal value={joinDeptInfo.position} /></Field>
                          <Field label="联系电话"><ReadVal value={joinDeptInfo.contactPhone} /></Field>
                          <Field label="电子邮箱"><ReadVal value={joinDeptInfo.email} /></Field>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'team' && (
                    <div className="space-y-6">
                      <div>
                        <SectionBar icon={<UserOutlined />} title="团队负责人" />
                        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                          <div className="grid grid-cols-4 gap-4">
                            <Field label="姓名"><ReadVal value={joinDeptInfo.chargeMan} /></Field>
                            <Field label="性别"><ReadVal value={joinDeptInfo.sex == '1' ? '男' : '女'} /></Field>
                            <Field label="民族"><ReadVal value={joinDeptInfo.nation} /></Field>
                            <Field label="出生日期">
                              <ReadVal value={joinDeptInfo.birthday ? dayjs(joinDeptInfo.birthday).format('YYYY年MM月DD日') : ''} />
                            </Field>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <Field label="行政职务"><ReadVal value={joinDeptInfo.administrationPosition} /></Field>
                            <Field label="专业技术职务"><ReadVal value={joinDeptInfo.technicalPosition} /></Field>
                            <Field label="政治面貌"><ReadVal value={joinDeptInfo.politicalStatus} /></Field>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <Field label="最后学历"><ReadVal value={joinDeptInfo.finalEducation} /></Field>
                            <Field label="最后学位"><ReadVal value={joinDeptInfo.finalDegree} /></Field>
                            <Field label="企业工作经历（年）"><ReadVal value={joinDeptInfo.workYear} /></Field>
                          </div>
                          <Field label="研究专长"><ReadVal value={joinDeptInfo.researchExpertise} /></Field>
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="通讯地址"><ReadVal value={joinDeptInfo.address} /></Field>
                            <Field label="邮政编码"><ReadVal value={joinDeptInfo.zipcode} /></Field>
                            <Field label="联系电话"><ReadVal value={joinDeptInfo.chargeManPhone} /></Field>
                            <Field label="微信号"><ReadVal value={joinDeptInfo.wechatId} /></Field>
                          </div>
                        </div>
                      </div>
                      {/* <div>
                        <SectionBar icon={<TeamOutlined />} title="团队其他成员（含企业人员）" badge={`${joinDeptInfo.team_members?.length ?? 0} 人`} />
                        <div className="space-y-3">
                          {(joinDeptInfo.team_members ?? []).length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">暂无其他成员</div>
                          ) : (joinDeptInfo.team_members ?? []).map((m, i) => (
                            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                              <div className="text-xs font-medium text-gray-400 mb-3">成员 {i + 1}</div>
                              <div className="grid grid-cols-4 gap-3">
                                <Field label="姓名"><ReadVal value={m.name} /></Field>
                                <Field label="性别"><ReadVal value={m.gender} /></Field>
                                <Field label="出生年月"><ReadVal value={m.birth_month} /></Field>
                                <Field label="职称"><ReadVal value={m.title} /></Field>
                                <Field label="学位"><ReadVal value={m.degree} /></Field>
                                <Field label="工作单位" className="col-span-2"><ReadVal value={m.work_unit} /></Field>
                                <Field label="联系电话"><ReadVal value={m.phone} /></Field>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div> */}
                    </div>
                  )}

                  {activeTab === 'coop' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        {(joinDeptInfo.joinDeptBuildCompanyList ?? []).length === 0 ? (
                          <div className="text-center py-10 text-gray-400 text-sm">暂无校企合作记录</div>
                        ) : (joinDeptInfo.joinDeptBuildCompanyList ?? []).map((row: any, i: number) => (
                          <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                              <span className="text-xs font-medium text-gray-500">合作记录</span>
                            </div>
                            <div className="flex gap-4">
                              <div style={{ width: '28%', flexShrink: 0 }}>
                                <Field label="主要合作企业"><ReadVal value={row.company} /></Field>
                              </div>
                              <div className="flex-1">
                                <Field label="合作内容">
                                  <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                                    {row.cooperateContent || <span className="text-gray-300">—</span>}
                                  </div>
                                </Field>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'intl' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        {(joinDeptInfo.joinDeptBuildCountryList ?? []).length === 0 ? (
                          <div className="text-center py-10 text-gray-400 text-sm">暂无国际合作记录</div>
                        ) : (joinDeptInfo.joinDeptBuildCountryList ?? []).map((row: any, i: number) => (
                          <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                              <span className="text-xs font-medium text-gray-500">国际合作记录</span>
                            </div>
                            <div className="flex gap-4">
                              <div style={{ width: '28%', flexShrink: 0 }}>
                                <Field label="合作国家 / 地区"><ReadVal value={row.country} /></Field>
                              </div>
                              <div className="flex-1">
                                <Field label="合作内容">
                                  <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-lg px-3 py-2 whitespace-pre-wrap leading-relaxed min-h-[60px]">
                                    {row.cooperateContent || <span className="text-gray-300">—</span>}
                                  </div>
                                </Field>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'plan' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-xl px-4 py-3 whitespace-pre-wrap leading-relaxed min-h-[180px]">
                          {joinDeptInfo.plan || <span className="text-gray-300">暂无建设计划内容</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'opinion' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-700 bg-white border border-gray-100 rounded-xl px-4 py-3 whitespace-pre-wrap leading-relaxed min-h-[140px]">
                          {joinDeptInfo.opinion || <span className="text-gray-300">暂无单位意见</span>}
                        </div>
                      </div>
                      {/* <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 shadow-sm">
                        <div className="flex flex-col items-end gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 font-medium">（签字盖章）</span>
                            <div className="w-32 h-16 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-300">盖章处</div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {joinDeptInfo.sign_date ? dayjs(joinDeptInfo.sign_date).format('YYYY 年 MM 月 DD 日') : '年   月   日'}
                          </div>
                        </div>
                      </div> */}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface Props {
  recordInfo: any;
  /** 如果是参与单位建设信息，则要传牵头机构信息 */
  leadOrgInfo: any;
  onBack: () => void;
}
/* ═══════════════════════════════════════
   MAIN EXPORT — data loader + router
═══════════════════════════════════════ */
const DomainReviewDetail: React.FC<Props> = ({ recordInfo, leadOrgInfo, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [leadingData, setLeadingData] = useState<any | null>(null);
  const [joinDeptData, setJoinDeptData] = useState<any | null>(null);

  useEffect(() => {
    if (recordInfo.type === 'leading') {
      //查牵头机构的信息
      setLoading(true);
      getApplyDetail({ applyId: recordInfo.applyInfo.id }).then(res => {
        setLeadingData(res);
      }).catch(err => {
        message.error('加载数据失败：' + err?.response?.data?.msg || err?.message);
      }).finally(() => {
        setLoading(false);
      })
    } else {
      //查参与机构的信息
      setLoading(true);
      getJoinOrgBuildInfo({ careerId: recordInfo.joinDeptInfo.careerId, deptId: recordInfo.joinDeptInfo.deptId }).then(res => {
        setJoinDeptData(res);
      }).catch(err => {
        message.error('加载数据失败：' + err?.response?.data?.msg || err?.message);
      }).finally(() => {
        setLoading(false);
      })
    }

  }, [recordInfo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (recordInfo.type === 'participating') {
    return (
      <ParticipatingDetailPage
        joinDeptInfo={joinDeptData}
        leadOrgInfo={leadOrgInfo}
        onBack={onBack}
      />
    );
  }

  return <LeadingDetailPage data={leadingData} onBack={onBack} />;
};

export default DomainReviewDetail;
