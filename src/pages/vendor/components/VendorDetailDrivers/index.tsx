import { IVendorDetail, IVendorDetailDriverListItem } from '@/api/types/vendor';
import {
  getVendorDetail,
  getVendorDetailDriverList,
  unblockVendorDriver,
} from '@/api/vendor';
import CustomConfirmModal from '@/components/CustomConfirmModal';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION, PATHS } from '@/constants';
import {
  VendorDriveStatusEnum,
  VendorDriveStatusEnumColor,
  VendorDriveStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import DriverModal from '@/pages/vendor/components/DriverModal';
import { openNewTag } from '@/utils/utils';
import { BarsOutlined, StopOutlined } from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, useAccess, useParams } from '@umijs/max';
import { App, Badge, Divider, Space } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import styles from './styles.less';

export default memo(function VendorDetailDrivers(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
}) {
  const access = useAccess();
  const { id: vendorId } = useParams();
  const { showModal, setShowModal } = props;
  const { message } = App.useApp();
  const [detail, setDetail] = useState<IVendorDetail>({} as IVendorDetail);
  const [loading, setLoading] = useState<boolean>(true);
  const [originData, setOriginData] =
    useState<PaginationResponse<IVendorDetailDriverListItem>>(
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
    const res = await getVendorDetailDriverList(payload);
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
  };

  const unbindHandle = async (item: IVendorDetailDriverListItem) => {
    const res = await unblockVendorDriver({
      vendorId: Number(vendorId),
      driverId: item.id,
    });
    if (res.code === 200) {
      message.success(`Unbind successfully!`);
      tableListReload();
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Driver Name',
      dataIndex: 'driverName',
      hideInSearch: true,
      width: 330,
      render: (_, record) => (
        <CustomTooltip key={`driverName${record.id}`} title={record.driverName}>
          {record.driverName}
        </CustomTooltip>
      ),
    },
    {
      title: 'License Number',
      dataIndex: 'licenseNumber',
      hideInSearch: true,
      width: 330,
      render: (_, record) => (
        <CustomTooltip
          key={`licenseNumber${record.id}`}
          title={record.licenseNumber}
        >
          {record.licenseNumber}
        </CustomTooltip>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'contactPhoneNum',
      hideInSearch: true,
      width: 330,
      render: (_, record) => (
        <CustomTooltip
          key={`contactPhoneNum${record.id}`}
          title={record.contactPhoneNum}
        >
          {record.phoneCode + ' ' + record.contactPhoneNum}
        </CustomTooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      ellipsis: true,
      valueType: 'select',
      hideInSearch: true,
      valueEnum: VendorDriveStatusEnumText,
      formItemProps: {
        label: null,
      },
      render: (_, record) => {
        const status: VendorDriveStatusEnum = record.status;
        const Content = (
          <Badge color={VendorDriveStatusEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      hideInTable:
        !access[PermissionEnum.VENDOR_DETAIL_DRIVER_DETAIL] &&
        !access[PermissionEnum.VENDOR_DETAIL_DRIVER_UNBIND],
      key: 'id',
      // width: 112,
      fixed: 'right',
      render: (_, record) => (
        <Space split={<Divider type="vertical" />} size="small">
          <Access
            key="detail"
            accessible={access[PermissionEnum.VENDOR_DETAIL_DRIVER_DETAIL]}
          >
            <div
              className={styles.btn}
              onClick={() =>
                openNewTag(
                  `${PATHS.VENDOR_DRIVER_DETAIL}/${record.id}?type=blank`,
                )
              }
            >
              <BarsOutlined />
              Detail
            </div>
          </Access>
          <Access
            key="unbind"
            accessible={access[PermissionEnum.VENDOR_DETAIL_DRIVER_UNBIND]}
          >
            <CustomConfirmModal
              title="Unbind Confirm"
              content="Are you sure to unbind this driver?"
              onOk={() => unbindHandle(record)}
              okText="Yes"
              cancelText="No"
            >
              <div className={styles.btn}>
                <StopOutlined style={{ color: '#f28532' }} />
                Unbind
              </div>
            </CustomConfirmModal>
          </Access>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.trucks}>
      <CustomTable
        noStyle
        columns={columns}
        scroll={{ x: 1250 }}
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
          name: 'vendor-driver',
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
      {showModal ? (
        <DriverModal
          vendorDetail={detail}
          hideModal={() => {
            setShowModal(false);
          }}
          refresh={tableListReload}
        />
      ) : null}
    </div>
  );
});
