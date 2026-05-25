import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';

import { ICommonListItem } from '@/api/types/common';
import { ICustomerCodeListItem } from '@/api/types/waybill';
import CustomTooltip from '@/components/CustomTooltip';
import { MAX_LENGTH } from '@/constants';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Col, Form, Row } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import './common.less';
import styles from './index.less';

type ICustomerCodeModal = ModalFormProps & {
  list: ICustomerCodeListItem[];
  options: ICommonListItem[];
  onConfirm?: (data: ICustomerCodeListItem[]) => void;
};

const CustomerCodeModal: FC<ICustomerCodeModal> = ({
  width = 700,
  title = 'Edit Customer Code',
  options,
  open,
  list,
  modalProps,
  onConfirm,
  ...restProps
}) => {
  const [configNumber, setConfigNumber] = useState(list?.length || 0);
  const [formList, setFormList] = useState(list);

  const formRef = useRef<ProFormInstance>();

  const init = useCallback(async () => {
    if (list?.length) {
      formRef.current?.setFieldsValue({ customerCode: list });
    }
  }, [list]);

  const handleOk = async (params: any) => {
    const payload: ICustomerCodeListItem[] = [];
    params.customerCode?.forEach((item: ICustomerCodeListItem) => {
      if (item?.customerCodeTypeId) {
        payload.push({
          id: item.id,
          number: item.number || '',
          customerCodeTypeId: item.customerCodeTypeId,
        });
      }
    });
    onConfirm?.(payload);
  };

  const isExistCommonItem = (index: number) => {
    const fromList = formRef.current?.getFieldValue('customerCode');
    const existObj: { [key: string]: string[] } = {};
    let currentCustomerCodeTypeId;
    let currentNumber: string | undefined;
    fromList.forEach((item: ICustomerCodeListItem, idx: number) => {
      if (!item) {
        return;
      }
      if (idx === index) {
        currentCustomerCodeTypeId = item.customerCodeTypeId;
        currentNumber = item.number;
      }
      if (item.customerCodeTypeId && item.number) {
        const typeIdNumberList = existObj[item.customerCodeTypeId];
        if (typeIdNumberList) {
          existObj[item.customerCodeTypeId] = [
            ...typeIdNumberList,
            item.number,
          ];
        } else {
          existObj[item.customerCodeTypeId] = [item.number];
        }
      }
    });
    if (
      currentCustomerCodeTypeId &&
      currentNumber &&
      existObj[currentCustomerCodeTypeId]
    ) {
      const count = existObj[currentCustomerCodeTypeId].filter(
        (item: string) => item === currentNumber,
      )?.length;
      return count >= 2;
    }
    return false;
  };

  const haveRequire = useCallback(() => {
    return list.some((item) => item.required);
  }, [list]);

  useEffect(() => {
    init();
  }, [list, options]);

  return (
    <>
      <ModalForm
        name="Customer-Code"
        title={title}
        open={open}
        width={width}
        style={{
          height: configNumber > 10 ? 540 : 'auto',
          overflowY: configNumber > 10 ? 'scroll' : 'hidden',
        }}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          className: 'customer-code',
          okText: 'Confirm',
          forceRender: true,
          destroyOnClose: true,
          maskClosable: false,
          centered: true,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <Form.List name="customerCode">
          {(fields, { add, remove }) => (
            <div className={styles.addPodForm}>
              {fields.map(({ name }, index) => {
                return (
                  <Row gutter={24} className={styles.addPodFormItem} key={name}>
                    {haveRequire() && (
                      <Col span={1}>
                        {formList[index]?.required && (
                          <div style={{ color: 'red', lineHeight: '32px' }}>
                            *
                          </div>
                        )}
                      </Col>
                    )}
                    <Col span={haveRequire() ? 10 : 11}>
                      {formList[index]?.customerCodeTypeName ? (
                        <div
                          className={styles.customerCodeTypeName}
                          style={{ lineHeight: '32px' }}
                        >
                          <CustomTooltip
                            title={formList[index].customerCodeTypeName}
                          >
                            {formList[index].customerCodeTypeName}
                          </CustomTooltip>
                        </div>
                      ) : (
                        <ProFormSelect
                          name={[name, 'customerCodeTypeId']}
                          // @ts-ignore
                          options={options.map((item) => ({
                            ...item,
                          }))}
                          placeholder={`Please select Type`}
                          showSearch
                          rules={[
                            {
                              required: formList[index]?.required,
                              message: `Please select Type`,
                            },
                          ]}
                        />
                      )}
                    </Col>
                    <Col span={11}>
                      <ProFormText
                        placeholder={`Please enter Number`}
                        name={[name, 'number']}
                        rules={[
                          {
                            validator(_, value) {
                              const newList =
                                formRef.current?.getFieldValue('customerCode');
                              // 必填 || 两个输入框都有值
                              if (
                                // formList[index]?.required ||
                                newList[index]?.customerCodeTypeId &&
                                newList[index]?.number
                              ) {
                                if (!value) {
                                  return Promise.reject(
                                    new Error(`Please enter Number`),
                                  );
                                }
                                if (!value.trim()) {
                                  return Promise.reject(
                                    new Error('Cannot only contain spaces'),
                                  );
                                }
                                // if (!REGEXP.DIGIT_LETTER.test(value)) {
                                //   return Promise.reject(
                                //     new Error(`Please enter valid Number`),
                                //   );
                                // }
                                if (value?.length > MAX_LENGTH.NAME_200) {
                                  return Promise.reject(
                                    new Error(
                                      `Number cannot exceed ${MAX_LENGTH.NAME_200} characters`,
                                    ),
                                  );
                                }
                                if (isExistCommonItem(index)) {
                                  return Promise.reject(
                                    new Error(
                                      `Multiple records with the same Type and Number`,
                                    ),
                                  );
                                }
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      />
                    </Col>
                    <Col
                      span={2}
                      style={{ display: 'flex', position: 'relative' }}
                    >
                      {!formList[index]?.required && (
                        <DeleteOutlined
                          className={styles.deleteIcon}
                          onClick={() => {
                            setConfigNumber(configNumber - 1);
                            remove(index);
                            const newList =
                              formRef.current?.getFieldValue('customerCode');
                            setFormList(newList);
                          }}
                        />
                      )}
                      {fields?.length === index + 1 && (
                        <PlusCircleOutlined
                          className={styles.lineAddIcon}
                          style={{
                            left: formList[index]?.required ? 12 : 48,
                          }}
                          onClick={() => {
                            setConfigNumber(configNumber + 1);
                            add();
                            const newList =
                              formRef.current?.getFieldValue('customerCode');
                            setFormList(newList);
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                );
              })}
              {!fields?.length && (
                <PlusCircleOutlined
                  className={styles.defaultAddIcon}
                  style={{ top: 0 }}
                  onClick={() => {
                    setConfigNumber(configNumber + 1);
                    add();
                    const newList =
                      formRef.current?.getFieldValue('customerCode');
                    setFormList(newList);
                  }}
                />
              )}
            </div>
          )}
        </Form.List>
      </ModalForm>
    </>
  );
};

export default CustomerCodeModal;
