import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button, Col, Form, Row, Spin } from 'antd';

import { useEffect, useRef, useState } from 'react';
import { ReactComponent as CustomerDeleteIcon } from '../../../../../public/svg/customer_edit_icon.svg';

import { projectAdditionSetting } from '@/api/project';
import { AdditionSettingItem } from '@/api/types/project';
import {
  AdditionSettingsCalculationEnum,
  AdditionSettingsCalculationEnumText,
  AdditionSettingsItemEnumText,
  AdditionSettingsObjectEnumText,
} from '@/enums';
import dayjs from 'dayjs';
import styles from './common.less';
import CustomSelect from './components/CustomSelect';
type IProjectAdditionSettingsModal = ModalFormProps & {
  projectId: number | string | undefined;
  onConfirm: (values: any) => void;
};
const ProjectAdditionSettingsModal = ({
  projectId,
  modalProps,
  onConfirm,
  ...restProps
}: IProjectAdditionSettingsModal) => {
  const formRef = useRef<ProFormInstance>();
  const listRef = useRef(null);
  const [rangeNameList, setRangeNameList] = useState<AdditionSettingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterList, setFilterList] = useState({});

  const submit = async (params: any) => {
    let payload: any = [];
    rangeNameList.forEach((range) => {
      payload?.push({
        id: typeof range.id === 'number' ? range.id : undefined,
        object: params[`${range.object}`],
        calculation: params[`${range.calculation}`],
        item: params[`${range.item}`],
      });
    });
    onConfirm?.(payload);
  };
  // 获取每个object的所选择的item
  const formatList = (list: AdditionSettingItem[]) => {
    const a: any = {};

    list.forEach((item: { object: any; item: any }) => {
      if (Object.keys(a).find((i) => i === item.object)) {
        a[item.object].push(item.item);
      } else {
        a[item.object] = [];
        a[item.object].push(item.item);
      }
    });
    setFilterList(a);
  };
  // 添加或删除选项时 更新每个object对应的item
  const updateItem = (list: AdditionSettingItem[]) => {
    const params = formRef.current?.getFieldsValue();
    const payload: AdditionSettingItem[] = [];
    list.forEach((range) => {
      payload?.push({
        id: range.id,
        object: params[`${range.object}`],
        calculation: params[`${range.calculation}`],
        item: params[`${range.item}`],
      });
    });
    formatList(payload);
  };

  const deleteRange = (index: number | string) => {
    formRef.current?.setFieldValue(`object${index}`, undefined);
    formRef.current?.setFieldValue(`item${index}`, undefined);
    const copyList = rangeNameList;
    const a = copyList.filter((i) => i.id !== index);
    // copyList.splice(index, 1);
    updateItem(a);

    setRangeNameList(a);
  };

  const addItem = () => {
    const ids = dayjs().valueOf();
    const a = [
      ...rangeNameList,
      {
        id: `test${ids}`,
        object: `object${ids}`,
        calculation: `calculation${ids}`,
        item: `item${ids}`,
      },
    ];

    setRangeNameList(a);
    updateItem(a);
    formRef.current?.setFieldValue(
      `calculation${ids}`,
      AdditionSettingsCalculationEnum.INCREASE,
    );
  };

  const getAdditionSetting = async () => {
    setLoading(true);
    const res = await projectAdditionSetting({ id: Number(projectId) });
    setLoading(false);
    const formDefaultValue = res.data;
    let list: AdditionSettingItem[] = [];
    formDefaultValue?.forEach((i) => {
      list.push({
        id: i.id,
        object: `object${i.id}`,
        calculation: `calculation${i.id}`,
        item: `item${i.id}`,
      });

      formRef?.current?.setFieldValue([`object${i.id}`], i.object);
      formRef?.current?.setFieldValue(`calculation${i.id}`, i.calculation);
      formRef?.current?.setFieldValue(`item${i.id}`, i.item);
    });
    formatList(formDefaultValue);
    setRangeNameList(list);
  };

  useEffect(() => {
    // 滑动条滚动到底部
    const current = listRef.current!;
    //@ts-ignore
    current.scrollTop = current.scrollHeight;
  }, []);

  // 初始化
  useEffect(() => {
    getAdditionSetting();
  }, []);

  return (
    <>
      <ModalForm
        name="project-addition-settings"
        open={true}
        title={`Mileage range`}
        width={580}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          maskClosable: false,
        }}
        onFinish={submit}
        {...restProps}
      >
        <div
          ref={listRef}
          style={{ marginTop: '14px', maxHeight: 500, overflowY: 'auto' }}
        >
          <Spin spinning={loading}>
            <Row justify="space-around">
              <Col span={7}>
                <div className={styles.settingsTitle}>Object</div>
              </Col>
              <Col span={7}>
                <div className={styles.settingsTitle}>Calculation</div>
              </Col>
              <Col span={7}>
                <div className={styles.settingsTitle}>Item</div>
              </Col>
              <Col span={1}></Col>
            </Row>
            {rangeNameList.map((range) => (
              // <Row justify="space-around" key={index}>
              <div key={range.id} style={{ display: 'flex', gap: '10px' }}>
                <Col span={7}>
                  <ProFormSelect
                    name={`${range.object}`}
                    valueEnum={AdditionSettingsObjectEnumText}
                    fieldProps={{
                      onChange: (value) => {
                        formRef?.current?.setFieldValue(
                          `${range.object}`,
                          value,
                        );
                        formRef?.current?.setFieldValue(
                          `${range.item}`,
                          undefined,
                        );
                        updateItem(rangeNameList);
                      },
                    }}
                    rules={[
                      {
                        required: true,
                        message: `Please complete the information`,
                      },
                    ]}
                  />
                </Col>
                <Col span={7}>
                  <ProFormSelect
                    name={`${range.calculation}`}
                    options={Object.keys(
                      AdditionSettingsCalculationEnumText,
                    ).map((item) => ({
                      label: `${item}(${item === 'Increase' ? '+' : '-'})`,
                      value: item,
                    }))}
                    // valueEnum={}
                    rules={[
                      {
                        required: true,
                        message: `Please complete the information`,
                      },
                    ]}
                  />
                </Col>
                <Col span={7}>
                  <Form.Item
                    name={`${range.item}`}
                    rules={[
                      {
                        required: true,
                        message: `Please complete the information`,
                      },
                    ]}
                  >
                    <CustomSelect
                      valueEnum={AdditionSettingsItemEnumText}
                      initValue={formRef?.current?.getFieldValue(
                        `${range.item}`,
                      )}
                      filterList={
                        // @ts-ignore
                        filterList?.[
                          formRef?.current?.getFieldValue(`${range.object}`)
                        ]
                      } // 由于选项需要有禁用已选择的事项所以需要传入Object所对应已选择item
                      targetHandle={() => {
                        updateItem(rangeNameList);
                      }} // 选择时更新Object对应item
                    />
                  </Form.Item>
                </Col>
                <Col span={1}>
                  <CustomerDeleteIcon
                    onClick={() => deleteRange(range.id!)}
                    style={{
                      margin: '8px 0 0 0',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                    }}
                  />
                </Col>
              </div>
            ))}

            <Button
              style={{
                border: 'none',
                boxShadow: 'none',
                color: '#009688',
                padding: 0,

                position: 'relative',
              }}
              type="link"
              onClick={addItem}
              icon={<PlusOutlined />}
            >
              Add
            </Button>
          </Spin>
        </div>
      </ModalForm>
    </>
  );
};

export default ProjectAdditionSettingsModal;
