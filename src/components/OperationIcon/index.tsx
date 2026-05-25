import cls from 'classnames';
import { FC } from 'react';

import {
  BarsOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
} from '@ant-design/icons';
import CustomTooltip from '../CustomTooltip';
import styles from './index.less';

export interface IIconItem {
  showPopover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  content?: string;
}

const IconDelete: FC<IIconItem> = ({
  showPopover = true,
  onClick,
  style,
  className,
}) => {
  return (
    <>
      {showPopover ? (
        <CustomTooltip key="delete" title="Delete" placement="top">
          <DeleteOutlined
            style={style}
            className={cls(styles.iconItem, styles.deleteIcon, className)}
            onClick={() => onClick?.()}
          />
        </CustomTooltip>
      ) : (
        <DeleteOutlined
          style={style}
          className={cls(styles.iconItem, styles.deleteIcon, className)}
          onClick={() => onClick?.()}
        />
      )}
    </>
  );
};

const IconDetail: FC<IIconItem> = ({ showPopover = true, onClick }) => {
  return (
    <>
      {showPopover ? (
        <CustomTooltip key="detail" title="Detail" placement="top">
          <BarsOutlined
            className={cls(styles.iconItem, styles.iconItemCancel)}
            onClick={() => onClick?.()}
          />
        </CustomTooltip>
      ) : (
        <BarsOutlined
          className={cls(styles.iconItem, styles.iconItemCancel)}
          onClick={() => onClick?.()}
        />
      )}
    </>
  );
};

const IconEdit: FC<IIconItem> = ({
  showPopover = true,
  onClick,
  style,
  className,
  content = 'Edit',
}) => {
  return (
    <>
      {showPopover ? (
        <CustomTooltip key="edit" title={content} placement="top">
          <EditOutlined
            style={style}
            className={cls(styles.iconItem, styles.iconItemEdit, className)}
            onClick={() => onClick?.()}
          />
        </CustomTooltip>
      ) : (
        <EditOutlined
          style={style}
          className={cls(styles.iconItem, styles.iconItemEdit, className)}
          onClick={() => onClick?.()}
        />
      )}
    </>
  );
};

const IconCancel: FC<IIconItem> = ({ showPopover = true, onClick }) => {
  return (
    <>
      {showPopover ? (
        <CustomTooltip key="cancel" title="Cancel" placement="top">
          <CloseCircleOutlined
            className={cls(styles.iconItem, styles.iconItemDetail)}
            onClick={() => onClick?.()}
          />
        </CustomTooltip>
      ) : (
        <CloseCircleOutlined
          className={cls(styles.iconItem, styles.iconItemDetail)}
          onClick={() => onClick?.()}
        />
      )}
    </>
  );
};

const IconUserOutlined: FC<IIconItem> = ({
  showPopover = true,
  onClick,
  style,
  className,
}) => {
  return (
    <>
      {showPopover ? (
        <CustomTooltip key="userRoles" title="Roles configured" placement="top">
          <UserOutlined
            style={style}
            className={cls(styles.iconItem, styles.iconItemUser, className)}
            onClick={() => onClick?.()}
          />
        </CustomTooltip>
      ) : (
        <UserOutlined
          style={style}
          className={cls(styles.iconItem, styles.iconItemUser, className)}
          onClick={() => onClick?.()}
        />
      )}
    </>
  );
};

export { IconCancel, IconDelete, IconDetail, IconEdit, IconUserOutlined };
