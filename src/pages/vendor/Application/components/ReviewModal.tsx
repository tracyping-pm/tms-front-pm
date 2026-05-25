import { App, Button, Divider, Form, Skeleton, Tooltip } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

import {
  applicationReviewApprove,
  applicationReviewReject,
  crewApplicationDetail,
  truckApplicationDetail,
  vendorApplicationDetail,
} from '@/api/application';
import { getTruckTypeList } from '@/api/truck';
import {
  ICategoryItem,
  ICrewApplicationDetailRecord,
  ITruckApplicationDetailRecord,
  IVendorApplicationDetailRecord,
} from '@/api/types/application';
import { ITruckTypeListItem } from '@/api/types/truck';
import { MAX_LENGTH } from '@/constants';
import { ApplicationTypeEnum, CrewTypeEnum } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { ExclamationCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormTextArea,
} from '@ant-design/pro-components';
import AccreditationList from './AccreditationList';
import styles from './common.less';
import CustomInfo from './CustomInfo';

const FORM_NAME = 'review-modal-form';

type IReviewModalProps = ModalFormProps & {
  type: ApplicationTypeEnum;
  reviewId: number;
  refresh: () => void;
  onCancel: () => void;
};

const ReviewModal: FC<IReviewModalProps> = ({
  title = 'Application Review',
  reviewId,
  type,
  open,
  modalProps,
  onCancel,
  refresh,
  ...rest
}) => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [rejectBtnLoading, setRejectBtnLoading] = useState<boolean>(false);
  const [approveBtnLoading, setApproveBtnLoading] = useState<boolean>(false);
  const [isRejectStatus, setIsRejectStatus] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState<
    IVendorApplicationDetailRecord &
      ITruckApplicationDetailRecord &
      ICrewApplicationDetailRecord
  >();
  const [categoryList, setCategoryList] = useState<ICategoryItem[]>([]);
  const [truckTypeList, setTruckTypeList] = useState<ITruckTypeListItem[]>([]);
  const handleReject = async () => {
    const values = await form.validateFields();
    const payload = {
      id: reviewId,
      reason: values.reason,
    };
    setRejectBtnLoading(true);
    const res = await applicationReviewReject(payload);
    setApproveBtnLoading(false);
    if (res?.code === 200) {
      if (res.data) {
        message.success('Reject Successfully!');
        refresh?.();
        onCancel?.();
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
            refresh?.();
            onCancel?.();
          },
          onCancel() {
            // do nothing
          },
        });
      }
    }
  };
  const onApprove = async () => {
    setApproveBtnLoading(true);
    const res = await applicationReviewApprove(reviewId);
    setApproveBtnLoading(false);
    if (res?.code === 200) {
      if (res.data) {
        message.success('Approve Successfully!');
        refresh?.();
        onCancel?.();
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
            refresh?.();
            onCancel?.();
          },
          onCancel() {
            // do nothing
          },
        });
      }
    }
  };

  const init = useCallback(async () => {
    let res;
    switch (type) {
      case ApplicationTypeEnum.TRUCK:
        res = await truckApplicationDetail(reviewId);
        break;
      case ApplicationTypeEnum.VENDOR:
        res = await vendorApplicationDetail(reviewId);
        break;
      case ApplicationTypeEnum.CREW:
        res = await crewApplicationDetail(reviewId);
        break;
      default:
        break;
    }

    if (res?.code === 200) {
      //@ts-ignore
      setReviewData(res?.data);
      setCategoryList(res?.data?.accreditationCategoryList as ICategoryItem[]);
    }
  }, []);

  const getTruckTypeListHandle = async () => {
    const res = await getTruckTypeList();
    if (res.code === 200) {
      setTruckTypeList(res.data);
    }
  };

  useEffect(() => {
    if (open) {
      getTruckTypeListHandle();
      init();
    }
  }, [open]);

  return (
    <div>
      <ModalForm
        title={
          <>
            {title}{' '}
            <Tooltip title={'Application Update Information (Blue Content)'}>
              <InfoCircleOutlined />
            </Tooltip>
          </>
        }
        open={open}
        width={1000}
        name={FORM_NAME}
        form={form}
        // layout="horizontal"
        labelCol={{ span: 7 }}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          maskClosable: false,
          forceRender: true,
          onCancel: onCancel,
          bodyStyle: { maxHeight: 600, overflowY: 'auto', overflowX: 'hidden' },
        }}
        {...rest}
        submitter={{
          render: () => (
            <div className={styles.modalFooter}>
              {isRejectStatus ? (
                <Button
                  style={{ color: '#FF4D4F', borderColor: '#FF4D4F' }}
                  loading={rejectBtnLoading}
                  onClick={() => {
                    handleReject();
                  }}
                >
                  Reject
                </Button>
              ) : (
                <Button
                  style={{ color: '#FF4D4F', borderColor: '#FF4D4F' }}
                  onClick={() => {
                    setIsRejectStatus(true);
                    setTimeout(() => {
                      const element = document.getElementById('reviewModal');
                      if (element) {
                        element?.scrollIntoView?.({
                          behavior: 'smooth',
                          block: 'end',
                        });
                      }
                    }, 100);
                  }}
                >
                  Reject
                </Button>
              )}
              <Button
                style={{ color: '#52C41A', borderColor: '#52C41A' }}
                onClick={onApprove}
                loading={approveBtnLoading}
              >
                Approve
              </Button>
            </div>
          ),
        }}
      >
        <Skeleton loading={!reviewData}>
          <div id="reviewModal">
            <CustomInfo
              change={false}
              label={'Application Type'}
              value={reviewData?.type}
            />

            <Divider plain>{'Basic Information'}</Divider>
            {reviewData?.type === ApplicationTypeEnum.TRUCK ? (
              <div className={styles.reviewContent}>
                <CustomInfo
                  change={reviewData?.plateNumberChange}
                  label={'Plate Number'}
                  value={reviewData?.plateNumber}
                />

                <CustomInfo
                  change={reviewData?.truckTypeChange}
                  label={'Truck Type'}
                  value={
                    truckTypeList.find(
                      (item) => item.id === reviewData?.truckType,
                    )?.name
                  }
                />
                <CustomInfo
                  change={reviewData?.ownershipChange}
                  label={'Ownership'}
                  value={reviewData?.ownership}
                />
                <CustomInfo
                  change={reviewData?.vanTypeChange}
                  label={'Van Type'}
                  value={reviewData?.vanType}
                />
                <CustomInfo
                  change={reviewData?.grossCapacityChange}
                  label={'Gross Capacity'}
                  value={
                    reviewData?.grossCapacity
                      ? `${formatAmount(reviewData?.grossCapacity)} MT`
                      : ''
                  }
                />
                <CustomInfo
                  change={reviewData?.netCapacityChange}
                  label={'Net Capacity'}
                  value={
                    reviewData?.netCapacity
                      ? `${formatAmount(reviewData?.netCapacity)} MT`
                      : ''
                  }
                />
                <CustomInfo
                  change={reviewData?.volumeChange}
                  label={'Volume'}
                  value={
                    reviewData?.volume
                      ? `${formatAmount(reviewData?.volume)} CBM`
                      : ''
                  }
                />
                <CustomInfo
                  change={reviewData?.codingDayChange}
                  label={'Coding Day'}
                  value={reviewData?.codingDay}
                />
                <CustomInfo
                  change={reviewData?.registrationNumberChange}
                  label={'Registration Number'}
                  value={reviewData?.registrationNumber}
                />
                <CustomInfo
                  change={reviewData?.modelChange}
                  label={'Model'}
                  value={reviewData?.model}
                />
              </div>
            ) : null}
            {reviewData?.type === ApplicationTypeEnum.VENDOR ? (
              <div className={styles.reviewContent}>
                <CustomInfo
                  change={false}
                  label={'Vendor Name'}
                  value={`${reviewData?.objectName}`}
                />
                <CustomInfo
                  change={
                    reviewData?.padChange ||
                    reviewData?.sadChange ||
                    reviewData?.tadChange
                  }
                  label={'Serviceable Area'}
                  value={`${reviewData?.countryName} ${reviewData?.padName ? reviewData?.padName : ''} ${reviewData?.sadName ? reviewData?.sadName : ''} ${reviewData?.tadName ? reviewData?.tadName : ''}`}
                />
              </div>
            ) : null}
            {reviewData?.type === ApplicationTypeEnum.CREW ? (
              <div className={styles.reviewContent}>
                <CustomInfo
                  change={
                    reviewData?.phoneCodeChange || reviewData?.phoneNumChange
                  }
                  label={'Contact Number'}
                  value={`${reviewData?.phoneCode} ${reviewData?.phoneNum}`}
                />
                <CustomInfo
                  change={reviewData?.nameChange}
                  label={'Crew Name'}
                  value={reviewData?.name}
                />
                <CustomInfo
                  change={
                    reviewData?.driverFlagChange || reviewData?.helperFlagChange
                  }
                  label={'Type'}
                  value={`${reviewData?.driverFlag ? CrewTypeEnum.DRIVER : ''} ${reviewData?.driverFlag && reviewData?.helperFlag ? ',' : ''} ${reviewData?.helperFlag ? CrewTypeEnum.HELPER : ''}`}
                />
                <CustomInfo
                  change={reviewData?.licenseNumberChange}
                  label={'License Number'}
                  value={reviewData?.licenseNumber}
                />
              </div>
            ) : null}

            {categoryList?.length ? (
              <>
                <Divider plain>{'Accreditation'}</Divider>
                <AccreditationList
                  accreditationId={reviewId}
                  categoryList={categoryList}
                />
              </>
            ) : null}
            {isRejectStatus ? (
              <ProFormTextArea
                name="reason"
                label="Reject Reason"
                placeholder="Please enter Reject Reason"
                rules={[
                  {
                    required: true,
                    message: 'Please enter Reject Reason',
                  },
                  {
                    whitespace: true,
                    message: 'Cannot only contain spaces',
                  },
                  {
                    max: MAX_LENGTH.NOTE,
                    message: `Reason cannot exceed ${MAX_LENGTH.NOTE} characters`,
                  },
                ]}
              />
            ) : null}
          </div>
        </Skeleton>
      </ModalForm>
    </div>
  );
};

export default ReviewModal;
