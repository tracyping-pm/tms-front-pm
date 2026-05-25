import { claimGetWaybillInfo } from '@/api/claim';
import FuzzySelector from '@/components/FuzzySelector';
import { ES_DTO_CLASS, MAX_LENGTH } from '@/constants';
import {
  CountryCurrencyEnumText,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  WaybillStatusEnum,
} from '@/enums';
import { EnumExternalClaimsType, ExternalClaimsEnumText } from '@/enums/claim';
import { formatAmount } from '@/utils/utils';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import {
  Button,
  Col,
  Divider,
  Form,
  FormInstance,
  InputNumber,
  message,
  Row,
  Select,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import styles from './index.less';
export default function CustomFormList({
  isDetail = false,
  totalAmount,
  customerId,
  form,
}: {
  isDetail?: boolean;
  form: FormInstance;
  totalAmount?: number;
  customerId?: number;
}) {
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;

  return (
    <>
      {!isDetail && <Divider plain>{'Description'}</Divider>}
      {!isDetail && (
        <div style={{ marginBottom: 12 }}>
          Total Claim Amount({CountryCurrencyEnumText[countryId as number]}):
          {formatAmount(totalAmount || 0)}
        </div>
      )}
      <Form.List name="description" initialValue={['']}>
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => {
              return (
                <div className={styles.ticketItem} key={field.key}>
                  <Row gutter={4} className={styles.ticketFormItem}>
                    <Col span={isDetail ? 3 : 4}>
                      <Form.Item
                        {...field}
                        label={'Claim Type'}
                        name={[field.name, 'claimType']}
                        key={field.key + 'claimType'}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter Claim Type',
                          },
                        ]}
                      >
                        <Select
                          placeholder="Claim Type"
                          options={Object.keys(ExternalClaimsEnumText).map(
                            (key) => ({
                              label:
                                ExternalClaimsEnumText[
                                  key as EnumExternalClaimsType
                                ],
                              value: key,
                            }),
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={isDetail ? 3 : 5}>
                      <Form.Item
                        {...field}
                        label={'Waybill'}
                        name={[field.name, 'waybillNumber']}
                        key={field.key + 'waybillNumber'}
                        dependencies={['description', field.name, 'claimType']}
                        rules={[
                          {
                            required:
                              form.getFieldValue([
                                'description',
                                field.name,
                                'claimType',
                              ]) === EnumExternalClaimsType.Delivery_Claims,
                            message: 'Please enter Waybill Number',
                          },
                        ]}
                      >
                        <FuzzySelector
                          fieldProps={{
                            placeholder: 'Waybill Number',
                          }}
                          request={{
                            field: 'waybillNumber',
                            esDtoClass: ES_DTO_CLASS.WAYBILL,
                            type: FieldQueryHighlightTypeEnum.USER_ROLE,
                          }}
                          onChange={async (value) => {
                            if (value) {
                              //@ts-ignore
                              const waybillNumberId = value?.id;
                              const res =
                                await claimGetWaybillInfo(waybillNumberId);

                              if (res.code === 200) {
                                const responsiblePartyValue =
                                  form.getFieldValue([
                                    'description',
                                    field.name,
                                    'responsibleParty',
                                  ]);
                                form.setFieldValue(
                                  [
                                    'description',
                                    field.name,
                                    'waybillResponsibleParty',
                                  ],
                                  {
                                    name: res.data.vendorName,
                                    id: res.data.vendorId,
                                  },
                                );
                                if (
                                  res?.data?.waybillStatus ===
                                  WaybillStatusEnum.CANCELED
                                ) {
                                  form.setFields([
                                    {
                                      name: [
                                        'description',
                                        field.name,
                                        'waybillNumber',
                                      ],
                                      errors: [
                                        'Cancelled waybill cannot be selected',
                                      ],
                                      validating: false,
                                      // touched: true,
                                    },
                                  ]);
                                  return;
                                }
                                if (res.data.vendorId === null) {
                                  form.setFields([
                                    {
                                      name: [
                                        'description',
                                        field.name,
                                        'waybillNumber',
                                      ],
                                      errors: [
                                        'The responsible party should match the vendor of the waybill.',
                                      ],
                                      validating: true,
                                    },
                                  ]);
                                  return;
                                }
                                if (res?.data?.customerId !== customerId) {
                                  form.setFields([
                                    {
                                      name: [
                                        'description',
                                        field.name,
                                        'waybillNumber',
                                      ],
                                      errors: ['Non-customer waybill'],
                                      validating: false,
                                      // touched: true,
                                    },
                                  ]);
                                  return;
                                }

                                if (
                                  responsiblePartyValue?.id !==
                                    res.data?.vendorId &&
                                  responsiblePartyValue?.id !== 0
                                ) {
                                  message.warning(
                                    'The Responsible Party has been changed to the waybill vendor',
                                  );

                                  form.setFieldValue(
                                    [
                                      'description',
                                      field.name,
                                      'responsibleParty',
                                    ],
                                    {
                                      name: res.data.vendorName,
                                      id: res.data.vendorId,
                                    },
                                  );
                                }
                              }
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={isDetail ? 3 : 5}>
                      <Form.Item
                        {...field}
                        label={'Responsible Party'}
                        name={[field.name, 'responsibleParty']}
                        key={field.key + 'responsibleParty'}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter Responsible Party',
                          },
                        ]}
                      >
                        <FuzzySelector
                          fieldProps={{
                            placeholder: 'Responsible Party',
                          }}
                          request={{
                            field: 'vendorName',
                            esDtoClass: ES_DTO_CLASS.VENDOR,
                            type: FieldQueryHighlightTypeEnum.COUNTRY,
                            uniqueLogic:
                              FieldQueryHighlightUniqueLogicEnum.CLAIM_REQUEST,
                          }}
                          onChange={async (value) => {
                            if (value) {
                              const waybillResponsibleParty =
                                form.getFieldValue([
                                  'description',
                                  field.name,
                                  'waybillResponsibleParty',
                                ]);
                              //@ts-ignore
                              const vendorId = value?.id;
                              // 如果责任方是ITK, 则，默认为全部金额 都为ITK Expense
                              if (vendorId === 0) {
                                const amount = form.getFieldValue([
                                  'description',
                                  field.name,
                                  'claimAmount',
                                ]);
                                form.setFieldValue(
                                  [
                                    'description',
                                    field.name,
                                    'inteluckExpenseAmount',
                                  ],
                                  amount,
                                );
                                form.setFieldValue(
                                  [
                                    'description',
                                    field.name,
                                    'vendorLiabilityAmount',
                                  ],
                                  0,
                                );
                              }
                              if (
                                (vendorId !== waybillResponsibleParty?.id ||
                                  vendorId === null) &&
                                waybillResponsibleParty &&
                                vendorId !== 0
                              ) {
                                form.setFields([
                                  {
                                    name: [
                                      'description',
                                      field.name,
                                      'responsibleParty',
                                    ],
                                    errors: [
                                      'The responsible party should match the vendor of the waybill.',
                                    ],
                                    validating: true,
                                  },
                                ]);
                              }
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={isDetail ? 3 : 5}>
                      <Form.Item
                        {...field}
                        label={'Claim Details'}
                        name={[field.name, 'claimDetails']}
                        key={field.key + 'claimDetails'}
                        rules={[
                          {
                            whitespace: true,
                            message: 'Cannot only contain spaces',
                          },
                          {
                            max: MAX_LENGTH.NAME_200,
                            message: `Cannot exceed ${MAX_LENGTH.NAME_200} characters`,
                          },
                        ]}
                      >
                        <TextArea
                          autoSize={{ minRows: 1, maxRows: 4 }}
                          placeholder="Claim Details"
                          showCount
                          maxLength={200}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={isDetail ? 3 : 5}>
                      <Form.Item
                        {...field}
                        label={`Claim Amount (${CountryCurrencyEnumText[countryId as number]})`}
                        name={[field.name, 'claimAmount']}
                        key={field.key + 'claimAmount'}
                        rules={[
                          {
                            required: true,
                            message: 'Please enter Claim Amount',
                          },
                        ]}
                      >
                        <InputNumber
                          placeholder="Claim Amount"
                          min={0}
                          precision={2}
                          controls={false}
                          style={{ width: '100%' }}
                          formatter={(val) => formatAmount(val!)}
                          onChange={async (value) => {
                            const responsibleParty = form.getFieldValue([
                              'description',
                              field.name,
                              'responsibleParty',
                            ]);

                            const id = responsibleParty?.id;
                            // 如果责任方是ITK, 则，默认为全部金额 都为ITK Expense
                            if (id === 0) {
                              form.setFieldValue(
                                [
                                  'description',
                                  field.name,
                                  'inteluckExpenseAmount',
                                ],
                                value ?? 0,
                              );
                            }
                          }}
                        />
                      </Form.Item>
                    </Col>
                    {isDetail && (
                      <Col style={{ width: '18%' }}>
                        <Form.Item
                          {...field}
                          label={`Vendor Liability Amount(${CountryCurrencyEnumText[countryId as number]})`}
                          name={[field.name, 'vendorLiabilityAmount']}
                          key={field.key + 'vendorLiabilityAmount'}
                          dependencies={[
                            'description',
                            field.name,
                            'inteluckExpenseAmount',
                          ]}
                          rules={[
                            {
                              required: true,
                              // message: 'Please enter Vendor Liability Amount',
                              message: '',
                            },
                            {
                              validator: (_, value) => {
                                if (value === undefined || value === null) {
                                  return Promise.reject(
                                    new Error(
                                      'Please enter Vendor Liability Amount',
                                    ),
                                  );
                                }

                                const claimAmount = form.getFieldValue([
                                  'description',
                                  field.name,
                                  'claimAmount',
                                ]);
                                const inteluckExpenseAmount =
                                  form.getFieldValue([
                                    'description',
                                    field.name,
                                    'inteluckExpenseAmount',
                                  ]);

                                if (
                                  (inteluckExpenseAmount !== undefined &&
                                    value + inteluckExpenseAmount >
                                      claimAmount) ||
                                  value > claimAmount
                                ) {
                                  return Promise.reject(
                                    new Error(
                                      'The sum of Vendor Liability Amount and Inteluck Expense Amount cannot exceed Claim Amount',
                                    ),
                                  );
                                }
                                if (
                                  inteluckExpenseAmount !== undefined &&
                                  value + inteluckExpenseAmount < claimAmount
                                ) {
                                  return Promise.reject(
                                    new Error(
                                      'The sum of the Vendor liability amount and Inteluck Expense amount is not the claim amount',
                                    ),
                                  );
                                }
                                if (
                                  inteluckExpenseAmount !== undefined &&
                                  value + inteluckExpenseAmount === claimAmount
                                ) {
                                  form.setFields([
                                    {
                                      name: [
                                        'description',
                                        field.name,
                                        'inteluckExpenseAmount',
                                      ],
                                      errors: [],
                                    },
                                  ]);
                                }

                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder="Vendor Liability Amount"
                            min={0}
                            precision={2}
                            controls={false}
                            style={{ width: '100%' }}
                            formatter={(val) => formatAmount(val!)}
                            disabled={
                              isDetail &&
                              form.getFieldValue([
                                'description',
                                field.name,
                                'responsibleParty',
                              ])?.id === 0
                            }
                          />
                        </Form.Item>
                      </Col>
                    )}
                    {isDetail && (
                      <Col style={{ width: '19%' }}>
                        <Form.Item
                          {...field}
                          label={`Inteluck Expense Amount(${CountryCurrencyEnumText[countryId as number]})`}
                          name={[field.name, 'inteluckExpenseAmount']}
                          key={field.key + 'inteluckExpenseAmount'}
                          dependencies={[
                            'description',
                            field.name,
                            'vendorLiabilityAmount',
                          ]}
                          rules={[
                            {
                              required: true,
                              message: '',
                            },
                            {
                              validator: (_, value) => {
                                console.log(value);
                                if (value === undefined || value === null) {
                                  return Promise.reject(
                                    new Error(
                                      'Please enter Inteluck Expense Amount',
                                    ),
                                  );
                                }
                                const claimAmount = form.getFieldValue([
                                  'description',
                                  field.name,
                                  'claimAmount',
                                ]);
                                const vendorLiabilityAmount =
                                  form.getFieldValue([
                                    'description',
                                    field.name,
                                    'vendorLiabilityAmount',
                                  ]);

                                if (
                                  (vendorLiabilityAmount !== undefined &&
                                    value + vendorLiabilityAmount >
                                      claimAmount) ||
                                  value > claimAmount
                                ) {
                                  return Promise.reject(
                                    new Error(
                                      'The sum of Vendor Liability Amount and Inteluck Expense Amount cannot exceed Claim Amount',
                                    ),
                                  );
                                }
                                if (
                                  (vendorLiabilityAmount !== undefined &&
                                    value + vendorLiabilityAmount <
                                      claimAmount) ||
                                  value > claimAmount
                                ) {
                                  return Promise.reject(
                                    new Error(
                                      'The sum of Vendor Liability Amount and Inteluck Expense Amount is not the claim amount',
                                    ),
                                  );
                                }
                                if (
                                  vendorLiabilityAmount !== undefined &&
                                  value + vendorLiabilityAmount === claimAmount
                                ) {
                                  form.setFields([
                                    {
                                      name: [
                                        'description',
                                        field.name,
                                        'vendorLiabilityAmount',
                                      ],
                                      errors: [],
                                    },
                                  ]);
                                }

                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder="Inteluck Expense Amount"
                            min={0}
                            precision={2}
                            controls={false}
                            disabled={
                              isDetail &&
                              form.getFieldValue([
                                'description',
                                field.name,
                                'responsibleParty',
                              ])?.id === 0
                            }
                            formatter={(val) => formatAmount(val!)}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                  <div
                    style={{
                      width: '90px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {index !== 0 ? (
                      <Button
                        icon={<MinusOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    ) : null}

                    <Button icon={<PlusOutlined />} onClick={() => add()} />
                  </div>
                </div>
              );
            })}
            <div className={styles.fakeErrors}>{errors}</div>
          </>
        )}
      </Form.List>
    </>
  );
}
