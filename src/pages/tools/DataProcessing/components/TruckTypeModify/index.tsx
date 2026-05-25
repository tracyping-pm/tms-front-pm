import { ProForm, ProFormSelect } from '@ant-design/pro-components';

import { useCallback, useState } from 'react';

import { changeTruckTypeOfTruck, dataProcessingLogs } from '@/api/tool';
import { getTruckTypeList } from '@/api/truck';
import { ITruckTypeListItem } from '@/api/types/truck';
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

const TruckTypeModify: React.FC = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const plateNumberObjValue = Form.useWatch('plateNumberObj', form);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);
  const onFinishHandle = async (values: any) => {
    setLoading(true);
    const payload = {
      truckTypeId: values.truckType,
      truckId: values.plateNumberObj?.id,
    };
    const res = await changeTruckTypeOfTruck(payload);
    setLoading(false);
    if (res.code === 200) {
      message.success('Modify TruckType successfully');

      form.resetFields();
    }
  };
  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await dataProcessingLogs('ChangeTruckTypeOfTruck').finally(
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
          title="Modify Truck Type"
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
            <Form.Item name={'plateNumberObj'} label={'Plate Number'}>
              <FuzzySelector
                fieldProps={{
                  placeholder: 'Please Select Plate Number',
                }}
                request={{
                  field: 'plateNumber',
                  esDtoClass: ES_DTO_CLASS.TRUCK,
                  type: FieldQueryHighlightTypeEnum.COUNTRY,
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <ProFormSelect
              name={'truckType'}
              label={'Truck Type'}
              request={async () => {
                const res = await getTruckTypeList();
                if (res.code === 200) {
                  return res?.data?.map((item: ITruckTypeListItem) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  });
                }
                return [];
              }}
              rules={[
                {
                  required: true,
                  message: 'Please select Truck Type',
                },
              ]}
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
                disabled={!plateNumberObjValue}
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

export default TruckTypeModify;
