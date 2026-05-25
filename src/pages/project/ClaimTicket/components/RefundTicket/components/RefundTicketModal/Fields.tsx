import { IClaimDetail, IRefundDetail } from '@/api/types/claims';
import CountryIcon from '@/components/CountryIcon';
import FuzzySelector from '@/components/FuzzySelector';
import { I_FUZZY_API_RESPONSE } from '@/components/FuzzySelector/types';
import OssUpload from '@/components/OssUpload';
import { ENUM_OSS_MENU_DIRECTORY } from '@/components/OssUpload/types';
import {
  ES_DTO_CLASS,
  MAX_LENGTH,
  StatementClaimTicketStatusEnum,
} from '@/constants';
import {
  CountryCurrencyEnumText,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import {
  EnumClaimOcStatus,
  EnumInternalClaimsType,
  ocStatusRefundOptions,
} from '@/enums/claim';
import { numberAdd } from '@/utils/compute';
import { formatAmount } from '@/utils/utils';
import { useModel } from '@umijs/max';
import {
  Col,
  Divider,
  Flex,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Typography,
} from 'antd';
import { RuleObject } from 'antd/es/form';
import { StoreValue } from 'antd/es/form/interface';
import _ from 'lodash';
import { FC, useEffect, useMemo, useState } from 'react';
import { internalClaimsTypeList } from '../../../ClaimTicket/components/ClaimTicketModal/Fields';

const { Text } = Typography;

interface ICommonFieldProps {
  form: FormInstance;
  disabledLinkedClaim?: boolean;
  linkedClaimDetail?: IClaimDetail;
  detail?: IRefundDetail;
}

export const FieldLinkedClaimTicket: FC<
  ICommonFieldProps & { onChange: (id: number) => void }
> = ({ form, disabledLinkedClaim, linkedClaimDetail, detail, onChange }) => {
  useEffect(() => {
    if (linkedClaimDetail) {
      form.setFieldsValue({
        linkedClaimTicketObj:
          _.isUndefined(linkedClaimDetail?.id) ||
          _.isNull(linkedClaimDetail?.id)
            ? undefined
            : {
                name: linkedClaimDetail?.ticketNumber,
                id: linkedClaimDetail?.id,
              },
      });

      if (
        internalClaimsTypeList.includes(
          linkedClaimDetail.claimType as EnumInternalClaimsType,
        )
      ) {
        // 若为 internal Claim ticket , 则外框置红并提示：Only External Claims  ticket can create associated Refund Ticket.
        form.setFields([
          {
            name: 'linkedClaimTicketObj',
            errors: [
              'Only External Claims ticket can create associated Refund Ticket.',
            ],
          },
        ]);
      } else if (
        linkedClaimDetail.ticketStatus ===
        StatementClaimTicketStatusEnum.CANCELED
      ) {
        // 若为 canceld cliam ticket 则外框置红并提示：Associating cancelled claim tickets is not supported.
        form.setFields([
          {
            name: 'linkedClaimTicketObj',
            errors: ['Associating cancelled claim tickets is not supported.'],
          },
        ]);
      } else {
        form.setFields([
          {
            name: 'linkedClaimTicketObj',
            errors: [],
          },
        ]);
      }
    }
  }, [linkedClaimDetail]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        linkedClaimTicketObj:
          _.isUndefined(detail?.claimId) || _.isNull(detail?.claimId)
            ? undefined
            : {
                name: detail?.claimNumber,
                id: detail?.claimId,
              },
      });
    }
  }, [detail]);

  return (
    <Form.Item
      label="Linked Claim Ticket"
      name="linkedClaimTicketObj"
      rules={[{ required: true, message: 'Please select Linked Claim Ticket' }]}
    >
      <FuzzySelector
        fieldProps={{
          placeholder: 'Linked Claim Ticket',
          disabled: disabledLinkedClaim,
        }}
        request={{
          field: 'ticketNumber',
          esDtoClass: ES_DTO_CLASS.CLAIM_TICKET,
          type: FieldQueryHighlightTypeEnum.None,
          uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM,
          uniqueLogicParams: { ticketType: 1 },
        }}
        // @ts-ignore
        onChange={(v: I_FUZZY_API_RESPONSE) => onChange(v.id)}
      />
    </Form.Item>
  );
};

