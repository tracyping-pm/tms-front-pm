import { EllipsisOutlined, LoadingOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import cls from 'classnames';
import React, { FC, ReactNode, useCallback, useState } from 'react';
import styles from './index.less';

export interface ItemType {
  key: string | number;
  label: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  render?: () => ReactNode;
}

interface IProps {
  menu: ItemType[];
  onSelect?: (item: ItemType) => Promise<any> | void;
  onDropdownOpenHandle?: (v: boolean) => void;
}

const TableDropdown: FC<IProps> = ({
  menu,
  onSelect,
  onDropdownOpenHandle,
}) => {
  const [open, setOpen] = useState(false);

  const onOpenChange = useCallback((val: boolean) => {
    setOpen(val);
    onDropdownOpenHandle?.(val);
  }, []);

  const handleItemClick = useCallback((item: ItemType) => {
    onSelect?.(item)
      ?.then?.(() => {
        setOpen(false);
      })
      ?.catch?.(() => {
        setOpen(false);
      });
  }, []);

  return (
    <Dropdown
      rootClassName={cls('dropdown-operation', styles.dropdownOperation)}
      onOpenChange={onOpenChange}
      open={open}
      destroyPopupOnHide={true}
      dropdownRender={() => (
        <div className={cls('dropdownRender', styles.dropdownRender)}>
          {menu.map((item) => {
            return item.render ? (
              item.render()
            ) : (
              <div
                key={item.key}
                className="dropdown-item"
                title={item.title}
                onClick={() => handleItemClick(item)}
              >
                <Space size={8}>
                  {item.loading ? <LoadingOutlined /> : item.icon}
                  {item.label}
                </Space>
              </div>
            );
          })}
        </div>
      )}
    >
      <div className={cls('more', styles.more)}>
        <EllipsisOutlined />
      </div>
    </Dropdown>
  );
};

export default TableDropdown;
