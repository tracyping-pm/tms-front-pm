import { IImageState } from '@/api/types/common';
import {
  BillingAmountStatusEnum,
  BillingAmountStatusEnumText,
  ContractTypeEnum,
  ContractTypeEnumText,
  CurrencyNameEnum,
  EnumContractExpireStatus,
  FuelChangeFrequencyEnum,
  FuelChangeFrequencyEnumText,
  GenerateTypeEnum,
  LogisticsCategoryEnum,
} from '@/enums';
import { ProFormProps, QueryFilterProps } from '@ant-design/pro-components';

import { getAppEnv } from '@/runtime-env';

export { default as PATHS } from './paths';
export { default as REGEXP } from './regexp';

export const MATERIAL_UPLOAD_URL = '/api/material/add';
export const DOMAIN = '.inteluck.com';
export const DEFAULT_NAME = 'tms';
export function getTokenKey(): string {
  return `${getAppEnv()}_uam_token`;
}
export const UAM_LOCAL_REDIRECT_TOKEN_PARAM = 'token';
export const USER_KEY = 'userInfo';
export function getOssRoot(): string {
  return `${DEFAULT_NAME}/${getAppEnv()}`;
}
export const PAGE_NUMBER = 5;

export const MAX_LENGTH = {
  NAME: 50,
  LONG_NAME: 100,
  NAME_200: 200,
  SHORT_NAME: 3,
  LONGEST_NAME: 1000,
  PASSWORD: 20,
  PHONE: 11,
  EMAIL: 50,
  ADDRESS: 200,
  REMARK: 400,
  NOTE: 500,
  CODE: 6,
  MAX_120: 120,
  MAX_128: 128,
  MAX_255: 255,
  MAX_1000: 1000,
  MAX_2000: 2000,
  MAX_5000: 5000,
};
export const COMMON_TABLE_FORM_SETTING: Omit<
  ProFormProps & QueryFilterProps,
  'form'
> = {
  className: 'proTableForm',
  defaultColsNumber: 4,
  searchGutter: 24,
  labelWidth: 0,
  labelCol: { span: 0 },
  span: 6,
  syncToUrl: false,
  syncToInitialValues: false,
  submitter: {
    searchConfig: {
      submitText: 'Search',
      resetText: 'Reset',
    },
  },
};

export const DEFAULT_PAGINATION = {
  list: [],
  pageNum: 1,
  pageSize: 20,
  total: 0,
  pages: 0,
};

export const ES_DTO_CLASS = {
  CUSTOMER: 'Customer',
  USER: 'User',
  DRIVER: 'Driver',
  TRUCK: 'Truck',
  VENDOR: 'Vendor',
  PROJECT: 'Project',
  CAPACITY: 'Capacity',
  ROUTE_LIBRARY: 'RouteLibrary',
  HELPER: 'Helper',
  WAYBILL: 'Waybill',
  CONTRACT: 'Contract',
  ROUTE: 'Route',
  TRANSMITTAL: 'Transmittal',
  USER_ROLE: 'UserRole',
  STATEMENT: 'Statement',
  LEAD: 'Lead',
  OPPORTUNITY: 'Opportunity',
  ACCRED_APPLICATION: 'AccredApplication',
  CREW: 'Crew',
  CLAIM: 'Claim',
  CLAIM_REQUEST: 'ClaimRequest',
  CLAIM_TICKET: 'ClaimTicket',
};

export const DEFAULT_TAB_KEY = 'perception';

export const CONTACT_DEFAULT_EDIT_DATA = {
  contactId: null,
  contactName: '',
  email: '',
  notes: '',
  phoneCode: '',
  phoneNumber: '',
  phoneCodeId: null,
  title: '',
};
export const CUSTOMER_TAB_LIST = {
  CONTACTS: 'contacts',
  RECORDS: 'records',
  PROJECTS: 'projects',
  BUSINESS_DOC: 'businessDoc',
  FINANCIAL_DOC: 'financialDoc',
  PERCEPTION: 'perception',
  OPPORTUNITIES: 'opportunities',
};

