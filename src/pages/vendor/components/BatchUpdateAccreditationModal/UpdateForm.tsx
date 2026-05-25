import { createCrewAccreditationVersion } from '@/api/crew';
import { createTruckAccreditationVersion } from '@/api/truck';
import { IAccreditationCategoryListItem } from '@/api/types/vendor';
import { createVendorAccreditationVersion } from '@/api/vendor';
import PubSubContext from '@/context/pubsub';
import { UploadPathTypeEnum } from '@/enums';
import { App, Button, Flex, Form, Spin } from 'antd';
import { useCallback, useContext, useEffect, useState } from 'react';

import {
  EVENT_CREW_LIST_RELOAD,
  EVENT_TRUCK_LIST_RELOAD,
  EVENT_VENDOR_LIST_RELOAD,
} from '../../event';
import AccreditationTabUpload from '../AccreditationTabUpload';
import { accreditationValidator } from '../AccreditationUpload/constants';

interface IProps {
  source: UploadPathTypeEnum;
  listItemName: string;
  listItemId: number;
  item: IAccreditationCategoryListItem;
}
export default function UpdateForm({
  listItemName,
  source,
  item,
  listItemId,
}: IProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { publish } = useContext(PubSubContext);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [customDto, setCustomDto] = useState<{
    customParamMap: Record<string, string>;
    pathType: UploadPathTypeEnum;
  }>({
    customParamMap: {},
    pathType: source,
  });

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, []);

  const onFill = () => {
    if (!item) return;
    form?.setFieldValue([item?.id, 'validDateStart'], item?.validDateStart);
    form?.setFieldValue([item?.id, 'validDateEnd'], item?.validDateEnd);

    form?.setFieldValue(
      [item?.id, 'validIndefinitely'],
      item?.validIndefinitely,
    );
    form?.setFieldValue([item?.id, 'subFileCategory'], item?.subFileCategory);
    form?.setFieldValue(
      [item?.id, 'materialIdList'],
      item?.accreditationMaterialList.map((v) => v.fileMaterialId),
    );
  };

  const onFinish = async () => {
    await form.validateFields();
    const values = form.getFieldsValue()[item?.id];
    const payload = {
      id: +listItemId!,
      fileCategory: item?.fileCategory,
      subFileCategory: values.subFileCategory,
      validIndefinitely: values.validIndefinitely,
      validDateStart: values.validDateStart,
      validDateEnd: values.validDateEnd,
      materialIdList: values.materialIdList ?? [],
    };
    setConfirmLoading(true);

    console.log(payload);

    let fetchApi;

    switch (source) {
      case UploadPathTypeEnum.VENDOR:
        fetchApi = createVendorAccreditationVersion(payload);
        break;
      case UploadPathTypeEnum.CREW:
        fetchApi = createCrewAccreditationVersion(payload);
        break;
      case UploadPathTypeEnum.TRUCK:
        fetchApi = createTruckAccreditationVersion(payload);
        break;
    }

    const res = await fetchApi?.finally(() => {
      setConfirmLoading(false);
    });

    if (res?.code === 200) {
      publish(EVENT_CREW_LIST_RELOAD);
      publish(EVENT_TRUCK_LIST_RELOAD);
      publish(EVENT_VENDOR_LIST_RELOAD);
      message.success({
        content: (
          <>
            <strong>{item.fileCategory}</strong> Submitted Successfully
          </>
        ),
        duration: 3,
      });
    }
  };

  useEffect(() => {
    if (!item) return;

    setCustomDto({
      customParamMap: {
        vendorName: listItemName,
        fileCategory: item.fileCategory,
      },
      pathType: source,
    });
    onFill();
  }, [item, listItemName, source]);

  return (
    <Spin spinning={loading}>
      <Form name={`batch-update-accreditation-form-${item?.id}`} form={form}>
        <Form.Item
          label=""
          name={item?.id}
          rules={[
            {
              validator(_rule, value) {
                return accreditationValidator(
                  value,
                  item.required,
                  item.fileCategory,
                  item.id,
                );
              },
            },
          ]}
        >
          <AccreditationTabUpload
            withGenAI={false}
            label={item?.fileCategory}
            id={item?.id}
            fileCategory={item?.fileCategory}
            required={item?.required}
            getUploadingSize={getUploadingSize}
            materialList={item?.accreditationMaterialList}
            dto={customDto}
          />
        </Form.Item>
        <Flex justify="end" style={{ marginRight: 16 }}>
          <Button type="primary" onClick={onFinish} loading={confirmLoading}>
            Submit
          </Button>
        </Flex>
      </Form>
    </Spin>
  );
}
