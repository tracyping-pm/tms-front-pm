import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS, STEPS_ITEMS } from '@/constants';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { App, Button, Steps } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect } from 'react';

import SignatureStep1 from './components/SignatureStep1';
import SignatureStep2 from './components/SignatureStep2';
import SignatureStep3 from './components/SignatureStep3';
import SignatureStep4 from './components/SignatureStep4';
import SignatureStepInitiate from './components/SignatureStepInitiate';
import styles from './index.less';

const Detail: FC = () => {
  const { modal } = App.useApp();
  const { state, reset } = useModel('signature.detail');

  const goList = useCallback(() => {
    modal.confirm({
      title: 'Signature List',
      content: 'Confirm return to the Signature List',
      okText: 'Confirm',
      width: 530,
      maskClosable: false,
      closable: true,
      // cancelButtonProps: { style: { display: 'none' } },
      onOk() {
        reset();
        history.replace(PATHS.TOOL_SIGNATURES);
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
      <div className={cls('signatureDetail', styles.signatureDetail)}>
        <section className="step-bar">
          <div className="breadcrumb">
            <BreadcrumbCase
              items={[
                { name: 'Electronic Signature', path: PATHS.TOOL_SIGNATURES },
                { name: 'Configure Signature', path: PATHS.TOOL_SIGNATURES },
              ]}
            />
          </div>

          <div className="steps">
            <Button icon={<ArrowLeftOutlined />} onClick={() => goList()}>
              Signature List
            </Button>
            <div className="step-comp">
              <Steps
                current={state.stepCurrent}
                status={state.stepStatus}
                items={STEPS_ITEMS}
              />
            </div>
          </div>
        </section>
        <section className="step-content">
          {state.stepStatus === 'finish' ? (
            <section className={cls('section', 'signatureStepSection')}>
              <SignatureStepInitiate />
            </section>
          ) : (
            <>
              <section
                className={cls(
                  'section',
                  state.stepCurrent !== 0 && styles.hidden,
                )}
              >
                <SignatureStep1 />
              </section>
              <section
                className={cls(
                  'section',
                  state.stepCurrent !== 1 && styles.hidden,
                )}
              >
                <SignatureStep2 />
              </section>
              <section
                className={cls(
                  'section',
                  state.stepCurrent !== 2 && styles.hidden,
                )}
              >
                <SignatureStep3 />
              </section>
              <section
                className={cls(
                  'section',
                  state.stepCurrent !== 3 && styles.hidden,
                )}
              >
                <SignatureStep4 />
              </section>
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default Detail;
