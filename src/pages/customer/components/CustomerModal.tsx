import { customerIndustryList, customerNameAndTagCheck } from '@/api/customer';
import {
  placeCity,
  placeGeoProvince,
  placeGeoRegion,
  placeGeoResolveAddressResult,
  placeLeoCity,
  placeProvince,
  placeRegion,
} from '@/api/place';
import { ICommonMaterial } from '@/api/types/common';
import { ICustomerRecord } from '@/api/types/customer';
import { IPlaceGeoRecord, IPlaceRecord } from '@/api/types/place';
import { waybillRouteAddressCheck } from '@/api/waybill';
import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';
import CommonFileItem from '@/components/CommonFileItem';
import NoRequestFileItem from '@/components/CommonFileItem/NoRequestFileItem';
import NoRequestUpload from '@/components/CustomUpload/NoRequestUpload';
import { IMeta } from '@/components/LocatorModal';
import {
  CustomerPriorityOptions,
  MAX_LENGTH,
  PATHS,
  REGEXP,
} from '@/constants';
import {
  BUEnumText,
  ContactTypeEnumText,
  CountryEnumLabelListMap,
  CustomerSizeEnumText,
  ReachOutChannelEnumText,
  TaxTypeEnumText,
} from '@/enums';
import { formatString } from '@/utils/format';
import { openNewTag } from '@/utils/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormCascader,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Col, Form, Input, Popover, Row, Spin, message } from 'antd';
import { debounce, default as lodash } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';

type ICustomerModal = ModalFormProps & {
  open: boolean;
  isEdit?: boolean;
  record?: ICustomerRecord;
  onConfirm?: (values: any, b: boolean) => void;
};

export interface IOfficeAddressMeta {
  officeAddressLevel?: number;
  officeAddressAddress: string;
  officeAddressLat: number;
  officeAddressLng: number;
}

