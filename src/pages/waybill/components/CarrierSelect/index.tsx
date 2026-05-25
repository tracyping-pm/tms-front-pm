import { IWaybillBaseInfoData } from '@/api/types/waybill';
import {
  carrierSubmit,
  checkCarrierSubmit,
  waybillCarrierCheck,
} from '@/api/waybill';
import {
  CARRIER_TITLE_TEXT,
  WaybillDispatchTypeEnum,
  WaybillStatusEnum,
} from '@/enums';
import { OPS_TYPE, StateContext } from '@/pages/waybill/WaybillDetail/store';
import SelectDriver from '@/pages/waybill/components/CarrierSelect/SelectDriver';
import SelectHelper from '@/pages/waybill/components/CarrierSelect/SelectHelper';
import SelectTruck from '@/pages/waybill/components/CarrierSelect/SelectTruck';
import SelectVendor from '@/pages/waybill/components/CarrierSelect/SelectVendor';
import {
  CloseOutlined,
  ExclamationCircleFilled,
  RightOutlined,
} from '@ant-design/icons';
import { App, Button, Drawer } from 'antd';
import { useContext, useMemo, useState } from 'react';
import styles from '../common.less';

const SELECT_TITLE_ENUM_TEXT: Record<any, string> = {
  1: 'Select Truck',
  2: 'Select Driver',
  3: 'Select Helpers',
};
const NEXT_STEP_ONE_CHECK_TEXT: Record<any, string> = {
  2: 'The truck type is not in the route library',
  3: 'There is no valid vendor price version at the time',
};

const StepItem = (props: {
  stepIndex: number;
  stepText: string;
  activeIndex?: number;
}) => {
  const { stepIndex, stepText, activeIndex } = props;
  return (
    <div className={styles.stepItem}>
      <div
        className={
          Number(activeIndex) >= stepIndex
            ? styles.stepItem_indexActive
            : styles.stepItem_index
        }
      >
        {stepIndex}
      </div>
      <div
        className={
          Number(activeIndex) >= stepIndex
            ? styles.stepItem_descActive
            : styles.stepItem_desc
        }
      >
        {stepText}
      </div>
    </div>
  );
};

