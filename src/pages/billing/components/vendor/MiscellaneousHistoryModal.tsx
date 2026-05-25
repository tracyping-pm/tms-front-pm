import { miscellaneousChangeHistoryList } from '@/api/billing';
import { IMiscellaneousChangeHistoryListItem } from '@/api/types/billing';
import CustomTooltip from '@/components/CustomTooltip';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { initialImagePreviewGroupState } from '@/components/OssUpload/constant';
import FileItemView from '@/components/OssUpload/FileItemView';
import {
  IDocument,
  IImagePreviewGroupState,
  IOssFile,
  ISourceImage,
} from '@/components/OssUpload/types';
import { useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import {
  Button,
  Modal,
  ModalProps,
  Popover,
  Spin,
  Table,
  TableColumnsType,
} from 'antd';
import { CSSProperties, FC, useEffect, useRef, useState } from 'react';

const MiscellaneousHistoryModal: FC<ModalProps> = ({
  title = 'Miscellaneous Charge Edit History',
  width = 1000,
  ...restProps
}) => {
  const [imagePreviewGroupState, setImagePreviewGroupState] =
    useSetState<IImagePreviewGroupState>(initialImagePreviewGroupState);
  const { id: customerStatementId } = useParams();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<any[]>([]);
  const [fileViewPopoverOpen, setFileViewPopoverOpen] =
    useState<boolean>(false);
  const activeRecordKeyRef = useRef<number>();

  const getStatementReceiptList = async () => {
    setLoading(true);
    const res = await miscellaneousChangeHistoryList(
      +customerStatementId!,
    ).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setList(res.data || []);
    }
  };

  const onCustomPreview = (file: IOssFile, documentList: IDocument[]) => {
    let index;
    const _documentList = documentList?.map((item, _index) => {
      if (item.documentId === file.documentId) {
        index = _index;
      }
      return {
        documentId: item.documentId,
        src: item.snapshotUrl,
      };
    });
    console.log(_documentList, documentList);
    setImagePreviewGroupState({
      index: index!,
      visible: true,
      sourceImageList: _documentList,
    });
  };

  useEffect(() => {
    getStatementReceiptList();
  }, []);

  const columns: TableColumnsType<IMiscellaneousChangeHistoryListItem> = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      width: 160,
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const { description } = record;
        const _list = description.split('\n').filter(Boolean);
        const content = (num: number) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {_list.slice(0, num).map((item, index) => (
                <>
                  <div key={index}>
                    {item}
                    {_list.length > 3 && index === 2 && num !== _list.length
                      ? '...'
                      : ''}
                  </div>
                </>
              ))}
            </div>
          );
        };
        return (
          <CustomTooltip title={content(_list.length)}>
            {content(3)}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Proof',
      dataIndex: 'receipt',
      width: 260,
      render: (_, record) => {
        const renderContent = () => {
          const itemStyle: CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: 14,
            flexWrap: 'wrap',
            maxWidth: 790,
          };
          return (
            <div style={{ ...itemStyle }}>
              {record.documentList?.slice(2)?.map((item: IDocument) => (
                <FileItemView
                  key={item.documentId}
                  // className={styles.file_item}
                  mode={'card'}
                  modeListItemWidth={'100%'}
                  width={100}
                  height={100}
                  originalFileName={item.originalFileName}
                  documentId={item.documentId}
                  snapshotUrl={item.snapshotUrl}
                  showPreview={true}
                  showDownload={true}
                  showDelete={false}
                  // onDeleteTrigger={() => handleDeleteOldItem(item)}
                  onCustomPreview={() =>
                    onCustomPreview(item, record.documentList)
                  }
                />
              ))}
            </div>
          );
        };
        return (
          <div
            style={{ display: 'flex', justifyContent: 'flex-start', gap: 8 }}
          >
            {record.documentList?.slice(0, 2)?.map((item: IDocument) => (
              <FileItemView
                key={item.documentId}
                // className={styles.file_item}
                mode={'card'}
                modeListItemWidth={'100%'}
                width={90}
                height={90}
                originalFileName={item.originalFileName}
                documentId={item.documentId}
                snapshotUrl={item.snapshotUrl}
                showPreview={true}
                showDownload={true}
                showDelete={false}
                onCustomPreview={() =>
                  onCustomPreview(item, record.documentList)
                }
              />
            ))}
            <Popover
              styles={{ root: { zIndex: 1009 } }}
              content={renderContent()}
              placement="topRight"
              trigger="click"
              open={
                activeRecordKeyRef.current === record.id && fileViewPopoverOpen
              }
              onOpenChange={(val) => {
                if (!val) {
                  setFileViewPopoverOpen(val);
                }
              }}
            >
              {record.documentList?.length > 2 && (
                <Button
                  type="link"
                  onClick={() => {
                    activeRecordKeyRef.current = record.id;
                    setFileViewPopoverOpen(true);
                  }}
                >
                  +{record.documentList?.slice(2).length}
                </Button>
              )}
            </Popover>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        title={title}
        open={true}
        width={width}
        destroyOnClose
        maskClosable={false}
        footer={null}
        {...restProps}
      >
        <Spin spinning={loading}>
          <Table
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={list}
            size="small"
            pagination={false}
            scroll={{ y: 500 }}
          />
          <ImagePreviewGroup
            visible={imagePreviewGroupState.visible}
            items={imagePreviewGroupState.sourceImageList?.map(
              (item: ISourceImage) => item.src,
            )}
            index={imagePreviewGroupState.index}
            onClose={() => setImagePreviewGroupState({ visible: false })}
          />
        </Spin>
      </Modal>
    </>
  );
};

export default MiscellaneousHistoryModal;
