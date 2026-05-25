import {
  BUEnum,
  CurrentRequirementEnum,
  CustomerStatusEnum,
  FollowUpCheckEnum,
  LeadStatusEnum,
  OpportunitiesCustomerTypeEnum,
  OpportunitiesStatusEnum,
  PotentialRequirementEnum,
  PotentialVolumeFrequencyEnum,
  RequirementFrequencyEnum,
  RequirementTypeEnum,
} from '@/enums';

export interface IOpportunityUserSelectorRecord {
  id: number;
  userId: number;
  userAliasName: string;
  roleId: number;
  roleName: string;
  departmentId: number;
  departmentName: string;
}
export interface IOpportunityFunnelPerson {
  userRoleId: number;
  userId: number;
  userName: string;
  aliasName: string;
  email: string;
  slackMemberId: number;
  colorId: number;
  roleId: number;
  roleName: string;
  departmentId: number;
  departmentName: string;
  buType: string;
  regionId: number;
  regionName: string;
  deleted: boolean;
}
export interface IOpportunityRecord {
  id?: number;
  customerId?: number;
  leadId?: number;
  bu: BUEnum;
  bdUserRoleId: number;
  pricingUserRoleId: number;
  vdUserRoleId: number;
  requirementType: string;
  currentRequirementList: CurrentRequirementEnum[];
  potentialRequirementList: PotentialRequirementEnum[];
  requirementFrequency: RequirementFrequencyEnum;
  potentialVolumeQuantity: number;
  potentialVolumeFrequency: PotentialVolumeFrequencyEnum;
  distance: string;
  quotationRequestReceivedDate: string;
  quotationSubmittedDate: string;
  rfqBiddingDeadlineDate: string;
  latestFollowUpTime: string;
  truckTypeIds: number[];
}
export interface ICustomerLeadSelectorRecord {
  id: number;
  bu: string;
  isCustomer: boolean;
  name: string;
  leadStatus: string;
  customerStatus: string;
}
export interface IOpportunityListPayload {
  opportunityId?: number;
  followUpCheck?: FollowUpCheckEnum;
  followUpDurationStart?: number;
  followUpDurationEnd?: number;
  buList?: BUEnum[];
  picUserRoleIdList?: number[];
  opportunityStatus?: OpportunitiesStatusEnum[];
  customerOrLeadId?: number;
  isCustomer?: boolean;
  customerType?: OpportunitiesCustomerTypeEnum;
  customerStatus?: CustomerStatusEnum[];
  leadStatus?: LeadStatusEnum[];
  latestFollowUpTimeStart?: string;
  latestFollowUpTimeEnd?: string;
  successfulClosedTimeStart?: string;
  successfulClosedTimeEnd?: string;
  createTimeStart?: string;
  createTimeEnd?: string;
  potentialVolumeQuantityStart?: number;
  potentialVolumeQuantityEnd?: number;
  pageNum?: number;
  pageSize?: number;
}
export interface IOpportunityListItem {
  opportunityId: number;
  followUpCheck: FollowUpCheckEnum;
  followUpDuration: number;
  bu: BUEnum;
  projectName: string;
  opportunityStatus: OpportunitiesStatusEnum;
  customerType: OpportunitiesCustomerTypeEnum;
  customerName: string;
  customerStatus: CustomerStatusEnum;
  leadStatus: LeadStatusEnum;
  latestFollowUpTime: string;
  bdUserRoleId: number;
  bdUserAliasName: string;
  potentialVolumeQuantityPerMonth: number;
  followUpRemark: string;
  createdAt: string;
}
export interface IOpportunityInCustomerPayload {
  customerId?: number;
  leadId?: number;
  pageNum?: number;
  pageSize?: number;
}
export interface IOpportunityInCustomerItem {
  opportunityId: number;
  bu: BUEnum;
  projectName: string;
  opportunityStatus: OpportunitiesStatusEnum;
  bdUserRoleId: number;
  bdUserAliasName: string;
  potentialVolumeQuantityPerMonth: number;
  createdAt: string;
}

export interface IOpportunityDetailRecordItem {
  opportunityStatus: OpportunitiesStatusEnum;
  latestFollowUpDate: string;
  visitRecordCount: number;
  followUpCheck: string;
}

export interface IOpportunityDetailRecord {
  cancelled: boolean;
  projectId: number;
  successfulClosed: boolean;
  timeLineVos: IOpportunityDetailRecordItem[];
}

export interface IOpportunityDetailData {
  isCustomer: boolean;
  customerName: string;
  customerId: number;
  leadId: number;
  opportunityId: number;
  projectName: string;
  opportunityStatus: OpportunitiesStatusEnum;
  bu: BUEnum;
  requirementType: RequirementTypeEnum;
  currentRequirementList: CurrentRequirementEnum[];
  potentialRequirementList: PotentialRequirementEnum[];
  serviceTruckTypeNames: string;
  serviceTruckTypeIds: number[];
  requirementFrequency: RequirementFrequencyEnum;
  distance: string;
  potentialVolumeQuantity: number;
  potentialVolumeFrequency: PotentialVolumeFrequencyEnum;
  quotationRequestReceivedDate: string;
  quotationSubmittedDate: string;
  rfqBiddingDeadlineDate: string;
  bdPic: string;
  bdUserRoleId: number;
  pricingPic: string;
  pricingUserRoleId: number;
  vdPic: string;
  vdUserRoleId: number;
  picType: string;
  picUserAliasName: number;
  picUserRoleId: number;
  opportunityContentList: string[];
}

export interface IOpportunityDetailCustomerItem {
  id: number;
  name: string;
  position: string;
  email: string;
  phoneCodeId: number;
  phoneCode: string;
  phoneNumber: string;
}

export interface IOpportunityDetailCustomerData {
  customerId: number;
  leadId: number;
  customerName: string;
  customerStatus: LeadStatusEnum;
  customerTag: string;
  leadStatus: LeadStatusEnum;
  industryName: string;
  address: string;
  reachOutChannel: string;
  customerType: OpportunitiesCustomerTypeEnum;
  priority: string;
  website: string;
  logo: {
    fileMaterialId: number;
    fileDriveId: string;
    fileName: string;
    fileType: string;
    fileMimeType: string;
    fileThumbnailUrl: string;
  };
  logoMaterialId: number;
  contactList: IOpportunityDetailCustomerItem[];
  isCustomer: boolean;
}
