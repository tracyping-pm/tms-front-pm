import { waybillConfirmPriceResult } from '@/api/tool';
import {
  IWaybillBatchFailedDetailItem,
  IWaybillBatchSubmitOrStartResult,
} from '@/api/types/waybill';
import {
  waybillBatchStartResult,
  waybillBatchSubmitResult,
} from '@/api/waybill';
import { useRequest } from 'ahooks';
import { App, Flex, Modal, ModalProps, Progress } from 'antd';
import { FC, useEffect, useState } from 'react';
import BatchErrorModal from './BatchErrorModal';

export enum EnumBatchType {
  SUBMIT = 'SUBMIT',
  START = 'START',
  CONFIRM_PRICE = 'CONFIRM_PRICE',
}

const defaultData = {
  inProcessing: false,
  totalNum: 0,
  successNum: 0,
  failedNum: 0,
  failedDetailList: [],
};

export interface IProps extends ModalProps {
  type: EnumBatchType;
  onFinish?: () => void;
}

const BatchLockModal: FC<IProps> = ({ open, type, onFinish, ...restProps }) => {
  const { message } = App.useApp();
  const [batchErrorModalOpen, setBatchErrorModalOpen] = useState(false);
  const [percent, setPercent] = useState(0);
  const [result, setResult] =
    useState<IWaybillBatchSubmitOrStartResult>(defaultData);
  const [failedDetailList, setFailedDetailList] = useState<
    IWaybillBatchFailedDetailItem[]
  >([]);
  const serviceObj = {
    [EnumBatchType.SUBMIT]: waybillBatchSubmitResult,
    [EnumBatchType.START]: waybillBatchStartResult,
    [EnumBatchType.CONFIRM_PRICE]: waybillConfirmPriceResult,
  };

  // const service =
  //   type === EnumBatchType.SUBMIT
  //     ? waybillBatchSubmitResult
  //     : waybillBatchStartResult;

  const { run, cancel } = useRequest(serviceObj[type], {
    manual: true,
    pollingInterval: 2000,
    pollingWhenHidden: false,
    // retryCount: 3,
    onSuccess: (data) => {
      if (data.code === 200) {
        setResult(data.data);
        setFailedDetailList(data.data.failedDetailList);
      }
    },
  });

  useEffect(() => {
    const { inProcessing, totalNum, successNum, failedNum } = result;
    const resolvedNum = successNum + failedNum;
    if (totalNum > 0) {
      const _percent = Math.floor((resolvedNum / totalNum) * 100);
      console.log({ _percent });
      setPercent(_percent);
    }

    if (inProcessing === false) {
      cancel();

      // const typeText = type === EnumBatchType.SUBMIT ? 'submitted' : 'started';
      const typeTextObj = {
        [EnumBatchType.SUBMIT]: 'submitted',
        [EnumBatchType.START]: 'started ',
        [EnumBatchType.CONFIRM_PRICE]: 'confirmed',
      };
      if (failedNum > 0) {
        // 给 500 ms 延迟，方便看到 process 到 100%
        setTimeout(() => {
          setBatchErrorModalOpen(true);
          onFinish?.();
        }, 500);
        return;
      } else if (totalNum > 0 && successNum === totalNum) {
        message.success(
          `${totalNum} waybills have be ${typeTextObj[type]} successfully`,
        );

        onFinish?.();
      } else {
        // 成功了部分
        // do nothing
      }
    }
  }, [result, type]);

  useEffect(() => {
    if (open) {
      run();
    } else {
      setPercent(0);
      setResult(defaultData);
    }
  }, [open]);

  return (
    <>
      <Modal
        title={null}
        width={384}
        centered
        destroyOnClose
        maskClosable={false}
        footer={null}
        open={open}
        closable={false}
        {...restProps}
      >
        <div
          style={{
            marginBottom: '7px',
            fontSize: '14px',
            lineHeight: '22px',
            fontWeight: 400,
            color: '#000',
            textAlign: 'center',
          }}
        >
          {type === EnumBatchType.SUBMIT && 'Selected waybill being submit'}
          {type === EnumBatchType.START && 'Selected waybill being start'}
          {type === EnumBatchType.CONFIRM_PRICE &&
            'Selected waybill being confirm price'}
        </div>
        <Flex gap={10} align="center">
          <Progress
            percent={percent}
            status="active"
            showInfo={false}
            strokeColor={{ from: '#108EE9', to: '#87D068' }}
            style={{ flex: 1 }}
          />
          <span>
            {result.successNum + result.failedNum}/{result.totalNum}
          </span>
        </Flex>
      </Modal>
      <BatchErrorModal
        open={batchErrorModalOpen}
        failedDetailList={failedDetailList}
        onCancel={() => {
          setBatchErrorModalOpen(false);
        }}
      />
    </>
  );
};

export default BatchLockModal;
