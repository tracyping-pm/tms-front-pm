import { projectCustomerCodeConfigList } from '@/api/project';
import {
  IProjectCustomerCodeConfigItem,
  IProjectRecord,
} from '@/api/types/project';
import {
  IAddWaybillParams,
  ICustomerCodeListItem,
  IRequireTruckListItem,
  IWaybillBaseInfoData,
} from '@/api/types/waybill';
import {
  addWaybill,
  addWaybillCheck,
  getRequireTruckType,
  updateWaybill,
} from '@/api/waybill';
import CustomTooltip from '@/components/CustomTooltip';
import { ES_DTO_CLASS, MAX_LENGTH, PATHS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  WaybillDispatchTypeEnum,
  WaybillDispatchTypeEnumText,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormDateTimePicker,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { App, Col, Empty, Form, Row } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './common.less';

type IWaybillModal = ModalFormProps & {
  hideModal: () => void;
  refresh: () => void;
  defaultFormValue?: IWaybillBaseInfoData;
  defaultProject?: IProjectRecord | null;
  isTimeValidityPeriod?: boolean;
};

const WaybillModal = ({
  width = 588,
  hideModal,
  refresh,
  defaultFormValue,
  defaultProject,
  modalProps,
  isTimeValidityPeriod = true, //in progress状态项目当前时间是否在项目有效期内，不在有效期内则不允许创建运单，【create waybill】时，运单类型字段默认选择【Temporary waybill】，不可修改；
  ...restProps
}: IWaybillModal) => {
  const { message, modal } = App.useApp();
  const formRef = useRef<ProFormInstance>();
  const [isValidityPeriod, setIsValidityPeriod] =
    useState(isTimeValidityPeriod);
  const [customerCodeList, setCustomerCodeList] = useState<
    IProjectCustomerCodeConfigItem[]
  >([]);
  const {
    options: projectNameOptions,
    onSearch: projectNameSearch,
    defaultFieldProps: projectNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'projectName',
    esDtoClass: ES_DTO_CLASS.PROJECT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const submit = async (params: IAddWaybillParams) => {
    let payload: {
      projectId: number;
      positionTime: string;
      requiredTruckType: number;
      destinationTime: string;
      dispatchType: WaybillDispatchTypeEnum;
      customerCodeList?: ICustomerCodeListItem[];
    };
    payload = {
      projectId: Number(params?.projectName?.id),
      positionTime: dayjs(params.positionTime).format('YYYY-MM-DD HH:mm:ss'),
      requiredTruckType: params.requiredTruckType,
      destinationTime: dayjs(params?.destinationTime).format(
        'YYYY-MM-DD HH:mm:ss',
      ),
      dispatchType: params.dispatchType,
    };
    let checkRes;
    if (!defaultFormValue) {
      checkRes = await addWaybillCheck(payload);
    }
    const _customerCodeList = params?.customerCode?.map((item) => {
      return {
        id: item.id,
        customerCodeTypeId: item.customerCodeTypeId,
        number: item.number,
      };
    });
    payload = { ...payload, customerCodeList: _customerCodeList };
    const timeCheck = dayjs(params.positionTime).valueOf() < dayjs().valueOf();
    if (timeCheck || !!checkRes?.data) {
      modal.confirm({
        title: !defaultFormValue ? 'Create Waybill' : 'Modify Dispatch',
        icon: <ExclamationCircleFilled />,
        content: (
          <>
            <ul style={{ paddingLeft: 10 }}>
              {timeCheck && (
                <li>
                  You are creating a waybill that is earlier than the current
                  time.
                </li>
              )}
              {!!checkRes?.data && (
                <li>There is no valid customer price version at the time.</li>
              )}
            </ul>
          </>
        ),
        okText: 'Confirm',
        cancelText: 'Cancel',
        okButtonProps: {
          style: { outline: 'none' },
        },
        onOk: async () => {
          let res;
          if (!defaultFormValue) {
            res = await addWaybill(payload);
          } else {
            res = await updateWaybill({
              id: defaultFormValue.id,
              projectId: defaultFormValue.projectId,
              positionTime: dayjs(params.positionTime).format(
                'YYYY-MM-DD HH:mm:ss',
              ),
              destinationTime: dayjs(params?.destinationTime).format(
                'YYYY-MM-DD HH:mm:ss',
              ),
              // externalCode: params.externalCode,
              requiredTruckType: params.requiredTruckType,
            });
          }
          if (res.code === 200) {
            message.success(
              `${!!defaultFormValue ? 'Edit' : 'Add'} successfully!`,
            );
            if (res.data?.code === 1) {
              modal.warning({
                title: 'Warning',
                content: res.data.msg,
                okText: 'Confirm',
                cancelButtonProps: {
                  style: { display: 'none' },
                },
              });
            }
            if (!defaultFormValue) {
              window.open(
                `${PATHS.WAYBILL_LIST_DETAIL}/${res.data}?type=blank&isNewCreated=true`,
                '_blank',
              );
            }
            refresh();
            hideModal();
          }
        },
      });
    } else {
      let res;
      if (!defaultFormValue) {
        res = await addWaybill(payload);
      } else {
        res = await updateWaybill({
          id: defaultFormValue.id,
          projectId: defaultFormValue.projectId,
          positionTime: params.positionTime,
          destinationTime: params?.destinationTime ?? undefined,
          // externalCode: params.externalCode,
          requiredTruckType: params.requiredTruckType,
        });
      }
      if (res.code === 200) {
        message.success(`${!!defaultFormValue ? 'Edit' : 'Add'} successfully!`);
        if (res.data?.code === 1) {
          modal.warning({
            title: 'Warning',
            content: res.data.msg,
            okText: 'Confirm',
            cancelButtonProps: {
              style: { display: 'none' },
            },
          });
        }
        if (!defaultFormValue) {
          window.open(
            `${PATHS.WAYBILL_LIST_DETAIL}/${res.data}?type=blank`,
            '_blank',
          );
        }
        refresh();
        hideModal();
      }
    }
  };

  const resetRequiredTruckType = useCallback((option: DefaultOptionType) => {
    formRef.current?.setFieldValue('requiredTruckType', undefined);
    if (option?.uniqueLogicParams?.projectWithInValidity) {
      formRef.current?.setFieldValue(
        'dispatchType',
        WaybillDispatchTypeEnum.TEMPORARY_DISPATCH,
      );
      setIsValidityPeriod(false);
    } else {
      setIsValidityPeriod(true);
    }
  }, []);

  const getCustomerCodeHandle = async (id: number) => {
    if (!id) {
      formRef.current?.setFieldsValue({ customerCode: [] });
      setCustomerCodeList([]);
      return;
    }
    const res = await projectCustomerCodeConfigList(id);
    if (res.code === 200) {
      const list = res.data;
      formRef.current?.setFieldsValue({ customerCode: list });
      setCustomerCodeList(list);
    } else {
      return;
    }
  };

  useEffect(() => {
    const id = defaultProject?.id;
    if (!id) return;
    getCustomerCodeHandle(id);
  }, [defaultProject]);

  return (
    <>
      <ModalForm
        name="waybill-modal"
        open={true}
        title={!defaultFormValue ? `Create Waybill` : 'Modify Dispatch'}
        style={{ marginTop: '14px' }}
        width={width}
        //@ts-ignore
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
          // getContainer: false,
        }}
        initialValues={{
          positionTime:
            defaultFormValue?.positionTime ?? dayjs().startOf('hour'),
          destinationTime: defaultFormValue?.destinationTime,
          // externalCode: defaultFormValue?.externalCode ?? undefined,
          projectName: defaultProject
            ? {
                id: defaultProject.id,
                label: defaultProject.projectName,
                name: defaultProject.projectName,
                value: defaultProject.id,
              }
            : defaultFormValue
              ? {
                  id: defaultFormValue.projectId,
                  label: defaultFormValue.projectName,
                  name: defaultFormValue.projectName,
                  value: defaultFormValue.projectId,
                }
              : undefined,
          requiredTruckType: defaultFormValue?.requiredTruckType ?? undefined,
        }}
        // @ts-ignore
        onFinish={submit}
        {...restProps}
      >
        <div
          className={styles.createWaybillMain}
          style={{
            paddingRight: customerCodeList?.length ? 12 : 0,
            marginRight: customerCodeList?.length ? -12 : 0,
          }}
        >
          <ProFormDateTimePicker
            fieldProps={{
              style: { width: '100%' },
            }}
            name="positionTime"
            label="Position Time"
            placeholder="Position Time"
            rules={[
              {
                required: true,
                message: 'Please enter position time',
              },
            ]}
          />
          <ProFormDateTimePicker
            fieldProps={{
              style: { width: '100%' },
              showTime: { defaultValue: dayjs().startOf('hour') },
            }}
            name="destinationTime"
            label="Required Delivery Time"
            placeholder="Required Delivery Time"
            rules={[
              {
                required: true,
                message: 'Please enter Required Delivery Time',
              },
              {
                validator: (rule, value) => {
                  if (!value) {
                    return Promise.resolve();
                  } else {
                    const positionTime =
                      formRef.current?.getFieldValue('positionTime');
                    if (dayjs(value).isAfter(dayjs(positionTime), 's')) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject(
                        'Required Delivery Time needs to be later than position time',
                      );
                    }
                  }
                },
              },
            ]}
          />

          <ProFormSelect
            name="projectName"
            label="Project Name"
            placeholder="Project Name"
            valuePropName={
              !!defaultProject || !!defaultFormValue ? 'value' : 'name'
            }
            disabled={!!defaultProject || !!defaultFormValue}
            rules={[
              {
                required: true,
                message: 'Please enter project name',
              },
            ]}
            fieldProps={{
              ...projectNameDefaultFieldProps,
              onSearch: (keywords) =>
                projectNameSearch(keywords, {
                  uniqueLogic:
                    FieldQueryHighlightUniqueLogicEnum.WITH_PROJECT_CUSTOMER_TAG,
                }),
              options: projectNameOptions,
            }}
            onChange={(value: DefaultOptionType) => {
              resetRequiredTruckType(value);
              getCustomerCodeHandle(value?.id);
            }}
          />
          <ProFormSelect
            name="dispatchType"
            label="Dispatch Type"
            placeholder="Dispatch Type"
            disabled={!!defaultFormValue || !isValidityPeriod}
            rules={[
              {
                required: true,
                message: 'Please enter dispatch type',
              },
            ]}
            initialValue={
              !isValidityPeriod
                ? WaybillDispatchTypeEnumText[
                    WaybillDispatchTypeEnum.TEMPORARY_DISPATCH
                  ]
                : (defaultFormValue?.dispatchType ??
                  WaybillDispatchTypeEnumText[
                    WaybillDispatchTypeEnum.STANDARD_DISPATCH
                  ])
            }
            valueEnum={WaybillDispatchTypeEnumText}
            onChange={resetRequiredTruckType}
          />
          <ProFormSelect
            name="requiredTruckType"
            label="Required Truck Type"
            placeholder="Input or select"
            dependencies={['dispatchType', 'projectName']}
            showSearch
            fieldProps={{
              filterOption: true,
              notFoundContent: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No data, You can add truck types in Route Libraries"
                />
              ),
            }}
            rules={[
              {
                required: true,
                message: 'Please select Required Truck Type',
              },
            ]}
            request={async (params) => {
              if (!params.dispatchType) {
                return [];
              }
              const res = await getRequireTruckType({
                projectId: params.projectName?.id,
                dispatchType: params.dispatchType,
              });
              if (res.code === 200) {
                return res?.data?.map((item: IRequireTruckListItem) => {
                  return {
                    label: item.name,
                    value: item.id,
                  };
                });
              } else {
                return [];
              }
            }}
          />

          {!!customerCodeList?.length ? (
            <Form.Item label="Customer Code">
              <Form.List name="customerCode">
                {(fields) => (
                  <div>
                    {fields.map(({ name }, index) => {
                      return (
                        <Row gutter={24} key={name}>
                          <Col span={12}>
                            <div
                              className="ellipsis"
                              style={{ lineHeight: '32px' }}
                            >
                              <CustomTooltip
                                title={
                                  customerCodeList[index]?.customerCodeTypeName
                                }
                              >
                                {customerCodeList[index]?.customerCodeTypeName}
                              </CustomTooltip>
                            </div>
                          </Col>
                          <Col span={12}>
                            <ProFormText
                              placeholder={`Please enter Number`}
                              name={[name, 'number']}
                              rules={[
                                {
                                  whitespace: true,
                                  message: 'Cannot only contain spaces',
                                },
                                {
                                  max: MAX_LENGTH.NAME_200,
                                  message: `Number cannot exceed ${MAX_LENGTH.NAME_200} characters`,
                                },
                              ]}
                            />
                          </Col>
                        </Row>
                      );
                    })}
                  </div>
                )}
              </Form.List>
            </Form.Item>
          ) : null}
        </div>
      </ModalForm>
    </>
  );
};

export default WaybillModal;
