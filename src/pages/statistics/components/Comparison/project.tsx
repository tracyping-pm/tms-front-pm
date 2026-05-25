import { projectAnalysisAnnualRevenueContrast } from '@/api/statistics';
import {
  IProjectAnalysisContrastParams,
  WaybillTimeType,
} from '@/api/types/statistics';
import FuzzySelector from '@/components/FuzzySelector';
import { ES_DTO_CLASS } from '@/constants';
import {
  EnumCountCompareResult,
  FieldQueryHighlightTypeEnum,
  ProjectStatusEnum,
  ProjectStatusEnumColor,
  ProjectStatusEnumText,
} from '@/enums';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import UpDownView from '@/pages/statistics/common/UpDownView';
import { formatAmount, formatAmountPercentage } from '@/utils/utils';
import { useSearchParams } from '@umijs/max';
import {
  Affix,
  Badge,
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Row,
  Typography,
} from 'antd';
import cls from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { ReactNode, useEffect, useState } from 'react';
import styles from './index.less';

const { Title } = Typography;
interface IComparisonItem {
  label: string;
  value: number;
  compareResult?: EnumCountCompareResult;
  compareNumber?: number;
  suffix?: ReactNode;
  useMoneyFormat?: boolean;
}

const Item = ({ obj }: { obj: IComparisonItem }) => {
  return (
    <div className={styles.comparisonCardItem}>
      <div className={styles.comparisonCardLabel}>{obj.label}</div>
      <div className={styles.comparisonCardResult}>
        <div className={styles.comparisonCardValue}>
          {obj.value} {obj.suffix}
        </div>
        {obj.compareResult && (
          <UpDownView
            result={obj.compareResult}
            number={obj.compareNumber!}
            suffix={obj.suffix}
            useMoneyFormat={obj.useMoneyFormat}
            control
          />
        )}
      </div>
    </div>
  );
};

