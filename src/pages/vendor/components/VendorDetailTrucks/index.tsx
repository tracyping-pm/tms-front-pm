import { IVendorDetail, IVendorDetailTruckListItem } from '@/api/types/vendor';
import {
  checkTruckUnbind,
  getVendorDetail,
  getVendorDetailTruckList,
  unbindVendorTruck,
} from '@/api/vendor';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION, PATHS } from '@/constants';
import { VendorTruckStatusEnum, VendorTruckStatusEnumColor } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import TruckModal from '@/pages/vendor/components/TruckModal';
import { formatAmount, openNewTag } from '@/utils/utils';
import {
  BarsOutlined,
  ExclamationCircleFilled,
  StopOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, useAccess, useParams } from '@umijs/max';
import { App, Badge, Divider, Space } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import styles from './styles.less';

export default memo(function VendorDetailTrucks(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  detailRefresh: boolean;
  setDetailRefresh: (b: boolean) => void;
}) {
  const access = useAccess();
  const { id: vendorId } = useParams();
  const { showModal, setShowModal, detailRefresh, setDetailRefresh } = props;
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<IVendorDetail>({} as IVendorDetail);
  const [originData, setOriginData] =
    useState<PaginationResponse<IVendorDetailTruckListItem>>(
      DEFAULT_PAGINATION,
    );
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const getDetail = async () => {
    const res = await getVendorDetail(Number(vendorId));
    if (res.code === 200) {
      setDetail(res.data);
    }
  };

  useEffect(() => {
    getDetail();
  }, []);

  const getDataSource = async (params: any) => {
    setLoading(true);
    const payload = {
      pageNum: params.current,
      pageSize: params.pageSize,
      vendorId: Number(vendorId),
    };
    const res = await getVendorDetailTruckList(payload);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
      return {
        data: res?.data?.list || [],
        success: true,
        total: res.data.total,
      };
    }
    return {
      data: [],
      success: false,
      total: 0,
    };
  };

  const tableListReload = () => {
    actionRef.current?.reload();
    setDetailRefresh(!detailRefresh);
  };

  const unbindHandle = async (record: IVendorDetailTruckListItem) => {
    const res = await unbindVendorTruck({
      truckId: record.id,
      vendorId: record.vendorId,
    });
    if (res.code === 200) {
      message.success(`Unbind successfully!`);
      tableListReload();
    }
  };

  const checkUnbind = async (record: IVendorDetailTruckListItem) => {
    const res = await checkTruckUnbind({
      truckId: record.id,
      vendorId: record.vendorId,
    });
    if (res.code === 200) {
      if (res.data) {
        modal.confirm({
          title: 'Unbind Confirm',
          icon: <ExclamationCircleFilled />,
          content: 'Are you sure to unbind this truck?',
          okText: 'Confirm',
          cancelText: 'Cancel',
          onOk: async () => {
            unbindHandle(record);
          },
        });
      } else {
        modal.confirm({
          title: 'Unbind Confirm',
          icon: <ExclamationCircleFilled />,
          content:
            'Confirm to unbind the truck from the associated vendor and project',
          okText: 'Confirm',
          cancelText: 'Cancel',
          onOk: async () => {
            unbindHandle(record);
          },
        });
      }
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Plate Number',
      dataIndex: 'plateNumber',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip
          key={`plateNumber${record.id}`}
          title={record.plateNumber}
        >
          <div className={styles.commonText}>{record.plateNumber}</div>
        </CustomTooltip>
      ),
      width: 240,
    },
    {
      title: 'Truck Type',
      dataIndex: 'truckType',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip
          key={`truckTypeName${record.id}`}
          title={record.truckTypeName}
        >
          <div className={styles.commonText}>{record.truckTypeName}</div>
        </CustomTooltip>
      ),
      width: 240,
    },
    {
      title: 'Ownership',
      dataIndex: 'ownership',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip key={`ownership${record.id}`} title={record.ownership}>
          <div className={styles.commonText}>{record.ownership}</div>
        </CustomTooltip>
      ),
      width: 200,
    },
    {
      title: 'Van Type',
      dataIndex: 'vanType',
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip key={`vanType${record.id}`} title={record.vanType}>
          <div className={styles.commonText}>
            {record.vanType ? record.vanType : '-'}
          </div>
        </CustomTooltip>
      ),
      width: 120,
    },
    {
      title: 'Net Capacity',
      dataIndex: 'netCapacity',
      valueType: 'select',
      render: (_, record) => (
        <CustomTooltip
          key={`netCapacity${record.id}`}
          title={record.netCapacity}
        >
          <div className={styles.commonText}>
            {record.netCapacity ? `${formatAmount(record.netCapacity)}MT` : 0}
          </div>
        </CustomTooltip>
      ),
      hideInSearch: true,
      width: 120,
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      hideInSearch: true,
      width: 120,
      render: (_, record) => (
        <CustomTooltip key={`volume${record.id}`} title={record.volume}>
          <div className={styles.commonText}>
            {record.volume ? `${formatAmount(record.volume)}CBM` : 0}
          </div>
        </CustomTooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      hideInSearch: true,
      width: 120,
      render: (_, record) => {
        const status: VendorTruckStatusEnum = record.status;
        const Content = (
          <Badge color={VendorTruckStatusEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'id',
      // width: 88,
      fixed: 'right',
      hideInTable:
        !access[PermissionEnum.VENDOR_DETAIL_TRUCK_DETAIL] &&
        !access[PermissionEnum.VENDOR_DETAIL_TRUCK_UNBIND],
      render: (_, record) => (
        <Space split={<Divider type="vertical" />} size="small">
          <Access
            key="detail"
            accessible={access[PermissionEnum.VENDOR_DETAIL_TRUCK_DETAIL]}
          >
            <div
              className={styles.btn}
              onClick={() =>
                openNewTag(
                  `${PATHS.VENDOR_TRUCK_DETAIL}/${record.id}?type=blank`,
                )
              }
            >
              <BarsOutlined />
              Detail
            </div>
          </Access>
          <Access
            key="unbind"
            accessible={access[PermissionEnum.VENDOR_DETAIL_TRUCK_UNBIND]}
          >
            <div className={styles.btn} onClick={() => checkUnbind(record)}>
              <StopOutlined style={{ color: '#f28532' }} />
              Unbind
            </div>
          </Access>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.trucks}>
      <CustomTable
        noStyle={true}
        columns={columns}
        scroll={{ x: 1400 }}
        actionRef={actionRef}
        formRef={formRef}
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
          name: 'vendor-truck',
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
      {showModal ? (
        <TruckModal
          needVendor
          needOwner
          vendorDetail={detail}
          refresh={tableListReload}
          hideModal={() => {
            setShowModal(false);
          }}
        />
      ) : null}
    </div>
  );
});
