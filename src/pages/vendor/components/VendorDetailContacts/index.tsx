import {
  IVendorContactListItem,
  IVendorContactParams,
} from '@/api/types/vendor';
import { deleteVendorContact, getVendorContactList } from '@/api/vendor';
import DetailContactItem from '@/components/DetailContactItem';
import { PermissionEnum } from '@/enums/permission';
import VendorContactsModal from '@/pages/vendor/components/VendorContactsModal';
import { useAccess, useParams } from '@umijs/max';
import { App, Empty, List, Spin } from 'antd';
import { memo, useEffect, useState } from 'react';
import styles from './styles.less';

export default memo(function CustomerDetailContacts(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
}) {
  const access = useAccess();
  const { id: vendorId } = useParams();
  const { message } = App.useApp();
  const { showModal, setShowModal } = props;
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [formDefaultValue, setFormDefaultValue] =
    useState<IVendorContactParams | null>(null);
  const [contactsList, setContactsList] = useState<IVendorContactListItem[]>(
    [],
  );

  // 获取contacts列表
  const getContactsList = async () => {
    setFetchLoading(true);
    const res = await getVendorContactList({ id: Number(vendorId) });
    if (res.code === 200) {
      setContactsList(res.data);
    }
    setFetchLoading(false);
  };

  useEffect(() => {
    getContactsList();
  }, []);

  const hideModal = () => {
    setShowModal(false);
    setFormDefaultValue(null);
  };

  // 删除操作
  const deleteClick = async (contactId: number) => {
    const res = await deleteVendorContact({
      contactId: contactId,
      vendorId: Number(vendorId),
    });
    if (res.code === 200) {
      message.success('Delete successfully!');
      getContactsList();
    }
  };

  // 编辑操作
  const editClick = async (data: IVendorContactListItem) => {
    setFormDefaultValue(data);
    setShowModal(true);
  };

  return (
    <div className={styles.contacts}>
      <Spin spinning={fetchLoading}>
        <List
          dataSource={contactsList}
          split={false}
          locale={{
            emptyText: (
              <div className={styles.empty}>
                {!fetchLoading && !contactsList.length ? (
                  <Empty
                    description="no data"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : null}
              </div>
            ),
          }}
          renderItem={(item, index) => (
            <List.Item style={{ padding: 0 }}>
              <DetailContactItem
                data={[
                  { label: 'Name', value: item.contactName },
                  {
                    label: 'Title',
                    value: item.title ? item.title : '-',
                  },
                  {
                    label: 'Number',
                    value: item.phoneCode + ' ' + item.phoneNumber,
                  },
                  {
                    label: 'Email',
                    value: item.email ? item.email : '-',
                  },
                  { label: 'Notes', value: item.notes ? item.notes : '-' },
                ]}
                index={index}
                showEditBtn={access[PermissionEnum.VENDOR_DETAIL_CONTACTS_EDIT]}
                showDeleteBtn={
                  access[PermissionEnum.VENDOR_DETAIL_CONTACTS_DELETE]
                }
                editHandle={() => editClick(item)}
                deleteHandle={() => deleteClick(item.id)}
              />
            </List.Item>
          )}
        />
      </Spin>
      {showModal ? (
        <VendorContactsModal
          defaultData={formDefaultValue}
          hideModal={hideModal}
          refresh={getContactsList}
        />
      ) : null}
    </div>
  );
});
