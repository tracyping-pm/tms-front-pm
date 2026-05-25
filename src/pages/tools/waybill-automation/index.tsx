import { IWaybillAutomationResult } from '@/api/types/waybill';
import {
  waybillAutomationDelivery,
  waybillAutomationResult,
  waybillAutomationSync,
  waybillAutomationSyncStatus,
  waybillAutomationUpdate,
  waybillAutomationUpdateWaybillLink,
  waybillAutomationVerification,
} from '@/api/waybill';
import { PermissionEnum } from '@/enums/permission';
import { getAppEnv } from '@/runtime-env';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  SyncOutlined,
} from '@ant-design/icons';
import { Access, useAccess } from '@umijs/max';
import { Button, Spin } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';

const ENV_LINK = {
  dev: {
    start:
      'https://docs.google.com/spreadsheets/d/17S1KJiQ6zFYjcNU5SB2vjPaB03w-UoB-aMv-UlsLMf4/edit?gid=0#gid=0',
    cancel:
      'https://docs.google.com/spreadsheets/d/1KLcGtNBGX-u0LeAsTDJlhpH7eU0XwNrKaAA_nfnO7xo/edit?gid=0#gid=0',
    verification:
      'https://docs.google.com/spreadsheets/d/1MdUP3DTS2vpOZ5Bbx_qIamcSH9X-1DhteWnD64RafD0/edit?gid=0#gid=0',
    delivery:
      'https://docs.google.com/spreadsheets/d/13u6WJ8P9KFqsgMfLPEeAtir9iT_LGRDxj80gIWUloYc/edit?gid=0#gid=0',
  },
  test: {
    start:
      'https://docs.google.com/spreadsheets/d/1E4uEWsiJ0OuBm4H_QWYLEETE8NOrdBcTjH9WTT7OwLA/edit?gid=0#gid=0',
    cancel:
      'https://docs.google.com/spreadsheets/d/1T1dTB6QIiGlj9d0T4805ZVx4QOjF_zIeAGiA5D1Xos0/edit?gid=0#gid=0',
    verification:
      'https://docs.google.com/spreadsheets/d/14Z2kFH3ComDNZ4kVH257yAjYb0WPtjuz77iQCTsmXl8/edit?gid=0#gid=0',
    delivery:
      'https://docs.google.com/spreadsheets/d/1pRqIVE9yPAbxRW-csK9RoH9iutWm8cfWSsqCtwAsABw/edit?gid=0#gid=0',
  },
  uat: {
    start:
      'https://docs.google.com/spreadsheets/d/1veKg5LgOpjLbNIVRN3TkM1cgMTZggkGRHSwlbiJgkgc/edit?gid=0#gid=0',
    cancel:
      'https://docs.google.com/spreadsheets/d/1CPR6zWcGtXWoeblTX9mykpmEf6ZI1lVfYvh-DK-pPOk/edit?gid=0#gid=0',
    verification:
      'https://docs.google.com/spreadsheets/d/1GMHcnY05vbJnYuO0M26KydHng6gKLkI6OmVotH9LjKk/edit?gid=0#gid=0',
    delivery:
      'https://docs.google.com/spreadsheets/d/1JM1R6jmd-qcdE5ZOnslvqM5ba6y4B8r5agyOIp-d4Yg/edit?gid=0#gid=0',
  },
  prod: {
    start:
      'https://docs.google.com/spreadsheets/d/1zJ-ptqWytAPwuyZrOtP5Dempu3Vr8TltpUtpWe0S6lk/edit?gid=0#gid=0',
    cancel:
      'https://docs.google.com/spreadsheets/d/1brAtg9KHTYXAIHMBlbUUigny5XEUQLx93joZG64gHBA/edit?gid=0#gid=0',
    verification:
      'https://docs.google.com/spreadsheets/d/1pIw7Q5yS95ybzsrci1gmdhEhlAI_ej8FJ0V65puVVew/edit?gid=0#gid=0',
    delivery:
      'https://docs.google.com/spreadsheets/d/1ETiFAL3X_EkXFeLQOqGtkGLtVHVB3XKVg2858k1eKDg/edit?gid=0#gid=0',
  },
  rc: {
    start:
      'https://docs.google.com/spreadsheets/d/1GEJ9TRuu4dFJCSg9uVIpbhB3ehp6NCZyRpwGifu_0FA/edit?gid=0#gid=0',
    cancel:
      'https://docs.google.com/spreadsheets/d/1P9gME0XrG3nEZVVkllLbmPO7eFKO1q8LOkDA5qcKu7I/edit?gid=0#gid=0',
    verification:
      'https://docs.google.com/spreadsheets/d/1SS-NpEU8dV1B8BgunTLRYGRlqkps6e1VkBTLHgjwQJ0/edit?gid=0#gid=0',
    delivery:
      'https://docs.google.com/spreadsheets/d/1rQ6WtlyP7-KhNtoJQzVOj4zVCZxjnHckcR3rFDZZdxs/edit?gid=0#gid=0',
  },
};

