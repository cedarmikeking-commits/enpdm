import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Form, Input, Select, DatePicker, Table,
  Space, Drawer, message, Tooltip, Tag,
  Row, Col, Popconfirm, Divider, Dropdown, Modal, Skeleton, Steps
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined,
  SendOutlined, EyeOutlined, SaveOutlined,
  FileTextOutlined, TeamOutlined, GlobalOutlined,
  BulbOutlined, AuditOutlined, HistoryOutlined,
  ReloadOutlined, CheckCircleFilled, RightOutlined,
  MoreOutlined, DownOutlined, BankOutlined,
  SearchOutlined, WarningFilled, CheckCircleOutlined, LoadingOutlined,
  PhoneOutlined, MailOutlined, LinkOutlined, IdcardOutlined, EnvironmentOutlined,
  UserOutlined, SafetyCertificateOutlined, BuildOutlined, FormOutlined
} from '@ant-design/icons';
import { Hop as Home } from 'lucide-react';
import dayjs from 'dayjs';
import { auditJoinDeptApply, checkRepeat, getApplyList, getNextCareerCode, getJoinDeptList, getJoinOrgBuildInfo, getJoinOrgInfo, getLeadOrgApplyDraft, getTwoIndustryList, saveOrUpdate, submit, submitByApplyId } from '@/api/leadOrgCareer';
import dateZhCN from 'antd/es/date-picker/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import { useDict } from '@/hooks/useDict';

// 关键：激活 dayjs 全局中文，必须执行这行
dayjs.locale('zh-cn');
const { TextArea } = Input;
const { Option } = Select;

interface TeamMember {
  key: string;
  name: string;
  sex: string;
  birthday: string;
  technicalTitle: string;
  degree: string;
  employer: string;
  contactPhone: string;
}

interface InternationalRow {
  key: string;
  country: string;
  cooperateContent: string;
}

const CTM_STEPS = [
  { key: 'basic', label: '基本信息', icon: <FileTextOutlined /> },
  { key: 'team', label: '建设团队', icon: <TeamOutlined /> },
  { key: 'coop', label: '校企合作', icon: <BankOutlined /> },
  { key: 'intl', label: '国际化基础', icon: <GlobalOutlined /> },
  { key: 'plan', label: '建设计划', icon: <BulbOutlined /> },
  { key: 'opinion', label: '单位意见', icon: <AuditOutlined /> },
];

const STEPS = [
  { key: 'basic', label: '基本信息', icon: FileTextOutlined },
  { key: 'team', label: '开发团队', icon: TeamOutlined },
  { key: 'members', label: '团队成员', icon: TeamOutlined },
  { key: 'intl', label: '国际化基础', icon: GlobalOutlined },
  { key: 'plan', label: '建设计划', icon: BulbOutlined },
  { key: 'opinion', label: '单位意见', icon: AuditOutlined },
];

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  0: { color: 'default', text: '草稿' },
  1: { color: 'blue', text: '待审核' },
  2: { color: 'green', text: '已通过' },
  3: { color: 'red', text: '已拒绝' },
};

const mkTM = (): any => ({ key: `${Date.now()}-${Math.random()}`, name: '', sex: '', birthday: '', technicalTitle: '', degree: '', employer: '', contactPhone: '' });
const mkIR = (): any => ({ key: `${Date.now()}-${Math.random()}`, country: '', cooperateContent: '' });