export const RECORD_GENERATE_TYPE = 'manual';

export const RECORD_DEFAULT_EDIT_DATA = {
  followRecordId: '',
  followTime: '',
  description: '',
  generateType: GenerateTypeEnum.MANUAL,
  materialList: [],
};

export const PERCEPTION_DEFAULT_EDIT_DATA = {
  perceptionId: '',
  addTime: '',
  description: '',
  materialList: [],
};

export const SUMMARY_DEFAULT_EDIT_DATA = {
  vendorSummaryId: 0,
  addTime: '',
  description: '',
  materialList: [],
};

export const FILE_UPLOAD_TIMEOUT = 1000 * 60 * 10;

// https://inteluck.atlassian.net/wiki/spaces/CPT/pages/448823354
export const IMAGE_TYPE = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

export const BELONG_IMG_EXTS = IMAGE_TYPE.map((item) => `.${item}`);

export const FILE_ACCEPT = [
  '.txt',
  '.doc',
  '.docx',
  '.pdf',
  '.xls',
  '.xlsx',
  '.csv',
  '.ppt',
  '.pptx',
  '.zip',
  '.rar',
  '.7z',
  ...BELONG_IMG_EXTS,
];

export const LIMIT_SIZE = 1024 * 1024 * 50;
export const TOTAL_LIMIT_SIZE = LIMIT_SIZE * 2;

export const SUPPORT_OSS_PREVIEW_WORD = [
  'doc',
  'docx',
  'wps',
  'wpss',
  'docm',
  'dotm',
  'dot',
  'dotx',
  'html',
];

export const SUPPORT_OSS_PREVIEW_PPT = [
  'pptx',
  'ppt',
  'pot',
  'potx',
  'pps',
  'ppsx',
  'dps',
  'dpt',
  'pptm',
  'potm',
  'ppsm',
  'dpss',
];

export const SUPPORT_OSS_PREVIEW_EXCEL = [
  'xls',
  'xlt',
  'et',
  'ett',
  'xlsx',
  'xltx',
  'csv',
  'xlsb',
  'xlsm',
  'xltm',
  'ets',
];

export const SUPPORT_OSS_PREVIEW_PDF = ['pdf'];

// https://www.alibabacloud.com/help/zh/oss/user-guide/online-object-preview?spm=a2c63.p38356.help-menu-search-31815.d_0
export const SUPPORT_OSS_PREVIEW_TYPE = [
  ...SUPPORT_OSS_PREVIEW_WORD,
  ...SUPPORT_OSS_PREVIEW_PPT,
  ...SUPPORT_OSS_PREVIEW_EXCEL,
  ...SUPPORT_OSS_PREVIEW_PDF,
];

export const VENDOR_TAB_LIST = {
  SUMMARY: 'summary',
  CONTACTS: 'contacts',
  RECORDS: 'records',
  TRUCKS: 'trucks',
  DRIVERS: 'drivers',
  HELPERS: 'helpers',
  PROJECTS: 'projects',
  ACCREDITATION: 'accreditation',
  CONTRACTS: 'contracts',
  FINANCIAL: 'financialDocuments',
  CREW: 'crew',
};

export const PHILIPPINES_COUNTRY = 'Philippines';

export const LAYOUT_HEADER_HEIGHT = 56;

export const CUSTOMER_LEADS_POOL = 'leadsPool';

export const PROJECT_TAB_LIST = {
  BUSINESS_DOCUMENTS: 'businessDocuments',
  ROUTE_LIBRARY: 'routeLibrary',
  CAPACITY_POOL: 'capacityPool',
  ORDERS: 'orders',
  WAYBILLS: 'waybills',
  STOP_POINTS: 'stopPoints',
  CUSTOMER_CONTRACTS: 'Customer',
  VENDOR_CONTRACTS: 'Vendor',
};

