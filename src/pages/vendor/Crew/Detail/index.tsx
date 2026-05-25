import { ICrewDetail } from '@/api/types/crew';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import CustomTabs from '@/components/CustomTabs';
import { DRIVER_TAB_LIST, LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import { ApplicationTypeEnum, CrewStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { PlusOutlined } from '@ant-design/icons';
import { Access, useAccess } from '@umijs/max';
import { memo, useState } from 'react';
import ApplicationList from '../../Application';
import CrewDetailAccreditation from '../components/CrewDetailAccreditation';
import CrewDetailHeader from '../components/CrewDetailHeader';
import StatusChangeRecord from '../components/StatusChangeRecord';
import styles from './styles.less';

export default function CrewDetail() {
  const access = useAccess();
  const [tabKey, setTabKey] = useState<string>('accreditation');
  const [addAccreditation, setAddAccreditation] = useState<boolean>(false);
  const [detailRefresh, setDetailRefresh] = useState<boolean>(false);
  const [detail, setDetail] = useState<ICrewDetail>();

  // tab额外按钮
  const TabBarExtraContent = memo((props: { tabKey: string }) => {
    const { tabKey: activeTab } = props;
    switch (activeTab) {
      case DRIVER_TAB_LIST.ACCREDITATION:
        return (
          <Access
            key="materialType"
            accessible={access[PermissionEnum.CREW_DETAIL_ACCREDITATION_EDIT]}
          >
            {detail?.status !== CrewStatusEnum.BLOCKED ? (
              <div
                className={styles.addContact}
                onClick={() => setAddAccreditation(true)}
              >
                <PlusOutlined className={styles.addContact_icon} />
                Add Material Type
              </div>
            ) : null}
          </Access>
        );

      default:
        return null;
    }
  });

  const tabItems = [
    access[PermissionEnum.CREW_DETAIL_ACCREDITATION]
      ? {
          key: 'accreditation',
          label: 'Accreditation',
          children: (
            <CrewDetailAccreditation
              showModal={addAccreditation}
              setShowModal={setAddAccreditation}
              detailRefresh={detailRefresh}
              setDetailRefresh={setDetailRefresh}
            />
          ),
        }
      : null,
    access[PermissionEnum.CREW_DETAIL_APPLICATION]
      ? {
          key: 'accreditationApplication',
          label: 'Accreditation Application',
          children: (
            <ApplicationList
              source={ApplicationTypeEnum.CREW}
              detailRefresh={detailRefresh}
              setDetailRefresh={setDetailRefresh}
            />
          ),
        }
      : null,
    true
      ? {
          key: 'statusChangeRecord',
          label: 'Status Change Record',
          //@ts-ignore
          children: <StatusChangeRecord />,
        }
      : null,
  ].filter(Boolean);

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Crew', path: PATHS.VENDOR_CREW_LIST },
          { name: 'Crew Detail', path: PATHS.VENDOR_CREW_DETAIL },
        ]}
      />

      <CrewDetailHeader
        detailRefresh={detailRefresh}
        detailCallback={(v) => setDetail(v)}
      />

      <Access
        key="tab"
        accessible={access[PermissionEnum.CREW_DETAIL_ACCREDITATION]}
      >
        <div className={styles.content}>
          <CustomTabs
            defaultActiveKey={tabKey}
            tabBarGutter={60}
            // @ts-ignore
            items={tabItems}
            size="large"
            onChange={(key: string) => setTabKey(key)}
            useSticky
            offsetTop={LAYOUT_HEADER_HEIGHT + 82}
            tabBarExtraContent={<TabBarExtraContent tabKey={tabKey} />}
          />
        </div>
      </Access>
    </>
  );
}
