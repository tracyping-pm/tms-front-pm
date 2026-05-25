import Tooltip, {
  TooltipPlacement,
  TooltipPropsWithOverlay,
} from 'antd/es/tooltip';
import cls from 'classnames';
import lodash from 'lodash';
import { FC } from 'react';
import styles from './index.less';

export interface ICustomTooltip extends TooltipPropsWithOverlay {
  rootClassName?: string;
  className?: string;
  placement?: TooltipPlacement;
  titleMinWidth?: number;
  titleMaxWidth?: number;
  children?: React.ReactNode;
}

const CustomTooltip: FC<ICustomTooltip> = ({
  rootClassName,
  className,
  placement = 'topLeft',
  title,
  titleMinWidth = 30,
  titleMaxWidth = 540,
  children,
  ...rest
}) => {
  return (
    <>
      {title ? (
        <Tooltip
          rootClassName={cls(styles.customTooltipRoot, rootClassName)}
          className={cls(className)}
          placement={placement}
          title={
            lodash.isFunction(title) ? (
              title()
            ) : (
              <div
                className={styles.customTooltipTitle}
                style={{ minWidth: titleMinWidth, maxWidth: titleMaxWidth }}
              >
                {lodash.isFunction(title) ? title() : title}
              </div>
            )
          }
          {...rest}
        >
          {children}
        </Tooltip>
      ) : (
        '-'
      )}
    </>
  );
};

export default CustomTooltip;
