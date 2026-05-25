import { IAddVendorParams, IVendorDetail } from '@/api/types/vendor';
import {
  getVendorDetail,
  procurementLog,
  vendorDetailApproval,
  vendorDetailReaccredit,
  vendorDetailTerminate,
} from '@/api/vendor';
import { LAYOUT_HEADER_HEIGHT } from '@/constants';
import {
  ApplicationTypeEnum,
  CountryEnumLabelListMap,
  CountryMapEnum,
  VendorStatusEnum,
  VendorStatusEnumColor,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import styles from '@/pages/vendor/components/VendorDetailHeader/styles.less';
import VendorModal from '@/pages/vendor/components/VendorModal';
import VendorTransferModal from '@/pages/vendor/components/VendorTransferModal';
import { formatAmount, getTimeDiffText } from '@/utils/utils';
import { ArrowLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Access, history, useAccess, useParams } from '@umijs/max';
import { Affix, App, Badge, Button, Col, Row, Spin } from 'antd';
import { memo, useCallback, useEffect, useState } from 'react';

import { checkUnderReview } from '@/api/application';
import { getWaybillCount } from '@/api/waybill';
import CustomDetailHeader from '@/components/CustomDetailHeader';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import OperationLogModal, {
  initialOperationLogModalState,
  IOperationLogModalState,
} from '@/components/OperationLogModal';
import { useSetState } from 'ahooks';
import ApprovalMarkModal from './ApprovalMarkModal';

export default memo(function VendorDetailHeader(props: {
  setVendorStatus: (s: string) => void;
  setRecordFresh: (s: boolean) => void;
  setData: (s: IVendorDetail) => void;
  detailRefresh: boolean;
  recordFresh: boolean;
}) {
  const access = useAccess();
  const { message, modal } = App.useApp();
  const {
    setVendorStatus,
    detailRefresh,
    recordFresh,
    setRecordFresh,
    setData,
  } = props;
  const { id: vendorId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showApprovalOpen, setShowApprovalOpen] = useState<boolean>(false);
  const [showApprovalLoading, setShowApprovalLoading] =
    useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [vendorDetail, setVendorDetail] = useState<IVendorDetail>(
    {} as IVendorDetail,
  );
  const [labelLevelList, setLabelLevelList] = useState<string[]>([]);
  const [approvalRecord, setApprovalRecord] = useState<{
    id: number;
    number: string;
    type: string;
  }>();
  const [waybillCount, setWaybillCount] = useState<{
    firstDeliveryDate: string;
    latestDeliveryDate: string;
    waybillCount: number;
    ongoingWaybillCount: number;
  }>();
  const [countLoading, setCountLoading] = useState<boolean>(false);
  const [formDefaultValue, setFormDefaultValue] =
    useState<IAddVendorParams | null>(null);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);

  const getDetail = async () => {
    setLoading(true);
    const res = await getVendorDetail(Number(vendorId));
    if (res.code === 200) {
      const countryId = res.data?.country as CountryMapEnum;
      const newLabelLevelList = CountryEnumLabelListMap[countryId];
      setLabelLevelList(newLabelLevelList);
      setVendorDetail(res.data);
      setData?.(res.data);
      setVendorStatus(res?.data?.status);
    }
    setLoading(false);
  };

  const fetchWaybillCount = async () => {
    setCountLoading(true);
    const res = await getWaybillCount({
      id: +vendorId!,
      type: 'Vendor',
    }).finally(() => {
      setCountLoading(false);
    });
    if (res.code === 200) {
      setWaybillCount(res.data);
    }
  };

  const handleReaccreditOrApproval = async (
    type: 'Reaccredit' | 'Approval',
  ) => {
    setShowApprovalLoading(true);
    const res = await checkUnderReview({
      type: ApplicationTypeEnum.VENDOR,
      bizIdentifier: vendorDetail.vendorName,
    });

    if (res.code === 200) {
      if (res.data) {
        setShowApprovalOpen(true);
        setApprovalRecord({ ...res.data, type });
        setShowApprovalLoading(false);
      } else {
        const approvalRes =
          type === 'Approval'
            ? await vendorDetailApproval({
                id: Number(vendorId),
                enable: true,
              })
            : await vendorDetailReaccredit({ id: Number(vendorId) });
        setShowApprovalLoading(false);
        if (approvalRes.code === 200) {
          message.success('Approval successfully!');
          getDetail();
        }
      }
    } else {
      setShowApprovalLoading(false);
    }
  };

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await procurementLog({
      entityId: Number(vendorId),
      entityType: ApplicationTypeEnum.VENDOR,
    }).finally(() => {
      setOperationLogModalState({ loading: false });
    });
    if (res.code === 200) {
      const list =
        res.data?.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          description: item.description,
          operator: item.operator,
        })) ?? [];
      setOperationLogModalState({ list, open: true });
    }
  }, [vendorId]);

  // const checkBlock = async () => {
  //   const res = await checkVendorBlock({
  //     id: Number(vendorId),
  //   });
  //   if (res.code === 200) {
  //     if (res.data) {
  //       setBlockEnable(true);
  //       setShowBlockMark('Confirm to block this vendor');
  //     } else {
  //       setBlockEnable(true);
  //       setShowBlockMark(
  //         'Confirm to block the vendor who participated in the active project',
  //       );
  //     }
  //   }
  // };

  // 编辑
  const handleEdit = () => {
    setFormDefaultValue({
      id: vendorDetail.id,
      vendorName: vendorDetail.vendorName,
      vendorTag: vendorDetail.vendorTag,
      vendorType: vendorDetail.vendorType,
      garageLocation: vendorDetail.garageLocation,
      countryName: vendorDetail.countryName,
      country: vendorDetail.country,
      pad: vendorDetail.pad,
      sad: vendorDetail.sad,
      tad: vendorDetail.tad,
      taxMark: vendorDetail.taxMark,
      tinNumber: vendorDetail.tinNumber,
      listOfServices: vendorDetail?.listOfServices,
      reason: vendorDetail?.markReason,
      email: vendorDetail?.email,
    });
    setShowEditModal(true);
  };
  const onTerminateHandle = () => {
    modal.confirm({
      title: 'Terminate Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to terminate this vendor',
      okText: 'Confirm Terminate',
      cancelText: 'Cancel',
      onOk: async () => {
        const payload = {
          id: Number(vendorId),
        };
        const res = await vendorDetailTerminate(payload);

        if (res.code === 200) {
          message.success(`Terminate success!`);
          getDetail();
        }
      },
      onCancel() {
        // do nothing
      },
    });
  };

  useEffect(() => {
    getDetail();
    fetchWaybillCount();
  }, [detailRefresh]);

  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          {/*top function btn*/}
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            <div className={styles.header_top}>
              <div
                className={styles.header_top_left}
                onClick={() => history.back()}
              >
                <Button icon={<ArrowLeftOutlined />}>Back</Button>
              </div>
              <div className={styles.header_top_right}>
                {/* {vendorDetail.status === VendorStatusEnum.ACCREDITED ? (
                  <Access
                    accessible={
                      access[PermissionEnum.VENDOR_DETAIL_BLOCK_AND_UNBLOCK]
                    }
                  >
                    <Button
                      onClick={checkBlock}
                      style={{ color: '#F28532', borderColor: '#F28532' }}
                    >
                      Block
                    </Button>
                  </Access>
                ) : null} */}
                {/* {vendorDetail.status === VendorStatusEnum.BLOCKED ? (
                  <Access
                    accessible={
                      access[PermissionEnum.VENDOR_DETAIL_BLOCK_AND_UNBLOCK]
                    }
                  >
                    <Button
                      type="primary"
                      onClick={() => {
                        setBlockEnable(false);
                        setShowBlockMark('Confirm to unblock this vendor');
                      }}
                      style={{
                        backgroundColor: '#F28532',
                        boxShadow: '0 2px 0 rgba(242, 133, 50, 0.25)',
                      }}
                    >
                      Unblock
                    </Button>
                  </Access>
                ) : null} */}
                <Button
                  onClick={fetchLogList}
                  loading={operationLogModalState.loading}
                >
                  Operation Log
                </Button>
                <Access
                  accessible={access[PermissionEnum.VENDOR_DETAIL_TERMINATE]}
                >
                  {vendorDetail.status === VendorStatusEnum.ACCREDITED ? (
                    <Button
                      onClick={() => {
                        onTerminateHandle();
                      }}
                      className={styles.terminateBtn}
                    >
                      Terminate
                    </Button>
                  ) : null}
                </Access>

                <Access
                  accessible={access[PermissionEnum.VENDOR_DETAIL_REACCREDIT]}
                >
                  {vendorDetail.status === VendorStatusEnum.TERMINATED ? (
                    <Button
                      type="primary"
                      onClick={() => {
                        handleReaccreditOrApproval('Reaccredit');
                      }}
                      loading={showApprovalLoading}
                      className={styles.reaccreditBtn}
                    >
                      Reaccredit
                    </Button>
                  ) : null}
                </Access>

                <Access
                  accessible={access[PermissionEnum.VENDOR_DETAIL_TRANSFER]}
                >
                  <Button
                    onClick={() => setShowTransferModal(true)}
                    className={styles.transferBtn}
                  >
                    Transfer Vendor
                  </Button>
                </Access>

                <Access
                  accessible={
                    access[PermissionEnum.VENDOR_DETAIL_ACCREDITATION_APPROVAL]
                  }
                >
                  {vendorDetail.status === VendorStatusEnum.UNACCREDITED ? (
                    <Button
                      onClick={() => {
                        handleReaccreditOrApproval('Approval');
                      }}
                      type="primary"
                      loading={showApprovalLoading}
                    >
                      Accreditation Approval
                    </Button>
                  ) : null}
                </Access>
              </div>
            </div>
          </Affix>
          <CustomDetailHeader
            defaultExpand={true}
            titleList={[
              { label: 'Vendor Name', value: vendorDetail?.vendorName },
            ]}
            titleExtra={
              <Access accessible={access[PermissionEnum.VENDOR_DETAIL_EDIT]}>
                <Button type="link" onClick={() => handleEdit()}>
                  Edit
                </Button>
              </Access>
            }
            content={
              <>
                <Row>
                  <Col span={8}>
                    <ColCell
                      label="Accreditation Status"
                      value={
                        <Badge
                          color={
                            VendorStatusEnumColor[
                              vendorDetail.status as VendorStatusEnum
                            ]
                          }
                          text={vendorDetail.status}
                        />
                      }
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell label="Tag" value={vendorDetail.vendorTag} />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Vendor Type"
                      value={vendorDetail.vendorType}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <ColCell
                      label={labelLevelList?.[0]}
                      value={vendorDetail.countryName}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label={labelLevelList?.[1]}
                      value={vendorDetail.padName}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label={labelLevelList?.[2]}
                      value={vendorDetail.sadName}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <ColCell
                      label={labelLevelList?.[3]}
                      value={vendorDetail.tadName}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Trucks"
                      value={
                        formatAmount(vendorDetail.trucks)
                          ? formatAmount(vendorDetail.trucks)
                          : 0
                      }
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Procurement PIC"
                      value={vendorDetail.bdUserName}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <ColCell label="Tax Mark" value={vendorDetail.taxMark} />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Tin Number"
                      value={vendorDetail.tinNumber}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Creation time"
                      value={vendorDetail.createdAt}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <ColCell
                      label="Garage Location"
                      value={vendorDetail.garageLocation}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell label="Email" value={vendorDetail.email} />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="List of Services"
                      value={vendorDetail.listOfServices}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
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
                  <Col span={8}>
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
                  <Col span={8}>
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
      {/* {!!showBlockMark ? (
        <BlockMarkModal
          tagText={showBlockMark}
          blockEnable={blockEnable}
          vendorId={Number(vendorId)}
          hideModal={() => {
            setShowBlockMark('');
          }}
          refresh={getDetail}
        />
      ) : null} */}

      {showApprovalOpen ? (
        <ApprovalMarkModal
          id={Number(vendorId)}
          record={approvalRecord!}
          hideModal={() => {
            setShowApprovalOpen(false);
          }}
          refresh={getDetail}
        />
      ) : null}

      {showEditModal ? (
        <VendorModal
          formDefaultValue={formDefaultValue}
          hideModal={() => {
            setShowEditModal(false);
            setFormDefaultValue(null);
          }}
          refresh={getDetail}
        />
      ) : null}

      {showTransferModal ? (
        <VendorTransferModal
          vendorIds={[vendorDetail.id]}
          bdUserRoleIds={[vendorDetail.bdUserRoleId]}
          onCancel={() => setShowTransferModal(false)}
          onConfirm={() => {
            setShowTransferModal(false);
            setRecordFresh(!recordFresh);
            getDetail();
          }}
        />
      ) : null}
      <OperationLogModal
        showOperator={true}
        list={operationLogModalState.list}
        open={operationLogModalState.open}
        onConfirm={() => setOperationLogModalState({ open: false })}
        onCancel={() => setOperationLogModalState({ open: false })}
      />
    </>
  );
});
