import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Button, message } from 'antd';

import { useEffect, useRef } from 'react';
import styles from './common.less';

import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
} from '@ant-design/icons';
import { useSetState } from 'ahooks';

import { ReactComponent as IconBatchProce } from '../../../../public/svg/project_batch_price.svg';

import { IListWaybillBatchCreateStatus } from '@/api/types/waybill';
import {
  batchWaybillImport,
  createBatchWaybillCreateTemplate,
  listWaybillBatchCreateStatus,
} from '@/api/waybill';
import { BatchCreateWaybillsStatus } from '@/enums';

type IBatchCreateWaybillsModal = ModalFormProps & {
  open: boolean;
  waybillTemplateUrl: string;
};

interface IState {
  updateLoading: boolean;
  templateLoading: boolean;
  templateUrl: string;
  statusData: IListWaybillBatchCreateStatus | null;
}

const BatchCreateWaybillsModal = ({
  width = 928,
  open,
  waybillTemplateUrl,
  modalProps,
  ...restProps
}: IBatchCreateWaybillsModal) => {
  const time = useRef<NodeJS.Timeout>();
  const formRef = useRef<ProFormInstance>();

  const defaultState: IState = {
    updateLoading: false,
    templateLoading: false,
    templateUrl: waybillTemplateUrl,
    statusData: null,
  };
  const [state, setState] = useSetState<IState>(defaultState);

  const getCheckStatus = async () => {
    const handle = async () => {
      const res = await listWaybillBatchCreateStatus();

      if (res.code === 200) {
        const o = res.data;
        setState({
          statusData: o,
        });
        if (o?.importStatus === BatchCreateWaybillsStatus.IMPORTING) {
          time.current = setTimeout(handle, 5 * 1000);
        } else {
          clearTimeout(time.current);
          return;
        }
      }
    };

    handle();
  };

  const doCheackStatue = async () => {
    const res = await listWaybillBatchCreateStatus();
    if (res.code === 200) {
      if (res.data?.importStatus === BatchCreateWaybillsStatus.IMPORTING) {
        message.warning('Importing, please wait a moment');
        return true;
      }
      return false;
    }
  };

  const doEditDataHandle = async () => {
    setState({
      templateLoading: true,
    });
    if (await doCheackStatue()) {
      setState({
        templateLoading: false,
      });
      return;
    }
    if (!state.templateUrl) {
      const res = await createBatchWaybillCreateTemplate();

      if (res.code === 200) {
        const url = res.data;

        setState({
          templateLoading: false,
          templateUrl: url,
        });
        window.open(url);
      } else {
        setState({
          templateLoading: false,
        });
      }
    } else {
      setState({
        templateLoading: false,
      });
      window.open(state.templateUrl);
    }
  };

  const syncTemplate = async () => {
    setState({
      updateLoading: true,
    });

    const res = await batchWaybillImport();

    if (res.code === 200) {
      message.success('Operation successful!');
      // 轮询是否导入完成
      getCheckStatus();
    }
    setState({
      updateLoading: false,
    });
  };
  const doSyncTemplateDataHandle = async () => {
    if (await doCheackStatue()) return;
    if (!state.templateUrl) return;

    syncTemplate();
  };

  useEffect(() => {
    if (open) {
      getCheckStatus();
    } else {
      clearTimeout(time.current);
    }
    return () => {
      clearTimeout(time.current);
    };
  }, [open]);

  return (
    <>
      <ModalForm
        name="batch-create-waybill"
        open={open}
        width={width}
        title={'Batch Create Waybills'}
        formRef={formRef}
        modalProps={{
          forceRender: true,
          maskClosable: false,
          styles: {
            body: {
              borderTop: '1px solid #eff1f4',
              paddingTop: 24,
            },
          },
          ...modalProps,
        }}
        submitter={{
          render: () => {
            return [
              <Button
                key="confirm"
                type="primary"
                loading={state.updateLoading}
                disabled={!state.templateUrl || state.updateLoading}
                onClick={doSyncTemplateDataHandle}
              >
                Sync data
              </Button>,
            ];
          },
        }}
        {...restProps}
      >
        <>
          <div className={styles.batchReason}>
            {state.statusData?.importStatus ===
              BatchCreateWaybillsStatus.IMPORTING && (
              <p className={styles.batchText}>
                <LoadingOutlined style={{ color: '#52C41A' }} /> Importing,
                please do not operate the waybills in the sheet.
              </p>
            )}
            {state.statusData?.importStatus ===
              BatchCreateWaybillsStatus.SUCCESS && (
              <p className={styles.batchText}>
                <CheckCircleFilled style={{ color: '#52C41A' }} /> Last import
                result: Data import of {state.statusData?.importNumber} records
                was successful. {state.statusData?.importTime}
              </p>
            )}
            {state.statusData?.importStatus ===
              BatchCreateWaybillsStatus.FAILURE && (
              <p className={styles.batchText}>
                <CloseCircleFilled style={{ color: '#F5222D' }} /> Last import
                result: lmport failed.{state.statusData?.importTime}
              </p>
            )}
          </div>

          <Button
            icon={<IconBatchProce />}
            className={styles.batchEditBtn}
            disabled={state.updateLoading}
            loading={state.templateLoading}
            onClick={doEditDataHandle}
          >
            Edit data in template
          </Button>
          <div style={{ marginBottom: 24 }}>
            <p className={styles.batchText}>
              1. Fields marked with &quot;*&quot; are mandatory; those without
              &quot;*&quot; are optional;
            </p>
            <p className={styles.batchText}>
              2. Origin and destination addresses must include the province,
              city, district, and detailed address. Failure to provide addresses
              that Google Maps can locate may result in import failure;
            </p>
            <p className={styles.batchText}>
              3. If the origin and destination match a route under this project,
              a standard waybill will be created;
            </p>
            <p className={styles.batchText}>
              4. Carrier information should include certified vehicles, and the
              truck type must have an associated price;
            </p>
            <p className={styles.batchText}>
              5. Either leave all the carrier information blank or fill it all
              out;
            </p>
            <p className={styles.batchText}>
              6. Import failure may occur with duplicate rows.
            </p>
          </div>
        </>
      </ModalForm>
    </>
  );
};

export default BatchCreateWaybillsModal;
