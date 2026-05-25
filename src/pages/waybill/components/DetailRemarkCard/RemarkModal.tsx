import { getImageSource } from '@/api/common';
import { ICommonMaterial, IImageState, ISourceImage } from '@/api/types/common';
import { IRemarkItem } from '@/api/types/waybill';
import { addRemark, editRemark, listAllRemarkType } from '@/api/waybill';
import CommonFileItem from '@/components/CommonFileItem';
import NoRequestFileItem from '@/components/CommonFileItem/NoRequestFileItem';
import CustomTooltip from '@/components/CustomTooltip';
import { getExts } from '@/components/CustomUpload/fileSupport';
import NoRequestUpload from '@/components/CustomUpload/NoRequestUpload';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import {
  BELONG_IMG_EXTS,
  IMAGE_TYPE,
  initialImageState,
  MAX_LENGTH,
} from '@/constants';
import styles from '@/pages/customer/components/CustomerDetailTimeline/styles.less';
import { getNumberRangeList } from '@/utils/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProFormDateTimePicker,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useSetState } from 'ahooks';
import { App, Button, Form, Space, Spin } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { FC, useCallback, useEffect } from 'react';

const WIDTH = 92;
const HEIGHT = 92;

interface IState {
  isEdit: boolean;
  noRequestFiles: File[];
  deletedMaterialIdList: number[];
  pending: boolean;
  remarkTypeOptions: any[];
}

const initialState: IState = {
  isEdit: false,
  noRequestFiles: [],
  deletedMaterialIdList: [],
  pending: false,
  remarkTypeOptions: [],
};

interface IProps extends ModalFormProps {
  defaultData?: IRemarkItem;
  waybillId: number;
  projectId: number;
  materialList: ICommonMaterial[];
  hideModal: () => void;
  refresh: () => void;
}

