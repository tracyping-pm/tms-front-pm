export enum ServiceTypeTypeEnum {
  CONTRACT = 'Contract',
  EXPORTATION = 'Exportation',
  IMPORTATION = 'Importation',
  IMPORTATION_NFH_REIM_AND_OTHERS = 'Importation Nfh-Reim And Others',
  IMPORTATION_NFH = 'Importation-Nfh',
  IMPORTATION_REIM_AND_OTHERS = 'Importation-Reim And Others',
  LOGISTICS = 'Logistics',
  REIM_AND_OTHERS = 'Reim And Others',
  WAREHOUSE = 'Warehouse',
}

export const ServiceTypeTypeEnumText = {
  [ServiceTypeTypeEnum.CONTRACT]: 'Contract',
  [ServiceTypeTypeEnum.EXPORTATION]: 'Exportation',
  [ServiceTypeTypeEnum.IMPORTATION]: 'Importation',
  [ServiceTypeTypeEnum.IMPORTATION_NFH_REIM_AND_OTHERS]:
    'Importation Nfh-Reim And Others',
  [ServiceTypeTypeEnum.IMPORTATION_NFH]: 'Importation-Nfh',
  [ServiceTypeTypeEnum.IMPORTATION_REIM_AND_OTHERS]:
    'Importation-Reim And Others',
  [ServiceTypeTypeEnum.LOGISTICS]: 'Logistics',
  [ServiceTypeTypeEnum.REIM_AND_OTHERS]: 'Reim And Others',
  [ServiceTypeTypeEnum.WAREHOUSE]: 'Warehouse',
};

export enum BillingStatusEnum {
  CANCELLED = 'Cancelled',
  COLLECTED = 'Collected',
  FOR_APPROVAL = 'For Approval',
  FOR_BILLING = 'For Billing',
  FOR_RETURN_WITH_ISSUE = 'For Return - With Issue',
  PARTIALLY_COLLECTED = 'Partially Collected',
  PENDING = 'Pending',
  REBILL = 'Re-bill',
}

export const BillingStatusEnumText = {
  [BillingStatusEnum.CANCELLED]: 'Cancelled',
  [BillingStatusEnum.COLLECTED]: 'Collected',
  [BillingStatusEnum.FOR_APPROVAL]: 'For Approval',
  [BillingStatusEnum.FOR_BILLING]: 'For Billing',
  [BillingStatusEnum.FOR_RETURN_WITH_ISSUE]: 'For Return - With Issue',
  [BillingStatusEnum.PARTIALLY_COLLECTED]: 'Partially Collected',
  [BillingStatusEnum.PENDING]: 'Pending',
  [BillingStatusEnum.REBILL]: 'Re-bill',
};
