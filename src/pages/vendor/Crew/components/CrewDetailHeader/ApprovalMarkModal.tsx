import { crewActivateCheck, crewApproval } from '@/api/crew';
import { PATHS } from '@/constants';
import { ApplicationTypeEnum } from '@/enums';
import { openNewTag } from '@/utils/utils';
import { App, Button, Modal, ModalProps } from 'antd';
import { useState } from 'react';

type IApprovalMarkModal = ModalProps & {
  id: number;
  record: { id: number; number: string; type: string };
  refresh: () => void;
  hideModal: () => void;
  onActivateOpenHandle: () => void;
};

const ApprovalMarkModal = ({
  width = 500,
  record,
  id,
  refresh,
  hideModal,
  onActivateOpenHandle,
  ...restProps
}: IApprovalMarkModal) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);

  const onApproval = async () => {
    setLoading(true);
    if (record.type === 'Approval') {
      const res = await crewApproval(Number(id)).finally(() =>
        setLoading(false),
      );
      if (res.code === 200) {
        message.success(`Approval successfully!`);
        refresh();
        hideModal();
      }
    } else if (record.type === 'Activate') {
      const res = await crewActivateCheck(Number(id)).finally(() =>
        setLoading(false),
      );
      if (res.code === 200) {
        onActivateOpenHandle();
      }
    }
  };

  return (
    <>
      <Modal
        open={true}
        title={'Accreditation Approval'}
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
            <Button type="primary" onClick={onApproval} loading={loading}>
              Accreditation Approval
            </Button>
          </>
        )}
        {...restProps}
      >
        <div>
          The truck has an accreditation application(
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
          ), Continue Accreditation Approval?
        </div>
      </Modal>
    </>
  );
};

export default ApprovalMarkModal;
