import { ProFormItemProps } from '@ant-design/pro-components';
import { Button, Divider, Input, InputRef, Select } from 'antd';

import React, { useEffect, useRef, useState } from 'react';
import styles from '../common.less';
interface ICustomSelect extends ProFormItemProps {
  initValue: string;
  valueEnum: any;
  filterList: any;
  onChange?: (value: any) => void;
  targetHandle?: () => void;
}
export default function CustomSelect({
  initValue,
  valueEnum,
  filterList,
  onChange,
  targetHandle,
}: ICustomSelect) {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState<string | undefined>(undefined);
  const [bol, setBol] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const inputRef = useRef<InputRef>(null);

  const addOptionsItem = (
    e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e?.preventDefault();
    const otherValues = inputValue.trim();
    if (!otherValues) {
      return;
    }
    setOpen(false);
    setBol(false);
    onChange?.(otherValues);
    setSelectValue(otherValues);
    targetHandle?.();
  };
  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const str = event.target.value;
    setInputValue(str.substring(0, 20));
  };
  useEffect(() => {
    const a: string[] = Object.keys(valueEnum);
    setOptions(a);
  }, [valueEnum]);

  useEffect(() => {
    setSelectValue(initValue);
  }, [initValue]);

  return (
    <Select
      style={{ width: '100%' }}
      open={open}
      value={selectValue}
      options={options.map((item) => ({
        label: item,
        value: item,
        disabled: filterList?.includes(item) && selectValue !== item,
      }))}
      onChange={(value) => {
        onChange?.(value);
        setSelectValue(value);
        targetHandle?.();
      }}
      placeholder="Please select"
      onDropdownVisibleChange={(visible) => {
        if (
          visible &&
          (inputValue || (selectValue && !options.includes(selectValue!)))
        ) {
          setInputValue(selectValue!);
          setBol(true);
        }
        if (!visible) {
          setInputValue('');
          setBol(false);
        }
        setOpen(visible);
      }}
      dropdownRender={(menu) => {
        return (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />

            {bol ? (
              <>
                <Input
                  className={styles.otherInput}
                  placeholder="Please enter item"
                  ref={inputRef}
                  value={inputValue}
                  onChange={onNameChange}
                  onPressEnter={() => {
                    addOptionsItem();
                  }}
                  //@ts-ignore
                  onBlur={addOptionsItem}
                />
                <Button
                  type="text"
                  //@ts-ignore
                  onClick={addOptionsItem}
                  className={styles.otherInputOk}
                  disabled={!inputValue}
                >
                  OK
                </Button>
              </>
            ) : (
              <span
                className={styles.other}
                onClick={() => {
                  setBol(true);
                }}
              >
                Other
              </span>
            )}
          </>
        );
      }}
    />
  );
}
