import { materialPreview, materialsMultiDownload } from '@/api/common';
import { contractOperationLog } from '@/api/contract';
import { customerContractList } from '@/api/customer';
import { ICommonMaterial } from '@/api/types/common';
import { IContractRecord } from '@/api/types/contract';
import { ICustomerContractsListPayload } from '@/api/types/customer';
import ContractMaterialPopoverItem from '@/components/ContractMaterialPopoverItem';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
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
  ContractStatusNoRejectedEnumText,
  FieldQueryHighlightTypeEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import {
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useAccess, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Badge, Button, Popover, Space } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import styles from './styles.less';

const CustomerDetailContractList: React.FC = () => {
  const { message } = App.useApp();
  const access = useAccess();
  const { id } = useParams();
  const customerId = id ? +id : undefined;
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [iframeModalState, setIframeModalState] =
    useSetState<IIFrameModalState>(initialIframeModalState);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false);

  const [fileViewPopoverOpen, setFileViewPopoverOpen] =
    useState<boolean>(false);

  const activeRecordKeyRef = useRef<number>();
  const activeFileDriveIdRef = useRef<string>();
  const formRef = useRef<ProFormInstance>();
  const searchParamsRef = useRef<any>();

  const getDataSource = useCallback(
    async (BE_NEED: ICustomerContractsListPayload) => {
      setLoading(true);
      const res = await customerContractList(BE_NEED);
      setLoading(false);

      if (res.code === 200) {
        setOriginData(res.data);
      }
    },
    [],
  );

  const onSubmit = useCallback(async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;
    const BE_NEED: ICustomerContractsListPayload = {
      pageNum,
      pageSize,
      customerId,
    };
    const values = formRef.current?.getFieldsValue();
    if (values.projectNameObj) {
      lodash.set(BE_NEED, 'projectId', values.projectNameObj.id);
    }
    if (values.contractNumberObj) {
      lodash.set(BE_NEED, 'contractNumber', values.contractNumberObj.name);
    }
    if (values.contractStatusList) {
      lodash.set(BE_NEED, 'contractStatusList', values.contractStatusList);
    }
    searchParamsRef.current = BE_NEED;
    getDataSource(BE_NEED);
  }, []);

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
    customerId: number;
  }) => {
    await getDataSource({ ...searchParamsRef.current, ...params });
  };

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
    const res = await contractOperationLog({
      id: record.contractId,
    }).finally(() => {
      setOperationLogModalState({ loading: false });
    });

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

  const columns: ProColumns[] = [
    {
      title: 'Project Name',
      dataIndex: 'projectNameObj',
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
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Project Name' }}
          request={{
            field: 'projectName',
            esDtoClass: ES_DTO_CLASS.PROJECT,
            type: FieldQueryHighlightTypeEnum.USER_ROLE,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Contract Number',
      dataIndex: 'contractNumberObj',
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
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Contract Number' }}
          request={{
            field: 'contractID',
            esDtoClass: ES_DTO_CLASS.CONTRACT,
            type: FieldQueryHighlightTypeEnum.None,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.contractNumber}>
            {record.contractNumber}
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
      valueEnum: ContractStatusNoRejectedEnumText,
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
      title: 'Contract Validity Period',
      dataIndex: 'contractValidityPeriod',
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
      title: 'Contract Signer',
      dataIndex: 'contractSigner',
      width: 200,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
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
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      align: 'center',
      width: 276,
      hideInTable: !(
        access[PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_VIEW] ||
        access[PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_DOWNLOAD] ||
        access[PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_HISTORY]
      ),
      render: (_, record) => {
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
                        activeFileDriveIdRef.current === material.fileDriveId
                      }
                      onView={onViewDrive}
                    />
                  );
                },
              )}
            </div>
          );
        };
        const operationList = [
          access[PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_VIEW]
            ? {
                key: 'view',
                render: () => {
                  return (
                    <Space align="center" size={0}>
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
                    </Space>
                  );
                },
              }
            : null,
          access[PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_DOWNLOAD]
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
          access[PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_HISTORY]
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
          // access[PermissionEnum.CUSTOMER_DETAIL_CONTRACTS_TERMINATE] &&
          // record.contractStatus !== ContractStatusEnum.TERMINATED &&
          // record.contractStatus !== ContractStatusEnum.EXPIRED
          //   ? {
          //       key: 'terminate',
          //       title: 'Terminate',
          //       icon: <CloseCircleOutlined />,
          //       label: 'Terminate',
          //       loading: voidLoading,
          //     }
          //   : null,
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
    getDataSource({ customerId });
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
            onChange: (page: number, pageSize: number) => {
              onPaginationChange({
                pageNum: page,
                pageSize: pageSize,
                customerId: +customerId!,
              });
            },
          }}
          loading={loading}
          onSubmit={onSubmit}
          manualRequest
          filterSticky={{ top: LAYOUT_HEADER_HEIGHT + 86 + 60 }}
        />
      </div>
      <OperationLogModal
        title={'Operation Record'}
        open={operationLogModalState.open}
        list={operationLogModalState.list}
        onCancel={() => setOperationLogModalState({ open: false })}
        onConfirm={() => setOperationLogModalState({ open: false })}
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
    </>
  );
};
export default CustomerDetailContractList;
