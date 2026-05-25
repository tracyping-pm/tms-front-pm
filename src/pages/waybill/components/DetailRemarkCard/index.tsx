import { IRemarkItem, IWaybillBaseInfoData } from '@/api/types/waybill';
import { getListRemark } from '@/api/waybill';
import { WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { WaybillFinancialStatusEnum, WaybillStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { StateContext } from '@/pages/waybill/WaybillDetail/store';
import { useAccess } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Empty } from 'antd';
import { FC, useCallback, useContext, useEffect } from 'react';
import { EVENT_WAYBILL_REMARK_LIST_RELOAD } from '../../WaybillDetail/events';
import DetailCard from '../DetailCard';
import RemarkListView from './RemarkListView';
import RemarkModal from './RemarkModal';

const initialModeState = {
  canAdd: false,
  canEdit: false,
  canDelete: false,
  pending: false,
  list: [],
  modalOpen: false,
};

interface IModeState {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  pending: boolean;
  list: IRemarkItem[];
  modalOpen: boolean;
}

interface IProps {
  isStandardWaybill: boolean;
}

const DetailRemarkCard: FC<IProps> = ({ isStandardWaybill }) => {
  const { subscribe } = useContext(PubSubContext);
  const access = useAccess();
  //@ts-ignore
  const { state } = useContext(StateContext);
  const waybillBasicInfo: IWaybillBaseInfoData = state?.waybillBasicInfo || {};

  const [modeState, setModeState] = useSetState<IModeState>(initialModeState);

  const getList = useCallback(async () => {
    setModeState({ pending: true });
    const res = await getListRemark({
      id: waybillBasicInfo.id,
    });
    setModeState({ pending: false });
    if (res.code === 200) {
      setModeState({ list: res.data?.remarkList || [] });
    }
  }, [waybillBasicInfo.id]);

  const init = useCallback(async () => {
    const statusPermissions =
      (waybillBasicInfo?.financialStatus ===
        WaybillFinancialStatusEnum.NOT_STARTED &&
        [
          WaybillStatusEnum.PLANNING,
          WaybillStatusEnum.PENDING,
          WaybillStatusEnum.IN_TRANSIT,
        ].includes(waybillBasicInfo.status)) ||
      waybillBasicInfo?.financialStatus ===
        WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY ||
      waybillBasicInfo?.financialStatus ===
        WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION;

    const canAdd =
      (isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_REMARK_ADD]
        : access[PermissionEnum.TEMPORARY_WAYBILL_REMARK_ADD]) &&
      statusPermissions;

    const canEdit =
      (isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_REMARK_EDIT]
        : access[PermissionEnum.TEMPORARY_WAYBILL_REMARK_EDIT]) &&
      statusPermissions;

    const canDelete =
      (isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_REMARK_DELETE]
        : access[PermissionEnum.TEMPORARY_WAYBILL_REMARK_DELETE]) &&
      statusPermissions;

    setModeState({ canAdd, canEdit, canDelete });
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
    const unsubscribe = subscribe(EVENT_WAYBILL_REMARK_LIST_RELOAD, () => {
      getList();
    });

    return unsubscribe;
  }, [waybillBasicInfo]);

  return (
    <>
      <div id={WAYBILL_DETAIL_ANCHOR_ID_MAP.REMARK}>
        <DetailCard
          title="Remark"
          editCallback={() => setModeState({ modalOpen: true })}
          showEditBtn={modeState.canAdd}
          loading={modeState.pending}
          child={
            modeState.list?.length > 0 ? (
              <RemarkListView
                list={modeState.list}
                canEdit={modeState.canEdit}
                canDelete={modeState.canDelete}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )
          }
        />
      </div>
      {modeState.modalOpen && (
        <RemarkModal
          open={modeState.modalOpen}
          readonly={false}
          projectId={waybillBasicInfo?.projectId}
          waybillId={waybillBasicInfo?.id}
          materialList={[]}
          hideModal={() => setModeState({ modalOpen: false })}
          refresh={() => {
            getList();
          }}
        />
      )}
    </>
  );
};

export default DetailRemarkCard;
