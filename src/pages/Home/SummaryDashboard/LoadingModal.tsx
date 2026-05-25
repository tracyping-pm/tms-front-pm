import { summaryDownload, summaryDownloadPrepare } from '@/api/statistics';
import { App, Modal, Spin } from 'antd';
import dayjs from 'dayjs';
import { memo, useEffect, useRef } from 'react';

export default memo(function LoadingModal({
  params,
  hide,
}: {
  params: any;
  hide: () => void;
}) {
  const { modal } = App.useApp();
  const cancelRef = useRef<boolean>(false);

  const loadPrepare = async () => {
    const res = await summaryDownloadPrepare(params);
    if (res.code === 200 && !cancelRef.current) {
      modal.confirm({
        title: 'Data is ready',
        content: 'Data is available for download',
        okText: 'Download',
        onOk: async () => {
          const data = await summaryDownload({ spreadsheetId: res.data });
          if (data.code === 200) {
            const link = document.createElement('a');
            link.href = data.data;
            link.download = `Data Summary ${dayjs().format('YYYYMMDDhhmmss')}`;
            link.click();
            URL.revokeObjectURL(link.href);
          }
        },
      });
      hide();
    }
  };
  useEffect(() => {
    loadPrepare();
  }, []);
  return (
    <Modal
      title={`Preparing data`}
      open={true}
      okButtonProps={{
        style: { display: 'none' },
      }}
      onCancel={() => {
        cancelRef.current = true;
        hide();
      }}
      closeIcon={null}
      maskClosable={false}
    >
      <div
        style={{
          height: '86px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    </Modal>
  );
});
