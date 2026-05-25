import { ProForm, ProFormSelect } from '@ant-design/pro-components';

import { useCallback, useState } from 'react';

import { dataProcessingLogs, waybillBackToInTransit } from '@/api/tool';
import CommonTitle from '@/components/CommonTitle';
import CustomStatusButton from '@/components/CustomStatusButton';
import FuzzySelector from '@/components/FuzzySelector';
import OperationLogModal, {
  initialOperationLogModalState,
  IOperationLogModalState,
} from '@/components/OperationLogModal';
import { ES_DTO_CLASS } from '@/constants';
import { FieldQueryHighlightTypeEnum, WaybillStatusEnum } from '@/enums';
import { useSetState } from 'ahooks';
import { Button, Col, Form, message, Popconfirm, Row } from 'antd';
import style from '../../common.less';

const StatusModify: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const waybillListValue = Form.useWatch('waybillList', form);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);

  const onFinishHandle = async (values: any) => {
    setLoading(true);
    const ids = values.waybillList.map((item: { id: number }) => item.id);
    const res = await waybillBackToInTransit(ids);
    setLoading(false);
    if (res.code === 200) {
      message.success('waybill back successfully');

      form.resetFields();
    }
  };
  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await dataProcessingLogs('WaybillBackToInTransit').finally(
      () => {
        setOperationLogModalState({ loading: false });
      },
    );

    if (res.code === 200) {
      setOperationLogModalState({ list: res.data ?? [], open: true });
    }
  }, []);

  return (
    <div className={style.content}>
      <div className={style.title}>
        <CommonTitle
          title="Modify Waybill Status"
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
        labelCol={{ span: 7 }}
        submitter={false}
        onFinish={onFinishHandle}
        initialValues={{
          newStatus: WaybillStatusEnum.IN_TRANSIT,
        }}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name={'waybillList'} label={'Waybill Number'}>
              <FuzzySelector
                fieldProps={{
                  mode: 'multiple',
                  placeholder: 'Please Select Waybill Number',
                }}
                request={{
                  field: 'waybillNumber',
                  esDtoClass: ES_DTO_CLASS.WAYBILL,
                  type: FieldQueryHighlightTypeEnum.USER_ROLE,
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <ProFormSelect
              readonly
              valueEnum={WaybillStatusEnum}
              name={'newStatus'}
              label={'Revert to Status'}
              // disabled
            />
          </Col>
          <Col span={6}>
            <Popconfirm
              title="Are you sure to modify these data?"
              style={{ width: 100 }}
              trigger="click"
              onConfirm={() => form?.submit?.()}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                loading={loading}
                disabled={!waybillListValue?.length}
              >
                Submit
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

export default StatusModify;
