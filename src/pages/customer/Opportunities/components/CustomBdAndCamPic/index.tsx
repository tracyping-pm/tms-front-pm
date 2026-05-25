import { PicTypeEnum, PicTypeEnumText } from '@/enums';
import { Radio, RadioChangeEvent, Select } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { FC, useEffect, useState } from 'react';
import styles from './index.less';

type IPotentialVolumeValue = {
  picType?: string;
  picUserRoleId?: number;
};
interface ICustomBdAndCamPic {
  value?: IPotentialVolumeValue;
  readOnly?: boolean;
  onChange?: (obj?: IPotentialVolumeValue) => void;
  bdPicOptions: DefaultOptionType[];
}

const CustomBdAndCamPic: FC<ICustomBdAndCamPic> = ({
  value,
  bdPicOptions,
  onChange,
}) => {
  const [picTypeValue, setPicTypeValue] = useState<string>();
  const [picIdValue, setPicIdValue] = useState<number>();
  const [picOptions, setPicOptions] = useState<DefaultOptionType[]>(
    bdPicOptions || [],
  );
  const [searchValue, setSearchValue] = useState('');
  const triggerChange = (changedValue: IPotentialVolumeValue) => {
    const picType = changedValue?.picType;
    const picUserRoleId = changedValue?.picUserRoleId;

    if (picType || picUserRoleId) {
      onChange?.({
        picType,
        picUserRoleId,
      });
    } else {
      onChange?.();
    }
  };

  const onPicTypeChange = (e: RadioChangeEvent) => {
    const newPicTypeValue = e.target.value;

    setPicTypeValue(newPicTypeValue);
    triggerChange({
      picType: newPicTypeValue,
      picUserRoleId: picIdValue ?? value?.picUserRoleId,
    });
  };

  const onPicIdChange = (newId: number) => {
    setPicIdValue(newId);
    triggerChange({
      picUserRoleId: newId,
      picType: picTypeValue ?? value?.picType,
    });
  };
  const highlightText = (text: string) => {
    if (!searchValue) return text;
    const parts = text.split(new RegExp(`(${searchValue})`, 'gi'));
    return parts.map((part: string, index: number) => {
      if (part.toLowerCase() === searchValue.toLowerCase()) {
        return (
          <span key={index} style={{ color: '#009688' }}>
            {part}
          </span>
        );
      } else {
        return part;
      }
    });
  };
  useEffect(() => {
    setPicOptions(bdPicOptions);
    if (!value) return;
    const { picType, picUserRoleId } = value;
    if (picType && picUserRoleId) {
      setPicTypeValue(picType);
      setPicIdValue(picUserRoleId);
    }
  }, [value, bdPicOptions]);

  return (
    <>
      <div className={styles.wrap}>
        <Radio.Group value={picTypeValue} onChange={onPicTypeChange}>
          <Radio value={PicTypeEnum.BD}>
            {PicTypeEnumText[PicTypeEnum.BD]}
          </Radio>
          <Radio value={PicTypeEnum.CAM}>
            {PicTypeEnumText[PicTypeEnum.CAM]}
          </Radio>
        </Radio.Group>

        <Select
          value={picIdValue}
          style={{ flex: 1 }}
          onChange={onPicIdChange}
          placeholder="BD/CAM PIC"
          options={picOptions}
          disabled={picOptions.length === 0 || !picTypeValue}
          loading={picOptions.length === 0}
          showSearch
          onSearch={(v) => {
            setSearchValue(v!);
          }}
          //@ts-ignore
          filterOption={(input: string, option: DefaultOptionType) => {
            return (
              (option?.label ?? '')
                //@ts-ignore
                .toLowerCase()
                .includes(input.toLowerCase())
            );
          }}
          optionRender={(option) => {
            return (
              <div className={styles.picOption}>
                <div
                  className={styles.picOptionLabel}
                  title={option.data.label as string}
                >
                  {highlightText(option.data.label as string)}
                </div>

                <div
                  className={styles.picOptionLabel}
                  title={option.data?.roleName}
                >
                  {option.data?.roleName}
                </div>
                <div
                  className={styles.picOptionLabel}
                  title={option.data.departmentName}
                >
                  {option.data.departmentName}
                </div>
              </div>
            );
          }}
        />
      </div>
    </>
  );
};

export default CustomBdAndCamPic;
