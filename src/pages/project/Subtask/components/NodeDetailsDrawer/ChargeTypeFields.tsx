import { ICommonMaterial } from '@/api/types/common';
import { IExecutionNodes, IFieldOptions, IFields } from '@/api/types/subtask';
import CommonFileItem from '@/components/CommonFileItem';
import NoRequestFileItem from '@/components/CommonFileItem/NoRequestFileItem';
import CustomTooltip from '@/components/CustomTooltip';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import NoRequestUpload from '@/components/CustomUpload/NoRequestUpload';
import { MAX_LENGTH } from '@/constants';
import {
  CountryCurrencyEnumText,
  CustomerFieldTypeText,
  FieldTypeEnum,
  UploadPathTypeEnum,
  VendorFieldTypeText,
} from '@/enums';
import { formatAmount } from '@/utils/utils';
import {
  ProFormDigit,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Col, Divider, Form, Row } from 'antd';
import cls from 'classnames';
import { clone } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import styles from './index.less';

export default (props: {
  formItemData: IFields;
  record: IExecutionNodes;
  readOnly: boolean;
  entityId: number;
  subtaskName: string;
  getFilesData: (v: Record<number, File[]>) => void;
}) => {
  const {
    formItemData,
    record,
    readOnly,
    entityId,
    subtaskName,
    getFilesData,
  } = props;
  const [noRequestFiles, setNoRequestFiles] = useState<Record<number, File[]>>(
    {},
  );
  const countryId =
    useModel('@@initialState')?.initialState?.currentUser?.countryId;
  const [customerList, setCustomerList] = useState<string[]>([]);
  const [vendorList, setVendorList] = useState<string[]>([]);

  const onFulfilled = (file: File, order: number) => {
    const files = clone(noRequestFiles);
    files[order] = files[order] ?? [];
    files[order].push(file);
    setNoRequestFiles(files);
    getFilesData?.(files);
  };

  const handleDeleteNoRequestFile = (index: number, order: number) => {
    const files = clone(noRequestFiles);
    files[order].splice(index, 1);
    setNoRequestFiles(files);
    getFilesData?.(files);
  };

  const chargeFieldsInit = () => {
    if (
      formItemData?.fieldType === FieldTypeEnum.CUSTOMER_CHARGE_GROUP ||
      formItemData?.fieldType === FieldTypeEnum.VENDOR_CHARGE_GROUP
    ) {
      let fieldParse: any[] = [];
      try {
        fieldParse = JSON.parse(formItemData?.fieldValue as string);
      } catch (error) {}
      let customers: string[] = [];
      let vendors: string[] = [];
      fieldParse?.forEach((item) => {
        if (formItemData?.fieldType === FieldTypeEnum.CUSTOMER_CHARGE_GROUP) {
          let toStr = JSON.stringify({
            title: item.fieldName,
            name: CustomerFieldTypeText[item.fieldName],
            order: item.order,
            value: item?.fieldValue ? item?.fieldValue : {},
          });
          customers = [...customers, toStr];
        } else {
          let toStr = JSON.stringify({
            title: item.fieldName,
            name: VendorFieldTypeText[item.fieldName],
            order: item.order,
            value: item?.fieldValue ? item?.fieldValue : {},
          });
          vendors = [...vendors, toStr];
        }
      });
      setCustomerList(customers);
      setVendorList(vendors);
    }
  };

  useEffect(() => {
    chargeFieldsInit();
  }, [formItemData]);

  const ChargeTypeFields = useCallback(() => {
    const type = formItemData.fieldType;
    let fieldParse: any[] = []; // form数据
    let valueParse: any[] = []; // form选项
    let valueOptions: any[] = []; // 选项
    let defaultValue: any; // 选项
    if (formItemData?.valueOptions) {
      try {
        valueParse = JSON.parse(formItemData?.valueOptions);
      } catch (error) {}
    }
    if (
      formItemData?.fieldType === FieldTypeEnum.CUSTOMER_CHARGE_GROUP ||
      formItemData?.fieldType === FieldTypeEnum.VENDOR_CHARGE_GROUP
    ) {
      try {
        fieldParse = JSON.parse(formItemData?.fieldValue);
      } catch (error) {}
      valueOptions = (formItemData?.fieldValue ? fieldParse : valueParse)?.map(
        (item: IFields) => ({
          label: item.fieldName,
          value: JSON.stringify({
            title: item.fieldName,
            name:
              formItemData?.fieldType === FieldTypeEnum.CUSTOMER_CHARGE_GROUP
                ? CustomerFieldTypeText[item.fieldName]
                : VendorFieldTypeText[item.fieldName],
            order: item.order,
            value: item?.fieldValue ? item?.fieldValue : {},
          }),
        }),
      );
    } else {
      valueOptions = valueParse?.map(
        (item: { operation: string; defaultSelected?: 0 | 1 }) => ({
          label: item.operation,
          value: item.operation,
          defaultSelected: Boolean(item.defaultSelected),
        }),
      );
      defaultValue = valueOptions?.find?.(
        (item: { defaultSelected: boolean }) => item.defaultSelected,
      )?.value;
    }

    switch (type) {
      case FieldTypeEnum.DROPDOWN_LIST:
        return (
          <ProFormSelect
            name={[formItemData.order, 'fieldValue']}
            initialValue={defaultValue}
            label={
              <CustomTooltip title={formItemData.fieldName ?? '-'}>
                <div
                  className={cls(styles.customLabel, 'ellipsis')}
                >{`${formItemData.fieldName}`}</div>
              </CustomTooltip>
            }
            fieldProps={{
              placeholder: `Please Select ${formItemData.fieldName}`,
              options: valueOptions,
            }}
            rules={[
              {
                required: formItemData.required,
                message: `Please Select ${formItemData.fieldName}`,
              },
            ]}
          />
        );
      case FieldTypeEnum.FILE_UPLOAD:
        return (
          <Form.Item
            name={[formItemData.order, 'fieldValue']}
            label={
              <CustomTooltip title={formItemData.fieldName ?? '-'}>
                <div
                  className={cls(styles.customLabel, 'ellipsis')}
                >{`${formItemData.fieldName}`}</div>
              </CustomTooltip>
            }
            rules={[
              {
                required: formItemData.required,
                message: `Please Select ${formItemData.fieldName}`,
              },
            ]}
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {formItemData?.materials?.map((item: ICommonMaterial) => {
                return (
                  <CommonFileItem
                    key={item.fileMaterialId}
                    thumbnail={item.fileThumbnailUrl}
                    fileType={item.fileType}
                    fileName={item.fileName}
                    materialId={item.fileMaterialId}
                    driveFileId={item.fileDriveId}
                    fileMimeType={item.fileMimeType}
                  />
                );
              })}
              {noRequestFiles[formItemData.order]?.map(
                (item: File, index: number) => (
                  <NoRequestFileItem
                    key={index}
                    file={item}
                    showDelete
                    onDeleteTrigger={() =>
                      handleDeleteNoRequestFile(index, formItemData.order)
                    }
                  />
                ),
              )}
              {!readOnly && !record?.operationTime ? (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    columnGap: '16px',
                  }}
                >
                  <NoRequestUpload
                    onFulfilled={(fileData) => {
                      onFulfilled(fileData, formItemData.order);
                    }}
                  />
                  <div
                    style={{
                      width: '168px',
                      color: '#00000073',
                      lineHeight: '22px',
                    }}
                  >
                    A single file cannot exceed 50 MB
                  </div>
                </div>
              ) : null}
            </div>
          </Form.Item>
        );
      case FieldTypeEnum.CUSTOMER_CHARGE_GROUP:
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ProFormSelect
              name={[formItemData.order, 'fieldValue']}
              // initialValue={defaultValue}
              label={
                <CustomTooltip title={formItemData.fieldName ?? '-'}>
                  <div
                    className={cls(styles.customLabel, 'ellipsis')}
                  >{`${formItemData.fieldName}`}</div>
                </CustomTooltip>
              }
              fieldProps={{
                onChange(value: string[]) {
                  setCustomerList(value);
                },
                placeholder: `Please Select ${formItemData.fieldName}`,
                options: valueOptions,
                mode: 'multiple',
              }}
              rules={[
                {
                  required: formItemData.required,
                  message: `Please Select ${formItemData.fieldName}`,
                },
              ]}
            />

            {customerList.map((c, i) => {
              let option: IFieldOptions = {} as IFieldOptions;
              try {
                option = JSON.parse(c);
              } catch (error) {}
              return (
                <div key={c}>
                  <Divider plain style={{ marginTop: '0' }}>
                    {option.title}
                  </Divider>
                  <Row>
                    <Col span={6}>
                      <CustomTooltip
                        title={`${option.title} Amount`}
                        placement="topRight"
                      >
                        <div
                          className={cls(
                            styles.customLabelCharge,
                            formItemData.required && styles.customLabelRequired,
                            readOnly && styles.customLabelMargin,
                            'ellipsis',
                          )}
                        >
                          {`${option.title} Amount`}
                          <div className={styles.customLabelChargeSymbol}>
                            :
                          </div>
                        </div>
                      </CustomTooltip>
                    </Col>
                    <Col span={18} style={{ display: 'flex' }}>
                      {!readOnly ? (
                        <>
                          <ProFormSelect
                            name={[option.order, 'symbol']}
                            label={null}
                            initialValue={'None'}
                            valueEnum={{
                              None: 'None',
                              '-': '-',
                              '+': '+',
                            }}
                            placeholder="Please select "
                            formItemProps={{
                              style: { width: 130 },
                            }}
                            rules={[
                              {
                                required: formItemData.required,
                                message: `Please Enter `,
                              },
                            ]}
                          />
                          <ProFormDigit
                            name={[option.order, 'amount']}
                            label={null}
                            initialValue={0}
                            // disabled={data[formItemData.order].symbol === 'None'}
                            placeholder="Please enter "
                            min={0}
                            max={99999999.99}
                            formItemProps={{
                              className: styles.commonChargeFields,
                              style: { flex: 1 },
                            }}
                            fieldProps={{
                              precision: 2,
                              prefix: CountryCurrencyEnumText[countryId as any],
                              formatter: (v: any) => formatAmount(v),
                            }}
                            rules={[
                              {
                                required: formItemData.required,
                                message: `Please Enter ${option.title} Amount`,
                              },
                            ]}
                          />
                        </>
                      ) : option?.value?.symbol ? (
                        <>
                          {`${option?.value?.symbol === 'None' ? '' : option?.value?.symbol} ${CountryCurrencyEnumText[countryId as any]} ${option?.value?.amount}`}
                        </>
                      ) : (
                        '-'
                      )}
                    </Col>
                  </Row>

                  <ProFormTextArea
                    name={[option.order, 'remark']}
                    label={
                      <CustomTooltip title={`${option.title} Remark`}>
                        <div className={cls(styles.customLabel, 'ellipsis')}>
                          {`${option.title} Remark`}
                        </div>
                      </CustomTooltip>
                    }
                    placeholder="description"
                    rules={[
                      {
                        whitespace: true,
                        message: 'Not support all spaces',
                      },
                      {
                        max: MAX_LENGTH.MAX_5000,
                        message: `${option.title} Remark cannot exceed ${MAX_LENGTH.MAX_5000} characters`,
                      },
                    ]}
                  />

                  <Form.Item
                    name={[option.order, 'files']}
                    label={
                      <CustomTooltip title={`${option.title} File`}>
                        <div className={cls(styles.customLabel, 'ellipsis')}>
                          {`${option.title} File`}
                        </div>
                      </CustomTooltip>
                    }
                    rules={[
                      {
                        required: formItemData.required,
                        message: `Please Select ${`${option.title} File`}`,
                      },
                    ]}
                  >
                    <DraggerUpload
                      disabled={readOnly}
                      showModeBar={false}
                      materialList={
                        option?.value?.files ? option?.value?.files : []
                      }
                      scrollHeight={150}
                      dto={{
                        entityId: entityId,
                        pathType: UploadPathTypeEnum.SUBTASK,
                        customParamMap: {
                          subtaskName,
                        },
                      }}
                      getUploadingSize={() => {}}
                    />
                  </Form.Item>

                  {i === customerList.length - 1 ? (
                    <Divider plain style={{ marginTop: '0' }}></Divider>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      case FieldTypeEnum.VENDOR_CHARGE_GROUP:
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <ProFormSelect
              name={[formItemData.order, 'fieldValue']}
              // initialValue={defaultValue}
              label={
                <CustomTooltip title={formItemData.fieldName ?? '-'}>
                  <div
                    className={cls(styles.customLabel, 'ellipsis')}
                  >{`${formItemData.fieldName}`}</div>
                </CustomTooltip>
              }
              fieldProps={{
                onChange(value: string[]) {
                  setVendorList(value);
                },
                placeholder: `Please Select ${formItemData.fieldName}`,
                options: valueOptions,
                mode: 'multiple',
              }}
              rules={[
                {
                  required: formItemData.required,
                  message: `Please Select ${formItemData.fieldName}`,
                },
              ]}
            />

            {vendorList.map((v, i) => {
              let option: IFieldOptions = {} as IFieldOptions;
              try {
                option = JSON.parse(v);
              } catch (error) {}
              return (
                <div key={v}>
                  <Divider plain style={{ marginTop: '0' }}>
                    {option.title}
                  </Divider>
                  <Row>
                    <Col span={6}>
                      <CustomTooltip
                        title={`${option.title} Amount`}
                        placement="topRight"
                      >
                        <div
                          className={cls(
                            styles.customLabelCharge,
                            formItemData.required && styles.customLabelRequired,
                            readOnly && styles.customLabelMargin,
                            'ellipsis',
                          )}
                        >
                          {`${option.title} Amount`}
                          <div className={styles.customLabelChargeSymbol}>
                            :
                          </div>
                        </div>
                      </CustomTooltip>
                    </Col>
                    <Col span={18} style={{ display: 'flex' }}>
                      {!readOnly ? (
                        <>
                          <ProFormSelect
                            name={[option.order, 'symbol']}
                            label={null}
                            initialValue={'None'}
                            valueEnum={{
                              None: 'None',
                              '-': '-',
                              '+': '+',
                            }}
                            placeholder="Please select "
                            formItemProps={{
                              style: { width: 130 },
                            }}
                            rules={[
                              {
                                required: formItemData.required,
                                message: `Please Enter `,
                              },
                            ]}
                          />
                          <ProFormDigit
                            name={[option.order, 'amount']}
                            label={null}
                            initialValue={0}
                            // disabled={data[formItemData.order].symbol === 'None'}
                            placeholder="Please enter "
                            min={0}
                            max={99999999.99}
                            formItemProps={{
                              className: styles.commonChargeFields,
                              style: { flex: 1 },
                            }}
                            fieldProps={{
                              precision: 2,
                              prefix: CountryCurrencyEnumText[countryId as any],
                              formatter: (value: any) => formatAmount(value),
                            }}
                            rules={[
                              {
                                required: formItemData.required,
                                message: `Please Enter ${option.title} Amount`,
                              },
                            ]}
                          />
                        </>
                      ) : option?.value?.symbol ? (
                        <>
                          {`${option?.value?.symbol === 'None' ? '' : option?.value?.symbol} ${CountryCurrencyEnumText[countryId as any]} ${option?.value?.amount}`}
                        </>
                      ) : (
                        '-'
                      )}
                    </Col>
                  </Row>

                  <ProFormTextArea
                    name={[option.order, 'remark']}
                    label={
                      <CustomTooltip title={`${option.title} Remark`}>
                        <div className={cls(styles.customLabel, 'ellipsis')}>
                          {`${option.title} Remark`}
                        </div>
                      </CustomTooltip>
                    }
                    placeholder="description"
                    rules={[
                      {
                        whitespace: true,
                        message: 'Not support all spaces',
                      },
                      {
                        max: MAX_LENGTH.MAX_5000,
                        message: `${option.title} Remark cannot exceed ${MAX_LENGTH.MAX_5000} characters`,
                      },
                    ]}
                  />

                  <Form.Item
                    name={[option.order, 'files']}
                    label={
                      <CustomTooltip title={`${option.title} File`}>
                        <div className={cls(styles.customLabel, 'ellipsis')}>
                          {`${option.title} File`}
                        </div>
                      </CustomTooltip>
                    }
                    rules={[
                      {
                        required: formItemData.required,
                        message: `Please Select ${`${option.title} File`}`,
                      },
                    ]}
                  >
                    <DraggerUpload
                      disabled={readOnly}
                      showModeBar={false}
                      materialList={
                        option?.value?.files ? option?.value?.files : []
                      }
                      scrollHeight={150}
                      dto={{
                        entityId: entityId,
                        pathType: UploadPathTypeEnum.SUBTASK,
                        customParamMap: {
                          subtaskName,
                        },
                      }}
                      getUploadingSize={() => {}}
                    />
                  </Form.Item>

                  {i === vendorList.length - 1 ? (
                    <Divider plain style={{ marginTop: '0' }}></Divider>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      default:
        return <></>;
    }
  }, [formItemData, customerList, vendorList]);

  return (
    <>
      <ChargeTypeFields />
    </>
  );
};
