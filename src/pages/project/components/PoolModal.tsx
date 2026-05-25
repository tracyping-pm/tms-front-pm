import CustomFormInput from '@/components/CustomFormInput';
import { ES_DTO_CLASS, MAX_LENGTH } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import {
  ModalForm,
  ModalFormProps,
  ProFormDependency,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { useCallback, useEffect, useRef } from 'react';

type IPoolModal = ModalFormProps & {
  open: boolean;
  isEdit?: boolean;
  record?: {
    poolName?: string;
    projectId: number;
    projectName: string;
  };
  onConfirm?: (values: any, b?: boolean) => void;
};

const PoolModal = ({
  title,
  open,
  isEdit = false,
  record,
  onConfirm,
  width = 480,
  modalProps,
  ...restProps
}: IPoolModal) => {
  const formRef = useRef<ProFormInstance>();
  const {
    options: projectNameOptions,
    onSearch,
    defaultFieldProps,
  } = useFieldQuery({
    field: 'projectName',
    esDtoClass: ES_DTO_CLASS.PROJECT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const DEFAULT_VALUES = {
    poolName: '',
    projectName: '',
    projectId: '',
    projectObj: null,
  };

  const onFill = useCallback((_record: any) => {
    const projectObj = {
      projectId: _record?.projectId,
      value: _record?.projectId,
      label: _record?.projectName,
      projectName: _record?.projectName,
      name: _record?.projectName,
    };
    _record.projectObj = projectObj;
    formRef?.current?.setFieldsValue(_record);
  }, []);

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  const init = useCallback(async () => {
    if (record?.projectId) {
      onFill(record);
    } else {
      reset();
    }
  }, [record]);

  const getTransformValues = useCallback(
    (values: any) => {
      const { projectObj } = values;
      const params = {
        ...values,
        projectId: projectObj?.projectId ?? projectObj?.id,
        projectName: projectObj?.projectName ?? projectObj?.name,
      };
      delete params.projectObj;
      return params;
    },
    [isEdit, record],
  );

  const handleOk = useCallback(async () => {
    const values = formRef?.current?.getFieldsValue?.();
    const transformValues = getTransformValues(values);
    if (record?.projectId) {
      values.projectId = record?.projectId;
    }
    onConfirm?.(transformValues);
  }, [isEdit, record]);

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
        name="pool-modal"
        open={open}
        title={title}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        initialValues={DEFAULT_VALUES}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <Form.Item
          name="poolName"
          label="Pool Name"
          rules={[
            {
              required: true,
              message: 'Please enter pool name',
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
          <CustomFormInput placeholder="Pool Name" />
        </Form.Item>

        <ProFormDependency name={['projectObj']}>
          {({ projectObj }) => {
            const options = isEdit
              ? projectObj?.length > 0
                ? [projectObj]
                : []
              : projectNameOptions;
            return (
              <ProFormSelect
                name="projectObj"
                label="Binding Project"
                placeholder="Binding Project"
                disabled={!!record?.projectId}
                rules={[
                  {
                    required: true,
                    message: 'Please search and select project',
                  },
                ]}
                fieldProps={{
                  ...defaultFieldProps,
                  options: options,
                  onSearch: onSearch,
                }}
                valuePropName={!!record?.projectId ? 'value' : 'name'}
              />
            );
          }}
        </ProFormDependency>
      </ModalForm>
    </>
  );
};

export default PoolModal;
