import { subtaskDetailList } from '@/api/subtask';
import { IProcInstDetail } from '@/api/types/subtask';
import BreadcrumbCase from '@/components/CustomBreadcrumb';
import { PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { useModel, useParams } from '@umijs/max';
import { Spin } from 'antd';
import { useContext, useEffect, useState } from 'react';
import ProcessExecution from '../components/ProcessExecution';
import SubtaskDetailHeader from '../components/SubtaskDetailHeader';
import {
  EVENT_SUBTASK_DETAIL_RELOAD,
  EVENT_SUBTASK_DRAWER_LOADING,
} from '../events';

const SubtaskDetail = () => {
  // const access = useAccess();
  const { subscribe, publish } = useContext(PubSubContext);
  const { id: subtaskId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<IProcInstDetail>({} as IProcInstDetail);
  const countryId =
    useModel('@@initialState')?.initialState?.currentUser?.countryId;

  const getDetail = async () => {
    setLoading(true);
    publish(EVENT_SUBTASK_DRAWER_LOADING, true);

    const res = await subtaskDetailList({
      procInstId: +subtaskId!,
      countryId: +countryId!,
    });
    setLoading(false);
    publish(EVENT_SUBTASK_DRAWER_LOADING, false);
    if (res.code === 200) {
      setDetail(res.data);
    }
  };

  useEffect(() => {
    getDetail();
  }, [subtaskId]);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_SUBTASK_DETAIL_RELOAD, () => {
      getDetail();
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Spin spinning={loading}>
        <BreadcrumbCase
          items={[
            { name: 'Financial Process Subtask', path: PATHS.SUBTASK_LIST },
            { name: 'Subtask Detail', path: PATHS.SUBTASK_LIST_DETAIL },
          ]}
        />

        <SubtaskDetailHeader detail={detail} />
        <ProcessExecution
          executionNodes={detail?.executionNodes}
          buData={{
            buId: detail?.buId,
            buType: detail?.buType,
            subtaskName: detail?.subtaskName,
            status: detail?.status,
            processScopeName: detail?.processScopeName,
          }}
        />
      </Spin>
    </>
  );
};

export default SubtaskDetail;
