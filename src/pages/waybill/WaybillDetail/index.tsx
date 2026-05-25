import { IWaybillBaseInfoData } from '@/api/types/waybill';
import { getWaybillBasicInfo } from '@/api/waybill';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import CustomFloatButton, {
  IFloatButtonItem,
} from '@/components/CustomFloatButton';
import { PATHS, WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import { WaybillDispatchTypeEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import {
  StateContext,
  StoreProvider,
} from '@/pages/waybill/WaybillDetail/store';
import DetailBillingCard from '@/pages/waybill/components/DetailBillingCard';
import DetailCarrierCard from '@/pages/waybill/components/DetailCarrierCard';
import DetailHeader from '@/pages/waybill/components/DetailHeader';
import DetailPodCard from '@/pages/waybill/components/DetailPodCard';
import DetailRouteCard from '@/pages/waybill/components/DetailRouteCard';
import { InfoCircleFilled } from '@ant-design/icons';
import { Access, history, useAccess, useLocation, useParams } from '@umijs/max';
import { Alert, Spin } from 'antd';
import { filter, includes, indexOf, sortBy } from 'lodash';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import DetailClaimCard from '../components/DetailClaimCard';
import DetailGoogleMapCard from '../components/DetailGoogleMapCard';
import DetailInformationCard from '../components/DetailInformationCard';
import DetailReimbursementCard from '../components/DetailReimbursementCard';
import DetailRemarkCard from '../components/DetailRemarkCard';
import DetailSubtaskCard from '../components/DetailSubtaskCard';

const DEFAULT_MODULE_ORDER = [
  'Basic',
  'Subtask',
  'Tracks',
  'Route',
  'Carrier',
  'POD',
  'Remark',
  'Billing',
  'Claim',
  'Reimb',
];
interface IModuleAccess {
  tracks: boolean;
  route: boolean;
  carrier: boolean;
  subtask: boolean;
  billing: boolean;
  pod: boolean;
  remark: boolean;
  basic: boolean;
  claim: boolean;
  reimbursement: boolean;
}

const initialModuleAccess: IModuleAccess = {
  tracks: false,
  route: false,
  carrier: false,
  billing: false,
  subtask: false,
  pod: false,
  remark: false,
  basic: false,
  claim: false,
  reimbursement: false,
};

function WaybillStandardMain() {
  const { id: waybillId } = useParams();
  const access = useAccess();
  //@ts-ignore
  const { state } = useContext(StateContext);
  let waybillBasicData: IWaybillBaseInfoData = state.waybillBasicInfo;
  const isNewCreated =
    new URLSearchParams(useLocation().search).get('isNewCreated') === 'true';
  const [visible, setVisible] = useState<boolean>(isNewCreated);
  const [waybillBasicInfo, setWaybillBasicInfo] =
    useState<IWaybillBaseInfoData>(waybillBasicData);
  const [anchorList, setAnchorList] = useState<IFloatButtonItem[]>([]);
  const [moduleElement, setModuleElement] = useState<JSX.Element[]>([]);

  const moduleAccessRef = useRef<IModuleAccess>(initialModuleAccess);

  const isStandardWaybill = useMemo(() => {
    return (
      waybillBasicInfo?.dispatchType ===
      WaybillDispatchTypeEnum.STANDARD_DISPATCH
    );
  }, [waybillBasicInfo]);

  const checkShowBasic = () => {
    let hasAccess = false;
    if (
      isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_BASIC_INFO]
        : access[PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO]
    ) {
      hasAccess = true;
    }
    return hasAccess;
  };

  const checkShowSubtask = () => {
    let hasAccess = false;
    if (access[PermissionEnum.SUBTASK]) {
      hasAccess = true;
    }
    return hasAccess;
  };

  const checkShowTracks = () => {
    let hasAccess = false;
    if (
      isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_TRACKS]
        : access[PermissionEnum.TEMPORARY_WAYBILL_TRACKS]
    ) {
      hasAccess = true;
    }
    return hasAccess;
  };

  const checkShowRoute = () => {
    let hasAccess = false;
    if (
      isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_ROUTE]
        : access[PermissionEnum.TEMPORARY_WAYBILL_ROUTE]
    ) {
      hasAccess = true;
    }
    return hasAccess;
  };

  const checkShowCarrier = () => {
    let hasAccess = false;
    if (
      isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_CARRIER]
        : access[PermissionEnum.TEMPORARY_WAYBILL_CARRIER]
    ) {
      hasAccess = true;
    }
    return hasAccess;
  };

  const checkShowPOD = () => {
    let hasAccess = false;
    if (
      isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_POD]
        : access[PermissionEnum.TEMPORARY_WAYBILL_POD]
    ) {
      hasAccess = true;
    }
    return hasAccess;
  };

  const checkShowRemark = () => {
    let hasAccess = false;
    if (
      isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_REMARK]
        : access[PermissionEnum.TEMPORARY_WAYBILL_REMARK]
    ) {
      hasAccess = true;
    }
    return hasAccess;
  };

  const checkShowBilling = () => {
    let hasAccess = false;
    if (
      isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_BILLING]
        : access[PermissionEnum.TEMPORARY_WAYBILL_BILLING]
    ) {
      hasAccess = true;
    }

    return hasAccess;
  };

  const checkShowClaim = () => {
    let hasAccess = false;
    if (
      isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_CLAIM]
        : access[PermissionEnum.TEMPORARY_WAYBILL_CLAIM]
    ) {
      hasAccess = true;
    }

    return hasAccess;
  };

  const checkShowReimbursement = () => {
    let hasAccess = false;
    if (
      isStandardWaybill
        ? access[PermissionEnum.STANDARD_WAYBILL_REIMBURSEMENT]
        : access[PermissionEnum.TEMPORARY_WAYBILL_REIMBURSEMENT]
    ) {
      hasAccess = true;
    }

    return hasAccess;
  };

  const moduleComponentHandle = (id: string) => {
    switch (id) {
      case 'Basic':
        return (
          <Access accessible={moduleAccessRef.current.basic}>
            <DetailInformationCard isStandardWaybill={isStandardWaybill} />
          </Access>
        );
      case 'Subtask':
        return (
          <Access accessible={moduleAccessRef.current.subtask}>
            <DetailSubtaskCard />
          </Access>
        );
      case 'Tracks':
        return (
          <Access accessible={moduleAccessRef.current.tracks}>
            <DetailGoogleMapCard isStandardWaybill={isStandardWaybill} />
          </Access>
        );
      case 'Route':
        return (
          <Access accessible={moduleAccessRef.current.route}>
            <DetailRouteCard />
          </Access>
        );
      case 'Carrier':
        return (
          <Access accessible={moduleAccessRef.current.carrier}>
            <DetailCarrierCard isStandardWaybill={isStandardWaybill} />
          </Access>
        );
      case 'POD':
        return (
          <Access accessible={moduleAccessRef.current.pod}>
            <DetailPodCard isStandardWaybill={isStandardWaybill} />
          </Access>
        );

      case 'Remark':
        return (
          <Access accessible={moduleAccessRef.current.remark}>
            <DetailRemarkCard isStandardWaybill={isStandardWaybill} />
          </Access>
        );
      case 'Billing':
        return (
          <Access accessible={moduleAccessRef.current.billing}>
            <DetailBillingCard isStandardWaybill={isStandardWaybill} />
          </Access>
        );
      case 'Claim':
        return (
          <Access accessible={moduleAccessRef.current.claim}>
            <DetailClaimCard isStandardWaybill={isStandardWaybill} />
          </Access>
        );
      case 'Reimb':
        return (
          <Access accessible={moduleAccessRef.current.reimbursement}>
            <DetailReimbursementCard isStandardWaybill={isStandardWaybill} />
          </Access>
        );
      default:
        return <></>;
    }
  };

  const moduleOrderHandle = (list: IFloatButtonItem[]) => {
    if (!waybillBasicInfo.status) return;
    let order = DEFAULT_MODULE_ORDER;

    //导航按钮排序
    setAnchorList(list);
    // 模块排序
    const filteredData = filter(list, (item) =>
      includes(order, item.description),
    );
    const anchorArray: IFloatButtonItem[] = sortBy(filteredData, (item) => {
      return indexOf(order, item.description);
    });
    const modulesArray: JSX.Element[] = [];
    order.forEach((moduleOrderId) => {
      modulesArray.push(moduleComponentHandle(moduleOrderId));
    });
    setAnchorList(anchorArray);
    setModuleElement(modulesArray);
  };

  const initFloatButtonData = () => {
    const {
      basic,
      subtask,
      tracks,
      route,
      carrier,
      pod,
      remark,
      billing,
      claim,
      reimbursement,
    } = moduleAccessRef.current;

    const list: IFloatButtonItem[] = [];

    if (basic) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.BASIC,
        description: 'Basic',
      });
    }

    if (subtask) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.SUBTASK,
        description: 'Subtask',
      });
    }

    if (tracks) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.TRACKS,
        description: 'Tracks',
      });
    }

    if (route) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.ROUTE,
        description: 'Route',
      });
    }

    if (carrier) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.CARRIER,
        description: 'Carrier',
      });
    }

    if (pod) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.POD,
        description: 'POD',
      });
    }

    if (remark) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.REMARK,
        description: 'Remark',
      });
    }

    if (billing) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.BILLING,
        description: 'Billing',
      });
    }

    if (claim) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.CLAIM,
        description: 'Claim',
      });
    }

    if (reimbursement) {
      list.push({
        anchorId: WAYBILL_DETAIL_ANCHOR_ID_MAP.REIMBURSEMENT,
        description: 'Reimb',
      });
    }

    if (!!list.length) {
      moduleOrderHandle(list);
    }
  };

  const getDetail = async () => {
    const res = await getWaybillBasicInfo({ id: Number(waybillId) });
    if (res.code === 200) {
      if (!waybillBasicInfo?.status) {
        setWaybillBasicInfo(res.data);
      }
    }
  };

  useEffect(() => {
    if (!isNewCreated) return;
    setTimeout(() => {
      setVisible(false);
      const location: string = window.location.href;
      const url = new URL(location);
      url.searchParams.delete('isNewCreated');
      history.push(url.toString());
    }, 4000);
  }, [isNewCreated]);

  useEffect(() => {
    if (!waybillBasicInfo.status) return;
    moduleAccessRef.current = {
      basic: checkShowBasic(),
      subtask: checkShowSubtask(),
      tracks: checkShowTracks(),
      route: checkShowRoute(),
      carrier: checkShowCarrier(),
      pod: checkShowPOD(),
      remark: checkShowRemark(),
      billing: checkShowBilling(),
      claim: checkShowClaim(),
      reimbursement: checkShowReimbursement(),
    };
    initFloatButtonData();
  }, [waybillBasicInfo?.status, waybillBasicInfo?.financialStatus]);

  useEffect(() => {
    getDetail();
  }, []);

  useEffect(() => {
    setWaybillBasicInfo(waybillBasicData);
  }, [waybillBasicData]);

  return (
    <div style={{ paddingRight: 76 }}>
      {visible && (
        <Alert
          style={{
            width: 532,
            backgroundColor: '#EEF6F4',
            borderColor: '#5BBDA9',
            position: 'fixed',
            left: '50%',
            marginLeft: '-266px',
            zIndex: 11,
          }}
          message="Tips"
          description={
            <>
              <div>
                1. Please provide the route information and carrier information
                before submitting the waybill.
              </div>
              <div>
                2. Ensure to include the required customer code before
                confirming delivery.
              </div>
            </>
          }
          icon={<InfoCircleFilled style={{ color: '#009688' }} />}
          type="success"
          showIcon
          closable
        />
      )}
      <BreadcrumbCase
        items={[
          { name: 'Waybills', path: PATHS.WAYBILL_LIST },
          { name: 'Details', path: PATHS.CUSTOMER_DETAIL_BASE },
        ]}
      />
      <Spin spinning={!waybillBasicInfo?.waybillNumber}>
        <DetailHeader isStandardWaybill={isStandardWaybill} />
        {/* 获取waybill基础信息 */}
        {!!moduleElement.length
          ? moduleElement.map((item, index) => <div key={index}>{item}</div>)
          : null}
        <CustomFloatButton anchorList={anchorList} />
      </Spin>
    </div>
  );
}

export default function WaybillStandard() {
  return (
    <StoreProvider>
      <WaybillStandardMain />
    </StoreProvider>
  );
}
