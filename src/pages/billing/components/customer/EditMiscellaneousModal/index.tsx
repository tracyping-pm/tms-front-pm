import {
  ModalForm,
  ModalFormProps,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';

import { formatAmount } from '@/utils/utils';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Divider, Form } from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

import {
  IMiscellaneousChangeSaveReq,
  IStatementMiscellaneousChargeListItem,
} from '@/api/types/billing';
import OssUpload from '@/components/OssUpload';
import { ENUM_OSS_MENU_DIRECTORY } from '@/components/OssUpload/types';
import { MAX_LENGTH } from '@/constants';
import { CountryCurrencyEnumText } from '@/enums';
import { formatString } from '@/utils/format';
import { useModel, useParams } from '@umijs/max';
import { clone, map } from 'lodash';
import styles from './index.less';

type IEditMiscellaneousModal = ModalFormProps & {
  list?: IStatementMiscellaneousChargeListItem[];
  onConfirm?: (data: IMiscellaneousChangeSaveReq) => void;
};

type IFormItem = {
  id: number;
  itemName: string;
  symbol: string;
  amount: number;
};
const EditMiscellaneousModal: FC<IEditMiscellaneousModal> = ({
  width = 548,
  title = 'Edit Miscellaneous Charge',
  open,
  list = [],
  modalProps,
  onConfirm,
  ...restProps
}) => {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const { id: statementId } = useParams();
  const formRef = useRef<ProFormInstance>();
  const [deleteList, setDeleteList] = useState<number[]>([]);
  const [fileUploading, setFileUploading] = useState(false);
  const init = useCallback(() => {
    if (list?.length) {
      const _list = list.map((item) => {
        return {
          ...item,
          symbol: item.amount >= 0 ? '+' : '-',
          amount: Math.abs(item.amount ?? 0),
        };
      });
      formRef.current?.setFieldsValue({ amountList: _list });
    }
  }, [list]);

  const handleOk = async () => {
    const values = formRef?.current?.getFieldsValue?.();
    const amountList = values?.amountList ?? [];

    const chargeList = amountList.map((item: IFormItem) => {
      return {
        id: item?.id,
        itemName: formatString(item.itemName),
        amount: Number(`${item.symbol}${item.amount}`) ?? 0,
      };
    });
    const deleteIds = map(deleteList, 'id');

    onConfirm?.({
      statementMiscellaneousChargeList: chargeList,
      deleteIds,
      statementId: +statementId!,
      documentIds: values?.documentIds,
    });
  };

  const validatorRule = (value: any, index: number) => {
    if (!value) {
      return Promise.reject(new Error('Please enter Object'));
    }
    let newList = clone(formRef.current?.getFieldValue('amountList'));
    if (newList.length !== 0) {
      newList.splice(index, 1);
    }
    if (newList.some((item: { itemName: string }) => item.itemName === value)) {
      return Promise.reject(new Error('Duplicate Object Name'));
    }
    return Promise.resolve();
  };

  const checkObjectName = async () => {
    await formRef.current?.validateFields();
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setFileUploading(true);
    } else {
      setFileUploading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [list]);

  return (
    <>
      <ModalForm
        name="Edit-Miscellaneous-Charge"
        title={title}
        open={open}
        width={width}
        formRef={formRef}
        className={styles.miscellaneous}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          destroyOnClose: true,
          maskClosable: false,
        }}
        submitter={{
          submitButtonProps: {
            loading: fileUploading,
          },
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <div style={{ maxHeight: 540, overflowY: 'auto' }}>
          <div className={styles.miscellaneous_tableTitle}>
            <div className={styles.miscellaneous_tableLabel}>Object</div>
            <div className={styles.miscellaneous_tableLabel}>Amount</div>
            <div className={styles.miscellaneous_tableTitle_operate}>
              Operate
            </div>
          </div>
          <Form.List
            name="amountList"
            initialValue={[
              { itemName: undefined, symbol: '+', amount: undefined },
            ]}
          >
            {(fields, { add, remove }) => (
              <div>
                {fields.map(({ name }, index) => {
                  return (
                    <div key={name} className={styles.form}>
                      <div className={styles.formItem}>
                        <ProFormText
                          name={[name, 'itemName']}
                          placeholder={`Object Name`}
                          rules={[
                            {
                              whitespace: true,
                              message: 'Cannot only contain spaces',
                            },
                            {
                              max: MAX_LENGTH.NAME,
                              message: `Object cannot exceed ${MAX_LENGTH.NAME} characters`,
                            },
                            {
                              validator: (_, value) =>
                                validatorRule(value, index),
                            },
                          ]}
                          fieldProps={{
                            onChange: () => {
                              checkObjectName();
                            },
                          }}
                        />
                      </div>
                      <div className={styles.formItem}>
                        <ProFormSelect
                          name={[name, 'symbol']}
                          formItemProps={{
                            style: { minWidth: 50 },
                          }}
                          initialValue={'+'}
                          style={{ minWidth: 50, width: 50 }}
                          options={[
                            { value: '+', label: '+' },
                            { value: '-', label: '-' },
                          ]}
                          placeholder="Please select"
                          onChange={() => {}}
                        />
                        <ProFormDigit
                          name={[name, 'amount']}
                          initialValue={0}
                          placeholder="Please enter Amount"
                          min={0}
                          max={99999999.99}
                          fieldProps={{
                            precision: 2,
                            prefix:
                              CountryCurrencyEnumText[countryId as number],
                            formatter: (v: any) => formatAmount(v),
                          }}
                          rules={[
                            {
                              required: true,
                              message: 'Please enter Amount',
                            },
                          ]}
                        />
                      </div>
                      <div className={styles.formOperate}>
                        <DeleteOutlined
                          className={styles.deleteIcon}
                          onClick={() => {
                            const obj =
                              formRef.current?.getFieldValue('amountList')?.[
                                name
                              ];
                            setDeleteList([...deleteList, obj]);
                            remove(name);
                          }}
                        />
                        {fields?.length === index + 1 && (
                          <>
                            <Divider
                              type="vertical"
                              style={{ marginTop: 10 }}
                            />
                            <PlusCircleOutlined
                              className={styles.addIcon}
                              onClick={() => {
                                add();
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!fields?.length && (
                  <PlusCircleOutlined
                    className={styles.addIcon}
                    style={{ top: 0 }}
                    onClick={() => {
                      add();
                    }}
                  />
                )}
              </div>
            )}
          </Form.List>

          <Form.Item
            name="documentIds"
            label="Proof"
            rules={[{ required: true, message: 'Please upload Proof' }]}
          >
            <OssUpload
              dir={ENUM_OSS_MENU_DIRECTORY.AR_AP}
              showModeBar={true}
              scrollHeight={200}
              getUploadingSize={getUploadingSize}
            />
          </Form.Item>
        </div>
      </ModalForm>
    </>
  );
};

export default EditMiscellaneousModal;
