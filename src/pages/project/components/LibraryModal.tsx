import {
  addRouteLibrary,
  changeRouteLibrary,
  checkChangeRouteLibrary,
  getCustomerTaxTypeByProject,
} from '@/api/project';
import { IRouteLibraryAddParams } from '@/api/types/project';
import CustomFormInput from '@/components/CustomFormInput';
import CustomLabel from '@/components/CustomLabel';
import { ES_DTO_CLASS, MAX_LENGTH } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  LibraryTaxTypeEnum,
  LibraryTaxTypeEnumText,
  MileageCalculationModeEnumText,
  MultipleDistanceModeEnum,
  MultipleDistanceModeEnumText,
  MultipleRouteModeEnumText,
  RouteBillingModeEnum,
  RouteBillingModeEnumText,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { App, Col, Form, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';

type ICustomerModal = ModalFormProps & {
  formDefaultValue?: IRouteLibraryAddParams;
  bindingProject?: {
    id: number;
    name: string;
  };
  hideModal: () => void;
  refresh: () => void;
};

const LibraryModal = ({
  formDefaultValue,
  bindingProject,
  width = 680,
  refresh,
  hideModal,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message, modal } = App.useApp();
  const formRef = useRef<ProFormInstance>();
  const [mileageCalculationRequired, setMileageCalculationRequired] =
    useState<boolean>(false);
  const [multipleRouteOptions, setMultipleRouteOptions] = useState<
    Record<string, string>
  >({});
  const [mileageCalculationOptions, setMileageCalculationOptions] = useState<
    Record<string, string>
  >({});

  const [customerTaxType, setCustomerTaxType] = useState('');

  useEffect(() => {
    if (formDefaultValue?.id) {
      setMultipleRouteOptions(
        formDefaultValue.billingMode === RouteBillingModeEnum.ROUTE_BILLING
          ? MultipleRouteModeEnumText
          : MultipleDistanceModeEnumText,
      );
      setMileageCalculationOptions(
        formDefaultValue.billingMode === RouteBillingModeEnum.ROUTE_BILLING
          ? {}
          : MileageCalculationModeEnumText,
      );
      setMileageCalculationRequired(
        formDefaultValue.billingMode !== RouteBillingModeEnum.ROUTE_BILLING,
      );
    }
  }, [formDefaultValue]);

  const {
    options: projectNameOptions,
    onSearch: projectNameSearch,
    defaultFieldProps: projectNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'projectName',
    esDtoClass: ES_DTO_CLASS.PROJECT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const submit = async (params: IRouteLibraryAddParams) => {
    let payload: IRouteLibraryAddParams;
    let res;
    if (formDefaultValue?.id) {
      payload = {
        id: formDefaultValue.id,
        billingMode: params.billingMode,
        multipleRoute: params.multipleRoute,
        mileageCalculation: params.mileageCalculation ?? null,
        taxMark: params.taxMark,
      };
      // @ts-ignore
      const check = await checkChangeRouteLibrary(payload);
      if (check.code === 200) {
        if (check.data === 0) {
          res = await changeRouteLibrary(payload);
        }
        if (check.data === 2) {
          modal.confirm({
            title: 'Library Confirm',
            content: `Confirm the change of Pricing Mode and delete the entered Pricing Version information.`,
            okText: 'Confirm',
            okButtonProps: {
              style: { outline: 'none' },
            },
            onOk: async () => {
              const change = await changeRouteLibrary(payload);
              if (change.code === 200) {
                refresh();
                hideModal();
                message.success(`Edit successfully!`);
              }
            },
          });
        }
      }
    } else {
      payload = {
        libraryName: params.libraryName,
        projectId: Number(params?.bindingProject?.id),
        projectName: params?.bindingProject?.name || '',
        billingMode: params.billingMode,
        multipleRoute: params.multipleRoute,
        mileageCalculation: params.mileageCalculation ?? null,
        taxMark: params.taxMark,
      };
      res = await addRouteLibrary(payload);
    }
    if (res?.code === 200) {
      refresh();
      hideModal();
      message.success(`${formDefaultValue?.id ? 'Edit' : 'Add'} successfully!`);
    } else {
      if (res?.msg) {
        message.warning(res?.msg);
      }
    }
  };

  const onBindingProjectChange = async (projectId: number) => {
    if (!projectId) {
      setCustomerTaxType('');
      return;
    }
    const res = await getCustomerTaxTypeByProject({ id: projectId });
    if (res.code === 200) {
      setCustomerTaxType(res.data || '');
    } else {
      setCustomerTaxType('');
    }
  };

  useEffect(() => {
    if (formDefaultValue?.projectId) {
      onBindingProjectChange(formDefaultValue?.projectId);
    } else if (bindingProject?.id) {
      onBindingProjectChange(bindingProject?.id);
    }
  }, [bindingProject, formDefaultValue]);

  return (
    <>
      <ModalForm
        name="library-modal"
        open={true}
        title={`${!!formDefaultValue ? 'Modify' : 'Create'} Library`}
        style={{ marginTop: '14px' }}
        width={width}
        //@ts-ignore
        formRef={formRef}
        initialValues={
          formDefaultValue?.id
            ? {
                libraryName: formDefaultValue.libraryName,
                billingMode: formDefaultValue.billingMode,
                multipleRoute: formDefaultValue.multipleRoute,
                mileageCalculation:
                  formDefaultValue.mileageCalculation ?? undefined,
                taxMark: formDefaultValue.taxMark,
                bindingProject: {
                  id: formDefaultValue.projectId,
                  label: formDefaultValue.projectName,
                  name: formDefaultValue.projectName,
                  value: formDefaultValue.projectId,
                },
              }
            : {
                taxMark: LibraryTaxTypeEnum.TAX_EXCLUSIVE,
                bindingProject: bindingProject
                  ? {
                      id: bindingProject.id,
                      label: bindingProject.name,
                      name: bindingProject.name,
                      value: bindingProject.id,
                    }
                  : undefined,
              }
        }
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
        }}
        // @ts-ignore
        onFinish={submit}
        {...restProps}
      >
        <Form.Item
          name="libraryName"
          label="Library Name"
          rules={[
            {
              required: true,
              message: 'Please enter library name',
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
              message: `Library name cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
            },
          ]}
        >
          <CustomFormInput
            placeholder="Library Name"
            disabled={!!formDefaultValue}
          />
        </Form.Item>
        <Row gutter={[72, 0]}>
          <Col span={12}>
            <ProFormSelect
              name="bindingProject"
              label={<CustomLabel LabelName="Binding Project" />}
              disabled={!!formDefaultValue || !!bindingProject}
              placeholder="Binding Project"
              valuePropName={
                !!formDefaultValue || !!bindingProject ? 'value' : 'name'
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter binding project',
                },
              ]}
              fieldProps={{
                ...projectNameDefaultFieldProps,
                onSearch: projectNameSearch,
                defaultActiveFirstOption: false,
                suffixIcon: null,
                filterOption: false,
                // @ts-ignore
                options: projectNameOptions,
                onChange: (e) => {
                  onBindingProjectChange(e?.value);
                },
              }}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="billingMode"
              label={<CustomLabel LabelName="Pricing Mode" />}
              placeholder="Pricing Mode"
              valueEnum={RouteBillingModeEnumText}
              rules={[
                {
                  required: true,
                  message: 'Please select pricing mode',
                },
              ]}
              onChange={(value: RouteBillingModeEnum) => {
                const getMultipleRoute =
                  formRef?.current?.getFieldValue('multipleRoute');
                const getMileageCalculation =
                  formRef?.current?.getFieldValue('mileageCalculation');
                if (
                  value !== RouteBillingModeEnum.MILEAGE_BILLING &&
                  getMultipleRoute === MultipleDistanceModeEnum.ROUTE_DISTANCE
                ) {
                  formRef?.current?.setFieldValue('multipleRoute', undefined);
                }
                if (
                  value !== RouteBillingModeEnum.MILEAGE_BILLING &&
                  getMileageCalculation
                ) {
                  formRef?.current?.setFieldValue(
                    'mileageCalculation',
                    undefined,
                  );
                }
                setMultipleRouteOptions(
                  value === RouteBillingModeEnum.ROUTE_BILLING
                    ? MultipleRouteModeEnumText
                    : MultipleDistanceModeEnumText,
                );
                setMileageCalculationOptions(
                  value === RouteBillingModeEnum.ROUTE_BILLING
                    ? {}
                    : MileageCalculationModeEnumText,
                );
                setMileageCalculationRequired(
                  value !== RouteBillingModeEnum.ROUTE_BILLING,
                );
              }}
            />
          </Col>
        </Row>

        <Row gutter={[72, 0]}>
          <Col span={12}>
            <ProFormSelect
              name="multipleRoute"
              label={<CustomLabel LabelName="Multiple Route" />}
              placeholder="Multiple Route"
              valueEnum={multipleRouteOptions}
              rules={[
                {
                  required: true,
                  message: 'Please select multiple route',
                },
                {
                  max: MAX_LENGTH.LONG_NAME,
                  message: `Multiple route cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="mileageCalculation"
              label={<CustomLabel LabelName="Mileage Calculation" />}
              placeholder="Mileage Calculation"
              valueEnum={mileageCalculationOptions}
              rules={[
                {
                  required: mileageCalculationRequired,
                  message: 'Please select mileage Calculation',
                },
                {
                  max: MAX_LENGTH.LONG_NAME,
                  message: `Mileage calculation cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={[72, 0]}>
          <Col span={12}>
            <Form.Item label={'Customer Tax Type'}>{customerTaxType}</Form.Item>
          </Col>
          <Col span={12}>
            <ProFormSelect
              name="taxMark"
              label={'Route Pricing Tax Type'}
              placeholder="Route Pricing Tax Type"
              valueEnum={LibraryTaxTypeEnumText}
              disabled
              rules={[
                {
                  required: true,
                  message: 'Please select Route Pricing Tax Type',
                },
                {
                  max: MAX_LENGTH.LONG_NAME,
                  message: `Route Pricing Tax Type cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                },
              ]}
            />
          </Col>
        </Row>
      </ModalForm>
    </>
  );
};

export default LibraryModal;
