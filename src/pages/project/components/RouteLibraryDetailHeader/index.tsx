import { getRouteLibraryDetail, getRouteTruckRange } from '@/api/project';
import { getTruckTypeList } from '@/api/truck';
import {
  IAddTruckRangeParams,
  IRouteLibraryAddParams,
  IRouteLibraryDetail,
} from '@/api/types/project';
import { ITruckTypeListItem } from '@/api/types/truck';
import CustomDetailHeader from '@/components/CustomDetailHeader';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import { LAYOUT_HEADER_HEIGHT } from '@/constants';
import { ProjectStatusEnum, RouteBillingModeEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import {
  OPS_TYPE,
  StateContext,
} from '@/pages/project/RouteLibraryDetail/store';
import LibraryModal from '@/pages/project/components/LibraryModal';
import MileageRangeModal from '@/pages/project/components/MileageRangeModal';
import styles from '@/pages/project/components/RouteLibraryDetailHeader/styles.less';
import RouteModal from '@/pages/project/components/RouteModal';
import TruckTypeModal from '@/pages/project/components/TruckTypeModal';
import { ArrowLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import {
  Access,
  history,
  useAccess,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { Affix, App, Button, Col, Row, Spin } from 'antd';
import { memo, useCallback, useContext, useEffect, useState } from 'react';

export default memo(function RouteLibraryDetailHeader() {
  const access = useAccess();
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const [searchParams] = useSearchParams();
  const { id: libraryId } = useParams();
  const { modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [detail, setDetail] = useState<IRouteLibraryDetail>(
    {} as IRouteLibraryDetail,
  );
  const [libraryFormDefaultValue, setLibraryFormDefaultValue] =
    useState<IRouteLibraryAddParams>({} as IRouteLibraryAddParams);
  const [rangeDetail, setRangeDetail] = useState<IAddTruckRangeParams | null>(
    null,
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showRouteModal, setShowRouteModal] = useState<boolean>(false);
  const [showRangeModal, setShowRangeModal] = useState<boolean>(false);
  const [truckTypeList, setTruckTypeList] = useState<ITruckTypeListItem[]>([]);
  const [addTruckType, setAddTruckType] = useState<boolean>(false);

  const getDetail = async () => {
    setLoading(true);
    const [detailRes, rangeRes, typeRes] = await Promise.all([
      getRouteLibraryDetail({
        id: Number(libraryId),
      }),
      getRouteTruckRange({ id: Number(libraryId) }),
      getTruckTypeList(),
    ]);
    // 初始化查询导入导出状态信息
    setLoading(false);
    if (detailRes.code === 200) {
      setDetail(detailRes.data);
      dispatch({
        type: OPS_TYPE.LIBRARY_DETAIL,
        payload: {
          data: detailRes.data ?? {},
        },
      });
    }
    if (rangeRes.code === 200) {
      setRangeDetail(rangeRes.data);
    }
    if (typeRes.code === 200) {
      setTruckTypeList(typeRes.data);
    }
  };

  // const jumpPrice = (type: string) => {
  //   history.push(
  //     `${PATHS.ROUTE_LIBRARY_PRICE}/${libraryId}?mode=${
  //       detail.billingMode === RouteBillingModeEnum.ROUTE_BILLING
  //         ? 'byRoute'
  //         : 'byDistance'
  //     }&identity=${type}`,
  //   );
  // };

  const doNotify = useCallback(() => {
    modal.confirm({
      icon: <ExclamationCircleFilled />,
      title: 'Confirm',
      content:
        'The address triggers Region library update, please close this pop-up window and add it again.',
      okText: 'Close and add again',
      cancelButtonProps: {
        style: {
          display: 'none',
        },
      },
      onOk() {
        setShowRouteModal(false);
        // 关闭后立马打开
        setTimeout(() => {
          setShowRouteModal(true);
        }, 0);
      },
      onCancel() {
        // do nothing
      },
    });
  }, []);

  useEffect(() => {
    getDetail();
  }, [state.headerRefresh]);

  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          {/*top function btn*/}
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            <div className={styles.header_top}>
              <div className={styles.header_top_left}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  disabled={!!searchParams.get('type')}
                  onClick={() => history.back()}
                >
                  Back
                </Button>
              </div>
              <div className={styles.header_top_right}>
                {detail?.billingMode ===
                RouteBillingModeEnum.MILEAGE_BILLING ? (
                  <Access
                    accessible={
                      access[PermissionEnum.ROUTE_LIBRARY_DETAIL_MILEAGE_RANGE]
                    }
                  >
                    <Button
                      disabled={
                        detail.projectStatus !== ProjectStatusEnum.PREPARING
                      }
                      onClick={() => setShowRangeModal(true)}
                      className={styles.header_btn}
                    >
                      Mileage range
                    </Button>
                  </Access>
                ) : null}
                <Access
                  accessible={
                    access[
                      PermissionEnum.ROUTE_LIBRARY_DETAIL_MANAGE_TRUCK_TYPE
                    ]
                  }
                >
                  <Button
                    onClick={() => setAddTruckType(true)}
                    className={styles.header_btn}
                  >
                    Manage Truck Type
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.ROUTE_LIBRARY_DETAIL_ADD_ROUTE]
                  }
                >
                  <Button
                    type="primary"
                    onClick={() => setShowRouteModal(true)}
                    className={styles.header_btn}
                  >
                    Add Route
                  </Button>
                </Access>
                {/* <Access
                  accessible={
                    access[PermissionEnum.ROUTE_LIBRARY_DETAIL_CUSTOMER_PRICING]
                  }
                >
                  <Button
                    type="primary"
                    disabled={
                      detail.billingMode ===
                        RouteBillingModeEnum.MILEAGE_BILLING && !rangeDetail
                    }
                    onClick={() => jumpPrice('customer')}
                    className={styles.header_btn}
                  >
                    Customer Price
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.ROUTE_LIBRARY_DETAIL_VENDOR_PRICING]
                  }
                >
                  <Button
                    type="primary"
                    disabled={
                      detail.billingMode ===
                        RouteBillingModeEnum.MILEAGE_BILLING && !rangeDetail
                    }
                    onClick={() => jumpPrice('vendor')}
                    className={styles.header_btn}
                  >
                    Vendor Price
                  </Button>
                </Access> */}
              </div>
            </div>
          </Affix>
          {/*info detail*/}
          <CustomDetailHeader
            defaultExpand={true}
            titleList={[{ label: 'Library Name', value: detail.libraryName }]}
            titleExtra={
              <Access
                accessible={access[PermissionEnum.ROUTE_LIBRARY_DETAIL_EDIT]}
              >
                <Button
                  type="link"
                  disabled={
                    detail.projectStatus !== ProjectStatusEnum.PREPARING
                  }
                  onClick={() => {
                    setLibraryFormDefaultValue({
                      id: Number(libraryId),
                      libraryName: detail.libraryName,
                      projectId: detail.projectId,
                      projectName: detail.projectName,
                      billingMode: detail.billingMode,
                      multipleRoute: detail.multipleRoute,
                      mileageCalculation: detail.mileageCalculation ?? null,
                      customerTaxType: detail.customerTaxMark,
                      taxMark: detail.taxMark,
                    });
                    setShowAddModal(true);
                  }}
                >
                  Edit
                </Button>
              </Access>
            }
            content={
              <>
                <Row>
                  <Col span={8}>
                    <ColCell label="Project Name" value={detail.projectName} />
                  </Col>
                  <Col span={8}>
                    <ColCell label="Customers" value={detail.customerName} />
                  </Col>
                  <Col span={8}>
                    <ColCell label="Tag" value={detail.customerTag} />
                  </Col>
                </Row>

                <Row>
                  <Col span={8}>
                    <ColCell label="Pricing Mode" value={detail.billingMode} />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Multiple Route"
                      value={detail.multipleRoute}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Mileage Calculation"
                      value={
                        detail.mileageCalculation
                          ? detail.mileageCalculation
                          : '-'
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={8}>
                    <ColCell
                      label="Customer Tax Type"
                      value={detail.customerTaxMark}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell
                      label="Route Pricing Tax Type"
                      value={detail.taxMark}
                    />
                  </Col>
                  <Col span={8}>
                    <ColCell label="Creation time" value={detail.createdAt} />
                  </Col>
                </Row>
              </>
            }
          />
        </div>
        {showAddModal ? (
          <LibraryModal
            formDefaultValue={libraryFormDefaultValue}
            hideModal={() => {
              setShowAddModal(false);
            }}
            refresh={() => {
              getDetail();
              dispatch({
                type: OPS_TYPE.ROUTE_REFRESH,
                payload: {
                  data: !state.routeRefresh,
                },
              });
            }}
          />
        ) : null}
        {showRouteModal ? (
          <RouteModal
            hideModal={() => {
              setShowRouteModal(false);
            }}
            refresh={() => {
              getDetail();
              dispatch({
                type: OPS_TYPE.ROUTE_REFRESH,
                payload: {
                  data: !state.routeRefresh,
                },
              });
            }}
            doNotify={doNotify}
          />
        ) : null}
        {showRangeModal ? (
          <MileageRangeModal
            formDefaultValue={rangeDetail}
            calculationType={detail.mileageCalculation}
            hideModal={() => {
              setShowRangeModal(false);
            }}
            refresh={() => {
              getDetail();
            }}
          />
        ) : null}
      </Spin>
      {addTruckType ? (
        <TruckTypeModal
          truckTypeList={truckTypeList}
          hideModal={() => {
            setAddTruckType(false);
          }}
          refresh={() => {
            setAddTruckType(false);
          }}
        />
      ) : null}
    </>
  );
});
