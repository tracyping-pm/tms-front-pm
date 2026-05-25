import { IWaybillRejectParams } from '@/api/types/waybill';
import { MAX_LENGTH } from '@/constants';
import { WaybillFinancialStatusEnum } from '@/enums';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormTextArea,
} from '@ant-design/pro-components';

import { FC, useCallback, useEffect, useRef } from 'react';
interface IWaybillRejectModal extends ModalFormProps {
  open: boolean;
  waybillFinancialStatus: string;
  rejectTitle: string;
  onConfirm?: (data: IWaybillRejectParams) => void;
}

const WaybillRejectModal: FC<IWaybillRejectModal> = ({
  width = 573,
  open,
  waybillFinancialStatus,
  rejectTitle = 'Reject',
  modalProps,
  onConfirm,
  ...restProps
}) => {
  const formRef = useRef<ProFormInstance>();

  const init = useCallback(async () => {}, []);

  const reset = useCallback(() => {}, []);

  const handleOk = async (params: IWaybillRejectParams) => {
    if (
      waybillFinancialStatus === WaybillFinancialStatusEnum.AWAITING_SETTLEMENT
    ) {
      params.financialStatusEnum =
        rejectTitle === 'Reject Price'
          ? WaybillFinancialStatusEnum.AWAITING_PRICE_VERIFICATION
          : WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION;
    }

    onConfirm?.(params);
  };

  useEffect(() => {
    if (open) {
      init();
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <ModalForm
        name="waybill-reject"
        title={rejectTitle}
        open={open}
        width={width}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Reject',
          forceRender: true,
          destroyOnClose: true,
          maskClosable: false,
          centered: true,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <div style={{ marginBottom: 24 }}>
          {waybillFinancialStatus ===
          WaybillFinancialStatusEnum.AWAITING_SETTLEMENT
            ? rejectTitle === 'Reject Price'
              ? 'If the price is incorrect,reject price will return financial status to Awaiting Price Verification'
              : 'If the waybill information is incorrect,reject waybill information will return financial status to Awaiting POD Verification'
            : 'If you think any price is incorrect, you can try to describe it in the reason section,It is also allowed to edit the amount yourself (Edit Amount)'}
        </div>

        <ProFormTextArea
          name="reason"
          label="Reject Reason"
          placeholder="Reject Reason"
          fieldProps={{
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
              message: `Reject Reason cannot exceed ${MAX_LENGTH.MAX_2000} characters`,
            },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default WaybillRejectModal;
