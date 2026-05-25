import { IWaybillRevCostExportParams } from '@/api/types/waybill';
import {
  ModalForm,
  ModalFormProps,
  ProFormDateTimeRangePicker,
  ProFormInstance,
} from '@ant-design/pro-components';

import { FC, useRef } from 'react';

interface IWaybillExportRevCostModal extends ModalFormProps {
  onConfirm: (v: IWaybillRevCostExportParams) => void;
}

const WaybillExportRevCostModal: FC<IWaybillExportRevCostModal> = ({
  width = 408,

  modalProps,
  onConfirm,

  ...restProps
}) => {
  const formRef = useRef<ProFormInstance>();

  const handleOk = async (params: {
    unloadingTime: string[];
    deliveredTime: string[];
  }) => {
    const payload = {
      unloadingCompletionTimeStart: params.unloadingTime?.[0],
      unloadingCompletionTimeEnd: params.unloadingTime?.[1],
      deliveredTimeStart: params.deliveredTime?.[0],
      deliveredTimeEnd: params.deliveredTime?.[1],
    };
    onConfirm?.(payload);
  };

  return (
    <>
      <ModalForm
        name="waybill-export-rev-cost"
        title="Waybill Rev/Cost Export"
        open={true}
        width={width}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,

          forceRender: true,
          destroyOnClose: true,
          maskClosable: false,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <ProFormDateTimeRangePicker
          name="unloadingTime"
          label="Unloading Completion Time"
          fieldProps={{
            style: { width: '350px' },
          }}
          placeholder={['Start date', 'End date']}
          rules={[
            {
              required: true,
              message: 'Please select Unloading Completion Time',
            },
          ]}
        />
        <ProFormDateTimeRangePicker
          name="deliveredTime"
          label="Delivered Time"
          fieldProps={{
            style: { width: '350px' },
          }}
          placeholder={['Start date', 'End date']}
        />
      </ModalForm>
    </>
  );
};

export default WaybillExportRevCostModal;
