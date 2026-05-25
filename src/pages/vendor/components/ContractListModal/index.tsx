import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION } from '@/constants';
import { ContractStatusEnum, ContractStatusEnumColor } from '@/enums';
import { Badge, Modal, ModalProps, Table, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';

export interface IContractItem {
  id: number;
  contractNumber: string;
  contractStatus: string;
  startDate: string;
  endDate: string;
}
export interface IContractListModalState {
  open: boolean;
  loading: boolean;
  projectId?: number;
  contractSigner?: number;
  originData: PaginationResponse;
}

export const initialContractListModalState: IContractListModalState = {
  open: false,
  loading: false,
  originData: DEFAULT_PAGINATION,
};

const columns: TableColumnsType<IContractItem> = [
  {
    title: 'Contract Number',
    dataIndex: 'contractNumber',
    ellipsis: true,
  },
  {
    title: 'Status',
    dataIndex: 'contractStatus',
    ellipsis: true,
    render: (_, record) => {
      const status = record.contractStatus as ContractStatusEnum;
      const Content = (
        <Badge color={ContractStatusEnumColor[status]} text={status} />
      );
      return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
    },
  },
  {
    title: 'Contract Validity Period',
    dataIndex: 'description',
    ellipsis: true,
    render: (_, record) => {
      const dateRange = `${dayjs(record.startDate).format(
        'YYYY-MM-DD',
      )} - ${dayjs(record.endDate).format('YYYY-MM-DD')}`;
      return <CustomTooltip title={dateRange}>{dateRange}</CustomTooltip>;
    },
  },
];

interface IProps extends ModalProps {
  contractListModalState: IContractListModalState;
  onConfirm?: () => void;
  pageSizeChange: (v: {
    pageNum: number;
    pageSize: number;
    contractSigner: number;
    projectId: number;
  }) => void;
  originData: PaginationResponse;
}

const ContractListModal: FC<IProps> = ({
  contractListModalState,
  originData = DEFAULT_PAGINATION,
  title = 'Contract List',
  width = 720,
  pageSizeChange,
  onConfirm,
  ...restProps
}) => {
  const handleOk = () => {
    onConfirm?.();
  };

  return (
    <>
      <Modal
        title={title}
        open={contractListModalState?.open}
        width={width}
        okText="Confirm"
        destroyOnClose
        onOk={handleOk}
        maskClosable={false}
        {...restProps}
      >
        <Table
          loading={contractListModalState?.loading}
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={originData?.list}
          size="small"
          scroll={{ y: 240 }}
          pagination={{
            showSizeChanger: true,
            current: originData.pageNum,
            pageSize: originData.pageSize,
            total: originData.total,
            onChange: (page: number, pageSize: number) => {
              pageSizeChange({
                pageNum: page,
                pageSize: pageSize,
                contractSigner: contractListModalState.contractSigner!,
                projectId: contractListModalState.projectId!,
              });
            },
          }}
        />
      </Modal>
    </>
  );
};

export default ContractListModal;
