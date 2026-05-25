import { taxRateList } from '@/api/billing';
import { getTruckTypeList } from '@/api/truck';
import {
  ITaxRateData,
  ITaxRateTableDataItem,
  ITaxRateTableHeaderItem,
} from '@/api/types/billing';
import { ITruckTypeListItem } from '@/api/types/truck';
import CustomTable from '@/components/CustomTable';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import { EnumTaxRateStatus } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import useUrlState from '@ahooksjs/use-url-state';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import cls from 'classnames';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import EditableCell from './components/EditableCell';
import styles from './index.less';

const statusOptions = [
  {
    label: EnumTaxRateStatus.ENABLEMENT,
    value: EnumTaxRateStatus.ENABLEMENT,
  },
  {
    label: EnumTaxRateStatus.DISABLEMENT,
    value: EnumTaxRateStatus.DISABLEMENT,
  },
];

const components = {
  body: {
    cell: EditableCell,
  },
};

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  truckTypeIdList?: number[];
  status?: EnumTaxRateStatus;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
}

const TaxRateSetting: FC = () => {
  const access = useAccess();
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<ProColumns<ITaxRateTableDataItem>[]>(
    [],
  );
  const [tableHeader, setTableHeader] = useState<ITaxRateTableHeaderItem[]>([]);
  const [dataSource, setDataSource] = useState<ITaxRateTableDataItem[]>([]);
  const [originData, setOriginData] = useState<ITaxRateData>({
    tableHeader: [],
    tableData: { list: [] },
  });
  const [truckTypeList, setTruckTypeList] = useState<
    { label: string; value: number }[]
  >([]);
  const formRef = useRef<ProFormInstance>();
  const [, setUrlState] = useUrlState();
  const getDataSource = async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const res = await taxRateList(BE_NEED).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setTableHeader(res.data.tableHeader);
      setDataSource(res.data?.tableData?.list ?? []);
      setOriginData(res.data);
    }
  };

  const fetchTrukTypeData = async () => {
    const res = await getTruckTypeList();
    if (res.code === 200) {
      const list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setTruckTypeList(list);
    }
  };

  const doScrollTop = (top: number) => {
    setTimeout(() => {
      // 滚动到记录位置
      window?.scrollTo?.({
        top: top,
        behavior: 'smooth',
      });
    }, 0);
  };
  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;

    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();
    if (values.truckTypeIdList?.length > 0) {
      lodash.set(FE_NEED, 'truckTypeIdList', values.truckTypeIdList);
      lodash.set(BE_NEED, 'truckTypeIdList', values.truckTypeIdList);
    }

    if (values.status) {
      lodash.set(FE_NEED, 'status', values.status);
      lodash.set(BE_NEED, 'status', values.status);
    }

    const urlParams = {
      FE_NEED: FE_NEED,
      BE_NEED: BE_NEED,
    };

    const extra = JSON.stringify(urlParams);
    setUrlState({ extra: extra });

    // BE_NEED
    getDataSource(BE_NEED);
  };

  const reload = () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    getDataSource(BE_NEED ?? {});
  };

  const fillTableForm = (FE_NEED: IFE_NEED) => {
    formRef.current?.setFieldsValue({
      truckTypeIdList: FE_NEED.truckTypeIdList,
      status: FE_NEED.status,
    });
  };

  const doFirstQuery = async () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { FE_NEED, BE_NEED } = extraJson;
    if (FE_NEED) {
      fillTableForm(FE_NEED);
    }

    if (BE_NEED) {
      await getDataSource(BE_NEED);
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    } else {
      await getDataSource({ pageNum: 1, pageSize: 20 });
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    }
  };

  const onReset = () => {
    setUrlState({ extra: undefined });
    // 自动触发 onSubmit
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { FE_NEED, BE_NEED } = extraJson;
    const NEW_FE_NEED = { ...FE_NEED, ...params };
    const NEW_BE_NEED = { ...BE_NEED, ...params };
    await getDataSource(NEW_BE_NEED);

    const extra = JSON.stringify({
      FE_NEED: NEW_FE_NEED,
      BE_NEED: NEW_BE_NEED,
    });
    setUrlState({ extra: extra });
  };

  const buildColumns = useCallback(() => {
    // @ts-ignore
    const _columns: ProColumns<ITaxRateTableDataItem>[] = tableHeader.map(
      (item) => {
        const fixedFields = ['Truck Type'];
        const showSearchFields = ['Truck Type', 'Status'];
        let dataIndex = item.name;

        switch (item.name) {
          case 'Truck Type':
            dataIndex = 'truckTypeIdList';
            break;
          case 'Status':
            dataIndex = 'status';
            break;
          default:
            dataIndex = item.name;
        }

        return {
          title: item.name,
          dataIndex,
          key: dataIndex,
          width: 200,
          fixed: fixedFields.includes(item.name) ? 'left' : false,
          hideInSearch: !showSearchFields.includes(item.name),
          valueType: 'select',
          formItemProps: {
            label: null,
            style: {
              width: `${DEFAULT_WIDTH}px`,
            },
          },
          fieldProps: {
            placeholder: item.name,
            options: item.name === 'Truck Type' ? truckTypeList : statusOptions,
            mode: item.name === 'Truck Type' ? 'multiple' : 'single',
            showSearch: item.name === 'Truck Type' ? true : false,
            filterOption:
              item.name === 'Truck Type'
                ? (input: string, option: { label: string }) => {
                    return (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase());
                  }
                : false,
          },
          onCell: (record) => {
            return {
              editable:
                access[PermissionEnum.TAX_RATE_SETTING_EDIT] &&
                item.name !== 'Truck Type',
              name: item.name,
              code: item.code,
              rowData: record,
              onSaved: () => reload(),
            };
          },
        };
      },
    );

    setColumns(_columns);
  }, [tableHeader]);

  useEffect(() => {
    // 首次进入拿 URL 上的参数
    doFirstQuery();

    fetchTrukTypeData();
  }, []);

  useEffect(() => {
    buildColumns();
  }, [tableHeader]);

  return (
    <>
      <div className={cls(styles.taxRateSetting)}>
        <CustomTable
          rowKey="id"
          bordered
          loading={loading}
          scroll={{ x: 2000 }}
          formRef={formRef}
          size="small"
          components={components}
          columns={columns}
          dataSource={dataSource}
          pagination={{
            showSizeChanger: true,
            current: originData.tableData.pageNum,
            pageSize: originData.tableData.pageSize,
            total: originData.tableData.total,
            onChange: (page: number, pageSize: number) => {
              onPaginationChange({ pageNum: page, pageSize: pageSize });
            },
          }}
          rowHoverable={false}
          onSubmit={onSubmit}
          onReset={onReset}
          manualRequest
        />
      </div>
    </>
  );
};

export default TaxRateSetting;
