import {
  projectCustomerCodeConfigList,
  projectCustomerCodeConfigUpdate,
  projectCustomerCodeTypeList,
} from '@/api/project';
import {
  IProjectCustomerCodeConfigItem,
  IProjectCustomerCodeTypeItem,
} from '@/api/types/project';
import { MAX_LENGTH } from '@/constants';
import { ProjectCustomerCodeConfigurationObject } from '@/enums';
import { formatString } from '@/utils/format';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Col, Form, message, Select, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
const { Option } = Select;

export interface ICheckedObj {
  [key: string]: string | number | undefined;
}

type ICustomerCodeConfigurationModal = ModalFormProps & {
  projectId?: number;
  canEdit?: boolean;
  onConfirm: () => void;
};

const CustomerCodeConfigurationModal = ({
  projectId,
  canEdit = true,
  onConfirm,
  modalProps,
  ...restProps
}: ICustomerCodeConfigurationModal) => {
  const formRef = useRef<ProFormInstance>();
  const [optionList, setOptionList] = useState<IProjectCustomerCodeTypeItem[]>(
    [],
  );
  const [podConfigurationList, setPodConfigurationList] = useState<
    IProjectCustomerCodeConfigItem[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState('');
  const [checkedList, setCheckedList] = useState<(string | number)[]>([]);
  const [configNumber, setConfigNumber] = useState(0);

  const customerCodeTypeCheckedObj = useRef<ICheckedObj>({});

  const submit = async () => {
    await formRef.current?.validateFields();
    const params = formRef.current?.getFieldsValue();
    let payload: IProjectCustomerCodeConfigItem[] = [];
    podConfigurationList.forEach((config) => {
      const customerCode = params[`${config.customerCodeTypeId}`];
      if (customerCode) {
        const obj: IProjectCustomerCodeConfigItem = {
          id: typeof config.id === 'number' ? config.id : undefined,
          required: params[`${config.required}`],
        };
        if (typeof customerCode === 'number') {
          obj.customerCodeTypeId = customerCode;
        } else {
          obj.customerCodeTypeName = customerCode;
        }
        payload?.push(obj);
      }
    });
    setConfirmLoading(true);
    const res = await projectCustomerCodeConfigUpdate({
      projectId: +projectId!,
      customerCodeConfigList: payload,
    }).finally(() => {
      setConfirmLoading(false);
    });
    if (res.code === 200) {
      message.success('Customer Code Configuration of Project successfully!');
      onConfirm();
    }
  };

  const handleSelectChange = (
    key: string | number,
    value: string | number | undefined,
    isDelete = false,
  ) => {
    // 可输入下拉框值发生变化
    const newObj = { ...customerCodeTypeCheckedObj.current };
    newObj[key] = value;
    if (isDelete) {
      delete newObj[key];
    }
    customerCodeTypeCheckedObj.current = newObj;
    const newCheckedList: number[] = [];
    Object.values(newObj).forEach((item) => {
      if (typeof item === 'number') {
        newCheckedList.push(item);
      }
    });
    setInputValue('');
    setCheckedList([...newCheckedList]);
  };

  const handleSearch = (value: string, key: string | number) => {
    setInputValue(value);
    // 输入的值是否在下拉框存在并且未被选择过
    optionList.forEach((item) => {
      if (item.name === formatString(value) && !checkedList.includes(item.id)) {
        formRef?.current?.setFieldValue(key, item.id);
        handleSelectChange(key, item.id);
      }
    });
  };

  const handleSelectInputBlur = (key: string | number) => {
    // 已存在选择的值/输入的值
    let isExist = false;
    let value: string | undefined = formatString(inputValue);
    Object.values(customerCodeTypeCheckedObj.current).forEach((item) => {
      if (item === value) {
        isExist = true;
      }
    });
    optionList.forEach((item) => {
      if (item.name === value && checkedList.includes(item.id)) {
        isExist = true;
      }
    });
    if (isExist) {
      return message.warning('This type document already exists.');
    }

    // 下拉框中是否存在，存在的情况在 handleSearch 函数中处理
    let notExist = true;
    optionList.forEach((item) => {
      if (item.name === value) {
        notExist = false;
      }
    });

    value = value || formRef?.current?.getFieldValue(key);
    if (notExist) {
      if (!value) {
        value = undefined;
      }
      formRef?.current?.setFieldValue(key, value);
      handleSelectChange(key, value);
    }
  };

  const deleteRequirement = (deleteId: string, deleteName: string | number) => {
    const copyList = [...podConfigurationList];
    const a = copyList.filter((i) => {
      if (i.id === deleteId) {
        const deleteNameValue = formRef.current?.getFieldValue(deleteName);
        handleSelectChange(deleteName, undefined, true);
        setCheckedList(checkedList.filter((item) => item !== deleteNameValue));
      }
      return i.id !== deleteId;
    });
    setPodConfigurationList(a);
    setConfigNumber(configNumber - 1);
  };

  const addRequirement = () => {
    const id = `id${dayjs().valueOf()}`;
    const a = [
      ...podConfigurationList,
      {
        id,
        customerCodeTypeId: `customerCodeTypeId${id}`,
        required: `required${id}`,
      },
    ];
    setPodConfigurationList(a);
    setConfigNumber(configNumber + 1);
    formRef.current?.setFieldValue(`required${id}`, true);
    handleSelectChange(`customerCodeTypeId${id}`, undefined);
  };

  const initPodConfiguration = (data: IProjectCustomerCodeConfigItem[]) => {
    const formDefaultValue: IProjectCustomerCodeConfigItem[] = [...data];
    const list: IProjectCustomerCodeConfigItem[] = [];
    const initObj: ICheckedObj = {};
    formDefaultValue?.forEach((i: IProjectCustomerCodeConfigItem) => {
      list.push({
        id: i.id,
        customerCodeTypeId: `customerCodeTypeId${i.id}`,
        required: `required${i.id}`,
      });
      formRef?.current?.setFieldValue(
        `customerCodeTypeId${i.id}`,
        i.customerCodeTypeId,
      );
      initObj[`customerCodeTypeId${i.id}`] = i.customerCodeTypeId;
      formRef?.current?.setFieldValue(`required${i.id}`, i.required);
    });
    customerCodeTypeCheckedObj.current = initObj;
    // 初始化时执行一次，填充校验数据
    handleSelectChange('init', undefined, true);
    setPodConfigurationList(list);
  };

  const getConfigList = async () => {
    setLoading(true);
    const res = await projectCustomerCodeConfigList(+projectId!).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      const listData = res.data || [];
      const len = listData?.length;
      if (len) {
        initPodConfiguration(listData);
        setConfigNumber(len);
      } else {
        addRequirement();
        setConfigNumber(1);
      }
    }
  };

  const getOption = async () => {
    const res = await projectCustomerCodeTypeList();
    if (res.code === 200) {
      setOptionList(res.data || []);
    }
  };

  useEffect(() => {
    getConfigList();
    getOption();
  }, []);

  return (
    <>
      <ModalForm
        name="Customer-Code-Configuration"
        open={true}
        title={`Customer Code Configuration of Project`}
        width={700}
        style={{
          height: configNumber > 10 ? 480 : 'auto',
          overflowY: configNumber > 10 ? 'scroll' : 'hidden',
        }}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          maskClosable: false,
        }}
        onFinish={submit}
        submitter={{
          submitButtonProps: {
            loading: confirmLoading,
            style: {
              display: canEdit ? 'block' : 'none',
            },
          },
        }}
        {...restProps}
      >
        <Spin spinning={loading}>
          <div className={styles.intro}>
            Fields set as required will be validated when the waybill is confirm
            delivery
          </div>
          <div className={styles.requirement}>
            <div style={{ flex: 1 }}>
              {podConfigurationList.map((config, index) => (
                <div
                  key={config.customerCodeTypeId}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: index !== 0 ? 12 : 0,
                  }}
                >
                  <Col style={{ width: canEdit ? 276 : 320 }}>
                    <Form.Item
                      name={config.customerCodeTypeId}
                      validateTrigger="onBlur"
                      rules={[
                        {
                          validator() {
                            const value =
                              formRef?.current?.getFieldValue(
                                config.customerCodeTypeId,
                              ) || '';

                            const formattedValue = formatString(
                              typeof value === 'number' ? String(value) : value,
                            );

                            const type = formRef?.current?.getFieldValue(
                              config.required,
                            );
                            if (type && !value) {
                              return Promise.reject(
                                new Error(
                                  'Please fill in the required Customer Code',
                                ),
                              );
                            }
                            if (formattedValue?.length > MAX_LENGTH.MAX_120) {
                              return Promise.reject(
                                new Error(
                                  `Customer Code must not exceed ${MAX_LENGTH.MAX_120} characters in length`,
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Select
                        disabled={!canEdit}
                        value={formRef?.current?.getFieldValue(
                          config.customerCodeTypeId,
                        )}
                        onChange={(val) => {
                          handleSelectChange(config.customerCodeTypeId!, val);
                        }}
                        onClear={() => {
                          handleSelectChange(
                            config.customerCodeTypeId!,
                            undefined,
                          );
                        }}
                        filterOption={(
                          input: string,
                          option?: { children: string },
                        ) => {
                          return (option?.children ?? '')
                            .toLowerCase()
                            .includes(input.toString()?.toLowerCase());
                        }}
                        showSearch
                        placeholder="Please select or input"
                        onSearch={(val) => {
                          handleSearch(val, config.customerCodeTypeId!);
                        }}
                        allowClear
                        onBlur={() =>
                          handleSelectInputBlur(config.customerCodeTypeId!)
                        }
                        style={{ width: '100%' }}
                      >
                        {optionList.map(
                          (option: IProjectCustomerCodeTypeItem) => (
                            <Option
                              key={option.name}
                              value={option.id}
                              disabled={checkedList.includes(option.id)}
                            >
                              {option.name}
                            </Option>
                          ),
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col style={{ width: canEdit ? 276 : 320 }}>
                    <ProFormSelect
                      disabled={!canEdit}
                      name={config.required}
                      // @ts-ignore
                      options={Object.entries(
                        ProjectCustomerCodeConfigurationObject,
                      ).map(([label, value]) => ({
                        label,
                        value,
                      }))}
                      allowClear={false}
                    />
                  </Col>

                  {canEdit && (
                    <Col style={{ display: 'flex' }}>
                      <DeleteOutlined
                        className={styles.icon}
                        onClick={() =>
                          deleteRequirement(
                            config.id!,
                            config.customerCodeTypeId!,
                          )
                        }
                      />
                      {index === podConfigurationList?.length - 1 && (
                        <PlusCircleOutlined
                          className={styles.icon}
                          style={{
                            left:
                              index === podConfigurationList?.length - 1
                                ? 38
                                : 0,
                          }}
                          onClick={addRequirement}
                        />
                      )}
                    </Col>
                  )}
                </div>
              ))}
            </div>
            {canEdit && !podConfigurationList?.length && (
              <PlusCircleOutlined
                className={styles.addIcon}
                onClick={addRequirement}
              />
            )}
          </div>
        </Spin>
      </ModalForm>
    </>
  );
};

export default CustomerCodeConfigurationModal;
