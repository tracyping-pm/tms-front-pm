export enum AccountStatusEnum {
  INACTIVE = 'Inactive',
  ACTIVATED = 'Activated',
  SUSPENDED = 'Suspended',
}

export const AccountStatusEnumText = {
  [AccountStatusEnum.INACTIVE]: 'Inactive',
  [AccountStatusEnum.ACTIVATED]: 'Activated',
  [AccountStatusEnum.SUSPENDED]: 'Suspended',
};

export const AccountStatusEnumColor = {
  [AccountStatusEnum.INACTIVE]: '#D9D9D9',
  [AccountStatusEnum.ACTIVATED]: '#52C41A',
  [AccountStatusEnum.SUSPENDED]: '#FAAD14',
};

export enum CustomerPriorityEnum {
  TENTH = '10',
  NINTH = '9',
  EIGHTH = '8',
  SEVENTH = '7',
  SIXTH = '6',
  FIFTH = '5',
  FOURTH = '4',
  THIRD = '3',
  SECOND = '2',
  FIRST = '1',
}

export const CustomerPriorityEnumText = {
  [CustomerPriorityEnum.TENTH]: '10',
  [CustomerPriorityEnum.NINTH]: '9',
  [CustomerPriorityEnum.EIGHTH]: '8',
  [CustomerPriorityEnum.SEVENTH]: '7',
  [CustomerPriorityEnum.SIXTH]: '6',
  [CustomerPriorityEnum.FIFTH]: '5',
  [CustomerPriorityEnum.FOURTH]: '4',
  [CustomerPriorityEnum.THIRD]: '3',
  [CustomerPriorityEnum.SECOND]: '2',
  [CustomerPriorityEnum.FIRST]: '1',
};

export enum CustomerSizeEnum {
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
  GIANT = 'Giant',
}

export const CustomerSizeEnumText = {
  [CustomerSizeEnum.SMALL]: 'Small',
  [CustomerSizeEnum.MEDIUM]: 'Medium',
  [CustomerSizeEnum.LARGE]: 'Large',
  [CustomerSizeEnum.GIANT]: 'Giant',
};
export enum ContactTypeEnum {
  LOCKIN = 'Lock In',
  ON_CALL_STABLE_VOLUME = 'On Call - Stable volume',
  ON_CALL_ON_DEMANDVOLUME = 'On Call - On demand volume',
}

export const ContactTypeEnumText = {
  [ContactTypeEnum.LOCKIN]: 'Lock In',
  [ContactTypeEnum.ON_CALL_STABLE_VOLUME]: 'On Call - Stable volume',
  [ContactTypeEnum.ON_CALL_ON_DEMANDVOLUME]: 'On Call - On demand volume',
};

export enum CustomerStatusEnum {
  PUBLIC = 'Public',
  FOLLOWING_UP = 'Following Up',
  PREPARING = 'Preparing',
  IN_SERVICE = 'In Service',
}

export const CustomerStatusEnumText = {
  [CustomerStatusEnum.PUBLIC]: 'Public',
  [CustomerStatusEnum.FOLLOWING_UP]: 'Following Up',
  [CustomerStatusEnum.PREPARING]: 'Preparing',
  [CustomerStatusEnum.IN_SERVICE]: 'In Service',
};

export const CustomerStatusEnumColor = {
  [CustomerStatusEnum.PUBLIC]: '#2F54EB',
  [CustomerStatusEnum.FOLLOWING_UP]: '#009688',
  [CustomerStatusEnum.PREPARING]: '#009688',
  [CustomerStatusEnum.IN_SERVICE]: '#52C41A',
};

export enum ColumnType {
  NORMAL,
  LARGE,
}

export enum GenerateTypeEnum {
  AUTO = 'auto',
  MANUAL = 'manual',
}

export enum CountryMapEnum {
  Philippines = 1,
  Thailand,
}

export const CountryMapEnumText: { [key: number]: string } = {
  [CountryMapEnum.Philippines]: 'Philippines',
  [CountryMapEnum.Thailand]: 'Thailand',
};

// https://inteluck.atlassian.net/wiki/spaces/CPT/pages/458686502#3%EF%BC%89Region
export const CountryEnumLabelListMap = {
  [CountryMapEnum.Philippines]: [
    'Country',
    'Region',
    'Province',
    'Municipality/City',
  ],
  [CountryMapEnum.Thailand]: ['Country', 'Changwat', 'Amphoe', 'Tambon'],
};

export enum DataPermissionTypeEnum {
  SelfAndSubordinates = 'SelfAndSubordinates',
  Department = 'Department',
  DepartmentAndSubordinateDepartments = 'DepartmentAndSubordinateDepartments',
  // CompanyWide = 'CompanyWide',
  BusinessUnitWide = 'BusinessUnitWide',
}

export const DataPermissionTypeEnumToText = {
  [DataPermissionTypeEnum.SelfAndSubordinates]: 'Self And Subordinates',
  [DataPermissionTypeEnum.Department]: 'Department',
  [DataPermissionTypeEnum.DepartmentAndSubordinateDepartments]:
    'Department And Subordinate Departments',
  [DataPermissionTypeEnum.BusinessUnitWide]: 'Business Unit Wide',
};

export enum VendorTypeEnum {
  CORPORATE = 'Corporate',
  INDIVIDUAL = 'Individual',
}

export const VendorTypeEnumText = {
  [VendorTypeEnum.CORPORATE]: 'Corporate',
  [VendorTypeEnum.INDIVIDUAL]: 'Individual',
};

export enum VendorStatusEnum {
  UNACCREDITED = 'Unaccredited',
  ACCREDITED = 'Accredited',
  // BLOCKED = 'Blocked',
  TERMINATED = 'Terminated',
}

export const VendorStatusEnumText = {
  [VendorStatusEnum.UNACCREDITED]: 'Unaccredited',
  [VendorStatusEnum.ACCREDITED]: 'Accredited',
  // [VendorStatusEnum.BLOCKED]: 'Blocked',
  [VendorStatusEnum.TERMINATED]: 'Terminated',
};

export const VendorStatusEnumColor = {
  [VendorStatusEnum.UNACCREDITED]: '#2F54EB',
  [VendorStatusEnum.ACCREDITED]: '#52C41A',
  // [VendorStatusEnum.BLOCKED]: '#D9D9D9',
  [VendorStatusEnum.TERMINATED]: '#FF4D4F',
};

export enum VendorTruckVanTypeEnum {
  DRY = 'Dry',
  REEFER = 'Reefer',
}

export const VendorTruckVanTypeEnumText = {
  [VendorTruckVanTypeEnum.DRY]: 'Dry',
  [VendorTruckVanTypeEnum.REEFER]: 'Reefer',
};

export enum VendorTruckOwnershipEnum {
  OWNED_TRUCK = 'Owned Truck',
  NON_OWNED_TRUCK = 'Non-Owned Truck',
}

export const VendorTruckOwnershipEnumText = {
  [VendorTruckOwnershipEnum.OWNED_TRUCK]: 'Owned Truck',
  [VendorTruckOwnershipEnum.NON_OWNED_TRUCK]: 'Non-Owned Truck',
};

export const VendorTruckOwnershipEnumOptions = [
  { label: 'Owned Truck', value: 'Owned Truck' },
  { label: 'Non-Owned Truck', value: 'Non-Owned Truck' },
];

export const VendorListServicesEnumOptions = [
  { label: 'Land transportation', value: 'Land transportation' },
  { label: 'Freight forwarding', value: 'Freight forwarding' },
  {
    label: 'Domestic shipping line services',
    value: 'Domestic shipping line services',
  },
  {
    label: 'International shipping line services',
    value: 'International shipping line services',
  },
  { label: 'Warehouse services', value: 'Warehouse services' },
];

export const VendorServicesArray = [
  'Land transportation',
  'Freight forwarding',
  'Domestic shipping line services',
  'International shipping line services',
  'Warehouse services',
];

