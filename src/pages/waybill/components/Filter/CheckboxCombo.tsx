import { Checkbox, CheckboxProps } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';

export interface IProps {
  plainOptions: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
}

const CheckboxCombo: FC<IProps> = ({ plainOptions, value = [], onChange }) => {
  const checkAll = plainOptions.length === value.length;
  const indeterminate = value.length > 0 && value.length < plainOptions.length;

  const onGroupChange = (list: string[]) => {
    onChange?.(list);
  };

  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    onChange?.(e.target.checked ? plainOptions : []);
  };

  return (
    <>
      <div className={cls('checkbox-combo', styles.checkboxCombo)}>
        <span>
          <Checkbox
            indeterminate={indeterminate}
            onChange={onCheckAllChange}
            checked={checkAll}
          >
            All
          </Checkbox>
        </span>
        <Checkbox.Group
          className="custom-checkbox-group"
          options={plainOptions}
          value={value}
          onChange={onGroupChange}
        />
      </div>
    </>
  );
};

export default CheckboxCombo;
