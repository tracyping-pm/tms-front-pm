import { statementGetTaxRate, statementUpdateTaxRate } from '@/api/billing';
import { IStatementUpdateTaxRateParams } from '@/api/types/billing';
import { ICommonMaterial } from '@/api/types/common';
import CustomFormInput from '@/components/CustomFormInput';
import { StatementGetTaxRateEnum } from '@/enums';
import {
  Col,
  Empty,
  Form,
  InputNumber,
  Modal,
  ModalProps,
  Row,
  Spin,
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { IStatementMaterialListItem } from '../FileMaterialList/ListItem';
import styles from './index.less';

export interface ITaxRateModal extends ModalProps {
  defaultData?: IStatementMaterialListItem;
  materialList?: ICommonMaterial[];
  defaultWaybillData: {
    taxRateType: StatementGetTaxRateEnum;
    waybillId: number;
    basicAmountVat?: number;
    basicAmountWht?: number;
  };
  isReadOnly: boolean;
  onCancel: () => void;
  onRefresh: () => void;
}

const TaxRateModal: FC<ITaxRateModal> = ({
  open,
  defaultWaybillData,
  isReadOnly,
  onCancel,
  onRefresh,
  ...restProps
}) => {
  // const access = useAccess();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const originalTaxRateList =
    useRef<{ item: string; vat: number; wht: number }[]>();

  const [taxRateListDate, setTaxRateListDate] = useState<
    { item: string; vat: number; wht: number }[]
  >([]);

  const onOk = useCallback(async () => {
    setLoading(true);
    const formValues = form.getFieldsValue();
    const { taxRateList } = formValues;
    const _taxRateList = taxRateList?.map(
      (taxRateListItem: { item: string; vat: number; wht: number }) => {
        const obj = originalTaxRateList?.current?.find(
          (o) => o.item === taxRateListItem.item,
        );
        return {
          item: taxRateListItem.item,
          vat: taxRateListItem.vat,
          wht: taxRateListItem.wht,
          vatEdit: taxRateListItem.vat !== obj?.vat,
          whtEdit: taxRateListItem.wht !== obj?.wht,
        };
      },
    );

    const payload: IStatementUpdateTaxRateParams = {
      id: defaultWaybillData?.waybillId,
      itemType: defaultWaybillData?.taxRateType,
      taxRateUpdateReqs: _taxRateList,
    };

    const res = await statementUpdateTaxRate(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      onCancel();
      onRefresh();
    }
  }, []);

  const initTaxRateItem = async () => {
    const taxRateType = defaultWaybillData?.taxRateType;
    setLoading(true);
    const res = await statementGetTaxRate({
      id: defaultWaybillData?.waybillId,
      itemType: taxRateType,
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      const data = res.data ?? [];
      const taxRateList = data?.map((item) => {
        return {
          item: item.item,
          vat: item.vat,
          wht: item.wht,
        };
      });

      originalTaxRateList.current = taxRateList;
      setTaxRateListDate(taxRateList);
      form.setFieldsValue({
        taxRateList,
      });
    }
  };

  useEffect(() => {
    if (open && !!defaultWaybillData?.waybillId) {
      initTaxRateItem();
    }
  }, [open, defaultWaybillData?.waybillId]);

  return (
    <>
      <Modal
        {...restProps}
        open={open}
        title={
          defaultWaybillData?.taxRateType ===
          StatementGetTaxRateEnum.BASIC_AMOUNT
            ? 'Edit Basic Amount Tax Rate (VAT,WHT)'
            : 'Edit Additional Charge Tax Rate (VAT,WHT)'
        }
        destroyOnClose
        maskClosable={false}
        width={562}
        onOk={onOk}
        onCancel={onCancel}
        confirmLoading={loading}
        okButtonProps={{
          style: {
            display: !taxRateListDate?.length || isReadOnly ? 'none' : '',
          },
        }}
        cancelButtonProps={{
          style: {
            display: !taxRateListDate?.length || isReadOnly ? 'none' : '',
          },
        }}
      >
        <Spin spinning={loading}>
          <Row gutter={24}>
            <Col span={8}>
              <div className={styles.taxRateItemTitle}>Item</div>
            </Col>
            <Col span={8}>
              <div className={styles.taxRateItemTitle}>VAT</div>
            </Col>
            <Col span={8}>
              <div className={styles.taxRateItemTitle}>WHT</div>
            </Col>
          </Row>
          <Form name="tax-rate-form" form={form} layout="vertical">
            <Form.List name="taxRateList" initialValue={['']}>
              {(fields) => {
                console.log(fields);
                return (
                  <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                    {fields.map((field) => {
                      return (
                        <Row
                          gutter={24}
                          style={{ width: '100%' }}
                          key={field.key}
                        >
                          <Col span={8}>
                            <Form.Item
                              {...field}
                              label={null}
                              name={[field.name, 'item']}
                              key={field.key + 'item'}
                            >
                              <CustomFormInput readOnly />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...field}
                              label={null}
                              name={[field.name, 'vat']}
                              key={field.key + 'vat'}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter vat',
                                },
                              ]}
                            >
                              {isReadOnly ? (
                                <div style={{ padding: '0 12px' }}>
                                  {form.getFieldValue([
                                    'taxRateList',
                                    field.name,
                                    'vat',
                                  ])}
                                  %
                                </div>
                              ) : (
                                <InputNumber
                                  style={{ width: '100%' }}
                                  suffix="%"
                                  controls={false}
                                  min={0}
                                  max={100}
                                  readOnly={isReadOnly}
                                />
                              )}
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              {...field}
                              label={null}
                              name={[field.name, 'wht']}
                              key={field.key + 'wht'}
                              rules={[
                                {
                                  required: true,
                                  message: 'Please enter wht',
                                },
                              ]}
                            >
                              {isReadOnly ? (
                                <div style={{ padding: '0 12px' }}>
                                  {form.getFieldValue([
                                    'taxRateList',
                                    field.name,
                                    'wht',
                                  ])}
                                  %
                                </div>
                              ) : (
                                <InputNumber
                                  style={{ width: '100%' }}
                                  suffix="%"
                                  controls={false}
                                  min={0}
                                  max={100}
                                />
                              )}
                            </Form.Item>
                          </Col>
                        </Row>
                      );
                    })}
                  </div>
                );
              }}
            </Form.List>
          </Form>
          {taxRateListDate?.length === 0 && !loading && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Spin>
      </Modal>
    </>
  );
};

export default TaxRateModal;
