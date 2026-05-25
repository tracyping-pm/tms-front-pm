import { statementCancelledInvoiceList } from '@/api/billing';
import { IStatementCancelledListItem } from '@/api/types/billing';
import { ICommonMaterial } from '@/api/types/common';
import CommonFileItem from '@/components/CommonFileItem';
import CustomTooltip from '@/components/CustomTooltip';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { initialImagePreviewGroupState } from '@/components/OssUpload/constant';
import {
  IImagePreviewGroupState,
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

const CancelledInvoiceModal: FC<ModalProps> = ({
  width = 752,
  ...restProps
}) => {
  const [imagePreviewGroupState, setImagePreviewGroupState] =
    useSetState<IImagePreviewGroupState>(initialImagePreviewGroupState);
  const { id: customerStatementId } = useParams();
  const [loading, setLoading] = useState(true);
  // const [downloadPending, setDownloadPending] = useState(false);
  const [list, setList] = useState<IStatementCancelledListItem[]>([]);
  const [fileViewPopoverOpen, setFileViewPopoverOpen] =
    useState<boolean>(false);
  const activeRecordKeyRef = useRef<string | number>();
  const getStatementReceiptList = async () => {
    setLoading(true);
    const res = await statementCancelledInvoiceList({
      id: +customerStatementId!,
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setList(res.data || []);
    }
  };

  // const onCustomPreview = (documentList: ICommonMaterial[]) => {
  //   setImagePreviewGroupState({
  //     sourceImageList: [],
  //   });

  //   const _documentList = documentList?.map((item) => {
  //     return {
  //       documentId: item.fileMaterialId,
  //       src: item.fileThumbnailUrl,
  //     };
  //   });
  //   setImagePreviewGroupState({
  //     visible: true,
  //     sourceImageList: _documentList,
  //   });
  // };
  // const onCustomPreview = (
  //   material: ICommonMaterial,
  //   documentList: ICommonMaterial[],
  // ) => {
  //   console.log(1111);
  //   const index = lodash.findIndex(
  //     documentList,
  //     (v) => v.fileMaterialId === material.fileMaterialId,
  //   );
  //   setImagePreviewGroupState({
  //     index,
  //     visible: true,
  //   });
  // };
  // const handleDownLoad = async (documentList: ICommonMaterial[]) => {
  //   setDownloadPending(true);
  //   const requestList = documentList?.map((item) => {
  //     const payload = {
  //       materialId: item.fileMaterialId,
  //       driveFileId: item.fileDriveId,
  //       fileName: item.fileName,
  //     };
  //     return materialFile(payload);
  //   });
  //   Promise.all(requestList)
  //     .then((res) => {
  //       res.forEach((item, index) => {
  //         if (item.code === 200) {
  //           const link = document.createElement('a');
  //           link.href = item.data;
  //           link.download = `${documentList[index]?.fileName}.${documentList[index]?.fileType}`;

  //           link.click();
  //           URL.revokeObjectURL(link.href);
  //         }
  //       });
  //     })
  //     .catch((e) => {
  //       console.log(e);
  //     })
  //     .finally(() => {
  //       setDownloadPending(false);
  //     });
  // };

  useEffect(() => {
    getStatementReceiptList();
  }, []);

  const columns: TableColumnsType<IStatementCancelledListItem> = [
    {
      title: 'Time',
      dataIndex: 'updatedAt',
      width: 160,
    },
    {
      title: 'Operator',
      dataIndex: 'operator',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Cancelled Invoice No.',
      dataIndex: 'invoiceNumberList',

      render: (_, record) => {
        const { invoiceNumberList } = record;
        const numberList = invoiceNumberList?.map((item) => {
          return item.invoiceNumber;
        });
        const content = () => {
          return <>{numberList.join(', ')}</>;
        };
        return <CustomTooltip title={content()}>{content()}</CustomTooltip>;
      },
    },
    {
      title: 'Cancelled Invoice',
      width: 200,
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
              {record.materialVoList
                ?.slice(2)
                ?.map((material: ICommonMaterial) => (
                  <CommonFileItem
                    // className={styles.file_item}
                    width={60}
                    height={60}
                    key={material.fileMaterialId}
                    thumbnail={material.fileThumbnailUrl}
                    fileType={material.fileType}
                    fileName={material.fileName}
                    materialId={material.fileMaterialId}
                    driveFileId={material.fileDriveId}
                    fileMimeType={material.fileMimeType}
                    showDelete={false}
                    showIconText={false}
                    // onCustomPreview={() =>
                    //   onCustomPreview(material, record.materialVoList)
                    // }
                  />
                ))}
            </div>
          );
        };
        return (
          <div
            style={{ display: 'flex', justifyContent: 'flex-start', gap: 8 }}
          >
            {record.materialVoList
              ?.slice(0, 2)
              ?.map((material: ICommonMaterial) => (
                <CommonFileItem
                  // className={styles.file_item}
                  width={60}
                  height={60}
                  key={material.fileMaterialId}
                  thumbnail={material.fileThumbnailUrl}
                  fileType={material.fileType}
                  fileName={material.fileName}
                  materialId={material.fileMaterialId}
                  driveFileId={material.fileDriveId}
                  fileMimeType={material.fileMimeType}
                  showDelete={false}
                  showIconText={false}
                  // onCustomPreview={() =>
                  //   onCustomPreview(material, record.materialVoList)
                  // }
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
              {record.materialVoList?.length > 2 && (
                <Button
                  type="link"
                  onClick={() => {
                    activeRecordKeyRef.current = record.id;
                    setFileViewPopoverOpen(true);
                  }}
                >
                  +{record.materialVoList?.slice(2).length}
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
        title={'Cancelled Invoice'}
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
            onClose={() =>
              setImagePreviewGroupState({ visible: false, sourceImageList: [] })
            }
          />
        </Spin>
      </Modal>
    </>
  );
};

export default CancelledInvoiceModal;
