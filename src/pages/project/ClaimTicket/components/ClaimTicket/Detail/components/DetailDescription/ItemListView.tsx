import { IClaimDetail, IClaimDetailItem } from '@/api/types/claims';
import CountryIcon from '@/components/CountryIcon';
import { PATHS } from '@/constants';
import { CountryCurrencyEnumText } from '@/enums';
import { EnumExternalClaimsType, EnumInternalClaimsType } from '@/enums/claim';
import { formatAmount, openNewTag } from '@/utils/utils';
import { useModel } from '@umijs/max';
import { Flex, Table, TableColumnsType, Typography } from 'antd';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

export interface IProps {
  detail: IClaimDetail;
}

const ItemListView: FC<IProps> = ({ detail }) => {
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;
  const [columns, setColumns] = useState<TableColumnsType<IClaimDetailItem>>(
    [],
  );

  useEffect(() => {
    let _columns: TableColumnsType<IClaimDetailItem> = [];

    switch (detail.claimType) {
      // Internal
      case EnumInternalClaimsType.GPS:
        _columns = [
          {
            title: 'Year,Month',
            dataIndex: 'referenceDate',
            key: 'referenceDate',
            ellipsis: true,
            render: (_, record) => record?.referenceDate,
          },
          {
            title: 'Plate No.',
            dataIndex: 'plateNumber',
            key: 'plateNumber',
            ellipsis: true,
            render: (_, record) => record?.plateNumber,
          },
          {
            title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.amount),
          },
        ];
        setColumns(_columns);
        break;

      case EnumInternalClaimsType.DDC_Training_Fee:
        _columns = [
          {
            title: 'Site',
            dataIndex: 'location',
            key: 'location',
            ellipsis: true,
            render: (_, record) => record?.location,
          },
          {
            title: 'DDC Schedule',
            dataIndex: 'deliveredDate',
            key: 'deliveredDate',
            ellipsis: true,
            render: (_, record) => record?.referenceDate,
          },
          {
            title: "Driver's Full Name",
            dataIndex: 'personName',
            key: 'personName',
            ellipsis: true,
            render: (_, record) => record?.personName,
          },
          {
            title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.amount),
          },
        ];
        setColumns(_columns);
        break;

      case EnumInternalClaimsType.Crew_Uniform_Charges:
        _columns = [
          {
            title: 'Requestor Name',
            dataIndex: 'personName',
            key: 'personName',
            ellipsis: true,
            render: (_, record) => record?.personName,
          },
          {
            title: 'Uniform Delivery Date',
            dataIndex: 'deliveredDate',
            key: 'deliveredDate',
            ellipsis: true,
            render: (_, record) => record?.referenceDate,
          },
          {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            ellipsis: true,
            render: (_, record) => record?.size,
          },
          {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.quantity),
          },
          {
            title: 'Claim Details',
            dataIndex: 'detail',
            key: 'detail',
            ellipsis: true,
            render: (_, record) => record?.detail,
          },
          {
            title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.amount),
          },
        ];
        setColumns(_columns);
        break;

      case EnumInternalClaimsType.Inteluck_Insurance:
        _columns = [
          {
            title: 'Plate No.',
            dataIndex: 'plateNumber',
            key: 'plateNumber',
            ellipsis: true,
            render: (_, record) => record?.plateNumber,
          },
          {
            title: 'Effectivity Date',
            dataIndex: 'deliveredDate',
            key: 'deliveredDate',
            ellipsis: true,
            render: (_, record) => record?.referenceDate,
          },
          {
            title: 'Insurance Company',
            dataIndex: 'companyName',
            key: 'companyName',
            ellipsis: true,
            render: (_, record) => record?.companyName,
          },
          {
            title: 'Coverage Type',
            dataIndex: 'coverageType',
            key: 'coverageType',
            ellipsis: true,
            render: (_, record) => record?.coverageType,
          },
          {
            title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.amount),
          },
        ];
        setColumns(_columns);
        break;

      case EnumInternalClaimsType.Coupon_Fees:
        _columns = [
          {
            title: 'Plate No.',
            dataIndex: 'plateNumber',
            key: 'plateNumber',
            ellipsis: true,
            render: (_, record) => record?.plateNumber,
          },
          {
            title: 'RDD',
            dataIndex: 'deliveredDate',
            key: 'deliveredDate',
            ellipsis: true,
            render: (_, record) => record?.referenceDate,
          },
          {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.quantity),
          },
          {
            title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.amount),
          },
        ];
        setColumns(_columns);
        break;

      case EnumInternalClaimsType.Stuffing_Fee_CDC:
        _columns = [
          {
            title: 'Linked Waybill',
            dataIndex: 'waybillNumber',
            key: 'waybillNumber',
            ellipsis: true,
            render: (_, record) => {
              return (
                <a
                  onClick={() => {
                    openNewTag(
                      `${PATHS.WAYBILL_LIST_DETAIL}/${record?.waybillInfo?.waybillId}`,
                    );
                  }}
                >
                  {record?.waybillInfo?.waybillNumber}
                </a>
              );
            },
          },
          {
            title: 'FO',
            dataIndex: 'fo',
            key: 'fo',
            ellipsis: true,
            render: (_, record) => record?.fo,
          },
          {
            title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.amount),
          },
          {
            title: 'Delivery Date',
            dataIndex: 'deliveredDate',
            key: 'deliveredDate',
            ellipsis: true,
            render: (_, record) => record?.waybillInfo?.deliveredDate,
          },
          {
            title: 'Plate No.',
            dataIndex: 'plateNumber',
            key: 'plateNumber',
            ellipsis: true,
            render: (_, record) => record?.truckInfo?.plateNumber,
          },
          {
            title: 'Truk Type',
            dataIndex: 'truckTypeName',
            key: 'truckTypeName',
            ellipsis: true,
            render: (_, record) => record?.truckInfo?.truckTypeName,
          },
          {
            title: 'Driver',
            dataIndex: 'driverName',
            key: 'driverName',
            ellipsis: true,
            render: (_, record) => record?.driverInfo?.driverName,
          },
        ];
        setColumns(_columns);
        break;

      case EnumInternalClaimsType.Equipment_Fee:
        _columns = [
          {
            title: 'Installed Date',
            dataIndex: 'referenceDate',
            key: 'referenceDate',
            ellipsis: true,
            render: (_, record) => record?.referenceDate,
          },
          {
            title: 'Plate No.',
            dataIndex: 'plateNumber',
            key: 'plateNumber',
            ellipsis: true,
            render: (_, record) => record?.plateNumber,
          },
          {
            title: 'Qty',
            dataIndex: 'quantity',
            key: 'quantity',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.quantity),
          },
          {
            title: 'Item',
            dataIndex: 'item',
            key: 'item',
            ellipsis: true,
            render: (_, record) => record?.item,
          },
          {
            title: 'Requested By',
            dataIndex: 'personName',
            key: 'personName',
            ellipsis: true,
            render: (_, record) => record?.personName,
          },
          {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            ellipsis: true,
            render: (_, record) => record?.location,
          },
          {
            title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.amount),
          },
        ];
        setColumns(_columns);
        break;

      case EnumInternalClaimsType.Medical_Fee:
        _columns = [
          {
            title: 'Plate No.',
            dataIndex: 'plateNumber',
            key: 'plateNumber',
            ellipsis: true,
            render: (_, record) => record?.plateNumber,
          },
          {
            title: 'RDD',
            dataIndex: 'referenceDate',
            key: 'referenceDate',
            ellipsis: true,
            render: (_, record) => record?.referenceDate,
          },
          {
            title: 'Name',
            dataIndex: 'personName',
            key: 'personName',
            ellipsis: true,
            render: (_, record) => record?.personName,
          },
          {
            title: 'Position (Driver/Helper)',
            dataIndex: 'position',
            key: 'position',
            ellipsis: true,
            render: (_, record) => record?.position,
          },
          {
            title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.amount),
          },
        ];
        setColumns(_columns);
        break;

      // External
      case EnumExternalClaimsType.Delivery_Claims:
      case EnumExternalClaimsType.KPI_Claims:
      case EnumExternalClaimsType.Theft_Incident:
      case EnumExternalClaimsType.Others: {
        const waybillBasedColumns: TableColumnsType<IClaimDetailItem> = [
          {
            title: 'Linked Waybill',
            dataIndex: 'waybillNumber',
            key: 'waybillNumber',
            ellipsis: true,
            render: (_, record) => {
              return (
                <a
                  onClick={() => {
                    openNewTag(
                      `${PATHS.WAYBILL_LIST_DETAIL}/${record?.waybillInfo?.waybillId}`,
                    );
                  }}
                >
                  {record?.waybillInfo?.waybillNumber}
                </a>
              );
            },
          },
          {
            title: 'Delivery Date',
            dataIndex: 'deliveredDate',
            key: 'deliveredDate',
            ellipsis: true,
            render: (_, record) => record?.waybillInfo?.deliveredDate,
          },
          {
            title: 'Plate No.',
            dataIndex: 'plateNumber',
            key: 'plateNumber',
            ellipsis: true,
            render: (_, record) => record?.truckInfo?.plateNumber,
          },
          {
            title: 'Truk Type',
            dataIndex: 'truckTypeName',
            key: 'truckTypeName',
            ellipsis: true,
            render: (_, record) => record?.truckInfo?.truckTypeName,
          },
          {
            title: 'Driver',
            dataIndex: 'driverName',
            key: 'driverName',
            ellipsis: true,
            render: (_, record) => record?.driverInfo?.driverName,
          },
        ];

        const normalColumns: TableColumnsType<IClaimDetailItem> = [
          {
            title: 'Claim Details',
            dataIndex: 'detail',
            key: 'detail',
            ellipsis: true,
            render: (_, record) => record?.detail,
          },
          {
            title: `Claim Amount (${CountryCurrencyEnumText[countryId as number]})`,
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            ellipsis: true,
            render: (_, record) => formatAmount(record?.amount),
          },
        ];

        if (detail.waybillBased) {
          // 将 normalColumns 插入到 waybillBasedColumns 的 Linked Waybill 列后面
          waybillBasedColumns.splice(
            waybillBasedColumns.findIndex(
              (column) => column.title === 'Linked Waybill',
            ) + 1,
            0,
            ...normalColumns,
          );
          setColumns(waybillBasedColumns);
        } else {
          setColumns(normalColumns);
        }
        break;
      }
    }
  }, [detail.claimType]);

  return (
    <>
      <Flex gap={10}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(detail.totalAmount)}
        </span>
      </Flex>
      <Table<IClaimDetailItem>
        size="small"
        bordered
        columns={columns}
        dataSource={detail.itemList}
        pagination={false}
        scroll={{ x: 800, y: 300 }}
      />
    </>
  );
};

export default ItemListView;
