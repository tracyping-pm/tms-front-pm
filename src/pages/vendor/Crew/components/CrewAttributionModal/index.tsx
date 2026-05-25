import { crewAttribute } from '@/api/crew';
import { ICrewListVendorRecord } from '@/api/types/crew';
import FuzzySelector from '@/components/FuzzySelector';
import { ES_DTO_CLASS } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { App, Button, Col, Form, Modal, Popconfirm, Row } from 'antd';
import { memo, useEffect, useState } from 'react';
import styles from './index.less';

export default memo(function CrewAttributionModal(props: {
  vendorList: ICrewListVendorRecord[];
  hideModal: () => void;
  refreshList: () => void;
}) {
  const { vendorList = [], hideModal, refreshList } = props;
  const { id: crewId } = useParams();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);

  // const [vendorIds, setVendorIds] = useState<ISelectAttributeVendor[]>([]);
  // const [vendorObjList, setVendorObjList] = useState<I_FUZZY_API_RESPONSE[]>(
  //   [],
  // );

  // const deleteItem = useCallback(
  //   (index: number) => {
  //     let copyNameList = vendorNameList.slice();
  //     let copyIds = vendorIds.slice();
  //     copyNameList.splice(index, 1);
  //     copyIds.splice(index, 1);
  //     setVendorNameList(copyNameList);
  //     setVendorIds(copyIds);
  //   },
  //   [vendorNameList, vendorIds],
  // );

  // const attributeConfirm = async () => {
  //   const res = await truckAttribute({
  //     id: Number(crewId),
  //     bindIds: vendorIds.filter((item) => !!item),
  //   });
  //   setLoading(false);
  //   if (res?.code === 200) {
  //     message.success('Add successfully!');
  //     refreshList();
  //     hideModal();
  //   }
  // };

  // const checkConfirm = async () => {
  //   setLoading(true);
  //   const check = await checkTruckAttribute({
  //     id: Number(crewId),
  //     bindIds: vendorIds.filter((item) => !!item.id),
  //   });
  //   setLoading(false);
  //   if (check.code === 200) {
  //     modal.confirm({
  //       title: 'Attribution Confirm',
  //       content: check.data
  //         ? `Confirm the attribution setting of the truck`
  //         : `Confirm to unbind the truck from the associated vendor and project`,
  //       okText: 'Confirm',
  //       onOk: async () => {
  //         attributeConfirm();
  //       },
  //       onCancel() {
  //         setLoading(false);
  //       },
  //     });
  //   } else {
  //     setLoading(false);
  //   }
  // };
  const onFinish = async () => {
    const values = await form.validateFields();

    const payload = {
      crewId: Number(crewId),
      vendorIdList: values.vendorList.map((item: { id: number }) => item.id),
    };
    setLoading(true);
    const res = await crewAttribute(payload);
    setLoading(false);
    if (res?.code === 200) {
      message.success('Add successfully!');
      refreshList();
      hideModal();
    }
    // return;
    // const check = await checkTruckAttribute({
    //   id: Number(crewId),
    //   bindIds: vendorIds.filter((item) => !!item.id),
    // });
    // setLoading(false);
    // if (check.code === 200) {
    //   modal.confirm({
    //     title: 'Attribution Confirm',
    //     content: check.data
    //       ? `Confirm the attribution setting of the truck`
    //       : `Confirm to unbind the truck from the associated vendor and project`,
    //     okText: 'Confirm',
    //     onOk: async () => {
    //       attributeConfirm();
    //     },
    //     onCancel() {
    //       setLoading(false);
    //     },
    //   });
    // } else {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    if (vendorList.length) {
      form.setFieldsValue({
        vendorList: vendorList.map((item) => ({
          id: item.vendorId,
          value: item.vendorId,
          name: item.vendorName,
        })),
      });
    }
    // if (vendorList.length) {
    //   const vendors = vendorList.map((item) => ({
    //     id: Number(item.vendorId),
    //   }));
    //   setVendorIds(vendors);
    //   setVendorNameList(vendorList);
    // } else {
    //   let time = dayjs().valueOf();
    //   setVendorIds([{ id: null }]);
    //   setVendorNameList([
    //     {
    //       id: time,
    //       vendorName: '',
    //       vendorId: null,
    //       ownership: '',
    //       vendorTag: '',
    //     },
    //   ]);
    // }
  }, []);

  return (
    <Modal
      width={500}
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
        name="crew-attribution"
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={onFinish}
      >
        <Form.List name="vendorList" initialValue={['']}>
          {(fields, { add, remove }) => (
            <div className={styles.attribution_list}>
              <div id="attributionModal">
                {fields.map((field) => {
                  return (
                    <Row gutter={[16, 0]} key={field.key} align="middle">
                      <Col span={20}>
                        <Form.Item
                          {...field}
                          name={field.name}
                          key={field.key}
                          label="Vendor Name"
                          rules={[
                            {
                              required: true,
                              message: 'Please enter vendor',
                            },
                            {
                              validator: async (_, value) => {
                                let _vendorObjList =
                                  form.getFieldsValue()?.vendorList;

                                const len = _vendorObjList.filter(
                                  (item: { id: number }) =>
                                    item?.id === value?.id,
                                ).length;

                                if (len > 1) {
                                  return Promise.reject(
                                    'A vendor can only be attributed once',
                                  );
                                }

                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <FuzzySelector
                            fieldProps={{
                              placeholder: 'Please enter vendor name',
                            }}
                            request={{
                              field: 'vendorName',
                              esDtoClass: ES_DTO_CLASS.VENDOR,
                              type: FieldQueryHighlightTypeEnum.COUNTRY,
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        {fields.length > 1 ? (
                          <Popconfirm
                            title="Delete"
                            description="Are you sure to delete this vendor?"
                            onConfirm={() => remove(field.name)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button
                              style={{ marginTop: '8px' }}
                              color="danger"
                              variant="text"
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        ) : null}
                      </Col>
                    </Row>
                  );
                })}

                <Button
                  type="link"
                  onClick={() => {
                    add();
                    setTimeout(() => {
                      const element =
                        document.getElementById('attributionModal');
                      if (element) {
                        element?.scrollIntoView?.({
                          behavior: 'smooth',
                          block: 'end',
                        });
                      }
                    }, 100);
                  }}
                  icon={<PlusOutlined />}
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
});
