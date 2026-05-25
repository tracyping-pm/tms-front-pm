import { addRouteTruckRange, getTruckTypeAndRange } from '@/api/project';
import { IAddTruckRangeParams } from '@/api/types/project';
import { MileageCalculationModeEnum } from '@/enums';
import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormCheckbox,
  ProFormDigit,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { App, Button, Col, Row } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { ReactComponent as CustomerDeleteIcon } from '../../../../public/svg/customer_edit_icon.svg';
import CustomLabel from '../../../components/CustomLabel';
import styles from './common.less';

type ICustomerModal = ModalFormProps & {
  formDefaultValue?: IAddTruckRangeParams | null;
  calculationType: string;
  hideModal: () => void;
  refresh: () => void;
};

interface IRangeNameListItem {
  id: number;
  name: string;
  dataIndex: number;
}

const LabelTitle = (props: { title: string; required?: boolean }) => {
  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '10px',
        fontSize: '16px',
        color: '#1F1F1F',
        fontWeight: 400,
      }}
    >
      {props.title}
      {props?.required ? (
        <p style={{ margin: 0, color: '#FF4D4F' }}>*</p>
      ) : null}
    </div>
  );
};

const MileageRangeModal = ({
  formDefaultValue,
  calculationType,
  width = 680,
  refresh,
  hideModal,
  modalProps,
  ...restProps
}: ICustomerModal) => {
  const { modal, message } = App.useApp();
  const { id: libraryId } = useParams();
  const formRef = useRef<ProFormInstance>();
  const listRef = useRef(null);
  const [rangeNameList, setRangeNameList] = useState<IRangeNameListItem[]>([
    { id: dayjs().valueOf(), name: 'Range1', dataIndex: 1 },
  ]);
  const indexRef = useRef<number>(2);

  useEffect(() => {
    if (formDefaultValue?.range && formDefaultValue.range?.length) {
      let list: IRangeNameListItem[] = [];
      formDefaultValue.range.forEach((range, index) => {
        list.push({
          id: dayjs().valueOf(),
          name: `Range${index + 1}`,
          dataIndex: index + 1,
        });
        formRef?.current?.setFieldValue(
          `Range${index + 1}S`,
          range.startingMileage,
        );
        formRef?.current?.setFieldValue(
          `Range${index + 1}E`,
          range.endingMileage === null ? '∞' : range.endingMileage,
        );
      });
      formRef?.current?.setFieldValue(
        'checkbox',
        !!formDefaultValue.fixedStartingPrice,
      );
      setRangeNameList(list);
      indexRef.current = formDefaultValue.range.length + 1;
    }
  }, [formDefaultValue]);

  const submit = async (params: any) => {
    const configRes = await getTruckTypeAndRange({ id: Number(libraryId) });
    let payload: IAddTruckRangeParams;
    payload = {
      routeLibraryId: Number(libraryId),
      fixedStartingPrice: params.checkbox ? 1 : 0,
      range: [],
    };
    rangeNameList.forEach((item) => {
      payload?.range?.push({
        startingMileage: params[`${item.name}S`],
        endingMileage:
          params[`${item.name}E`] === '∞' ? null : params[`${item.name}E`],
      });
    });
    if (configRes.code === 200) {
      if (configRes.data?.truckTypes?.length) {
        modal.confirm({
          title: `Confirm`,
          content: `The modification of Pricing Standard will cause all the data entered in this Library to be cleared`,
          okText: 'Confirm',
          okButtonProps: {
            style: { outline: 'none' },
          },
          onOk: async () => {
            const res = await addRouteTruckRange(payload);
            if (res.code === 200) {
              refresh();
              hideModal();
              message.success('Add successfully!');
            }
          },
        });
      } else {
        if (!configRes.data?.ranges?.length) {
          modal.confirm({
            title: `Confirm`,
            content: `Please add Type and enter the price after confirming that the range is entered correctly. The modification of the interval will clear all data`,
            okText: 'Confirm',
            okButtonProps: {
              style: { outline: 'none' },
            },
            cancelButtonProps: {
              style: { display: 'none' },
            },
            maskClosable: false,
            onOk: async () => {
              const res = await addRouteTruckRange(payload);
              if (res.code === 200) {
                refresh();
                hideModal();
                message.success('Add successfully!');
              }
            },
          });
        } else {
          const res = await addRouteTruckRange(payload);
          if (res.code === 200) {
            refresh();
            hideModal();
            message.success('Add successfully!');
          }
        }
      }
    }
  };

  // @ts-ignore
  const validatorStartRule = (role, value, index) => {
    if (index === 0) return Promise.resolve();
    const preRange = rangeNameList[index - 1];
    const laterRange = rangeNameList[index];
    const preValue = formRef?.current?.getFieldValue(`${preRange.name}E`);
    const laterValue = formRef?.current?.getFieldValue(`${laterRange.name}E`);
    if (typeof preValue === 'number' && value > preValue) {
      return Promise.reject(
        new Error('Mileage range values do not cover the full range'),
      );
    } else if (
      (typeof laterValue === 'number' && laterValue <= value) ||
      (typeof preValue === 'number' && value < preValue)
    ) {
      return Promise.reject(new Error('Mileage range overlap'));
    } else {
      return Promise.resolve();
    }
  };

  // @ts-ignore
  const validatorEndRule = (role, value, index) => {
    if (index === rangeNameList.length - 1) return Promise.resolve();
    const preRange = rangeNameList[index];
    const laterRange = rangeNameList[index + 1];
    const preValue = formRef?.current?.getFieldValue(`${preRange.name}S`);
    const laterValue = formRef?.current?.getFieldValue(`${laterRange.name}S`);
    if (
      (typeof preValue === 'number' && value <= preValue) ||
      (typeof laterValue === 'number' && laterValue < value)
    ) {
      return Promise.reject(new Error('Mileage range overlap'));
    } else if (typeof laterValue === 'number' && laterValue > value) {
      return Promise.reject(
        new Error('Mileage range values do not cover the full range'),
      );
    } else {
      return Promise.resolve();
    }
  };

  const deleteRange = (index: number) => {
    if (index === 0) {
      // 删除第一个
      setRangeNameList(rangeNameList.slice(1));
      formRef?.current?.setFieldValue(`${rangeNameList[index + 1].name}S`, 0);
    } else if (index > 0 && index !== rangeNameList.length - 1) {
      // 删除中间
      const copyList = rangeNameList.slice();
      const copyRange = rangeNameList[index];
      const preRange = rangeNameList[index - 1];
      copyList.splice(index, 1);
      setRangeNameList(copyList);
      formRef?.current?.setFieldValue(
        `${preRange.name}E`,
        formRef?.current?.getFieldValue(`${copyRange.name}E`),
      );
    } else {
      // 删除末尾
      setRangeNameList(rangeNameList.slice(0, index));
      formRef?.current?.setFieldValue(`${rangeNameList[index - 1].name}E`, '∞');
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
        name="mileage-range-modal"
        open={true}
        title={`Mileage range`}
        style={{ marginTop: '14px' }}
        width={width}
        formRef={formRef}
        initialValues={
          formDefaultValue
            ? {}
            : {
                Range1S: 0,
                Range1E: '∞',
              }
        }
        modalProps={{
          ...modalProps,
          okText: 'Confirm',
          forceRender: true,
          onCancel: hideModal,
          maskClosable: false,
        }}
        onFinish={submit}
        {...restProps}
      >
        <div
          ref={listRef}
          style={{ marginTop: '14px', maxHeight: 500, overflowY: 'auto' }}
        >
          <Row>
            <Col span={3} style={{ marginRight: '10px' }}></Col>
            <Col span={8} style={{ marginRight: '52px' }}>
              <LabelTitle title="Starting mileage" required />
            </Col>
            <Col span={8}>
              <LabelTitle title="Ending mileage" required />
            </Col>
            <Col span={2}></Col>
          </Row>
          {rangeNameList.map((item, index) => (
            <Row gutter={[0, 0]} key={item.id + Math.random()}>
              <Col span={3} style={{ marginRight: '10px' }}>
                <div className={styles.rangeLabel}>Range{index + 1}</div>
              </Col>
              <Col span={8} style={{ marginRight: '52px' }}>
                <ProFormDigit
                  name={`${item.name}S`}
                  disabled={index === 0}
                  fieldProps={{
                    suffix: 'KM',
                    controls: false,
                    precision: 0,
                    min: 0,
                    max: 99999999,
                    onChange: () => {
                      formRef?.current?.validateFields();
                    },
                  }}
                  rules={[
                    {
                      required: true,
                      message: 'Please fill in every Mileage range',
                    },
                    {
                      validator: (rule, value) =>
                        validatorStartRule(rule, value, index),
                    },
                  ]}
                />
              </Col>
              <Col span={8}>
                <ProFormDigit
                  name={`${item.name}E`}
                  disabled={
                    (index === 0 && rangeNameList.length === 1) ||
                    index === rangeNameList.length - 1
                  }
                  fieldProps={{
                    suffix: 'KM',
                    controls: false,
                    precision: 0,
                    min: 0,
                    max: 99999999,
                    onChange: () => {
                      formRef?.current?.validateFields();
                    },
                  }}
                  rules={[
                    {
                      required: true,
                      message: 'Please fill in every Mileage range',
                    },
                    {
                      validator: (rule, value) =>
                        validatorEndRule(rule, value, index),
                    },
                  ]}
                />
              </Col>
              <Col span={1}>
                {rangeNameList.length > 1 ? (
                  <CustomerDeleteIcon
                    onClick={() => deleteRange(index)}
                    style={{
                      margin: '8px 0 0 12px',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                    }}
                  />
                ) : null}
              </Col>
            </Row>
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
            onClick={() => {
              const oldRangeName = rangeNameList.slice();
              setRangeNameList([
                ...rangeNameList,
                {
                  id: dayjs().valueOf(),
                  name: `Range${indexRef.current}`,
                  dataIndex: indexRef.current,
                },
              ]);
              const formValue = formRef?.current?.getFieldsValue();
              formRef?.current?.setFieldsValue({
                ...formValue,
                ['Range1E']:
                  formValue['Range1E'] === '∞'
                    ? undefined
                    : formValue['Range1E'],
                [`${oldRangeName[oldRangeName.length - 1].name}E`]:
                  formValue[
                    `${oldRangeName[oldRangeName.length - 1].name}E`
                  ] === '∞'
                    ? undefined
                    : formValue[
                        `${oldRangeName[oldRangeName.length - 1].name}E`
                      ],
                [`Range${indexRef.current}E`]: '∞',
              });
              indexRef.current += 1;
            }}
            icon={<PlusOutlined />}
          >
            Add
          </Button>

          {calculationType !==
            MileageCalculationModeEnum.TOTAL_RANGE_DISTRIBUTE_CALCULATION &&
          calculationType !==
            MileageCalculationModeEnum.TOTAL_RANGE_FLAT_CALCULATION ? (
            <Row
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '28px',
              }}
            >
              <ProFormCheckbox
                name="checkbox"
                formItemProps={{ style: { marginBottom: 0 } }}
              >
                Set the first mileage range as a fixed starting price
                <CustomLabel
                  LabelName={'Mileage Range'}
                  isShowIcon={true}
                ></CustomLabel>
              </ProFormCheckbox>
            </Row>
          ) : null}
        </div>
      </ModalForm>
    </>
  );
};

export default MileageRangeModal;
