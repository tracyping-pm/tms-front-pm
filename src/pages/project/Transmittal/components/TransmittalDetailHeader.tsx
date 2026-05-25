import { transmittalLog } from '@/api/transmittal';
import { ITransmittalDetail } from '@/api/types/transmittal';
import CustomDetailHeader from '@/components/CustomDetailHeader';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import OperationLogModal, {
  IOperationLogModalState,
  initialOperationLogModalState,
} from '@/components/OperationLogModal';
import { LAYOUT_HEADER_HEIGHT } from '@/constants';
import {
  TransmittalStatusEnum,
  TransmittalStatusEnumText,
  TransmittalStatusEnumTextColor,
  TransmittalTypeEnum,
  TransmittalTypeEnumText,
} from '@/enums';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Access, history, useParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Affix, Button, Col, Row, Spin } from 'antd';
import { memo, useCallback, useState } from 'react';
import CancelTransmittalModal from './CancelTransmittalModal';
import styles from './common.less';
import ConfirmReceivedModal from './ConfirmReceivedModal';

interface ITransmittalDetailHeader {
  loading: boolean;
  detail: ITransmittalDetail;
  getDetail: () => void;
}

export default memo(function TransmittalDetailHeader({
  loading,
  detail,
  getDetail,
}: ITransmittalDetailHeader) {
  const { id: transmittalId } = useParams();

  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);

  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await transmittalLog({ id: Number(transmittalId) }).finally(
      () => {
        setOperationLogModalState({ loading: false });
      },
    );

    if (res.code === 200) {
      const list =
        res.data?.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          description: item.describe,
          operator: item.operator,
        })) ?? [];
      setOperationLogModalState({ list, open: true });
    }
  }, [transmittalId]);

  const onConfirm = (isConfirm: boolean = true) => {
    if (isConfirm) {
      setConfirmModalOpen(false);
    } else {
      setCancelModalOpen(false);
    }
    getDetail();
  };

  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            <div className={styles.header_top}>
              <div className={styles.header_top_left}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => history.back()}
                >
                  Back
                </Button>
                <span
                  style={{
                    marginLeft: 24,
                    color: TransmittalStatusEnumTextColor[detail?.status],
                  }}
                >
                  {detail?.status}
                </span>
              </div>
              <div className={styles.header_top_right}>
                <Button
                  onClick={fetchLogList}
                  loading={operationLogModalState.loading}
                >
                  Operation Log
                </Button>
                <Access
                  accessible={
                    detail.status === TransmittalStatusEnum.AWAITING_CONFIRMED
                  }
                >
                  <Button
                    onClick={() => {
                      setCancelModalOpen(true);
                    }}
                  >
                    Cancel
                  </Button>
                </Access>
                <Access
                  accessible={
                    detail.status === TransmittalStatusEnum.AWAITING_CONFIRMED
                  }
                >
                  <Button
                    type="primary"
                    onClick={() => {
                      setConfirmModalOpen(true);
                    }}
                  >
                    Confirm Received
                  </Button>
                </Access>
              </div>
            </div>
          </Affix>
          <CustomDetailHeader
            defaultExpand={true}
            titleList={[
              { label: 'Transmittal Number', value: detail?.transmittalNumber },
            ]}
            content={
              <>
                <Row>
                  <Col span={8}>
                    <ColCell
                      label="Transmittal Type"
                      value={TransmittalTypeEnumText[detail?.transmittalType]}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label={
                        detail?.transmittalType === TransmittalTypeEnum.CUSTOMER
                          ? 'Customer Name'
                          : 'Vendor Name'
                      }
                      value={
                        detail?.transmittalType === TransmittalTypeEnum.CUSTOMER
                          ? detail?.customerName
                          : detail?.vendorName
                      }
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Statistical Interval"
                      value={
                        detail?.statisticalIntervalStart &&
                        detail?.statisticalIntervalEnd
                          ? detail?.statisticalIntervalStart +
                            ' - ' +
                            detail?.statisticalIntervalEnd
                          : '-'
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={8}>
                    <ColCell
                      label="Status"
                      value={TransmittalStatusEnumText[detail?.status]}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell label="Creation Time" value={detail?.createdAt} />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Project Names"
                      value={detail?.projectNames?.join(',')}
                    />
                  </Col>
                </Row>
              </>
            }
          />
        </div>
      </Spin>

      {confirmModalOpen && (
        <ConfirmReceivedModal
          open={confirmModalOpen}
          transmittalId={Number(transmittalId)}
          onConfirm={onConfirm}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setConfirmModalOpen(false);
            },
          }}
        />
      )}
      {cancelModalOpen && (
        <CancelTransmittalModal
          open={cancelModalOpen}
          transmittalId={Number(transmittalId)}
          onConfirm={onConfirm}
          modalProps={{
            okText: 'Cancel Transmittal',
            onCancel: () => {
              setCancelModalOpen(false);
            },
          }}
        />
      )}
      <OperationLogModal
        showOperator={true}
        list={operationLogModalState.list}
        open={operationLogModalState.open}
        onConfirm={() => setOperationLogModalState({ open: false })}
        onCancel={() => setOperationLogModalState({ open: false })}
      />
    </>
  );
});
