import {
  applicationReviewApprove,
  applicationReviewReject,
} from '@/api/application';
import { getTruckTypeList } from '@/api/truck';
import {
  ICrewApplicationDetailRecord,
  ITruckApplicationDetailRecord,
  IVendorApplicationDetailRecord,
} from '@/api/types/application';
import { ITruckTypeListItem } from '@/api/types/truck';
import CustomDetailHeader from '@/components/CustomDetailHeader';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import {
  ApplicationStatusEnum,
  ApplicationStatusEnumColor,
  ApplicationStatusEnumText,
  ApplicationTypeEnum,
  CrewTypeEnum,
} from '@/enums';
import DetailCard from '@/pages/waybill/components/DetailCard';
import { formatAmount } from '@/utils/utils';
import { ArrowLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { history, useParams } from '@umijs/max';
import { Affix, App, Badge, Button, Col, Row, Spin } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';
import RejectModal from './RejectModal';

const borderWrapStyle: React.CSSProperties = {
  border: '0.5px solid #f0f0f0',
  borderRight: 'none',
  borderBottom: 'none',
};

const changedStyle: React.CSSProperties = {
  color: '#1677ff',
};

type IData =
  | IVendorApplicationDetailRecord
  | ICrewApplicationDetailRecord
  | ITruckApplicationDetailRecord;

export const isVendorApplication = (
  d?: IData,
): d is IVendorApplicationDetailRecord => {
  return d?.type === ApplicationTypeEnum.VENDOR;
};

const isCrewApplication = (d?: IData): d is ICrewApplicationDetailRecord =>
  d?.type === ApplicationTypeEnum.CREW;

const isTruckApplication = (d?: IData): d is ITruckApplicationDetailRecord =>
  d?.type === ApplicationTypeEnum.TRUCK;

interface IProps {
  refresh: () => void;
  data: IData;
}
export default function ApplicationDetailHeader({ data, refresh }: IProps) {
  // const access = useAccess();
  const { message, modal } = App.useApp();
  const { id: applicationId } = useParams();
  const [detail, setDetail] = useState<IData>();
  const [truckTypeList, setTruckTypeList] = useState<ITruckTypeListItem[]>([]);

  const [approveBtnLoading, setApproveBtnLoading] = useState<boolean>(false);

  const [rejectModalLoading, setRejectModalLoading] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);

  const onApprove = async () => {
    setApproveBtnLoading(true);
    const res = await applicationReviewApprove(+applicationId!);
    setApproveBtnLoading(false);
    if (res?.code === 200) {
      if (res.data) {
        message.success('Approve Successfully!');
        refresh?.();
      } else {
        modal.confirm({
          title: 'Confirm',
          icon: <ExclamationCircleFilled />,
          content: 'Application Withdrawn!',
          okText: 'Confirm',
          cancelText: 'Cancel',
          cancelButtonProps: {
            style: { display: 'none' },
          },
          onOk() {
            history.push(`${PATHS.VENDOR_APPLICATION_LIST}`);
          },
          onCancel() {
            // do nothing
          },
        });
      }
    }
  };
  const onRejectFinish = async (values: { reason: string }) => {
    setRejectModalLoading(true);
    const payload = {
      id: +applicationId!,
      reason: values.reason,
    };
    const res = await applicationReviewReject(payload);
    setRejectModalLoading(false);

    if (res?.code === 200) {
      if (res.data) {
        message.success('Reject Successfully!');
        refresh?.();
        setRejectModalOpen(false);
      } else {
        modal.confirm({
          title: 'Confirm',
          icon: <ExclamationCircleFilled />,
          content: 'Application Withdrawn!',
          okText: 'Confirm',
          cancelText: 'Cancel',
          cancelButtonProps: {
            style: { display: 'none' },
          },
          onOk() {
            history.push(`${PATHS.VENDOR_APPLICATION_LIST}`);
          },
          onCancel() {
            // do nothing
          },
        });
      }
    }
  };

  const getTruckTypeListHandle = async () => {
    const res = await getTruckTypeList();
    if (res.code === 200) {
      setTruckTypeList(res.data);
    }
  };

  const buildVendorApplicationDetail = (d: IVendorApplicationDetailRecord) => {
    return (
      <div style={borderWrapStyle}>
        <Row>
          <Col span={12}>
            <ColCell label="Name" value={d.objectName} />
          </Col>
          <Col span={12}>
            <ColCell
              label="Serviceable Area"
              value={
                <span
                  style={
                    d.padChange || d.sadChange || d.tadChange
                      ? changedStyle
                      : undefined
                  }
                >{`${d?.countryName} ${d?.padName ? d?.padName : ''} ${d?.sadName ? d?.sadName : ''} ${d?.tadName ? d?.tadName : ''}`}</span>
              }
            />
          </Col>
        </Row>
      </div>
    );
  };

  const buildCrewApplicationDetail = (d: ICrewApplicationDetailRecord) => {
    return (
      <div style={borderWrapStyle}>
        <Row>
          <Col span={6}>
            <ColCell
              label="Crew Name"
              value={
                <span style={d.nameChange ? changedStyle : undefined}>
                  {d.name}
                </span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="Type"
              value={
                <span
                  style={
                    d.driverFlagChange || d.helperFlagChange
                      ? changedStyle
                      : undefined
                  }
                >{`${d?.driverFlag ? CrewTypeEnum.DRIVER : ''} ${d?.driverFlag && d?.helperFlag ? ',' : ''} ${d?.helperFlag ? CrewTypeEnum.HELPER : ''}`}</span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="ID Number"
              value={
                <span style={d.idNumberChange ? changedStyle : undefined}>
                  {d.idNumber}
                </span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="License No."
              value={
                <span style={d.licenseNumberChange ? changedStyle : undefined}>
                  {d.licenseNumber}
                </span>
              }
            />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <ColCell
              label="Contact"
              value={
                <span
                  style={
                    d.phoneCodeChange || d.phoneNumChange
                      ? changedStyle
                      : undefined
                  }
                >{`${d?.phoneCode} ${d?.phoneNum}`}</span>
              }
            />
          </Col>
          <Col span={12}>
            <ColCell label="Vendor" value={d.vendorName} />
          </Col>
        </Row>
      </div>
    );
  };

  const buildTruckApplicationDetail = (d: ITruckApplicationDetailRecord) => {
    return (
      <div style={borderWrapStyle}>
        <Row>
          <Col span={6}>
            <ColCell
              label="Plate No."
              value={
                <span style={d.plateNumberChange ? changedStyle : undefined}>
                  {d.plateNumber}
                </span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="Ownership"
              value={
                <span style={d.ownershipChange ? changedStyle : undefined}>
                  {d.ownership}
                </span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="Truck Type"
              value={
                <span style={d.truckTypeChange ? changedStyle : undefined}>
                  {truckTypeList.find((item) => item.id === d.truckType)?.name}
                </span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="Van Type"
              value={
                <span style={d.vanTypeChange ? changedStyle : undefined}>
                  {d.vanType}
                </span>
              }
            />
          </Col>
        </Row>

        <Row>
          <Col span={6}>
            <ColCell
              label="Registration No."
              value={
                <span
                  style={d.registrationNumberChange ? changedStyle : undefined}
                >
                  {d.registrationNumber}
                </span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="Net Capacity"
              value={
                <span style={d.netCapacityChange ? changedStyle : undefined}>
                  {d.netCapacity ? `${formatAmount(d.netCapacity)} MT` : ''}
                </span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="Gross Capacity"
              value={
                <span style={d.grossCapacityChange ? changedStyle : undefined}>
                  {d.grossCapacity ? `${formatAmount(d.grossCapacity)} MT` : ''}
                </span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="Volume"
              value={
                <span style={d.volumeChange ? changedStyle : undefined}>
                  {d.volume ? `${formatAmount(d.volume)} CBM` : ''}
                </span>
              }
            />
          </Col>
        </Row>

        <Row>
          <Col span={6}>
            <ColCell
              label="Model"
              value={
                <span style={d.modelChange ? changedStyle : undefined}>
                  {d.model}
                </span>
              }
            />
          </Col>
          <Col span={6}>
            <ColCell
              label="Coding Day"
              value={
                <span style={d.codingDayChange ? changedStyle : undefined}>
                  {d.codingDay}
                </span>
              }
            />
          </Col>
          <Col span={12}>
            <ColCell label="Update time" value={d.updatedAt} />
          </Col>
        </Row>
      </div>
    );
  };

  useEffect(() => {
    getTruckTypeListHandle();
    setDetail(data);
  }, [data]);

  return (
    <>
      <Spin spinning={!data}>
        <div className={styles.header}>
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            {/*top function btn*/}
            <div className={styles.header_top}>
              <div className={styles.header_top_left}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => history.back()}
                >
                  Back
                </Button>
              </div>
              <div className={styles.header_top_right}>
                {detail?.status === ApplicationStatusEnum.UNDER_REVIEW ? (
                  <Button
                    style={{ color: '#FF4D4F', borderColor: '#FF4D4F' }}
                    onClick={() => {
                      setRejectModalOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                ) : null}
                {detail?.status === ApplicationStatusEnum.UNDER_REVIEW ? (
                  <Button
                    style={{ color: '#52C41A', borderColor: '#52C41A' }}
                    onClick={onApprove}
                    loading={approveBtnLoading}
                  >
                    Approve
                  </Button>
                ) : null}
              </div>
            </div>
          </Affix>
          <CustomDetailHeader
            defaultExpand={true}
            titleList={[{ label: 'Application No.', value: detail?.number }]}
            content={
              <>
                <Row>
                  <Col span={6}>
                    <ColCell
                      label="Status"
                      value={
                        <Badge
                          color={
                            ApplicationStatusEnumColor[
                              detail?.status as ApplicationStatusEnum
                            ]
                          }
                          text={
                            ApplicationStatusEnumText[
                              detail?.status as ApplicationStatusEnum
                            ]
                          }
                        />
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Type" value={detail?.type} />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Object"
                      value={
                        <span
                          style={
                            isTruckApplication(detail) &&
                            detail?.plateNumberChange
                              ? changedStyle
                              : undefined
                          }
                        >
                          {isTruckApplication(detail) && detail?.plateNumber}
                          {isVendorApplication(detail) && detail?.objectName}
                          {isCrewApplication(detail) && detail?.objectName}
                        </span>
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="UpdateTime" value={detail?.updatedAt} />
                  </Col>
                </Row>
              </>
            }
          />
        </div>

        <DetailCard
          title="Basic Info."
          showEditBtn={false}
          child={
            <div
              style={{
                marginTop: '12px',
              }}
            >
              {isVendorApplication(data) && buildVendorApplicationDetail(data)}
              {isCrewApplication(data) && buildCrewApplicationDetail(data)}
              {isTruckApplication(data) && buildTruckApplicationDetail(data)}
            </div>
          }
        />

        {rejectModalOpen && (
          <RejectModal
            open={rejectModalOpen}
            //@ts-ignore
            onFinish={onRejectFinish}
            modalProps={{
              okText: 'Confirm',
              onCancel: () => setRejectModalOpen(false),
            }}
            submitter={{
              submitButtonProps: {
                loading: rejectModalLoading,
              },
            }}
          />
        )}
      </Spin>
    </>
  );
}
