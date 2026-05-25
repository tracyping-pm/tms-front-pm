import {
  RefundTicketStatusEnum,
  StatementClaimTicketStatusEnum,
} from '@/constants';

export enum EnumInternalClaimsType {
  GPS = 'GPS',
  DDC_Training_Fee = 'DDC Training Fee',
  Crew_Uniform_Charges = 'Crew Uniform Charges',
  Inteluck_Insurance = 'Inteluck Insurance',
  Coupon_Fees = 'Coupon Fees',
  Stuffing_Fee_CDC = 'Stuffing Fee - CDC',
  Equipment_Fee = 'Equipment Fee',
  Medical_Fee = 'Medical Fee',
}

export enum EnumExternalClaimsType {
  Delivery_Claims = 'Delivery Claims',
  KPI_Claims = 'KPI Claims',
  Theft_Incident = 'Theft Incident',
  Others = 'Others',
}
export const ExternalClaimsEnumText = {
  [EnumExternalClaimsType.Delivery_Claims]: 'Delivery Claims',
  [EnumExternalClaimsType.KPI_Claims]: 'KPI Claims',
  [EnumExternalClaimsType.Theft_Incident]: 'Theft Incident',
  [EnumExternalClaimsType.Others]: 'Others',
};

export enum EnumClaimOcStatus {
  Not_Chargeable = 'Not Chargeable',
  Inteluck_Expense = 'Inteluck Expense',
  Ongoing_Validation = 'Ongoing Validation',
  Proceed_to_Deduct = 'Proceed to Deduct',
}

export const ocStatusOptions = [
  {
    label: EnumClaimOcStatus.Not_Chargeable,
    value: EnumClaimOcStatus.Not_Chargeable,
  },
  {
    label: EnumClaimOcStatus.Inteluck_Expense,
    value: EnumClaimOcStatus.Inteluck_Expense,
  },
  {
    label: EnumClaimOcStatus.Ongoing_Validation,
    value: EnumClaimOcStatus.Ongoing_Validation,
  },
  {
    label: EnumClaimOcStatus.Proceed_to_Deduct,
    value: EnumClaimOcStatus.Proceed_to_Deduct,
  },
];

export const ocStatusRefundOptions = [
  {
    label: EnumClaimOcStatus.Ongoing_Validation,
    value: EnumClaimOcStatus.Ongoing_Validation,
  },
  {
    label: EnumClaimOcStatus.Proceed_to_Deduct,
    value: EnumClaimOcStatus.Proceed_to_Deduct,
  },
];

export const OCStatusEnumTextColor = {
  [EnumClaimOcStatus.Not_Chargeable]: '#009688',
  [EnumClaimOcStatus.Inteluck_Expense]: '#009688',
  [EnumClaimOcStatus.Ongoing_Validation]: '#009688',
  [EnumClaimOcStatus.Proceed_to_Deduct]: '#009688',
};

export enum EnumSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL',
  XXXXL = 'XXXXL',
}

export const sizeOptions = [
  {
    label: EnumSize.XS,
    value: EnumSize.XS,
  },
  {
    label: EnumSize.S,
    value: EnumSize.S,
  },
  {
    label: EnumSize.M,
    value: EnumSize.M,
  },
  {
    label: EnumSize.L,
    value: EnumSize.L,
  },
  {
    label: EnumSize.XL,
    value: EnumSize.XL,
  },
  {
    label: EnumSize.XXL,
    value: EnumSize.XXL,
  },
  {
    label: EnumSize.XXXL,
    value: EnumSize.XXXL,
  },
  {
    label: EnumSize.XXXXL,
    value: EnumSize.XXXXL,
  },
];

export enum EnumClaimTicketType {
  CLAIM = 'CLAIM',
  REFUND = 'REFUND',
  REQUEST = 'REQUEST ',
}

export const ClaimTicketTypeText = {
  [EnumClaimTicketType.CLAIM]: 'Claim Ticket',
  [EnumClaimTicketType.REFUND]: 'Refund Ticket',
  [EnumClaimTicketType.REQUEST]: 'Request Ticket',
};

export enum EnumPosition {
  Driver = 'Driver',
  Helper = 'Helper',
}

export const positionOptions = [
  {
    label: EnumPosition.Driver,
    value: EnumPosition.Driver,
  },
  {
    label: EnumPosition.Helper,
    value: EnumPosition.Helper,
  },
];

export const ClaimTicketStatusEnumText = {
  [StatementClaimTicketStatusEnum.ONGOING_VALIDATION]: 'Ongoing Validation',
  [StatementClaimTicketStatusEnum.CLAIM_TEAM_REVIEW]: 'Claim Team Review',
  [StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM]:
    'Pending Vendor Confirm',
  [StatementClaimTicketStatusEnum.VENDOR_DISPUTED]: 'Vendor Disputed',
  [StatementClaimTicketStatusEnum.FOR_DEDUCTION]: 'For Deduction',
  [StatementClaimTicketStatusEnum.COMPLETED]: 'Completed',
  [StatementClaimTicketStatusEnum.CLOSED]: 'Closed',
  [StatementClaimTicketStatusEnum.CANCELED]: 'Canceled',
};