export enum VendorTruckCodingDayEnum {
  NA = 'NA',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export const VendorTruckCodingDayEnumText = {
  [VendorTruckCodingDayEnum.NA]: 'NA',
  [VendorTruckCodingDayEnum.MONDAY]: 'Monday',
  [VendorTruckCodingDayEnum.TUESDAY]: 'Tuesday',
  [VendorTruckCodingDayEnum.WEDNESDAY]: 'Wednesday',
  [VendorTruckCodingDayEnum.THURSDAY]: 'Thursday',
  [VendorTruckCodingDayEnum.FRIDAY]: 'Friday',
  [VendorTruckCodingDayEnum.SATURDAY]: 'Saturday',
  [VendorTruckCodingDayEnum.SUNDAY]: 'Sunday',
};

export enum AuthorityTypeEnum {
  MENU = 'menu',
  BUTTON = 'button',
}

export enum ProjectStatusEnum {
  PREPARING = 'preparing',
  INPROGRESS = 'inProgress',
  SUSPEND = 'suspended',
  CANCELED = 'canceled',
  TERMINATED = 'terminated',
  COMPLETED = 'completed',
}

export const ProjectStatusEnumText = {
  [ProjectStatusEnum.PREPARING]: 'Preparing',
  [ProjectStatusEnum.INPROGRESS]: 'In Progress',
  [ProjectStatusEnum.SUSPEND]: 'Suspended',
  [ProjectStatusEnum.CANCELED]: 'Canceled',
  [ProjectStatusEnum.TERMINATED]: 'Terminated',
  [ProjectStatusEnum.COMPLETED]: 'Completed',
};

export const ProjectStatusOptions = [
  { label: 'Preparing', value: ProjectStatusEnum.PREPARING },
  { label: 'In Progress', value: ProjectStatusEnum.INPROGRESS },
  { label: 'Canceled', value: ProjectStatusEnum.CANCELED },
  { label: 'Terminated', value: ProjectStatusEnum.TERMINATED },
  { label: 'Completed', value: ProjectStatusEnum.COMPLETED },
];

export const ProjectStatusEnumColor = {
  [ProjectStatusEnum.PREPARING]: '#2F54EB',
  [ProjectStatusEnum.INPROGRESS]: '#009688',
  [ProjectStatusEnum.SUSPEND]: '#FF4D4F',
  [ProjectStatusEnum.CANCELED]: '#D9D9D9',
  [ProjectStatusEnum.TERMINATED]: '#FF4D4F',
  [ProjectStatusEnum.COMPLETED]: '#52C41A',
};

export enum TransportationStatusEnum {
  PREPARING = 'preparing',
  INPROGRESS = 'inProgress',
  CANCELED = 'canceled',
  TERMINATED = 'terminated',
  COMPLETED = 'completed',
}

export const TransportationStatusEnumText = {
  [TransportationStatusEnum.PREPARING]: 'Preparing',
  [TransportationStatusEnum.INPROGRESS]: 'In Progress',
  [TransportationStatusEnum.CANCELED]: 'Canceled',
  [TransportationStatusEnum.TERMINATED]: 'Terminated',
  [TransportationStatusEnum.COMPLETED]: 'Completed',
};

export enum FinancialStatusEnum {
  PREPARING = 'preparing',
  INPROGRESS = 'inProgress',
  CANCELED = 'canceled',
  TERMINATED = 'terminated',
  COMPLETED = 'completed',
}

export const FinancialStatusEnumText = {
  [FinancialStatusEnum.PREPARING]: 'Preparing',
  [FinancialStatusEnum.INPROGRESS]: 'In Progress',
  [FinancialStatusEnum.CANCELED]: 'Canceled',
  [FinancialStatusEnum.TERMINATED]: 'Terminated',
  [FinancialStatusEnum.COMPLETED]: 'Completed',
};

export enum FieldQueryHighlightTypeEnum {
  COUNTRY = 'Country',
  ONLY_COUNTRY = 'OnlyCountry',
  USER_ROLE = 'UserRole',
  ALL = 'All',
  None = 'None',
  VENDOR = 'Vendor',
  BU_Id = 'BuId',
}

export enum VendorTruckStatusEnum {
  UNACCREDITED = 'Unaccredited',
  ACCREDITED = 'Accredited',
  INACTIVE = 'Inactive',
  // INUSE = 'In Use',
  // OUTOfUSE = 'Out of Use',
}

export const VendorTruckStatusEnumText = {
  [VendorTruckStatusEnum.UNACCREDITED]: 'Unaccredited',
  [VendorTruckStatusEnum.ACCREDITED]: 'Accredited',
  [VendorTruckStatusEnum.INACTIVE]: 'Inactive',
  // [VendorTruckStatusEnum.INUSE]: 'In Use',
  // [VendorTruckStatusEnum.OUTOfUSE]: 'Out of Use',
};

export const VendorTruckStatusEnumColor = {
  [VendorTruckStatusEnum.UNACCREDITED]: '#2F54EB',
  [VendorTruckStatusEnum.ACCREDITED]: '#52C41A',
  [VendorTruckStatusEnum.INACTIVE]: '#FF4D4F',
  // [VendorTruckStatusEnum.OUTOfUSE]: '#',
};

export enum VendorDriveStatusEnum {
  UNACCREDITED = 'Unaccredited',
  ACCREDITED = 'Accredited',
  BLOCKED = 'Blocked',
}

export const VendorDriveStatusEnumText = {
  [VendorDriveStatusEnum.UNACCREDITED]: 'Unaccredited',
  [VendorDriveStatusEnum.ACCREDITED]: 'Accredited',
  [VendorDriveStatusEnum.BLOCKED]: 'Blocked',
};

export const VendorDriveStatusEnumColor = {
  [VendorDriveStatusEnum.UNACCREDITED]: '#2F54EB',
  [VendorDriveStatusEnum.ACCREDITED]: '#52C41A',
  [VendorDriveStatusEnum.BLOCKED]: '#D9D9D9',
};

export enum MemberTypeEnum {
  BD = 'BD',
  PROCUREMENT_PIC = 'ProcurementPIC',
  STRATEGY_PIC = 'StrategyPIC',
  RATES_PIC = 'RatesPIC',
  DISPATCHER = 'Dispatcher',
  OC = 'OC',
  ON_SITE_OC = 'OnSiteOC',
  POD_CHECKER = 'PODChecker',
  CAM = 'CAM',
}

export const MemberTypeEnumText = {
  [MemberTypeEnum.BD]: 'BD PIC',
  [MemberTypeEnum.PROCUREMENT_PIC]: 'Procurement PIC',
  [MemberTypeEnum.STRATEGY_PIC]: 'Strategy PIC',
  [MemberTypeEnum.RATES_PIC]: 'Rates PIC',
  [MemberTypeEnum.DISPATCHER]: 'Dispatcher',
  [MemberTypeEnum.OC]: 'OC',
  [MemberTypeEnum.ON_SITE_OC]: 'On Site OC',
  [MemberTypeEnum.POD_CHECKER]: 'POD Checker',
  [MemberTypeEnum.CAM]: 'CAM PIC',
};

export enum AccessStatusEnum {
  APPROVED = 'Approved',
  NOT_APPROVED = 'Not Approved',
}

export const AccessStatusEnumText = {
  [AccessStatusEnum.APPROVED]: 'Approved',
  [AccessStatusEnum.NOT_APPROVED]: 'Not Approved',
};
export const AccessStatusEnumTextColor = {
  [AccessStatusEnum.APPROVED]: '#52C41A',
  [AccessStatusEnum.NOT_APPROVED]: '#FF4D4F',
};

export enum RouteBillingModeEnum {
  ROUTE_BILLING = 'Route Pricing(By Route)',
  MILEAGE_BILLING = 'Mileage Pricing(By Distance)',
}

export const RouteBillingModeEnumText = {
  [RouteBillingModeEnum.ROUTE_BILLING]: 'Route Pricing(By Route)',
  [RouteBillingModeEnum.MILEAGE_BILLING]: 'Mileage Pricing(By Distance)',
};

export enum MultipleRouteModeEnum {
  HIGHEST_RATE = 'Highest Rate(P2P)',
  FAREST_RATE = 'Farthest Location(P2P)',
}

export const MultipleRouteModeEnumText = {
  [MultipleRouteModeEnum.HIGHEST_RATE]: 'Highest Rate(P2P)',
  [MultipleRouteModeEnum.FAREST_RATE]: 'Farthest Location(P2P)',
};

export enum MultipleDistanceModeEnum {
  HIGHEST_RATE = 'Highest Rate(P2P)',
  FAREST_RATE = 'Farthest Location(P2P)',
  ROUTE_DISTANCE = 'Route Distance(All Points)',
}

export const MultipleDistanceModeEnumText = {
  [MultipleDistanceModeEnum.HIGHEST_RATE]: 'Highest Rate(P2P)',
  [MultipleDistanceModeEnum.FAREST_RATE]: 'Farthest Location(P2P)',
  [MultipleDistanceModeEnum.ROUTE_DISTANCE]: 'Route Distance(All Points)',
};

export enum MileageCalculationModeEnum {
  DISTRIBUTED_MILEAGE_CALCULATION = 'Distribute Mileage Calculation (by KM)',
  FLAT_MILEAGE_CALCULATION = 'Flat Mileage Calculation (by KM)',
  TOTAL_RANGE_DISTRIBUTE_CALCULATION = 'Distribute Mileage Calculation (Fix Price per Exceeding Distance Range)',
  TOTAL_RANGE_FLAT_CALCULATION = 'Flat Mileage Calculation (Fix Price per Exceeding Distance Range)',
}

export const MileageCalculationModeEnumText = {
  [MileageCalculationModeEnum.DISTRIBUTED_MILEAGE_CALCULATION]:
    'Distribute Mileage Calculation (by KM)',
  [MileageCalculationModeEnum.FLAT_MILEAGE_CALCULATION]:
    'Flat Mileage Calculation (by KM)',
  [MileageCalculationModeEnum.TOTAL_RANGE_DISTRIBUTE_CALCULATION]:
    'Distribute Mileage Calculation (Fix Price per Exceeding Distance Range)',
  [MileageCalculationModeEnum.TOTAL_RANGE_FLAT_CALCULATION]:
    'Flat Mileage Calculation (Fix Price per Exceeding Distance Range)',
};

export enum LibraryRouteStatusEnum {
  APPROVED = 'Approved',
  NOT_APPROVED = 'Not Approved',
}

export const CountryCurrencyEnumText: Record<any, string> = {
  1: '₱',
  2: '฿',
};

export const CountryRegionNameText: Record<any, string[]> = {
  1: ['Region', 'Province', 'Municipality/City'],
  2: ['Changwat', 'Amphoe', 'Tambon'],
};

export enum LibraryManageStatusEnum {
  IMPORTING = 'Importing',
  COMPLETED = 'Completed',
  VERSION_CHANGED = 'Version Changed',
  EXCEPTION = 'Exception',
}

export enum LibrarySyncFromStatusEnum {
  NORMAL = 'Normal',
  COMPLETED = 'Completed',
  SYNCHRONIZING = 'Synchronizing',
  UNCOMPLETED = 'Uncompleted',
}

export enum SummaryGroupByDate {
  DAY = 'Day',
  WEEK = 'Week',
  MONTH = 'Month',
}

export const SummaryGroupByDateText = {
  [SummaryGroupByDate.DAY]: 'Daily',
  [SummaryGroupByDate.WEEK]: 'Weekly',
  [SummaryGroupByDate.MONTH]: 'Monthly',
};

export enum LibrarySheetConfirmEnum {
  HIDE,
  SYNCFROM,
  MANAGE,
  EXCEPTION,
}

export const LibrarySheetConfirmEnumText = {
  [LibrarySheetConfirmEnum.MANAGE]: [
    'Complete synchronization',
    'Google Sheet is ready',
    'View Now',
  ],
  [LibrarySheetConfirmEnum.SYNCFROM]: [
    'Import completed',
    'Data import has been completed',
    'Ok',
  ],
  [LibrarySheetConfirmEnum.EXCEPTION]: [
    'Import exception ',
    'Failed to import data to Sheet, please try again later',
    'Ok',
  ],
};

export enum WaybillDispatchTypeEnum {
  STANDARD_DISPATCH = 'Standard Dispatch',
  TEMPORARY_DISPATCH = 'Temporary Dispatch',
}

export const WaybillDispatchTypeEnumText = {
  [WaybillDispatchTypeEnum.STANDARD_DISPATCH]: 'Standard Dispatch',
  [WaybillDispatchTypeEnum.TEMPORARY_DISPATCH]: 'Temporary Dispatch',
};

export enum WaybillStatusEnum {
  PLANNING = 'Planning',
  PENDING = 'Pending',
  IN_TRANSIT = 'In Transit',
  ABNORMAL = 'Abnormal',
  CANCELED = 'Canceled',
  DELIVERED = 'Delivered',
}

export const WaybillStatusEnumText = {
  [WaybillStatusEnum.PLANNING]: 'Planning',
  [WaybillStatusEnum.PENDING]: 'Pending',
  [WaybillStatusEnum.IN_TRANSIT]: 'In Transit',
  [WaybillStatusEnum.DELIVERED]: 'Delivered',
  [WaybillStatusEnum.CANCELED]: 'Canceled',
  [WaybillStatusEnum.ABNORMAL]: 'Abnormal',
};
export enum WaybillFinancialStatusEnum {
  NOT_STARTED = 'Not Started',
  AWAITING_POD_HARD_COPY = 'Awaiting POD HardCopy',
  AWAITING_POD_VERIFICATION = 'Awaiting POD Verification',
  AWAITING_EXCEPTION_HANDLING = 'Awaiting Exception Handling',
  AWAITING_PRICE_VERIFICATION = 'Awaiting Price Verification',
  AWAITING_SETTLEMENT = 'Awaiting Settlement',
  SETTLED = 'Settled',
  CLOSED = 'Closed',
}

export const WaybillFinancialStatusEnumText = {
  [WaybillFinancialStatusEnum.NOT_STARTED]: 'Not Started',
  [WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY]: 'Awaiting POD HardCopy',
  [WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION]:
    'Awaiting POD Verification',
  [WaybillFinancialStatusEnum.AWAITING_EXCEPTION_HANDLING]:
    'Awaiting Exception Handling',
  [WaybillFinancialStatusEnum.AWAITING_PRICE_VERIFICATION]:
    'Awaiting Price Verification',
  [WaybillFinancialStatusEnum.AWAITING_SETTLEMENT]: 'Awaiting Settlement',
  [WaybillFinancialStatusEnum.SETTLED]: 'Settled',
  [WaybillFinancialStatusEnum.CLOSED]: 'Closed',
};
export const WaybillFinancialStatusEnumTextColor = {
  [WaybillFinancialStatusEnum.NOT_STARTED]: '#2F54EB',
  [WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY]: '#009688',
  [WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION]: '#009688',
  [WaybillFinancialStatusEnum.AWAITING_EXCEPTION_HANDLING]: '#009688',
  [WaybillFinancialStatusEnum.AWAITING_PRICE_VERIFICATION]: '#009688',
  [WaybillFinancialStatusEnum.AWAITING_SETTLEMENT]: '#009688',
  [WaybillFinancialStatusEnum.SETTLED]: '#52C41A',
  [WaybillFinancialStatusEnum.CLOSED]: '#FF4D4F',
};

export enum WaybillConsistencyEnum {
  CONSISTENT = 'Consistent',
  IN_CONSISTENT = 'Inconsistent',
}

export const WaybillConsistencyEnumText = {
  [WaybillConsistencyEnum.CONSISTENT]: 'Consistent',
  [WaybillConsistencyEnum.IN_CONSISTENT]: 'Inconsistent',
};

export const WaybillStatusEnumIcon: Record<any, string> = {
  [WaybillStatusEnum.PLANNING]: '#2F54EB',
  [WaybillStatusEnum.PENDING]: '#2F54EB',
  [WaybillStatusEnum.IN_TRANSIT]: '#009688 ',
  [WaybillStatusEnum.ABNORMAL]: '#E73030',
  [WaybillStatusEnum.CANCELED]: '#D9D9D9',
  [WaybillStatusEnum.DELIVERED]: '#52C41A',
};

export const WaybillStatusEnumTextColor = {
  [WaybillStatusEnum.PLANNING]: '#2F54EB',
  [WaybillStatusEnum.PENDING]: '#2F54EB',
  [WaybillStatusEnum.IN_TRANSIT]: '#009688 ',
  [WaybillStatusEnum.ABNORMAL]: '#E73030',
  [WaybillStatusEnum.CANCELED]: '#D9D9D9',
  [WaybillStatusEnum.DELIVERED]: '#52C41A',
};

export enum WaybillReasonEnum {
  NULL = '',
  CANCEL = 'cancel',
  ABNORMAL = 'abnormal',
}
export enum CanceledReasonEnum {
  NOT_ENOUGH_TRUCKER = 'Not Enough Truck (No Penalty)',