const RemarkModal: FC<IProps> = ({
  open,
  readonly,
  defaultData,
  waybillId,
  projectId,
  hideModal,
  refresh,
  materialList,
  ...rest
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [state, setState] = useSetState<IState>(initialState);
  const remarkType = Form.useWatch('remarkType', form);
  const initialValues = {
    eventTime: defaultData?.eventTime ? dayjs(defaultData?.eventTime) : dayjs(),
    remarkType: defaultData?.remarkType,
    description: defaultData?.description,
  };
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

  const submit = useCallback(async () => {
    await form?.validateFields?.();
    const values = form?.getFieldsValue?.();
    setState({ pending: true });
    if (state.isEdit) {
      const dto = {
        projectId,
        waybillId,
        waybillRemarkId: defaultData?.waybillRemarkId,
        deletedMaterialIdList: state.deletedMaterialIdList,
        remarkType: values.remarkType,
        eventTime: values.eventTime?.format?.('YYYY-MM-DD HH:mm:ss'),
        description: values.description,
      };

      const formData = new FormData();
      const blob = new Blob([JSON.stringify(dto)], {
        type: 'application/json',
      });
      formData.append('dto', blob);
      state.noRequestFiles.forEach((item: File) => {
        formData.append('files', item);
      });
      const res = await editRemark(formData);
      setState({ pending: false });
      if (res?.code === 200) {
        message.success('Edit successfully!');
        refresh();
      } else {
        message.error('Edit fail!');
      }
    } else {
      const dto = {
        projectId,
        waybillId,
        remarkType: values.remarkType,
        eventTime: values.eventTime?.format?.('YYYY-MM-DD HH:mm:ss'),
        description: values.description,
      };

      const formData = new FormData();
      const blob = new Blob([JSON.stringify(dto)], {
        type: 'application/json',
      });
      formData.append('dto', blob);
      state.noRequestFiles.forEach((item: File) => {
        formData.append('files', item);
      });
      const res = await addRemark(formData);
      setState({ pending: false });
      if (res?.code === 200) {
        message.success('Add successfully!');
        refresh();
      } else {
        message.error('Add fail!');
      }
    }
    hideModal();
  }, [state]);

  const validateFileList = useCallback(() => {
    const { isEdit, deletedMaterialIdList, noRequestFiles } = state;

    if (isEdit) {
      if (
        noRequestFiles?.length === 0 &&
        materialList?.length - deletedMaterialIdList?.length === 0
      ) {
        form?.setFields([
          {
            name: 'material',
            value: true,
            errors: [],
          },
        ]);
      } else {
        form?.setFields([
          {
            name: 'material',
            value: true,
            errors: [],
          },
        ]);
      }
    } else {
      if (noRequestFiles?.length === 0) {
        form?.setFields([
          {
            name: 'material',
            value: true,
            errors: [],
          },
        ]);
      } else {
        form?.setFields([
          {
            name: 'material',
            value: true,
            errors: [],
          },
        ]);
      }
    }
  }, [state, defaultData]);

  const onFulfilled = useCallback(
    (file: File) => {
      const { noRequestFiles } = state;
      noRequestFiles.push(file);
      setState({ noRequestFiles: [...noRequestFiles] });
      validateFileList();
    },
    [state],
  );

  const handleDeleteNoRequestFile = useCallback(
    (index: number) => {
      const { noRequestFiles } = state;

      noRequestFiles.splice(index, 1);
      setState({ noRequestFiles: [...noRequestFiles] });
      validateFileList();
    },
    [state],
  );

  const handleDeleteDefaultFile = useCallback(
    (item: ICommonMaterial) => {
      const { deletedMaterialIdList } = state;
      deletedMaterialIdList.push(item.fileMaterialId);
      setState({ deletedMaterialIdList: [...deletedMaterialIdList] });
      validateFileList();
    },
    [state],
  );

  const getAllPodType = useCallback(async () => {
    const res = await listAllRemarkType();
    if (res.code === 200) {
      const options = res?.data?.map((item: string) => {
        return {
          label: item,
          value: item,
        };
      });
      setState({ remarkTypeOptions: options });
    }
  }, []);

  const onchangeType = useCallback(async (value: string) => {
    if (value !== 'Others') {
      form?.setFields([
        {
          name: `description`,

          errors: [],
        },
      ]);
    }
  }, []);

  const initPreview = useCallback(async () => {
    const allMaterialList: ICommonMaterial[] = [];
    const allSettled: Array<Promise<any>> = [];

    materialList?.forEach((material) => {
      if (IMAGE_TYPE.includes(material.fileType)) {
        allMaterialList.push(material);
      }
    });

    setImageState({
      pending: true,
    });
    allMaterialList.forEach((material) => {
      allSettled.push(getImageSource(material));
    });

    Promise.allSettled(allSettled)
      .then((values) => {
        const sourceImages: ISourceImage[] = [];
        values?.forEach((value) => {
          if (value.status === 'fulfilled') {
            sourceImages.push(value.value);
          }
        });

        state.noRequestFiles?.forEach((file) => {
          const fileType = getExts(file);
          const isBelongImg = BELONG_IMG_EXTS.includes(fileType);
          if (isBelongImg) {
            const src = URL.createObjectURL(file);
            sourceImages.push({ src, material: file.name });
          }
        });
        setImageState({
          sourceImages,
        });
      })
      .finally(() => {
        setImageState({
          pending: false,
        });
      });
  }, [defaultData, state.noRequestFiles]);

  const onCustomPreview = useCallback(
    (material: ICommonMaterial) => {
      const index = _.findIndex(
        imageState.sourceImages,
        (v) => v.material.fileMaterialId === material.fileMaterialId,
      );
      setImageState({
        index,
        visible: true,
      });
    },
    [imageState],
  );

  const onCustomNoRequestPreview = (file: File) => {
    const index = _.findIndex(
      imageState.sourceImages,
      (v) => v.material === file.name,
    );
    setImageState({
      index,
      visible: true,
    });
  };

  useEffect(() => {
    getAllPodType();
  }, []);

  useEffect(() => {
    if (open) {
      setState({
        noRequestFiles: [],
        deletedMaterialIdList: [],
        pending: false,
      });
      if (defaultData?.waybillRemarkId) {
        setState({ isEdit: true });
      } else {
        setState({ isEdit: false });
      }
    }
  }, [open]);

  useEffect(() => {
    initPreview();
  }, [materialList, state.noRequestFiles]);

  return (
    <>
      <ModalForm
        name="remark-modal"
        title={`${readonly ? '' : state.isEdit ? 'Edit' : 'Add'} Remark`}
        open={open}
        readonly={readonly}
        form={form}
        width={480}
        initialValues={initialValues}
        className={readonly ? 'readonly-form' : ''}
        modalProps={{
          destroyOnClose: false,
          maskClosable: false,
          onCancel: hideModal,
        }}
        submitter={{
          render: () => {
            return (
              <Space size={12} align="end">
                {!readonly && (
                  <Button key={'cancel'} onClick={hideModal}>
                    Cancel
                  </Button>
                )}
                <Button
                  key={'submit'}
                  type="primary"
                  onClick={() => {
                    if (readonly) {
                      hideModal();
                      return;
                    }
                    validateFileList();
                    submit();
                  }}
                  loading={state.pending}
                >
                  Confirm
                </Button>
              </Space>
            );
          },
        }}
        {...rest}
      >
        <ProFormSelect
          name={'remarkType'}
          label={'type'}
          placeholder={'Please select type'}
          rules={[{ required: true, message: 'Please select type' }]}
          fieldProps={{
            showSearch: true,
            filterOption: true,
            options: state.remarkTypeOptions,
          }}
          onChange={onchangeType}
        />
        <ProFormDateTimePicker
          name="eventTime"
          htmlFor="span"
          label={
            <>
              <span>Time</span>
              <CustomTooltip
                placement="top"
                title="Please set it to the time when the event occurs"
              >
                <span
                  className="tooltip"
                  style={{ marginLeft: '8px', color: '#696969' }}
                >
                  <QuestionCircleOutlined />
                </span>
              </CustomTooltip>
            </>
          }
          placeholder="Please select time"
          rules={[
            {
              required: true,
              message: 'Please select time',
            },
          ]}
          fieldProps={{
            showNow: false,
            disabledDate: (currentDate) => {
              return currentDate?.isAfter(dayjs(), 'day');
            },
            disabledTime: (currentDate: any) => {
              const h = initialValues.eventTime?.hour?.();
              const m = initialValues.eventTime?.minute?.();
              const s = initialValues.eventTime?.second?.();

              const b = currentDate?.isBefore(dayjs(), 'day');

              if (b) {
                return {
                  disabledHours: () => [],
                  disabledMinutes: () => [],
                  disabledSeconds: () => [],
                };
              } else {
                const curH = currentDate?.hour();
                const curM = currentDate?.minute();

                if (curH < h || curM < m) {
                  return {
                    disabledHours: () =>
                      getNumberRangeList(0, 24).splice(h + 1, 24),
                    disabledMinutes: () => [],
                    disabledSeconds: () => [],
                  };
                }

                return {
                  disabledHours: () =>
                    getNumberRangeList(0, 24).splice(h + 1, 24),
                  disabledMinutes: () =>
                    getNumberRangeList(0, 60).splice(m + 1, 60),
                  disabledSeconds: () =>
                    getNumberRangeList(0, 60).splice(s, 60),
                };
              }
            },
            style: { width: '100%' },
          }}
        />
        <ProFormTextArea
          name={'description'}
          label={'Description'}
          placeholder="Please enter a description"
          fieldProps={{
            rows: 4,
            style: { resize: 'none' },
          }}
          rules={[
            {
              required: remarkType === 'Others',
              message: 'Please enter a description',
            },
            {
              max: MAX_LENGTH.MAX_1000,
              message: `Description cannot exceed ${MAX_LENGTH.MAX_1000} characters`,
            },
          ]}
        />
        <Form.Item
          name="material"
          label="Document"
          rules={[{ required: false, message: 'Please upload material' }]}
        >
          {/* <div>
          <div>materialList: {materialList.length}</div>
          <div>deletedMaterialIdList:{state.deletedMaterialIdList.length}</div>
          <div>noRequestFiles: {state.noRequestFiles.length}</div>
        </div> */}
          <Spin spinning={imageState.pending} tip="All Images Fetching...">
            <div
              style={{
                display: 'flex',
                columnGap: '8px',
                flexWrap: 'wrap',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {materialList?.map((item: ICommonMaterial) => {
                if (state.deletedMaterialIdList.includes(item.fileMaterialId)) {
                  return null;
                } else {
                  return (
                    <CommonFileItem
                      key={item.fileDriveId}
                      width={WIDTH}
                      height={HEIGHT}
                      className={styles.file_item}
                      thumbnail={item.fileThumbnailUrl}
                      fileType={item.fileType}
                      fileName={item.fileName}
                      materialId={item.fileMaterialId}
                      driveFileId={item.fileDriveId}
                      fileMimeType={item.fileMimeType}
                      showDelete={!readonly}
                      onDeleteTrigger={() => handleDeleteDefaultFile(item)}
                      onCustomPreview={() => onCustomPreview(item)}
                    />
                  );
                }
              })}
              {state.noRequestFiles?.map((item: File, index: number) => (
                <NoRequestFileItem
                  key={index}
                  className={styles.file_item}
                  width={WIDTH}
                  height={HEIGHT}
                  file={item}
                  showDelete
                  onDeleteTrigger={() => handleDeleteNoRequestFile(index)}
                  onCustomPreview={() => onCustomNoRequestPreview(item)}
                />
              ))}
              {!readonly && (
                <div className={styles.file_item}>
                  <NoRequestUpload
                    onFulfilled={onFulfilled}
                    width={WIDTH}
                    height={HEIGHT}
                  />
                  <div className={styles.itemDesc}>
                    A single file cannot exceed 50 MB
                  </div>
                </div>
              )}
            </div>
          </Spin>
        </Form.Item>
      </ModalForm>
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
};

export default RemarkModal;
