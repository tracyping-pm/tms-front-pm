import { msgList, msgRead, msgReadAll, msgUnreadCount } from '@/api/news';
import { INewsListRecord, INewsRes } from '@/api/types/News';
import { useScrollPenetration } from '@/hooks/useScrollPenetration';
import { Badge, List, Skeleton, Spin } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
// import NewsIcon from '../../../public/img/news_icon.jpg';
import { BellOutlined } from '@ant-design/icons';
import CustomPopover from '../CustomPopover';
import styles from './index.less';

const News: React.FC = () => {
  const { disableScroll, enableScroll } = useScrollPenetration();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<INewsListRecord[]>([]);
  const [allDataSource, setAllDataSource] = useState<INewsRes>({} as INewsRes);
  const [unReadNumber, setUnReadNumber] = useState<number>(0);
  const [listItemsContainerRef, setListItemsContainerRef] = useState();

  const getUnReadNumber = useCallback(async () => {
    const res = await msgUnreadCount();
    if (res.code === 200) {
      setUnReadNumber(res?.data?.unreadCount ?? 0);
    }
  }, []);

  const onReadMessage = async (values: INewsListRecord) => {
    const { id, hasRead } = values;
    if (hasRead) {
      return;
    }
    const payload = {
      msgIdList: [id],
    };
    const res = await msgRead(payload);
    if (res.code === 200) {
      getUnReadNumber();
      dataSource.forEach((item: INewsListRecord) => {
        if (item.id === id) {
          item.hasRead = true;
        }
        return { ...item };
      });
      setDataSource([...dataSource]);
    }
  };

  const onReadAll = async () => {
    const res = await msgReadAll();
    if (res.code === 200) {
      getUnReadNumber();
      dataSource.forEach((item: INewsListRecord) => {
        item.hasRead = true;
        return { ...item };
      });
      setDataSource([...dataSource]);
    }
  };

  const onToPage = (value: string) => {
    window.open(JSON.parse(value)?.linkUrl);
  };

  const getDataSource = useCallback(
    async (initPage?: number) => {
      if (
        typeof allDataSource.hasNextPage === 'boolean' &&
        !allDataSource.hasNextPage
      ) {
        return;
      }
      const payload = {
        pageNum: initPage ? initPage : allDataSource.nextPage ?? 1,
        pageSize: 10,
      };
      setLoading(true);
      const res = await msgList(payload);
      setLoading(false);
      if (res.code === 200) {
        if (initPage) {
          setDataSource([...res?.data?.list]);
        } else {
          setDataSource([...dataSource, ...res?.data?.list]);
        }

        setAllDataSource(res?.data);
      }
    },
    [allDataSource, dataSource],
  );

  // 由于Popover的渲染机制问题，需要确保能够成功绑定InfiniteScroll的滚动容器的scrollableTarget，
  // 因此采用ref实时获取滚动容器，并确保在ref有值时绑定InfiniteScroll
  const onListItemsContainerRefChange = useCallback((node: any) => {
    if (node !== null) {
      setListItemsContainerRef(node);
    }
  }, []);

  const onOpenChange = (open: boolean) => {
    setDataSource([]);
    // @ts-ignore
    setAllDataSource({});
    if (open) {
      getDataSource(1);
      getUnReadNumber();
      disableScroll();
    } else {
      enableScroll();
    }
  };

  useEffect(() => {
    getUnReadNumber();
  }, []);

  const NewsHeader = () => {
    return (
      <div className={styles.newsHeader}>
        <p>Notifications （{unReadNumber} Unread）</p>
        <p onClick={onReadAll} className={styles.newsHeader_allRead}>
          Mark all as read
        </p>
      </div>
    );
  };

  const NewsContent = () => {
    return (
      <Spin spinning={loading}>
        <div className={styles.newsContent} ref={onListItemsContainerRefChange}>
          {listItemsContainerRef && (
            <InfiniteScroll
              dataLength={dataSource?.length}
              next={debounce(() => {
                getDataSource();
              }, 200)}
              hasMore={dataSource?.length < allDataSource.total}
              loader={
                <Skeleton loading={loading} paragraph={{ rows: 1 }} active />
              }
              // endMessage={<Divider plain>It is all, nothing more </Divider>}
              scrollableTarget={listItemsContainerRef}
            >
              <List
                size="small"
                dataSource={dataSource}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => {
                      onReadMessage(item);
                    }}
                    key={item.id}
                    style={{ padding: '16px 0 16px 8px', cursor: 'pointer' }}
                  >
                    <List.Item.Meta
                      title={
                        <div className={styles.newsItemHeader}>
                          <p
                            className={`${styles.newsItemTitle} ${
                              item.hasRead ? styles.newsRead : ''
                            }`}
                            title={item.content}
                          >
                            {item.content}
                          </p>
                          {!item.hasRead && (
                            <span className={styles.readDot}></span>
                          )}
                        </div>
                      }
                      description={
                        item.customParam !== '{}' ? (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span
                              onClick={() => {
                                onToPage(item.customParam);
                              }}
                              className={styles.newsItemDes}
                            >
                              View Details
                            </span>
                            <span>{item.createdAt}</span>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <span>{item.createdAt}</span>
                          </div>
                        )
                      }
                    />
                  </List.Item>
                )}
              />
            </InfiniteScroll>
          )}
        </div>
      </Spin>
    );
  };

  return (
    <CustomPopover
      classNames={{ root: 'newsPopover' }}
      styles={{ body: { padding: 0 } }}
      placement="bottom"
      content={NewsContent}
      title={NewsHeader}
      trigger={'click'}
      onOpenChange={onOpenChange}
    >
      <div className={styles.news}>
        <Badge count={unReadNumber} offset={[7, 0]} overflowCount={9}>
          <BellOutlined className={styles.newsIcon} />
        </Badge>
      </div>
    </CustomPopover>
  );
};

export default News;