export const TRUCK_TAB_LIST = {
  ACCREDITATION: 'accreditation',
};
export const DRIVER_TAB_LIST = {
  ACCREDITATION: 'accreditation',
};

export const CustomerPriorityOptions = [
  {
    label: '10',
    value: '10',
  },
  {
    label: '9',
    value: '9',
  },
  {
    label: '8',
    value: '8',
  },
  {
    label: '7',
    value: '7',
  },
  {
    label: '6',
    value: '6',
  },
  {
    label: '5',
    value: '5',
  },
  {
    label: '4',
    value: '4',
  },
  {
    label: '3',
    value: '3',
  },
  {
    label: '2',
    value: '2',
  },
  {
    label: '1',
    value: '1',
  },
];

export const AREA_PHONE_CODE: Record<number, any> = {
  1: { label: '+63', value: '+63' },
  2: { label: '+66', value: '+66' },
};

export const COUNTRY_PHONE_REGULAR_EXPRESSION: Record<number, any> = {
  1: { mobile: /^\+63(0)?9\d{9}$/, phone: /^\+63\d{1,2}\d{6,7}$/ },
  2: { mobile: /^\+66(0?[2-9]\d{7})$/, phone: /^\+66(0?[689]\d{8})$/ },
};

export const DEFAULT_COUNTRY_PHONE_CODE: Record<number, any> = {
  1: {
    label: 'Philippines(+63)',
    value: 167,
    show: '+63',
  },
  2: {
    label: 'Thailand(+66)',
    value: 214,
    show: '+66',
  },
};

export const CONTRACT_TYPE_OPTIONS = [
  {
    label: ContractTypeEnumText[ContractTypeEnum.CUSTOMER],
    value: ContractTypeEnum.CUSTOMER,
  },
  {
    label: ContractTypeEnumText[ContractTypeEnum.VENDOR],
    value: ContractTypeEnum.VENDOR,
  },
];

export const FUEL_CHANGE_FREQUENCY = [
  {
    label: FuelChangeFrequencyEnumText[FuelChangeFrequencyEnum.WEEKLY],
    value: FuelChangeFrequencyEnum.WEEKLY,
  },
  {
    label: FuelChangeFrequencyEnumText[FuelChangeFrequencyEnum.MONTHLY],
    value: FuelChangeFrequencyEnum.MONTHLY,
  },
  {
    label: FuelChangeFrequencyEnumText[FuelChangeFrequencyEnum.QUARTERLY],
    value: FuelChangeFrequencyEnum.QUARTERLY,
  },
  {
    label: FuelChangeFrequencyEnumText[FuelChangeFrequencyEnum.EVERY_HALF_YEAR],
    value: FuelChangeFrequencyEnum.EVERY_HALF_YEAR,
  },
  {
    label: FuelChangeFrequencyEnumText[FuelChangeFrequencyEnum.PER_YEAR],
    value: FuelChangeFrequencyEnum.PER_YEAR,
  },
];

export const SIGNATURE_STATUS_COLOR: Record<string, string> = {
  Pending: 'rgba(47, 84, 235, 1)',
  Signing: 'rgba(0, 150, 136, 1)',
  Signed: 'rgba(82, 196, 26, 1)',
  Declined: 'rgba(255, 77, 79, 1)',
};

export const SIGN_LIST_STATUS_COLOR: Record<string, string> = {
  Pending: 'rgba(47, 84, 235, 1)',
  Completed: 'rgba(82, 196, 26, 1)',
  Declined: 'rgba(255, 77, 79, 1)',
  Expired: 'rgba(250, 173, 20, 1)',
  Canceled: 'rgba(217, 217, 217, 1)',
};

