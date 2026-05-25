import { ProForm, ProFormText } from '@ant-design/pro-components';

import { useCallback, useEffect, useState } from 'react';

import { customerDetail } from '@/api/customer';
import { leadDetail } from '@/api/lead';
import { dataProcessingLogs, processRename } from '@/api/tool';
import { getVendorDetail } from '@/api/vendor';
import CommonTitle from '@/components/CommonTitle';
import CustomStatusButton from '@/components/CustomStatusButton';
import FuzzySelector from '@/components/FuzzySelector';
import OperationLogModal, {
  initialOperationLogModalState,
  IOperationLogModalState,
} from '@/components/OperationLogModal';
import { ES_DTO_CLASS, MAX_LENGTH } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { useSetState } from 'ahooks';
import { Button, Col, Form, message, Row } from 'antd';
import style from '../../common.less';

const EntityRename: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const leadObjValue = Form.useWatch('leadObj', form);
  const customerObjValue = Form.useWatch('customerObj', form);
  const vendorObjValue = Form.useWatch('vendorObj', form);
  const opportunityObjValue = Form.useWatch('opportunityObj', form);
  const projectObjValue = Form.useWatch('projectObj', form);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);

  const handleAddFinish = async (values: any) => {
    setLoading(true);

    const payload = {
      leadId: values.leadObj?.id,
      leadName: values.leadName,
      leadTag: values.leadTag,
      customerId: values.customerObj?.id,
      customerName: values.customerName,
      customerTag: values.customerTag,
      vendorId: values.vendorObj?.id,
      vendorName: values.vendorName,
      vendorTag: values.vendorTag,
      opportunityId: values.opportunityObj?.id,
      opportunityName: values.opportunityName,
      projectId: values.projectObj?.id,
      projectName: values.projectName,
    };

    const res = await processRename(payload);
    setLoading(false);
    if (res.code === 200) {
      message.success('Rename successfully');
      form.resetFields();
    }
  };

  const getDetail = async (callback: () => Promise<any>, type: string) => {
    const res = await callback();
    if (res?.code === 200) {
      if (type === 'customer') {
        form.setFieldsValue({
          oldCustomerTag: res?.data?.customerTag,
        });
      } else if (type === 'lead') {
        form.setFieldsValue({
          oldLeadTag: res?.data?.customerTag,
        });
      } else if (type === 'vendor') {
        form.setFieldsValue({
          oldVendorTag: res?.data?.vendorTag,
        });
      }
    }
  };

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await dataProcessingLogs('Rename').finally(() => {
      setOperationLogModalState({ loading: false });
    });

    if (res.code === 200) {
      setOperationLogModalState({ list: res.data ?? [], open: true });
    }
  }, []);

  useEffect(() => {
    if (customerObjValue?.id) {
      getDetail(() => customerDetail({ id: customerObjValue.id }), 'customer');
    }
  }, [customerObjValue]);

  useEffect(() => {
    if (leadObjValue?.id) {
      getDetail(() => leadDetail({ id: leadObjValue.id }), 'lead');
    }
  }, [leadObjValue]);

  useEffect(() => {
    if (vendorObjValue?.id) {
      getDetail(() => getVendorDetail(vendorObjValue.id), 'vendor');
    }
  }, [vendorObjValue]);

  return (
    <div className={style.content}>
      <div className={style.title}>
        <CommonTitle
          title="Rename"
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
        onFinish={handleAddFinish}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name={'leadObj'} label={'Lead'}>
              <FuzzySelector
                fieldProps={{
                  placeholder: 'Please Select Lead',
                }}
                onChange={() => {
                  form.setFieldValue('oldLeadTag', undefined);
                  form?.setFields([
                    {
                      name: 'leadName',
                      errors: [],
                    },
                  ]);
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
            <ProFormText
              name={'leadName'}
              label={'New Name'}
              placeholder={''}
              disabled={!leadObjValue}
              rules={[
                {
                  required: !!leadObjValue,
                  message: 'Please enter new lead name',
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
            />
          </Col>
          <Col span={6}>
            <ProFormText
              name={'leadTag'}
              label={'New Tag'}
              placeholder={''}
              disabled={!leadObjValue}
              rules={[
                {
                  whitespace: true,
                  message: 'Cannot only contain spaces',
                },

                {
                  min: MAX_LENGTH.SHORT_NAME,
                  message: `Please enter at least ${MAX_LENGTH.SHORT_NAME} characters Tag`,
                },
                {
                  max: MAX_LENGTH.LONG_NAME,
                  message: `Tag cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name={'customerObj'} label={'Customer'}>
              <FuzzySelector
                fieldProps={{
                  placeholder: 'Please Select Customer',
                }}
                request={{
                  field: 'customerName',
                  esDtoClass: ES_DTO_CLASS.CUSTOMER,
                  type: FieldQueryHighlightTypeEnum.USER_ROLE,
                }}
                onChange={() => {
                  form.setFieldValue('oldCustomerTag', undefined);
                  form?.setFields([
                    {
                      name: 'customerName',
                      errors: [],
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <ProFormText
              disabled
              name={'oldCustomerTag'}
              label={'Tag'}
              placeholder={''}
            />
          </Col>

          <Col span={6}>
            <ProFormText
              name={'customerName'}
              label={'New Name'}
              placeholder={''}
              disabled={!customerObjValue}
              rules={[
                {
                  required: !!customerObjValue,
                  message: 'Please enter new customer name',
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
            />
          </Col>
          <Col span={6}>
            <ProFormText
              name={'customerTag'}
              label={'New Tag'}
              placeholder={''}
              disabled={!customerObjValue}
              rules={[
                {
                  whitespace: true,
                  message: 'Cannot only contain spaces',
                },

                {
                  min: MAX_LENGTH.SHORT_NAME,
                  message: `Please enter at least ${MAX_LENGTH.SHORT_NAME} characters Tag`,
                },
                {
                  max: MAX_LENGTH.LONG_NAME,
                  message: `Tag cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name={'vendorObj'} label={'Vendor'}>
              <FuzzySelector
                fieldProps={{
                  placeholder: 'Please Select Vendor',
                }}
                request={{
                  field: 'vendorName',
                  esDtoClass: ES_DTO_CLASS.VENDOR,
                  type: FieldQueryHighlightTypeEnum.COUNTRY,
                }}
                onChange={() => {
                  form.setFieldValue('oldVendorTag', undefined);
                  form?.setFields([
                    {
                      name: 'vendorName',
                      errors: [],
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <ProFormText
              name={'oldVendorTag'}
              label={'Tag'}
              disabled
              placeholder={''}
            />
          </Col>
          <Col span={6}>
            <ProFormText
              name={'vendorName'}
              label={'New Name'}
              placeholder={''}
              disabled={!vendorObjValue}
              rules={[
                {
                  required: !!vendorObjValue,
                  message: 'Please enter new vendor name',
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
            />
          </Col>
          <Col span={6}>
            <ProFormText
              name={'vendorTag'}
              label={'New Tag'}
              placeholder={''}
              disabled={!vendorObjValue}
              rules={[
                {
                  whitespace: true,
                  message: 'Cannot only contain spaces',
                },

                {
                  min: MAX_LENGTH.SHORT_NAME,
                  message: `Please enter at least ${MAX_LENGTH.SHORT_NAME} characters Tag`,
                },
                {
                  max: MAX_LENGTH.LONG_NAME,
                  message: `Tag cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                },
              ]}
            />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name={'opportunityObj'} label={'Opportunity'}>
              <FuzzySelector
                fieldProps={{
                  placeholder: 'Please Select Opportunity',
                }}
                request={{
                  field: 'projectName',
                  esDtoClass: ES_DTO_CLASS.OPPORTUNITY,
                  type: FieldQueryHighlightTypeEnum.USER_ROLE,
                }}
                onChange={() => {
                  form?.setFields([
                    {
                      name: 'opportunityName',
                      errors: [],
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <ProFormText
              name={'opportunityName'}
              label={'New Name'}
              placeholder={''}
              disabled={!opportunityObjValue}
              rules={[
                {
                  required: !!opportunityObjValue,
                  message: 'Please enter new opportunity name',
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
            />
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={6}>
            <Form.Item name={'projectObj'} label={'Project'}>
              <FuzzySelector
                fieldProps={{
                  placeholder: 'Please Select Project',
                }}
                request={{
                  field: 'projectName',
                  esDtoClass: ES_DTO_CLASS.PROJECT,
                  type: FieldQueryHighlightTypeEnum.USER_ROLE,
                }}
                onChange={() => {
                  form?.setFields([
                    {
                      name: 'projectName',
                      errors: [],
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <ProFormText
              name={'projectName'}
              label={'New Name'}
              placeholder={''}
              disabled={!projectObjValue}
              rules={[
                {
                  required: !!projectObjValue,
                  message: 'Please enter new project name',
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
            />
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              onClick={() => form?.submit?.()}
              loading={loading}
              disabled={
                !leadObjValue &&
                !customerObjValue &&
                !vendorObjValue &&
                !opportunityObjValue &&
                !projectObjValue
              }
            >
              Submit
            </Button>
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

export default EntityRename;
