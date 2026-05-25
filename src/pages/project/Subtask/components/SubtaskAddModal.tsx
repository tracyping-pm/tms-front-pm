import { subtaskLikeProcessType, subtaskLikeQueryWaybill } from '@/api/subtask';
import {
  ISubtaskDetailRecord,
  SubtaskProcessTypeRecord,
  SubtaskQueryWaybillRecord,
} from '@/api/types/subtask';
import {
  ModalForm,
  ModalFormProps,
  ProFormDatePicker,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ISubtaskAddModal extends ModalFormProps {
  open: boolean;
  record?: ISubtaskDetailRecord;
  onConfirm?: (values: any, b?: boolean) => void;
}

const SubtaskAddModal = ({
  open,
  record,

  onConfirm,
  width = 480,
  modalProps,
  ...restProps
}: ISubtaskAddModal) => {
  const { initialState } = useModel('@@initialState');
  const formRef = useRef<ProFormInstance>();

  const [disabledDatePicker, setDisabledDatePicker] = useState<boolean>(false);
  const [waybillNumberOption, setWaybillNumberOption] = useState<
    { value: number; label: string; waybillNumber?: string }[]
  >([]);
  const [processTypeOption, setProcessTypeOption] =
    useState<SubtaskProcessTypeRecord>({} as SubtaskProcessTypeRecord);

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  const onFill = useCallback((curRecord: ISubtaskDetailRecord) => {
    const obj = curRecord;
    const waybillNumberObj = {
      value: obj?.waybillNumberId,
      label: obj?.waybillNumber,
      waybillNumber: obj?.waybillNumber,
    };
    setWaybillNumberOption([waybillNumberObj]);
    formRef?.current?.setFieldsValue(obj);
  }, []);

  const init = useCallback(async () => {
    if (record) {
      onFill(record);
    } else {
      reset();
    }
  }, [record]);

  const handleOk = async () => {
    const values = formRef?.current?.getFieldsValue?.();

    values.waybillNumber = waybillNumberOption?.[0]?.waybillNumber;
    const payload = {
      processDefId: processTypeOption?.processDefId ?? record?.processDefId, // subtaskLikeProcessType中返回
      buId: values.waybillNumberId,
      buType: 'TMS_WAYBILL_SUBTASK',
      dueTime: dayjs(values.dueTime).format('YYYY-MM-DD 23:59:59'),
      creator: initialState?.currentUser?.name,
    };
    onConfirm?.(payload);
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
        name="subtask-modal"
        open={open}
        title={`Subtask Creation`}
        width={width}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <ProFormSelect
          name="waybillNumberId"
          label="Waybill Number"
          placeholder="Waybill Number"
          showSearch
          dependencies={['waybillNumberId']}
          debounceTime={500}
          fieldProps={{
            optionLabelProp: 'waybillNumber',
          }}
          request={async (params) => {
            if (!params?.keyWords || params?.keyWords.length < 2) {
              return waybillNumberOption;
            }
            const res = await subtaskLikeQueryWaybill(params.keyWords);
            if (res.code === 200) {
              const options = res?.data?.map(
                (item: SubtaskQueryWaybillRecord) => {
                  return {
                    label: item.waybillNumber,
                    value: item.id,
                    ...item,
                  };
                },
              );

              return options;
            } else {
              return [];
            }
          }}
          onChange={(_, option) => {
            if (!option) {
              return;
            }
            setDisabledDatePicker(false);
            setWaybillNumberOption([option]);
            formRef.current?.resetFields([
              'processType',
              'processName',
              'dueTime',
            ]);
          }}
          disabled={!!record?.waybillNumber}
          rules={[
            {
              required: true,
              message: 'Please enter Waybill Number',
            },
          ]}
        />
        <ProFormSelect
          name="processType"
          label="Process Type"
          placeholder="Please select Process Type"
          dependencies={['waybillNumberId']}
          rules={[
            {
              required: true,
              message: 'Please select Process Type',
            },
          ]}
          onChange={(_, option) => {
            setDisabledDatePicker(!!option.dueTime);
            setProcessTypeOption(option);
            formRef.current?.setFieldsValue({
              processName: option.processName,
              dueTime: option.dueTime,
            });
          }}
          request={async (params) => {
            if (!params.waybillNumberId) {
              return [];
            }
            const payload = {
              id: params.waybillNumberId,
            };

            const res = await subtaskLikeProcessType(payload);
            if (res.code === 200) {
              const a = res?.data?.filter(
                (item) =>
                  item.processType !== 'Goods Rejection' &&
                  item.processType !== 'Shipping Claims' &&
                  item.processType !== 'Claim',
              );
              return a?.map((item: SubtaskProcessTypeRecord) => {
                return {
                  label: item.processType,
                  value: item.processTypeId,
                  disabled: item.hasUnfinishedTask,
                  ...item,
                };
              });
            } else {
              return [];
            }
          }}
        />

        <ProFormText
          name="processName"
          label="Process Name"
          placeholder="Please select Process Name"
          disabled
        />
        <ProFormDatePicker
          name="dueTime"
          label="Due Time"
          placeholder="Please select Due Time"
          disabled={disabledDatePicker}
          fieldProps={{
            style: { width: '100%' },
            disabledDate: (currentDate: any) => {
              return currentDate?.isBefore(dayjs(), 'day');
            },
          }}
          rules={[
            {
              required: true,
              message: 'Please select Due Time',
            },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default SubtaskAddModal;
