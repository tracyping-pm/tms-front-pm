import { PATHS } from '@/constants';
import { ApplicationTypeEnum } from '@/enums';
import { openNewTag } from '@/utils/utils';
import { Button, Modal, ModalProps } from 'antd';
type ICrewCreateCheckModal = ModalProps & {
  record: { id: number; number: string };
  loading?: boolean;
  hideModal: () => void;
  onSaveTruck: () => void;
};

const CrewCreateCheckModal = ({
  width = 500,
  record,
  loading,
  onSaveTruck,
  hideModal,
  ...restProps
}: ICrewCreateCheckModal) => {
  const onSave = async () => {
    onSaveTruck?.();
  };

  return (
    <>
      <Modal
        open={true}
        title={'Add Crew'}
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
                  `${PATHS.VENDOR_APPLICATION_DETAIL}/${record.id}?type=${ApplicationTypeEnum.CREW}`,
                );
              }}
            >
              View Application
            </Button>
            <Button type="primary" onClick={onSave} loading={loading}>
              Save Crew
            </Button>
          </>
        )}
        {...restProps}
      >
        <div>
          The Crew has an accreditation application(
          <a
            style={{ textDecoration: 'underline' }}
            onClick={() => {
              openNewTag(
                `${PATHS.VENDOR_APPLICATION_DETAIL}/${record.id}?type=${ApplicationTypeEnum.CREW}`,
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

export default CrewCreateCheckModal;
