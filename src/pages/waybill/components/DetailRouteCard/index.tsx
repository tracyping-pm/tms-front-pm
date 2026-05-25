import { IWaybillBaseInfoData } from '@/api/types/waybill';
import { WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import { WaybillDispatchTypeEnum } from '@/enums';
import { useContext } from 'react';
import { StateContext } from '../../WaybillDetail/store';
import Standard from './Standard';
import Temporary from './Temporary';

export default function DetailRouteCard() {
  // @ts-ignore
  const { state } = useContext(StateContext);
  const waybillBasicInfo: IWaybillBaseInfoData = state?.waybillBasicInfo || {};

  return (
    <>
      <div id={WAYBILL_DETAIL_ANCHOR_ID_MAP.ROUTE}>
        {waybillBasicInfo?.dispatchType ===
          WaybillDispatchTypeEnum.STANDARD_DISPATCH && <Standard />}
        {waybillBasicInfo?.dispatchType ===
          WaybillDispatchTypeEnum.TEMPORARY_DISPATCH && <Temporary />}
      </div>
    </>
  );
}
