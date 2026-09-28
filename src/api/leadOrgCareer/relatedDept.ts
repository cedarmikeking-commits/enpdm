import { http } from "../http"

/**查询领域列表 */
export const getCareerList = (): Promise<any> => {
  return http.get('/blade-system/hyly/career/getCareerList');
}

/**查领域相关机构 */
export const getRelatedDeptByCareerId = (params: {careerId:string}): Promise<any> => {
  return http.get('/blade-system/lyjs/leadOrgApply/getRelatedDeptByCareerId', params);
}
