import { ticketProofDelete, ticketProofList } from '@/api/claim';
import { IRefundDetail, ITicketProofListItem } from '@/api/types/claims';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { initialImagePreviewGroupState } from '@/components/OssUpload/constant';
import FileItemView from '@/components/OssUpload/FileItemView';
import {
  IDocument,
  IImagePreviewGroupState,
  IOssFile,
  ISourceImage,
} from '@/components/OssUpload/types';
import { useSetState } from 'ahooks';
import { Empty, Flex, Spin, Typography } from 'antd';
import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

const { Text } = Typography;

export interface IProps {
  detail: IRefundDetail;
  ref?: any;
}

const Proof: FC<IProps> = forwardRef(({ detail }, ref) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ITicketProofListItem[]>([]);
  const [imagePreviewGroupState, setImagePreviewGroupState] =
    useSetState<IImagePreviewGroupState>(initialImagePreviewGroupState);
  const [deletingId, setDeletingId] = useState<number>();
  const [deleting, setDeleting] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    const res = await ticketProofList({ id: detail.id }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setList(res.data);
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

  const handleDeleteOldItem = async (item: ITicketProofListItem) => {
    setDeletingId(item.id);
    setDeleting(true);

    const res = await ticketProofDelete({ id: item.id }).finally(() => {
      setDeleting(false);
    });
    if (res.code === 200) {
      fetchList();
    }
  };

  useEffect(() => {
    fetchList();
  }, [detail]);

  useImperativeHandle(ref, () => ({
    reload: () => fetchList(),
  }));

  return (
    <>
      <div
        style={{
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.02)',
          borderBottom: '1px dashed  #D9D9D9',
        }}
      >
        <div>
          <Text type="secondary">Proof</Text>
        </div>
        <div>
          <Spin spinning={loading}>
            <Flex gap={8} wrap>
              {list?.length > 0 ? (
                list?.map((item: ITicketProofListItem) => (
                  <FileItemView
                    key={item.documentId}
                    // className={styles.file_item}
                    mode={'card'}
                    modeListItemWidth={'100%'}
                    width={120}
                    height={120}
                    originalFileName={item.originalFileName}
                    documentId={item.documentId}
                    snapshotUrl={item.snapshotUrl}
                    showPreview={true}
                    showDownload={true}
                    showDelete={item.canBeDeleted}
                    loading={deleting && item.id === deletingId}
                    onDeleteTrigger={() => handleDeleteOldItem(item)}
                    onCustomPreview={() => onCustomPreview(item, list)}
                  />
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ width: '100%' }}
                />
              )}
            </Flex>
          </Spin>
        </div>
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
});

export default Proof;