export const SIGNATURE_AVATAR_COLOR_LIST = [
  { bgColor: 'rgba(0, 150, 136, 1)', color: '#fff' },
  { bgColor: 'rgba(24, 144, 255, 1)', color: '#fff' },
  { bgColor: 'rgba(235, 47, 150, 1)', color: '#fff' },
  { bgColor: 'rgba(114, 46, 209, 1)', color: '#fff' },
  { bgColor: 'rgba(47, 84, 235, 1)', color: '#fff' },
  { bgColor: 'rgba(245, 34, 45, 1)', color: '#fff' },
  { bgColor: 'rgba(250, 140, 22, 1)', color: '#fff' },
  { bgColor: 'rgba(160, 217, 17, 1)', color: '#fff' },
  { bgColor: 'rgba(250, 173, 20, 1)', color: '#fff' },
  { bgColor: 'rgba(82, 196, 26, 1)', color: '#fff' },
  { bgColor: 'rgba(250, 219, 20, 1)', color: '#fff' },
];

const TITLE_STEP1 = 'Add Documents';
const TITLE_STEP2 = 'Add Recipients';
const TITLE_STEP3 = 'Add Fields';
const TITLE_STEP4 = 'Review & Send';

export const STEPS_TITLE = [
  {
    title: TITLE_STEP1,
    tooltip:
      "Begin your electronic signing process by uploading the document that requires a signature. Please note that you can upload only one file at a time. Supported file formats include PDF, DOCX. Ensure the document is clear and includes all necessary information. After uploading, you'll have the option to select the Signature Type: choose between 'External Signature' for signers outside your organization, or 'Internal Signature' for signers within your organization. This choice tailors the signing process according to the signer’s affiliation. Once you’ve selected the appropriate Signature Type and your document is in place, you can move to the next step to designate who will sign the document.",
  },
  {
    title: TITLE_STEP2,
    tooltip:
      'After uploading your document, add the Recipients. There are two types: Signers and CCs. Signers are the ones who need to sign the document; input their email addresses and set the signing order if needed. CCs, or Carbon Copies, are not required to sign but will receive notifications about the signing process. Once Recipients are set, proceed to add signature fields and other required information to the document.',
  },
  {
    title: TITLE_STEP3,
    tooltip:
      "In this step, you'll add various fields to the document such as signature boxes, date fields, and text input areas. These fields guide the recipients through the signing process. Drag and drop each field to the appropriate location on the document. It's important to assign each field to the right recipient, especially in documents with multiple signers. Once all fields are correctly placed and assigned, you're ready to review everything before sending the document.",
  },
  {
    title: TITLE_STEP4,
    tooltip:
      'In the final step, review the document and make sure all fields are correctly placed. You can also preview the document to see how it will look to the signers. Once you are satisfied with the document, you can send it for signing. The signers will receive an email notification with a link to sign the document. After all signers have signed, you will receive a notification that the document has been successfully signed.',
  },
];

export const STEPS_ITEMS = [
  {
    title: 'Step 1',
    description: TITLE_STEP1,
  },
  {
    title: 'Step 2',
    description: TITLE_STEP2,
  },
  {
    title: 'Step 3',
    description: TITLE_STEP3,
  },
  {
    title: 'Step 4',
    description: TITLE_STEP4,
  },
];

export const SIGNATURE_FILE_LIMIT_SIZE = 1024 * 1024 * 50; // 100MB
export const SIGNATURE_FILE_ACCEPT = '.pdf';

export enum SignatureTypeEnum {
  EXTERNAL = 'External Signature',
  INTERNAL = 'Internal Signature',
}

export const SignatureTypeEnumText = {
  [SignatureTypeEnum.EXTERNAL]: 'External Signature',
  [SignatureTypeEnum.INTERNAL]: 'Internal Signature',
};

export enum SignatureModeEnum {
  INIT = 'INIT',
  SIGNING = 'SIGNING',
  READONLY = 'READONLY',
}

export enum SignTypeEnum {
  SIGNATURE = 'SIGNATURE',
  DATE = 'DATE',
  TEXT = 'TEXT',
  COMPANY = 'COMPANY',
  ADDRESS = 'ADDRESS',
  EMAIL = 'EMAIL',
}

export const pageCommonProps = {
  renderAnnotationLayer: false,
  renderTextLayer: false,
};

