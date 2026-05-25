import { IRouteOriginAndDestinationListItem } from '@/api/types/waybill';
import { IconDelete, IconEdit } from '@/components/OperationIcon';
import { DoubleLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { App, Divider, Form } from 'antd';
import cls from 'classnames';
import _ from 'lodash';
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
  editTrigger: (v: IRouteOriginAndDestinationListItem) => void;
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
      const stopPoints = _.filter(innerList, (x) => {
        return x.isStop === true;
      });

      const normalPoints = _.filter(innerList, (x) => {
        return (
          x.isStop === false || x.isStop === undefined || x.isStop === null
        );
      });

      let title = '';
      let index = 0;

      if (item.isStop) {
        title = 'Stop Point';
        const offsetIndex = _.findIndex(stopPoints, (x) => {
          return x.vid === item.vid;
        });
        index = offsetIndex + 1;
      } else {
        const offsetIndex = _.findIndex(normalPoints, (x) => {
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
    const doEdit = (idx: number) => {
      const { pointList } = form?.getFieldsValue(true);
      const item = pointList?.[idx];
      if (item) {
        props.editTrigger(item);
      }
    };

    const doDelete = (idx: number) => {
      modal.confirm({
        title: 'Delete Confirm',
        icon: <ExclamationCircleFilled />,
        content: 'Confirm to delete the point',
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
                    <span className="btns">
                      <span onClick={() => doEdit(idx)}>
                        {!_item.isStop && <IconEdit showPopover={false} />}
                      </span>
                      <span onClick={() => doDelete(idx)}>
                        <IconDelete showPopover={false} />
                      </span>
                    </span>
                    <Divider type="vertical" />
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
                <div className="address">
                  <span className="label">Address</span>
                  <span className="value" title={address}>
                    {address}
                  </span>
                </div>
                {_item.isStop && (
                  <div className="labelField">
                    <span className="label">{labelTitle}</span>
                    <span className="value" title={label}>
                      {label}
                    </span>
                  </div>
                )}
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
