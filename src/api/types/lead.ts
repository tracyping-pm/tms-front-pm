import {
  BUEnum,
  CustomerPriorityEnum,
  LeadStatusEnum,
  PicTypeEnum,
  ReachOutChannelEnum,
} from '@/enums';
import { ICommonMaterial } from './common';

export interface ILeadFunnelPerson {
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

export interface ILeadListParams {
  pageNum?: number;
  pageSize?: number;
  customerName?: string;
  customerTag?: string;
  industrySecondIdList?: number[];
  leadStatusList?: LeadStatusEnum[];
  priorityList?: CustomerPriorityEnum[];
  buList?: BUEnum[];
  bdUserRoleIdList?: number[];
  creationTimeStart?: string;
  creationTimeEnd?: string;
}

export interface ILeadListItem {
  id: number;
  leadStatus: LeadStatusEnum;
  customerName: string;
  customerTag: string;
  industryName: string;
  priority: CustomerPriorityEnum;
  bu: BUEnum;
  picType: PicTypeEnum;
  picUserRoleId: number;
  picUserAliasName: string;
  createdAt: string;
}

export interface IContactListItem {
  name: string;
  position?: string;
  email: string;
  phoneCodeId: number;
  phoneCode: string;
  phoneNumber: string;
}

export interface ICreateEditLeadParams {
  id?: number;
  customerName: string;
  customerTag: string;
  industryFirstId: number;
  industrySecondId: number;
  pad: number;
  sad: number;
  tad: number;
  address: string;
  lat: number;
  lng: number;
  priority: string;
  reachOutChannel: string;
  website: string;
  bu: string;
  picUserRoleId: number;
  logoMaterialId: number;
  contactList: IContactListItem;
}

export interface ILeadTransferParams {
  picUserRoleId: number;
  picType: PicTypeEnum;
  leadIds: number[];
}

export interface ILeadDetail {
  id: number;
  leadStatus: LeadStatusEnum;
  customerName: string;
  customerTag: string;
  industryFirstId: number;
  industryFirstName: string;
  industrySecondId: number;
  industrySecondName: string;
  pad: number;
  padName: string;
  sad: number;
  sadName: string;
  tad: number;
  tadName: string;
  address: string;
  lat: number;
  lng: number;
  industryName: string;
  priority: CustomerPriorityEnum;
  reachOutChannel: ReachOutChannelEnum;
  website: string;
  bu: BUEnum;
  picUserRoleId: number;
  picType: PicTypeEnum;
  picUserAliasName: string;
  logoMaterialId: number;
  logo: ICommonMaterial;
  customerId: number;
  createdAt: string;
  contactList: IContactListItem[];
  industryIdList: number[];
}
