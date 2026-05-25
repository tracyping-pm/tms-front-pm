import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import {
  ProForm,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Col, Form, message, Select, Switch } from 'antd';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {
  IPodConfigurationItem,
  IPriveVendorListItemV,
} from '@/api/types/project';
import { MAX_LENGTH } from '@/constants';
import {
  PodConfigurationCopyEnum,
  PodConfigurationCopyEnumText,
  PodConfigurationRequirementTypeText,
  TransmittalTypeEnum,
} from '@/enums';
import { formatString } from '@/utils/format';
import dayjs from 'dayjs';
import styles from '../common.less';
const { Option } = Select;

export interface IPodConfigurationRequirementRef {
  submit: () => void;
  skippable: boolean;
}
export interface ICheckedObj {
  [key: string]: string | number | undefined;
}

interface IPodConfigurationRequirement {
  initSkippable?: boolean;
  requireType: TransmittalTypeEnum;
  optionList: IPriveVendorListItemV[];
  initData: IPodConfigurationItem[];
  podNumberTypeCheckedObj: ICheckedObj;
  setPodNumberTypeCheckedObj: (values: ICheckedObj) => void;
  configNumber: number;
  setConfigNumber: (val: number) => void;
  checkedList: (string | number)[];
  setCheckedList: (values: (string | number)[]) => void;
}

