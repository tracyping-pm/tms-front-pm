import { getTruckTypeList } from '@/api/truck';
import { ITruckTypeListItem } from '@/api/types/truck';
import { ES_DTO_CLASS } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { useMultipleFieldQuery } from '@/hooks/useMultipleFieldQuery';
import { Form, FormInstance, Select } from 'antd';
import cls from 'classnames';
import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  DEFAULT_WIDTH,
  IFE_NEED,
  truckTypeConsistencyOptions,
} from './constant';
import styles from './index.less';

export interface IProps {
  form: FormInstance;
  ref?: any;
}

const VendorInfoFilter: FC<IProps> = forwardRef(({ form }, ref) => {
  const [truckTypeList, setTruckTypeList] = useState<
    { label: string; value: number }[]
  >([]);
  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
    value: vendorNameValue,
    setValue: setVendorNameValue,
  } = useMultipleFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: driverNameOptions,
    onSearch: driverNameSearch,
    defaultFieldProps: driverNameDefaultFieldProps,
    value: driverNameValue,
    setValue: setDriverNameValue,
  } = useMultipleFieldQuery({
    field: 'name',
    esDtoClass: ES_DTO_CLASS.CREW,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: plateNumberOptions,
    onSearch: plateNumberSearch,
    defaultFieldProps: plateNumberDefaultFieldProps,
    value: plateNumberValue,
    setValue: setPlateNumberValue,
  } = useFieldQuery({
    field: 'plateNumber',
    esDtoClass: ES_DTO_CLASS.TRUCK,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const doFill = (FE_NEED: IFE_NEED) => {
    if (FE_NEED.vendorIdList && FE_NEED.vendorIdList?.length > 0) {
      form.setFieldsValue({ vendorIdList: FE_NEED.vendorIdList });
      setVendorNameValue(FE_NEED.vendorIdList);
    }

    if (FE_NEED.driverNameList && FE_NEED.driverNameList?.length > 0) {
      form.setFieldsValue({ driverNameList: FE_NEED.driverNameList });
      setDriverNameValue(FE_NEED.driverNameList);
    }

    if (FE_NEED.truckId) {
      form.setFieldsValue({ truckId: FE_NEED.truckId });
      setPlateNumberValue(FE_NEED.truckId.title);
    }

    if (FE_NEED.truckTypeConsistency) {
      form.setFieldsValue({
        truckTypeConsistency: FE_NEED.truckTypeConsistency,
      });
    }
    if (FE_NEED.truckTypeIdList) {
      form.setFieldsValue({
        truckTypeIdList: FE_NEED.truckTypeIdList,
      });
    }
  };

  const onTruckTypeOption = async () => {
    const res = await getTruckTypeList();
    if (res.code === 200) {
      const list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setTruckTypeList(list);
    }
  };

  useImperativeHandle(ref, () => ({
    doFill: (FE_NEED: IFE_NEED) => doFill(FE_NEED),
  }));

  useEffect(() => {
    onTruckTypeOption();
  }, []);

  return (
    <>
      <div className={cls('normal-filter', styles.normalFilter)}>
        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'vendorIdList'} label={null} noStyle>
            <Select
              {...vendorNameDefaultFieldProps}
              placeholder="Vendor Name"
              options={vendorNameOptions}
              onSearch={vendorNameSearch}
              value={vendorNameValue}
              maxTagCount="responsive"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'driverNameList'} label={null} noStyle>
            <Select
              {...driverNameDefaultFieldProps}
              placeholder="Driver Name"
              options={driverNameOptions}
              onSearch={driverNameSearch}
              value={driverNameValue}
              maxTagCount="responsive"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'truckId'} label={null} noStyle>
            <Select
              {...plateNumberDefaultFieldProps}
              placeholder="Plate Number"
              options={plateNumberOptions}
              onSearch={plateNumberSearch}
              value={plateNumberValue}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'truckTypeConsistency'} label={null} noStyle>
            <Select
              placeholder="Truck Type Consistency"
              options={truckTypeConsistencyOptions}
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'truckTypeIdList'} label={null} noStyle>
            <Select
              mode="multiple"
              placeholder="Actual Truck Type"
              maxTagCount={3}
              allowClear
              style={{ width: '100%' }}
              options={truckTypeList}
              showSearch
              //@ts-ignore
              filterOption={(input: string, option: { label: string }) => {
                return (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
            />
          </Form.Item>
        </div>
      </div>
    </>
  );
});

export default VendorInfoFilter;
