import { IUpdateAccreditation } from '@/api/types/truck';
import {
  IAccreditationMaterialListItem,
  IVendorDetail,
} from '@/api/types/vendor';
import { ApplicationTypeEnum, UploadPathTypeEnum } from '@/enums';
import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
import { useParams } from '@umijs/max';
import { Form } from 'antd';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import AccreditationTabUpload from '../AccreditationTabUpload';
import { accreditationValidator } from '../AccreditationUpload/constants';

type IEditCategoryModal = ModalFormProps & {
  sourceData?: IVendorDetail;
  source: ApplicationTypeEnum;
  required: boolean;
  record: {
    id: string;
    fileCategory: string;
    version?: number;
    subFileCategory?: string;
    validIndefinitely?: boolean;
    startDate?: string;
    endDate?: string;
  };
  fileCategory: string;
  materialList: IAccreditationMaterialListItem[];
  editCategoryModalLoading: boolean;
  hideModal: () => void;
  onConfirm?: (v: IUpdateAccreditation) => void;
};

const EditCategoryModal = ({
  open,
  record,
  sourceData,
  width = 600,
  required,
  source,
  fileCategory,
  materialList,
  editCategoryModalLoading,
  hideModal,
  onConfirm,
  modalProps,
  ...restProps
}: IEditCategoryModal) => {
  const [form] = Form.useForm();
  const { id: detailId } = useParams();

  const [loading, setLoading] = useState<boolean>(false);
  const [customDto, setCustomDto] = useState<any>();

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, []);

  const onFinish = async () => {
    const values = form.getFieldsValue()[record?.id];
    const payload = {
      id: +detailId!,
      fileCategory,
      version: record?.version,
      subFileCategory: values.subFileCategory,
      // 版本确定之后 只更新文件id
      validIndefinitely: record?.validIndefinitely
        ? undefined
        : !!record?.startDate
          ? undefined
          : values.validIndefinitely,
      validDateStart:
        record?.validIndefinitely || !!record?.startDate
          ? undefined
          : values.validDateStart,
      validDateEnd:
        record?.validIndefinitely || !!record?.endDate
          ? undefined
          : values.validDateEnd,
      materialIdList: values.materialIdList ?? [],
    };

    const oldMaterialIdList = materialList?.map((v) => v.fileMaterialId) || [];
    const diff = _.xor(oldMaterialIdList, payload.materialIdList);
    if (diff.length === 0) {
      hideModal?.();
      return;
    }
    payload.materialIdList = diff;
    onConfirm?.(payload);
  };

  const onFill = () => {
    if (!record) return;
    form?.setFieldValue([record?.id, 'validDateStart'], record?.startDate);
    form?.setFieldValue([record?.id, 'validDateEnd'], record?.endDate);

    form?.setFieldValue(
      [record?.id, 'validIndefinitely'],
      record?.validIndefinitely,
    );
    form?.setFieldValue(
      [record?.id, 'subFileCategory'],
      record?.subFileCategory,
    );
    form?.setFieldValue(
      [record?.id, 'materialIdList'],
      materialList.map((v) => v.fileMaterialId),
    );
  };

  const reset = useCallback(() => {
    form.resetFields();
  }, []);

  useEffect(() => {
    if (open) {
      const _dto =
        source === ApplicationTypeEnum.TRUCK
          ? {
              customParamMap: {
                fileCategory: fileCategory,
              },
              pathType: UploadPathTypeEnum.TRUCK,
            }
          : source === ApplicationTypeEnum.VENDOR
            ? {
                customParamMap: {
                  vendorName: sourceData?.vendorName,
                  fileCategory: fileCategory,
                },
                pathType: UploadPathTypeEnum.VENDOR,
              }
            : {
                customParamMap: {
                  fileCategory: fileCategory,
                },
                pathType: UploadPathTypeEnum.CREW,
              };
      setCustomDto(_dto);
      onFill();
    } else {
      reset();
    }
  }, [open, record, source]);

  return (
    <>
      <ModalForm
        name="truck-edit-category-modal"
        open={open}
        title={`${record?.version ? 'Edit Accreditation' : 'Add Accreditation (New Version)'} `}
        width={width}
        style={{ marginTop: '14px' }}
        form={form}
        modalProps={{
          ...modalProps,
          destroyOnClose: true,
          forceRender: true,
          onCancel() {
            hideModal?.();
          },
        }}
        submitter={{
          submitButtonProps: {
            loading: loading || editCategoryModalLoading,
          },
        }}
        onFinish={onFinish}
        {...restProps}
      >
        <Form.Item
          label=""
          name={record?.id}
          rules={[
            {
              validator(_rule, value) {
                return accreditationValidator(
                  value,
                  false,
                  record.fileCategory,
                  record.id,
                );
              },
            },
          ]}
        >
          <AccreditationTabUpload
            withGenAI={false}
            label={fileCategory}
            // prompt={prompt}
            id={record.id}
            fileCategory={fileCategory}
            required={required}
            disabled={record?.validIndefinitely || !!record?.startDate}
            getUploadingSize={getUploadingSize}
            materialList={materialList}
            dto={customDto}
          />
        </Form.Item>
      </ModalForm>
    </>
  );
};

export default EditCategoryModal;
