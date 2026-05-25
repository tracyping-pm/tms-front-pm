import { opportunityUserSelector } from '@/api/opportunity';
import { getTruckTypeList } from '@/api/truck';
import {
  ICustomerLeadSelectorRecord,
  IOpportunityDetailData,
  IOpportunityRecord,
  IOpportunityUserSelectorRecord,
} from '@/api/types/opportunity';
import { ITruckTypeListItem } from '@/api/types/truck';
import CustomerLeadSelector from '@/components/CustomerLeadSelector';
import CustomFormInput from '@/components/CustomFormInput';
import { MAX_LENGTH, PIC_TYPE } from '@/constants';
import {
  BUEnumText,
  CurrentRequirementEnumText,
  DistanceEnumText,
  OpportunitiesCustomerTypeEnum,
  PotentialRequirementEnumText,
  PotentialVolumeFrequencyEnum,
  RequirementFrequencyEnumText,
  RequirementTypeEnumText,
} from '@/enums';
import CustomPotentialVolume from '@/pages/customer/Opportunities/components/CustomPotentialVolume';
import {
  ModalForm,
  ModalFormProps,
  ProFormDatePicker,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Col, Form, Row } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import CustomBdAndCamPic from './CustomBdAndCamPic';
import styles from './styles.less';
interface IOpportunitiesAddModal extends ModalFormProps {
  open: boolean;
  record?: IOpportunityDetailData;
  customerName?: string;
  leadName?: string;
  onConfirm?: (values: IOpportunityRecord) => void;
}

