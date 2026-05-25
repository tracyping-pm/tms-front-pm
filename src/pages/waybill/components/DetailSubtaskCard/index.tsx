import { subtaskCreate } from '@/api/subtask';
import { SubtaskCreateParams } from '@/api/types/subtask';
import { IWaybillBaseInfoData } from '@/api/types/waybill';
import { WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { WaybillFinancialStatusEnum, WaybillStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import SubtaskList from '@/pages/project/Subtask/List';
import SubtaskAddModal from '@/pages/project/Subtask/components/SubtaskAddModal';
import { EVENT_SUBTASK_LIST_RELOAD } from '@/pages/project/Subtask/events';
import { StateContext } from '@/pages/waybill/WaybillDetail/store';
import DetailCard from '@/pages/waybill/components/DetailCard';
import { useAccess, useParams } from '@umijs/max';
import { App } from 'antd';
import { useCallback, useContext, useEffect, useState } from 'react';
import styles from './styles.less';

export default function DetailSubtaskCard() {
  const access = useAccess();
  const { publish } = useContext(PubSubContext);
  //@ts-ignore
  const { state } = useContext(StateContext);
  const { waybillBasicInfo }: { waybillBasicInfo: IWaybillBaseInfoData } =
    state;
  const { id: waybillId } = useParams();
  const { message } = App.useApp();
  const loading: boolean = state?.loading;

  const [subtaskModalOpen, setSubtaskModalOpen] = useState<boolean>(false);
  const [subtaskConfirmLoading, setSubtaskConfirmLoading] =
    useState<boolean>(false);
  const [showOperation, setShowOperation] = useState<boolean>(false);

  const onSubtaskConfirm = useCallback(async (values: SubtaskCreateParams) => {
    setSubtaskConfirmLoading(true);
    const res = await subtaskCreate(values);
    setSubtaskConfirmLoading(false);
    if (res.code === 200) {
      setSubtaskModalOpen(false);
      message.success('Subtask add success!');
      publish(EVENT_SUBTASK_LIST_RELOAD);
    }
  }, []);

  const onAddSubtask = useCallback(() => {
    setSubtaskModalOpen(true);
  }, [waybillBasicInfo]);

  const checkOperation = () => {
    let hasAccess = false;

    if (access[PermissionEnum.SUBTASK_CREATE]) {
      hasAccess = true;
    }

    if (!hasAccess) {
      return false;
    }
    let b = false;
    if (
      waybillBasicInfo?.financialStatus ===
        WaybillFinancialStatusEnum.NOT_STARTED &&
      waybillBasicInfo?.status === WaybillStatusEnum.IN_TRANSIT
    ) {
      b = true;
    } else if (
      [
        WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY,
        WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION,
        WaybillFinancialStatusEnum.AWAITING_EXCEPTION_HANDLING,
      ].includes(waybillBasicInfo?.financialStatus)
    ) {
      b = true;
    }
    return b;
  };

  useEffect(() => {
    setShowOperation(checkOperation());
  }, [access, waybillBasicInfo.financialStatus, waybillBasicInfo.status]);

  useEffect(() => {
    if (waybillBasicInfo?.financialStatus && waybillBasicInfo?.status) {
      publish(EVENT_SUBTASK_LIST_RELOAD);
    }
  }, [waybillBasicInfo.financialStatus, waybillBasicInfo.status]);

  return (
    <div id={WAYBILL_DETAIL_ANCHOR_ID_MAP.SUBTASK}>
      <DetailCard
        title="Financial Process Subtask"
        editCallback={onAddSubtask}
        loading={loading}
        showEditBtn={showOperation}
        child={
          <div className={styles.content}>
            <div style={{ marginInline: -24 }}>
              <SubtaskList hideInSearchAndCreate={true} buId={+waybillId!} />
            </div>
            {subtaskModalOpen && (
              <SubtaskAddModal
                open={subtaskModalOpen}
                onConfirm={onSubtaskConfirm}
                //@ts-ignore
                record={{
                  waybillNumberId: waybillBasicInfo.id,
                  waybillNumber: waybillBasicInfo.waybillNumber,
                }}
                modalProps={{
                  okText: 'Confirm',
                  onCancel: () => {
                    setSubtaskModalOpen(false);
                  },
                }}
                submitter={{
                  submitButtonProps: {
                    loading: subtaskConfirmLoading,
                  },
                }}
              />
            )}
          </div>
        }
      />
    </div>
  );
}
