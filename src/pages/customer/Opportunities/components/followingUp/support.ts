import { OpportunitiesStatusEnum } from '@/enums';

export const TOTAL_STATUS_LIST = [
  OpportunitiesStatusEnum.REACH_OUT,
  OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_PENDING_CUSTOMER_MEETING,
  OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE,
  OpportunitiesStatusEnum.QUOTATION_REQUEST_RECEIVED,
  OpportunitiesStatusEnum.QUOTATION_SUBMITTED_WAITING_FEEDBACK,
  OpportunitiesStatusEnum.QUOTATION_SUBMITTED_QUOTATION_UPDATE,
  OpportunitiesStatusEnum.SUCCESSFUL_CLOSED,
  OpportunitiesStatusEnum.LOST,
  OpportunitiesStatusEnum.CANCELED,
];

export const SHOW_REASON_STATUS_LIST = [
  OpportunitiesStatusEnum.LOST,
  OpportunitiesStatusEnum.CANCELED,
];

export const SHOW_VISIT_ACTIVITY_STATUS_LIST = [
  OpportunitiesStatusEnum.REACH_OUT,
  OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_PENDING_CUSTOMER_MEETING,
  OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE,
  OpportunitiesStatusEnum.QUOTATION_REQUEST_RECEIVED,
  OpportunitiesStatusEnum.QUOTATION_SUBMITTED_WAITING_FEEDBACK,
  OpportunitiesStatusEnum.QUOTATION_SUBMITTED_QUOTATION_UPDATE,
];

export const SHOW_OPPORTUNITY_INFORMATION_STATUS_LIST = [
  OpportunitiesStatusEnum.SUCCESSFUL_CLOSED,
];

export const SHOW_OPPORTUNITY_DETAIL_FOLLOW_UP_STATUS_LIST = [
  OpportunitiesStatusEnum.REACH_OUT,
  OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_PENDING_CUSTOMER_MEETING,
  OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE,
  OpportunitiesStatusEnum.QUOTATION_REQUEST_RECEIVED,
  OpportunitiesStatusEnum.QUOTATION_SUBMITTED_WAITING_FEEDBACK,
  OpportunitiesStatusEnum.QUOTATION_SUBMITTED_QUOTATION_UPDATE,
];

export const getStatusListByCurrent = (
  currentStatus: OpportunitiesStatusEnum,
) => {
  let list: OpportunitiesStatusEnum[] = [];
  switch (currentStatus) {
    case OpportunitiesStatusEnum.REACH_OUT:
      list = [
        OpportunitiesStatusEnum.REACH_OUT,
        OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_PENDING_CUSTOMER_MEETING,
        OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE,
        OpportunitiesStatusEnum.LOST,
        OpportunitiesStatusEnum.CANCELED,
      ];
      break;

    case OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_PENDING_CUSTOMER_MEETING:
      list = [
        OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_PENDING_CUSTOMER_MEETING,
        OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE,
        OpportunitiesStatusEnum.QUOTATION_REQUEST_RECEIVED,
        OpportunitiesStatusEnum.LOST,
        OpportunitiesStatusEnum.CANCELED,
      ];
      break;

    case OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE:
      list = [
        OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE,
        OpportunitiesStatusEnum.QUOTATION_REQUEST_RECEIVED,
        OpportunitiesStatusEnum.LOST,
        OpportunitiesStatusEnum.CANCELED,
      ];
      break;

    case OpportunitiesStatusEnum.QUOTATION_REQUEST_RECEIVED:
      list = [
        OpportunitiesStatusEnum.QUOTATION_REQUEST_RECEIVED,
        OpportunitiesStatusEnum.QUOTATION_SUBMITTED_WAITING_FEEDBACK,
        OpportunitiesStatusEnum.QUOTATION_SUBMITTED_QUOTATION_UPDATE,
        OpportunitiesStatusEnum.LOST,
        OpportunitiesStatusEnum.CANCELED,
      ];
      break;

    case OpportunitiesStatusEnum.QUOTATION_SUBMITTED_WAITING_FEEDBACK:
    case OpportunitiesStatusEnum.QUOTATION_SUBMITTED_QUOTATION_UPDATE:
      list = [
        OpportunitiesStatusEnum.QUOTATION_SUBMITTED_WAITING_FEEDBACK,
        OpportunitiesStatusEnum.QUOTATION_SUBMITTED_QUOTATION_UPDATE,
        OpportunitiesStatusEnum.SUCCESSFUL_CLOSED,
        OpportunitiesStatusEnum.LOST,
        OpportunitiesStatusEnum.CANCELED,
      ];
      break;

    default:
      list = [currentStatus];
      break;
  }

  return list;
};

export const TEXTAREA_MAX_LENGTH = 2000;
export const TEXTAREA_MAX_HEIGHT = 300;
export const TEXTAREA_AUTO_SIZE = { minRows: 2, maxRows: 6 };
