import { ArrowLeftOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { App, Button, Steps } from 'antd';
import cls from 'classnames';
import { useCallback, useEffect } from 'react';

import { PATHS } from '@/constants';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import { STEPS_ITEMS } from './constant';
import styles from './index.less';

const AddStatement = () => {
  const { modal } = App.useApp();
  const { state, reset } = useModel('bill.addVendorStatement');
  console.log({ state });

  const goList = useCallback(() => {
    modal.confirm({
      title: 'AP Statement List',
      content: 'Confirm return to the AP Statement List',
      okText: 'Confirm',
      width: 530,
      maskClosable: false,
      closable: true,
      // cancelButtonProps: { style: { display: 'none' } },
      onOk() {
        reset();
        history.replace(PATHS.BILLING_VENDOR_STATEMENT);
      },
      onCancel() {
        // do nothing
      },
    });
  }, []);

  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  return (
    <>
      <div className={cls('addStatement', styles.addStatement)}>
        <section className="step-bar">
          <div className="steps">
            <Button icon={<ArrowLeftOutlined />} onClick={() => goList()}>
              Back
            </Button>
            {state.showStepBar && (
              <div className="step-comp">
                <Steps
                  current={state.stepCurrent}
                  status={state.stepStatus}
                  items={STEPS_ITEMS}
                />
              </div>
            )}
          </div>
        </section>
        <section className="step-content">
          <section
            className={cls('section', state.stepCurrent !== 0 && styles.hidden)}
          >
            <Step1 />
          </section>
          {state.stepCurrent === 1 && (
            <section className="section">
              <Step2 />
            </section>
          )}
        </section>
      </div>
    </>
  );
};

export default AddStatement;