const CustomerModal = ({
  title,
  open,
  isEdit = false,
  record,
  onConfirm,
  width = 986,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { initialState } = useModel('@@initialState');
  const formRef = useRef<ProFormInstance>();
  const [noRequestFiles, setNoRequestFiles] = useState<File[]>([]);
  const [material, setMaterial] = useState<ICommonMaterial | null>();
  const [deletedFileId, setDeletedFileId] = useState<number>();
  const [isMatched, setIsMatched] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [helpCustomerNameMessage, setHelpCustomerNameMessage] =
    useState<React.ReactNode | null>(null);
  const [helpCustomerTagMessage, setHelpCustomerTagMessage] =
    useState<React.ReactNode | null>(null);
  const countryId = initialState?.currentUser?.countryId ?? 1;
  const countryName = initialState?.currentUser?.countryName;
  // @ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];
  const curSelectedAddress = useRef<IOfficeAddressMeta | undefined>();

  const DEFAULT_VALUES = {
    customerName: '',
    customerTag: '',
    industryIdList: [],
    country: countryId,
    countryName: countryName,
    customerTaxMark: undefined,
    pad: undefined,
    sad: undefined,
    tad: undefined,
    priority: undefined,
    size: undefined,
    contactType: undefined,
    currentMarketShareMin: undefined,
    currentMarketShareMax: undefined,
  };

  const conversionValue = (val: any) => {
    if (val === null || val === undefined || val === '') {
      return undefined;
    }
    return val;
  };

  const handleOk = useCallback(async () => {
    if (!isMatched) {
      formRef?.current?.setFields([
        {
          name: 'address',
          errors: ['The address does not match the region range'],
        },
      ]);
      return;
    }

    const values = formRef?.current?.getFieldsValue?.();
    let { currentMarketShareMin, currentMarketShareMax } = values;
    if (+currentMarketShareMin > +currentMarketShareMax) {
      [currentMarketShareMin, currentMarketShareMax] = [
        currentMarketShareMax,
        currentMarketShareMin,
      ];
    }
    if (isEdit) {
      values.id = record?.id;
      values.tad = values?.tad ?? 0;
      values.sad = values?.sad ?? 0;
    }
    const dto = {
      id: values.id,
      deletedFileId: deletedFileId,
      customerName: formatString(values.customerName),
      customerTaxMark: values.customerTaxMark,
      customerTag: formatString(values.customerTag),
      industryIdList: values.industryIdList,
      country: countryId,
      pad: values.pad,
      sad: values.sad,
      tad: values.tad,
      priority: values.priority,
      size: values.size,
      contactType: values.contactType,
      currentMarketShareMin: conversionValue(currentMarketShareMin),
      currentMarketShareMax: conversionValue(currentMarketShareMax),
      address: curSelectedAddress.current?.officeAddressAddress,
      lat: curSelectedAddress.current?.officeAddressLat,
      lng: curSelectedAddress.current?.officeAddressLng,
      bu: values.bu,
      website: values?.website,
      reachOutChannel: values.reachOutChannel,
    };
    const formData = new FormData();
    const blob = new Blob([JSON.stringify(dto)], {
      type: 'application/json',
    });
    formData.append('dto', blob);
    noRequestFiles.forEach((item: File) => {
      formData.append('file', item);
    });

    onConfirm?.(formData, isEdit);
  }, [
    isEdit,
    record,
    noRequestFiles,
    deletedFileId,
    curSelectedAddress.current,
  ]);

  const resetAddress = () => {
    curSelectedAddress.current = undefined;
    formRef?.current?.setFields([
      {
        name: 'officeAddressAddress',
        value: undefined,
        errors: [],
      },
    ]);
    formRef?.current?.resetFields([
      'officeAddressPad',
      'officeAddressSad',
      'officeAddressTad',
    ]);
  };

  const onAddressSelect = async () => {
    const values = formRef?.current?.getFieldsValue?.();
    if (
      !lodash.isEmpty(curSelectedAddress.current) &&
      values?.officeAddressTad
    ) {
      const { officeAddressLat, officeAddressLng } = curSelectedAddress.current;

      const payload = {
        pad: values?.officeAddressPad,
        sad: values?.officeAddressSad,
        tad: values?.officeAddressTad,
        lat: officeAddressLat,
        lng: officeAddressLng,
      };
      setFormLoading(true);
      const res = await waybillRouteAddressCheck(payload);
      setFormLoading(false);
      if (res.code === 200) {
        const { matched } = res.data;
        setIsMatched(matched);
        if (matched) {
          formRef?.current?.setFields([
            {
              name: 'officeAddressAddress',
              errors: [],
            },
          ]);
        } else {
          formRef?.current?.setFields([
            {
              name: 'officeAddressAddress',
              errors: ['The address does not match the region range'],
            },
          ]);
        }
      }
    } else {
    }
  };

  const handleResolve = async (meta?: IOfficeAddressMeta) => {
    setIsMatched(true);
    await formRef.current?.validateFields(['officeAddressAddress']);
    if (!meta?.officeAddressLat || !meta?.officeAddressLng) {
      formRef.current?.setFields([
        {
          name: 'officeAddressAddress',
          errors: ['Please select an address and click Resolve'],
        },
      ]);
      return;
    }

    if (!curSelectedAddress.current) {
      message.warning('Please select a address fist');
      return false;
    }
    const { officeAddressLat, officeAddressLng } = curSelectedAddress.current;

    const params = {
      level: 3,
      lat: officeAddressLat,
      lng: officeAddressLng,
    };
    setFormLoading(true);
    const res = await placeGeoResolveAddressResult(params);
    setFormLoading(false);
    if (res.code === 200) {
      formRef.current?.setFieldsValue({
        officeAddressPad: res.data.pad,
        officeAddressSad: res.data.sad,
        officeAddressTad: res.data.tad,
      });
    }
  };

  const onPadChangeForOrigin = useCallback(() => {
    formRef.current?.setFieldValue('officeAddressSad', undefined);
    formRef.current?.setFieldValue('officeAddressTad', undefined);
  }, []);

  const onSadChangeForOrigin = useCallback(() => {
    formRef.current?.setFieldValue('officeAddressTad', undefined);
  }, []);

  const handleAddressSelect = async (meta: IOfficeAddressMeta) => {
    if (!lodash.isEmpty(meta)) {
      curSelectedAddress.current = meta;
      await onAddressSelect();
      await handleResolve(meta);
    }
  };

  const resetAreaFields = (fields?: string[]) => {
    formRef?.current?.resetFields?.(fields);
  };

  const onFulfilled = (file: File) => {
    noRequestFiles.push(file);
    setNoRequestFiles([...noRequestFiles]);
  };

  const handleDeleteNoRequestFile = (index: number) => {
    noRequestFiles.splice(index, 1);
    setNoRequestFiles([...noRequestFiles]);
  };

  const handleDeleteDefaultFile = (id: number) => {
    setDeletedFileId(id);
    setMaterial(null);
  };

  const debouncedCheckDuplicateName = useCallback(
    debounce(async (value: string) => {
      if (!value) {
        setHelpCustomerNameMessage('Please enter name');
        return Promise.reject();
      }
      if (!value.trim()) {
        setHelpCustomerNameMessage('Cannot only contain spaces');
        return Promise.reject();
      }

      if (value?.length < MAX_LENGTH.SHORT_NAME) {
        setHelpCustomerNameMessage(
          `Please enter at least ${MAX_LENGTH.SHORT_NAME} characters Name`,
        );
        return Promise.reject();
      }
      if (value?.length > MAX_LENGTH.LONG_NAME) {
        setHelpCustomerNameMessage(
          `Name cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
        );
        return Promise.reject();
      }
      const payload = {
        customerName: formatString(value),
        customerId: record?.id,
      };
      const res = await customerNameAndTagCheck(payload);
      if (res.code === 200 && res.data?.duplicate) {
        const { customerOrLead, id } = res.data;
        setHelpCustomerNameMessage(
          <div>
            The customer name is duplicated with an existing
            <span
              className={styles.linkJump}
              onClick={() => {
                const str = `${customerOrLead ? PATHS.CUSTOMER_DETAIL_BASE : PATHS.CUSTOMER_LEAD_POOL_DETAIL}/${id}`;
                openNewTag(str);
              }}
            >
              {customerOrLead ? 'Customer' : 'Lead'}
            </span>
            , Please change the name
          </div>,
        );

        return Promise.reject();
      }
      setHelpCustomerNameMessage(null);
      return Promise.resolve();
    }, 500),
    [],
  );

  const debouncedCheckDuplicateTag = useCallback(
    debounce(async (value: string) => {
      if (!value) {
        setHelpCustomerTagMessage('Please enter Tag');
        return Promise.reject();
      }
      if (!value.trim()) {
        setHelpCustomerTagMessage('Cannot only contain spaces');
        return Promise.reject();
      }

      if (value?.length < MAX_LENGTH.SHORT_NAME) {
        setHelpCustomerTagMessage(
          `Please enter at least ${MAX_LENGTH.SHORT_NAME} characters Tag`,
        );
        return Promise.reject();
      }
      if (value?.length > MAX_LENGTH.LONG_NAME) {
        setHelpCustomerTagMessage(
          `Tag cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
        );
        return Promise.reject();
      }
      const payload = {
        customerTag: formatString(value),
        customerId: record?.id,
      };
      const res = await customerNameAndTagCheck(payload);
      if (res.code === 200 && res.data?.duplicate) {
        setHelpCustomerTagMessage('Tag Number already exists');
        return Promise.reject();
      }
      setHelpCustomerTagMessage(null);
      return Promise.resolve();
    }, 500),
    [],
  );

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    await debouncedCheckDuplicateName(value);
  };

  const onFill = useCallback((values: any) => {
    formRef?.current?.setFieldsValue(values);
    curSelectedAddress.current = {
      officeAddressLat: values.lat,
      officeAddressLng: values.lng,
      officeAddressAddress: values.address,
    };
    if (values?.address) {
      handleResolve(curSelectedAddress.current);
    }
  }, []);

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  const init = useCallback(async () => {
    if (record?.id) {
      record.officeAddressAddress = record.address;
      record.sad = record.sad === 0 ? undefined : record.sad;
      record.tad = record.tad === 0 ? undefined : record.tad;
      onFill(record);
      setMaterial(record?.material);
    } else {
      reset();
    }
  }, [record]);

  useEffect(() => {
    if (open) {
      init();
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <ModalForm
        open={open}
        name="customer-modal"
        title={title}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        initialValues={DEFAULT_VALUES}
        modalProps={{
          ...modalProps,
          centered: true,
          // destroyOnClose: true,
          forceRender: true,
        }}
        onFinish={handleOk}
        {...restProps}
      >
        <Spin spinning={formLoading}>
          <Row gutter={[12, 0]}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="customerName"
                validateStatus={helpCustomerNameMessage ? 'error' : ''}
                help={helpCustomerNameMessage}
                rules={[
                  {
                    required: true,
                  },
                  {
                    validator: async (_, value) => {
                      await debouncedCheckDuplicateName(value);
                    },
                  },
                ]}
              >
                <Input
                  disabled={isEdit}
                  placeholder="Name"
                  onBlur={handleBlur}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tag"
                name="customerTag"
                validateStatus={helpCustomerTagMessage ? 'error' : ''}
                help={helpCustomerTagMessage}
                rules={[
                  {
                    required: true,
                    // message: 'Please enter tag',
                  },
                  {
                    validator: async (_, value) => {
                      await debouncedCheckDuplicateTag(value);
                    },
                  },
                ]}
              >
                <Input placeholder="Tag" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={12}>
              <ProFormCascader
                name="industryIdList"
                label="Industry"
                placeholder="Industry"
                rules={[{ required: true, message: 'Please select industry' }]}
                request={async () => {
                  const res = await customerIndustryList();
                  if (res.code === 200) {
                    return res.data;
                  } else {
                    return [];
                  }
                }}
                fieldProps={{
                  showSearch: true,
                }}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="customerTaxMark"
                label="Tax Mark"
                placeholder="Tax Mark"
                valueEnum={TaxTypeEnumText}
                rules={[{ required: true, message: 'Please select Tax Mark' }]}
              />
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={12}>
              <ProFormSelect
                name="contactType"
                label="Contact Type"
                placeholder="Contact Type"
                valueEnum={ContactTypeEnumText}
              />
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <div>
                    Current MarketShare
                    <Popover
                      content={
                        <div style={{ fontSize: 12 }}>
                          Allow only one digit to be filled
                        </div>
                      }
                    >
                      <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                    </Popover>
                  </div>
                }
                style={{ marginBottom: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ProFormText
                    name="currentMarketShareMin"
                    fieldProps={{
                      suffix: '%',
                    }}
                    rules={[
                      {
                        pattern: REGEXP.NUMBER,
                        message: 'Only supports 0-100 integers',
                      },
                    ]}
                  />
                  <span style={{ margin: '7px 5px 0' }}>-</span>

                  <ProFormText
                    name="currentMarketShareMax"
                    fieldProps={{
                      suffix: '%',
                    }}
                    rules={[
                      {
                        pattern: REGEXP.NUMBER,
                        message: 'Only supports 0-100 integers',
                      },
                    ]}
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={12}>
              <ProFormText
                name="countryName"
                label={labelLevelList?.[0]}
                placeholder={labelLevelList?.[0]}
                disabled={true}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="pad"
                label={labelLevelList?.[1]}
                placeholder={labelLevelList?.[1]}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                rules={[
                  {
                    required: true,
                    message: `Please select ${labelLevelList?.[1]}`,
                  },
                ]}
                request={async () => {
                  const payload = {
                    country: countryId,
                  };
                  const res = await placeRegion(payload);
                  if (res.code === 200) {
                    return res?.data?.map((item: IPlaceRecord) => {
                      return {
                        label: item.description,
                        value: item.id,
                      };
                    });
                  } else {
                    return [];
                  }
                }}
                onChange={() => resetAreaFields(['sad', 'tad'])}
              />
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={12}>
              <ProFormSelect
                name="sad"
                label={labelLevelList?.[2]}
                placeholder={labelLevelList?.[2]}
                dependencies={['pad']}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                request={async (params) => {
                  if (!params.pad) {
                    return [];
                  }
                  const payload = {
                    region: params.pad,
                  };
                  const res = await placeProvince(payload);
                  if (res.code === 200) {
                    return res?.data?.map((item: IPlaceRecord) => {
                      return {
                        label: item.description,
                        value: item.id,
                      };
                    });
                  } else {
                    return [];
                  }
                }}
                onChange={() => resetAreaFields(['tad'])}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="tad"
                label={labelLevelList?.[3]}
                placeholder={labelLevelList?.[3]}
                dependencies={['pad', 'sad']}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                request={async (params) => {
                  if (!params.pad || !params.sad) {
                    return [];
                  }
                  const payload = {
                    province: params.sad,
                  };
                  const res = await placeCity(payload);
                  if (res.code === 200) {
                    return res?.data?.map((item: IPlaceRecord) => {
                      return {
                        label: item.description,
                        value: item.id,
                      };
                    });
                  } else {
                    return [];
                  }
                }}
              />
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={24}>
              <Form.Item
                name={'officeAddressAddress'}
                label="Address"
                trigger="onChange"
                rules={[
                  {
                    validator: () => {
                      if (!isMatched) {
                        return Promise.reject(
                          new Error(
                            'The address does not match the region range',
                          ),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <AutoCompleteSelectNew
                  defaultMeta={
                    record
                      ? {
                          address: record?.address,
                          lat: record?.lat,
                          lng: record?.lng,
                        }
                      : undefined
                  }
                  showLocator
                  showReset
                  placeholder="Office Address"
                  onSelect={(meta: IMeta) => {
                    console.log(meta);
                    const newMeta = {
                      officeAddressLevel: meta?.level,
                      officeAddressAddress: meta.address,
                      officeAddressLat: meta.lat,
                      officeAddressLng: meta.lng,
                    };
                    handleAddressSelect(newMeta);
                  }}
                  onReset={resetAddress}
                  onClear={resetAddress}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={6}>
              <ProFormText
                name="countryName"
                label={null}
                placeholder={labelLevelList?.[0]}
                disabled={true}
              />
            </Col>
            <Col span={6}>
              <ProFormSelect
                name={'officeAddressPad'}
                label={null}
                placeholder={labelLevelList?.[1]}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                request={async () => {
                  const payload = {
                    country: countryId,
                    noAllRegion: true,
                  };
                  setFormLoading(true);
                  const res = await placeGeoRegion(payload);
                  setFormLoading(false);
                  if (res.code === 200) {
                    return res?.data?.map((item: IPlaceGeoRecord) => {
                      return {
                        label: item.name,
                        value: item.id,
                      };
                    });
                  } else {
                    return [];
                  }
                }}
                onChange={onPadChangeForOrigin}
              />
            </Col>
            <Col span={6}>
              <ProFormSelect
                name={'officeAddressSad'}
                label={null}
                placeholder={labelLevelList?.[2]}
                dependencies={['officeAddressPad']}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                request={async (params) => {
                  if (!params.officeAddressPad) {
                    return [];
                  }
                  const payload = {
                    region: params.officeAddressPad,
                  };
                  setFormLoading(true);
                  const res = await placeGeoProvince(payload);
                  setFormLoading(false);
                  if (res.code === 200) {
                    return res?.data?.map((item: IPlaceGeoRecord) => {
                      return {
                        label: item.name,
                        value: item.id,
                      };
                    });
                  } else {
                    return [];
                  }
                }}
                onChange={onSadChangeForOrigin}
              />
            </Col>
            <Col span={6}>
              <ProFormSelect
                name={'officeAddressTad'}
                label={null}
                placeholder={labelLevelList?.[3]}
                dependencies={['officeAddressPad', 'officeAddressSad']}
                showSearch
                fieldProps={{
                  filterOption: true,
                }}
                request={async (params) => {
                  if (!params.officeAddressPad || !params.officeAddressSad) {
                    return [];
                  }
                  const payload = {
                    province: params.officeAddressSad,
                  };
                  setFormLoading(true);
                  const res = await placeLeoCity(payload);
                  setFormLoading(false);
                  if (res.code === 200) {
                    return res?.data?.map((item: IPlaceGeoRecord) => {
                      return {
                        label: item.name,
                        value: item.id,
                      };
                    });
                  } else {
                    return [];
                  }
                }}
                onChange={() => {
                  onAddressSelect();
                }}
              />
            </Col>
          </Row>
          <Row gutter={[12, 0]}>
            <Col span={12}>
              <ProFormSelect
                name="priority"
                label="Priority"
                placeholder="Priority"
                fieldProps={{
                  options: CustomerPriorityOptions,
                }}
                rules={[{ required: true, message: 'Please select priority' }]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="size"
                label="Size"
                placeholder="Size"
                valueEnum={CustomerSizeEnumText}
                rules={[{ required: true, message: 'Please select size' }]}
              />
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={12}>
              <ProFormText
                name="website"
                label="Website"
                placeholder="Website"
                rules={[
                  {
                    pattern: REGEXP.WEBSITE_URL,
                    message: 'Please enter valid website',
                  },
                  {
                    max: MAX_LENGTH.MAX_255,
                    message: `Website cannot exceed ${MAX_LENGTH.MAX_255} characters`,
                  },
                ]}
              />
            </Col>
            <Col span={12}>
              <ProFormSelect
                name="reachOutChannel"
                label={'Reach out Channel'}
                placeholder="Reach out Channel"
                valueEnum={ReachOutChannelEnumText}
                rules={[
                  {
                    required: true,
                    message: 'Please select Reach out Channel',
                  },
                ]}
              />
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={12}>
              <ProFormSelect
                name="bu"
                label="BU"
                placeholder="BU"
                valueEnum={BUEnumText}
                rules={[
                  {
                    required: true,
                    message: 'Please select BU',
                  },
                ]}
              />
            </Col>
          </Row>

          <Row gutter={[12, 0]}>
            <Col span={24}>
              <Form.Item
                name="file"
                label="Customer Logo"
                extra="Support formats:.png .jpg .jpeg .svg."
              >
                <div style={{ marginBottom: 10 }}>
                  {material ? (
                    <CommonFileItem
                      thumbnail={material?.fileThumbnailUrl}
                      fileType={material?.fileType}
                      fileName={material?.fileName}
                      materialId={material?.fileMaterialId}
                      driveFileId={material?.fileDriveId}
                      fileMimeType={material?.fileMimeType}
                      showDelete
                      onDeleteTrigger={() =>
                        handleDeleteDefaultFile(material?.fileMaterialId)
                      }
                    />
                  ) : (
                    <>
                      {noRequestFiles?.map((item: File, index: number) => (
                        <NoRequestFileItem
                          key={index}
                          className={''}
                          file={item}
                          showDelete
                          onDeleteTrigger={() =>
                            handleDeleteNoRequestFile(index)
                          }
                        />
                      ))}
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {noRequestFiles.length === 0 && (
                          <NoRequestUpload
                            onFulfilled={onFulfilled}
                            legalExts={['.jpg', '.jpeg', '.png', '.svg']}
                          />
                        )}
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
                    </>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Spin>
      </ModalForm>
    </>
  );
};

export default CustomerModal;
