import { capacityPoolCreate, capacityPoolTruckList } from '@/api/capacity';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION, PATHS } from '@/constants';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { App } from 'antd';
import { memo, useCallback, useContext, useRef, useState } from 'react';
import { OPS_TYPE, StateContext } from '../../Detail/store';
import PoolModal from '../PoolModal';
import styles from './styles.less';

export default memo(function ProjectDetailCapacityPoolList() {
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const { message } = App.useApp();
  const { id: projectId } = useParams();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();

  const getDataSource = async (params: any) => {
    const payload = {
      ...params,
      pageNum: params.current,
      pageSize: params.pageSize,
      projectId: Number(projectId),
    };
    delete payload.current;
    setLoading(true);
    const res = await capacityPoolTruckList(payload);
    setLoading(false);

    if (res.code === 200) {
      setOriginData(res.data);
      return {
        data: res.data?.list ?? [],
        success: true,
        total: res.data?.total,
      };
    }
    return {
      data: [],
      success: false,
      total: 0,
    };
  };
  const [poolModalLoading, setPoolModalLoading] = useState<boolean>(false);

  const doCloseCapacityPoolCreateModal = useCallback(() => {
    dispatch({
      type: OPS_TYPE.CREATE_POOL_MODAL,
      payload: {
        open: false,
        data: {},
      },
    });
  }, []);

  const onPoolModalConfirm = useCallback(async (values: any) => {
    const { poolName, projectId: _projectId, projectName } = values;
    const params = {
      poolName,
      projectId: _projectId,
      projectName,
    };
    setPoolModalLoading(true);
    const res = await capacityPoolCreate(params);
    setPoolModalLoading(false);
    if (res.code === 200) {
      doCloseCapacityPoolCreateModal();
      message.success('Add Pool successfully!');
      // actionRef.current?.reload();
      history.push(`${PATHS.CAPACITY_DETAIL}/${res.data}`);
    }
  }, []);

  const columns: ProColumns[] = [
    {
      title: 'Truck Type',
      dataIndex: 'truckTypeName',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.truckTypeName}>
            {record.truckTypeName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Plate Number',
      dataIndex: 'plateNumber',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.plateNumber}>
            {record.plateNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.vendorName}>
            {record.vendorName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Tag',
      dataIndex: 'vendorTag',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.vendorTag}>
            {record.vendorTag}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Garage',
      dataIndex: 'garageLocation',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.garageLocation}>
            {record.garageLocation}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.contactPerson}>
            {record.contactPerson}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Contact Number',
      dataIndex: 'contactNumber',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.contactNumber}>
            {record.contactNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Email Address',
      dataIndex: 'contactEmail',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 180,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.contactEmail}>
            {record.contactEmail}
          </CustomTooltip>
        );
      },
    },
  ];

  return (
    <>
      <div className={styles.projects}>
        <CustomTable
          noStyle
          actionRef={actionRef}
          columns={columns}
          headerTitle={null}
          scroll={{ x: 1550 }}
          // @ts-ignore
          request={async (params) => getDataSource(params)}
          pagination={{
            showSizeChanger: true,
            pageSize: originData.pageSize,
            total: originData.total,
          }}
          loading={loading}
          search={false}
          toolBarRender={false}
          form={{
            syncToUrl: false,
            syncToInitialValues: false,
          }}
        />
      </div>
      <PoolModal
        title={'Create Pool'}
        isEdit={false}
        record={{
          projectId: state?.projectDetail?.data?.id,
          projectName: state?.projectDetail?.data?.projectName,
        }}
        open={state?.capacityPoolCreateModal?.open}
        onConfirm={onPoolModalConfirm}
        modalProps={{
          okText: 'Confirm',
          onCancel: () => {
            doCloseCapacityPoolCreateModal();
          },
        }}
        submitter={{
          submitButtonProps: {
            loading: poolModalLoading,
          },
        }}
      />
    </>
  );
});
