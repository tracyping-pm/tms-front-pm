import { claimGetWaybillInfo } from '@/api/claim';
import { IClaimDetail, IClaimWaybillInfo } from '@/api/types/claims';
import { IWaybillBaseInfoData } from '@/api/types/waybill';
import CountryIcon from '@/components/CountryIcon';
import FuzzySelector from '@/components/FuzzySelector';
import OssUpload from '@/components/OssUpload';
import { ENUM_OSS_MENU_DIRECTORY } from '@/components/OssUpload/types';
import { ES_DTO_CLASS, MAX_LENGTH } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  WaybillStatusEnum,
} from '@/enums';
import {
  EnumClaimOcStatus,
  EnumExternalClaimsType,
  EnumInternalClaimsType,
  ocStatusOptions,
  positionOptions,
  sizeOptions,
} from '@/enums/claim';
import { PermissionEnum } from '@/enums/permission';
import { numberAdd } from '@/utils/compute';
import { formatAmount } from '@/utils/utils';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd';
import { RuleObject } from 'antd/es/form';
import { StoreValue } from 'antd/es/form/interface';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import _ from 'lodash';
import { FC, useEffect, useMemo, useRef, useState } from 'react';
const { Text } = Typography;

interface ICommonFieldProps {
  form: FormInstance;
  detail?: IClaimDetail;
  waybillDetail?: IWaybillBaseInfoData;
}

export const internalClaimsTypeList = [
  EnumInternalClaimsType.GPS,
  EnumInternalClaimsType.DDC_Training_Fee,
  EnumInternalClaimsType.Crew_Uniform_Charges,
  EnumInternalClaimsType.Inteluck_Insurance,
  EnumInternalClaimsType.Coupon_Fees,
  EnumInternalClaimsType.Stuffing_Fee_CDC,
  EnumInternalClaimsType.Equipment_Fee,
  EnumInternalClaimsType.Medical_Fee,
];

export const externalClaimsTypeList = [
  EnumExternalClaimsType.Delivery_Claims,
  EnumExternalClaimsType.KPI_Claims,
  EnumExternalClaimsType.Theft_Incident,
  EnumExternalClaimsType.Others,
];

export const FieldClaimType: FC<ICommonFieldProps> = ({ waybillDetail }) => {
  const access = useAccess();
  const [claimTypeOptions, setClaimTypeOptions] = useState<DefaultOptionType[]>(
    [],
  );

  useEffect(() => {
    const group = [];
    const internalOptions = [];
    const externalOptions = [];

    // Internal Claim Type
    if (access[PermissionEnum.CLAIM_TYPE_GPS]) {
      internalOptions.push({
        label: EnumInternalClaimsType.GPS,
        value: EnumInternalClaimsType.GPS,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_DDC_TRAINING_FEE]) {
      internalOptions.push({
        label: EnumInternalClaimsType.DDC_Training_Fee,
        value: EnumInternalClaimsType.DDC_Training_Fee,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_CREW_UNIFORM_CHARGES]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Crew_Uniform_Charges,
        value: EnumInternalClaimsType.Crew_Uniform_Charges,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_INTELUCK_INSURANCE]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Inteluck_Insurance,
        value: EnumInternalClaimsType.Inteluck_Insurance,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_COUPON_FEES]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Coupon_Fees,
        value: EnumInternalClaimsType.Coupon_Fees,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_STUFFING_FEE_CDC]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Stuffing_Fee_CDC,
        value: EnumInternalClaimsType.Stuffing_Fee_CDC,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_EQUIPMENT_FEE]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Equipment_Fee,
        value: EnumInternalClaimsType.Equipment_Fee,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_MEDICAL_FEE]) {
      internalOptions.push({
        label: EnumInternalClaimsType.Medical_Fee,
        value: EnumInternalClaimsType.Medical_Fee,
      });
    }
    // External Claim Type
    if (access[PermissionEnum.CLAIM_TYPE_DELIVERY_CLAIMS]) {
      externalOptions.push({
        label: EnumExternalClaimsType.Delivery_Claims,
        value: EnumExternalClaimsType.Delivery_Claims,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_KPI_CLAIMS]) {
      externalOptions.push({
        label: EnumExternalClaimsType.KPI_Claims,
        value: EnumExternalClaimsType.KPI_Claims,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_THEFT_INCIDENT]) {
      externalOptions.push({
        label: EnumExternalClaimsType.Theft_Incident,
        value: EnumExternalClaimsType.Theft_Incident,
      });
    }
    if (access[PermissionEnum.CLAIM_TYPE_OTHERS]) {
      externalOptions.push({
        label: EnumExternalClaimsType.Others,
        value: EnumExternalClaimsType.Others,
      });
    }

    if (waybillDetail) {
      if (externalOptions?.length > 0) {
        const groupLabel = 'External Claim';
        group.push({
          label: groupLabel,
          options: externalOptions,
        });
      }
    } else {
      if (internalOptions?.length > 0) {
        const groupLabel = 'Internal Claim';
        group.push({
          label: groupLabel,
          options: internalOptions,
        });
      }

      if (externalOptions?.length > 0) {
        const groupLabel = 'External Claim';
        group.push({
          label: groupLabel,
          options: externalOptions,
        });
      }
    }

    setClaimTypeOptions(group);
  }, [access, waybillDetail]);

  return (
    <>
      <Form.Item
        label="Claim Type"
        name="type"
        rules={[{ required: true, message: 'Please select claim type' }]}
      >
        <Select
          options={claimTypeOptions}
          placeholder="Please select claim list type"
          labelRender={(item) => {
            if (
              internalClaimsTypeList.includes(
                item.value as EnumInternalClaimsType,
              )
            ) {
              return `Internal Claim - ${item.label}`;
            } else {
              return `External Claim - ${item.label}`;
            }
          }}
        />
      </Form.Item>
    </>
  );
};

export const FieldWaybillBased: FC<ICommonFieldProps> = ({
  form,
  detail,
  waybillDetail,
}) => {
  const type = Form.useWatch('type', form);

  useEffect(() => {
    if (type === EnumExternalClaimsType.Delivery_Claims) {
      form.setFieldValue('waybillBased', true);
    }
  }, [type]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        waybillBased: detail?.waybillBased,
      });
    }
  }, [detail]);

  useEffect(() => {
    if (waybillDetail) {
      form.setFieldsValue({
        waybillBased: true,
      });
    }
  }, [waybillDetail]);

  return (
    <Form.Item
      label="Is Claim based on Waybill"
      name="waybillBased"
      rules={[
        { required: true, message: 'Please select Is Claim based on Waybill' },
      ]}
    >
      <Radio.Group
        disabled={
          !!waybillDetail || type === EnumExternalClaimsType.Delivery_Claims
        }
      >
        <Radio value={true}>Yes</Radio>
        <Radio value={false}>No</Radio>
      </Radio.Group>
    </Form.Item>
  );
};