const PodConfigurationRequirement = forwardRef(
  (
    {
      initSkippable,
      requireType,
      optionList,
      initData,
      podNumberTypeCheckedObj,
      setPodNumberTypeCheckedObj,
      checkedList,
      setCheckedList,
      configNumber,
      setConfigNumber,
    }: IPodConfigurationRequirement,
    ref,
  ) => {
    const formRef = useRef<ProFormInstance>();
    const [podConfigurationList, setPodConfigurationList] = useState<
      IPodConfigurationItem[]
    >([]);

    const [inputValue, setInputValue] = useState('');

    const [skippable, setSkippable] = useState(initSkippable);

    useEffect(() => {
      if (initSkippable) {
        setSkippable(true);
      }
    }, [initSkippable]);

    const submit = async () => {
      await formRef.current?.validateFields();
      const params = formRef.current?.getFieldsValue();
      let payload: IPodConfigurationItem[] = [];
      podConfigurationList.forEach((config) => {
        payload?.push({
          id: params[`${config.id}`],
          podNumberTypeId: params[`${config.podNumberTypeId}`],
          copyType: params[`${config.copyType}`],
        });
      });
      return payload;
    };

    useImperativeHandle(ref, () => ({
      submit,
      skippable,
    }));

    const handleSelectChange = (
      key: string | number,
      value: string | number | undefined,
      isDelete = false,
    ) => {
      // 可输入下拉框值发生变化
      const newObj = { ...podNumberTypeCheckedObj };
      newObj[key] = value;
      if (isDelete) {
        delete newObj[key];
      }
      setPodNumberTypeCheckedObj(newObj);
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
        if (
          item.label === formatString(value) &&
          !checkedList.includes(item.value)
        ) {
          formRef?.current?.setFieldValue(key, item.value);
          handleSelectChange(key, item.value);
        }
      });
    };

    const handleSelectInputBlur = (key: string | number) => {
      // 已存在选择的值/输入的值
      let isExist = false;
      let value: string | undefined = formatString(inputValue);
      Object.values(podNumberTypeCheckedObj).forEach((item) => {
        if (item === value) {
          isExist = true;
        }
      });
      optionList.forEach((item) => {
        if (item.label === value && checkedList.includes(item.value)) {
          isExist = true;
        }
      });
      if (isExist) {
        return message.warning('This type document already exists.');
      }

      // 下拉框中是否存在，存在的情况在 handleSearch 函数中处理
      let notExist = true;
      optionList.forEach((item) => {
        if (item.label === value) {
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

    const deleteRequirement = (
      deleteId: string,
      deleteName: string | number,
    ) => {
      const copyList = [...podConfigurationList];
      const a = copyList.filter((i) => {
        if (i.id === deleteId) {
          const deleteNameValue = formRef.current?.getFieldValue(deleteName);
          handleSelectChange(deleteName, undefined, true);
          setCheckedList(
            checkedList.filter((item) => item !== deleteNameValue),
          );
        }
        return i.id !== deleteId;
      });
      setPodConfigurationList(a);
      setConfigNumber(configNumber - 1);
    };

    const addRequirement = () => {
      if (configNumber >= 50) {
        return message.warning('Maximum 50 file types.');
      }
      const id = `id${dayjs().valueOf()}`;
      const a = [
        ...podConfigurationList,
        {
          id,
          podNumberTypeId: `podNumberTypeId${id}`,
          copyType: `copyType${id}`,
        },
      ];
      setPodConfigurationList(a);
      setConfigNumber(configNumber + 1);
      formRef.current?.setFieldValue(
        `copyType${id}`,
        PodConfigurationCopyEnum.HARD_COPY,
      );
      handleSelectChange(`podNumberTypeId${id}`, undefined);
    };

    const initPodConfiguration = () => {
      const formDefaultValue: IPodConfigurationItem[] = [...initData];
      let list: IPodConfigurationItem[] = [];
      formDefaultValue?.forEach((i: IPodConfigurationItem) => {
        list.push({
          id: i.id,
          podNumberTypeId: `podNumberTypeId${i.id}`,
          copyType: `copyType${i.id}`,
        });
        formRef?.current?.setFieldValue(
          `podNumberTypeId${i.id}`,
          i.podNumberTypeId,
        );
        formRef?.current?.setFieldValue(`copyType${i.id}`, i.copyType);
      });
      setPodConfigurationList(list);
    };

    useEffect(() => {
      initPodConfiguration();
    }, [initData, optionList]);

    return (
      <ProForm formRef={formRef} submitter={false}>
        <div className={styles.requirement}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={styles.title}>
              {PodConfigurationRequirementTypeText[requireType]}
            </div>
            {initSkippable !== undefined && (
              <div>
                <span className={styles.skippable}>Skippable</span>
                <Switch
                  checked={skippable}
                  onChange={(val) => {
                    setSkippable(val);
                  }}
                />
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div className={styles.label}>Documents for receipt:</div>
            <div style={{ flex: 1 }}>
              {podConfigurationList.map((config, index) => (
                <div
                  key={config.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: index !== 0 ? 12 : 0,
                  }}
                >
                  <Col style={{ width: 276 }}>
                    <Form.Item
                      name={config.podNumberTypeId}
                      validateTrigger="onBlur"
                      rules={[
                        {
                          validator() {
                            const value =
                              formRef?.current?.getFieldValue(
                                config.podNumberTypeId,
                              ) || '';

                            const formattedValue = formatString(
                              typeof value === 'number' ? String(value) : value,
                            );
                            if (formattedValue.length > MAX_LENGTH.NAME_200) {
                              return Promise.reject(
                                new Error(
                                  `POD Type must not exceed ${MAX_LENGTH.NAME_200} characters in length`,
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Select
                        value={formRef?.current?.getFieldValue(
                          config.podNumberTypeId,
                        )}
                        onChange={(val) => {
                          handleSelectChange(config.podNumberTypeId!, val);
                        }}
                        onClear={() => {
                          handleSelectChange(
                            config.podNumberTypeId!,
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
                          handleSearch(val, config.podNumberTypeId!);
                        }}
                        allowClear
                        onBlur={() =>
                          handleSelectInputBlur(config.podNumberTypeId!)
                        }
                        style={{ width: '100%' }}
                      >
                        {optionList.map((option: IPriveVendorListItemV) => (
                          <Option
                            key={option.label}
                            value={option.value}
                            disabled={checkedList.includes(option.value)}
                          >
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col style={{ width: 110 }}>
                    <ProFormSelect
                      name={config.copyType}
                      options={Object.keys(PodConfigurationCopyEnumText).map(
                        (item) => ({
                          label: item,
                          value: item,
                        }),
                      )}
                      allowClear={false}
                    />
                  </Col>

                  <Col style={{ display: 'flex' }}>
                    {index === 0 && (
                      <PlusCircleOutlined
                        className={styles.icon}
                        onClick={addRequirement}
                      />
                    )}
                    {index !== 0 && (
                      <DeleteOutlined
                        className={styles.icon}
                        onClick={() =>
                          deleteRequirement(config.id!, config.podNumberTypeId!)
                        }
                      />
                    )}
                  </Col>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProForm>
    );
  },
);

export default PodConfigurationRequirement;
