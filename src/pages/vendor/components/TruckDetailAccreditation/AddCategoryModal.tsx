import { MAX_LENGTH } from '@/constants';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormText,
} from '@ant-design/pro-components';
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
        name="truck-category-modal"
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
        <ProFormText
          name="fileCategory"
          label="New Category Name"
          placeholder="New Category Name"
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
        />
      </ModalForm>
    </>
  );
};

export default AddCategoryModal;
