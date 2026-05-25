import '@/animation.less';

import {
  getExportDownload,
  getExportLatestExportRecord,
  getExportRead,
} from '@/api-uam/common';
import { ILatestExportRecord } from '@/api-uam/types/common';
import { DownLoadStatusEnum } from '@/enums';
import {
  DownloadOutlined,
  DownOutlined,
  ExceptionOutlined,
  EyeOutlined,
  FileExcelOutlined,
  LoadingOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Badge, Divider, List, Spin } from 'antd';
import cls from 'classnames';
import { cloneDeep } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import CustomPopover from '../CustomPopover';
import styles from './index.less';
const ExportCase = () => {
  const [isBouncing, setIsBouncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isExpand, setIsExpand] = useState(false);
  const [activeDownloadingId, setActiveDownloadingId] = useState<number>();
  const [activeReadingId, setActiveReadingId] = useState<number>();
  const [showBadgeIdList, setShowBadgeIdList] = useState<number[]>([]);
  const time = useRef<NodeJS.Timeout>();
  const [dataSource, setDataSource] = useState<ILatestExportRecord[]>([]);

  const startBouncing = () => {
    setIsBouncing(true);
    setTimeout(() => {
      setIsBouncing(false);
    }, 500);
  };

  useEffect(() => {
    startBouncing();
  }, []);

  const getDataSource = async (isInitNumber = false) => {
    const handle = async () => {
      setLoading(true);
      const res = await getExportLatestExportRecord();
      setLoading(false);
      if (res.code === 200) {
        setDataSource(res?.data);

        const list: number[] = [];
        res?.data.forEach((item) => {
          if (item.status === DownLoadStatusEnum.COMPLETED) {
            list.push(item.id);
          }
        });
        setShowBadgeIdList(list);
        if (isInitNumber) {
          return;
        }
        if (
          res?.data?.some(
            (i: ILatestExportRecord) =>
              i.status === DownLoadStatusEnum.EXPORTING,
          )
        ) {
          time.current = setTimeout(handle, 5 * 1000);
        } else {
          clearTimeout(time.current);
          return;
        }
      }
    };
    handle();
  };

  const onDownLoadData = async (record: ILatestExportRecord) => {
    const { id, spreadsheetId, fileName } = record;
    setActiveDownloadingId(id);
    const res = await getExportDownload({ id, spreadsheetId }).finally(() => {
      setActiveDownloadingId(undefined);
    });
    if (res.code === 200) {
      const link = document.createElement('a');
      link.href = res.data;
      link.download = `${fileName}`;
      link.click();
      URL.revokeObjectURL(link.href);
      link.remove();
      // 从 showBadgeIdList 中删除
      const newShowBadgeIdList = showBadgeIdList.filter((i) => i !== id);
      setShowBadgeIdList(newShowBadgeIdList);
    }
  };

  const onReadData = async (record: ILatestExportRecord) => {
    const { id } = record;
    setActiveReadingId(id);
    const res = await getExportRead({ id }).finally(() => {
      setActiveReadingId(undefined);
    });
    if (res.code === 200) {
      // 从 showBadgeIdList 中删除
      const newShowBadgeIdList = showBadgeIdList.filter((i) => i !== id);
      setShowBadgeIdList(newShowBadgeIdList);
      window.open(record.spreadsheetUrl, '_blank');
    }
  };

  const onOpenChange = (_open: boolean) => {
    if (_open) {
      setDataSource([]);
      getDataSource();
    } else {
      setIsExpand(_open);
      clearTimeout(time.current);
    }
  };

  const getUnDownloadNumber = () => {
    getDataSource(true);
  };

  useEffect(() => {
    getUnDownloadNumber();
  }, []);

  const downLoadContent = () => {
    return (
      <Spin spinning={loading}>
        <div className={styles.downLoadList}>
          <List
            dataSource={
              isExpand ? dataSource : cloneDeep(dataSource).splice(0, 5)
            }
            renderItem={(i: ILatestExportRecord) => (
              <div className={styles.downLoadItem} key={i.id}>
                {i.status === DownLoadStatusEnum.EXCEPTION ? (
                  <div className={cls(styles.downLoadName, styles.exception)}>
                    <div className={styles.badge}></div>
                    <ExceptionOutlined className={styles.downLoadFileIcon} />
                    <span>{DownLoadStatusEnum.EXCEPTION}</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.downLoadName}>
                      <div className={styles.badge}>
                        {showBadgeIdList.includes(i.id) ? (
                          <Badge status="error" />
                        ) : null}
                      </div>
                      <FileExcelOutlined className={styles.downLoadFileIcon} />
                      <span>{i.fileName ?? 'Generating'}</span>
                    </div>
                    <div className={styles.downLoadOperate}>
                      {i.status !== DownLoadStatusEnum.EXPORTING ? (
                        <>
                          {activeReadingId === i.id ? (
                            <LoadingOutlined
                              className={cls(
                                styles.rotateIcon,
                                styles.downLoadIcon,
                                styles.downLoadLoadingIcon,
                              )}
                            />
                          ) : (
                            <EyeOutlined
                              className={styles.downLoadIcon}
                              onClick={() => {
                                onReadData(i);
                              }}
                            />
                          )}
                        </>
                      ) : null}

                      {[
                        DownLoadStatusEnum.COMPLETED,
                        DownLoadStatusEnum.DOWNLOADED,
                        DownLoadStatusEnum.READ,
                      ].includes(i.status) ? (
                        <>
                          {activeDownloadingId === i.id ? (
                            <LoadingOutlined
                              className={cls(
                                styles.rotateIcon,
                                styles.downLoadIcon,
                                styles.downLoadLoadingIcon,
                              )}
                            />
                          ) : (
                            <DownloadOutlined
                              className={styles.downLoadIcon}
                              onClick={() => {
                                onDownLoadData(i);
                              }}
                            />
                          )}
                        </>
                      ) : null}
                      {i.status === DownLoadStatusEnum.EXPORTING ? (
                        <LoadingOutlined
                          className={cls(
                            styles.rotateIcon,
                            styles.downLoadIcon,
                            styles.downLoadLoadingIcon,
                          )}
                        />
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            )}
          />
          <Divider className={styles.downLoadDivider} orientation="center">
            <span className={styles.dividerText}>
              Only keep the last 10 records for you
            </span>
          </Divider>
          {dataSource.length > 5 ? (
            <div
              className={cls(styles.collapse, 'collapse')}
              onClick={() => setIsExpand(!isExpand)}
            >
              {isExpand ? (
                <>
                  Collapse
                  <UpOutlined />
                </>
              ) : (
                <>
                  Expand
                  <DownOutlined />
                </>
              )}
            </div>
          ) : null}
        </div>
      </Spin>
    );
  };

  return (
    <>
      <CustomPopover
        styles={{ body: { padding: 0 } }}
        placement="bottom"
        content={downLoadContent}
        trigger={'click'}
        onOpenChange={onOpenChange}
      >
        <div
          className={cls(
            styles.exportCase,
            'exportCase',
            isBouncing && 'bounce',
          )}
        >
          <Badge
            count={showBadgeIdList.length}
            offset={[7, 0]}
            overflowCount={9}
          >
            <DownloadOutlined style={{ fontSize: 20 }} />
          </Badge>
        </div>
      </CustomPopover>
      <div className={cls(styles.downloadCenter, 'downloadCenter')}>
        <div className={styles.initExportTooltipCls}>
          <p>The file you selected is here</p>
        </div>
        <DownloadOutlined />
      </div>
    </>
  );
};

export default ExportCase;
