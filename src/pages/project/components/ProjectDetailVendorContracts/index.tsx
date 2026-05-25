import { materialPreview, materialsMultiDownload } from '@/api/common';
import {
  contractAdd,
  contractApproveContract,
  contractCheckVoid,
  contractDelete,
  contractOperationLog,
  contractRefuse,
  contractVoid,
} from '@/api/contract';
import { projectContractList } from '@/api/project';
import { ICommonMaterial } from '@/api/types/common';
import { IContractRecord } from '@/api/types/contract';
import { IProjectContractsListPayload } from '@/api/types/project';
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
  FieldQueryHighlightTypeEnum,
  FuelChangeFrequencyEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import CreateContractModal, {
  IDto,
} from '@/pages/tools/contract-mgmt/components/CreateContractModal';
import RejectContractModal from '@/pages/tools/contract-mgmt/components/RejectContractModal';
import { formatAmount } from '@/utils/utils';
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
import { useAccess, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Badge, Button, Popover } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { StateContext } from '../../Detail/store';
import styles from './styles.less';

export interface ICreateContractModalState {
  open?: boolean;
  title?: string;
  confirmLoading?: boolean;
}

interface IRejectContractModalState {
  open: boolean;
  title?: string;
  confirmLoading: boolean;
}

const initialRejectContractModalState: IRejectContractModalState = {
  open: false,
  confirmLoading: false,
};

const ProjectDetailContractList: React.FC<{
  tabKey: string;
  createContractModalState: ICreateContractModalState;
  setCreateContractModalState: (b: ICreateContractModalState) => void;
}> = ({ tabKey, createContractModalState, setCreateContractModalState }) => {
  const access = useAccess();
  const { message, modal } = App.useApp();
  const { id } = useParams();
  const projectId = id ? +id : undefined;

  // @ts-ignore
  const { state } = useContext(StateContext);

  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [rejectContractModalState, setRejectContractModalState] =
    useSetState<IRejectContractModalState>(initialRejectContractModalState);
  const [iframeModalState, setIframeModalState] =
    useSetState<IIFrameModalState>(initialIframeModalState);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
  const [passLoading, setPassLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [voidLoading, setVoidLoading] = useState<boolean>(false);

  const [fileViewPopoverOpen, setFileViewPopoverOpen] =
    useState<boolean>(false);

  const activeRecordKeyRef = useRef<number>();
  const activeFileDriveIdRef = useRef<string>();

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

  const getDataSource = useCallback(
    async (BE_NEED: IProjectContractsListPayload) => {
      setLoading(true);
      const res = await projectContractList({
        ...BE_NEED,
        contractType: 'Vendor',
      });
      setLoading(false);
      if (res.code === 200) {
        setOriginData(res.data);
      }
    },
    [],
  );

  const onSubmit = useCallback(
    async (params: {
      pageNum?: number | undefined;
      pageSize?: number | undefined;
    }) => {
      const { pageNum = 1, pageSize = 20 } = params;
      const BE_NEED: IProjectContractsListPayload = {
        pageNum,
        pageSize,
        projectId,
      };
      const values = formRef.current?.getFieldsValue();
      if (values.contractNumber) {
        lodash.set(BE_NEED, 'contractNumber', values.contractNumber?.name);
      }
      if (values.contractSigner) {
        lodash.set(BE_NEED, 'contractSignerId', values.contractSigner?.id);
      }
      if (values.contractStatusList) {
        lodash.set(BE_NEED, 'contractStatusList', values.contractStatusList);
      }
      getDataSource(BE_NEED);
    },
    [],
  );

  const onReset = useCallback(() => {
    setContractIdValue(undefined);
    vendorSetContractSignerValue(undefined);
    // customerSetContractSignerValue(undefined);
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
          onSubmit({});
          setCreateContractModalState({ open: false });
          message.success('Add contract successfully!');
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
    activeRecordKeyRef.current = record.contractId;
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
        refuseReason: values.description,
      };
      setRejectContractModalState({ confirmLoading: true });
      const res = await contractRefuse(payload).finally(() => {
        setRejectContractModalState({ confirmLoading: false });
      });
      if (res.code === 200) {
        setRejectContractModalState({ open: false });
        message.success('Contract reject successfully!');
        onSubmit({});
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
      onSubmit({});
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
          onSubmit({});
        }
      },
      onCancel() {
        // do nothing
      },
    });
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
              onSubmit({});
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
              onSubmit({});
            }
          },
          onCancel() {},
        });
      }
    } else {
      setVoidLoading(false);
    }
  }, []);

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
      renderFormItem: () => {
        // const contractType = form?.getFieldValue?.('contractType');
        return (
          <ProFormSelect
            placeholder="Contract Signer"
            fieldProps={{
              ...vendorContractSignerDefaultFieldProps,
              options: vendorContractSignerOptions,
              onSearch: vendorContractSignerSearch,
              value: vendorContractSignerValue,
              // disabled: !contractType,
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
        access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_VIEW] ||
        access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_DOWNLOAD] ||
        access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_HISTORY] ||
        access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_REJECT] ||
        access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_PASS] ||
        access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_DELETE]
      ),
      render: (_, record) => {
        const operationList = [
          access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_VIEW]
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
                        autoAdjustOverflow={false}
                        trigger="click"
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
          access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_DOWNLOAD]
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
          access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_HISTORY]
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
          access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_REJECT] &&
          record.contractStatus === ContractStatusEnum.UNDER_REVIEW
            ? {
                key: 'reject',
                title: 'Reject',
                icon: <StopOutlined />,
                label: 'Reject',
              }
            : null,
          access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_PASS] &&
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
          access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_TERMINATE] &&
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
          access[PermissionEnum.PROJECT_DETAIL_VENDOR_CONTRACTS_DELETE] &&
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

  useEffect(() => {
    getDataSource({ projectId });
  }, []);

  return (
    <>
      <div className={styles.contract}>
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
            onChange: (pageNum: number, pageSize: number) => {
              onSubmit({ pageNum, pageSize });
            },
          }}
          loading={loading}
          onSubmit={onSubmit}
          onReset={onReset}
          manualRequest
          filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
        />
      </div>
      {createContractModalState.open ? (
        <CreateContractModal
          projectInfo={{
            id: state?.projectDetail?.data?.id,
            name: state?.projectDetail?.data?.projectName,
          }}
          contractType={tabKey}
          open={createContractModalState.open}
          confirmLoading={createContractModalState.confirmLoading}
          onCancel={() => setCreateContractModalState({ open: false })}
          onConfirm={onCreateContractConfirm}
        />
      ) : null}
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
export default ProjectDetailContractList;
