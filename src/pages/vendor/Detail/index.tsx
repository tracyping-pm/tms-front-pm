import { IVendorDetail } from '@/api/types/vendor';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import CustomTabs from '@/components/CustomTabs';
import {
  DEFAULT_TAB_KEY,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
  VENDOR_TAB_LIST,
} from '@/constants';
import { ApplicationTypeEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import VendorDetailAccreditation from '@/pages/vendor/components/VendorDetailAccreditation';
import VendorDetailContacts from '@/pages/vendor/components/VendorDetailContacts';
import VendorDetailContractList from '@/pages/vendor/components/VendorDetailContractList';
import VendorDetailHeader from '@/pages/vendor/components/VendorDetailHeader';
import VendorDetailProjects from '@/pages/vendor/components/VendorDetailProjects';
import VendorDetailTimeline from '@/pages/vendor/components/VendorDetailTimeline';
import VendorDetailTrucks from '@/pages/vendor/components/VendorDetailTrucks';
import { PlusOutlined } from '@ant-design/icons';
import { Access, useAccess } from '@umijs/max';
import queryString from 'query-string';
import { memo, useEffect, useState } from 'react';
import ApplicationList from '../Application';
import VendorDetailCrew from '../components/VendorDetailCrew';
import VendorDetailFinancialDocuments from '../components/VendorDetailFinancialDocuments';
import styles from './styles.less';

export default function VendorDetail() {
  const access = useAccess();
  const parsed = queryString.parse(location.search)?.tabKey as string;
  const [tabKey, setTabKey] = useState<string>(parsed ?? DEFAULT_TAB_KEY);
  const [recordFresh, setRecordFresh] = useState<boolean>(false);
  const [vendorStatus, setVendorStatus] = useState<string>('');
  const [detailRefresh, setDetailRefresh] = useState<boolean>(false);
  const [showAddSummaryModal, setShowAddSummaryModal] =
    useState<boolean>(false);
  const [showAddSummary, setShowAddSummary] = useState<boolean>(false);
  const [showAddContact, setShowAddContact] = useState<boolean>(false);
  const [showAddRecord, setShowAddRecord] = useState<boolean>(false);
  const [showAddTruck, setShowAddTruck] = useState<boolean>(false);
  const [showAddCrew, setShowAddCrew] = useState<boolean>(false);
  // const [showAddDriver, setShowAddDriver] = useState<boolean>(false);
  // const [showAddHelper, setShowAddHelper] = useState<boolean>(false);
  const [addAccreditation, setAddAccreditation] = useState<boolean>(false);
  const [addFinancial, setAddFinancial] = useState<boolean>(false);
  const [venderData, setVenderData] = useState<IVendorDetail>();

  // tab额外按钮
  const TabBarExtraContent = memo((props: { tabKey: string }) => {
    const { tabKey: activeTab } = props;
    switch (activeTab) {
      case VENDOR_TAB_LIST.SUMMARY:
        return (
          <Access
            accessible={access[PermissionEnum.VENDOR_DETAIL_SUMMARY_EDIT]}
          >
            {showAddSummary ? (
              <div
                className={styles.addContact}
                onClick={() => setShowAddSummaryModal(true)}
              >
                <PlusOutlined className={styles.addContact_icon} />
                Add Summary
              </div>
            ) : null}
          </Access>
        );
      case VENDOR_TAB_LIST.CONTACTS:
        return (
          <Access
            accessible={access[PermissionEnum.VENDOR_DETAIL_CONTACTS_ADD]}
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
      case VENDOR_TAB_LIST.RECORDS:
        return (
          <Access
            accessible={
              access[PermissionEnum.VENDOR_DETAIL_FOLLOW_UP_RECORDS_EDIT]
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
      case VENDOR_TAB_LIST.TRUCKS:
        return (
          <Access accessible={access[PermissionEnum.VENDOR_DETAIL_TRUCK_ADD]}>
            <div
              className={styles.addContact}
              onClick={() => setShowAddTruck(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Truck
            </div>
          </Access>
        );
      case VENDOR_TAB_LIST.CREW:
        return (
          <Access accessible={access[PermissionEnum.VENDOR_DETAIL_CREW_ADD]}>
            <div
              className={styles.addContact}
              onClick={() => setShowAddCrew(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Crew
            </div>
          </Access>
        );

      case VENDOR_TAB_LIST.ACCREDITATION:
        return (
          <Access
            accessible={access[PermissionEnum.VENDOR_DETAIL_ACCREDITATION_EDIT]}
          >
            <div
              className={styles.addContact}
              onClick={() => setAddAccreditation(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Material Type
            </div>
          </Access>
        );
      case VENDOR_TAB_LIST.FINANCIAL:
        return (
          <Access
            accessible={access[PermissionEnum.VENDOR_DETAIL_FINANCIAL_DOC_EDIT]}
          >
            <div
              className={styles.addContact}
              onClick={() => setAddFinancial(true)}
            >
              <PlusOutlined className={styles.addContact_icon} />
              Add Financial Type
            </div>
          </Access>
        );
      default:
        return null;
    }
  });

  const tabItems = [
    access[PermissionEnum.VENDOR_DETAIL_SUMMARY]
      ? {
          key: 'summary',
          label: 'Summary',
          children: (
            <VendorDetailTimeline
              tabKey={tabKey}
              recordFresh={recordFresh}
              showModal={showAddSummaryModal}
              setShowModal={setShowAddSummaryModal}
              setShowAdd={setShowAddSummary}
            />
          ),
        }
      : null,
    access[PermissionEnum.VENDOR_DETAIL_CONTACTS]
      ? {
          key: 'contacts',
          label: 'Contacts',
          children: (
            <VendorDetailContacts
              showModal={showAddContact}
              setShowModal={setShowAddContact}
            />
          ),
        }
      : null,
    access[PermissionEnum.VENDOR_DETAIL_FOLLOW_UP_RECORDS]
      ? {
          key: 'records',
          label: 'Follow up records',
          children: (
            <VendorDetailTimeline
              tabKey={tabKey}
              recordFresh={recordFresh}
              showModal={showAddRecord}
              setShowModal={setShowAddRecord}
            />
          ),
        }
      : null,
    access[PermissionEnum.VENDOR_DETAIL_TRUCK_LIST]
      ? {
          key: 'trucks',
          label: 'Trucks',
          children: (
            <VendorDetailTrucks
              showModal={showAddTruck}
              setShowModal={setShowAddTruck}
              detailRefresh={detailRefresh}
              setDetailRefresh={setDetailRefresh}
            />
          ),
        }
      : null,

    access[PermissionEnum.VENDOR_DETAIL_CREW_LIST]
      ? {
          key: 'crew',
          label: 'Crew',
          children: (
            <VendorDetailCrew
              showModal={showAddCrew}
              setShowModal={setShowAddCrew}
              detailRefresh={detailRefresh}
              setDetailRefresh={setDetailRefresh}
            />
          ),
        }
      : null,

    access[PermissionEnum.VENDOR_DETAIL_PROJECT_LIST]
      ? {
          key: 'projects',
          label: 'Projects',
          children: <VendorDetailProjects />,
        }
      : null,
    access[PermissionEnum.VENDOR_DETAIL_CONTRACTS]
      ? {
          key: 'contracts',
          label: 'Contracts',
          children: <VendorDetailContractList />,
        }
      : null,
    access[PermissionEnum.VENDOR_DETAIL_ACCREDITATION]
      ? {
          key: 'accreditation',
          label: 'Accreditation',
          children: (
            <VendorDetailAccreditation
              showModal={addAccreditation}
              setShowModal={setAddAccreditation}
              vendorStatus={vendorStatus}
              detailRefresh={detailRefresh}
              setDetailRefresh={setDetailRefresh}
              venderData={venderData!}
            />
          ),
        }
      : null,
    access[PermissionEnum.VENDOR_DETAIL_APPLICATION]
      ? {
          key: 'accreditationApplication',
          label: 'Accreditation Application',
          children: (
            <ApplicationList
              source={ApplicationTypeEnum.VENDOR}
              detailRefresh={detailRefresh}
              setDetailRefresh={setDetailRefresh}
            />
          ),
        }
      : null,
    access[PermissionEnum.VENDOR_DETAIL_FINANCIAL_DOC]
      ? {
          key: 'financialDocuments',
          label: 'Financial Documents',
          children: (
            <VendorDetailFinancialDocuments
              showModal={addFinancial}
              setShowModal={setAddFinancial}
              vendorStatus={vendorStatus}
              detailRefresh={detailRefresh}
              setDetailRefresh={setDetailRefresh}
            />
          ),
        }
      : null,
  ].filter(Boolean);

  useEffect(() => {
    if (tabItems.length) {
      if (parsed) {
        setTabKey(parsed);
        return;
      }

      setTabKey(tabItems?.[0]?.key ?? DEFAULT_TAB_KEY);
    }
  }, []);

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Vendor Mgmt', path: PATHS.VENDOR_LIST },
          { name: 'Vendor Detail', path: PATHS.VENDOR_DETAIL },
        ]}
      />
      {/*top info*/}
      <VendorDetailHeader
        recordFresh={recordFresh}
        detailRefresh={detailRefresh}
        setVendorStatus={setVendorStatus}
        setRecordFresh={setRecordFresh}
        setData={(v) => {
          setVenderData(v);
        }}
      />

      {/*tabs list*/}
      {(access[PermissionEnum.VENDOR_DETAIL_CONTACTS] ||
        access[PermissionEnum.VENDOR_DETAIL_FOLLOW_UP_RECORDS] ||
        access[PermissionEnum.VENDOR_DETAIL_TRUCK_LIST] ||
        access[PermissionEnum.VENDOR_DETAIL_CREW_LIST] ||
        access[PermissionEnum.VENDOR_DETAIL_PROJECT_LIST] ||
        access[PermissionEnum.VENDOR_DETAIL_ACCREDITATION] ||
        access[PermissionEnum.VENDOR_DETAIL_APPLICATION] ||
        access[PermissionEnum.VENDOR_DETAIL_CONTRACTS]) && (
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
      )}
    </>
  );
}
