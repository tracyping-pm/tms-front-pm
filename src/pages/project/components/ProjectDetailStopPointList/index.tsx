import { placeGeoProvince, placeGeoRegion, placeLeoCity } from '@/api/place';
import {
  stopPointAdd,
  stopPointCheckDelete,
  stopPointDelete,
  stopPointList,
  stopPointUpdate,
} from '@/api/project';
import { IPlaceGeoRecord } from '@/api/types/place';
import { IStopPointItem } from '@/api/types/project';
import AddStopPointsModal from '@/components/AddStopPointsModal';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { IconDelete, IconEdit } from '@/components/OperationIcon';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import { CountryEnumLabelListMap } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { ProColumns } from '@ant-design/pro-components';
import { Access, useAccess, useModel, useParams } from '@umijs/max';
import { App, Popconfirm } from 'antd';
import { memo, useEffect, useState } from 'react';
import styles from './styles.less';

export default memo(function ProjectDetailStopPointList(props: {
  showModal?: boolean;
  setShowModal?: (b: boolean) => void;
}) {
  const access = useAccess();
  const { message } = App.useApp();
  const { showModal = false, setShowModal } = props;
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  // @ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];

  const { id: projectId } = useParams();
  const [dataSource, setDataSource] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteStatus, setDeleteStatus] = useState<number | undefined>(
    undefined,
  );
  const [stopPointsOpen, setStopPointsOpen] = useState<boolean>(showModal);
  const [dataRecord, setDataRecord] = useState<IStopPointItem>();

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
    const res = values.id
      ? await stopPointUpdate(payload)
      : await stopPointAdd(payload);
    setLoading(false);
    if (res.code === 200) {
      message.success(`${values.id ? 'Edit' : 'Add'} Successfully`);
      setStopPointsOpen(false);
      setShowModal?.(false);
      getDataSource();
    }
  };

  const onEditStopPoint = async (values: IStopPointItem) => {
    setDataRecord(values);
    setStopPointsOpen(true);
  };

  const onDeleteStopPoint = async (id: number) => {
    setLoading(true);
    const res = await stopPointDelete({ id });
    setLoading(false);
    if (res.code === 200) {
      message.success(`delete Successfully`);

      getDataSource();
    }
  };
  const onDeleteCheckStopPoint = async (values: IStopPointItem) => {
    setDataRecord(values);
    const res = await stopPointCheckDelete({ id: values.id });
    if (res.code === 200) {
      if (res.data === 1) {
        message.error('The stop point is in use!');
      } else {
        setDeleteStatus(res.data);
      }
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Label',
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
      search: {
        transform: (value: any) => {
          return { label: value || undefined };
        },
      },
      fieldProps: {
        placeholder: 'Stop Points Label',
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
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 88,
      hideInTable:
        !access[PermissionEnum.PROJECT_DETAIL_STOP_POINT_EDIT] &&
        !access[PermissionEnum.PROJECT_DETAIL_STOP_POINT_DELETE],
      render: (_, record) => {
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
            }}
          >
            <Access
              key="detail"
              accessible={access[PermissionEnum.PROJECT_DETAIL_STOP_POINT_EDIT]}
            >
              <IconEdit
                style={{ color: '#009688' }}
                onClick={() => {
                  onEditStopPoint(record);
                }}
              />
            </Access>
            <Access
              key="detail"
              accessible={
                access[PermissionEnum.PROJECT_DETAIL_STOP_POINT_DELETE]
              }
            >
              <CustomTooltip key="delete" title="Delete" placement="top">
                <Popconfirm
                  overlayStyle={{ zIndex: 999 }}
                  open={dataRecord?.id === record.id && deleteStatus === 0}
                  title={'Confirm delete the stop point?'}
                  okText="OK"
                  // cancelButtonProps={{
                  //   style: { display: deleteStatus === 1 ? 'none' : '' },
                  // }}
                  onConfirm={() => {
                    onDeleteStopPoint(record.id);
                    setDataRecord(undefined);
                    setDeleteStatus(undefined);
                  }}
                  onCancel={() => {
                    setDeleteStatus(undefined);
                    setDataRecord(undefined);
                  }}
                >
                  <IconDelete
                    style={{ color: '#ff4d4f' }}
                    onClick={() => {
                      onDeleteCheckStopPoint(record);
                    }}
                  />
                </Popconfirm>
              </CustomTooltip>
            </Access>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setStopPointsOpen(showModal);
  }, [showModal]);
  return (
    <>
      <div className={styles.projects}>
        <CustomTable
          noStyle
          columns={columns}
          headerTitle={null}
          scroll={{ x: 1200 }}
          dataSource={dataSource}
          // @ts-ignore
          request={async (params) => getDataSource(params)}
          pagination={false}
          loading={loading}
          toolBarRender={false}
          form={{
            syncToUrl: false,
            syncToInitialValues: false,
          }}
        />
      </div>
      {stopPointsOpen && (
        <AddStopPointsModal
          title={dataRecord ? 'Edit Stop Points' : 'Create Stop Points'}
          open={stopPointsOpen}
          record={dataRecord}
          onConfirm={addModalFinish}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setShowModal?.(false);
              setStopPointsOpen(false);
              setDataRecord(undefined);
              setDeleteStatus(undefined);
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
});
