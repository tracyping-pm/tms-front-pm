import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { CountryCurrencyEnumText } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { ProColumns } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import styles from './index.less';
const ClaimRequestDetailTable = ({ originData }: { originData: any }) => {
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;

  const columns: ProColumns[] = [
    {
      title: 'Claim Type',
      dataIndex: 'claimType',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.claimType}>
            {record.claimType}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Waybill',
      dataIndex: 'waybillNo',
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.waybillNo}>
            {record.waybillNo}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Claim Details',
      dataIndex: 'claimDetails',
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.claimDetails}>
            {record.claimDetails}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Responsible Party',
      dataIndex: 'responsiblePartyName',
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.responsiblePartyName}>
            {record.responsiblePartyName}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'claimAmount',
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip
            title={formatAmount(record.claimAmount)}
            placement="top"
          >
            {formatAmount(record.claimAmount)}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Vendor Liability Amount (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'vendorAmount',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => {
        const amount =
          record.vendorAmount || record.vendorAmount === 0
            ? formatAmount(record.vendorAmount) + ''
            : '-';
        return (
          <CustomTooltip title={amount} placement="top">
            {amount}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Inteluck Expense (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'inteluckAmount',
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      render: (_, record) => {
        const amount =
          record.inteluckAmount || record.inteluckAmount === 0
            ? formatAmount(record.inteluckAmount) + ''
            : '-';
        return (
          <CustomTooltip title={amount} placement="top">
            {amount}
          </CustomTooltip>
        );
      },
    },
  ];

  return (
    <CustomTable
      // style={{ margin: '0 -24px' }}
      className={styles.claimRequestDetailTable}
      columns={columns}
      scroll={{ x: 1000 }}
      dataSource={originData}
      pagination={false}
      toolBarRender={false}
      search={false}
      manualRequest
    />
  );
};

export default ClaimRequestDetailTable;
