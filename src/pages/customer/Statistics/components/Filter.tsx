import { opportunityPerson } from '@/api/statistics';
import { STATISTICS_TIME_OPTION } from '@/constants';
import { BUEnum } from '@/enums';
import { DatePicker, Flex, Radio, Select } from 'antd';
import { BaseOptionType } from 'antd/es/select';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { useGlobalFilter } from '../GlobalFilterContext';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const buOptions = [
  {
    value: BUEnum.GLOBAL_FORWARDING,
    label: BUEnum.GLOBAL_FORWARDING,
  },
  {
    value: BUEnum.TRUCK_TRANSPORTATION,
    label: BUEnum.TRUCK_TRANSPORTATION,
  },
  {
    value: BUEnum.WAREHOUSE_STORAGE,
    label: BUEnum.WAREHOUSE_STORAGE,
  },
  {
    value: BUEnum.CONTRACT_LOGISTICS,
    label: BUEnum.CONTRACT_LOGISTICS,
  },
  {
    value: BUEnum.SOURCING_AND_SUPPLY_SOLUTION,
    label: BUEnum.SOURCING_AND_SUPPLY_SOLUTION,
  },
  {
    value: BUEnum.SUPPLY_CHAIN_TECHNOLOGY_AND_OTHERS,
    label: BUEnum.SUPPLY_CHAIN_TECHNOLOGY_AND_OTHERS,
  },
];