function getLinkRecord() {
  const e = getAppEnv();
  const appEnvKey = (e in ENV_LINK ? e : 'dev') as keyof typeof ENV_LINK;
  return {
    START: ENV_LINK[appEnvKey].start,
    CANCEL: ENV_LINK[appEnvKey].cancel,
    VERIFICATION: ENV_LINK[appEnvKey].verification,
    DELIVERY: ENV_LINK[appEnvKey].delivery,
  };
}

const WaybillAutomation: FC = () => {
  const access = useAccess();
  const [syncStartLoading, setSyncStartLoading] = useState<boolean>(false); // confirm delivery
  const [syncCancelLoading, setSyncCancelLoading] = useState<boolean>(false); // cancel waybill
  const [syncVerifiLoading, setSyncVerifiLoading] = useState<boolean>(false); // confirm verification
  const [syncDeliveryLoading, setSyncDeliveryLoading] =
    useState<boolean>(false); // confirm delivery
  const [syncUpdateWaybillLoading, setSyncUpdateWaybillLoading] =
    useState<boolean>(false); // update waybill

  const [resultShopeeFlashLoading, setResultShopeeFlashLoading] =
    useState<boolean>(false);
  const [resultShoppeLastMileLoading, setResultShoppeLastMileLoading] =
    useState<boolean>(false);

  const [resultRes, setResultRes] = useState<any>();
  const [resBtnData, setResBtnDate] = useState<IWaybillAutomationResult>(
    {} as IWaybillAutomationResult,
  );

  const [updateUrl, setUpdateUrl] = useState<string>('');
  const [initialing, setInitialing] = useState<boolean>(false); // update waybill

  const time = useRef<NodeJS.Timeout | undefined>();

  const fetchResult = async () => {
    const res = await waybillAutomationResult().finally(() => {
      setResultShopeeFlashLoading(false);
      setResultShoppeLastMileLoading(false);
    });

    if (res.code === 200) {
      setResBtnDate(res.data);
      if (!res?.data) {
        setResultRes({});
        return;
      }
      const {
        startErrorNum,
        cancelErrorNum,
        confirmVerificationErrorNum,
        startSuccessNum,
        cancelSuccessNum,
        confirmVerificationSuccessNum,
        resultCancelDate,
        resultStartDate,
        confirmVerificationDate,
        confirmDeliveryErrorNum,
        confirmDeliverySuccessNum,
        confirmDeliveryDate,
        updateErrorNum,
        updateSuccessNum,
        updateDate,
      } = res?.data;
      const shopeeFlash = [
        {
          title: 'Update Waybill',
          number: updateSuccessNum,
          errorNumber: updateErrorNum,
          resultDate: updateDate,
        },
        {
          title: 'Confirm Delivery ',
          number: confirmDeliverySuccessNum,
          errorNumber: confirmDeliveryErrorNum,
          resultDate: confirmDeliveryDate,
        },
        {
          title: 'Confirm POD Verification',
          number: confirmVerificationSuccessNum,
          errorNumber: confirmVerificationErrorNum,
          resultDate: confirmVerificationDate,
        },
      ];
      const shoppeLastMile = [
        {
          title: 'Confirm Delivery (for LM)',
          number: startSuccessNum,
          errorNumber: startErrorNum,
          resultDate: resultStartDate,
        },
        {
          title: 'Cancel',
          number: cancelSuccessNum,
          errorNumber: cancelErrorNum,
          resultDate: resultCancelDate,
        },
      ];

      setResultRes({ shopeeFlash, shoppeLastMile });
    }
  };

  const fetchShopeeFlashResult = async () => {
    setResultShopeeFlashLoading(true);
    await fetchResult();
  };
  const fetchShoppeLastMileResult = async () => {
    setResultShoppeLastMileLoading(true);
    await fetchResult();
  };

  const onStart = () => {
    window.open(getLinkRecord().START, '_blank');
  };

  const onCancel = () => {
    window.open(getLinkRecord().CANCEL, '_blank');
  };

  const onVerification = () => {
    window.open(getLinkRecord().VERIFICATION, '_blank');
  };

  const onConfirmDelivery = () => {
    window.open(getLinkRecord().DELIVERY, '_blank');
  };

  const startPolling = async () => {
    const handle = async () => {
      const res = await waybillAutomationSyncStatus();
      if (res.code === 200) {
        const startInProgress = res.data?.startInProgress;
        const cancelInProgress = res.data?.cancelInProgress;
        const confirmVerificationInProgress =
          res.data?.confirmVerificationInProgress;
        const confirmDeliveryInProgress = res.data?.confirmDeliveryInProgress;
        const updateWaybillInProgress = res.data?.updateWaybillInProgress;
        setSyncStartLoading(startInProgress);
        setSyncCancelLoading(cancelInProgress);
        setSyncVerifiLoading(confirmVerificationInProgress);
        setSyncDeliveryLoading(confirmDeliveryInProgress);
        setSyncUpdateWaybillLoading(updateWaybillInProgress);
        if (
          cancelInProgress ||
          startInProgress ||
          confirmVerificationInProgress ||
          confirmDeliveryInProgress ||
          updateWaybillInProgress
        ) {
          time.current = setTimeout(handle, 5 * 1000);
        } else {
          clearTimeout(time.current);
          time.current = undefined;
          return;
        }
        if (
          !cancelInProgress ||
          !startInProgress ||
          !confirmVerificationInProgress ||
          !confirmDeliveryInProgress ||
          !updateWaybillInProgress
        ) {
          fetchResult();
        }
      }
    };
    // 查询结果
    fetchResult();
    // 查询状态
    handle();
  };

  const onSync = async (
    type: 'start' | 'cancel' | 'verifi' | 'delivery' | 'update',
  ) => {
    switch (type) {
      case 'start':
        setSyncStartLoading(true);
        await waybillAutomationSync(true);
        break;
      case 'cancel':
        setSyncCancelLoading(true);
        await waybillAutomationSync(false);
        break;
      case 'verifi':
        setSyncVerifiLoading(true);
        await waybillAutomationVerification();
        break;
      case 'delivery':
        setSyncDeliveryLoading(true);
        await waybillAutomationDelivery();
        break;
      case 'update':
        setSyncUpdateWaybillLoading(true);
        await waybillAutomationUpdate();
        break;
    }
    if (!time?.current) {
      await startPolling();
    }
  };

  const ResultListItem = useCallback(
    ({
      list,
    }: {
      list: {
        title: string;
        number: number;
        errorNumber: number;
        resultDate: string;
      }[];
    }) => {
      return list?.map((item) => {
        if (item.number >= 0 && !item.errorNumber) {
          return (
            <div className="status" key={item.title}>
              <span className="success">
                <CheckCircleFilled />
                {`${item?.resultDate ? item?.resultDate : ''} ${item?.title} waybill ${item.number} succeeded`}
              </span>
            </div>
          );
        }
        if (item.errorNumber && !item.number) {
          return (
            <div className="status" key={item.title}>
              <span className="fail">
                <CloseCircleFilled />
                {`${item?.resultDate ? item?.resultDate : ''} ${item?.title} waybill ${item?.errorNumber} failed`}
              </span>
            </div>
          );
        }
        if (item.errorNumber && item.number) {
          return (
            <div className="status" key={item.title}>
              <span className="fail">
                <ExclamationCircleFilled style={{ color: '#FAAD14' }} />
                {`${item?.resultDate ? item?.resultDate : null} ${item?.title} waybill ${item?.errorNumber} failed, ${item?.number} succeeded`}
              </span>
            </div>
          );
        }
        return <></>;
      });
    },
    [resultRes],
  );

  const onUpdateWaybill = useCallback(() => {
    window.open(updateUrl, '_blank');
  }, [updateUrl]);

  const getUpdateWaybillLink = async () => {
    setInitialing(true);
    const res = await waybillAutomationUpdateWaybillLink().finally(() => {
      setInitialing(false);
    });
    if (res.code === 200) {
      setUpdateUrl(res.data.batchUpdateUrl);
    }
  };

  useEffect(() => {
    getUpdateWaybillLink();
    startPolling();
    return () => {
      clearTimeout(time?.current);
      time.current = undefined;
    };
  }, []);

  return (
    <>
      <div className={cls('waybill-automation', styles.waybillAutomation)}>
        <div className="content">
          <div className="tips">
            <div className="title">Tips</div>
            <div className="tips-content">
              <div className="tips-content-line">
                Click [Sync Data] to start processing. After synchronization
                starts, you can go to other pages or close the page without
                affecting the processing results
              </div>
            </div>
          </div>
          {/* Shoppe and Flash  */}
          <Access
            accessible={
              access[PermissionEnum.WAYBILL_AUTOMATION_OPERATION_SHOPEE_FLASH]
            }
          >
            <div className="operationContent">
              <Spin spinning={initialing}>
                <div className="operationWrap" style={{ height: '100%' }}>
                  <p className="projectTitle">
                    Allowed for All projects of Shopee and Flash
                  </p>
                  <div className="operation">
                    <Access accessible={true}>
                      <div className="operationBtn">
                        <Button
                          size="large"
                          style={{ width: '198px', height: '48px' }}
                          onClick={onUpdateWaybill}
                          disabled={syncUpdateWaybillLoading}
                        >
                          Update Waybill
                        </Button>
                        <Button
                          size="large"
                          style={{ width: '198px', height: '48px' }}
                          type="primary"
                          onClick={() => {
                            onSync('update');
                          }}
                          loading={syncUpdateWaybillLoading}
                        >
                          <div className="operationBtnText">
                            Sync from Sheet
                            {resBtnData.updateDate ? (
                              <div style={{ fontSize: '14px' }}>
                                {resBtnData.updateDate}
                              </div>
                            ) : null}
                          </div>
                        </Button>
                      </div>
                    </Access>

                    <Access accessible={true}>
                      <div className="operationBtn">
                        <Button
                          size="large"
                          style={{ width: '198px', height: '48px' }}
                          onClick={onConfirmDelivery}
                          disabled={syncDeliveryLoading}
                        >
                          Confirm Delivery
                        </Button>
                        <Button
                          size="large"
                          type="primary"
                          style={{ width: '198px', height: '48px' }}
                          onClick={() => {
                            onSync('delivery');
                          }}
                          loading={syncDeliveryLoading}
                        >
                          <div className="operationBtnText">
                            Sync from Sheet
                            {resBtnData?.confirmDeliveryDate ? (
                              <div style={{ fontSize: '14px' }}>
                                {resBtnData?.confirmDeliveryDate}
                              </div>
                            ) : null}
                          </div>
                        </Button>
                      </div>
                    </Access>
                    <Access accessible={true}>
                      <div className="operationBtn">
                        <Button
                          size="large"
                          style={{ width: '198px', height: '48px' }}
                          onClick={onVerification}
                          disabled={syncVerifiLoading}
                        >
                          Confirm POD Verification
                        </Button>
                        <Button
                          size="large"
                          type="primary"
                          style={{ width: '198px', height: '48px' }}
                          onClick={() => {
                            onSync('verifi');
                          }}
                          loading={syncVerifiLoading}
                        >
                          <div className="operationBtnText">
                            Sync from Sheet
                            {resBtnData?.confirmVerificationDate ? (
                              <div style={{ fontSize: '14px' }}>
                                {resBtnData?.confirmVerificationDate}
                              </div>
                            ) : null}
                          </div>
                        </Button>
                      </div>
                    </Access>
                  </div>
                </div>
              </Spin>
              <div className="result">
                <div className="result-title">
                  Last processing res：
                  <Button
                    onClick={fetchShopeeFlashResult}
                    icon={<SyncOutlined />}
                  >
                    Sync Data
                  </Button>
                </div>
                <div className="result-info">
                  {resultShopeeFlashLoading ? (
                    <Spin spinning={true} />
                  ) : (
                    <>
                      <ResultListItem list={resultRes?.shopeeFlash ?? []} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </Access>
          <Access
            accessible={
              access[
                PermissionEnum.WAYBILL_AUTOMATION_OPERATION_SHOPPE_LAST_MILE
              ]
            }
          >
            <div className="operationContent">
              <div className="operationWrap">
                <p className="projectTitle">Allowed for SHOPPE-Last mile</p>
                <div className="operation">
                  <Access accessible={true}>
                    <div className="operationBtn">
                      <Button
                        size="large"
                        style={{ width: '198px', height: '48px' }}
                        onClick={onStart}
                        disabled={syncStartLoading}
                      >
                        Confirm Delivery
                      </Button>
                      <Button
                        size="large"
                        type="primary"
                        style={{ width: '198px', height: '48px' }}
                        onClick={() => {
                          onSync('start');
                        }}
                        loading={syncStartLoading}
                      >
                        <div className="operationBtnText">
                          Sync from Sheet
                          {resBtnData?.resultStartDate ? (
                            <div style={{ fontSize: '14px' }}>
                              {resBtnData?.resultStartDate}
                            </div>
                          ) : null}
                        </div>
                      </Button>
                    </div>
                  </Access>
                  <Access accessible={true}>
                    <div className="operationBtn">
                      <Button
                        size="large"
                        style={{ width: '198px', height: '48px' }}
                        onClick={onCancel}
                        disabled={syncCancelLoading}
                      >
                        Cancel Waybill
                      </Button>
                      <Button
                        size="large"
                        type="primary"
                        style={{ width: '198px', height: '48px' }}
                        onClick={() => {
                          onSync('cancel');
                        }}
                        loading={syncCancelLoading}
                      >
                        <div className="operationBtnText">
                          Sync from Sheet
                          {resBtnData?.resultCancelDate ? (
                            <div style={{ fontSize: '14px' }}>
                              {resBtnData?.resultCancelDate}
                            </div>
                          ) : null}
                        </div>
                      </Button>
                    </div>
                  </Access>
                </div>
              </div>
              <div className="result">
                <div className="result-title">
                  Last processing res：
                  <Button
                    onClick={fetchShoppeLastMileResult}
                    icon={<SyncOutlined />}
                  >
                    Sync Data
                  </Button>
                </div>
                <div className="result-info">
                  {resultShoppeLastMileLoading ? (
                    <Spin spinning={true} />
                  ) : (
                    <>
                      <ResultListItem list={resultRes?.shoppeLastMile ?? []} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </Access>
        </div>
      </div>
    </>
  );
};

export default WaybillAutomation;
