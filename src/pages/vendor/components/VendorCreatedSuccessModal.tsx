import { addVendorApplication } from '@/api/application';
import { IAddVendorRecord } from '@/api/types/vendor';
import { PATHS } from '@/constants';
import { history, styled } from '@umijs/max';
import { Button, message, Modal, ModalProps } from 'antd';
import copy from 'copy-to-clipboard';
import queryString from 'query-string';
import { useState } from 'react';

const ItemView = styled.div`
  display: flex;

  gap: 12px;
  font-size: 14px;
  margin-bottom: 24px;
`;

const Key = styled.div`
  width: 120px;
`;

const Value = styled.div`
  color: #262626;
`;

type IAccountCreateSuccessModal = ModalProps & {
  open: boolean;
  record: IAddVendorRecord;
  onCancel?: () => void;
};

const VendorCreatedSuccessModal = ({
  open,
  record,

  width = 510,
  onCancel,
  ...restProps
}: IAccountCreateSuccessModal) => {
  const [vendorAccreditLoading, setVendorAccreditLoading] = useState(false);
  const handleCopy = () => {
    const content = `Email: ${record.account?.email}\nPassword: ${record.account?.randomPassword}`;
    message.success(`Replicating Success: ${content}`);
    copy(content);
  };

  const onVendorAccredit = async () => {
    setVendorAccreditLoading(true);
    const res = await addVendorApplication({ id: record.id });
    setVendorAccreditLoading(false);
    onCancel?.();
    if (res.code === 200) {
      const parsed = queryString.parse(location.search)?.tabKey as string;
      if (!parsed) {
        history.push(`${PATHS.VENDOR_LIST}`);
      }
    }
  };
  const onUploadAccreditation = () => {
    const parsed = queryString.parse(location.search)?.tabKey as string;
    onCancel?.();
    if (!parsed) {
      history.push(`${PATHS.VENDOR_DETAIL}/${record.id}?tabKey=accreditation`);
    }
  };

  return (
    <>
      <Modal
        open={open}
        title={'Vendor Account Created'}
        width={width}
        onCancel={onCancel}
        footer={() => (
          <>
            {record?.account?.email ? (
              <Button key="copy" type="link" onClick={handleCopy}>
                Copy
              </Button>
            ) : null}

            <Button onClick={onVendorAccredit} loading={vendorAccreditLoading}>
              Vendor Accredit
            </Button>
            <Button type="primary" onClick={onUploadAccreditation}>
              Upload Accreditation
            </Button>
          </>
        )}
        {...restProps}
      >
        <div>
          <ItemView>
            The Vendor has been successfully created, Continue upload
            Accreditation Or upload by Vendor
          </ItemView>

          {record?.account?.email ? (
            <>
              <ItemView>
                <Key>Vendor Account:</Key>
                <Value>{record?.account?.email}</Value>
              </ItemView>
              <ItemView>
                <Key>Password:</Key>
                <Value>{record?.account?.randomPassword}</Value>
              </ItemView>
            </>
          ) : null}
        </div>
      </Modal>
    </>
  );
};

export default VendorCreatedSuccessModal;
