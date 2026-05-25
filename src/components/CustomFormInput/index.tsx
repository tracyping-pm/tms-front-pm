import { formatString } from '@/utils/format';
import { formatAmount } from '@/utils/utils';
import { Input, InputProps } from 'antd';
import cls from 'classnames';
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import styles from './index.less';

const REGEX = /^\s*$/;

export type ICustomFormInput = {
  value?: string;
  readOnly?: boolean;
  isFormatter?: boolean;
  onChange?: (formatValue: string) => void;
} & Omit<InputProps, 'onChange'>;

const CustomFormInput: FC<ICustomFormInput> = ({
  allowClear = true,
  value,
  readOnly = false,
  isFormatter = false,
  onChange,
  ...rest
}) => {
  const [inputText, setInputText] = useState<string>();
  const onceFlagRef = useRef<boolean>(true);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const _inputText = e.target.value;
    const formatValue = formatString(_inputText);
    // console.log({ _inputText, formatValue });

    setInputText(_inputText);

    if (REGEX.test(_inputText)) {
      onChange?.(_inputText);
    } else {
      onChange?.(formatValue);
    }
  };

  useEffect(() => {
    if (onceFlagRef.current && value !== inputText && value && !inputText) {
      setInputText(value);
      // hack 默认值
      onceFlagRef.current = false;
    }
  }, [value, inputText]);

  return (
    <>
      <div className={cls('custom-form-input', styles.customFormInput)}>
        {readOnly ? (
          isFormatter ? (
            formatAmount(+value!)
          ) : (
            (value ?? '-')
          )
        ) : (
          <Input
            allowClear={allowClear}
            // defaultValue={value}
            value={inputText}
            onChange={handleChange}
            {...rest}
          />
        )}
      </div>
    </>
  );
};

export default CustomFormInput;
