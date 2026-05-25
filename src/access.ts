import { PermissionEnum } from './enums/permission';
import { REGION_ID_ENUM } from './enums/uam';

export default (initialState: any) => {
  const permission = initialState?.currentUser?.elementNameList ?? [];
  const isTH =
    initialState?.currentUser?.currentUserRole?.regionId ===
    REGION_ID_ENUM.Thailand;

  return {
    // Home Page
    // [PermissionEnum.HOME_PAGE]: permission?.includes(PermissionEnum.HOME_PAGE),
    // [PermissionEnum.BUSINESS_STATISTICS_SUMMARY]: permission?.includes(
    //   PermissionEnum.BUSINESS_STATISTICS_SUMMARY,
    // ),
    // [PermissionEnum.BUSINESS_PERFORMANCE]: permission?.includes(
    //   PermissionEnum.BUSINESS_PERFORMANCE,
    // ),
    // [PermissionEnum.BUSINESS_PERFORMANCE_DOWNLOAD]: permission?.includes(
    //   PermissionEnum.BUSINESS_PERFORMANCE_DOWNLOAD,
    // ),
    // [PermissionEnum.PERFORMANCE_COMPARISON]: permission?.includes(
    //   PermissionEnum.PERFORMANCE_COMPARISON,
    // ),
    // [PermissionEnum.BUSINESS_RANKINGS]: permission?.includes(
    //   PermissionEnum.BUSINESS_RANKINGS,
    // ),
    // [PermissionEnum.NEW_CUSTOMERS]: permission?.includes(
    //   PermissionEnum.NEW_CUSTOMERS,
    // ),
    // customer
    [PermissionEnum.CUSTOMER_MANAGEMENT]: permission?.includes(
      PermissionEnum.CUSTOMER_MANAGEMENT,
    ),
    [PermissionEnum.LEADS_POOL]: permission?.includes(
      PermissionEnum.LEADS_POOL,
    ),
    [PermissionEnum.CUSTOMERS_PAGE]: permission?.includes(
      PermissionEnum.CUSTOMERS_PAGE,
    ),
    [PermissionEnum.CUSTOMER_LIST]: permission?.includes(
      PermissionEnum.CUSTOMER_LIST,
    ),
    [PermissionEnum.CUSTOMER_CONTRACT_TRACKING]: permission?.includes(
      PermissionEnum.CUSTOMER_CONTRACT_TRACKING,
    ),
    [PermissionEnum.CUSTOMER_CONTRACT_TRACKING_UPDATE]: permission?.includes(
      PermissionEnum.CUSTOMER_CONTRACT_TRACKING_UPDATE,
    ),
    [PermissionEnum.CUSTOMER_STATISTICS]: permission?.includes(
      PermissionEnum.CUSTOMER_STATISTICS,
    ),
    [PermissionEnum.CUSTOMER_LIST_CREATE]: permission?.includes(
      PermissionEnum.CUSTOMER_LIST_CREATE,
    ),
    [PermissionEnum.CUSTOMER_LIST_EDIT]: permission?.includes(
      PermissionEnum.CUSTOMER_LIST_EDIT,
    ),
    [PermissionEnum.CUSTOMER_LIST_TRANSFER]: permission?.includes(
      PermissionEnum.CUSTOMER_LIST_TRANSFER,
    ),
    [PermissionEnum.CUSTOMER_DETAIL]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_TRANSFER]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_TRANSFER,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_CREATE_PROJECT]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_CREATE_PROJECT,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_EDIT]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_EDIT,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_CONTACTS]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_CONTACTS,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_CONTACTS_ADD]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_CONTACTS_ADD,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_CONTACTS_EDIT]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_CONTACTS_EDIT,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_CONTACTS_DELETE]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_CONTACTS_DELETE,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_FOLLOW_UP_RECORDS]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_FOLLOW_UP_RECORDS,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_FOLLOW_UP_RECORDS_EDIT]:
      permission?.includes(
        PermissionEnum.CUSTOMER_DETAIL_FOLLOW_UP_RECORDS_EDIT,
      ),
    [PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES_ADD]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES_ADD,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES_DETAIL]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES_DETAIL,
    ),

    [PermissionEnum.CUSTOMER_DETAIL_PROJECTS]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_PROJECTS,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_PROJECTS_DETAIL]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_PROJECTS_DETAIL,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_BUSINESS_DOC]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_BUSINESS_DOC,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_BUSINESS_DOC_EDIT]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_BUSINESS_DOC_EDIT,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC_EDIT]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC_EDIT,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_SUMMARY]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_SUMMARY,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_SUMMARY_EDIT]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_SUMMARY_EDIT,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_CONTRACTS]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_CONTRACTS,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_VIEW]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_VIEW,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_DOWNLOAD]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_DOWNLOAD,
    ),
    [PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_HISTORY]: permission?.includes(
      PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_HISTORY,
    ),
    // [PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_TERMINATE]: permission?.includes(
    //   PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_TERMINATE,
    // ),
    [PermissionEnum.LEAD_POOL_CREATE]: permission?.includes(
      PermissionEnum.LEAD_POOL_CREATE,
    ),
    [PermissionEnum.LEAD_POOL_TRANSFER]: permission?.includes(
      PermissionEnum.LEAD_POOL_TRANSFER,
    ),
    [PermissionEnum.LEAD_POOL_EDIT]: permission?.includes(
      PermissionEnum.LEAD_POOL_EDIT,
    ),
    [PermissionEnum.LEAD_DETAIL]: permission?.includes(
      PermissionEnum.LEAD_DETAIL,
    ),
    [PermissionEnum.LEAD_DETAIL_OPPORTUNITIES]: permission?.includes(
      PermissionEnum.LEAD_DETAIL_OPPORTUNITIES,
    ),
    [PermissionEnum.LEAD_DETAIL_OPPORTUNITIES_ADD]: permission?.includes(
      PermissionEnum.LEAD_DETAIL_OPPORTUNITIES_ADD,
    ),
    [PermissionEnum.LEAD_DETAIL_OPPORTUNITIES_DETAIL]: permission?.includes(
      PermissionEnum.LEAD_DETAIL_OPPORTUNITIES_DETAIL,
    ),

    [PermissionEnum.OPPORTUNITY_LIST]: permission?.includes(
      PermissionEnum.OPPORTUNITY_LIST,
    ),
    [PermissionEnum.OPPORTUNITY_LIST_CREATE]: permission?.includes(
      PermissionEnum.OPPORTUNITY_LIST_CREATE,
    ),
    [PermissionEnum.OPPORTUNITY_DETAIL]: permission?.includes(
      PermissionEnum.OPPORTUNITY_DETAIL,
    ),
    [PermissionEnum.OPPORTUNITY_DETAIL_EDIT]: permission?.includes(
      PermissionEnum.OPPORTUNITY_DETAIL_EDIT,
    ),
    [PermissionEnum.OPPORTUNITY_DETAIL_ASSOCIATED_PROJECT]:
      permission?.includes(
        PermissionEnum.OPPORTUNITY_DETAIL_ASSOCIATED_PROJECT,
      ),
    [PermissionEnum.OPPORTUNITY_LIST_FOLLOW_UP]: permission?.includes(
      PermissionEnum.OPPORTUNITY_LIST_FOLLOW_UP,
    ),
    [PermissionEnum.OPPORTUNITY_DETAIL_FOLLOW_UP]: permission?.includes(
      PermissionEnum.OPPORTUNITY_DETAIL_FOLLOW_UP,
    ),
    [PermissionEnum.OPPORTUNITY_DETAIL_CUSTOMER_EDIT]: permission?.includes(
      PermissionEnum.OPPORTUNITY_DETAIL_CUSTOMER_EDIT,
    ),
    // vendor

    [PermissionEnum.VENDOR_MANAGEMENT]: permission?.includes(
      PermissionEnum.VENDOR_MANAGEMENT,
    ),
    [PermissionEnum.VENDORS_PAGE]: permission?.includes(
      PermissionEnum.VENDORS_PAGE,
    ),
    [PermissionEnum.VENDOR_LIST]: permission?.includes(
      PermissionEnum.VENDOR_LIST,
    ),
    [PermissionEnum.VENDOR_CONTRACT_TRACKING]: permission?.includes(
      PermissionEnum.VENDOR_CONTRACT_TRACKING,
    ),
    [PermissionEnum.VENDOR_CONTRACT_TRACKING_UPDATE]: permission?.includes(
      PermissionEnum.VENDOR_CONTRACT_TRACKING_UPDATE,
    ),
    [PermissionEnum.VENDOR_CREATE]: permission?.includes(
      PermissionEnum.VENDOR_CREATE,
    ),
    [PermissionEnum.VENDOR_TRANSFER]: permission?.includes(
      PermissionEnum.VENDOR_TRANSFER,
    ),
    [PermissionEnum.VENDOR_DETAIL]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL,
    ),
    [PermissionEnum.VENDOR_DETAIL_BLOCK_AND_UNBLOCK]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_BLOCK_AND_UNBLOCK,
    ),
    [PermissionEnum.VENDOR_DETAIL_TERMINATE]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_TERMINATE,
    ),
    [PermissionEnum.VENDOR_DETAIL_REACCREDIT]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_REACCREDIT,
    ),
    [PermissionEnum.VENDOR_DETAIL_TRANSFER]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_TRANSFER,
    ),
    [PermissionEnum.VENDOR_DETAIL_ACCREDITATION_APPROVAL]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_ACCREDITATION_APPROVAL,
    ),
    [PermissionEnum.VENDOR_DETAIL_SUMMARY]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_SUMMARY,
    ),
    [PermissionEnum.VENDOR_DETAIL_CONTACTS]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CONTACTS,
    ),
    [PermissionEnum.VENDOR_DETAIL_SUMMARY_EDIT]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_SUMMARY_EDIT,
    ),
    [PermissionEnum.VENDOR_DETAIL_CONTACTS_ADD]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CONTACTS_ADD,
    ),
    [PermissionEnum.VENDOR_DETAIL_CONTACTS_EDIT]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CONTACTS_EDIT,
    ),
    [PermissionEnum.VENDOR_DETAIL_CONTACTS_DELETE]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CONTACTS_DELETE,
    ),
    [PermissionEnum.VENDOR_DETAIL_FOLLOW_UP_RECORDS]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_FOLLOW_UP_RECORDS,
    ),
    [PermissionEnum.VENDOR_DETAIL_FOLLOW_UP_RECORDS_EDIT]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_FOLLOW_UP_RECORDS_EDIT,
    ),
    [PermissionEnum.VENDOR_DETAIL_TRUCK_LIST]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_TRUCK_LIST,
    ),
    [PermissionEnum.VENDOR_DETAIL_TRUCK_ADD]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_TRUCK_ADD,
    ),
    [PermissionEnum.VENDOR_DETAIL_TRUCK_DETAIL]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_TRUCK_DETAIL,
    ),
    [PermissionEnum.VENDOR_DETAIL_TRUCK_UNBIND]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_TRUCK_UNBIND,
    ),
    [PermissionEnum.VENDOR_DETAIL_CREW_LIST]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CREW_LIST,
    ),
    [PermissionEnum.VENDOR_DETAIL_CREW_ADD]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CREW_ADD,
    ),
    [PermissionEnum.VENDOR_DETAIL_CREW_DETAIL]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CREW_DETAIL,
    ),
    [PermissionEnum.VENDOR_DETAIL_CREW_UNBIND]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CREW_UNBIND,
    ),

    [PermissionEnum.VENDOR_DETAIL_PROJECT_LIST]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_PROJECT_LIST,
    ),
    [PermissionEnum.VENDOR_DETAIL_PROJECT_DETAIL]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_PROJECT_DETAIL,
    ),
    [PermissionEnum.VENDOR_DETAIL_ACCREDITATION]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_ACCREDITATION,
    ),

    [PermissionEnum.VENDOR_DETAIL_ACCREDITATION_EDIT]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_ACCREDITATION_EDIT,
    ),
    [PermissionEnum.VENDOR_DETAIL_APPLICATION]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_APPLICATION,
    ),

    [PermissionEnum.VENDOR_DETAIL_APPLICATION_REVIEW]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_APPLICATION_REVIEW,
    ),

    [PermissionEnum.VENDOR_DETAIL_FINANCIAL_DOC]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_FINANCIAL_DOC,
    ),

    [PermissionEnum.VENDOR_DETAIL_FINANCIAL_DOC_EDIT]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_FINANCIAL_DOC_EDIT,
    ),
    [PermissionEnum.VENDOR_DETAIL_CONTRACTS]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CONTRACTS,
    ),
    [PermissionEnum.VENDOR_DETAIL_CONTRACTS_VIEW]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CONTRACTS_VIEW,
    ),
    [PermissionEnum.VENDOR_DETAIL_CONTRACTS_DOWNLOAD]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CONTRACTS_DOWNLOAD,
    ),
    [PermissionEnum.VENDOR_DETAIL_CONTRACTS_HISTORY]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_CONTRACTS_HISTORY,
    ),
    // [PermissionEnum.VENDOR_DETAIL_CONTRACTS_TERMINATE]: permission?.includes(
    //   PermissionEnum.VENDOR_DETAIL_CONTRACTS_TERMINATE,
    // ),
    [PermissionEnum.VENDOR_DETAIL_EDIT]: permission?.includes(
      PermissionEnum.VENDOR_DETAIL_EDIT,
    ),
    [PermissionEnum.VENDOR_LIST_EDIT]: permission?.includes(
      PermissionEnum.VENDOR_LIST_EDIT,
    ),
    [PermissionEnum.VENDOR_LIST_UPDATE_ACCREDITATION]: permission?.includes(
      PermissionEnum.VENDOR_LIST_UPDATE_ACCREDITATION,
    ),

    [PermissionEnum.TRUCK_LIST]: permission?.includes(
      PermissionEnum.TRUCK_LIST,
    ),
    [PermissionEnum.TRUCK_CREATE]: permission?.includes(
      PermissionEnum.TRUCK_CREATE,
    ),
    [PermissionEnum.TRUCK_DETAIL]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL,
    ),
    [PermissionEnum.TRUCK_LIST_UPDATE_ACCREDITATION]: permission?.includes(
      PermissionEnum.TRUCK_LIST_UPDATE_ACCREDITATION,
    ),

    [PermissionEnum.TRUCK_DETAIL_DEACTIVATE]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL_DEACTIVATE,
    ),
    [PermissionEnum.TRUCK_DETAIL_ACTIVATE]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL_ACTIVATE,
    ),
    [PermissionEnum.TRUCK_DETAIL_ATTRIBUTION]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL_ATTRIBUTION,
    ),
    [PermissionEnum.TRUCK_DETAIL_ATTRIBUTION_APPROVAL]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL_ATTRIBUTION_APPROVAL,
    ),
    [PermissionEnum.TRUCK_DETAIL_EDIT]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL_EDIT,
    ),
    [PermissionEnum.TRUCK_DETAIL_ACCREDITATION]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL_ACCREDITATION,
    ),

    [PermissionEnum.TRUCK_DETAIL_ACCREDITATION_EDIT]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL_ACCREDITATION_EDIT,
    ),
    [PermissionEnum.TRUCK_DETAIL_APPLICATION]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL_APPLICATION,
    ),

    [PermissionEnum.TRUCK_DETAIL_APPLICATION_REVIEW]: permission?.includes(
      PermissionEnum.TRUCK_DETAIL_APPLICATION_REVIEW,
    ),

    [PermissionEnum.CREW_LIST]: permission?.includes(PermissionEnum.CREW_LIST),
    [PermissionEnum.CREW_CREATE]: permission?.includes(
      PermissionEnum.CREW_CREATE,
    ),
    [PermissionEnum.CREW_DETAIL]: permission?.includes(
      PermissionEnum.CREW_DETAIL,
    ),
    [PermissionEnum.CREW_LIST_UPDATE_ACCREDITATION]: permission?.includes(
      PermissionEnum.CREW_LIST_UPDATE_ACCREDITATION,
    ),
    [PermissionEnum.CREW_DETAIL_DEACTIVATE]: permission?.includes(
      PermissionEnum.CREW_DETAIL_DEACTIVATE,
    ),
    [PermissionEnum.CREW_DETAIL_ACTIVATE]: permission?.includes(
      PermissionEnum.CREW_DETAIL_ACTIVATE,
    ),
    [PermissionEnum.CREW_DETAIL_BLOCK]: permission?.includes(
      PermissionEnum.CREW_DETAIL_BLOCK,
    ),
    [PermissionEnum.CREW_DETAIL_ATTRIBUTION]: permission?.includes(
      PermissionEnum.CREW_DETAIL_ATTRIBUTION,
    ),
    [PermissionEnum.CREW_DETAIL_ATTRIBUTION_APPROVAL]: permission?.includes(
      PermissionEnum.CREW_DETAIL_ATTRIBUTION_APPROVAL,
    ),
    [PermissionEnum.CREW_DETAIL_EDIT]: permission?.includes(
      PermissionEnum.CREW_DETAIL_EDIT,
    ),
    [PermissionEnum.CREW_DETAIL_ACCREDITATION]: permission?.includes(
      PermissionEnum.CREW_DETAIL_ACCREDITATION,
    ),
    [PermissionEnum.CREW_DETAIL_ACCREDITATION_EDIT]: permission?.includes(
      PermissionEnum.CREW_DETAIL_ACCREDITATION_EDIT,
    ),
    [PermissionEnum.CREW_DETAIL_APPLICATION]: permission?.includes(
      PermissionEnum.CREW_DETAIL_APPLICATION,
    ),

    [PermissionEnum.CREW_DETAIL_APPLICATION_REVIEW]: permission?.includes(
      PermissionEnum.CREW_DETAIL_APPLICATION_REVIEW,
    ),
    [PermissionEnum.APPLICATION_LIST]: permission?.includes(
      PermissionEnum.APPLICATION_LIST,
    ),

    [PermissionEnum.APPLICATION_LIST_REVIEW]: permission?.includes(
      PermissionEnum.APPLICATION_LIST_REVIEW,
    ),

    // project
    [PermissionEnum.PROJECT_MANAGEMENT]: permission?.includes(
      PermissionEnum.PROJECT_MANAGEMENT,
    ),
    [PermissionEnum.PROJECT_LIST]: permission?.includes(
      PermissionEnum.PROJECT_LIST,
    ),
    [PermissionEnum.ALARM_DASHBOARD]: permission?.includes(
      PermissionEnum.ALARM_DASHBOARD,
    ),
    [PermissionEnum.ALARM_DASHBOARD_TASK_LIST]: permission?.includes(
      PermissionEnum.ALARM_DASHBOARD_TASK_LIST,
    ),
    [PermissionEnum.ALARM_DASHBOARD_STATISTICS]: permission?.includes(
      PermissionEnum.ALARM_DASHBOARD_STATISTICS,
    ),
    [PermissionEnum.PROJECT_LIST_CREATE]: permission?.includes(
      PermissionEnum.PROJECT_LIST_CREATE,
    ),
    [PermissionEnum.PROJECT_DETAIL]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL,
    ),
    [PermissionEnum.PROJECT_DETAIL_OPERATION_LOG]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_OPERATION_LOG,
    ),

    [PermissionEnum.PROJECT_DETAIL_CANCEL]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_CANCEL,
    ),
    [PermissionEnum.PROJECT_DETAIL_START]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_START,
    ),
    [PermissionEnum.PROJECT_DETAIL_TERMINATED]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_TERMINATED,
    ),
    [PermissionEnum.PROJECT_DETAIL_COMPLETE]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_COMPLETE,
    ),
    [PermissionEnum.PROJECT_DETAIL_CREATE_WAYBILL]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_CREATE_WAYBILL,
    ),
    [PermissionEnum.PROJECT_DETAIL_ASSIGN]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_ASSIGN,
    ),
    [PermissionEnum.PROJECT_DETAIL_SUSPEND]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_SUSPEND,
    ),
    [PermissionEnum.PROJECT_DETAIL_RESUME]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_RESUME,
    ),
    [PermissionEnum.PROJECT_DETAIL_BATCH_PRICE_UPDATE]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_BATCH_PRICE_UPDATE,
    ),
    [PermissionEnum.PROJECT_DETAIL_POD_CONFIGURATION]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_POD_CONFIGURATION,
    ),
    [PermissionEnum.PROJECT_DETAIL_SUBTASK_CONFIGURATION]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_SUBTASK_CONFIGURATION,
    ),
    [PermissionEnum.PROJECT_DETAIL_EDIT]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_EDIT,
    ),
    [PermissionEnum.PROJECT_DETAIL_WAYBILLS]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_WAYBILLS,
    ),
    [PermissionEnum.PROJECT_DETAIL_WAYBILLS_COPY]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_WAYBILLS_COPY,
    ),
    [PermissionEnum.PROJECT_DETAIL_WAYBILLS_EXPORT]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_WAYBILLS_EXPORT,
    ),
    [PermissionEnum.PROJECT_DETAIL_WAYBILLS_DETAIL]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_WAYBILLS_DETAIL,
    ),
    [PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS,
    ),
    [PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS_EDIT]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_BUSINESS_DOCUMENTS_EDIT,
      ),
    [PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY,
    ),
    [PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY_CREATE]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY_CREATE,
    ),
    [PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY_DETAILS]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_ROUTE_LIBRARY_DETAILS,
    ),
    [PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL,
    ),
    [PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL_CREATE]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL_CREATE,
    ),
    [PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL_DETAIL]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_CAPACITY_POOL_DETAIL,
    ),
    [PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS,
    ),
    [PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS_ADD]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS_ADD,
    ),
    [PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS_DELETE]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS_DELETE,
    ),

    [PermissionEnum.PROJECT_DETAIL_STOP_POINTS]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_STOP_POINTS,
    ),
    [PermissionEnum.PROJECT_DETAIL_STOP_POINT_CREATE]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_STOP_POINT_CREATE,
    ),
    [PermissionEnum.PROJECT_DETAIL_STOP_POINT_EDIT]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_STOP_POINT_EDIT,
    ),
    [PermissionEnum.PROJECT_DETAIL_STOP_POINT_DELETE]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_STOP_POINT_DELETE,
    ),

    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS,
    ),
    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_CREATE]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_CREATE,
      ),
    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_VIEW]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_VIEW,
      ),
    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_DOWNLOAD]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_DOWNLOAD,
      ),
    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_HISTORY]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_HISTORY,
      ),
    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_REJECT]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_REJECT,
      ),
    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_PASS]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_PASS,
      ),
    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_TERMINATE]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_TERMINATE,
      ),
    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_DELETE]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_CUSTOMER_CONTRACTS_DELETE,
      ),

    [PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS,
    ),
    [PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_CREATE]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_CREATE,
      ),
    [PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_VIEW]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_VIEW,
    ),
    [PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_DOWNLOAD]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_DOWNLOAD,
      ),
    [PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_HISTORY]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_HISTORY,
      ),
    [PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_REJECT]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_REJECT,
      ),
    [PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_PASS]: permission?.includes(
      PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_PASS,
    ),
    [PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_TERMINATE]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_TERMINATE,
      ),
    [PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_DELETE]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_DELETE,
      ),
    [PermissionEnum.PROJECT_DETAIL_CUSTOMER_CODE_CONFIGURATION]:
      permission?.includes(
        PermissionEnum.PROJECT_DETAIL_CUSTOMER_CODE_CONFIGURATION,
      ),

    // transmittal
    [PermissionEnum.TRANSMITTAL]: permission?.includes(
      PermissionEnum.TRANSMITTAL,
    ),
    [PermissionEnum.TRANSMITTAL_CREATE]: permission?.includes(
      PermissionEnum.TRANSMITTAL_CREATE,
    ),
    [PermissionEnum.TRANSMITTAL_DETAIL]: permission?.includes(
      PermissionEnum.TRANSMITTAL_DETAIL,
    ),

    // Route Libraries
    [PermissionEnum.ROUTE_LIBRARIES]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARIES,
    ),
    [PermissionEnum.ROUTE_LIBRARY_CREATE]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_CREATE,
    ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_DETAIL,
    ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_MILEAGE_RANGE]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_DETAIL_MILEAGE_RANGE,
    ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_MANAGE_TRUCK_TYPE]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_MANAGE_TRUCK_TYPE,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_ADD_ROUTE]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_DETAIL_ADD_ROUTE,
    ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_EDIT_INFO]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_EDIT_INFO,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_SETTING]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_SETTING,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_SYNC_FROM_SHEET]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_SYNC_FROM_SHEET,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_MANAGE_SHEET]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_MANAGE_SHEET,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING,
    ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_EDIT_INFO]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_EDIT_INFO,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_SETTING]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_SETTING,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_SYNC_FROM_SHEET]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_SYNC_FROM_SHEET,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_MANAGE_SHEET]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_MANAGE_SHEET,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_EDIT]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_DETAIL_EDIT,
    ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES,
    ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_VERSION_TAB]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING_VERSION_TAB,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_VERSION_TAB]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING_VERSION_TAB,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_EDIT]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_EDIT,
    ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_REVOKE_OR_APPROVE]:
      permission?.includes(
        PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_REVOKE_OR_APPROVE,
      ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_DELETE]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_DETAIL_ROUTES_DELETE,
    ),
    [PermissionEnum.ROUTE_LIBRARY_DETAIL_PRICE_SUPER]: permission?.includes(
      PermissionEnum.ROUTE_LIBRARY_DETAIL_PRICE_SUPER,
    ),

    // Capacity Pool
    [PermissionEnum.CAPACITY_POOLS]: permission?.includes(
      PermissionEnum.CAPACITY_POOLS,
    ),
    [PermissionEnum.CAPACITY_POOL_CREATE]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_CREATE,
    ),
    [PermissionEnum.CAPACITY_POOL_DETAIL]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_DETAIL,
    ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_EDIT_CAPACITY_POOL]:
      permission?.includes(
        PermissionEnum.CAPACITY_POOL_DETAIL_EDIT_CAPACITY_POOL,
      ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_EDIT]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_DETAIL_EDIT,
    ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_LIST]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_LIST,
    ),

    [PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_DETAIL]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_DETAIL,
    ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_REVOKE_OR_APPROVE]:
      permission?.includes(
        PermissionEnum.CAPACITY_POOL_DETAIL_TRUCK_REVOKE_OR_APPROVE,
      ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_CREW_LIST]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_DETAIL_CREW_LIST,
    ),

    [PermissionEnum.CAPACITY_POOL_DETAIL_CREW_DETAIL]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_DETAIL_CREW_DETAIL,
    ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_CREW_REVOKE_OR_APPROVE]:
      permission?.includes(
        PermissionEnum.CAPACITY_POOL_DETAIL_CREW_REVOKE_OR_APPROVE,
      ),

    [PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_LIST]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_LIST,
    ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_REVOKE_OR_APPROVE]:
      permission?.includes(
        PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_REVOKE_OR_APPROVE,
      ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_VIEW_PRICE_VERSION]:
      permission?.includes(
        PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_VIEW_PRICE_VERSION,
      ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_CREATE]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_CREATE,
    ),
    [PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_DETAIL]: permission?.includes(
      PermissionEnum.CAPACITY_POOL_DETAIL_VENDOR_DETAIL,
    ),

    // Claim Tickets
    [PermissionEnum.CLAIM_TICKETS]: permission?.includes(
      PermissionEnum.CLAIM_TICKETS,
    ),
    [PermissionEnum.CLAIM_REQUEST]: permission?.includes(
      PermissionEnum.CLAIM_REQUEST,
    ),
    [PermissionEnum.CLAIM_REQUEST_Detail]: permission?.includes(
      PermissionEnum.CLAIM_REQUEST_Detail,
    ),
    [PermissionEnum.CLAIM_REQUEST_EDIT]: permission?.includes(
      PermissionEnum.CLAIM_REQUEST_EDIT,
    ),
    // Claim Ticket
    [PermissionEnum.CLAIM_TICKET]: permission?.includes(
      PermissionEnum.CLAIM_TICKET,
    ),

    // Claim Type --start
    [PermissionEnum.CLAIM_TYPE_GPS]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_GPS,
    ),
    [PermissionEnum.CLAIM_TYPE_DDC_TRAINING_FEE]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_DDC_TRAINING_FEE,
    ),
    [PermissionEnum.CLAIM_TYPE_CREW_UNIFORM_CHARGES]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_CREW_UNIFORM_CHARGES,
    ),
    [PermissionEnum.CLAIM_TYPE_INTELUCK_INSURANCE]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_INTELUCK_INSURANCE,
    ),
    [PermissionEnum.CLAIM_TYPE_COUPON_FEES]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_COUPON_FEES,
    ),
    [PermissionEnum.CLAIM_TYPE_STUFFING_FEE_CDC]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_STUFFING_FEE_CDC,
    ),
    [PermissionEnum.CLAIM_TYPE_EQUIPMENT_FEE]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_EQUIPMENT_FEE,
    ),
    [PermissionEnum.CLAIM_TYPE_MEDICAL_FEE]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_MEDICAL_FEE,
    ),
    [PermissionEnum.CLAIM_TYPE_DELIVERY_CLAIMS]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_DELIVERY_CLAIMS,
    ),
    [PermissionEnum.CLAIM_TYPE_KPI_CLAIMS]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_KPI_CLAIMS,
    ),
    [PermissionEnum.CLAIM_TYPE_THEFT_INCIDENT]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_THEFT_INCIDENT,
    ),
    [PermissionEnum.CLAIM_TYPE_OTHERS]: permission?.includes(
      PermissionEnum.CLAIM_TYPE_OTHERS,
    ),
    // Claim Type --end

    [PermissionEnum.CLAIM_TICKET_CREATE]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_CREATE,
    ),
    [PermissionEnum.CLAIM_TICKET_BATCH_CREATE]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_BATCH_CREATE,
    ),
    [PermissionEnum.CLAIM_TICKET_EXPORT]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_EXPORT,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_EDIT_TICKET_INFO]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_EDIT_TICKET_INFO,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_EDIT_OC_STATUS]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_EDIT_OC_STATUS,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_ADD_REMARK]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_ADD_REMARK,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_ADD_PROOF]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_ADD_PROOF,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_CREATE_REFUND]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_CREATE_REFUND,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_CANCEL_TICKET]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_CANCEL_TICKET,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_CONFIRM]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_CONFIRM,
    ),

    [PermissionEnum.CLAIM_TICKET_DETAIL_OC_CONFIRM]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_OC_CONFIRM,
    ),

    [PermissionEnum.CLAIM_TICKET_DETAIL_ONGOING_VALIDATION]:
      permission?.includes(
        PermissionEnum.CLAIM_TICKET_DETAIL_ONGOING_VALIDATION,
      ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_VENDOR_DISPUTED]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_VENDOR_DISPUTED,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_COMPLETED]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_COMPLETED,
    ),
    [PermissionEnum.CLAIM_TICKET_DETAIL_EXPORT_DM]: permission?.includes(
      PermissionEnum.CLAIM_TICKET_DETAIL_EXPORT_DM,
    ),
    // Refund Ticket
    [PermissionEnum.REFUND_TICKET]: permission?.includes(
      PermissionEnum.REFUND_TICKET,
    ),
    [PermissionEnum.REFUND_TICKET_CREATE]: permission?.includes(
      PermissionEnum.REFUND_TICKET_CREATE,
    ),
    [PermissionEnum.REFUND_TICKET_EXPORT]: permission?.includes(
      PermissionEnum.REFUND_TICKET_EXPORT,
    ),
    [PermissionEnum.REFUND_TICKET_LINKED_CLAIM_TICKET_DETAIL]:
      permission?.includes(
        PermissionEnum.REFUND_TICKET_LINKED_CLAIM_TICKET_DETAIL,
      ),
    [PermissionEnum.REFUND_TICKET_DETAIL]: permission?.includes(
      PermissionEnum.REFUND_TICKET_DETAIL,
    ),
    [PermissionEnum.REFUND_TICKET_DETAIL_EDIT_TICKET_INFO]:
      permission?.includes(
        PermissionEnum.REFUND_TICKET_DETAIL_EDIT_TICKET_INFO,
      ),
    [PermissionEnum.REFUND_TICKET_DETAIL_EDIT_OC_STATUS]: permission?.includes(
      PermissionEnum.REFUND_TICKET_DETAIL_EDIT_OC_STATUS,
    ),
    [PermissionEnum.REFUND_TICKET_DETAIL_ADD_REMARK]: permission?.includes(
      PermissionEnum.REFUND_TICKET_DETAIL_ADD_REMARK,
    ),
    [PermissionEnum.REFUND_TICKET_DETAIL_ADD_PROOF]: permission?.includes(
      PermissionEnum.REFUND_TICKET_DETAIL_ADD_PROOF,
    ),
    [PermissionEnum.REFUND_TICKET_DETAIL_CANCEL_TICKET]: permission?.includes(
      PermissionEnum.REFUND_TICKET_DETAIL_CANCEL_TICKET,
    ),
    [PermissionEnum.REFUND_TICKET_DETAIL_CONFIRM]: permission?.includes(
      PermissionEnum.REFUND_TICKET_DETAIL_CONFIRM,
    ),
    [PermissionEnum.REFUND_TICKET_DETAIL_OC_CONFIRM]: permission?.includes(
      PermissionEnum.REFUND_TICKET_DETAIL_OC_CONFIRM,
    ),

    [PermissionEnum.REFUND_TICKET_DETAIL_ONGOING_VALIDATION]:
      permission?.includes(
        PermissionEnum.REFUND_TICKET_DETAIL_ONGOING_VALIDATION,
      ),
    [PermissionEnum.REFUND_TICKET_DETAIL_COMPLETED]: permission?.includes(
      PermissionEnum.REFUND_TICKET_DETAIL_COMPLETED,
    ),

    // waybill
    [PermissionEnum.WAYBILL]: permission?.includes(PermissionEnum.WAYBILL),
    [PermissionEnum.CREATE_WAYBILL]: permission?.includes(
      PermissionEnum.CREATE_WAYBILL,
    ),
    [PermissionEnum.BATCH_CREATE_WAYBILL]: permission?.includes(
      PermissionEnum.BATCH_CREATE_WAYBILL,
    ),
    [PermissionEnum.BATCH_SUBMIT_WAYBILL]: permission?.includes(
      PermissionEnum.BATCH_SUBMIT_WAYBILL,
    ),
    [PermissionEnum.BATCH_START_WAYBILL]: permission?.includes(
      PermissionEnum.BATCH_START_WAYBILL,
    ),
    [PermissionEnum.UPDATE_WAYBILLS]: permission?.includes(
      PermissionEnum.UPDATE_WAYBILLS,
    ),
    [PermissionEnum.COPY_WAYBILL]: permission?.includes(
      PermissionEnum.COPY_WAYBILL,
    ),
    [PermissionEnum.EXPORT_REV_COST]: permission?.includes(
      PermissionEnum.EXPORT_REV_COST,
    ),
    [PermissionEnum.EXPORT_WAYBILL]: permission?.includes(
      PermissionEnum.EXPORT_WAYBILL,
    ),
    [PermissionEnum.WAYBILL_DETAIL]: permission?.includes(
      PermissionEnum.WAYBILL_DETAIL,
    ),

    [PermissionEnum.STANDARD_WAYBILL_OPERATE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_OPERATE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_OPERATE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_OPERATE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ABNORMAL]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ABNORMAL,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ABNORMAL]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ABNORMAL,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CANCEL]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CANCEL,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CANCEL]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CANCEL,
    ),
    [PermissionEnum.STANDARD_WAYBILL_DELETE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_DELETE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_DELETE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_DELETE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_EDIT_CUSTOMER_CODE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_EDIT_CUSTOMER_CODE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_EDIT_CUSTOMER_CODE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_EDIT_CUSTOMER_CODE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_PARTIAL_PAYMENT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_PARTIAL_PAYMENT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_PARTIAL_PAYMENT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_PARTIAL_PAYMENT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_PARTIAL_PAYMENT_EDIT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_PARTIAL_PAYMENT_EDIT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_PARTIAL_PAYMENT_EDIT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_PARTIAL_PAYMENT_EDIT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_ADD_RECORD]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ADD_RECORD,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ADD_RECORD]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ADD_RECORD,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ADDITIONAL]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ADDITIONAL,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_OBJECT_EDIT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_OBJECT_EDIT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_STATUS_EDIT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_ADDITIONAL_STATUS_EDIT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_OBJECT_EDIT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_OBJECT_EDIT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_STATUS_EDIT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_ADDITIONAL_STATUS_EDIT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_CONFIRM_ROUTE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CONFIRM_ROUTE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CONFIRM_ROUTE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CONFIRM_ROUTE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_MANAGE_POD]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_MANAGE_POD,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_MANAGE_POD]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_MANAGE_POD,
    ),
    [PermissionEnum.STANDARD_WAYBILL_SUBMIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_SUBMIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_SUBMIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_SUBMIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_START]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_START,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_START]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_START,
    ),
    // [PermissionEnum.STANDARD_WAYBILL_CONFIRM_WAYBILL]: permission?.includes(
    //   PermissionEnum.STANDARD_WAYBILL_CONFIRM_WAYBILL,
    // ),
    // [PermissionEnum.TEMPORARY_WAYBILL_CONFIRM_WAYBILL]: permission?.includes(
    //   PermissionEnum.TEMPORARY_WAYBILL_CONFIRM_WAYBILL,
    // ),
    [PermissionEnum.STANDARD_WAYBILL_TRACKS]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_TRACKS,
    ),
    [PermissionEnum.STANDARD_WAYBILL_TRACKS_EDIT_POSITION]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_TRACKS_EDIT_POSITION,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_TRACKS]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_TRACKS,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_TRACKS_EDIT_POSITION]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_TRACKS_EDIT_POSITION,
      ),
    [PermissionEnum.STANDARD_WAYBILL_ROUTE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ROUTE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ROUTE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ROUTE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING,
    ),
    [PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING_CREATE_STOP_POINT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING_CREATE_STOP_POINT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING_CREATE_STOP_POINT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING_CREATE_STOP_POINT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_CARRIER]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CARRIER,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CARRIER]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CARRIER,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CARRIER_ASSIGN]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CARRIER_ASSIGN,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CARRIER_ASSIGN]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CARRIER_ASSIGN,
    ),
    [PermissionEnum.STANDARD_WAYBILL_BILLING]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_BILLING,
    ),
    [PermissionEnum.STANDARD_WAYBILL_BILLING_EDIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_BILLING_EDIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_BILLING]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_BILLING,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_BILLING_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_BILLING_EDIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_POD]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_POD,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_POD]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_POD,
    ),
    [PermissionEnum.STANDARD_WAYBILL_POD_EDIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_POD_EDIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_POD_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_POD_EDIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_BASIC_INFO]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_BASIC_INFO,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO,
    ),
    [PermissionEnum.STANDARD_WAYBILL_BASIC_INFO_EDIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_BASIC_INFO_EDIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO_EDIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_REMARK]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_REMARK,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_REMARK]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_REMARK,
    ),
    [PermissionEnum.STANDARD_WAYBILL_REMARK_ADD]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_REMARK_ADD,
    ),
    [PermissionEnum.STANDARD_WAYBILL_REMARK_EDIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_REMARK_EDIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_REMARK_DELETE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_REMARK_DELETE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_REMARK_ADD]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_REMARK_ADD,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_REMARK_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_REMARK_EDIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_REMARK_DELETE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_REMARK_DELETE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_EXCEPTION_FEE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_EXCEPTION_FEE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_EXCEPTION_FEE_STATUS_EDIT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_EXCEPTION_FEE_STATUS_EDIT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_TRUCK_TYPE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_TRUCK_TYPE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_EXCEPTION_FEE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_EXCEPTION_FEE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_EXCEPTION_FEE_OBJECT_EDIT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_EXCEPTION_FEE_STATUS_EDIT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_EXCEPTION_FEE_STATUS_EDIT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_TRUCK_TYPE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_TRUCK_TYPE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_LINKED_STATEMENT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_LINKED_STATEMENT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_VIEW_AMOUNT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_VIEW_AMOUNT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_SWITCH_STATE]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_SWITCH_STATE,
    ),
    [PermissionEnum.STANDARD_WAYBILL_SWITCH_TO_VERIFIED]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_SWITCH_TO_VERIFIED,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CLAIM]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CLAIM,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CLAIM_OBJECT_EDIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CLAIM_OBJECT_EDIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CLAIM_STATUS_EDIT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CLAIM_STATUS_EDIT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CLAIM_VIEW_AMOUNT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CLAIM_VIEW_AMOUNT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CLAIM_LINKED_STATEMENT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_CLAIM_LINKED_STATEMENT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_CLAIM_LINKED_TICKET]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CLAIM_LINKED_TICKET,
    ),
    [PermissionEnum.STANDARD_WAYBILL_CLAIM_CREATE_TICKET]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_CLAIM_CREATE_TICKET,
    ),
    [PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT,
    ),

    // Start-- Reimbursement Expense
    [PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT]: permission?.includes(
      PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT,
    ),
    [PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_OBJECT_EDIT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_OBJECT_EDIT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_STATUS_EDIT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_STATUS_EDIT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_VIEW_AMOUNT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_VIEW_AMOUNT,
      ),
    [PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_LINKED_STATEMENT]:
      permission?.includes(
        PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT_LINKED_STATEMENT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_OBJECT_EDIT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_OBJECT_EDIT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_STATUS_EDIT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_STATUS_EDIT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_VIEW_AMOUNT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_VIEW_AMOUNT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_LINKED_STATEMENT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT_LINKED_STATEMENT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT,
    ),
    // End-- Reimbursement Expense

    [PermissionEnum.TEMPORARY_WAYBILL_LINKED_STATEMENT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_LINKED_STATEMENT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_VIEW_AMOUNT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_VIEW_AMOUNT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_SWITCH_STATE]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_SWITCH_STATE,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_SWITCH_TO_VERIFIED]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_SWITCH_TO_VERIFIED,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CLAIM]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CLAIM,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CLAIM_OBJECT_EDIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CLAIM_STATUS_EDIT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CLAIM_STATUS_EDIT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CLAIM_VIEW_AMOUNT]: permission?.includes(
      PermissionEnum.TEMPORARY_WAYBILL_CLAIM_VIEW_AMOUNT,
    ),
    [PermissionEnum.TEMPORARY_WAYBILL_CLAIM_LINKED_STATEMENT]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_CLAIM_LINKED_STATEMENT,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_CLAIM_LINKED_TICKET]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_CLAIM_LINKED_TICKET,
      ),
    [PermissionEnum.TEMPORARY_WAYBILL_CLAIM_CREATE_TICKET]:
      permission?.includes(
        PermissionEnum.TEMPORARY_WAYBILL_CLAIM_CREATE_TICKET,
      ),
    //Financial
    [PermissionEnum.WAYBILL_REJECT_PRICE]: permission?.includes(
      PermissionEnum.WAYBILL_REJECT_PRICE,
    ),
    [PermissionEnum.WAYBILL_REJECT_WAYBILL_INFORMATION]: permission?.includes(
      PermissionEnum.WAYBILL_REJECT_WAYBILL_INFORMATION,
    ),
    [PermissionEnum.WAYBILL_CONFIRM_POD_RECEIPT]: permission?.includes(
      PermissionEnum.WAYBILL_CONFIRM_POD_RECEIPT,
    ),
    [PermissionEnum.WAYBILL_CONFIRM_VERIFICATION]: permission?.includes(
      PermissionEnum.WAYBILL_CONFIRM_VERIFICATION,
    ),
    [PermissionEnum.WAYBILL_CONFIRM_PRICE]: permission?.includes(
      PermissionEnum.WAYBILL_CONFIRM_PRICE,
    ),
    [PermissionEnum.SUBTASK]: permission?.includes(PermissionEnum.SUBTASK),
    [PermissionEnum.SUBTASK_CREATE]: permission?.includes(
      PermissionEnum.SUBTASK_CREATE,
    ),
    [PermissionEnum.SUBTASK_DETAIL]: permission?.includes(
      PermissionEnum.SUBTASK_DETAIL,
    ),
    [PermissionEnum.SUBTASK_REMIND]: permission?.includes(
      PermissionEnum.SUBTASK_REMIND,
    ),

    // user mgmt
    [PermissionEnum.USER_MANAGEMENT]: permission?.includes(
      PermissionEnum.USER_MANAGEMENT,
    ),
    [PermissionEnum.VENDOR_ACCOUNT_LIST]: permission?.includes(
      PermissionEnum.VENDOR_ACCOUNT_LIST,
    ),
    [PermissionEnum.CUSTOMER_ACCOUNT_LIST]: permission?.includes(
      PermissionEnum.CUSTOMER_ACCOUNT_LIST,
    ),

    // Statistics
    [PermissionEnum.STATISTICS]: permission?.includes(
      PermissionEnum.STATISTICS,
    ),
    [PermissionEnum.DASHBOARD_BOOKING]: permission?.includes(
      PermissionEnum.DASHBOARD_BOOKING,
    ),
    [PermissionEnum.CUSTOMER_ANALYSIS]: permission?.includes(
      PermissionEnum.CUSTOMER_ANALYSIS,
    ),
    [PermissionEnum.VENDOR_ANALYSIS]: permission?.includes(
      PermissionEnum.VENDOR_ANALYSIS,
    ),
    [PermissionEnum.DASHBOARD_KPI]: permission?.includes(
      PermissionEnum.DASHBOARD_KPI,
    ),
    [PermissionEnum.SUB_DASHBOARD]: permission?.includes(
      PermissionEnum.SUB_DASHBOARD,
    ),
    [PermissionEnum.ADOPTION_DASHBOARD]: permission?.includes(
      PermissionEnum.ADOPTION_DASHBOARD,
    ),
    [PermissionEnum.FIELD_SALES_MAP]: permission?.includes(
      PermissionEnum.FIELD_SALES_MAP,
    ),
    [PermissionEnum.MONTHLY_DELIVERED_PANEL]: permission?.includes(
      PermissionEnum.MONTHLY_DELIVERED_PANEL,
    ),
    // TOOLS
    [PermissionEnum.WATERMARK]: permission?.includes(PermissionEnum.WATERMARK),
    [PermissionEnum.ELECTRONIC_SIGNATURE]: permission?.includes(
      PermissionEnum.ELECTRONIC_SIGNATURE,
    ),
    [PermissionEnum.TOOLS]: permission?.includes(PermissionEnum.TOOLS),
    [PermissionEnum.CONTRACT_MANAGEMENT]: permission?.includes(
      PermissionEnum.CONTRACT_MANAGEMENT,
    ),
    [PermissionEnum.CONTRACT_MANAGEMENT_CREATE]: permission?.includes(
      PermissionEnum.CONTRACT_MANAGEMENT_CREATE,
    ),
    [PermissionEnum.CONTRACT_MANAGEMENT_VIEW]: permission?.includes(
      PermissionEnum.CONTRACT_MANAGEMENT_VIEW,
    ),
    [PermissionEnum.CONTRACT_MANAGEMENT_DOWNLOAD]: permission?.includes(
      PermissionEnum.CONTRACT_MANAGEMENT_DOWNLOAD,
    ),
    [PermissionEnum.CONTRACT_MANAGEMENT_HISTORY]: permission?.includes(
      PermissionEnum.CONTRACT_MANAGEMENT_HISTORY,
    ),
    [PermissionEnum.CONTRACT_MANAGEMENT_REJECT]: permission?.includes(
      PermissionEnum.CONTRACT_MANAGEMENT_REJECT,
    ),
    [PermissionEnum.CONTRACT_MANAGEMENT_PASS]: permission?.includes(
      PermissionEnum.CONTRACT_MANAGEMENT_PASS,
    ),
    [PermissionEnum.CONTRACT_MANAGEMENT_DELETE]: permission?.includes(
      PermissionEnum.CONTRACT_MANAGEMENT_DELETE,
    ),
    [PermissionEnum.CONTRACT_MANAGEMENT_TERMINATE]: permission?.includes(
      PermissionEnum.CONTRACT_MANAGEMENT_TERMINATE,
    ),
    [PermissionEnum.WAYBILL_AUTOMATION]: permission?.includes(
      PermissionEnum.WAYBILL_AUTOMATION,
    ),
    [PermissionEnum.CONVERSION_TOOL]: permission?.includes(
      PermissionEnum.CONVERSION_TOOL,
    ),
    [PermissionEnum.SLACK_GROUP_MESSAGE]: permission?.includes(
      PermissionEnum.SLACK_GROUP_MESSAGE,
    ),
    [PermissionEnum.DATA_PROCESSING]: permission?.includes(
      PermissionEnum.DATA_PROCESSING,
    ),
    [PermissionEnum.FA_BILLING_RECORDS]: permission?.includes(
      PermissionEnum.FA_BILLING_RECORDS,
    ),
    [PermissionEnum.PRICE_INQUIRY_TOOL]: permission?.includes(
      PermissionEnum.PRICE_INQUIRY_TOOL,
    ),
    [PermissionEnum.PRICING_CHECK]: permission?.includes(
      PermissionEnum.PRICING_CHECK,
    ),
    [PermissionEnum.PRICING_CHECK_BATCH_CONFIRM_PRICE]: permission?.includes(
      PermissionEnum.PRICING_CHECK_BATCH_CONFIRM_PRICE,
    ),

    // permission
    [PermissionEnum.PERMISSION_MANAGEMENT]: permission?.includes(
      PermissionEnum.PERMISSION_MANAGEMENT,
    ),
    [PermissionEnum.ACCOUNT_MANAGEMENT]: permission?.includes(
      PermissionEnum.ACCOUNT_MANAGEMENT,
    ),
    [PermissionEnum.ORGANIZATION_MANAGEMENT]: permission?.includes(
      PermissionEnum.ORGANIZATION_MANAGEMENT,
    ),
    [PermissionEnum.ROLE_TEMPLATE]: permission?.includes(
      PermissionEnum.ROLE_TEMPLATE,
    ),

    // billing Mgmt
    [PermissionEnum.BILLING_MANAGEMENT]: permission?.includes(
      PermissionEnum.BILLING_MANAGEMENT,
    ),
    //customer
    [PermissionEnum.AR_STATEMENT_STATISTIC]: permission?.includes(
      PermissionEnum.AR_STATEMENT_STATISTIC,
    ),
    [PermissionEnum.AR_STATEMENT_STATISTIC_OVERVIEW]: permission?.includes(
      PermissionEnum.AR_STATEMENT_STATISTIC_OVERVIEW,
    ),
    [PermissionEnum.AR_STATEMENT_STATISTIC_OVERVIEW_DOWNLOAD]:
      permission?.includes(
        PermissionEnum.AR_STATEMENT_STATISTIC_OVERVIEW_DOWNLOAD,
      ),
    [PermissionEnum.AR_STATEMENT_STATISTIC_BREAKDOWN_BY_MONTH]:
      permission?.includes(
        PermissionEnum.AR_STATEMENT_STATISTIC_BREAKDOWN_BY_MONTH,
      ),
    [PermissionEnum.AR_STATEMENT_STATISTIC_BREAKDOWN_BY_MONTH_DOWNLOAD]:
      permission?.includes(
        PermissionEnum.AR_STATEMENT_STATISTIC_BREAKDOWN_BY_MONTH_DOWNLOAD,
      ),
    [PermissionEnum.AR_STATEMENT_STATISTIC_UN_BILLED_BREAKDOWN_BY_CUSTOMER]:
      permission?.includes(
        PermissionEnum.AR_STATEMENT_STATISTIC_UN_BILLED_BREAKDOWN_BY_CUSTOMER,
      ),
    [PermissionEnum.AR_STATEMENT_STATISTIC_UN_BILLED_BREAKDOWN_BY_CUSTOMER_DOWNLOAD]:
      permission?.includes(
        PermissionEnum.AR_STATEMENT_STATISTIC_UN_BILLED_BREAKDOWN_BY_CUSTOMER_DOWNLOAD,
      ),
    [PermissionEnum.AR_STATEMENT_STATISTIC_UN_COLLECTED_BREAKDOWN_BY_CUSTOMER]:
      permission?.includes(
        PermissionEnum.AR_STATEMENT_STATISTIC_UN_COLLECTED_BREAKDOWN_BY_CUSTOMER,
      ),
    [PermissionEnum.AR_STATEMENT_STATISTIC_UN_COLLECTED_BREAKDOWN_BY_CUSTOMER_DOWNLOAD]:
      permission?.includes(
        PermissionEnum.AR_STATEMENT_STATISTIC_UN_COLLECTED_BREAKDOWN_BY_CUSTOMER_DOWNLOAD,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_ADD]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_ADD,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_EXPORT]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_EXPORT,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_EDIT_CHARGE]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_EDIT_CHARGE,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_EDIT_CHARGE_HISTORY]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_EDIT_CHARGE_HISTORY,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_IS_TAX_INCLUSIVE]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_IS_TAX_INCLUSIVE,
      ),

    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_ADDITIONAL_CHARGE]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_ADDITIONAL_CHARGE,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_ADD]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_ADD,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_REMOVE]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_REMOVE,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_CREATE_CLAIM_REQUEST]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_BILLING_CREATE_CLAIM_REQUEST,
      ),

    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_COLLECTION]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_COLLECTION,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_COLLECTION_ADD]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_COLLECTION_ADD,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_INVOICE]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_INVOICE,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_INVOICE_ADD]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_INVOICE_ADD,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_PROOF]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_PROOF,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_PROOF_ADD]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_PROOF_ADD,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL,
    ),
    // [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_CHARGE]:
    //   permission?.includes(
    //     PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_CHARGE,
    //   ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_ASSOCIATED_WAYBILL]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_ASSOCIATED_WAYBILL,
      ),
    // [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_CHARGE_HISTORY]:
    //   permission?.includes(
    //     PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_CHARGE_HISTORY,
    //   ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_TAX_RATE]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_TAX_RATE,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_INVOICE]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_INVOICE,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_FILL_IN_ALL_INVOICE]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_FILL_IN_ALL_INVOICE,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT_EDIT]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT_EDIT,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_REIMBURSEMENT_EXPENSE]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WAYBILL_EDIT_REIMBURSEMENT_EXPENSE,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CONFIRM]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CONFIRM,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CUSTOMER_CONFIRM]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CUSTOMER_CONFIRM,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CONFIRM_COLLECTED]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CONFIRM_COLLECTED,
      ),

    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_EXPORT_STATEMENT]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_EXPORT_STATEMENT,
      ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WRITE_OFF]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_WRITE_OFF,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CANCEL]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_CANCEL,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_REJECT]: permission?.includes(
      PermissionEnum.CUSTOMER_STATEMENT_DETAIL_REJECT,
    ),
    [PermissionEnum.CUSTOMER_STATEMENT_DETAIL_EXPORT_RECORD]:
      permission?.includes(
        PermissionEnum.CUSTOMER_STATEMENT_DETAIL_EXPORT_RECORD,
      ),

    //vendor
    [PermissionEnum.VENDOR_STATEMENT]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT,
    ),
    [PermissionEnum.VENDOR_STATEMENT_ADD]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_ADD,
    ),
    [PermissionEnum.VENDOR_STATEMENT_EXPORT]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_EXPORT,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_EDIT_CHARGE]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_EDIT_CHARGE,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_EDIT_CHARGE_HISTORY]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_EDIT_CHARGE_HISTORY,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_IS_TAX_INCLUSIVE]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_IS_TAX_INCLUSIVE,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_ADD]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_ADD,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_REMOVE]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_CLAIM_TICKET_DETAIL_REMOVE,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_CREATE_CLAIM_REQUEST]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_CREATE_CLAIM_REQUEST,
      ),

    [PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_ADDITIONAL_CHARGE]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_BILLING_ADDITIONAL_CHARGE,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_PAYMENT]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_PAYMENT,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_PAYMENT_ADD]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_PAYMENT_ADD,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_INVOICE]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_INVOICE,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_INVOICE_Add]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_INVOICE_Add,
    ),

    [PermissionEnum.VENDOR_STATEMENT_DETAIL_PROOF]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_PROOF,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_PROOF_ADD]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_PROOF_ADD,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_EDIT_TAX_RATE]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_EDIT_TAX_RATE,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_ASSOCIATED_WAYBILL]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_ASSOCIATED_WAYBILL,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_EDIT_INVOICE]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_EDIT_INVOICE,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_FILL_IN_ALL_INVOICE]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_FILL_IN_ALL_INVOICE,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT_EDIT]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_BILLED_AMOUNT_EDIT,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_EDIT_REIMBURSEMENT_EXPENSE]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_WAYBILL_EDIT_REIMBURSEMENT_EXPENSE,
      ),

    [PermissionEnum.VENDOR_STATEMENT_DETAIL_CONFIRM]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_CONFIRM,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_VENDOR_CONFIRM]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_VENDOR_CONFIRM,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_CONFIRM_PAID]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_CONFIRM_PAID,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_EXPORT_STATEMENT]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_EXPORT_STATEMENT,
      ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_WRITE_OFF]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_WRITE_OFF,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_CANCEL]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_CANCEL,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_REJECT]: permission?.includes(
      PermissionEnum.VENDOR_STATEMENT_DETAIL_REJECT,
    ),
    [PermissionEnum.VENDOR_STATEMENT_DETAIL_EXPORT_RECORD]:
      permission?.includes(
        PermissionEnum.VENDOR_STATEMENT_DETAIL_EXPORT_RECORD,
      ),
    [PermissionEnum.TAX_RATE_SETTING]:
      isTH && permission?.includes(PermissionEnum.TAX_RATE_SETTING),
    [PermissionEnum.TAX_RATE_SETTING_EDIT]:
      isTH && permission?.includes(PermissionEnum.TAX_RATE_SETTING_EDIT),

    // tools
    [PermissionEnum.WAYBILL_AUTOMATION_OPERATION_SHOPEE_FLASH]:
      permission?.includes(
        PermissionEnum.WAYBILL_AUTOMATION_OPERATION_SHOPEE_FLASH,
      ),
    [PermissionEnum.WAYBILL_AUTOMATION_OPERATION_SHOPPE_LAST_MILE]:
      permission?.includes(
        PermissionEnum.WAYBILL_AUTOMATION_OPERATION_SHOPPE_LAST_MILE,
      ),
  };
};
