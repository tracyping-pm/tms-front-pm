import { IWaybillBillingData } from '@/api/types/waybill';
import { updateBillingTruck } from '@/api/waybill';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormRadio,
} from '@ant-design/pro-components';
import { App, Col, Row } from 'antd';
import { useRef } from 'react';
import styles from './common.less';

type ICustomerModal = ModalFormProps & {
  detail: IWaybillBillingData;
  hideModal: () => void;
  refresh: () => void;
};

const WaybillBillingTruckModal = ({
  detail,
  width = 720,
  hideModal,
  refresh,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message, modal } = App.useApp();
  const formRef = useRef<ProFormInstance>();

  const submit = async (params: {
    customerTruckType: boolean;
    vendorTruckType: boolean;
  }) => {
    const res = await updateBillingTruck({
      waybillFeeId: detail.id,
      actualOrRequireCustomer: params.customerTruckType,
      actualOrRequireVendor: params.vendorTruckType,
    });
    if (res.code === 200) {
      if (res.data?.code === 1) {
        modal.warning({
          title: 'Warning',
          content: res.data?.msg,
          cancelButtonProps: {
            style: { display: 'none' },
          },
        });
      }
      message.success('Edit successfully!');
      refresh();
      hideModal();
    }
  };

  return (
    <>
      <ModalForm
        name="waybill-billing-truck-modal"
        open={true}
        title={`Edit Billing Truck Type`}
        style={{ marginTop: '14px' }}
        width={width}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
          styles: {
            footer: {
              marginTop: 0,
            },
          },
        }}
        initialValues={{
          customerTruckType: detail.customerTruckTypeActualOrRequired,
          vendorTruckType: detail.vendorTruckTypeActualOrRequired,
        }}
        onFinish={submit}
        {...restProps}
      >
        <div className={styles.truckType}>
          <Row>
            <Col
              span={12}
              style={{
                paddingRight: '24px',
                borderRight: '1px solid #0000000f',
              }}
            >
              <div className={styles.truckType_left}>
                <div className={styles.truckType_title}>
                  Customer Billing Truck Type
                </div>
                <div>
                  <ProFormRadio.Group
                    name="customerTruckType"
                    label={false}
                    options={[
                      {
                        label: 'Actual Use Of Truck Type',
                        value: true,
                      },
                      {
                        label: 'Customer Required Truck Type',
                        value: false,
                      },
                    ]}
                  />
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className={styles.truckType_right}>
                <div className={styles.truckType_title}>
                  Vendor Billing Truck Type
                </div>
                <div>
                  <ProFormRadio.Group
                    name="vendorTruckType"
                    label={false}
                    options={[
                      {
                        label: 'Actual Use Of Truck Type',
                        value: true,
                      },
                      {
                        label: 'Customer Required Truck Type',
                        value: false,
                      },
                    ]}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </ModalForm>
    </>
  );
};

export default WaybillBillingTruckModal;
