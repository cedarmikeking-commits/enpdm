import { http } from "../http"

// 领域建设-牵头单位----------------------------------------
/** 查子行业数据 */
export const getTwoIndustryList = (): Promise<any> => {
  return http.get('/blade-system/hyly/industry/getTwoIndustryList');
}
/** 根据子行业获取领域代码 */
// export const getCareerCodeByTwoIndustry= (params: {industryId:string}): Promise<any> => {
//   return http.get('/blade-system/hyly/career/getCareerCodeByTwoIndustry',params);
// }
export const getNextCareerCode= (params: {industryId:string}): Promise<any> => {
  return http.get('/blade-system/lyjs/leadOrgApply/getNextCareerCode',params);
}
/** 查草稿 */
export const getLeadOrgApplyDraft = (params:{applyId:string}): Promise<any> => {
  return http.get('/blade-system/lyjs/leadOrgApply/getDraftApply',params);
}
/**检查重复 */
export const checkRepeat = (params:{careerCode:string,careerName:string,applyId:string}): Promise<any> => {
    return http.get('/blade-system/lyjs/leadOrgApply/checkRepeat',params);
}
/**保存 */
export const saveOrUpdate = (params: any): Promise<any> => {
    return http.post('/blade-system/lyjs/leadOrgApply/saveOrUpdate', params);
}
/**提交 */
export const submit = (params: any): Promise<any> => {
    return http.post('/blade-system/lyjs/leadOrgApply/submit', params);
}
/** 根据Id提交 */
export const submitByApplyId = (params: {applyId:string}): Promise<any> => {
    return http.postParams('/blade-system/lyjs/leadOrgApply/submitByApplyId', params);
}
/** 查询领域表和申请表所有数据列表 */
export const getApplyList = (params: any): Promise<any> => {
    return http.get('/blade-system/lyjs/leadOrgApply/getList', params);
}
/** 根据领域id查询参与机构 */
export const getJoinDeptList = (params: {careerId:string}): Promise<any> => {
    return http.get('/blade-system/lyjs/leadOrgApply/getJoinDeptList', params);
}
/** 审核参与机构申请 */
export const auditJoinDeptApply = (params: {joinOrgApplyId:any,status:number,auditReason?:string}): Promise<any> => {
    return http.postParams('/blade-system/lyjs/leadOrgApply/auditJoinDeptApply', params);
}
/** 获取参与机构信息基本信息 */
export const getJoinOrgInfo = (params: {deptId:string}): Promise<any> => {
    return http.get('/blade-system/lyjs/leadOrgApply/joinOrgInfo', params);
}
/** 获取参与机构建设信息 */
export const getJoinOrgBuildInfo = (params: {careerId:string,deptId:string}): Promise<any> => {
    return http.get('/blade-system/lyjs/leadOrgApply/getJoinOrgBuildInfo', params);
}
/** 获取审核统计信息 */
export const getAuditStatistics = (): Promise<any> => {
    return http.get('/blade-system/lyjs/leadOrgApply/getAuditStatistics');
}
/** 建设内容审核查询列表 */
export const getApplyPage =(params: any): Promise<any> => {
    return http.get('/blade-system/lyjs/leadOrgApply/getApplyPage', params);
}
/**审核页根据领域id和牵头机构查询参与机构 */
export const getJoinDeptListByAudit = (params: {careerId:string,leadOrgId:string}): Promise<any> => {
    return http.get('/blade-system/lyjs/leadOrgApply/getJoinDeptListByAudit', params);
}
/** 查询详情 */
export const getApplyDetail = (params: {applyId:string}): Promise<any> => {
    return http.get('/blade-system/lyjs/leadOrgApply/getApplyDetail', params);
}
/** 审核牵头机构的领域申请 */
export const auditApply = (params: {applyId:string,status:any,auditReason?:string}): Promise<any> => {
    return http.postParams('/blade-system/lyjs/leadOrgApply/auditApply', params);
}
