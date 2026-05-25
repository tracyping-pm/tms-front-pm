import { PATHS } from '@/constants';
import { ApplicationTypeEnum } from '@/enums';
import { openNewTag } from '@/utils/utils';
import { Button, Modal, ModalProps } from 'antd';
type ITruckCreateCheckModal = ModalProps & {
  record: { id: number; number: string };
  loading?: boolean;
  hideModal: () => void;
  onSaveTruck: () => void;
};

const TruckCreateCheckModal = ({
  width = 500,
  record,
  loading,
  onSaveTruck,
  hideModal,
  ...restProps
}: ITruckCreateCheckModal) => {
  const onSave = async () => {
    onSaveTruck?.();
  };

  return (
    <>
      <Modal
        open={true}
        title={'Add Truck'}
        style={{ marginTop: '14px' }}
        width={width}
        onCancel={hideModal}
        footer={() => (
          <>
            <Button key="cancel" onClick={hideModal}>
              Cancel
            </Button>

            <Button
              type="primary"
              onClick={() => {
                openNewTag(
                  `${PATHS.VENDOR_APPLICATION_DETAIL}/${record.id}?type=${ApplicationTypeEnum.TRUCK}`,
                );
              }}
            >
              View Application
            </Button>
            <Button type="primary" onClick={onSave} loading={loading}>
              Save Truck
            </Button>
          </>
        )}
        {...restProps}
      >
        <div>
          The Truck has an accreditation application(
          <a
            style={{ textDecoration: 'underline' }}
            onClick={() => {
              openNewTag(
                `${PATHS.VENDOR_APPLICATION_DETAIL}/${record.id}?type=${ApplicationTypeEnum.TRUCK}`,
              );
            }}
          >
            {record.number}
          </a>
          ), Continue Adding?
        </div>
      </Modal>
    </>
  );
};

export default TruckCreateCheckModal;