export const defaultThumbPageWidth = 146;
export const defaultMainPageWidth = 800;
export const defaultWidthHeightRatio = 1.294;
export const defaultThumbScale = 0.2;
export const defaultScale = 1;
export const scaleStep = 0.1;
export const minScale = 0.8;
export const maxScale = 2;

export const defaultPdfUrl =
  // 'https://drive.google.com/file/d/1XqqqhI3zRuaTZrmXQQIdaXRggBZCh2MO/view';
  'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

export const WAYBILL_DETAIL_ANCHOR_ID_MAP = {
  TRACKS: 'js-anchor_tracks',
  ROUTE: 'js-anchor_route',
  CARRIER: 'js-anchor_carrier',
  BILLING: 'js-anchor_billing',
  SUBTASK: 'js-anchor_subtask',
  POD: 'js-anchor_pod',
  REMARK: 'js-anchor_remark',
  BASIC: 'js-anchor_basic',
  CLAIM: 'js-anchor_claim',
  REIMBURSEMENT: 'js-anchor_reimbursement',
};

export const WAYBILL_DETAIL_ANCHOR_LIST = [
  { anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.TRACKS, description: 'Tracks' },
  { anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.ROUTE, description: 'Route' },
  { anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.CARRIER, description: 'Carrier' },
  { anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.BILLING, description: 'Billing' },
  { anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.POD, description: 'POD' },
  { anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.REMARK, description: 'Remark' },
  { anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.BASIC, description: 'Basic' },
  {
    anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.REIMBURSEMENT,
    description: 'Reimb',
  },
];

export const BILLING_AMOUNT_STATUS_OPTIONS = [
  {
    label: BillingAmountStatusEnumText[BillingAmountStatusEnum.PENDING],
    value: BillingAmountStatusEnum.PENDING,
  },
  {
    label: BillingAmountStatusEnumText[BillingAmountStatusEnum.ON_HOLD],
    value: BillingAmountStatusEnum.ON_HOLD,
  },
  {
    label: BillingAmountStatusEnumText[BillingAmountStatusEnum.VERIFIED],
    value: BillingAmountStatusEnum.VERIFIED,
  },
  {
    label: BillingAmountStatusEnumText[BillingAmountStatusEnum.BILLED],
    value: BillingAmountStatusEnum.BILLED,
  },
  {
    label: BillingAmountStatusEnumText[BillingAmountStatusEnum.SETTLED],
    value: BillingAmountStatusEnum.SETTLED,
  },
];

export const initialImageState: IImageState = {
  pending: false,
  visible: false,
  index: 0,
  sourceImages: [],
};

export const SettledItemFieldsMap = {
  customerBasicAmount: 'basicAmount',
  customerExceptionFee: 'exceptionFee',
  customerAdditionalCharge: 'additionalCharge',
  customerClaim: 'claim',
  customerReimbursementExpense: 'reimbursementExpense',
  // vendor
  paidInAdvance: 'paidInAdvance',
  regularPayments: 'regularPayments',
  vendorExceptionFee: 'exceptionFee',
  vendorAdditionalCharge: 'additionalCharge',
  vendorClaim: 'claim',
  vendorReimbursementExpense: 'reimbursementExpense',
};

export const SettledItemStatusFieldsMap = {
  customerBasicAmount: 'basicAmountStatus',
  customerExceptionFee: 'exceptionFeeStatus',
  customerAdditionalCharge: 'additionalChargeStatus',
  customerClaim: 'claimStatus',
  customerReimbursementExpense: 'reimbursementExpenseStatus',
  // vendor
  paidInAdvance: 'paidInAdvanceStatus',
  regularPayments: 'regularPaymentsStatus',
  vendorExceptionFee: 'exceptionFeeStatus',
  vendorAdditionalCharge: 'additionalChargeStatus',
  vendorClaim: 'claimStatus',
  vendorReimbursementExpense: 'reimbursementExpenseStatus',
};

