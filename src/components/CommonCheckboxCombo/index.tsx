import { Checkbox, CheckboxOptionType, CheckboxProps } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';

type IOption = CheckboxOptionType<any> | string | number;

export interface IProps {
  plainOptions: IOption[];
  value?: string[];
  onChange?: (value: IOption[]) => void;
}

const CommonCheckboxCombo: FC<IProps> = ({
  plainOptions,
  value = [],
  onChange,
}) => {
  const checkAll = plainOptions.length === value.length;
  const indeterminate = value.length > 0 && value.length < plainOptions.length;

  const onGroupChange = (list: string[]) => {
    onChange?.(list);
  };

  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    const values = plainOptions.map((option) => {
      if (typeof option === 'string' || typeof option === 'number') {
        return option;
      } else {
        return option.value;
      }
    });
    onChange?.(e.target.checked ? values : []);
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

export default CommonCheckboxCombo;