export const FieldClaimant: FC<ICommonFieldProps> = ({
  form,
  detail,
  waybillDetail,
}) => {
  const type = Form.useWatch('type', form);
  const [disabled, setDisabled] = useState(false);

  const validatorClaimant = (rule: RuleObject, value: StoreValue) => {
    const responsiblePartyObj = form.getFieldValue('responsiblePartyObj');
    const responsiblePartyId = responsiblePartyObj?.id ?? {};

    if (!value) {
      return Promise.reject('Please select Claimant');
    }
    if (value.id === 0 && responsiblePartyId === 0) {
      // 不允许两方均为Inteluck corporration
      return Promise.reject(
        new Error('Both parties cannot be Inteluck Corporation'),
      );
    }

    return Promise.resolve();
  };

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        claimantObj:
          _.isUndefined(detail?.claimantId) || _.isNull(detail?.claimantId)
            ? undefined
            : {
                name: detail?.claimantName,
                id: detail?.claimantId,
              },
      });
    }
  }, [detail]);

  useEffect(() => {
    if (internalClaimsTypeList.includes(type as EnumInternalClaimsType)) {
      // Internal Claim时， Claimant 默认为 Inteluck Corporation，不允许修改
      setDisabled(true);
      form.setFieldsValue({
        claimantObj: {
          name: 'Inteluck Corporation (Virtual)',
          id: 0,
        },
      });
    } else {
      if (waybillDetail) {
        setDisabled(true);
        form.setFieldsValue({
          claimantObj: {
            name: waybillDetail.customerName,
            id: waybillDetail.customerId,
          },
        });
      } else {
        setDisabled(false);
      }
    }
  }, [type, waybillDetail]);

  return (
    <Form.Item
      label="Claimant"
      name="claimantObj"
      dependencies={['responsiblePartyObj']}
      required={true}
      rules={[{ validator: validatorClaimant }]}
    >
      <FuzzySelector
        fieldProps={{
          placeholder: 'Claimant',
          disabled,
        }}
        request={{
          field: 'customerName',
          esDtoClass: ES_DTO_CLASS.CUSTOMER,
          type: FieldQueryHighlightTypeEnum.COUNTRY,
        }}
      />
    </Form.Item>
  );
};

export const FieldResponsibleParty: FC<ICommonFieldProps> = ({
  form,
  detail,
  waybillDetail,
}) => {
  const validatorResponsibleParty = (rule: RuleObject, value: StoreValue) => {
    const claimantObj = form.getFieldValue('claimantObj');
    const claimantId = claimantObj?.id ?? {};

    if (!value) {
      return Promise.reject('Please select a Responsible Party');
    }
    if (value.id === 0 && claimantId === 0) {
      // 不允许两方均为Inteluck corporration
      return Promise.reject(
        new Error('Both parties cannot be Inteluck Corporation'),
      );
    }

    return Promise.resolve();
  };

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        responsiblePartyObj:
          _.isUndefined(detail?.responsiblePartyId) ||
          _.isNull(detail?.responsiblePartyId)
            ? undefined
            : {
                name: detail?.responsiblePartyName,
                id: detail.responsiblePartyId,
              },
      });
    }
  }, [detail]);

  useEffect(() => {
    if (waybillDetail) {
      form.setFieldsValue({
        responsiblePartyObj: {
          name: waybillDetail.vendorName,
          label: waybillDetail?.vendorName,
          value: waybillDetail.vendorId,
          id: waybillDetail.vendorId,
        },
      });
    }
  }, [waybillDetail]);

  return waybillDetail ? (
    <Form.Item
      label="Responsible Party"
      name="responsiblePartyObj"
      dependencies={['claimantObj']}
      required={true}
      rules={[{ validator: validatorResponsibleParty }]}
    >
      <Select
        placeholder="Responsible Party"
        allowClear
        popupMatchSelectWidth
        defaultActiveFirstOption={false}
        labelInValue={true}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        options={_.uniqBy(
          [
            {
              label: waybillDetail?.vendorName,
              value: waybillDetail?.vendorId,
              id: waybillDetail?.vendorId,
            },
            { label: 'Inteluck Corporation (Virtual)', value: 0, id: 0 },
          ],
          'value',
        )}
      />
    </Form.Item>
  ) : (
    <Form.Item
      label="Responsible Party"
      name="responsiblePartyObj"
      dependencies={['claimantObj']}
      required={true}
      rules={[{ validator: validatorResponsibleParty }]}
    >
      <FuzzySelector
        fieldProps={{
          placeholder: 'Responsible Party',
        }}
        request={{
          field: 'vendorName',
          esDtoClass: ES_DTO_CLASS.VENDOR,
          type: FieldQueryHighlightTypeEnum.COUNTRY,
          uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM_REQUEST,
        }}
      />
    </Form.Item>
  );
};

export const FieldAffiliatedProject: FC<ICommonFieldProps> = ({
  form,
  detail,
  waybillDetail,
}) => {
  const claimantObj = Form.useWatch('claimantObj', form);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        affiliatedProjectObj:
          _.isUndefined(detail?.projectId) || _.isNull(detail?.projectId)
            ? undefined
            : {
                name: detail?.projectName,
                id: detail.projectId,
              },
      });
    }
  }, [detail]);

  useEffect(() => {
    if (waybillDetail) {
      setDisabled(true);
      form.setFieldsValue({
        affiliatedProjectObj: {
          name: waybillDetail.projectName,
          id: waybillDetail.projectId,
        },
      });
    } else {
      setDisabled(false);
      form.resetFields(['affiliatedProjectObj']);
    }
  }, [claimantObj, waybillDetail]);

  return (
    <Form.Item
      label="Affiliated Project"
      name="affiliatedProjectObj"
      dependencies={['claimantObj']}
    >
      <FuzzySelector
        fieldProps={{
          placeholder: 'Affiliated Project',
          disabled,
        }}
        request={{
          field: 'projectName',
          esDtoClass: ES_DTO_CLASS.PROJECT,
          type: FieldQueryHighlightTypeEnum.USER_ROLE,
          uniqueLogic:
            FieldQueryHighlightUniqueLogicEnum.CLAIM_AFFILIATED_PROJECT,
          uniqueLogicParams: claimantObj ? { customerId: claimantObj.id } : {},
        }}
      />
    </Form.Item>
  );
};

