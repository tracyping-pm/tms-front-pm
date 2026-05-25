import {
  subtaskCancel,
  subtaskOperationLog,
  subtaskRemind,
} from '@/api/subtask';
import { IProcInstDetail } from '@/api/types/subtask';
import DetailHeader from '@/components/DetailHeader';
import OperationLogModal, {
  initialOperationLogModalState,
  IOperationLogModalState,
} from '@/components/OperationLogModal';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import { SubtaskStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { openNewTag } from '@/utils/utils';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HourglassOutlined,
} from '@ant-design/icons';
import {
  Access,
  history,
  useAccess,
  useModel,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { useSetState } from 'ahooks';
import { Affix, App, Button, message, Statistic } from 'antd';
import dayjs from 'dayjs';
import { memo, useCallback, useContext, useMemo } from 'react';
import { EVENT_SUBTASK_DETAIL_RELOAD } from '../events';
import styles from './common.less';

const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { Countdown } = Statistic;
dayjs.extend(utc);
dayjs.extend(timezone);

interface ISubtaskDetailHeader {
  detail: IProcInstDetail;
}

interface IState {
  remindLoading: boolean;
  cancelLoading: boolean;
}

export default memo(function SubtaskDetailHeader({
  detail,
}: ISubtaskDetailHeader) {
  const { modal } = App.useApp();
  const access = useAccess();
  const { publish } = useContext(PubSubContext);
  const userRoleId =
    useModel('@@initialState')?.initialState?.currentUser?.currentUserRole
      .userRoleId;
  //@ts-ignore
  // const tz = dayjs?.tz?.guess();
  const [searchParams] = useSearchParams();
  const { id: subtaskId } = useParams();
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);
  const [state, setState] = useSetState<IState>({
    remindLoading: false,
    cancelLoading: false,
  });

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await subtaskOperationLog({ procInstId: Number(subtaskId) });
    setOperationLogModalState({ loading: false });

    if (res.code === 200) {
      const list =
        res.data?.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          description: item.description,
        })) ?? [];
      setOperationLogModalState({ list, open: true });
    }
  }, [subtaskId]);

  const showCancel = useMemo(() => {
    const assignees = detail?.executionNodes?.find(
      (item) => !item.executed,
    )?.assignees;
    const bol = assignees?.some(
      (item) => item.assigneeId === userRoleId && !item.transferred,
    );
    return bol;
  }, [detail?.executionNodes]);

  const onRemind = useCallback(async () => {
    setState({ remindLoading: true });
    const res = await subtaskRemind({ procInstId: Number(subtaskId) });
    setState({ remindLoading: false });

    if (res.code === 200) {
      message.success('Remind Successfully');
    }
  }, [subtaskId]);

  const onCancel = useCallback(async () => {
    modal.confirm({
      title: `Cancel Subtask`,
      content: 'Do you want to cancel this Subtask?',
      okText: 'Cancel Subtask',
      closable: true,
      cancelButtonProps: {
        style: {
          display: 'none',
        },
      },
      onOk: async () => {
        setState({ cancelLoading: true });
        const res = await subtaskCancel({
          procInstId: Number(subtaskId),
          buId: detail.buId,
        });
        setState({ cancelLoading: false });
        if (res.code === 200) {
          message.success('Cancel Successfully');
          publish(EVENT_SUBTASK_DETAIL_RELOAD);
        }
      },
    });
  }, [subtaskId, detail]);

  const Element = useCallback(() => {
    switch (detail?.status) {
      case SubtaskStatusEnum.IN_PROGRESS:
        return (
          <div className={styles.header_status}>
            <HourglassOutlined className={styles.header_status_icon} />
            Remaining Time:
            <Countdown
              onFinish={() => {}}
              format={`DD [${
                (dayjs(detail?.dueTime).valueOf() -
                  dayjs(detail?.localeTime).valueOf()) /
                  86400000 >
                1
                  ? 'days'
                  : 'day'
              }] HH:mm:ss`}
              valueStyle={{ fontSize: '18px' }}
              //@ts-ignore
              value={dayjs(detail.dueTime)?.valueOf()}
            />
          </div>
        );
      case SubtaskStatusEnum.COMPLETED:
        return (
          <div className={styles.header_status}>
            <CheckCircleOutlined
              className={styles.header_status_icon}
              style={{ color: '#52C41A' }}
            />
            Completed
          </div>
        );
      case SubtaskStatusEnum.CANCELLED:
        return (
          <div className={styles.header_status}>
            <CloseCircleOutlined
              className={styles.header_status_icon}
              style={{ color: '#BFBFBF' }}
            />
            Canceled
          </div>
        );

      default:
        return <></>;
    }
  }, [detail?.status, detail?.localeTime]);

  return (
    <>
      <div className={styles.header}>
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
              <Element />
            </div>

            <div className={styles.header_top_right}>
              <Button
                onClick={() => fetchLogList()}
                loading={operationLogModalState.loading}
              >
                Operation Log
              </Button>

              <Access accessible={access[PermissionEnum.SUBTASK_REMIND]}>
                {detail?.status === SubtaskStatusEnum.IN_PROGRESS ? (
                  <Button onClick={onRemind} loading={state.remindLoading}>
                    Remind
                  </Button>
                ) : null}
              </Access>

              <Button
                onClick={() => {
                  openNewTag(`${PATHS.WAYBILL_LIST_DETAIL}/${detail.buId}`);
                }}
              >
                Waybill
              </Button>

              {detail?.status === SubtaskStatusEnum.IN_PROGRESS &&
              showCancel ? (
                <Button onClick={onCancel} loading={state.cancelLoading}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        </Affix>
        <DetailHeader
          headerName="Subtask Name"
          headerTitle={detail?.subtaskName ?? '-'}
          showEdit={false}
          editClick={() => {}}
          infoList={[
            { label: 'waybillNumber', value: detail?.waybillNumber ?? '-' },

            { label: 'Result', value: detail?.result ?? '-' },
            {
              label: 'Current Progress',
              value: detail?.currentProgress ?? '-',
            },
            { label: 'Status', value: detail?.status ?? '-' },
            {
              label: 'Current Assignee',
              value: detail?.currentAssignees
                ? detail?.currentAssignees?.reduce(
                    (
                      pre: string,
                      cur: { assigneeName: string },
                      index: number,
                    ) => {
                      return `${pre}${index !== 0 ? ',' : ''} ${cur.assigneeName ?? '-'}`;
                    },
                    '',
                  )
                : '-',
            },
            { label: 'Due Time', value: detail?.dueTime ?? '-' },
            { label: 'Creator', value: detail?.creator ?? '-' },
            { label: 'Creation Time', value: detail?.creationTime ?? '-' },
          ]}
        />
      </div>

      <OperationLogModal
        list={operationLogModalState.list}
        open={operationLogModalState.open}
        onConfirm={() => setOperationLogModalState({ open: false })}
        onCancel={() => setOperationLogModalState({ open: false })}
      />
    </>
  );
});
