import { StatisticRankTypeEnum } from '@/constants';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import { ReactComponent as DownIcon } from '../../../../public/svg/statistics/downIcon.svg';
import { ReactComponent as UpIcon } from '../../../../public/svg/statistics/upIcon.svg';

export default function CustomButton({
  name,
  type, // 按钮Rank类型
  defaultRankType, // // 默认Rank类型
  getCurrentBtnDate,
}: {
  name: string;
  type: StatisticRankTypeEnum;
  defaultRankType: StatisticRankTypeEnum;
  getCurrentBtnDate?: (date: any) => void;
}) {
  const [sortType, setSortType] = useState<'asc' | 'desc'>('desc'); //倒序
  const [targetType, setTargetType] =
    useState<StatisticRankTypeEnum>(defaultRankType);

  const onChooseType = (_type: StatisticRankTypeEnum) => {
    let _sortType: 'asc' | 'desc' = 'desc';

    if (targetType === _type) {
      _sortType = sortType === 'asc' ? 'desc' : 'asc';
    }
    setSortType(_sortType);
    getCurrentBtnDate?.({
      rankType: _type,
      sortType: _sortType,
    });
  };

  useEffect(() => {
    setTargetType(defaultRankType);
  }, [defaultRankType]);

  return (
    <>
      <Button
        key={name}
        type={targetType === type ? 'primary' : 'default'}
        onClick={() => onChooseType(type)}
      >
        {name}
        {sortType === 'asc' ? (
          <UpIcon style={{ fontSize: 14 }} />
        ) : (
          <DownIcon style={{ fontSize: 14 }} />
        )}
      </Button>
    </>
  );
}
