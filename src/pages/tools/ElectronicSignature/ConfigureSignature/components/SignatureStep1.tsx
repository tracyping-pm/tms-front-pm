import { signatureCertificate } from '@/api/tool';
import CommonFileItem from '@/components/CommonFileItem';
import NormalUpload from '@/components/CustomUpload/NormalUpload';
import IconCountry from '@/components/RoleCard/IconCountry';
import {
  SIGNATURE_FILE_ACCEPT,
  SIGNATURE_FILE_LIMIT_SIZE,
  SignatureTypeEnum,
  SignatureTypeEnumText,
} from '@/constants';
import { REGION_ID_ENUM, REGION_NAME_ENUM } from '@/enums/uam';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Affix, App, Button, Form, Select, Tooltip } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { FC, useCallback, useEffect, useState } from 'react';
import SignatureStepTitle from './SignatureStepTitle';
import styles from './common.less';

const { Option } = Select;
const url = `/api/eSignature/material/add`;
const dto = {
  id: 465,
  fileCategory: 'Truck List',
  defaultCategory: 0,
};
const options = [
  { id: 1, regionId: 10001, date: '2024-07-12' },
  { id: 2, regionId: 10002, date: '2024-09-03' },
  { id: 3, regionId: 10003, date: '2024-01-03' },
  { id: 4, regionId: 10003 },
];
const mockThumbnail =
  'https://lh3.googleusercontent.com/drive-storage/AJQWtBOe1JYe-3uBNfzr6aOlOgg_rEukTKq5yVu69IapKg9rSWeWVop15imD_htqKmj-De64lF6-vjOyS9OBU2MiVIMyJSQRl2q6HrHQ-EnjtA=s220';
// const mockFileUrl =
//   'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
interface IProps {
  todo?: any;
}
interface IContractingOptionProps {
  id: number;
  regionId: number;
  date?: string;
  label?: string;
  value: string;
}

