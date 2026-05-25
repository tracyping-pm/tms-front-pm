import { projectCustomerCodeTypeList } from '@/api/project';
import { ICommonListItem } from '@/api/types/common';
import { ICustomerCode } from '@/api/types/tool';
import {
  ICustomerCodeListItem,
  ICustomerCodeVosItem,
  IWaybillBaseInfoData,
} from '@/api/types/waybill';
import {
  getWaybillBasicInfo,
  waybillCustomerCodeList,
  waybillCustomerCodeUpdate,
} from '@/api/waybill';
import CustomStatusButton from '@/components/CustomStatusButton';
import CustomTooltip from '@/components/CustomTooltip';
import { InfoListCase } from '@/components/DetailCase';
import { PATHS, WAYBILL_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import { WaybillFinancialStatusEnum, WaybillStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import TeamMembersModal from '@/pages/project/components/TeamMembersModal';
import { OPS_TYPE, StateContext } from '@/pages/waybill/WaybillDetail/store';
import DetailCard from '@/pages/waybill/components/DetailCard';
import WaybillModal from '@/pages/waybill/components/WaybillModal';
import { isUndefinedOrNull, openNewTag } from '@/utils/utils';
import { Access, useAccess, useParams } from '@umijs/max';
import { Col, Divider, Row, message } from 'antd';
import { transform } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import CustomerCodeModal from '../CustomerCodeModal';
import styles from './styles.less';

export const aggregateToJsonArray = (
  data: ICustomerCodeVosItem[],
): Array<{ customerCodeType: string; numbers: string }> => {
  const aggregated = transform(
    data,
    (acc: Record<string, any[]>, obj: ICustomerCodeVosItem) => {
      if (!acc[obj['customerCodeType']]) {
        acc[obj['customerCodeType']] = [];
      }
      acc[obj['customerCodeType']].push(obj.number);
    },
    {} as Record<string, any[]>,
  );

  return Object.keys(aggregated).map((key) => {
    const list = aggregated[key].filter((item) => !!item || item !== '');
    return {
      customerCodeType: key,
      numbers: list?.length === 0 ? '' : list.join(','),
    };
  });
};

export const aggregateToJsonArray2 = (
  data: ICustomerCode[],
): Array<{ customerCodeTypeName: string; number: string }> => {
  const aggregated = transform(
    data,
    (acc: Record<string, any[]>, obj: ICustomerCode) => {
      if (!acc[obj['customerCodeTypeName']]) {
        acc[obj['customerCodeTypeName']] = [];
      }
      acc[obj['customerCodeTypeName']].push(obj.number);
    },
    {} as Record<string, any[]>,
  );

  return Object.keys(aggregated).map((key) => {
    const list = aggregated[key].filter((item) => !!item || item !== '');
    return {
      customerCodeTypeName: key,
      number: list?.length === 0 ? '' : list.join(','),
    };
  });
};

export default function DetailInformationCard(props: {
  isStandardWaybill: boolean;
}) {
  const access = useAccess();
  //@ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const {
    waybillBasicInfo,
    refreshBilling,
  }: { waybillBasicInfo: IWaybillBaseInfoData; refreshBilling: boolean } =
    state;
  const { isStandardWaybill } = props;
  const refreshBasicInfo: boolean = state?.refreshBasicInfo;
  const { id: waybillId } = useParams();
  const loading: boolean = state?.loading;
  const [detail, setDetail] = useState<IWaybillBaseInfoData>(
    {} as IWaybillBaseInfoData,
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCustomerCodeVos, setNewCustomerCodeVos] = useState<
    Array<{ customerCodeType: string; numbers: string }>
  >([]);
  const [teamMembersOpen, setTeamMemberModalOpen] = useState<boolean>(false);

  const [editPending, setEditPending] = useState<boolean>(false);
  const [options, setOptions] = useState<ICommonListItem[]>([]);
  const [editCustomerCodeModal, setEditCustomerCodeModal] =
    useState<boolean>(false);
  const [customerCodeList, setCustomerCodeList] = useState<
    ICustomerCodeListItem[]
  >([]);
  const [customerCodeConfirmLoading, setCustomerCodeConfirmLoading] =
    useState<boolean>(false);

  const getDetail = async () => {
    dispatch({
      type: OPS_TYPE.REFRESH,
      payload: {
        data: true,
      },
    });
    const res = await getWaybillBasicInfo({ id: Number(waybillId) });
    if (res.code === 200) {
      const jsonArray = aggregateToJsonArray(res.data.customerCodeVos);
      setNewCustomerCodeVos(jsonArray);
      setDetail(res.data || {});
      dispatch({
        type: OPS_TYPE.BASIC_INFO,
        payload: {
          data: res.data,
        },
      });
      dispatch({
        type: OPS_TYPE.REFRESH,
        payload: {
          data: false,
        },
      });
    }
  };

  const getOption = async () => {
    const res = await projectCustomerCodeTypeList();
    if (res.code === 200) {
      const list: ICommonListItem[] = [];
      (res.data || []).forEach((item) => {
        list.push({
          label: item.name,
          value: item.id,
        });
      });
      setOptions(list);
    }
  };

  const onEditCustomerCode = async () => {
    setEditPending(true);
    const res = await waybillCustomerCodeList(Number(waybillId)).finally(() => {
      setEditPending(false);
    });
    if (res.code === 200) {
      // if (!options?.length && !res?.data?.length) {
      //   return message.error(
      //     'Cannot fill in Customer Code because the project has not been configured.',
      //   );
      // }
      setCustomerCodeList(res?.data || []);
      setEditCustomerCodeModal(true);
    }
  };

  const onEditCustomerCodeConfirm = async (values: ICustomerCodeListItem[]) => {
    const payload = {
      waybillId: Number(waybillId),
      customerCodeList: values,
    };
    setCustomerCodeConfirmLoading(true);
    const res = await waybillCustomerCodeUpdate(payload).finally(() => {
      setCustomerCodeConfirmLoading(false);
    });
    if (res.code === 200) {
      if (res.data.code === 0) {
        getDetail();
        message.success('Edit Customer Code successfully!');
        setEditCustomerCodeModal(false);
      } else {
        message.warning(res.data.msg || 'Warning');
      }
    }
  };

  useEffect(() => {
    if (waybillId) {
      getDetail();
      getOption();
    }
  }, [waybillId, refreshBasicInfo]);

  return (
    <div id={WAYBILL_DETAIL_ANCHOR_ID_MAP.BASIC}>
      <DetailCard
        title="Basic Information"
        editCallback={() => {
          setShowAddModal(true);
        }}
        loading={loading}
        showEditBtn={
          (isStandardWaybill
            ? access[PermissionEnum.STANDARD_WAYBILL_BASIC_INFO_EDIT]
            : access[PermissionEnum.TEMPORARY_WAYBILL_BASIC_INFO_EDIT]) &&
          ((waybillBasicInfo?.financialStatus ===
            WaybillFinancialStatusEnum.NOT_STARTED &&
            [
              WaybillStatusEnum.PLANNING,
              WaybillStatusEnum.PENDING,
              WaybillStatusEnum.IN_TRANSIT,
            ].includes(waybillBasicInfo.status)) ||
            waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY)
        }
        extraBtn={
          <div className={styles.extraBtn} style={{ display: 'flex' }}>
            {[
              WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY,
              WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION,
              WaybillFinancialStatusEnum.AWAITING_EXCEPTION_HANDLING,
              WaybillFinancialStatusEnum.AWAITING_PRICE_VERIFICATION,
              WaybillFinancialStatusEnum.AWAITING_SETTLEMENT,
              WaybillFinancialStatusEnum.CLOSED,
              WaybillFinancialStatusEnum.SETTLED,
            ].includes(waybillBasicInfo?.financialStatus) ||
            (waybillBasicInfo?.financialStatus ===
              WaybillFinancialStatusEnum.NOT_STARTED &&
              [
                WaybillStatusEnum.PLANNING,
                WaybillStatusEnum.PENDING,
                WaybillStatusEnum.IN_TRANSIT,
              ].includes(waybillBasicInfo.status)) ? (
              <>
                <CustomStatusButton
                  noStyle
                  onClick={() => setTeamMemberModalOpen(true)}
                >
                  Project members
                </CustomStatusButton>
                <Divider type="vertical" />
              </>
            ) : null}
            <Access
              accessible={
                isStandardWaybill
                  ? access[PermissionEnum.STANDARD_WAYBILL_EDIT_CUSTOMER_CODE]
                  : access[PermissionEnum.TEMPORARY_WAYBILL_EDIT_CUSTOMER_CODE]
              }
            >
              {(waybillBasicInfo?.financialStatus ===
                WaybillFinancialStatusEnum.NOT_STARTED &&
                [
                  WaybillStatusEnum.PLANNING,
                  WaybillStatusEnum.PENDING,
                  WaybillStatusEnum.IN_TRANSIT,
                ].includes(waybillBasicInfo.status)) ||
              waybillBasicInfo?.financialStatus ===
                WaybillFinancialStatusEnum.AWAITING_POD_HARD_COPY ||
              waybillBasicInfo?.financialStatus ===
                WaybillFinancialStatusEnum.AWAITING_POD_VERIFICATION ? (
                <>
                  <CustomStatusButton
                    noStyle
                    onClick={onEditCustomerCode}
                    loading={editPending}
                  >
                    Edit Customer Code
                  </CustomStatusButton>
                  <Divider type="vertical" />
                </>
              ) : null}
            </Access>
          </div>
        }
        child={
          <div className={styles.content}>
            <div className={styles.content_header}>
              <Row>
                <Col span={8}>
                  <div style={{ display: 'flex' }}>
                    <div className={styles.content_header_title}>
                      Waybill Number
                    </div>
                    <div className={styles.content_header_desc}>
                      {detail.waybillNumber ?? '-'}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <InfoListCase
              justify="start"
              infoList={[
                { label: 'Dispatch Type', value: detail?.dispatchType },
                {
                  label: 'Project',
                  value: (
                    <div
                      style={{
                        textDecoration: 'underline',
                        color: '#009688',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        openNewTag(
                          `${PATHS.PROJECT_DETAIL_BASE}/${detail?.projectId}`,
                        );
                      }}
                    >
                      {detail?.projectName}
                    </div>
                  ),
                },
                {
                  label: 'Customer',
                  value: (
                    <div
                      style={{
                        textDecoration: 'underline',
                        color: '#009688',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        openNewTag(
                          `${PATHS.CUSTOMER_DETAIL_BASE}/${detail?.customerId}`,
                        );
                      }}
                    >
                      {detail?.customerName}
                    </div>
                  ),
                },
                { label: 'Tag', value: detail?.customerTag },
                { label: 'Position Time', value: detail?.positionTime },
                {
                  label: 'Required Delivery Time',
                  value: detail?.destinationTime ?? '-',
                },
                { label: 'Status', value: detail?.status },
                // { label: 'Dispatcher', value: detail?.dispatcherName },
                // { label: 'Customer BD', value: detail?.customerBDName },
                // { label: 'Pricer', value: detail?.pricerName },
                // { label: 'Procurement PIC', value: detail?.vendorBDName },
                // { label: 'OC', value: detail?.ocname },
                // { label: 'On Site OC', value: detail?.onSiteOCName },
                // { label: 'POD Checker', value: detail?.podcheckerName },
                { label: 'Creation Time', value: detail?.createdAt },
                {
                  label: 'Settled Time',
                  value:
                    detail?.settledTime ??
                    detail?.financialStatus ??
                    detail?.settledTime,
                },
                {
                  label: 'Planning Route Distance',
                  value: isUndefinedOrNull(detail?.distance)
                    ? null
                    : `${(detail?.distance / 1000).toFixed(2)}KM`,
                },
              ]}
            />
            {!!newCustomerCodeVos?.length ? (
              <div className={styles.customerCode}>
                <div className={styles.customerCode_list}>
                  {newCustomerCodeVos?.map((item) => {
                    return (
                      <CustomTooltip
                        key={item?.customerCodeType}
                        title={
                          <div className={styles.customerCode_popover}>
                            {`${item.customerCodeType}${
                              !!item.numbers ? `:${item.numbers}` : ''
                            }`}
                          </div>
                        }
                        placement="topLeft"
                      >
                        <div className={styles.customerCode_item}>
                          <div className={styles.customerCode_label}>
                            {item.customerCodeType}
                          </div>
                          <div className={styles.customerCode_value}>
                            {item.numbers}
                          </div>
                        </div>
                      </CustomTooltip>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {showAddModal ? (
              <WaybillModal
                defaultFormValue={detail}
                refresh={() => {
                  getDetail();
                  dispatch({
                    type: OPS_TYPE.REFRESH_BILLING,
                    payload: {
                      data: !refreshBilling,
                    },
                  });
                }}
                hideModal={() => setShowAddModal(false)}
              />
            ) : null}
            {teamMembersOpen ? (
              <TeamMembersModal
                id={detail?.projectId}
                waybillId={Number(waybillId)}
                open={teamMembersOpen}
                onConfirm={() => {
                  setTeamMemberModalOpen(false);
                }}
                onCancel={() => {
                  setTeamMemberModalOpen(false);
                }}
              />
            ) : null}
          </div>
        }
      />
      {editCustomerCodeModal && (
        <CustomerCodeModal
          open={editCustomerCodeModal}
          list={customerCodeList}
          options={options}
          onConfirm={onEditCustomerCodeConfirm}
          modalProps={{
            onCancel: () => setEditCustomerCodeModal(false),
          }}
          submitter={{
            submitButtonProps: {
              loading: customerCodeConfirmLoading,
            },
          }}
        />
      )}
    </div>
  );
}
