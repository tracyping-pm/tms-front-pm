import CustomFormInput from '@/components/CustomFormInput';
import { MAX_LENGTH } from '@/constants';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Form } from 'antd';
import { useRef } from 'react';

type IAddCategoryModal = ModalFormProps;

const AddCategoryModal = ({
  title,
  open,
  width = 480,
  modalProps,
  ...restProps
}: IAddCategoryModal) => {
  const formRef = useRef<ProFormInstance>();

  return (
    <>
      <ModalForm
        name="add-category"
        open={open}
        title={title}
        width={width}
        style={{ marginTop: '14px' }}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        {...restProps}
      >
        <Form.Item
          name="fileCategory"
          label="New Category Name"
          rules={[
            {
              required: true,
              message: 'Please enter name',
            },
            {
              max: MAX_LENGTH.NAME,
              message: `Name cannot exceed ${MAX_LENGTH.NAME} characters`,
            },
          ]}
        >
          <CustomFormInput placeholder="New Category Name" />
        </Form.Item>
      </ModalForm>
    </>
  );
};

export default AddCategoryModal;