  CANNOT_SUPPORT_FIND_REPLACEMENT = 'Cannot Support (Find Replacement, Please Open Another Waybill)',
  CANCELLED_BY_CLIENT = 'Cancelled By Client (Without Pay)',
  CANCELLED_BY_TRUCKER = 'Cancelled By Trucker (Without Pay)',
  CANCELLED_BY_INTELCUK = 'Cancelled By Inteluck (Without Pay)',
  INVOLVED_IN_INCIDENT = 'Involved In Incident (Please Copy To New Waybill)',
  WRONG_CREATION = 'Wrong Creation',
}
export const CanceledReasonEnumText = {
  [CanceledReasonEnum.NOT_ENOUGH_TRUCKER]: 'Not Enough Truck (No Penalty)',

  [CanceledReasonEnum.CANNOT_SUPPORT_FIND_REPLACEMENT]:
    'Cannot Support (Find Replacement, Please Open Another Waybill)',
  [CanceledReasonEnum.CANCELLED_BY_CLIENT]: 'Cancelled By Client (Without Pay)',
  [CanceledReasonEnum.CANCELLED_BY_TRUCKER]:
    'Cancelled By Trucker (Without Pay)',
  [CanceledReasonEnum.CANCELLED_BY_INTELCUK]:
    'Cancelled By Inteluck (Without Pay)',
  [CanceledReasonEnum.INVOLVED_IN_INCIDENT]:
    'Involved In Incident (Please Copy To New Waybill)',
  [CanceledReasonEnum.WRONG_CREATION]: 'Wrong Creation',
};
export enum AbnormalReasonEnum {
  CANNOT_SUPPORT_PENALTY = 'Cannot Support (Penalty)',
  NO_SHOW_REMARK_PENALTY_AMOUNT = 'No Show (Not Find Replacement, Please Remark Penalty Amount)',
  NO_SHOW_OPEN_ANOTHER_WAYBILL = 'No Show (Find Replacement, Please Open Another Waybill)',
  CLIENT_PAY_NOT_PAY_TRUCKER = 'Foul - Client Pay, Not Pay Trucker',
  CLIENT_NOT_PAY_PAY_TRUCKER = 'Foul - Client Not Pay, Pay Trucker (Please Remark Why And Amount)',
  CLIENT_PAY_PAY_TRUCKER = 'Foul - Client Pay, And Pay Trucker',
  REDELIVERY = 'Redelivery (With Pay, Copy To New Waybill)',
  BACKLOAD = 'Backload (With Pay, Copy To New Waybill)',
}
export const AbnormalReasonEnumText = {
  [AbnormalReasonEnum.CANNOT_SUPPORT_PENALTY]: 'Cannot Support (Penalty)',
  [AbnormalReasonEnum.NO_SHOW_REMARK_PENALTY_AMOUNT]:
    'No Show (Not Find Replacement, Please Remark Penalty Amount)',
  [AbnormalReasonEnum.NO_SHOW_OPEN_ANOTHER_WAYBILL]:
    'No Show (Find Replacement, Please Open Another Waybill)',
  [AbnormalReasonEnum.CLIENT_PAY_NOT_PAY_TRUCKER]:
    'Foul - Client Pay, Not Pay Trucker',
  [AbnormalReasonEnum.CLIENT_NOT_PAY_PAY_TRUCKER]:
    'Foul - Client Not Pay, Pay Trucker (Please Remark Why And Amount)',
  [AbnormalReasonEnum.CLIENT_PAY_PAY_TRUCKER]:
    'Foul - Client Pay, And Pay Trucker',
  [AbnormalReasonEnum.REDELIVERY]: 'Redelivery (With Pay, Copy To New Waybill)',
  [AbnormalReasonEnum.BACKLOAD]: 'Backload (With Pay, Copy To New Waybill)',
};

export enum StatisticTimeLatestTypeEnum {
  DATA_SUMMARY = 'dataSummary',
  LAST_7_DAYS_AVG = 'lastSevenDaysAvg',
  PERFORMANCE_COMPARISON = 'performanceComparison',
  TOP_15_CUSTOMER = 'topCustomer',
  TOP_15_PROJECT = 'topProject',
  NEW_CUSTOMER = 'newCustomer',
}

export const SHOW_SHIPPING_RECORD_CARD = [
  WaybillStatusEnum.IN_TRANSIT,
  WaybillStatusEnum.ABNORMAL,
  // WaybillStatusEnum.CANCELED,
  WaybillStatusEnum.DELIVERED,
];

export const CANCEL_SHOW_POD = [
  WaybillStatusEnum.PENDING,
  WaybillStatusEnum.IN_TRANSIT,
];

export const SHOW_BILLING_EDIT = [
  WaybillStatusEnum.PLANNING,
  WaybillStatusEnum.PENDING,
  WaybillStatusEnum.IN_TRANSIT,
  WaybillStatusEnum.DELIVERED,
];

export const FINANCIAL_SHOW_POD_EDIT = [
  WaybillFinancialStatusEnum.NOT_STARTED,
  WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY,
  WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION,
];

export const CARRIER_TITLE_TEXT: Record<number, string> = {
  1: 'Vendor',
  2: 'Truck',
  3: 'Driver',
  4: 'Helper',
};

export enum AdditionSettingsObjectEnum {
  CUSTOMER = 'Customer',
  VENDOR = 'Vendor',
}

export const AdditionSettingsObjectEnumText = {
  [AdditionSettingsObjectEnum.CUSTOMER]: 'Customer',
  [AdditionSettingsObjectEnum.VENDOR]: 'Vendor',
};

export enum AdditionSettingsCalculationEnum {
  INCREASE = 'Increase',
  REDUCE = 'Reduce',
}

export const AdditionSettingsCalculationEnumText = {
  [AdditionSettingsCalculationEnum.INCREASE]: 'Increase',
  [AdditionSettingsCalculationEnum.REDUCE]: 'Reduce',
};

export enum AdditionSettingsItemEnum {
  DEMURRAGE = 'Demurrage',
  ADDTI_DROP = 'Addtl Drop',
  BOOM_TRUCK = 'Boom Truck',
  MANPOWER = 'Manpower',
  BACKLOAD = 'Backload',
}

export const AdditionSettingsItemEnumText = {
  [AdditionSettingsItemEnum.DEMURRAGE]: 'Demurrage',
  [AdditionSettingsItemEnum.ADDTI_DROP]: 'Addtl Drop',
  [AdditionSettingsItemEnum.BOOM_TRUCK]: 'Boom Truck',
  [AdditionSettingsItemEnum.MANPOWER]: 'Manpower',
  [AdditionSettingsItemEnum.BACKLOAD]: 'Backload',
};

export enum ProjectConfirmationWindowEnum {
  THREE = 3,
  FOURE = 4,
  FIVE = 5,
  SIX = 6,
  TWELVE = 12,
  TWENTY_FOUR = 24,
}

export const PROJECT_CONFIRMATION_WINDOW_OPTIONS = [
  {
    label: '3 Hours',
    value: 3,
  },
  {
    label: '4 Hours',
    value: 4,
  },
  {
    label: '5 Hours',
    value: 5,
  },
  {
    label: '6 Hours',
    value: 6,
  },
  {
    label: '12 Hours',
    value: 12,
  },
  {
    label: '24 Hours',
    value: 24,
  },
];

export enum DownLoadStatusEnum {
  COMPLETED = 'Completed',
  EXPORTING = 'Exporting',
  EXCEPTION = 'Exception',
  DOWNLOADED = 'Downloaded',
  READ = 'Read',
}

export enum BatchCreateWaybillsStatus {
  IMPORTING = 'Importing',
  SUCCESS = 'Success',
  FAILURE = 'Failure',
}

export interface LatestTimeData {
  dataSummary: string;
  lastSevenDaysAvg: string;
  newCustomer: string;
  performanceComparison: string;
  topCustomer: string;
  topProject: string;
}

export const LIBRARY_ROUTE_STATUS = [
  {
    label: 'Approved',
    value: 'Approved',
  },
  {
    label: 'Not Approved',
    value: 'Not Approved',
  },
];

export enum GPS_STATUS_ENUM {
  WITH_GPS = 'WITH_GPS',
  NO_GPS = 'NO_GPS',
}

export const GPS_STATUS_ENUM_TEXT = {
  [GPS_STATUS_ENUM.WITH_GPS]: 'With GPS',
  [GPS_STATUS_ENUM.NO_GPS]: 'No GPS',
};

export enum METHOD_OBTAIN_ENUM {
  GPS_OBTAIN = 'GPS_OBTAIN',
  MANUAL_OBTAIN = 'MANUAL_OBTAIN',
}

export enum FieldQueryHighlightUniqueLogicEnum {
  WITH_PROJECT_CUSTOMER_TAG = 1,
  CAPACITY_POOL_VENDOR_DISABLED,
  CREATE_CONTRACT_VENDOR_CHOOSE,
  CAPACITY_POOL_TRUCKS_PLATE_NUMBER,
  PROCESS_SETTING_NODE_ASSIGNEE_CHOOSE = 50,
  BILLING_STATEMENT_NUMBER = 6,
  DASHBOARD_C_P_V_QUERY = 7,
  OPPORTUNITY_PROJECT = 8,
  CREW_PHONE_CODE = 9,
  POOL_ID = 10,
  CLAIM_AFFILIATED_PROJECT = 13,
  CLAIM = 14,
  CLAIM_REQUEST = 15,
}

export enum ROUTE_LIBRARY_IDENTITY {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
}

export enum ROUTE_LIBRARY_MODE {
  ROUTE = 'byRoute',
  DISTANCE = 'byDistance',
}

export const RouteLibraryModeText = {
  [ROUTE_LIBRARY_MODE.ROUTE]: 'Route Pricing(By Route)',
  [ROUTE_LIBRARY_MODE.DISTANCE]: 'Mileage Pricing(By Distance)',
};

export enum ContractTypeEnum {
  CUSTOMER = 'Customer',
  VENDOR = 'Vendor',
}
export enum CapacityPoolDetailTabsUsePlaceEnum {
  PROJECT_DETAIL_CAPACITY_POOLS = 'ProjectDetailCapacityPools',
  CAPACITY_POOLS_DETAIL = 'CapacityPoolsDetail',
}

export const ContractTypeEnumText = {
  [ContractTypeEnum.CUSTOMER]: 'Customer Price Contract for Logistics Project',
  [ContractTypeEnum.VENDOR]: 'Vendor Price Contract for Logistics Project',
};

export enum ContractStatusEnum {
  UNDER_REVIEW = 'Under Review',
  PENDING_EFFECTIVE = 'Pending Effective',
  ACTIVE = 'Active',
  REJECTED = 'Rejected',
  TERMINATED = 'Terminated',
  EXPIRED = 'Expired',
}

export const ContractStatusNoRejectedEnumText = {
  [ContractStatusEnum.UNDER_REVIEW]: 'Under Review',
  [ContractStatusEnum.PENDING_EFFECTIVE]: 'Pending Effective',
  [ContractStatusEnum.ACTIVE]: 'Active',
  [ContractStatusEnum.EXPIRED]: 'Expired',
  [ContractStatusEnum.TERMINATED]: 'Terminated',
};

export const ContractStatusEnumText = {
  ...ContractStatusNoRejectedEnumText,
  [ContractStatusEnum.REJECTED]: 'Rejected',
};

export const ContractStatusEnumColor = {
  [ContractStatusEnum.UNDER_REVIEW]: '#2F54EB',
  [ContractStatusEnum.PENDING_EFFECTIVE]: '#009688',
  [ContractStatusEnum.ACTIVE]: '#52C41A',
  [ContractStatusEnum.REJECTED]: '#D9D9D9',
  [ContractStatusEnum.EXPIRED]: '#FAAD14',
  [ContractStatusEnum.TERMINATED]: '#FF4D4F',
};

export enum FuelChangeFrequencyEnum {
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  EVERY_HALF_YEAR = 'Every half year',
  PER_YEAR = 'Per year',
}

export const FuelChangeFrequencyEnumText = {
  [FuelChangeFrequencyEnum.WEEKLY]: 'Weekly',
  [FuelChangeFrequencyEnum.MONTHLY]: 'Monthly',
  [FuelChangeFrequencyEnum.QUARTERLY]: 'Quarterly',
  [FuelChangeFrequencyEnum.EVERY_HALF_YEAR]: 'Every half year',
  [FuelChangeFrequencyEnum.PER_YEAR]: 'Per year',
};

export enum SignatureStatusEnum {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELED = 'Canceled',
  EXPIRED = 'Expired',
  DECLINED = 'Declined',
}

export const SignatureStatusEnumText = {
  [SignatureStatusEnum.PENDING]: 'Pending',
  [SignatureStatusEnum.COMPLETED]: 'Completed',
  [SignatureStatusEnum.CANCELED]: 'Canceled',
  [SignatureStatusEnum.EXPIRED]: 'Expired',
  [SignatureStatusEnum.DECLINED]: 'Declined',
};

export enum SignerStatusEnum {
  PENDING = 'Pending',
  SIGNING = 'Signing',
  SIGNED = 'Signed',
  DECLINED = 'Declined',
}

export const ProjectCustomerCodeConfigurationObject = {
  Required: true,
  Optional: false,
};

export enum TransmittalTypeEnum {
  CUSTOMER = 'Customer',
  INTELUCK = 'Inteluck',
}

export const PodConfigurationRequirementTypeText = {
  [TransmittalTypeEnum.CUSTOMER]: 'Customer Requirement',
  [TransmittalTypeEnum.INTELUCK]: 'Inteluck Requirement',
};

export const TransmittalTypeEnumText = {
  [TransmittalTypeEnum.CUSTOMER]: 'By Customer',
  [TransmittalTypeEnum.INTELUCK]: 'By Inteluck',
};

export enum TransmittalStatusEnum {
  AWAITING_CONFIRMED = 'Awaiting Confirmed',
  CONFIRMED = 'Confirmed',
  CANCELED = 'Cancelled',
}

export const TransmittalStatusEnumText = {
  [TransmittalStatusEnum.AWAITING_CONFIRMED]: 'Awaiting Confirmed',
  [TransmittalStatusEnum.CONFIRMED]: 'Confirmed',
  [TransmittalStatusEnum.CANCELED]: 'Cancelled',
};

export const TransmittalStatusEnumTextColor = {
  [TransmittalStatusEnum.AWAITING_CONFIRMED]: '#009688',
  [TransmittalStatusEnum.CONFIRMED]: '#52C41A',
  [TransmittalStatusEnum.CANCELED]: '#D9D9D9',
};

export enum PodConfigurationCopyEnum {
  HARD_COPY = 'Hardcopy',
  SOFT_COPY = 'Softcopy',
}

export const PodConfigurationCopyEnumText = {
  [PodConfigurationCopyEnum.HARD_COPY]: 'Hardcopy',
  [PodConfigurationCopyEnum.SOFT_COPY]: 'Softcopy',
};

export enum SubtaskConfigurationProcessStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DRAFT = 'Draft',
}

