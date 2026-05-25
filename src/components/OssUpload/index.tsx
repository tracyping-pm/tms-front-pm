import { ossGetUploadSignature, ossUpload } from '@/api-uam/oss';
import { CommonUploadOptions } from '@/api-uam/types/common';
import {
  BELONG_IMG_EXTS,
  FILE_ACCEPT,
  getOssRoot,
  LIMIT_SIZE,
  TOTAL_LIMIT_SIZE,
} from '@/constants';
import { getOrigin } from '@/constants/uam';
import { BU_TYPE_ENUM } from '@/enums/uam';
import {
  InboxOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { useRequest, useSetState } from 'ahooks';
import { App, Button, Popover, Spin, Tooltip, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { UploadFileStatus } from 'antd/es/upload/interface';
import cls from 'classnames';
import _, { cloneDeep, findIndex } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import ImagePreviewGroup from '../ImagePreviewGroup';
import {
  formatBytes,
  getExts,
  getImageSource,
  initialImagePreviewGroupState,
  splitFileName,
} from './constant';
import FileItemView from './FileItemView';
import styles from './index.less';
import StatusFileItem, { IStatusFile } from './StatusFileItem';
import SupportPreviewFileTable from './SupportPreviewFileTable';
import {
  ENUM_OSS_MENU_DIRECTORY,
  IDocument,
  IImagePreviewGroupState,
  IOssFile,
  ISourceImage,
} from './types';

const { Dragger } = Upload;
const ACCEPT = FILE_ACCEPT.join(',');
const HACK_TOP = 9999999;
const ONCE_MAX_UPLOAD_COUNT = 10;

interface IOssUpload {
  dir: ENUM_OSS_MENU_DIRECTORY;
  mode?: 'card' | 'list';
  protocol?: 'http' | 'https';
  showModeBar?: boolean;
  fileList?: IOssFile[];
  multiple?: boolean;
  modeCardItemWidth?: number | string;
  modeCardItemHeight?: number | string;
  modeListItemWidth?: number | string;
  scrollHeight?: number;
  accept?: string;
  limitSize?: number;
  totalLimitSize?: number;
  onceMaxUploadCount?: number;
  disabled?: boolean;
  showPreview?: boolean;
  showDownload?: boolean;
  showDelete?: boolean;
  value?: number[];
  onChange?: (value: number[], list: IOssFile[]) => void;
  getUploadingSize?: (uploadingSize: number) => void;
}

const OssUpload = ({
  dir = ENUM_OSS_MENU_DIRECTORY.OTHER,
  mode = 'list',
  protocol = 'https',
  showModeBar = true,
  fileList = [],
  multiple = true,
  modeCardItemWidth = 100,
  modeCardItemHeight = 100,
  modeListItemWidth = '100%',
  scrollHeight = 300,
  accept = ACCEPT,
  limitSize = LIMIT_SIZE,
  totalLimitSize = TOTAL_LIMIT_SIZE,
  onceMaxUploadCount = ONCE_MAX_UPLOAD_COUNT,
  disabled = false,
  showPreview = true,
  showDownload = true,
  showDelete = true,
  onChange,
  getUploadingSize,
}: IOssUpload) => {
  const ACCEPT_TIPS = accept?.split(',')?.join(' ');
  const { message } = App.useApp();
  const {
    data: signatureResponse,
    run: signatureRefresh,
    loading: signatureLoading,
  } = useRequest(ossGetUploadSignature, {
    pollingInterval: 30 * 60 * 1000, // 30 minutes 刷新一次 token, 服务器端 expire time is 1 hour
    onError: (error) => {
      console.log({ error });
    },
  });
  const hasSignatureSuccess =
    signatureResponse?.code === 200 && signatureResponse?.data;
  const formatStr = formatBytes(limitSize);
  const totalFormatStr = formatBytes(totalLimitSize);
  const [viewMode, setViewMode] = useState<'list' | 'card'>(mode);
  const [imagePreviewGroupState, setImagePreviewGroupState] =
    useSetState<IImagePreviewGroupState>(initialImagePreviewGroupState);
  const [oldFileList, setOldFileList] = useState<IOssFile[]>([]);
  const [newFileList, setNewFileList] = useState<IStatusFile[]>([]);
  const newFileListRef = useRef<IStatusFile[]>([]);
  const [allFileList, setAllOssFileList] = useState<IOssFile[]>([]);
  const sourceImageMapRef = useRef<Map<number, string>>(new Map());
  const abortControllerMapRef = useRef<Map<string, AbortController>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const onceTriggerFlagRef = useRef<boolean>(false);

  const formatPercent = useCallback((file: IStatusFile, percent: number) => {
    return newFileListRef.current.map((item: IStatusFile) => {
      if (item.uid === file.uid) {
        item.percent = percent;
      }
      return item;
    });
  }, []);

  const formatStatus = (file: IStatusFile, status: UploadFileStatus) => {
    file.status = status;
    return file;
  };

  const formatFileList = useCallback(
    (file: IStatusFile, status: UploadFileStatus, ossFile?: IOssFile) => {
      return newFileListRef.current.map((item: IStatusFile) => {
        if (item.uid === file.uid) {
          item.status = status;
          item.ossFile = ossFile;
        }
        return item;
      });
    },
    [newFileList],
  );

  const validateSingleFileSize = (file: RcFile) => {
    if (file.size > limitSize) {
      message.destroy();
      message.error(`File size cannot exceed ${formatStr}`);
      return false;
    }
    return true;
  };

  const validateSingleFileExt = (file: RcFile) => {
    const ext = getExts(file);
    if (!FILE_ACCEPT.includes(ext)) {
      message.destroy();
      message.error('File format is not supported');
      return false;
    }

    return true;
  };

  const validateTotalSize = (rcFileList: RcFile[]) => {
    const totalSize = rcFileList.reduce(
      (acc, file) => acc + (file.size || 0),
      0,
    );
    if (totalSize > totalLimitSize) {
      const curTotalFormatStr = formatBytes(totalLimitSize);
      message.destroy();
      message.error(`File total size cannot exceed ${curTotalFormatStr}`);
      return false;
    }

    return true;
  };

  const handleBeforeUpload = useCallback(
    (file: RcFile, rcFileList: RcFile[]) => {
      // 限制上传文件的个数，最多一次性10个
      if (rcFileList.length > onceMaxUploadCount) {
        message.destroy();
        message.error(
          `The number of files uploaded at one time cannot exceed ${onceMaxUploadCount}`,
        );
        return false;
      }
      const singlePassed = rcFileList.every((fileItem: RcFile) => {
        const singleFileExtPassed = validateSingleFileExt(fileItem);
        const singleFileSizePassed = validateSingleFileSize(fileItem);

        return singleFileSizePassed && singleFileExtPassed;
      });

      const totalSizePassed = validateTotalSize(rcFileList);
      if (singlePassed && totalSizePassed) {
        const _file = formatStatus(file, 'uploading');
        newFileList.push(_file);
        setNewFileList([...newFileList]);
        newFileListRef.current = newFileList;
        return true;
      }

      return false;
    },
    [newFileList],
  );

  const doUpload = async (file: RcFile) => {
    if (!signatureResponse?.data) {
      return;
    }
    const abortController = new AbortController();
    const signal = abortController.signal;
    const { version, policy, credential, ossDate, signature, token, host } =
      signatureResponse.data;
    const formData = new FormData();
    const { name, ext } = splitFileName(file.name);
    const timestamp = new Date().getTime(); // 时间戳

    formData.append('success_action_status', '200');
    formData.append('policy', policy);
    formData.append('x-oss-signature', signature);
    formData.append('x-oss-signature-version', version);
    formData.append('x-oss-credential', credential);
    formData.append('x-oss-date', ossDate);
    formData.append(
      'key',
      `${getOssRoot()}/${dir}/${name}_${timestamp}.${ext}`,
    );
    formData.append('x-oss-security-token', token);

    const callbackUrl = encodeURI(
      `${getOrigin(BU_TYPE_ENUM.UAM)}/api/document/save`,
    );
    const callbackObj = {
      callbackUrl,
      callbackBody:
        '{"object":${object},"mimeType":${mimeType},"size":${size},"original_file_name":${x:original_file_name}}',
      callbackBodyType: 'application/json',
    };
    const jsonStr = JSON.stringify(callbackObj);
    const callback = btoa(jsonStr);

    formData.append('callback', callback);
    formData.append('x:original_file_name', file.name);
    formData.append('file', file); // file 必须为最后一个表单域

    const url = `${protocol}://${host}`;
    const _newFileDefaultList = formatPercent(file, 1);

    setNewFileList([..._newFileDefaultList]);
    newFileListRef.current = _newFileDefaultList;

    const options: CommonUploadOptions = {
      url,
      method: 'post',
      formData,
      signal,
      skipErrorHandler: true,
      progressCallback: (percent: number) => {
        // percent 只是浏览器端的进度，服务器端的进度暂时拿不到
        let _percent = percent;
        if (_percent === 100) {
          _percent = 99;
        }
        const _newFileList = formatPercent(file, _percent);
        setNewFileList([..._newFileList]);
        newFileListRef.current = _newFileList;
      },
    };

    let _newFileList: IStatusFile[] = [];
    abortControllerMapRef.current.set(file.uid, abortController);
    await ossUpload(options)
      .then((res: APIJSON<IDocument>) => {
        if (res.code === 200) {
          _newFileList = formatFileList(file, 'done', res.data);
        } else {
          console.error('error:', res.msg);
          _newFileList = formatFileList(file, 'error');
        }
      })
      .catch((error) => {
        console.error('error:', error);
        _newFileList = formatFileList(file, 'error');
      })
      .finally(() => {
        abortControllerMapRef.current.delete(file.uid);
      });

    setNewFileList([..._newFileList]);
    newFileListRef.current = _newFileList;
  };

  const customRequest = async ({ file, onError }: any) => {
    try {
      doUpload(file);
    } catch (error) {
      onError(error);
    }
  };

  const handleDeleteOldItem = (item: IOssFile) => {
    const _oldFileList = cloneDeep(oldFileList);
    const idx = findIndex(
      _oldFileList,
      (x) => x.originalFileName === item.originalFileName,
    );
    if (idx > -1) {
      _oldFileList.splice(idx, 1);
      setOldFileList(_oldFileList);
    }
  };

  const handleDeleteNewItem = useCallback(
    (item: IStatusFile) => {
      const _newFileList = cloneDeep(newFileList);
      const idx = findIndex(_newFileList, (x) => x.uid === item.uid);
      if (idx > -1) {
        _newFileList.splice(idx, 1);
        setNewFileList(_newFileList);
        newFileListRef.current = _newFileList;
      }
    },
    [newFileList],
  );

  const onCustomPreviewOld = useCallback(
    (file: IOssFile) => {
      const index = _.findIndex(
        imagePreviewGroupState.sourceImageList,
        (v) => v.documentId === file.documentId,
      );
      setImagePreviewGroupState({
        index,
        visible: true,
      });
    },
    [imagePreviewGroupState],
  );

  const onCustomPreviewNew = useCallback(
    (statusFile: IStatusFile) => {
      if (statusFile.status === 'done' && statusFile.ossFile) {
        const fileType = getExts(statusFile);
        if (BELONG_IMG_EXTS.includes(fileType)) {
          const index = _.findIndex(
            imagePreviewGroupState.sourceImageList,
            (v) => v.documentId === statusFile?.ossFile?.documentId,
          );

          if (index > -1) {
            setImagePreviewGroupState({
              index,
              visible: true,
            });
          }
        }
      }
    },
    [imagePreviewGroupState],
  );

  const changeViewMode = useCallback((newMode: 'list' | 'card') => {
    setViewMode(newMode);
  }, []);

  const initPreview = useCallback(async () => {
    const allList: IOssFile[] = [];
    const allSettled: Array<Promise<any>> = [];
    const sourceImageList: ISourceImage[] = [];

    oldFileList?.forEach((fileClient: IOssFile) => {
      const fileType = getExts(fileClient);
      if (BELONG_IMG_EXTS.includes(fileType)) {
        allList.push(fileClient);
      }
    });

    newFileList?.forEach((statusFile: IStatusFile) => {
      if (statusFile.status === 'done' && statusFile.ossFile) {
        const fileType = getExts(statusFile);
        if (BELONG_IMG_EXTS.includes(fileType)) {
          allList.push(statusFile.ossFile);
        }
      }
    });

    allList.forEach((fileClient) => {
      const documentId = fileClient.documentId;
      if (sourceImageMapRef.current.has(documentId)) {
        const src = sourceImageMapRef.current.get(documentId) as string;
        sourceImageList.push({ src, documentId });
      } else {
        allSettled.push(getImageSource(fileClient));
      }
    });

    if (allSettled.length > 0) {
      setImagePreviewGroupState({
        pending: true,
      });

      Promise.allSettled(allSettled)
        .then((values) => {
          values?.forEach((value) => {
            if (value.status === 'fulfilled') {
              sourceImageMapRef.current.set(
                value.value.documentId,
                value.value.src,
              );
              sourceImageList.push(value.value);
            }
          });
        })
        .finally(() => {
          setImagePreviewGroupState({
            pending: false,
            sourceImageList,
          });
        });
    } else {
      setImagePreviewGroupState({
        sourceImageList,
      });
    }
  }, [oldFileList, newFileList]);

  const onFileChange = useCallback(() => {
    const _goodOssFileList: IOssFile[] = [];
    const _allOssFileList: IOssFile[] = [];

    oldFileList.forEach((file) => {
      _goodOssFileList.push(file);
      _allOssFileList.push(file);
    });
    newFileList.forEach((statusFile) => {
      if (statusFile.status === 'done' && statusFile.ossFile) {
        _goodOssFileList.push(statusFile.ossFile);
      }
      // @ts-ignore
      _allOssFileList.push(statusFile.file);
    });

    setAllOssFileList(_allOssFileList);

    // 第一次进来不用触发 validate 校验
    if (onceTriggerFlagRef.current) {
      const ossFileIdList = _goodOssFileList.map((item) => item.documentId);
      onChange?.(ossFileIdList, _goodOssFileList);
    }
    onceTriggerFlagRef.current = true;
  }, [oldFileList, newFileList]);

  useEffect(() => {
    initPreview();
    onFileChange();
  }, [oldFileList, newFileList]);

  useEffect(() => {
    const uploadingSize = abortControllerMapRef.current.size;
    getUploadingSize?.(uploadingSize);

    if (uploadingSize > 0) {
      scrollContainerRef.current?.scrollTo?.({
        top: HACK_TOP,
        behavior: 'smooth',
      });
    }
  }, [newFileList]);

  useEffect(() => {
    // 默认值逻辑上只会初始化使用一次
    if (fileList.length > 0) {
      setOldFileList(fileList);
    }
  }, [fileList]);

  useEffect(() => {
    return () => {
      const abortControllerList = Array.from(
        abortControllerMapRef.current.values(),
      );
      abortControllerList.forEach((controller) => {
        controller.abort();
      });
    };
  }, []);

  // console.log('🚀🚀🚀oldFileList', oldFileList);
  // console.log('🚀🚀🚀newFileList', newFileList);

  return (
    <>
      <div className={cls('dragger-uploader', styles.draggerUploadContainer)}>
        {disabled ? null : (
          <Dragger
            disabled={!hasSignatureSuccess}
            multiple={multiple}
            accept={accept}
            showUploadList={false}
            beforeUpload={handleBeforeUpload}
            customRequest={customRequest}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <Spin spinning={signatureLoading} tip="Getting upload signature...">
              {hasSignatureSuccess ? (
                <>
                  <p className="ant-upload-text">
                    Click or drag files here to upload
                  </p>
                  <p className="ant-upload-hint">
                    <span>Supported upload formats: {ACCEPT_TIPS}</span>
                    <br />
                    <span>
                      Supported preview formats:
                      <Popover
                        title="Supported preview formats"
                        content={<SupportPreviewFileTable />}
                      >
                        <QuestionCircleOutlined />
                      </Popover>
                    </span>
                    <br />
                    <span>A single file size cannot exceed {formatStr}</span>
                    <br />
                    <span>
                      The total size of multiple files selected at one time
                      cannot exceed {totalFormatStr}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="ant-upload-text">
                    Failed to get upload signature
                  </p>
                  <p className="ant-upload-hint">
                    Please try again later or
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        signatureRefresh();
                      }}
                    >
                      retry now
                    </Button>
                  </p>
                </>
              )}
            </Spin>
          </Dragger>
        )}
        {showModeBar && allFileList.length > 0 && (
          <div className={cls('mode-change-case', styles.modeChangeCase)}>
            <Tooltip title="Change View Mode">
              {viewMode === 'list' ? (
                <span
                  className="trigger-icon"
                  onClick={() => changeViewMode('card')}
                >
                  Card View Mode <TableOutlined />
                </span>
              ) : (
                <span
                  className="trigger-icon"
                  onClick={() => changeViewMode('list')}
                >
                  List View Mode
                  <MenuOutlined />
                </span>
              )}
            </Tooltip>
          </div>
        )}
        <Spin
          spinning={imagePreviewGroupState.pending}
          tip="All Images Fetching..."
        >
          <div
            className="file-list-wrap"
            style={{ maxHeight: scrollHeight }}
            ref={scrollContainerRef}
          >
            {oldFileList?.map((item: IOssFile) => (
              <FileItemView
                key={item.documentId}
                className={styles.file_item}
                mode={viewMode}
                modeListItemWidth={'100%'}
                width={modeCardItemWidth}
                height={modeCardItemHeight}
                originalFileName={item.originalFileName}
                documentId={item.documentId}
                snapshotUrl={item.snapshotUrl}
                showPreview={showPreview}
                showDownload={showDownload}
                showDelete={showDelete && !disabled}
                onDeleteTrigger={() => handleDeleteOldItem(item)}
                onCustomPreview={() => onCustomPreviewOld(item)}
              />
            ))}
            {newFileList?.map((statusFile: IStatusFile) => {
              return (
                <StatusFileItem
                  key={statusFile.ossFile?.documentId ?? statusFile.uid}
                  width={modeCardItemWidth}
                  height={modeCardItemHeight}
                  modeListItemWidth={modeListItemWidth}
                  statusFile={statusFile}
                  mode={viewMode}
                  showPreview={showPreview}
                  showDownload={showDownload}
                  showDelete={showDelete && !disabled}
                  onDeleteTrigger={() => handleDeleteNewItem(statusFile)}
                  onCustomPreview={() => onCustomPreviewNew(statusFile)}
                />
              );
            })}
          </div>
        </Spin>
      </div>
      <ImagePreviewGroup
        visible={imagePreviewGroupState.visible}
        items={imagePreviewGroupState.sourceImageList?.map(
          (item: ISourceImage) => item.src,
        )}
        index={imagePreviewGroupState.index}
        onClose={() => setImagePreviewGroupState({ visible: false })}
      />
    </>
  );
};

export default OssUpload;