export const FieldRefundParty: FC<ICommonFieldProps> = ({
  form,
  linkedClaimDetail,
  detail,
}) => {
  const [disabled, setDisabled] = useState(false);
  const validatorRefundingParty = (rule: RuleObject, value: StoreValue) => {
    const payeeObj = form.getFieldValue('payeeObj');
    const payeeId = payeeObj?.id ?? {};

    if (!value) {
      return Promise.reject('Please select a Refunding Party');
    }
    if (value.id === 0 && payeeId === 0) {
      // 不允许两方均为Inteluck corporration
      return Promise.reject(
        new Error('Both parties cannot be Inteluck Corporation'),
      );
    }

    return Promise.resolve();
  };

  useEffect(() => {
    if (detail) {
      setDisabled(true);
      form.setFieldsValue({
        refundingPartyObj:
          _.isUndefined(detail?.refundingPartyId) ||
          _.isNull(detail?.refundingPartyId)
            ? undefined
            : {
                name: detail?.refundingPartyName,
                id: detail?.refundingPartyId,
              },
      });
    } else {
      setDisabled(false);
    }
  }, [detail]);

  useEffect(() => {
    if (linkedClaimDetail) {
      form.setFieldsValue({
        refundingPartyObj:
          _.isUndefined(linkedClaimDetail?.claimantId) ||
          _.isNull(linkedClaimDetail?.claimantId)
            ? undefined
            : {
                name: linkedClaimDetail?.claimantName,
                label: linkedClaimDetail?.claimantName,
                value: linkedClaimDetail?.claimantId,
                id: linkedClaimDetail?.claimantId,
              },
      });
    }
  }, [linkedClaimDetail]);

  return linkedClaimDetail ? (
    <Form.Item
      label="Refunding Party"
      name="refundingPartyObj"
      dependencies={['payeeObj']}
      required={true}
      rules={[{ validator: validatorRefundingParty }]}
    >
      <Select
        placeholder="Refunding Party"
        allowClear
        popupMatchSelectWidth
        defaultActiveFirstOption={false}
        labelInValue={true}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        disabled={disabled}
        options={_.uniqBy(
          [
            {
              label: linkedClaimDetail?.claimantName,
              value: linkedClaimDetail?.claimantId,
              id: linkedClaimDetail?.claimantId,
            },
            { label: 'Inteluck Corporation (Virtual)', value: 0, id: 0 },
          ],
          'value',
        )}
      />
    </Form.Item>
  ) : (
    <Form.Item
      label="Refunding Party"
      name="refundingPartyObj"
      dependencies={['payeeObj']}
      required={true}
      rules={[{ validator: validatorRefundingParty }]}
    >
      <FuzzySelector
        fieldProps={{
          placeholder: 'Refunding Party',
          disabled,
        }}
        request={{
          field: 'customerName',
          esDtoClass: ES_DTO_CLASS.CUSTOMER,
          type: FieldQueryHighlightTypeEnum.COUNTRY,
          uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM_REQUEST,
        }}
      />
    </Form.Item>
  );
};

export const FieldPayee: FC<ICommonFieldProps> = ({
  form,
  linkedClaimDetail,
  detail,
}) => {
  const [disabled, setDisabled] = useState(false);
  const validatorPayee = (rule: RuleObject, value: StoreValue) => {
    const refundingPartyObj = form.getFieldValue('refundingPartyObj');
    const refundingPartyId = refundingPartyObj?.id ?? {};

    if (!value) {
      return Promise.reject('Please select Payee');
    }

    if (value.id === 0 && refundingPartyId === 0) {
      // 不允许两方均为Inteluck corporration
      return Promise.reject(
        new Error('Both parties cannot be Inteluck Corporation'),
      );
    }

    return Promise.resolve();
  };

  useEffect(() => {
    if (detail) {
      setDisabled(true);
      form.setFieldsValue({
        payeeObj:
          _.isUndefined(detail?.payeeId) || _.isNull(detail?.payeeId)
            ? undefined
            : {
                name: detail?.payeeName,
                id: detail.payeeId,
              },
      });
    } else {
      setDisabled(false);
    }
  }, [detail]);

  useEffect(() => {
    if (linkedClaimDetail) {
      form.setFieldsValue({
        payeeObj:
          _.isUndefined(linkedClaimDetail?.responsiblePartyId) ||
          _.isNull(linkedClaimDetail?.responsiblePartyId)
            ? undefined
            : {
                label: linkedClaimDetail?.responsiblePartyName,
                value: linkedClaimDetail.responsiblePartyId,
              },
      });
    }
  }, [linkedClaimDetail]);

  return linkedClaimDetail ? (
    <Form.Item
      label="Payee"
      name="payeeObj"
      dependencies={['refundingPartyObj']}
      required={true}
      rules={[{ validator: validatorPayee }]}
    >
      <Select
        placeholder="Payee"
        allowClear
        popupMatchSelectWidth
        defaultActiveFirstOption={false}
        labelInValue={true}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        disabled={disabled}
        options={_.uniqBy(
          [
            {
              label: linkedClaimDetail?.responsiblePartyName,
              value: linkedClaimDetail?.responsiblePartyId,
            },
            { label: 'Inteluck Corporation (Virtual)', value: 0 },
          ],
          'value',
        )}
      />
    </Form.Item>
  ) : (
    <Form.Item
      label="Payee"
      name="payeeObj"
      required={true}
      rules={[{ validator: validatorPayee }]}
    >
      <FuzzySelector
        fieldProps={{
          placeholder: 'Payee',
          disabled,
        }}
        request={{
          field: 'vendorName',
          esDtoClass: ES_DTO_CLASS.VENDOR,
          type: FieldQueryHighlightTypeEnum.COUNTRY,
          uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM_REQUEST,
        }}
      />
    </Form.Item>
  );
};

