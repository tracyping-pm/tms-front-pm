import { statementAddWaybill, statementCheckWaybill } from '@/api/billing';
import FuzzySelector from '@/components/FuzzySelector';
import { ES_DTO_CLASS } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { App, Button, Col, Form, Modal, ModalProps, Row, Spin } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './common.less';

export interface IAddWaybillModal extends ModalProps {
  open: boolean;
  onRefresh: () => void;
  onCancel: () => void;
}

const AddWaybillModal: FC<IAddWaybillModal> = ({
  open,
  onRefresh,
  onCancel,
  ...restProps
}) => {
  const { message } = App.useApp();
  const { id: statementId } = useParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [form] = Form.useForm();

  const validateDuplicate = useCallback((waybillNumberList: string[]) => {
    let hasDuplicate = false;
    if (waybillNumberList.length > 0) {
      const duplicateMap = new Map();
      waybillNumberList.forEach((name: string, index: number) => {
        if (duplicateMap.has(name)) {
          const list = duplicateMap.get(name);
          list.push(index);
        } else {
          duplicateMap.set(name, [index]);
        }
      });
      for (const [, value] of duplicateMap) {
        if (value.length > 1) {
          hasDuplicate = true;

          value.forEach((index: number) => {
            const name = ['waybillNumberList', index, 'waybillNumber'];
            form?.setFields([
              {
                name,
                errors: ['Duplicate waybill Number'],
              },
            ]);
          });
        }
      }
    }

    return hasDuplicate;
  }, []);

  const checkWaybillNumber = async (waybillObj: any, fieldName: number) => {
    setVerifying(true);
    if (!waybillObj?.name) {
      setVerifying(false);
      return;
    }
    const payload = {
      statementId: +statementId!,
      waybillNumber: waybillObj?.name,
    };

    const res = await statementCheckWaybill(payload).finally(() => {
      setVerifying(false);
    });
    if (res.code === 200) {
      const name = ['waybillNumberList', fieldName, 'waybillNumber'];
      if (typeof res.data === 'boolean' && !res.data) {
        form?.setFields([
          {
            name,
            errors: [res.msg],
          },
        ]);
      } else {
        form?.setFields([
          {
            name,
            errors: [],
          },
        ]);
      }
    }
  };

  const onOk = async () => {
    const FieldError = await form?.getFieldsError?.();

    const hasError = FieldError?.some(
      (item) =>
        item.errors?.length &&
        !item.errors.includes('Duplicate Waybill number'),
    );
    if (hasError) {
      return;
    }

    await form.validateFields();

    const formValues = form.getFieldsValue();

    const { waybillNumberList = [] } = formValues;
    const numberList = waybillNumberList?.map(
      (item: { waybillNumber: { name: string } }) => {
        return item.waybillNumber.name;
      },
    );

    const hasDuplicate = validateDuplicate(numberList);
    if (hasDuplicate) {
      return;
    }
    setLoading(true);

    const payload = {
      statementId: +statementId!,
      waybillNumbers: numberList,
    };
    const res = await statementAddWaybill(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      message.success('Add waybill successfully!');
      onRefresh?.();
      onCancel?.();
    }
  };

  useEffect(() => {
    if (open) {
    } else {
      form.resetFields();
    }
  }, [open]);

  return (
    <>
      <Modal
        {...restProps}
        open={open}
        title="Add Waybill"
        destroyOnClose
        maskClosable={false}
        width={562}
        onOk={onOk}
        onCancel={onCancel}
        confirmLoading={loading}
        okButtonProps={{
          disabled: verifying,
        }}
      >
        <Spin spinning={verifying}>
          <Form name="add-waybill-form" form={form} layout="vertical">
            <Form.List name="waybillNumberList" initialValue={['']}>
              {(fields, { add, remove }, { errors }) => (
                <div
                  style={{ minHeight: 300, maxHeight: 500, overflowY: 'auto' }}
                >
                  {fields.map((field, index) => {
                    return (
                      <div className={styles.waybillItem} key={field.key}>
                        <Row gutter={8} style={{ width: '100%' }}>
                          <Col span={20}>
                            <Form.Item
                              {...field}
                              label={null}
                              name={[field.name, 'waybillNumber']}
                              key={field.key + 'waybillNumber'}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter Waybill Number',
                                },
                              ]}
                            >
                              <FuzzySelector
                                fieldProps={{
                                  placeholder: 'Please enter Waybill Number',
                                }}
                                request={{
                                  field: 'waybillNumber',
                                  esDtoClass: ES_DTO_CLASS.WAYBILL,
                                  type: FieldQueryHighlightTypeEnum.USER_ROLE,
                                }}
                                onChange={async (value) => {
                                  await checkWaybillNumber(value, field.name);
                                }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            {fields.length > 1 ? (
                              <Button
                                color="danger"
                                variant="text"
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(field.name)}
                              />
                            ) : null}

                            {fields?.length === index + 1 ? (
                              <Button
                                color="primary"
                                variant="text"
                                icon={<PlusCircleOutlined />}
                                onClick={() => add()}
                              />
                            ) : null}
                          </Col>
                        </Row>
                      </div>
                    );
                  })}
                  <div className={styles.fakeErrors}>{errors}</div>
                </div>
              )}
            </Form.List>
          </Form>
        </Spin>
      </Modal>
    </>
  );
};

export default AddWaybillModal;
