import { ProForm, ProFormText } from '@ant-design/pro-components';

import { useCallback, useEffect, useState } from 'react';

import { leadDetail } from '@/api/lead';
import { dataProcessingLogs, deleteLead } from '@/api/tool';
import CommonTitle from '@/components/CommonTitle';
import CustomStatusButton from '@/components/CustomStatusButton';
import FuzzySelector from '@/components/FuzzySelector';
import OperationLogModal, {
  initialOperationLogModalState,
  IOperationLogModalState,
} from '@/components/OperationLogModal';
import { ES_DTO_CLASS } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { useSetState } from 'ahooks';
import { Button, Col, Form, message, Popconfirm, Row } from 'antd';
import style from '../../common.less';

const EntityDelete: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const leadObjValue = Form.useWatch('leadObj', form);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);

  const onFinishHandle = async (values: any) => {
    setLoading(true);
    const id = values.leadObj?.id;
    const res = await deleteLead(id);
    setLoading(false);
    if (res.code === 200) {
      message.success('Delete successfully');

      form.resetFields();
    }
    console.log(values);
  };

  const getDetail = async (callback: () => Promise<any>) => {
    setLoading(true);
    const res = await callback();
    setLoading(false);
    if (res?.code === 200) {
      form.setFieldsValue({
        oldLeadTag: res?.data?.customerTag,
      });
    }
  };

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await dataProcessingLogs('DeleteLead').finally(() => {
      setOperationLogModalState({ loading: false });
    });

    if (res.code === 200) {
      setOperationLogModalState({ list: res.data ?? [], open: true });
    }
  }, []);

  useEffect(() => {
    if (leadObjValue?.id) {
      getDetail(() => leadDetail({ id: leadObjValue.id }));
    }
  }, [leadObjValue]);

  return (
    <div className={style.content}>
      <div className={style.title}>
        <CommonTitle
          title="Delete Lead"
          extra={
            <CustomStatusButton
              noStyle
              loading={operationLogModalState.loading}
              onClick={() => {
                fetchLogList();
              }}
            >
              History
            </CustomStatusButton>
          }
        />
      </div>
      <ProForm
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        submitter={false}
        onFinish={onFinishHandle}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name={'leadObj'} label={'Lead'}>
              <FuzzySelector
                fieldProps={{
                  placeholder: 'Please Select Lead',
                }}
                request={{
                  field: 'customerName',
                  esDtoClass: ES_DTO_CLASS.LEAD,
                  type: FieldQueryHighlightTypeEnum.USER_ROLE,
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <ProFormText
              name={'oldLeadTag'}
              label={'Tag'}
              disabled
              placeholder={''}
            />
          </Col>
          <Col span={6}>
            <Popconfirm
              title="Are you sure to delete this data?"
              style={{ width: 100 }}
              trigger="click"
              onConfirm={() => form?.submit?.()}
              okText="Yes"
              cancelText="No"
            >
              <Button type="primary" loading={loading} disabled={!leadObjValue}>
                Delete
              </Button>
            </Popconfirm>
          </Col>
        </Row>
      </ProForm>
      <OperationLogModal
        title={'Operation Record'}
        open={operationLogModalState.open}
        list={operationLogModalState.list}
        onCancel={() => setOperationLogModalState({ open: false })}
        onConfirm={() => setOperationLogModalState({ open: false })}
      />
    </div>
  );
};

export default EntityDelete;
