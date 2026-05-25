import CommonCheckboxCombo from '@/components/CommonCheckboxCombo';
import { WaybillConsistencyEnum } from '@/enums';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useBoolean } from 'ahooks';
import { Button, Form } from 'antd';
import cls from 'classnames';
import { isDayjs } from 'dayjs';
import _ from 'lodash';
import {
  FC,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import FiltersSettingModal from './FiltersSettingModal';
import NormalFilter from './NormalFilter';
import OtherInfoFilter from './OtherInfoFilter';
import RouteInfoFilter from './RouteInfoFilter';
import VendorInfoFilter from './VendorInfoFilter';
import {
  DATE_FORMAT,
  IALL_NEED,
  IBE_NEED,
  IFE_NEED,
  PLAIN_OPTIONS_FINANCIAL,
  PLAIN_OPTIONS_TRANSPORTATION,
} from './constant';
import styles from './index.less';

export interface IProps {
  useInDetail?: boolean;
  onSearch: (v?: any) => void;
  ref?: any;
}

const Filter: FC<IProps> = forwardRef(
  ({ useInDetail = false, onSearch }, ref) => {
    const [form] = Form.useForm();
    const [isExpand, { toggle: toggleExpand }] = useBoolean(false);
    const [filtersSettingModalOpen, setFiltersSettingModalOpen] =
      useState(false);

    const normalRef = useRef<any>();
    const routeRef = useRef<any>();
    const vendorRef = useRef<any>();
    const otherRef = useRef<any>();

    const transformFEOut = useCallback((): IFE_NEED => {
      const fieldsValue = form.getFieldsValue();
      const FE_NEED: IFE_NEED = {};
      // 按照接口文档入参顺序依次构建 frontend need 数据结构；
      if (fieldsValue?.projectIdList?.length > 0) {
        _.set(FE_NEED, 'projectIdList', fieldsValue.projectIdList);
      }

      _.set(FE_NEED, 'include', fieldsValue.projectNameInclude);

      if (fieldsValue?.customerNameIdList?.length > 0) {
        _.set(FE_NEED, 'customerNameIdList', fieldsValue.customerNameIdList);
      }

      if (fieldsValue?.customerTagIdList?.length > 0) {
        _.set(FE_NEED, 'customerTagIdList', fieldsValue.customerTagIdList);
      }

      if (fieldsValue?.statusList?.length > 0) {
        _.set(FE_NEED, 'statusList', fieldsValue.statusList);
      }

      if (fieldsValue?.dispatchType) {
        _.set(FE_NEED, 'dispatchType', fieldsValue.dispatchType);
      }

      if (fieldsValue?.positionTime?.length > 0) {
        const [start, end] = fieldsValue.positionTime;
        const positionTimeStart = isDayjs(start)
          ? start.format(DATE_FORMAT.START)
          : start;
        const positionTimeEnd = isDayjs(end)
          ? end.format(DATE_FORMAT.END)
          : end;

        _.set(FE_NEED, 'positionTimeStart', positionTimeStart);
        _.set(FE_NEED, 'positionTimeEnd', positionTimeEnd);
      }

      if (fieldsValue?.unloadingCompletionTime?.length > 0) {
        const [start, end] = fieldsValue.unloadingCompletionTime;
        const unloadingCompletionTimeStart = isDayjs(start)
          ? start.format(DATE_FORMAT.START)
          : start;
        const unloadingCompletionTimeEnd = isDayjs(end)
          ? end.format(DATE_FORMAT.END)
          : end;

        _.set(
          FE_NEED,
          'unloadingCompletionTimeStart',
          unloadingCompletionTimeStart,
        );
        _.set(
          FE_NEED,
          'unloadingCompletionTimeEnd',
          unloadingCompletionTimeEnd,
        );
      }

      if (fieldsValue?.creationTime?.length > 0) {
        const [start, end] = fieldsValue.creationTime;
        const creationTimeStart = isDayjs(start)
          ? start.format(DATE_FORMAT.START)
          : start;
        const creationTimeEnd = isDayjs(end)
          ? end.format(DATE_FORMAT.END)
          : end;

        _.set(FE_NEED, 'creationTimeStart', creationTimeStart);
        _.set(FE_NEED, 'creationTimeEnd', creationTimeEnd);
      }

      if (fieldsValue?.destinationTime?.length > 0) {
        const [start, end] = fieldsValue.destinationTime;
        const destinationTimeStart = isDayjs(start)
          ? start.format(DATE_FORMAT.START)
          : start;
        const destinationTimeEnd = isDayjs(end)
          ? end.format(DATE_FORMAT.END)
          : end;

        _.set(FE_NEED, 'destinationTimeStart', destinationTimeStart);
        _.set(FE_NEED, 'destinationTimeEnd', destinationTimeEnd);
      }

      if (fieldsValue?.customerCode) {
        _.set(FE_NEED, 'customerCode', fieldsValue.customerCode);
      }

      if (fieldsValue?.riskLevelObj) {
        _.set(FE_NEED, 'riskLevelObj', fieldsValue.riskLevelObj);
      }

      if (fieldsValue?.waybillId) {
        _.set(FE_NEED, 'waybillId', fieldsValue.waybillId);
      }

      if (fieldsValue?.truckId) {
        _.set(FE_NEED, 'truckId', fieldsValue.truckId);
      }

      if (fieldsValue?.originRegion) {
        _.set(FE_NEED, 'originRegion', fieldsValue.originRegion);
      }

      if (fieldsValue?.originLabel) {
        _.set(FE_NEED, 'originLabel', fieldsValue.originLabel);
      }

      if (fieldsValue?.destinationRegion) {
        _.set(FE_NEED, 'destinationRegion', fieldsValue.destinationRegion);
      }

      if (fieldsValue?.destinationLabel) {
        _.set(FE_NEED, 'destinationLabel', fieldsValue.destinationLabel);
      }

      if (fieldsValue?.vendorIdList?.length > 0) {
        _.set(FE_NEED, 'vendorIdList', fieldsValue.vendorIdList);
      }

      if (fieldsValue?.podNumber) {
        _.set(FE_NEED, 'podNumber', fieldsValue.podNumber);
      }

      if (fieldsValue?.truckTypeConsistency) {
        _.set(
          FE_NEED,
          'truckTypeConsistency',
          fieldsValue.truckTypeConsistency,
        );
      }

      if (fieldsValue?.financialStatusList?.length > 0) {
        _.set(FE_NEED, 'financialStatusList', fieldsValue.financialStatusList);
      }

      if (fieldsValue?.driverNameList?.length > 0) {
        _.set(FE_NEED, 'driverNameList', fieldsValue.driverNameList);
      }

      if (fieldsValue?.logisticsCategory) {
        _.set(FE_NEED, 'logisticsCategory', fieldsValue.logisticsCategory);
      }

      return FE_NEED;
    }, []);

    const transformBEOut = useCallback((): IBE_NEED => {
      const fieldsValue = form.getFieldsValue();

      const BE_NEED: IBE_NEED = {};
      // 按照接口文档入参顺序依次构建 backend need 数据结构；
      if (fieldsValue?.projectIdList?.length > 0) {
        const ids = fieldsValue.projectIdList.map((item: any) => item.id);
        _.set(BE_NEED, 'projectIdList', ids);
      }

      _.set(BE_NEED, 'include', fieldsValue.projectNameInclude);

      if (fieldsValue?.customerNameIdList?.length > 0) {
        const ids = fieldsValue.customerNameIdList.map(
          (item: any) => item.value,
        );
        _.set(BE_NEED, 'customerNameIdList', ids);
      }

      if (fieldsValue?.customerTagIdList?.length > 0) {
        const ids = fieldsValue.customerTagIdList.map(
          (item: any) => item.value,
        );
        _.set(BE_NEED, 'customerTagIdList', ids);
      }

      if (fieldsValue?.statusList?.length > 0) {
        _.set(BE_NEED, 'statusList', fieldsValue.statusList);
      }

      if (fieldsValue?.dispatchType) {
        _.set(BE_NEED, 'dispatchType', fieldsValue.dispatchType);
      }

      if (fieldsValue?.positionTime?.length > 0) {
        const [start, end] = fieldsValue.positionTime;
        const positionTimeStart = isDayjs(start)
          ? start.format(DATE_FORMAT.START)
          : start;
        const positionTimeEnd = isDayjs(end)
          ? end.format(DATE_FORMAT.END)
          : end;

        _.set(BE_NEED, 'positionTimeStart', positionTimeStart);
        _.set(BE_NEED, 'positionTimeEnd', positionTimeEnd);
      }

      if (fieldsValue?.unloadingCompletionTime?.length > 0) {
        const [start, end] = fieldsValue.unloadingCompletionTime;
        const unloadingCompletionTimeStart = isDayjs(start)
          ? start.format(DATE_FORMAT.START)
          : start;
        const unloadingCompletionTimeEnd = isDayjs(end)
          ? end.format(DATE_FORMAT.END)
          : end;

        _.set(
          BE_NEED,
          'unloadingCompletionTimeStart',
          unloadingCompletionTimeStart,
        );
        _.set(
          BE_NEED,
          'unloadingCompletionTimeEnd',
          unloadingCompletionTimeEnd,
        );
      }

      if (fieldsValue?.creationTime?.length > 0) {
        const [start, end] = fieldsValue.creationTime;
        const creationTimeStart = isDayjs(start)
          ? start.format(DATE_FORMAT.START)
          : start;
        const creationTimeEnd = isDayjs(end)
          ? end.format(DATE_FORMAT.END)
          : end;

        _.set(BE_NEED, 'creationTimeStart', creationTimeStart);
        _.set(BE_NEED, 'creationTimeEnd', creationTimeEnd);
      }

      if (fieldsValue?.destinationTime?.length > 0) {
        const [start, end] = fieldsValue.destinationTime;
        const destinationTimeStart = isDayjs(start)
          ? start.format(DATE_FORMAT.START)
          : start;
        const destinationTimeEnd = isDayjs(end)
          ? end.format(DATE_FORMAT.END)
          : end;

        _.set(BE_NEED, 'destinationTimeStart', destinationTimeStart);
        _.set(BE_NEED, 'destinationTimeEnd', destinationTimeEnd);
      }

      if (fieldsValue?.customerCode) {
        _.set(BE_NEED, 'customerCode', fieldsValue.customerCode);
      }

      if (fieldsValue?.riskLevelObj) {
        _.set(BE_NEED, 'riskLevelMin', fieldsValue.riskLevelObj.min);
        _.set(BE_NEED, 'riskLevelMax', fieldsValue.riskLevelObj.max);
      }

      if (fieldsValue?.waybillId) {
        const waybillId = fieldsValue.waybillId.value;
        _.set(BE_NEED, 'waybillId', waybillId);
      }

      if (fieldsValue?.truckId) {
        const truckId = fieldsValue.truckId.value;
        _.set(BE_NEED, 'truckId', truckId);
      }

      if (fieldsValue?.originRegion) {
        const {
          padId: originPadId,
          sadId: originSadId,
          tadId: originTadId,
        } = fieldsValue.originRegion;
        _.set(BE_NEED, 'originPadId', originPadId);
        _.set(BE_NEED, 'originSadId', originSadId);
        _.set(BE_NEED, 'originTadId', originTadId);
      }

      if (fieldsValue?.originLabel) {
        _.set(BE_NEED, 'originLabel', fieldsValue.originLabel);
      }

      if (fieldsValue?.destinationRegion) {
        const {
          padId: destinationPadId,
          sadId: destinationSadId,
          tadId: destinationTadId,
        } = fieldsValue.destinationRegion;
        _.set(BE_NEED, 'destinationPadId', destinationPadId);
        _.set(BE_NEED, 'destinationSadId', destinationSadId);
        _.set(BE_NEED, 'destinationTadId', destinationTadId);
      }

      if (fieldsValue?.destinationLabel) {
        _.set(BE_NEED, 'destinationLabel', fieldsValue.destinationLabel);
      }

      if (fieldsValue?.vendorIdList?.length > 0) {
        const ids = fieldsValue.vendorIdList.map((item: any) => item.value);
        _.set(BE_NEED, 'vendorIdList', ids);
      }

      if (fieldsValue?.podNumber) {
        _.set(BE_NEED, 'podNumber', fieldsValue.podNumber);
      }

      if (fieldsValue?.truckTypeConsistency) {
        const truckTypeConsistency =
          fieldsValue.truckTypeConsistency ===
          WaybillConsistencyEnum.CONSISTENT;
        _.set(BE_NEED, 'truckTypeConsistency', truckTypeConsistency);
      }

      if (fieldsValue?.financialStatusList?.length > 0) {
        _.set(BE_NEED, 'financialStatusList', fieldsValue.financialStatusList);
      }

      if (fieldsValue?.driverNameList?.length > 0) {
        const ids = fieldsValue.driverNameList.map((item: any) => item.title);
        _.set(BE_NEED, 'driverNameList', ids);
      }

      if (fieldsValue?.logisticsCategory) {
        _.set(BE_NEED, 'logisticsCategory', fieldsValue.logisticsCategory);
      }
      if (fieldsValue?.truckTypeIdList?.length > 0) {
        _.set(BE_NEED, 'truckTypeIdList', fieldsValue.truckTypeIdList);
      }

      return BE_NEED;
    }, []);

    const transformOut = useCallback((): IALL_NEED => {
      const FE_NEED = transformFEOut();
      const BE_NEED = transformBEOut();

      return {
        FE_NEED,
        BE_NEED,
      };
    }, []);

    const handleSearch = async () => {
      const ALL_NEED = transformOut();
      onSearch?.(ALL_NEED);
    };

    const handleReset = () => {
      form.resetFields();
      form.setFieldsValue({ projectNameInclude: true });
      onSearch?.();
    };

    const doFill = (FE_NEED: IFE_NEED) => {
      // 按照展示顺序填充表单
      // 填充 CheckboxCombo
      if (FE_NEED.statusList && FE_NEED.statusList.length > 0) {
        form.setFieldsValue({ statusList: FE_NEED.statusList });
      }

      if (
        FE_NEED.financialStatusList &&
        FE_NEED.financialStatusList.length > 0
      ) {
        form.setFieldsValue({
          financialStatusList: FE_NEED.financialStatusList,
        });
      }
      // 分发到各个子组件去 fill
      normalRef.current?.doFill(FE_NEED);
      routeRef.current?.doFill(FE_NEED);
      vendorRef.current?.doFill(FE_NEED);
      otherRef.current?.doFill(FE_NEED);
    };

    const onApply = (ALL_NEED: IALL_NEED) => {
      const { FE_NEED } = ALL_NEED;
      form.resetFields();
      doFill(FE_NEED);
      onSearch?.(ALL_NEED);
      setFiltersSettingModalOpen(false);
    };

    useImperativeHandle(ref, () => ({
      doFill: (FE_NEED: IFE_NEED) => doFill(FE_NEED),
    }));

    return (
      <>
        <Form name="waybill-filter-form" form={form}>
          <div className={cls('waybill-filter', styles.waybillFilter)}>
            <div className="always-show">
              <section className="filter-section transportation">
                <label className="label">Transportation Status:</label>
                <div className="content">
                  <Form.Item name={'statusList'} label={null} noStyle>
                    <CommonCheckboxCombo
                      plainOptions={PLAIN_OPTIONS_TRANSPORTATION}
                    />
                  </Form.Item>
                </div>
              </section>
              <section className="filter-section financial">
                <label className="label">Financial Status:</label>
                <div className="content">
                  <Form.Item name={'financialStatusList'} label={null} noStyle>
                    <CommonCheckboxCombo
                      plainOptions={PLAIN_OPTIONS_FINANCIAL}
                    />
                  </Form.Item>
                </div>
              </section>
              <section className="filter-section normal">
                <label className="label"></label>
                <div className="content">
                  <NormalFilter
                    form={form}
                    ref={normalRef}
                    useInDetail={useInDetail}
                  />
                </div>
              </section>
            </div>

            <div
              className={cls('collapse-content', !isExpand && styles.hidden)}
            >
              <section className="filter-section">
                <label className="label">Route Info:</label>
                <div className="content">
                  <RouteInfoFilter form={form} ref={routeRef} />
                </div>
              </section>
              <section className="filter-section">
                <label className="label">Vendor Info:</label>
                <div className="content">
                  <VendorInfoFilter form={form} ref={vendorRef} />
                </div>
              </section>
              <section className="filter-section">
                <label className="label">Other Info:</label>
                <div className="content">
                  <OtherInfoFilter
                    form={form}
                    ref={otherRef}
                    useInDetail={useInDetail}
                  />
                </div>
              </section>
            </div>

            <div className="btn-group">
              {!useInDetail && (
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() => {
                    setFiltersSettingModalOpen(true);
                  }}
                >
                  Filters Setting
                </Button>
              )}
              <Button type="primary" onClick={handleSearch}>
                Search
              </Button>
              <Button onClick={handleReset}>Reset</Button>
              <span className="collapse-button" onClick={toggleExpand}>
                {isExpand ? 'Collapse' : 'Expand'}
                {isExpand ? <UpOutlined /> : <DownOutlined />}
              </span>
            </div>
          </div>
        </Form>
        <FiltersSettingModal
          open={filtersSettingModalOpen}
          getTransformData={transformOut}
          onCancel={() => {
            setFiltersSettingModalOpen(false);
          }}
          onApply={onApply}
        />
      </>
    );
  },
);

export default Filter;
