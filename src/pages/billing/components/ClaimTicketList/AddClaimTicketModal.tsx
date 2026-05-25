import { statementAddClaim, statementCheckAddClaim } from '@/api/billing';
import FuzzySelector from '@/components/FuzzySelector';
import { ES_DTO_CLASS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { App, Button, Col, Form, Modal, ModalProps, Row, Spin } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './index.less';

export interface IAddClaimTicketModal extends ModalProps {
  open: boolean;
  statementType: string;
  onRefresh: () => void;
  onCancel: () => void;
}

const AddClaimTicketModal: FC<IAddClaimTicketModal> = ({
  open,
  statementType,
  onRefresh,
  onCancel,
  ...restProps
}) => {
  const { message } = App.useApp();
  const { id: statementId } = useParams();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [form] = Form.useForm();

  const validateDuplicate = useCallback((ticketNumberList: string[]) => {
    let hasDuplicate = false;
    if (ticketNumberList.length > 0) {
      const duplicateMap = new Map();
      ticketNumberList.forEach((name: string, index: number) => {
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
            const name = ['ticketNumberList', index, 'ticketNumber'];
            form?.setFields([
              {
                name,
                errors: ['Duplicate Ticket Number'],
              },
            ]);
          });
        }
      }
    }

    return hasDuplicate;
  }, []);

  const checkTicketNumber = async (ticketObj: any, fieldName: number) => {
    setVerifying(true);
    if (!ticketObj?.name) {
      setVerifying(false);
      return;
    }
    const payload = {
      statementId: +statementId!,
      claimId: ticketObj?.id,
    };

    const res = await statementCheckAddClaim(payload).finally(() => {
      setVerifying(false);
    });
    if (res.code === 200) {
      const name = ['ticketNumberList', fieldName, 'ticketNumber'];
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
        item.errors?.length && !item.errors.includes('Duplicate Ticket Number'),
    );
    if (hasError) {
      return;
    }

    await form.validateFields();

    const formValues = form.getFieldsValue();

    const { ticketNumberList = [] } = formValues;
    const numberList = ticketNumberList?.map(
      (item: { ticketNumber: { id: number } }) => {
        return item.ticketNumber.id;
      },
    );

    const hasDuplicate = validateDuplicate(numberList);
    if (hasDuplicate) {
      return;
    }
    setLoading(true);

    const payload = {
      statementId: +statementId!,
      claimIds: numberList,
    };
    console.log(payload);
    const res = await statementAddClaim(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      message.success('Add claim ticket successfully!');
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
        title="Add Claim Ticket"
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
        <div className={styles.tips}>
          {`Only Claim Tickets ${statementType === 'AR' ? 'of this client' : 'confirmed by this supplier'} can be added, and they must not be
          associated with any other ${statementType} statements`}
        </div>
        <Spin spinning={verifying}>
          <Form name="add-claim-ticket-form" form={form} layout="vertical">
            <Form.List name="ticketNumberList" initialValue={['']}>
              {(fields, { add, remove }, { errors }) => (
                <div
                  style={{ minHeight: 300, maxHeight: 500, overflowY: 'auto' }}
                >
                  {fields.map((field, index) => {
                    return (
                      <div className={styles.ticketItem} key={field.key}>
                        <Row gutter={8} style={{ width: '100%' }}>
                          <Col span={20}>
                            <Form.Item
                              {...field}
                              label={null}
                              name={[field.name, 'ticketNumber']}
                              key={field.key + 'ticketNumber'}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter Claim Ticket Number',
                                },
                              ]}
                            >
                              <FuzzySelector
                                fieldProps={{
                                  placeholder:
                                    'Please enter Claim Ticket Number',
                                }}
                                request={{
                                  field: 'ticketNumber',
                                  esDtoClass: ES_DTO_CLASS.CLAIM_TICKET,
                                  type: FieldQueryHighlightTypeEnum.None,
                                  uniqueLogic:
                                    FieldQueryHighlightUniqueLogicEnum.CLAIM,
                                  uniqueLogicParams: { ticketType: 1 },
                                }}
                                onChange={async (value) => {
                                  await checkTicketNumber(value, field.name);
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

export default AddClaimTicketModal;
