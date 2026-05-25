import { projectCommodity } from '@/api/project';
import { getTruckTypeList } from '@/api/truck';
import { ICustomerRecord } from '@/api/types/customer';
import { IProjectRecord } from '@/api/types/project';
import { ITruckTypeListItem } from '@/api/types/truck';
import CustomFormInput from '@/components/CustomFormInput';
import {
  ES_DTO_CLASS,
  LogisticsCategoryOptions,
  MAX_LENGTH,
} from '@/constants';
import {
  BUEnum,
  BUEnumText,
  CurrentRequirementEnumText,
  DistanceEnumText,
  FieldQueryHighlightTypeEnum,
  LogisticsFlowEnumText,
  PROJECT_CONFIRMATION_WINDOW_OPTIONS,
  ProjectConfirmationWindowEnum,
  RequirementFrequencyEnumText,
  RequirementTypeEnumText,
  ServiceCategoryEnumText,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import CustomPotentialVolume from '@/pages/customer/Opportunities/components/CustomPotentialVolume';
import { formatAmount } from '@/utils/utils';
import {
  ModalForm,
  ModalFormProps,
  ProFormDateRangePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Col, Form, InputNumber, Row } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';

type IProjectModal = ModalFormProps & {
  open: boolean;
  isEdit?: boolean;
  customerDetail?: ICustomerRecord;
  record?: IProjectRecord;
  onConfirm?: (values: any, b?: boolean) => void;
};

const ProjectModal = ({
  title,
  open,
  isEdit = false,
  record,
  onConfirm,
  customerDetail,
  width = 880,
  modalProps,
  ...restProps
}: IProjectModal) => {
  const formRef = useRef<ProFormInstance>();
  const [form] = Form.useForm();
  const buListValue = Form.useWatch('buList', form);

  const {
    options: customerNameOptions,
    onSearch,
    defaultFieldProps,
  } = useFieldQuery({
    field: 'customerName',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });
  const [serviceTruckTypeList, setServiceTruckTypeList] = useState<
    DefaultOptionType[]
  >([]);

  const DEFAULT_VALUES = {
    projectName: '',
    customerObj: null,
    commodity: undefined,
    daysForPod: null,
    validityPeriodDate: null,
    agreedStartTime: null,
    agreedEndTime: null,
    confirmationWindow: ProjectConfirmationWindowEnum.THREE,
    logisticsCategory: null,
    bu: null,
    buList: [],
    potentialVolumeObj: null,
    requirementFrequency: null,
    requirementType: null,
    currentRequirementList: null,
    serviceTruckTypeIds: null,
    creditTerms: null,
  };

  const onFill = useCallback((rec: any) => {
    const customerObj = {
      id: rec?.customerId,
      value: rec?.customerId,
      label: rec?.customerName,
      name: rec?.customerName,
    };
    rec.customerObj = customerObj;
    formRef?.current?.setFieldsValue({
      ...rec,
      validityPeriodDate:
        rec.agreedStartTime && rec.agreedEndTime
          ? [rec.agreedStartTime, rec.agreedEndTime]
          : undefined,
      potentialVolumeObj: {
        potentialVolumeQuantity: rec.potentialVolumeQuantity,
        potentialVolumeFrequency: rec.potentialVolumeFrequency,
      },
    });
  }, []);

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  const getTruckTypeListHandle = async () => {
    const res = await getTruckTypeList();
    let list: DefaultOptionType[] = [];
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

  const init = useCallback(async () => {
    getTruckTypeListHandle();
    if (record?.id) {
      onFill(record);
    } else {
      reset();
    }
  }, [record]);

  const getTransformValues = useCallback(
    (values: any) => {
      const {
        customerObj,
        validityPeriodDate,
        agreedStartTime,
        agreedEndTime,
        potentialVolumeObj,
      } = values;
      const params = {
        ...values,
        customerId: customerObj?.id,
        agreedStartTime: validityPeriodDate[0]
          ? dayjs(validityPeriodDate[0]).format('YYYY-MM-DD') + ' 00:00:00'
          : agreedStartTime,
        agreedEndTime: validityPeriodDate[1]
          ? dayjs(validityPeriodDate[1]).format('YYYY-MM-DD') + ' 23:59:59'
          : agreedEndTime,
        potentialVolumeQuantity: potentialVolumeObj?.potentialVolumeQuantity,
        potentialVolumeFrequency: potentialVolumeObj?.potentialVolumeFrequency,
      };
      delete params.customerObj;
      delete params.validityPeriodDate;
      delete params.potentialVolumeObj;
      return params;
    },
    [isEdit],
  );

  const handleOk = useCallback(async () => {
    const values = formRef?.current?.getFieldsValue?.();
    const transformValues = getTransformValues(values);
    if (isEdit) {
      values.id = record?.id;
    }
    onConfirm?.(transformValues);
  }, [isEdit]);

  useEffect(() => {
    if (open) {
      init();
      if (customerDetail?.id) {
        const customerObj = {
          id: customerDetail?.id,
          value: customerDetail?.id,
          label: customerDetail?.customerName,
          name: customerDetail?.customerName,
        };
        let obj = {
          customerId: customerDetail?.id,
          customerName: customerDetail?.customerName,
          customerObj,
        };
        formRef?.current?.setFieldsValue(obj);
      }
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <ModalForm
        name="project-modal-form"
        open={open}
        title={title}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        form={form}
        initialValues={DEFAULT_VALUES}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <Row gutter={[24, 0]}>
          <Col span={12}>
            <Form.Item
              name="projectName"
              label="Project Name"
              rules={[
                {
                  required: true,
                  message: 'Please enter project name',
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
              <CustomFormInput placeholder="Project Name" disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <ProFormDependency name={['customerObj']}>
              {({ customerObj }) => {
                const options =
                  isEdit || customerDetail?.id
                    ? customerObj?.length > 0
                      ? [customerObj]
                      : []
                    : customerNameOptions;
                return (
                  <ProFormSelect
                    name="customerObj"
                    label="Customer"
                    placeholder="Customer"
                    disabled={isEdit || !!customerDetail?.id}
                    rules={[
                      {
                        required: true,
                        message: 'Please search and select customer',
                      },
                    ]}
                    fieldProps={{
                      ...defaultFieldProps,
                      options: options,
                      onSearch: onSearch,
                    }}
                    valuePropName={
                      isEdit || customerDetail?.id ? 'value' : 'name'
                    }
                  />
                );
              }}
            </ProFormDependency>
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="commodity"
              label="Commodity"
              placeholder="Commodity"
              rules={[
                {
                  required: true,
                  message: 'Please select commodity',
                },
              ]}
              request={async () => {
                const res = await projectCommodity();
                if (res.code === 200) {
                  return res?.data?.map((item: string) => {
                    return {
                      label: item,
                      value: item,
                    };
                  });
                } else {
                  return [];
                }
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormDateRangePicker
              name="validityPeriodDate"
              label="Project Validity Period"
              placeholder={['Start Date', 'End Date']}
              rules={[
                {
                  required: true,
                  message: 'Please select project validity period',
                },
                {
                  validator: (_, value) => {
                    const endTime = value?.[1];
                    if (
                      endTime &&
                      dayjs(endTime).isBefore(dayjs().subtract(1, 'day'))
                    ) {
                      return Promise.reject(
                        new Error('Project end date cannot be before today'),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              fieldProps={{
                style: { width: '100%' },
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="buList"
              label="BU"
              placeholder="Please Select BU"
              valueEnum={BUEnumText}
              fieldProps={{
                mode: 'multiple',
              }}
              rules={[
                {
                  required: true,
                  message: `Please Select BU`,
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="serviceCategory"
              label="Service Category"
              placeholder="Service Category"
              valueEnum={ServiceCategoryEnumText}
              rules={[
                {
                  required: true,
                  message: 'Please select service category',
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="logisticsFlow"
              label="Logistics Flow"
              placeholder="Logistics Flow"
              valueEnum={LogisticsFlowEnumText}
              rules={[
                {
                  required: true,
                  message: 'Please select logistics flow',
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="distance"
              label="Distance"
              placeholder="Distance"
              valueEnum={DistanceEnumText}
              rules={[
                {
                  required: [
                    BUEnum.GLOBAL_FORWARDING,
                    BUEnum.TRUCK_TRANSPORTATION,
                  ].some((item) => buListValue?.includes(item)),
                  message: 'Please select distance',
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="logisticsCategory"
              label="Logistics Category"
              placeholder="Logistics Category"
              fieldProps={{
                options: LogisticsCategoryOptions,
              }}
              rules={[
                {
                  required: true,
                  message: 'Please select logistics category',
                },
              ]}
              // disabled={isEdit}
            />
          </Col>
          <Col span={12}>
            <ProFormRadio.Group
              name="requirementFrequency"
              label="Requirement Frequency"
              valueEnum={RequirementFrequencyEnumText}
              rules={[
                {
                  required: true,
                  message: `Please Select Requirement Frequency`,
                },
              ]}
            />
          </Col>

          <Col span={12}>
            <ProFormRadio.Group
              name="requirementType"
              label="Requirement Type"
              valueEnum={RequirementTypeEnumText}
              rules={[
                {
                  required: true,
                  message: `Please Select Requirement Type`,
                },
              ]}
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
              rules={[
                {
                  required: [
                    BUEnum.GLOBAL_FORWARDING,
                    BUEnum.TRUCK_TRANSPORTATION,
                  ].some((item) => buListValue?.includes(item)),
                  message: `Please Select Current Requirement`,
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <Form.Item
              name="potentialVolumeObj"
              label="Potential Volume"
              rules={[
                {
                  required: [
                    BUEnum.GLOBAL_FORWARDING,
                    BUEnum.TRUCK_TRANSPORTATION,
                  ].some((item) => buListValue?.includes(item)),
                  message: `Please Enter Potential Volume`,
                },
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
              rules={[
                {
                  required: [
                    BUEnum.GLOBAL_FORWARDING,
                    BUEnum.TRUCK_TRANSPORTATION,
                  ].some((item) => buListValue?.includes(item)),
                  message: `Please Select Service Truck`,
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <Form.Item
              name="creditTerms"
              label="Credit Terms"
              rules={[
                {
                  required: true,
                  message: 'Please enter credit terms',
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={9999999999}
                precision={0}
                addonAfter={'Day'}
                controls={false}
                formatter={(val) => {
                  return val && String(val) !== String(Infinity)
                    ? formatAmount(val)
                    : '';
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <ProFormDigit
              name="daysForPod"
              label="Days for POD"
              placeholder="Days for POD"
              min={1}
              fieldProps={{
                precision: 0,
                style: { borderRadius: '2px' },
              }}
              rules={[{ required: true, message: 'Please enter days for POD' }]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="confirmationWindow"
              label="Confirmation Window"
              placeholder="Confirmation Window"
              fieldProps={{
                options: PROJECT_CONFIRMATION_WINDOW_OPTIONS,
              }}
              rules={[
                {
                  required: true,
                  message: 'Please select confirmation window',
                },
              ]}
            />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};
export default ProjectModal;