export default function Comparison() {
  const [searchParams] = useSearchParams();
  const yearMonth = searchParams.get('yearMonth') as string;
  const projectId = searchParams.get('projectId') as string;
  const projectName = searchParams.get('projectName') as string;
  const waybillTimeType = searchParams.get(
    'waybillTimeType',
  ) as WaybillTimeType;
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<{
    id: number;
    name: string;
    projectStatus: ProjectStatusEnum;
  }>();

  const [comparisonList, setComparisonList] = useState<any>([]);
  const [baseList, setBaseList] = useState<any>();

  const fetchDataSource = async () => {
    const values = form.getFieldsValue();

    setLoading(true);
    const payload: IProjectAnalysisContrastParams = {
      projectId: values?.projectObj?.id,
      yearMonth: values?.yearMonth?.format('YYYY-MM'),
      contrastMonths: values?.contrastMonths?.map((item: Dayjs) =>
        dayjs(item).format('YYYY-MM'),
      ),
      waybillTimeType,
    };
    const res = await projectAnalysisAnnualRevenueContrast(payload).finally(
      () => setLoading(false),
    );
    if (res.code === 200) {
      const data = res.data;

      setInfo({
        id: data?.projectId,
        name: data?.projectName,
        projectStatus: data?.projectStatus,
      });

      setBaseList(
        data?.baseList?.map((item) => ({
          yearMonth: item?.yearMonth,
          list: [
            {
              label: 'Waybill',
              value: formatAmount(item?.waybillNum),
            },
            {
              label: 'Revenue',
              value: formatAmount(item?.revenue),
            },
            {
              label: 'Cost',
              value: formatAmount(item?.cost),
            },
            {
              label: 'Gross Profit',
              value: formatAmount(item?.grossProfit),
            },
            {
              label: 'Gross Margin',
              value: formatAmountPercentage(item?.grossMargin),
              useMoneyFormat: false,
              suffix: '%',
            },
          ],
        })),
      );

      setComparisonList(
        data?.contrastList?.map((item) => {
          return {
            yearMonth: item?.yearMonth,
            list: [
              {
                label: 'Waybill',
                value: formatAmount(item?.waybillNum),
                compareResult: item?.waybillCompareResult,
                compareNumber: item?.waybillNumDifference,
              },
              {
                label: 'Revenue',
                value: formatAmount(item?.revenue),
                compareResult: item?.revenueCompareResult,
                compareNumber: item?.revenueDifference,
              },
              {
                label: 'Cost',
                value: formatAmount(item?.cost),
                compareResult: item?.costCompareResult,
                compareNumber: item?.costDifference,
              },
              {
                label: 'Gross Profit',
                value: formatAmount(item?.grossProfit),
                compareResult: item?.grossProfitCompareResult,
                compareNumber: item?.grossProfitDifference,
              },
              {
                label: 'Gross Margin',
                value: formatAmountPercentage(item?.grossMargin),
                compareResult: item?.grossMarginCompareResult,
                compareNumber: formatAmountPercentage(
                  item?.grossMarginDifference,
                ),
                suffix: '%',
                useMoneyFormat: false,
              },
            ],
          };
        }),
      );
    }
  };

  const onSearch = async () => {
    await form.validateFields();
    fetchDataSource();
  };

  useEffect(() => {
    form.setFieldsValue({
      yearMonth: dayjs(yearMonth),
      contrastMonths: [
        dayjs(yearMonth).subtract(1, 'year'),
        dayjs(yearMonth).subtract(1, 'month'),
      ],
      projectObj: {
        id: projectId,
        name: projectName,
      },
    });
    fetchDataSource();
  }, []);

  return (
    <Flex gap={12} vertical>
      <Affix offsetTop={50}>
        <Row className={styles.comparisonRow}>
          <Title level={4}>Project Analysis-Comparison</Title>
          <Col span={24} style={{ borderBottom: '1px solid #F0F0F0' }}>
            <Form
              name="project-analysis-comparison-form"
              form={form}
              // style={{ marginBottom: '8px' }}
            >
              <Flex gap={15} align="top" style={{ marginBottom: 12 }}>
                <div style={{ width: '160px' }}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name="projectObj"
                    // noStyle
                    rules={[
                      { required: true, message: 'Please select Project' },
                    ]}
                  >
                    <FuzzySelector
                      fieldProps={{
                        placeholder: 'Project',
                        style: { width: '100%' },
                      }}
                      request={{
                        field: 'projectName',
                        esDtoClass: ES_DTO_CLASS.PROJECT,
                        type: FieldQueryHighlightTypeEnum.COUNTRY,
                      }}
                    />
                  </Form.Item>
                </div>
                <div style={{ minWidth: '160px', maxWidth: '68%' }}>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name="contrastMonths"
                    // noStyle
                    rules={[
                      {
                        required: true,
                        message: 'Please select Contrast Month',
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      multiple
                      picker="month"
                      placeholder="Month"
                      allowClear={false}
                      format="YYYY-MM"
                      disabledDate={(current) => {
                        return current && current > dayjs().endOf('day');
                      }}
                    />
                  </Form.Item>
                </div>
                <div
                  style={{
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  VS
                </div>
                <div style={{ width: '160px' }}>
                  <Form.Item
                    name="yearMonth"
                    style={{ marginBottom: 0 }}
                    // noStyle
                    rules={[{ required: true, message: 'Please select month' }]}
                  >
                    <DatePicker
                      style={{ width: '160px' }}
                      picker="month"
                      placeholder="Month"
                      allowClear={false}
                      disabledDate={(current) => {
                        return current && current > dayjs().endOf('day');
                      }}
                    />
                  </Form.Item>
                </div>

                <Button type="primary" onClick={onSearch}>
                  OK
                </Button>
              </Flex>
            </Form>
          </Col>
          <Col span={24} style={{ padding: '4px 0' }}>
            <Title level={2}>Project: {info?.name}</Title>
            <Title level={5} style={{ margin: 0 }}>
              Status:{' '}
              <Badge
                color={
                  ProjectStatusEnumColor[
                    info?.projectStatus as ProjectStatusEnum
                  ]
                }
                text={
                  ProjectStatusEnumText[
                    info?.projectStatus as ProjectStatusEnum
                  ]
                }
              />
            </Title>
          </Col>
        </Row>
      </Affix>
      <div>
        {loading ? (
          <SkeletonView />
        ) : (
          <Row>
            <Col span={10}>
              {baseList?.map(
                (
                  item: { yearMonth: string; list: IComparisonItem[] },
                  index: number,
                ) => {
                  return (
                    <div key={index} className={styles.comparisonCard}>
                      <p className={styles.comparisonCardTitle}>
                        {item?.yearMonth}
                      </p>

                      <div
                        className={cls(
                          styles.comparisonCardContent,
                          styles.comparisonCardInitValue,
                        )}
                      >
                        {item?.list?.map((_item: IComparisonItem) => (
                          <Item key={_item.label} obj={_item} />
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </Col>

            <Col span={2}>
              <Affix offsetTop={250}>
                <Flex vertical align="center">
                  <Title level={1}>VS</Title>
                </Flex>
              </Affix>
            </Col>

            <Col span={12} className={styles.comparisonCardContainer}>
              {comparisonList?.map(
                (
                  item: { yearMonth: string; list: IComparisonItem[] },
                  index: number,
                ) => {
                  return (
                    <div key={index} className={styles.comparisonCard}>
                      <p className={styles.comparisonCardTitle}>
                        {item?.yearMonth}
                      </p>
                      <div className={cls(styles.comparisonCardContent)}>
                        {item?.list?.map((_item: IComparisonItem) => {
                          return <Item key={_item.label} obj={_item} />;
                        })}
                      </div>
                    </div>
                  );
                },
              )}
            </Col>
          </Row>
        )}
      </div>
    </Flex>
  );
}
