import {
  editLibraryDetailCustomerPricingInfo,
  editLibraryDetailVendorPricingInfo,
} from '@/api/project';
import { ILibraryDetailPriceVersionInfo } from '@/api/types/project';
import { MAX_LENGTH } from '@/constants';
import { ROUTE_LIBRARY_IDENTITY } from '@/enums';
import { formatString } from '@/utils/format';
import { App, Form, Input, Modal } from 'antd';
import { memo, useState } from 'react';

export default memo(function EditLibraryInfoModal(props: {
  hideModal: () => void;
  callBack: () => void;
  identity: ROUTE_LIBRARY_IDENTITY;
  versionId: number;
  defaultData: ILibraryDetailPriceVersionInfo;
}) {
  const { message } = App.useApp();
  const {
    versionId,
    identity,
    hideModal,
    callBack,
    defaultData = {} as ILibraryDetailPriceVersionInfo,
  } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async (params: any) => {
    if (!versionId) {
      message.error('VersionId is undefined');
      return;
    }
    setLoading(true);
    let res;
    if (identity === ROUTE_LIBRARY_IDENTITY.VENDOR) {
      res = await editLibraryDetailVendorPricingInfo({
        id: versionId,
        name: formatString(params?.priceVersionName),
      });
    } else {
      res = await editLibraryDetailCustomerPricingInfo({
        id: versionId,
        name: formatString(params?.priceVersionName),
      });
    }
    setLoading(false);
    if (res.code === 200) {
      message.success('Edit success!');
      callBack();
      hideModal();
    }
  };

  return (
    <Modal
      width={480}
      title={`Edit`}
      open={true}
      onCancel={hideModal}
      okButtonProps={{
        loading: loading,
        onClick: () => form?.submit?.(),
      }}
      okText="Confirm"
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          priceVersionName: defaultData?.versionName,
        }}
        autoComplete="off"
        style={{ marginTop: '12px' }}
        onFinish={submit}
      >
        {/*名称*/}
        <Form.Item
          name="priceVersionName"
          label="Price Version Name"
          style={{ fontSize: '14px' }}
          rules={[
            { required: true, message: 'Please enter' },
            {
              max: MAX_LENGTH.NAME,
              message: `Price version name cannot exceed ${MAX_LENGTH.NAME} characters`,
            },
          ]}
        >
          <Input style={{ fontSize: '14px' }} placeholder="Please enter" />
        </Form.Item>
      </Form>
    </Modal>
  );
});
