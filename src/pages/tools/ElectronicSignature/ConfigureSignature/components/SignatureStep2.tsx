import CustomPopover from '@/components/CustomPopover';
import { SIGNATURE_AVATAR_COLOR_LIST, SignatureTypeEnum } from '@/constants';

import { findDuplicates } from '@/utils/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Affix, App, Button, Col, Row, message } from 'antd';
import cls from 'classnames';
import { intersectionBy } from 'lodash';
import { FC, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { eSignatureEmailCheck } from '@/api/tool';
import AddRecipients from '../../components/AddRecipients';
import SignatureStepTitle from './SignatureStepTitle';
import styles from './common.less';
interface IProps {
  todo?: any;
}

interface IFormState {
  name: string;
  email: string;
}
const SignatureStep2: FC<IProps> = () => {
  const { modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const { getStepData, setStepData, doPrev, doNext } =
    useModel('signature.detail');
  const step1Data = getStepData(0);
  const { initialState } = useModel('@@initialState');
  const signersFormRef = useRef<any>();
  const ccFormRef = useRef<any>();

  const signerPopover = () => (
    <div className={styles.recipientsPopover}>
      <p>Signers are individuals required to sign the document.</p>
      <p>Enter the email addresses of each signer.</p>
      <p>
        If the document requires multiple signatures, you can set the order in
        which signers should sign.
      </p>
      <p>Signers will complete their signatures upon receiving the document.</p>
    </div>
  );
  const ccPopover = () => (
    <div className={styles.recipientsPopover}>
      <p>
        CCs are individuals who receive notifications about the signing process
        but do not sign the document themselves.
      </p>
      <p>Enter the email addresses of CCs.</p>
      <p>
        CCs will be notified of the signing progress but will not be involved in
        the signing action.
      </p>
    </div>
  );

  // const regularVerification = (arr: IFormState[]) => {
  //   const reg = REGEXP.INTELUCKEMAIL;
  //   const bol = arr.every((i) => reg.test(i.email));
  //   return bol;
  // };

  const formatInfoDataHandle = (list: IFormState[], type: string) => {
    return list.map((item: IFormState, index: number) => {
      const len = SIGNATURE_AVATAR_COLOR_LIST.length;
      const idx = index >= len ? index - len : index;
      return {
        mainColor: SIGNATURE_AVATAR_COLOR_LIST[idx]?.bgColor,
        colorId: idx,
        needVerify: true,
        signOrder: index,
        email: item.email,
        signerId: `${type}_${uuidv4()}`,
        name: item.name,
        signFields: [],
      };
    });
  };

  const reset = () => {
    signersFormRef.current?.resetFields?.();
    ccFormRef.current?.resetFields?.();
  };

  const handleNext = async () => {
    await signersFormRef?.current?.validateFields?.();
    await ccFormRef?.current?.validateFields?.();

    const { list: _signerList } = signersFormRef?.current?.getFieldsValue?.();
    const { list: _ccList } = ccFormRef?.current?.getFieldsValue?.();

    const signersEqual = findDuplicates(_signerList, 'email');
    const ccEqual = findDuplicates(_ccList, 'email');
    const ccIncludeAccount = _ccList.some(
      (i: { email: string }) => i.email === initialState?.currentUser?.email,
    );
    const signersAndCcEqual = intersectionBy(_signerList, _ccList, 'email');

    //Signature Type为Internal Signature时，需要保证全部Signer和CC的邮箱都是内部邮箱（域名为“@inteluck.com”）
    // if (step1Data?.signatureType === SignatureTypeEnum.INTERNAL) {
    //   if (!regularVerification(_signerList) || !regularVerification(_ccList)) {
    //     message.error(
    //       'The signature under the Internal Signature type only supports email addresses with inteluck domain names.',
    //     );
    //     return;
    //   }
    // }
    //一个Signature中，一个邮箱只能在Signer或CC中出现一次
    if (signersEqual.length) {
      message.error('Email duplicate in Signer');
      return;
    }
    if (ccEqual.length) {
      message.error('Email duplicate in CC');
      return;
    }
    //CC List 中不能包含当前账号的邮箱
    if (ccIncludeAccount) {
      message.error('No need to CC this Signature to yourself');
      return;
    }
    //一个Signature中，一个邮箱只能在Signer或CC中出现一次
    if (signersAndCcEqual.length) {
      message.error(
        'Each email address should be unique and cannot be assigned to multiple roles (Signer/CC) or multiple Signers/CCs. Please ensure each participant has a distinct email address',
      );
      return;
    }

    const emailList = [
      ..._signerList.map((item: { email: string }) => item?.email),
      ..._ccList.map((item: { email: string }) => item?.email),
    ];
    setLoading(true);
    const res = await eSignatureEmailCheck({
      emailList: emailList,
      internalOrExternal:
        step1Data?.signatureType === SignatureTypeEnum.INTERNAL,
    });
    if (res.code === 200) {
      setLoading(false);
      if (res.data.code !== 0) {
        message.error(res.data.msg);
        return;
      }
    }
    const signerList = formatInfoDataHandle(_signerList, 'signer');
    const ccList = formatInfoDataHandle(_ccList, 'cc');

    // console.log('signers: ', signerList);
    // console.log('cc: ', ccList);
    setStepData(1, { signerList, ccList });

    doNext();
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

  return (
    <>
      <div
        className={cls(
          'signatureStep',
          'signatureStep2',
          styles.signatureStep,
          styles.signatureStep2,
        )}
      >
        <section className="header">
          <SignatureStepTitle />
        </section>
        <section className="content">
          <Row className={styles.recipients}>
            <Col span={12}>
              <div className={styles.recipientsTitle}>
                Signer
                <CustomPopover content={signerPopover} placement="top">
                  <QuestionCircleOutlined />
                </CustomPopover>
              </div>
              <AddRecipients ref={signersFormRef} formName="signersList" />
            </Col>
            <Col span={12} className={styles.recipientsRight}>
              <div className={styles.recipientsTitle}>
                CC
                <CustomPopover content={ccPopover} placement="top">
                  <QuestionCircleOutlined />
                </CustomPopover>
              </div>
              <AddRecipients ref={ccFormRef} formName="CC" />
            </Col>
          </Row>
        </section>
        <Affix offsetBottom={0}>
          <section className="footer">
            <div className="btns">
              <Button onClick={() => handlePrev()}>Previous</Button>
              <Button
                type="primary"
                onClick={() => {
                  handleNext();
                }}
                loading={loading}
              >
                Next
              </Button>
            </div>
          </section>
        </Affix>
      </div>
    </>
  );
};

export default SignatureStep2;