const Filter: FC = () => {
  const { globalFilter, setGlobalFilter } = useGlobalFilter();
  const [bdOptionLoading, setBdOptionLoading] = useState(false);
  const [bdOption, setBdOption] = useState<BaseOptionType[]>([]);

  const fetchBdOption = async () => {
    setBdOptionLoading(true);
    const res = await opportunityPerson().finally(() => {
      setBdOptionLoading(false);
    });

    if (res.code === 200) {
      let options: any[] = [];
      res.data?.forEach((item) => {
        options.push({ value: item.userRoleId, label: item.aliasName });
      });
      setBdOption(options);
    }
  };

  const onBuChange = (v: BUEnum) => {
    setGlobalFilter({ bu: v });
  };

  const onBDChange = (v: number[]) => {
    setGlobalFilter({ bdUserRoleIds: v });
  };

  const onTimeOptionChange = (e: any) => {
    const timeOption = e.target.value;
    setGlobalFilter({ timeOption });

    const now = dayjs();

    switch (timeOption) {
      case STATISTICS_TIME_OPTION.CURRENT_MONTH:
        {
          const startTime = now.startOf('month').format(dateFormat);
          const endTime = now.endOf('month').isAfter(now.endOf('day'))
            ? now.endOf('day').format(dateFormat)
            : now.endOf('month').format(dateFormat);

          setGlobalFilter({ startTime, endTime });
        }

        break;
      case STATISTICS_TIME_OPTION.LAST_MONTH:
        {
          const startTime = now
            .subtract(1, 'month')
            .startOf('month')
            .format(dateFormat);
          const endTime = now
            .subtract(1, 'month')
            .endOf('month')
            .format(dateFormat);

          setGlobalFilter({ startTime, endTime });
        }
        break;
      case STATISTICS_TIME_OPTION.CURRENT_WEEK:
        {
          const startTime = now
            .startOf('week')
            .add(1, 'day')
            .format(dateFormat);
          const endTime = now
            .endOf('week')
            .add(1, 'day')
            .isAfter(now.endOf('day'))
            ? now.endOf('day').format(dateFormat)
            : now.endOf('week').add(1, 'day').format(dateFormat);

          setGlobalFilter({ startTime, endTime });
        }
        break;
      case STATISTICS_TIME_OPTION.LAST_WEEK:
        {
          const startTime = now
            .subtract(1, 'week')
            .startOf('week')
            .add(1, 'day')
            .format(dateFormat);
          const endTime = now
            .subtract(1, 'week')
            .endOf('week')
            .add(1, 'day')
            .format(dateFormat);

          setGlobalFilter({ startTime, endTime });
        }
        break;
    }
  };

  // 检测 RangePicker 是否匹配预设选项
  const detectTimeOption = (dates: [Dayjs, Dayjs]): STATISTICS_TIME_OPTION => {
    if (!dates) {
      return STATISTICS_TIME_OPTION.NONE;
    }

    const [start, end] = dates;

    // 检查是否是本月
    const now = dayjs();
    if (
      start.isSame(now.startOf('month'), 'day') &&
      end.isSame(
        now.endOf('month').isAfter(now.endOf('day'))
          ? now.endOf('day')
          : now.endOf('month'),
        'day',
      )
    ) {
      return STATISTICS_TIME_OPTION.CURRENT_MONTH;
    }

    // 检查是否是上个月
    if (
      start.isSame(now.subtract(1, 'month').startOf('month'), 'day') &&
      end.isSame(now.subtract(1, 'month').endOf('month'), 'day')
    ) {
      return STATISTICS_TIME_OPTION.LAST_MONTH;
    }

    // 检查是否是本周
    if (
      start.isSame(now.startOf('week').add(1, 'day'), 'day') &&
      end.isSame(
        now.endOf('week').add(1, 'day').isAfter(now.endOf('day'))
          ? now.endOf('day')
          : now.endOf('week').add(1, 'day'),
        'day',
      )
    ) {
      return STATISTICS_TIME_OPTION.CURRENT_WEEK;
    }

    // 检查是否是上周
    if (
      start.isSame(
        now.subtract(1, 'week').startOf('week').add(1, 'day'),
        'day',
      ) &&
      end.isSame(now.subtract(1, 'week').endOf('week').add(1, 'day'), 'day')
    ) {
      return STATISTICS_TIME_OPTION.LAST_WEEK;
    }

    return STATISTICS_TIME_OPTION.NONE;
  };

  const onRangeChange = (dates: any) => {
    if (dates) {
      const [start, end] = dates;
      const matchedOption = detectTimeOption(dates);
      setGlobalFilter({
        timeOption: matchedOption,
        startTime: start.format(dateFormat),
        endTime: end.format(dateFormat),
      });
    }
  };

  useEffect(() => {
    fetchBdOption();
  }, []);

  return (
    <>
      {/* <div>{JSON.stringify(globalFilter)}</div> */}

      <Flex gap={12} wrap>
        <Select
          allowClear
          placeholder="All BU"
          style={{ width: '160px' }}
          options={buOptions}
          popupMatchSelectWidth={300}
          value={globalFilter?.bu}
          onChange={onBuChange}
        />

        <Select
          allowClear
          showSearch
          mode="multiple"
          maxTagCount="responsive"
          placeholder="All BD/CAM"
          style={{ width: '160px' }}
          optionFilterProp="label"
          loading={bdOptionLoading}
          options={bdOption}
          value={globalFilter?.bdUserRoleIds}
          onChange={onBDChange}
        />

        <Radio.Group
          buttonStyle="solid"
          value={globalFilter?.timeOption}
          onChange={onTimeOptionChange}
        >
          <Radio.Button value={STATISTICS_TIME_OPTION.CURRENT_MONTH}>
            Current Month
          </Radio.Button>
          <Radio.Button value={STATISTICS_TIME_OPTION.LAST_MONTH}>
            Last Month
          </Radio.Button>
          <Radio.Button value={STATISTICS_TIME_OPTION.CURRENT_WEEK}>
            Current Week
          </Radio.Button>
          <Radio.Button value={STATISTICS_TIME_OPTION.LAST_WEEK}>
            Last Week
          </Radio.Button>
        </Radio.Group>

        <RangePicker
          style={{ width: '430px' }}
          allowClear={false}
          value={[dayjs(globalFilter?.startTime), dayjs(globalFilter?.endTime)]}
          onChange={onRangeChange}
        />
      </Flex>
    </>
  );
};

export default Filter;