export const BILLING_DETAIL_ANCHOR_ID_MAP = {
  CUSTOMER_WAYBILL_LIST: 'js-anchor-customer-waybill-list',
  VENDOR_WAYBILL_LIST: 'js-anchor-vendor-waybill-list',
};

export const LogisticsCategoryEnumText = {
  [LogisticsCategoryEnum.TRANSPORTATION]: 'Transportation',
  [LogisticsCategoryEnum.FREIGHT_FORWARDING]: 'Freight Forwarding',
};

export const LogisticsCategoryOptions = [
  {
    label: LogisticsCategoryEnumText[LogisticsCategoryEnum.TRANSPORTATION],
    value: LogisticsCategoryEnum.TRANSPORTATION,
  },
  {
    label: LogisticsCategoryEnumText[LogisticsCategoryEnum.FREIGHT_FORWARDING],
    value: LogisticsCategoryEnum.FREIGHT_FORWARDING,
  },
];

export const PIC_TYPE = {
  LEAD_BD_PIC: 'LEAD_BD_PIC',
  PRICING_PIC: 'PRICING_PIC',
  VD_PIC: 'VD_PIC',
};

export enum STATISTICS_TIME_OPTION {
  NONE = 'none',
  CURRENT_MONTH = 'Current Month',
  LAST_MONTH = 'Last Month',
  CURRENT_WEEK = 'Current Week',
  LAST_WEEK = 'Last Week',
}

export enum STATISTICS_RANK_OPTION {
  NONE = 'none',
  SUCCESSFUL_CLOSED = 'successfulClosed',
  TOTAL_OPPORTUNITIES = 'totalOpportunities',
  CREATION_NUMBER = 'creationCount',
}

export enum ROUTE_LIBRARY_DETAIL_TABS {
  ROUTES = 'routes',
  CUSTOMERPV = 'customerPV',
  VENDORPV = 'vendorPV',
}

export const CURRENCY_SYMBOL = {
  [CurrencyNameEnum.PESO]: '₱',
  [CurrencyNameEnum.BAHT]: '฿',
  [CurrencyNameEnum.DOLLAR]: '$',
  [CurrencyNameEnum.YUAN]: '¥',
  [CurrencyNameEnum.RM]: 'RM',
};

export enum CREW_TYPE {
  DRIVER = 'Driver',
  HELPER = 'Helper',
}

export enum DeductionStatusEnum {
  NOT_LINKED_AR = 'Not Linked AR',
  NOT_LINKED_AP = 'Not Linked AP',
  FOR_DEDUCTION = 'For Deduction',
  DEDUCTED = 'Deducted',
  WRITTEN_OFF = 'Written Off',
}

export const DeductionStatusEnumText = {
  [DeductionStatusEnum.NOT_LINKED_AR]: 'Not Linked AR',
  [DeductionStatusEnum.NOT_LINKED_AP]: 'Not Linked AP',
  [DeductionStatusEnum.FOR_DEDUCTION]: 'For Deduction',
  [DeductionStatusEnum.DEDUCTED]: 'Deducted',
  [DeductionStatusEnum.WRITTEN_OFF]: 'Written Off',
};

export const CustomerDeductionStatusEnumText = {
  [DeductionStatusEnum.NOT_LINKED_AR]: 'Not Linked AR',
  [DeductionStatusEnum.FOR_DEDUCTION]: 'For Deduction',
  [DeductionStatusEnum.DEDUCTED]: 'Deducted',
  [DeductionStatusEnum.WRITTEN_OFF]: 'Written Off',
};

export const VendorDeductionStatusEnumText = {
  [DeductionStatusEnum.NOT_LINKED_AP]: 'Not Linked AP',
  [DeductionStatusEnum.FOR_DEDUCTION]: 'For Deduction',
  [DeductionStatusEnum.DEDUCTED]: 'Deducted',
  [DeductionStatusEnum.WRITTEN_OFF]: 'Written Off',
};

