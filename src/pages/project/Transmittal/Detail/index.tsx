import { transmittalDetail } from '@/api/transmittal';
import { ITransmittalDetail } from '@/api/types/transmittal';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import CustomTabs from '@/components/CustomTabs';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import { TransmittalStatusEnum } from '@/enums';
import { useParams } from '@umijs/max';
import { useCallback, useEffect, useState } from 'react';
import AssociatedWaybill from '../components/AssociatedWaybill';
import Proof from '../components/Proof';
import TransmittalDetailHeader from '../components/TransmittalDetailHeader';
import styles from './styles.less';

const SubtaskDetail = () => {
  const { id: transmittalId } = useParams();
  const [tabKey, setTabKey] = useState<string>('associated');
  const [detail, setDetail] = useState<ITransmittalDetail>(
    {} as ITransmittalDetail,
  );
  const [loading, setLoading] = useState<boolean>(false);

  const getDetail = useCallback(async () => {
    setLoading(true);
    const res = await transmittalDetail({ id: +transmittalId! }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDetail(res.data || {});
    }
    setLoading(false);
  }, [transmittalId]);

  useEffect(() => {
    getDetail();
  }, [transmittalId]);

  const tabItems = [
    {
      key: 'associated',
      label: 'Associated Waybill',
      children: <AssociatedWaybill />,
    },
    detail.status === TransmittalStatusEnum.CONFIRMED
      ? {
          key: 'proof',
          label: 'Proof',
          children: <Proof />,
        }
      : null,
  ].filter(Boolean) as any;

  return (
    <>
      <BreadcrumbCase
        items={[
          { name: 'Transmittal', path: PATHS.TRANSMITTAL_LIST },
          { name: 'Transmittal Detail', path: PATHS.TRANSMITTAL_LIST_DETAIL },
        ]}
      />

      <TransmittalDetailHeader
        loading={loading}
        detail={detail}
        getDetail={getDetail}
      />
      <div className={styles.content}>
        <CustomTabs
          defaultActiveKey={tabKey}
          tabBarGutter={60}
          items={tabItems}
          size="large"
          onChange={(key: string) => setTabKey(key)}
          useSticky
          offsetTop={LAYOUT_HEADER_HEIGHT + 82}
          tabBarExtraContent={false}
        />
      </div>
    </>
  );
};

export default SubtaskDetail;
