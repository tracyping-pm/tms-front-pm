import { Modal, ModalProps } from 'antd';
import { FC } from 'react';

interface IProps extends ModalProps {
  hideModal: () => void;
}

const ConfirmModal: FC<IProps> = ({
  open,
  title = 'Terms and Conditions for Electronic Signature',
  width = 600,
  hideModal,
  ...restProps
}) => {
  return (
    <Modal
      title={title}
      open={open}
      width={width}
      destroyOnClose
      onOk={() => {}}
      onCancel={() => hideModal()}
      maskClosable={false}
      okText="I Agree"
      {...restProps}
    >
      <div style={{ fontSize: '13px', color: '#333', lineHeight: '17px' }}>
        <div>
          1. Acceptance of Terms: By signing electronically, you agree to be
          legally bound by these terms and conditions.
        </div>
        <br />
        <div>
          2. Electronic Signature: Your electronic signature on documents holds
          the same legal validity and enforceability as a handwritten signature,
          as long as it adheres to applicable laws and regulations.
        </div>
        <br />
        <div>
          3. Consent to Electronic Format: By agreeing to sign electronically,
          you consent to the electronic format of all documents, notices, and
          records and understand you may withdraw your consent at any time,
          subject to legal or contractual restrictions.
        </div>
        <br />
        <div>
          4. Accuracy of Information: You are responsible for ensuring that all
          personal information provided for the electronic signature process is
          accurate and up-to-date.
        </div>
        <br />
        <div>
          5. Security: You agree to maintain the security of your electronic
          signature and immediately notify us in case of any unauthorized use.
        </div>
        <br />
        <div>
          6. Compliance with Laws: You agree to use the electronic signature in
          compliance with all applicable laws, including but not limited to,
          laws related to contracts, electronic signatures, and data protection.
        </div>
        <br />
        <div>
          7. Modification of Terms: We reserve the right to modify these terms
          and conditions at any time, with changes becoming effective upon
          posting.
        </div>
        <br />
        <div>
          8. Liability Limitation: We are not liable for any errors or omissions
          in any content or for any loss or damage of any kind incurred as a
          result of the use of the electronic signature service.
        </div>
        <br />
        <div>
          9. Governing Law: These terms and conditions shall be governed by and
          construed in accordance with the laws of the jurisdiction in which the
          electronic signature is used.
        </div>
        <br />
        <div>
          By proceeding with the electronic signature, you acknowledge that you
          have read, understood, and agree to these Terms and Conditions for
          Electronic Signature.
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