export enum SubtaskConfigurationTimeEnum {
  DAY = 'Day',
  WEEK = 'Week',
  MOUTH = 'Month',
}

export const SubtaskConfigurationTimeEnumText = {
  [SubtaskConfigurationTimeEnum.DAY]: 'Day',
  [SubtaskConfigurationTimeEnum.WEEK]: 'Week',
  [SubtaskConfigurationTimeEnum.MOUTH]: 'Month',
};

export enum SubtaskStatusEnum {
  IN_PROGRESS = 'In progress',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
}

export const SubtaskStatusEnumText = {
  [SubtaskStatusEnum.IN_PROGRESS]: 'In progress',
  [SubtaskStatusEnum.CANCELLED]: 'Cancelled',
  [SubtaskStatusEnum.COMPLETED]: 'Completed',
};

export const SubtaskStatusEnumTextColor = {
  [SubtaskStatusEnum.IN_PROGRESS]: '#009688',
  [SubtaskStatusEnum.CANCELLED]: '#D9D9D9',
  [SubtaskStatusEnum.COMPLETED]: '#52C41A',
};

export enum FieldTypeEnum {
  TEXT_FIELD = 'TextField',
  TEXT_AREA = 'TextArea',
  RADIO_BUTTON = 'RadioButton',
  CHECKBOX = 'Checkbox',
  DROPDOWN_LIST = 'DropdownList',
  DATE_PICKER = 'DatePicker',
  TIME_PICKER = 'TimePicker',
  FILE_UPLOAD = 'FileUpload',
  CUSTOMER_CHARGE = 'CustomerCharge',
  VENDOR_CHARGE = 'VendorCharge',
  CUSTOMER_CHARGE_GROUP = 'CustomerChargeGroup',
  VENDOR_CHARGE_GROUP = 'VendorChargeGroup',
}
export const FieldTypeEnumText = {
  [FieldTypeEnum.TEXT_FIELD]: 'Text Field',
  [FieldTypeEnum.TEXT_AREA]: 'Text Area',
  [FieldTypeEnum.RADIO_BUTTON]: 'Radio Button',
  [FieldTypeEnum.CHECKBOX]: 'Checkbox',
  [FieldTypeEnum.DROPDOWN_LIST]: 'Dropdown List',
  [FieldTypeEnum.DATE_PICKER]: 'Date Picker',
  [FieldTypeEnum.TIME_PICKER]: 'Time Picker',
  [FieldTypeEnum.FILE_UPLOAD]: 'File Upload',
  [FieldTypeEnum.CUSTOMER_CHARGE]: 'Customer Charge',
  [FieldTypeEnum.VENDOR_CHARGE]: 'Vendor Charge',
  [FieldTypeEnum.CUSTOMER_CHARGE_GROUP]: 'CustomerChargeGroup',
  [FieldTypeEnum.VENDOR_CHARGE_GROUP]: 'VendorChargeGroup',
};

