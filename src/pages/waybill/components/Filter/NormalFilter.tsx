import NumberRangeSelect from '@/components/NumberRangeSelect';
import { ES_DTO_CLASS } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { useMultipleFieldQuery } from '@/hooks/useMultipleFieldQuery';
import { DatePicker, Form, FormInstance, Input, Select } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { FC, forwardRef, useImperativeHandle } from 'react';
import {
  DATE_WIDTH,
  DATE_WIDTH2,
  DEFAULT_WIDTH,
  IFE_NEED,
  dispatchTypeOptions,
} from './constant';
import styles from './index.less';

const { RangePicker } = DatePicker;

export interface IProps {
  useInDetail: boolean;
  form: FormInstance;
  ref?: any;
}

const NormalFilter: FC<IProps> = forwardRef(({ useInDetail, form }, ref) => {
  const {
    options: waybillNumberOptions,
    onSearch: waybillNumberSearch,
    defaultFieldProps: waybillNumberDefaultFieldProps,
    value: waybillNumberValue,
    setValue: setWaybillNumberValue,
  } = useFieldQuery({
    field: 'waybillNumber',
    esDtoClass: ES_DTO_CLASS.WAYBILL,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const {
    options: customerNameOptions,
    onSearch: customerNameSearch,
    defaultFieldProps: customerNameDefaultFieldProps,
    value: customerNameValue,
    setValue: setCustomerNameValue,
  } = useMultipleFieldQuery({
    field: 'customerName',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const {
    options: customerTagOptions,
    onSearch: customerTagSearch,
    defaultFieldProps: customerTagDefaultFieldProps,
    value: customerTagValue,
    setValue: setCustomerTagValue,
  } = useMultipleFieldQuery({
    field: 'customerTag',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const doFill = (FE_NEED: IFE_NEED) => {
    if (FE_NEED.waybillId) {
      form.setFieldsValue({ waybillId: FE_NEED.waybillId });
      setWaybillNumberValue(FE_NEED.waybillId.title);
    }

    if (FE_NEED.customerNameIdList && FE_NEED.customerNameIdList?.length > 0) {
      form.setFieldsValue({ customerNameIdList: FE_NEED.customerNameIdList });
      setCustomerNameValue(FE_NEED.customerNameIdList);
    }

    if (FE_NEED.customerTagIdList && FE_NEED.customerTagIdList?.length > 0) {
      form.setFieldsValue({ customerTagIdList: FE_NEED.customerTagIdList });
      setCustomerTagValue(FE_NEED.customerTagIdList);
    }

    if (FE_NEED.positionTimeStart && FE_NEED.positionTimeEnd) {
      const positionTime = [
        dayjs(FE_NEED.positionTimeStart),
        dayjs(FE_NEED.positionTimeEnd),
      ];
      form.setFieldsValue({ positionTime });
    }

    if (
      FE_NEED.unloadingCompletionTimeStart &&
      FE_NEED.unloadingCompletionTimeEnd
    ) {
      const unloadingCompletionTime = [
        dayjs(FE_NEED.unloadingCompletionTimeStart),
        dayjs(FE_NEED.unloadingCompletionTimeEnd),
      ];
      form.setFieldsValue({ unloadingCompletionTime });
    }

    if (FE_NEED.dispatchType) {
      form.setFieldsValue({ dispatchType: FE_NEED.dispatchType });
    }

    if (FE_NEED.customerCode) {
      form.setFieldsValue({ customerCode: FE_NEED.customerCode });
    }

    if (FE_NEED.riskLevelObj) {
      form.setFieldsValue({ riskLevelObj: FE_NEED.riskLevelObj });
    }
  };

  useImperativeHandle(ref, () => ({
    doFill: (FE_NEED: IFE_NEED) => doFill(FE_NEED),
  }));

  return (
    <>
      <div className={cls('normal-filter', styles.normalFilter)}>
        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'waybillId'} label={null} noStyle>
            <Select
              {...waybillNumberDefaultFieldProps}
              placeholder="Waybill Number"
              options={waybillNumberOptions}
              onSearch={waybillNumberSearch}
              value={waybillNumberValue}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        {!useInDetail && (
          <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
            <Form.Item name={'customerNameIdList'} label={null} noStyle>
              <Select
                {...customerNameDefaultFieldProps}
                placeholder="Customer Name"
                options={customerNameOptions}
                onSearch={customerNameSearch}
                value={customerNameValue}
                maxTagCount="responsive"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        )}

        {!useInDetail && (
          <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
            <Form.Item name={'customerTagIdList'} label={null} noStyle>
              <Select
                {...customerTagDefaultFieldProps}
                placeholder="Customer Tag"
                options={customerTagOptions}
                onSearch={customerTagSearch}
                value={customerTagValue}
                maxTagCount="responsive"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
        )}

        <div className="normal-item" style={{ width: DATE_WIDTH }}>
          <Form.Item name={'positionTime'} label={null} noStyle>
            <RangePicker
              placeholder={['Position Time Start', 'Position Time End']}
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'riskLevelObj'} label={null} noStyle>
            <NumberRangeSelect
              placeholder="Risk Level"
              style={{ width: DEFAULT_WIDTH }}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DATE_WIDTH2 }}>
          <Form.Item name={'unloadingCompletionTime'} label={null} noStyle>
            <RangePicker
              placeholder={['Unloading Time Start', 'Unloading Time End']}
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'dispatchType'} label={null} noStyle>
            <Select
              placeholder="Dispatch Type"
              options={dispatchTypeOptions}
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'customerCode'} label={null} noStyle>
            <Input
              placeholder="Customer Code"
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
      </div>
    </>
  );
});

export default NormalFilter;
