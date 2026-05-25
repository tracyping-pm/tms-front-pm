import { pricingCheckWaybillConfirmPrice } from '@/api/tool';
import BatchLockModal, {
  EnumBatchType,
} from '@/pages/waybill/components/BatchLockModal';
import { InfoCircleFilled } from '@ant-design/icons';
import { Button, Flex, Modal, ModalProps } from 'antd';
import { FC, useState } from 'react';

export interface IProps extends ModalProps {
  // selectedList: IWaybillListItem[];
  usefulIdList: number[];
  onClose?: () => void;
  onFinish?: () => void;
}

const BatchConfirmPriceModal: FC<IProps> = ({
  // selectedList,
  usefulIdList,
  onClose,
  onFinish,
  ...restProps
}) => {
  const total = usefulIdList.length;
  const [loading, setLoading] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);

  const onConfirm = async () => {
    setLoading(true);
    const res = await pricingCheckWaybillConfirmPrice({
      ids: usefulIdList,
    }).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      onClose?.();
      setLockModalOpen(true);
    }
  };

  const onInnerFinish = () => {
    setLockModalOpen(false);
    onFinish?.();
  };

  return (
    <>
      <Modal
        title={null}
        width={320}
        centered
        destroyOnClose
        maskClosable={false}
        footer={null}
        onCancel={() => onClose?.()}
        {...restProps}
      >
        <Flex gap={12} align="start">
          <InfoCircleFilled
            style={{ color: 'var(--primary-color)', fontSize: 24 }}
          />
          <Flex gap={12} vertical>
            <div style={{ fontSize: 16 }}>Batch Confirm Price</div>
            <div>Do you want to Confirm {total} waybills?</div>
            <Flex gap={10} justify="end">
              <Button
                size="small"
                color="primary"
                variant="link"
                onClick={() => onClose?.()}
              >
                No
              </Button>
              <Button
                size="small"
                type="primary"
                loading={loading}
                onClick={onConfirm}
              >
                Yes
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Modal>
      <BatchLockModal
        type={EnumBatchType.CONFIRM_PRICE}
        open={lockModalOpen}
        onFinish={() => onInnerFinish()}
      />
    </>
  );
};

export default BatchConfirmPriceModal;
