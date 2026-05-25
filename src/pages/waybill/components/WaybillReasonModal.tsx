import { toAbnormal, toCancel } from '@/api/waybill';
import { MAX_LENGTH } from '@/constants';
import {
  AbnormalReasonEnumText,
  CanceledReasonEnumText,
  WaybillReasonEnum,
} from '@/enums';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { App } from 'antd';
import { useRef } from 'react';

type ICustomerModal = ModalFormProps & {
  type: WaybillReasonEnum;
  waybillId: number;
  hideModal: () => void;
  refresh: () => void;
};

const WaybillReasonModal = ({
  width = 573,
  type,
  waybillId,
  hideModal,
  refresh,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message } = App.useApp();
  const formRef = useRef<ProFormInstance>();

  const submit = async (params: { reason: string; remarkType: string }) => {
    let res;
    if (type === WaybillReasonEnum.CANCEL) {
      res = await toCancel({
        id: waybillId,
        remarkType: params.remarkType,
        reason: params.reason,
      });
    } else {
      res = await toAbnormal({
        id: waybillId,
        remarkType: params.remarkType,
        reason: params.reason,
      });
    }
    if (res.code === 200) {
      message.success(
        `${
          type === WaybillReasonEnum.CANCEL ? 'Cancel' : 'Abnormal'
        } successfully!`,
      );
      refresh();
      hideModal();
    }
  };

  return (
    <>
      <ModalForm
        name="waybill-reason"
        open={true}
        title={
          type === WaybillReasonEnum.CANCEL ? 'Cancel Waybill' : 'Abnormal'
        }
        style={{ marginTop: '14px' }}
        width={width}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
        }}
        //@ts-ignore
        onFinish={submit}
        {...restProps}
      >
        {type === WaybillReasonEnum.CANCEL && (
          <div style={{ marginBottom: 24 }}>
            Canceled the waybill , financial status will be updated to Awaiting
            Price Verification.
          </div>
        )}
        <ProFormSelect
          name="remarkType"
          label="Reason"
          valueEnum={
            type === WaybillReasonEnum.CANCEL
              ? CanceledReasonEnumText
              : AbnormalReasonEnumText
          }
          fieldProps={{
            placeholder: `Select reason for ${
              type === WaybillReasonEnum.CANCEL ? 'cancellation' : 'Abnormal'
            }`,
          }}
          rules={[{ required: true, message: 'Please select Reason' }]}
        />
        <ProFormTextArea
          name="reason"
          label="Description"
          placeholder="input more detail"
          fieldProps={{
            // rows: 5,
            showCount: true,
            maxLength: MAX_LENGTH.MAX_2000,
          }}
          rules={[
            {
              whitespace: true,
              message: 'Not support all spaces',
            },
            {
              max: MAX_LENGTH.MAX_2000,
              message: `Description cannot exceed ${MAX_LENGTH.MAX_2000} characters`,
            },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default WaybillReasonModal;