export const FieldAffiliatedProject: FC<ICommonFieldProps> = ({
  form,
  detail,
  linkedClaimDetail,
}) => {
  const claimantObj = Form.useWatch('claimantObj', form);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        affiliatedProjectObj:
          _.isUndefined(detail?.projectId) || _.isNull(detail?.projectId)
            ? undefined
            : {
                name: detail?.projectName,
                id: detail.projectId,
              },
      });
    }
  }, [detail]);

  useEffect(() => {
    if (linkedClaimDetail) {
      form.setFieldsValue({
        affiliatedProjectObj:
          _.isUndefined(linkedClaimDetail?.projectId) ||
          _.isNull(linkedClaimDetail?.projectId)
            ? undefined
            : {
                name: linkedClaimDetail?.projectName,
                id: linkedClaimDetail.projectId,
              },
      });
    }
  }, [linkedClaimDetail]);

  return (
    <Form.Item label="Affiliated Project" name="affiliatedProjectObj">
      <FuzzySelector
        fieldProps={{
          placeholder: 'Affiliated Project',
          disabled: true,
        }}
        request={{
          field: 'projectName',
          esDtoClass: ES_DTO_CLASS.PROJECT,
          type: FieldQueryHighlightTypeEnum.USER_ROLE,
          uniqueLogic:
            FieldQueryHighlightUniqueLogicEnum.CLAIM_AFFILIATED_PROJECT,
          uniqueLogicParams: claimantObj ? { customerId: claimantObj.id } : {},
        }}
      />
    </Form.Item>
  );
};

export const FieldDescription: FC<ICommonFieldProps> = ({
  form,
  linkedClaimDetail,
  detail,
}) => {
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;
  const linkedClaimTicketObj = Form.useWatch(['linkedClaimTicketObj'], form);
  const refundingPartyObj = Form.useWatch(['refundingPartyObj'], form);
  const payeeObj = Form.useWatch(['payeeObj'], form);
  const itemList = Form.useWatch(['itemList'], form);
  const [descriptionDisabled, setDescriptionDisabled] = useState(false);

  // 计算总金额
  const totalAmount = useMemo(() => {
    const total = itemList?.reduce((sum: number, item: any) => {
      return numberAdd(sum, Number(item?.amount) || 0);
    }, 0);
    form.setFieldValue('totalAmount', total);
    return total;
  }, [itemList]);

  useEffect(() => {
    if (linkedClaimTicketObj && refundingPartyObj && payeeObj) {
      setDescriptionDisabled(false);
      form?.setFields([
        {
          name: 'itemList',
          errors: [],
        },
      ]);
    } else {
      setDescriptionDisabled(true);
      form?.setFields([
        {
          name: 'itemList',
          errors: ['Please fill all Basic Info first'],
        },
      ]);
    }
  }, [linkedClaimTicketObj, refundingPartyObj, payeeObj]);

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        itemList: detail?.itemList.map((item) => {
          return {
            ...item,
          };
        }),
      });
    }
  }, [detail]);

  useEffect(() => {
    if (linkedClaimDetail) {
      form.setFieldsValue({
        itemList: linkedClaimDetail?.itemList.map((item) => {
          return {
            claimItemId: item.id,
            waybillId: item.waybillId,
            claimItemDetail: item.detail,
            claimItemAmount: item.amount,
          };
        }),
      });
    }
  }, [linkedClaimDetail]);

  return (
    <>
      <Divider type="horizontal">Description</Divider>
      <Flex gap={10} style={{ marginBottom: 8 }}>
        <Text type="secondary">Total Claim Amount</Text>
        <span>
          <CountryIcon />
          {formatAmount(totalAmount)}
        </span>
        <div style={{ visibility: 'hidden', height: 1 }}>
          <Form.Item name="totalAmount" noStyle>
            <InputNumber placeholder="Total Amount" />
          </Form.Item>
        </div>
      </Flex>
      <Form.List name={'itemList'}>
        {(fields, _opt, { errors }) => {
          return (
            <>
              <Flex vertical gap={4}>
                {fields.map((field, index) => {
                  const claimItemDetail = form?.getFieldValue([
                    'itemList',
                    index,
                    'claimItemDetail',
                  ]);
                  const claimItemAmount = form?.getFieldValue([
                    'itemList',
                    index,
                    'claimItemAmount',
                  ]);

                  console.log({ claimItemDetail, claimItemAmount });
                  return (
                    <Flex key={field.key} align="center" gap={12}>
                      <div
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#f5f5f5',
                        }}
                      >
                        <Row gutter={12}>
                          <Col span={8}>
                            <Row gutter={12}>
                              <Col span={12}>
                                <Form.Item
                                  label="Claim Details"
                                  name={[field.name, 'claimItemDetail']}
                                >
                                  <Text type="secondary">
                                    {claimItemDetail ?? '-'}
                                  </Text>
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item
                                  label={`Claim Amount (${CountryCurrencyEnumText[countryId as number]})`}
                                  name={[field.name, 'claimItemAmount']}
                                >
                                  <Text type="secondary">
                                    {formatAmount(claimItemAmount)}
                                  </Text>
                                </Form.Item>
                              </Col>
                            </Row>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              label="Refund Details"
                              name={[field.name, 'detail']}
                              rules={[
                                {
                                  whitespace: true,
                                  message: 'Cannot only contain spaces',
                                },
                              ]}
                            >
                              <Input.TextArea
                                disabled={descriptionDisabled}
                                placeholder="Refund Details"
                                showCount
                                rows={1}
                                maxLength={MAX_LENGTH.NAME_200}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item
                              label={`Refund Amount (${CountryCurrencyEnumText[countryId as number]})`}
                              name={[field.name, 'amount']}
                              rules={[
                                {
                                  required: true,
                                  message: `Please enter Refund Amount`,
                                },
                              ]}
                            >
                              <InputNumber
                                disabled={descriptionDisabled}
                                placeholder="Refund Amount"
                                min={0}
                                precision={2}
                                controls={false}
                                formatter={(val) => {
                                  return val ? formatAmount(val) : '';
                                }}
                                suffix={<CountryIcon />}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    </Flex>
                  );
                })}
              </Flex>
              {errors?.length > 0 ? (
                <Form.Item>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              ) : null}
            </>
          );
        }}
      </Form.List>
    </>
  );
};

