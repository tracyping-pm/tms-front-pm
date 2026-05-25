import { commonUpload, getImageSource } from '@/api/common';
import {
  CommonUploadOptions,
  ICommonMaterial,
  IImageState,
  ISourceImage,
} from '@/api/types/common';
import { formatBytes, getExts } from '@/components/CustomUpload/fileSupport';
import {
  FILE_ACCEPT,
  IMAGE_TYPE,
  LIMIT_SIZE,
  TOTAL_LIMIT_SIZE,
  initialImageState,
} from '@/constants';
import { PlusOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Spin, Upload, message } from 'antd';
import { RcFile } from 'antd/es/upload';
import { UploadFileStatus } from 'antd/es/upload/interface';
import cls from 'classnames';
import _, { cloneDeep } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import CommonFileItem from '../../CommonFileItem';
import ImagePreviewGroup from '../../ImagePreviewGroup';
import { IFile_2, getGenAIFileInfo } from '../genAI';
import StatusFileItem, { IStatusFile } from '../StatusFileItem';
import styles from './index.less';

const ACCEPT = FILE_ACCEPT.join(',');
// const ACCEPT_TIPS = FILE_ACCEPT.join(' ');
const DEFAULT_URL = '/api/material/add';
const HACK_TOP = 9999999;
const ONCE_MAX_UPLOAD_COUNT = 10;
const TOTAL_MAX_UPLOAD_COUNT = Infinity;

interface ISingleUpload {
  withGenAI?: boolean;
  // showModeBar?: boolean;
  showDelete?: boolean;
  showOldFileDelete?: boolean;
  materialList?: ICommonMaterial[];
  url?: string;
  dto: object;
  dtoName?: string;
  name?: string;
  multiple?: boolean;
  mode?: 'card' | 'list';
  modeCardItemWidth?: number | string;
  modeCardItemHeight?: number | string;
  modeListItemWidth?: number | string;
  scrollHeight?: number;
  accept?: string;
  limitSize?: number;
  totalLimitSize?: number;
  onceMaxUploadCount?: number;
  totalMaxUploadCount?: number;
  // uploadTips?: React.ReactNode;
  disabled?: boolean;
  value?: number[];
  onChange?: (value: number[], materialList: ICommonMaterial[]) => void;
  getUploadingSize?: (uploadingSize: number) => void;
  getDeleteMaterialId?: (ids: number) => void;
}

