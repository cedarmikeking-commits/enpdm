export interface StandardDocument {
  id?: number;
  careerStandardFileName?: string;
  careerStandardFileNo?: string;
  standardVersion?: string;
  careerId?: number;
  careerName?: string;
  careerCode?: string;
  careerStandardMapId?: number;
  careerStandardMapName?: string;
  preface?: string;
  corePurpose?: string;
  scope?: string;
  overview?: string;
  appendixAttach?: string;
  careerStandardTermList?: any[];
  auditDetails?: any[];
  reviseDetails?: any[];
  searchStatus?: number;
  searchStatusTitle?: string;
  currentAuditStage?: number;
  nextAuditStage?: number;
  auditStatus?: number;
  auditReason?: string;
  auditLog?: string;
  auditDate?: string;
  auditUserId?: number;
  auditUserName?: string;
  reviseStatus?: number;
  reviseId?: number;
  reviseRemark?: string;
  reviseSource?: string;
  filingCode?: string;
  filingDate?: string;
  publishDate?: string;
  isCurrent?: number;
  createUser?: number;
  createUserName?: string;
  createDept?: number;
  createTime?: string;
  updateUser?: number;
  updateTime?: string;
  status?: number;
  isDeleted?: number;
  tenantId?: string;
  remark?: string;
}

export interface ExpertReview {
  id?: number;
  careerStandardId?: number;
  auditStage?: number;
  auditType?: number;
  auditTypeName?: string;
  auditUserId?: number;
  auditUserName?: string;
  auditOrganization?: string;
  auditDate?: string;
  auditComments?: string;
  auditStatus?: number;
  auditStatusName?: string;
  suggestions?: any[];
  scientificScore?: number;
  forwardLookingScore?: number;
  completenessScore?: number;
  operabilityScore?: number;
  comprehensiveScore?: number;
  status?: number;
  createTime?: string;
}

export interface MappingRow {
  id?: number;
  careerStandardMapId?: number;
  firstDimension?: string;
  firstDimensionCode?: string;
  secondDimension?: string;
  secondDimensionCode?: string;
  thirdDimension?: string;
  thirdDimensionCode?: string;
  conceptDefinition?: string;
  ivrl1Description?: string;
  ivrl2Description?: string;
  ivrl3Description?: string;
  ivrl4Description?: string;
  sortOrder?: number;
}

export interface InternalReview {
  id?: number;
  careerStandardId?: number;
  auditStage?: number;
  auditType?: number;
  auditTypeName?: string;
  auditUserId?: number;
  auditUserName?: string;
  auditDate?: string;
  scientificScore?: number;
  forwardLookingScore?: number;
  completenessScore?: number;
  operabilityScore?: number;
  overallScore?: number;
  auditComments?: string;
  auditStatus?: number;
  status?: number;
  createTime?: string;
}

export interface StandardRevision {
  id?: number;
  careerStandardId?: number;
  careerStandardFileName?: string;
  careerStandardFileNo?: string;
  standardVersion?: string;
  careerId?: number;
  careerName?: string;
  careerCode?: string;
  revisionContent?: any;
  revisionDescription?: string;
  revisedBy?: string;
  auditStatus?: number;
  createTime?: string;
  updateTime?: string;
  standard_documents?: StandardDocument;
}

export interface Statistics {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export type ViewMode = 'list' | 'view' | 'deliberate';
export type DeliberationDecision = 'approved' | 'rejected' | null;
