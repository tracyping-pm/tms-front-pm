import {
  claimBatchCreateImport,
  getClaimBatchCreateResult,
  getClaimBatchCreateSpreadsheetUrl,
} from '@/api/claim';
import type { IClaimBatchCreateResult } from '@/api/types/claims';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { App, Button, Flex, Modal, ModalProps, Space, Typography } from 'antd';
import type { FC, ReactNode } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import styles from './index.less';

const { Text, Title } = Typography;

export interface BatchCreateClaimTicketsModalProps
  extends Omit<ModalProps, 'open' | 'onCancel'> {
  open: boolean;
  onCancel?: () => void;
  /** Called once when a batch import finishes (after Sync, when no longer in processing). */
  onSuccess?: () => void;
}

interface IState {
  updateLoading: boolean;
  templateLoading: boolean;
  templateUrl: string;
  statusData: IClaimBatchCreateResult | null;
}

const BatchCreateClaimTicketsModal: FC<BatchCreateClaimTicketsModalProps> = ({
  open,
  onCancel,
  onSuccess,
  ...restProps
}) => {
  const { message } = App.useApp();
  const time = useRef<ReturnType<typeof setTimeout>>();
  const syncAwaitingTerminalRef = useRef(false);

  const defaultState: IState = {
    updateLoading: false,
    templateLoading: false,
    templateUrl: '',
    statusData: null,
  };
  const [state, setState] = useSetState<IState>(defaultState);

  const getCheckStatus = async () => {
    const handle = async () => {
      try {
        const res = await getClaimBatchCreateResult();

        if (res.code === 200 && res.data) {
          const o = res.data;
          setState({
            statusData: o,
          });
          if (o.inProcessing) {
            time.current = setTimeout(handle, 5 * 1000);
          } else {
            clearTimeout(time.current);
            if (syncAwaitingTerminalRef.current) {
              syncAwaitingTerminalRef.current = false;
              onSuccess?.();
            }
          }
          return;
        }

        if (syncAwaitingTerminalRef.current) {
          syncAwaitingTerminalRef.current = false;
        }
        if (res.code !== 200) {
          message.error(res.msg ?? 'Failed to load batch create status');
        } else {
          message.error('Failed to load batch create status');
        }
      } catch {
        if (syncAwaitingTerminalRef.current) {
          syncAwaitingTerminalRef.current = false;
        }
        message.error('Failed to load batch create status');
      }
    };

    handle();
  };

  const isImportingBusy = async () => {
    try {
      const res = await getClaimBatchCreateResult();
      if (res.code === 200 && res.data) {
        if (res.data.inProcessing) {
          message.warning('Importing, please wait a moment');
          return true;
        }
        return false;
      }
      return false;
    } catch {
      return false;
    }
  };

  const doEditDataHandle = async () => {
    setState({
      templateLoading: true,
    });
    try {
      if (await isImportingBusy()) {
        return;
      }
      if (!state.templateUrl) {
        const res = await getClaimBatchCreateSpreadsheetUrl();

        if (res.code === 200 && res.data?.spreadsheetUrl) {
          const url = res.data.spreadsheetUrl;

          setState({
            templateUrl: url,
          });
          window.open(url);
        } else {
          message.error(res.msg ?? 'Failed to get spreadsheet URL');
        }
      } else {
        window.open(state.templateUrl);
      }
    } catch {
      message.error('Failed to get spreadsheet URL');
    } finally {
      setState({
        templateLoading: false,
      });
    }
  };

  const syncTemplate = async () => {
    setState({
      updateLoading: true,
    });
    try {
      const res = await claimBatchCreateImport();

      if (res.code === 200) {
        message.success('Operation successful!');
        syncAwaitingTerminalRef.current = true;
        getCheckStatus();
      } else {
        message.error(res.msg ?? 'Import request failed');
      }
    } catch {
      message.error('Import request failed');
    } finally {
      setState({
        updateLoading: false,
      });
    }
  };

  const doSyncTemplateDataHandle = async () => {
    if (await isImportingBusy()) return;
    if (!state.templateUrl) return;

    syncTemplate();
  };

  useEffect(() => {
    if (open) {
      syncAwaitingTerminalRef.current = false;
      getCheckStatus();
    } else {
      clearTimeout(time.current);
    }
    return () => {
      clearTimeout(time.current);
    };
  }, [open]);

  const helpText = useMemo(() => {
    return [
      `* The results of the batch claim ticket creation will be displayed in the "Create Result" column and`,
      `  also within this pop-up window.`,
      `* If any single record fails, the entire creation process will fail.`,
    ].join('\n');
  }, []);

  const lastRow = useMemo(() => {
    const d = state.statusData;
    const processing = d?.inProcessing === true;
    const isSuccess = d?.lastImportResult === true;
    const isFailure = d?.lastImportResult === false;

    let detail: ReactNode = '—';
    if (processing) {
      detail = 'Importing, please do not operate the rows in the sheet.';
    } else if (isSuccess || isFailure) {
      const text = [d?.lastImportResultDesc, d?.lastImportTime]
        .filter(Boolean)
        .join(' ');
      detail = text || '—';
    } else {
      detail = 'No batch import has been run yet.';
    }

    return (
      <Flex align="flex-start" gap={8} className={styles.resultRow}>
        <Text className={styles.resultLabel}>Last Creation Result:</Text>
        <span className={styles.resultIconWrap}>
          {processing ? (
            <LoadingOutlined className={styles.resultIcon} />
          ) : isSuccess ? (
            <CheckCircleFilled
              className={`${styles.resultIcon} ${styles.resultIconSuccess}`}
            />
          ) : isFailure ? (
            <CloseCircleFilled
              className={`${styles.resultIcon} ${styles.resultIconFailure}`}
            />
          ) : (
            <Text type="secondary">—</Text>
          )}
        </span>
        <Text type="secondary" className={styles.resultText}>
          {detail}
        </Text>
      </Flex>
    );
  }, [state.statusData]);

  return (
    <Modal
      title={
        <Title level={5} className={styles.title}>
          Batch Create Tickets
        </Title>
      }
      open={open}
      destroyOnClose
      maskClosable={false}
      onCancel={() => onCancel?.()}
      width={760}
      footer={
        <Space size={8} className={styles.footerActions}>
          <Button onClick={() => onCancel?.()}>Cancel</Button>
          <Button
            type="primary"
            loading={state.updateLoading}
            disabled={
              !state.templateUrl ||
              state.updateLoading ||
              state.statusData?.inProcessing === true
            }
            onClick={doSyncTemplateDataHandle}
          >
            Sync Data
          </Button>
        </Space>
      }
      {...restProps}
    >
      <div className={styles.body}>
        <Flex justify="start" className={styles.topActions}>
          <Button
            type="primary"
            className={styles.primaryAction}
            loading={state.templateLoading}
            disabled={state.updateLoading}
            onClick={doEditDataHandle}
          >
            Edit Data in Template
          </Button>
        </Flex>

        <div className={styles.helpPanel}>
          <Text className={styles.helpText}>{helpText}</Text>
        </div>

        <div className={styles.resultPanel}>{lastRow}</div>
      </div>
    </Modal>
  );
};

export default BatchCreateClaimTicketsModal;
