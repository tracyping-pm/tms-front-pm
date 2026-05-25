import { IRefundDetail } from '@/api/types/claims';
import { RefundTicketStatusEnum } from '@/constants';

export const showEditTicketInfo = (detail: IRefundDetail) => {
  const allowStatusList = [RefundTicketStatusEnum.ONGOING_VALIDATION];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showOCStatus = (detail: IRefundDetail) => {
  const allowStatusList = [RefundTicketStatusEnum.ONGOING_VALIDATION];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showAddRemark = (detail: IRefundDetail) => {
  const allowStatusList = [
    RefundTicketStatusEnum.ONGOING_VALIDATION,
    RefundTicketStatusEnum.CLAIM_TEAM_REVIEW,
    RefundTicketStatusEnum.FOR_REFUNDING,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showAddProof = (detail: IRefundDetail) => {
  const allowStatusList = [
    RefundTicketStatusEnum.ONGOING_VALIDATION,
    RefundTicketStatusEnum.CLAIM_TEAM_REVIEW,
    RefundTicketStatusEnum.FOR_REFUNDING,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showCancelTicket = (detail: IRefundDetail) => {
  const allowStatusList = [RefundTicketStatusEnum.ONGOING_VALIDATION];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showConfirm = (detail: IRefundDetail) => {
  const allowStatusList = [
    // RefundTicketStatusEnum.ONGOING_VALIDATION,
    RefundTicketStatusEnum.CLAIM_TEAM_REVIEW,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};
export const showOCConfirm = (detail: IRefundDetail) => {
  const allowStatusList = [RefundTicketStatusEnum.ONGOING_VALIDATION];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showOngoingValidation = (detail: IRefundDetail) => {
  const allowStatusList = [RefundTicketStatusEnum.CLAIM_TEAM_REVIEW];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showCompleted = (detail: IRefundDetail) => {
  const allowStatusList = [RefundTicketStatusEnum.FOR_REFUNDING];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const linkedArOrAp = (detail: IRefundDetail) => {
  return !!detail.arStatementId || !!detail.apStatementId;
};
