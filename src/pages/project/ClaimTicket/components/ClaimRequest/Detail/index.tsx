import {
  claimRequestCancel,
  claimRequestDetail,
  claimRequestEdit,
  claimRequestSplit,
} from '@/api/claim';
import { IClaimRequestDetail } from '@/api/types/claims';
import CustomFormInput from '@/components/CustomFormInput';
import OssUpload from '@/components/OssUpload';
import { ENUM_OSS_MENU_DIRECTORY } from '@/components/OssUpload/types';
import { PATHS } from '@/constants';
import {
  ClaimRequestStatusEnum,
  ClaimRequestStatusEnumColor,
  ClaimRequestStatusEnumText,
  CountryCurrencyEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import ClaimRequestFormList from '@/pages/billing/components/CreateClaimRequestModal/ClaimRequestFormList';
import { openNewTag } from '@/utils/utils';
import { Access, useAccess, useModel } from '@umijs/max';
import {
  App,
  Badge,
  Button,
  Col,
  Divider,
  Flex,
  Form,
  message,
  Modal,
  ModalProps,
  Popconfirm,
  Row,
  Spin,
} from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import ClaimRequestDetailTable from '../components/ClaimRequestDetailTable';
import styles from './index.less';

export interface IRequestDetailModal extends ModalProps {
  id: number;

  onCancel: () => void;
  onRefresh: () => void;
}

const RequestDetailModal: FC<IRequestDetailModal> = ({
  open,
  id,
  onRefresh,
  onCancel,
  ...restProps
}) => {
  const { modal } = App.useApp();
  const access = useAccess();
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;

  const [uploadLoading, setUploadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [originData, setOriginData] = useState<IClaimRequestDetail>();
  const [form] = Form.useForm();
  const descriptionListValue = Form.useWatch('description', form);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setUploadLoading(true);
    } else {
      setUploadLoading(false);
    }
  }, []);

  const getDataSource = async () => {
    setLoading(true);
    const res = await claimRequestDetail(id).finally(() => setLoading(false));

    if (res.code === 200) {
      setOriginData(res.data);
      const { requestStatus, descriptions } = res.data;
      if (requestStatus === ClaimRequestStatusEnum.PENDING_OC) {
        setIsEdit(true);
      }

      const descriptionList = descriptions?.map((item: any) => {
        return {
          claimType: item?.claimType,
          waybillNumber: { id: item?.waybillId, name: item?.waybillNo },
          responsibleParty: {
            id: item?.responsiblePartyId,
            name: item?.responsiblePartyName,
          },
          claimDetails: item?.claimDetails,
          claimAmount: item?.claimAmount,
          vendorLiabilityAmount: item?.responsiblePartyId === 0 ? 0 : undefined,
          inteluckExpenseAmount:
            item?.responsiblePartyId === 0 ? item.claimAmount : undefined,
        };
      });
      console.log(descriptionList);

      form.setFieldsValue({
        totalClaimAmount: res.data?.totalClaimAmount,
        claimant: res.data?.claimant,
        creator: res.data?.creator,
        creationTime: res.data?.createdAt,
        description: descriptionList,
      });
    }
  };

  const onSubmit = useCallback(async () => {
    await form.validateFields();
    const formValues = form.getFieldsValue();

    setLoading(true);

    const { description = [], materialIds, totalClaimAmount } = formValues;
    const descriptionList = description?.map((item: any) => {
      return {
        claimType: item.claimType,
        waybillId: item.waybillNumber?.id,
        responsiblePartyId: item.responsibleParty?.id,
        claimDetails: item.claimDetails,
        claimAmount: item.claimAmount,
        vendorAmount: item.vendorLiabilityAmount,
        inteluckAmount: item.inteluckExpenseAmount,
      };
    });
    const payload = {
      id: id,
      totalClaimAmount: totalClaimAmount,
      descList: descriptionList,
      materialList: materialIds,
    };

    const res = await claimRequestEdit(payload).finally(() =>
      setLoading(false),
    );
    console.log(payload);

    if (res.code === 200) {
      setLoading(true);
      const resSplit = await claimRequestSplit(id).finally(() =>
        setLoading(false),
      );
      if (resSplit.code === 200) {
        message.success('Work order successfully dismantled ');
        onCancel();
        onRefresh();
      }
    }
  }, []);

  const onOk = async () => {
    await form.validateFields();
    modal.confirm({
      title: 'Confirm',
      content: (
        <>
          <div>Confirm content and generate Claim Ticket?</div>
          <div> No modifications allowed after generation. </div>
        </>
      ),
      okText: 'Ok',
      cancelText: 'Cancel',
      onOk: onSubmit,
    });
  };
  const onCancelRequest = async () => {
    const res = await claimRequestCancel(id);

    if (res.code === 200) {
      message.success('Cancel claim request successfully!');
      onCancel();
      onRefresh();
    }
  };

  useEffect(() => {
    if (open) {
      getDataSource();
    } else {
      form.resetFields();
    }
  }, [open]);

  useEffect(() => {
    if (!descriptionListValue) {
      return;
    }
    const _totalAmount = descriptionListValue?.reduce(
      (acc: any, cur: { claimAmount: number }) => {
        return acc + (cur?.claimAmount ?? 0) * 100;
      },
      0,
    );

    form.setFieldsValue({
      totalClaimAmount: _totalAmount / 100,
    });
  }, [descriptionListValue]);

  return (
    <>
      <div className={cls('claim-request-modal')}>
        <Modal
          {...restProps}
          open={open}
          title={'Claim Request Detail'}
          destroyOnClose
          maskClosable={false}
          centered={true}
          width={1420}
          onCancel={onCancel}
          footer={() => (
            <>
              <Button key="cancel" onClick={onCancel}>
                Cancel
              </Button>
              <Access accessible={access[PermissionEnum.CLAIM_REQUEST_EDIT]}>
                <Popconfirm
                  title="Warning"
                  description="Should the ticket be canceled?"
                  onConfirm={onCancelRequest}
                  onCancel={() => {}}
                  okText="Yes, cancel"
                  cancelText="No"
                >
                  {originData?.requestStatus ===
                    ClaimRequestStatusEnum.PENDING_OC && (
                    <Button key="cancelRequest">Cancel Request</Button>
                  )}
                </Popconfirm>

                {originData?.requestStatus ===
                  ClaimRequestStatusEnum.PENDING_OC && (
                  <Button type="primary" loading={uploadLoading} onClick={onOk}>
                    Confirm
                  </Button>
                )}
                {originData?.requestStatus ===
                  ClaimRequestStatusEnum.SPLIT_FAILED && (
                  <Button
                    type="primary"
                    loading={uploadLoading}
                    onClick={async () => {
                      setLoading(true);
                      const resSplit = await claimRequestSplit(id).finally(() =>
                        setLoading(false),
                      );
                      if (resSplit.code === 200) {
                        message.success('Work order successfully dismantled ');
                        onCancel();
                        onRefresh();
                      }
                    }}
                  >
                    Retry
                  </Button>
                )}
              </Access>
            </>
          )}
        >
          <div style={{ height: 700, overflowY: 'auto', overflowX: 'hidden' }}>
            <Spin spinning={loading}>
              <Flex justify="space-between">
                <span style={{ fontSize: 20, fontWeight: 600 }}>
                  {originData?.claimRequestNo}
                </span>

                {originData?.requestStatus && (
                  <Badge
                    style={{ marginRight: 24 }}
                    color={
                      ClaimRequestStatusEnumColor[originData?.requestStatus]
                    }
                    text={ClaimRequestStatusEnumText[originData?.requestStatus]}
                  />
                )}
              </Flex>

              <Form
                name="claim-request-modal-form"
                form={form}
                layout="vertical"
              >
                <Row gutter={24}>
                  <Col span={6}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label={`Total Claim Amount(${CountryCurrencyEnumText[countryId as number]})`}
                      name="totalClaimAmount"
                      layout="horizontal"
                      rules={[
                        {
                          required: true,
                          message: 'Please input Total Claim Amount',
                        },
                      ]}
                    >
                      <CustomFormInput readOnly isFormatter />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      style={{ marginBottom: 0 }}
                      label="Claimant"
                      name="claimant"
                      layout="horizontal"
                      rules={[
                        { required: true, message: 'Please input Claimant' },
                      ]}
                    >
                      <CustomFormInput readOnly />
                    </Form.Item>
                  </Col>
                </Row>
                <Divider plain>{'Description'}</Divider>
                <div style={{ marginBottom: 24 }}>
                  {isEdit && access[PermissionEnum.CLAIM_REQUEST_EDIT] ? (
                    <ClaimRequestFormList
                      isDetail
                      form={form}
                      customerId={originData?.customerId}
                    />
                  ) : (
                    <ClaimRequestDetailTable
                      originData={originData?.descriptions}
                    />
                  )}
                </div>

                <div
                  className={`${!isEdit || !access[PermissionEnum.CLAIM_REQUEST_EDIT] ? styles.creatorInfo : ''}`}
                >
                  {!loading && (
                    <Form.Item
                      style={{ width: 378 }}
                      name="materialIds"
                      label="Proof"
                      rules={[
                        { required: true, message: 'Please upload  Proof' },
                      ]}
                    >
                      <OssUpload
                        dir={ENUM_OSS_MENU_DIRECTORY.AR_AP}
                        fileList={originData?.claimRequestProof ?? []}
                        scrollHeight={200}
                        disabled={
                          !isEdit || !access[PermissionEnum.CLAIM_REQUEST_EDIT]
                        }
                        mode={!isEdit ? 'card' : 'list'}
                        showModeBar={isEdit}
                        getUploadingSize={getUploadingSize}
                      />
                    </Form.Item>
                  )}
                </div>

                {originData?.requestStatus ===
                ClaimRequestStatusEnum.PENDING_OC ? (
                  <div className={styles.creatorInfo}>
                    <div className={styles.creatorInfoItem}>
                      <div className={styles.creatorInfoLabel}>Creator:</div>
                      <div>{originData?.creator}</div>
                    </div>
                    <div>
                      <div className={styles.creatorInfoLabel}>Creator:</div>
                      <div>{originData?.createdAt}</div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={styles.creatorInfo}
                    style={{ borderTop: '1px dashed #E5E5E5' }}
                  >
                    <div>Split Claim ticket</div>
                    <div>
                      {originData?.splitTicketNum
                        ? originData?.splitTicketNum?.map((item, index) => {
                            return access[
                              PermissionEnum.CLAIM_TICKET_DETAIL
                            ] ? (
                              <Button
                                key={item.claimId}
                                color="primary"
                                variant="link"
                                style={{ padding: 0 }}
                                onClick={() => {
                                  openNewTag(
                                    `${PATHS.CLAIM_TICKET_LIST_DETAIL}?id=${item.claimId}`,
                                  );
                                }}
                              >
                                {item.claimNum}
                                {index ===
                                originData?.splitTicketNum?.length - 1
                                  ? ''
                                  : ','}
                              </Button>
                            ) : (
                              <span key={item.claimId}>
                                {item.claimNum}
                                {index ===
                                originData?.splitTicketNum?.length - 1
                                  ? ''
                                  : ','}
                              </span>
                            );
                          })
                        : '-'}
                    </div>
                  </div>
                )}
              </Form>

              <div>
                <div className={styles.operationLogsTitle}>Operation Logs</div>
                <div className={styles.operationList}>
                  {originData?.operationLogs?.map((item) => (
                    <div className={styles.operationItem} key={item.id}>
                      <div className={styles.creatorInfoLabel}>
                        {item.createdAt}
                      </div>
                      <div>
                        {item.operator} {item.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Spin>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default RequestDetailModal;
