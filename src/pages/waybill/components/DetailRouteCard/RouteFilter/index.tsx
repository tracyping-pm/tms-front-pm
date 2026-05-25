import CustomTooltip from '@/components/CustomTooltip';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import cls from 'classnames';
import _ from 'lodash';
import { FC, useCallback, useEffect, useRef } from 'react';
import styles from './index.less';

const options = [
  { label: 'Allow', value: 'Allow' },
  { label: 'Avoid', value: 'Avoid' },
];

const initialValues = {
  highways: 'Allow',
  ferries: 'Allow',
  tolls: 'Allow',
};

const tipStyle = {
  fontSize: '12px',
  color: '#fff',
};

const formList = [
  {
    label: 'Highways',
    name: 'highways',
    tooltip: (
      <div style={tipStyle}>
        <div>
          When this option is enabled, Google Maps will prioritize using
          highways
        </div>
        <div>
          as part of your route. This usually offers a faster travel experience,
        </div>
        <div>
          especially for long-distance journeys. However, highways can be prone
          to
        </div>
        <div>traffic congestion during peak hours.</div>
      </div>
    ),
    options: options,
  },
  {
    label: 'Ferries',
    name: 'ferries',
    tooltip: (
      <div style={tipStyle}>
        <div>
          Activating this option means your route may include ferry crossings.
        </div>
        <div>
          This is useful for journeys that need to cross bodies of water.
        </div>
        <div>However, using ferries might require extra time and costs,</div>
        <div>and can be subject to weather and seasonal variations.</div>
      </div>
    ),
    options: options,
  },
  {
    label: 'Tolls',
    name: 'tolls',
    tooltip: (
      <div style={tipStyle}>
        <div>
          Selecting this option means your route may include toll roads.
        </div>
        <div>
          This is often used to save time or find a more direct path. However,
        </div>
        <div>be aware that this might result in additional costs.</div>
      </div>
    ),
    options: options,
  },
];

interface IProps {
  defaultValue?: any;
  disabled?: boolean;
  onChange?: (value: any) => void;
}

const RouteFilter: FC<IProps> = ({
  defaultValue = initialValues,
  disabled = false,
  onChange,
}) => {
  const filterFormRef = useRef<ProFormInstance>();

  const onFieldChange = useCallback((fieldName: string, value: any) => {
    console.log(fieldName, value);
    const fieldsValue = filterFormRef.current?.getFieldsValue();
    onChange?.(fieldsValue);
  }, []);

  useEffect(() => {
    if (_.isEmpty(defaultValue)) {
      return;
    }
    filterFormRef.current?.setFieldsValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    // 默认触发一次
    const fieldsValue = filterFormRef.current?.getFieldsValue();
    onChange?.(fieldsValue);
  }, []);

  return (
    <>
      <div className={cls(styles.routeFilter, 'routeFilter')}>
        <ProForm
          submitter={false}
          formRef={filterFormRef}
          initialValues={initialValues}
        >
          {formList.map((item) => (
            <div key={item.name} className="formItem">
              <span className="label">
                {item.label}
                <CustomTooltip placement="top" title={item.tooltip}>
                  <QuestionCircleOutlined className="icon" />
                </CustomTooltip>
              </span>
              <ProFormSelect
                noStyle
                className="select"
                name={item.name}
                label={null}
                placeholder={'Please select'}
                fieldProps={{
                  disabled: disabled,
                  options: item.options,
                  allowClear: false,
                  onChange: (value) => {
                    onFieldChange(item.name, value);
                  },
                }}
              />
            </div>
          ))}
        </ProForm>
      </div>
    </>
  );
};

export default RouteFilter;
