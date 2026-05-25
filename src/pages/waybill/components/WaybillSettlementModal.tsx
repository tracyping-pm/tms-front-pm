import { ISettlementData } from '@/api/types/waybill';
import { setWaybillSettlement } from '@/api/waybill';
import { useParams } from '@umijs/max';
import { App, Badge, Modal, Switch } from 'antd';
import { useState } from 'react';
import styles from './common.less';

interface ISettlementProps {
  name: string;
  settlementData: ISettlementData;
  hideModal: () => void;
  refresh: () => void;
}
export default function WaybillSettlementModal({
  name,
  settlementData,
  hideModal,
  refresh,
}: ISettlementProps) {
  const { message } = App.useApp();
  const { id: waybillId } = useParams();
  const [billForm, setBillForm] = useState<ISettlementData>(settlementData);
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async () => {
    setLoading(true);
    const res = await setWaybillSettlement({
      id: billForm.id,
      waybillId: Number(waybillId),
      enableTotalSettlement: billForm.enableTotalSettlement,
      enableBasicAmountSettlement: billForm.enableBasicAmountSettlement,
      enableAdditionalChargeSettlement:
        billForm.enableAdditionalChargeSettlement,
      enableExceptionFeeSettlement: billForm.enableExceptionFeeSettlement,
    });
    setLoading(false);
    if (res.code === 200) {
      message.success('Edit settlement status successfully!');
      hideModal?.();
      refresh?.();
    }
  };

  return (
    <Modal
      width={754}
      title={`${name} settlement status and setting`}
      open={true}
      onOk={submit}
      okButtonProps={{
        loading: loading,
      }}
      onCancel={hideModal}
      okText="Confirm"
    >
      <div className={styles.settlement}>
        <div className={styles.settlement_header}>
          <div className={styles.settlement_header_item}>Bill Type</div>
          <div className={styles.settlement_header_line}></div>
          <div className={styles.settlement_header_item}>
            Whether Settlement
          </div>
          <div className={styles.settlement_header_line}></div>
          <div className={styles.settlement_header_item}>Settlement Status</div>
        </div>
        <div className={styles.settlement_content}>
          <div className={styles.settlement_content_item}>
            {`Total ${name} Bill`}
          </div>
          <div className={styles.settlement_content_item}>
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
              checked={billForm.enableTotalSettlement}
              onClick={(value) => {
                console.log(value);
                if (!value) {
                  setBillForm({
                    ...billForm,
                    enableTotalSettlement: false,
                    enableBasicAmountSettlement: false,
                    enableExceptionFeeSettlement: false,
                    enableAdditionalChargeSettlement: false,
                  });
                } else {
                  setBillForm({ ...billForm, enableTotalSettlement: true });
                }
              }}
            />
          </div>
          <div className={styles.settlement_content_item}>
            <Badge color={'#D9D9D9'} text={'Unverified'} />
          </div>
        </div>

        <div className={styles.settlement_content}>
          <div className={styles.settlement_content_item}>
            {`${name} Basic Amount`}
          </div>
          <div className={styles.settlement_content_item}>
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
              checked={billForm.enableBasicAmountSettlement}
              onClick={(value) =>
                setBillForm({
                  ...billForm,
                  enableBasicAmountSettlement: value,
                })
              }
            />
          </div>
          <div className={styles.settlement_content_item}>
            <Badge color={'#D9D9D9'} text={'Unverified'} />
          </div>
        </div>

        <div className={styles.settlement_content}>
          <div className={styles.settlement_content_item}>
            {`${name} Exception Fee`}
          </div>
          <div className={styles.settlement_content_item}>
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
              checked={billForm.enableExceptionFeeSettlement}
              onClick={(value) =>
                setBillForm({
                  ...billForm,
                  enableExceptionFeeSettlement: value,
                })
              }
            />
          </div>
          <div className={styles.settlement_content_item}>
            <Badge color={'#D9D9D9'} text={'Unverified'} />
          </div>
        </div>

        <div className={styles.settlement_content}>
          <div className={styles.settlement_content_item}>
            {`${name} Additional Charge`}
          </div>
          <div className={styles.settlement_content_item}>
            <Switch
              checkedChildren="Yes"
              unCheckedChildren="No"
              checked={billForm.enableAdditionalChargeSettlement}
              onClick={(value) =>
                setBillForm({
                  ...billForm,
                  enableAdditionalChargeSettlement: value,
                })
              }
            />
          </div>
          <div className={styles.settlement_content_item}>
            <Badge color={'#D9D9D9'} text={'Unverified'} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