export const FieldExternalDescription: FC<ICommonFieldProps> = ({
  form,
  detail,
  waybillDetail,
}) => {
  const type = Form.useWatch(['type'], form);
  const claimantObj = Form.useWatch(['claimantObj'], form);
  const responsiblePartyObj = Form.useWatch(['responsiblePartyObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);

  const waybillBased = Form.useWatch(['waybillBased'], form);
  const [activeIndex, setActiveIndex] = useState<number>();
  const [waybillDetailFetching, setWaybillDetailFetching] =
    useState<boolean>(false);
  const waybillInfoMap = useRef<Map<number, IClaimWaybillInfo>>(new Map());

  const waybillValidator = async (v: StoreValue, index: number) => {
    if (v) {
      let waybillInfo;
      if (waybillInfoMap.current?.has(v.id)) {
        waybillInfo = waybillInfoMap.current?.get(v.id);
      } else {
        setActiveIndex(index);
        setWaybillDetailFetching(true);
        const res = await claimGetWaybillInfo(v.id).finally(() => {
          setWaybillDetailFetching(false);
        });
        if (res.code === 200) {
          waybillInfo = res.data;
          waybillInfoMap.current.set(v.id, res.data);
        } else {
          return Promise.reject(new Error('Network Error'));
        }
      }

      if (!waybillInfo) {
        return;
      }

      const {
        vendorId,
        customerId,
        hasAssociatedTicket,
        deliveredDate,
        plateNumber,
        customerCodeList,
        waybillStatus,
      } = waybillInfo;

      const waybillObjNamePath = ['itemList', index, 'waybillObj'];
      const referenceDateNamePath = ['itemList', index, 'referenceDate'];
      const plateNumberNamePath = ['itemList', index, 'plateNumber'];
      const customerCodeListNamePath = ['itemList', index, 'customerCodeList'];

      form?.setFieldValue(
        referenceDateNamePath,
        deliveredDate ? dayjs(deliveredDate) : undefined,
      );
      form?.setFieldValue(plateNumberNamePath, plateNumber);
      form?.setFieldValue(customerCodeListNamePath, customerCodeList);

      // 校验规则
      const values = await form?.getFieldsValue();
      const {
        claimantObj: _claimantObj,
        responsiblePartyObj: _responsiblePartyObj,
      } = values;

      if (_responsiblePartyObj) {
        _responsiblePartyObj.id =
          _responsiblePartyObj.id ?? _responsiblePartyObj.value;
      }

      if (waybillStatus === WaybillStatusEnum.CANCELED) {
        // Canceled 运单不可被关联
        return Promise.reject(
          new Error('Canceled waybills cannot be linked to Claims'),
        );
      } else if (
        customerId !== _claimantObj?.id &&
        claimantObj?.id !== 0 &&
        vendorId !== _responsiblePartyObj?.id &&
        _responsiblePartyObj?.id !== 0
      ) {
        // 两个均不符，则提示【客户与索赔方不符】即可
        return Promise.reject(
          new Error(
            'The waybill customer does not match the selected claimant',
          ),
        );
      } else if (customerId !== claimantObj?.id && claimantObj?.id !== 0) {
        // 客户与索赔方不符， 且索赔方不为ITK
        return Promise.reject(
          new Error(
            'The waybill customer does not match the selected claimant',
          ),
        );
      } else if (
        vendorId !== _responsiblePartyObj?.id &&
        _responsiblePartyObj?.id !== 0
      ) {
        // 供应商与责任方不符, 且责任方不为ITK
        return Promise.reject(
          new Error(
            'The waybill vendor does not match the selected responsible party',
          ),
        );
      } else if (hasAssociatedTicket) {
        setTimeout(() => {
          form?.setFields([
            {
              name: waybillObjNamePath,
              warnings: ['The waybill has been associated with another ticket'],
            },
          ]);
        }, 0);
        return Promise.resolve();
      } else {
        return Promise.resolve();
      }
    } else {
      return Promise.reject(new Error('Please select Waybill Number'));
    }
  };

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return +numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (type && claimantObj && responsiblePartyObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [type, claimantObj, responsiblePartyObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
            waybillObj: item?.waybillInfo?.waybillId
              ? {
                  name: item?.waybillInfo?.waybillNumber,
                  id: item.waybillId,
                }
              : undefined,
            referenceDate: item?.referenceDate
              ? dayjs(item?.referenceDate)
              : undefined,
          };
        }),
      });
    }
  }, [detail]);

  useEffect(() => {
    if (waybillDetail) {
      form.setFieldsValue({
        itemList: [
          {
            waybillObj: {
              name: waybillDetail?.waybillNumber,
              id: waybillDetail?.id,
            },
            referenceDate: waybillDetail?.destinationTime
              ? dayjs(waybillDetail?.destinationTime)
              : undefined,
            plateNumber: waybillDetail?.plateNumber,
            customerCodeList: waybillDetail?.customerCodeVos?.map(
              (item) => item.number,
            ),
          },
        ],
      });
    }
  }, [waybillDetail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <div>
        {waybillBased ? (
          <Form.List name={'itemList'}>
            {(fields, opt, { errors }) => {
              return (
                <>
                  <Flex vertical gap={4}>
                    {fields.map((field, index) => {
                      const referenceDate = form?.getFieldValue([
                        'itemList',
                        index,
                        'referenceDate',
                      ]);
                      const plateNumber = form?.getFieldValue([
                        'itemList',
                        index,
                        'plateNumber',
                      ]);
                      const customerCodeList = form?.getFieldValue([
                        'itemList',
                        index,
                        'customerCodeList',
                      ]);

                      return (
                        <Spin
                          key={field.key}
                          spinning={
                            waybillDetailFetching && index === activeIndex
                          }
                        >
                          <Flex align="center" gap={12}>
                            <div
                              style={{
                                width: waybillDetail
                                  ? 'calc(100%)'
                                  : 'calc(100% - 32px * 2 - 12px * 2)',
                                padding: '12px',
                                background: '#f5f5f5',
                              }}
                            >
                              <Row gutter={12}>
                                <Col span={15}>
                                  <Row gutter={12}>
                                    <Col span={8}>
                                      <Form.Item
                                        label="Waybill Number"
                                        name={[field.name, 'waybillObj']}
                                        dependencies={[
                                          'claimantObj',
                                          'responsiblePartyObj',
                                        ]}
                                        required
                                        rules={[
                                          {
                                            validator: (
                                              _rule: RuleObject,
                                              value: StoreValue,
                                            ) => waybillValidator(value, index),
                                          },
                                        ]}
                                      >
                                        <FuzzySelector
                                          fieldProps={{
                                            placeholder: 'Waybill Number',
                                            disabled:
                                              descriptionDisabled ||
                                              !!waybillDetail,
                                          }}
                                          request={{
                                            field: 'waybillNumber',
                                            esDtoClass: ES_DTO_CLASS.WAYBILL,
                                            type: FieldQueryHighlightTypeEnum.USER_ROLE,
                                          }}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        label="Claim Details"
                                        name={[field.name, 'detail']}
                                        rules={[
                                          {
                                            whitespace: true,
                                            message:
                                              'Cannot only contain spaces',
                                          },
                                        ]}
                                      >
                                        <Input.TextArea
                                          disabled={descriptionDisabled}
                                          placeholder="Claim Details"
                                          showCount
                                          rows={1}
                                          maxLength={MAX_LENGTH.NAME_200}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        label="Claim Amount"
                                        name={[field.name, 'amount']}
                                        rules={[
                                          {
                                            required: true,
                                            message: `Please enter Claim Amount`,
                                          },
                                        ]}
                                      >
                                        <InputNumber
                                          disabled={descriptionDisabled}
                                          placeholder="Claim Amount"
                                          min={0}
                                          precision={2}
                                          controls={false}
                                          formatter={(val) => {
                                            return val ? formatAmount(val) : '';
                                          }}
                                          suffix={<CountryIcon />}
                                          style={{ width: '100%' }}
                                        />
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </Col>
                                <Col span={9}>
                                  <Row gutter={12}>
                                    <Col span={8}>
                                      <Form.Item
                                        label="Delivery Date"
                                        name={[field.name, 'referenceDate']}
                                      >
                                        <Text type="secondary">
                                          {dayjs.isDayjs(referenceDate)
                                            ? referenceDate.format('YYYY-MM-DD')
                                            : (referenceDate ?? '-')}
                                        </Text>
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        label="Plate No."
                                        name={[field.name, 'plateNumber']}
                                      >
                                        <Text type="secondary">
                                          {plateNumber ?? '-'}
                                        </Text>
                                      </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                      <Form.Item
                                        label="Customer Code"
                                        name={[field.name, 'customerCodeList']}
                                      >
                                        <span>
                                          {customerCodeList?.length > 0
                                            ? customerCodeList?.map(
                                                (customerCode: string) => (
                                                  <Text
                                                    type="secondary"
                                                    key={customerCode}
                                                  >
                                                    {customerCode}
                                                  </Text>
                                                ),
                                              )
                                            : '-'}
                                        </span>
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </div>
                            {waybillDetail ? null : (
                              <>
                                {index === 0 ? (
                                  <Flex gap={12}>
                                    <Button
                                      onClick={() => {
                                        opt.add();
                                      }}
                                      icon={<PlusOutlined />}
                                    />
                                    {fields.length > 1 && (
                                      <Button
                                        style={{ flexBasis: 32 }}
                                        onClick={() => {
                                          opt.remove(field.name);
                                        }}
                                        icon={<MinusOutlined />}
                                      />
                                    )}
                                  </Flex>
                                ) : (
                                  <Button
                                    style={{ flexBasis: 32 }}
                                    onClick={() => {
                                      opt.remove(field.name);
                                    }}
                                    icon={<MinusOutlined />}
                                  />
                                )}
                              </>
                            )}
                          </Flex>
                        </Spin>
                      );
                    })}
                  </Flex>
                  {errors?.length > 0 ? (
                    <Form.Item>
                      <Form.ErrorList errors={errors} />
                    </Form.Item>
                  ) : null}
                </>
              );
            }}
          </Form.List>
        ) : (
          <Form.List name={'itemList'}>
            {(fields) => {
              return (
                <>
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      style={{
                        padding: '12px',
                        background: '#f5f5f5',
                      }}
                    >
                      <Row gutter={12}>
                        <Col span={12}>
                          <Form.Item
                            label="Claim Details"
                            name={[field.name, 'detail']}
                            rules={[
                              {
                                whitespace: true,
                                message: 'Cannot only contain spaces',
                              },
                            ]}
                          >
                            <Input
                              placeholder="Claim Details"
                              showCount
                              maxLength={MAX_LENGTH.NAME_200}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            label="Claim Amount"
                            name={[field.name, 'amount']}
                            rules={[
                              {
                                required: true,
                                message: `Please enter Claim Amount`,
                              },
                            ]}
                          >
                            <InputNumber
                              placeholder="Claim Amount"
                              min={0}
                              precision={2}
                              controls={false}
                              formatter={(val) => {
                                return val ? formatAmount(val) : '';
                              }}
                              suffix={<CountryIcon />}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </>
              );
            }}
          </Form.List>
        )}
      </div>
    </>
  );
};

