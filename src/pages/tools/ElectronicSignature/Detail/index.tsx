import { App, Button, Checkbox, Dropdown, Form, Space, Spin } from 'antd';

import {
  EsignatureEmailType,
  getPdf,
  signatureDetail,
  signatureMaterialFile,
} from '@/api/tool';
import { ISignatureDetail } from '@/api/types/tool';
import { SignatureModeEnum } from '@/constants';
import { DownOutlined, StopOutlined } from '@ant-design/icons';
import { ProSkeleton } from '@ant-design/pro-components';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import SignatureBase from '../SignatureBase';
import CodeValidateModal from '../components/CodeValidateModal';
import ConfirmModal from '../components/ConfirmModal';
import ContractHeader from '../components/ContractHeader';
import styles from './styles.less';

const defaultDetail = {
  id: 0,
  name: '',
  lastSign: false,
  editEnable: false,
  status: '',
  deadline: '',
  signingEmail: '',
  signingId: -1,
  signerList: [],
  ccList: [],
  signFields: [],
  signingName: '',
  driveFileId: '',
  materialId: 0,
};

const ContractDetail = () => {
  const { message, modal } = App.useApp();
  const { id, email } = queryString.parse(location.search);
  const [form] = Form.useForm();
  const signBaseRef = useRef<any>();
  const [pending, setPending] = useState<boolean>(false);
  const [originData, setOriginData] = useState<ISignatureDetail>(defaultDetail);
  const [pdfStr, setPdfStr] = useState<string>();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [showCodeValidateModal, setShowCodeValidateModal] =
    useState<boolean>(false);
  const [signType, setSignType] = useState<EsignatureEmailType>(
    EsignatureEmailType.SIGN,
  );
  const [downloadPending, setDownloadPending] = useState<boolean>(false);

  const getPDFStr = async (fileId: string) => {
    setPending(true);
    const res = await getPdf({ id: fileId }).finally(() => {
      setPending(false);
    });
    if (res.code === 200) {
      const pdfString = 'data:application/pdf;base64,' + res.data;
      setPdfStr(pdfString);
    }
  };

  const getBaseInfo = async (payload: { id: string; email: string }) => {
    setPending(true);
    const res = await signatureDetail(payload).finally(() => {
      setPending(false);
    });
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const selectDecline = () => {
    setSignType(EsignatureEmailType.Decline);
    setShowCodeValidateModal(true);
  };

  const beforeConfirm = () => {
    const values = form.getFieldsValue();
    const required = signBaseRef?.current?.checkSigningRequired();
    if (!required?.passed) {
      message.warning(required?.reason);
      return;
    }
    if (values?.terms) {
      setSignType(EsignatureEmailType.SIGN);
      setShowCodeValidateModal(true);
    } else {
      setOpenModal(true);
    }
  };

  const timeFinish = () => {
    modal.warning({
      title: 'Warning',
      content: 'Signature has expired',
      okText: 'Refresh Page',
      onOk: () => {
        window?.location?.reload?.();
      },
    });
  };

  const onDownload = async () => {
    setDownloadPending(true);
    const payload = {
      materialId: originData.materialId,
      driveFileId: originData.driveFileId,
      fileName: originData.name,
    };
    const res = await signatureMaterialFile(payload);
    setDownloadPending(false);
    if (res.code === 200) {
      const link = document.createElement('a');
      link.href = res.data;
      link.download = `${payload.fileName}`;

      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  useEffect(() => {
    if (id && email) {
      getBaseInfo({ id, email } as { id: string; email: string });
      getPDFStr(id as string);
    } else {
      message.error('Unknown Signature, Please check link address is useful!');
    }
  }, [id, email]);

  return (
    <div className={styles.contract}>
      {/* header */}
      <div className={styles.header}>
        <div className={styles.header_title}>
          <img className={styles.header_logo} src="/img/logo.png" />
          Inteluck TMS
        </div>
        <div className={styles.header_right}>
          {originData.status === 'Pending' && originData?.signingId ? (
            <Spin spinning={pending || !pdfStr}>
              <div className={styles.header_form}>
                <Form
                  form={form}
                  layout="inline"
                  autoComplete="off"
                  onFinish={() => {}}
                >
                  <Form.Item name="terms" valuePropName="checked">
                    <Checkbox>
                      I have read and agree to the Terms and Conditions for
                      Electronic Signature
                    </Checkbox>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" onClick={beforeConfirm}>
                      Confirm Signing
                    </Button>
                  </Form.Item>
                </Form>
                <Dropdown
                  menu={{
                    items: [
                      {
                        label: 'Decline',
                        key: '1',
                        icon: (
                          <StopOutlined
                            style={{
                              width: '14px',
                              height: '14px',
                              marginRight: '6px',
                            }}
                          />
                        ),
                      },
                    ],
                    onClick: selectDecline,
                  }}
                >
                  <Button type="text">
                    <Space>
                      Other
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
            </Spin>
          ) : null}
          {originData.status === 'Completed' && (
            <Button
              type="primary"
              loading={downloadPending}
              onClick={() => onDownload()}
            >
              Download File
            </Button>
          )}
        </div>
      </div>
      {/* container */}
      <div className={styles.container}>
        {pending || !pdfStr ? (
          <ProSkeleton type="descriptions" />
        ) : (
          <SignatureBase
            ref={signBaseRef}
            mode={
              originData.editEnable
                ? SignatureModeEnum.SIGNING
                : SignatureModeEnum.READONLY
            }
            header={
              <ContractHeader
                timeFinish={timeFinish}
                dateTime={originData.deadline}
                status={originData.status}
              />
            }
            pdfName={originData.name}
            pdfStr={pdfStr}
            signers={originData.signerList ?? []}
            ccList={originData.ccList ?? []}
            signFields={originData.signFields ?? []}
            signingName={originData.signingName ?? []}
            offset={160}
          />
        )}
      </div>
      <ConfirmModal
        open={openModal}
        onOk={() => {
          setSignType(EsignatureEmailType.SIGN);
          setOpenModal(false);
          form.setFieldValue('terms', true);
          setShowCodeValidateModal(true);
        }}
        hideModal={() => setOpenModal(false)}
      />
      {showCodeValidateModal && (
        <CodeValidateModal
          open={showCodeValidateModal}
          originData={originData}
          signBaseRef={signBaseRef}
          esignatureEmailType={signType}
          onCancel={() => setShowCodeValidateModal(false)}
        />
      )}
    </div>
  );
};

export default ContractDetail;
