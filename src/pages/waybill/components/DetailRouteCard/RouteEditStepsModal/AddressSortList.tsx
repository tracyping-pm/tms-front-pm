import { IRouteOriginAndDestinationListItem } from '@/api/types/waybill';
import { waybillRouteAddressCheck } from '@/api/waybill';
import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';
import { IMeta } from '@/components/LocatorModal';
import { IconDelete } from '@/components/OperationIcon';
import { DoubleLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { App, Divider, Form } from 'antd';
import cls from 'classnames';
import { default as lodash } from 'lodash';
import {
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import styles from './styles.less';

interface ISortIcon {
  disable?: boolean;
}
const SortIconTop: FC<ISortIcon> = ({ disable = false }) => {
  // 顺时针旋转90度 DoubleLeftOutlined
  return (
    <DoubleLeftOutlined
      className={cls(styles.sortIconTop, disable && styles.sortIconDisabled)}
    />
  );
};

const SortIconBottom: FC<ISortIcon> = ({ disable = false }) => {
  // 逆时针旋转90度 DoubleLeftOutlined
  return (
    <DoubleLeftOutlined
      className={cls(styles.sortIconBottom, disable && styles.sortIconDisabled)}
    />
  );
};

interface IAddressSortList {
  formName?: string;
  ref: any;
  list: IRouteOriginAndDestinationListItem[];
  updateTrigger: (v: IRouteOriginAndDestinationListItem[]) => void;
  deleteTrigger: (v: IRouteOriginAndDestinationListItem) => void;
  setPageLoading: (loading: boolean) => void;
}

const AddressSortList: FC<IAddressSortList> = forwardRef((props, ref) => {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [innerList, setInnerList] = useState<
    IRouteOriginAndDestinationListItem[]
  >([]);

  const update = useCallback(
    (newList: IRouteOriginAndDestinationListItem[]) => {
      form?.setFieldsValue({ pointList: newList });
      setInnerList(newList);
    },
    [],
  );

  const buildTitle = useCallback(
    (item: IRouteOriginAndDestinationListItem) => {
      const stopPoints = lodash.filter(innerList, (x) => {
        return x.isStop === true;
      });

      const normalPoints = lodash.filter(innerList, (x) => {
        return (
          x.isStop === false || x.isStop === undefined || x.isStop === null
        );
      });

      let title = '';
      let index = 0;

      if (item.isStop) {
        title = 'Stop Point';
        const offsetIndex = lodash.findIndex(stopPoints, (x) => {
          return x.vid === item.vid;
        });
        index = offsetIndex + 1;
      } else {
        const offsetIndex = lodash.findIndex(normalPoints, (x) => {
          return x.vid === item.vid;
        });
        index = offsetIndex + 1;

        if (props.formName === 'originList') {
          title = 'Origin Point';
        } else {
          title = 'Destination Point';
        }
      }

      return title + index;
    },
    [innerList],
  );

  const formatItem = useCallback(
    (idx: number) => {
      const { pointList = [] } = form?.getFieldsValue(true);
      const item = pointList?.[idx];
      if (!item) {
        return {};
      }
      const title = buildTitle(item);
      const disableTop = idx === 0;
      const disableBottom = idx === pointList.length - 1;
      const routeRegionList = [item.padName, item.sadName, item.tadName].filter(
        Boolean,
      );
      const routeRegion = routeRegionList.join(', ');
      const address = item?.address;
      const labelTitle = 'label';
      const label = item?.label;

      return {
        title,
        disableTop,
        disableBottom,
        routeRegion,
        address,
        labelTitle,
        label,
      };
    },
    [innerList],
  );

  const renderList = useCallback(() => {
    const handleSelect = async (meta: IMeta, idx: number) => {
      if (!lodash.isEmpty(meta)) {
        const { pointList } = form?.getFieldsValue(true);
        const item = pointList?.[idx];

        if (item) {
          const { padId: pad, sadId: sad, tadId: tad } = item;
          const { lat, lng, address } = meta;

          const payload = {
            pad,
            sad,
            tad,
            lat,
            lng,
          };

          const fieldName = ['pointList', idx, 'address'];
          // 通知父组件loading
          props.setPageLoading(true);
          const res = await waybillRouteAddressCheck(payload);
          props.setPageLoading(false);

          if (res.code === 200) {
            const { matched } = res.data;
            if (matched) {
              const newItem = {
                ...pointList[idx],
                lat,
                lng,
                address,
              };
              const newList = [...pointList];
              newList.splice(idx, 1, newItem);
              props.updateTrigger(newList);
            } else {
              form?.setFields([
                {
                  name: fieldName,
                  // value: undefined,
                  errors: ['The address does not match the region range'],
                },
              ]);
            }
          }
        }
      }
    };

    const doDelete = (idx: number) => {
      modal.confirm({
        title: 'Delete Confirm',
        icon: <ExclamationCircleFilled />,
        content: 'Confirm to delete the stop point',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk: () => {
          const { pointList } = form?.getFieldsValue(true);
          const item = pointList?.[idx];
          if (item) {
            props.deleteTrigger(item);
          }
        },
        onCancel() {
          // do nothing
        },
      });
    };

    const doSortTop = (idx: number) => {
      if (idx === 0) {
        return;
      }
      const { pointList } = form?.getFieldsValue(true);
      const newList = [...pointList];
      const item = newList.splice(idx, 1);
      newList.splice(idx - 1, 0, ...item);

      props.updateTrigger(newList);
    };

    const doSortBottom = (idx: number) => {
      const { pointList } = form?.getFieldsValue(true);
      if (idx === pointList.length - 1) {
        return;
      }
      const newList = [...pointList];
      const item = newList.splice(idx, 1);
      newList.splice(idx + 1, 0, ...item);
      props.updateTrigger(newList);
    };

    return (
      <>
        {innerList?.map(
          (_item: IRouteOriginAndDestinationListItem, idx: number) => {
            const {
              title,
              disableTop,
              disableBottom,
              routeRegion,
              address,
              labelTitle,
              label,
            } = formatItem(idx);

            return (
              <div key={_item.vid} className={styles.itemAddress}>
                <div className="title">
                  <span>{title}</span>
                  <span className="extra">
                    {_item.isStop && (
                      <>
                        <span className="btns">
                          <span onClick={() => doDelete(idx)}>
                            <IconDelete showPopover={false} />
                          </span>
                        </span>
                        <Divider type="vertical" />
                      </>
                    )}
                    <span className="btns">
                      <span onClick={() => doSortTop(idx)}>
                        <SortIconTop disable={disableTop} />
                      </span>
                      <span onClick={() => doSortBottom(idx)}>
                        <SortIconBottom disable={disableBottom} />
                      </span>
                    </span>
                  </span>
                </div>
                <div className="routeRegion">
                  <span className="label">Route Region</span>
                  <span className="value" title={routeRegion}>
                    {routeRegion}
                  </span>
                </div>
                <div className={cls('address', _item.isStop && 'stopAddress')}>
                  <span className="label">Address</span>
                  {_item.isStop ? (
                    <span className="value" title={address}>
                      {address}
                    </span>
                  ) : (
                    <span className="addressValue">
                      <Form.Item
                        label={null}
                        name={['pointList', idx, 'address']}
                        initialValue={address}
                        shouldUpdate
                        rules={[
                          {
                            required: true,
                            message:
                              'Please complete the detailed address of the Point',
                          },
                        ]}
                      >
                        <AutoCompleteSelectNew
                          showLocator
                          onSelect={(meta) => handleSelect(meta, idx)}
                          defaultMeta={{
                            address: _item.address,
                            lat: _item.lat,
                            lng: _item.lng,
                          }}
                        />
                      </Form.Item>
                    </span>
                  )}
                </div>
                <div className="labelField">
                  <span className="label">{labelTitle}</span>
                  <span className="value" title={label}>
                    {label}
                  </span>
                </div>
              </div>
            );
          },
        )}
      </>
    );
  }, [innerList]);

  useEffect(() => {
    update(props.list);
  }, [props.list]);

  useImperativeHandle(ref, () => ({
    validateFields: () => form.validateFields(),
    getFieldsValue: () => form.getFieldsValue(true),
    getFieldsError: () => form.getFieldsError(),
    setFields: (fields: any[]) => form.setFields(fields),
    setFieldsValue: (fields: any) => form.setFieldsValue(fields),
    update: (newList: IRouteOriginAndDestinationListItem[]) => update(newList),
  }));

  return (
    <>
      <Form form={form} name={props.formName ?? 'sortListForm'}>
        {renderList()}
      </Form>
    </>
  );
});

export default AddressSortList;
