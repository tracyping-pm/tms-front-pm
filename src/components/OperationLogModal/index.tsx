import { Modal, ModalProps, Table, TableColumnsType } from 'antd';
import { FC } from 'react';
import CustomTooltip from '../CustomTooltip';

export interface ILogItem {
  id: number;
  createdAt: string;
  description: string;
  operator?: string;
}
export interface IOperationLogModalState {
  open: boolean;
  loading: boolean;
  list: ILogItem[];
}

export const initialOperationLogModalState: IOperationLogModalState = {
  open: false,
  loading: false,
  list: [],
};

interface IProps extends ModalProps {
  list: ILogItem[];
  showOperator?: boolean;
  onConfirm?: () => void;
}

const OperationLogModal: FC<IProps> = ({
  open,
  title = 'Operation Log',
  showOperator = false,
  list = [],
  width = 834,
  onConfirm,
  ...restProps
}) => {
  const columns: TableColumnsType<ILogItem> = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      width: showOperator ? 232 : 328,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const description = record?.description;
        return (
          <CustomTooltip title={description}>
            {description ? description : '-'}
          </CustomTooltip>
        );
      },
    },
  ];

  const operatorColumns: TableColumnsType<ILogItem> = [
    ...columns,
    {
      title: 'Operator',
      dataIndex: 'operator',
      ellipsis: true,
      width: 232,
    },
  ];

  const handleOk = () => {
    onConfirm?.();
  };

  return (
    <>
      <Modal
        title={title}
        open={open}
        width={width}
        okText="Confirm"
        destroyOnClose
        onOk={handleOk}
        maskClosable={false}
        footer={null}
        {...restProps}
      >
        <Table
          rowKey={(record) => record.id}
          columns={showOperator ? operatorColumns : columns}
          dataSource={list}
          size="small"
          pagination={false}
          scroll={{ y: 240 }}
        />
      </Modal>
    </>
  );
};

export default OperationLogModal;
