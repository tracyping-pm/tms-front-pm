import {
  IRouteOriginAndDestinationListItem,
  IWaypointListItem,
} from '@/api/types/waybill';
import { ExclamationCircleFilled, RightOutlined } from '@ant-design/icons';
import { App, Modal, ModalProps } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import styles from './styles.less';

interface IStepTitle {
  stepActive: number;
}

const StepTitle: FC<IStepTitle> = ({ stepActive = 0 }) => {
  return (
    <>
      <span className={cls(styles.titleStepItem, styles.titleStepActive)}>
        <span className="stepNum">1</span>
        <span className="stepFont">Select Points</span>
        <span className="stepIcon">
          <RightOutlined />
        </span>
      </span>
      <span
        className={cls(styles.titleStepItem, {
          [styles.titleStepActive]: stepActive === 1 || stepActive === 2,
        })}
      >
        <span className="stepNum">2</span>
        <span className="stepFont">Select Address</span>
        <span className="stepIcon">
          <RightOutlined />
        </span>
      </span>
      <span
        className={cls(
          styles.titleStepItem,
          stepActive === 2 && styles.titleStepActive,
        )}
      >
        <span className="stepNum">3</span>
        <span className="stepFont">Choose Map Route</span>
      </span>
    </>
  );
};

type IRouteEditStepsModal = ModalProps & {
  projectId: number;
  waybillId: number;
  initialValue: {
    selectedTree: IRouteOriginAndDestinationListItem[];
    selectedOrigins: IRouteOriginAndDestinationListItem[];
    selectedOriginStopPoints: IRouteOriginAndDestinationListItem[];
    selectedDestinations: IRouteOriginAndDestinationListItem[];
    selectedDestinationStopPoints: IRouteOriginAndDestinationListItem[];
    selectedWaypoints: IWaypointListItem[];
  };
  onCancel: () => void;
  onConfirm: () => void;
};

const RouteEditStepsModal = ({
  // width = 1680,
  open = false,
  width = '90%',
  projectId,
  waybillId,
  initialValue,
  onCancel,
  onConfirm,
  ...restProps
}: IRouteEditStepsModal) => {
  const { modal } = App.useApp();
  const [title, setTitle] = useState<string>('');
  const [stepActive, setStepActive] = useState<number>(0);

  const Title = () => {
    return (
      <>
        <div className={styles.titleWrap}>
          <div className={styles.titleText}>{title}</div>
          <div className={styles.titleStep}>
            <StepTitle stepActive={stepActive} />
          </div>
        </div>
      </>
    );
  };

  const reset = useCallback(() => {
    setTitle('Select Points');
    setStepActive(0);
  }, []);

  const doPrev = useCallback(() => {
    return new Promise((resolve, reject) => {
      modal.confirm({
        title: 'Operation Confirm',
        icon: <ExclamationCircleFilled />,
        content:
          'Returning to the previous step will not save the contents of the current operation.',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk() {
          setStepActive((prev) => prev - 1);
          resolve(true);
        },
        onCancel() {
          reject(false);
        },
      });
    });
  }, []);

  const doCancel = useCallback(() => {
    return new Promise((resolve, reject) => {
      modal.confirm({
        title: 'Operation Confirm',
        icon: <ExclamationCircleFilled />,
        content:
          'The data of this operation will not be saved after canceling.',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk() {
          onCancel?.();
          resolve(true);
        },
        onCancel() {
          reject(false);
        },
      });
    });
  }, []);

  const doNext = useCallback(() => {
    setStepActive((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (stepActive === 0) {
      setTitle('Select Points');
    } else if (stepActive === 1) {
      setTitle('Select Address');
    } else if (stepActive === 2) {
      setTitle('Choose Map Route');
    } else {
      setTitle('');
    }
  }, [stepActive]);

  useEffect(() => {
    if (open) {
      setStepActive(0);
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <Modal
        centered
        title={<Title />}
        open={open}
        width={width}
        okText="Confirm"
        maskClosable={false}
        destroyOnClose
        footer={null}
        onCancel={doCancel}
        className={styles.routeStepModal}
        {...restProps}
      >
        <div className={styles.mainContent}>
          <section className={cls(stepActive !== 0 && styles.hidden)}>
            <Step1
              projectId={projectId}
              waybillId={waybillId}
              initialValue={initialValue}
              doNext={doNext}
              doCancel={doCancel}
            />
          </section>
          <section className={cls(stepActive !== 1 && styles.hidden)}>
            <Step2
              projectId={projectId}
              waybillId={waybillId}
              doPrev={doPrev}
              doNext={doNext}
              doCancel={doCancel}
            />
          </section>
          <section className={cls(stepActive !== 2 && styles.hidden)}>
            <Step3
              waybillId={waybillId}
              doPrev={doPrev}
              doCancel={doCancel}
              onConfirm={onConfirm}
            />
          </section>
        </div>
      </Modal>
    </>
  );
};

export default RouteEditStepsModal;
