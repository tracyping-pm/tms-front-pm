import { useParams } from '@umijs/max';
import { App, Form, Input, Modal, ModalProps, Spin } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

import { claimRequestCreate } from '@/api/claim';
import OssUpload from '@/components/OssUpload';
import { ENUM_OSS_MENU_DIRECTORY } from '@/components/OssUpload/types';
import ClaimRequestFormList from './ClaimRequestFormList';
import styles from './index.less';

export interface ICreateClaimRequestModal extends ModalProps {
  open: boolean;
  customerName: string;
  customerId: number;
  onCancel: () => void;
}

const CreateClaimRequestModal: FC<ICreateClaimRequestModal> = ({
  open,
  customerName,
  customerId,
  onCancel,
  ...restProps
}) => {
  const { message } = App.useApp();
  const { id: statementId } = useParams();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [verifying] = useState(false);

  const [form] = Form.useForm();
  const descriptionListValue = Form.useWatch('description', form);

  useEffect(() => {
    const _totalAmount = descriptionListValue?.reduce(
      (acc: any, cur: { claimAmount: number }) => {
        return acc + (cur?.claimAmount ?? 0) * 100;
      },
      0,
    );
    setTotalAmount(_totalAmount / 100);
  }, [descriptionListValue]);

  const onOk = async () => {
    const FieldError = await form?.getFieldsError?.();

    const hasError = FieldError?.some((item) => item.errors?.length);
    if (hasError) {
      return;
    }
    await form.validateFields();

    const formValues = form.getFieldsValue();
    const { proofIds, description } = formValues;
    const descriptionList = description.map((item: any) => {
      return {
        claimType: item.claimType,
        waybillId: item.waybillNumber?.id,
        responsiblePartyId: item.responsibleParty?.id,
        claimDetails: item.claimDetails,
        claimAmount: item.claimAmount,
      };
    });
    const payload = {
      statementId: +statementId!,
      materialList: proofIds,
      claimantId: customerId,
      totalClaimAmount: totalAmount,
      descList: descriptionList,
    };
    console.log(payload);
    // return;
    setLoading(true);
    const res = await claimRequestCreate(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      message.success('Add claim ticket successfully!');
      onCancel?.();
    }
  };

  useEffect(() => {
    if (open) {
    } else {
      form.resetFields();
    }
  }, [open]);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setUploadLoading(true);
    } else {
      setUploadLoading(false);
    }
  }, []);

  return (
    <>
      <Modal
        {...restProps}
        open={open}
        title="Create Claim Request"
        destroyOnClose
        maskClosable={false}
        width={1000}
        onOk={onOk}
        onCancel={onCancel}
        confirmLoading={loading || uploadLoading}
        okButtonProps={{
          disabled: verifying,
        }}
      >
        <div style={{ height: 700, overflowY: 'auto', overflowX: 'hidden' }}>
          <div className={styles.tips}>
            {`Once Created, TMS will automatically generate a ticket for each type
          of Claim Type data of each vendor, If modification are needed after
          creation,they must be made in the ticket detail.`}
          </div>
          <Spin spinning={verifying}>
            <Form
              name="create-claim-request-form"
              form={form}
              layout="vertical"
            >
              <Form.Item
                style={{ width: '60%' }}
                name="claimant"
                label="Claimant"
                rules={[{ required: true, message: 'Please input claimant' }]}
                initialValue={customerName}
              >
                <Input disabled />
              </Form.Item>

              <ClaimRequestFormList
                totalAmount={totalAmount}
                form={form}
                customerId={customerId}
              />

              <Form.Item
                style={{ width: 360 }}
                name="proofIds"
                label="Proof"
                rules={[{ required: true, message: 'Please upload Proof' }]}
              >
                <OssUpload
                  dir={ENUM_OSS_MENU_DIRECTORY.AR_AP}
                  showModeBar={true}
                  scrollHeight={200}
                  getUploadingSize={getUploadingSize}
                />
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </Modal>
    </>
  );
};

export default CreateClaimRequestModal;
