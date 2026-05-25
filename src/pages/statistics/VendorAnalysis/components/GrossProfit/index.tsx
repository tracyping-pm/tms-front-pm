import { getUserGuidanceUpdate } from '@/api-uam/common';
import {
  vendorAnalysisByVendor,
  vendorAnalysisByVendorExport,
} from '@/api/statistics';
import {
  IVendorAnalysisByVendorItem,
  IVendorAnalysisByVendorPayload,
} from '@/api/types/statistics';
import FuzzySelector from '@/components/FuzzySelector';
import { ES_DTO_CLASS } from '@/constants';
import {
  BUEnum,
  FieldQueryHighlightTypeEnum,
  GetUserGuidanceEnum,
} from '@/enums';
import { useAddAnimation } from '@/hooks/useAddAnimation';
import CardView from '@/pages/statistics/common/CardView';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import { doDownloadCenterAnimate } from '@/utils/animate';
import { DownloadOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import {
  App,
  Button,
  Col,
  DatePicker,
  Empty,
  Flex,
  Form,
  Row,
  Select,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useEffect, useRef, useState } from 'react';
import { useWaybillTimeType } from '../../../common/TimeTypeContext';
import Charts from './Charts';
import Table from './Table';

const dateFormat = 'YYYY-MM';
const defaultDate: Dayjs = dayjs();
const sortData = (
  data: IVendorAnalysisByVendorItem[],
  field?: string,
  order?: 'ASC' | 'DESC',
) => {
  if (!field || !order) return [...data];

  return [...data].sort((a, b) => {
    const valA = (a as any)[field] ?? 0;
    const valB = (b as any)[field] ?? 0;

    // 基础排序逻辑
    if (order === 'ASC') {
      return valA - valB;
    } else {
      return valB - valA;
    }
  });
};

const GrossProfit: FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { waybillTimeType } = useWaybillTimeType();
  let completedGuidance =
    initialState?.currentUser?.userGuidanceMap?.ExportDownloadManage;
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const yearMonthValue = Form.useWatch('yearMonth', form);
  const [dataSource, setDataSource] = useState<IVendorAnalysisByVendorItem[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [scrollY, setScrollY] = useState(400);
  const [sortConfig, setSortConfig] = useState<{
    field?: string;
    order?: 'ASC' | 'DESC';
  }>({
    field: 'grossMargin', // 默认字段
    order: 'ASC', // 默认排序
  });
  const [buValue, setBuValue] = useState<BUEnum>();

  const tableRef = useRef<any>(null);

  const playTargetRef = useRef<any>(null);
  const playSrcRef = useRef<any>(null);

  const playStar = useAddAnimation(playSrcRef, playTargetRef);

  const playAnimation = () => {
    playStar(
      (start_top, _, end_top) => Math.min(start_top, end_top),
      completedGuidance,
    );
  };

  const guidanceUpdateHandle = async () => {
    await setInitialState((s) => ({
      ...s,
      currentUser: {
        ...initialState?.currentUser,
        userGuidanceMap: { ExportDownloadManage: true },
      },
    }));
    await getUserGuidanceUpdate(GetUserGuidanceEnum.EXPORT_DOWNLOAD_MANAGE);
  };

  const fetchDataSource = async (params: IVendorAnalysisByVendorPayload) => {
    setLoading(true);
    try {
      const res = await vendorAnalysisByVendor(params);
      if (res.code === 200) {
        const sortedData = sortData(
          res.data || [],
          sortConfig.field,
          sortConfig.order,
        );
        setDataSource([...sortedData]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSearch = () => {
    const values = form.getFieldsValue();

    fetchDataSource({
      yearMonth: values.yearMonth?.format(dateFormat),
      vendorId: values?.vendorObj?.id,
      picUserId: values?.picUserObj?.id,
      bu: values?.bu,
      waybillTimeType,
    });
    setBuValue(values?.bu);
  };

  const onReset = () => {
    form.resetFields();
    setBuValue(undefined);
    fetchDataSource({
      yearMonth: defaultDate.format(dateFormat),
      waybillTimeType,
    });
  };

  const handleExport = async () => {
    try {
      const values = form.getFieldsValue();
      const formParams: IVendorAnalysisByVendorPayload = {
        yearMonth: values.yearMonth?.format(dateFormat),
        vendorId: values?.vendorObj?.id,
        picUserId: values?.picUserObj?.id,
        bu: values?.bu,
        waybillTimeType,
      };
      const sortParams = {
        sortField: sortConfig.field,
        sortOrder: sortConfig.order,
      };
      const params = { ...formParams, ...sortParams };

      setExportLoading(true);
      const res = await vendorAnalysisByVendorExport(params).finally(() => {
        setExportLoading(false);
      });

      if (res.code === 200) {
        message.success({ content: 'Export Success', key: 'export' });
        doDownloadCenterAnimate();
      } else {
        message.error({ content: 'Export Failed', key: 'export' });
      }
    } catch (error) {
      message.error({ content: 'Export Failed', key: 'export' });
    }
  };

  const handleSortChange = (field?: string, order?: 'ASC' | 'DESC') => {
    setSortConfig({ field, order });
    setDataSource((prev) => sortData(prev, field, order));
  };

  useEffect(() => {
    const values = form.getFieldsValue();
    if (!values.yearMonth) {
      form.setFieldsValue({
        yearMonth: defaultDate,
      });
    }

    fetchDataSource({
      yearMonth:
        values.yearMonth?.format(dateFormat) || defaultDate.format(dateFormat),
      vendorId: values?.vendorObj?.id,
      picUserId: values?.picUserObj?.id,
      bu: values?.bu,
      waybillTimeType,
    });
  }, [waybillTimeType]);

  useEffect(() => {
    playTargetRef.current = document.querySelector('.downloadCenter');
  }, []);

  return (
    <CardView
      title={
        <TooltipTitle tips="Count the revenue of vendors who are active in the current month.">
          Gross Profit by Vendor
        </TooltipTitle>
      }
      showFullScreen
      fullScreenChanged={(isFullScreen) => {
        setScrollY(isFullScreen ? window.innerHeight - 200 : 400);
      }}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form
            name="gross-profit-by-vendor-form"
            form={form}
            style={{ marginBottom: '8px' }}
            initialValues={{
              yearMonth: defaultDate,
            }}
          >
            <Flex gap={10} wrap>
              <div style={{ width: '160px' }}>
                <Form.Item name="yearMonth" noStyle>
                  <DatePicker
                    picker="month"
                    placeholder="Month"
                    allowClear={false}
                    disabledDate={(current) => {
                      return current && current > dayjs().endOf('day');
                    }}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
              <div style={{ width: '160px' }}>
                <Form.Item name="bu" noStyle>
                  <Select
                    style={{ width: 160 }}
                    placeholder="All BU"
                    allowClear={true}
                    options={Object.values(BUEnum).map((item) => ({
                      label: item,
                      value: item,
                    }))}
                  />
                </Form.Item>
              </div>

              <div style={{ width: '160px' }}>
                <Form.Item name="vendorObj" noStyle>
                  <FuzzySelector
                    fieldProps={{
                      placeholder: 'Vendor',
                      style: { width: '100%' },
                    }}
                    request={{
                      field: 'vendorName',
                      esDtoClass: ES_DTO_CLASS.VENDOR,
                      type: FieldQueryHighlightTypeEnum.USER_ROLE,
                    }}
                  />
                </Form.Item>
              </div>

              <div style={{ width: '160px' }}>
                <Form.Item name="picUserObj" noStyle>
                  <FuzzySelector
                    customProps={{
                      isUAM: true,
                    }}
                    fieldProps={{
                      placeholder: 'Procurement PIC',
                      style: { width: '100%' },
                    }}
                    request={{
                      field: 'aliasName',
                      esDtoClass: ES_DTO_CLASS.USER,
                      type: FieldQueryHighlightTypeEnum.None,
                    }}
                  />
                </Form.Item>
              </div>

              <Button type="primary" onClick={onSearch}>
                Search
              </Button>

              <Button onClick={onReset}>Reset</Button>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={exportLoading}
                onClick={() => {
                  if (completedGuidance) {
                    handleExport();
                  } else {
                    playAnimation();
                    guidanceUpdateHandle();
                    setTimeout(() => {
                      handleExport();
                    }, 3000);
                  }
                }}
                ref={playSrcRef}
              >
                Export Data
              </Button>
            </Flex>
          </Form>
          {loading ? (
            <SkeletonView />
          ) : (
            <Table
              tableRef={tableRef}
              dataSource={dataSource}
              currentSortField={sortConfig.field}
              currentSortOrder={sortConfig.order}
              onSortChange={handleSortChange}
              yearMonth={yearMonthValue?.format(dateFormat)}
              bu={buValue}
              scrollY={scrollY}
            />
          )}
        </Col>
        <Col span={12}>
          {loading ? (
            <SkeletonView rows={11} />
          ) : dataSource?.length > 0 ? (
            <Charts
              yearMonth={
                yearMonthValue
                  ? yearMonthValue?.format(dateFormat)
                  : defaultDate.format(dateFormat)
              }
              dataSource={dataSource}
              tableRef={tableRef}
            />
          ) : (
            <Flex
              align="center"
              justify="center"
              style={{ width: '100%', height: '100%' }}
            >
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Flex>
          )}
        </Col>
      </Row>
    </CardView>
  );
};

export default GrossProfit;