const SingleUpload = ({
  withGenAI = false,
  // showModeBar = true,
  showDelete = true,
  showOldFileDelete = true,
  materialList = [],
  url = DEFAULT_URL,
  dto,
  dtoName = 'req',
  name = 'file',
  multiple = true,
  mode = 'card',
  modeCardItemWidth = 100,
  modeCardItemHeight = 100,
  modeListItemWidth = '100%',
  scrollHeight = 300,
  accept = ACCEPT,
  limitSize = LIMIT_SIZE,
  totalLimitSize = TOTAL_LIMIT_SIZE,
  // uploadTips,
  onceMaxUploadCount = ONCE_MAX_UPLOAD_COUNT,
  totalMaxUploadCount = TOTAL_MAX_UPLOAD_COUNT,
  disabled = false,
  onChange,
  getUploadingSize,
  getDeleteMaterialId,
}: ISingleUpload) => {
  const formatStr = formatBytes(limitSize);
  // const totalFormatStr = formatBytes(totalLimitSize);
  const [viewMode] = useState<'list' | 'card'>(mode);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);
  const [oldFileList, setOldFileList] = useState<ICommonMaterial[]>([]);
  const [newFileList, setNewFileList] = useState<IStatusFile[]>([]);
  const newFileListRef = useRef<IStatusFile[]>([]);
  // const [allIdList, setAllIdList] = useState<Array<number | string>>([]);
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
    (
      file: IStatusFile,
      status: UploadFileStatus,
      materialObj?: ICommonMaterial,
    ) => {
      return newFileListRef.current.map((item: IStatusFile) => {
        if (item.uid === file.uid) {
          item.status = status;
          item.materialObj = materialObj;
        }
        return item;
      });
    },
    [],
  );

  const formatFile2List = useCallback(
    (
      file: IStatusFile,
      status: UploadFileStatus,
      materialObj: ICommonMaterial,
      file_2: IFile_2,
    ) => {
      return newFileListRef.current.map((item: IStatusFile) => {
        if (item.uid === file.uid) {
          item.status = status;
          item.materialObj = materialObj;
          item.file_2 = file_2;
        }
        return item;
      });
    },
    [],
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

  const validateTotalSize = (fileList: RcFile[]) => {
    const totalSize = fileList.reduce((acc, file) => acc + (file.size || 0), 0);
    if (totalSize > totalLimitSize) {
      const curTotalFormatStr = formatBytes(totalLimitSize);
      message.destroy();
      message.error(`File total size cannot exceed ${curTotalFormatStr}`);
      return false;
    }

    return true;
  };

  const handleBeforeUpload = useCallback(
    (file: RcFile, fileList: RcFile[]) => {
      // 限制上传文件的总个数
      const temporaryTotalSize =
        (oldFileList.length ?? 0) +
        (newFileList.length ?? 0) +
        (fileList.length ?? 0);
      if (temporaryTotalSize > totalMaxUploadCount) {
        message.destroy();
        message.error(`File total count cannot exceed ${totalMaxUploadCount}`);
        return false;
      }
      // 限制单次上传文件的个数，最多一次性10个
      if (fileList.length > onceMaxUploadCount) {
        message.destroy();
        message.error(
          `The number of files uploaded at one time cannot exceed ${onceMaxUploadCount}`,
        );
        return false;
      }
      const singlePassed = fileList.every((fileItem: RcFile) => {
        const singleFileExtPassed = validateSingleFileExt(fileItem);
        const singleFileSizePassed = validateSingleFileSize(fileItem);

        return singleFileSizePassed && singleFileExtPassed;
      });

      const totalSizePassed = validateTotalSize(fileList);
      if (singlePassed && totalSizePassed) {
        const _file = formatStatus(file, 'uploading');
        newFileList.push(_file);
        setNewFileList([...newFileList]);
        newFileListRef.current = newFileList;

        fileList.forEach((item) => {
          if (item.uid) {
            const abortController = new AbortController();
            abortControllerMapRef.current.set(file.uid, abortController);
          }
        });
        return true;
      }

      return false;
    },
    [oldFileList, newFileList],
  );

  const doUpload = async (file: RcFile) => {
    const abortController = abortControllerMapRef.current.get(file.uid);
    if (!abortController) {
      throw new Error('AbortController something wrong');
    }

    const formData = new FormData();
    const blob = new Blob([JSON.stringify(dto)], {
      type: 'application/json',
    });

    formData.append(dtoName, blob);
    formData.append(name, file);

    const _newFileDefaultList = formatPercent(file, 1);
    setNewFileList([..._newFileDefaultList]);
    newFileListRef.current = _newFileDefaultList;

    const options: CommonUploadOptions = {
      url,
      method: 'post',
      formData,
      signal: abortController.signal,
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
    const res = await commonUpload(options).catch(() => {
      _newFileList = formatFileList(file, 'error');
    });

    if (res?.code === 200) {
      if (withGenAI) {
        await getGenAIFileInfo(file)
          .then((file_2) => {
            _newFileList = formatFile2List(
              file,
              'done',
              res.data,
              file_2 as IFile_2,
            );
            abortControllerMapRef.current.delete(file.uid);
          })
          .catch(() => {
            console.error('文件上传至 Gemini 失败');
            _newFileList = formatFileList(file, 'done', res.data);
            abortControllerMapRef.current.delete(file.uid);
          });
      } else {
        _newFileList = formatFileList(file, 'done', res.data);
        abortControllerMapRef.current.delete(file.uid);
      }
    } else {
      _newFileList = formatFileList(file, 'error');
      abortControllerMapRef.current.delete(file.uid);
    }
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

  const handleDeleteOldItem = (item: ICommonMaterial) => {
    const _oldFileList = cloneDeep(oldFileList);
    const idx = _.findIndex(
      _oldFileList,
      (x) => x.fileMaterialId === item.fileMaterialId,
    );
    if (idx > -1) {
      _oldFileList.splice(idx, 1);
      setOldFileList(_oldFileList);
    }
    getDeleteMaterialId?.(item?.fileMaterialId as number);
  };

  const handleDeleteNewItem = useCallback(
    (item: IStatusFile) => {
      const _newFileList = cloneDeep(newFileList);
      const idx = _.findIndex(_newFileList, (x) => x.uid === item.uid);
      if (idx > -1) {
        _newFileList.splice(idx, 1);
        setNewFileList(_newFileList);
        newFileListRef.current = _newFileList;
      }
      getDeleteMaterialId?.(item?.materialObj?.fileMaterialId as number);
    },
    [newFileList],
  );

  const onCustomPreviewOld = useCallback(
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

  const onCustomPreviewNew = useCallback(
    (statusFile: IStatusFile) => {
      if (statusFile.status === 'done' && statusFile.materialObj) {
        if (IMAGE_TYPE.includes(statusFile.materialObj.fileType)) {
          const index = _.findIndex(
            imageState.sourceImages,
            (v) =>
              v.material.fileMaterialId ===
              statusFile?.materialObj?.fileMaterialId,
          );

          if (index > -1) {
            setImageState({
              index,
              visible: true,
            });
          }
        }
      }
    },
    [imageState],
  );

  // const changeViewMode = useCallback((newMode: 'list' | 'card') => {
  //   setViewMode(newMode);
  // }, []);

  const initPreview = useCallback(async () => {
    const goodMaterialList: ICommonMaterial[] = [];
    const allSettled: Array<Promise<any>> = [];
    const sourceImages: ISourceImage[] = [];

    oldFileList?.forEach((material) => {
      if (IMAGE_TYPE.includes(material.fileType)) {
        goodMaterialList.push(material);
      }
    });

    newFileList?.forEach((statusFile) => {
      if (statusFile.status === 'done' && statusFile.materialObj) {
        if (IMAGE_TYPE.includes(statusFile.materialObj.fileType)) {
          goodMaterialList.push(statusFile.materialObj);
        }
      }
    });

    goodMaterialList.forEach((material) => {
      if (sourceImageMapRef.current.has(material.fileMaterialId)) {
        const src = sourceImageMapRef.current.get(
          material.fileMaterialId,
        ) as string;
        sourceImages.push({ src, material });
      } else {
        allSettled.push(getImageSource(material));
      }
    });

    if (allSettled.length > 0) {
      setImageState({
        pending: true,
      });

      Promise.allSettled(allSettled)
        .then((values) => {
          values?.forEach((value) => {
            if (value.status === 'fulfilled') {
              sourceImageMapRef.current.set(
                value.value.material.fileMaterialId,
                value.value.src,
              );
              sourceImages.push(value.value);
            }
          });
        })
        .finally(() => {
          setImageState({
            pending: false,
            sourceImages,
          });
        });
    } else {
      setImageState({
        sourceImages,
      });
    }
  }, [oldFileList, newFileList]);

  const onFileChange = useCallback(() => {
    const _goodMaterialList: ICommonMaterial[] = [];
    // const _allIdList: Array<number | string> = [];

    oldFileList.forEach((material) => {
      _goodMaterialList.push(material);
      // _allIdList.push(material.fileMaterialId);
    });
    newFileList.forEach((statusFile) => {
      if (statusFile.status === 'done' && statusFile.materialObj) {
        let item: any = statusFile.materialObj;
        if (statusFile.file_2) {
          item = { ...item, file_2: statusFile.file_2 };
        }
        _goodMaterialList.push(item);
      }
      // _allIdList.push(statusFile.uid);
    });

    // setAllIdList(_allIdList);

    // 第一次进来不用触发 validate 校验
    if (onceTriggerFlagRef.current) {
      const _goodMaterialIdList = _goodMaterialList.map(
        (item) => item.fileMaterialId,
      );

      // 等待所有上传的文件结束后才触发 onChange 事件
      const uploadingSize = abortControllerMapRef.current.size;
      if (uploadingSize === 0) {
        onChange?.(_goodMaterialIdList, _goodMaterialList);
      }
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
    if (materialList.length > 0) {
      setOldFileList(materialList);
    }
  }, [materialList]);

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

  return (
    <>
      <div className={cls('single-uploader', styles.singleUploadContainer)}>
        <Spin spinning={imageState.pending} tip="All Images Fetching...">
          <div
            className="file-list-wrap"
            style={{ maxHeight: scrollHeight }}
            ref={scrollContainerRef}
          >
            {oldFileList?.map((item: ICommonMaterial) => (
              <CommonFileItem
                key={item.fileDriveId}
                mode={viewMode}
                modeListItemWidth={'100%'}
                width={modeCardItemWidth}
                height={modeCardItemHeight}
                className={styles.file_item}
                thumbnail={item.fileThumbnailUrl}
                showListThumbnail={false}
                // showDownload={false}
                fileType={item.fileType}
                fileName={item.fileName}
                materialId={item.fileMaterialId}
                driveFileId={item.fileDriveId}
                fileMimeType={item.fileMimeType}
                showDelete={showOldFileDelete}
                onDeleteTrigger={() => handleDeleteOldItem(item)}
                onCustomPreview={() => onCustomPreviewOld(item)}
              />
            ))}
            {newFileList?.map((statusFile: IStatusFile) => {
              return (
                <StatusFileItem
                  key={statusFile.uid}
                  width={modeCardItemWidth}
                  height={modeCardItemHeight}
                  modeListItemWidth={modeListItemWidth}
                  statusFile={statusFile}
                  mode={viewMode}
                  showDelete={showDelete}
                  onDeleteTrigger={() => handleDeleteNewItem(statusFile)}
                  onCustomPreview={() => onCustomPreviewNew(statusFile)}
                />
              );
            })}
            {disabled ? null : (
              <Upload
                listType="picture-card"
                multiple={multiple}
                accept={accept}
                showUploadList={false}
                beforeUpload={handleBeforeUpload}
                customRequest={customRequest}
              >
                <div className={styles.uploadWrap}>
                  <p className={styles.uploadIcon}>
                    <PlusOutlined />
                  </p>
                  <p className={styles.uploadText}>Upload</p>
                </div>
              </Upload>
            )}
          </div>
        </Spin>
      </div>
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
};

export default SingleUpload;
