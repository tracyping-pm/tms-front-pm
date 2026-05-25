import { IExecutionNodesAssignee } from '@/api/types/subtask';
import { ES_DTO_CLASS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { FC, useCallback, useEffect, useRef } from 'react';

interface IAssigneeModal extends ModalFormProps {
  open: boolean;
  record: IExecutionNodesAssignee;
  processScopeName: string;
  onConfirm?: (v: IExecutionNodesAssignee) => void;
}

const AssigneeModal: FC<IAssigneeModal> = ({
  open,
  width = 710,
  record,
  modalProps,
  loading,
  processScopeName,
  onConfirm,
  ...restProps
}) => {
  const formRef = useRef<ProFormInstance>();
  const assigneeList = useRef([]);

  const {
    options: nameOptions,
    onSearch: nameSearch,
    defaultFieldProps: nameDefaultFieldProps,
    value: nameValue,
    setValue: setNameValue,
  } = useFieldQuery({
    isUAM: true,
    field: 'aliasName',
    esDtoClass: ES_DTO_CLASS.USER_ROLE,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
  });

  const onFinish = async () => {
    const values = formRef?.current?.getFieldsValue?.();
    let { assignee } = values;
    assignee = {
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      transferred: false,
      original: false,
      originAssigneeId: record?.originAssigneeId ?? record?.assigneeId,
      originProcInstAssigneeRecordId: record.originProcInstAssigneeRecordId,
    };

    onConfirm?.(assignee);
  };

  const onFill = useCallback(() => {
    const o = {
      id: record?.assigneeId,
      key: record?.assigneeId,
      value: record?.assigneeId,
      label: record?.assigneeName,
      name: record?.assigneeName,
    };
    formRef?.current?.setFieldValue('assignee', o);
  }, [record]);

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  const onChangeHandle = (keywords: any) => {
    let keys = keywords;
    setNameValue(keys);
    assigneeList.current = keys;
  };

  useEffect(() => {
    if (open) {
      onFill();
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <ModalForm
        open={open}
        title={'Assignee'}
        width={width}
        formRef={formRef}
        layout="horizontal"
        modalProps={{
          okText: 'Confirm',
          destroyOnClose: true,
          maskClosable: false,
          confirmLoading: loading,
          ...modalProps,
        }}
        onFinish={onFinish}
        {...restProps}
      >
        <ProFormSelect
          label="Assignee"
          name="assignee"
          rules={[
            {
              required: true,
              message: 'Please Select Assignee',
            },
          ]}
          fieldProps={{
            ...nameDefaultFieldProps,
            listHeight: 154,
            placeholder: 'Assignee',
            options: nameOptions,
            onSearch: (keywords) =>
              nameSearch(keywords, {
                uniqueLogic:
                  FieldQueryHighlightUniqueLogicEnum.PROCESS_SETTING_NODE_ASSIGNEE_CHOOSE,
                uniqueLogicParams: {
                  processScope: processScopeName,
                },
              }),
            onChange: (keywords) => {
              onChangeHandle(keywords);
            },
            value: nameValue,
          }}
        />
      </ModalForm>
    </>
  );
};

export default AssigneeModal;
