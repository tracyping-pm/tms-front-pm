import { ArrowsAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { useFullscreen, useHover, useKeyPress } from 'ahooks';
import { Col, Flex, Input, Row, Select } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';

dayjs.extend(utc);
dayjs.extend(timezone);

const panelIdMapping: { [key: string]: number } = {
  numberOfUserAccessToday: 42,
  numberOfOnlineUsers: 40,
  numberOfOnlineUsersTrend: 39,
  userViewRankingToday: 41,
  numberOfApiCallTrendByDepartment: 43,
  moduleUsageMonitor: 44,
  numberOfACertainUserTrend: 45,
};
const frameSrcPrefixMapping =
  'https://grafana-intl-sg-r0v3jukq201.grafana.aliyuncs.com/d-solo/fa188787-a35f-419b-9477-163b30a473e6/adoption-monitor-live';

const AdoptionDashboard: React.FC = () => {
  const [theme, setTheme] = useState<string>('dark');
  const [country, setCountry] = useState<string>('Thailand');

  const [mapDate, setMapDate] = useState<{
    mapStartDate: number;
    mapEndDate: number;
  }>({
    mapStartDate: 0,
    mapEndDate: 0,
  });
  const [dateSelected, setDateSelected] = useState<boolean>(true);
  const [userEmail, setUseEmail] = useState<string>();

  const ref1_1 = useRef(null);
  const ref1_2 = useRef(null);
  const ref1_3 = useRef(null);
  const ref2_1 = useRef(null);
  const ref2_2 = useRef(null);
  const ref3_1 = useRef(null);
  const ref3_2 = useRef(null);

  const [isFullscreen1_1, { toggleFullscreen: toggleFullscreen1_1 }] =
    useFullscreen(ref1_1, { pageFullscreen: true });
  const [isFullscreen1_2, { toggleFullscreen: toggleFullscreen1_2 }] =
    useFullscreen(ref1_2, { pageFullscreen: true });
  const [isFullscreen1_3, { toggleFullscreen: toggleFullscreen1_3 }] =
    useFullscreen(ref1_3, { pageFullscreen: true });
  const [isFullscreen2_1, { toggleFullscreen: toggleFullscreen2_1 }] =
    useFullscreen(ref2_1, { pageFullscreen: true });
  const [isFullscreen2_2, { toggleFullscreen: toggleFullscreen2_2 }] =
    useFullscreen(ref2_2, { pageFullscreen: true });
  const [isFullscreen3_1, { toggleFullscreen: toggleFullscreen3_1 }] =
    useFullscreen(ref3_1, { pageFullscreen: true });
  const [isFullscreen3_2, { toggleFullscreen: toggleFullscreen3_2 }] =
    useFullscreen(ref3_2, { pageFullscreen: true });

  const isHovering1_1 = useHover(ref1_1);
  const isHovering1_2 = useHover(ref1_2);
  const isHovering1_3 = useHover(ref1_3);
  const isHovering2_1 = useHover(ref2_1);
  const isHovering2_2 = useHover(ref2_2);
  const isHovering3_1 = useHover(ref3_1);
  const isHovering3_2 = useHover(ref3_2);

  const buildLastTime = (value: string) => {
    const utcDate = dayjs.utc();
    const zone = country === 'Thailand' ? 'Asia/Bangkok' : 'Asia/Manila';
    const localDate = utcDate.tz(zone);

    const lastStartTimeObj: { [key: string]: dayjs.Dayjs } = {
      'Last 12 Hours': localDate.add(-12, 'h'),
      'Last 24 Hours': localDate.add(-24, 'h'),
      'Last 2 Days': localDate.add(-2, 'd'),
      'Last 7 Days': localDate.add(-7, 'd'),
    };
    const start = lastStartTimeObj[value].format('YYYY-MM-DD HH:mm:ss');
    const end = localDate.format('YYYY-MM-DD HH:mm:ss');
    setMapDate({
      mapStartDate: dayjs(start).tz(zone).valueOf(),
      mapEndDate: dayjs(end).tz(zone).valueOf(),
    });

    setDateSelected(false);
  };

  const buildFrameSrcUrl = useCallback(
    (panelName: string) => {
      if (!mapDate.mapStartDate || !mapDate.mapEndDate || !country) {
        return;
      }

      let panelId = panelIdMapping[panelName];
      const url = `${frameSrcPrefixMapping}?
      orgId=1&refresh=5m&var-application=live-tms&var-country=${country}&from=${mapDate.mapStartDate}&to=${mapDate.mapEndDate}&theme=${theme}&panelId=${panelId}`;
      return url;
    },
    [mapDate, theme, country],
  );
  const buildFrameSrcUrlNoTime = useCallback(
    (panelName: string) => {
      if (!country) {
        return;
      }

      let panelId = panelIdMapping[panelName];
      const url = `${frameSrcPrefixMapping}?
      orgId=1&refresh=5m&var-application=live-tms&var-country=${country}&theme=${theme}&panelId=${panelId}`;
      return url;
    },
    [theme, country],
  );

  const buildFrameEmailSrcUrl = useCallback(
    (panelName: string) => {
      if (!mapDate.mapStartDate || !mapDate.mapEndDate || !country) {
        return;
      }

      let panelId = panelIdMapping[panelName];
      const url = `${frameSrcPrefixMapping}?
      orgId=1&refresh=5m&var-application=live-tms&var-country=${country}&var-user_email=${userEmail}&from=${mapDate.mapStartDate}&to=${mapDate.mapEndDate}&theme=${theme}&panelId=${panelId}`;

      return url;
    },
    [mapDate, theme, userEmail, country],
  );

  const showDaysAgo = () => {
    const utcDate = dayjs.utc();
    const zone = country === 'Thailand' ? 'Asia/Bangkok' : 'Asia/Manila';
    const localDate = utcDate.tz(zone);
    const start = localDate.add(-24, 'h').format('YYYY-MM-DD HH:mm:ss');
    const end = localDate.format('YYYY-MM-DD HH:mm:ss');
    setMapDate({
      mapStartDate: dayjs(start).tz(zone).valueOf(),
      mapEndDate: dayjs(end).tz(zone).valueOf(),
    });
  };

  // Note：var-date 不会自动推进，需要处理推进机制
  useEffect(() => {
    const timer = setInterval(
      () => {
        if (dateSelected) {
          showDaysAgo();
        }
      },
      1000 * 60 * 10,
    ); // 每10分钟更新一次时间

    return () => clearInterval(timer); // 清理函数
  }, [dateSelected]);

  useEffect(() => {
    showDaysAgo();
  }, []);

  useKeyPress('v', () => {
    if (isHovering1_1) {
      toggleFullscreen1_1();
    }
    if (isHovering1_2) {
      toggleFullscreen1_2();
    }
    if (isHovering1_3) {
      toggleFullscreen1_2();
    }
    if (isHovering2_1) {
      toggleFullscreen2_1();
    }
    if (isHovering2_2) {
      toggleFullscreen2_2();
    }
    if (isHovering3_1) {
      toggleFullscreen3_1();
    }
    if (isHovering3_2) {
      toggleFullscreen3_2();
    }
  });

  return (
    <div className={styles.adoptionDashboard}>
      <Flex justify={'space-between'}>
        <div>
          <span>Country: </span>
          <Select
            defaultValue={'Thailand'}
            style={{ width: 130, marginRight: 15 }}
            onSelect={(value) => {
              setCountry(value);
            }}
            options={[
              {
                value: 'Thailand',
                label: 'Thailand',
              },
              {
                value: 'Philippines',
                label: 'Philippines',
              },
            ]}
          />
          <span>Time: </span>
          <Select
            defaultValue={'Last 24 Hours'}
            style={{ width: 130, marginRight: 15 }}
            onSelect={(value) => {
              buildLastTime(value);
            }}
            options={[
              {
                value: 'Last 12 Hours',
                label: 'Last 12 Hours',
              },
              {
                value: 'Last 24 Hours',
                label: 'Last 24 Hours',
              },
              {
                value: 'Last 2 Days',
                label: 'Last 2 Days',
              },
              {
                value: 'Last 7 Days',
                label: 'Last 7 Days',
              },
            ]}
          />
        </div>
        <div>
          <span>Theme: </span>
          <Select
            defaultValue={'dark'}
            style={{ width: 100, marginRight: 15 }}
            onSelect={(value, option) => {
              setTheme(option.label);
            }}
            options={[
              {
                value: '1',
                label: 'light',
              },
              {
                value: '2',
                label: 'dark',
              },
            ]}
          />
        </div>
      </Flex>

      <Row gutter={16}>
        <Col span={6}>
          <div style={{ height: '300px' }} ref={ref1_1}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen1_1}>
              {isFullscreen1_1 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrlNoTime('numberOfUserAccessToday')}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
        <Col span={6}>
          <div style={{ height: '300px' }} ref={ref1_2}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen1_2}>
              {isFullscreen1_2 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrlNoTime('numberOfOnlineUsers')}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
        <Col span={12}>
          <div style={{ height: '300px' }} ref={ref1_3}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen1_3}>
              {isFullscreen1_3 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrl('numberOfOnlineUsersTrend')}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ height: '500px' }} ref={ref2_1}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen2_1}>
              {isFullscreen2_1 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrl('userViewRankingToday')}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
        <Col span={12}>
          <div style={{ height: '500px' }} ref={ref2_2}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen2_2}>
              {isFullscreen2_2 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrl('numberOfApiCallTrendByDepartment')}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <div style={{ height: '500px' }} ref={ref3_1}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen3_1}>
              {isFullscreen3_1 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrl('moduleUsageMonitor')}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
        <Col span={12}>
          <div style={{ height: '450px', border: 'none' }} ref={ref3_2}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen3_2}>
              {isFullscreen3_2 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <div
              className={cls(
                styles.certainUserTrendSearch,
                theme === 'light' ? styles.light : styles.dark,
              )}
            >
              <span>User Email: </span>
              <Input
                allowClear
                style={{ width: 300, marginRight: 15 }}
                placeholder="Please Enter User Email"
                onBlur={(event) => {
                  setUseEmail(event.target?.value);
                }}
                onPressEnter={(event) => {
                  setUseEmail(event.currentTarget?.value);
                }}
              />
            </div>
            <iframe
              src={buildFrameEmailSrcUrl('numberOfACertainUserTrend')}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdoptionDashboard;