export const FieldOcStatus: FC<ICommonFieldProps> = ({ form }) => {
  const totalAmount = Form.useWatch('totalAmount', form);
  const itemList = Form.useWatch(['itemList'], form);
  const [disabled, setDisabled] = useState(false);

  const validateDescription = async () => {
    setTimeout(() => {
      form
        ?.validateFields(['itemList'], { recursive: true })
        .then(() => {
          if (totalAmount === 0) {
            setDisabled(true);
            form?.setFields([
              {
                name: 'ocStatus',
                value: EnumClaimOcStatus.Not_Chargeable,
                warnings: [
                  'Total Claim Amount = 0. Update to non-zero first to modify OC Status.',
                ],
                errors: [],
              },
            ]);
          } else {
            setDisabled(false);
            form?.setFields([
              {
                name: 'ocStatus',
                warnings: [],
                errors: [],
              },
            ]);
          }
        })
        .catch(() => {
          setDisabled(true);
          form?.setFields([
            {
              name: 'ocStatus',
              errors: ['Please fill Description first'],
              warnings: [],
            },
          ]);
        });
    }, 0);
  };

  useEffect(() => {
    validateDescription();
  }, [itemList, totalAmount]);

  return (
    <Form.Item
      label="OC Status"
      name="ocStatus"
      rules={[{ required: true, message: 'Please select OC Status' }]}
    >
      <Select
        placeholder="OC Status"
        options={ocStatusOptions}
        disabled={disabled}
      />
    </Form.Item>
  );
};

export const FieldRemark: FC<ICommonFieldProps> = () => {
  return (
    <Form.Item label="Remark" name="remark">
      <Input.TextArea
        rows={1}
        placeholder="Remark"
        showCount
        maxLength={MAX_LENGTH.MAX_1000}
      />
    </Form.Item>
  );
};

export const FieldProof: FC<
  ICommonFieldProps & { getUploadingSize: (uploadingSize: number) => void }
> = ({ form, getUploadingSize }) => {
  const ocStatus = Form.useWatch('ocStatus', form);
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (ocStatus === EnumClaimOcStatus.Ongoing_Validation) {
      setRequired(false);

      form?.setFields([
        {
          name: 'documentIdList',
          errors: [],
        },
      ]);
    } else {
      setRequired(true);
    }
  }, [ocStatus]);

  return (
    <Form.Item
      name="documentIdList"
      label="Proof"
      required={required}
      rules={[
        {
          required: required,
          message: 'Please upload Proof',
        },
      ]}
    >
      <OssUpload
        dir={ENUM_OSS_MENU_DIRECTORY.PROJECT}
        showModeBar={true}
        scrollHeight={200}
        getUploadingSize={getUploadingSize}
      />
    </Form.Item>
  );
};

