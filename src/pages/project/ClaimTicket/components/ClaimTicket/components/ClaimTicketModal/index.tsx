import { claimCreate, claimEdit } from '@/api/claim';
import { IClaimDetail } from '@/api/types/claims';
import { IWaybillBaseInfoData } from '@/api/types/waybill';
import { PATHS } from '@/constants';
import {
  ClaimTicketTypeText,
  EnumClaimTicketType,
  EnumExternalClaimsType,
  EnumInternalClaimsType,
} from '@/enums/claim';
import { openNewTag } from '@/utils/utils';
import { usePrevious } from 'ahooks';
import {
  App,
  Button,
  Col,
  Flex,
  Form,
  Modal,
  ModalProps,
  Row,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { FC, useCallback, useEffect, useState } from 'react';
import {
  externalClaimsTypeList,
  FieldAffiliatedProject,
  FieldClaimant,
  FieldClaimType,
  FieldCouponFeeDescription,
  FieldCrewUniformChargesDescription,
  FieldDDCTrainingFeeDescription,
  FieldEquipmentFeeDescription,
  FieldExternalDescription,
  FieldGPSDescription,
  FieldInteluckInsuranceDescription,
  FieldMedicalFeeDescription,
  FieldOcStatus,
  FieldProof,
  FieldRemark,
  FieldResponsibleParty,
  FieldStuffingFeeDescription,
  FieldWaybillBased,
  internalClaimsTypeList,
} from './Fields';

const { Text } = Typography;

export interface IProps extends ModalProps {
  waybillDetail?: IWaybillBaseInfoData;
  detail?: IClaimDetail;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const ClaimTicketModal: FC<IProps> = ({
  open,
  waybillDetail,
  detail,
  onCancel,
  onSuccess,
  ...restProps
}) => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const type = Form.useWatch('type', form);
  const waybillBased = Form.useWatch('waybillBased', form);
  const [modalType, setModalType] = useState<
    'External' | 'Internal' | 'Default'
  >('Default');
  const [claimType, setClaimType] = useState<
    EnumInternalClaimsType | EnumExternalClaimsType
  >();
  const previousType = usePrevious(claimType);
  const [modalWidth, setModalWidth] = useState<number>(900);
  const [proofColSpan, setProofColSpan] = useState<number>(12);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setUploadLoading(true);
    } else {
      setUploadLoading(false);
    }
  }, []);

  const buildPayload = (values: any) => {
    const {
      type: _claimType,
      claimantObj,
      responsiblePartyObj,
      affiliatedProjectObj,
      itemList,
    } = values;

    const obj = {
      ...values,
      claimType: _claimType,
      claimantId: claimantObj?.id,
      responsiblePartyId: responsiblePartyObj?.id ?? responsiblePartyObj?.value,
      projectId: affiliatedProjectObj?.id,
    };
    delete obj.type;

    if (externalClaimsTypeList.includes(_claimType)) {
      obj.itemList = itemList?.map((item: any) => {
        return {
          waybillId: item.waybillObj?.id,
          detail: item.detail,
          amount: item.amount,
        };
      });
    }

    if (internalClaimsTypeList.includes(_claimType)) {
      switch (_claimType) {
        case EnumInternalClaimsType.GPS:
          obj.itemList = itemList?.map((item: any) => {
            return {
              referenceDate: dayjs(item.referenceDate)?.format('YYYY-MM-01'),
              plateNumber: item.plateNumber,
              amount: item.amount,
            };
          });
          break;

        case EnumInternalClaimsType.DDC_Training_Fee:
          obj.itemList = itemList?.map((item: any) => {
            return {
              location: item.location,
              referenceDate: dayjs(item.referenceDate)?.format('YYYY-MM-DD'),
              personName: item.personName,
              amount: item.amount,
            };
          });
          break;

        case EnumInternalClaimsType.Crew_Uniform_Charges:
          obj.itemList = itemList?.map((item: any) => {
            return {
              personName: item.personName,
              referenceDate: dayjs(item.referenceDate)?.format('YYYY-MM-DD'),
              size: item.size,
              quantity: item.quantity,
              detail: item.detail,
              amount: item.amount,
            };
          });
          break;

        case EnumInternalClaimsType.Inteluck_Insurance:
          obj.itemList = itemList?.map((item: any) => {
            return {
              plateNumber: item.plateNumber,
              referenceDate: dayjs(item.referenceDate)?.format('YYYY-MM-DD'),
              companyName: item.companyName,
              coverageType: item.coverageType,
              amount: item.amount,
            };
          });
          break;

        case EnumInternalClaimsType.Coupon_Fees:
          obj.itemList = itemList?.map((item: any) => {
            return {
              plateNumber: item.plateNumber,
              referenceDate: dayjs(item.referenceDate)?.format('YYYY-MM-DD'),
              quantity: item.quantity,
              amount: item.amount,
            };
          });
          break;

        case EnumInternalClaimsType.Medical_Fee:
          obj.itemList = itemList?.map((item: any) => {
            return {
              plateNumber: item.plateNumber,
              referenceDate: dayjs(item.referenceDate)?.format('YYYY-MM-DD'),
              personName: item.personName,
              position: item.position,
              amount: item.amount,
            };
          });
          break;

        case EnumInternalClaimsType.Equipment_Fee:
          obj.itemList = itemList?.map((item: any) => {
            return {
              referenceDate: dayjs(item.referenceDate)?.format('YYYY-MM-DD'),
              plateNumber: item.plateNumber,
              quantity: item.quantity,
              item: item.item,
              personName: item.personName,
              location: item.location,
              amount: item.amount,
            };
          });
          break;

        case EnumInternalClaimsType.Stuffing_Fee_CDC:
          obj.itemList = itemList?.map((item: any) => {
            return {
              waybillId: item.waybillObj?.id,
              fo: item.fo,
              amount: item.amount,
            };
          });
          break;
      }
    }

    delete obj.claimantObj;
    delete obj.responsiblePartyObj;
    delete obj.affiliatedProjectObj;

    return obj;
  };

  const onSubmit = async () => {
    const fieldError = await form?.getFieldsError?.();
    const hasErrorFields = fieldError?.filter((item) => item.errors?.length);

    if (hasErrorFields?.length > 0) {
      // hasErrorFields.forEach((item) => {
      //   // 校验 values 中不存在 item 的字段
      //   // TODO:
      //   console.log({ item });
      // });
      return;
    }

    await form.validateFields();
    const values = form.getFieldsValue();
    if (detail) {
      const payload = buildPayload(values);
      console.log({ payload });
      setSubmitting(true);
      const res = await claimEdit({ ...payload, id: detail.id }).finally(() => {
        setSubmitting(false);
      });
      if (res.code === 200) {
        if (res.data.code === 0) {
          message.success('Edit Claim Ticket Successful!');
          onSuccess?.();
        } else if (res.data.code === 2) {
          const { refundList } = res.data.customParam ?? {};

          modal.warning({
            title: 'The ticket cannot be edit directly. ',
            content: (
              <>
                <div>
                  <Text>This ticket is associated Refund Ticket</Text>
                </div>
                <div>
                  <Text>
                    Please remove the association of this ticket from the refund
                    ticket, and then try to edit it.
                  </Text>
                </div>
                <div>
                  {refundList?.map((item: any) => (
                    <div key={item.id}>
                      <Text
                        underline
                        style={{
                          color: 'var(--primary-color)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          openNewTag(
                            `${PATHS.CLAIM_TICKET_REFUND_DETAIL}?id=${item.id}`,
                          );
                        }}
                      >
                        {item.ticketNumber}
                      </Text>
                    </div>
                  ))}
                </div>
              </>
            ),
          });
        } else {
          message.error(res.data.msg);
        }
      }
    } else {
      const payload = buildPayload(values);
      console.log({ payload });
      setSubmitting(true);
      const res = await claimCreate(payload).finally(() => {
        setSubmitting(false);
      });
      if (res.code === 200) {
        if (!!waybillDetail) {
          const { id, ticketNumber, ticketType } = res.data;
          // 创建成功需弹窗提示已创建成功并展示 工单编号，允许点击跳转

          modal.success({
            title: 'Claim Ticket Created Successfully',
            content: (
              <div>
                <div>
                  <Text type="secondary">Ticket Type: </Text>
                  <Text>{ClaimTicketTypeText[ticketType]}</Text>
                </div>
                <div>
                  <Text type="secondary">Ticket Number: </Text>
                  <Button
                    color="primary"
                    variant="link"
                    style={{ padding: 0 }}
                    onClick={() => {
                      let path = `${PATHS.CLAIM_TICKET_LIST_DETAIL}`;
                      if (ticketType === EnumClaimTicketType.CLAIM) {
                        path = `${PATHS.CLAIM_TICKET_LIST_DETAIL}?id=${id}`;
                      } else if (ticketType === EnumClaimTicketType.REFUND) {
                        path = `${PATHS.CLAIM_TICKET_REFUND_DETAIL}?id=${id}`;
                      }

                      openNewTag(path);
                    }}
                  >
                    {ticketNumber}
                  </Button>
                </div>
              </div>
            ),
            onOk: () => {
              onSuccess?.();
            },
          });
        } else {
          message.success('Claim Ticket Created Successfully');
          onSuccess?.();
        }
      }
    }
  };

  useEffect(() => {
    if (type) {
      setClaimType(type);

      if (externalClaimsTypeList.includes(type)) {
        setModalType('External');
        setModalWidth(waybillBased ? 1300 : 900);
        setProofColSpan(waybillBased ? 8 : 12);
      }

      if (internalClaimsTypeList.includes(type)) {
        setModalType('Internal');

        if (type === EnumInternalClaimsType.GPS) {
          setModalWidth(900);
          setProofColSpan(12);
        }

        if (type === EnumInternalClaimsType.DDC_Training_Fee) {
          setModalWidth(1200);
          setProofColSpan(8);
        }

        if (type === EnumInternalClaimsType.Crew_Uniform_Charges) {
          setModalWidth(1200);
          setProofColSpan(8);
        }

        if (type === EnumInternalClaimsType.Inteluck_Insurance) {
          setModalWidth(1200);
          setProofColSpan(8);
        }

        if (type === EnumInternalClaimsType.Coupon_Fees) {
          setModalWidth(1200);
          setProofColSpan(8);
        }

        if (type === EnumInternalClaimsType.Medical_Fee) {
          setModalWidth(1100);
          setProofColSpan(8);
        }

        if (type === EnumInternalClaimsType.Equipment_Fee) {
          setModalWidth(1400);
          setProofColSpan(6);
        }

        if (type === EnumInternalClaimsType.Stuffing_Fee_CDC) {
          setModalWidth(1300);
          setProofColSpan(8);
        }
      }
    } else {
      setModalWidth(900);
      setModalType('Default');
    }
  }, [type, waybillBased]);

  useEffect(() => {
    if (externalClaimsTypeList.includes(claimType as EnumExternalClaimsType)) {
      if (
        internalClaimsTypeList.includes(previousType as EnumInternalClaimsType)
      ) {
        // 跨 group 需要清空 claimantObj, responsiblePartyObj, affiliatedProjectObj itemList
        form.resetFields([
          'claimantObj',
          'responsiblePartyObj',
          'affiliatedProjectObj',
          'itemList',
        ]);
      }
    }

    if (internalClaimsTypeList.includes(claimType as EnumInternalClaimsType)) {
      if (
        externalClaimsTypeList.includes(previousType as EnumExternalClaimsType)
      ) {
        // 跨 group 需要清空 claimantObj, responsiblePartyObj, affiliatedProjectObj itemList
        form.resetFields([
          'claimantObj',
          'responsiblePartyObj',
          'affiliatedProjectObj',
          'itemList',
        ]);
      }
    }
  }, [claimType, previousType]);

  useEffect(() => {
    if (open) {
      if (detail) {
        form.setFieldsValue({ type: detail?.claimType });
      }
    } else {
      form.resetFields();
      setModalType('Default');
      setModalWidth(900);
    }
  }, [open, detail]);

  return (
    <Modal
      title={detail ? 'Edit Claim Ticket' : 'Create Claim Ticket'}
      open={open}
      width={modalWidth}
      destroyOnClose
      maskClosable={false}
      onCancel={() => onCancel?.()}
      footer={
        <>
          <Flex justify="end" gap={8}>
            <Button onClick={() => onCancel?.()}>Cancel</Button>
            <Button
              type="primary"
              loading={uploadLoading || submitting}
              onClick={() => onSubmit()}
            >
              {uploadLoading ? 'Proof Uploading...' : 'Submit'}
            </Button>
          </Flex>
        </>
      }
      {...restProps}
    >
      <Form
        name="create-claim-ticket-form"
        form={form}
        layout="vertical"
        initialValues={{ itemList: [{}] }}
      >
        {modalType === 'Default' && (
          <>
            <Row gutter={12}>
              <Col span={8}>
                <FieldClaimType
                  form={form}
                  detail={detail}
                  waybillDetail={waybillDetail}
                />
              </Col>
              <Col span={8}>
                <FieldClaimant form={form} detail={detail} />
              </Col>
              <Col span={8}>
                <FieldResponsibleParty form={form} detail={detail} />
              </Col>
            </Row>
          </>
        )}

        {modalType === 'External' && (
          <>
            <Row gutter={12}>
              <Col span={8}>
                <FieldClaimType
                  form={form}
                  detail={detail}
                  waybillDetail={waybillDetail}
                />
              </Col>
              <Col span={16}>
                <FieldWaybillBased
                  form={form}
                  detail={detail}
                  waybillDetail={waybillDetail}
                />
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={8}>
                <FieldClaimant
                  form={form}
                  detail={detail}
                  waybillDetail={waybillDetail}
                />
              </Col>
              <Col span={8}>
                <FieldResponsibleParty
                  form={form}
                  detail={detail}
                  waybillDetail={waybillDetail}
                />
              </Col>
              <Col span={8}>
                <FieldAffiliatedProject
                  form={form}
                  detail={detail}
                  waybillDetail={waybillDetail}
                />
              </Col>
            </Row>

            <FieldExternalDescription
              form={form}
              detail={detail}
              waybillDetail={waybillDetail}
            />
          </>
        )}

        {modalType === 'Internal' && (
          <>
            <Row gutter={12}>
              <Col span={8}>
                <FieldClaimType
                  form={form}
                  detail={detail}
                  waybillDetail={waybillDetail}
                />
              </Col>
              <Col span={8}>
                <FieldClaimant form={form} detail={detail} />
              </Col>
              <Col span={8}>
                <FieldResponsibleParty form={form} detail={detail} />
              </Col>
            </Row>

            <>
              {type === EnumInternalClaimsType.GPS && (
                <FieldGPSDescription form={form} detail={detail} />
              )}
              {type === EnumInternalClaimsType.DDC_Training_Fee && (
                <FieldDDCTrainingFeeDescription form={form} detail={detail} />
              )}
              {type === EnumInternalClaimsType.Crew_Uniform_Charges && (
                <FieldCrewUniformChargesDescription
                  form={form}
                  detail={detail}
                />
              )}
              {type === EnumInternalClaimsType.Inteluck_Insurance && (
                <FieldInteluckInsuranceDescription
                  form={form}
                  detail={detail}
                />
              )}
              {type === EnumInternalClaimsType.Coupon_Fees && (
                <FieldCouponFeeDescription form={form} detail={detail} />
              )}
              {type === EnumInternalClaimsType.Medical_Fee && (
                <FieldMedicalFeeDescription form={form} detail={detail} />
              )}
              {type === EnumInternalClaimsType.Equipment_Fee && (
                <FieldEquipmentFeeDescription form={form} detail={detail} />
              )}
              {type === EnumInternalClaimsType.Stuffing_Fee_CDC && (
                <FieldStuffingFeeDescription form={form} detail={detail} />
              )}
            </>
          </>
        )}

        {!detail ? (
          <>
            <Row gutter={12} style={{ marginTop: 8 }}>
              <Col span={12}>
                <FieldOcStatus form={form} />
              </Col>
              <Col span={12}>
                <FieldRemark form={form} />
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={proofColSpan}>
                <FieldProof form={form} getUploadingSize={getUploadingSize} />
              </Col>
            </Row>
          </>
        ) : null}
      </Form>
    </Modal>
  );
};

export default ClaimTicketModal;