export const CustomerFieldTypeText: Record<string, string> = {
  'Customer Demurrage': 'customerDemurrage',
  'Customer Addtl Drop': 'customerAddtlDrop',
  'Customer Boom Truck': 'customerBoomTruck',
  'Customer Manpower': 'customerManpower',
  'Customer Backload': 'customerBackload',
  None: 'None',
};

export const VendorFieldTypeText: Record<string, string> = {
  'Vendor Demurrage': 'vendorDemurrage',
  'Vendor Addtl Drop': 'vendorAddtlDrop',
  'Vendor Boom Truck': 'vendorBoomTruck',
  'Vendor Manpower': 'vendorManpower',
  'Vendor Backload': 'vendorBackload',
  None: 'None',
};

export enum ApproveActionEnum {
  APPROVED = 'Approve',
  REJECT_TO_PREVIOUS = 'Reject to Previous',
  REJECT_PROCESS = 'Reject Process',
}

export enum BillingAmountStatusEnum {
  PENDING = 'Pending',
  ON_HOLD = 'On Hold',
  VERIFIED = 'Verified',
  BILLED = 'Billed',
  SETTLED = 'Settled',
}

export const BillingAmountStatusEnumText: Record<any, string> = {
  [BillingAmountStatusEnum.PENDING]: 'Pending',
  [BillingAmountStatusEnum.ON_HOLD]: 'On Hold',
  [BillingAmountStatusEnum.VERIFIED]: 'Verified',
  [BillingAmountStatusEnum.BILLED]: 'Billed',
  [BillingAmountStatusEnum.SETTLED]: 'Settled',
};

export const BillingAmountStatusEnumColor: Record<any, string> = {
  [BillingAmountStatusEnum.PENDING]: '#2F54EB',
  [BillingAmountStatusEnum.ON_HOLD]: '#009688',
  [BillingAmountStatusEnum.VERIFIED]: '#009688',
  [BillingAmountStatusEnum.BILLED]: '#009688',
  [BillingAmountStatusEnum.SETTLED]: '#52C41A',
};

export const BillingStatusEnumColor: Record<any, string> = {
  pending: '#2F54EB',
  onHold: '#009688',
  verified: '#009688',
  underPaymentPrep: '#2F54EB',
  underBillingPrep: '#2F54EB',
  awaitCustomerConfirm: '#009688',
  awaitVendorConfirm: '#009688',
  awaitReBill: '#009688',
  unCollected: '#FF4D4F',
  unPaid: '#FF4D4F',
  collected: '#52C41A',
  paid: '#52C41A',
  writeOff: '#FF4D4F',
  billed: '#009688',
  settled: '#52C41A',
};

export const BillingStatusText: Record<any, string> = {
  pending: 'Pending',
  onHold: 'On Hold',
  verified: 'Verified',
  underPaymentPrep: 'Under Payment Preparation',
  underBillingPrep: 'Under Billing Preparation',
  awaitCustomerConfirm: 'Awaiting Customer confirmation',
  awaitVendorConfirm: 'Awaiting Vendor confirmation',
  awaitReBill: 'Awaiting Re-bill',
  unCollected: 'UnCollected',
  unPaid: 'UnPaid',
  collected: 'Collected',
  paid: 'Paid',
  writeOff: 'Write Off',
  billed: 'Billed',
  settled: 'Settled',
};

export enum TaxTypeEnum {
  TAX_INCLUSIVE = 'Vat',
  TAX_EXCLUSIVE = 'Non-Vat',
}

export const TaxTypeEnumText = {
  [TaxTypeEnum.TAX_INCLUSIVE]: 'Vat',
  [TaxTypeEnum.TAX_EXCLUSIVE]: 'Non-Vat',
};

export enum LibraryTaxTypeEnum {
  TAX_INCLUSIVE = 'Tax-Inclusive',
  TAX_EXCLUSIVE = 'Tax-Exclusive',
}

export const LibraryTaxTypeEnumText = {
  [LibraryTaxTypeEnum.TAX_INCLUSIVE]: 'Tax-Inclusive',
  [LibraryTaxTypeEnum.TAX_EXCLUSIVE]: 'Tax-Exclusive',
};

export const EditSettlementItemsEnumOptions = [
  { label: 'Land transportation', value: 'Land transportation' },
  { label: 'Freight forwarding', value: 'Freight forwarding' },
  {
    label: 'Domestic shipping line services',
    value: 'Domestic shipping line services',
  },
  { label: 'Warehouse services', value: 'Warehouse services' },
];

export enum StatementAssociationTypeEnum {
  INDEPENDENT_STATEMENT = 'independent',
  WAYBILL_STATEMENT = 'waybill',
}

export const StatementAssociationTypeEnumText = {
  [StatementAssociationTypeEnum.INDEPENDENT_STATEMENT]: 'Independent Statement',
  [StatementAssociationTypeEnum.WAYBILL_STATEMENT]: 'Waybill Statement',
};
export enum CustomerStatementStatusEnum {
  UNDER_BILLING_PREP = 'underBillingPrep',
  AWAIT_CUSTOMER_CONFIRM = 'awaitCustomerConfirm',
  AWAITING_REBILL = 'awaitReBill',
  PENDING_COLLECTION = 'pendingCollection',
  PARTIALLY_COLLECTED = 'partiallyCollected',
  OVER_COLLECTED = 'overCollected',
  FULLY_COLLECTED = 'fullyCollected',
  COLLECTED = 'collected',
  WRITTEN_OFF = 'writtenOff',
  CANCELED = 'canceled',
}

export const CustomerStatementStatusEnumText = {
  [CustomerStatementStatusEnum.UNDER_BILLING_PREP]: 'Under Billing Preparation',
  [CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM]:
    'Awaiting Customer Confirmation',
  [CustomerStatementStatusEnum.AWAITING_REBILL]: 'Awaiting Re-bill',
  [CustomerStatementStatusEnum.PENDING_COLLECTION]: 'Pending Collection',
  [CustomerStatementStatusEnum.PARTIALLY_COLLECTED]: 'Partially Collected',
  [CustomerStatementStatusEnum.OVER_COLLECTED]: 'Over Collected',
  [CustomerStatementStatusEnum.FULLY_COLLECTED]: 'Fully Collected',
  [CustomerStatementStatusEnum.WRITTEN_OFF]: 'Written Off',
  [CustomerStatementStatusEnum.COLLECTED]: 'Collected',
  [CustomerStatementStatusEnum.CANCELED]: 'Canceled',
};

export const CustomerStatementStatusEnumIconColor: Record<any, string> = {
  [CustomerStatementStatusEnum.UNDER_BILLING_PREP]: '#2F54EB',
  [CustomerStatementStatusEnum.AWAIT_CUSTOMER_CONFIRM]: '#009688',
  [CustomerStatementStatusEnum.AWAITING_REBILL]: '#009688',
  [CustomerStatementStatusEnum.PENDING_COLLECTION]: '#009688',
  [CustomerStatementStatusEnum.PARTIALLY_COLLECTED]: '#009688',
  [CustomerStatementStatusEnum.OVER_COLLECTED]: '#009688',
  [CustomerStatementStatusEnum.FULLY_COLLECTED]: '#009688',
  [CustomerStatementStatusEnum.COLLECTED]: '#52C41A',
  [CustomerStatementStatusEnum.WRITTEN_OFF]: '#FF4D4F',
  [CustomerStatementStatusEnum.CANCELED]: '#D9D9D9',
};

export enum VendorStatementStatusEnum {
  UNDER_PAYMENT_PREP = 'underPaymentPrep',
  AWAIT_VENDOR_CONFIRM = 'awaitVendorConfirm',
  AWAITING_REBILL = 'awaitReBill',
  PENDING_PAYMENT = 'pendingPayment',
  PARTIALLY_PAID = 'partiallyPaid',
  FULLY_PAID = 'fullyPaid',
  PAID = 'paid',
  WRITTEN_OFF = 'writtenOff',
  CANCELED = 'canceled',
}

export const VendorStatementStatusEnumText = {
  [VendorStatementStatusEnum.UNDER_PAYMENT_PREP]: 'Under Payment Preparation',
  [VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM]:
    'Awaiting Vendor Confirmation',
  [VendorStatementStatusEnum.AWAITING_REBILL]: 'Awaiting Re-bill',
  [VendorStatementStatusEnum.PENDING_PAYMENT]: 'Pending Payment',
  [VendorStatementStatusEnum.PARTIALLY_PAID]: 'Partially Paid',
  [VendorStatementStatusEnum.FULLY_PAID]: 'Fully Paid',
  [VendorStatementStatusEnum.WRITTEN_OFF]: 'Written Off',
  [VendorStatementStatusEnum.PAID]: 'Paid',
  [VendorStatementStatusEnum.CANCELED]: 'Canceled',
};

export const VendorStatementStatusEnumIconColor: Record<any, string> = {
  [VendorStatementStatusEnum.UNDER_PAYMENT_PREP]: '#2F54EB',
  [VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM]: '#009688',
  [VendorStatementStatusEnum.AWAITING_REBILL]: '#009688',
  [VendorStatementStatusEnum.PENDING_PAYMENT]: '#009688',
  [VendorStatementStatusEnum.PARTIALLY_PAID]: '#009688',
  [VendorStatementStatusEnum.FULLY_PAID]: '#009688',
  [VendorStatementStatusEnum.PAID]: '#52C41A',
  [VendorStatementStatusEnum.WRITTEN_OFF]: '#FF4D4F',
  [VendorStatementStatusEnum.CANCELED]: '#D9D9D9',
};

export enum WaybillBillingBasicStatusEnum {
  PENDING = 'pending',
  ON_HOLD = 'onHold',
  VERIFIED = 'verified',
  BILLED = 'billed',
  SETTLED = 'settled',
}

export enum StatementTypeEnum {
  CUSTOMER = 'Customer',
  VENDOR = 'Vendor',
}

export enum SettlementTimeTypeEnum {
  POSITION_TIME = 'positionTime',
  DELIVERY_TIME = 'deliveryTime',
  UNLOADING_TIME = 'unloadingTime',
}

