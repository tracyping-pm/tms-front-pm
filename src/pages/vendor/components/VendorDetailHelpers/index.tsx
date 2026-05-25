import {
  IVendorDetailHelperForm,
  IVendorDetailHelperListItem,
} from '@/api/types/vendor';
import {
  blockVendorHelper,
  deleteVendorHelper,
  getVendorDetailHelperList,
  unblockVendorHelper,
} from '@/api/vendor';
import CustomConfirmModal from '@/components/CustomConfirmModal';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION } from '@/constants';
import VendorHelpersModal from '@/pages/vendor/components/VendorHelpersModal';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, useParams } from '@umijs/max';
import { App, Badge, Divider, Space } from 'antd';
import { memo, useRef, useState } from 'react';
import styles from './styles.less';

enum StatusType {
  BLOCKED = 'Blocked',
  NORMAL = 'Normal',
}

const STATUS_COLOR = {
  [StatusType.BLOCKED]: '#D9D9D9',
  [StatusType.NORMAL]: '#52C41A',
};

export default memo(function VendorDetailHelpers(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
}) {
  // const access = useAccess();
  const { id: vendorId } = useParams();
  const { showModal, setShowModal } = props;
  const { message } = App.useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [originData, setOriginData] =
    useState<PaginationResponse<IVendorDetailHelperListItem>>(
      DEFAULT_PAGINATION,
    );
  const [formDefaultValue, setFormDefaultValue] =
    useState<IVendorDetailHelperForm | null>(null);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const getDataSource = async (params: any) => {
    setLoading(true);
    const payload = {
      pageNum: params.current,
      pageSize: params.pageSize,
      vendorId: Number(vendorId),
    };
    const res = await getVendorDetailHelperList(payload);
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

  const editHandle = (item: IVendorDetailHelperListItem) => {
    setFormDefaultValue({
      id: item.id,
      helperName: item.helperName,
      contactPhoneNum: item.contactPhoneNum,
      phoneCode: item.phoneCode,
      phoneCodeId: item.phoneCodeId,
      vendorId: item.vendorId,
      countryId: item.countryId,
    });
    setShowModal(true);
  };

  const deleteHandle = async (item: IVendorDetailHelperListItem) => {
    const res = await deleteVendorHelper({
      vendorId: Number(vendorId),
      helperId: item.id,
    });
    if (res.code === 200) {
      message.success(`Delete successfully!`);
      tableListReload();
    }
  };

  const blockAndUnblock = async (item: IVendorDetailHelperListItem) => {
    let res;
    if (item.status === StatusType.NORMAL) {
      res = await blockVendorHelper({
        id: item.id,
        extraId: item.vendorId,
        status: item.status,
      });
    } else {
      res = await unblockVendorHelper({
        id: item.id,
        extraId: item.vendorId,
        status: item.status,
      });
    }
    if (res.code === 200) {
      message.success(
        `${
          item.status === StatusType.BLOCKED ? 'unblocked' : 'blocked'
        } success!`,
      );
      tableListReload();
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Helper Name',
      dataIndex: 'helperName',
      hideInSearch: true,
      width: '30%',
      render: (_, record) => (
        <CustomTooltip key={`helperName${record.id}`} title={record.helperName}>
          <div className={styles.commonText} title={record.helperName}>
            {record.helperName}
          </div>
        </CustomTooltip>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'contactPhoneNum',
      hideInSearch: true,
      width: '30%',
      render: (_, record) => (
        <CustomTooltip
          key={`contactPhoneNum${record.id}`}
          title={record.contactPhoneNum}
        >
          <div className={styles.commonText}>
            {record.contactPhoneNum
              ? record.phoneCode + ' ' + record.contactPhoneNum
              : '-'}
          </div>
        </CustomTooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      hideInSearch: true,
      render: (_, record) => {
        const status: StatusType = record.status;
        const Content = <Badge color={STATUS_COLOR[status]} text={status} />;
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'id',
      // width: 132,
      fixed: 'right',

      render: (_, record) => (
        <Space split={<Divider type="vertical" />} size="small">
          <Access key="edit" accessible={true}>
            <div className={styles.btn} onClick={() => editHandle(record)}>
              <EditOutlined />
              Edit
            </div>
          </Access>
          <Access accessible={true}>
            <CustomConfirmModal
              title={record.status === StatusType.BLOCKED ? 'Normal' : 'Block'}
              content={`Are you sure to ${
                record.status === StatusType.BLOCKED ? 'Normal' : 'Block'
              } this helper?`}
              onOk={() => blockAndUnblock(record)}
              okText="Yes"
              cancelText="No"
            >
              <div className={styles.btn}>
                {record.status === StatusType.BLOCKED ? (
                  <CheckOutlined style={{ color: '#52C41A' }} />
                ) : (
                  <CloseOutlined style={{ color: '#FF4D4F' }} />
                )}
                {record.status === StatusType.BLOCKED ? 'Release' : 'Block'}
              </div>
            </CustomConfirmModal>
          </Access>
          <Access key="delete" accessible={true}>
            <CustomConfirmModal
              title="Delete"
              content="Are you sure to delete this helper?"
              onOk={() => deleteHandle(record)}
              okText="Yes"
              cancelText="No"
            >
              <div className={styles.btn}>
                <DeleteOutlined />
                Delete
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
        // scroll={{ x: 1200 }}
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
          name: 'vendor-helper',
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
      {showModal ? (
        <VendorHelpersModal
          formDefaultValue={formDefaultValue}
          hideModal={() => {
            setShowModal(false);
            setFormDefaultValue(null);
          }}
          refresh={tableListReload}
        />
      ) : null}
    </div>
  );
});
