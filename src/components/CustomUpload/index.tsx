import { commonUpload } from '@/api/common';
import { CommonUploadOptions } from '@/api/types/common';
import { BELONG_IMG_EXTS, FILE_ACCEPT, LIMIT_SIZE } from '@/constants';
import { PlusOutlined } from '@ant-design/icons';
import { App, Progress, Spin } from 'antd';
import { useCallback, useRef, useState } from 'react';
import {
  InputFile,
  LoadingBar,
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
  url: string;
  name?: string;
  limitSize?: number; // Bytes
  width?: number;
  height?: number;
  accept?: string;
  beforeTrigger?: () => Promise<any>;
  onPending?: () => void;
  onFulfilled?: (res: any) => void;
  onRejected?: (err: any) => void;
}

const CustomUpload = ({
  url,
  name = 'files',
  accept = ACCEPT,
  limitSize = LIMIT_SIZE,
  width = 120,
  height = 120,
  beforeTrigger,
  onPending,
  onFulfilled,
  onRejected,
}: ICustomUpload) => {
  const { message } = App.useApp();
  const [viewStatus, setViewStatus] = useState<ViewStatusEnum>(
    ViewStatusEnum.SELECT,
  );
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setViewStatus(ViewStatusEnum.SELECT);
    setPreviewUrl('');
    setProgress(0);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const validateFile = useCallback((file: File) => {
    if (file.size > limitSize) {
      const formatStr = formatBytes(limitSize);
      message.error(`File size cannot exceed ${formatStr}`);
      return false;
    }

    const ext = getExts(file);
    if (!FILE_ACCEPT.includes(ext)) {
      message.error('File format is not supported');
      return false;
    }

    return true;
  }, []);

  const doUpload = useCallback(
    async (
      file: File,
      onProgress: (v: number) => void,
      onFinish: (r: any) => void,
    ) => {
      const controller = new AbortController();
      const signal = controller.signal;

      const formData = new FormData();
      formData.append(name, file);
      const options: CommonUploadOptions = {
        url: url!,
        method: 'post',
        formData,
        signal,
      };
      let percent = 0;
      const timer = setInterval(() => {
        percent = percent + 1;
        if (percent < 100) {
          onProgress(percent);
        }
      }, 100);
      onPending?.();
      try {
        const res = await commonUpload(options);
        clearInterval(timer);
        if (res.code === 200) {
          onProgress(100);
          onFinish(res.data);
        } else {
          reset();
          onRejected?.(res);
        }
      } catch (err) {
        clearInterval(timer);
        reset();
        onRejected?.(err);
      }
      return () => {
        controller.abort();
      };
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

  const triggerInput = useCallback(() => {
    inputRef?.current?.click?.();
  }, []);

  const handleClick = () => {
    if (beforeTrigger) {
      beforeTrigger()
        .then(() => {
          triggerInput();
        })
        .catch(() => {});
    } else {
      triggerInput();
    }
  };

  return (
    <>
      <UploadWrap onClick={handleClick} $width={width} $height={height}>
        <SelectView
          $show={
            viewStatus === ViewStatusEnum.SELECT ||
            viewStatus === ViewStatusEnum.RESULT
          }
        >
          <PlusOutlined />
          <SelectText>Upload</SelectText>
        </SelectView>
        <ProgressView $show={viewStatus === ViewStatusEnum.PROGRESS}>
          {previewUrl && <PreviewImg src={previewUrl} />}
          {/* {先display-none，业务不用} */}
          <ProgressBar style={{ display: 'none' }}>
            <Progress percent={progress} size="small" />
          </ProgressBar>
          <LoadingBar>
            <Spin spinning={true} />
          </LoadingBar>
        </ProgressView>
      </UploadWrap>
      <InputFile
        style={{ display: 'none' }}
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
      />
    </>
  );
};

export default CustomUpload;
