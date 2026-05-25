import { ES_DTO_CLASS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import {
  AimOutlined,
  ArrowsAltOutlined,
  CalendarOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ShrinkOutlined,
} from '@ant-design/icons';
import { Access, useAccess } from '@umijs/max';
import { useFullscreen, useHover, useKeyPress } from 'ahooks';
import {
  Col,
  DatePicker,
  Flex,
  GetProps,
  Radio,
  RadioChangeEvent,
  Row,
  Select,
  Switch,
} from 'antd';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';

dayjs.extend(utc);
dayjs.extend(timezone);

type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;
const { RangePicker } = DatePicker;

const dateText = ['Today', 'Yesterday', 'Day before yesterday'];

interface Map1 {
  [key: string]: string | undefined;
}

interface Map2 {
  [key: string]: {
    [key: string]: any | number | undefined;
  };
}

const countryMapping: { [key: string]: string } = {
  '1': 'Philippines',
  '2': 'Thailand',
};

const frameSrcPrefixMapping: Map1 = {
  customer:
    'https://grafana-intl-sg-r0v3jukq201.grafana.aliyuncs.com/d-solo/d806674d-b218-465a-af82-94860b203d9e/biz-monitor-live-by-customer',
  project:
    'https://grafana-intl-sg-r0v3jukq201.grafana.aliyuncs.com/d-solo/b2a3a356-fde4-46e3-80cd-33c955f31b7c/biz-monitor-live-by-project',
  vendor:
    'https://grafana-intl-sg-r0v3jukq201.grafana.aliyuncs.com/d-solo/a3c198ed-f286-46ac-8edd-5216c29c33e1/biz-monitor-live-by-vendor',
};

const panelIdMapping: Map2 = {
  map_record: {
    customer: {
      Thailand: 52,
      Philippines: 53,
    },
    project: {
      Thailand: 52,
      Philippines: 53,
    },
    vendor: {
      Thailand: 52,
      Philippines: 53,
    },
  },
  map_history_record: {
    customer: {
      Thailand: 19,
      Philippines: 20,
    },
    project: {
      Thailand: 19,
      Philippines: 20,
    },
    vendor: {
      Thailand: 19,
      Philippines: 20,
    },
  },
  waybill_amount_monthly: {
    customer: 18,
    project: 18,
    vendor: 18,
  },
  waybill_30days_amount: {
    customer: 58,
    project: 58,
    vendor: 58,
  },
  waybill_7days_trend: {
    customer: 60,
    project: 60,
    vendor: 60,
  },
  waybill_status_daily: {
    customer: 44,
    project: 44,
    vendor: 44,
  },
  truck_type_daily: {
    customer: 45,
    project: 45,
    vendor: 45,
  },
  kpi_ratio: {
    customer: 41,
    project: 41,
    vendor: 41,
  },
  kpi_basic: {
    customer: 39,
    project: 39,
    vendor: 39,
  },
  waybill_customer_perspective: {
    customer: 48,
    project: 48,
    vendor: 48,
  },
  waybill_project_perspective: {
    customer: 46,
    project: 46,
    vendor: 46,
  },
  waybill_vendor_perspective: {
    customer: 47,
    project: 47,
    vendor: 47,
  },
  waybill_truck_type_perspective: {
    customer: 51,
    project: 51,
    vendor: 51,
  },
};

const DashboardKpi: React.FC = () => {
  const access = useAccess();
  const [theme, setTheme] = useState<string>('dark');
  const [country, setCountry] = useState<string>('Thailand');
  const [dateNumber, setDateNumber] = useState<number>(0);
  const [mapDate, setMapDate] = useState<{
    mapStartDate: string;
    mapEndDate: string;
  }>({
    mapStartDate: '',
    mapEndDate: '',
  });
  const [mapSingleEnable, setMapSingleEnable] = useState<boolean>(true);
  const [dateSelected, setDateSelected] = useState<boolean>(true);
  const [subTypeShow, setSubTypeShow] = useState<string>('customer');
  const [subType, setSubType] = useState<string>('customer');
  const [customerName, setCustomerName] = useState<string>(
    'SHOPEE (THAILAND) COMPANY LIMITED',
  );
  const [projectName, setProjectName] = useState<string>('');
  const [vendorName, setVendorName] = useState<string>('');

  const perspectiveMapping: Map1 = {
    customer: customerName,
    project: projectName,
    vendor: vendorName,
  };

  const {
    options: customerNameOptions,
    onSearch: customerNameSearch,
    defaultFieldProps: customerNameDefaultFieldProps,
    // value: customerNameValue,
    // setValue: setCustomerNameValue,
  } = useFieldQuery({
    field: 'customerName',
    esDtoClass: ES_DTO_CLASS.CUSTOMER,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
  });
  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
    // value: vendorNameValue,
    // setValue: setVendorNameValue,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
  });
  const {
    options: projectNameOptions,
    onSearch: projectNameSearch,
    defaultFieldProps: projectNameDefaultFieldProps,
    // value: projectNameValue,
    // setValue: setProjectNameValue,
  } = useFieldQuery({
    field: 'projectName',
    esDtoClass: ES_DTO_CLASS.PROJECT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.None,
  });

  const ref1_1 = useRef(null);
  const ref1_2 = useRef(null);
  const ref1_3 = useRef(null);
  const ref1_4 = useRef(null);
  const ref1_5 = useRef(null);
  const ref1_6 = useRef(null);
  const ref1_7 = useRef(null);
  const ref1_8 = useRef(null);
  const ref2_1 = useRef(null);
  const ref2_2 = useRef(null);
  const ref2_3 = useRef(null);
  const ref2_4 = useRef(null);

  const [isFullscreen1_1, { toggleFullscreen: toggleFullscreen1_1 }] =
    useFullscreen(ref1_1, { pageFullscreen: true });
  const [isFullscreen1_2, { toggleFullscreen: toggleFullscreen1_2 }] =
    useFullscreen(ref1_2, { pageFullscreen: true });
  const [isFullscreen1_3, { toggleFullscreen: toggleFullscreen1_3 }] =
    useFullscreen(ref1_3, { pageFullscreen: true });
  const [isFullscreen1_4, { toggleFullscreen: toggleFullscreen1_4 }] =
    useFullscreen(ref1_4, { pageFullscreen: true });
  const [isFullscreen1_5, { toggleFullscreen: toggleFullscreen1_5 }] =
    useFullscreen(ref1_5, { pageFullscreen: true });
  const [isFullscreen1_6, { toggleFullscreen: toggleFullscreen1_6 }] =
    useFullscreen(ref1_6, { pageFullscreen: true });
  const [isFullscreen1_7, { toggleFullscreen: toggleFullscreen1_7 }] =
    useFullscreen(ref1_7, { pageFullscreen: true });
  const [isFullscreen1_8, { toggleFullscreen: toggleFullscreen1_8 }] =
    useFullscreen(ref1_8, { pageFullscreen: true });
  const [isFullscreen2_1, { toggleFullscreen: toggleFullscreen2_1 }] =
    useFullscreen(ref2_1, { pageFullscreen: true });
  const [isFullscreen2_2, { toggleFullscreen: toggleFullscreen2_2 }] =
    useFullscreen(ref2_2, { pageFullscreen: true });
  const [isFullscreen2_3, { toggleFullscreen: toggleFullscreen2_3 }] =
    useFullscreen(ref2_3, { pageFullscreen: true });
  const [isFullscreen2_4, { toggleFullscreen: toggleFullscreen2_4 }] =
    useFullscreen(ref2_4, { pageFullscreen: true });

  const isHovering1_1 = useHover(ref1_1);
  const isHovering1_2 = useHover(ref1_2);
  const isHovering1_3 = useHover(ref1_3);
  const isHovering1_4 = useHover(ref1_4);
  const isHovering1_5 = useHover(ref1_5);
  const isHovering1_6 = useHover(ref1_6);
  const isHovering1_7 = useHover(ref1_7);
  const isHovering1_8 = useHover(ref1_8);
  const isHovering2_1 = useHover(ref2_1);
  const isHovering2_2 = useHover(ref2_2);
  const isHovering2_3 = useHover(ref2_3);
  const isHovering2_4 = useHover(ref2_4);

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days after today and today
    const utcDate = dayjs.utc();
    const zone = country === 'Thailand' ? 'Asia/Bangkok' : 'Asia/Manila';
    const localDate = utcDate.tz(zone);
    return current && current > localDate.startOf('day');
  };

  const buildFrameSrcUrl = useCallback(
    (panelName: string, needFresh: boolean) => {
      if (mapDate.mapStartDate === '' || mapDate.mapEndDate === '') {
        return;
      }
      const refreshConfig = needFresh ? '&refresh=5m' : '';

      let panelId = panelIdMapping[panelName][subType];
      if (panelName === 'map_record' || panelName === 'map_history_record') {
        panelId = panelIdMapping[panelName][subType][country];
      }

      let entityParam = '';
      if (subType === 'customer') {
        entityParam = `&var-customer=${encodeURIComponent(customerName)}`;
      }
      if (subType === 'project') {
        entityParam = `&var-project=${encodeURIComponent(projectName)}`;
      }
      if (subType === 'vendor') {
        entityParam = `&var-vendor=${encodeURIComponent(vendorName)}`;
      }
      return `${frameSrcPrefixMapping[subType]}?
      orgId=1${refreshConfig}${entityParam}&refresh=5m&from=now-5m&to=now&var-application=live-tms&var-country=${country}&var-map_start_date=${mapDate.mapStartDate}&var-map_end_date=${mapDate.mapEndDate}&theme=${theme}&panelId=${panelId}`;
    },
    [mapDate, theme, subType, customerName, projectName, vendorName],
  );

  const showDaysAgo = (days: number) => {
    const timeZone = country === 'Thailand' ? 'Asia/Bangkok' : 'Asia/Manila';
    const nowStr = new Date().toLocaleDateString('en-CA', {
      timeZone: timeZone,
    }); // '2024-11-01'
    const agoDay = new Date(nowStr);
    agoDay.setDate(agoDay.getDate() - days);
    const agoDayStr = agoDay.toLocaleDateString('en-CA');

    setMapDate({
      mapStartDate: agoDayStr,
      mapEndDate: agoDayStr,
    });
  };

  const showMonthsAgo = (months: number) => {
    if (months === 0) {
      return;
    }
    const utcDate = dayjs.utc();
    const zone = country === 'Thailand' ? 'Asia/Bangkok' : 'Asia/Manila';
    const localDate = utcDate.tz(zone);
    const firstDayOfMonthStart = localDate
      .subtract(months - 1, 'month')
      .startOf('month');

    let firstDayOfMonthEnd = localDate;
    if (mapSingleEnable && Number(months) !== 1) {
      firstDayOfMonthEnd = localDate
        .subtract(months - 1, 'month')
        .endOf('month');
    }
    setMapDate({
      mapStartDate: firstDayOfMonthStart.format('YYYY-MM-DD'),
      mapEndDate: firstDayOfMonthEnd.format('YYYY-MM-DD'),
    });
  };

  // Note：var-date 不会自动推进，需要处理推进机制
  useEffect(() => {
    const timer = setInterval(
      () => {
        if (dateSelected) {
          showDaysAgo(dateNumber);
        }
      },
      1000 * 60 * 10,
    ); // 每10分钟更新一次时间

    return () => clearInterval(timer); // 清理函数
  }, [dateSelected]);

  useEffect(() => {
    if (dateSelected) {
      showDaysAgo(dateNumber);
    }
  }, []);

  useKeyPress('v', () => {
    if (isHovering1_1) {
      toggleFullscreen1_1();
    }
    if (isHovering1_2) {
      toggleFullscreen1_2();
    }
    if (isHovering1_3) {
      toggleFullscreen1_3();
    }
    if (isHovering1_4) {
      toggleFullscreen1_4();
    }
    if (isHovering1_5) {
      toggleFullscreen1_5();
    }
    if (isHovering1_6) {
      toggleFullscreen1_6();
    }
    if (isHovering1_7) {
      toggleFullscreen1_7();
    }
    if (isHovering1_8) {
      toggleFullscreen1_8();
    }
    if (isHovering2_1) {
      toggleFullscreen2_1();
    }
    if (isHovering2_2) {
      toggleFullscreen2_2();
    }
    if (isHovering2_3) {
      toggleFullscreen2_3();
    }
    if (isHovering2_4) {
      toggleFullscreen2_4();
    }
  });

  return (
    <div className={styles.dashboardKpi}>
      <Flex justify={'start'}>
        <Radio.Group
          block
          options={[
            { label: 'customer', value: 'customer' },
            { label: 'project', value: 'project' },
            { label: 'vendor', value: 'vendor' },
          ]}
          defaultValue="customer"
          optionType="button"
          onChange={(e: RadioChangeEvent) => setSubTypeShow(e.target.value)}
        />
        {subTypeShow === 'customer' && (
          <Select
            style={{ width: 500, marginLeft: 15 }}
            {...customerNameDefaultFieldProps}
            placeholder="Customer Name"
            options={customerNameOptions}
            value={customerName}
            onSearch={(keywords: string) => {
              customerNameSearch(keywords, {
                uniqueLogic:
                  FieldQueryHighlightUniqueLogicEnum.DASHBOARD_C_P_V_QUERY,
              });
            }}
            onChange={(_, option: any) => {
              setSubType('customer');
              setCustomerName(option.name);
              setCountry(countryMapping[option.countryId]);
            }}
          />
        )}
        {subTypeShow === 'project' && (
          <Select
            style={{ width: 500, marginLeft: 15 }}
            {...projectNameDefaultFieldProps}
            placeholder="Project Name"
            options={projectNameOptions}
            value={projectName}
            onSearch={(keywords: string) => {
              projectNameSearch(keywords, {
                uniqueLogic:
                  FieldQueryHighlightUniqueLogicEnum.DASHBOARD_C_P_V_QUERY,
              });
            }}
            onChange={(_, option: any) => {
              setSubType('project');
              setProjectName(option.name);
              setCountry(countryMapping[option.countryId]);
            }}
          />
        )}
        {subTypeShow === 'vendor' && (
          <Select
            style={{ width: 500, marginLeft: 15 }}
            {...vendorNameDefaultFieldProps}
            placeholder="Vendor Name"
            options={vendorNameOptions}
            value={vendorName}
            onSearch={(keywords: string) => {
              vendorNameSearch(keywords, {
                uniqueLogic:
                  FieldQueryHighlightUniqueLogicEnum.DASHBOARD_C_P_V_QUERY,
              });
            }}
            onChange={(_, option: any) => {
              setSubType('vendor');
              setVendorName(option.name);
              setCountry(countryMapping[option.countryId]);
            }}
          />
        )}
      </Flex>
      <Flex justify={'space-between'}>
        <div>
          <span>Date: </span>
          <Select
            style={{ width: 180, marginRight: 15 }}
            onSelect={(value) => {
              setDateNumber(value);
              setDateSelected(true);
              showDaysAgo(value);
            }}
            value={dateNumber}
            options={[
              {
                value: 0,
                label: dateText[0],
              },
              {
                value: 1,
                label: dateText[1],
              },
              {
                value: 2,
                label: dateText[2],
              },
            ]}
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
              showMonthsAgo(value);
            }}
            options={[
              { value: 1, label: '1' },
              { value: 2, label: 2 },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' },
              { value: 6, label: '6' },
              { value: 7, label: '7' },
              { value: 8, label: '8' },
              { value: 9, label: '9' },
              { value: 10, label: '10' },
              { value: 11, label: '11' },
              { value: 12, label: '12' },
            ]}
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

      <div className="report-container" ref={ref1_4}>
        <section className="region-case">
          <div
            ref={ref1_3}
            style={{
              minHeight: '500px',
              height: isFullscreen1_4 ? '100vh' : 'calc(100vh - 136px)',
            }}
          >
            <div className={styles.dateTimeMapHeader}>
              <div>
                <AimOutlined />
                <span>
                  [{subType}] {perspectiveMapping[subType]} - {country}
                </span>
              </div>
              <div>
                <CalendarOutlined />
                <span>
                  {!dateSelected
                    ? mapDate.mapStartDate + ' to ' + mapDate.mapEndDate
                    : dateText[dateNumber] + '  ' + mapDate.mapStartDate}
                </span>
              </div>
            </div>

            {isFullscreen1_3 ? (
              <ShrinkOutlined
                className={styles.fullscreenBtn2}
                style={{ right: '10px' }}
                onClick={toggleFullscreen1_3}
              />
            ) : (
              <ArrowsAltOutlined
                className={styles.fullscreenBtn2}
                style={{ right: 'calc(25% + 5px)' }}
                onClick={toggleFullscreen1_3}
              />
            )}

            {isFullscreen1_4 ? (
              <FullscreenExitOutlined
                className={styles.fullscreenBtn2}
                style={{ top: '50px', right: 'calc(25% + 5px)' }}
                onClick={toggleFullscreen1_4}
              />
            ) : (
              <FullscreenOutlined
                className={styles.fullscreenBtn2}
                style={{ top: '50px', right: 'calc(25% + 5px)' }}
                onClick={toggleFullscreen1_4}
              />
            )}

            {dateSelected ? (
              <iframe
                className="grafana-iframe"
                src={buildFrameSrcUrl('map_record', true)}
                width={'100%'}
                height={'100%'}
              />
            ) : (
              <iframe
                className="grafana-iframe"
                src={buildFrameSrcUrl('map_history_record', false)}
                width={'100%'}
                height={'100%'}
              />
            )}
          </div>
          <div className="float-left">
            <div className="column-wrap">
              {/*Daily waybill*/}
              <div className="column-item" ref={ref1_1}>
                <div className="fullscreen-wrap" onClick={toggleFullscreen1_1}>
                  {isFullscreen1_1 ? (
                    <ShrinkOutlined className={styles.fullscreenBtn} />
                  ) : (
                    <ArrowsAltOutlined className={styles.fullscreenBtn} />
                  )}
                </div>
                <iframe
                  src={buildFrameSrcUrl('waybill_30days_amount', true)}
                  width={'100%'}
                  height={'100%'}
                />
              </div>
              <div className="column-item" ref={ref1_5}>
                <div className="fullscreen-wrap" onClick={toggleFullscreen1_5}>
                  {isFullscreen1_5 ? (
                    <ShrinkOutlined className={styles.fullscreenBtn} />
                  ) : (
                    <ArrowsAltOutlined className={styles.fullscreenBtn} />
                  )}
                </div>
                <iframe
                  src={buildFrameSrcUrl('waybill_status_daily', true)}
                  width={'100%'}
                  height={'100%'}
                />
              </div>
              <div className="column-item" ref={ref1_6}>
                <div className="fullscreen-wrap" onClick={toggleFullscreen1_6}>
                  {isFullscreen1_6 ? (
                    <ShrinkOutlined className={styles.fullscreenBtn} />
                  ) : (
                    <ArrowsAltOutlined className={styles.fullscreenBtn} />
                  )}
                </div>
                <iframe
                  src={buildFrameSrcUrl('truck_type_daily', true)}
                  width={'100%'}
                  height={'100%'}
                />
              </div>
            </div>
          </div>

          <div className="float-right">
            <div className="column-wrap">
              {/*waybill trend*/}
              <div className="column-item" ref={ref1_2}>
                <div className="fullscreen-wrap" onClick={toggleFullscreen1_2}>
                  {isFullscreen1_2 ? (
                    <ShrinkOutlined className={styles.fullscreenBtn} />
                  ) : (
                    <ArrowsAltOutlined className={styles.fullscreenBtn} />
                  )}
                </div>
                <iframe
                  src={buildFrameSrcUrl('waybill_7days_trend', true)}
                  width={'100%'}
                  height={'100%'}
                />
              </div>

              <div className="column-item" ref={ref1_7}>
                <div className="fullscreen-wrap" onClick={toggleFullscreen1_7}>
                  {isFullscreen1_7 ? (
                    <ShrinkOutlined className={styles.fullscreenBtn} />
                  ) : (
                    <ArrowsAltOutlined className={styles.fullscreenBtn} />
                  )}
                </div>
                <iframe
                  src={buildFrameSrcUrl('kpi_ratio', true)}
                  width={'100%'}
                  height={'100%'}
                />
              </div>
              <div className="column-item" ref={ref1_8}>
                <div className="fullscreen-wrap" onClick={toggleFullscreen1_8}>
                  {isFullscreen1_8 ? (
                    <ShrinkOutlined className={styles.fullscreenBtn} />
                  ) : (
                    <ArrowsAltOutlined className={styles.fullscreenBtn} />
                  )}
                </div>
                <iframe
                  src={buildFrameSrcUrl('kpi_basic', true)}
                  width={'100%'}
                  height={'100%'}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <Access accessible={access[PermissionEnum.MONTHLY_DELIVERED_PANEL]}>
        <Row gutter={16}>
          <Col span={24}>
            <div style={{ height: '250px' }}>
              <iframe
                src={buildFrameSrcUrl('waybill_amount_monthly', true)}
                width={'100%'}
                height={'100%'}
              />
            </div>
          </Col>
        </Row>
      </Access>

      <Row gutter={16}>
        <Col span={12}>
          {/*active project*/}
          <div style={{ height: '400px' }} ref={ref2_1}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen2_1}>
              {isFullscreen2_1 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrl('waybill_project_perspective', true)}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
        <Col span={12}>
          {/*active customer*/}
          <div style={{ height: '400px' }} ref={ref2_2}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen2_2}>
              {isFullscreen2_2 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrl('waybill_customer_perspective', true)}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          {/*active vendor*/}
          <div style={{ height: '400px' }} ref={ref2_3}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen2_3}>
              {isFullscreen2_3 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrl('waybill_vendor_perspective', true)}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
        <Col span={12}>
          {/*active truck type*/}
          <div style={{ height: '400px' }} ref={ref2_4}>
            <div className="fullscreen-wrap" onClick={toggleFullscreen2_4}>
              {isFullscreen2_4 ? (
                <ShrinkOutlined className={styles.fullscreenBtn} />
              ) : (
                <ArrowsAltOutlined className={styles.fullscreenBtn} />
              )}
            </div>
            <iframe
              src={buildFrameSrcUrl('waybill_truck_type_perspective', true)}
              width={'100%'}
              height={'100%'}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardKpi;
