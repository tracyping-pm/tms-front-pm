import { projectAnalysisList } from '@/api/statistics';
import { IProjectAnalysisListRecord } from '@/api/types/statistics';
import CustomTooltip from '@/components/CustomTooltip';
import { PATHS } from '@/constants';
import {
  BUEnum,
  ProjectStatusEnum,
  ProjectStatusEnumColor,
  ProjectStatusEnumText,
} from '@/enums';
import CardView from '@/pages/statistics/common/CardView';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import { generateCompareColumns } from '@/pages/statistics/common/generateCompareColumns';
import {
  formatAmount,
  formatAmountWithRound,
  formatMoneyWithDecimal,
  openNewTag,
} from '@/utils/utils';
import {
  Table as AntdTable,
  Badge,
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';

const { Text } = Typography;
const defaultDate: Dayjs = dayjs();
export default function Analysis() {
  const { waybillTimeType } = useWaybillTimeType();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState<IProjectAnalysisListRecord[]>(
    [],
  );
  const [scrollY, setScrollY] = useState(500);
  const [originDataSource, setOriginDataSource] = useState<
    IProjectAnalysisListRecord[]
  >([]);

  const nameValue = Form.useWatch('projectName', form);
  const comparisonPeriodValue = Form.useWatch('comparisonPeriod', form);
  const [loading, setLoading] = useState(false);

  const fetchDataSource = async () => {
    const params = form.getFieldsValue();

    setLoading(true);
    const payload = {
      startDate: dayjs(params.yearMonth)
        .startOf('month')
        .format('YYYY-MM-DD 00:00:00'),
      endDate: dayjs(params.yearMonth)
        .endOf('month')
        .format('YYYY-MM-DD 23:59:59'),
      bu: params.bu,
      searchName: params.projectName,
      waybillTimeType,
      comparisonPeriod: params.comparisonPeriod,
    };
    const res = await projectAnalysisList(payload).finally(() =>
      setLoading(false),
    );
    if (res.code === 200) {
      const data = res.data ?? [];
      setOriginDataSource(res.data);
      // setDataSource(data);
      const _nameValue = params?.projectName ?? '';
      // 过滤 dataSource ,包括大小写
      setDataSource(
        data.filter((item) => {
          return item?.projectName
            ?.toLowerCase()
            .includes(_nameValue?.toLowerCase());
        }),
      );
    }
  };
  const onNameChange = useCallback(
    (name: string) => {
      const list = originDataSource.map((item) => {
        const { projectName } = item;
        const content = projectName.replace(
          new RegExp(name, 'gi'),
          (match) => `<span style="color: red;">${match}</span>`,
        );

        return {
          ...item,
          projectName: content,
        };
      });

      // 过滤 dataSource ,包括大小写
      setDataSource(list);
    },
    [dataSource],
  );

  const onSearch = () => {
    fetchDataSource();
  };
  const onReset = () => {
    form.setFieldsValue({
      yearMonth: defaultDate,
      projectName: undefined,
      bu: undefined,
      comparisonPeriod: 1,
    });
    fetchDataSource();
  };

  useEffect(() => {
    if (nameValue) {
      onNameChange(nameValue);
    }
  }, [nameValue]);

  useEffect(() => {
    const values = form.getFieldsValue();
    if (!values.yearMonth) {
      form.setFieldsValue({
        date: values.yearMonth || defaultDate,
      });
    }
    fetchDataSource();
  }, [waybillTimeType]);

  const yearMonthValue = Form.useWatch('yearMonth', form);

  const columns: ColumnsType<IProjectAnalysisListRecord> = useMemo(() => {
    const waybillCompareColumns =
      generateCompareColumns<IProjectAnalysisListRecord>({
        baseTitle: 'Waybill Change',
        listDataIndex: 'waybillNumChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: true,
        columnWidth: 160,
      });
    const avgWaybillCompareColumns =
      generateCompareColumns<IProjectAnalysisListRecord>({
        baseTitle: 'Avg Daily Waybill Change',
        listDataIndex: 'avgWaybillNumChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: true,
        columnWidth: 160,
      });
    const revenueCompareColumns =
      generateCompareColumns<IProjectAnalysisListRecord>({
        baseTitle: 'Revenue Change',
        listDataIndex: 'revenueChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: false,
      });
    const gpCompareColumns = generateCompareColumns<IProjectAnalysisListRecord>(
      {
        baseTitle: 'GP Change',
        listDataIndex: 'gpChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: false,
      },
    );
    const gmCompareColumns = generateCompareColumns<IProjectAnalysisListRecord>(
      {
        baseTitle: 'GM Change',
        listDataIndex: 'gmChangeList',
        yearMonth: yearMonthValue,
        comparisonPeriod: comparisonPeriodValue ?? 0,
        isCount: false,
      },
    );

    return [
      {
        title: 'No.',
        width: 50,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: 'Project',
        dataIndex: 'projectName',
        ellipsis: true,
        width: 220,
        fixed: 'left',
        render: (_, record) => {
          return (
            <CustomTooltip title={record.projectName}>
              <span
                dangerouslySetInnerHTML={{ __html: record.projectName }}
              ></span>
            </CustomTooltip>
          );
        },
      },
      {
        title: 'Project Status',
        dataIndex: 'projectStatus',
        ellipsis: true,
        width: 130,
        render: (_, record) => {
          const status: ProjectStatusEnum = record.projectStatus;
          const Content = (
            <Badge
              color={ProjectStatusEnumColor[status]}
              text={ProjectStatusEnumText[status]}
            />
          );
          return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
        },
      },

      {
        title: 'Waybill',
        dataIndex: 'waybillNum',
        width: 70,
        render: (_, record) => {
          const num = formatAmount(record.waybillNum);

          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      ...waybillCompareColumns,
      {
        title: 'Avg Daily Waybill',
        dataIndex: 'avgWaybillNum',
        width: 100,
        render: (_, record) => {
          const num = formatAmount(record.avgWaybillNum);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      ...avgWaybillCompareColumns,
      {
        title: 'Revenue',
        dataIndex: 'revenue',
        align: 'right',
        width: 120,
        sorter: (a, b) => a.revenue - b.revenue,
        defaultSortOrder: 'descend',
        render: (_, record) => {
          const num = formatAmountWithRound(record.revenue);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      ...revenueCompareColumns,
      {
        title: 'Gross Profit',
        dataIndex: 'grossProfit',
        align: 'right',
        width: 120,
        sorter: (a, b) => a.grossProfit - b.grossProfit,
        render: (_, record) => {
          const num = formatAmountWithRound(record.grossProfit);
          return (
            <CustomTooltip title={num}>
              <Text ellipsis>{num}</Text>
            </CustomTooltip>
          );
        },
      },
      ...gpCompareColumns,

      {
        title: 'Gross Margin',
        dataIndex: 'grossMargin',
        align: 'right',
        width: 120,
        sorter: (a, b) => a.grossMargin - b.grossMargin,
        render: (_, record) => {
          const grossMargin =
            typeof record.grossMargin === 'number' &&
            !Number.isNaN(record.grossMargin)
              ? formatMoneyWithDecimal(record.grossMargin) + '%'
              : '-';
          return (
            <CustomTooltip title={grossMargin}>
              <Text ellipsis>{grossMargin}</Text>
            </CustomTooltip>
          );
        },
      },
      // {
      //   title: (
      //     <TooltipTitle tips={`Compared to previous month`}>
      //       {'GM Change'}
      //     </TooltipTitle>
      //   ),
      //   dataIndex: 'gmChange',
      //   sorter: (a, b) => a.gmChange - b.gmChange,
      //   showSorterTooltip: false,
      //   width: 140,
      //   align: 'right',
      //   render: (_, record) => {
      //     let result = EnumCountCompareResult.EQUAL;
      //     if (record.gmChange > 0) {
      //       result = EnumCountCompareResult.INCREASE;
      //     } else if (record.gmChange < 0) {
      //       result = EnumCountCompareResult.DECREASE;
      //     } else {
      //       result = EnumCountCompareResult.EQUAL;
      //     }
      //     const content = (
      //       <UpDownView
      //         result={result}
      //         number={Math.abs(record.gmChange)}
      //         control
      //       />
      //     );
      //     return content;
      //   },
      // },
      ...gmCompareColumns,
      {
        title: 'Action',
        width: 150,
        render: (_, record) => {
          const projectName = record.projectName
            ? `&projectName=${encodeURIComponent(record.projectName as string)}`
            : '';
          return (
            <Flex gap={12} align="center">
              <Button
                type="link"
                size="small"
                onClick={() => {
                  openNewTag(
                    `${PATHS.PROJECT_ANALYSIS_PROJECT_TREND}?yearMonth=${dayjs(form.getFieldsValue().yearMonth).format('YYYY-MM')}&id=${record.projectId}${projectName}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                Trend
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  openNewTag(
                    `${PATHS.PROJECT_ANALYSIS_PROJECT_COMPARISON}?yearMonth=${dayjs(form.getFieldsValue().yearMonth).format('YYYY-MM')}&projectId=${record.projectId}${projectName}&waybillTimeType=${waybillTimeType}`,
                  );
                }}
              >
                Compare
              </Button>
            </Flex>
          );
        },
      },
    ];
  }, [dataSource, yearMonthValue, waybillTimeType]);

  return (
    <CardView
      title={'Project Analysis'}
      showFullScreen
      fullScreenChanged={(isFullScreen) => {
        setScrollY(isFullScreen ? window.innerHeight - 200 : 500);
      }}
    >
      <Row gutter={12}>
        <Col span={24}>
          <Form
            name="project-analysis-form"
            form={form}
            style={{ marginBottom: '8px' }}
            initialValues={{
              yearMonth: defaultDate,
              comparisonPeriod: 1,
            }}
          >
            <Flex gap={15} wrap style={{ marginBottom: 12 }}>
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
                <Form.Item name="projectName" noStyle>
                  <Input placeholder="Project Name" />
                </Form.Item>
              </div>
              <div style={{ width: '220px' }}>
                <Form.Item name="bu" noStyle>
                  <Select
                    allowClear
                    style={{ width: 220 }}
                    placeholder="All BU"
                    options={Object.values(BUEnum).map((item) => ({
                      label: item,
                      value: item,
                    }))}
                  />
                </Form.Item>
              </div>

              <div style={{ width: 300 }}>
                <Form.Item
                  name="comparisonPeriod"
                  label="Comparison Period"
                  style={{ marginBottom: 0, width: 300 }}
                >
                  <Select
                    placeholder="Compare Month"
                    allowClear
                    options={Array.from({ length: 12 }, (_, i) => ({
                      label:
                        i === 0
                          ? 'Previous Month'
                          : `Past  ${i + 1} Month${i + 1 > 1 ? 's' : ''}`,
                      value: i + 1,
                    }))}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>

              <Button type="primary" onClick={onSearch}>
                Search
              </Button>

              <Button onClick={onReset}>Reset</Button>
            </Flex>
          </Form>
          {loading ? (
            <SkeletonView />
          ) : (
            <AntdTable
              rowKey={(record) => record.projectId}
              virtual
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 'max-content', y: scrollY }}
            />
          )}
        </Col>
      </Row>
    </CardView>
  );
}
