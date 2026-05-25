import {
  statementReceiptOrPaymentFileList,
  statementReceiptOrPaymentList,
} from '@/api/billing';
import { materialPreview } from '@/api/common';
import { IStatementReceiptOrPaymentListItem } from '@/api/types/billing';
import { ICommonMaterial } from '@/api/types/common';
import CustomStatusButton from '@/components/CustomStatusButton';
import CustomTooltip from '@/components/CustomTooltip';
import IframeModal, {
  IIFrameModalState,
  initialIframeModalState,
} from '@/components/IframeModal';
import { CountryCurrencyEnumText } from '@/enums';
import { numberSum } from '@/utils/compute';
import { formatAmountPercentage } from '@/utils/utils';
import { EyeOutlined, FileOutlined } from '@ant-design/icons';
import { useModel, useParams } from '@umijs/max';
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
import {
  CSSProperties,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

const ReceiptHistoryModal: FC<ModalProps> = ({
  title = 'Receipt History',
  width = 560,
  ...restProps
}) => {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const { id: customerStatementId } = useParams();
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [iframeModalState, setIframeModalState] =
    useSetState<IIFrameModalState>(initialIframeModalState);
  const [list, setList] = useState<IStatementReceiptOrPaymentListItem[]>([]);
  const [materialList, setMaterialList] = useState<ICommonMaterial[]>([]);
  const [fileViewPopoverOpen, setFileViewPopoverOpen] =
    useState<boolean>(false);

  const activeRecordKeyRef = useRef<number>();
  const activeFileDriveIdRef = useRef<string>();

  const getStatementReceiptList = async () => {
    setLoading(true);
    const res = await statementReceiptOrPaymentList(
      +customerStatementId!,
    ).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      const amountList: number[] = [];
      (res.data || []).forEach((item) => {
        amountList.push(item.receiptAmount);
      });
      const total = numberSum(amountList, 2);
      setTotalAmount(Number(total));
      setList(res.data || []);
    }
  };

  const getStatementReceiptFileList = async (id: number) => {
    setLoading(true);
    const res = await statementReceiptOrPaymentFileList(id).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setMaterialList(res.data || []);
      if (res.data.length) {
        setFileViewPopoverOpen(true);
      }
    }
  };

  const onViewDrive = useCallback(async (material: ICommonMaterial) => {
    activeFileDriveIdRef.current = material.fileDriveId;
    setIframeModalState({ pending: true });
    const res = await materialPreview({
      materialId: material.fileMaterialId,
      driveFileId: material.fileDriveId,
    }).finally(() => {
      setIframeModalState({ pending: false });
    });

    if (res.code === 200) {
      setIframeModalState({
        url: res.data,
        open: true,
      });
    }
  }, []);

  useEffect(() => {
    getStatementReceiptList();
  }, []);

  const columns: TableColumnsType<IStatementReceiptOrPaymentListItem> = [
    {
      title: 'Receipt Time',
      dataIndex: 'receiptTime',
      width: 160,
    },
    {
      title: 'Receipt Amount',
      dataIndex: 'receiptAmount',
      width: 130,
      render: (_, record) => {
        const receiptAmount =
          CountryCurrencyEnumText[countryId as any] +
          formatAmountPercentage(record?.receiptAmount);
        return (
          <CustomTooltip title={receiptAmount}>{receiptAmount}</CustomTooltip>
        );
      },
    },
    {
      title: 'Receipt',
      dataIndex: 'receipt',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const renderContent = () => {
          const itemStyle: CSSProperties = {
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            fontSize: 14,
          };
          return (
            <div>
              {materialList.map((material: ICommonMaterial, index: number) => {
                return (
                  <div
                    key={index}
                    style={{
                      ...itemStyle,
                      borderBottom:
                        index === materialList?.length - 1
                          ? 0
                          : '1px solid #F5F5F5',
                    }}
                  >
                    <FileOutlined />
                    <span
                      className="ellipsis"
                      title={material.fileName}
                      style={{
                        display: 'inline-block',
                        maxWidth: 200,
                      }}
                    >
                      {material.fileName}
                    </span>
                    <CustomStatusButton
                      noStyle
                      icon={<EyeOutlined />}
                      loading={
                        iframeModalState.pending &&
                        activeFileDriveIdRef.current === material.fileDriveId
                      }
                      onClick={() => {
                        onViewDrive(material);
                      }}
                    >
                      View
                    </CustomStatusButton>
                  </div>
                );
              })}
            </div>
          );
        };
        return (
          <Popover
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
            <Button
              style={{ margin: 0, padding: 0 }}
              type="link"
              onClick={() => {
                activeRecordKeyRef.current = record.id;
                getStatementReceiptFileList(record.id);
              }}
            >
              View
            </Button>
          </Popover>
        );
      },
    },
    {
      title: 'Operator',
      dataIndex: 'updatedByAliasName',
      ellipsis: true,
      width: 100,
    },
  ];

  return (
    <>
      <Modal
        title={title}
        open={true}
        width={width}
        okText="Confirm"
        destroyOnClose
        maskClosable={false}
        footer={null}
        {...restProps}
      >
        <Spin spinning={loading}>
          <div
            style={{
              fontSize: 14,
              lineHeight: '22px',
              textAlign: 'right',
              marginBottom: 8,
            }}
          >
            Received amount :{CountryCurrencyEnumText[countryId as any]}{' '}
            {formatAmountPercentage(totalAmount)}
          </div>
          <Table
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={list}
            size="small"
            pagination={false}
            scroll={{ y: 240 }}
          />
          <IframeModal
            zIndex={999999}
            url={iframeModalState.url}
            open={iframeModalState.open}
            onCancel={() => {
              setIframeModalState({ open: false });
              setFileViewPopoverOpen(true);
            }}
          />
        </Spin>
      </Modal>
    </>
  );
};

export default ReceiptHistoryModal;
