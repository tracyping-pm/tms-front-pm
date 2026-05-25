import {
  checkTruckTypes,
  getLibraryTruckType,
  manageTruckTypes,
} from '@/api/project';
import { AddTruckTypeItem } from '@/api/types/project';
import { ITruckTypeListItem } from '@/api/types/truck';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { App, Button, Col, Row, Spin } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactComponent as DeleteIcon } from '../../../../public/svg/customer_edit_icon.svg';
import styles from './common.less';

type ICustomerModal = ModalFormProps & {
  truckTypeList: ITruckTypeListItem[];
  formDefaultValue?: any;
  hideModal: () => void;
  refresh: () => void;
};

const TruckTypeModal = ({
  truckTypeList = [],
  width = 480,
  refresh,
  hideModal,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { message, modal } = App.useApp();
  const { id: libraryId } = useParams();
  const [typeList, setTypeList] = useState<AddTruckTypeItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const formRef = useRef<ProFormInstance>();
  const indexRef = useRef<number>(1);
  const listRef = useRef(null);
  const getList = async () => {
    setLoading(true);
    const res = await getLibraryTruckType({ id: Number(libraryId) });
    setLoading(false);
    if (res.code === 200) {
      const s = res.data?.map((item) => item.truckTypeId);
      const t = res.data?.map((item) => {
        formRef.current?.setFieldValue(
          'Type' + indexRef.current,
          item.truckTypeId,
        );
        const obj = {
          id: indexRef.current,
          name: 'Type' + indexRef.current,
        };
        indexRef.current += 1;
        return obj;
      });
      setSelected(s);
      setTypeList(t);
    }
  };

  useEffect(() => {
    getList();
  }, []);

  const truckTypeOptions = useMemo(() => {
    return truckTypeList?.map((item: ITruckTypeListItem) => {
      if (selected.includes(item.id)) {
        return {
          label: item.name,
          value: item.id,
          disabled: true,
        };
      } else {
        return {
          label: item.name,
          value: item.id,
        };
      }
    });
  }, [selected]);

  const addType = () => {
    if (selected.length !== typeList.length) {
      return message.warning(
        'Please add after completing the settings of the added items.',
      );
    }
    const list = typeList.slice();
    list.push({ id: indexRef.current, name: 'Type' + indexRef.current });
    setTypeList(list);
    indexRef.current += 1;
  };

  const deleteType = (index: number) => {
    const list = typeList.slice();
    list.splice(index, 1);
    const copy = selected.slice();
    copy.splice(index, 1);
    setTypeList(list);
    setSelected(copy);
  };

  const saveType = async (arr: number[]) => {
    const res = await manageTruckTypes({
      id: Number(libraryId),
      bindIds: arr,
    });
    if (res.code === 200) {
      refresh();
      message.success('Add successfully!');
    }
  };

  const submit = async (params: any) => {
    const values: number[] = Object.values(params);
    const check = await checkTruckTypes({
      id: Number(libraryId),
      bindIds: values,
    });
    if (check.code === 200) {
      switch (check.data) {
        case 1:
          refresh();
          break;
        case 2:
          modal.confirm({
            title: `Add Confirm`,
            content: `You add some new Truck Types. After confirmation, Type will be added to all Versions. Please pay attention to price maintenance.`,
            okText: 'Confirm',
            onOk: async () => {
              await saveType(values);
            },
          });
          break;
        case 3:
          modal.confirm({
            title: `Delete Confirm`,
            content: `You delete some Truck Types. After confirmation, these Types in all Versions will be deleted, as well as the corresponding prices.`,
            okText: 'Confirm',
            onOk: async () => {
              await saveType(values);
            },
          });
          break;
        case 4:
          modal.confirm({
            title: `Delete Confirm`,
            content: `The Truck Type you want to delete is in use and cannot be deleted.`,
            okText: 'Confirm',
            okButtonProps: {
              style: { outline: 'none' },
            },
          });
          break;
      }
    }
  };

  useEffect(() => {
    // 滑动条滚动到底部
    const current = listRef.current!;
    //@ts-ignore
    current.scrollTop = current.scrollHeight;
  }, [indexRef.current]);

  return (
    <>
      <ModalForm
        name="truck-type-modal"
        open={true}
        title={`Manage Truck Type`}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        modalProps={{
          ...modalProps,
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
          okText: 'Confirm',
        }}
        onFinish={submit}
        {...restProps}
      >
        <Spin spinning={loading}>
          <div
            ref={listRef}
            style={{ marginTop: '14px', maxHeight: 500, overflowY: 'auto' }}
          >
            <div className={styles.desc}>
              Please set the required Truck Type according to project needs. The
              set Truck Type will be immediately applicable to all Pricing
              Versions, so please add or delete carefully
            </div>
            {typeList.map((type, index) => (
              <Row key={type.id}>
                <Col span={5} className={styles.rangeLabel}>{`Type ${
                  index + 1
                }`}</Col>
                <Col span={16}>
                  <ProFormSelect
                    name={type.name}
                    placeholder="Truck Type"
                    rules={[
                      {
                        required: true,
                        message:
                          'Please add after completing the settings of the added items.',
                      },
                    ]}
                    showSearch
                    fieldProps={{
                      filterOption: true,
                      onSelect: (value: number) => {
                        const copy = selected.slice();
                        copy[index] = value;
                        setSelected(copy);
                      },
                    }}
                    options={truckTypeOptions}
                  />
                </Col>
                <Col span={3}>
                  <DeleteIcon
                    onClick={() => deleteType(index)}
                    style={{
                      margin: '8px 0 0 12px',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                    }}
                  />
                </Col>
              </Row>
            ))}
          </div>
          <Button icon={<PlusOutlined />} onClick={addType}>
            Add Type
          </Button>
        </Spin>
      </ModalForm>
    </>
  );
};

export default TruckTypeModal;
