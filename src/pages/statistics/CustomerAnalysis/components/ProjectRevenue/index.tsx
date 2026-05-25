import { customerAnalysisProjectRevenueStatic } from '@/api/statistics';
import {
  ICustomerAnalysisParams,
  IProjectRevenueRecord,
} from '@/api/types/statistics';
import { StatisticRankTypeEnum, STATISTICS_TIME_OPTION } from '@/constants';
import CardView from '@/pages/statistics/common/CardView';
import CustomButton from '@/pages/statistics/common/CustomButton';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { useWaybillTimeType } from '@/pages/statistics/common/TimeTypeContext';
import TooltipTitle from '@/pages/statistics/common/TooltipTitle';
import {
  Col,
  DatePicker,
  Flex,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import BarChart from './BarChart';
import PieChart from './PieChart';

const TOP = 50;
export default function Revenue() {
  const { waybillTimeType } = useWaybillTimeType();
  const [sourceData, setSourceData] = useState<IProjectRevenueRecord[]>([]);
  const [barEchartsData, setBarEchartsData] = useState<{
    name: string[];
    value: number[];
  }>();
  const [pieEchartsData, setPieEchartsData] = useState<
    {
      name: string;
      value: number;
    }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [topValue, setTopValue] = useState(TOP);

  const [timeOption, setTimeOption] = useState<STATISTICS_TIME_OPTION>(
    STATISTICS_TIME_OPTION.CURRENT_MONTH,
  );
  const [dateObj, setDateObj] = useState<Dayjs>(dayjs());

  const [rankType, setRankType] = useState<StatisticRankTypeEnum>(
    StatisticRankTypeEnum.REVENUE,
  );
  const [sortType, setSortType] = useState<'asc' | 'desc'>('desc'); //倒序

  const formatBarData = () => {
    const list: IProjectRevenueRecord[] = sourceData;
    if (!list.length) {
      return;
    }
    const barResult: { name: string[]; value: number[] } = {
      name: [],
      value: [],
    };
    const _list = list.map((item: IProjectRevenueRecord) => {
      const o = {
        name: item.projectName,
        value: 0,
      };
      if (rankType === StatisticRankTypeEnum.REVENUE) {
        o.value = item.revenue;
      } else if (rankType === StatisticRankTypeEnum.GP) {
        o.value = item.grossProfit;
      } else if (rankType === StatisticRankTypeEnum.GM) {
        o.value = item.grossMargin;
      }
      return o;
    });
    const sortList = [..._list].sort((a, b) => {
      // 根据amount排序
      if (a.value !== b.value) {
        return sortType === 'asc' ? a.value - b.value : b.value - a.value;
      }
      // 根据amount相同根据customerName字母排序
      return a.name.localeCompare(b.name);
    });
    sortList.forEach((item) => {
      barResult.name.push(item.name);
      barResult.value.push(item.value);
    });
    setBarEchartsData(barResult);
  };

  const formatPieData = (top: number) => {
    const list: IProjectRevenueRecord[] = sourceData;
    if (!list.length) {
      return;
    }
    const _list = list.map((item: IProjectRevenueRecord) => {
      const o = {
        name: item.projectName,
        value: item.revenue ?? 0,
      };
      return o;
    });
    const sortList = [..._list].sort((a, b) => {
      if (a.value !== b.value) {
        return b.value - a.value;
      }
      // 根据amount相同根据customerName字母排序
      return a.name.localeCompare(b.name);
    });
    let otherArray: {
      name: string;
      value: number;
    }[] = [];
    if (sortList.length > top) {
      const otherSum = (sortList?.slice(top) || []).reduce(
        (acc, item) => acc + (item.value || 0),
        0,
      );
      otherArray = [{ name: 'Other', value: otherSum }];
    }
    const pieResult = [...sortList.slice(0, top), ...otherArray];
    setPieEchartsData(pieResult);
  };

  const fetchDataSource = async (date: Dayjs) => {
    setLoading(true);
    setBarEchartsData({ name: [], value: [] });
    setPieEchartsData([]);
    const payload: ICustomerAnalysisParams = {
      startDate:
        dayjs(date).startOf('month').format('YYYY-MM-DD 00:00:00') || '',
      endDate: dayjs(date).endOf('month').format('YYYY-MM-DD 23:59:59') || '',
      waybillTimeType,
    };
    const res = await customerAnalysisProjectRevenueStatic(payload).finally(
      () => setLoading(false),
    );
    setSourceData(res.data || []);
  };

  const onTimeOptionChange = (e: RadioChangeEvent) => {
    const _timeOption = e.target.value;
    setTimeOption(_timeOption);
    const now = dayjs();
    let time: Dayjs = now;
    switch (_timeOption) {
      case STATISTICS_TIME_OPTION.CURRENT_MONTH:
        time = now;
        break;
      case STATISTICS_TIME_OPTION.LAST_MONTH:
        time = now.subtract(1, 'month');
        break;
    }
    setDateObj(time);
    fetchDataSource(time);
  };

  // 检测 RangePicker 是否匹配预设选项
  const detectTimeOption = (date: Dayjs): STATISTICS_TIME_OPTION => {
    if (!date) {
      return STATISTICS_TIME_OPTION.NONE;
    }
    // 检查是否是本月
    const now = dayjs();
    if (date.isSame(now.startOf('month'), 'month')) {
      return STATISTICS_TIME_OPTION.CURRENT_MONTH;
    }
    // 检查是否是上个月
    if (date.isSame(now.subtract(1, 'month'), 'month')) {
      return STATISTICS_TIME_OPTION.LAST_MONTH;
    }
    return STATISTICS_TIME_OPTION.NONE;
  };

  const onDatePickerChange = (date: Dayjs) => {
    if (date) {
      const matchedOption = detectTimeOption(date);
      setTimeOption(matchedOption);
      setDateObj(date);
      // fetchDataSource(date);
    }
  };

  useEffect(() => {
    fetchDataSource(dateObj);
  }, [dateObj, waybillTimeType]);

  useEffect(() => {
    if (!rankType && !sortType) {
      return;
    }
    formatBarData();
  }, [rankType, sortType]);

  useEffect(() => {
    if (!sourceData.length) {
      return;
    }
    formatBarData();
    formatPieData(topValue);
  }, [sourceData]);

  return (
    <CardView
      title={
        <TooltipTitle tips="Project Revenue : Displays projects where the project start date is on or before the selected month">
          {'Project Revenue'}
        </TooltipTitle>
      }
    >
      <Row gutter={12}>
        <Col span={12}>
          <Flex gap={8} vertical={true}>
            <Flex gap={8}>
              <DatePicker
                style={{ width: 160 }}
                picker="month"
                value={dayjs(dateObj)}
                allowClear={false}
                onChange={onDatePickerChange}
                disabledDate={(current) => {
                  return current && current > dayjs().endOf('day');
                }}
              />
              <Radio.Group
                buttonStyle="solid"
                value={timeOption}
                onChange={onTimeOptionChange}
              >
                <Radio.Button value={STATISTICS_TIME_OPTION.CURRENT_MONTH}>
                  Current Month
                </Radio.Button>
                <Radio.Button value={STATISTICS_TIME_OPTION.LAST_MONTH}>
                  Last Month
                </Radio.Button>
              </Radio.Group>
            </Flex>
            <Flex gap={8} wrap="wrap">
              {[
                {
                  name: 'Ranked by Revenue',
                  type: StatisticRankTypeEnum.REVENUE,
                },
                { name: 'Ranked by GP', type: StatisticRankTypeEnum.GP },
                { name: 'Ranked by GM', type: StatisticRankTypeEnum.GM },
              ].map((item) => {
                return (
                  <CustomButton
                    key={item.name}
                    name={item.name}
                    type={item.type}
                    defaultRankType={rankType}
                    getCurrentBtnDate={(params) => {
                      setRankType(params.rankType);
                      setSortType(params.sortType);
                    }}
                  />
                );
              })}
            </Flex>
          </Flex>
          {loading ? (
            <SkeletonView />
          ) : (
            <BarChart dataSource={barEchartsData!} rankType={rankType} />
          )}
        </Col>
        <Col span={12}>
          Top：{' '}
          <Select
            style={{ width: 150 }}
            value={topValue}
            onChange={(value) => {
              setTopValue(Number(value));
              formatPieData(Number(value));
            }}
          >
            {[10, 20, 30, 40, 50].map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
          {loading ? (
            <SkeletonView rows={12} />
          ) : (
            <PieChart
              dataSource={pieEchartsData}
              top={topValue}
              time={dayjs(dateObj).format('YYYY-MM')}
            />
          )}
        </Col>
      </Row>
    </CardView>
  );
}
