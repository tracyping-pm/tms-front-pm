import { useSetState } from 'ahooks';
import { Button, Divider, Space } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect } from 'react';
import TableDropdown, { ItemType } from '../TableDropdown';
import styles from './index.less';

const BUTTON_STYLE = {
  padding: 0,
  margin: 0,
};

enum TypeEnum {
  LIST = 'LIST',
  DROPDOWN = 'DROPDOWN',
}

interface IState {
  list: ItemType[];
  menu: ItemType[];
  type: TypeEnum;
}

const initialState: IState = {
  list: [],
  menu: [],
  type: TypeEnum.LIST,
};

interface IProps {
  list: ItemType[];
  deformationLen?: number;
  onTrigger?: (item: ItemType) => Promise<any> | void;
  onDropdownOpenHandle?: (v: boolean) => void;
}

const TableOperation: FC<IProps> = ({
  list = [],
  deformationLen = 3,
  onTrigger,
  onDropdownOpenHandle,
}) => {
  const [state, setState] = useSetState<IState>(initialState);

  const onClick = useCallback((item: ItemType) => {
    return onTrigger?.(item);
  }, []);

  const onDropdownSelect = useCallback((item: ItemType) => {
    return onTrigger?.(item);
  }, []);

  useEffect(() => {
    const len = list.length;
    if (len <= deformationLen) {
      setState({ type: TypeEnum.LIST, list: list, menu: [] });
    } else {
      setState({
        type: TypeEnum.DROPDOWN,
        list: list.slice(0, deformationLen - 1),
        menu: list.slice(deformationLen - 1),
      });
    }
  }, [list, deformationLen]);

  return (
    <div className={cls('table-operation', styles.tableOperation)}>
      <Space align="center" size={0}>
        {state.list.map((item, index) => (
          <Space key={item.key} align="center" size={0}>
            {item.render ? (
              item.render?.()
            ) : (
              <Button
                style={BUTTON_STYLE}
                icon={item.icon}
                type="link"
                loading={item.loading}
                onClick={() => onClick(item)}
                disabled={item?.disabled}
              >
                {item.label}
              </Button>
            )}

            {index === state.list.length - 1 &&
            state.type === TypeEnum.LIST ? null : (
              <Divider type="vertical" />
            )}
          </Space>
        ))}
        {state.type === TypeEnum.DROPDOWN && (
          <TableDropdown
            menu={state.menu}
            onSelect={onDropdownSelect}
            onDropdownOpenHandle={onDropdownOpenHandle}
          />
        )}
      </Space>
    </div>
  );
};

export default TableOperation;
