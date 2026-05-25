import { IClaimDetail } from '@/api/types/claims';
import { StatementClaimTicketStatusEnum } from '@/constants';

export const showEditTicketInfo = (detail: IClaimDetail) => {
  const allowStatusList = [StatementClaimTicketStatusEnum.ONGOING_VALIDATION];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showAddProof = (detail: IClaimDetail) => {
  const allowStatusList = [
    StatementClaimTicketStatusEnum.ONGOING_VALIDATION,
    StatementClaimTicketStatusEnum.CLAIM_TEAM_REVIEW,
    StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM,
    StatementClaimTicketStatusEnum.VENDOR_DISPUTED,
    StatementClaimTicketStatusEnum.FOR_DEDUCTION,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showAddRemark = (detail: IClaimDetail) => {
  const allowStatusList = [
    StatementClaimTicketStatusEnum.ONGOING_VALIDATION,
    StatementClaimTicketStatusEnum.CLAIM_TEAM_REVIEW,
    StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM,
    StatementClaimTicketStatusEnum.VENDOR_DISPUTED,
    StatementClaimTicketStatusEnum.FOR_DEDUCTION,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showOCStatus = (detail: IClaimDetail) => {
  const allowStatusList = [StatementClaimTicketStatusEnum.ONGOING_VALIDATION];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showCreateRefund = (detail: IClaimDetail) => {
  const allowStatusList = [
    StatementClaimTicketStatusEnum.ONGOING_VALIDATION,
    StatementClaimTicketStatusEnum.CLAIM_TEAM_REVIEW,
    StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM,
    StatementClaimTicketStatusEnum.VENDOR_DISPUTED,
    StatementClaimTicketStatusEnum.FOR_DEDUCTION,
    StatementClaimTicketStatusEnum.CLOSED,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showCancelTicket = (detail: IClaimDetail) => {
  const allowStatusList = [
    StatementClaimTicketStatusEnum.ONGOING_VALIDATION,
    StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM,
    StatementClaimTicketStatusEnum.VENDOR_DISPUTED,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const linkedClaimRequest = (detail: IClaimDetail) => {
  return !!detail.claimRequestId;
};

export const linkedArOrAp = (detail: IClaimDetail) => {
  return !!detail.arStatementId || !!detail.apStatementId;
};

export const showConfirm = (detail: IClaimDetail) => {
  const allowStatusList = [
    // StatementClaimTicketStatusEnum.ONGOING_VALIDATION,
    StatementClaimTicketStatusEnum.CLAIM_TEAM_REVIEW,
    StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM,
    StatementClaimTicketStatusEnum.VENDOR_DISPUTED,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showOCConfirm = (detail: IClaimDetail) => {
  const allowStatusList = [StatementClaimTicketStatusEnum.ONGOING_VALIDATION];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showOngoingValidation = (detail: IClaimDetail) => {
  const allowStatusList = [
    StatementClaimTicketStatusEnum.CLAIM_TEAM_REVIEW,
    StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM,
    StatementClaimTicketStatusEnum.VENDOR_DISPUTED,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showVendorDisputed = (detail: IClaimDetail) => {
  const allowStatusList = [
    StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showCompleted = (detail: IClaimDetail) => {
  const allowStatusList = [StatementClaimTicketStatusEnum.FOR_DEDUCTION];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};

export const showExportDM = (detail: IClaimDetail) => {
  const allowStatusList = [
    StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM,
    StatementClaimTicketStatusEnum.VENDOR_DISPUTED,
    StatementClaimTicketStatusEnum.FOR_DEDUCTION,
    StatementClaimTicketStatusEnum.CLOSED,
  ];

  if (allowStatusList.includes(detail.ticketStatus)) {
    return true;
  }
  return false;
};
