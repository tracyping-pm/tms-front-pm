import {
  EsignatureEmailType,
  pdfDeclineSign,
  pdfSign,
  postSendVerificationCode,
} from '@/api/tool';
import { ISignatureDetail } from '@/api/types/tool';
import { CheckCircleFilled } from '@ant-design/icons';
import { App, Button, Modal, ModalProps, message } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import './index.less';

enum SIGN_RES_CODE {
  PASS = 0,
  CODE_ERROR = 1,
  SIGN_ERROR = 2,
}

const CODE_LENGTH = 6;

interface ValidateModalProps extends ModalProps {
  originData: ISignatureDetail;
  signBaseRef: any;
  esignatureEmailType: EsignatureEmailType;
  onCancel: () => void;
}

const CodeValidateModal = ({
  originData,
  signBaseRef,
  width = 518,
  esignatureEmailType,
  onCancel,
  ...restProps
}: ValidateModalProps) => {
  const { modal } = App.useApp();
  const [obtainedCode, setObtainedCode] = useState(false);
  const [inputCodes, setInputCodes] = useState('');
  const [codeIsWrong, setCodeIsWrong] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      (inputCodes.length === CODE_LENGTH &&
        !['Backspace', 'Delete'].includes(e.key)) ||
      !obtainedCode ||
      loading
    ) {
      return;
    }
    // 键盘输入的是数字
    if (e.key >= '0' && e.key <= '9') {
      setInputCodes((prevCode: string) => prevCode + e.key);
      if (activeIndex < CODE_LENGTH) {
        setActiveIndex(activeIndex + 1);
      }
    }
    // keyCode 8 为 Backspace 键，keyCode 46 为 Delete 键
    else if (['Backspace', 'Delete'].includes(e.key)) {
      setInputCodes((prevCode: string) => prevCode.slice(0, -1));
      if (codeIsWrong) {
        setCodeIsWrong(false);
      }
      if (activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
      }
    }
  };

  const getSmsCode = () => {
    setCountdown(60);
    postSendVerificationCode({
      signerId: originData.signingId,
      esignatureEmailType,
    });
    timer.current = setInterval(() => {
      setCountdown((prevSeconds) => {
        if (prevSeconds === 0) {
          if (timer.current) {
            clearInterval(timer.current);
          }
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputCodes, obtainedCode]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);

  const typeModal = (type: SIGN_RES_CODE) => {
    let content =
      'You have declined to sign the agreement. This signature process has now been terminated';
    if (type === SIGN_RES_CODE.PASS) {
      content = originData?.lastSign
        ? 'You have completed the electronic signature. The electronic signature is now fully completed.'
        : 'You have completed the electronic signature, please wait for the subsequent signer to complete the signing';
    }
    modal.confirm({
      title:
        type === SIGN_RES_CODE.PASS ? 'Confirm Signing' : 'Decline Signature',
      icon: <CheckCircleFilled style={{ color: '#52C41A' }} />,
      content,
      okText: 'Ok',
      cancelButtonProps: {
        style: { display: 'none' },
      },
      onOk() {
        window?.location?.reload?.();
      },
    });
  };

  const pdfSignConfirm = async () => {
    setLoading(true);
    message.info(
      "The signing process will take some time. Going to another page won't affect the sign result.",
    );
    const signingElements = await signBaseRef?.current?.getSigningElements();
    const res = await pdfSign({
      signingElements,
      id: originData.id,
      verificationCode: inputCodes,
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      const data = res.data;
      if (data.code === SIGN_RES_CODE.CODE_ERROR) {
        setCodeIsWrong(true);
      } else if (data.code === SIGN_RES_CODE.SIGN_ERROR) {
        message.error(data.msg);
        onCancel();
      } else {
        onCancel();
        typeModal(SIGN_RES_CODE.PASS);
      }
    }
  };
  const pdfDeclineSignConfirm = async () => {
    setLoading(true);
    const res = await pdfDeclineSign({
      id: originData.id,
      verificationCode: inputCodes,
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      onCancel();
      typeModal(SIGN_RES_CODE.SIGN_ERROR);
    }
  };

  const handleSubmit = async () => {
    if (obtainedCode) {
      if (esignatureEmailType === EsignatureEmailType.SIGN) {
        await pdfSignConfirm();
      } else {
        await pdfDeclineSignConfirm();
      }
    } else {
      setObtainedCode(true);
      getSmsCode();
    }
  };

  const getContent = useCallback(() => {
    if (obtainedCode) {
      return (
        <div className="content-wrap">
          <div className="content-wrap-msg">
            The system has sent SMS Code to your email
          </div>
          <div className="content-wrap-msg">{originData.signingEmail}</div>
          <div className="content-wrap-msg">
            Please enter the SMS Code received
          </div>
          <div className="content-wrap-code">
            {Array.from({ length: CODE_LENGTH }).map((_, index) => (
              <div
                className={`content-wrap-code-item ${
                  activeIndex === index ? 'active' : ''
                } ${codeIsWrong && 'code-error'}`}
                key={index}
              >
                {inputCodes.split('')[index] || ''}
              </div>
            ))}
            <Button
              key="submit"
              type="primary"
              style={{ width: 78, borderRadius: 2 }}
              disabled={countdown > 0}
              onClick={getSmsCode}
            >
              {countdown > 0 ? countdown + 's' : 'Resend'}
            </Button>
            {countdown === 0 && (
              <span className="content-wrap-code-tip">Did not receive?</span>
            )}
          </div>
          {codeIsWrong && (
            <div className="content-wrap-tip">
              Wrong SMS Code, please enter again
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="content-wrap">
        You are signing
        <span className="content-wrap-email"> {originData.name} </span>
        Click to get SMS Code and we will send the SMS Code to your email. You
        need to enter the SMS Code into the input box, and the contract can be
        completed after confirmation.
      </div>
    );
  }, [obtainedCode, inputCodes, countdown, codeIsWrong, activeIndex]);

  const getBtnText = useCallback(() => {
    if (!obtainedCode) {
      return 'Get SMS Code';
    }
    return esignatureEmailType === EsignatureEmailType.SIGN
      ? 'Confirm Signing'
      : 'Decline Signing';
  }, [obtainedCode, esignatureEmailType]);

  const getFooter = useCallback(() => {
    return (
      <div className="footer">
        <Button
          key="cancel"
          onClick={onCancel}
          style={{ marginRight: 8, borderRadius: 2 }}
        >
          Cancel
        </Button>
        <Button
          key="submit"
          type="primary"
          style={{ borderRadius: 2 }}
          disabled={obtainedCode && inputCodes.length !== CODE_LENGTH}
          loading={loading}
          onClick={handleSubmit}
        >
          {getBtnText()}
        </Button>
      </div>
    );
  }, [obtainedCode, inputCodes, loading]);

  return (
    <Modal
      open={true}
      title={`Sign Agreement-${
        esignatureEmailType === EsignatureEmailType.SIGN
          ? 'Agree'
          : esignatureEmailType
      }`}
      className="code-validate"
      width={width}
      onCancel={onCancel}
      footer={getFooter()}
      destroyOnClose={true}
      maskClosable={false}
      {...restProps}
    >
      {getContent()}
    </Modal>
  );
};

export default CodeValidateModal;
