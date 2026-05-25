import {
  waybillBatchAbnormal,
  waybillBatchAbnormalResult,
  waybillBatchCancel,
  waybillBatchCancelResult,
  waybillBatchGoogleDriveLinkResult,
} from '@/api/waybill';
import { LoadingOutlined } from '@ant-design/icons';
import { useRequest, useSetState } from 'ahooks';
import { Button, Flex, Modal, ModalProps, Space, Spin } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';

interface IBatchItemState {
  googleUrl: string;
  inProcessing: boolean;
  completionTime: string;
}

const defaultBatchItemState: IBatchItemState = {
  googleUrl: '',
  inProcessing: false,
  completionTime: '',
};

export interface IProps extends ModalProps {
  onCancel?: () => void;
}

const BatchUpdateWaybill: FC<IProps> = ({ open, onCancel, ...restProps }) => {
  const [loading, setLoading] = useState(false);
  // const [updateState, setUpdateState] = useSetState<IBatchItemState>(
  //   defaultBatchItemState,
  // );
  const [cancelState, setCancelState] = useSetState<IBatchItemState>(
    defaultBatchItemState,
  );
  const [abnormalState, setAbnormalState] = useSetState<IBatchItemState>(
    defaultBatchItemState,
  );

  // const { run: runBatchUpdateResult, cancel: cancelBatchUpdateResult } =
  //   useRequest(waybillBatchUpdateResult, {
  //     manual: true,
  //     pollingInterval: 2000,
  //     pollingWhenHidden: false,
  //     onSuccess: (data) => {
  //       if (data.code === 200) {
  //         setUpdateState({
  //           inProcessing: data.data.inProcessing,
  //           completionTime: data.data.completionTime,
  //         });

  //         if (data.data.inProcessing === false) {
  //           cancelBatchUpdateResult();
  //         }
  //       }
  //     },
  //   });

  const { run: runBatchCancelResult, cancel: cancelBatchCancelResult } =
    useRequest(waybillBatchCancelResult, {
      manual: true,
      pollingInterval: 2000,
      pollingWhenHidden: false,
      onSuccess: (data) => {
        if (data.code === 200) {
          setCancelState({
            inProcessing: data.data.inProcessing,
            completionTime: data.data.completionTime,
          });

          if (data.data.inProcessing === false) {
            cancelBatchCancelResult();
          }
        }
      },
    });

  const { run: runBatchAbnormalResult, cancel: cancelBatchAbnormalResult } =
    useRequest(waybillBatchAbnormalResult, {
      manual: true,
      pollingInterval: 2000,
      pollingWhenHidden: false,
      onSuccess: (data) => {
        if (data.code === 200) {
          setAbnormalState({
            inProcessing: data.data.inProcessing,
            completionTime: data.data.completionTime,
          });

          if (data.data.inProcessing === false) {
            cancelBatchAbnormalResult();
          }
        }
      },
    });
  const init = async () => {
    setLoading(true);
    const res = await waybillBatchGoogleDriveLinkResult().finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      // setUpdateState({
      //   googleUrl: res.data.batchUpdateUrl,
      //   inProcessing: res.data.updateProcessing,
      //   completionTime: res.data.updateCompleteTime,
      // });

      setCancelState({
        googleUrl: res.data.batchCancelUrl,
        inProcessing: res.data.cancelProcessing,
        completionTime: res.data.cancelCompleteTime,
      });

      setAbnormalState({
        googleUrl: res.data.batchAbnormalUrl,
        inProcessing: res.data.abnormalProcessing,
        completionTime: res.data.abnormalCompleteTime,
      });
    }
  };

  // const syncFromSheetByUpdate = useCallback(async () => {
  //   const { inProcessing } = updateState;
  //   if (inProcessing) {
  //     return;
  //   }

  //   setUpdateState({
  //     inProcessing: true,
  //   });
  //   const res = await waybillBatchUpdate();
  //   if (res.code === 200) {
  //     runBatchUpdateResult();
  //   }
  // }, [updateState]);

  const syncFromSheetByCancel = useCallback(async () => {
    const { inProcessing } = cancelState;
    if (inProcessing) {
      return;
    }

    setCancelState({
      inProcessing: true,
    });
    const res = await waybillBatchCancel();
    if (res.code === 200) {
      runBatchCancelResult();
    }
  }, [cancelState]);

  const syncFromSheetByAbnormal = useCallback(async () => {
    const { inProcessing } = abnormalState;
    if (inProcessing) {
      return;
    }

    setAbnormalState({
      inProcessing: true,
    });
    const res = await waybillBatchAbnormal();
    if (res.code === 200) {
      runBatchAbnormalResult();
    }
  }, [abnormalState]);

  useEffect(() => {
    if (open) {
      init();
    } else {
    }
  }, [open]);

  return (
    <>
      <Modal
        title={'Batch Update Waybills Information'}
        width={780}
        open={open}
        centered
        destroyOnClose
        maskClosable={false}
        footer={null}
        onCancel={() => onCancel?.()}
        {...restProps}
      >
        <Spin spinning={loading}>
          <ul style={{ marginLeft: '-30px' }}>
            <li>
              This feature allows batch updates of waybill information. Specific
              update content is defined in the attached sheet Note: Only
              waybills in the following statuses can be updated：Planing,
              Pending, in Transit
            </li>

            <li>Sheet 1: Can set corresponding waybills to Canceled status</li>
            <li>Sheet 2: Can set corresponding waybills to Abnormal status</li>
          </ul>
          <Flex gap={20} align="center" justify="center">
            {/* <Space style={{ width: '195px' }} size={12} direction="vertical">
              <Button
                style={{ width: '100%', height: '66px' }}
                onClick={() => {
                  window.open(updateState.googleUrl, '_blank');
                }}
              >
                <Flex vertical>
                  <div>Edit info. in </div>
                  <div>Template(Update) </div>
                </Flex>
              </Button>

              <Button
                style={{ width: '100%', height: '66px' }}
                type="primary"
                onClick={syncFromSheetByUpdate}
              >
                <Flex vertical>
                  <div>Sync from Sheet</div>
                  {updateState.inProcessing === false &&
                    updateState.completionTime && (
                      <div>{updateState.completionTime}</div>
                    )}
                </Flex>
                {updateState.inProcessing && (
                  <LoadingOutlined style={{ fontSize: '18px' }} />
                )}
              </Button>
            </Space> */}

            <Space style={{ width: '195px' }} size={12} direction="vertical">
              <Button
                style={{ width: '100%', height: '66px' }}
                onClick={() => {
                  window.open(cancelState.googleUrl, '_blank');
                }}
              >
                <Flex vertical>
                  <div>Edit info. in </div>
                  <div>Template(Cancel) </div>
                </Flex>
              </Button>

              <Button
                style={{ width: '100%', height: '66px' }}
                type="primary"
                onClick={syncFromSheetByCancel}
              >
                <Flex vertical>
                  <div>Sync from Sheet</div>
                  {cancelState.inProcessing === false &&
                    cancelState.completionTime && (
                      <div>{cancelState.completionTime}</div>
                    )}
                </Flex>
                {cancelState.inProcessing && (
                  <LoadingOutlined style={{ fontSize: '18px' }} />
                )}
              </Button>
            </Space>

            <Space style={{ width: '195px' }} size={12} direction="vertical">
              <Button
                style={{ width: '100%', height: '66px' }}
                onClick={() => {
                  window.open(abnormalState.googleUrl, '_blank');
                }}
              >
                <Flex vertical>
                  <div>Edit info. in </div>
                  <div>Template(Abnormal) </div>
                </Flex>
              </Button>

              <Button
                style={{ width: '100%', height: '66px' }}
                type="primary"
                onClick={syncFromSheetByAbnormal}
              >
                <Flex vertical>
                  <div>Sync from Sheet</div>
                  {abnormalState.inProcessing === false &&
                    abnormalState.completionTime && (
                      <div>{abnormalState.completionTime}</div>
                    )}
                </Flex>
                {abnormalState.inProcessing && (
                  <LoadingOutlined style={{ fontSize: '18px' }} />
                )}
              </Button>
            </Space>
          </Flex>
        </Spin>
      </Modal>
    </>
  );
};

export default BatchUpdateWaybill;
