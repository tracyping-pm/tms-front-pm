import { Checkbox } from 'antd';
import { FC, useEffect, useState } from 'react';
import styles from './index.less';

const CheckboxGroup = Checkbox.Group;

interface ICustomCheckboxItemProps {
  customFieldName: string;
  options: any;
  value?: any[];
  onChange?: (value: any[]) => void;
  checkAllLabel?: string;
}

const CustomCheckboxItem: FC<ICustomCheckboxItemProps> = ({
  customFieldName,
  options,
  value = [],
  onChange,
  checkAllLabel = 'All',
}) => {
  const [checkedList, setCheckedList] = useState<any[]>(value);
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(false);

  const handleGroupChange = (list: any[]) => {
    const allValues = options.map((opt: { value: any }) => opt.value);
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < allValues.length);
    setCheckAll(list.length === allValues.length);

    onChange?.(list);
  };

  const handleCheckAllChange = (e: any) => {
    const checked = e.target.checked;
    const allValues = options.map((opt: { value: any }) => opt.value);
    const newList = checked ? allValues : [];
    setCheckedList(newList);
    setIndeterminate(false);
    setCheckAll(checked);
    onChange?.(newList);
  };

  useEffect(() => {
    const allValues = options.map((opt: { value: any }) => opt.value);

    setIndeterminate(!!value.length && value.length < allValues.length);
    setCheckAll(value.length === allValues.length);
  }, [value]);

  useEffect(() => {
    if (!!value.length) {
      setCheckedList(value);
    }
  }, [value]);

  return (
    <div
      className={styles.customExportFieldsItem}
      style={{
        width: options.length > 16 ? '610px' : '299px',
      }}
    >
      <div className={styles.customFieldsHeader}>
        <div className={styles.customFieldName}>{customFieldName}</div>

        <Checkbox
          indeterminate={indeterminate}
          onChange={handleCheckAllChange}
          checked={checkAll}
        >
          {checkAllLabel}
        </Checkbox>
      </div>

      <CheckboxGroup
        className={styles.customExportFieldsItemCheckboxGroup}
        options={options}
        value={checkedList}
        onChange={handleGroupChange}
      />
    </div>
  );
};

export default CustomCheckboxItem;
