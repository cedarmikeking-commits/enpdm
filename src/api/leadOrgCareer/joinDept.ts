import { http } from "../http"

/** 参与单位建设-分页查领域 */
export const getList = (params: any): Promise<any> => {
  return http.get('/blade-system/lyjs/joinDeptBuild/getList', params);
}

/** 参与单位建设-申请参与 */
export const joinApply = (params: {careerId:any,leadOrgId:any}): Promise<any> => {
  return http.postParams('/blade-system/lyjs/joinDeptBuild/joinApply', params);
}

/** 参与单位建设-进入参与单位建设 */
export const entryJoinDeptBuild = (params: {careerId:any,leadOrgId:any}): Promise<any> => {
  return http.get('/blade-system/lyjs/joinDeptBuild/entryJoinDeptBuild', params);
}

/** 参与单位建设-新增或更新 */
export const saveOrUpdate = (params: any): Promise<any> => {
  return http.post('/blade-system/lyjs/joinDeptBuild/saveOrUpdate', params);
}

/** 参与单位建设-提交 */
export const submit = (params: any): Promise<any> => {
  return http.post('/blade-system/lyjs/joinDeptBuild/submit', params);
}
