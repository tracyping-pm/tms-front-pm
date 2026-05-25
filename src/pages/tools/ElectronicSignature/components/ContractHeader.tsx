import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  HourglassOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { Statistic } from 'antd';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { ReactComponent as SignDetailEmpty } from '../../../../../public/svg/sign_detail_empty.svg';
import styles from './common.less';
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

const { Countdown } = Statistic;
dayjs.extend(utc);
dayjs.extend(timezone);

export default function ContractHeader(props: {
  dateTime: string;
  status: string;
  timeFinish: () => void;
}) {
  const { dateTime, status, timeFinish } = props;
  //@ts-ignore
  const tz = dayjs?.tz?.guess();
  const Element = useCallback(() => {
    switch (status) {
      case 'Pending':
        return (
          <div className={styles.content_right}>
            <HourglassOutlined className={styles.content_top_icon} />
            Time Remaining to Sign: [
            <Countdown
              onFinish={timeFinish}
              format={`DD [${
                (dayjs(dateTime).valueOf() - dayjs().valueOf()) / 86400000 > 1
                  ? 'days'
                  : 'day'
              }] HH:mm:ss`}
              valueStyle={{ fontSize: '14px' }}
              //@ts-ignore
              value={dayjs?.utc(dateTime)?.tz(tz)?.valueOf()}
            />
            ]
          </div>
        );
      case 'Completed':
        return (
          <div className={styles.content_right}>
            <CheckCircleOutlined
              className={styles.content_top_icon}
              style={{ color: '#52C41A' }}
            />
            Completed
          </div>
        );
      case 'Canceled':
        return (
          <div className={styles.content_right}>
            <CloseCircleOutlined
              className={styles.content_top_icon}
              style={{ color: '#BFBFBF' }}
            />
            Canceled
          </div>
        );
      case 'Declined':
        return (
          <div className={styles.content_right}>
            <StopOutlined
              className={styles.content_top_icon}
              style={{ color: '#FF4D4F' }}
            />
            Declined
          </div>
        );
      case 'Expired':
        return (
          <div className={styles.content_right}>
            <ExclamationCircleOutlined
              className={styles.content_top_icon}
              style={{ color: '#FAAD14' }}
            />
            Expired
          </div>
        );
      default:
        return (
          <div className={styles.content_right}>
            <SignDetailEmpty style={{ marginRight: '12px' }} />
            Empty
          </div>
        );
    }
  }, [status]);
  return (
    <div className={styles.content_top}>
      <Element />
    </div>
  );
}
