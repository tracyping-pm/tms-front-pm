import { leadDetail } from '@/api/lead';
import { ILeadDetail } from '@/api/types/lead';
import CustomDetailHeader from '@/components/CustomDetailHeader';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import { LabelCase, ValueCase } from '@/components/CustomDetailHeader/ViewCase';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { LeadStatusEnum, LeadStatusEnumTextColor } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import {
  EVENT_LEAD_DATA,
  EVENT_LEAD_DETAIL_RELOAD,
} from '@/pages/customer/events';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Access,
  history,
  useAccess,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { Affix, Button, Col, Row, Space, Spin } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { ReactComponent as IconContact } from '../../../../../../public/svg/role/contact.svg';
import CustomerModal from '../CreateLeadModal';
import styles from './styles.less';

export default function LeadDetailHeader() {
  const access = useAccess();
  const { publish, subscribe } = useContext(PubSubContext);
  const [searchParams] = useSearchParams();
  const { id: pageId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detailData, setDetailData] = useState<ILeadDetail>({} as ILeadDetail);
  const [customerModalOpen, setCustomerModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await leadDetail({
      id: +pageId!,
    });
    setLoading(false);
    if (res.code === 200) {
      setDetailData({
        ...res.data,
        industryIdList: [res.data?.industryFirstId, res.data?.industrySecondId],
      });
      publish(EVENT_LEAD_DATA, res?.data);
    }
  };

  const reload = () => {
    fetchData();
  };

  useEffect(() => {
    if (pageId) {
      fetchData();
    }
  }, [pageId]);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_LEAD_DETAIL_RELOAD, () => {
      fetchData();
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          {/*top function btn*/}
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            <div className={styles.header_top}>
              <div
                className={styles.header_top_left}
                onClick={() => {
                  if (searchParams.get('back') === 'true') {
                    history.go(-2);
                  } else {
                    history.back();
                  }
                }}
              >
                <Button icon={<ArrowLeftOutlined />}>Back</Button>
              </div>
              <div className={styles.header_top_right}>
                {detailData.customerId && (
                  <Button
                    type="primary"
                    onClick={() =>
                      history.push(
                        `${PATHS.CUSTOMER_DETAIL_BASE}/${detailData.customerId}`,
                      )
                    }
                  >
                    Associated Customer
                  </Button>
                )}
              </div>
            </div>
          </Affix>
          <CustomDetailHeader
            defaultExpand={true}
            showAvatar={true}
            avatar={detailData?.logo?.fileThumbnailUrl}
            titleList={[
              { label: 'Customer Name', value: detailData?.customerName },
              {
                label: 'Status',
                value: detailData?.leadStatus,
                statusColor: LeadStatusEnumTextColor[detailData?.leadStatus],
              },
            ]}
            titleExtra={
              <Access
                accessible={
                  access[PermissionEnum.LEAD_POOL_EDIT] &&
                  detailData.leadStatus !== LeadStatusEnum.SUCCESSFUL_CLOSED
                }
              >
                <Button type="link" onClick={() => setCustomerModalOpen(true)}>
                  Edit
                </Button>
              </Access>
            }
            content={
              <>
                <Row>
                  <Col span={8}>
                    <ColCell
                      label="Customer Tag"
                      value={detailData?.customerTag}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Industry"
                      value={`${detailData?.industryFirstName ? detailData?.industryFirstName + ' / ' : ''}${detailData?.industrySecondName || '-'}`}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Office Address"
                      value={`${detailData?.padName ? `${detailData?.padName} ` : ''}${detailData?.sadName ? `${detailData?.sadName} ` : ''}${detailData?.tadName ? `${detailData?.tadName} ` : ''}${detailData?.address ? `${detailData?.address} ` : ''}`}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <ColCell label="Priority" value={detailData?.priority} />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Reach Out Channel"
                      value={detailData?.reachOutChannel}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Website"
                      value={
                        detailData?.website ? (
                          <a
                            href={
                              /^https?:\/\//i.test(detailData?.website)
                                ? detailData?.website
                                : `https://${detailData?.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {detailData?.website}
                          </a>
                        ) : (
                          '-'
                        )
                      }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <ColCell label="BU" value={detailData?.bu} />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="PIC"
                      value={`${detailData.picType ? detailData.picType + '：' : ''}${detailData?.picUserAliasName || '-'}`}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Creation time"
                      value={detailData?.createdAt}
                    />
                  </Col>
                </Row>
              </>
            }
            extraInfo={
              detailData.contactList && (
                <Space size={24} align="start">
                  <IconContact />
                  <Space size={100} align="start">
                    <Space size={12} align="start">
                      <Space direction="vertical" size={8}>
                        <LabelCase>Name</LabelCase>
                        <ValueCase>
                          <Space direction="vertical" size={8}>
                            {detailData.contactList?.map((item) => (
                              <span key={item.name}>{item.name || '-'}</span>
                            ))}
                          </Space>
                        </ValueCase>
                      </Space>
                      <Space direction="vertical" size={8}>
                        <LabelCase>Position</LabelCase>
                        <ValueCase>
                          <Space direction="vertical" size={8}>
                            {detailData.contactList?.map((item) => (
                              <span key={item.name}>
                                {item.position || '-'}
                              </span>
                            ))}
                          </Space>
                        </ValueCase>
                      </Space>
                    </Space>

                    <Space size={24} align="start">
                      <Space direction="vertical" size={8}>
                        <LabelCase>Email</LabelCase>
                        <ValueCase>
                          <Space direction="vertical" size={8}>
                            {detailData.contactList?.map((item) => (
                              <span key={item.name}>{item.email || '-'}</span>
                            ))}
                          </Space>
                        </ValueCase>
                      </Space>
                      <Space direction="vertical" size={8}>
                        <LabelCase>Phone</LabelCase>
                        <ValueCase>
                          <Space direction="vertical" size={8}>
                            {detailData.contactList?.map((item) => (
                              <span key={item.name}>
                                {item.phoneNumber
                                  ? `${item.phoneCode} ${item.phoneNumber}`
                                  : '-'}
                              </span>
                            ))}
                          </Space>
                        </ValueCase>
                      </Space>
                    </Space>
                  </Space>
                </Space>
              )
            }
          />
        </div>
      </Spin>
      {customerModalOpen && (
        <CustomerModal
          title={'Edit Lead'}
          record={detailData}
          open={customerModalOpen}
          onConfirm={() => {
            reload();
            setCustomerModalOpen(false);
          }}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => setCustomerModalOpen(false),
          }}
          submitter={{
            submitButtonProps: {
              loading: loading,
            },
          }}
        />
      )}
    </>
  );
}
