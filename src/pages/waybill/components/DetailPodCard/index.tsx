import { IPodItem, IWaybillBaseInfoData } from '@/api/types/waybill';
import { getListPod } from '@/api/waybill';
import { WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { WaybillFinancialStatusEnum, WaybillStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { StateContext } from '@/pages/waybill/WaybillDetail/store';
import DetailCard from '@/pages/waybill/components/DetailCard';
import { useAccess } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Empty } from 'antd';
import { FC, useCallback, useContext, useEffect } from 'react';
import { EVENT_WAYBILL_POD_LIST_RELOAD } from '../../WaybillDetail/events';
import PodListView from './PodListView';
import PodModal from './PodModal';

const initialModeState: IModeState = {
  canEdit: false,
  pending: false,
  typePending: false,
  list: [],
  modalOpen: false,
};

interface IModeState {
  canEdit: boolean;
  pending: boolean;
  typePending: boolean;
  list: IPodItem[];
  modalOpen: boolean;
}

interface IProps {
  isStandardWaybill: boolean;
}

const DetailPodCard: FC<IProps> = ({ isStandardWaybill }) => {
  const { subscribe } = useContext(PubSubContext);
  const access = useAccess();
  //@ts-ignore
  const { state } = useContext(StateContext);
  const waybillBasicInfo: IWaybillBaseInfoData = state?.waybillBasicInfo || {};
  const [modeState, setModeState] = useSetState<IModeState>(initialModeState);

  const getList = useCallback(async () => {
    setModeState({ pending: true });
    const res = await getListPod({
      id: waybillBasicInfo.id,
    });
    setModeState({ pending: false });
    if (res.code === 200) {
      setModeState({ list: res.data?.podList || [] });
    }
  }, [waybillBasicInfo.id]);

  const init = useCallback(() => {
    const canEdit =
      (isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_POD_EDIT]
        : access[PermissionEnum.TEMPORARY_WAYBILL_POD_EDIT]) &&
      ((waybillBasicInfo?.financialStatus ===
        WaybillFinancialStatusEnum.NOT_STARTED &&
        waybillBasicInfo?.status === WaybillStatusEnum.PLANNING) ||
        (waybillBasicInfo?.financialStatus ===
          WaybillFinancialStatusEnum.NOT_STARTED &&
          waybillBasicInfo?.status === WaybillStatusEnum.PENDING) ||
        (waybillBasicInfo?.financialStatus ===
          WaybillFinancialStatusEnum.NOT_STARTED &&
          waybillBasicInfo?.status === WaybillStatusEnum.IN_TRANSIT) ||
        waybillBasicInfo?.financialStatus ===
          WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY ||
        waybillBasicInfo?.financialStatus ===
          WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION);
    setModeState({ canEdit });
  }, [
    isStandardWaybill,
    waybillBasicInfo.status,
    waybillBasicInfo?.financialStatus,
  ]);

  useEffect(() => {
    if (waybillBasicInfo?.id) {
      getList();
    }
  }, [waybillBasicInfo]);

  useEffect(() => {
    init();
  }, [waybillBasicInfo]);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_WAYBILL_POD_LIST_RELOAD, () => {
      getList();
    });

    return unsubscribe;
  }, [waybillBasicInfo]);

  return (
    <div id={WAYBILL_DETAIL_ANCHOR_ID_MAP.POD}>
      <DetailCard
        title="POD"
        loading={modeState.pending || modeState.typePending}
        showEditBtn={modeState.canEdit}
        editCallback={() => setModeState({ modalOpen: true })}
        child={
          modeState.list?.length > 0 ? (
            <>
              <PodListView list={modeState.list} canEdit={modeState.canEdit} />
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )
        }
      />
      {modeState.modalOpen && (
        <PodModal
          open={modeState.modalOpen}
          projectId={waybillBasicInfo?.projectId}
          waybillId={waybillBasicInfo?.id}
          materialList={[]}
          hideModal={() => setModeState({ modalOpen: false })}
          refresh={() => {
            getList();
          }}
        />
      )}
    </div>
  );
};

export default DetailPodCard;
