import { PermissionEnum } from '@/enums/permission';
import {
  ArrowsAltOutlined,
  CalendarOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ShrinkOutlined,
} from '@ant-design/icons';
import { Access, useAccess } from '@umijs/max';
import { useKeyPress } from 'ahooks';
import { Col, DatePicker, Flex, Row, Select, Switch } from 'antd';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

// 导入优化后的模块
import ChartContainer from './components/ChartContainer';
import IframeChart from './components/IframeChart';
import {
  COUNTRIES,
  COUNTRY_OPTIONS,
  CountryType,
  DATE_TEXT,
  MONTHS_OPTIONS,
  PANEL_IDS,
  THEME_OPTIONS,
} from './constants';
import { useMultipleChartRefs } from './hooks/useChartRefs';
import { MapDateState } from './types';
import {
  buildFrameSrcUrl,
  buildFrameSrcUrlForHistoryMap,
  getDisabledDate,
  showDaysAgo,
  showMonthsAgo,
} from './utils';

dayjs.extend(utc);
dayjs.extend(timezone);

const { RangePicker } = DatePicker;

const DashboardKpi: React.FC = () => {
  const access = useAccess();

  // 状态管理
  const [mapDate, setMapDate] = useState<MapDateState>({
    mapStartDate: '',
    mapEndDate: '',
  });
  const [country, setCountry] = useState<string>('Thailand');
  const [theme, setTheme] = useState('dark');
  const [dateNumber, setDateNumber] = useState(0);
  const [dateSelected, setDateSelected] = useState(true);
  const [mapSingleEnable, setMapSingleEnable] = useState(true);

  // 使用优化后的图表引用管理
  const chartRefs = useMultipleChartRefs();

  // 工具函数
  const disabledDate = getDisabledDate(country as CountryType);

  const handleShowDaysAgo = (days: number) => {
    const result = showDaysAgo(days, country as CountryType);
    setMapDate(result);
  };

  const handleShowMonthsAgo = (months: number) => {
    const result = showMonthsAgo(
      months,
      country as CountryType,
      mapSingleEnable,
    );
    setMapDate(result);
  };

  const buildFrameSrcUrl_ = (panelId: number) => {
    return buildFrameSrcUrl(panelId, country as CountryType, mapDate, theme);
  };

  const buildFrameSrcUrlForHistoryMap_ = (panelId: number) => {
    return buildFrameSrcUrlForHistoryMap(
      panelId,
      country as CountryType,
      mapDate,
      theme,
    );
  };

  // 副作用处理
  useEffect(() => {
    const timer = setInterval(
      () => {
        if (dateSelected) {
          handleShowDaysAgo(dateNumber);
        }
      },
      1000 * 60 * 10,
    ); // 每10分钟更新一次时间

    return () => clearInterval(timer);
  }, [dateSelected, dateNumber, country]);

  useEffect(() => {
    if (dateSelected) {
      handleShowDaysAgo(dateNumber);
    }
  }, []);

  // 键盘快捷键处理
  useKeyPress('v', () => {
    Object.values(chartRefs).forEach((chartRef) => {
      if (chartRef.isHovering) {
        chartRef.toggleFullscreen();
      }
    });
  });

  return (
    <div className={styles.dashboardKpi}>
      <Flex justify={'space-between'}>
        <div>
          <span>Date: </span>
          <Select
            style={{ width: 180, marginRight: 15 }}
            onSelect={(value) => {
              setDateNumber(value);
              setDateSelected(true);
              handleShowDaysAgo(value);
            }}
            value={dateNumber}
            options={DATE_TEXT.map((text, index) => ({
              value: index,
              label: text,
            }))}
          />
          <span>Country: </span>
          <Select
            defaultValue={'Thailand'}
            style={{ width: 130, marginRight: 15 }}
            onSelect={(value) => {
              setCountry(value as string);
            }}
            options={COUNTRY_OPTIONS}
          />
          <span>Time Range: </span>
          <Switch
            style={{ marginRight: 5 }}
            checkedChildren="Single"
            unCheckedChildren="Recent"
            defaultChecked
            onChange={(checked: boolean) => setMapSingleEnable(checked)}
          />
          <Select
            placeholder="months ago"
            style={{ width: 120 }}
            onSelect={(value) => {
              setDateSelected(false);
              handleShowMonthsAgo(value);
            }}
            options={MONTHS_OPTIONS}
          />
          <span> OR </span>
          <RangePicker
            disabledDate={disabledDate}
            onChange={(dates: any, dateStrings: any) => {
              setMapDate({
                mapStartDate: dateStrings[0],
                mapEndDate: dateStrings[1],
              });
              setDateSelected(false);
            }}
          />
        </div>
        <div>
          <span>Theme: </span>
          <Select
            defaultValue={'dark'}
            style={{ width: 100, marginRight: 15 }}
            onSelect={(value) => {
              setTheme(value as string);
            }}
            options={THEME_OPTIONS}
          />
        </div>
      </Flex>

      <div className="report-container" ref={chartRefs.ref1_4.ref}>
        <section className="region-case">
          <div
            ref={chartRefs.ref1_3.ref}
            style={{
              minHeight: '500px',
              height: chartRefs.ref1_4.isFullscreen
                ? '100vh'
                : 'calc(100vh - 136px)',
            }}
          >
            <div className={styles.dateTimeMapHeader}>
              <div>
                <CalendarOutlined />
                <span>
                  {!dateSelected
                    ? mapDate.mapStartDate + ' to ' + mapDate.mapEndDate
                    : DATE_TEXT[dateNumber] + '  ' + mapDate.mapStartDate}
                </span>
              </div>
            </div>

            {chartRefs.ref1_3.isFullscreen ? (
              <ShrinkOutlined
                className={styles.fullscreenBtn2}
                style={{ right: '10px' }}
                onClick={chartRefs.ref1_3.toggleFullscreen}
              />
            ) : (
              <ArrowsAltOutlined
                className={styles.fullscreenBtn2}
                style={{ right: 'calc(25% + 5px)' }}
                onClick={chartRefs.ref1_3.toggleFullscreen}
              />
            )}

            {chartRefs.ref1_4.isFullscreen ? (
              <FullscreenExitOutlined
                className={styles.fullscreenBtn2}
                style={{ top: '50px', right: 'calc(25% + 5px)' }}
                onClick={chartRefs.ref1_4.toggleFullscreen}
              />
            ) : (
              <FullscreenOutlined
                className={styles.fullscreenBtn2}
                style={{ top: '50px', right: 'calc(25% + 5px)' }}
                onClick={chartRefs.ref1_4.toggleFullscreen}
              />
            )}

            {country === COUNTRIES.GLOBAL ? (
              <IframeChart
                src={buildFrameSrcUrlForHistoryMap_(
                  PANEL_IDS.HISTORY_MAP_GLOBAL,
                )}
                className="grafana-iframe"
              />
            ) : country === COUNTRIES.THAILAND ? (
              dateSelected ? (
                <IframeChart
                  src={buildFrameSrcUrl_(PANEL_IDS.THAILAND_DAILY)}
                  className="grafana-iframe"
                />
              ) : (
                <IframeChart
                  src={buildFrameSrcUrlForHistoryMap_(
                    PANEL_IDS.HISTORY_MAP_THAILAND,
                  )}
                  className="grafana-iframe"
                />
              )
            ) : dateSelected ? (
              <IframeChart
                src={buildFrameSrcUrl_(PANEL_IDS.PHILIPPINES_DAILY)}
              />
            ) : (
              <IframeChart
                src={buildFrameSrcUrlForHistoryMap_(
                  PANEL_IDS.HISTORY_MAP_PHILIPPINES,
                )}
                className="grafana-iframe"
              />
            )}
          </div>
          <div className="float-left">
            <div
              className={
                country === COUNTRIES.GLOBAL
                  ? 'column-wrap-global'
                  : 'column-wrap'
              }
            >
              {/*Daily waybill*/}
              <ChartContainer
                chartRef={chartRefs.ref1_1.ref}
                isFullscreen={chartRefs.ref1_1.isFullscreen}
                toggleFullscreen={chartRefs.ref1_1.toggleFullscreen}
                className={
                  country === COUNTRIES.GLOBAL ? undefined : 'column-item'
                }
                style={
                  country === COUNTRIES.GLOBAL
                    ? { height: 'calc((100vh - 136px) / 3)' }
                    : undefined
                }
              >
                <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.DAILY_WAYBILL)} />
              </ChartContainer>

              {country !== COUNTRIES.GLOBAL && (
                <>
                  <ChartContainer
                    chartRef={chartRefs.ref1_5.ref}
                    isFullscreen={chartRefs.ref1_5.isFullscreen}
                    toggleFullscreen={chartRefs.ref1_5.toggleFullscreen}
                  >
                    <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.PANEL_44)} />
                  </ChartContainer>

                  <ChartContainer
                    chartRef={chartRefs.ref1_6.ref}
                    isFullscreen={chartRefs.ref1_6.isFullscreen}
                    toggleFullscreen={chartRefs.ref1_6.toggleFullscreen}
                  >
                    <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.PANEL_45)} />
                  </ChartContainer>
                </>
              )}

              {country === COUNTRIES.GLOBAL && (
                <>
                  <ChartContainer
                    chartRef={chartRefs.ref1_6.ref}
                    isFullscreen={chartRefs.ref1_6.isFullscreen}
                    toggleFullscreen={chartRefs.ref1_6.toggleFullscreen}
                    className={
                      country === COUNTRIES.GLOBAL ? undefined : 'column-item'
                    }
                    style={
                      country === COUNTRIES.GLOBAL
                        ? { height: 'calc((100vh - 136px) / 3)' }
                        : undefined
                    }
                  >
                    <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.PANEL_44)} />
                  </ChartContainer>
                </>
              )}
            </div>
          </div>

          <div className="float-right">
            <div
              className={
                country === COUNTRIES.GLOBAL
                  ? 'column-wrap-global'
                  : 'column-wrap'
              }
            >
              {/*waybill trend*/}
              <ChartContainer
                chartRef={chartRefs.ref1_2.ref}
                isFullscreen={chartRefs.ref1_2.isFullscreen}
                toggleFullscreen={chartRefs.ref1_2.toggleFullscreen}
                className={
                  country === COUNTRIES.GLOBAL ? undefined : 'column-item'
                }
                style={
                  country === COUNTRIES.GLOBAL
                    ? { height: 'calc((100vh - 136px) / 3)' }
                    : undefined
                }
              >
                <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.WAYBILL_TREND)} />
              </ChartContainer>

              {country !== COUNTRIES.GLOBAL && (
                <>
                  <ChartContainer
                    chartRef={chartRefs.ref1_7.ref}
                    isFullscreen={chartRefs.ref1_7.isFullscreen}
                    toggleFullscreen={chartRefs.ref1_7.toggleFullscreen}
                  >
                    <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.PANEL_41)} />
                  </ChartContainer>

                  <ChartContainer
                    chartRef={chartRefs.ref1_8.ref}
                    isFullscreen={chartRefs.ref1_8.isFullscreen}
                    toggleFullscreen={chartRefs.ref1_8.toggleFullscreen}
                  >
                    <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.PANEL_39)} />
                  </ChartContainer>
                </>
              )}

              {country === COUNTRIES.GLOBAL && (
                <>
                  <ChartContainer
                    chartRef={chartRefs.ref1_6.ref}
                    isFullscreen={chartRefs.ref1_6.isFullscreen}
                    toggleFullscreen={chartRefs.ref1_6.toggleFullscreen}
                    className={
                      country === COUNTRIES.GLOBAL ? undefined : 'column-item'
                    }
                    style={
                      country === COUNTRIES.GLOBAL
                        ? { height: 'calc((100vh - 136px) / 3)' }
                        : undefined
                    }
                  >
                    <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.PANEL_45)} />
                  </ChartContainer>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <Access accessible={access[PermissionEnum.MONTHLY_DELIVERED_PANEL]}>
        <Row gutter={16}>
          <Col span={24}>
            <div style={{ height: '250px' }}>
              <IframeChart
                src={buildFrameSrcUrl_(PANEL_IDS.MONTHLY_DELIVERED)}
              />
            </div>
          </Col>
        </Row>
      </Access>

      <Row gutter={16}>
        <Col span={12}>
          {/*active project*/}
          <ChartContainer
            chartRef={chartRefs.ref2_1.ref}
            isFullscreen={chartRefs.ref2_1.isFullscreen}
            toggleFullscreen={chartRefs.ref2_1.toggleFullscreen}
            style={{ height: '400px' }}
          >
            <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.ACTIVE_PROJECT)} />
          </ChartContainer>
        </Col>
        <Col span={12}>
          {/*active customer*/}
          <ChartContainer
            chartRef={chartRefs.ref2_2.ref}
            isFullscreen={chartRefs.ref2_2.isFullscreen}
            toggleFullscreen={chartRefs.ref2_2.toggleFullscreen}
            style={{ height: '400px' }}
          >
            <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.ACTIVE_CUSTOMER)} />
          </ChartContainer>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          {/*active vendor*/}
          <ChartContainer
            chartRef={chartRefs.ref2_3.ref}
            isFullscreen={chartRefs.ref2_3.isFullscreen}
            toggleFullscreen={chartRefs.ref2_3.toggleFullscreen}
            style={{ height: '400px' }}
          >
            <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.ACTIVE_VENDOR)} />
          </ChartContainer>
        </Col>
        <Col span={12}>
          {/*active truck type*/}
          <ChartContainer
            chartRef={chartRefs.ref2_4.ref}
            isFullscreen={chartRefs.ref2_4.isFullscreen}
            toggleFullscreen={chartRefs.ref2_4.toggleFullscreen}
            style={{ height: '400px' }}
          >
            <IframeChart src={buildFrameSrcUrl_(PANEL_IDS.ACTIVE_TRUCK_TYPE)} />
          </ChartContainer>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardKpi;
