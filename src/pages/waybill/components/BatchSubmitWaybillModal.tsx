import { IWaybillListItem } from '@/api/types/waybill';
import { waybillBatchSubmit } from '@/api/waybill';
import { InfoCircleFilled } from '@ant-design/icons';
import { Button, Flex, Modal, ModalProps } from 'antd';
import { FC, useState } from 'react';
import BatchLockModal, { EnumBatchType } from './BatchLockModal';

export interface IProps extends ModalProps {
  selectedList: IWaybillListItem[];
  usefulIdList: number[];
  onClose?: () => void;
  onFinish?: () => void;
}

const BatchSubmitWaybillModal: FC<IProps> = ({
  selectedList,
  usefulIdList,
  onClose,
  onFinish,
  ...restProps
}) => {
  const total = usefulIdList.length;
  const [loading, setLoading] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    const res = await waybillBatchSubmit({ ids: usefulIdList }).finally(() => {
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
        width={384}
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
            <div style={{ fontSize: 16 }}>Batch Submit Waybills</div>
            <div>
              You have selected {selectedList.length} waybills,
              {total} waybills are eligible for submission.
              <br /> Do you want to Submit {total} waybills?
            </div>
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
                onClick={onSubmit}
              >
                Yes,Submit
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Modal>
      <BatchLockModal
        type={EnumBatchType.SUBMIT}
        open={lockModalOpen}
        onFinish={() => onInnerFinish()}
      />
    </>
  );
};

export default BatchSubmitWaybillModal;
