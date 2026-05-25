import { formatAmount } from '@/utils/utils';
import { Badge, message, Popconfirm, Space, Table } from 'antd';
import { Key, useEffect, useRef, useState } from 'react';

import { faTransportationCancel, faTransportationCollect } from '@/api/tool';
import { ICapacityPoolDetail } from '@/api/types/capacity';
import CustomStatusButton from '@/components/CustomStatusButton';
import BaseCell from '@/pages/billing/ar-dashboard/components/BaseCell';
import dayjs from 'dayjs';
import { BillingStatusEnum } from '../../enum';

const { Column, ColumnGroup } = Table;
interface IProps {
  batchOperateStatus: boolean;
  originData: PaginationResponse;
  onPaginationHandle: (v: { pageNum: number; pageSize: number }) => void;
  onGetSelectedHandle: (v: { ids: number[]; options: any }) => void;
}
const TransportationTable = ({
  batchOperateStatus,
  originData = {},
  onPaginationHandle,
  onGetSelectedHandle,
}: IProps) => {
  // const access = useAccess();

  // const completedGuidance =
  //   userInfo?.currentUser?.userGuidanceMap?.ExportDownloadManage;

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [collectId, setCollectId] = useState<number>();
  const [cancelId, setCancelId] = useState<number>();

  const selectedKey = 'id';

  const selectedALL = useRef<any>([]);
  // 多选
  const onHandleSelect = (record: any, selected: any) => {
    const idx = selectedALL.current.findIndex(
      (i: any) => i[selectedKey] === record[selectedKey],
    );
    if (selected) {
      selectedALL.current.push(record);
    } else {
      selectedALL.current.splice(idx, 1);
    }
    const a = selectedALL.current.map((i: any) => i[selectedKey]);
    setSelectedRowKeys(a);
    onGetSelectedHandle?.({ ids: a, options: selectedALL.current });
  };

  const onHandleSelectAll = (
    selected: any,
    selectedRows: { current: any[] },
    changeRows: any[],
  ) => {
    if (selected) {
      selectedALL.current = selectedALL.current.concat(changeRows);
    } else {
      changeRows.forEach((i) => {
        selectedALL.current.forEach((m: any, mIndex: any) => {
          if (i[selectedKey] === m[selectedKey]) {
            selectedALL.current.splice(mIndex, 1);
          }
        });
      });
    }
    const a = selectedALL.current.map((i: any) => i[selectedKey]);
    setSelectedRowKeys(a);
    onGetSelectedHandle?.({ ids: a, options: selectedALL.current });
  };

  const onCollected = async (id: number) => {
    if (!id || batchOperateStatus) return;
    setCollectId(id);
    const payload = {
      ids: [id],
    };
    const res = await faTransportationCollect(payload).finally(() => {
      setCollectId(undefined);
    });
    if (res.code === 200) {
      message.success('Collection successful');
      setSelectedRowKeys([]);
      selectedALL.current = [];
      onPaginationHandle?.({
        pageNum: originData.pageNum!,
        pageSize: originData.pageSize!,
      });
    }
  };
  const onCancel = async (id: number) => {
    if (!id || batchOperateStatus) return;
    setCancelId(id);
    const payload = {
      ids: [id],
    };
    const res = await faTransportationCancel(payload).finally(() => {
      setCancelId(undefined);
    });
    if (res.code === 200) {
      message.success('Cancel successful');
      setSelectedRowKeys([]);
      selectedALL.current = [];
      onPaginationHandle?.({
        pageNum: originData.pageNum!,
        pageSize: originData.pageSize!,
      });
    }
  };

  useEffect(() => {
    if (!batchOperateStatus) {
      setSelectedRowKeys([]);
      selectedALL.current = [];
    }
  }, [batchOperateStatus]);

  return (
    <>
      <div className="selectedText">
        {selectedRowKeys.length ? (
          <>
            <span>{selectedRowKeys.length}</span> record is selected
          </>
        ) : null}
      </div>

      <Table<ICapacityPoolDetail>
        dataSource={originData.list}
        bordered
        rowKey={'id'}
        className="fa-transportation-table"
        scroll={{
          x: 'max-content',
          y: originData.list?.length ? 500 : undefined,
        }}
        size="small"
        rowSelection={{
          selectedRowKeys,
          onSelect: onHandleSelect,
          // @ts-ignore
          onSelectAll: onHandleSelectAll,
          getCheckboxProps: (record: any) => ({
            disabled: record.hgBillingStatus === BillingStatusEnum.CANCELLED, // Column configuration not to be checked
          }),
        }}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationHandle?.({ pageNum: page, pageSize: pageSize });
          },
        }}
      >
        {/* HG */}
        <ColumnGroup
          title={
            <BaseCell
              style={{
                backgroundColor: '#FA8C16',
                justifyContent: 'center',
              }}
              data-title="HG"
            />
          }
        >
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Company Name"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title=""
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgCompanyName"
                    align="center"
                    width={100}
                    dataIndex="hgCompanyName"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Service Type"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgServiceType"
                    align="center"
                    width={100}
                    dataIndex="hgServiceType"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Client Tag"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgClientTag"
                    align="center"
                    width={100}
                    dataIndex="hgClientTag"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="SAP Code"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Formula"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgSapCode"
                    align="center"
                    width={100}
                    dataIndex="hgSapCode"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Client Name"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgClientName"
                    align="center"
                    width={100}
                    dataIndex="hgClientName"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Invoice No"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgInvoiceNo"
                    align="center"
                    width={100}
                    dataIndex="hgInvoiceNo"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Billing Status"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Input Val"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgBillingStatus"
                    align="center"
                    width={100}
                    dataIndex="hgBillingStatus"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Billing in charge"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Input Val"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgBillingInCharge"
                    align="center"
                    width={100}
                    dataIndex="hgBillingInCharge"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Client Status"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FA8C16',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgClientStatus"
                    align="center"
                    width={100}
                    dataIndex="hgClientStatus"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Date received By client / Date Returned By Client"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgClientReceiveDate"
                    align="center"
                    width={100}
                    dataIndex="hgClientReceiveDate"
                    rowSpan={0}
                    render={(value) => {
                      return value;
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="AR/OR Recognition"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgRecognition"
                    align="center"
                    width={100}
                    dataIndex="hgRecognition"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="% Collected"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgPercentCollected"
                    align="center"
                    width={100}
                    dataIndex="hgPercentCollected"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Billed Amount(Gross of CWT) based on SI"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgBilledAmount"
                    align="center"
                    width={100}
                    dataIndex="hgBilledAmount"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="should be AR Amount"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgArAmount"
                    align="center"
                    width={100}
                    dataIndex="hgArAmount"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="should be OR Amount"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgOrAmount"
                    align="center"
                    width={100}
                    dataIndex="hgOrAmount"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Actual amount Collected"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgActualCollected"
                    align="center"
                    width={100}
                    dataIndex="hgActualCollected"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Penalties / Deductions"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgDeduction"
                    align="center"
                    width={100}
                    dataIndex="hgDeduction"
                    rowSpan={0}
                    render={(value) => {
                      return value ? formatAmount(value) : '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FADB14',
                  justifyContent: 'center',
                }}
                data-title="Variance Billed - Actual Collected"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="For checking should be 0.00"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgVbActualCollected"
                    align="center"
                    width={100}
                    dataIndex="hgVbActualCollected"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FADB14',
                  justifyContent: 'center',
                }}
                data-title="Penalties / Deductions Remarks"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgDeductionRemark"
                    align="center"
                    width={100}
                    dataIndex="hgDeductionRemark"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="CWT"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgCwt"
                    align="center"
                    width={100}
                    dataIndex="hgCwt"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="CWT %"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgPercentCwt"
                    align="center"
                    width={100}
                    dataIndex="hgPercentCwt"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Official Receipts Reference"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgReceiptRef"
                    align="center"
                    width={100}
                    dataIndex="hgReceiptRef"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Bank reference"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgBankRef"
                    align="center"
                    width={100}
                    dataIndex="hgBankRef"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Terms (Days)"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgTerm"
                    align="center"
                    width={100}
                    dataIndex="hgTerm"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Due Date"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgDueDate"
                    align="center"
                    width={100}
                    dataIndex="hgDueDate"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Date Collected"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgCollectedDate"
                    align="center"
                    width={100}
                    dataIndex="hgCollectedDate"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Interval Days"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgInterval"
                    align="center"
                    width={100}
                    dataIndex="hgInterval"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Overdue Status"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgOverdueStatus"
                    align="center"
                    width={100}
                    dataIndex="hgOverdueStatus"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Overdue Days"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Auto"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgOverdueDays"
                    align="center"
                    width={100}
                    dataIndex="hgOverdueDays"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Remarks"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgRemark"
                    align="center"
                    width={100}
                    dataIndex="hgRemark"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Invoice Date"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgInvoiceDate"
                    align="center"
                    width={100}
                    dataIndex="hgInvoiceDate"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Covered Period"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgCoveredPeriod"
                    align="center"
                    width={100}
                    dataIndex="hgCoveredPeriod"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="YEAR of Billed services"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Formula"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgBilledServiceYear"
                    align="center"
                    width={100}
                    dataIndex="hgBilledServiceYear"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Billing Date submitted to client (Soft Copy)"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgBillingDate"
                    align="center"
                    width={100}
                    dataIndex="hgBillingDate"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Billing Received Date (Soft Copy)"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgBillingReceivedDateSoft"
                    align="center"
                    width={100}
                    dataIndex="hgBillingReceivedDateSoft"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Billing Received Date (Hard Copy)"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgBillingReceivedDateHard"
                    align="center"
                    width={100}
                    dataIndex="hgBillingReceivedDateHard"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Fiberhome Account Handler"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgAccountHandler"
                    align="center"
                    width={100}
                    dataIndex="hgAccountHandler"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="No. of Days(AI-AH)"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Formula"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgDayNo"
                    align="center"
                    width={100}
                    dataIndex="hgDayNo"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Checked if within 3 days"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Formula"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgWithinThreeDays"
                    align="center"
                    width={100}
                    dataIndex="hgWithinThreeDays"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="CONCATENATE FORMULA"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Formula"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgFormula"
                    align="center"
                    width={100}
                    dataIndex="hgFormula"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="MONTH"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Formula"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgMonth"
                    align="center"
                    width={100}
                    dataIndex="hgMonth"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="YEAR"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Formula"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgYear"
                    align="center"
                    width={100}
                    dataIndex="hgYear"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="OR Reference"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgOrRef"
                    align="center"
                    width={100}
                    dataIndex="hgOrRef"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FADB14',
                  justifyContent: 'center',
                }}
                data-title="No. of  Trips billed"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgBilledTripNo"
                    align="center"
                    width={100}
                    dataIndex="hgBilledTripNo"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FADB14',
                  justifyContent: 'center',
                }}
                data-title="Accessorial / Incidental Charges"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgIncidentalCharge"
                    align="center"
                    width={100}
                    dataIndex="hgIncidentalCharge"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            rowSpan={2}
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FADB14',
                  justifyContent: 'center',
                }}
                data-title="(Subsequently billed) Total Amount If other year of BIlled services"
              />
            }
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Manual"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="hgSubsequentlyBilled"
                    align="center"
                    width={100}
                    dataIndex="hgSubsequentlyBilled"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
        </ColumnGroup>

        {/* Attachments */}
        <ColumnGroup
          title={
            <BaseCell
              style={{
                backgroundColor: '#D9F7BE',
                justifyContent: 'center',
              }}
              data-title="Attachments"
            />
          }
          rowSpan={3}
        >
          <ColumnGroup rowSpan={0}>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#389E0D',
                      justifyContent: 'center',
                    }}
                    data-title="SI Soft Copy Uploaded Link"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="attUploadLink"
                    align="center"
                    width={100}
                    dataIndex="attUploadLink"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          <ColumnGroup rowSpan={0}>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#389E0D',
                      justifyContent: 'center',
                    }}
                    data-title="Billing Summary and other attachments"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="attBillingSummary"
                    align="center"
                    width={100}
                    dataIndex="attBillingSummary"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          <ColumnGroup rowSpan={0}>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#389E0D',
                      justifyContent: 'center',
                    }}
                    data-title="OR Soft Copy"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="attOrSoftCopy"
                    align="center"
                    width={100}
                    dataIndex="attOrSoftCopy"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          <ColumnGroup rowSpan={0}>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#389E0D',
                      justifyContent: 'center',
                    }}
                    data-title="BT KPI 1-3 days uploading"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="attBtKpi"
                    align="center"
                    width={100}
                    dataIndex="attBtKpi"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
        </ColumnGroup>

        {/* Aging */}
        <ColumnGroup
          title={
            <BaseCell
              style={{
                backgroundColor: '#F5222D',
                justifyContent: 'center',
              }}
              data-title="Aging"
            />
          }
          rowSpan={1}
        >
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FFD6E7',
                  justifyContent: 'center',
                }}
                data-title="SAP encoded checking"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#780650',
                      justifyContent: 'center',
                    }}
                    data-title="SAP (AR No.)"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agSap"
                    align="center"
                    width={100}
                    dataIndex="agSap"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FFD6E7',
                  justifyContent: 'center',
                }}
                data-title=""
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#780650',
                      justifyContent: 'center',
                    }}
                    data-title="SAP Amount"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agSapAmount"
                    align="center"
                    width={100}
                    dataIndex="agSapAmount"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FFD6E7',
                  justifyContent: 'center',
                }}
                data-title=""
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#780650',
                      justifyContent: 'center',
                    }}
                    data-title="SAP Invoice Status C- cancelled N- No Y- Yes"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agSapInvoiceStatus"
                    align="center"
                    width={100}
                    dataIndex="agSapInvoiceStatus"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FFD6E7',
                  justifyContent: 'center',
                }}
                data-title=""
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#780650',
                      justifyContent: 'center',
                    }}
                    data-title="Variance If > 0 or < 0, for checking"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agVariance"
                    align="center"
                    width={100}
                    dataIndex="agVariance"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FFE7BA',
                  justifyContent: 'center',
                }}
                data-title="Billed but not yet received by client"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="from Invoice Date"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agBilledNotReceive"
                    align="center"
                    width={100}
                    dataIndex="agBilledNotReceive"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FFE7BA',
                  justifyContent: 'center',
                }}
                data-title="SAP AR INVOICE STATUS"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="SAP encoded"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agSapArInvoiceStatus"
                    align="center"
                    width={100}
                    dataIndex="agSapArInvoiceStatus"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FFE7BA',
                  justifyContent: 'center',
                }}
                data-title=""
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="SI Duplicate Checking"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agSiDuplicateCheck"
                    align="center"
                    width={100}
                    dataIndex="agSiDuplicateCheck"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#EB2F96',
                  justifyContent: 'center',
                }}
                data-title="Collection"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="DUE MONTH"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agDueMonth"
                    align="center"
                    width={100}
                    dataIndex="agDueMonth"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#EB2F96',
                  justifyContent: 'center',
                }}
                data-title=""
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="RECEIVED MONTH"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agReceivedMonth"
                    align="center"
                    width={100}
                    dataIndex="agReceivedMonth"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#EB2F96',
                  justifyContent: 'center',
                }}
                data-title=""
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="No. Of Days Overdue"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agOverdueDays"
                    align="center"
                    width={100}
                    dataIndex="agOverdueDays"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#EB2F96',
                  justifyContent: 'center',
                }}
                data-title=""
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Uniformity of Tagging"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agTaggingUniformity"
                    align="center"
                    width={100}
                    dataIndex="agTaggingUniformity"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FA8C16',
                  justifyContent: 'center',
                }}
                data-title="Billing Status"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title=""
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agBillingStatus"
                    align="center"
                    width={100}
                    dataIndex="agBillingStatus"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#000',
                  justifyContent: 'center',
                  color: '#fff',
                }}
                data-title="WW"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Formula"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agWw"
                    align="center"
                    width={100}
                    dataIndex="agWw"
                    rowSpan={0}
                    render={(value) => {
                      return value ?? '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#000',
                  justifyContent: 'center',
                  color: '#fff',
                }}
                data-title="MONTH"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#A8071A',
                      justifyContent: 'center',
                    }}
                    data-title="Formula"
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="agMonth"
                    align="center"
                    width={100}
                    dataIndex="agMonth"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
        </ColumnGroup>

        {/* COLLECTION */}
        <ColumnGroup
          title={
            <BaseCell
              style={{
                backgroundColor: '#fff',
                justifyContent: 'center',
              }}
              data-title="COLLECTION"
            />
          }
          rowSpan={1}
        >
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FADB14',
                  justifyContent: 'center',
                }}
                data-title="No of Days Overdue (based on Collection KPI)"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFC069',
                      justifyContent: 'center',
                    }}
                    data-title=""
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="colOverdueDays"
                    align="center"
                    width={100}
                    dataIndex="colOverdueDays"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FADB14',
                  justifyContent: 'center',
                }}
                data-title="No of Days Late Billed (based on Computation of Billing KPI)"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFC069',
                      justifyContent: 'center',
                    }}
                    data-title=""
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="colLateBilledDays"
                    align="center"
                    width={100}
                    dataIndex="colLateBilledDays"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FADB14',
                  justifyContent: 'center',
                }}
                data-title="Billing Reviewed by"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFC069',
                      justifyContent: 'center',
                    }}
                    data-title=""
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="colBillingReviewer"
                    align="center"
                    width={100}
                    dataIndex="colBillingReviewer"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#FADB14',
                  justifyContent: 'center',
                }}
                data-title="Collection PIC"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFC069',
                      justifyContent: 'center',
                    }}
                    data-title=""
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="colPic"
                    align="center"
                    width={100}
                    dataIndex="colPic"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>

          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#00ffff',
                  justifyContent: 'center',
                }}
                data-title="VAT Ex."
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFC069',
                      justifyContent: 'center',
                    }}
                    data-title=""
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="colVat"
                    align="center"
                    width={100}
                    dataIndex="colVat"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#00ffff',
                  justifyContent: 'center',
                }}
                data-title="CWT"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFC069',
                      justifyContent: 'center',
                    }}
                    data-title=""
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="colCwt"
                    align="center"
                    width={100}
                    dataIndex="colCwt"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
          <ColumnGroup
            title={
              <BaseCell
                style={{
                  backgroundColor: '#00ffff',
                  justifyContent: 'center',
                }}
                data-title="NET AMOUNT AFTER CWT"
              />
            }
            rowSpan={2}
          >
            <ColumnGroup rowSpan={0}>
              <ColumnGroup
                rowSpan={2}
                title={
                  <BaseCell
                    style={{
                      backgroundColor: '#FFC069',
                      justifyContent: 'center',
                    }}
                    data-title=""
                  />
                }
              >
                <ColumnGroup rowSpan={0}>
                  <Column
                    key="colNetAmount"
                    align="center"
                    width={100}
                    dataIndex="colNetAmount"
                    rowSpan={0}
                    render={(value) => {
                      return formatAmount(value);
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
        </ColumnGroup>

        {/* Uploading */}
        <ColumnGroup rowSpan={4}>
          <ColumnGroup rowSpan={0}>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup rowSpan={1} title="Upload Time">
                  <Column
                    key="uploadTime"
                    align="center"
                    width={130}
                    dataIndex="updatedAt"
                    rowSpan={0}
                    fixed="right"
                    render={(value) => {
                      return value
                        ? dayjs(value).format('YYYY-MM-DD HH:mm')
                        : '-';
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
        </ColumnGroup>
        <ColumnGroup rowSpan={4}>
          <ColumnGroup rowSpan={0}>
            <ColumnGroup rowSpan={0}>
              <ColumnGroup rowSpan={0}>
                <ColumnGroup rowSpan={1} title="Operate">
                  <Column
                    key="Operate"
                    align="center"
                    width={100}
                    rowSpan={0}
                    fixed="right"
                    render={(_, record) => {
                      return record.hgBillingStatus !==
                        BillingStatusEnum.CANCELLED ? (
                        <Space size="small">
                          <CustomStatusButton
                            disabled={
                              record.hgBillingStatus ===
                              BillingStatusEnum.COLLECTED
                            }
                            noStyle
                            loading={record.id === collectId}
                            onClick={() => {
                              onCollected(record.id);
                            }}
                          >
                            Collected
                          </CustomStatusButton>
                          <Popconfirm
                            title="Do you want to invalidate the data?"
                            onConfirm={() => {
                              onCancel(record.id);
                            }}
                            okText="Yes"
                            cancelText="No"
                          >
                            <CustomStatusButton
                              noStyle
                              loading={record.id === cancelId}
                            >
                              Cancel
                            </CustomStatusButton>
                          </Popconfirm>
                        </Space>
                      ) : (
                        <div style={{ width: '100%', textAlign: 'left' }}>
                          <Badge color={'#F0F0F0'} text="Cancel" />
                        </div>
                      );
                    }}
                  />
                </ColumnGroup>
              </ColumnGroup>
            </ColumnGroup>
          </ColumnGroup>
        </ColumnGroup>
      </Table>
    </>
  );
};

export default TransportationTable;
