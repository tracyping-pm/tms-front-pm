import { addTransmittal } from '@/api/transmittal';
import { ES_DTO_CLASS, LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  TransmittalTypeEnum,
  TransmittalTypeEnumText,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Access, history } from '@umijs/max';
import { Affix, App, Button, Col, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { IHeaderFormData } from '../Generate';
import styles from './common.less';

interface ITransmittalCreateHeader {
  waybillIds: number[];
  headerFormData: IHeaderFormData;
  setHeaderFormData: (data: IHeaderFormData) => void;
}

export default function TransmittalCreateHeader({
  waybillIds,
  headerFormData,
  setHeaderFormData,
}: ITransmittalCreateHeader) {
  const { message } = App.useApp();
  const {
    options: customerNameOptions,
    onSearch: customerNameSearch,
    defaultFieldProps: customerNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'customerName',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();

  const handleGenerate = async () => {
    await formRef.current?.validateFields();
    setConfirmLoading(true);
    const { transmittalType, vendorName, customerName } =
      formRef.current?.getFieldsValue();
    const res = await addTransmittal({
      waybillIds,
      transmittalType,
      customerId: headerFormData.isCustomer ? customerName?.id : undefined,
      vendorId: headerFormData.isCustomer ? undefined : vendorName?.id,
    }).finally(() => {
      setConfirmLoading(false);
    });
    if (res.code === 200) {
      message.success('Transmittal generate successfully');
      history.replace(`${PATHS.TRANSMITTAL_LIST_DETAIL}/${res.data}`);
    }
  };

  useEffect(() => {
    formRef.current?.setFieldValue(
      'transmittalType',
      TransmittalTypeEnum.CUSTOMER,
    );
  }, []);
  return (
    <>
      <div className={styles.header}>
        <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
          <div className={styles.header_top}>
            <div className={styles.header_top_left}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => history.back()}
              >
                Back
              </Button>
            </div>
            <div className={styles.header_top_right}>
              <Access accessible={true}>
                <Button
                  type="primary"
                  disabled={!waybillIds.length}
                  onClick={handleGenerate}
                  loading={confirmLoading}
                >
                  Generate
                </Button>
              </Access>
            </div>
          </div>
        </Affix>
      </div>
      <ProForm
        formRef={formRef}
        className={styles.form}
        layout={'horizontal'}
        style={{
          marginBottom: 24,
          padding: 24,
          background: '#fff',
        }}
        submitter={false}
      >
        <Row gutter={24}>
          <Col span={8}>
            <ProFormSelect
              name="transmittalType"
              label="Transmittal Type"
              placeholder="Transmittal Type"
              allowClear={false}
              valueEnum={TransmittalTypeEnumText}
              onChange={(val: TransmittalTypeEnum) => {
                setHeaderFormData({
                  isCustomer: val === TransmittalTypeEnum.CUSTOMER,
                  transmittalType: val,
                  customerId: undefined,
                  vendorId: undefined,
                });
                formRef.current?.setFieldValue(
                  `${headerFormData.isCustomer ? 'customer' : 'vendor'}Name`,
                  undefined,
                );
              }}
              rules={[
                {
                  required: true,
                },
              ]}
            />
          </Col>

          {headerFormData.isCustomer ? (
            <Col span={8}>
              <ProFormSelect
                name={`customerName`}
                label={`Customer Name`}
                placeholder={`Please search and select customer`}
                rules={[
                  {
                    required: true,
                    message: `Please search and select customer`,
                  },
                ]}
                fieldProps={{
                  ...customerNameDefaultFieldProps,
                  options: customerNameOptions,
                  onSearch: customerNameSearch,
                  onChange: (val) => {
                    setHeaderFormData({
                      ...headerFormData,
                      customerId: val ? val.id : undefined,
                      vendorId: undefined,
                    });
                  },
                }}
              />
            </Col>
          ) : (
            <Col span={8}>
              <ProFormSelect
                name={`vendorName`}
                label={`Vendor Name`}
                placeholder={`Please search and select vendor`}
                rules={[
                  {
                    required: true,
                    message: `Please search and select vendor`,
                  },
                ]}
                fieldProps={{
                  ...vendorNameDefaultFieldProps,
                  options: vendorNameOptions,
                  onSearch: vendorNameSearch,
                  onChange: (val) => {
                    setHeaderFormData({
                      ...headerFormData,
                      customerId: undefined,
                      vendorId: val ? val.id : undefined,
                    });
                  },
                }}
              />
            </Col>
          )}
        </Row>
      </ProForm>
    </>
  );
}
