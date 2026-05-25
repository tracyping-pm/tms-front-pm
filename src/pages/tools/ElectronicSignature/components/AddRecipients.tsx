import { Button, Form, message } from 'antd';

import { MAX_LENGTH, REGEXP } from '@/constants';
import { FileAddOutlined } from '@ant-design/icons';
import { ProFormText } from '@ant-design/pro-components';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import styles from './common.less';

interface IAddRecipients {
  formName?: string;
  maxLength?: number;
}
const AddRecipients = forwardRef(
  ({ formName, maxLength = 20 }: IAddRecipients, ref) => {
    const [form] = Form.useForm();
    const recipientsRef = useRef(null);

    const [fieldsLength, setFieldsLength] = useState(0);

    useEffect(() => {
      // 滑动条滚动到底部
      const current = recipientsRef.current!;
      //@ts-ignore
      current.scrollTop = current.scrollHeight;
    }, [fieldsLength]);

    useImperativeHandle(ref, () => ({
      validateFields: () => form.validateFields(),
      getFieldsValue: () => form.getFieldsValue(true),
      getFieldsError: () => form.getFieldsError(),
      resetFields: () => form.resetFields(),
      setFields: (fields: any[]) => form.setFields(fields),
      setFieldsValue: (fields: any) => form.setFieldsValue(fields),
    }));

    return (
      <div ref={recipientsRef} className={styles.addSignersForm}>
        <Form style={{ width: '520px' }} form={form} name={formName}>
          <Form.List
            name="list"
            initialValue={formName === 'CC' ? [] : [{ name: undefined }]}
          >
            {(fields, { add, remove }) => {
              return (
                <div className={styles.addSignersItem}>
                  {fields.map(({ key, name }) => {
                    return (
                      <div key={key}>
                        <div className={styles.signerNumber}>
                          <span>* </span>
                          {formName === 'CC'
                            ? `${formName} ${name + 1}`
                            : `${name + 1} st Signer`}
                        </div>
                        <div className={styles.addSignersFormItem}>
                          <ProFormText
                            name={[name, 'name']}
                            placeholder="Name"
                            rules={[
                              {
                                required: true,
                                message: 'Please enter Name',
                              },
                              {
                                max: MAX_LENGTH.NAME_200,
                                message: `Name must not exceed ${MAX_LENGTH.NAME_200} characters in length`,
                              },
                              {
                                whitespace: true,
                                message: 'Cannot only contain spaces',
                              },
                            ]}
                          />
                          <ProFormText
                            name={[name, 'email']}
                            placeholder="Email"
                            rules={[
                              {
                                required: true,
                                message: 'Please enter Email',
                              },
                              {
                                whitespace: true,
                                message: 'Cannot only contain spaces',
                              },

                              {
                                pattern: REGEXP.EMAIL,
                                // pattern:
                                //   step1Data?.signatureType ===
                                //   SignatureTypeEnum.EXTERNAL
                                //     ? REGEXP.EMAIL
                                //     : REGEXP.INTELUCKEMAIL,
                                message: `Please enter valid email`,
                              },
                            ]}
                          />
                          {(fields.length !== 1 || formName === 'CC') && (
                            <Button
                              onClick={() => {
                                setFieldsLength(fields.length);
                                remove(name);
                              }}
                            >
                              -
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {
                    <Button
                      className={styles.addSigners}
                      onClick={() => {
                        if (fields.length > 19) {
                          message.error(
                            `${formName} cannot exceed ${maxLength}`,
                          );
                          return;
                        }

                        setFieldsLength(fields.length);
                        add();
                      }}
                    >
                      {fields.length === 0 ? (
                        <>
                          <FileAddOutlined /> Add {formName}
                        </>
                      ) : (
                        '+'
                      )}
                    </Button>
                  }
                </div>
              );
            }}
          </Form.List>
        </Form>
      </div>
    );
  },
);

export default AddRecipients;
