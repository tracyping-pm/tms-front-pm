import { addSignature } from '@/api/tool';
import CustomPopover from '@/components/CustomPopover';
import IconCountry from '@/components/RoleCard/IconCountry';
import { MAX_LENGTH } from '@/constants';
import {
  ExclamationCircleFilled,
  SendOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Affix, App, Button, Empty, Form, Input, InputNumber } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';
import SignatureStepTitle from './SignatureStepTitle';
import styles from './common.less';

interface IProps {
  todo?: any;
}

const DocumentItem = ({
  title,
  type = 'text',
  fileName,
  signers = [],
}: {
  title: string;
  fileName?: string;
  type?: 'text' | 'user';
  signers?: {
    name: string;
    email: string;
    colorId: number;
    mainColor: string;
  }[];
}) => {
  return (
    <div>
      <div className={styles.signatureStep4_docs}>{title}</div>
      <div className={styles.signatureStep4_line}>
        {type === 'text' ? (
          <div className={styles.signatureStep4_text}>
            <CustomPopover content={fileName} placement="top">
              {fileName}
            </CustomPopover>
          </div>
        ) : (
          <div className={styles.signatureStep4_flow}>
            {signers?.map((item) => (
              <div key={item.email} className={styles.signatureStep4_user}>
                <div
                  className={styles.signatureStep4_user_avatar}
                  style={{
                    backgroundColor: item.mainColor,
                  }}
                >
                  {item.name.slice(0, 1)}
                </div>
                <div className={styles.signatureStep4_user_content}>
                  <div className={styles.signatureStep4_user_name}>
                    {item.name}
                  </div>
                  <div className={styles.signatureStep4_user_email}>
                    {item.email}
                  </div>
                </div>
              </div>
            ))}
            {signers.length === 0 && (
              <>
                <Empty
                  style={{ marginBlock: 11 }}
                  description="no data"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SignatureStep4: FC<IProps> = () => {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const { state, doPrev, doInitiate, setStepData, getStepData } =
    useModel('signature.detail');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const step1Data = getStepData(0);
  const step2Data = getStepData(1);
  const step3Data = getStepData(2);
  console.log({ step1Data, step3Data });

  const reset = () => {
    form?.resetFields?.();
  };

  const submit = async () => {
    const values = form.getFieldsValue();
    setSubmitLoading(true);
    const res = await addSignature({
      name: values?.signatureName,
      signingTimeLimit: Number(values?.signingTimeLimit),
      signatureType: step1Data?.signatureType,
      materialId: step1Data?.signatureFileId,
      certificateId: step1Data?.contractingEntity,
      signerList: step2Data?.signerList?.map((item: any) => ({
        name: item?.name,
        email: item?.email,
        sort: item?.signOrder,
        mainColor: item?.mainColor,
      })),
      ccList: step2Data?.ccList?.map((item: any) => ({
        name: item?.name,
        email: item?.email,
        mainColor: item?.mainColor,
      })),
      signFields: step3Data?.signFields,
    });
    setSubmitLoading(false);
    if (res.code === 200) {
      const stepData = {
        ...state.stepData,
        ...values,
      };
      setStepData(state.stepCurrent, stepData);
      doInitiate(res.data);
    }
  };

  const initiate = () => {
    modal.confirm({
      title: 'Confirm Initiate',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to initiate this electronic signature',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: submit,
      onCancel() {
        // do nothing
      },
    });
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
  const checkTimeHandle = (days: number = 7) => {
    const contractingTime = step1Data.contractingTime;

    const plusDays = dayjs().add(days, 'day');

    const isAfter = plusDays.isAfter(dayjs(`${contractingTime} 23:59:59`));
    if (isAfter) {
      form.setFields([
        {
          name: 'signingTimeLimit',

          warnings: [
            `${contractingTime} The contracting entity certificate will expire`,
          ],
          validating: false,
        },
      ]);
    }
  };

  useEffect(() => {
    form.setFieldValue('signatureName', step1Data?.fileName);
  }, [step1Data]);

  useEffect(() => {
    if (step3Data) {
      checkTimeHandle();
    }
  }, [step3Data]);

  return (
    <>
      <div
        className={cls(
          'signatureStep',
          'signatureStep4',
          styles.signatureStep,
          styles.signatureStep4,
        )}
      >
        <section className="header">
          <SignatureStepTitle />
        </section>
        <section className="content" style={{ padding: 0 }}>
          <div className={styles.signatureStep4_content}>
            <div className={styles.signatureStep4_content_left}>
              <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                style={{ margin: '12px 0 0 24px' }}
                initialValues={{
                  signatureName: step1Data?.fileName,
                  signingTimeLimit: 7,
                }}
                onFinish={initiate}
              >
                <div className={styles.signatureStep4_contractingEntity}>
                  <div className={styles.signatureStep4_contractingEntityLabel}>
                    Contracting Entity
                  </div>
                  <div>
                    <IconCountry regionId={step1Data?.regionId} />
                    <span className={styles.regionName}>
                      {step1Data?.regionName}
                    </span>
                    <span
                      className={styles.signatureStep4_contractingEntityTime}
                    >{`Validity period of contract entity certificate:${step1Data?.contractingTime}`}</span>
                  </div>
                </div>
                <Form.Item
                  label="Signature Name"
                  name="signatureName"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter signature name',
                    },
                    {
                      max: MAX_LENGTH.NAME_200,
                      message: `Signature Name must not exceed ${MAX_LENGTH.NAME_200} characters in length`,
                    },
                  ]}
                  style={{ width: '400px' }}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Signing Time Limit"
                  name="signingTimeLimit"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter signing time limit',
                    },
                  ]}
                  style={{ width: '400px' }}
                >
                  <InputNumber
                    style={{ width: '400px' }}
                    min={1}
                    precision={0}
                    max={30}
                    controls={false}
                    suffix="Days"
                    onChange={(v) => {
                      checkTimeHandle(v!);
                    }}
                  />
                </Form.Item>
              </Form>
            </div>
            <div className={styles.signatureStep4_content_right}>
              <DocumentItem title="Document" fileName={step1Data?.fileName} />
              <DocumentItem
                title="Signer"
                type="user"
                signers={step2Data?.signerList}
              />
              <DocumentItem
                title="CC"
                type="user"
                signers={step2Data?.ccList}
              />
              <div className={styles.signatureStep4_note}>
                <SmileOutlined
                  style={{ color: 'rgba(0, 150, 136, 1)', marginBottom: '6px' }}
                />
                <ul>
                  <li>
                    After signing is initiated, all recipients will receive an
                    email notification immediately.
                  </li>
                  <li>
                    After completing the signature, all recipients will receive
                    the completed document
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <Affix offsetBottom={0}>
          <section className="footer">
            <div className="btns">
              <Button onClick={() => handlePrev()}>Previous</Button>
              <Button
                type="primary"
                loading={submitLoading}
                icon={<SendOutlined />}
                onClick={() => form?.submit()}
              >
                Initiate
              </Button>
            </div>
          </section>
        </Affix>
      </div>
    </>
  );
};

export default SignatureStep4;
