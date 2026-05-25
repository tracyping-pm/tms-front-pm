import FuzzySelector from '@/components/FuzzySelector';
import { ES_DTO_CLASS, LogisticsCategoryOptions } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { DatePicker, Form, FormInstance, Select, Space, Switch } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { FC, forwardRef, useImperativeHandle } from 'react';
import { DATE_WIDTH, DEFAULT_WIDTH, IFE_NEED } from './constant';
import styles from './index.less';

const { RangePicker } = DatePicker;

export interface IProps {
  useInDetail: boolean;
  form: FormInstance;
  ref?: any;
}

const OtherInfoFilter: FC<IProps> = forwardRef(({ useInDetail, form }, ref) => {
  const doFill = (FE_NEED: IFE_NEED) => {
    if (FE_NEED.projectIdList && FE_NEED.projectIdList?.length > 0) {
      form.setFieldsValue({ projectIdList: FE_NEED.projectIdList });
      // setProjectNameValue(FE_NEED.projectIdList);
    }

    form.setFieldsValue({
      projectNameInclude:
        FE_NEED.include === undefined ? true : FE_NEED.include,
    });

    if (FE_NEED.podNumber) {
      form.setFieldsValue({ podNumber: FE_NEED.podNumber });
    }

    if (FE_NEED.logisticsCategory) {
      form.setFieldsValue({ logisticsCategory: FE_NEED.logisticsCategory });
    }

    if (FE_NEED.creationTimeStart && FE_NEED.creationTimeEnd) {
      const creationTime = [
        dayjs(FE_NEED.creationTimeStart),
        dayjs(FE_NEED.creationTimeEnd),
      ];
      form.setFieldsValue({ creationTime: creationTime });
    }

    if (FE_NEED.destinationTimeStart && FE_NEED.destinationTimeEnd) {
      const destinationTime = [
        dayjs(FE_NEED.destinationTimeStart),
        dayjs(FE_NEED.destinationTimeEnd),
      ];
      form.setFieldsValue({ destinationTime: destinationTime });
    }
  };

  useImperativeHandle(ref, () => ({
    doFill: (FE_NEED: IFE_NEED) => doFill(FE_NEED),
  }));

  return (
    <>
      <div className={cls('normal-filter', styles.normalFilter)}>
        {!useInDetail && (
          <div className="normal-item" style={{ width: DATE_WIDTH }}>
            {/* <Form.Item name={'projectIdList'} label={null} noStyle>
              <Select
                {...projectNameDefaultFieldProps}
                placeholder="Project Name"
                options={projectNameOptions}
                onSearch={projectNameSearch}
                value={projectNameValue}
                maxTagCount="responsive"
                style={{ width: '100%' }}
              />
            </Form.Item> */}

            <Space.Compact>
              <div className={styles.customSwitch}>
                <Form.Item name={'projectNameInclude'} label={null} noStyle>
                  <Switch
                    style={{ width: 80, alignSelf: 'center' }}
                    checkedChildren="Include"
                    unCheckedChildren="Exclude"
                  />
                </Form.Item>
              </div>
              <Form.Item name={'projectIdList'} label={null} noStyle>
                <FuzzySelector
                  fieldProps={{
                    placeholder: 'Project Name',
                    maxTagCount: 'responsive',
                    mode: 'multiple',
                    style: { width: 352 },
                  }}
                  request={{
                    field: 'projectName',
                    esDtoClass: ES_DTO_CLASS.PROJECT,
                    type: FieldQueryHighlightTypeEnum.USER_ROLE,
                  }}
                />
              </Form.Item>
            </Space.Compact>
          </div>
        )}
        {/* <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'podNumber'} label={null} noStyle>
            <Input
              placeholder="POD Number"
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div> */}
        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'logisticsCategory'} label={null} noStyle>
            <Select
              placeholder="Logistics Category"
              options={LogisticsCategoryOptions}
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
        <div className="normal-item" style={{ width: DATE_WIDTH }}>
          <Form.Item name={'creationTime'} label={null} noStyle>
            <RangePicker
              placeholder={['Creation Time Start', 'Creation Time End']}
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DATE_WIDTH }}>
          <Form.Item name={'destinationTime'} label={null} noStyle>
            <RangePicker
              placeholder={[
                'Required Delivery Time Start',
                'Required Delivery Time End',
              ]}
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
      </div>
    </>
  );
});

export default OtherInfoFilter;
