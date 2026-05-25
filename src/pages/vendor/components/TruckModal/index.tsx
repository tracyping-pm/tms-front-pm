import {
  addTruck,
  editTruck,
  getTruckDefaultCategory,
  getTruckTypeList,
  truckCheckDuplicate,
} from '@/api/truck';
import {
  IAddTruckParams,
  ITruckDefaultCategoryRecord,
  ITruckTypeListItem,
} from '@/api/types/truck';
import { IVendorDetail } from '@/api/types/vendor';
import { MAX_LENGTH } from '@/constants';
import {
  ApplicationTypeEnum,
  UploadPathTypeEnum,
  VendorTruckCodingDayEnum,
  VendorTruckCodingDayEnumText,
  VendorTruckOwnershipEnum,
  VendorTruckOwnershipEnumText,
  VendorTruckVanTypeEnumText,
} from '@/enums';
import {
  ModalForm,
  ModalFormProps,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { App, Col, Divider, Form, Row, Spin } from 'antd';
import cls from 'classnames';
import { useCallback, useState } from 'react';

import { checkUnderReview } from '@/api/application';
import { PROMPT_ID_OCR, PROMPT_LICENSE_OCR } from '@/constants/prompt';
import { formatString } from '@/utils/format';
import { useModel } from '@umijs/max';
import AccreditationUpload from '../AccreditationUpload';
import {
  accreditationValidator,
  FILE_CATEGORY_WITH_GEN_AI,
} from '../AccreditationUpload/constants';
import TruckCreateCheckModal from './TruckCreateCheckModal';
import styles from './styles.less';

type ICustomerModal = ModalFormProps & {
  formDefaultValue?: IAddTruckParams | null;
  vendorDetail?: IVendorDetail;
  needVendor?: boolean;
  needOwner?: boolean;
  hideModal: () => void;
  refresh: () => void;
};

const TruckModal = ({
  formDefaultValue,
  vendorDetail,
  needVendor = false,
  needOwner = false,
  width = 680,
  hideModal,
  refresh,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const plateNumberValue = Form.useWatch('plateNumber', form);
  const truckTypeIdValue = Form.useWatch('truckType', form);
  const { initialState } = useModel('@@initialState');

  const countryId = initialState?.currentUser?.countryId ?? 1;
  const countryOcrFieldObj = FILE_CATEGORY_WITH_GEN_AI[countryId];
  const [checkRecord, setCheckRecord] = useState<{
    id: number;
    number: string;
  }>();
  const [list, setList] = useState<ITruckDefaultCategoryRecord[]>([]);

  const [truckCreateCheckModalOpen, setTruckCreateCheckModalOpen] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [spinLoading, setSpinLoading] = useState<boolean>(false);
  const [truckCreateCheckModalLoading, setTruckCreateCheckModalLoading] =
    useState<boolean>(false);
  const [plateNumberDuplicate, setPlateNumberDuplicate] =
    useState<boolean>(false);

  const checkPlateNumber = async (value: string) => {
    if (!value) return;

    const nameFieldError = await form?.getFieldError?.('plateNumber');
    if (nameFieldError?.length) {
      return;
    }

    const res = await truckCheckDuplicate({
      plateNumber: value,
    });
    if (res?.code === 200) {
      setPlateNumberDuplicate(res.data);
      form?.setFields([
        {
          name: 'plateNumber',
          errors: res.data ? ['Existed Truck'] : [],
        },
      ]);
    }
  };

  const fetchData = async (truckTypeId: number) => {
    if (formDefaultValue?.id || !truckTypeId) {
      setList([]);
      return;
    }
    setSpinLoading(true);
    const res = await getTruckDefaultCategory(truckTypeId);
    setSpinLoading(false);
    if (res.code === 200) {
      const font = res.data?.filter((item) => item.required);
      const end = res.data?.filter((item) => !item.required);
      setList([...font, ...end]);
    }
  };

  const submit = async () => {
    const params = form?.getFieldsValue();
    let res;
    let payload = {
      plateNumber: params.plateNumber ? formatString(params.plateNumber) : '',
      truckType: params.truckType,
      vanType: params.vanType || null,
      registrationNumber: params.registrationNumber || null,
      grossCapacity: params.grossCapacity || null,
      netCapacity: params.netCapacity || null,
      volume: params.volume || null,
      model: params.model || null,
      codingDay: params.codingDay || null,
      ownership:
        (formDefaultValue ? formDefaultValue.ownership : params.ownership) ||
        null,
    };
    setTruckCreateCheckModalLoading(true);
    if (formDefaultValue?.id) {
      res = await editTruck({
        ...payload,
        id: formDefaultValue.id,
        // reason: params.reason,
      });
    } else {
      const _list = list.map((item) => {
        const obj = params[item.id];
        return {
          fileCategory: item.fileCategory,
          validDateStart: obj?.validDateStart,
          validDateEnd: obj?.validDateEnd,
          validIndefinitely: obj?.validIndefinitely,
          materialIdList: obj?.materialIdList,
        };
      });

      res = await addTruck({
        ...payload,
        documentList: _list,
        vendorId: needVendor ? params?.vendorName?.id : null,
      });
    }
    setTruckCreateCheckModalLoading(false);
    if (res.code === 200) {
      message.success(`${formDefaultValue?.id ? 'Edit' : 'Add'} successfully`);
      setTruckCreateCheckModalOpen(false);
      refresh();
      hideModal();
    }
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, []);

  const onFinish = async () => {
    const FieldError = await form?.getFieldsError?.();
    const hasError = FieldError?.some((item) => item.errors?.length);
    if (hasError) {
      return;
    }

    const params = form?.getFieldsValue();

    const res = await checkUnderReview({
      type: ApplicationTypeEnum.TRUCK,
      bizIdentifier: formatString(params.plateNumber),
    });

    if (res.data) {
      setCheckRecord(res.data ?? {});
      setTruckCreateCheckModalOpen(true);
    } else {
      await submit();
    }
  };

  return (
    <>
      <ModalForm
        name="truck-modal"
        open={true}
        title={formDefaultValue ? 'Modify Truck' : 'Add Truck'}
        style={{ marginTop: '14px' }}
        width={width}
        form={form}
        scrollToFirstError
        initialValues={{
          plateNumber: formDefaultValue?.plateNumber || '',
          truckType: formDefaultValue?.truckType || null,
          vanType: formDefaultValue?.vanType || null,
          registrationNumber: formDefaultValue?.registrationNumber || null,
          grossCapacity: formDefaultValue?.grossCapacity || null,
          netCapacity: formDefaultValue?.netCapacity || null,
          volume: formDefaultValue?.volume || null,
          model: formDefaultValue?.model || '',
          vendorName: {
            id: formDefaultValue?.vendorId || vendorDetail?.id || null,
            value:
              formDefaultValue?.vendorName || vendorDetail?.vendorName || null,
            label:
              formDefaultValue?.vendorName || vendorDetail?.vendorName || null,
          },
          // reason: formDefaultValue?.reason || '',
        }}
        modalProps={{
          ...modalProps,
          className: cls(styles.truckModal),
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
          okText: 'Ok',
          okButtonProps: {
            loading: loading,
          },
        }}
        onFinish={onFinish}
        {...restProps}
      >
        <Spin spinning={spinLoading} tip="All Accreditation Fetching...">
          <Row gutter={[72, 0]}>
            <Col span={12}>
              <ProFormText
                name="plateNumber"
                label="Plate Number"
                disabled={!!formDefaultValue?.id}
                placeholder="Plate Number"
                fieldProps={{
                  onBlur: (e) => checkPlateNumber(e.target.value),
                  onChange: () => setPlateNumberDuplicate(false),
                }}
                rules={[
                  {
                    required: true,
                    message: 'Please enter plate number',
                  },
                  {
                    max: MAX_LENGTH.LONG_NAME,
                    message: `Plate number cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                  },
                  {
                    whitespace: true,
                    message: 'Cannot only contain spaces',
                  },
                  {
                    validator: () => {
                      if (plateNumberDuplicate) {
                        return Promise.reject(new Error('Existed Truck'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="truckType"
                label="Truck Type"
                placeholder="Truck Type"
                showSearch
                fieldProps={{
                  filterOption: true,
                  onChange: (value: number) => fetchData(value),
                  optionFilterProp: 'label',
                }}
                rules={[
                  { required: true, message: 'Please select tax truck type' },
                ]}
                request={async () => {
                  const res = await getTruckTypeList();
                  if (res.code === 200) {
                    return res?.data?.map((item: ITruckTypeListItem) => {
                      return {
                        label: item.name,
                        value: item.id,
                      };
                    });
                  }
                  return [];
                }}
              />
            </Col>
          </Row>
          <Row gutter={[72, 0]}>
            <Col span={12}>
              <ProFormSelect
                name="vanType"
                label="Van Type"
                placeholder="Van Type"
                valueEnum={VendorTruckVanTypeEnumText}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="registrationNumber"
                label="Registration Number"
                placeholder="Registration Number"
                rules={[
                  {
                    max: MAX_LENGTH.NAME,
                    message: `Plate number cannot exceed ${MAX_LENGTH.NAME} characters`,
                  },
                ]}
              />
            </Col>
          </Row>
          <Row gutter={[72, 0]}>
            <Col span={12}>
              <ProFormDigit
                name="grossCapacity"
                label="Gross Capacity"
                placeholder="Gross Capacity"
                fieldProps={{
                  controls: false,
                  min: 0,
                  max: Math.pow(2, 52),
                  suffix: 'MT',
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormDigit
                name="netCapacity"
                label="Net Capacity"
                placeholder="Net Capacity"
                fieldProps={{
                  controls: false,
                  min: 0,
                  max: Math.pow(2, 52),
                  suffix: 'MT',
                }}
              />
            </Col>
          </Row>
          <Row gutter={[72, 0]}>
            <Col span={12}>
              <ProFormDigit
                name="volume"
                label="Volume"
                placeholder="Volume"
                fieldProps={{
                  controls: false,
                  min: 0,
                  max: Math.pow(2, 52),
                  suffix: 'CBM',
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormText
                name="model"
                label="Model"
                placeholder="Model"
                rules={[
                  {
                    max: MAX_LENGTH.LONG_NAME,
                    message: `Model cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                  },
                ]}
              />
            </Col>
          </Row>
          <Row gutter={[72, 0]}>
            {needOwner ? (
              <Col span={12}>
                <ProFormSelect
                  name="ownership"
                  label="Ownership"
                  allowClear={false}
                  placeholder="Owned Truck"
                  valueEnum={VendorTruckOwnershipEnumText}
                  initialValue={
                    VendorTruckOwnershipEnumText[
                      VendorTruckOwnershipEnum.OWNED_TRUCK
                    ]
                  }
                />
              </Col>
            ) : null}
            <Col span={needOwner ? 12 : 24}>
              <ProFormSelect
                name="codingDay"
                label="Coding Day"
                placeholder="Coding Day"
                valueEnum={VendorTruckCodingDayEnumText}
                initialValue={
                  formDefaultValue?.codingDay ||
                  VendorTruckCodingDayEnumText[VendorTruckCodingDayEnum.NA]
                }
              />
            </Col>
          </Row>
          {needVendor ? (
            <ProFormSelect
              name="vendorName"
              label="Vendor"
              placeholder="Vendor Name"
              rules={[
                {
                  required: true,
                  message: 'Please enter vendor name',
                },
              ]}
              disabled={needVendor}
              fieldProps={{
                defaultActiveFirstOption: false,
                suffixIcon: null,
                filterOption: false,
              }}
            />
          ) : null}

          {list.length ? (
            <div>
              <Divider plain>{'Accreditation'}</Divider>
              <p>At this step, you can skip the required fields for now.</p>
              {list.map((item) => {
                const fieldKey: 'idNumber' | 'licenseNumber' =
                  countryOcrFieldObj[item.id];
                const withGenAI = !!fieldKey;
                const prompt =
                  fieldKey === 'idNumber' ? PROMPT_ID_OCR : PROMPT_LICENSE_OCR;
                return (
                  <div key={item.id}>
                    <Form.Item
                      label=""
                      name={item.id}
                      rules={[
                        {
                          validator(_rule, value) {
                            //@ts-ignore
                            return accreditationValidator(value);
                          },
                        },
                      ]}
                    >
                      <AccreditationUpload
                        withGenAI={withGenAI}
                        totalMaxUploadCount={withGenAI ? 1 : Infinity}
                        prompt={prompt}
                        label={item.fileCategory}
                        fileCategory={item.fileCategory}
                        required={item.required}
                        getUploadingSize={getUploadingSize}
                        materialList={[]}
                        dto={{
                          customParamMap: {
                            plateNumber: plateNumberValue,
                            truckType: truckTypeIdValue,
                            fileCategory: item.fileCategory,
                          },
                          pathType: UploadPathTypeEnum.TRUCK,
                        }}
                        onGenAIChange={(ocrResult: string) => {
                          // @ts-ignore
                          setOcrResultObj({ [fieldKey]: ocrResult });
                        }}
                      />
                    </Form.Item>
                  </div>
                );
              })}
            </div>
          ) : null}
        </Spin>
      </ModalForm>

      {truckCreateCheckModalOpen ? (
        <TruckCreateCheckModal
          record={checkRecord!}
          loading={truckCreateCheckModalLoading}
          onSaveTruck={() => {
            submit();
          }}
          hideModal={() => {
            setTruckCreateCheckModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
};

export default TruckModal;
