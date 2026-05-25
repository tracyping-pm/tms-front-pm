import { getSignatureMaterialByFileId } from '@/api/tool';
import { SignatureModeEnum } from '@/constants';
import { ProSkeleton } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Affix, App, Button } from 'antd';
import cls from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';
import SignatureBase from '../../SignatureBase';
import SignatureStepTitle from './SignatureStepTitle';
import styles from './common.less';

interface IProps {
  todo?: any;
}

const SignatureStep3: FC<IProps> = () => {
  const { message, modal } = App.useApp();
  const { state, getStepData, setStepData, doPrev, doNext } =
    useModel('signature.detail');
  const step1Data = getStepData(0);
  const step2Data = getStepData(1);
  const [pdfStr, setPdfStr] = useState<string>();
  const signatureBaseRef = useRef<any>();
  const reset = () => {
    signatureBaseRef?.current?.reset?.();
  };

  const handleNext = () => {
    const validateInfo = signatureBaseRef?.current?.checkRequired?.();

    if (validateInfo.passed) {
      const signFields = signatureBaseRef?.current?.getSignFields?.();
      setStepData(state.stepCurrent, {
        signFields: signFields,
      });
      doNext();
    } else {
      message.warning(validateInfo.reason);
    }
  };

  const handlePrev = () => {
    modal.confirm({
      title: 'Previous',
      content: `Confirm to clear the content entered in this step and return to the previous step`,
      onOk: async () => {
        reset();
        doPrev();
      },
      onCancel() {},
    });
  };

  const getPDFStr = async (signatureFileId: number) => {
    const res = await getSignatureMaterialByFileId({ id: signatureFileId });
    if (res.code === 200) {
      const pdfString = 'data:application/pdf;base64,' + res.data;
      setPdfStr(pdfString);
    }
  };

  useEffect(() => {
    if (step1Data?.signatureFileId) {
      getPDFStr(step1Data.signatureFileId);
    }
  }, [step1Data?.signatureFileId]);

  return (
    <>
      <div
        className={cls(
          'signatureStep',
          'signatureStep3',
          styles.signatureStep,
          styles.signatureStep3,
        )}
      >
        <section className="content">
          {pdfStr ? (
            <SignatureBase
              mode={SignatureModeEnum.INIT}
              pdfName={step1Data?.fileName}
              pdfStr={pdfStr}
              signers={step2Data?.signerList}
              header={<SignatureStepTitle />}
              ref={signatureBaseRef}
            />
          ) : (
            <ProSkeleton type="descriptions" />
          )}
        </section>
        <Affix offsetBottom={0}>
          <section className="footer">
            <div className="btns">
              <Button onClick={() => handlePrev()}>Previous</Button>
              <Button type="primary" onClick={() => handleNext()}>
                Next
              </Button>
            </div>
          </section>
        </Affix>
      </div>
    </>
  );
};

export default SignatureStep3;
