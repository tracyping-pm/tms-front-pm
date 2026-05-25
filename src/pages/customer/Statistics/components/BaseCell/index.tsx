import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';

interface IBaseCell extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

const BaseCell: FC<IBaseCell> = ({
  align = 'left',
  children,
  ...restProps
}) => {
  return (
    <div
      className={cls(
        'base-cell',
        styles.baseCell,
        align === 'center' && styles.alignCenter,
        align === 'left' && styles.alignLeft,
        align === 'right' && styles.alignRight,
      )}
      {...restProps}
    >
      {children === 0 || children ? (
        <div className="innerChildren">{children}</div>
      ) : null}
    </div>
  );
};

export default BaseCell;
