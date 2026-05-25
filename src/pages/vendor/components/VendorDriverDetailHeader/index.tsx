import { getDriverDetail } from '@/api/truck';
import { IAddDriverParams, IDriverListItem } from '@/api/types/truck';
import DetailHeader from '@/components/DetailHeader';
import { LAYOUT_HEADER_HEIGHT } from '@/constants';
import { VendorDriveStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import DriverModal from '@/pages/vendor/components/DriverModal';
import DriverTransferModal from '@/pages/vendor/components/DriverTransferModal';
import styles from '@/pages/vendor/components/VendorDetailHeader/styles.less';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Access,
  history,
  useAccess,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { Affix, Button, Spin } from 'antd';
import { memo, useEffect, useState } from 'react';
import DriverMarkModal from '../DriverMarkModal';

export default memo(function VendorTruckDetailHeader(props: {
  refresh: boolean;
}) {
  const access = useAccess();
  const { id: driverId } = useParams();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [formDefaultValue, setFormDefaultValue] = useState<IAddDriverParams>(
    {} as IAddDriverParams,
  );
  const [detail, setDetail] = useState<IDriverListItem>({} as IDriverListItem);
  const [showDriverMark, setShowDriverMark] = useState<string>('');
  const [driverAccredited, setDriverAccredited] = useState<boolean>(true);
  const [driverEnable, setDriverEnable] = useState<boolean>(true);

  const getDetail = async () => {
    setLoading(true);
    const res = await getDriverDetail({
      id: Number(driverId),
    });
    setLoading(false);
    if (res?.code === 200) {
      setDetail(res.data);
    }
  };

  const editHandle = () => {
    setFormDefaultValue({
      id: detail.id,
      driverName: detail.driverName,
      licenseNumber: detail.licenseNumber || '',
      contactPhoneNum: detail.contactPhoneNum || '',
      vendorId: detail.vendorId,
      vendorName: detail.vendorName,
      countryId: detail.countryId,
      phoneCode: detail.phoneCode,
      phoneCodeId: detail.phoneCodeId,
      reason: detail.markReason,
    });
    setShowAddModal(true);
  };

  const approvalHandle = async () => {
    setDriverAccredited(true);
    setShowDriverMark('Confirm this driver access');
  };

  const blockHandle = async () => {
    setDriverAccredited(false);
    setDriverEnable(false);
    setShowDriverMark('Confirm to block this Driver');
  };

  const unblockHandle = async () => {
    setDriverAccredited(false);
    setDriverEnable(true);
    setShowDriverMark('Confirm to unblock this Driver');
  };

  useEffect(() => {
    getDetail();
  }, [props.refresh]);

  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          {/*top function btn*/}
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            <div className={styles.header_top}>
              <div className={styles.header_top_left}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  disabled={!!searchParams.get('type')}
                  onClick={() => history.back()}
                >
                  Back
                </Button>
              </div>
              <div className={styles.header_top_right}>
                {detail.status === VendorDriveStatusEnum.ACCREDITED ? (
                  <Access
                    key="Block"
                    accessible={
                      access[
                        PermissionEnum.DRIVER_DETAIL_HELPER_BLOCK_AND_UNBLOCK
                      ]
                    }
                  >
                    <Button
                      onClick={blockHandle}
                      style={{ color: '#F28532', borderColor: '#F28532' }}
                    >
                      Block
                    </Button>
                  </Access>
                ) : null}
                {detail.status === VendorDriveStatusEnum.BLOCKED ? (
                  <Access
                    key="Unblock"
                    accessible={
                      access[
                        PermissionEnum.DRIVER_DETAIL_HELPER_BLOCK_AND_UNBLOCK
                      ]
                    }
                  >
                    <Button
                      type="primary"
                      onClick={unblockHandle}
                      style={{
                        backgroundColor: '#F28532',
                        boxShadow: '0 2px 0 rgba(242, 133, 50, 0.25)',
                      }}
                    >
                      Unblock
                    </Button>
                  </Access>
                ) : null}
                <Access
                  key="transferDriver"
                  accessible={access[PermissionEnum.DRIVER_DETAIL_TRANSFER]}
                >
                  <Button
                    onClick={() => setShowTransferModal(true)}
                    style={{ color: '#009688', borderColor: '#009688' }}
                  >
                    Transfer Driver
                  </Button>
                </Access>
                {detail.status === VendorDriveStatusEnum.UNACCREDITED ? (
                  <Access
                    key="accreditationApproval"
                    accessible={
                      access[PermissionEnum.DRIVER_DETAIL_ATTRIBUTION_APPROVAL]
                    }
                  >
                    <Button onClick={approvalHandle} type="primary">
                      Accreditation Approval
                    </Button>
                  </Access>
                ) : null}
              </div>
            </div>
          </Affix>
          {/*info detail*/}
          <DetailHeader
            headerName="Driver Name"
            headerTitle={detail.driverName}
            editClick={editHandle}
            infoList={[
              {
                label: 'License Number',
                value: detail.licenseNumber ? detail.licenseNumber : '-',
              },
              { label: 'Status', value: detail.status },
              {
                label: 'Contact',
                value: detail.phoneCode + detail.contactPhoneNum,
              },
              { label: 'Vendor Name', value: detail.vendorName },
              { label: 'Mark', value: detail.mark || '-' },
            ]}
            showEdit={access[PermissionEnum.DRIVER_DETAIL_EDIT]}
          />
        </div>
        {!!showDriverMark ? (
          <DriverMarkModal
            detailId={detail.id}
            driverAccredited={driverAccredited}
            tagText={showDriverMark}
            enable={driverEnable}
            hideModal={() => {
              setShowDriverMark('');
            }}
            refresh={getDetail}
          />
        ) : null}
        {showAddModal ? (
          <DriverModal
            formDefaultValue={formDefaultValue}
            hideModal={() => {
              setShowAddModal(false);
              setFormDefaultValue({} as IDriverListItem);
            }}
            vendorDetail={detail}
            refresh={getDetail}
          />
        ) : null}
        {showTransferModal ? (
          <DriverTransferModal
            driverIds={[detail.id]}
            onCancel={() => setShowTransferModal(false)}
            onConfirm={() => {
              setShowTransferModal(false);
              getDetail();
            }}
          />
        ) : null}
      </Spin>
    </>
  );
});
