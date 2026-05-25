import { PotentialVolumeFrequencyEnum } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { InputNumber, Select } from 'antd';
import cls from 'classnames';
import { FC, useEffect, useState } from 'react';
import styles from './index.less';
const { Option } = Select;

type IPotentialVolumeValue = {
  potentialVolumeQuantity?: number;
  potentialVolumeFrequency?: PotentialVolumeFrequencyEnum;
};
interface ICustomPotentialVolume {
  value?: IPotentialVolumeValue;
  readOnly?: boolean;
  onChange?: (obj?: IPotentialVolumeValue) => void;
}

const CustomPotentialVolume: FC<ICustomPotentialVolume> = ({
  value,
  onChange,
}) => {
  const [quantity, setQuantity] = useState<number>();
  const [frequency, setFrequency] = useState<PotentialVolumeFrequencyEnum>(
    PotentialVolumeFrequencyEnum.MONTHLY,
  );

  const triggerChange = (changedValue: {
    quantity?: number;
    frequency?: PotentialVolumeFrequencyEnum;
  }) => {
    const potentialVolumeQuantity = changedValue?.quantity;
    const potentialVolumeFrequency = changedValue?.frequency;

    if (potentialVolumeQuantity && potentialVolumeFrequency) {
      onChange?.({
        potentialVolumeQuantity,
        potentialVolumeFrequency,
      });
    } else {
      onChange?.();
    }
  };

  const onQuantityChange = (newQuantity: number | string | null) => {
    const newNumber = +newQuantity!;
    if (Number.isNaN(newNumber)) {
      return;
    }
    setQuantity(newNumber);
    triggerChange({
      quantity: newNumber,
      frequency: frequency ?? value?.potentialVolumeFrequency,
    });
  };

  const onFrequencyChange = (newFrequency: PotentialVolumeFrequencyEnum) => {
    setFrequency(newFrequency);
    triggerChange({
      frequency: newFrequency,
      quantity: quantity ?? value?.potentialVolumeQuantity,
    });
  };

  useEffect(() => {
    setQuantity(value?.potentialVolumeQuantity);
    if (value?.potentialVolumeFrequency) {
      setFrequency(value.potentialVolumeFrequency);
    }
  }, [value]);

  return (
    <>
      <div
        className={cls('custom-potential-volume', styles.customPotentialVolume)}
      >
        <InputNumber
          value={quantity}
          formatter={(v) => (v ? formatAmount(v) : '')}
          onChange={onQuantityChange}
          style={{ width: '100%' }}
          controls={false}
          min={1}
          max={99999999}
          placeholder="Please enter Potential Volume"
          addonBefore="Trips"
        />
        <Select
          className={styles.frequencySelect}
          value={frequency}
          style={{ width: 130 }}
          onChange={onFrequencyChange}
          placeholder="Please select"
          // allowClear
        >
          {Object.values(PotentialVolumeFrequencyEnum).map((item) => (
            <Option key={item} value={item}>
              {item}
            </Option>
          ))}
        </Select>
      </div>
    </>
  );
};

export default CustomPotentialVolume;
