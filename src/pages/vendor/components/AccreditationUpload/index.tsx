import { ICommonMaterial } from '@/api/types/common';
import { getVendorDefaultSubCategory } from '@/api/vendor';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import { extractJson, getPartByUri } from '@/components/CustomUpload/genAI';
import { IdcardOutlined, InboxOutlined } from '@ant-design/icons';
import { GoogleGenAI, PartUnion } from '@google/genai';
import { Button, DatePicker, Form, Select, Spin, Tag } from 'antd';
import { ValidateStatus } from 'antd/es/form/FormItem';
import cls from 'classnames';
import dayjs from 'dayjs';
import _ from 'lodash';
import { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { SUB_FILE_CATEGORY_ID } from './constants';
import styles from './index.less';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface IValue {
  fileCategory: string;
  subFileCategory?: string;
  validDateStart?: string;
  validDateEnd?: string;
  validIndefinitely?: boolean;
  materialIdList?: number[];
}

const { RangePicker } = DatePicker;

export interface IAccreditationUpload {
  withGenAI?: boolean;
  prompt?: string;
  label: ReactNode;
  required: boolean;
  id?: string;
  fileCategory: string;
  dto: any;
  materialList: ICommonMaterial[];
  totalMaxUploadCount?: number;
  getUploadingSize?: (uploadingSize: number) => void;
  value?: IValue;
  onChange?: (value?: IValue) => void;
  onGenAIChange?: (ocrResult: string) => void;
}

const AccreditationUpload: FC<IAccreditationUpload> = ({
  withGenAI,
  prompt,
  label,
  required = false,
  id,
  fileCategory,
  dto,
  materialList,
  totalMaxUploadCount,
  getUploadingSize,
  value,
  onChange,
  onGenAIChange,
}) => {
  const [showSubFileCategory, setShowSubFileCategory] =
    useState<boolean>(false);
  const [subFileCategoryList, setSubFileCategoryList] = useState<string[]>([]);
  const [dateValidateStatus, setDateValidateStatus] =
    useState<ValidateStatus>('');
  const [subFileCategoryValidateStatus, setSubFileCategoryValidateStatus] =
    useState<ValidateStatus>('');

  const [deleteId, setDeleteId] = useState<number>();
  const [initialing, setInitialing] = useState<boolean>(false);
  const onInnerChange = (changedValue: IValue) => {
    onChange?.(changedValue);
  };

  const onDateChange = useCallback(
    (_date: any, dateString: [string, string]) => {
      const changedValue = {
        ...value,
        fileCategory,
        validDateStart: dateString[0],
        validDateEnd: dateString[1],
        validIndefinitely: false,
      };

      onInnerChange(changedValue);
    },
    [value],
  );

  const onSubFileCategoryChange = useCallback(
    (subFileCategory: string) => {
      const changedValue = {
        ...value,
        fileCategory,
        subFileCategory,
      };
      onInnerChange(changedValue);
    },
    [value],
  );

  const onValidIndefinitely = useCallback(() => {
    const changedValue = {
      ...value,
      fileCategory,
      validIndefinitely: true,
    };
    // 删除 validDateStart 和 validDateEnd
    if (changedValue.validDateStart) {
      delete changedValue.validDateStart;
    }
    if (changedValue.validDateEnd) {
      delete changedValue.validDateEnd;
    }
    onInnerChange(changedValue);
  }, [value]);

  const doOCR = useCallback(
    async (contentPart: PartUnion, fileMaterial: ICommonMaterial) => {
      const _contentPart = [prompt, contentPart];

      const result = await ai.models
        .generateContent({
          // 此模型每分钟免费配额5次，已知可用模型中最大，先用这个
          // https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas?hl=zh-cn&inv=1&invt=AbtjiA&project=cd-development-center&pageState=(%22allQuotasTable%22:(%22s%22:%5B(%22i%22:%22displayDimensions%22,%22s%22:%220%22),(%22i%22:%22effectiveLimit%22,%22s%22:%220%22),(%22i%22:%22currentUsage%22,%22s%22:%220%22),(%22i%22:%22currentPercent%22,%22s%22:%220%22),(%22i%22:%22displayName%22,%22s%22:%220%22)%5D,%22f%22:%22%255B%257B_22k_22_3A_22_22_2C_22t_22_3A10_2C_22v_22_3A_22_5C_22equest%2520limit%2520per%2520model%2520per%2520minute%2520for%2520a%2520project%2520in%2520the%2520free%2520tier_5C_22_22%257D%255D%22,%22p%22:0))
          model: 'gemini-2.5-flash',
          // @ts-ignore
          contents: _contentPart,
          config: {
            temperature: 2,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            responseModalities: [],
            responseMimeType: 'text/plain',
          },
        })
        .finally(() => {
          getUploadingSize?.(0);
          const changedValue = {
            ...value,
            fileCategory,
            materialIdList: [fileMaterial.fileMaterialId],
          };
          onInnerChange(changedValue);
        });
      const text = result?.text ?? '';

      const cleanJson = extractJson(text);
      console.log({ cleanJson });
      const changedValue = {
        ...value,
        fileCategory,
        materialIdList: [fileMaterial.fileMaterialId],
      };
      onInnerChange(changedValue);
      if (_.isObject(cleanJson)) {
        const aiValue = Object.values(cleanJson)?.[0] ?? '';
        if (aiValue) {
          onGenAIChange?.(aiValue);
        }
      } else if (_.isNumber(cleanJson) || _.isString(cleanJson)) {
        const aiValue = String(cleanJson);
        onGenAIChange?.(aiValue);
      } else {
        // do nothing
      }
    },
    [value],
  );

  const onFileChange = useCallback(
    async (fileMaterialId: number[], fileMaterialList: ICommonMaterial[]) => {
      if (withGenAI) {
        // 这里取最后一个用来 ai 识别
        const lastFileMaterial = fileMaterialList[fileMaterialList.length - 1];
        if (lastFileMaterial && lastFileMaterial.file_2) {
          const { uri, mimeType } = lastFileMaterial.file_2;
          if (uri && mimeType) {
            const res = await getPartByUri(uri, mimeType);
            if (res) {
              doOCR(res, lastFileMaterial);
            }
          }
        } else {
          const changedValue = {
            ...value,
            fileCategory,
            materialIdList: fileMaterialId,
          };
          onInnerChange(changedValue);
        }
      } else {
        const changedValue = {
          ...value,
          fileCategory,
          materialIdList: fileMaterialId,
        };
        onInnerChange(changedValue);
      }
    },
    [value],
  );

  const initSubFileCategory = useCallback(async () => {
    if (id === SUB_FILE_CATEGORY_ID) {
      setShowSubFileCategory(true);
      setInitialing(true);
      const res = await getVendorDefaultSubCategory().finally(() => {
        setInitialing(false);
      });
      if (res.code === 200) {
        setSubFileCategoryList(res.data);
      }
    } else {
      setShowSubFileCategory(false);
      setSubFileCategoryList([]);
    }
  }, [id]);

  const onClose = useCallback(() => {
    const changedValue = {
      ...value,
      fileCategory,
      validIndefinitely: false,
    };
    onInnerChange(changedValue);
  }, [value]);

  const handleDelete = (v: number) => {
    setDeleteId(v);
  };

  useEffect(() => {
    if (!deleteId) {
      return;
    }
    const changedValue = {
      ...value,
      fileCategory,
    };
    const idx = _.findIndex(changedValue.materialIdList, (x) => x === deleteId);
    if (idx > -1) {
      changedValue?.materialIdList?.splice(idx, 1);
    }
    onInnerChange(changedValue);
  }, [deleteId]);

  const buildUploadTips = useCallback(() => {
    return withGenAI ? (
      <div>
        <p className="ant-upload-drag-icon">
          <IdcardOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag 1 file to this area to upload
        </p>

        <p className="ant-upload-hint">
          <span>Upload images within 50M</span>
        </p>
      </div>
    ) : (
      <div>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>

        <p className="ant-upload-hint">
          <span>Upload images within 50M</span>
        </p>
      </div>
    );
  }, [withGenAI]);

  useEffect(() => {
    const {
      subFileCategory,
      validDateStart,
      validDateEnd,
      validIndefinitely,
      materialIdList = [],
    } = value ?? {};
    if (validIndefinitely || (validDateStart && validDateEnd)) {
      if (validDateStart && validDateEnd) {
        const today = dayjs().startOf('day');
        const startDate = dayjs(validDateStart).startOf('day');
        const endDate = dayjs(validDateEnd).startOf('day');
        if (startDate.isAfter(today) || endDate.isBefore(today)) {
          // 认证文件若填写有效期，其有效期需包含当天。否则失焦后该框标红并提示“The validity period  must include today.”
          setDateValidateStatus('error');
        } else {
          setDateValidateStatus('');
        }
      } else {
        setDateValidateStatus('');
      }
    } else {
      if (materialIdList?.length > 0) {
        // 没日期有文件
        setDateValidateStatus('error');
      } else {
        // 没日期没文件
        if (required) {
          setDateValidateStatus('error');
        } else {
          setDateValidateStatus('');
        }
      }
    }

    // 判断 subFileCategoryStatus, 如果有文件或者填写了日期，则不能空
    if (showSubFileCategory) {
      if (
        validIndefinitely ||
        (validDateStart && validDateEnd) ||
        materialIdList?.length > 0
      ) {
        if (subFileCategory) {
          setSubFileCategoryValidateStatus('');
        } else {
          setSubFileCategoryValidateStatus('error');
        }
      }
    }

    if (
      validIndefinitely === false &&
      !validDateStart &&
      !validDateEnd &&
      materialIdList?.length === 0
    ) {
      if (showSubFileCategory) {
        if (subFileCategory) {
          setDateValidateStatus('error');
        } else {
          setDateValidateStatus('');
          setSubFileCategoryValidateStatus('');
        }
      } else {
        setDateValidateStatus('');
      }
    }
  }, [value, required, materialList, showSubFileCategory]);

  useEffect(() => {
    initSubFileCategory();
  }, [id]);

  return (
    <Spin spinning={initialing} tip="Initialing...">
      <div className={cls('accreditation-upload', styles.accreditationUpload)}>
        <div className={cls('label', required && 'required')}>
          {label}
          {value?.validIndefinitely && (
            <Tag style={{ marginLeft: '12px' }} closeIcon onClose={onClose}>
              Permanently Valid
            </Tag>
          )}
        </div>
        {showSubFileCategory && (
          <div className="sub-file-category">
            <span style={{ width: '100px' }}>Type:</span>
            <Form.Item noStyle validateStatus={subFileCategoryValidateStatus}>
              <Select
                style={{ width: '260px' }}
                placeholder="Select a Type"
                value={value?.subFileCategory}
                onChange={onSubFileCategoryChange}
              >
                {subFileCategoryList.map((item) => (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}
        <div className="validity-period">
          <span style={{ width: '100px' }}>Validity Period:</span>
          <Form.Item noStyle validateStatus={dateValidateStatus}>
            <RangePicker
              style={{ width: '260px' }}
              placeholder={['Start Date', 'End Date']}
              value={[
                value?.validDateStart ? dayjs(value.validDateStart) : null,
                value?.validDateEnd ? dayjs(value?.validDateEnd) : null,
              ]}
              onChange={onDateChange}
            />
          </Form.Item>
          <Button
            color="primary"
            variant="link"
            style={{ padding: 0 }}
            onClick={() => onValidIndefinitely()}
          >
            Permanently Valid
          </Button>
        </div>
        <DraggerUpload
          withGenAI={withGenAI}
          showModeBar={true}
          materialList={materialList}
          scrollHeight={150}
          dto={dto}
          totalMaxUploadCount={totalMaxUploadCount}
          getUploadingSize={(uploadingSize) => {
            if (withGenAI) {
              if (uploadingSize > 0) {
                getUploadingSize?.(uploadingSize);
              }
            } else {
              getUploadingSize?.(uploadingSize);
            }

            //
          }}
          onChange={onFileChange}
          uploadTips={buildUploadTips()}
          getDeleteMaterialId={(v) => {
            handleDelete(v);
          }}
        />
      </div>
    </Spin>
  );
};

export default AccreditationUpload;
