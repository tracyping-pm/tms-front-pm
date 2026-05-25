import PHP from '@/components/CountryIcon/PHP';
import THB from '@/components/CountryIcon/THB';
import { formatAmount } from '@/utils/utils';
import cls from 'classnames';
import { FC } from 'react';
import styles from './common.less';

interface IProps {
  className?: string;
  countryId?: number;
  title: string;
  tripNumbers: number;
  income: number;
  spending: number;
  GP: number;
  GM: number;
}

const SingleTooltip: FC<IProps> = ({
  className,
  countryId,
  title,
  tripNumbers,
  income,
  spending,
  GP,
  GM,
}) => {
  return (
    <>
      <div className={cls(styles.singleTooltip, 'singleTooltip', className)}>
        <div className="header ellipsis">{title}</div>
        <div className="heavy-item">
          <span className="label">Trip Numbers</span>
          <span className="value">{formatAmount(tripNumbers)}</span>
        </div>
        <div className="content">
          <div className="item">
            <span className="label">Income</span>
            <span className="value">
              {countryId === 1 ? <PHP /> : <THB />}
              {formatAmount(income)}
            </span>
          </div>
          <div className="item">
            <span className="label">Spending</span>
            <span className="value">
              {countryId === 1 ? <PHP /> : <THB />}
              {formatAmount(spending)}
            </span>
          </div>
          <div className="item">
            <span className="label">GP</span>
            <span className="value">
              {countryId === 1 ? <PHP /> : <THB />}
              {formatAmount(GP)}
            </span>
          </div>
        </div>
        <div className="heavy-item">
          <span className="label">Gross Margin</span>
          <span className="value">{isNaN(GM) ? 0 : `${GM.toFixed(2)}%`}</span>
        </div>
      </div>
    </>
  );
};

export default SingleTooltip;