const LeadingUnit: React.FC = () => {
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leadOrgApplyPeopleList, setLeadOrgApplyPeopleList] = useState<any[]>([]);
  const [leadOrgApplyCountryList, setLeadOrgApplyCountryList] = useState<InternationalRow[]>([]);

  const [viewMode, setViewMode] = useState(false);
  const [editingStatus, setEditingStatus] = useState<any>('0');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [records, setRecords] = useState<any>({});
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [participatingUnits, setParticipatingUnits] = useState<Record<string, any[]>>({});
  const [loadingUnits, setLoadingUnits] = useState<Set<string>>(new Set());
  const [schoolInfoOpen, setSchoolInfoOpen] = useState(false);
  const [schoolInfoLoading, setSchoolInfoLoading] = useState(false);
  const [schoolInfoData, setSchoolInfoData] = useState<Record<string, any> | null>(null);

  const [ctmDrawerOpen, setCtmDrawerOpen] = useState(false);
  const [ctmLoading, setCtmLoading] = useState(false);
  const [ctmData, setCtmData] = useState<any | null>(null);
  const [ctmStep, setCtmStep] = useState(0);

  const [detecting, setDetecting] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [hasCheck, setHasCheck] = useState(false);
  const detectResultRef = useRef<HTMLDivElement>(null);
  const [industryList, setIndustries] = useState<any[]>([])
  const [applyList, setApplyList] = useState<any[]>([])
  const { getLabel } = useDict(['edu_org_type', 'project_apply_study_level']);



  useEffect(() => {
    fetchIndustries();
  }, []);
  /** 查二级行业 */
  const fetchIndustries = async () => {
    getTwoIndustryList().then(res => {
      setIndustries(res);
    }).catch(err => {
      message.error('加载行业数据失败：' + err?.response?.data?.msg || err?.message);
    })
  }
  /** 查已保存记录 */
  const fetchCareerList = async () => {
    setLoadingRecords(true);
    getApplyList({ current: 1, size: 99 }).then(res => {
      setApplyList(res.records || []);
    }).catch(err => {
      message.error('加载记录失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setLoadingRecords(false);
    })
  }
  /**查草稿 */
  const fetchDetail = async (applyId: any, readonly = false, toMessage = true) => {
    setLoadingRecords(true);
    getLeadOrgApplyDraft({ applyId }).then(res => {
      form.resetFields();

      form.setFieldsValue(res || {})
      if (res) {
        //日期处理
        if (res.birthday) {
          const birthday = dayjs(res.birthday);
          form.setFieldsValue({ birthday });
        }
        //其他团队成员
        setLeadOrgApplyPeopleList(res.leadOrgApplyPeopleList || []);
        form.setFieldsValue({ peopleList: res.leadOrgApplyPeopleList || [] });
        //国际化基础
        setLeadOrgApplyCountryList(res.leadOrgApplyCountryList || []);
        form.setFieldsValue({ countryList: res.leadOrgApplyCountryList || [] });
      }
      setRecords(res || {});
      setViewMode(readonly);
      setDrawerOpen(false);
      setEditingStatus(res.auditStatus || '0');
      if (toMessage) {

        message.success(readonly ? '已加载，仅供查看' : '已加载，可继续编辑');
      }
    }).catch(err => {
      message.error('加载记录失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setLoadingRecords(false);
    })
  };
  /**查编码 */
  const fetchCareerCode = async (industryId: string) => {
    getNextCareerCode({ industryId: industryId }).then(res => {
      records.careerCode = res
      form.setFieldValue('careerCode', res);
      //重新查了编码就要检查
      setHasCheck(false);
    }).catch(err => {
      message.error('加载行业数据失败：' + err?.response?.data?.msg || err?.message);
    })
  }
  /**检测 */
  const handleCheckCareer = async () => {
    const careerName = form.getFieldValue('careerName');
    const careerCode = form.getFieldValue('careerCode');

    if (!careerName || !careerCode) {
      message.warning('请先填写职业领域名称和职业领域编码');
      return;
    }

    setDetecting(true);
    checkRepeat({ careerCode, careerName, applyId: records.id }).then((res) => {
      setCheckResult(res);
      setHasCheck(true);
    }).catch(err => {
      message.error('检测失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setDetecting(false);
    })

  };

  /**保存更新--每一步都保存 */
  const handleSaveDraft = async () => {
    const values = await form.validateFields();
    //处理日期
    if (values.peopleList  && values.peopleList.length > 0) {
      values.peopleList.forEach((item:any, index:any) => {
        if (item.birthday) {
          let birthday = item.birthday + '-01';
          values.peopleList[index].birthday = dayjs(birthday).format('YYYY-MM-DD HH:mm:ss');
        }
      })
    }
    //第三步和第四步要验证最少有一条数据
    if (step == 2) {
      if (!values.peopleList || values.peopleList.length == 0) {
        message.error('请至少填写一条团队其他成员信息');
        return;
      }
    }
    if (step == 3) {
      if (!values.countryList || values.countryList.length == 0) {
        message.error('请至少填写一条国际化基础信息');
        return;
      }
    }
    setSaving(true);
    saveOrUpdate({
      ...records, ...values,
      birthday: values.birthday ? values.birthday?.format('YYYY-MM-DD HH:mm:ss') : undefined,
      leadOrgApplyPeopleList: values.peopleList,
      leadOrgApplyCountryList: values.countryList,
      auditStatus:0
    }).then((res) => {
      if (step < 5) {
        setStep(s => s + 1);
      }
      setRecords({...records,  ...values, id: res })
      console.log('保存成功:第' + step + '步');
      //第三步第四步保存后要单独查询
      if (step === 2 || step === 3) {
        fetchDetail(res, false, false);
      }
      if (step == 5) {
        message.success('保存成功');
      }

    }).catch(err => {
      message.error('保存失败' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setSaving(false);
    })
  }
  /**提交审核 */
  const handleSubmit = async () => {
    const values = await form.validateFields();
    //处理日期
    if (values.peopleList && values.peopleList.length > 0) {
      values.peopleList.forEach((item:any, index:any) => {
        if (item.birthday) {
          let birthday = item.birthday + '-01';
          values.peopleList[index].birthday = dayjs(birthday).format('YYYY-MM-DD HH:mm:ss');
        }
      })
    }
    setSubmitting(true);
    submit({
      ...records, ...values,
      birthday: values.birthday?.format('YYYY-MM-DD HH:mm:ss'),
      leadOrgApplyPeopleList: values.peopleList,
      leadOrgApplyCountryList: values.countryList
    }).then(() => {
      resetAll();
      message.success('已提交审核');
    }).catch(err => {
      message.error('提交失败' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setSubmitting(false);
    })

  };

  /** 根据Id提交 */
  const handleSubmitById = async (applyId: string) => {
    setSubmitting(true);
    submitByApplyId({ applyId }).then(() => {
      fetchCareerList();
      message.success('已提交审核');
    }).catch(err => {
      message.error('提交失败: ' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setSubmitting(false);
    })
  }
  /** 查参与单位 */
  const handleJoinDeptList = async (rec: any) => {
    const id = rec.id;
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    if (!expandedIds.has(id) && !participatingUnits[id]) {
      setLoadingUnits(prev => new Set(prev).add(id));
      getJoinDeptList({ careerId: rec.careerId }).then(res => {
        setParticipatingUnits(prev => ({ ...prev, [id]: res || [] }));
      }).catch(err => {
        message.error('加载参与单位失败：' + err?.response?.data?.msg || err?.message);
      }).finally(() => {
        setLoadingUnits(prev => { const next = new Set(prev); next.delete(id); return next; });
      })
    }
  };
  /** 查参与单位基本信息 */
  const openSchoolInfo = async (deptId: string) => {
    setSchoolInfoOpen(true);
    setSchoolInfoData(null);
    setSchoolInfoLoading(true);
    getJoinOrgInfo({ deptId }).then(res => {
      setSchoolInfoData(res);
    }).catch(err => {
      message.error('加载参与单位信息失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setSchoolInfoLoading(false);
    })

  };
  /** 查参与单位建设信息 */
  const openCtmDrawer = async (deptId: string, careerId: string) => {
    setCtmStep(0);
    setCtmData(null);
    setCtmDrawerOpen(true);
    setCtmLoading(true);
    getJoinOrgBuildInfo({ careerId, deptId }).then(res => {
      setCtmData(res);
    }).catch(err => {
      message.error('加载参与单位建设信息失败：' + err?.response?.data?.msg || err?.message);
    }).finally(() => {
      setCtmLoading(false);
    })
  };

  const resetAll = () => {
    setRecords({});

    setLeadOrgApplyPeopleList([]);
    setLeadOrgApplyCountryList([]);
    setStep(0);
    setViewMode(false);
    setCheckResult(null);
    form.resetFields();
    form.setFieldsValue({});
  };


  /* team member helpers */
  // const updTM = (i: number, f: keyof TeamMember, v: string) =>
  //   setLeadOrgApplyPeopleList(p => p.map((m, j) => j === i ? { ...m, [f]: v } : m));
  const addTM = () => setLeadOrgApplyPeopleList(p => [...p, mkTM()]);
  const delTM = (i: number) => {
    // setLeadOrgApplyPeopleList(p => p.filter((_, j) => j !== i));
    const currentList = form.getFieldValue('peopleList') || [];
    const newList = currentList.filter((_: any, idx: number) => idx !== i);

    // 同步更新 Form 和您的 React 数组状态（以控制表格行数渲染）
    form.setFieldsValue({ peopleList: newList });
    setLeadOrgApplyPeopleList(newList);
  }

  /* intl row helpers */
  // const updIR = (i: number, f: keyof InternationalRow, v: string) =>
  //   setLeadOrgApplyCountryList(p => p.map((r, j) => j === i ? { ...r, [f]: v } : r));
  const addIR = () => setLeadOrgApplyCountryList(p => [...p, mkIR()]);
  const delIR = (i: number) => {
    // setLeadOrgApplyCountryList(p => p.filter((_, j) => j !== i));
    // 从 Form 中获取当前最新的数据
    const currentList = form.getFieldValue('countryList') || [];
    const newList = currentList.filter((_: any, idx: number) => idx !== i);

    // 同时同步 Form 里的状态和外部数据源的状态
    form.setFieldsValue({ countryList: newList });
    setLeadOrgApplyCountryList(newList);
  };

  /* ─ table columns ─ */
  // const baseColumns = [
  //   { title: '姓名', required: true, width: 90, render: (_: unknown, _r: TeamMember, i: number) => <Input size="small" value={leadOrgApplyPeopleList[i].name} onChange={e => updTM(i, 'name', e.target.value)} /> },
  //   { title: '性别', required: true, width: 70, render: (_: unknown, _r: TeamMember, i: number) => <Select size="small" style={{ width: '100%' }} value={leadOrgApplyPeopleList[i].sex} onChange={v => updTM(i, 'sex', v)}><Option value={1}>男</Option><Option value={2}>女</Option></Select> },
  //   { title: '出生年月', required: true, width: 120, render: (_: unknown, _r: TeamMember, i: number) => <DatePicker size="small" style={{ width: '100%' }} picker="month" locale={dateZhCN} placeholder="选择年月" value={leadOrgApplyPeopleList[i].birthday ? dayjs(leadOrgApplyPeopleList[i].birthday, 'YYYY-MM') : null} onChange={d => updTM(i, 'birthday', d ? d.format('YYYY-MM') : '')} /> },
  //   { title: '职称', required: true, width: 100, render: (_: unknown, _r: TeamMember, i: number) => <Input size="small" value={leadOrgApplyPeopleList[i].technicalTitle} onChange={e => updTM(i, 'technicalTitle', e.target.value)} /> },
  //   { title: '学历', required: true, width: 80, render: (_: unknown, _r: TeamMember, i: number) => <Select size="small" style={{ width: '100%' }} value={leadOrgApplyPeopleList[i].degree} onChange={v => updTM(i, 'degree', v)}><Option value="1">学士</Option><Option value="2">硕士</Option><Option value="3">博士</Option><Option value="4">其他</Option></Select> },
  //   { title: '工作单位', required: true, render: (_: unknown, _r: TeamMember, i: number) => <Input size="small" value={leadOrgApplyPeopleList[i].employer} onChange={e => updTM(i, 'employer', e.target.value)} /> },
  //   { title: '联系电话', required: true, width: 128, render: (_: unknown, _r: TeamMember, i: number) => <Input size="small" value={leadOrgApplyPeopleList[i].contactPhone} onChange={e => updTM(i, 'contactPhone', e.target.value)} /> },
  //   { title: '', required: false, width: 40, render: (_: unknown, _r: TeamMember, i: number) => <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => delTM(i)} disabled={leadOrgApplyPeopleList.length === 1} /> },
  // ];
  const baseColumns = [
    {
      title: '姓名',
      required: true,
      width: 90,
      render: (_: unknown, _r: TeamMember, i: number) => (
        <Form.Item
          name={['peopleList', i, 'name']}
          rules={[{ required: true, message: '请输入姓名' }]}
          style={{ marginBottom: 0 }}
        >
          <Input size="small" placeholder="请输入" />
        </Form.Item>
      ),
    },
    {
      title: '性别',
      required: true,
      width: 70,
      render: (_: unknown, _r: TeamMember, i: number) => (
        <Form.Item
          name={['peopleList', i, 'sex']}
          rules={[{ required: true, message: '请选择性别' }]}
          style={{ marginBottom: 0 }}
        >
          <Select size="small" style={{ width: '100%' }} placeholder="选择">
            <Option value={1}>男</Option>
            <Option value={2}>女</Option>
          </Select>
        </Form.Item>
      ),
    },
    {
      title: '出生年月',
      required: true,
      width: 120,
      render: (_: unknown, _r: TeamMember, i: number) => (
        <Form.Item
          name={['peopleList', i, 'birthday']}
          rules={[{ required: true, message: '请选择年月' }]}
          style={{ marginBottom: 0 }}
          // 关键点：将 Form 内的字符串格式自动转换为 DatePicker 需要的 dayjs 对象
          getValueProps={(value) => ({ value: value ? dayjs(value, 'YYYY-MM') : null })}
          // 关键点：将选择后的 dayjs 对象自动格式化为字符串传给 Form
          normalize={(value) => (value ? value.format('YYYY-MM') : '')}
        >
          <DatePicker size="small" style={{ width: '100%' }} picker="month" locale={dateZhCN} placeholder="选择年月" />
        </Form.Item>
      ),
    },
    {
      title: '职称',
      required: true,
      width: 100,
      render: (_: unknown, _r: TeamMember, i: number) => (
        <Form.Item
          name={['peopleList', i, 'technicalTitle']}
          rules={[{ required: true, message: '请输入职称' }]}
          style={{ marginBottom: 0 }}
        >
          <Input size="small" placeholder="请输入" />
        </Form.Item>
      ),
    },
    {
      title: '学历',
      required: true,
      width: 80,
      render: (_: unknown, _r: TeamMember, i: number) => (
        <Form.Item
          name={['peopleList', i, 'degree']}
          rules={[{ required: true, message: '请选择学历' }]}
          style={{ marginBottom: 0 }}
        >
          <Select size="small" style={{ width: '100%' }} placeholder="选择">
            <Option value="1">学士</Option>
            <Option value="2">硕士</Option>
            <Option value="3">博士</Option>
            <Option value="4">其他</Option>
          </Select>
        </Form.Item>
      ),
    },
    {
      title: '工作单位',
      required: true,
      render: (_: unknown, _r: TeamMember, i: number) => (
        <Form.Item
          name={['peopleList', i, 'employer']}
          rules={[{ required: true, message: '请输入工作单位' }]}
          style={{ marginBottom: 0 }}
        >
          <Input size="small" placeholder="请输入" />
        </Form.Item>
      ),
    },
    {
      title: '联系电话',
      required: true,
      width: 128,
      render: (_: unknown, _r: TeamMember, i: number) => (
        <Form.Item
          name={['peopleList', i, 'contactPhone']}
          rules={[
            { required: true, message: '请输入联系电话' },
            // 还可以顺便在这里加手机号正则校验
            { pattern: /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/, message: '格式不正确' }
          ]}
          style={{ marginBottom: 0 }}
        >
          <Input size="small" placeholder="请输入" />
        </Form.Item>
      ),
    },
    {
      title: '',
      required: false,
      width: 40,
      render: (_: unknown, _r: TeamMember, i: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => delTM(i)}
          disabled={leadOrgApplyPeopleList.length === 1}
        />
      ),
    },
  ];
  const tmCols = baseColumns.map(col => ({
    ...col,
    title: col.required ? (
      <span>
        <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>
        {col.title}
      </span>
    ) : col.title,
  }));

  // const baseIrCols = [
  //   { required: true, title: '合作国家', width: 150, render: (_: unknown, _r: InternationalRow, i: number) => <Input size="small" value={leadOrgApplyCountryList[i].country} onChange={e => updIR(i, 'country', e.target.value)} /> },
  //   { required: true, title: '合作内容', render: (_: unknown, _r: InternationalRow, i: number) => <TextArea autoSize={{ minRows: 1, maxRows: 3 }} size="small" value={leadOrgApplyCountryList[i].cooperateContent} onChange={e => updIR(i, 'cooperateContent', e.target.value)} /> },
  //   { required: false, title: '', width: 40, render: (_: unknown, _r: InternationalRow, i: number) => <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => delIR(i)} disabled={leadOrgApplyCountryList.length === 1} /> },
  // ];
  const baseIrCols = [
    {
      required: true,
      title: '合作国家',
      width: 150,
      render: (_: unknown, _r: InternationalRow, i: number) => (
        <Form.Item
          name={['countryList', i, 'country']}
          rules={[{ required: true, message: '请输入合作国家' }]}
          style={{ marginBottom: 0 }}
        >
          <Input size="small" placeholder="请输入" />
        </Form.Item>
      ),
    },
    {
      required: true,
      title: '合作内容',
      render: (_: unknown, _r: InternationalRow, i: number) => (
        <Form.Item
          name={['countryList', i, 'cooperateContent']}
          rules={[{ required: true, message: '请输入合作内容' }]}
          style={{ marginBottom: 0 }}
        >
          <TextArea autoSize={{ minRows: 1, maxRows: 3 }} size="small" placeholder="请输入" />
        </Form.Item>
      ),
    },
    {
      required: false,
      title: '',
      width: 40,
      render: (_: unknown, _r: InternationalRow, i: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => delIR(i)}
          disabled={leadOrgApplyCountryList.length === 1}
        />
      ),
    },
  ];
  const irCols = baseIrCols.map(col => ({
    ...col,
    title: col.required ? (
      <span>
        <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>
        {col.title}
      </span>
    ) : col.title,
  }));

  const getRecordMenuItems = (rec: any) => {
    const items: { key: string; label: React.ReactNode; danger?: boolean }[] = [];
    if (rec.id && rec.id != null) {
      items.push({
        key: 'view',
        label: (
          <span className="flex items-center gap-2" onClick={() => fetchDetail(rec.id, true)}>
            <EyeOutlined /> 查看详情
          </span>
        ),
      });
    }
    if (rec.auditStatus == '0') {
      items.push({
        key: 'edit',
        label: (
          <span className="flex items-center gap-2" onClick={() => {
            setEditingId(rec.id);
            fetchDetail(rec.id, false);
          }}>
            <EditOutlined /> 继续编辑
          </span>
        ),
      });
    }
    if (rec.auditStatus == '0') {
      items.push({
        key: 'submit',
        label: (
          <Popconfirm title="确认提交审核？" okText="确定" cancelText="取消" onConfirm={async () => {
            handleSubmitById(rec.id);
          }}>
            <span className="flex items-center gap-2 text-blue-600"><SendOutlined /> 提交审核</span>
          </Popconfirm>
        ),
      });
    }
    return items;
  };

  const RecordCard: React.FC<{ rec: any }> = ({ rec }) => {
    const expanded = expandedIds.has(rec.id);
    const status = STATUS_MAP[rec.auditStatus] || { color: 'default', text: rec.status };
    const initials = (rec.deptName || '?').slice(0, 2).toUpperCase();
    const units = participatingUnits[rec.id];
    const unitsLoading = loadingUnits.has(rec.id);
    // const { getLabel } = useDict('charge_dept_type');

    const UNIT_STATUS_MAP: Record<string, { color: string; text: string }> = {
      1: { color: 'orange', text: '待审核' },
      2: { color: 'green', text: '准予参与' },
      3: { color: 'red', text: '拒绝参与' },
    };

    const handleReviewUnit = async (unitId: string, recId: string, action: '2' | '3') => {
      auditJoinDeptApply({ joinOrgApplyId: unitId, status: action == '2' ? 2 : 3, auditReason: '' }).then(() => {
        message.success(action == '2' ? '已准予参与' : '已拒绝参与');
        setParticipatingUnits(prev => ({
          ...prev,
          [recId]: (prev[recId] || []).map(u => u.id === unitId ? { ...u, auditStatus: action } : u),
        }));
      }).catch(err => {
        message.error('操作失败:' + err?.response?.data?.msg || err?.message);
      })
    };

    return (
      <div
        className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${expanded ? 'border-blue-200 shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'}`}
      >
        {/* Main row */}
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Expand toggle */}
          <button
            onClick={() => handleJoinDeptList(rec)}
            className={`flex-none w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${expanded ? 'bg-blue-50 text-blue-500' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
          >
            {expanded ? <DownOutlined style={{ fontSize: 11 }} /> : <RightOutlined style={{ fontSize: 11 }} />}
          </button>

          {/* Avatar */}
          <div className="flex-none w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-[15px] truncate">{rec.deptName || <span className="text-gray-400 font-normal">未填写学校名称</span>}</span>
              <Tag color={status.color} style={{ margin: 0, fontSize: 12 }}>{status.text}</Tag>
            </div>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
              <span>{rec.careerName || '—'}</span>
              <span>更新于 {dayjs(rec.updateTime).format('YYYY-MM-DD HH:mm')}</span>
            </div>
          </div>

          {/* Three-dot menu */}
          {rec.id && rec.id != null && <Dropdown menu={{ items: getRecordMenuItems(rec) }} trigger={['click']} placement="bottomRight">
            <button className="flex-none w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all duration-150">
              <MoreOutlined style={{ fontSize: 18 }} />
            </button>
          </Dropdown>}
        </div>

        {/* Expanded content */}
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[800px]' : 'max-h-0'}`}>
          <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
            {/* header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BankOutlined style={{ color: '#60a5fa', fontSize: 13 }} />
                <span className="text-xs font-semibold text-gray-500 tracking-wide">参与单位申请</span>
                {units && units.length > 0 && (
                  <span className="text-xs text-gray-400">
                    共 {units.length} 个
                    {units.filter(u => u.auditStatus == '1').length > 0 && (
                      <span className="ml-1 inline-flex items-center gap-0.5 text-amber-500 font-medium">
                        · {units.filter(u => u.auditStatus == '1').length} 待审核
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>

            {unitsLoading ? (
              <div className="flex items-center justify-center gap-2 py-5 text-gray-400">
                <LoadingOutlined style={{ fontSize: 16 }} />
                <span className="text-xs">加载中...</span>
              </div>
            ) : !units || units.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-300 gap-2">
                <BankOutlined style={{ fontSize: 24 }} />
                <span className="text-xs text-gray-400">暂无参与单位申请</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {units.map((u, i) => {
                  const us = UNIT_STATUS_MAP[u.auditStatus] || { color: 'default', text: u.auditStatus };
                  const isPending = u.auditStatus == '1';
                  const isReviewing = u.auditStatus == '2'; // reviewingUnit === u.id;
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 bg-white rounded-lg px-4 py-2.5 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-150"
                    >
                      {/* index */}
                      <span className="flex-none w-5 text-center text-xs text-gray-400 font-medium">{i + 1}</span>

                      {/* name */}
                      <div className="flex-1 text-sm text-gray-800 truncate">{u.deptName}</div>

                      {/* status tag */}
                      <Tag color={us.color} style={{ margin: 0, fontSize: 11 }}>{us.text}</Tag>

                      {/* view school info */}
                      <Tooltip title="查看机构信息" placement="top">
                        <button
                          onClick={() => openSchoolInfo(u.deptId)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-150"
                        >
                          <BankOutlined style={{ fontSize: 13 }} />
                        </button>
                      </Tooltip>

                      {/* view construction info */}
                      <Tooltip title="查看建设信息" placement="top">
                        <button
                          onClick={() => openCtmDrawer(u.deptId, rec.careerId)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-150"
                        >
                          <BuildOutlined style={{ fontSize: 13 }} />
                        </button>
                      </Tooltip>

                      {/* review actions — only for pending */}
                      {isPending && (
                        <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                          <Tooltip title="准予参与" placement="top">
                            <Popconfirm
                              title="准予参与"
                              description={`确定准予「${u.deptName}」参与此领域建设？`}
                              okText="确定"
                              cancelText="取消"
                              okButtonProps={{ style: { background: '#10b981', borderColor: '#10b981' } }}
                              onConfirm={() => handleReviewUnit(u.id, rec.id, '2')}
                              disabled={isReviewing}
                            >
                              <button
                                disabled={isReviewing}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all duration-150 disabled:opacity-40"
                              >
                                {isReviewing ? <LoadingOutlined style={{ fontSize: 13 }} /> : <CheckCircleOutlined style={{ fontSize: 13 }} />}
                              </button>
                            </Popconfirm>
                          </Tooltip>
                          <Tooltip title="拒绝参与" placement="top">
                            <Popconfirm
                              title="拒绝参与"
                              description={`确定拒绝「${u.deptName}」的参与申请？`}
                              okText="确定"
                              cancelText="取消"
                              okButtonProps={{ danger: true }}
                              onConfirm={() => handleReviewUnit(u.id, rec.id, '3')}
                              disabled={isReviewing}
                            >
                              <button
                                disabled={isReviewing}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 disabled:opacity-40"
                              >
                                <DeleteOutlined style={{ fontSize: 13 }} />
                              </button>
                            </Popconfirm>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ─ section label ─ */
  const SectionTitle: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-cyan-400" />
      <span className="font-semibold text-gray-800 text-[15px]">{text}</span>
    </div>
  );



  /* ─ step content panels ─ */
  const panels = [
    /* 0 基本信息 */
    <div key="basic" className="space-y-5">
      <SectionTitle text="一、基本信息" />
      <Row gutter={[16, 16]}>
        {/* <Col span={12}>
          <Form.Item label="学校名称" name="school_name" rules={[{ required: true, message: '请选择学校名称' }]}>
            <Select
              placeholder="请选择学校"
              showSearch
              optionFilterProp="label"
              options={approvedSchools.map(s => ({ value: s.school_name, label: s.school_name }))}
            />
          </Form.Item>
        </Col> */}
        <Col span={12}>
          <Form.Item label="优势专业" name="advantageMajor" rules={[{ required: true, message: '请填写优势专业' }]}>
            <Input placeholder="按实际情况填写" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="拟开发的职业领域" name="careerName" rules={[{ required: true, message: '请填写职业领域' }]}>
            <Input placeholder="请填写" onChange={() => { setHasCheck(false); setCheckResult(null); }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="industryId"
              rules={[{ required: true, message: '请选择行业子类' }]}
              label={
                <Tooltip title="职业领域所属行业子类">
                  <span>行业子类</span>
                </Tooltip>
              }
            >
              <Select
                placeholder="请选择行业子类"
                showSearch
                optionFilterProp="label"
                onChange={(val: string) => {
                  fetchCareerCode(val);
                }}
                optionRender={(option) => (
                  <Tooltip title={option.label} placement="right">
                    <span style={{ display: 'block' }}>{option.label}</span>
                  </Tooltip>
                )}
                options={industryList.map(c => ({
                  value: c.id,
                  label: `${c.industryCode} ${c.industryName}`,
                }))}
              />
            </Form.Item>
            <Form.Item label="职业领域编码" name="careerCode" rules={[{ required: true, message: '请先选择行业子类' }]}>
              <Input
                readOnly
                placeholder={'选择行业子类后自动生成'}
                className="bg-gray-50 cursor-default"
                suffix={undefined}
              />
            </Form.Item>
          </div>
        </Col>

        {/* Detect button row - only shown on first-time creation (no saved record yet) */}
        {!viewMode && (
          <Col span={24}>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={detecting ? <LoadingOutlined /> : <SearchOutlined />}
                onClick={handleCheckCareer}
                loading={detecting}
                className="h-9 px-6 font-medium"
                style={{ background: detecting ? undefined : 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)', border: 'none', boxShadow: '0 2px 8px rgba(22,119,255,0.35)' }}
              >
                {detecting ? '检测中...' : '职业领域重复性检测'}
              </Button>
              {checkResult === null && !checkResult && (
                <span className="text-xs text-gray-400">填写职业领域名称并选择行业子类后点击检测</span>
              )}
            </div>
          </Col>
        )}

        {/* Detection result */}
        {!viewMode && (hasCheck || records.id) && (
          <Col span={24}>
            <div ref={detectResultRef} className={`rounded-xl border-2 overflow-hidden transition-all duration-500 ${checkResult ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
              {checkResult != null ? (
                <>
                  <div className="flex items-center gap-3 px-5 py-3 bg-red-100 border-b border-red-200">
                    <WarningFilled style={{ color: '#ef4444', fontSize: 20 }} />
                    <div>
                      <div className="font-semibold text-red-700 text-sm">检测到重复职业领域</div>
                    </div>
                  </div>
                  <div className="px-5 py-3 space-y-2">
                    {checkResult && (
                      <div key={checkResult.id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-2.5 border border-red-100 shadow-sm">
                        <div className="flex-none w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs font-bold">{1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800">{checkResult.leadOrgName || '—'}</div>
                          <div className="text-xs text-gray-500 truncate">{checkResult.careerName}（{checkResult.careerCode}）</div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 px-5 py-4">
                  <div className="flex-none w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 22 }} />
                  </div>
                  <div>
                    <div className="font-semibold text-green-700 text-sm">未发现重复，可以继续填写</div>
                    <div className="text-xs text-green-500 mt-0.5">该职业领域名称和编码在系统中尚无记录</div>
                  </div>
                </div>
              )}
            </div>
          </Col>
        )}

        {/* Domain connotation - shown when editing existing record or after passing detection */}
        {(records.id || (hasCheck && checkResult == null)) && (
          <Col span={24}>
            <Form.Item label="职业领域内涵" name="careerDepth" rules={[{ required: true, message: '请填写职业领域内涵' }]}>
              <TextArea rows={4} placeholder="请描述职业领域内涵" />
            </Form.Item>
          </Col>
        )}
      </Row>

      {/* Contact section - shown when editing existing record or after passing detection */}
      {(records.id || (hasCheck && checkResult == null)) && (
        <>
          <Divider style={{ margin: '0 0 8px' }} />
          <SectionTitle text="职业领域联络人" />
          <Row gutter={[16, 0]}>
            <Col span={6}><Form.Item label="姓名" name="careerMan" rules={[{ required: true, message: '请填写联络人姓名' }]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item label="职务" name="careerPosition" rules={[{ required: true, message: '请填写职务' }]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item label="联系电话" name="careerPhone" rules={[
              { required: true, message: '请填写联系电话' },
              {
                pattern: /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/,
                message: '请输入正确号码'
              }
            ]}><Input /></Form.Item></Col>
            <Col span={6}><Form.Item label="邮箱" name="careerEmail" rules={[
              { required: true, message: '请填写邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}><Input /></Form.Item></Col>
          </Row>
        </>
      )}
    </div>,

    /* 1 开发团队 */
    <div key="team" className="space-y-5">
      <SectionTitle text="二、职业领域开发团队信息" />
      <Row gutter={[16, 0]}>
        <Col span={6}><Form.Item label="团队负责人姓名" name="chargeMan" rules={[{ required: true, message: '请填写团队负责人姓名' }]}><Input /></Form.Item></Col>
        <Col span={4}><Form.Item label="性别" name="sex" rules={[{ required: true, message: '请填写性别' }]}><Select style={{ width: '100%' }}><Option value="1">男</Option><Option value="2">女</Option></Select></Form.Item></Col>
        <Col span={4}><Form.Item label="民族" name="nation" rules={[{ required: true, message: '请填写民族' }]}><Input /></Form.Item></Col>
        <Col span={6}><Form.Item label="出生日期" name="birthday" rules={[{ required: true, message: '请填写出生日期' }]}><DatePicker style={{ width: '100%' }} placeholder="选择日期" /></Form.Item></Col>
        <Col span={4}><Form.Item label="政治面貌" name="politicalStatus" rules={[{ required: true, message: '请填写政治面貌' }]}><Input /></Form.Item></Col>
        <Col span={6}><Form.Item label="行政职务" name="administrationPosition" rules={[{ required: true, message: '请填写行政职务' }]}><Input /></Form.Item></Col>
        <Col span={6}><Form.Item label="专业技术职务" name="technicalPosition" rules={[{ required: true, message: '请填写专业技术职务' }]}><Input /></Form.Item></Col>
        <Col span={6}><Form.Item label="最后学历" name="finalEducation" rules={[{ required: true, message: '请填写最后学历' }]}><Input /></Form.Item></Col>
        <Col span={6}><Form.Item label="最后学位" name="finalDegree" rules={[{ required: true, message: '请填写最后学位' }]}><Input /></Form.Item></Col>
        <Col span={6}>
          <Form.Item label="企业工作经历（年）" name="workYear" rules={[{ required: true, message: '请填写企业工作经历（年）' }]}>
            <Input type="number" min={0} />
          </Form.Item>
        </Col>
        <Col span={24}><Form.Item label="研究专长" name="researchExpertise" rules={[{ required: true, message: '请填写研究专长' }]}><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="通讯地址" name="address" rules={[{ required: true, message: '请填写通讯地址' }]}><Input /></Form.Item></Col>
        <Col span={6}><Form.Item label="邮政编码" name="zipcode" rules={[{ required: true, message: '请填写邮政编码' }]}><Input /></Form.Item></Col>
        <Col span={6}><Form.Item label="微信号" name="wechatId" rules={[{ required: true, message: '请填微信号' }]}><Input /></Form.Item></Col>
        <Col span={12}><Form.Item label="联系电话" name="chargeManPhone" rules={[{ required: true, message: '请填写联系电话' },
        {
          pattern: /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/,
          message: '请输入正确号码'
        }]}><Input /></Form.Item></Col>
      </Row>
    </div>,

    /* 2 团队成员 */
    <div key="members" className="space-y-4">
      <SectionTitle text="三、团队其他成员（含企业人员）" />
      <Table dataSource={leadOrgApplyPeopleList} columns={tmCols} rowKey="key" pagination={false} size="small" bordered scroll={{ x: 820 }} />
      <Button type="dashed" icon={<PlusOutlined />} onClick={addTM} block>添加成员</Button>
    </div>,

    /* 3 国际化 */
    <div key="intl" className="space-y-4">
      <SectionTitle text="四、拟开发职业领域的国际化基础" />
      <Table dataSource={leadOrgApplyCountryList} columns={irCols} rowKey="key" pagination={false} size="small" bordered />
      <Button type="dashed" icon={<PlusOutlined />} onClick={addIR} block>添加行</Button>
    </div>,

    /* 4 建设计划 */
    <div key="plan" className="space-y-4">
      <SectionTitle text="五、职业领域建设计划" />
      <Form.Item name="plan" noStyle rules={[{ required: true, message: '请填写职业领域建设计划' }]} >
        <TextArea rows={14} placeholder="请填写职业领域建设计划..." />
      </Form.Item>
    </div>,

    /* 5 单位意见 */
    <div key="opinion" className="space-y-4">
      <SectionTitle text="六、单位意见" />
      <Form.Item name="opinion" noStyle rules={[{ required: true, message: '请填写单位意见' }]} >
        <TextArea rows={8} placeholder="请填写单位意见..." />
      </Form.Item>
      <div className="flex justify-end gap-12 text-gray-400 text-sm pt-6 border-t border-dashed border-gray-200">
        <span>（签字盖章）</span>
        <span>年&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;日</span>
      </div>
    </div>,
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Home className="w-4 h-4" />
          <span className="cursor-pointer hover:text-gray-700">首页</span>
          <RightOutlined className="text-xs" />
          <span>领域建设</span>
          <RightOutlined className="text-xs" />
          <span className="text-gray-800 font-medium">牵头单位</span>
        </div>
        <Space>
          {viewMode && <Tag color="orange">仅查看</Tag>}
          {!viewMode && editingId && <Tag color="blue">编辑中</Tag>}
          {viewMode && records.auditStatus == '0' && (
            <Button
              icon={<EditOutlined />}
              type="primary" ghost
              onClick={() => {
                setEditingId(records.id);
                setViewMode(false);
                message.success('已切换为编辑模式');
              }}
            >
              切换编辑
            </Button>
          )}
          <Button icon={<ReloadOutlined />} onClick={resetAll}>新建</Button>
          <Button
            icon={<HistoryOutlined />}
            onClick={() => {
              fetchCareerList();
              setDrawerOpen(true);
            }}
          >
            已保存记录
          </Button>
        </Space>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="flex gap-5 flex-1 min-h-0 overflow-hidden">

        {/* ── Left sidebar ── */}
        <div className="flex-none w-48 flex flex-col gap-2 self-start sticky top-0">
          {/* Step list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {STEPS.map((s, i) => {
              // const Icon = s.icon;
              const active = step === i;
              const done = i < step;
              return (
                <div
                  key={s.key}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-gray-50 last:border-0
                    ${active
                      ? 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span
                    className={`flex-none w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                      ${active ? 'bg-blue-500 text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                  >
                    {done ? <CheckCircleFilled style={{ fontSize: 12 }} /> : i + 1}
                  </span>
                  <span className="text-sm">{s.label}</span>
                  {active && <RightOutlined className="ml-auto text-xs text-blue-400" />}
                </div>
              );
            })}
          </div>

          {/* Action buttons — hidden in view mode */}
          {!viewMode && (editingStatus == '0' || editingStatus == '3') && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col gap-2">
              {(editingStatus == '0' || editingStatus == '3') && (
                <Button
                  block
                  icon={<SaveOutlined />}
                  onClick={handleSaveDraft}
                  loading={saving}
                  className="text-gray-700"
                >
                  保存草稿
                </Button>
              )}
              {editingStatus == '0' && (
                <Button
                  block
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  loading={submitting}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 border-0 text-white font-medium"
                >
                  提交审核
                </Button>
              )}
            </div>
          )}
        </div>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto min-h-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative">
            {viewMode && <div className="absolute inset-0 z-10 cursor-default rounded-xl" />}
            <Form form={form} layout="vertical" size="middle" >
              {panels[step]}
            </Form>
          </div>

          {/* Step navigation */}
          <div className="flex justify-between pb-2">
            <Button disabled={step === 0} onClick={() => setStep(s => s - 1)}>
              上一步
            </Button>
            <Button
              type="primary"
              ghost
              disabled={step === STEPS.length - 1}
              onClick={async () => {
                if (viewMode) {
                  if (step < 5) {
                    setStep(s => s + 1);
                  }
                  return;
                };
                if (step == 0 && !records.id && !hasCheck) {
                  message.error('请先点击职业领域重复性检测进行检测');
                  return
                }
                handleSaveDraft();
              }}
            >
              下一步
            </Button>
          </div>
        </div>
      </div>

      {/* ── Records drawer ── */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined style={{ color: '#3b82f6' }} />
            <span>职业领域建设记录</span>
          </div>
        }
        placement="right"
        width={780}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}

      >
        <div className="flex flex-col gap-3">
          {loadingRecords ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <span>加载中...</span>
            </div>
          ) : applyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <FileTextOutlined style={{ fontSize: 32, opacity: 0.3 }} />
              <span className="text-sm">暂无记录</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">共 {applyList.length} 条记录</span>
              </div>
              {applyList?.map(rec => <RecordCard key={rec.id} rec={rec} />)}
            </>
          )}
        </div>
      </Drawer>

      {/* ── School Info Modal ── */}
      <Modal
        open={schoolInfoOpen}
        onCancel={() => setSchoolInfoOpen(false)}
        footer={null}
        width={680}
        styles={{ body: { padding: '0 0 8px 0', maxHeight: '80vh', overflowY: 'auto' } }}
        title={
          <div className="flex items-center gap-2 py-1">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <BankOutlined style={{ color: '#3b82f6', fontSize: 14 }} />
            </div>
            <span className="font-semibold text-gray-800">
              {schoolInfoLoading ? '加载中...' : (schoolInfoData?.deptName as string) || '机构基本信息'}
            </span>
          </div>
        }
        destroyOnClose
      >
        {schoolInfoLoading ? (
          <div className="px-6 py-4">
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
        ) : !schoolInfoData ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
            <BankOutlined style={{ fontSize: 32, opacity: 0.25 }} />
            <span className="text-sm">未找到该机构信息</span>
          </div>
        ) : (
          <div className="px-6 py-2">
            {/* 机构名称 */}
            <SchoolInfoSection icon={<IdcardOutlined />} title="机构名称">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                <BankOutlined style={{ color: '#94a3b8', fontSize: 14 }} />
                <span className="text-sm font-medium text-gray-800">{schoolInfoData.deptName as string || '—'}</span>
              </div>
            </SchoolInfoSection>

            {/* 办学资质 */}
            <SchoolInfoSection icon={<SafetyCertificateOutlined />} title="办学资质">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1.5">统一社会信用代码</div>
                  <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100 text-sm font-mono text-gray-800">
                    {(schoolInfoData.uscc as string) || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1.5">证件有效期</div>
                  <div className="bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100 text-sm text-gray-800">
                    {(schoolInfoData.endDate as string) || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                    <EnvironmentOutlined style={{ fontSize: 11 }} />机构所在地
                  </div>
                  <div className="text-sm text-gray-800 py-1">{(schoolInfoData.address as string) || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                    <LinkOutlined style={{ fontSize: 11 }} />官网网址
                  </div>
                  {schoolInfoData.officialSite ? (
                    <a href={schoolInfoData.officialSite as string} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:text-blue-600 break-all py-1 block">
                      {schoolInfoData.officialSite as string}
                    </a>
                  ) : (
                    <div className="text-sm text-gray-400 py-1">—</div>
                  )}
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                    <UserOutlined style={{ fontSize: 11 }} />机构负责人
                  </div>
                  <div className="text-sm text-gray-800 py-1">{(schoolInfoData.chargeMan as string) || '—'}</div>
                </div>
              </div>
            </SchoolInfoSection>

            {/* 办学类型 & 层次 */}
            <SchoolInfoSection icon={<FileTextOutlined />} title="办学类型 / 层次">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-2">办学类型</div>
                  <div className="flex flex-wrap gap-1.5">
                    {/* {((schoolInfoData.eduOrgType as string) || '').split(',').filter(Boolean).map(t => ( */}
                    <Tag key={schoolInfoData.eduOrgType} color="blue" style={{ margin: 0, borderRadius: 6, fontSize: 12 }}>{schoolInfoData.eduOrgType == '4' ? schoolInfoData.eduOrgTypeOther : getLabel('edu_org_type', schoolInfoData.eduOrgType)}</Tag>
                    {/* // ))} */}
                    {!schoolInfoData.eduOrgType && <span className="text-sm text-gray-400">—</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-2">办学层次</div>
                  <div className="flex flex-wrap gap-1.5">
                    {/* {((schoolInfoData.education_levels as string) || '').split(',').filter(Boolean).map(t => ( */}
                    <Tag key={schoolInfoData.universityStudyLevel} color="cyan" style={{ margin: 0, borderRadius: 6, fontSize: 12 }}>{schoolInfoData.universityStudyLevel == '4' ? schoolInfoData.universityStudyLevelOther : getLabel('project_apply_study_level', schoolInfoData.universityStudyLevel)}</Tag>
                    {/* ))} */}
                    {!schoolInfoData.universityStudyLevel && <span className="text-sm text-gray-400">—</span>}
                  </div>
                </div>
              </div>
            </SchoolInfoSection>

            {/* 主管单位 */}
            <SchoolInfoSection icon={<AuditOutlined />} title="主管单位">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                <div className="flex-1">
                  <span className="text-xs text-gray-400 mr-2">类型</span>
                  <span className="text-sm text-gray-700">{getLabel('charge_dept_type', schoolInfoData.chargeDeptType) || '—'}</span>
                </div>
                {schoolInfoData.chargeDeptName && (
                  <>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex-1">
                      <span className="text-xs text-gray-400 mr-2">名称</span>
                      <span className="text-sm font-medium text-gray-800">{schoolInfoData.chargeDeptName as string}</span>
                    </div>
                  </>
                )}
              </div>
            </SchoolInfoSection>

            {/* 联系方式 */}
            <SchoolInfoSection icon={<PhoneOutlined />} title="联系方式">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '联系电话', value: schoolInfoData.contactPhone as string, icon: <PhoneOutlined /> },
                  { label: '传真号', value: schoolInfoData.fax as string, icon: <PhoneOutlined /> },
                  { label: '电子邮箱', value: schoolInfoData.email as string, icon: <MailOutlined /> },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      {item.icon}{item.label}
                    </div>
                    <div className="text-sm text-gray-800 truncate">{item.value || '—'}</div>
                  </div>
                ))}
              </div>
            </SchoolInfoSection>

            {/* 师生规模 */}
            {/* <SchoolInfoSection icon={<TeamOutlined />} title="师生规模">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '在校学生', value: schoolInfoData.total_students },
                  { label: '国际学生', value: schoolInfoData.international_students },
                  { label: '教职工总数', value: schoolInfoData.total_staff },
                  { label: '专任教师', value: schoolInfoData.full_time_teachers },
                  { label: '双师型教师', value: schoolInfoData.dual_qualified_teachers },
                  { label: '兼职企业教师', value: schoolInfoData.part_time_enterprise_teachers },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100 text-center">
                    <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                    <div className="text-lg font-semibold text-gray-800">{item.value != null ? String(item.value) : '—'}</div>
                  </div>
                ))}
              </div>
            </SchoolInfoSection> */}
          </div>
        )}
      </Modal>

      {/* ── Construction Info Drawer ── */}
      <Drawer
        open={ctmDrawerOpen}
        onClose={() => setCtmDrawerOpen(false)}
        width={820}
        title={null}
        styles={{ body: { padding: 0, background: '#f8fafc', display: 'flex', flexDirection: 'column', height: '100%' } }}
        closable={false}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <FormOutlined style={{ color: '#fff', fontSize: 16 }} />
              </div>
              <div>
                <div className="text-white font-semibold text-base">参与单位信息建设</div>
                <div className="text-white/70 text-xs mt-0.5 flex items-center gap-2">
                  <span>{ctmData?.deptName}</span>
                  <span>·</span>
                  <span>{ctmData?.careerName}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setCtmDrawerOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white text-xl transition-colors leading-none"
            >×</button>
          </div>

          {/* Steps nav */}
          <div className="px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
            <Steps
              current={ctmStep}
              onChange={setCtmStep}
              size="small"
              items={CTM_STEPS.map((s, i) => ({
                title: s.label,
                icon: (
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === ctmStep ? 'bg-blue-500 text-white' : i < ctmStep ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i < ctmStep ? <CheckCircleOutlined /> : i + 1}
                  </span>
                ),
              }))}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
            {ctmLoading ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <Skeleton active paragraph={{ rows: 10 }} />
              </div>
            ) : !ctmData ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-3 text-gray-400">
                <BuildOutlined style={{ fontSize: 36, opacity: 0.25 }} />
                <span className="text-sm">该参与单位暂未填写信息建设内容</span>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                {ctmStep === 0 && <CtmBasicView data={ctmData} unitName={ctmData.deptName} domainName={ctmData.careerName} />}
                {ctmStep === 1 && <CtmTeamView data={ctmData} />}
                {ctmStep === 2 && <CtmCoopView data={ctmData} />}
                {ctmStep === 3 && <CtmIntlView data={ctmData} />}
                {ctmStep === 4 && <CtmPlanView data={ctmData} />}
                {ctmStep === 5 && <CtmOpinionView data={ctmData} />}
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between flex-shrink-0">
            <Space>
              {ctmStep > 0 && <Button onClick={() => setCtmStep(s => s - 1)} style={{ borderRadius: 8 }}>上一步</Button>}
              {ctmStep < CTM_STEPS.length - 1 && <Button onClick={() => setCtmStep(s => s + 1)} style={{ borderRadius: 8 }}>下一步</Button>}
            </Space>
            <Button onClick={() => setCtmDrawerOpen(false)} style={{ borderRadius: 8 }}>关闭</Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

/* ── helpers ── */
const SchoolInfoSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="w-0.5 h-4 rounded-full bg-blue-500" />
      <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
        <span className="text-blue-400">{icon}</span>{title}
      </span>
    </div>
    {children}
  </div>
);

/* ── Construction info read-only views ── */

const CtmSectionTitle: React.FC<{ num: string; title: string; sub?: string }> = ({ num, title, sub }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">{num}</div>
    <div>
      <div className="font-semibold text-gray-800 text-base">{title}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

const CtmInfoChip: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex flex-col gap-0.5">
    <span className="text-xs text-blue-400 flex items-center gap-1">{icon}{label}</span>
    <span className="text-sm font-medium text-blue-700 truncate">{value || '—'}</span>
  </div>
);

const CtmField: React.FC<{ label: string; value: string | undefined; className?: string }> = ({ label, value, className = '' }) => (
  <div className={className}>
    <div className="text-xs font-medium text-gray-400 mb-1">{label}</div>
    <div className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 min-h-[34px]">{value || '—'}</div>
  </div>
);

const CtmBasicView: React.FC<{ data: any; unitName: string; domainName: string }> = ({ data, unitName, domainName }) => (
  <div className="space-y-6">
    <CtmSectionTitle num="一" title="基本信息" sub="参与单位基础资料及联系方式" />
    <div className="grid grid-cols-2 gap-3">
      <CtmInfoChip label="参与单位" value={unitName} icon={<TeamOutlined />} />
      <CtmInfoChip label="拟参与建设的职业领域" value={domainName} icon={<GlobalOutlined />} />
      <CtmInfoChip label="职业领域所属行业子类" value={data.industryName} icon={<BankOutlined />} />
      <CtmInfoChip label="职业领域编码" value={data.careerCode} icon={<FileTextOutlined />} />
    </div>
    <div className="bg-gray-50 rounded-xl p-4">
      <CtmField label="优势专业" value={data.advantageMajor} />
    </div>
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full" />
        <span className="text-sm font-semibold text-gray-700">参与建设团队联系人</span>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
        <CtmField label="姓名" value={data.contactMan} />
        <CtmField label="职务" value={data.position} />
        <CtmField label="联系电话" value={data.contactPhone} />
        <CtmField label="电子邮箱" value={data.email} />
      </div>
    </div>
  </div>
);

const CtmTeamView: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-6">
    <CtmSectionTitle num="二" title="职业领域参与建设团队信息" sub="团队负责人详细信息及其他成员名单" />
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full" />
        <span className="text-sm font-semibold text-gray-700">团队负责人</span>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <CtmField label="姓名" value={data.chargeMan} />
          <CtmField label="性别" value={data.sex ? (data.sex == '1' ? '男' : '女') : '-'} />
          <CtmField label="民族" value={data.nation} />
          <CtmField label="出生日期" value={data.birthday ? dayjs(data.birthday).format('YYYY-MM-DD') : '-'} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <CtmField label="行政职务" value={data.administrationPosition} />
          <CtmField label="专业技术职务" value={data.technicalPosition} />
          <CtmField label="政治面貌" value={data.politicalStatus} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <CtmField label="最后学历" value={data.finalEducation} />
          <CtmField label="最后学位" value={data.finalDegree} />
          <CtmField label="企业工作经历（年）" value={data.workYear} />
        </div>
        <CtmField label="研究专长" value={data.researchExpertise} />
        <div className="grid grid-cols-2 gap-4">
          <CtmField label="通讯地址" value={data.address} />
          <CtmField label="邮政编码" value={data.zipcode} />
          <CtmField label="联系电话" value={data.chargeManPhone} />
          <CtmField label="微信号" value={data.wechatId} />
        </div>
      </div>
    </div>
    {/* {data.team_members.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full" />
          <span className="text-sm font-semibold text-gray-700">团队其他成员</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{data.team_members.length} 人</span>
        </div>
        <div className="space-y-3">
          {data.team_members.map((m, i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="text-xs font-medium text-gray-400 mb-3">成员 {i + 1}</div>
              <div className="grid grid-cols-4 gap-3">
                <CtmField label="姓名" value={m.name} />
                <CtmField label="性别" value={m.gender} />
                <CtmField label="出生年月" value={m.birth_month} />
                <CtmField label="职称" value={m.title} />
                <CtmField label="学位" value={m.degree} />
                <CtmField label="工作单位" value={m.work_unit} className="col-span-2" />
                <CtmField label="联系电话" value={m.phone} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )} */}
  </div>
);

const CtmCoopView: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-6">
    <CtmSectionTitle num="三" title="在该职业领域的校企合作基础" sub="本单位与企业的合作情况" />
    {data.joinDeptBuildCompanyList?.length === 0 ? (
      <div className="flex flex-col items-center py-10 text-gray-300 gap-2">
        <BankOutlined style={{ fontSize: 28 }} />
        <span className="text-sm text-gray-400">暂无校企合作记录</span>
      </div>
    ) : (
      <div className="space-y-3">
        {data.joinDeptBuildCompanyList.map((row: any, i: number) => (
          <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <span className="text-xs font-medium text-gray-500">合作记录</span>
            </div>
            <div className="flex gap-4">
              <div style={{ width: '30%', flexShrink: 0 }}>
                <CtmField label="主要合作企业" value={row.company} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-xs font-medium text-gray-400 mb-1">合作内容</div>
                <div className="text-sm text-gray-800 bg-white rounded-lg px-3 py-2 border border-gray-100 whitespace-pre-wrap">{row.cooperateContent || '—'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const CtmIntlView: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-6">
    <CtmSectionTitle num="四" title="在该职业领域的国际化基础" sub="本单位在该领域的国际合作情况" />
    {data.joinDeptBuildCountryList?.length === 0 ? (
      <div className="flex flex-col items-center py-10 text-gray-300 gap-2">
        <GlobalOutlined style={{ fontSize: 28 }} />
        <span className="text-sm text-gray-400">暂无国际合作记录</span>
      </div>
    ) : (
      <div className="space-y-3">
        {data.joinDeptBuildCountryList?.map((row: any, i: number) => (
          <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <span className="text-xs font-medium text-gray-500">国际合作记录</span>
            </div>
            <div className="flex gap-4">
              <div style={{ width: '30%', flexShrink: 0 }}>
                <CtmField label="合作国家 / 地区" value={row.country} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="text-xs font-medium text-gray-400 mb-1">合作内容</div>
                <div className="text-sm text-gray-800 bg-white rounded-lg px-3 py-2 border border-gray-100 whitespace-pre-wrap">{row.cooperateContent || '—'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const CtmPlanView: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-6">
    <CtmSectionTitle num="五" title="职业领域建设工作计划和建议" sub="参与建设的整体计划和工作建议" />
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[160px]">{data.plan || '（未填写）'}</div>
    </div>
  </div>
);

const CtmOpinionView: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-6">
    <CtmSectionTitle num="六" title="单位意见" sub="本单位对参与职业领域建设的正式意见" />
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[120px]">{data.opinion || '（未填写）'}</div>
    </div>
    {/* <div className="bg-white border border-gray-100 rounded-xl px-6 py-5 shadow-sm flex justify-end">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">签章日期</span>
        <div className="text-sm font-medium text-gray-800">{data.sign_date || '—'}</div>
        <div className="w-24 h-12 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-300 ml-2">盖章处</div>
      </div>
    </div> */}
  </div>
);

export default LeadingUnit;
