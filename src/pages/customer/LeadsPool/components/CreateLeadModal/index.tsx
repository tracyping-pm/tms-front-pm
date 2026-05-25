import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';

import {
  customerIndustryList,
  customerNameAndTagCheck,
  getCountryPhone,
} from '@/api/customer';
import { leadCreate, leadUpdate } from '@/api/lead';
import { opportunityUserSelector } from '@/api/opportunity';
import {
  placeGeoProvince,
  placeGeoRegion,
  placeGeoResolveAddressResult,
  placeLeoCity,
} from '@/api/place';
import { IImageState, ISourceImage } from '@/api/types/common';
import { IPhoneSelectOptionsItem } from '@/api/types/customer';
import { IContactListItem } from '@/api/types/lead';
import { IPlaceGeoRecord } from '@/api/types/place';
import { waybillRouteAddressCheck } from '@/api/waybill';
import CommonFileItem from '@/components/CommonFileItem';
import NormalUpload from '@/components/CustomUpload/NormalUpload';
import { getExts } from '@/components/CustomUpload/fileSupport';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IMeta } from '@/components/LocatorModal';
import {
  BELONG_IMG_EXTS,
  COUNTRY_PHONE_REGULAR_EXPRESSION,
  CustomerPriorityOptions,
  DEFAULT_COUNTRY_PHONE_CODE,
  MATERIAL_UPLOAD_URL,
  MAX_LENGTH,
  PATHS,
  REGEXP,
  initialImageState,
} from '@/constants';
import {
  BUEnumText,
  CountryEnumLabelListMap,
  CountryMapEnumText,
  PicTypeEnumText,
  ReachOutChannelEnumText,
  UploadPathTypeEnum,
} from '@/enums';
import { formatString } from '@/utils/format';
import { openNewTag } from '@/utils/utils';
import {
  DeleteOutlined,
  PlusSquareOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormCascader,
  ProFormInstance,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { useSetState } from 'ahooks';
import {
  App,
  Col,
  Collapse,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Tooltip,
  message,
} from 'antd';
import { DefaultOptionType } from 'antd/lib/cascader';
import { debounce, default as lodash } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';
type IAddCategoryModal = ModalFormProps & {
  record?: any;
  onConfirm: () => void;
};

const CreateLeadModal = ({
  title,
  open,
  modalProps,
  record,
  onConfirm,
  ...restProps
}: IAddCategoryModal) => {
  const { modal } = App.useApp();
  const formRef = useRef<ProFormInstance>();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId ?? 1;
  //@ts-ignore
  const labelLevelList = CountryEnumLabelListMap[countryId];
  const curSelectedAddress = useRef<IMeta | undefined>();
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);
  const [codeList, setCodeList] = useState<IPhoneSelectOptionsItem[]>([]);
  const [opportunityUserOptions, setOpportunityUserOptions] = useState<
    DefaultOptionType[]
  >([]);

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [helpCustomerNameMessage, setHelpCustomerNameMessage] =
    useState<React.ReactNode | null>(null);
  const [helpCustomerTagMessage, setHelpCustomerTagMessage] =
    useState<React.ReactNode | null>(null);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [isMatched, setIsMatched] = useState<boolean>(true);
  const [logoMaterial, setLogoMaterial] = useState<any>(undefined);
  const [selectedPicType, setSelectedPicType] = useState<any>(undefined);

  const getPhoneCodeListById = (phoneList: IContactListItem[]) => {
    const codeIdList = phoneList.map((item) => item.phoneCodeId);
    const resList: IContactListItem[] = [];
    codeList.forEach((item) => {
      if (codeIdList.includes(item.value)) {
        phoneList.forEach((subItem) => {
          if (subItem.phoneCodeId === item.value) {
            resList.push({
              ...subItem,
              phoneCode: item.show,
              name: formatString(subItem.name),
              position: subItem.position
                ? formatString(subItem.position)
                : undefined,
              phoneNumber: formatString(subItem.phoneNumber),
            });
          }
        });
      }
    });
    return resList;
  };

  const handleOk = async () => {
    const values = await formRef?.current?.validateFields();
    if (!isMatched) {
      formRef?.current?.setFields([
        {
          name: 'address',
          errors: ['The address does not match the region range'],
        },
      ]);
      return;
    }
    // const { address, lat, lng } = curSelectedAddress.current!;
    const {
      customerName,
      customerTag,
      industryIdList,
      contactList,
      ...params
    } = values;
    const newContactList = getPhoneCodeListById(contactList);
    const payload = {
      ...params,
      id: record?.id,
      customerName: formatString(customerName),
      customerTag: formatString(customerTag),
      address: curSelectedAddress.current?.address,
      lat: curSelectedAddress.current?.lat,
      lng: curSelectedAddress.current?.lng,
      industryFirstId: industryIdList?.[0],
      industrySecondId: industryIdList?.[1],
      contactList: newContactList,
      logoMaterialId: logoMaterial?.fileMaterialId,
    };
    let res;
    if (record?.id) {
      res = await leadUpdate(payload);
    } else {
      res = await leadCreate(payload);
    }
    setConfirmLoading(false);
    if (res.code === 200) {
      if (res.data?.code === 1) {
        modal.warning({
          title: 'Warning',
          content:
            res.data?.msg ||
            'The customer name is duplicated with an existing customer, TMS will automatically update the existing customer information if you confirm',
          onOk: () => {
            formRef.current?.setFieldValue('customerName', undefined);
          },
        });
      } else {
        message.success(
          record?.id
            ? 'Update Lead successfully!'
            : 'Create Lead successfully!',
        );
        onConfirm();
      }
    }
  };

  const onAddressSelect = async () => {
    const values = formRef?.current?.getFieldsValue?.();
    if (!lodash.isEmpty(curSelectedAddress.current) && values?.tad) {
      const { lat, lng } = curSelectedAddress.current;

      const payload = {
        pad: values?.pad,
        sad: values?.sad,
        tad: values?.tad,
        lat,
        lng,
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
              name: 'address',
              errors: [],
            },
          ]);
        } else {
          formRef?.current?.setFields([
            {
              name: 'address',
              errors: ['The address does not match the region range'],
            },
          ]);
        }
      }
    } else {
    }
  };

  const handleResolve = async (meta?: IMeta) => {
    setIsMatched(true);
    await formRef.current?.validateFields(['address']);
    if (!meta?.lat || !meta?.lng) {
      formRef.current?.setFields([
        {
          name: 'address',
          errors: ['Please select an address and click Resolve'],
        },
      ]);
      return;
    }

    if (!curSelectedAddress.current) {
      message.warning('Please select a address fist');
      return false;
    }
    const { lat, lng } = curSelectedAddress.current;

    const params = {
      level: 3,
      lat,
      lng,
    };
    setFormLoading(true);
    const res = await placeGeoResolveAddressResult(params, true);
    setFormLoading(false);
    if (res.code === 200) {
      formRef.current?.setFieldsValue({
        pad: res.data.pad,
        sad: res.data.sad,
        tad: res.data.tad,
      });
    } else {
      setIsMatched(false);
      formRef.current?.setFields([
        {
          name: 'address',
          errors: ['The address does not match the region range'],
        },
      ]);
    }
  };

  const handleAddressSelect = async (meta: IMeta) => {
    if (!lodash.isEmpty(meta)) {
      curSelectedAddress.current = meta;
      await onAddressSelect();
      handleResolve(meta);
    }
  };

  const resetAddress = () => {
    curSelectedAddress.current = undefined;
    formRef.current?.resetFields(['pad', 'sad', 'tad']);
    formRef?.current?.setFields([
      {
        name: 'address',
        value: undefined,
        errors: [],
      },
    ]);
  };

  const onPadChangeForOrigin = useCallback(() => {
    formRef.current?.setFieldValue('sad', undefined);
    formRef.current?.setFieldValue('tad', undefined);
  }, []);

  const onSadChangeForOrigin = useCallback(() => {
    formRef.current?.setFieldValue('tad', undefined);
  }, []);

  const onFill = useCallback((values: any) => {
    formRef?.current?.setFieldsValue({ ...values, material: values.logo });
    setLogoMaterial(values.logo);
    setSelectedPicType(values.picType);
    curSelectedAddress.current = {
      lat: values.lat,
      lng: values.lng,
      address: values.address,
    };
  }, []);

  const reset = useCallback(() => {
    formRef?.current?.resetFields();
  }, []);

  const init = useCallback(async () => {
    if (record?.id) {
      onFill(record);
    } else {
      reset();
      formRef?.current?.setFieldsValue({
        contactList: [
          { phoneCodeId: DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value },
        ],
      });
    }
  }, [record]);

  const getCityCode = async () => {
    const res = await getCountryPhone();
    if (res.code === 200) {
      setCodeList(res.data ?? []);
    }
  };

  const getOpportunityUserSelector = async () => {
    const res = await opportunityUserSelector('LEAD_BD_PIC');
    if (res.code === 200) {
      setOpportunityUserOptions(
        (res.data ?? []).map((item) => {
          return {
            ...item,
            label: item.userAliasName,
            value: item.id,
          };
        }),
      );
    }
  };

  useEffect(() => {
    if (open) {
      getCityCode();
      getOpportunityUserSelector();
      init();
    } else {
      reset();
    }
  }, [open]);

  const onFulfilled = useCallback(
    async (file: File & { id: number; fileName: string }, originFile: File) => {
      const sourceImages = [];
      const fileType = getExts(originFile);
      const isBelongImg = BELONG_IMG_EXTS.includes(fileType);
      if (isBelongImg) {
        const src = URL.createObjectURL(originFile);
        sourceImages.push({ src, material: originFile.name });
      }
      setImageState({ sourceImages });
      setLogoMaterial(file);
    },
    [],
  );

  const onCustomPreview = useCallback(() => {
    setImageState({
      index: 0,
      visible: true,
    });
  }, [imageState]);

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
        leadId: record?.id,
      };
      const res = await customerNameAndTagCheck(payload);
      if (res.code === 200 && res.data?.duplicate) {
        const { customerOrLead, id } = res.data;
        setHelpCustomerNameMessage(
          <div>
            The customer name is duplicated with an existing&nbsp;
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
        leadId: record?.id,
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

  return (
    <>
      <ModalForm
        open={open}
        title={title}
        width={840}
        style={{ marginTop: '14px' }}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
        }}
        onFinish={handleOk}
        submitter={{
          submitButtonProps: {
            loading: confirmLoading,
          },
        }}
        {...restProps}
      >
        <Spin spinning={formLoading}>
          <p style={{ marginBottom: 10 }}>Please enter customer information</p>
          <Collapse
            size="small"
            defaultActiveKey={['1', '2']}
            items={[
              {
                key: '1',
                label: 'Basic',
                children: (
                  <>
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item
                          label="Customer Name"
                          name="customerName"
                          validateStatus={
                            helpCustomerNameMessage ? 'error' : ''
                          }
                          help={helpCustomerNameMessage}
                          required
                          rules={[
                            {
                              validator: async (_, value) => {
                                await debouncedCheckDuplicateName(value);
                              },
                            },
                          ]}
                        >
                          <Input
                            disabled={record?.id}
                            placeholder="Customer Name"
                            onBlur={async (e) => {
                              const value = e.target.value;
                              await debouncedCheckDuplicateName(value);
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Customer Tag"
                          name="customerTag"
                          validateStatus={helpCustomerTagMessage ? 'error' : ''}
                          help={helpCustomerTagMessage}
                          required
                          rules={[
                            {
                              validator: async (_, value) => {
                                await debouncedCheckDuplicateTag(value);
                              },
                            },
                          ]}
                        >
                          <Input placeholder="Customer Tag" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={24}>
                        <ProFormRadio.Group
                          name="reachOutChannel"
                          label="Reach out Channel"
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
                    <Row gutter={24}>
                      <Col span={24}>
                        <ProFormRadio.Group
                          name="bu"
                          label="BU"
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
                    <Row gutter={24}>
                      <Col span={5}>
                        <ProFormRadio.Group
                          name="picType"
                          label="PIC"
                          valueEnum={PicTypeEnumText}
                          rules={[
                            {
                              required: true,
                              message: 'Please select BD/CAM',
                            },
                          ]}
                          fieldProps={{
                            onChange: (e) => {
                              setSelectedPicType(e.target.value);
                            },
                          }}
                        />
                      </Col>
                      <Col span={19}>
                        <ProFormSelect
                          name="picUserRoleId"
                          label={' '}
                          required={false}
                          placeholder="BD/CAM PIC"
                          disabled={!selectedPicType}
                          rules={[
                            {
                              required: true,
                              message: 'Please select BD/CAM PIC',
                            },
                          ]}
                          showSearch
                          fieldProps={{
                            options: opportunityUserOptions,
                            optionRender: (option) => {
                              return (
                                <div className={styles.picOption}>
                                  <div
                                    className={styles.picOptionLabel}
                                    title={option.data.label as string}
                                  >
                                    {option.data.label}
                                  </div>

                                  <div
                                    className={styles.picOptionLabel}
                                    title={option.data?.roleName}
                                  >
                                    {option.data?.roleName}
                                  </div>
                                  <div
                                    className={styles.picOptionLabel}
                                    title={option.data.departmentName}
                                  >
                                    {option.data.departmentName}
                                  </div>
                                </div>
                              );
                            },
                          }}
                        />
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <ProFormCascader
                          name="industryIdList"
                          label="Industry"
                          placeholder="Industry"
                          rules={[
                            {
                              required: true,
                              message: 'Please select industry',
                            },
                          ]}
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
                          name="priority"
                          label={
                            <>
                              <span>Priority</span>
                              <Tooltip
                                title={
                                  <span>
                                    PRIORITY (1-10) Description
                                    <br />
                                    1 Use 1 time
                                    <br />
                                    2 logistics company check price wait end
                                    customer confirm
                                    <br />
                                    3 logistics company check price for project
                                    <br />
                                    4 Bidding price have time for check
                                    <br />
                                    5 Just provide for compare price
                                    <br />
                                    6 Midder company, small volume , on call
                                    <br />
                                    7 Big company, small volume , on call
                                    <br />
                                    8 Big company , small volume , log in &lt;-
                                    Job in Hand
                                    <br />
                                    9 Big Company , Big volume , on call &lt;-
                                    Midder company, big volume , log in <br />
                                    10 Big Company , Big volume , log in
                                  </span>
                                }
                                placement="top"
                              >
                                <span style={{ margin: '0 2px' }}>
                                  <QuestionCircleOutlined />
                                </span>
                              </Tooltip>
                            </>
                          }
                          placeholder="Priority"
                          fieldProps={{
                            options: CustomerPriorityOptions,
                          }}
                          rules={[
                            {
                              required: true,
                              message: 'Please select priority',
                            },
                          ]}
                        />
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={24}>
                        <ProFormText
                          name="website"
                          label="Website"
                          placeholder="Website"
                          rules={[
                            // {
                            //   required: true,
                            //   message: 'Please enter website',
                            // },
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
                    </Row>
                    <Form.Item
                      name={'address'}
                      label={<>&nbsp;Office Address</>}
                      trigger="onChange"
                      rules={[
                        {
                          validator: () => {
                            // if (!value) {
                            //   return Promise.reject(new Error('Please select'));
                            // }
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
                          handleAddressSelect(meta);
                        }}
                        onReset={resetAddress}
                        onClear={resetAddress}
                      />
                    </Form.Item>
                    <Row gutter={24}>
                      <Col span={6}>
                        <Form.Item>
                          <Select
                            disabled
                            defaultValue={CountryMapEnumText[countryId]}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <ProFormSelect
                          name={'pad'}
                          label={null}
                          placeholder={labelLevelList?.[1]}
                          showSearch
                          // rules={[
                          //   {
                          //     required: true,
                          //     message: 'Please select',
                          //   },
                          // ]}
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
                          name={'sad'}
                          label={null}
                          placeholder={labelLevelList?.[2]}
                          dependencies={['pad']}
                          showSearch
                          // rules={[
                          //   {
                          //     required: true,
                          //     message: 'Please select',
                          //   },
                          // ]}
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
                          name={'tad'}
                          label={null}
                          placeholder={labelLevelList?.[3]}
                          dependencies={['pad', 'sad']}
                          showSearch
                          // rules={[
                          //   {
                          //     required: true,
                          //     message: 'Please select',
                          //   },
                          // ]}
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
                    <Form.Item
                      name="material"
                      label="Customer Logo"
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: 'Please upload  Customer Logo',
                      //   },
                      // ]}
                    >
                      {logoMaterial ? (
                        <CommonFileItem
                          className={styles.file_item}
                          key={logoMaterial.fileMaterialId}
                          thumbnail={logoMaterial.fileThumbnailUrl}
                          fileType={logoMaterial.fileType}
                          fileName={logoMaterial.fileName}
                          materialId={logoMaterial.fileMaterialId}
                          driveFileId={logoMaterial.fileDriveId}
                          fileMimeType={logoMaterial.fileMimeType}
                          showDelete
                          onDeleteTrigger={() => {
                            formRef.current?.setFieldsValue({
                              material: undefined,
                            });
                            setLogoMaterial(undefined);
                          }}
                          onCustomPreview={onCustomPreview}
                        />
                      ) : (
                        <div className={styles.file_item}>
                          <NormalUpload
                            accept="image/*"
                            url={MATERIAL_UPLOAD_URL}
                            dtoName="req"
                            dto={{
                              pathType: UploadPathTypeEnum.LEAD_LOGO,
                            }}
                            name="file"
                            onFulfilled={onFulfilled}
                          />
                          <div className={styles.itemDesc}>
                            A single file cannot exceed 50 MB
                          </div>
                        </div>
                      )}
                    </Form.Item>
                  </>
                ),
              },
              {
                key: '2',
                label: 'Contact',
                children: (
                  <Form.List name={'contactList'}>
                    {(itemFields, { add, remove }) => (
                      <>
                        {itemFields.map(({ name: itemName }, index) => (
                          <div
                            key={itemName}
                            style={{
                              marginBottom: 8,
                              borderBottom: '1px solid #F0F0F0',
                            }}
                          >
                            <div className={styles.customLabel}>
                              <p>
                                <span style={{ color: '#ff4d4f' }}>*</span>{' '}
                                Contact Name
                              </p>
                              {index !== 0 && (
                                <DeleteOutlined
                                  className={styles.icon}
                                  onClick={() => remove(itemName)}
                                />
                              )}
                            </div>
                            <Row gutter={24}>
                              <Col span={12}>
                                <ProFormText
                                  name={[itemName, 'name']}
                                  label=""
                                  placeholder="Name"
                                  rules={[
                                    {
                                      required: true,
                                      message: 'Please enter name',
                                    },
                                    {
                                      whitespace: true,
                                      message: 'Cannot only contain spaces',
                                    },
                                    {
                                      min: MAX_LENGTH.SHORT_NAME,
                                      message: `Please enter at least ${MAX_LENGTH.SHORT_NAME} characters Name`,
                                    },
                                    {
                                      max: MAX_LENGTH.LONG_NAME,
                                      message: `Name cannot exceed ${MAX_LENGTH.LONG_NAME} characters`,
                                    },
                                  ]}
                                />
                              </Col>
                              <Col span={12}>
                                <ProFormText
                                  name={[itemName, 'position']}
                                  label=""
                                  placeholder="Position"
                                  rules={[
                                    {
                                      whitespace: true,
                                      message: 'Cannot only contain spaces',
                                    },
                                    {
                                      max: MAX_LENGTH.MAX_128,
                                      message: `Position cannot exceed ${MAX_LENGTH.MAX_128} characters`,
                                    },
                                  ]}
                                />
                              </Col>
                            </Row>
                            <Row gutter={24}>
                              <Col span={12}>
                                <ProFormText
                                  name={[itemName, 'email']}
                                  label=""
                                  placeholder="E-mail"
                                  rules={[
                                    {
                                      validator: (rule, value) => {
                                        const curContact =
                                          formRef?.current?.getFieldValue(
                                            'contactList',
                                          )[index];
                                        if (
                                          !curContact.email &&
                                          !curContact.phoneNumber
                                        ) {
                                          return Promise.reject(
                                            new Error(
                                              'Fill in at least one email or phone number',
                                            ),
                                          );
                                        }
                                        if (
                                          value &&
                                          !REGEXP.EMAIL.test(value)
                                        ) {
                                          return Promise.reject(
                                            new Error(
                                              'Please enter valid E-mail',
                                            ),
                                          );
                                        }
                                        return Promise.resolve();
                                      },
                                    },
                                  ]}
                                />
                              </Col>
                              <Col span={12}>
                                <ProFormText
                                  name={[itemName, 'phoneNumber']}
                                  label=""
                                  placeholder="Phone Number"
                                  fieldProps={{
                                    addonBefore: (
                                      <Form.Item
                                        name={[itemName, 'phoneCodeId']}
                                        noStyle
                                      >
                                        <Select
                                          style={{
                                            width: 92,
                                            textAlign: 'left',
                                          }}
                                          options={codeList}
                                          optionLabelProp="show"
                                          popupMatchSelectWidth={false}
                                        />
                                      </Form.Item>
                                    ),
                                  }}
                                  rules={[
                                    {
                                      validator: (rule, value) => {
                                        const curContact =
                                          formRef?.current?.getFieldValue(
                                            'contactList',
                                          )[index];
                                        if (
                                          !curContact.email &&
                                          !curContact.phoneNumber
                                        ) {
                                          return Promise.reject(
                                            new Error(
                                              'Fill in at least one email or phone number',
                                            ),
                                          );
                                        }
                                        if (
                                          value &&
                                          value.length > MAX_LENGTH.PASSWORD
                                        ) {
                                          return Promise.reject(
                                            new Error(
                                              'Contact cannot exceed ${MAX_LENGTH.PASSWORD} characters',
                                            ),
                                          );
                                        }
                                        const areaCode =
                                          formRef?.current?.getFieldValue(
                                            'contactList',
                                          )[index].phoneCodeId;
                                        if (
                                          !value ||
                                          ![167, 214].includes(areaCode)
                                        ) {
                                          return Promise.resolve();
                                        }
                                        const findOption = codeList?.find(
                                          (item) => item.value === areaCode,
                                        );
                                        const phoneNumber =
                                          findOption?.show + value;
                                        const mobileReg =
                                          COUNTRY_PHONE_REGULAR_EXPRESSION[
                                            countryId
                                          ].mobile;
                                        const phoneReg =
                                          COUNTRY_PHONE_REGULAR_EXPRESSION[
                                            countryId
                                          ].phone;
                                        if (
                                          mobileReg.test(phoneNumber) ||
                                          phoneReg.test(phoneNumber)
                                        ) {
                                          return Promise.resolve();
                                        } else {
                                          return Promise.reject(
                                            'Please enter the correct phone number',
                                          );
                                        }
                                      },
                                    },
                                  ]}
                                />
                              </Col>
                            </Row>
                          </div>
                        ))}
                        <span
                          style={{
                            marginLeft: 24,
                            color: '#009688',
                            cursor: 'pointer',
                          }}
                          onClick={() =>
                            add({
                              phoneCodeId:
                                DEFAULT_COUNTRY_PHONE_CODE[countryId]?.value,
                            })
                          }
                        >
                          <PlusSquareOutlined style={{ marginRight: 8 }} />
                          <span>Add</span>
                        </span>
                      </>
                    )}
                  </Form.List>
                ),
              },
            ]}
          />
        </Spin>
        <ImagePreviewGroup
          visible={imageState.visible}
          items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
          index={imageState.index}
          onClose={() => setImageState({ visible: false })}
        />
      </ModalForm>
    </>
  );
};

export default CreateLeadModal;
