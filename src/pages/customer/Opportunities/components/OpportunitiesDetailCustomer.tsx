import { customerChange, customerDetail } from '@/api/customer';
import { leadDetail } from '@/api/lead';
import { opportunityDetailCustomer } from '@/api/opportunity';
import { IOpportunityDetailCustomerData } from '@/api/types/opportunity';
import { InfoListCase } from '@/components/DetailCase';
import PubSubContext from '@/context/pubsub';
import {
  OpportunitiesLeadStatusEnumTextColor,
  OpportunitiesStatusEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import DetailCard from '@/pages/waybill/components/DetailCard';
import { useAccess, useParams } from '@umijs/max';
import { App, Badge, Image } from 'antd';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import defaultURL from '../../../../../public/svg/default-sku.svg';
import CreateLeadModal from '../../LeadsPool/components/CreateLeadModal';
import CustomerModal from '../../components/CustomerModal';
import { EVENT_OPPORTUNITY_RECORD_RELOAD } from '../event';
import { StateContext } from '../store';
import CustomerContactInfo from './CustomerContactInfo';
import styles from './styles.less';

const DEFAULT_URL = defaultURL;

export default memo(function OpportunitiesDetailCustomer() {
  const { subscribe } = useContext(PubSubContext);
  const access = useAccess();
  const { message } = App.useApp();
  // @ts-ignore
  const { state } = useContext(StateContext);
  const { id: opportunityId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<IOpportunityDetailCustomerData>(
    {} as IOpportunityDetailCustomerData,
  );
  const [leadDetailData, setLeadDetailData] = useState<any>({});
  const [customerData, setCustomerData] = useState<any>({});
  const customerDetailRef = useRef<any>({});
  const [createLeadModalOpen, setCreateLeadModalOpen] =
    useState<boolean>(false);
  const [customerModalOpen, setCustomerModalOpen] = useState<boolean>(false);

  const getCustomerDetail = async () => {
    setLoading(true);
    const customerRes = await opportunityDetailCustomer(
      Number(opportunityId),
    ).finally(() => {
      setLoading(false);
    });
    if (customerRes.code === 200) {
      customerDetailRef.current = customerRes.data;
      setDetail(customerRes.data);
    }
  };

  const customerConfirm = async (values: any) => {
    setLoading(true);
    const res = await customerChange(values);
    setLoading(false);
    if (res.code === 200) {
      setCustomerModalOpen(false);
      message.success('Edit customer successfully!');
      getCustomerDetail();
    }
  };

  const handleEdit = async (record: IOpportunityDetailCustomerData) => {
    setLoading(true);
    if (record.isCustomer) {
      const res = await customerDetail({
        id: record.customerId,
      });
      setLoading(false);
      if (res.code === 200) {
        setCustomerData(res.data);
        setCustomerModalOpen(true);
      }
    } else {
      const res = await leadDetail({
        id: record.leadId,
      });
      setLoading(false);
      if (res.code === 200) {
        setLeadDetailData({
          ...res.data,
          industryIdList: [
            res.data?.industryFirstId,
            res.data?.industrySecondId,
          ],
        });
        setCreateLeadModalOpen(true);
      }
    }
  };

  const confirmCreateLead = async () => {
    setCreateLeadModalOpen(false);
    getCustomerDetail();
  };

  useEffect(() => {
    getCustomerDetail();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_OPPORTUNITY_RECORD_RELOAD, () => {
      getCustomerDetail();
    });

    return unsubscribe;
  }, []);

  return (
    <div className={styles.header_info}>
      <DetailCard
        title="Customer Information"
        editCallback={() => {
          handleEdit(customerDetailRef.current);
        }}
        loading={loading}
        showEditBtn={
          ![
            OpportunitiesStatusEnum.SUCCESSFUL_CLOSED,
            OpportunitiesStatusEnum.LOST,
            OpportunitiesStatusEnum.CANCELED,
          ].includes(state?.opportunityDetail?.opportunityStatus) &&
          access[PermissionEnum.OPPORTUNITY_DETAIL_CUSTOMER_EDIT]
        }
        hideBorder={true}
        child={
          <div className={styles.header_customer}>
            <div className={styles.header_customer_title}>
              <div className={styles.header_customer_left}>
                <Image
                  width={64}
                  src={
                    detail?.logo?.fileThumbnailUrl
                      ? detail.logo?.fileThumbnailUrl
                      : DEFAULT_URL
                  }
                />
                <div className={styles.header_customer_title_item}>
                  <div className={styles.header_customer_title_label}>
                    Customer name
                  </div>
                  <div className={styles.header_customer_title_value}>
                    {detail.customerName}
                  </div>
                </div>
                <div className={styles.header_customer_title_item}>
                  <div className={styles.header_customer_title_label}>
                    Status
                  </div>
                  <div className={styles.header_customer_title_value}>
                    <Badge
                      color={
                        OpportunitiesLeadStatusEnumTextColor[
                          detail?.isCustomer
                            ? detail.customerStatus
                            : detail.leadStatus
                        ]
                      }
                      text={
                        detail?.isCustomer
                          ? detail.customerStatus
                          : detail.leadStatus
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.header_customer_line}></div>
            <InfoListCase
              justify="start"
              infoList={[
                { label: 'Customer Type', value: detail.customerType },
                {
                  label: 'Tag',
                  value: detail.customerTag ? detail.customerTag : '-',
                },
                {
                  label: 'Industry',
                  value: detail.industryName ? detail.industryName : '-',
                },
                {
                  label: 'Office Address',
                  popover: true,
                  value: detail.address ? detail.address : '-',
                },
                {
                  label: 'Website',
                  value: detail?.website ? (
                    <a
                      href={
                        /^https?:\/\//i.test(detail?.website)
                          ? detail?.website
                          : `https://${detail?.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {detail?.website}
                    </a>
                  ) : (
                    '-'
                  ),
                  valueColor: detail.website ? '#1AA391' : '#262626',
                  pointer: true,
                  popover: true,
                },
                {
                  label: 'Reach Out Channel',
                  value: detail.reachOutChannel ? detail.reachOutChannel : '-',
                },
                {
                  label: 'Priority',
                  value: detail.priority ? detail.priority : '-',
                },
              ]}
            />
            {detail.contactList?.length ? (
              <div>
                <div className={styles.header_customer_line}></div>
                <CustomerContactInfo data={detail} />
              </div>
            ) : null}
          </div>
        }
      />
      {createLeadModalOpen && (
        <CreateLeadModal
          title={'Edit Lead'}
          open={createLeadModalOpen}
          record={leadDetailData}
          onConfirm={confirmCreateLead}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => setCreateLeadModalOpen(false),
          }}
        />
      )}
      {customerModalOpen && (
        <CustomerModal
          title={'Edit Customer'}
          record={customerData}
          isEdit={true}
          open={customerModalOpen}
          onConfirm={customerConfirm}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setCustomerModalOpen(false);
              setCustomerData({});
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: loading,
            },
          }}
        />
      )}
    </div>
  );
});