export const ClaimTicketStatusOptions = [
  {
    label:
      ClaimTicketStatusEnumText[
        StatementClaimTicketStatusEnum.ONGOING_VALIDATION
      ],
    value: StatementClaimTicketStatusEnum.ONGOING_VALIDATION,
  },
  {
    label:
      ClaimTicketStatusEnumText[
        StatementClaimTicketStatusEnum.CLAIM_TEAM_REVIEW
      ],
    value: StatementClaimTicketStatusEnum.CLAIM_TEAM_REVIEW,
  },
  {
    label:
      ClaimTicketStatusEnumText[
        StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM
      ],
    value: StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM,
  },
  {
    label:
      ClaimTicketStatusEnumText[StatementClaimTicketStatusEnum.VENDOR_DISPUTED],
    value: StatementClaimTicketStatusEnum.VENDOR_DISPUTED,
  },
  {
    label:
      ClaimTicketStatusEnumText[StatementClaimTicketStatusEnum.FOR_DEDUCTION],
    value: StatementClaimTicketStatusEnum.FOR_DEDUCTION,
  },
  {
    label: ClaimTicketStatusEnumText[StatementClaimTicketStatusEnum.COMPLETED],
    value: StatementClaimTicketStatusEnum.COMPLETED,
  },
  {
    label: ClaimTicketStatusEnumText[StatementClaimTicketStatusEnum.CLOSED],
    value: StatementClaimTicketStatusEnum.CLOSED,
  },
  {
    label: ClaimTicketStatusEnumText[StatementClaimTicketStatusEnum.CANCELED],
    value: StatementClaimTicketStatusEnum.CANCELED,
  },
];

export const ClaimTicketStatusEnumColor = {
  [StatementClaimTicketStatusEnum.ONGOING_VALIDATION]: '#009688',
  [StatementClaimTicketStatusEnum.CLAIM_TEAM_REVIEW]: '#009688',
  [StatementClaimTicketStatusEnum.PENDING_VENDOR_CONFIRM]: '#009688',
  [StatementClaimTicketStatusEnum.VENDOR_DISPUTED]: '#009688',
  [StatementClaimTicketStatusEnum.FOR_DEDUCTION]: '#009688',
  [StatementClaimTicketStatusEnum.COMPLETED]: '#009688',
  [StatementClaimTicketStatusEnum.CLOSED]: '#52C41A',
  [StatementClaimTicketStatusEnum.CANCELED]: 'rgba(0, 0, 0, 0.25)',
};

export const RefundTicketStatusEnumText = {
  [RefundTicketStatusEnum.ONGOING_VALIDATION]: 'Ongoing Validation',
  [RefundTicketStatusEnum.CLAIM_TEAM_REVIEW]: 'Claim Team Review',
  [RefundTicketStatusEnum.FOR_REFUNDING]: 'For Refunding',
  [RefundTicketStatusEnum.COMPLETED]: 'Completed',
  [RefundTicketStatusEnum.CANCELED]: 'Canceled',
};

export const RefundTicketStatusOptions = [
  {
    label:
      RefundTicketStatusEnumText[RefundTicketStatusEnum.ONGOING_VALIDATION],
    value: RefundTicketStatusEnum.ONGOING_VALIDATION,
  },
  {
    label: RefundTicketStatusEnumText[RefundTicketStatusEnum.CLAIM_TEAM_REVIEW],
    value: RefundTicketStatusEnum.CLAIM_TEAM_REVIEW,
  },
  {
    label: RefundTicketStatusEnumText[RefundTicketStatusEnum.FOR_REFUNDING],
    value: RefundTicketStatusEnum.FOR_REFUNDING,
  },
  {
    label: RefundTicketStatusEnumText[RefundTicketStatusEnum.COMPLETED],
    value: RefundTicketStatusEnum.COMPLETED,
  },
  {
    label: RefundTicketStatusEnumText[RefundTicketStatusEnum.CANCELED],
    value: RefundTicketStatusEnum.CANCELED,
  },
];

export const RefundTicketStatusEnumColor = {
  [RefundTicketStatusEnum.ONGOING_VALIDATION]: '#009688',
  [RefundTicketStatusEnum.CLAIM_TEAM_REVIEW]: '#009688',
  [RefundTicketStatusEnum.FOR_REFUNDING]: '#009688',
  [RefundTicketStatusEnum.COMPLETED]: '#52C41A',
  [RefundTicketStatusEnum.CANCELED]: 'rgba(0, 0, 0, 0.25)',
};
