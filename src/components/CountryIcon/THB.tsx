import cls from 'classnames';
import { FC } from 'react';

interface IMoneySymbol {
  className?: string;
  style?: React.CSSProperties;
}

const THB: FC<IMoneySymbol> = ({ className, style }) => {
  return (
    <span className={cls(className)} style={style}>
      ฿
    </span>
  );
};

export default THB;
