import RegionSelect from '@/components/RegionSelect';
import { Form, FormInstance, Input } from 'antd';
import cls from 'classnames';
import { FC, forwardRef, useImperativeHandle } from 'react';
import { DEFAULT_WIDTH, IFE_NEED } from './constant';
import styles from './index.less';

export interface IProps {
  form: FormInstance;
  ref?: any;
}

const RouteInfoFilter: FC<IProps> = forwardRef(({ form }, ref) => {
  const doFill = (FE_NEED: IFE_NEED) => {
    if (FE_NEED.originRegion) {
      form.setFieldsValue({ originRegion: FE_NEED.originRegion });
    }

    if (FE_NEED.originLabel) {
      form.setFieldsValue({ originLabel: FE_NEED.originLabel });
    }

    if (FE_NEED.destinationRegion) {
      form.setFieldsValue({ destinationRegion: FE_NEED.destinationRegion });
    }

    if (FE_NEED.destinationLabel) {
      form.setFieldsValue({ destinationLabel: FE_NEED.destinationLabel });
    }
  };

  useImperativeHandle(ref, () => ({
    doFill: (FE_NEED: IFE_NEED) => doFill(FE_NEED),
  }));

  return (
    <>
      <div className={cls('normal-filter', styles.normalFilter)}>
        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'originRegion'} label={null} noStyle>
            <RegionSelect
              width={DEFAULT_WIDTH}
              placeholder="Origin Region"
              noAllRegion={true}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'originLabel'} label={null} noStyle>
            <Input
              placeholder="Origin Label"
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'destinationRegion'} label={null} noStyle>
            <RegionSelect
              width={DEFAULT_WIDTH}
              placeholder="Destination Region"
              noAllRegion={false}
            />
          </Form.Item>
        </div>

        <div className="normal-item" style={{ width: DEFAULT_WIDTH }}>
          <Form.Item name={'destinationLabel'} label={null} noStyle>
            <Input
              placeholder="Destination Label"
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </div>
      </div>
    </>
  );
});

export default RouteInfoFilter;
