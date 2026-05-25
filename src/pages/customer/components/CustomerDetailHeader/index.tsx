import { customerChange, customerDetail } from '@/api/customer';
import { projectAdd } from '@/api/project';
import { ICustomerRecord } from '@/api/types/customer';
import { getWaybillCount } from '@/api/waybill';
import CustomDetailHeader from '@/components/CustomDetailHeader';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import { CUSTOMER_LEADS_POOL, LAYOUT_HEADER_HEIGHT } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { CountryEnumLabelListMap, CustomerStatusEnumColor } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import ProjectModal from '@/pages/project/components/ProjectModal';
import { getTimeDiffText, isUndefinedOrNull } from '@/utils/utils';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  Access,
  history,
  useAccess,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { Affix, App, Button, Col, Row, Spin } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { EVENT_MAP } from '../../constants';
import { EVENT_CUSTOMER_DATA } from '../../events';
import CustomerModal from '../CustomerModal';
import TransferModal from '../TransferModal';
import styles from './styles.less';
import TransferHistoryCase from './TransferHistoryCase';

export default function CustomerDetailHeader() {
  const { publish } = useContext(PubSubContext);
  const access = useAccess();
  const [searchParams] = useSearchParams();
  const { message } = App.useApp();
  const { id: pageId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [detailData, setDetailData] = useState<ICustomerRecord>(
    {} as ICustomerRecord,
  );
  const [customerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [labelLevelList, setLabelLevelList] = useState<string[]>([]);
  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false);
  const [waybillCount, setWaybillCount] = useState<{
    firstDeliveryDate: string;
    latestDeliveryDate: string;
    waybillCount: number;
    ongoingWaybillCount: number;
  }>();
  const [countLoading, setCountLoading] = useState<boolean>(false);
  const fetchData = async () => {
    const payload = {
      id: +pageId!,
    };
    setLoading(true);
    const res = await customerDetail(payload);
    setLoading(false);
    if (res.code === 200) {
      const countryId = res.data?.country;
      // @ts-ignore
      const _labelLevelList = CountryEnumLabelListMap[countryId];
      setLabelLevelList(_labelLevelList);
      setDetailData(res.data);
      publish(EVENT_CUSTOMER_DATA, res?.data);
    }
  };

  const reload = () => {
    fetchData();
  };

  const handleEditFinish = async (values: any) => {
    setLoading(true);
    const res = await customerChange(values);
    setLoading(false);
    if (res.code === 200) {
      setCustomerModalOpen(false);
      message.success('Update customer successfully!');
      reload();
    }
  };

  const handleAddFinish = async (values: any) => {
    const {
      projectName,
      customerId,
      commodity,
      daysForPod,
      agreedStartTime,
      agreedEndTime,
      confirmationWindow,
      logisticsCategory,
      serviceCategory,
      logisticsFlow,
      distance,
      bu,
      buList,
      currentRequirementList,
      requirementType,
      potentialVolumeQuantity,
      potentialVolumeFrequency,
      requirementFrequency,
      serviceTruckTypeIds,
      creditTerms,
    } = values;
    const params = {
      projectName,
      customerId,
      commodity,
      daysForPod,
      agreedStartTime,
      agreedEndTime,
      confirmationWindow,
      logisticsCategory,
      serviceCategory,
      logisticsFlow,
      distance,
      bu,
      buList,
      currentRequirementList,
      requirementType,
      potentialVolumeQuantity,
      potentialVolumeFrequency,
      requirementFrequency,
      serviceTruckTypeIds,
      creditTerms,
    };
    setLoading(true);
    //@ts-ignore
    const res = await projectAdd(params);
    setLoading(false);
    if (res.code === 200) {
      setProjectModalOpen(false);
      message.success('Add project successfully!');
      reload();
      publish(EVENT_MAP.PROJECT_LIST_RELOAD);
    }
  };

  const fetchWaybillCount = async () => {
    setCountLoading(true);
    const res = await getWaybillCount({
      id: +pageId!,
      type: 'Customer',
    }).finally(() => {
      setCountLoading(false);
    });
    if (res.code === 200) {
      setWaybillCount(res.data);
    }
  };

  useEffect(() => {
    if (pageId) {
      fetchData();
      fetchWaybillCount();
    } else {
      // TODO: error page?
    }
  }, [pageId]);

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
                <Access
                  accessible={access[PermissionEnum.CUSTOMER_DETAIL_TRANSFER]}
                >
                  <Button onClick={() => setTransferModalOpen(true)}>
                    Transfer Customer
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.CUSTOMER_DETAIL_CREATE_PROJECT] &&
                    searchParams.get('from') !== CUSTOMER_LEADS_POOL
                  }
                >
                  <Button
                    type="primary"
                    onClick={() => setProjectModalOpen(true)}
                  >
                    Create Project
                  </Button>
                </Access>
              </div>
            </div>
          </Affix>
          {/*info detail*/}
          <CustomDetailHeader
            defaultExpand={true}
            showAvatar={true}
            avatar={detailData?.material?.fileThumbnailUrl}
            titleList={[
              { label: 'Customer Name', value: detailData?.customerName },
              {
                label: 'Status',
                value: detailData?.status,
                statusColor: CustomerStatusEnumColor[detailData?.status],
              },
            ]}
            titleExtra={
              <Access
                accessible={
                  access[PermissionEnum.CUSTOMER_DETAIL_EDIT] &&
                  searchParams.get('from') !== CUSTOMER_LEADS_POOL
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
                  <Col span={6}>
                    <ColCell
                      label="Contact Type"
                      value={detailData?.contactType}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Tag" value={detailData?.customerTag} />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Industry"
                      value={detailData?.industryName}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Office Address"
                      value={detailData?.address}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
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
                  <Col span={6}>
                    <ColCell
                      label="Reach Out Channel"
                      value={detailData?.reachOutChannel}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label={labelLevelList?.[0]}
                      value={detailData?.countryName}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label={labelLevelList?.[1]}
                      value={detailData?.padName}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <ColCell
                      label={labelLevelList?.[2]}
                      value={detailData?.sadName}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label={labelLevelList?.[3]}
                      value={detailData?.tadName}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Current Market Share"
                      value={`${
                        !isUndefinedOrNull(detailData?.currentMarketShareMin)
                          ? `${detailData?.currentMarketShareMin}%`
                          : ''
                      }${
                        !isUndefinedOrNull(detailData?.currentMarketShareMin) &&
                        !isUndefinedOrNull(detailData?.currentMarketShareMax)
                          ? '-'
                          : ''
                      }${
                        !isUndefinedOrNull(detailData?.currentMarketShareMax)
                          ? `${detailData?.currentMarketShareMax}%`
                          : ''
                      }${
                        isUndefinedOrNull(detailData?.currentMarketShareMin) &&
                        isUndefinedOrNull(detailData?.currentMarketShareMax)
                          ? '-'
                          : ''
                      }`}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Priority" value={detailData?.priority} />
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <ColCell label="Size" value={detailData?.size} />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Tax Mark"
                      value={detailData?.customerTaxMark}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Service Duration"
                      value={detailData?.serviceDuration}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="BU" value={detailData?.bu} />
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <ColCell
                      label={
                        <TransferHistoryCase
                          buId={detailData?.id}
                          fieldName="BD"
                        />
                      }
                      value={detailData?.bdUserAliasName}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label={
                        <TransferHistoryCase
                          buId={detailData?.id}
                          fieldName="CAM"
                        />
                      }
                      value={detailData?.camUserAliasName}
                    />
                  </Col>
                  <Col span={12}>
                    <ColCell
                      label="Creation time"
                      value={detailData?.createdAt}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <ColCell
                      loading={countLoading}
                      label="First Delivery Date"
                      value={
                        waybillCount?.firstDeliveryDate
                          ? `${waybillCount?.firstDeliveryDate} (${getTimeDiffText(waybillCount?.firstDeliveryDate)})`
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      loading={countLoading}
                      label="Latest Delivery Date"
                      value={
                        waybillCount?.latestDeliveryDate
                          ? `${waybillCount?.latestDeliveryDate} (${getTimeDiffText(waybillCount?.latestDeliveryDate)})`
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={12}>
                    <ColCell
                      loading={countLoading}
                      label="Total Trips"
                      value={`${
                        typeof waybillCount?.waybillCount === 'number' &&
                        !isNaN(waybillCount?.waybillCount)
                          ? waybillCount?.waybillCount
                          : '-'
                      } (${
                        typeof waybillCount?.ongoingWaybillCount === 'number' &&
                        !isNaN(waybillCount?.ongoingWaybillCount)
                          ? waybillCount?.ongoingWaybillCount
                          : '-'
                      } ongoing)`}
                    />
                  </Col>
                </Row>
              </>
            }
          />
        </div>
      </Spin>
      {customerModalOpen && (
        <CustomerModal
          title={'Edit Customer'}
          record={detailData}
          isEdit={true}
          open={customerModalOpen}
          onConfirm={handleEditFinish}
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
      <TransferModal
        open={transferModalOpen}
        customerIds={[+pageId!]}
        onCancel={() => setTransferModalOpen(false)}
        onConfirm={() => {
          setTransferModalOpen(false);
          reload();
        }}
        bdUserRoleIds={[detailData?.bdUserRoleId]}
        camUserRoleIds={[detailData?.camUserRoleId]}
      />
      <ProjectModal
        title="Create Project"
        isEdit={false}
        open={projectModalOpen}
        customerDetail={detailData}
        onConfirm={handleAddFinish}
        modalProps={{
          okText: 'Confirm',
          onCancel: () => {
            setProjectModalOpen(false);
            fetchData();
          },
        }}
        submitter={{
          submitButtonProps: {
            loading: loading,
          },
        }}
      />
    </>
  );
}