const OpportunitiesAddModal = ({
  open,
  record,
  customerName,
  leadName,
  onConfirm,
  modalProps,
  ...restProps
}: IOpportunitiesAddModal) => {
  const { id } = useParams();
  const formRef = useRef<ProFormInstance>();
  const [serviceTruckTypeList, setServiceTruckTypeList] = useState<
    DefaultOptionType[]
  >([]);
  const [bdPicOptions, setBdPicOptions] = useState<DefaultOptionType[]>([]);
  const [pricingPicOptions, setPricingPicOptions] = useState<
    DefaultOptionType[]
  >([]);
  const [vdPicOptions, setVdPicOptions] = useState<DefaultOptionType[]>([]);

  const getTruckTypeListHandle = async () => {
    const res = await getTruckTypeList();
    let list: { label: string; value: number }[] = [];
    if (res.code === 200) {
      list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    }
    setServiceTruckTypeList(list);
  };

  const getPicOptionsHandle = async () => {
    const res = await Promise.all([
      opportunityUserSelector(PIC_TYPE.LEAD_BD_PIC),
      opportunityUserSelector(PIC_TYPE.PRICING_PIC),
      opportunityUserSelector(PIC_TYPE.VD_PIC),
    ]);

    let list: DefaultOptionType[][] = [];
    res.forEach((item) => {
      const _list =
        item?.data?.map((_item: IOpportunityUserSelectorRecord) => {
          return {
            ..._item,
            label: _item.userAliasName,
            value: _item.id,
          };
        }) ?? [];
      list.push(_list);
    });
    setBdPicOptions(list[0]);
    setPricingPicOptions(list[1]);
    setVdPicOptions(list[2]);
    // if (!record?.opportunityId) {
    //   formRef.current?.setFieldValue('pricingUserRoleId', list[1]?.[0]?.value);
    //   formRef.current?.setFieldValue('vdUserRoleId', list[2]?.[0]?.value);
    // }
  };

  const chooseCustomerOption = async (option?: ICustomerLeadSelectorRecord) => {
    if (!option) {
      return;
    }

    const type = option.isCustomer
      ? OpportunitiesCustomerTypeEnum.EXISTING_CUSTOMER
      : OpportunitiesCustomerTypeEnum.NEW_CUSTOMER;
    formRef.current?.setFieldValue('customerType', type);
  };

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  const onFill = useCallback((v: IOpportunityDetailData) => {
    const obj = v;
    formRef?.current?.setFieldsValue(obj);

    formRef.current?.setFieldsValue({
      customerNameObj: {
        name: obj.customerName,
        isCustomer: obj.isCustomer,
        id: obj.isCustomer ? obj.customerId : obj.leadId,
      },
      potentialVolumeObj: {
        potentialVolumeQuantity: obj.potentialVolumeQuantity,
        potentialVolumeFrequency: obj.potentialVolumeFrequency,
      },
      picObj: {
        picType: obj.picType,
        picUserRoleId: obj.picUserRoleId,
      },
    });
  }, []);

  const init = useCallback(async () => {
    getTruckTypeListHandle();
    getPicOptionsHandle();
    if (record) {
      onFill(record);
    } else if (customerName) {
      formRef.current?.setFieldValue('customerNameObj', {
        id: +id!,
        name: customerName,
        isCustomer: true,
      });
      formRef.current?.setFieldValue(
        'customerType',
        OpportunitiesCustomerTypeEnum.EXISTING_CUSTOMER,
      );
    } else if (leadName) {
      formRef.current?.setFieldValue('customerNameObj', {
        id: +id!,
        name: leadName,
        isCustomer: false,
      });
      formRef.current?.setFieldValue(
        'customerType',
        OpportunitiesCustomerTypeEnum.NEW_CUSTOMER,
      );
    } else {
      reset();
    }
  }, [record]);

  const handleOk = async () => {
    const values = formRef?.current?.getFieldsValue?.();
    const payload = {
      ...values,
      ...values.picObj,
      id: record?.opportunityId ? +id! : undefined,
      potentialVolumeQuantity:
        values?.potentialVolumeObj?.potentialVolumeQuantity,
      potentialVolumeFrequency: values?.potentialVolumeObj
        ?.potentialVolumeQuantity
        ? values?.potentialVolumeObj?.potentialVolumeFrequency
        : undefined,
      quotationRequestReceivedDate: values.quotationRequestReceivedDate
        ? dayjs(values.quotationRequestReceivedDate).format('YYYY-MM-DD')
        : undefined,
      quotationSubmittedDate: values.quotationSubmittedDate
        ? dayjs(values.quotationSubmittedDate).format('YYYY-MM-DD')
        : undefined,
      rfqBiddingDeadlineDate: values.rfqBiddingDeadlineDate
        ? dayjs(values.rfqBiddingDeadlineDate).format('YYYY-MM-DD')
        : undefined,
      customerId: values.customerNameObj?.isCustomer
        ? values.customerNameObj.id
        : undefined,
      leadId: !values.customerNameObj?.isCustomer
        ? values.customerNameObj?.id
        : undefined,
    };

    delete payload.customerNameObj;
    delete payload.customerType;
    delete payload.potentialVolumeObj;
    delete payload.picObj;
    if (!!record?.opportunityId) {
      delete payload.customerId;
      delete payload.leadId;
      delete payload.projectName;
    }
    console.log(0, payload);
    // return;
    onConfirm?.(payload);
  };

  useEffect(() => {
    if (open) {
      init();
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <ModalForm
        name="opportunity-modal"
        open={open}
        title={`${record?.opportunityId ? 'Edit' : 'Create'} Opportunity`}
        width={1050}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item
              name={`customerNameObj`}
              label={`Customer Name`}
              rules={[
                {
                  required: true,
                  message: `Please Select Customer`,
                },
              ]}
            >
              <CustomerLeadSelector
                placeholder={`Please Select customer`}
                disabled={
                  !!customerName || !!leadName || !!record?.opportunityId
                }
                onChange={chooseCustomerOption}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <ProFormText
              name="customerType"
              label="Customer Type"
              placeholder="Please Select Customer Type"
              disabled
            />
          </Col>
          <Col span={12}>
            <Form.Item
              name="projectName"
              label="Project Name"
              rules={[
                {
                  required: true,
                  message: `Please enter Project Name`,
                },
                {
                  whitespace: true,
                  message: 'Cannot only contain spaces',
                },
                {
                  min: MAX_LENGTH.SHORT_NAME,
                  message: `Please enter at least ${MAX_LENGTH.SHORT_NAME} characters Name`,
                },
                {
                  max: MAX_LENGTH.LONG_NAME,
                  message: `Name cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                },
              ]}
            >
              <CustomFormInput
                disabled={!!record?.opportunityId}
                placeholder="Please Select Project Name"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="bu"
              label="BU"
              placeholder="Please Select BU"
              valueEnum={BUEnumText}
              rules={[
                {
                  required: true,
                  message: `Please Select BU`,
                },
              ]}
            />
          </Col>
          {/* <Col span={12}>
            <ProFormSelect
              name="bdUserRoleId"
              label="BD PIC"
              placeholder="Please Select BD"
              rules={[
                {
                  required: true,
                  message: `Please Select BD`,
                },
              ]}
              showSearch
              fieldProps={{
                options: bdPicOptions,
                loading: bdPicOptions.length === 0,
                optionRender: (option) => {
                  return (
                    <div className={styles.picOption}>
                      <div
                        className={styles.picOptionLabel}
                        title={option.data.label as string}
                      >
                        {option.data.label}
                      </div>

                      <div
                        className={styles.picOptionLabel}
                        title={option.data?.roleName}
                      >
                        {option.data?.roleName}
                      </div>
                      <div
                        className={styles.picOptionLabel}
                        title={option.data.departmentName}
                      >
                        {option.data.departmentName}
                      </div>
                    </div>
                  );
                },
              }}
            />
          </Col> */}
          <Col span={12}>
            <Form.Item
              name="picObj"
              label="PIC"
              rules={[
                {
                  required: true,
                  message: `Please Select PIC`,
                },
                {
                  validator: (_, value) => {
                    if (!value?.picType && value?.picUserRoleId) {
                      return Promise.reject('Please Select BD OR CAM');
                    } else if (!value?.picUserRoleId && value?.picType) {
                      return Promise.reject('Please Select PIC');
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
              ]}
            >
              <CustomBdAndCamPic bdPicOptions={bdPicOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="pricingUserRoleId"
              label="Strategy PIC"
              placeholder="Please Select Strategy PIC"
              showSearch
              fieldProps={{
                options: pricingPicOptions,
                loading: pricingPicOptions.length === 0,
                optionRender: (option) => {
                  return (
                    <div className={styles.picOption}>
                      <div
                        className={styles.picOptionLabel}
                        title={option.data.label as string}
                      >
                        {option.data.label}
                      </div>

                      <div
                        className={styles.picOptionLabel}
                        title={option.data?.roleName}
                      >
                        {option.data?.roleName}
                      </div>
                      <div
                        className={styles.picOptionLabel}
                        title={option.data.departmentName}
                      >
                        {option.data.departmentName}
                      </div>
                    </div>
                  );
                },
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="vdUserRoleId"
              label="Procurement PIC"
              placeholder="Please Select Procurement PIC"
              showSearch
              fieldProps={{
                options: vdPicOptions,
                loading: vdPicOptions.length === 0,
                optionRender: (option) => {
                  return (
                    <div className={styles.picOption}>
                      <div
                        className={styles.picOptionLabel}
                        title={option.data.label as string}
                      >
                        {option.data.label}
                      </div>

                      <div
                        className={styles.picOptionLabel}
                        title={option.data?.roleName}
                      >
                        {option.data?.roleName}
                      </div>
                      <div
                        className={styles.picOptionLabel}
                        title={option.data.departmentName}
                      >
                        {option.data.departmentName}
                      </div>
                    </div>
                  );
                },
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormRadio.Group
              name="requirementType"
              label="Requirement Type"
              valueEnum={RequirementTypeEnumText}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="currentRequirementList"
              label="Current Requirement"
              placeholder="Please Select Current Requirement"
              valueEnum={CurrentRequirementEnumText}
              fieldProps={{
                mode: 'multiple',
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="potentialRequirementList"
              label="Potential Requirement"
              placeholder="Please Select Potential Requirement"
              valueEnum={PotentialRequirementEnumText}
              fieldProps={{
                mode: 'multiple',
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormRadio.Group
              name="requirementFrequency"
              label="Requirement Frequency"
              valueEnum={RequirementFrequencyEnumText}
            />
          </Col>
          <Col span={12}>
            <Form.Item
              name="potentialVolumeObj"
              label="Potential Volume"
              initialValue={{
                potentialVolumeFrequency: PotentialVolumeFrequencyEnum.MONTHLY,
              }}
              rules={[
                {
                  validator: (_, value) => {
                    if (
                      Number.isInteger(value?.potentialVolumeQuantity) ||
                      !value?.potentialVolumeQuantity
                    ) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject('Enter a positive whole number');
                    }
                  },
                },
              ]}
            >
              <CustomPotentialVolume />
            </Form.Item>
          </Col>
          <Col span={12}>
            <ProFormRadio.Group
              name="distance"
              label="Distance"
              valueEnum={DistanceEnumText}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              name="quotationRequestReceivedDate"
              label="Quotation Request Received Date"
              placeholder="Please Select Quotation request received Date"
              fieldProps={{
                format: (value: Dayjs) => value.format('YYYY-MM-DD'),
                style: {
                  width: '100%',
                },
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              name="quotationSubmittedDate"
              label="Quotation Submitted Date"
              width={'xl'}
              placeholder="Please Select Quotation Submitted Date"
              fieldProps={{
                format: (value: Dayjs) => value.format('YYYY-MM-DD'),
                style: {
                  width: '100%',
                },
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormDatePicker
              name="rfqBiddingDeadlineDate"
              label="RFQ Bidding Deadline Date"
              width={'xl'}
              placeholder="Please Select RFQ Bidding Deadline Date"
              fieldProps={{
                format: (value: Dayjs) => value.format('YYYY-MM-DD'),
                style: {
                  width: '100%',
                },
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="serviceTruckTypeIds"
              label="Service Truck"
              placeholder="Please Select Service Truck"
              fieldProps={{
                filterOption: (input, option) => {
                  return (
                    (option as { label: string; value: number })?.label ?? ''
                  )
                    .toLowerCase()
                    .includes(input.toLowerCase());
                },
                options: serviceTruckTypeList,
                mode: 'multiple',
                showSearch: true,
                maxTagCount: 3,
                loading: serviceTruckTypeList.length === 0,
              }}
            />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default OpportunitiesAddModal;
