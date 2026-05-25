import { PATHS } from '@/constants';
import { useModel } from '@umijs/max';
import { Button, Result } from 'antd';
import cls from 'classnames';
import { FC, useCallback } from 'react';
import styles from './common.less';

interface IProps {
  todo?: any;
}

const SignatureStepInitiate: FC<IProps> = () => {
  const { state } = useModel('signature.detail');

  const handleViewSignature = useCallback(() => {
    const url = `${PATHS.SIGNATURES_DETAIL}?id=${state.completeInfo?.idAES}&email=${state.completeInfo?.emailAES}`;
    window.open(url, '_blank');
  }, [state.completeInfo]);

  return (
    <>
      <div
        className={cls('signatureStepInitiate', styles.signatureStepInitiate)}
      >
        <section className="content">
          <Result
            status="success"
            title="Signature initiated"
            subTitle="You have successfully initiated electronic signature, please wait for the signer to sign"
            extra={[
              <Button
                type="primary"
                key="view-signature"
                onClick={handleViewSignature}
              >
                View Signature
              </Button>,
            ]}
          />
        </section>
      </div>
    </>
  );
};

export default SignatureStepInitiate;