export const DeductionStatusEnumTextColor = {
  [DeductionStatusEnum.NOT_LINKED_AR]: '#FAAD14',
  [DeductionStatusEnum.NOT_LINKED_AP]: '#FAAD14',
  [DeductionStatusEnum.FOR_DEDUCTION]: '#009688',
  [DeductionStatusEnum.DEDUCTED]: '#52C41A',
  [DeductionStatusEnum.WRITTEN_OFF]: '#FF4D4F',
};

export enum StatementClaimTicketStatusEnum {
  ONGOING_VALIDATION = 'Ongoing Validation',
  CLAIM_TEAM_REVIEW = 'Claim team review',
  PENDING_VENDOR_CONFIRM = 'Pending Vendor Confirm',
  VENDOR_DISPUTED = 'Vendor Disputed',
  FOR_DEDUCTION = 'For Deduction',
  COMPLETED = 'Completed',
  CLOSED = 'Closed',
  CANCELED = 'Canceled',
}

export enum RefundTicketStatusEnum {
  ONGOING_VALIDATION = 'Ongoing Validation',
  CLAIM_TEAM_REVIEW = 'Claim team review',
  FOR_REFUNDING = 'For Refunding',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled',
}

export enum RefundStatusEnum {
  NOT_LINKED_AR = 'Not Linked AR',
  NOT_LINKED_AP = 'Not Linked AP',
  FOR_REFUNDING = 'For Refunding',
  REFUND = 'Refund',
  WRITTEN_OFF = 'Written Off',
}

export const RefundStatusEnumText = {
  [RefundStatusEnum.NOT_LINKED_AR]: 'Not Linked AR',
  [RefundStatusEnum.NOT_LINKED_AP]: 'Not Linked AP',
  [RefundStatusEnum.FOR_REFUNDING]: 'For Refunding',
  [RefundStatusEnum.REFUND]: 'Refund',
  [RefundStatusEnum.WRITTEN_OFF]: 'Written Off',
};

export const CustomerRefundStatusEnumText = {
  [RefundStatusEnum.NOT_LINKED_AR]: 'Not Linked AR',
  [RefundStatusEnum.FOR_REFUNDING]: 'For Refunding',
  [RefundStatusEnum.REFUND]: 'Refund',
  [RefundStatusEnum.WRITTEN_OFF]: 'Written Off',
};

export const VendorRefundStatusEnumText = {
  [RefundStatusEnum.NOT_LINKED_AP]: 'Not Linked AP',
  [RefundStatusEnum.FOR_REFUNDING]: 'For Refunding',
  [RefundStatusEnum.REFUND]: 'Refund',
  [RefundStatusEnum.WRITTEN_OFF]: 'Written Off',
};

export const RefundStatusEnumTextColor = {
  [RefundStatusEnum.NOT_LINKED_AR]: '#FAAD14',
  [RefundStatusEnum.NOT_LINKED_AP]: '#FAAD14',
  [RefundStatusEnum.FOR_REFUNDING]: '#009688',
  [RefundStatusEnum.REFUND]: '#52C41A',
  [RefundStatusEnum.WRITTEN_OFF]: '#FF4D4F',
};

export enum StatisticRankTypeEnum {
  REVENUE = 'revenue',
  GP = 'gp',
  GM = 'gm',
}
export const StatisticRankTypeEnumText = {
  [StatisticRankTypeEnum.REVENUE]: 'Revenue',
  [StatisticRankTypeEnum.GP]: 'GP',
  [StatisticRankTypeEnum.GM]: 'GM',
};

export const ContractExpireStatusAmount = {
  [EnumContractExpireStatus.EXPIRED]: -1,
  [EnumContractExpireStatus.EXPIRE_WITHIN_3_DAYS]: 3,
  [EnumContractExpireStatus.EXPIRE_WITHIN_7_DAYS]: 7,
  [EnumContractExpireStatus.EXPIRE_WITHIN_30_DAYS]: 30,
};
