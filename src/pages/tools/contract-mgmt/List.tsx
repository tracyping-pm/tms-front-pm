import { materialPreview, materialsMultiDownload } from '@/api/common';
import {
  contractAdd,
  contractApproveContract,
  contractCheckVoid,
  contractDelete,
  contractOperationLog,
  contractRefuse,
  contractVoid,
  getContractList,
} from '@/api/contract';
import { ICommonMaterial } from '@/api/types/common';
import { IContractRecord } from '@/api/types/contract';
import ContractMaterialPopoverItem from '@/components/ContractMaterialPopoverItem';
import CountryIcon from '@/components/CountryIcon';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import IframeModal, {
  IIFrameModalState,
  initialIframeModalState,
} from '@/components/IframeModal';
import OperationLogModal, {
  IOperationLogModalState,
  initialOperationLogModalState,
} from '@/components/OperationLogModal';
import { ItemType } from '@/components/TableDropdown';
import TableOperation from '@/components/TableOperation';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
} from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  ContractStatusEnum,
  ContractStatusEnumColor,
  ContractStatusEnumText,
  ContractTypeEnum,
  ContractTypeEnumText,
  FieldQueryHighlightTypeEnum,
  FuelChangeFrequencyEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { formatString } from '@/utils/format';
import { formatAmount } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  HistoryOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  ProColumns,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Badge, Button, Popover } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import CreateContractModal, { IDto } from './components/CreateContractModal';
import RejectContractModal from './components/RejectContractModal';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  contractNumber?: string;
  projectId?: number;
  contractType?: ContractTypeEnum;
  contractSignerId?: number;
  contractStatusList?: ContractStatusEnum[];
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  projectName?: string;
  contractSigner?: string;
}

interface ICreateContractModalState {
  open: boolean;
  title?: string;
  confirmLoading: boolean;
}

const initialCreateContractModalState: ICreateContractModalState = {
  open: false,
  confirmLoading: false,
};

interface IRejectContractModalState {
  open: boolean;
  title?: string;
  confirmLoading: boolean;
}

const initialRejectContractModalState: IRejectContractModalState = {
  open: false,
  confirmLoading: false,
};

