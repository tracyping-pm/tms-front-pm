import { ES_DTO_CLASS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Tooltip } from 'antd';

import { useEffect, useRef } from 'react';

type IAddCategoryModal = ModalFormProps & {
  onConfirm: (value: any) => void;
};

const AddVendorModal = ({
  open,
  width = 558,
  modalProps,
  onConfirm,
  ...restProps
}: IAddCategoryModal) => {
  const { id: capacityPoolId } = useParams();
  const formRef = useRef<ProFormInstance>();

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

  const handleOk = async (values: any) => {
    const data = {
      vendorId: values?.vendorObj?.id,
      capacityPoolId: +capacityPoolId!,
    };

    onConfirm?.(data);
  };

  useEffect(() => {
    if (open) {
      formRef?.current?.resetFields();
    }
  }, [open]);
  return (
    <>
      <ModalForm
        name="addVendor"
        open={open}
        title={
          <div>
            Add Vendor
            <Tooltip
              title="Only Accredited vendors can be added"
              placement="topLeft"
              overlayStyle={{ maxWidth: 260 }}
              arrow={{ pointAtCenter: true }}
            >
              <InfoCircleOutlined style={{ marginLeft: 10 }} />
            </Tooltip>
          </div>
        }
        width={width}
        formRef={formRef}
        layout="horizontal"
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <ProFormSelect
          name={'vendorObj'}
          label={'Vendor Name'}
          valuePropName="name"
          fieldProps={{
            ...vendorNameDefaultFieldProps,
            onSearch: (keywords) =>
              vendorNameSearch(keywords, {
                uniqueLogic:
                  FieldQueryHighlightUniqueLogicEnum.CAPACITY_POOL_VENDOR_DISABLED,
                uniqueLogicParams: { capacityPoolId: capacityPoolId },
              }),
            placeholder: 'Enter at least two letters of the vendor name',
            options: vendorNameOptions,
          }}
          rules={[
            {
              required: true,
              message: 'Please enter Vendor Name',
            },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default AddVendorModal;
