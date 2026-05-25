import { App, Button, Popconfirm, Space } from 'antd';

import { queryStatementWaybill, statementRemoveWaybill } from '@/api/billing';
import { getTruckTypeList } from '@/api/truck';
import { ITruckTypeListItem } from '@/api/types/truck';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION, LAYOUT_HEADER_HEIGHT } from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import { aggregateToJsonArray } from '@/pages/waybill/components/DetailInformationCard';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { useEffect, useRef, useState } from 'react';
import AddWaybillModal from './AddWaybillModal';
import styles from './common.less';

export default function AssociatedWaybill() {
  // const access = useAccess();
  const { message } = App.useApp();
  const selectedKey = 'id';
  const { id: statementId } = useParams();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [billingTruckTypeList, setBillingTruckTypeList] = useState<
    { label: string; value: number }[]
  >([]);
  const [addWaybillModalOpen, setAddWaybillModalOpen] =
    useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [removePopconfirmOpen, setRemovePopconfirmOpen] =
    useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();
  const selectedALL = useRef<any>([]);

  const columns: ProColumns[] = [
    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumber',
      key: 'waybillNumber',
      ellipsis: { showTitle: false },
      fixed: 'left',
      width: 200,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Waybill Number',
      },
      // renderFormItem: () => {
      //   return (
      //     <FuzzySelector
      //       fieldProps={{ placeholder: 'Waybill Number' }}
      //       request={{
      //         field: 'waybillNumber',
      //         esDtoClass: ES_DTO_CLASS.WAYBILL,
      //         type: FieldQueryHighlightTypeEnum.None,
      //       }}
      //     />
      //   );
      // },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.waybillNumber}>
            {record.waybillNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Code',
      dataIndex: 'customerCode',
      width: 270,

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
        placeholder: 'Customer Code',
      },
      render(_, record) {
        const list = aggregateToJsonArray(record.customerCodeVos);
        const customerCode =
          list.reduce((acc, cur, index) => {
            const curStr = !!cur.numbers
              ? `${cur.customerCodeType}:${cur.numbers}`
              : '';
            return `${acc}${index !== 0 && curStr && acc ? ',' : ''}${curStr}`;
          }, '') || '';

        return (
          <CustomTooltip
            title={customerCode}
            rootClassName={styles.customerCodePopover}
          >
            {customerCode}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Billing Truck Type',
      dataIndex: 'truckTypeName',
      width: 160,

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
        filterOption: (input: string, option: { label: string }) => {
          return (option?.label ?? '')
            .toLowerCase()
            .includes(input.toLowerCase());
        },
        options: billingTruckTypeList,
        mode: 'multiple',
        showSearch: true,
        placeholder: 'Billing Truck Type',
        maxTagCount: 1,
      },

      render: (_, record) => (
        <CustomTooltip title={record.truckTypeName}>
          {record.truckTypeName}
        </CustomTooltip>
      ),
    },

    {
      title: 'Invoice No.',
      dataIndex: 'invoiceNumbers',
      width: 160,

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
        placeholder: 'Invoice No.',
      },
      render: (_, record) => {
        const { invoiceNumbers } = record;
        const content = !!invoiceNumbers?.length ? (
          <span>{invoiceNumbers.join(',')}</span>
        ) : (
          '-'
        );
        return (
          <CustomTooltip title={content} rootClassName={styles.tooltipCls}>
            {content}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Origin Label',
      dataIndex: 'originLabel',
      width: 160,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => (
        <CustomTooltip title={record.originLabel}>
          {record.originLabel}
        </CustomTooltip>
      ),
    },
    {
      title: 'Destination Label',
      dataIndex: 'destinationLabel',
      width: 160,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => (
        <CustomTooltip title={record.destinationLabel}>
          {record.destinationLabel}
        </CustomTooltip>
      ),
    },
  ];

  const tableExtraRender = () => {
    return (
      <>
        <div className={styles.tableDescribe}>
          <span className={styles.tableDescribe_total}>
            {originData?.total}
          </span>
          waybills total，
          <span className={styles.tableDescribe_total}>
            {selectedRowKeys?.length}
          </span>
          waybills selected
        </div>
      </>
    );
  };

  const getTruckTypeListHandle = async () => {
    const res = await getTruckTypeList();
    let list: { label: string; value: number }[] = [];
    if (res.code === 200) {
      list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    }

    setBillingTruckTypeList(list);
  };

  const getDataSource = async (params: any) => {
    setLoading(true);
    const res = await queryStatementWaybill(params);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data ?? []);
    }
  };

  const onSubmit = (params?: any) => {
    const payload = {
      pageNum: 1,
      pageSize: 20,
      waybillNum: params?.waybillNumber,
      customerCode: params?.customerCode,
      invoiceNumber: params?.invoiceNumbers,
      truckTypeIdList: params?.truckTypeName,
      statementId: +statementId!,
    };
    getDataSource(payload);
  };
  const onRemove = async () => {
    const payload = {
      statementId: +statementId!,
      statementWaybillIds: selectedRowKeys,
    };
    const res = await statementRemoveWaybill(payload);
    if (res.code === 200) {
      setSelectedRowKeys([]);
      selectedALL.current = [];
      setRemovePopconfirmOpen(false);
      getDataSource({
        pageNum: 1,
        pageSize: 20,
        statementId: +statementId!,
      });
    }
  };

  const onRemoveWaybill = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select the waybill to remove');
      return;
    }
    // if (selectedRowKeys.length === originData.total) {
    //   message.warning('Removing all waybills is not allowed');
    //   return;
    // }
    setRemovePopconfirmOpen(true);
  };

  const onReset = () => {
    formRef.current?.resetFields();
  };

  // 多选
  const onHandleSelect = (record: any, selected: any) => {
    const idx = selectedALL.current.findIndex(
      (i: any) => i[selectedKey] === record[selectedKey],
    );
    if (selected) {
      selectedALL.current.push(record);
    } else {
      selectedALL.current.splice(idx, 1);
    }
    const a = selectedALL.current.map((i: any) => i[selectedKey]);
    setSelectedRowKeys(a);
  };

  const onHandleSelectAll = (
    selected: any,
    selectedRows: { current: any[] },
    changeRows: any[],
  ) => {
    if (selected) {
      selectedALL.current = selectedALL.current.concat(changeRows);
    } else {
      changeRows.forEach((i) => {
        selectedALL.current.forEach((m: any, mIndex: any) => {
          if (i[selectedKey] === m[selectedKey]) {
            selectedALL.current.splice(mIndex, 1);
          }
        });
      });
    }
    const a = selectedALL.current.map((i: any) => i[selectedKey]);
    setSelectedRowKeys(a);
  };

  useEffect(() => {
    getDataSource({ pageNum: 1, pageSize: 20, statementId: +statementId! });
    getTruckTypeListHandle();
  }, []);

  return (
    <>
      <div className={styles.associatedWaybill}>
        <div className={styles.header}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
            Back
          </Button>
          <Space size={16}>
            <Popconfirm
              title={`Whether to remove the selected ${selectedRowKeys.length} waybills`}
              open={removePopconfirmOpen}
              onConfirm={() => onRemove()}
              placement="left"
              okText="Yes"
              cancelText="No"
              onOpenChange={(boolean) => {
                if (!boolean) {
                  setRemovePopconfirmOpen(boolean);
                }
              }}
            >
              <Button onClick={onRemoveWaybill}>Remove waybill</Button>
            </Popconfirm>
            <Button
              type="primary"
              onClick={() => {
                setAddWaybillModalOpen(true);
              }}
            >
              Add Waybill
            </Button>
          </Space>
        </div>

        <div>
          <CustomTable
            className={'associatedWaybillTable'}
            columns={columns}
            // scroll={{ x: 2000 }}
            formRef={formRef}
            dataSource={originData.list}
            fixedSpin={false}
            form={{
              name: 'associated-waybill-table-list',
            }}
            pagination={{
              showSizeChanger: true,
              current: originData?.pageNum,
              pageSize: originData?.pageSize,
              total: originData?.total,
              onChange: (page: number, pageSize: number) => {
                onSubmit({ pageNum: page, pageSize: pageSize });
              },
            }}
            rowSelection={{
              selectedRowKeys,
              onSelect: onHandleSelect,
              // @ts-ignore
              onSelectAll: onHandleSelectAll,
            }}
            loading={loading}
            onSubmit={onSubmit}
            onReset={onReset}
            //@ts-ignore
            toolBarRender={tableExtraRender}
            manualRequest
            filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
          />
        </div>
        {addWaybillModalOpen ? (
          <AddWaybillModal
            open={addWaybillModalOpen}
            onCancel={() => setAddWaybillModalOpen(false)}
            onRefresh={() => {
              getDataSource({
                pageNum: 1,
                pageSize: 20,
                statementId: +statementId!,
              });
            }}
          />
        ) : null}
      </div>
    </>
  );
}
