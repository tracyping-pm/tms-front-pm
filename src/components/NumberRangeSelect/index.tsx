import { formatAmount } from '@/utils/utils';
import { Dropdown, InputNumber, Select } from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './index.less';

const SYMBOL_ZERO = '0';
const SYMBOL_INFINITE = '∞';

export interface INumberRange {
  min?: number;
  max?: number;
}

export const DEFAULT_RANGE = {
  min: 0,
  max: Infinity,
};

interface IProps {
  placeholder?: string;
  precision?: number;
  style?: React.CSSProperties;
  value?: INumberRange;
  onChange?: (val?: INumberRange) => void;
}

const NumberRangeSelect: FC<IProps> = ({
  placeholder = 'placeholder',
  precision = 0,
  style,
  value,
  onChange,
}) => {
  const [selectText, setSelectText] = useState<string>();
  const [innerValue, setInnerValue] = useState<INumberRange>(DEFAULT_RANGE);
  const [dropOpen, setDropOpen] = useState(false);

  const onClear = () => {
    setInnerValue(DEFAULT_RANGE);
    setSelectText(undefined);
    onChange?.(undefined);
    // setDropOpen(false);
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      setDropOpen(true);
    } else {
      setDropOpen(false);
    }
  };

  const onInputChange = useCallback((_value: INumberRange) => {
    const _innerValue = _.merge({}, DEFAULT_RANGE, _value);
    setInnerValue(_innerValue);
  }, []);

  const onInputBlur = useCallback(() => {
    const _innerValue = _.cloneDeep(innerValue);
    const { min, max } = _innerValue;

    if (min && max && max < min) {
      _innerValue.min = max;
      _innerValue.max = min;
    }
    setInnerValue(_innerValue);
    onChange?.(_innerValue);
  }, [innerValue]);

  const getSelectText = (_value: INumberRange) => {
    const { min, max } = _value;
    if (min === 0 && (max === Infinity || max === undefined || max === null)) {
      return undefined;
    }

    const minStr = min && min !== 0 ? formatAmount(min) : SYMBOL_ZERO;
    const maxStr =
      max && max !== Infinity ? formatAmount(max) : SYMBOL_INFINITE;
    return `${minStr} — ${maxStr}`;
  };

  useEffect(() => {
    const _innerValue = _.merge({}, DEFAULT_RANGE, value);
    setInnerValue(_innerValue);

    if (value) {
      setSelectText(getSelectText(value));
    } else {
      setSelectText(undefined);
    }
  }, [value]);

  return (
    <>
      <Dropdown
        open={dropOpen}
        onOpenChange={onOpenChange}
        trigger={['click']}
        dropdownRender={() => (
          <div
            className={styles.dropdownRender}
            style={{ width: style?.width }}
          >
            <InputNumber
              placeholder="min"
              min={0}
              max={Infinity}
              precision={precision}
              controls={false}
              style={{ minWidth: '40px' }}
              value={innerValue.min}
              formatter={(val) => (val ? formatAmount(val) : SYMBOL_ZERO)}
              onChange={(val: number | null) => {
                onInputChange({
                  ...innerValue,
                  min: val ?? 0,
                });
              }}
              onBlur={onInputBlur}
            />

            <span className={styles.to}>To</span>
            <InputNumber
              placeholder="max"
              min={0}
              max={Infinity}
              precision={precision}
              style={{ minWidth: '30px' }}
              controls={false}
              formatter={(val) => {
                return val && String(val) !== String(Infinity)
                  ? formatAmount(val)
                  : '';
              }}
              value={innerValue.max === Infinity ? null : innerValue.max}
              onChange={(val: number | null) => {
                onInputChange({
                  ...innerValue,
                  max: val ?? Infinity,
                });
              }}
              onBlur={onInputBlur}
            />
          </div>
        )}
      >
        <Select
          style={style}
          className={cls({
            ['ant-select-focused']: dropOpen,
          })}
          allowClear={!!selectText}
          placeholder={placeholder}
          dropdownStyle={{ display: 'none' }}
          value={selectText}
          onClear={onClear}
        />
      </Dropdown>
    </>
  );
};

export default NumberRangeSelect;
