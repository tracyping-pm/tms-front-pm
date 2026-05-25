import { taxRateEdit } from '@/api/billing';
import { ITaxRateTableDataItem } from '@/api/types/billing';
import { EnumTaxRateStatus } from '@/enums';
import { formatAmount } from '@/utils/utils';
import {
  App,
  Button,
  Form,
  InputNumber,
  Modal,
  ModalProps,
  Select,
} from 'antd';
import cls from 'classnames';
import { FC, useEffect, useState } from 'react';
import styles from './index.less';

export interface IEditableModal extends ModalProps {
  rowData: ITaxRateTableDataItem;
  name: string;
  code: string;
  onCancel?: () => void;
  onSaved?: () => void;
}

const EditableModal: FC<IEditableModal> = ({
  open,
  rowData,
  name,
  code,
  onCancel,
  onSaved,
  ...restProps
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSave = async () => {
    const values = await form.getFieldsValue(true);
    const { status, vat, wht } = values;
    const payload =
      name === 'Status'
        ? {
            truckTypeId: rowData.truckTypeId,
            status,
            code,
          }
        : { truckTypeId: rowData.truckTypeId, code, vat, wht };

    setSubmitting(true);
    const res = await taxRateEdit(payload).finally(() => {
      setSubmitting(false);
    });

    if (res.code === 200) {
      message.success('update successful!');
      onSaved?.();
    }
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        status: rowData.status,
        vat: rowData['dataMap']?.[code]?.vat,
        wht: rowData['dataMap']?.[code]?.wht,
      });
    } else {
      form.resetFields();
    }
  }, [open]);

  return (
    <>
      <Modal
        title={name}
        width={408}
        open={open}
        destroyOnClose
        maskClosable={false}
        footer={null}
        centered
        onCancel={() => onCancel?.()}
        {...restProps}
      >
        <div className={cls('editable-cell-form', styles.editableCellForm)}>
          <Form form={form} name="approver-editable-form" layout="vertical">
            {name === 'Status' ? (
              <Form.Item label="Status" name="status">
                <Select
                  options={[
                    {
                      value: EnumTaxRateStatus.ENABLEMENT,
                      label: EnumTaxRateStatus.ENABLEMENT,
                    },
                    {
                      value: EnumTaxRateStatus.DISABLEMENT,
                      label: EnumTaxRateStatus.DISABLEMENT,
                    },
                  ]}
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item name={'vat'} label="VAT Rate">
                  <InputNumber
                    placeholder="VAT"
                    suffix="%"
                    // min={0}
                    precision={2}
                    formatter={(v: any) => formatAmount(v)}
                    controls={false}
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item name={'wht'} label="WHT Rate">
                  <InputNumber
                    placeholder="WHT"
                    suffix="%"
                    // min={0}
                    precision={2}
                    formatter={(v: any) => formatAmount(v)}
                    controls={false}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </>
            )}
          </Form>

          <div className="btn-group">
            <Button onClick={() => onCancel?.()}>Cancel</Button>
            <Button type="primary" loading={submitting} onClick={onSave}>
              Ok
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditableModal;
