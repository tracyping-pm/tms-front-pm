import { transmittalDetailWaybillList } from '@/api/transmittal';
import { ITransmittalDetailWaybillListItem } from '@/api/types/transmittal';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION } from '@/constants';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import dayjs from 'dayjs';
import { memo, useRef, useState } from 'react';
import styles from './styles.less';

export default memo(function AssociatedWaybill() {
  const { id: transmittalId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [originData, setOriginData] =
    useState<PaginationResponse<ITransmittalDetailWaybillListItem>>(
      DEFAULT_PAGINATION,
    );
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const getDataSource = async (params: any) => {
    setLoading(true);
    const payload = {
      pageNum: params.current,
      pageSize: params.pageSize,
      transmittalId: Number(transmittalId),
    };
    const res = await transmittalDetailWaybillList(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setOriginData(res.data || {});
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

  const columns: ProColumns[] = [
    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumber',
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip title={record.waybillNumber}>
          {record.waybillNumber}
        </CustomTooltip>
      ),
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      ellipsis: { showTitle: false },
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip title={record.customerName}>
          {record.customerName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorName',
      width: 160,
      ellipsis: { showTitle: false },
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip title={record.vendorName}>
          {record.vendorName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Customer Code Type',
      dataIndex: 'customerCodeTypeName',
      ellipsis: { showTitle: false },
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip title={record.customerCodeTypeName}>
          {record.customerCodeTypeName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Customer Code Number',
      dataIndex: 'customerCodeNumber',
      ellipsis: { showTitle: false },
      width: 160,
      hideInSearch: true,
      render: (_, record) => (
        <CustomTooltip title={record.customerCodeNumber}>
          {record.customerCodeNumber}
        </CustomTooltip>
      ),
    },
    {
      title: 'Delivery Time',
      dataIndex: 'deliveredTime',
      width: 160,
      hideInSearch: true,
      render: (_, record) => {
        const content = record.deliveredTime
          ? dayjs(record.deliveredTime).format('YYYY-MM-DD HH:mm:ss')
          : '-';
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
  ];

  return (
    <div className={styles.associatedWaybill}>
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
          name: 'associated-waybill',
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
    </div>
  );
});