export const SettlementTimeTypeOptions = [
  {
    label: 'Position Time',
    value: SettlementTimeTypeEnum.POSITION_TIME,
  },
  {
    label: 'Delivery Time',
    value: SettlementTimeTypeEnum.DELIVERY_TIME,
  },
  {
    label: 'Unloading Time',
    value: SettlementTimeTypeEnum.UNLOADING_TIME,
  },
];

export enum CustomerSettledItemEnum {
  CUSTOMER_BASIC_AMOUNT = 'customerBasicAmount',
  CUSTOMER_EXCEPTION_FEE = 'customerExceptionFee',
  CUSTOMER_ADDITIONAL_CHARGE = 'customerAdditionalCharge',
  CUSTOMER_CLAIM = 'customerClaim',
  CUSTOMER_REIMBURSEMENT_EXPENSE = 'customerReimbursementExpense',
}

export const CustomerSettledItemListOptions = [
  {
    label: 'Customer Basic Amount',
    value: CustomerSettledItemEnum.CUSTOMER_BASIC_AMOUNT,
  },
  {
    label: 'Customer Exception Fee',
    value: CustomerSettledItemEnum.CUSTOMER_EXCEPTION_FEE,
  },
  {
    label: 'Customer Additional Charge',
    value: CustomerSettledItemEnum.CUSTOMER_ADDITIONAL_CHARGE,
  },
  // {
  //   label: 'Customer Claim',
  //   value: CustomerSettledItemEnum.CUSTOMER_CLAIM,
  // },
  {
    label: 'Reimbursement Expense',
    value: CustomerSettledItemEnum.CUSTOMER_REIMBURSEMENT_EXPENSE,
  },
];

export const CustomerSettledItemEnumText = {
  [CustomerSettledItemEnum.CUSTOMER_BASIC_AMOUNT]: 'Customer Basic Amount',
  [CustomerSettledItemEnum.CUSTOMER_EXCEPTION_FEE]: 'Customer Exception Fee',
  [CustomerSettledItemEnum.CUSTOMER_ADDITIONAL_CHARGE]:
    'Customer Additional Charge',
  [CustomerSettledItemEnum.CUSTOMER_CLAIM]: 'Customer Claim',
  [CustomerSettledItemEnum.CUSTOMER_REIMBURSEMENT_EXPENSE]:
    'Customer Reimbursement Expense',
};

export enum VendorSettledItemEnum {
  PAID_IN_ADVANCE = 'paidInAdvance',
  REGULAR_PAYMENTS = 'regularPayments',
  VENDOR_EXCEPTION_FEE = 'vendorExceptionFee',
  VENDOR_ADDITIONAL_CHARGE = 'vendorAdditionalCharge',
  VENDOR_CUSTOMER_CLAIM = 'vendorClaim',
  VENDOR_REIMBURSEMENT_EXPENSE = 'vendorReimbursementExpense',
}

export const VendorSettledItemListOptions = [
  {
    label: 'Paid in advance',
    value: VendorSettledItemEnum.PAID_IN_ADVANCE,
  },
  {
    label: 'Regular Payments',
    value: VendorSettledItemEnum.REGULAR_PAYMENTS,
  },
  {
    label: 'Vendor Exception Fee',
    value: VendorSettledItemEnum.VENDOR_EXCEPTION_FEE,
  },
  {
    label: 'Vendor Additional Charge',
    value: VendorSettledItemEnum.VENDOR_ADDITIONAL_CHARGE,
  },
  // {
  //   label: 'Vendor Claim',
  //   value: VendorSettledItemEnum.VENDOR_CUSTOMER_CLAIM,
  // },
  {
    label: 'Reimbursement Expense',
    value: VendorSettledItemEnum.VENDOR_REIMBURSEMENT_EXPENSE,
  },
];

export const VendorSettledItemEnumText = {
  [VendorSettledItemEnum.PAID_IN_ADVANCE]: 'Paid in advance',
  [VendorSettledItemEnum.REGULAR_PAYMENTS]: 'Regular Payments',
  [VendorSettledItemEnum.VENDOR_EXCEPTION_FEE]: 'Vendor Exception Fee',
  [VendorSettledItemEnum.VENDOR_ADDITIONAL_CHARGE]: 'Vendor Additional Charge',
  [VendorSettledItemEnum.VENDOR_CUSTOMER_CLAIM]: 'Vendor Claim',
  [VendorSettledItemEnum.VENDOR_REIMBURSEMENT_EXPENSE]: 'Reimbursement Expense',
};

export type SettledItemEnum = CustomerSettledItemEnum | VendorSettledItemEnum;

export enum BasicAmountStatusEnum {
  ON_HOLD = 'onHold',
  VERIFIED = 'verified',
  BILLED = 'billed',
  NO_SETTLEMENT = 'noSettlement',
  NO_VERIFIED = 'noVerified',
}

export enum AdditionalChargeStatusEnum {
  ON_HOLD = 'onHold',
  VERIFIED = 'verified',
  BILLED = 'billed',
  NO_SETTLEMENT = 'noSettlement',
  NO_VERIFIED = 'noVerified',
}

export enum ExceptionFeeStatusEnum {
  ON_HOLD = 'onHold',
  VERIFIED = 'verified',
  BILLED = 'billed',
  NO_SETTLEMENT = 'noSettlement',
  NO_VERIFIED = 'noVerified',
}
export enum ReimbursementExpenseStatusEnum {
  ON_HOLD = 'onHold',
  VERIFIED = 'verified',
  BILLED = 'billed',
  NO_SETTLEMENT = 'noSettlement',
  NO_VERIFIED = 'noVerified',
}

export enum ClaimStatusEnum {
  ON_HOLD = 'onHold',
  VERIFIED = 'verified',
  BILLED = 'billed',
  NO_SETTLEMENT = 'noSettlement',
  NO_VERIFIED = 'noVerified',
}

export enum PaidInAdvanceStatusEnum {
  ON_HOLD = 'onHold',
  VERIFIED = 'verified',
  BILLED = 'billed',
  NO_SETTLEMENT = 'noSettlement',
  NO_VERIFIED = 'noVerified',
}

export enum RegularPaymentsStatusEnum {
  ON_HOLD = 'onHold',
  VERIFIED = 'verified',
  BILLED = 'billed',
  NO_SETTLEMENT = 'noSettlement',
  NO_VERIFIED = 'noVerified',
}

export const SettledItemListText: Record<any, any> = {
  [CustomerSettledItemEnum.CUSTOMER_BASIC_AMOUNT]: 'Customer Basic Amount',
  [CustomerSettledItemEnum.CUSTOMER_EXCEPTION_FEE]: 'Customer Exception Fee',
  [CustomerSettledItemEnum.CUSTOMER_ADDITIONAL_CHARGE]:
    'Customer Additional Charge',
  [CustomerSettledItemEnum.CUSTOMER_CLAIM]: 'Customer Claim',
  [CustomerSettledItemEnum.CUSTOMER_REIMBURSEMENT_EXPENSE]:
    'Customer Reimbursement Expense',
  [VendorSettledItemEnum.PAID_IN_ADVANCE]: 'Paid in advance',
  [VendorSettledItemEnum.REGULAR_PAYMENTS]: 'Regular Payments',
  [VendorSettledItemEnum.VENDOR_EXCEPTION_FEE]: 'Vendor Exception Fee',
  [VendorSettledItemEnum.VENDOR_ADDITIONAL_CHARGE]: 'Vendor Additional Charge',
  [VendorSettledItemEnum.VENDOR_CUSTOMER_CLAIM]: 'Vendor Claim',
  [VendorSettledItemEnum.VENDOR_REIMBURSEMENT_EXPENSE]:
    'Vendor Reimbursement Expense',
};

export enum UploadPathTypeEnum {
  TRANSMITTAL = 'TRANSMITTAL',
  WAYBILL_POD = 'WAYBILL_POD',
  LEAD_LOGO = 'LEAD_LOGO',
  OPPORTUNITY_FOLLOW_UP = 'OPPORTUNITY_FOLLOW_UP',
  STATEMENT_RECEIPT = 'STATEMENT_RECEIPT',
  STATEMENT_PROOF = 'STATEMENT_PROOF',
  STATEMENT_INVOICE = 'STATEMENT_INVOICE',
  CONTRACT = 'CONTRACT',
  SUBTASK = 'SUBTASK',
  TRUCK = 'TRUCK',
  VENDOR = 'VENDOR',
  CREW = 'CREW',
  CREW_STATUS_CHANGE_PROOF = 'CREW_STATUS_CHANGE_PROOF',
}

export enum LogisticsCategoryEnum {
  TRANSPORTATION = 'transportation',
  FREIGHT_FORWARDING = 'freightForwarding',
}

export enum ServiceCategoryEnum {
  TRANSPORT = 'Truck Transport',
  DELIVERY = 'CC+Delivery',
}

export const ServiceCategoryEnumText = {
  [ServiceCategoryEnum.TRANSPORT]: 'Truck Transport',
  [ServiceCategoryEnum.DELIVERY]: 'CC+Delivery',
};

export enum LogisticsFlowEnum {
  DOMESTIC = 'Domestic',
  IMPORT = 'Import',
  EXPORT = 'Export',
}

export const LogisticsFlowEnumText = {
  [LogisticsFlowEnum.DOMESTIC]: 'Domestic',
  [LogisticsFlowEnum.IMPORT]: 'Import',
  [LogisticsFlowEnum.EXPORT]: 'Export',
};

export enum DistanceEnum {
  DROPS = 'Drops',
  LONG = 'Long',
}

export const DistanceEnumText = {
  [DistanceEnum.DROPS]: 'Drops',
  [DistanceEnum.LONG]: 'Long',
};

export enum LeadStatusEnum {
  OPEN = 'Open',
  FOLLOWING_UP = 'Following Up',
  DORMANT = 'Dormant',
  SUCCESSFUL_CLOSED = 'Successful Closed',
}

export const LeadStatusEnumText = {
  [LeadStatusEnum.OPEN]: 'Open',
  [LeadStatusEnum.FOLLOWING_UP]: 'Following Up',
  [LeadStatusEnum.DORMANT]: 'Dormant',
  [LeadStatusEnum.SUCCESSFUL_CLOSED]: 'Successful Closed',
};

export const LeadStatusEnumTextColor = {
  [LeadStatusEnum.OPEN]: '#2F54EB',
  [LeadStatusEnum.FOLLOWING_UP]: '#009688',
  [LeadStatusEnum.DORMANT]: '#D9D9D9',
  [LeadStatusEnum.SUCCESSFUL_CLOSED]: '#52C41A',
};