export const FieldOcStatus: FC<ICommonFieldProps> = ({ form }) => {
  const totalAmount = Form.useWatch('totalAmount', form);
  const itemList = Form.useWatch(['itemList'], form);
  const [disabled, setDisabled] = useState(false);

  const validateDescription = async () => {
    setTimeout(() => {
      form
        ?.validateFields(['itemList'], { recursive: true })
        .then(() => {
          if (totalAmount === 0) {
            setDisabled(true);
            form?.setFields([
              {
                name: 'ocStatus',
                value: EnumClaimOcStatus.Not_Chargeable,
                errors: [
                  'Total Refund Amount = 0. Update to non-zero first to modify OC Status.',
                ],
              },
            ]);
          } else {
            setDisabled(false);
            form?.setFields([
              {
                name: 'ocStatus',
                errors: [],
              },
            ]);
          }
        })
        .catch(() => {
          setDisabled(true);
          form?.setFields([
            {
              name: 'ocStatus',
              errors: ['Please fill Description first'],
            },
          ]);
        });
    }, 0);
  };

  useEffect(() => {
    validateDescription();
  }, [itemList, totalAmount]);

  return (
    <Form.Item
      label="OC Status"
      name="ocStatus"
      rules={[{ required: true, message: 'Please select OC Status' }]}
    >
      <Select
        placeholder="OC Status"
        options={ocStatusRefundOptions}
        disabled={disabled}
      />
    </Form.Item>
  );
};

export const FieldRemark: FC<ICommonFieldProps> = () => {
  return (
    <Form.Item label="Remark" name="remark">
      <Input.TextArea
        rows={1}
        placeholder="Remark"
        showCount
        maxLength={MAX_LENGTH.MAX_1000}
      />
    </Form.Item>
  );
};

export const FieldProof: FC<
  ICommonFieldProps & { getUploadingSize: (uploadingSize: number) => void }
> = ({ form, getUploadingSize }) => {
  const ocStatus = Form.useWatch('ocStatus', form);
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (ocStatus === EnumClaimOcStatus.Ongoing_Validation) {
      setRequired(false);

      form?.setFields([
        {
          name: 'documentIdList',
          errors: [],
        },
      ]);
    } else {
      setRequired(true);
    }
  }, [ocStatus]);

  return (
    <Form.Item
      name="documentIdList"
      label="Proof"
      required={required}
      rules={[
        {
          required: required,
          message: 'Please upload Proof',
        },
      ]}
    >
      <OssUpload
        dir={ENUM_OSS_MENU_DIRECTORY.PROJECT}
        showModeBar={true}
        scrollHeight={200}
        getUploadingSize={getUploadingSize}
      />
    </Form.Item>
  );
};
