import {
  SUPPORT_OSS_PREVIEW_EXCEL,
  SUPPORT_OSS_PREVIEW_PDF,
  SUPPORT_OSS_PREVIEW_PPT,
  SUPPORT_OSS_PREVIEW_WORD,
} from '@/constants';
import { Table } from 'antd';
import { FC } from 'react';

const SupportPreviewFileTable: FC = () => {
  const dataSource = [
    {
      key: 'Word',
      fileType: 'Word',
      fileExtension: SUPPORT_OSS_PREVIEW_WORD.join(', '),
    },
    {
      key: 'PPT',
      fileType: 'PPT',
      fileExtension: SUPPORT_OSS_PREVIEW_PPT.join(', '),
    },
    {
      key: 'Excel',
      fileType: 'Excel',
      fileExtension: SUPPORT_OSS_PREVIEW_EXCEL.join(', '),
    },
    {
      key: 'PDF',
      fileType: 'PDF',
      fileExtension: SUPPORT_OSS_PREVIEW_PDF.join(', '),
    },
  ];

  const columns = [
    {
      title: 'File Type',
      dataIndex: 'fileType',
      width: 140,
      //   fixed: 'left',
    },
    {
      title: 'File Extension',
      dataIndex: 'fileExtension',
    },
  ];

  return (
    <>
      <Table
        size="small"
        pagination={false}
        columns={columns}
        dataSource={dataSource}
      />
    </>
  );
};

export default SupportPreviewFileTable;
