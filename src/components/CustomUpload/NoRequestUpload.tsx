import { BELONG_IMG_EXTS, FILE_ACCEPT, LIMIT_SIZE } from '@/constants';
import { PlusOutlined } from '@ant-design/icons';
import { App, Progress } from 'antd';
import { uniqueId } from 'lodash';
import { useCallback, useState } from 'react';
import {
  InputFile,
  PreviewImg,
  ProgressBar,
  ProgressView,
  SelectText,
  SelectView,
  UploadWrap,
  ViewStatusEnum,
} from './StatusView';
import { formatBytes, getBase64, getExts } from './fileSupport';

const ACCEPT = FILE_ACCEPT.join(',');

export interface ICustomUpload {
  limitSize?: number; // Bytes
  accept?: string;
  width?: number;
  height?: number;
  legalExts?: string[];
  onFulfilled?: (res: any) => void;
}

const NoRequestUpload = ({
  limitSize = LIMIT_SIZE,
  accept = ACCEPT,
  width = 120,
  height = 120,
  legalExts = [],
  onFulfilled,
}: ICustomUpload) => {
  const { message } = App.useApp();
  const [viewStatus, setViewStatus] = useState<ViewStatusEnum>(
    ViewStatusEnum.SELECT,
  );
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const reset = useCallback(() => {
    setViewStatus(ViewStatusEnum.SELECT);
    setPreviewUrl('');
    setProgress(0);
    // TODO: 后续优化- hacks 触发更新，重新挂载 uniqueId ,暂用 setProgress ，双重提高唯一性
    setProgress(Math.random() + Math.random());
  }, []);

  const validateFile = useCallback((file: File) => {
    if (file.size > limitSize) {
      const formatStr = formatBytes(limitSize);
      message.error(`File size cannot exceed ${formatStr}`);
      return false;
    }

    // const legalExts = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
    if (!!legalExts.length) {
      const ext = getExts(file);
      if (!legalExts.includes(ext)) {
        message.error('File format is not supported');
        return false;
      }
    }

    return true;
  }, []);

  const doUpload = useCallback(
    async (
      file: File,
      onProgress: (v: number) => void,
      onFinish: (r: any) => void,
    ) => {
      onProgress(100);
      onFinish(file);
    },
    [],
  );

  const handleChange = (e: any) => {
    const files = (e.target as HTMLInputElement).files;
    if (files?.length === 0) {
      return;
    }
    const file = files?.[0];
    if (!file) {
      reset();
      return;
    }
    if (!validateFile(file)) {
      reset();
      return;
    }
    setViewStatus(ViewStatusEnum.PROGRESS);
    const ext = getExts(file);
    if (BELONG_IMG_EXTS.includes(ext)) {
      // 显示预览图
      getBase64(file).then((res) => {
        setPreviewUrl(res);
      });
    }

    doUpload(
      file,
      (curProgress: number) => {
        setProgress(curProgress);
      },
      (res: any) => {
        reset();
        onFulfilled?.(res);
      },
    );
  };

  return (
    <>
      <UploadWrap $width={width} $height={height}>
        <SelectView
          $show={
            viewStatus === ViewStatusEnum.SELECT ||
            viewStatus === ViewStatusEnum.RESULT
          }
        >
          <PlusOutlined />
          <SelectText>Upload</SelectText>
          <InputFile
            key={uniqueId()}
            type="file"
            accept={accept}
            onChange={handleChange}
          />
        </SelectView>
        <ProgressView $show={viewStatus === ViewStatusEnum.PROGRESS}>
          {previewUrl && <PreviewImg src={previewUrl} />}
          <ProgressBar>
            <Progress percent={progress} size="small" />
          </ProgressBar>
        </ProgressView>
      </UploadWrap>
    </>
  );
};

export default NoRequestUpload;
