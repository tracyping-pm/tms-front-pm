import { vendorDetailApproval, vendorDetailReaccredit } from '@/api/vendor';
import { PATHS } from '@/constants';
import { ApplicationTypeEnum } from '@/enums';
import { openNewTag } from '@/utils/utils';
import { App, Button, Modal, ModalProps } from 'antd';
type IApprovalMarkModal = ModalProps & {
  id: number;
  record: { id: number; number: string; type: string };
  refresh: () => void;
  hideModal: () => void;
};

const ApprovalMarkModal = ({
  width = 500,
  record,
  id,
  refresh,
  hideModal,

  ...restProps
}: IApprovalMarkModal) => {
  const { message } = App.useApp();

  const onApproval = async () => {
    const res =
      record.type === 'Approval'
        ? await vendorDetailApproval({
            id: Number(id),
            enable: true,
          })
        : await vendorDetailReaccredit({ id: Number(id) });

    if (res.code === 200) {
      message.success('Approval successfully!');
      refresh();
      hideModal();
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
                  `${PATHS.VENDOR_APPLICATION_DETAIL}/${record.id}?type=${ApplicationTypeEnum.VENDOR}`,
                );
              }}
            >
              View Application
            </Button>
            <Button type="primary" onClick={onApproval}>
              Accreditation Approval
            </Button>
          </>
        )}
        {...restProps}
      >
        <div>
          The vendor has an accreditation application(
          <a
            style={{ textDecoration: 'underline' }}
            onClick={() => {
              openNewTag(
                `${PATHS.VENDOR_APPLICATION_DETAIL}/${record.id}?type=${ApplicationTypeEnum.VENDOR}`,
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
