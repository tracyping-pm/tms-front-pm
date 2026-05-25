import {
  BUEnum,
  CurrentRequirementEnum,
  DistanceEnum,
  FollowUpCheckEnum,
  OpportunitiesStatusEnum,
  PotentialRequirementEnum,
  PotentialVolumeFrequencyEnum,
  RequirementFrequencyEnum,
  RequirementTypeEnum,
  VisitTypeEnum,
} from '@/enums';
import { ICommonMaterial } from './common';

export interface IFollowUpListReq {
  pageNum: number;
  pageSize: number;
  id: number;
}

export interface IFollowUpListRecord {
  followUpId: number;
  followUpUserId: number;
  followUpUser: string;
  followUpTime: string;
  opportunityStatus: OpportunitiesStatusEnum;
  remarkOrReason: string;
  visitType: VisitTypeEnum;
  visitObjective: string;
  visitContent: string;
  actionPlan: string;
  materials: ICommonMaterial[];
}

export interface IFollowUpListVisitRecordReq {
  opportunityId: number;
  opportunityStatus: OpportunitiesStatusEnum;
}

export interface IFollowUpListVisitRecord {
  followUpId: number;
  followUpTime: string;
  visitType: VisitTypeEnum;
  visitObjective: string;
  visitContent: string;
  actionPlan: string;
  materials: ICommonMaterial[];
}

export interface IFollowUpListVisitRecordTimeLineItem {
  opportunityStatus: OpportunitiesStatusEnum;
  latestFollowUpDate: string;
  visitRecordCount: number;
  followUpCheck: FollowUpCheckEnum;
}

export interface IFollowUpAddReq {
  opportunityId: number;
  opportunityStatus: OpportunitiesStatusEnum;
  remarkOrReason: string;
  visitType: VisitTypeEnum;
  visitObjective: string;
  visitContent: string;
  actionPlan: string;
  materialIds: number[];
  customerId: number;
  leadId: number;
  projectName: string;
  bu: BUEnum;
  bdUserRoleId: number;
  pricingUserRoleId: number;
  vdUserRoleId: number;
  requirementType: RequirementTypeEnum;
  currentRequirementList: CurrentRequirementEnum[];
  potentialRequirementList: PotentialRequirementEnum[];
  requirementFrequency: RequirementFrequencyEnum;
  potentialVolumeQuantity: number;
  potentialVolumeFrequency: PotentialVolumeFrequencyEnum;
  distance: DistanceEnum;
  quotationRequestReceivedDate: string;
  quotationSubmittedDate: string;
  rfqBiddingDeadlineDate: string;
  latestFollowUpTime: string;
  serviceTruckTypeIds: number[];
  createNewProject: boolean;
  projectId?: number;
  opportunityContent?: string;
  contractNumber: string;
  contractStartDate: string;
  contractEndDate: string;
  fuelBasis?: number;
  contractBasedOnFuel?: boolean;
  fuelChangeFrequency?: string;
  contractMaterialIdList: number[];
}