const SignatureStep1: FC<IProps> = () => {
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const { state, doNext, setStepData } = useModel('signature.detail');
  const [form] = Form.useForm<{
    signatureType: string;
    signatureFileId: number | undefined;
  }>();

  const [fileName, setFileName] = useState<string>('');

  const [certificateOptions, setCertificateOptions] = useState<
    IContractingOptionProps[]
  >([]);
  const [contractingOption, setContractingOption] =
    useState<IContractingOptionProps>({} as IContractingOptionProps);

  const handleDeleteMaterial = useCallback(() => {
    setFileName('');
    form.setFieldsValue({
      signatureFileId: undefined,
    });
  }, []);

  const getRegionName = (regionId: number) => {
    switch (regionId) {
      case REGION_ID_ENUM.Singapore:
        return REGION_NAME_ENUM.Singapore;
      case REGION_ID_ENUM.Philippines:
        return REGION_NAME_ENUM.Philippines;
      case REGION_ID_ENUM.Thailand:
        return REGION_NAME_ENUM.Thailand;
      case REGION_ID_ENUM.ChinaShenZhen:
      case REGION_ID_ENUM.ChinaChengDu:
        return REGION_NAME_ENUM.China;
      default:
        return null;
    }
  };

  const onFulfilled = useCallback(
    async (file: File & { id: number; fileName: string }) => {
      setFileName(file?.fileName);
      form.setFieldsValue({
        signatureFileId: file?.id,
      });
    },
    [],
  );

  const doFinish = useCallback(() => {
    form.validateFields().then((values) => {
      if (!fileName) {
        message.warning('Please wait for the upload to complete!');
        return;
      }

      const stepData = {
        ...state.stepData,
        ...values,
        fileName: fileName,
        regionId: contractingOption?.regionId,
        regionName: getRegionName(contractingOption?.regionId),
        contractingTime: contractingOption?.label,
      };

      setStepData(state.stepCurrent, stepData);
      doNext();
    });
  }, [state, fileName, form, doNext]);

  const labelRender = useCallback((option: any) => {
    const label: string = option.label as string;

    const isisAfter = dayjs().isAfter(dayjs(label));
    const regionData = options.find((item) => option.value === item.id)!;
    if (!label || isisAfter) {
      message.warning('The contracting entity certificate is unavailable');
      // @ts-ignore
      form.setFieldValue('contractingEntity', undefined);
      return;
    }
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <>
          <IconCountry regionId={+regionData.regionId!} />
          <span className={styles.regionName}>
            {getRegionName(+regionData.regionId!)}
          </span>
        </>

        <span>{`Validity period of contract entity certificate:${label}`}</span>
      </div>
    );
  }, []);

  const optionRender = useCallback((option: any) => {
    const label = option.data?.date;
    const regionId = option.data?.regionId;
    const isisAfter = dayjs().isAfter(dayjs(label));
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: !label || isisAfter ? 'rgba(0, 0, 0, 0.25)' : '',
        }}
        key={option.key}
      >
        <div>
          <IconCountry regionId={regionId} />
          <span style={{ marginLeft: 10 }}>{getRegionName(regionId)}</span>
        </div>

        <span>{`Validity period of contract entity certificate:${label ?? '-'}`}</span>
      </div>
    );
  }, []);

  const getSignatureCertificate = async () => {
    const res = await signatureCertificate();
    if (res.code === 200) {
      const newOptions = res.data?.map(
        (item: { id: number; regionId: number; date: string }) => {
          if (
            item.regionId ===
              initialState?.currentUser?.currentUserRole?.regionId &&
            dayjs().isBefore(dayjs(item.date))
          ) {
            // @ts-ignore
            form.setFieldValue('contractingEntity', item.id);
            setContractingOption({
              label: item.date,
              value: `${item.id}`,
              ...item,
            });
          }
          return {
            label: item.date,
            value: item.id,
            ...item,
          };
        },
      );
      setCertificateOptions(newOptions);
    }
  };

  useEffect(() => {
    getSignatureCertificate();
  }, []);
  return (
    <>
      <div
        className={cls(
          'signatureStep',
          'signatureStep1',
          styles.signatureStep,
          styles.signatureStep1,
        )}
      >
        <section className="header">
          <SignatureStepTitle />
        </section>
        <section className="content">
          <Form form={form} name="add-document" layout="vertical">
            <Form.Item
              name="contractingEntity"
              label={
                <div>
                  <span>Contracting Entity</span>
                  <Tooltip
                    placement="topLeft"
                    title="The contracting entity refers to the legal entity you represent in the contract. This is the party that holds the legal responsibility and rights in the agreement. It is crucial to clearly identify the contracting entity to ensure that the contract is legally binding and enforceable, specifying who is obligated to fulfill the terms and conditions outlined in the contract"
                    rootClassName={cls(
                      'signatureStepTitleRoot',
                      styles.signatureStepTitleRoot,
                    )}
                    align={{
                      offset: [-12, -10],
                    }}
                    autoAdjustOverflow={false}
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </div>
              }
              rules={[
                {
                  required: true,
                  message: 'Please select Contracting Entity',
                },
              ]}
              style={{ width: '485px' }}
            >
              <Select
                placeholder="Contracting Entity"
                allowClear
                options={certificateOptions}
                optionRender={optionRender}
                labelRender={labelRender}
                onChange={(_, option) => {
                  //@ts-ignore
                  setContractingOption(option);
                }}
              />
            </Form.Item>

            <Form.Item
              name="signatureType"
              label="Signature Type"
              rules={[
                {
                  required: true,
                  message: 'Please select signature type',
                },
              ]}
              style={{ width: '485px' }}
            >
              <Select placeholder="Signature Type" allowClear>
                <Option value={SignatureTypeEnum.EXTERNAL}>
                  {SignatureTypeEnumText[SignatureTypeEnum.EXTERNAL]}
                </Option>
                <Option value={SignatureTypeEnum.INTERNAL}>
                  {SignatureTypeEnumText[SignatureTypeEnum.INTERNAL]}
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="signatureFileId"
              label="Upload File"
              rules={[
                {
                  required: true,
                  message: 'Please upload file',
                },
              ]}
            >
              {!!fileName ? (
                <CommonFileItem
                  thumbnail={mockThumbnail}
                  fileType={'pdf'}
                  fileName={'file.pdf'}
                  materialId={1698}
                  driveFileId={'1748Wk6j47EZwpQHzWo6oJLuZVUXyP4o4'}
                  fileMimeType={'application/pdf'}
                  showPreview={false}
                  showDownload={false}
                  showDelete={true}
                  onDeleteTrigger={() => handleDeleteMaterial()}
                />
              ) : (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <NormalUpload
                    source={'SIGNATURE'}
                    url={url}
                    dto={dto}
                    limitSize={SIGNATURE_FILE_LIMIT_SIZE}
                    accept={SIGNATURE_FILE_ACCEPT}
                    onFulfilled={onFulfilled}
                  />
                  <div
                    style={{
                      width: '168px',
                      color: '#00000073',
                      lineHeight: '22px',
                    }}
                  >
                    A single file cannot exceed 50 MB
                  </div>
                </div>
              )}
            </Form.Item>
            <section className="note">
              {!!fileName ? (
                <p className="fileName">{fileName}</p>
              ) : (
                <p>
                  Upload your contract in a variety of formats supported for
                  electronic signing Currently only PDF documents are supported
                </p>
              )}
            </section>
          </Form>
        </section>
        <Affix offsetBottom={0}>
          <section className="footer">
            <div className="btns">
              <Button type="primary" onClick={() => doFinish()}>
                Next
              </Button>
            </div>
          </section>
        </Affix>
      </div>
    </>
  );
};

export default SignatureStep1;
