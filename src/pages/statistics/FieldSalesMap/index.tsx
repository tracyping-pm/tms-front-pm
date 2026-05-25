import { salesCustomerList, salesCustomerSync } from '@/api/statistics';
import { ISalesCustomerRecord } from '@/api/types/statistics';
import PHP from '@/components/CountryIcon/PHP';
import { fitPadding, useGoogleMap } from '@/hooks/useGoogleMap'; // 假设你的 hook 路径
import { formatAmount } from '@/utils/utils';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import {
  App,
  Button,
  Card,
  Flex,
  List,
  Select,
  Space,
  Spin,
  Statistic,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';

const { Text, Title } = Typography;

const markerZIndex = 1;
const infoWindowZIndex = 2;
const activeZIndex = 3;

type SortField =
  | 'totalPurchaseNum'
  | 'totalPurchaseAmount'
  | 'lastPurchaseDate';
type SortOrder = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

interface ICustomer extends ISalesCustomerRecord {
  position?: google.maps.LatLng;
}

const FieldSalesMap: FC = () => {
  const { message } = App.useApp();
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [activeCustomer, setActiveCustomer] = useState<ICustomer>();
  const activeCustomerRef = useRef<ICustomer>();
  const [syncing, setSyncing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const customersMapRef = useRef<
    Map<
      number,
      {
        marker: google.maps.marker.AdvancedMarkerElement;
        infoWindow: google.maps.InfoWindow;
      }
    >
  >(new Map());
  const listRef = useRef<HTMLDivElement>(null);
  const { map, mapLoading, initMap, ready, overlay } = useGoogleMap({
    tiltRotationControl: false,
  });
  const [selectedPic, setSelectedPic] = useState<string>();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'totalPurchaseNum',
    order: null,
  });
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const { loading: fetching, run: refreshCustomers } = useRequest(
    salesCustomerList,
    {
      manual: true,
      pollingInterval: 6 * 60 * 60 * 1000, // 轮询间隔：6小时 (6 * 60 * 60 * 1000)
      pollingErrorRetryCount: 3, // 轮询错误时重试次数，保证稳定性
      pollingWhenHidden: false, // 当页面不可见时停止轮询，节省性能
      onSuccess: (res) => {
        if (res.code === 200) {
          setLastUpdateTime(dayjs().format('YYYY-MM-DD HH:mm'));

          const list = res.data.map((item) => ({
            ...item,
            position:
              item.lat && item.lng
                ? new google.maps.LatLng(item.lat, item.lng)
                : undefined,
          }));
          setCustomers(list);
        }
      },
      onError: (err) => {
        message.error('Failed to load customers data');
        console.error(err);
      },
    },
  );

  const picOptions = useMemo(() => {
    const names = customers
      .map((c) => c.picName)
      .filter((name): name is string => !!name); // 滤空

    return Array.from(new Set(names)).map((name) => ({
      label: name,
      value: name,
    }));
  }, [customers]);

  const displayCustomers = useMemo(() => {
    // 先过滤
    let result = [...customers];
    if (selectedPic) {
      result = result.filter((c) => c.picName === selectedPic);
    }

    // 再排序
    if (!sortConfig.order) return result;

    return result.sort((a, b) => {
      let aValue = 0,
        bValue = 0;
      if (sortConfig.field === 'lastPurchaseDate') {
        aValue = new Date(a.lastPurchaseDate).getTime();
        bValue = new Date(b.lastPurchaseDate).getTime();
      } else {
        aValue = a[sortConfig.field] || 0;
        bValue = b[sortConfig.field] || 0;
      }
      return sortConfig.order === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [sortConfig, customers, selectedPic]);

  const totalRevenue = useMemo(() => {
    const total = displayCustomers.reduce(
      (acc, customer) => acc + (customer.totalPurchaseAmount ?? 0),
      0,
    );

    return Math.floor(total);
  }, [displayCustomers]);

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        // 同一字段切换顺序: null -> desc -> asc -> null
        const nextOrder: SortOrder =
          prev.order === null ? 'desc' : prev.order === 'desc' ? 'asc' : null;
        return { field, order: nextOrder };
      }
      return { field, order: 'desc' };
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field || !sortConfig.order) {
      return null;
    }

    return sortConfig.order === 'asc' ? (
      <ArrowUpOutlined />
    ) : (
      <ArrowDownOutlined />
    );
  };

  const handleSelectCustomer = useCallback(
    (customer: ICustomer, source: 'map' | 'list') => {
      if (!map) return;
      if (activeCustomer?.id === customer.id) return;

      setActiveCustomer(customer);

      // 如果是从地图点击的，需要滚动左侧列表
      if (source === 'map') {
        const element = document.getElementById(`customer-card-${customer.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      customersMapRef.current
        ?.entries()
        .forEach(([id, { marker, infoWindow }]) => {
          const isActive = id === customer.id;
          const content = marker.content as HTMLElement;

          marker.zIndex = isActive ? activeZIndex : markerZIndex;
          infoWindow.setZIndex(isActive ? activeZIndex : infoWindowZIndex);

          infoWindow.close();

          if (isActive) {
            content?.classList?.add('active-marker');
            infoWindow.open({ map, anchor: marker });

            if (source === 'list') {
              map?.panTo(customer.position!);
            }
          } else {
            content?.classList?.remove('active-marker');
          }
        });
    },
    [map, activeCustomer, customersMapRef],
  );

  const onCustomerClick = (customer: ICustomer) => {
    handleSelectCustomer(customer, 'list');

    if (!customer.position) {
      message.warning('No Latitude and Longitude');
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const resetState = () => {
    setActiveCustomer(undefined);
    setShowInfoWindow(false);
    // setCollapsed(false);

    handleSort('lastPurchaseDate');
    listRef?.current?.scrollTo({ top: 0 });
  };

  const syncData = async () => {
    setSyncing(true);
    try {
      const res = await salesCustomerSync();
      if (res.code === 200) {
        message.success('Sync Success!');
        refreshCustomers();
        resetState();
      }
    } finally {
      setSyncing(false);
    }
  };

  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1, // 保留一位小数，避免 499 变成 0
  });

  useEffect(() => {
    if (ready && mapRef.current && !map) {
      refreshCustomers();
      initMap(mapRef.current, {
        zoom: 12,
      });
    }
  }, [ready, map, initMap]);

  useEffect(() => {
    if (!map || !overlay) return;

    overlay.clearOverlays();

    displayCustomers.forEach((customer) => {
      const displayText = formatter.format(customer.totalPurchaseAmount);

      const markerTag = document.createElement('div');
      markerTag.className = 'custom-customer-marker';
      markerTag.innerHTML = `
        <div class="marker-pin-wrap">
            <div class="marker-content">
                <span class="amount">${displayText}</span>
            </div>
        </div>
        <div class="marker-pulse"></div>
      `;

      if (customer.position) {
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: customer.position,
          title: customer.name,
          content: markerTag,
          zIndex: markerZIndex,
        });
        overlay.addOverlay(marker);

        const infoWindow = new google.maps.InfoWindow({
          maxWidth: 300,
          headerDisabled: true,
          zIndex: infoWindowZIndex,
          disableAutoPan: true,
          pixelOffset: new google.maps.Size(0, -4),
        });
        overlay?.addOverlay?.(infoWindow);

        const content = `
        <div class="map-info-card">
          <strong class="customer-name">${customer.name}</strong>
          ${customer.picName ? `<div class="pic-name">PIC: ${customer.picName}</div>` : ''}
          <div>Order: ${customer.totalPurchaseNum}</div>
          <div>Revenue: ₱${formatAmount(customer.totalPurchaseAmount)}</div>
          <div>Last Purchase Date: ${customer.lastPurchaseDate}</div>
        </div>
      `;
        infoWindow.setContent(content);
        customersMapRef.current?.set(customer.id, { marker, infoWindow });

        marker.addListener('click', () => {
          handleSelectCustomer(customer, 'map');
        });

        marker?.content?.addEventListener('mouseover', () => {
          marker.zIndex = activeZIndex;
          infoWindow.setZIndex(activeZIndex);

          infoWindow.open({ map, anchor: marker });
        });

        marker.content?.addEventListener('mouseout', () => {
          if (customer.id !== activeCustomerRef.current?.id) {
            marker.zIndex = markerZIndex;
            infoWindow.setZIndex(infoWindowZIndex);
            infoWindow?.close();
          }
        });
      } else {
        console.error('No Latitude and Longitude: ', customer.name);
      }
    });

    if (displayCustomers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      displayCustomers.forEach((c) => {
        if (c.position) {
          bounds.extend(c.position);
        }
      });
      fitPadding(bounds);
      map.fitBounds(bounds);
    }
  }, [map, displayCustomers, overlay]);

  useEffect(() => {
    activeCustomerRef.current = activeCustomer;
    customersMapRef.current
      ?.entries()
      .forEach(([id, { infoWindow, marker }]) => {
        if (activeCustomer?.id === id) {
          infoWindow.open({ map, anchor: marker });
        } else {
          if (showInfoWindow) {
            infoWindow.open({ map, anchor: marker });
          } else {
            infoWindow.close();
          }
        }
      });
  }, [showInfoWindow, activeCustomer]);

  useEffect(() => {
    handleSort('lastPurchaseDate');
  }, []);

  return (
    <div className={`field-sales-container ${collapsed ? 'is-collapsed' : ''}`}>
      <aside className="sales-sidebar">
        <section className="sidebar-header">
          <Flex justify="space-between" style={{ marginBottom: '12px' }}>
            <Title level={5} style={{ margin: 0 }}>
              Field Sales Customers
            </Title>

            <Space size={4}>
              <Switch
                size="small"
                value={showInfoWindow}
                onChange={(checked) => setShowInfoWindow(checked)}
              />
              Show Info
            </Space>
          </Flex>

          <Flex gap={8} style={{ marginBottom: '6px' }}>
            <div style={{ flexBasis: '30px' }}>
              <Text type="secondary">PIC:</Text>
            </div>

            <div style={{ flex: 1 }}>
              <Select
                placeholder="All PICs"
                allowClear
                style={{ width: '100%' }}
                options={picOptions}
                value={selectedPic}
                onChange={setSelectedPic}
                showSearch
                size="small"
              />
            </div>
          </Flex>

          <Flex gap={8} style={{ marginBottom: '10px' }} wrap="wrap">
            <div style={{ flexBasis: '30px' }}>
              <Text
                type="secondary"
                style={{ display: 'block', marginBottom: '4px' }}
              >
                Sort:
              </Text>
            </div>

            <Flex style={{ flex: 1 }} gap={8} justify="start">
              <Button
                size="small"
                type={
                  sortConfig.field === 'totalPurchaseNum' && sortConfig.order
                    ? 'primary'
                    : 'default'
                }
                icon={getSortIcon('totalPurchaseNum')}
                onClick={() => handleSort('totalPurchaseNum')}
                style={{ fontSize: '12px' }}
              >
                Orders
              </Button>
              <Button
                size="small"
                type={
                  sortConfig.field === 'totalPurchaseAmount' && sortConfig.order
                    ? 'primary'
                    : 'default'
                }
                icon={getSortIcon('totalPurchaseAmount')}
                onClick={() => handleSort('totalPurchaseAmount')}
                style={{ fontSize: '12px' }}
              >
                Revenue
              </Button>
              <Button
                size="small"
                type={
                  sortConfig.field === 'lastPurchaseDate' && sortConfig.order
                    ? 'primary'
                    : 'default'
                }
                icon={getSortIcon('lastPurchaseDate')}
                onClick={() => handleSort('lastPurchaseDate')}
                style={{ fontSize: '12px', flex: 1 }}
              >
                Purchase Date
              </Button>
            </Flex>
          </Flex>

          <Flex
            justify="space-between"
            align="end"
            style={{ marginBottom: '6px' }}
          >
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Updated at: {lastUpdateTime}
            </Text>
            <Text type="secondary">{displayCustomers.length} customers</Text>
          </Flex>

          <Flex justify="start">
            <Text strong style={{ fontSize: 16 }}>
              Total Revenue: <PHP />
              {formatAmount(totalRevenue)}
            </Text>
          </Flex>
        </section>

        <section className="sidebar-list" ref={listRef}>
          <List
            loading={fetching}
            itemLayout="vertical"
            dataSource={displayCustomers}
            renderItem={(item) => (
              <div id={`customer-card-${item.id}`}>
                <Card
                  hoverable
                  className={cls('customer-card', {
                    'is-active': item.id === activeCustomer?.id,
                    'no-position': !item.position,
                  })}
                  onClick={() => onCustomerClick(item)}
                >
                  <div className="card-header">
                    <Flex gap={4} justify="space-between">
                      <Text strong style={{ fontSize: 16 }}>
                        {item.name}
                      </Text>
                      {!item.position ? (
                        <Tooltip
                          title="No Latitude and Longitude"
                          placement="right"
                        >
                          <span style={{ color: 'var(--warning-color)' }}>
                            <WarningOutlined />
                          </span>
                        </Tooltip>
                      ) : null}
                    </Flex>

                    {item.picName ? (
                      <div>
                        <Text
                          style={{ fontSize: '14px' }}
                          ellipsis={{
                            tooltip: {
                              title: item.picName,
                              placement: 'right',
                            },
                          }}
                        >
                          {item.picName}
                        </Text>
                      </div>
                    ) : null}

                    {item.address ? (
                      <div>
                        <Text
                          type="secondary"
                          style={{ fontSize: '12px' }}
                          ellipsis={{
                            tooltip: {
                              title: item.address,
                              placement: 'right',
                            },
                          }}
                        >
                          {item.address}
                        </Text>
                      </div>
                    ) : null}
                  </div>
                  <div className="card-body">
                    <Statistic
                      title="Orders"
                      value={item.totalPurchaseNum}
                      prefix="📦"
                    />
                    <Statistic
                      title="Revenue"
                      value={item.totalPurchaseAmount}
                      precision={2}
                      prefix={<PHP />}
                    />
                    <span className="last-date">
                      Last Purchase Date: {item.lastPurchaseDate}
                    </span>
                  </div>
                </Card>
              </div>
            )}
          />
        </section>
      </aside>

      <section className="collapsed-section">
        <Space align="center" style={{ height: '26px' }}>
          <Button size="small" onClick={toggleCollapsed}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>

          <Button size="small" loading={syncing} onClick={syncData}>
            Sync
          </Button>
        </Space>
      </section>

      <main className="map-wrapper">
        {mapLoading && (
          <div className="map-mask">
            <Spin size="large" />
          </div>
        )}
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </main>
    </div>
  );
};

export default FieldSalesMap;
