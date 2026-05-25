import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Button, message, Skeleton, Spin } from 'antd';

import { useEffect, useRef } from 'react';
import styles from './index.less';

import { useSetState } from 'ahooks';

import {
  faTransportationImportInfo,
  faTransportationSync,
  faTransportationSyncStatus,
} from '@/api/tool';
import { ITransportationImportInfo } from '@/api/types/tool';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

type IImportModal = ModalFormProps & {
  open: boolean;
  refresh: () => void;
};

interface IState {
  syncStatus: boolean;
  templateLoading: boolean;
  importInfoLoading: boolean;
  templateUrl: string;
  resultInfo: ITransportationImportInfo | null;
}

let controller: AbortController | undefined;
let openStatus = false;
const ImportModal = ({
  width = 928,
  open,
  modalProps,
  refresh,
  ...restProps
}: IImportModal) => {
  const time = useRef<NodeJS.Timeout>();
  const formRef = useRef<ProFormInstance>();

  const defaultState: IState = {
    syncStatus: false,
    importInfoLoading: false,
    templateLoading: false,
    templateUrl: '',
    resultInfo: null,
  };

  const [state, setState] = useSetState<IState>(defaultState);

  const startSyncRef = useRef<boolean>(false);
  const getImportInfo = async () => {
    setState({
      importInfoLoading: true,
    });
    startSyncRef.current = false;

    const res = await faTransportationImportInfo();
    setState({
      importInfoLoading: false,
    });
    if (res.code === 200) {
      const o = res.data;
      setState({
        resultInfo: o,
        templateUrl: o.templateSpreadsheetUrl,
      });
    }
  };

  const doCheckSyncStatue = async () => {
    const handle = async () => {
      if (controller) {
        controller?.abort?.();
      }
      controller = new AbortController();
      const { signal } = controller;
      const res = await faTransportationSyncStatus(signal);
      if (res.code === 200) {
        controller = undefined;
        setState({
          syncStatus: res.data,
        });
        if (res.data) {
          time.current = setTimeout(handle, 5 * 1000);
        } else {
          if (startSyncRef.current) {
            refresh?.();
          }

          getImportInfo();
          clearTimeout(time.current);
        }
      }
    };
    if (openStatus) {
      handle();
    }
  };

  const doEditDataHandle = async () => {
    if (state.templateUrl) {
      setState({
        templateLoading: false,
      });
      window.open(state.templateUrl);
    } else {
      message.warning('No templates available at the moment');
    }
  };

  const syncTemplate = async () => {
    setState({
      syncStatus: true,
    });
    startSyncRef.current = true;
    const res = await faTransportationSync();
    if (res.code === 200) {
      message.success('Operation successful!');
      doCheckSyncStatue();
    } else {
      setState({
        syncStatus: false,
      });
      startSyncRef.current = false;
    }
  };

  const doSyncTemplateDataHandle = async () => {
    if (!state.templateUrl) return;
    syncTemplate();
  };

  useEffect(() => {
    openStatus = open;
    time.current = undefined;
    setState({
      importInfoLoading: true,
    });
    if (open) {
      doCheckSyncStatue();
    } else {
      setState(defaultState);
      clearTimeout(time.current);
    }

    return () => {
      if (controller) {
        controller?.abort?.();
      }
      clearTimeout(time.current);
    };
  }, [open]);

  useEffect(() => {
    if (!time.current) {
      getImportInfo();
    }
  }, [time.current]);

  return (
    <>
      <ModalForm
        name="fa-import-records"
        open={open}
        width={width}
        title={'Import Records'}
        formRef={formRef}
        modalProps={{
          forceRender: true,
          maskClosable: false,

          ...modalProps,
        }}
        submitter={{
          render: () => {
            return [
              <Button
                key="confirm"
                type="primary"
                loading={state.syncStatus}
                disabled={!state.templateUrl || state.syncStatus}
                onClick={doSyncTemplateDataHandle}
              >
                {state.syncStatus ? 'Data import in progress' : 'Sync data'}
              </Button>,
            ];
          },
        }}
        {...restProps}
      >
        <>
          <Spin spinning={state.importInfoLoading}>
            <Skeleton loading={state.importInfoLoading} paragraph={{ rows: 1 }}>
              {state.resultInfo?.lastResult === null ? null : (
                <div className={styles.reason}>
                  <div>{state.resultInfo?.lastImportTime}</div>
                  <div>
                    Import result:
                    {state.resultInfo?.lastResult ? (
                      <>
                        <CheckCircleFilled
                          style={{ color: '#52C41A', margin: '0 10px 0 ' }}
                        />
                        Successfully imported {state.resultInfo?.lastSuccessNum}
                        &nbsp;data , the template is cleared of successful data.
                      </>
                    ) : (
                      <>
                        <CloseCircleFilled
                          style={{ color: '#FF4D4F', margin: '0 10px 0 ' }}
                        />
                        Import failed, the template retains the failed data.
                      </>
                    )}
                  </div>
                </div>
              )}
            </Skeleton>
            <Button
              className={styles.editBtn}
              loading={state.templateLoading}
              onClick={doEditDataHandle}
            >
              Edit data in template
            </Button>

            <div className={styles.importTips}>
              <div>Tips:</div>
              <ul>
                <li>
                  The system validates whether the `BillingStatus` value is
                  correct.
                </li>
                <li>The system checks for the correctness of dates.</li>
                <li>
                  If any single data entry fails, the entire import process will
                  fail.
                </li>
                <li>
                  Should the import fail, please ensure that all fields are
                  correctly filled out.
                </li>
              </ul>
            </div>
          </Spin>
        </>
      </ModalForm>
    </>
  );
};

export default ImportModal;
