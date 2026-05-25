import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';

interface IBaseCell extends React.HTMLAttributes<HTMLDivElement> {
  showToggle?: boolean;
  onClick?: () => void;
}

// 当 showToggle 为 true 时，isExpand 是必需的
interface IBaseCellWithToggle extends IBaseCell {
  showToggle: true;
  isExpand: boolean;
}

// 当 showToggle 为 false 或未定义时，isExpand 是可选的
interface IBaseCellWithoutToggle extends IBaseCell {
  showToggle?: false;
  isExpand?: boolean;
}

const BaseCell: FC<IBaseCellWithToggle | IBaseCellWithoutToggle> = ({
  showToggle = false,
  isExpand,
  onClick,
  ...restProps
}) => {
  return (
    <div className={cls('base-cell', styles.baseCell)} {...restProps}>
      {showToggle ? (
        <span className="cell-toggle">
          <Button
            variant="link"
            color={isExpand ? 'default' : 'primary'}
            style={{ width: '20px', height: '20px' }}
            icon={
              isExpand ? <FullscreenExitOutlined /> : <FullscreenOutlined />
            }
            onClick={onClick}
          />
        </span>
      ) : null}
    </div>
  );
};

export default BaseCell;
