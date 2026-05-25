import { checkTruckAttribute, truckAttribute } from '@/api/truck';
import {
  ISelectAttributeVendor,
  ITruckVendorListItem,
} from '@/api/types/truck';
import CustomConfirmModal from '@/components/CustomConfirmModal';
import { ES_DTO_CLASS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  VendorTruckOwnershipEnumOptions,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { PlusOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { App, Button, Col, Form, Modal, Row, Select } from 'antd';
import dayjs from 'dayjs';
import { memo, useCallback, useEffect, useState } from 'react';
import { ReactComponent as CustomerDeleteIcon } from '../../../../public/svg/customer_edit_icon.svg';
import styles from './common.less';

export default memo(function TruckAttributionModal(props: {
  vendorList: ITruckVendorListItem[];
  hideModal: () => void;
  refreshList: () => void;
}) {
  const { vendorList = [], hideModal, refreshList } = props;
  const { id: truckId } = useParams();
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [vendorNameList, setVendorNameList] = useState<ITruckVendorListItem[]>(
    [],
  );
  const [vendorIds, setVendorIds] = useState<ISelectAttributeVendor[]>([]);

  useEffect(() => {
    if (vendorList.length) {
      const vendors = vendorList.map((item) => ({
        id: Number(item.vendorId),
        ownership: item.ownership,
      }));
      setVendorIds(vendors);
      setVendorNameList(vendorList);
    } else {
      let time = dayjs().valueOf();
      setVendorIds([
        { id: null, ownership: VendorTruckOwnershipEnumOptions[0].value },
      ]);
      setVendorNameList([
        {
          id: time,
          vendorName: '',
          vendorId: null,
          ownership: '',
          vendorTag: '',
        },
      ]);
    }
  }, []);

  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });

  const deleteItem = useCallback(
    (index: number) => {
      let copyNameList = vendorNameList.slice();
      let copyIds = vendorIds.slice();
      copyNameList.splice(index, 1);
      copyIds.splice(index, 1);
      setVendorNameList(copyNameList);
      setVendorIds(copyIds);
    },
    [vendorNameList, vendorIds],
  );

  const attributeConfirm = async () => {
    const res = await truckAttribute({
      id: Number(truckId),
      bindIds: vendorIds.filter((item) => !!item),
    });
    setLoading(false);
    if (res?.code === 200) {
      message.success('Add successfully!');
      refreshList();
      hideModal();
    }
  };

  const checkConfirm = async () => {
    setLoading(true);
    const check = await checkTruckAttribute({
      id: Number(truckId),
      bindIds: vendorIds.filter((item) => !!item.id),
    });
    setLoading(false);
    if (check.code === 200) {
      modal.confirm({
        title: 'Attribution Confirm',
        content: check.data
          ? `Confirm the attribution setting of the truck`
          : `Confirm to unbind the truck from the associated vendor and project`,
        okText: 'Confirm',
        onOk: async () => {
          await attributeConfirm();
        },
        onCancel() {
          setLoading(false);
        },
      });
    } else {
      setLoading(false);
    }
  };

  return (
    <Modal
      width={680}
      title={`Attribution`}
      open={true}
      onCancel={hideModal}
      className={styles.attribution}
      okButtonProps={{
        loading: loading,
        onClick: () => form?.submit?.(),
      }}
      okText="Confirm"
      maskClosable={false}
    >
      <Form
        name="truck-attribution"
        form={form}
        layout="vertical"
        autoComplete="off"
        style={{ marginTop: '12px' }}
        onFinish={checkConfirm}
      >
        <div className={styles.attribution_list}>
          {vendorNameList.map((item, index) => (
            <Row gutter={[16, 0]} key={item.id} style={{ width: '100%' }}>
              <Col span={15}>
                <Form.Item
                  name={`vendor_${item.id}`}
                  label="Vendor Name"
                  initialValue={item.vendorId ? item.vendorName : null}
                  style={{ fontSize: '14px' }}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter vendor',
                    },
                    {
                      validator: () => {
                        const len = vendorIds.filter(
                          (_item) => _item.id === vendorIds[index].id,
                        ).length;
                        return len <= 1 ? Promise.resolve() : Promise.reject();
                      },
                      message: 'A vendor can only be attributed once',
                    },
                  ]}
                >
                  <Select
                    {...vendorNameDefaultFieldProps}
                    allowClear
                    placeholder="Please enter vendor name"
                    style={{ fontSize: '14px' }}
                    defaultActiveFirstOption={false}
                    suffixIcon={null}
                    filterOption={false}
                    onSearch={vendorNameSearch}
                    onChange={(value, options: any) => {
                      let copy = [...vendorIds];
                      copy[index].id = options?.id;
                      setVendorIds(copy);
                    }}
                    placement={'bottomLeft'}
                    // @ts-ignore
                    options={vendorNameOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={`owner_${item.id}`}
                  label="Ownership"
                  initialValue={
                    item.vendorId
                      ? item.ownership
                      : VendorTruckOwnershipEnumOptions[0].value
                  }
                  style={{ fontSize: '14px' }}
                >
                  <Select
                    allowClear={false}
                    options={VendorTruckOwnershipEnumOptions}
                    onChange={(value, option: any) => {
                      let copy = [...vendorIds];
                      copy[index].ownership = option.value;
                      setVendorIds(copy);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col
                span={1}
                style={{
                  padding: '0 0 0 4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {vendorNameList.length === 1 ? null : (
                  <CustomConfirmModal
                    title="Approval"
                    content="Are you sure to delete this vendor?"
                    onOk={() => deleteItem(index)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <CustomerDeleteIcon
                      style={{
                        marginTop: '5px',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                      }}
                    />
                  </CustomConfirmModal>
                )}
              </Col>
            </Row>
          ))}
        </div>
        <Button
          style={{
            border: 'none',
            boxShadow: 'none',
            color: '#009688',
            padding: 0,
          }}
          onClick={() => {
            const time = dayjs().valueOf();
            setVendorNameList([
              ...vendorNameList,
              {
                id: time,
                vendorId: null,
                vendorName: '',
                vendorTag: '',
                ownership: '',
              },
            ]);
            setVendorIds([
              ...vendorIds,
              { id: null, ownership: VendorTruckOwnershipEnumOptions[0].value },
            ]);
          }}
          icon={<PlusOutlined />}
        >
          Add
        </Button>
      </Form>
    </Modal>
  );
});
