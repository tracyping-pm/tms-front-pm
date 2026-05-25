import { MAX_LENGTH } from '@/constants';
import { CheckOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Col, Form, Row } from 'antd';

import html2canvas from 'html2canvas';
import { useCallback, useEffect, useRef } from 'react';

import { ISignature } from '../../interface';
import styles from './common.less';

type ISignatureModal = ModalFormProps & {
  open: boolean;
  record: ISignature;
  signingName: string;
  getNewSignature: (v: ISignature) => void;
};

const FontFamilyOptions = {
  Roboto: 'Roboto',
  'Dancing Script': 'Dancing Script',
  'Kaushan Script': 'Kaushan Script',
  Pacifico: 'Pacifico',
  'Indie Flower': 'Indie Flower',
  'Shadows Into Light': 'Shadows Into Light',
  Satisfy: 'Satisfy',
  Sacramento: 'Sacramento',
  Parisienne: 'Parisienne',
  Damion: 'Damion',
  Cookie: 'Cookie',
  Yellowtail: 'Yellowtail',
  'Marck Script': 'Marck Script',
  'Cedarville Cursive': 'Cedarville Cursive',
  'Homemade Apple': 'Homemade Apple',
  Allura: 'Allura',
  'Nothing You Could Do': 'Nothing You Could Do',
  'Reenie Beanie': 'Reenie Beanie',
  // 'Nanum Brush Script': 'Nanum Brush Script',
  Calligraffitti: 'Calligraffitti',
  'Dawning of a New Day': 'Dawning of a New Day',
  Zeyada: 'Zeyada',
  'Give You Glory': 'Give You Glory',
  Charmonman: 'Charmonman',
  'Dr Sugiyama': 'Dr Sugiyama',
  'Beth Ellen': 'Beth Ellen',
  'Over the Rainbow': 'Over the Rainbow',
  'Lovers Quarrel': 'Lovers Quarrel',
  'Liu Jian Mao Cao': 'Liu Jian Mao Cao',
  'Long Cang': 'Long Cang',
  Ruthie: 'Ruthie',
};
const FontSizeOptions = {
  10: 10,
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  24: 24,
  36: 36,
  48: 48,
  72: 72,
  // 84: 84,
  // 96: 96,
  // 108: 108,
  // 144: 144,
};
const ColorOptions = [
  '#000000',
  '#1890FF',
  '#F5222D',
  '#FA8C16',
  '#A0D911',
  '#13C2C2',
  '#722ED1',
];

const SignatureModal = ({
  title = 'Edit Signature',
  open = false,
  width = 744,
  record,
  modalProps,
  signingName,
  getNewSignature,
  ...restProps
}: ISignatureModal) => {
  const DEFAULT_VALUES = {
    color: '#000000',
    size: 24,
    font: 'Roboto',
    name: signingName,
  };
  const [form] = Form.useForm<ISignature>();
  const fullName = Form.useWatch('name', form);
  const font = Form.useWatch('font', form);
  const size = Form.useWatch('size', form);
  const colorValue = Form.useWatch('color', form);

  const signatureRef = useRef(null);

  const canvasToBase64 = (values: ISignature) => {
    if (signatureRef.current) {
      html2canvas(signatureRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      }).then((canvas) => {
        const url = canvas.toDataURL();

        getNewSignature({
          id: record?.id,
          fileBaseStr: url,
          name: values.name,
          size: values.size,
          font: values.font,
          color: values.color,
        });
      });
    }
  };

  const handleOk = useCallback(async () => {
    const values = form?.getFieldsValue?.();
    canvasToBase64(values);
  }, []);

  useEffect(() => {
    if (open) {
      form.resetFields();

      if (record) {
        form.setFieldsValue(record);
      }
    }
  }, [open]);
  return (
    <>
      <ModalForm
        //@ts-ignore
        form={form}
        open={open}
        title={title}
        style={{ marginTop: '14px' }}
        width={width}
        initialValues={DEFAULT_VALUES}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: false,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <Row gutter={12}>
          <Col span={14}>
            <Row gutter={8}>
              <Col span={24}>
                <ProFormText
                  name="name"
                  label="Full Name"
                  placeholder="Full Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please Enter Full Name',
                    },
                    {
                      max: MAX_LENGTH.NAME_200,
                      message: `Name cannot exceed ${MAX_LENGTH.NAME_200} characters`,
                    },
                  ]}
                />
              </Col>
              <Col span={17}>
                <ProFormSelect
                  name="font"
                  label="Font"
                  placeholder="Font"
                  valueEnum={FontFamilyOptions}
                />
              </Col>
              <Col span={7}>
                <ProFormSelect
                  name="size"
                  label="Size"
                  placeholder="Font Size"
                  valueEnum={FontSizeOptions}
                />
              </Col>
              <Col span={24}>
                <Form.Item name="color" label="Color">
                  <div className={styles.colorList}>
                    {ColorOptions.map((i) => {
                      return (
                        <div
                          key={i}
                          className={styles.colorList_item}
                          style={{ backgroundColor: i }}
                          onClick={() => {
                            form?.setFieldValue('color', i);
                          }}
                        >
                          {colorValue === i && <CheckOutlined />}
                        </div>
                      );
                    })}
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={10}>
            <div className={styles.signatureName}>
              <div
                ref={signatureRef}
                className={styles.signatureText}
                style={{
                  fontFamily: font,
                  fontSize: `${size}px`,
                  color: colorValue,
                }}
              >
                {fullName}
              </div>
            </div>
          </Col>
        </Row>

        <div
          className="fetch-all-google-fonts"
          style={{ height: 0, opacity: 0 }}
        >
          {Object.values(FontFamilyOptions).map((item) => (
            <span key={font} style={{ fontFamily: item }} />
          ))}
        </div>
      </ModalForm>
    </>
  );
};

export default SignatureModal;