export const OpportunitiesLeadStatusEnumTextColor = {
  [LeadStatusEnum.OPEN]: '#2F54EB',
  [LeadStatusEnum.FOLLOWING_UP]: '#009688',
  [LeadStatusEnum.DORMANT]: '#D9D9D9',
  [LeadStatusEnum.SUCCESSFUL_CLOSED]: '#52C41A',
  [CustomerStatusEnum.PUBLIC]: '#2F54EB',
  [CustomerStatusEnum.PREPARING]: '#009688',
  [CustomerStatusEnum.IN_SERVICE]: '#52C41A',
};

export enum FollowUpCheckEnum {
  NORMAL = 'Normal',
  OVERTIME = 'Overtime',
}

export const FollowUpCheckEnumText = {
  [FollowUpCheckEnum.NORMAL]: 'Normal',
  [FollowUpCheckEnum.OVERTIME]: 'Overtime',
};
export const FollowUpCheckEnumColor = {
  [FollowUpCheckEnum.NORMAL]: '#52C41A',
  [FollowUpCheckEnum.OVERTIME]: '#FF4D4F',
};

export enum OpportunitiesStatusEnum {
  REACH_OUT = 'Reach Out',
  SUCCESSFUL_CONTACTED_PENDING_CUSTOMER_MEETING = 'Successful Contacted-Pending Customer Meeting',
  SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE = 'Successful Contacted-Requirement Acquire',
  QUOTATION_REQUEST_RECEIVED = 'Quotation Request Received',
  QUOTATION_SUBMITTED_WAITING_FEEDBACK = 'Quotation Submitted-Waiting Feedback',
  QUOTATION_SUBMITTED_QUOTATION_UPDATE = 'Quotation Submitted-Quotation Update',
  SUCCESSFUL_CLOSED = 'Successful Closed',
  LOST = 'Lost',
  CANCELED = 'Canceled',
}

export const OpportunitiesStatusEnumText = {
  [OpportunitiesStatusEnum.REACH_OUT]: 'Reach Out',
  [OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_PENDING_CUSTOMER_MEETING]:
    'Successful Contacted-Pending Customer Meeting',
  [OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE]:
    'Successful Contacted-Requirement Acquire',
  [OpportunitiesStatusEnum.QUOTATION_REQUEST_RECEIVED]:
    'Quotation Request Received',
  [OpportunitiesStatusEnum.QUOTATION_SUBMITTED_WAITING_FEEDBACK]:
    'Quotation Submitted-Waiting Feedback',
  [OpportunitiesStatusEnum.QUOTATION_SUBMITTED_QUOTATION_UPDATE]:
    'Quotation Submitted-Quotation Update',
  [OpportunitiesStatusEnum.SUCCESSFUL_CLOSED]: 'Successful Closed',
  [OpportunitiesStatusEnum.LOST]: 'Lost',
  [OpportunitiesStatusEnum.CANCELED]: 'Canceled',
};

export const OpportunitiesStatusEnumColor = {
  [OpportunitiesStatusEnum.REACH_OUT]: '#2F54EB',
  [OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_PENDING_CUSTOMER_MEETING]:
    '#009688',
  [OpportunitiesStatusEnum.SUCCESSFUL_CONTACTED_REQUIREMENT_ACQUIRE]: '#009688',
  [OpportunitiesStatusEnum.QUOTATION_REQUEST_RECEIVED]: '#009688',
  [OpportunitiesStatusEnum.QUOTATION_SUBMITTED_WAITING_FEEDBACK]: '#009688',
  [OpportunitiesStatusEnum.QUOTATION_SUBMITTED_QUOTATION_UPDATE]: '#009688',
  [OpportunitiesStatusEnum.SUCCESSFUL_CLOSED]: '#52C41A',
  [OpportunitiesStatusEnum.LOST]: '#FF4D4F',
  [OpportunitiesStatusEnum.CANCELED]: '#D9D9D9',
};

export enum OpportunitiesCustomerTypeEnum {
  EXISTING_CUSTOMER = 'Existing Customer',
  NEW_CUSTOMER = 'New Customer',
}

export const OpportunitiesCustomerTypeEnumText = {
  [OpportunitiesCustomerTypeEnum.EXISTING_CUSTOMER]: 'Existing Customer',
  [OpportunitiesCustomerTypeEnum.NEW_CUSTOMER]: 'New Customer',
};

export enum OpportunitiesCustomerStatusEnum {
  OPEN = 'Open',
  FOLLOWING_UP = 'Following Up',
  DORMANT = 'Dormant',
  SUCCESSFUL_CLOSED = 'Successful Closed',
  PUBLIC = 'Public',
  PREPARING = 'Preparing',
  IN_SERVICE = 'In Service',
}

export const OpportunitiesCustomerStatusEnumText = {
  [OpportunitiesCustomerStatusEnum.OPEN]: 'Open',
  [OpportunitiesCustomerStatusEnum.FOLLOWING_UP]: 'Following Up',
  [OpportunitiesCustomerStatusEnum.DORMANT]: 'Dormant',
  [OpportunitiesCustomerStatusEnum.SUCCESSFUL_CLOSED]: 'Successful Closed',
  [OpportunitiesCustomerStatusEnum.PUBLIC]: 'Public',
  [OpportunitiesCustomerStatusEnum.PREPARING]: 'Preparing',
  [OpportunitiesCustomerStatusEnum.IN_SERVICE]: 'In Service',
};

export const OpportunitiesCustomerStatusEnumColor = {
  [OpportunitiesCustomerStatusEnum.OPEN]: '#2F54EB',
  [OpportunitiesCustomerStatusEnum.FOLLOWING_UP]: '#009688',
  [OpportunitiesCustomerStatusEnum.DORMANT]: '#D9D9D9',
  [OpportunitiesCustomerStatusEnum.SUCCESSFUL_CLOSED]: '#52C41A',
  [OpportunitiesCustomerStatusEnum.PUBLIC]: '#2F54EB',
  [OpportunitiesCustomerStatusEnum.PREPARING]: '#009688',
  [OpportunitiesCustomerStatusEnum.IN_SERVICE]: '#52C41A',
};

export enum RequirementTypeEnum {
  RFQ = 'RFQ',
  BIDDING = 'Bidding',
}

export const RequirementTypeEnumText = {
  [RequirementTypeEnum.RFQ]: 'RFQ',
  [RequirementTypeEnum.BIDDING]: 'Bidding',
};
export enum CurrentRequirementEnum {
  TRUCKING_DRY = 'Trucking (Dry)',
  TRUCKING_REEFER = 'Trucking (Reefer)',
  DFF_LCL = 'DFF (LCL)',
  DFF_FCL = 'DFF (FCL)',
  IFF_LCL = 'IFF (LCL)',
  IFF_FCL = 'IFF (FCL)',
  CUSTOMS_BROKERAGE = 'Customs Brokerage',
  WAREHOUSE_STORAGE = 'Warehouse & Storage',
  CONTRACT_LOGISTICS = 'Contract Logistics',
}

export const CurrentRequirementEnumText = {
  [CurrentRequirementEnum.TRUCKING_DRY]: 'Trucking (Dry)',
  [CurrentRequirementEnum.TRUCKING_REEFER]: 'Trucking (Reefer)',
  [CurrentRequirementEnum.DFF_LCL]: 'DFF (LCL)',
  [CurrentRequirementEnum.DFF_FCL]: 'DFF (FCL)',
  [CurrentRequirementEnum.IFF_LCL]: 'IFF (LCL)',
  [CurrentRequirementEnum.IFF_FCL]: 'IFF (FCL)',
  [CurrentRequirementEnum.CUSTOMS_BROKERAGE]: 'Customs Brokerage',
  [CurrentRequirementEnum.WAREHOUSE_STORAGE]: 'Warehouse & Storage',
  [CurrentRequirementEnum.CONTRACT_LOGISTICS]: 'Contract Logistics',
};

export enum PotentialRequirementEnum {
  LAND_TRANSPORTATION = 'Land Transportation',
  INTERNATIONAL_FREIGHT_FORWARDING = 'International Freight Forwarding',
  WAREHOUSE_STORAGE = 'Warehouse & Storage',
  SOURCING_AND_SUPPLY = 'Sourcing and Supply',
}

export const PotentialRequirementEnumText = {
  [PotentialRequirementEnum.LAND_TRANSPORTATION]: 'Land Transportation',
  [PotentialRequirementEnum.INTERNATIONAL_FREIGHT_FORWARDING]:
    'International Freight Forwarding',
  [PotentialRequirementEnum.WAREHOUSE_STORAGE]: 'Warehouse & Storage',
  [PotentialRequirementEnum.SOURCING_AND_SUPPLY]: 'Sourcing and Supply',
};

export enum RequirementFrequencyEnum {
  ON_CALL_STABLE_VOLUME = 'On Call - Stable Volume',
  ON_CALL_ON_DEMAND_VOLUME = 'On Call - On Demand Volume',
  LOCK_IN = 'Lock In',
}

export const RequirementFrequencyEnumText = {
  [RequirementFrequencyEnum.ON_CALL_STABLE_VOLUME]: 'On Call - Stable Volume',
  [RequirementFrequencyEnum.ON_CALL_ON_DEMAND_VOLUME]:
    'On Call - On Demand Volume',
  [RequirementFrequencyEnum.LOCK_IN]: 'Lock In',
};

export enum PotentialVolumeFrequencyEnum {
  Daily = 'Daily',
  MONTHLY = 'Monthly',
  QUARTERLY = 'Quarterly',
  YEARLY = 'Yearly',
}

export const PotentialVolumeFrequencyEnumText = {
  [PotentialVolumeFrequencyEnum.Daily]: 'Daily',
  [PotentialVolumeFrequencyEnum.MONTHLY]: 'Monthly',
  [PotentialVolumeFrequencyEnum.QUARTERLY]: 'Quarterly',
  [PotentialVolumeFrequencyEnum.YEARLY]: 'Yearly',
};

export enum BUEnum {
  GLOBAL_FORWARDING = 'Global Forwarding',
  TRUCK_TRANSPORTATION = 'Trucking and Transportation',
  WAREHOUSE_STORAGE = 'Warehousing and Storage',
  CONTRACT_LOGISTICS = 'Contract Logistics',
  SOURCING_AND_SUPPLY_SOLUTION = 'Sourcing & Supply Solution',
  SUPPLY_CHAIN_TECHNOLOGY_AND_OTHERS = 'Supply Chain Technology and Others',
}

