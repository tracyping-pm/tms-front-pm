import { useSetState } from 'ahooks';
import { Dropdown, Select } from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import { FC, useEffect } from 'react';
import RegionDropdown from './RegionDropdown';
import styles from './index.less';

interface IState {
  dropOpen: boolean;
  innerValue: string | undefined;
  focused: boolean;
}

const defaultState: IState = {
  dropOpen: false,
  innerValue: undefined,
  focused: false,
};

interface IProps {
  value?: any;
  width?: number;
  placeholder?: string;
  noAllRegion?: boolean;
  showAddress?: boolean;
  onChange?: (value?: string) => void;
}

const RegionSelect: FC<IProps> = ({
  width = 216,
  value,
  placeholder = 'Origin Region',
  noAllRegion = false,
  showAddress = true,
  onChange,
}) => {
  const [state, setState] = useSetState<IState>(defaultState);
  const onFocus = () => {
    // setState({ focused: true });
  };

  const onBlur = () => {
    // setState({ focused: false });
  };

  const onClear = () => {
    setState({ innerValue: undefined });
    onChange?.(undefined);
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      setState({ dropOpen: true });
    } else {
      setState({ dropOpen: false });
    }
  };

  const onClose = () => {
    setState({ dropOpen: false });
  };

  const onConfirm = (values: any) => {
    onOpenChange(false);
    const { padName, sadName, tadName } = values;
    const valueArr = [padName, sadName, tadName].filter(Boolean);
    const innerValue = valueArr.join(', ');
    setState({ innerValue });
    onChange?.(values);
  };

  useEffect(() => {
    if (!_.isEmpty(value)) {
      const { padName, sadName, tadName } = value;
      const valueArr = [padName, sadName, tadName].filter(Boolean);
      const valueStr = valueArr.join(', ') || undefined;
      setState({ innerValue: valueStr });
    } else {
      setState({ innerValue: undefined });
    }
  }, [value]);

  return (
    <>
      <div className={cls(styles.regionSelect, 'regionSelect')}>
        <Dropdown
          open={state.dropOpen}
          trigger={['click']}
          onOpenChange={onOpenChange}
          dropdownRender={() => (
            <RegionDropdown
              noAllRegion={noAllRegion}
              showAddress={showAddress}
              width={width}
              onCancel={onClose}
              onConfirm={onConfirm}
              value={state.innerValue ? value : undefined}
            />
          )}
        >
          <Select
            className={cls({
              ['ant-select-focused']: state.dropOpen,
            })}
            style={{ width: `${width}px` }}
            dropdownStyle={{ display: 'none' }}
            placeholder={placeholder}
            allowClear={!!state.innerValue}
            value={state.innerValue}
            onFocus={onFocus}
            onBlur={onBlur}
            onClear={onClear}
          ></Select>
        </Dropdown>
      </div>
    </>
  );
};

export default RegionSelect;
