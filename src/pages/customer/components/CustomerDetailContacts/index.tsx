import { customerContacts, deleteContact } from '@/api/customer';
import { ICustomerContactsListItem } from '@/api/types/customer';
import DetailContactItem from '@/components/DetailContactItem';
import { CONTACT_DEFAULT_EDIT_DATA, CUSTOMER_LEADS_POOL } from '@/constants';
import { PermissionEnum } from '@/enums/permission';
import CustomerContactsModal from '@/pages/customer/components/CustomerContactsModal';
import { useAccess, useParams, useSearchParams } from '@umijs/max';
import { App, Empty, List, Spin } from 'antd';
import { memo, useEffect, useState } from 'react';
import styles from './styles.less';

export default memo(function CustomerDetailContacts(props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
}) {
  const access = useAccess();
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const { showModal, setShowModal } = props;
  const { id: customerId } = useParams();
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [contactsList, setContactsList] = useState<ICustomerContactsListItem[]>(
    [],
  );
  const [editData, setEditData] = useState<ICustomerContactsListItem>(
    CONTACT_DEFAULT_EDIT_DATA,
  );

  // 获取contacts列表
  const getContactsList = async () => {
    setFetchLoading(true);
    const res = await customerContacts(customerId as string);
    if (res?.code === 200) {
      setContactsList(res?.data?.contactList || []);
    }
    setFetchLoading(false);
  };

  useEffect(() => {
    getContactsList();
  }, []);

  const hideModal = () => {
    setShowModal(false);
    setEditData(CONTACT_DEFAULT_EDIT_DATA);
  };

  // 删除操作
  const deleteClick = async (data: ICustomerContactsListItem) => {
    if (!data.contactId) {
      message.error('contactId is undefined');
      return;
    }
    const res = await deleteContact({
      customerId: Number(customerId),
      contactId: data.contactId,
    });
    if (res.code === 200) {
      message.success('Delete successfully!');
      getContactsList();
    } else {
      message.error('delete fail!');
    }
  };

  // 编辑操作
  const editClick = async (data: ICustomerContactsListItem) => {
    setEditData(data);
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
                    value: `${item.phoneNumber ? `${item.phoneCode ?? ''} ${item.phoneNumber}` : '-'}`,
                  },
                  {
                    label: 'Email',
                    value: item.email ? item.email : '-',
                  },
                  { label: 'Notes', value: item.notes ? item.notes : '-' },
                ]}
                index={index}
                showEditBtn={
                  access[PermissionEnum.CUSTOMER_DETAIL_CONTACTS_EDIT] &&
                  searchParams.get('from') !== CUSTOMER_LEADS_POOL
                }
                showDeleteBtn={
                  access[PermissionEnum.CUSTOMER_DETAIL_CONTACTS_DELETE] &&
                  searchParams.get('from') !== CUSTOMER_LEADS_POOL
                }
                editHandle={() => editClick(item)}
                deleteHandle={() => deleteClick(item)}
              />
            </List.Item>
          )}
        />
      </Spin>
      {showModal ? (
        <CustomerContactsModal
          defaultData={editData}
          hideModal={hideModal}
          refreshList={getContactsList}
        />
      ) : null}
    </div>
  );
});