export default function CarrierSelect(props: {
  onClose: () => void;
  refresh: () => void;
  waybillDetail: IWaybillBaseInfoData;
  waybillId: number;
  projectId: number;
  positionTime: string;
}) {
  const {
    onClose,
    refresh,
    waybillDetail,
    waybillId,
    projectId,
    positionTime,
  } = props;

  const { message, modal } = App.useApp();
  //@ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const carrierSelect = state?.carrierSelect || {};
  const waybillBasicInfo = state?.waybillBasicInfo || {};
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [stepOneLoading, setStepOneLoading] = useState<boolean>(false);

  const save = async () => {
    setSaveLoading(true);
    const res = await carrierSubmit({
      id: waybillId,
      vendorId: carrierSelect.vendor.id,
      vendorTruckId:
        carrierSelect.step > 1 ? carrierSelect.truck.vendorTruckId : undefined,
      truckType:
        carrierSelect.step > 1 ? carrierSelect.truck.truckType : undefined,
      driverId: carrierSelect.step > 2 ? carrierSelect.driver.id : undefined,
      helperIds: carrierSelect.step > 3 ? carrierSelect.helpers : undefined,
    });
    setSaveLoading(false);
    if (res.code === 200) {
      if (res.data?.code === 1) {
        modal.warning({
          title: 'Warning',
          content: res.data.msg,
          okText: 'Confirm',
          cancelButtonProps: {
            style: { display: 'none' },
          },
        });
      } else {
        let msg = '';
        if (carrierSelect.vendor) {
          msg = 'vendor information';
        }
        if (carrierSelect.truck) {
          msg = 'truck information';
        }
        message.success(msg + 'is saved');
      }
      refresh();
      onClose();
    }
  };

  const previous = () => {
    switch (carrierSelect.step) {
      case 2:
        dispatch({
          type: OPS_TYPE.CARRIER_SELECT,
          payload: {
            data: {
              ...carrierSelect,
              step: 1,
              truck: null,
              driver: null,
              helpers: [],
            },
          },
        });
        break;
      case 3:
        dispatch({
          type: OPS_TYPE.CARRIER_SELECT,
          payload: {
            data: {
              ...carrierSelect,
              step: 2,
              driver: null,
              helpers: [],
            },
          },
        });
        break;
      case 4:
        dispatch({
          type: OPS_TYPE.CARRIER_SELECT,
          payload: {
            data: {
              ...carrierSelect,
              step: 3,
              helpers: [],
            },
          },
        });
        break;
    }
  };

  const nextStep = async () => {
    switch (carrierSelect.step) {
      case 1:
        // vendor
        if (carrierSelect.vendor) {
          dispatch({
            type: OPS_TYPE.CARRIER_SELECT,
            payload: {
              data: {
                ...carrierSelect,
                step: 2,
              },
            },
          });
        } else {
          modal.confirm({
            title: 'Next Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'No Vendor selected yet',
            okText: 'Confirm',
            cancelButtonProps: {
              style: { display: 'none' },
            },
          });
        }
        break;
      case 2:
        // truck
        if (carrierSelect.truck) {
          if (
            waybillDetail.dispatchType ===
            WaybillDispatchTypeEnum.STANDARD_DISPATCH
          ) {
            const payload = {
              vendorTruckId: carrierSelect?.truck?.vendorTruckId,
              projectId,
              waybillId,
            };
            setStepOneLoading(true);
            const res = await waybillCarrierCheck(payload);
            setStepOneLoading(false);
            if (res.code === 200) {
              if (res.data !== 0) {
                modal.error({
                  title: 'Error',
                  content:
                    res?.data === 1 ? (
                      <ul style={{ paddingLeft: 10 }}>
                        <li>{NEXT_STEP_ONE_CHECK_TEXT[2]}</li>
                        <li>{NEXT_STEP_ONE_CHECK_TEXT[3]}</li>
                      </ul>
                    ) : (
                      NEXT_STEP_ONE_CHECK_TEXT[res.data]
                    ),
                });
                return;
              }
            }
          }
          if (!carrierSelect.truck?.truckTypeConsistency) {
            message.warning(
              'Customer Required Truck  Type is inconsistent with Actual Truck Types',
            );
          }
          dispatch({
            type: OPS_TYPE.CARRIER_SELECT,
            payload: {
              data: {
                ...carrierSelect,
                step: 3,
              },
            },
          });
        } else {
          modal.confirm({
            title: 'Next Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'No Truck selected yet',
            okText: 'Confirm',
            cancelButtonProps: {
              style: { display: 'none' },
            },
          });
        }
        break;
      case 3:
        // driver
        if (carrierSelect.driver) {
          dispatch({
            type: OPS_TYPE.CARRIER_SELECT,
            payload: {
              data: {
                ...carrierSelect,
                step: 4,
              },
            },
          });
        } else {
          modal.confirm({
            title: 'Next Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'No Driver selected yet',
            okText: 'Confirm',
            cancelButtonProps: {
              style: { display: 'none' },
            },
          });
        }
        break;
    }
  };

  const submit = async () => {
    const res = await carrierSubmit({
      id: waybillId,
      vendorId: carrierSelect.vendor.id,
      vendorTruckId: carrierSelect.truck.vendorTruckId,
      driverId: carrierSelect.driver.id,
      helperIds: carrierSelect.helpers,
      truckType: carrierSelect.truck.truckType,
    });
    setLoading(false);
    if (res.code === 200) {
      if (res.data?.code === 1) {
        modal.warning({
          title: 'Warning',
          content: res.data.msg,
          okText: 'Confirm',
          cancelButtonProps: {
            style: { display: 'none' },
          },
        });
      } else {
        message.success('Edit successfully!');
      }
      refresh();
      onClose();
    }
  };

  const checkSubmit = async () => {
    setLoading(true);
    const check = await checkCarrierSubmit({
      id: waybillId,
      projectId: projectId,
      vendorTruckId: carrierSelect.truck.vendorTruckId,
      capacityPoolTruckId: carrierSelect.truck.id,
      driverId: carrierSelect.driver.id,
      helperIds: carrierSelect.helpers,
      positionTime: positionTime,
    });
    if (check.code === 200) {
      switch (check.data) {
        case 0:
          submit();
          break;
        case 1:
          modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'The selected truck maybe dispatched repeatedly',
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: submit,
            onCancel() {
              setLoading(false);
            },
          });
          break;
        case 2:
          modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleFilled />,
            content: 'The selected driver maybe assigned repeatedly',
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: submit,
            onCancel() {
              setLoading(false);
            },
          });
          break;
      }
    } else {
      setLoading(false);
    }
  };

  const StepElement = useMemo(() => {
    switch (carrierSelect.step) {
      case 1:
        return (
          <SelectVendor
            waybillId={waybillId}
            projectId={projectId}
            vendorIdOrigin={waybillBasicInfo.vendorId}
            requireTruck={waybillDetail.requiredTruckTypeName}
            requireTruckId={waybillDetail.requiredTruckType}
            dispatchType={waybillBasicInfo?.dispatchType}
          />
        );
      case 2:
        return (
          <SelectTruck
            waybillId={waybillId}
            projectId={projectId}
            truckIdOriginal={waybillBasicInfo.truckId}
            requireTruck={waybillDetail.requiredTruckTypeName}
            requireTruckId={waybillDetail.requiredTruckType}
            dispatchType={waybillBasicInfo?.dispatchType}
          />
        );
      case 3:
        return <SelectDriver waybillId={waybillId} projectId={projectId} />;
      case 4:
        return <SelectHelper waybillId={waybillId} projectId={projectId} />;
    }
  }, [carrierSelect, waybillDetail, waybillBasicInfo]);

  return (
    <Drawer
      title={SELECT_TITLE_ENUM_TEXT[carrierSelect.step]}
      placement="right"
      destroyOnClose={true}
      maskClosable={false}
      className={styles.carrierDrawer}
      style={{ width: '924px' }}
      open={true}
    >
      <div className={styles.carrierDrawer}>
        <div className={styles.carrierDrawer_header}>
          <div className={styles.carrierDrawer_header_title}>{`Select ${
            CARRIER_TITLE_TEXT[carrierSelect.step]
          }`}</div>
          <div className={styles.carrierDrawer_header_step}>
            <StepItem
              stepIndex={1}
              stepText="Select Vendor"
              activeIndex={carrierSelect.step}
            />
            <RightOutlined
              className={styles.stepItem_icon}
              style={{
                color: carrierSelect.step > 1 ? '#8c8c8c' : '#d9d9d9',
                marginRight: '16px',
              }}
            />
            <StepItem
              stepIndex={2}
              stepText="Select Truck"
              activeIndex={carrierSelect.step}
            />
            <RightOutlined
              className={styles.stepItem_icon}
              style={{
                color: carrierSelect.step > 2 ? '#8c8c8c' : '#d9d9d9',
                marginRight: '16px',
              }}
            />
            <StepItem
              stepIndex={3}
              stepText="Select Driver"
              activeIndex={carrierSelect.step}
            />
            <RightOutlined
              className={styles.stepItem_icon}
              style={{
                color: carrierSelect.step > 3 ? '#8c8c8c' : '#d9d9d9',
                marginRight: '16px',
              }}
            />
            <StepItem
              stepIndex={4}
              stepText="Select Helper"
              activeIndex={carrierSelect.step}
            />
          </div>
          <CloseOutlined
            className={styles.carrierDrawer_header_close}
            onClick={onClose}
          />
        </div>
        <div className={styles.carrierDrawer_content}>{StepElement}</div>
        <div className={styles.carrierDrawer_footer}>
          {carrierSelect.step < 3 ? (
            <Button
              onClick={save}
              loading={saveLoading}
              disabled={
                (carrierSelect.step === 1 && !carrierSelect.vendor) ||
                (carrierSelect.step === 2 && !carrierSelect.truck) ||
                waybillBasicInfo.status !== WaybillStatusEnum.PLANNING
              }
            >
              Save
            </Button>
          ) : null}
          {carrierSelect.step > 1 ? (
            <Button onClick={previous}>Previous</Button>
          ) : null}
          {carrierSelect.step !== 4 ? (
            <Button type="primary" onClick={nextStep} loading={stepOneLoading}>
              Next
            </Button>
          ) : (
            <Button type="primary" onClick={checkSubmit} loading={loading}>
              Confirm
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
