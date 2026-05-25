import { placeGeoProvince, placeGeoRegion, placeLeoCity } from '@/api/place';
import { stopPointAdd, stopPointList } from '@/api/project';
import { IPlaceGeoRecord } from '@/api/types/place';
import { IStopPointItem } from '@/api/types/project';
import AddStopPointsModal from '@/components/AddStopPointsModal';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { CountryEnumLabelListMap } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { FileAddOutlined } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { useAccess, useModel } from '@umijs/max';
import { App, Button, Modal, ModalProps } from 'antd';
import { FC, Key, useCallback, useEffect, useState } from 'react';
import styles from './styles.less';

const DEFAULT_WIDTH = 200;

type IProps = ModalProps & {
  isStandardWaybill: boolean;
  projectId: number;
  open: boolean;
  onConfirm?: (list: IStopPointItem[]) => void;
};

const StopPointsModal: FC<IProps> = ({
  open,
  isStandardWaybill,
  projectId,
  onConfirm,
  ...restProps
}) => {
  const access = useAccess();
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  // @ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<any>([]);
  const [stopPointsOpen, setStopPointsOpen] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<IStopPointItem[]>([]);

  const showCreateStopPointBtn = isStandardWaybill
    ? access[PermissionEnum.STANDARD_WAYBILL_ROUTE_PLANNING_CREATE_STOP_POINT]
    : access[PermissionEnum.TEMPORARY_WAYBILL_ROUTE_PLANNING_CREATE_STOP_POINT];

  const reset = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, []);

  // 获取选择数据
  const getSelectItem = (values: { ids: []; options: [] }) => {
    setSelectedRowKeys(values.ids);
    setSelectedRows(values.options);
  };

  const getDataSource = async (params?: any) => {
    const payload = {
      ...params,
      projectId: Number(projectId),
    };
    delete payload.current;
    setLoading(true);
    const res = await stopPointList(payload);
    setLoading(false);

    if (res.code === 200) {
      setDataSource(res.data ?? []);
    }
  };

  const addModalFinish = async (values: any) => {
    const payload = {
      ...values,
      projectId: Number(projectId),
    };

    setLoading(true);
    const res = await stopPointAdd(payload);
    setLoading(false);
    if (res.code === 200) {
      message.success(`Add Successfully`);
      setStopPointsOpen(false);
      getDataSource();
    }
  };

  const onOk = useCallback(() => {
    onConfirm?.(selectedRows);
  }, [selectedRows]);

  const toolBarRender = () => [
    <Button
      key="create"
      type="primary"
      icon={<FileAddOutlined />}
      onClick={() => setStopPointsOpen(true)}
    >
      Create Stop Point
    </Button>,
  ];

  const columns: ProColumns[] = [
    {
      title: 'label',
      dataIndex: 'label',
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
        placeholder: 'Stop Points Label',
      },
      search: {
        transform: (value: any) => {
          return { label: value || undefined };
        },
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.label}>{record.label}</CustomTooltip>
        );
      },
    },
    {
      title: labelLevelList?.[1],
      dataIndex: 'padId',
      valueType: 'select',
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
        placeholder: labelLevelList?.[1],
      },

      request: async () => {
        const payload = {
          country: countryId!,
          noAllRegion: true,
        };
        const res = await placeGeoRegion(payload);
        if (res.code === 200) {
          return res?.data?.map((item: IPlaceGeoRecord) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
        } else {
          return [];
        }
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.padName}>{record.padName}</CustomTooltip>
        );
      },
    },
    {
      title: labelLevelList?.[2],
      dataIndex: 'sadId',
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      dependencies: ['padId'],
      fieldProps: {
        placeholder: labelLevelList?.[2],
      },
      request: async (params) => {
        if (!params.padId) {
          return [];
        }
        const payload = {
          region: params.padId,
        };
        const res = await placeGeoProvince(payload);
        if (res.code === 200) {
          return res?.data?.map((item: IPlaceGeoRecord) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
        } else {
          return [];
        }
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.sadName}>{record.sadName}</CustomTooltip>
        );
      },
    },
    {
      title: labelLevelList?.[3],
      dataIndex: 'tadId',
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
      },
      fieldProps: {
        placeholder: labelLevelList?.[3],
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      dependencies: ['padId', 'sadId'],
      request: async (params) => {
        if (!params.padId || !params.sadId) {
          return [];
        }
        const payload = {
          province: params.sadId,
        };
        const res = await placeLeoCity(payload);
        if (res.code === 200) {
          return res?.data?.map((item: IPlaceGeoRecord) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
        } else {
          return [];
        }
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.tadName}>{record.tadName}</CustomTooltip>
        );
      },
    },
    {
      title: 'Address',
      dataIndex: 'address',
      width: '40%',
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
      },
      hideInSearch: true,
      fieldProps: {
        placeholder: 'Address',
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.address}>{record.address}</CustomTooltip>
        );
      },
    },
  ];

  useEffect(() => {
    if (open) {
      // do nothing
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        title="Add Stop Point"
        width={1220}
        maskClosable={false}
        destroyOnClose
        okText="Confirm"
        okButtonProps={{
          disabled: selectedRowKeys?.length === 0,
        }}
        onOk={onOk}
        {...restProps}
      >
        <div className={styles.stopPoints}>
          <CustomTable
            noStyle
            rowKey={'id'}
            columns={columns}
            scroll={{ x: 1000, y: 500 }}
            dataSource={dataSource}
            // @ts-ignore
            request={async (params) => getDataSource(params)}
            pagination={false}
            loading={loading}
            toolBarRender={showCreateStopPointBtn ? toolBarRender : false}
            rowSelection={{ all: true }}
            getSelectTableItem={(items) => {
              getSelectItem(items);
            }}
            // rowSelection={{
            //   selectedRowKeys,
            //   onChange: (keys: Key[], selectedRows: IStopPointItem[]) => {
            //     debugger;
            //     setSelectedRowKeys(keys);
            //     setSelectedRows(selectedRows);
            //   },
            // }}
            form={{
              syncToUrl: false,
              syncToInitialValues: false,
            }}
          />
        </div>
      </Modal>
      {stopPointsOpen && (
        <AddStopPointsModal
          title={'Create Stop Points'}
          open={stopPointsOpen}
          onConfirm={addModalFinish}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setStopPointsOpen(false);
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: loading,
            },
          }}
        />
      )}
    </>
  );
};

export default StopPointsModal;
