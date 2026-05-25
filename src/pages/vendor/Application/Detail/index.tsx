import BreadcrumbCase from '@/components/CustomBreadcrumb';
import CustomTabs from '@/components/CustomTabs';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import { Access, useParams } from '@umijs/max';
import { useEffect, useState } from 'react';

import {
  crewApplicationDetail,
  truckApplicationDetail,
  vendorApplicationDetail,
} from '@/api/application';
import {
  ICategoryItem,
  ICrewApplicationDetailRecord,
  ITruckApplicationDetailRecord,
  IVendorApplicationDetailRecord,
} from '@/api/types/application';
import { ApplicationTypeEnum } from '@/enums';
import queryString from 'query-string';
import ApplicationDetailAccreditation from '../components/ApplicationDetailAccreditation';
import ApplicationDetailHeader from '../components/ApplicationDetailHeader';
import styles from './styles.less';

export default function ApplicationDetail() {
  // const access = useAccess();
  const { id: applicationId } = useParams();
  const type = queryString.parse(location.search)?.type as string;
  const [tabKey, setTabKey] = useState<string>('accreditation');

  const [data, setData] = useState<
    IVendorApplicationDetailRecord &
      ITruckApplicationDetailRecord &
      ICrewApplicationDetailRecord
  >();
  const [categoryList, setCategoryList] = useState<ICategoryItem[]>([]);

  const getDetail = async () => {
    let res;
    switch (type) {
      case ApplicationTypeEnum.TRUCK:
        res = await truckApplicationDetail(+applicationId!);
        break;
      case ApplicationTypeEnum.VENDOR:
        res = await vendorApplicationDetail(+applicationId!);
        break;
      case ApplicationTypeEnum.CREW:
        res = await crewApplicationDetail(+applicationId!);
        break;
      default:
        break;
    }

    if (res?.code === 200) {
      //@ts-ignore
      setData(res?.data);
      setCategoryList(res?.data?.accreditationCategoryList as ICategoryItem[]);
    }
  };

  useEffect(() => {
    getDetail();
  }, []);

  const tabItems = [
    true
      ? {
          key: 'accreditation',
          label: 'Accreditation',
          children: (
            <ApplicationDetailAccreditation categoryList={categoryList} />
          ),
        }
      : null,
  ].filter(Boolean);

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Application', path: PATHS.VENDOR_APPLICATION_LIST },
          { name: 'Application Detail', path: PATHS.VENDOR_APPLICATION_DETAIL },
        ]}
      />

      <ApplicationDetailHeader data={data!} refresh={getDetail} />

      <Access key="tab" accessible={true}>
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
            tabBarExtraContent={<></>}
          />
        </div>
      </Access>
    </>
  );
}
