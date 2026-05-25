import {
  getProjectSubtaskConfigProcessTypeList,
  getProjectSubtaskConfiguration,
  saveProjectSubtaskConfiguration,
} from '@/api/project';
import {
  IProcessNameItem,
  ISubtaskConfigParams,
  ISubtaskConfigurationItem,
} from '@/api/types/project';
import {
  SubtaskConfigurationProcessStatusEnum,
  SubtaskConfigurationTimeEnum,
  SubtaskConfigurationTimeEnumText,
} from '@/enums';
import useWindowSize from '@/hooks/useWindowSize';
import {
  ModalForm,
  ModalFormProps,
  ProFormDigit,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Col, Form, message, Radio, Row, Spin } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './common.less';

type ISubtaskConfigurationModal = ModalFormProps & {
  projectId: number | string | undefined;
  onConfirm: () => void;
};
const SubtaskConfigurationModal = ({
  projectId,
  modalProps,
  onConfirm,
  ...restProps
}: ISubtaskConfigurationModal) => {
  const formRef = useRef<ProFormInstance>();
  const windowSize = useWindowSize();
  const [subtaskConfigurationList, setSubtaskConfigurationList] = useState<
    ISubtaskConfigurationItem[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [processNameOptionObj, setProcessNameOptionObj] = useState<{
    [key: string]: IProcessNameItem[];
  }>({});
  const [processNecessityObj, setProcessNecessityObj] = useState<{
    [key: string]: string | boolean | undefined;
  }>({});

  const submit = async (params: any) => {
    let list: ISubtaskConfigParams[] = [];
    subtaskConfigurationList.forEach((subtask) => {
      if (params[`${subtask.processId}`]) {
        list.push({
          processId: params[`${subtask.processId}`],
          necessity: params[`${subtask.necessity}`],
          time: params[`${subtask.time}`],
          timeType: params[`${subtask.timeType}`],
        });
      }
    });
    if (!list.length) {
      return message.error(
        'Empty data cannot be submitted, you can close pop-up directly.',
      );
    }
    setConfirmLoading(true);
    const res = await saveProjectSubtaskConfiguration({
      list,
      projectId: Number(projectId),
    }).finally(() => {
      setConfirmLoading(false);
    });
    if (res.code === 200) {
      message.success('Subtask Configuration of Project successfully.');
      onConfirm?.();
    }
  };

  const handleItemNecessityChange = (
    value: boolean,
    subtask: ISubtaskConfigurationItem,
  ) => {
    setProcessNecessityObj({
      ...processNecessityObj,
      [subtask.processTypeId]: value,
    });
    formRef?.current?.setFieldValue(subtask.time, undefined);
    formRef?.current?.setFieldValue(
      subtask.timeType,
      SubtaskConfigurationTimeEnum.DAY,
    );
  };

  const getSubtaskConfiguration = async () => {
    setLoading(true);
    const res = await getProjectSubtaskConfiguration({
      id: Number(projectId),
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      const formDefaultValue: ISubtaskConfigurationItem[] =
        res.data?.filter((item) => item.processTypeId !== 11) || [];
      let list: ISubtaskConfigurationItem[] = [];
      const necessityObj: { [key: string]: string | boolean | undefined } = {};
      formDefaultValue?.forEach((i: ISubtaskConfigurationItem) => {
        const necessityVal = [true, false].includes(i.necessity as boolean)
          ? i.necessity
          : undefined;
        necessityObj[i.processTypeId] = necessityVal;
        list.push({
          processTypeId: i.processTypeId,
          processType: `processType${i.processTypeId}`,
          processId: `processId${i.processTypeId}`,
          necessity: `necessity${i.processTypeId}`,
          time: `time${i.processTypeId}`,
          timeType: `timeType${i.processTypeId}`,
        });

        formRef?.current?.setFieldValue(
          `processType${i.processTypeId}`,
          i.processType,
        );
        formRef?.current?.setFieldValue(
          `processId${i.processTypeId}`,
          i.processId || undefined,
        );
        formRef?.current?.setFieldValue(
          `necessity${i.processTypeId}`,
          necessityVal,
        );
        formRef?.current?.setFieldValue(
          `time${i.processTypeId}`,
          i.time || undefined,
        );
        formRef?.current?.setFieldValue(
          `timeType${i.processTypeId}`,
          i.timeType || SubtaskConfigurationTimeEnum.DAY,
        );
      });
      console.log('list', list, necessityObj);
      setProcessNecessityObj(necessityObj);
      setSubtaskConfigurationList(list);
    }
  };

  const getSubtaskConfigProcessNameSelectList = async () => {
    const res = await getProjectSubtaskConfigProcessTypeList();
    const optionObj: { [key: string]: IProcessNameItem[] } = {};
    if (res.code === 200) {
      const selectList = res.data || [];
      selectList.forEach((item) => {
        optionObj[item.processTypeId] = item.processDefList || [];
      });
      setProcessNameOptionObj(optionObj);
    }
  };

  const getOptionList = useCallback(
    (key: string | number) => {
      try {
        if (JSON.stringify(processNameOptionObj) === '{}') return [];
        return processNameOptionObj[key] || [];
      } catch (error) {
        return [];
      }
    },
    [processNameOptionObj],
  );

  useEffect(() => {
    getSubtaskConfigProcessNameSelectList();
    getSubtaskConfiguration();
  }, []);

  return (
    <>
      <ModalForm
        name="subtask-configuration"
        open={true}
        title={'Subtask Configuration of Project'}
        width={1162}
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
          },
        }}
        style={{
          overflowX: windowSize.width <= 1200 ? 'scroll' : 'hidden',
        }}
        {...restProps}
      >
        <Spin
          spinning={loading}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
          }}
        />
        <Row style={{ flexFlow: 'nowrap' }}>
          <Col span={4} style={{ marginRight: 32 }}>
            <div className={styles.columnTitle}>Process Type</div>
          </Col>
          <Col span={9} style={{ marginRight: 32 }}>
            <div className={styles.columnTitle}>Process Name</div>
          </Col>
          <Col span={5} style={{ marginRight: 32 }}>
            <div className={styles.columnTitle}>Necessity of process</div>
          </Col>
          <Col span={4}>
            <div className={styles.columnTitle}>Time limit</div>
          </Col>
        </Row>
        {subtaskConfigurationList.map((subtask) => (
          <div
            key={subtask.processTypeId}
            style={{ display: 'flex', marginTop: 32, height: 32 }}
          >
            <Col span={4} style={{ marginRight: 32 }}>
              <Form.Item name={`${subtask.processType}`}>
                {formRef?.current?.getFieldValue(subtask.processType)}
              </Form.Item>
            </Col>
            <Col span={9} style={{ marginRight: 32 }}>
              <ProFormSelect
                showSearch
                name={`${subtask.processId}`}
                options={getOptionList(subtask.processTypeId).map((item) => ({
                  disabled:
                    item.processStatus !==
                    SubtaskConfigurationProcessStatusEnum.ACTIVE,
                  label: item.processName,
                  value: item.id,
                }))}
                rules={[
                  {
                    required:
                      processNecessityObj[subtask.processTypeId] !== undefined,
                    message: `Please fill in the information`,
                  },
                  {
                    validator(_, value) {
                      const optionList = getOptionList(subtask.processTypeId);
                      const len = optionList.length;
                      for (let i = 0; i < len; i++) {
                        if (
                          optionList[i].id === value &&
                          optionList[i].processStatus !==
                            SubtaskConfigurationProcessStatusEnum.ACTIVE
                        ) {
                          return Promise.reject(
                            new Error(
                              `The current process is ${optionList[i].processStatus} and cannot generate subtasks`,
                            ),
                          );
                        }
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              />
            </Col>
            <Col span={5} style={{ marginRight: 32 }}>
              <Form.Item
                name={`${subtask.necessity}`}
                rules={[
                  {
                    validator(_, value) {
                      const processIdValue = formRef?.current?.getFieldValue(
                        subtask.processId,
                      );
                      if (processIdValue && value === undefined) {
                        return Promise.reject(
                          new Error('Please select the necessity'),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Radio.Group
                  onChange={(val) => {
                    handleItemNecessityChange(val.target.value, subtask);
                  }}
                >
                  <Radio value={false}>Optional</Radio>
                  <Radio value={true}>Required</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={4} style={{ display: 'flex' }}>
              <ProFormDigit
                name={`${subtask.time}`}
                placeholder={''}
                disabled={!processNecessityObj[subtask.processTypeId]}
                fieldProps={{
                  controls: false,
                  precision: 0,
                  min: 1,
                  max: 99999999,
                  style: { borderRadius: 2, marginRight: 12, width: 70 },
                }}
                rules={[
                  {
                    required: !!processNecessityObj[subtask.processTypeId],
                    message: 'Enter limit',
                  },
                ]}
              />
              <ProFormSelect
                name={`${subtask.timeType}`}
                placeholder={''}
                disabled={!processNecessityObj[subtask.processTypeId]}
                options={Object.keys(SubtaskConfigurationTimeEnumText).map(
                  (item) => ({
                    label: item,
                    value: item,
                  }),
                )}
                allowClear={false}
              />
            </Col>
          </div>
        ))}
      </ModalForm>
    </>
  );
};

export default SubtaskConfigurationModal;