export const BUEnumText = {
  [BUEnum.GLOBAL_FORWARDING]: 'Global Forwarding',
  [BUEnum.TRUCK_TRANSPORTATION]: 'Trucking and Transportation',
  [BUEnum.WAREHOUSE_STORAGE]: 'Warehousing and Storage',
  [BUEnum.CONTRACT_LOGISTICS]: 'Contract Logistics',
  [BUEnum.SOURCING_AND_SUPPLY_SOLUTION]: 'Sourcing & Supply Solution',
  [BUEnum.SUPPLY_CHAIN_TECHNOLOGY_AND_OTHERS]:
    'Supply Chain Technology and Others',
};

export enum ReachOutChannelEnum {
  TELEMARKETING = 'Telemarketing',
  INSTANT_MESSAGING = 'Instant Messaging',
  EMAIL = 'Email',
  ONSITE_VISIT = 'Onsite Visit',
}

export const ReachOutChannelEnumText = {
  [ReachOutChannelEnum.TELEMARKETING]: 'Telemarketing',
  [ReachOutChannelEnum.INSTANT_MESSAGING]: 'Instant Messaging',
  [ReachOutChannelEnum.EMAIL]: 'Email',
  [ReachOutChannelEnum.ONSITE_VISIT]: 'Onsite Visit',
};

export enum VisitTypeEnum {
  ONSITE_VISIT = 'Onsite Visit',
  CALL = 'Call',
  MESSAGE = 'Message',
  EMAIL = 'Email',
}

export const VisitTypeEnumText = {
  [VisitTypeEnum.ONSITE_VISIT]: 'Onsite Visit',
  [VisitTypeEnum.CALL]: 'Call',
  [VisitTypeEnum.MESSAGE]: 'Message',
  [VisitTypeEnum.EMAIL]: 'Email',
};

export enum LeadsFunnelByType {
  TEAM = 'Team',
  PERSONAL = 'Personal',
}

export enum PicTypeEnum {
  BD = 'BD',
  CAM = 'CAM',
}

export const PicTypeEnumText = {
  [PicTypeEnum.BD]: 'BD',
  [PicTypeEnum.CAM]: 'CAM',
};

export enum GetUserGuidanceEnum {
  EXPORT_DOWNLOAD_MANAGE = 'ExportDownloadManage',
}

export enum LibraryDetailPricingStatusEnum {
  PENDING_EFFECTIVE = 'Pending Effective',
  ACTIVE = 'Active',
  TERMINATED = 'Terminated',
  EXPIRED = 'Expired',
}

export const LibraryDetailPricingStatusEnumColor = {
  [LibraryDetailPricingStatusEnum.PENDING_EFFECTIVE]: '#009688',
  [LibraryDetailPricingStatusEnum.ACTIVE]: '#52C41A',
  [LibraryDetailPricingStatusEnum.EXPIRED]: '#D9D9D9',
  [LibraryDetailPricingStatusEnum.TERMINATED]: '#FF4D4F',
};

export const LibraryDetailPricingStatusEnumText = {
  [LibraryDetailPricingStatusEnum.PENDING_EFFECTIVE]: 'Pending Effective',
  [LibraryDetailPricingStatusEnum.ACTIVE]: 'Active',
  [LibraryDetailPricingStatusEnum.EXPIRED]: 'Expired',
  [LibraryDetailPricingStatusEnum.TERMINATED]: 'Terminated',
};

export enum EnumVAT {
  ZERO = '0',
  SEVEN = '7',
  EXEMPT = 'Exempt',
}

export enum EnumWHT {
  ZERO = 0,
  ONE = 1,
  THREE = 3,
}

export enum CurrencyNameEnum {
  PESO = 'PESO',
  BAHT = 'BAHT',
  DOLLAR = 'DOLLAR',
  YUAN = 'YUAN',
  RM = 'RM',
}

export enum ApplicationStatusEnum {
  UNDER_REVIEW = 'underReview',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const ApplicationStatusEnumText = {
  [ApplicationStatusEnum.UNDER_REVIEW]: 'Under Review',
  [ApplicationStatusEnum.APPROVED]: 'Approved',
  [ApplicationStatusEnum.REJECTED]: 'Rejected',
};

export const ApplicationStatusEnumColor = {
  [ApplicationStatusEnum.UNDER_REVIEW]: '#009688',
  [ApplicationStatusEnum.APPROVED]: '#52C41A',
  [ApplicationStatusEnum.REJECTED]: '#FF4D4F',
};

export enum TruckTransportationStatusEnum {
  AVAILABLE = 'Available',
  TRANSIT = 'Transit',
}

export const TruckTransportationStatusEnumText = {
  [TruckTransportationStatusEnum.AVAILABLE]: 'Available',
  [TruckTransportationStatusEnum.TRANSIT]: 'Transit',
};

export const TruckTransportationStatusEnumColor = {
  [TruckTransportationStatusEnum.AVAILABLE]: '#52C41A',
  [TruckTransportationStatusEnum.TRANSIT]: ' #009688',
};

export enum ApplicationTypeEnum {
  VENDOR = 'Vendor',
  TRUCK = 'Truck',
  CREW = 'Crew',
}

export const ApplicationTypeEnumText = {
  [ApplicationTypeEnum.VENDOR]: 'Vendor',
  [ApplicationTypeEnum.TRUCK]: 'Truck',
  [ApplicationTypeEnum.CREW]: 'Crew',
};

export enum CrewStatusEnum {
  UNACCREDITED = 'Unaccredited',
  ACCREDITED = 'Accredited',
  INACTIVE = 'Inactive',
  BLOCKED = 'Blocked',
}

export const CrewStatusEnumText = {
  [CrewStatusEnum.UNACCREDITED]: 'Unaccredited',
  [CrewStatusEnum.ACCREDITED]: 'Accredited',
  [CrewStatusEnum.INACTIVE]: 'Inactive',
  [CrewStatusEnum.BLOCKED]: 'Blocked',
};

export const CrewStatusEnumColor = {
  [CrewStatusEnum.UNACCREDITED]: '#2F54EB',
  [CrewStatusEnum.ACCREDITED]: '#52C41A',
  [CrewStatusEnum.INACTIVE]: '#FF4D4F',
  [CrewStatusEnum.BLOCKED]: '#D9D9D9',
};

export enum CrewTypeEnum {
  DRIVER = 'Driver',
  HELPER = 'Helper',
}

export const CrewTypeEnumText = {
  [CrewTypeEnum.DRIVER]: 'Driver',
  [CrewTypeEnum.HELPER]: 'Helper',
};

export enum EnumCrewBlockReasonType {
  THEFT = 'Theft',
  PILFERAGE = 'Pilferage',
  TAMPERING_FALSIFICATION = 'Tampering/Falsification',
  POSITIVE_IN_DRUG_TEST = 'Positive in Drug Test',
  MISCONDUCT_IMPROPER_BEHAVIOR = 'Misconduct/Improper behavior',
  OTHERS = 'Others',
}

export enum ClaimRequestStatusEnum {
  PENDING_OC = 'pendingOC',
  SPLITTING = 'splitting',
  SPLIT = 'split',
  SPLIT_FAILED = 'splitFailed',
  CANCELED = 'canceled',
}

export const ClaimRequestStatusEnumText = {
  [ClaimRequestStatusEnum.PENDING_OC]: 'Pending OC',
  [ClaimRequestStatusEnum.SPLITTING]: 'Splitting',
  [ClaimRequestStatusEnum.SPLIT]: 'Split',
  [ClaimRequestStatusEnum.SPLIT_FAILED]: 'Split Failed',
  [ClaimRequestStatusEnum.CANCELED]: 'Canceled',
};

export const ClaimRequestStatusEnumColor = {
  [ClaimRequestStatusEnum.PENDING_OC]: '#009688',
  [ClaimRequestStatusEnum.SPLITTING]: '#52C41A',
  [ClaimRequestStatusEnum.SPLIT]: '#52C41A',
  [ClaimRequestStatusEnum.SPLIT_FAILED]: '#FF4D4F',
  [ClaimRequestStatusEnum.CANCELED]: '#D9D9D9',
};

export enum PriceInquiryVersionEnum {
  V1 = 'priceInquiryV1',
  V2 = 'priceInquiryV2',
}

export enum EnumTaxRateStatus {
  ENABLEMENT = 'Enablement',
  DISABLEMENT = 'Disablement',
}

export enum ClaimTicketTabKey {
  CLAIM_TICKET = 'claimTicket',
  REFUND_TICKET = 'refundTicket',
  CLAIM_REQUEST = 'claimRequest',
}
export enum StatementGetTaxRateEnum {
  BASIC_AMOUNT = 'BASIC_AMOUNT',
  ADDITIONAL_CHARGE = 'ADDITIONAL_CHARGE',
  EXCEPTION_FEE = 'EXCEPTION_FEE ',
}

export enum EnumCapacityStatisticActiveType {
  TOTAL_ACTIVE_VENDOR = 'Total Active Vendor',
  EXISTING_ACTIVE_VENDOR = 'Existing Active Vendor',
  EXISTING_REACTIVE_VENDOR = 'Existing Reactive Vendor',
  LOST_VENDOR = 'Lost Vendor',
  NEW_VENDOR = 'New Vendor',
}

export enum EnumCustomerStatisticActiveType {
  TOTAL_ACTIVE_CUSTOMER = 'Total Active Customer',
  EXISTING_ACTIVE_CUSTOMER = 'Existing Active Customer',
  EXISTING_REACTIVE_CUSTOMER = 'Existing Reactive Customer',
  LOST_CUSTOMER = 'Lost Customer',
  NEW_CUSTOMER = 'New Customer',
}

export enum EnumProjectStatisticActiveType {
  TOTAL_ACTIVE_PROJECT = 'Total Active Project',
  EXISTING_ACTIVE_PROJECT = 'Existing Active Project',
  EXISTING_REACTIVE_PROJECT = 'Existing Reactive Project',
  LOST_PROJECT = 'Lost Project',
  NEW_PROJECT = 'New Project',
}

export enum EnumCountCompareResult {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
  EQUAL = 'EQUAL',
}

export enum EnumCompareOperatorType {
  EQ = 'EQ',
  GE = 'GE',
  LE = 'LE',
}

export enum EnumContractExpireStatus {
  EXPIRED = 'expired',
  EXPIRE_WITHIN_3_DAYS = 'expireWithin3Days',
  EXPIRE_WITHIN_7_DAYS = 'expireWithin7Days',
  EXPIRE_WITHIN_30_DAYS = 'expireWithin30Days',
}
export enum EnumAccreditationSortTypeStatus {
  REQUIRED = 'REQUIRED',
  EXPIRATION = 'EXPIRATION',
}
