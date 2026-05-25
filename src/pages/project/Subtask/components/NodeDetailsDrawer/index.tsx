import {
  subtaskHandleNode,
  subtaskProcessInstanceNodeAssignee,
} from '@/api/subtask';
import {
  IExecutionNodes,
  IExecutionNodesAssignee,
  IFields,
} from '@/api/types/subtask';
import CustomStatusButton from '@/components/CustomStatusButton';
import CustomerAvatar from '@/components/RightContent/CustomerAvatar';
import PubSubContext from '@/context/pubsub';
import {
  ApproveActionEnum,
  CustomerFieldTypeText,
  FieldTypeEnum,
  SubtaskStatusEnum,
  VendorFieldTypeText,
} from '@/enums';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { useModel, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { App, Button, Col, Drawer, Form, Row, Spin } from 'antd';
import cls from 'classnames';
import { cloneDeep } from 'lodash';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import {
  EVENT_SUBTASK_DETAIL_RELOAD,
  EVENT_SUBTASK_DRAWER_LOADING,
} from '../../events';
import AssigneeModal from './AssigneeModal';
import DynamicFormItem from './DynamicFormItem';
import styles from './index.less';

export interface IBuData {
  buId: number;
  buType: string;
  subtaskName: string;
  status: string;
  processScopeName: string;
}
interface IState {
  loading: boolean;
  assigneeModalOpen: boolean;
  assigneeModalLoading: boolean;
  assigneeList: IExecutionNodesAssignee[];
  assigneeRecord?: IExecutionNodesAssignee;
  clickAssigneeIndex: number;
  fileList: Record<number, File[]>;
  triggerActionName: string;
}
interface INodeDetailsDrawer {
  open: boolean;
  record: IExecutionNodes;
  preExecutionNodeData: IExecutionNodes;
  buData: IBuData;
  onCancel: () => void;
  nodeInProgressOrder: number;
}
interface IFieldItem {
  procInstNodeFieldConfigId?: number;
  fieldName: string | undefined;
  fieldType: FieldTypeEnum | undefined;
  fieldOrder: number | undefined;
  required: boolean | undefined;
  fieldValue?:
    | { symbol: string; fieldValue: string | number }
    | string
    | File[]
    | Record<string, any>;
}

const NodeDetailsDrawer = ({
  open,
  record,
  onCancel,
  buData,
  nodeInProgressOrder,
  preExecutionNodeData,
}: INodeDetailsDrawer) => {
  const { message } = App.useApp();
  const { publish, subscribe } = useContext(PubSubContext);
  const { id: subtaskId } = useParams();
  const userRoleId =
    useModel('@@initialState')?.initialState?.currentUser?.currentUserRole
      .userRoleId;
  const [state, setState] = useSetState<IState>({
    loading: false,
    assigneeModalOpen: false,
    assigneeModalLoading: false,
    assigneeList: [],
    assigneeRecord: undefined,
    clickAssigneeIndex: 0,
    fileList: {},
    triggerActionName: '',
  });
  const valueFields = useRef<IFields[]>([]);

  const [form] = Form.useForm();
  const fileLists = useRef({});
  const isReadOnly = useMemo(() => {
    return (
      buData.status !== SubtaskStatusEnum.IN_PROGRESS ||
      nodeInProgressOrder !== record?.order ||
      !!record?.executed ||
      state.assigneeList?.find((item) => item.assigneeId === userRoleId)
        ?.transferred ||
      state.assigneeList?.every((item) => item.assigneeId !== userRoleId)
    );
  }, [record, state.assigneeList, nodeInProgressOrder, record?.executed]);

  const filterAssigneeList = useMemo(() => {
    let list = cloneDeep(state.assigneeList);
    return list?.filter((item) => !item.transferred);
  }, [state?.assigneeList]);

  const onAssigneeModalConfirm = async (value: IExecutionNodesAssignee) => {
    let list = cloneDeep(state.assigneeList);
    if (
      list.some(
        (item) =>
          item.assigneeId === value.assigneeId &&
          item.assigneeId !== value.originAssigneeId,
      )
    ) {
      message.error('Cannot select existing personnel');
    } else {
      const origin = list?.find(
        (item) => item.assigneeId === value.originAssigneeId,
      )?.transferred;
      const payload = {
        procInstId: +subtaskId!,
        procInstNodeId: record.procInstNodeId,
        assigneeId: value.assigneeId,
        originAssigneeId: value.originAssigneeId!,
        origin: !origin,
      };
      setState({ assigneeModalLoading: true });
      const res = await subtaskProcessInstanceNodeAssignee(payload);
      setState({ assigneeModalLoading: false });
      if (res.code === 200) {
        publish(EVENT_SUBTASK_DETAIL_RELOAD);
        setState({
          assigneeList: list,
          assigneeModalOpen: false,
        });
      }
    }
  };

  const reset = useCallback(() => {
    form?.resetFields();
    setState({});
  }, []);

  const onFill = () => {
    record?.fields?.forEach((item) => {
      if (item?.fieldValue) {
        let parseObj;
        try {
          parseObj = JSON.parse(item.fieldValue);
        } catch (error) {}
        if (
          item.fieldType === FieldTypeEnum.CUSTOMER_CHARGE_GROUP ||
          item.fieldType === FieldTypeEnum.VENDOR_CHARGE_GROUP
        ) {
          let initValue: Record<string, any> = [];
          parseObj.forEach((child: any) => {
            initValue.push({
              label: child.fieldName,
              value: JSON.stringify({
                title: child.fieldName,
                name:
                  item?.fieldType === FieldTypeEnum.CUSTOMER_CHARGE_GROUP
                    ? CustomerFieldTypeText[child.fieldName]
                    : VendorFieldTypeText[child.fieldName],
                order: child.order,
                value: child?.fieldValue ? child?.fieldValue : {},
              }),
            });
            form.setFieldValue(
              [child.fieldOrder, 'symbol'],
              child?.fieldValue?.symbol,
            );
            form.setFieldValue(
              [child.fieldOrder, 'amount'],
              child?.fieldValue?.amount,
            );
            form.setFieldValue(
              [child.fieldOrder, 'remark'],
              child?.fieldValue?.remark,
            );
            form.setFieldValue(
              [child.fieldOrder, 'files'],
              child?.fieldValue?.files,
            );
          });
          form.setFieldValue([item.order, 'fieldValue'], initValue);
        } else {
          // form.setFieldValue([item.order, 'fieldValue'], parseObj.fieldValue);
          if (parseObj.symbol) {
            form.setFieldValue([item.order, 'symbol'], parseObj.symbol);
            form.setFieldValue([item.order, 'fieldValue'], parseObj.fieldValue);
          } else {
            form.setFieldValue([item.order, 'fieldValue'], parseObj.fieldValue);
          }
        }
      }
      if (item.fieldType === FieldTypeEnum.CUSTOMER_CHARGE_GROUP) {
        let obj: any[] = [];
        try {
          obj = JSON.parse(item.valueOptions as string);
        } catch (error) {}

        valueFields.current = valueFields.current.concat(obj);
      }
      if (item.fieldType === FieldTypeEnum.VENDOR_CHARGE_GROUP) {
        let obj = [];
        try {
          obj = JSON.parse(item.valueOptions as string);
        } catch (error) {}
        valueFields.current = valueFields.current.concat(obj);
      }
    });
    form.setFieldValue('operationTime', record?.operationTime);
  };

  const init = useCallback(() => {
    onFill();
  }, [record]);

  const onCancelHandle = () => {
    setState({ fileList: [] });
    setState({
      triggerActionName: '',
    });
    onCancel?.();
  };

  const getFilesDataHandle = (data: Record<number, File[]>) => {
    for (let key in data) {
      if (data[key].length === 0) {
        form.setFieldValue([key, 'fieldValue'], undefined);
      }
    }

    fileLists.current = { ...fileLists.current, ...data };
  };

  const submit = async () => {
    const values = form.getFieldsValue(); // 表单
    const fields = record?.fields;
    let fileList: IFieldItem[] = [];
    let formValues: IFieldItem[] = [];
    let customerValues: IFieldItem[] = [];
    let vendorValues: IFieldItem[] = [];
    Object.keys(values).forEach((item) => {
      // 便利表单项
      const field = fields.find((i) => i.order === +item);
      const childField = valueFields.current.find((i) => i.order === +item);
      // customer、vendor
      if (childField) {
        const valueObj: IFieldItem = {
          procInstNodeFieldConfigId: childField?.procInstNodeFieldConfigId,
          fieldName: childField?.fieldName,
          fieldType: childField?.fieldType,
          fieldOrder: childField?.order,
          required: childField?.required,
          fieldValue: {
            symbol: values[item]?.symbol,
            amount: values[item]?.amount,
            remark: values[item]?.remark ?? '',
            files: values[item]?.files ?? null,
          },
        };
        if (childField.fieldType?.includes('Customer')) {
          customerValues.push(valueObj); // 装填customer子项表单数据
        } else {
          vendorValues.push(valueObj); // 装填vendor子项表单数据
        }
      }
      if (field) {
        const obj: IFieldItem = {
          procInstNodeFieldConfigId: field?.procInstNodeFieldConfigId,
          fieldName: field?.fieldName,
          fieldType: field?.fieldType,
          fieldOrder: field?.order,
          required: field?.required,
          fieldValue: values[item]?.symbol
            ? JSON.stringify({
                symbol: values[item]?.symbol,
                fieldValue: values[item]?.fieldValue ?? '',
              })
            : JSON.stringify({
                fieldValue: values[item]?.fieldValue ?? '',
              }),
        };

        if (field?.fieldType === FieldTypeEnum.FILE_UPLOAD) {
          obj.fieldValue = JSON.stringify({
            fieldValue: '',
          });
          formValues.push(obj);
          const _obj = cloneDeep(obj);
          //@ts-ignore
          _obj.fieldValue = fileLists.current[item];
          fileList.push(_obj);
        } else {
          formValues.push(obj);
        }
      }
    });
    const customerIndex = formValues.findIndex(
      (item) => item.fieldType === FieldTypeEnum.CUSTOMER_CHARGE_GROUP,
    );
    const vendorIndex = formValues.findIndex(
      (item) => item.fieldType === FieldTypeEnum.VENDOR_CHARGE_GROUP,
    );
    if (customerIndex !== -1) {
      formValues[customerIndex].fieldValue = JSON.stringify(customerValues);
    }
    if (vendorIndex !== -1) {
      formValues[vendorIndex].fieldValue = JSON.stringify(vendorValues);
    }
    console.log(
      'submit----',
      values,
      fileList,
      customerValues,
      vendorValues,
      formValues,
    );
    // return;
    const preNodeFieldData = preExecutionNodeData?.fields?.map((item) => {
      const {
        procInstNodeFieldConfigId,
        fieldName,
        fieldType,
        order,
        required,
        fieldValue,
      } = item;
      return {
        procInstNodeFieldConfigId,
        fieldName,
        fieldType,
        fieldOrder: order,
        required,
        fieldValue,
      };
    });
    const { buId, buType, subtaskName } = buData;
    const dto = {
      buId,
      buType,
      subtaskName,
      procInstId: subtaskId,
      order: record?.order,
      procInstNodeId: record?.procInstNodeId,
      previousProcInstNodeId: preExecutionNodeData?.procInstNodeId,
      actTaskDefKey: record?.actTaskDefKey,
      nodeType: record?.nodeType,
      nodeName: record?.nodeName,
      action: state.triggerActionName,
      fieldHandleDtos: formValues,
      previousFieldHandleDtos: preNodeFieldData ?? null,
    };
    const formData = new FormData();
    const blob = new Blob([JSON.stringify(dto)], {
      type: 'application/json',
    });
    formData.append('dto', blob);
    fileList.forEach((item: IFieldItem) => {
      let nonFileData = { ...item };
      delete nonFileData.fieldValue;
      //@ts-ignore
      item?.fieldValue?.forEach((i) => {
        if (i instanceof File) {
          formData.append(
            `files`,
            i,
            `${JSON.stringify({ ...nonFileData, fileName: i.name })}`,
          );
        }
      });
    });

    const res = await subtaskHandleNode(formData);
    if (res.code === 200) {
      onCancelHandle();
      publish(EVENT_SUBTASK_DETAIL_RELOAD);
    }
  };

  const onAssignee = (item: IExecutionNodesAssignee) => {
    const idx = state.assigneeList.findIndex(
      (i) => item.assigneeId === i.assigneeId,
    );
    setState({
      assigneeModalOpen: true,
      assigneeRecord: item,
      clickAssigneeIndex: idx,
    });
  };

  useEffect(() => {
    setState({
      assigneeList: record?.assignees,
    });

    if (open) {
      init();
    } else {
      reset();
    }
  }, [open, record?.assignees]);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_SUBTASK_DRAWER_LOADING, (data) => {
      setState({
        loading: data,
      });
    });
    return unsubscribe;
  }, []);

  return (
    <Drawer
      rootClassName={cls(
        'node-detail-drawer-root',
        styles.nodeDetailDrawerRoot,
      )}
      className={cls('node-detail-drawer', styles.nodeDetailDrawer)}
      title={'Node Details'}
      extra={
        <CustomStatusButton
          noStyle
          icon={<CloseOutlined style={{ fontSize: 20 }} />}
          onClick={onCancelHandle}
        />
      }
      footer={
        isReadOnly ? (
          false
        ) : (
          <div className={styles.footer}>
            <Button onClick={onCancelHandle}>Cancel</Button>
            {record?.actions?.map((item, index) => {
              return (
                <Button
                  key={index}
                  type="primary"
                  loading={state.triggerActionName === item.actionName}
                  disabled={
                    record.order === 0 &&
                    item.actionName === ApproveActionEnum.REJECT_TO_PREVIOUS // 初始节点为审批节点时 返回上一节点禁点
                  }
                  onClick={() => {
                    setState({
                      triggerActionName: item.actionName,
                    });
                    form.submit();
                  }}
                >
                  {item.actionName}
                </Button>
              );
            })}
          </div>
        )
      }
      open={open}
      closeIcon={false}
      onClose={onCancelHandle}
    >
      <Spin spinning={state.loading}>
        <ProForm
          name="node-details"
          layout="horizontal"
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          readonly={isReadOnly}
          onFinish={submit}
          onFinishFailed={() => {
            setState({
              triggerActionName: '',
            });
          }}
          submitter={false}
        >
          {record?.executed && (
            <ProFormText name="operationTime" readonly label="Operation Time" />
          )}
          <div className={styles.information}>
            <Row gutter={[0, 0]}>
              <Col span={6}>
                <div className={styles.informationTitle}>Node Name：</div>
              </Col>
              <Col span={18}>
                <div className={styles.informationText}>{record?.nodeName}</div>
              </Col>
            </Row>
          </div>

          <Form.Item label="Assignee" style={{ marginBottom: 0 }}>
            {filterAssigneeList?.map((item) => {
              return (
                <div key={item.assigneeId} className={styles.assignee}>
                  <CustomerAvatar name={item?.assigneeName} />
                  <div>{item.assigneeName}</div>
                  {!isReadOnly &&
                  buData.status === SubtaskStatusEnum.IN_PROGRESS &&
                  record.manualAssign &&
                  !record?.executed &&
                  (item.original
                    ? item.assigneeId === userRoleId
                    : item.originAssigneeId === userRoleId) ? (
                    <CustomStatusButton
                      icon={<EditOutlined />}
                      onClick={() => {
                        onAssignee(item);
                      }}
                    >
                      Assignee
                    </CustomStatusButton>
                  ) : null}
                </div>
              );
            })}
          </Form.Item>
          {open &&
            record?.fields?.map((item, index) => {
              return (
                // <ChargeTypeFields
                //   key={index}
                //   entityId={buData.buId}
                //   subtaskName={buData.subtaskName}
                //   formItemData={item}
                //   record={record}
                //   readOnly={isReadOnly!}
                //   getFilesData={(data) => {
                //     getFilesDataHandle(data);
                //   }}
                // />
                <DynamicFormItem
                  key={index}
                  entityId={buData.buId}
                  subtaskName={buData.subtaskName}
                  formItemData={item}
                  record={record}
                  readOnly={isReadOnly!}
                  getFilesData={(data) => {
                    getFilesDataHandle(data);
                  }}
                />
              );
            })}
          <div>
            {/* <DynamicFormItem
              formItemData={{
                fieldName: 'Customer Manpower',
                fieldType: FieldTypeEnum.CUSTOMER_CHARGE,
                fieldValue: undefined,
                materials: undefined,
                order: 4,
                // procInstNodeFieldConfigId: 401,
                required: true,
                valueOptions: 'null',
              }}
              record={record}
              readOnly={isReadOnly!}
              getFilesData={(data) => {
                getFilesDataHandle(data);
              }}
            /> */}
          </div>
        </ProForm>

        {state.assigneeModalOpen ? (
          <AssigneeModal
            open={state.assigneeModalOpen}
            onConfirm={onAssigneeModalConfirm}
            record={state.assigneeRecord!}
            processScopeName={buData.processScopeName!}
            modalProps={{
              okText: 'Confirm',
              onCancel: () => {
                setState({
                  assigneeModalOpen: false,
                });
              },
            }}
            submitter={{
              submitButtonProps: {
                loading: state.assigneeModalLoading,
              },
            }}
          />
        ) : null}
      </Spin>
    </Drawer>
  );
};

export default NodeDetailsDrawer;
