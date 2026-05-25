import { copyWaybill } from '@/api/waybill';
import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormDateTimePicker,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
import { App } from 'antd';
import dayjs from 'dayjs';
import { Key, useRef } from 'react';

type ICustomerModal = ModalFormProps & {
  bindingProject?: {
    id: number;
    name: string;
  };
  selectedRowKeys: Key[];
  hideModal: () => void;
  refresh: () => void;
};

const WaybillCopyModal = ({
  width = 480,
  hideModal,
  refresh,
  selectedRowKeys,
  bindingProject,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message, modal } = App.useApp();
  const formRef = useRef<ProFormInstance>();

  const submit = async (params: {
    positionTime: string;
    destinationTime: string;
  }) => {
    if (dayjs(params.positionTime).valueOf() < dayjs().valueOf()) {
      modal.confirm({
        title: 'Copy Confirm',
        icon: <ExclamationCircleFilled />,
        content:
          'You are creating a waybill that is earlier than the current time',
        okText: 'Confirm',
        cancelText: 'Cancel',
        okButtonProps: {
          style: { outline: 'none' },
        },
        onOk: async () => {
          const res = await copyWaybill({
            waybillIds: selectedRowKeys,
            positionTime: dayjs(params.positionTime).format(
              'YYYY-MM-DD HH:mm:ss',
            ),
            destinationTime: dayjs(params?.destinationTime).format(
              'YYYY-MM-DD HH:mm:ss',
            ),
          });
          if (res.code === 200) {
            message.success(`Copy successfully!`);
            hideModal();
            refresh();
          }
        },
      });
    } else {
      const res = await copyWaybill({
        waybillIds: selectedRowKeys,
        positionTime: params.positionTime,
        destinationTime: params?.destinationTime ?? undefined,
      });
      if (res.code === 200) {
        message.success(`Copy successfully!`);
        hideModal();
        refresh();
      }
    }
  };

  return (
    <>
      <ModalForm
        name="waybill-copy-modal"
        open={true}
        title={`Copy Waybills`}
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
        initialValues={{
          projectName: bindingProject?.name,
          positionTime: dayjs().startOf('hour'),
        }}
        onFinish={submit}
        {...restProps}
      >
        <ProFormDateTimePicker
          fieldProps={{
            style: { width: '100%' },
          }}
          name="positionTime"
          label="Position Time"
          placeholder="Position Time"
          rules={[
            {
              required: true,
              message: 'Please enter position time',
            },
          ]}
        />

        <ProFormDateTimePicker
          fieldProps={{
            style: { width: '100%' },
            showTime: { defaultValue: dayjs().startOf('hour') },
          }}
          name="destinationTime"
          label="Required Delivery Time"
          placeholder="Required Delivery Time"
          rules={[
            {
              required: true,
              message: 'Please enter Required Delivery Time',
            },
            {
              validator: (rule, value) => {
                if (!value) {
                  return Promise.resolve();
                } else {
                  const positionTime =
                    formRef.current?.getFieldValue('positionTime');
                  if (dayjs(value).isAfter(dayjs(positionTime), 's')) {
                    return Promise.resolve();
                  } else {
                    return Promise.reject(
                      'Required Delivery Time needs to be later than position time',
                    );
                  }
                }
              },
            },
          ]}
        />

        {bindingProject ? (
          <ProFormText
            name="projectName"
            disabled={!!bindingProject}
            label="Project Name"
            placeholder="Project Name"
            rules={[
              {
                required: true,
                message: 'Please enter project name',
              },
            ]}
          />
        ) : null}
      </ModalForm>
    </>
  );
};

export default WaybillCopyModal;
