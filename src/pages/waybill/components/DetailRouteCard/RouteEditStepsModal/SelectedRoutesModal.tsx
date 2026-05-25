import CustomTooltip from '@/components/CustomTooltip';
import { Modal, ModalProps, Table, TableColumnsType } from 'antd';
import { FC } from 'react';
import styles from './styles.less';

export interface ISelectedRouteListDataType {
  vid: string;
  origin: string;
  waypoint: string;
  destination: string;
}

type IProps = ModalProps & {
  open: boolean;
  data: ISelectedRouteListDataType[];
};

const SelectedRoutesModal: FC<IProps> = ({ open, data, ...restProps }) => {
  const columns: TableColumnsType<ISelectedRouteListDataType> = [
    {
      title: '',
      dataIndex: 'origin',
      ellipsis: { showTitle: false },
      width: 66,
      render: (_text, _record, index) => <span>{index + 1}</span>,
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
      ellipsis: { showTitle: false },
      onCell: (record, rowIndex = 0) => {
        let rowSpan = 1;
        let arr = data?.filter((res) => {
          return res.origin === record.origin;
        });

        if (rowIndex === 0 || data?.[rowIndex - 1]?.origin !== record?.origin) {
          rowSpan = arr.length;
        } else {
          rowSpan = 0;
        }

        return { rowSpan: rowSpan, align: 'left', valign: 'top' };
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.origin}>{record.origin}</CustomTooltip>
        );
      },
    },
    {
      title: 'Waypoint',
      dataIndex: 'waypoint',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.waypoint} placement="top">
            {record.waypoint}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      ellipsis: { showTitle: false },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.destination}>
            {record.destination}
          </CustomTooltip>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        open={open}
        title="Selected Points"
        width={1000}
        footer={null}
        maskClosable={false}
        destroyOnClose
        {...restProps}
      >
        <Table
          rootClassName={styles.selectedRoutesModal}
          rowKey="vid"
          scroll={{ y: 400 }}
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
          bordered
        />
      </Modal>
    </>
  );
};

export default SelectedRoutesModal;
