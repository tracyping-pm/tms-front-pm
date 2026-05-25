import { ICustomerRecord } from '@/api/types/customer';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import CustomTabs from '@/components/CustomTabs';
import {
  CUSTOMER_LEADS_POOL,
  CUSTOMER_TAB_LIST,
  DEFAULT_TAB_KEY,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import PubSubContext from '@/context/pubsub';
import { PermissionEnum } from '@/enums/permission';
import CustomerDetailBusinessDoc from '@/pages/customer/components/CustomerDetailBusinessDoc';
import CustomerDetailContacts from '@/pages/customer/components/CustomerDetailContacts';
import CustomerDetailFinancialDoc from '@/pages/customer/components/CustomerDetailFinancialDoc';
import CustomerDetailHeader from '@/pages/customer/components/CustomerDetailHeader';
import CustomerDetailProjects from '@/pages/customer/components/CustomerDetailProjects';
import CustomerDetailTimeline from '@/pages/customer/components/CustomerDetailTimeline';
import { PlusOutlined } from '@ant-design/icons';
import { Access, useAccess, useSearchParams } from '@umijs/max';
import { memo, useContext, useEffect, useState } from 'react';
import CustomerDetailContractList from '../components/CustomerDetailContractList';
import CustomerDetailOpportunity from '../components/CustomerDetailOpportunity';
import { EVENT_CUSTOMER_DATA } from '../events';
import styles from './styles.less';

export default function CustomerDetail() {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const [searchParams] = useSearchParams();
  const [tabKey, setTabKey] = useState<string>(DEFAULT_TAB_KEY);
  const [showAddContact, setShowAddContact] = useState<boolean>(false);
  const [showAddRecord, setShowAddRecord] = useState<boolean>(false);
  const [showAddOpportunity, setShowAddOpportunity] = useState<boolean>(false);
  const [showAddPerception, setShowAddPerception] = useState<boolean>(false);
  const [addBusinessDoc, setAddBusinessDoc] = useState<boolean>(false);
  const [addFinancialDoc, setAddFinancialDoc] = useState<boolean>(false);
  const [showAddSummary, setShowAddSummary] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>();
  // tab额外按钮
  const TabBarExtraContent = memo((props: { tabKey: string }) => {
    const { tabKey: activeTab } = props;
    switch (activeTab) {
      case CUSTOMER_TAB_LIST.CONTACTS:
        return (
          <Access
            accessible={
              access[PermissionEnum.CUSTOMER_DETAIL_CONTACTS_ADD] &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
          >
            <div
              className={styles.addContact}
              onClick={() => setShowAddContact(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Contact
            </div>
          </Access>
        );
      case CUSTOMER_TAB_LIST.RECORDS:
        return (
          <Access
            accessible={
              access[PermissionEnum.CUSTOMER_DETAIL_FOLLOW_UP_RECORDS_EDIT] &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
          >
            <div
              className={styles.addContact}
              onClick={() => setShowAddRecord(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Record
            </div>
          </Access>
        );
      case CUSTOMER_TAB_LIST.OPPORTUNITIES:
        return (
          <Access
            accessible={
              access[PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES_ADD] &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
          >
            <div
              className={styles.addContact}
              onClick={() => setShowAddOpportunity(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Opportunity
            </div>
          </Access>
        );
      case CUSTOMER_TAB_LIST.BUSINESS_DOC:
        return (
          <Access
            accessible={
              access[PermissionEnum.CUSTOMER_DETAIL_BUSINESS_DOC_EDIT] &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
          >
            <div
              className={styles.addContact}
              onClick={() => setAddBusinessDoc(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Business Type
            </div>
          </Access>
        );
      case CUSTOMER_TAB_LIST.FINANCIAL_DOC:
        return (
          <Access
            accessible={
              access[PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC_EDIT] &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
          >
            <div
              className={styles.addContact}
              onClick={() => setAddFinancialDoc(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Financial Type
            </div>
          </Access>
        );
      case CUSTOMER_TAB_LIST.PERCEPTION:
        return (
          <Access
            accessible={
              access[PermissionEnum.CUSTOMER_DETAIL_SUMMARY_EDIT] &&
              searchParams.get('from') !== CUSTOMER_LEADS_POOL
            }
          >
            {showAddSummary ? (
              <div
                className={styles.addContact}
                onClick={() => setShowAddPerception(true)}
              >
                <PlusOutlined className={styles.addContact_icon} />
                Add Summary
              </div>
            ) : null}
          </Access>
        );
      default:
        return null;
    }
  });

  const tabItems = [
    access[PermissionEnum.CUSTOMER_DETAIL_SUMMARY]
      ? {
          key: 'perception',
          label: 'Summary',
          children: (
            <CustomerDetailTimeline
              tabKey={tabKey}
              showModal={showAddPerception}
              setShowModal={setShowAddPerception}
              setShowAdd={setShowAddSummary}
            />
          ),
        }
      : null,
    access[PermissionEnum.CUSTOMER_DETAIL_CONTACTS]
      ? {
          key: 'contacts',
          label: 'Contacts',
          children: (
            <CustomerDetailContacts
              showModal={showAddContact}
              setShowModal={setShowAddContact}
            />
          ),
        }
      : null,
    access[PermissionEnum.CUSTOMER_DETAIL_FOLLOW_UP_RECORDS]
      ? {
          key: 'records',
          label: 'Follow up records',
          children: (
            <CustomerDetailTimeline
              tabKey={tabKey}
              showModal={showAddRecord}
              setShowModal={setShowAddRecord}
            />
          ),
        }
      : null,
    access[PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES]
      ? {
          key: 'opportunities',
          label: 'Opportunities',
          children: (
            <CustomerDetailOpportunity
              showModal={showAddOpportunity}
              setShowModal={setShowAddOpportunity}
              isCustomer={true}
              customerName={customerName}
            />
          ),
        }
      : null,
    access[PermissionEnum.CUSTOMER_DETAIL_PROJECTS]
      ? {
          key: 'projects',
          label: 'Projects',
          children: <CustomerDetailProjects />,
        }
      : null,
    access[PermissionEnum.CUSTOMER_DETAIL_CONTRACTS]
      ? {
          key: 'contracts',
          label: 'Contracts',
          children: <CustomerDetailContractList />,
        }
      : null,
    access[PermissionEnum.CUSTOMER_DETAIL_BUSINESS_DOC]
      ? {
          key: 'businessDoc',
          label: 'Business Documents',
          children: (
            <CustomerDetailBusinessDoc
              showModal={addBusinessDoc}
              setShowModal={setAddBusinessDoc}
            />
          ),
        }
      : null,
    access[PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC]
      ? {
          key: 'financialDoc',
          label: 'Financial Documents',
          children: (
            <CustomerDetailFinancialDoc
              showModal={addFinancialDoc}
              setShowModal={setAddFinancialDoc}
            />
          ),
        }
      : null,
  ].filter(Boolean);

  useEffect(() => {
    if (tabItems.length) {
      setTabKey(tabItems?.[0]?.key ?? DEFAULT_TAB_KEY);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(
      EVENT_CUSTOMER_DATA,
      (data: ICustomerRecord) => {
        setCustomerName(data.customerName);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Customer Mgmt', path: PATHS.CUSTOMER_LIST },
          { name: 'Customer Detail', path: PATHS.CUSTOMER_DETAIL_BASE },
        ]}
      />
      {/*top info*/}
      <CustomerDetailHeader />
      {/*tabs list*/}
      <Access
        accessible={
          access[PermissionEnum.CUSTOMER_DETAIL_CONTACTS] ||
          access[PermissionEnum.CUSTOMER_DETAIL_FOLLOW_UP_RECORDS] ||
          access[PermissionEnum.CUSTOMER_DETAIL_PROJECTS] ||
          access[PermissionEnum.CUSTOMER_DETAIL_BUSINESS_DOC] ||
          access[PermissionEnum.CUSTOMER_DETAIL_FINANCIAL_DOC] ||
          access[PermissionEnum.CUSTOMER_DETAIL_SUMMARY]
        }
      >
        <div className={styles.content}>
          <CustomTabs
            defaultActiveKey={tabKey}
            tabBarGutter={60}
            // @ts-ignore
            items={tabItems}
            size="large"
            onChange={(key: string) => setTabKey(key)}
            tabBarExtraContent={<TabBarExtraContent tabKey={tabKey} />}
            useSticky
            offsetTop={LAYOUT_HEADER_HEIGHT + 82}
          />
        </div>
      </Access>
    </>
  );
}
