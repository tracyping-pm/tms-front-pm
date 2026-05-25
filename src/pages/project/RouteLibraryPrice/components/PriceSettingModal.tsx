import { updateRoutePriceSetting } from '@/api/project';
import { IPriceSettingData } from '@/api/types/project';
import { ROUTE_LIBRARY_IDENTITY } from '@/enums';
import { App, Modal, Switch } from 'antd';
import { useState } from 'react';

export default function PriceSettingModal({
  hideModal,
  selectedVendor,
  identity,
  settingData,
}: {
  selectedVendor: number | undefined;
  identity: ROUTE_LIBRARY_IDENTITY;
  hideModal: () => void;
  settingData: IPriceSettingData;
}) {
  const { message } = App.useApp();
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(
    settingData.strongValidityPeriodLimit,
  );

  const handleOk = async () => {
    setFetchLoading(true);
    const res = await updateRoutePriceSetting({
      id: settingData.id,
      customerOrVendor: identity === ROUTE_LIBRARY_IDENTITY.CUSTOMER,
      strongValidityPeriodLimit: checked,
      vendorId: selectedVendor ?? undefined,
    });
    setFetchLoading(false);
    if (res.code === 200) {
      message.success('Edit successfully!');
      hideModal();
    }
  };
  return (
    <Modal
      width={520}
      title="Price Setting"
      open={true}
      onOk={handleOk}
      confirmLoading={fetchLoading}
      onCancel={hideModal}
      okText="Confirm"
    >
      <div
        style={{
          padding: '24px 0',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>Strong Validity Period Limit</div>
        <Switch checked={checked} onChange={(b) => setChecked(b)} />
      </div>
    </Modal>
  );
}
