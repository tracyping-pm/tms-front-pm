import {
  ModalForm,
  ModalFormProps,
  ProFormInstance,
} from '@ant-design/pro-components';
import { App, Button, Modal, Spin, message } from 'antd';

import { useCallback, useRef } from 'react';
import styles from './index.less';

import {
  waybillCreateBatchPriceUpdateTemplate,
  waybillParseWaybillBatchPriceUpdate,
  waybillReceiveInterruptSignal,
} from '@/api/project';
import {
  ExclamationCircleFilled,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { ReactComponent as IconBatchPrice } from '../../../../../public/svg/project_batch_price.svg';

type IProjectBatchPriceUpdateModal = ModalFormProps & {
  projectId?: number | string;
  batchPriceUpdateModalOpen: boolean;
  onCancel: () => void;
};

interface IState {
  isModalOpen: boolean;
  isTipsModalOpen: boolean;
  updateLoading: boolean;
  templateLoading: boolean;
  canceling: boolean;
  templateUrl: string;
}

const ProjectBatchPriceUpdateModal = ({
  projectId,
  batchPriceUpdateModalOpen,
  onCancel,
  ...restProps
}: IProjectBatchPriceUpdateModal) => {
  const { modal } = App.useApp();
  const formRef = useRef<ProFormInstance>();

  const defaultState: IState = {
    isModalOpen: batchPriceUpdateModalOpen,
    isTipsModalOpen: false,
    updateLoading: false,
    templateLoading: false,
    canceling: false,
    templateUrl: '',
  };
  const [state, setState] = useSetState<IState>(defaultState);

  const submit = async (params: any) => {
    console.log(0, params);
  };

  const doCancelBatchPriceUpdate = async () => {
    const res = await waybillReceiveInterruptSignal({ id: Number(projectId) });
    if (res.code === 200) {
      setState({
        canceling: true,
      });
    }
  };

  const doCancel = useCallback(() => {
    if (!state.updateLoading) {
      onCancel?.();
      return;
    }
    modal.confirm({
      title: 'Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm abort update.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk() {
        doCancelBatchPriceUpdate();
      },
      onCancel() {
        // DO NOTHING
      },
    });
  }, [state.updateLoading]);

  const doEditDataHandle = async () => {
    if (!state.templateUrl) {
      setState({
        templateLoading: true,
      });
      const res = await waybillCreateBatchPriceUpdateTemplate({
        id: Number(projectId),
      });
      if (res.code === 200) {
        const url = res.data;
        setState({
          templateLoading: false,
          templateUrl: url,
        });
        window.open(url);
      }
    } else {
      window.open(state.templateUrl);
    }
  };
  const syncTemplate = async () => {
    setState({
      updateLoading: true,
    });

    const start = state.templateUrl.indexOf('/d/') + 3;
    const end = state.templateUrl.indexOf('/edit');
    const sheetId = state.templateUrl.slice(start, end);

    const res = await waybillParseWaybillBatchPriceUpdate({
      projectId: Number(projectId),
      spreadsheetId: sheetId,
    });

    if (res.code === 200) {
      const { successCount, failCount, code } = res.data;
      if (code === 0) {
        let tips: string;
        if (failCount === 0) {
          tips = 'Batch Price Update operation has been completed';
          setState({
            isModalOpen: false,
          });
          modal.success({
            title: 'Update Completed',
            content: tips,
            onOk() {
              onCancel?.();
            },
          });
        } else {
          tips = `Batch price update operation completed, with ${successCount} successes and ${failCount} failures`;
          modal.warning({
            title: 'Partial update completed',
            content: tips,
            onOk() {
              // onCancel?.();
            },
          });
        }
      } else if (code === 1) {
        message.error('waybill is updating prices in batches');
      } else if (code === 2) {
        setState({
          isModalOpen: false,
          isTipsModalOpen: false,
          updateLoading: false,
          templateLoading: false,
          canceling: false,
        });
        onCancel?.();
      } else if (code === 3) {
        message.error('Batch price update failed!');
      }
    }
    setState({
      updateLoading: false,
    });
  };
  const doSyncTemplateDataHandle = async () => {
    if (!state.templateUrl) {
      return;
    }
    modal.confirm({
      title: 'Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to synchronize template data to waybill',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: () => {
        syncTemplate();
      },
      onCancel() {
        // do nothing
      },
    });
  };

  return (
    <>
      <ModalForm
        name="project-batch-price"
        open={state.isModalOpen}
        width={480}
        title={
          <>
            Batch Price Update &nbsp;
            <QuestionCircleOutlined
              onClick={() => {
                setState({
                  isTipsModalOpen: true,
                });
              }}
            />
          </>
        }
        formRef={formRef}
        modalProps={{
          closable: !state.canceling,
          footer: !state.canceling,
          onCancel: doCancel,
          forceRender: true,
          maskClosable: false,
        }}
        onFinish={submit}
        submitter={
          state.canceling
            ? false
            : {
                render: () => {
                  return [
                    <Button
                      key="cancel"
                      onClick={() => {
                        doCancel();
                      }}
                    >
                      Cancel
                    </Button>,
                    <Button
                      key="confirm"
                      type="primary"
                      loading={state.updateLoading}
                      disabled={!state.templateUrl || state.updateLoading}
                      className={styles.templateDataBtn}
                      onClick={doSyncTemplateDataHandle}
                    >
                      {!state.updateLoading
                        ? 'Sync Template data'
                        : state.canceling
                          ? 'Canceling'
                          : 'Synchronizing'}
                    </Button>,
                  ];
                },
              }
        }
        {...restProps}
      >
        <>
          <Spin
            spinning={state.canceling}
            tip="Canceling"
            size="large"
            wrapperClassName="projectCancelLoading"
          >
            <p className={styles.batchText}>
              Please paste the data into the system-generated template and click
              Sync for batch updates
            </p>
            <Button
              icon={<IconBatchPrice />}
              className={styles.batchEditBtn}
              disabled={state.updateLoading}
              loading={state.templateLoading}
              onClick={doEditDataHandle}
            >
              Edit data in template
            </Button>
          </Spin>
        </>
      </ModalForm>
      <Modal
        width={480}
        title={'Function Description'}
        closeIcon={false}
        open={state.isTipsModalOpen}
        onOk={() => {
          // setIsTipsModalOpen(false);
          setState({
            isTipsModalOpen: false,
          });
        }}
        okText="OK"
        cancelButtonProps={{
          style: { display: 'none' },
        }}
      >
        <div>
          <p className={styles.labelTips}>
            The &ldquo;Batch Price Update&rdquo; function is designed for the
            mass updating of settlement items on waybills that are not in their
            final status
          </p>
          <ul>
            <li>
              <p className={styles.labelTips}>
                The waybill number will be used as the unique identifier to
                recognize each waybill.
              </p>
            </li>
            <li>
              <p className={styles.labelTips}>
                If any settlement item on a waybill does not meet the
                requirements, all settlement items in that row will be ignored.
                You can simply leave the settlement items that are not to be
                operated blank.
              </p>
            </li>
            <li>
              <p className={styles.labelTips}>
                Different methods represent different operations:
                &ldquo;insert&rdquo; means adding new data items without
                deleting the original data, while &ldquo;replace&rdquo; means
                deleting the existing records and using only the new data items.
              </p>
            </li>
            <li>
              <p className={styles.labelTips}>
                After completing the input, click the synchronize button, and
                the system will update the corresponding waybill information
                with the data from the template.
              </p>
            </li>
          </ul>
        </div>
      </Modal>
    </>
  );
};

export default ProjectBatchPriceUpdateModal;