const ContractList: React.FC = () => {
  const access = useAccess();
  const { message, modal } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);

  const [createContractModalState, setCreateContractModalState] =
    useSetState<ICreateContractModalState>(initialCreateContractModalState);
  const [rejectContractModalState, setRejectContractModalState] =
    useSetState<IRejectContractModalState>(initialRejectContractModalState);
  const [iframeModalState, setIframeModalState] =
    useSetState<IIFrameModalState>(initialIframeModalState);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const [passLoading, setPassLoading] = useState<boolean>(false);
  const [voidLoading, setVoidLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [fileViewPopoverOpen, setFileViewPopoverOpen] =
    useState<boolean>(false);

  const activeRecordKeyRef = useRef<number>();
  const activeFileDriveIdRef = useRef<string>();

  const [, setUrlState] = useUrlState();

  const formRef = useRef<ProFormInstance>();

  const {
    options: contractIdOptions,
    onSearch: contractIdSearch,
    defaultFieldProps: contractIdDefaultFieldProps,
    value: contractIdValue,
    setValue: setContractIdValue,
  } = useFieldQuery({
    field: 'contractID',
    esDtoClass: ES_DTO_CLASS.CONTRACT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
  });

  const {
    options: projectNameOptions,
    onSearch: projectNameSearch,
    defaultFieldProps: projectNameDefaultFieldProps,
    value: projectNameValue,
    setValue: setProjectNameValue,
  } = useFieldQuery({
    field: 'projectName',
    esDtoClass: ES_DTO_CLASS.PROJECT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const {
    options: vendorContractSignerOptions,
    onSearch: vendorContractSignerSearch,
    defaultFieldProps: vendorContractSignerDefaultFieldProps,
    value: vendorContractSignerValue,
    setValue: vendorSetContractSignerValue,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: customerContractSignerOptions,
    onSearch: customerContractSignerSearch,
    defaultFieldProps: customerContractSignerDefaultFieldProps,
    value: customerContractSignerValue,
    setValue: customerSetContractSignerValue,
  } = useFieldQuery({
    field: 'customerName',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const doScrollTop = useCallback((top: number) => {
    setTimeout(() => {
      // 滚动到记录位置
      window?.scrollTo?.({
        top: top,
        behavior: 'smooth',
      });
    }, 0);
  }, []);

  const getDataSource = useCallback(async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const res = await getContractList(BE_NEED).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setOriginData(res.data);
    }
  }, []);

  const reload = useCallback(() => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    getDataSource(BE_NEED ?? {});
  }, []);

  // 点击搜索按钮触发
  const onSubmit = useCallback(async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;

    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();

    if (values.contractNumber) {
      const nameOrValue =
        values.contractNumber?.name || values.contractNumber?.value;
      const _value = nameOrValue ? formatString(nameOrValue) : undefined;
      lodash.set(FE_NEED, 'contractNumber', _value);
      lodash.set(BE_NEED, 'contractNumber', _value);
    }

    if (values.projectName) {
      lodash.set(FE_NEED, 'projectName', values.projectName?.name);
      lodash.set(FE_NEED, 'projectId', values.projectName?.id);
      lodash.set(BE_NEED, 'projectId', values.projectName?.id);
    }

    if (values.contractType) {
      lodash.set(FE_NEED, 'contractType', values.contractType);
      lodash.set(BE_NEED, 'contractType', values.contractType);
    }

    if (values.contractSigner) {
      lodash.set(FE_NEED, 'contractSigner', values.contractSigner?.name);
      lodash.set(FE_NEED, 'contractSignerId', values.contractSigner?.id);
      lodash.set(BE_NEED, 'contractSignerId', values.contractSigner?.id);
    }

    if (values.contractStatusList) {
      lodash.set(FE_NEED, 'contractStatusList', values.contractStatusList);
      lodash.set(BE_NEED, 'contractStatusList', values.contractStatusList);
    }

    const urlParams = {
      FE_NEED: FE_NEED,
      BE_NEED: BE_NEED,
    };

    const extra = JSON.stringify(urlParams);
    setUrlState({ extra: extra });

    // BE_NEED
    getDataSource(BE_NEED);
  }, []);

  const fillTableForm = useCallback((FE_NEED: IFE_NEED) => {
    formRef.current?.setFieldsValue({
      contractType: FE_NEED.contractType,
      contractStatusList: FE_NEED.contractStatusList,
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      contractNumber: FE_NEED.contractNumber
        ? { value: FE_NEED.contractNumber }
        : undefined,
      projectName: FE_NEED.projectName
        ? { value: FE_NEED.projectName, id: FE_NEED.projectId }
        : undefined,
      contractSigner: FE_NEED.contractSigner
        ? { value: FE_NEED.contractSigner, id: FE_NEED.contractSignerId }
        : undefined,
    });

    setContractIdValue(FE_NEED.contractNumber);
    setProjectNameValue(FE_NEED.projectName);
    vendorSetContractSignerValue(FE_NEED.contractSigner);
    customerSetContractSignerValue(FE_NEED.contractSigner);
  }, []);

  const doFirstQuery = useCallback(async () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { FE_NEED, BE_NEED } = extraJson;
    if (FE_NEED) {
      fillTableForm(FE_NEED);
    }

    if (BE_NEED) {
      await getDataSource(BE_NEED);
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    } else {
      await getDataSource({ pageNum: 1, pageSize: 20 });
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    }
  }, []);

  const onReset = useCallback(() => {
    setUrlState({ extra: undefined });
    setContractIdValue(undefined);
    setProjectNameValue(undefined);
    vendorSetContractSignerValue(undefined);
    customerSetContractSignerValue(undefined);
    // 自动触发 onSubmit
  }, []);

  const onCreateContractConfirm = useCallback(
    async (dto: IDto, files: File[]) => {
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(dto)], {
        type: 'application/json',
      });
      formData.append('dto', blob);
      files.forEach((item: File) => {
        formData.append('files', item);
      });
      setCreateContractModalState({ confirmLoading: true });
      const res = await contractAdd(formData).finally(() => {
        setCreateContractModalState({ confirmLoading: false });
      });
      if (res.code === 200) {
        if (res.data) {
          setCreateContractModalState({ open: false });
          message.success('Add contract successfully!');
          reload();
        } else {
          modal.warning({
            title: 'Warning',
            content:
              'A route library must be created under the project to create a contract',
          });
        }
      }
    },
    [],
  );

  const handleCreateContract = useCallback(() => {
    setCreateContractModalState({ open: true });
  }, []);

  const onViewDrive = useCallback(async (material: ICommonMaterial) => {
    activeFileDriveIdRef.current = material.fileDriveId;
    setIframeModalState({ pending: true });
    const res = await materialPreview({
      materialId: material.fileMaterialId,
      driveFileId: material.fileDriveId,
    }).finally(() => {
      setIframeModalState({ pending: false });
    });

    if (res.code === 200) {
      setIframeModalState({
        url: res.data,
        open: true,
      });
    }
  }, []);

  const onDownLoad = useCallback(async (record: IContractRecord) => {
    const fileDriveIdList = record.materials.map(
      (material) => material.fileDriveId,
    );

    setDownloadLoading(true);

    await materialsMultiDownload(fileDriveIdList)
      .then((res) => {
        const blob = new Blob([res], { type: 'application/zip' });
        // 创建可下载的链接并触发下载
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = 'files.zip'; // 设置下载文件的名称
        a.click();
        URL.revokeObjectURL(url); // 释放 URL 对象
      })
      .catch((error) => {
        message.error(error);
      })
      .finally(() => {
        setDownloadLoading(false);
      });
  }, []);

  const fetchLogList = useCallback(async (record: IContractRecord) => {
    setOperationLogModalState({ loading: true });
    const res = await contractOperationLog({ id: record.contractId }).finally(
      () => {
        setOperationLogModalState({ loading: false });
      },
    );

    if (res.code === 200) {
      const list =
        res.data?.operationLogList?.map?.((item, index) => ({
          id: index,
          createdAt: item.logTime,
          description: item.description,
        })) ?? [];
      setOperationLogModalState({ list, open: true });
    }
  }, []);

  const onRejectContractConfirm = useCallback(
    async (values: { description: string }) => {
      const payload = {
        contractId: Number(activeRecordKeyRef.current),
        refuseReason: formatString(values.description),
      };
      setRejectContractModalState({ confirmLoading: true });
      const res = await contractRefuse(payload).finally(() => {
        setRejectContractModalState({ confirmLoading: false });
      });
      if (res.code === 200) {
        setRejectContractModalState({ open: false });
        message.success('Contract reject successfully!');
        reload();
      }
    },
    [],
  );

  const doApprove = useCallback(async (record: IContractRecord) => {
    const payload = {
      id: record.contractId,
    };
    setPassLoading(true);
    const res = await contractApproveContract(payload).finally(() => {
      setPassLoading(false);
    });
    if (res.code === 200) {
      message.success('Contract approved successfully!');
      reload();
    }
  }, []);

  const doVoid = useCallback(async (record: IContractRecord) => {
    const payload = {
      id: record.contractId,
    };
    setVoidLoading(true);
    const res = await contractCheckVoid(payload).finally(() => {
      setVoidLoading(false);
    });
    if (res.code === 200) {
      if (res.data.code === 0) {
        modal.confirm({
          title: 'Terminate Confirm',
          icon: <ExclamationCircleFilled />,
          content: 'Are you sure you want to void this contract?',
          okText: 'Confirm',
          cancelText: 'Cancel',
          onOk: async () => {
            const params = {
              id: record.contractId,
            };
            setVoidLoading(true);
            const voided = await contractVoid(params);
            setVoidLoading(false);
            if (voided.code === 200) {
              message.success('Contract void successfully!');
              reload();
            }
          },
          onCancel() {},
        });
      } else {
        modal.confirm({
          title: 'Terminate Confirm',
          icon: <ExclamationCircleFilled />,
          content: res.data.msg,
          okText: 'Confirm',
          cancelText: 'Cancel',
          onOk: async () => {
            const params = {
              id: record.contractId,
            };
            setVoidLoading(true);
            const voided = await contractVoid(params);
            setVoidLoading(false);
            if (voided.code === 200) {
              message.success('Contract void successfully!');
              reload();
            }
          },
          onCancel() {},
        });
      }
    } else {
      setVoidLoading(false);
    }
  }, []);

  const onDelete = useCallback(async (record: IContractRecord) => {
    modal.confirm({
      title: 'Delete Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm delete the contract?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const payload = {
          id: record.contractId,
        };
        setDeleteLoading(true);
        const res = await contractDelete(payload).finally(() => {
          setDeleteLoading(false);
        });
        if (res.code === 200) {
          message.success('Contract delete successfully!');
          reload();
        }
      },
      onCancel() {
        // do nothing
      },
    });
  }, []);

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;

    await getDataSource({ ...BE_NEED, ...params });
  };

  const columns: ProColumns[] = [
    {
      title: 'Contract Number',
      dataIndex: 'contractNumber',
      valueType: 'select',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...contractIdDefaultFieldProps,
        placeholder: 'Contract Number',
        options: contractIdOptions,
        onSearch: contractIdSearch,
        value: contractIdValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.contractNumber}>
            {record.contractNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      valueType: 'select',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        ...projectNameDefaultFieldProps,
        placeholder: 'Project Name',
        options: projectNameOptions,
        onSearch: projectNameSearch,
        value: projectNameValue,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Contract Type',
      dataIndex: 'contractType',
      width: 320,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: ContractTypeEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Contract Type',
        onChange: () => {
          vendorSetContractSignerValue(undefined);
          customerSetContractSignerValue(undefined);
          formRef.current?.setFieldsValue({ contractSigner: undefined });
        },
      },
      render: (_, record) => {
        const content = record.contractType;

        return (
          <CustomTooltip title={content}>
            <span>{content}</span>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Contract Signer',
      dataIndex: 'contractSigner',
      valueType: 'select',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: (a, b, form) => {
        const contractType = form?.getFieldValue?.('contractType');
        return contractType === ContractTypeEnum.VENDOR ? (
          <ProFormSelect
            placeholder="Contract Signer"
            fieldProps={{
              ...vendorContractSignerDefaultFieldProps,
              options: vendorContractSignerOptions,
              onSearch: vendorContractSignerSearch,
              value: vendorContractSignerValue,
              disabled: !contractType,
            }}
          />
        ) : (
          <ProFormSelect
            placeholder="Contract Signer"
            fieldProps={{
              ...customerContractSignerDefaultFieldProps,
              options: customerContractSignerOptions,
              onSearch: customerContractSignerSearch,
              value: customerContractSignerValue,
              disabled: !contractType,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.contractSigner}>
            {record.contractSigner}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Contract Status',
      dataIndex: 'contractStatusList',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'select',
      valueEnum: ContractStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Contract Status',
        mode: 'multiple',
        maxTagCount: 'responsive',
      },
      render: (_, record) => {
        const status: ContractStatusEnum = record.contractStatus;
        const Content = (
          <Badge color={ContractStatusEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Fuel Basis',
      dataIndex: 'fuelBasis',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      hideInSearch: true,
      render: (_, record) => {
        return record.fuelBasis || record.fuelBasis === 0 ? (
          <div>
            <CountryIcon />
            {formatAmount(record.fuelBasis)}
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Fuel change frequency',
      dataIndex: 'fuelChangeFrequency',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      hideInSearch: true,
      render: (_, record) => {
        const content: FuelChangeFrequencyEnum = record.fuelChangeFrequency;

        return (
          <CustomTooltip title={content}>
            <span>{content}</span>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Contract Validity Period',
      dataIndex: 'contractValidityPeriod',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      hideInSearch: true,
      render: (_, record) => {
        const dateRange = `${dayjs(record.startDate).format(
          'YYYY-MM-DD',
        )} - ${dayjs(record.endDate).format('YYYY-MM-DD')}`;
        return <CustomTooltip title={dateRange}>{dateRange}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      align: 'left',
      width: 276,
      hideInTable: !(
        access[PermissionEnum.CONTRACT_MANAGEMENT_VIEW] ||
        access[PermissionEnum.CONTRACT_MANAGEMENT_DOWNLOAD] ||
        access[PermissionEnum.CONTRACT_MANAGEMENT_HISTORY] ||
        access[PermissionEnum.CONTRACT_MANAGEMENT_REJECT] ||
        access[PermissionEnum.CONTRACT_MANAGEMENT_PASS] ||
        access[PermissionEnum.CONTRACT_MANAGEMENT_TERMINATE] ||
        access[PermissionEnum.CONTRACT_MANAGEMENT_DELETE]
      ),
      render: (_, record) => {
        const operationList = [
          access[PermissionEnum.CONTRACT_MANAGEMENT_VIEW]
            ? {
                key: 'view',
                render: () => {
                  const renderContent = () => {
                    const itemStyle: CSSProperties = {
                      height: '46px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '15px',
                      fontSize: 14,
                    };
                    return (
                      <div>
                        {record?.materials?.map?.(
                          (material: ICommonMaterial, index: number) => {
                            return (
                              <ContractMaterialPopoverItem
                                key={material.fileDriveId || index}
                                material={material}
                                style={{
                                  ...itemStyle,
                                  borderBottom:
                                    index === record?.materials?.length - 1
                                      ? 0
                                      : '1px solid #F5F5F5',
                                }}
                                loading={
                                  iframeModalState.pending &&
                                  activeFileDriveIdRef.current ===
                                    material.fileDriveId
                                }
                                onView={onViewDrive}
                              />
                            );
                          },
                        )}
                      </div>
                    );
                  };

                  return (
                    <>
                      <Popover
                        content={renderContent()}
                        placement="topRight"
                        autoAdjustOverflow={true}
                        trigger={'click'}
                        open={
                          activeRecordKeyRef.current === record.contractId &&
                          fileViewPopoverOpen
                        }
                        onOpenChange={(newOpen: boolean) => {
                          setFileViewPopoverOpen(newOpen);
                        }}
                      >
                        <Button
                          style={{ margin: 0, padding: 0 }}
                          icon={<EyeOutlined />}
                          type="link"
                          onClick={() => {
                            activeRecordKeyRef.current = record.contractId;
                          }}
                        >
                          View
                        </Button>
                      </Popover>
                    </>
                  );
                },
              }
            : null,
          access[PermissionEnum.CONTRACT_MANAGEMENT_DOWNLOAD]
            ? {
                key: 'download',
                title: 'Download',
                icon: <DownloadOutlined />,
                label: 'Download',
                loading:
                  downloadLoading &&
                  activeRecordKeyRef.current === record.contractId,
              }
            : null,
          access[PermissionEnum.CONTRACT_MANAGEMENT_HISTORY]
            ? {
                key: 'history',
                title: 'History',
                icon: <HistoryOutlined />,
                label: 'History',
                loading:
                  operationLogModalState.loading &&
                  activeRecordKeyRef.current === record.contractId,
              }
            : null,
          access[PermissionEnum.CONTRACT_MANAGEMENT_REJECT] &&
          record.contractStatus === ContractStatusEnum.UNDER_REVIEW
            ? {
                key: 'reject',
                title: 'Reject',
                icon: <StopOutlined />,
                label: 'Reject',
              }
            : null,
          access[PermissionEnum.CONTRACT_MANAGEMENT_PASS] &&
          record.contractStatus === ContractStatusEnum.UNDER_REVIEW
            ? {
                key: 'approve',
                title: 'Approve',
                icon: <CheckCircleOutlined />,
                loading:
                  passLoading &&
                  activeRecordKeyRef.current === record.contractId,
                label: 'Approve',
              }
            : null,
          access[PermissionEnum.CONTRACT_MANAGEMENT_TERMINATE] &&
          record.contractStatus !== ContractStatusEnum.TERMINATED &&
          record.contractStatus !== ContractStatusEnum.EXPIRED
            ? {
                key: 'terminate',
                title: 'Terminate',
                icon: <CloseCircleOutlined />,
                label: 'Terminate',
                loading: voidLoading,
              }
            : null,
          access[PermissionEnum.CONTRACT_MANAGEMENT_DELETE] &&
          record.contractStatus === ContractStatusEnum.UNDER_REVIEW
            ? {
                key: 'delete',
                title: 'Delete',
                icon: <DeleteOutlined />,
                loading:
                  deleteLoading &&
                  activeRecordKeyRef.current === record.contractId,
                label: 'Delete',
              }
            : null,
        ].filter(Boolean) as ItemType[];
        return (
          <TableOperation
            list={operationList}
            onTrigger={async (item: ItemType) => {
              activeRecordKeyRef.current = record.contractId;
              if (item.key === 'download') {
                await onDownLoad(record);
                return Promise.resolve();
              } else if (item.key === 'history') {
                await fetchLogList(record);
                return Promise.resolve();
              } else if (item.key === 'reject') {
                setRejectContractModalState({ open: true });
                return Promise.resolve();
              } else if (item.key === 'approve') {
                await doApprove(record);
                return Promise.resolve();
              } else if (item.key === 'terminate') {
                await doVoid(record);
                return Promise.resolve();
              } else if (item.key === 'delete') {
                await onDelete(record);
                return Promise.resolve();
              } else {
                console.error('Unknown operation');
              }
            }}
          />
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access
      key="create-contract"
      accessible={access[PermissionEnum.CONTRACT_MANAGEMENT_CREATE]}
    >
      <Button type="primary" onClick={() => handleCreateContract()}>
        Create Contract
      </Button>
    </Access>,
  ];

  useEffect(() => {
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  return (
    <>
      <CustomTable
        rowKey={(record) => record.contractId}
        columns={columns}
        scroll={{ x: 1500 }}
        formRef={formRef}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationChange({ pageNum: page, pageSize: pageSize });
          },
        }}
        loading={loading}
        toolBarRender={
          access[PermissionEnum.CONTRACT_MANAGEMENT_CREATE]
            ? toolBarRender
            : false
        }
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      <CreateContractModal
        open={createContractModalState.open}
        confirmLoading={createContractModalState.confirmLoading}
        onCancel={() => setCreateContractModalState({ open: false })}
        onConfirm={onCreateContractConfirm}
      />
      <RejectContractModal
        open={rejectContractModalState.open}
        confirmLoading={rejectContractModalState.confirmLoading}
        onCancel={() => setRejectContractModalState({ open: false })}
        onConfirm={onRejectContractConfirm}
      />
      <IframeModal
        zIndex={999999}
        url={iframeModalState.url}
        open={iframeModalState.open}
        onCancel={() => {
          setIframeModalState({ open: false });
          setFileViewPopoverOpen(true);
        }}
      />
      <OperationLogModal
        title={'Operation Record'}
        open={operationLogModalState.open}
        list={operationLogModalState.list}
        onCancel={() => setOperationLogModalState({ open: false })}
        onConfirm={() => setOperationLogModalState({ open: false })}
      />
    </>
  );
};

export default ContractList;