export const FieldGPSDescription: FC<ICommonFieldProps> = ({
  form,
  detail,
}) => {
  const type = Form.useWatch(['type'], form);
  const claimantObj = Form.useWatch(['claimantObj'], form);
  const responsiblePartyObj = Form.useWatch(['responsiblePartyObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return +numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (type && claimantObj && responsiblePartyObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [type, claimantObj, responsiblePartyObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
            waybillObj: item?.waybillInfo?.waybillId
              ? {
                  name: item?.waybillInfo?.waybillNumber,
                  id: item.waybillId,
                }
              : undefined,
            referenceDate: item?.referenceDate
              ? dayjs(item?.referenceDate)
              : undefined,
          };
        }),
      });
    }
  }, [detail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <div>
        <Form.List name={'itemList'}>
          {(fields, opt, { errors }) => {
            return (
              <>
                <Flex vertical gap={4}>
                  {fields.map((field, index) => {
                    return (
                      <Flex key={field.key} align="center" gap={12}>
                        <div
                          style={{
                            width: 'calc(100% - 32px * 2 - 12px * 2)',
                            padding: '12px',
                            background: '#f5f5f5',
                          }}
                        >
                          <Row gutter={12}>
                            <Col span={8}>
                              <Form.Item
                                label="Year,Month"
                                name={[field.name, 'referenceDate']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please select Year Month',
                                  },
                                ]}
                              >
                                <DatePicker
                                  disabled={descriptionDisabled}
                                  picker="month"
                                  placeholder="Year,Month"
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                label="Plate No."
                                name={[field.name, 'plateNumber']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter Plate No.',
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Plate No."
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item
                                label="Claim Amount"
                                name={[field.name, 'amount']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Claim Amount`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Claim Amount"
                                  min={0}
                                  precision={2}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  suffix={<CountryIcon />}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                        {index === 0 ? (
                          <Flex gap={12}>
                            <Button
                              onClick={() => {
                                opt.add();
                              }}
                              icon={<PlusOutlined />}
                            />
                            {fields.length > 1 && (
                              <Button
                                style={{ flexBasis: 32 }}
                                onClick={() => {
                                  opt.remove(field.name);
                                }}
                                icon={<MinusOutlined />}
                              />
                            )}
                          </Flex>
                        ) : (
                          <Button
                            style={{ flexBasis: 32 }}
                            onClick={() => {
                              opt.remove(field.name);
                            }}
                            icon={<MinusOutlined />}
                          />
                        )}
                      </Flex>
                    );
                  })}
                </Flex>
                {errors?.length > 0 ? (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                ) : null}
              </>
            );
          }}
        </Form.List>
      </div>
    </>
  );
};

export const FieldDDCTrainingFeeDescription: FC<ICommonFieldProps> = ({
  form,
  detail,
}) => {
  const type = Form.useWatch(['type'], form);
  const claimantObj = Form.useWatch(['claimantObj'], form);
  const responsiblePartyObj = Form.useWatch(['responsiblePartyObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return +numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (type && claimantObj && responsiblePartyObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [type, claimantObj, responsiblePartyObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
            waybillObj: item?.waybillInfo?.waybillId
              ? {
                  name: item?.waybillInfo?.waybillNumber,
                  id: item.waybillId,
                }
              : undefined,
            referenceDate: item?.referenceDate
              ? dayjs(item?.referenceDate)
              : undefined,
          };
        }),
      });
    }
  }, [detail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <div>
        <Form.List name={'itemList'}>
          {(fields, opt, { errors }) => {
            return (
              <>
                <Flex vertical gap={4}>
                  {fields.map((field, index) => {
                    return (
                      <Flex key={field.key} align="center" gap={12}>
                        <div
                          style={{
                            width: 'calc(100% - 32px * 2 - 12px * 2)',
                            padding: '12px',
                            background: '#f5f5f5',
                          }}
                        >
                          <Row gutter={12}>
                            <Col span={6}>
                              <Form.Item
                                label="Site"
                                name={[field.name, 'location']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter Site',
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Site"
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label="DDC Schedule"
                                name={[field.name, 'referenceDate']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please select DDC Schedule',
                                  },
                                ]}
                              >
                                <DatePicker
                                  disabled={descriptionDisabled}
                                  placeholder="DDC Schedule"
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label="Driver's Full Name"
                                name={[field.name, 'personName']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Driver's Full Name`,
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Driver's Full Name"
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label="Claim Amount"
                                name={[field.name, 'amount']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Claim Amount`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Claim Amount"
                                  min={0}
                                  precision={2}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  suffix={<CountryIcon />}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                        {index === 0 ? (
                          <Flex gap={12}>
                            <Button
                              onClick={() => {
                                opt.add();
                              }}
                              icon={<PlusOutlined />}
                            />
                            {fields.length > 1 && (
                              <Button
                                style={{ flexBasis: 32 }}
                                onClick={() => {
                                  opt.remove(field.name);
                                }}
                                icon={<MinusOutlined />}
                              />
                            )}
                          </Flex>
                        ) : (
                          <Button
                            style={{ flexBasis: 32 }}
                            onClick={() => {
                              opt.remove(field.name);
                            }}
                            icon={<MinusOutlined />}
                          />
                        )}
                      </Flex>
                    );
                  })}
                </Flex>
                {errors?.length > 0 ? (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                ) : null}
              </>
            );
          }}
        </Form.List>
      </div>
    </>
  );
};

export const FieldCrewUniformChargesDescription: FC<ICommonFieldProps> = ({
  form,
  detail,
}) => {
  const type = Form.useWatch(['type'], form);
  const claimantObj = Form.useWatch(['claimantObj'], form);
  const responsiblePartyObj = Form.useWatch(['responsiblePartyObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return +numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (type && claimantObj && responsiblePartyObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [type, claimantObj, responsiblePartyObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
            waybillObj: item?.waybillInfo?.waybillId
              ? {
                  name: item?.waybillInfo?.waybillNumber,
                  id: item.waybillId,
                }
              : undefined,
            referenceDate: item?.referenceDate
              ? dayjs(item?.referenceDate)
              : undefined,
          };
        }),
      });
    }
  }, [detail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <div>
        <Form.List name={'itemList'}>
          {(fields, opt, { errors }) => {
            return (
              <>
                <Flex vertical gap={4}>
                  {fields.map((field, index) => {
                    return (
                      <Flex key={field.key} align="center" gap={12}>
                        <div
                          style={{
                            width: 'calc(100% - 32px * 2 - 12px * 2)',
                            padding: '12px',
                            background: '#f5f5f5',
                          }}
                        >
                          <Row gutter={12}>
                            <Col span={4}>
                              <Form.Item
                                label="Requestor Name"
                                name={[field.name, 'personName']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter',
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Requestor Name"
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label="Uniform Delivery Date"
                                name={[field.name, 'referenceDate']}
                                rules={[
                                  {
                                    required: true,
                                    message:
                                      'Please select Uniform Delivery Date',
                                  },
                                ]}
                              >
                                <DatePicker
                                  disabled={descriptionDisabled}
                                  placeholder="Uniform Delivery Date"
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label="Size"
                                name={[field.name, 'size']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Size`,
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Select
                                  disabled={descriptionDisabled}
                                  placeholder="Size"
                                  options={sizeOptions}
                                ></Select>
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label="Qty"
                                name={[field.name, 'quantity']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Qty`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Qty"
                                  min={0}
                                  max={9999}
                                  precision={0}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label="Claim Details"
                                name={[field.name, 'detail']}
                                rules={[
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Claim Details"
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Form.Item
                                label="Claim Amount"
                                name={[field.name, 'amount']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Claim Amount`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Claim Amount"
                                  min={0}
                                  precision={2}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  suffix={<CountryIcon />}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                        {index === 0 ? (
                          <Flex gap={12}>
                            <Button
                              onClick={() => {
                                opt.add();
                              }}
                              icon={<PlusOutlined />}
                            />
                            {fields.length > 1 && (
                              <Button
                                style={{ flexBasis: 32 }}
                                onClick={() => {
                                  opt.remove(field.name);
                                }}
                                icon={<MinusOutlined />}
                              />
                            )}
                          </Flex>
                        ) : (
                          <Button
                            style={{ flexBasis: 32 }}
                            onClick={() => {
                              opt.remove(field.name);
                            }}
                            icon={<MinusOutlined />}
                          />
                        )}
                      </Flex>
                    );
                  })}
                </Flex>
                {errors?.length > 0 ? (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                ) : null}
              </>
            );
          }}
        </Form.List>
      </div>
    </>
  );
};

export const FieldInteluckInsuranceDescription: FC<ICommonFieldProps> = ({
  form,
  detail,
}) => {
  const type = Form.useWatch(['type'], form);
  const claimantObj = Form.useWatch(['claimantObj'], form);
  const responsiblePartyObj = Form.useWatch(['responsiblePartyObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return +numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (type && claimantObj && responsiblePartyObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [type, claimantObj, responsiblePartyObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
            waybillObj: item?.waybillInfo?.waybillId
              ? {
                  name: item?.waybillInfo?.waybillNumber,
                  id: item.waybillId,
                }
              : undefined,
            referenceDate: item?.referenceDate
              ? dayjs(item?.referenceDate)
              : undefined,
          };
        }),
      });
    }
  }, [detail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <div>
        <Form.List name={'itemList'}>
          {(fields, opt, { errors }) => {
            return (
              <>
                <Flex vertical gap={4}>
                  {fields.map((field, index) => {
                    return (
                      <Flex key={field.key} align="center" gap={12}>
                        <div
                          style={{
                            width: 'calc(100% - 32px * 2 - 12px * 2)',
                            padding: '12px',
                            background: '#f5f5f5',
                          }}
                        >
                          <Row gutter={12}>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="Plate No."
                                name={[field.name, 'plateNumber']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter',
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Plate No."
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="Effectivity Date"
                                name={[field.name, 'referenceDate']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please select Effectivity Date',
                                  },
                                ]}
                              >
                                <DatePicker
                                  disabled={descriptionDisabled}
                                  placeholder="Effectivity Date"
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="Insurance Company"
                                name={[field.name, 'companyName']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter`,
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                  {
                                    pattern:
                                      /^[^<>{}[\]\\/&|^%$#@!~`*+=?;:'"()]+$/,
                                    message:
                                      'Cannot contain special characters',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Insurance Company"
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="Coverage Type"
                                name={[field.name, 'coverageType']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter`,
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                  {
                                    pattern:
                                      /^[^<>{}[\]\\/&|^%$#@!~`*+=?;:'"()]+$/,
                                    message:
                                      'Cannot contain special characters',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Coverage Type"
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="Claim Amount"
                                name={[field.name, 'amount']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Claim Amount`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Claim Amount"
                                  min={0}
                                  precision={2}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  suffix={<CountryIcon />}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                        {index === 0 ? (
                          <Flex gap={12}>
                            <Button
                              onClick={() => {
                                opt.add();
                              }}
                              icon={<PlusOutlined />}
                            />
                            {fields.length > 1 && (
                              <Button
                                style={{ flexBasis: 32 }}
                                onClick={() => {
                                  opt.remove(field.name);
                                }}
                                icon={<MinusOutlined />}
                              />
                            )}
                          </Flex>
                        ) : (
                          <Button
                            style={{ flexBasis: 32 }}
                            onClick={() => {
                              opt.remove(field.name);
                            }}
                            icon={<MinusOutlined />}
                          />
                        )}
                      </Flex>
                    );
                  })}
                </Flex>
                {errors?.length > 0 ? (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                ) : null}
              </>
            );
          }}
        </Form.List>
      </div>
    </>
  );
};

export const FieldCouponFeeDescription: FC<ICommonFieldProps> = ({
  form,
  detail,
}) => {
  const type = Form.useWatch(['type'], form);
  const claimantObj = Form.useWatch(['claimantObj'], form);
  const responsiblePartyObj = Form.useWatch(['responsiblePartyObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return +numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (type && claimantObj && responsiblePartyObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [type, claimantObj, responsiblePartyObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
            waybillObj: item?.waybillInfo?.waybillId
              ? {
                  name: item?.waybillInfo?.waybillNumber,
                  id: item.waybillId,
                }
              : undefined,
            referenceDate: item?.referenceDate
              ? dayjs(item?.referenceDate)
              : undefined,
          };
        }),
      });
    }
  }, [detail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <div>
        <Form.List name={'itemList'}>
          {(fields, opt, { errors }) => {
            return (
              <>
                <Flex vertical gap={4}>
                  {fields.map((field, index) => {
                    return (
                      <Flex key={field.key} align="center" gap={12}>
                        <div
                          style={{
                            width: 'calc(100% - 32px * 2 - 12px * 2)',
                            padding: '12px',
                            background: '#f5f5f5',
                          }}
                        >
                          <Row gutter={12}>
                            <Col span={6}>
                              <Form.Item
                                label="Plate No."
                                name={[field.name, 'plateNumber']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter',
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Plate No."
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label="RDD"
                                name={[field.name, 'referenceDate']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please select RDD',
                                  },
                                ]}
                              >
                                <DatePicker
                                  disabled={descriptionDisabled}
                                  placeholder="RDD"
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label="Qty"
                                name={[field.name, 'quantity']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Qty`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Qty"
                                  min={0}
                                  max={9999}
                                  precision={0}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col span={6}>
                              <Form.Item
                                label="Claim Amount"
                                name={[field.name, 'amount']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Claim Amount`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Claim Amount"
                                  min={0}
                                  precision={2}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  suffix={<CountryIcon />}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                        {index === 0 ? (
                          <Flex gap={12}>
                            <Button
                              onClick={() => {
                                opt.add();
                              }}
                              icon={<PlusOutlined />}
                            />
                            {fields.length > 1 && (
                              <Button
                                style={{ flexBasis: 32 }}
                                onClick={() => {
                                  opt.remove(field.name);
                                }}
                                icon={<MinusOutlined />}
                              />
                            )}
                          </Flex>
                        ) : (
                          <Button
                            style={{ flexBasis: 32 }}
                            onClick={() => {
                              opt.remove(field.name);
                            }}
                            icon={<MinusOutlined />}
                          />
                        )}
                      </Flex>
                    );
                  })}
                </Flex>
                {errors?.length > 0 ? (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                ) : null}
              </>
            );
          }}
        </Form.List>
      </div>
    </>
  );
};

export const FieldMedicalFeeDescription: FC<ICommonFieldProps> = ({
  form,
  detail,
}) => {
  const type = Form.useWatch(['type'], form);
  const claimantObj = Form.useWatch(['claimantObj'], form);
  const responsiblePartyObj = Form.useWatch(['responsiblePartyObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return +numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (type && claimantObj && responsiblePartyObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [type, claimantObj, responsiblePartyObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
            waybillObj: item?.waybillInfo?.waybillId
              ? {
                  name: item?.waybillInfo?.waybillNumber,
                  id: item.waybillId,
                }
              : undefined,
            referenceDate: item?.referenceDate
              ? dayjs(item?.referenceDate)
              : undefined,
          };
        }),
      });
    }
  }, [detail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <div>
        <Form.List name={'itemList'}>
          {(fields, opt, { errors }) => {
            return (
              <>
                <Flex vertical gap={4}>
                  {fields.map((field, index) => {
                    return (
                      <Flex key={field.key} align="center" gap={12}>
                        <div
                          style={{
                            width: 'calc(100% - 32px * 2 - 12px * 2)',
                            padding: '12px',
                            background: '#f5f5f5',
                          }}
                        >
                          <Row gutter={12}>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="Plate No."
                                name={[field.name, 'plateNumber']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter',
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Plate No."
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="RDD"
                                name={[field.name, 'referenceDate']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please select RDD',
                                  },
                                ]}
                              >
                                <DatePicker
                                  disabled={descriptionDisabled}
                                  placeholder="RDD"
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="Name"
                                name={[field.name, 'personName']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Name`,
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Name"
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="Position (Driver/Helper)"
                                name={[field.name, 'position']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please select Position`,
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Select
                                  disabled={descriptionDisabled}
                                  placeholder="Position"
                                  options={positionOptions}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 20%">
                              <Form.Item
                                label="Claim Amount"
                                name={[field.name, 'amount']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Claim Amount`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Claim Amount"
                                  min={0}
                                  precision={2}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  suffix={<CountryIcon />}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                        {index === 0 ? (
                          <Flex gap={12}>
                            <Button
                              onClick={() => {
                                opt.add();
                              }}
                              icon={<PlusOutlined />}
                            />
                            {fields.length > 1 && (
                              <Button
                                style={{ flexBasis: 32 }}
                                onClick={() => {
                                  opt.remove(field.name);
                                }}
                                icon={<MinusOutlined />}
                              />
                            )}
                          </Flex>
                        ) : (
                          <Button
                            style={{ flexBasis: 32 }}
                            onClick={() => {
                              opt.remove(field.name);
                            }}
                            icon={<MinusOutlined />}
                          />
                        )}
                      </Flex>
                    );
                  })}
                </Flex>
                {errors?.length > 0 ? (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                ) : null}
              </>
            );
          }}
        </Form.List>
      </div>
    </>
  );
};

export const FieldEquipmentFeeDescription: FC<ICommonFieldProps> = ({
  form,
  detail,
}) => {
  const type = Form.useWatch(['type'], form);
  const claimantObj = Form.useWatch(['claimantObj'], form);
  const responsiblePartyObj = Form.useWatch(['responsiblePartyObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return +numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (type && claimantObj && responsiblePartyObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [type, claimantObj, responsiblePartyObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
            waybillObj: item?.waybillInfo?.waybillId
              ? {
                  name: item?.waybillInfo?.waybillNumber,
                  id: item.waybillId,
                }
              : undefined,
            referenceDate: item?.referenceDate
              ? dayjs(item?.referenceDate)
              : undefined,
          };
        }),
      });
    }
  }, [detail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <div>
        <Form.List name={'itemList'}>
          {(fields, opt, { errors }) => {
            return (
              <>
                <Flex vertical gap={4}>
                  {fields.map((field, index) => {
                    return (
                      <Flex key={field.key} align="center" gap={12}>
                        <div
                          style={{
                            width: 'calc(100% - 32px * 2 - 12px * 2)',
                            padding: '12px',
                            background: '#f5f5f5',
                          }}
                        >
                          <Row gutter={12}>
                            <Col flex="1 1 14.28%">
                              <Form.Item
                                label="Installed Date"
                                name={[field.name, 'referenceDate']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please select Installed Date',
                                  },
                                ]}
                              >
                                <DatePicker
                                  disabled={descriptionDisabled}
                                  placeholder="Installed Date"
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 14.28%">
                              <Form.Item
                                label="Plate No."
                                name={[field.name, 'plateNumber']}
                                rules={[
                                  {
                                    required: true,
                                    message: 'Please enter',
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Plate No."
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 14.28%">
                              <Form.Item
                                label="Qty"
                                name={[field.name, 'quantity']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Qty`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Qty"
                                  min={0}
                                  max={9999}
                                  precision={0}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 14.28%">
                              <Form.Item
                                label="Item"
                                name={[field.name, 'item']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Item`,
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Item"
                                  showCount
                                  rows={1}
                                  maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 14.28%">
                              <Form.Item
                                label="Requested By"
                                name={[field.name, 'personName']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Requested By`,
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Requested By"
                                  rows={1}
                                  // showCount
                                  // maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 14.28%">
                              <Form.Item
                                label="Location"
                                name={[field.name, 'location']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Location`,
                                  },
                                  {
                                    whitespace: true,
                                    message: 'Cannot only contain spaces',
                                  },
                                ]}
                              >
                                <Input.TextArea
                                  disabled={descriptionDisabled}
                                  placeholder="Location"
                                  rows={1}
                                  // showCount
                                  // maxLength={MAX_LENGTH.NAME_200}
                                />
                              </Form.Item>
                            </Col>
                            <Col flex="1 1 14.28%">
                              <Form.Item
                                label="Claim Amount"
                                name={[field.name, 'amount']}
                                rules={[
                                  {
                                    required: true,
                                    message: `Please enter Claim Amount`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  disabled={descriptionDisabled}
                                  placeholder="Claim Amount"
                                  min={0}
                                  precision={2}
                                  controls={false}
                                  formatter={(val) => {
                                    return val ? formatAmount(val) : '';
                                  }}
                                  suffix={<CountryIcon />}
                                  style={{ width: '100%' }}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                        {index === 0 ? (
                          <Flex gap={12}>
                            <Button
                              onClick={() => {
                                opt.add();
                              }}
                              icon={<PlusOutlined />}
                            />
                            {fields.length > 1 && (
                              <Button
                                style={{ flexBasis: 32 }}
                                onClick={() => {
                                  opt.remove(field.name);
                                }}
                                icon={<MinusOutlined />}
                              />
                            )}
                          </Flex>
                        ) : (
                          <Button
                            style={{ flexBasis: 32 }}
                            onClick={() => {
                              opt.remove(field.name);
                            }}
                            icon={<MinusOutlined />}
                          />
                        )}
                      </Flex>
                    );
                  })}
                </Flex>
                {errors?.length > 0 ? (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                ) : null}
              </>
            );
          }}
        </Form.List>
      </div>
    </>
  );
};

export const FieldStuffingFeeDescription: FC<ICommonFieldProps> = ({
  form,
  detail,
}) => {
  const type = Form.useWatch(['type'], form);
  const claimantObj = Form.useWatch(['claimantObj'], form);
  const responsiblePartyObj = Form.useWatch(['responsiblePartyObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>();
  const [waybillDetailFetching, setWaybillDetailFetching] =
    useState<boolean>(false);
  const waybillInfoMap = useRef<Map<number, IClaimWaybillInfo>>(new Map());

  const waybillValidator = async (v: StoreValue, index: number) => {
    if (v) {
      let waybillInfo;
      if (waybillInfoMap.current?.has(v.id)) {
        waybillInfo = waybillInfoMap.current?.get(v.id);
      } else {
        setActiveIndex(index);
        setWaybillDetailFetching(true);
        const res = await claimGetWaybillInfo(v.id).finally(() => {
          setWaybillDetailFetching(false);
        });
        if (res.code === 200) {
          waybillInfo = res.data;
          waybillInfoMap.current.set(v.id, res.data);
        } else {
          return Promise.reject(new Error('Network Error'));
        }
      }

      if (!waybillInfo) {
        return;
      }

      const {
        vendorId,
        customerId,
        deliveredDate,
        hasAssociatedTicket,
        plateNumber,
        truckTypeName,
        driverName,
        waybillStatus,
      } = waybillInfo;

      const waybillObjNamePath = ['itemList', index, 'waybillObj'];
      const referenceDateNamePath = ['itemList', index, 'referenceDate'];
      const plateNumberNamePath = ['itemList', index, 'plateNumber'];
      const truckTypeNamePath = ['itemList', index, 'truckTypeName'];
      const personNamePath = ['itemList', index, 'personName'];

      form?.setFieldValue(
        referenceDateNamePath,
        deliveredDate ? dayjs(deliveredDate) : undefined,
      );
      form?.setFieldValue(plateNumberNamePath, plateNumber);
      form?.setFieldValue(truckTypeNamePath, truckTypeName);
      form?.setFieldValue(personNamePath, driverName);

      // 校验规则
      const values = await form?.getFieldsValue();
      const {
        claimantObj: _claimantObj,
        responsiblePartyObj: _responsiblePartyObj,
      } = values;

      if (_responsiblePartyObj) {
        _responsiblePartyObj.id =
          _responsiblePartyObj.id ?? _responsiblePartyObj.value;
      }
      if (waybillStatus === WaybillStatusEnum.CANCELED) {
        // Canceled 运单不可被关联
        return Promise.reject(
          new Error('Canceled waybills cannot be linked to Claims'),
        );
      } else if (
        customerId !== _claimantObj?.id &&
        claimantObj?.id !== 0 &&
        vendorId !== _responsiblePartyObj?.id &&
        _responsiblePartyObj?.id !== 0
      ) {
        // 两个均不符，则提示【客户与索赔方不符】即可
        return Promise.reject(
          new Error(
            'The waybill customer does not match the selected claimant',
          ),
        );
      } else if (customerId !== claimantObj?.id && claimantObj?.id !== 0) {
        // 客户与索赔方不符， 且索赔方不为ITK
        return Promise.reject(
          new Error(
            'The waybill customer does not match the selected claimant',
          ),
        );
      } else if (
        vendorId !== _responsiblePartyObj?.id &&
        _responsiblePartyObj?.id !== 0
      ) {
        // 供应商与责任方不符, 且责任方不为ITK
        return Promise.reject(
          new Error(
            'The waybill vendor does not match the selected responsible party',
          ),
        );
      } else if (hasAssociatedTicket) {
        setTimeout(() => {
          form?.setFields([
            {
              name: waybillObjNamePath,
              warnings: ['The waybill has been associated with another ticket'],
            },
          ]);
        }, 0);
        return Promise.resolve();
      } else {
        return Promise.resolve();
      }
    } else {
      return Promise.reject(new Error('Please select Waybill Number'));
    }
  };

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return +numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (type && claimantObj && responsiblePartyObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [type, claimantObj, responsiblePartyObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
            waybillObj: item?.waybillInfo?.waybillId
              ? {
                  name: item?.waybillInfo?.waybillNumber,
                  id: item.waybillId,
                }
              : undefined,
            referenceDate: item?.referenceDate
              ? dayjs(item?.referenceDate)
              : undefined,
          };
        }),
      });
    }
  }, [detail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <div>
        <Form.List name={'itemList'}>
          {(fields, opt, { errors }) => {
            return (
              <>
                <Flex vertical gap={4}>
                  {fields.map((field, index) => {
                    const referenceDate = form?.getFieldValue([
                      'itemList',
                      index,
                      'referenceDate',
                    ]);
                    const plateNumber = form?.getFieldValue([
                      'itemList',
                      index,
                      'plateNumber',
                    ]);
                    const truckTypeName = form?.getFieldValue([
                      'itemList',
                      index,
                      'truckTypeName',
                    ]);
                    const personName = form?.getFieldValue([
                      'itemList',
                      index,
                      'personName',
                    ]);

                    console.log({
                      referenceDate,
                      plateNumber,
                      truckTypeName,
                      personName,
                    });

                    return (
                      <Spin
                        key={field.key}
                        spinning={
                          waybillDetailFetching && index === activeIndex
                        }
                      >
                        <Flex align="center" gap={12}>
                          <div
                            style={{
                              width: 'calc(100% - 32px * 2 - 12px * 2)',
                              padding: '12px',
                              background: '#f5f5f5',
                            }}
                          >
                            <Row gutter={12}>
                              <Col span={15}>
                                <Row gutter={12}>
                                  <Col span={8}>
                                    <Form.Item
                                      label="Waybill Number"
                                      name={[field.name, 'waybillObj']}
                                      required
                                      rules={[
                                        {
                                          validator: (
                                            _rule: RuleObject,
                                            value: StoreValue,
                                          ) => waybillValidator(value, index),
                                        },
                                      ]}
                                    >
                                      <FuzzySelector
                                        fieldProps={{
                                          disabled: descriptionDisabled,
                                          placeholder: 'Waybill Number',
                                        }}
                                        request={{
                                          field: 'waybillNumber',
                                          esDtoClass: ES_DTO_CLASS.WAYBILL,
                                          type: FieldQueryHighlightTypeEnum.USER_ROLE,
                                        }}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <Form.Item
                                      label="FO"
                                      name={[field.name, 'fo']}
                                      rules={[
                                        {
                                          required: true,
                                          message: 'Please enter FO',
                                        },
                                        {
                                          whitespace: true,
                                          message: 'Cannot only contain spaces',
                                        },
                                      ]}
                                    >
                                      <Input.TextArea
                                        disabled={descriptionDisabled}
                                        placeholder="FO"
                                        showCount
                                        rows={1}
                                        maxLength={MAX_LENGTH.NAME_200}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={8}>
                                    <Form.Item
                                      label="Claim Amount"
                                      name={[field.name, 'amount']}
                                      rules={[
                                        {
                                          required: true,
                                          message: `Please enter Claim Amount`,
                                        },
                                      ]}
                                    >
                                      <InputNumber
                                        disabled={descriptionDisabled}
                                        placeholder="Claim Amount"
                                        min={0}
                                        precision={2}
                                        controls={false}
                                        formatter={(val) => {
                                          return val ? formatAmount(val) : '';
                                        }}
                                        suffix={<CountryIcon />}
                                        style={{ width: '100%' }}
                                      />
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Col>
                              <Col span={9}>
                                <Row gutter={12}>
                                  <Col span={6}>
                                    <Form.Item
                                      label="Delivery Date"
                                      name={[field.name, 'referenceDate']}
                                    >
                                      <Text type="secondary">
                                        {dayjs.isDayjs(referenceDate)
                                          ? referenceDate.format('YYYY-MM-DD')
                                          : (referenceDate ?? '-')}
                                      </Text>
                                    </Form.Item>
                                  </Col>
                                  <Col span={6}>
                                    <Form.Item
                                      label="Plate No."
                                      name={[field.name, 'plateNumber']}
                                    >
                                      <Text type="secondary">
                                        {plateNumber ?? '-'}
                                      </Text>
                                    </Form.Item>
                                  </Col>
                                  <Col span={6}>
                                    <Form.Item
                                      label="Truk Type"
                                      name={[field.name, 'truckTypeName']}
                                    >
                                      <Text type="secondary">
                                        {truckTypeName ?? '-'}
                                      </Text>
                                    </Form.Item>
                                  </Col>
                                  <Col span={6}>
                                    <Form.Item
                                      label="Driver"
                                      name={[field.name, 'personName']}
                                    >
                                      <Text type="secondary">
                                        {personName ?? '-'}
                                      </Text>
                                    </Form.Item>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </div>
                          {index === 0 ? (
                            <Flex gap={12}>
                              <Button
                                onClick={() => {
                                  opt.add();
                                }}
                                icon={<PlusOutlined />}
                              />
                              {fields.length > 1 && (
                                <Button
                                  style={{ flexBasis: 32 }}
                                  onClick={() => {
                                    opt.remove(field.name);
                                  }}
                                  icon={<MinusOutlined />}
                                />
                              )}
                            </Flex>
                          ) : (
                            <Button
                              style={{ flexBasis: 32 }}
                              onClick={() => {
                                opt.remove(field.name);
                              }}
                              icon={<MinusOutlined />}
                            />
                          )}
                        </Flex>
                      </Spin>
                    );
                  })}
                </Flex>
                {errors?.length > 0 ? (
                  <Form.Item>
                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                ) : null}
              </>
            );
          }}
        </Form.List>
      </div>
    </>
  );
};
