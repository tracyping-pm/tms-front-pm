import { RefObject } from 'react';
import { CountryType, ThemeType } from './constants';

// 地图日期状态
export interface MapDateState {
  mapStartDate: string;
  mapEndDate: string;
}

// 全屏钩子返回类型
export interface FullscreenHook {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

// 图表引用配置
export interface ChartRef {
  ref: RefObject<HTMLDivElement>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isHovering: boolean;
}

// 组件 Props
export interface DashboardKpiProps {
  className?: string;
  style?: React.CSSProperties;
}

// iframe 组件 Props
export interface IframeChartProps {
  src: string | undefined;
  width?: string;
  height?: string;
  className?: string;
}

// 全屏按钮组件 Props
export interface FullscreenButtonProps {
  isFullscreen: boolean;
  onClick: () => void;
  className?: string;
}

// 图表容器组件 Props
export interface ChartContainerProps {
  children: React.ReactNode;
  chartRef: RefObject<HTMLDivElement>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// 国家选择器 Props
export interface CountrySelectorProps {
  value: CountryType;
  onChange: (value: CountryType) => void;
}

// 主题切换器 Props
export interface ThemeSwitchProps {
  value: ThemeType;
  onChange: (value: ThemeType) => void;
}

// 日期选择器 Props
export interface DateSelectorProps {
  country: CountryType;
  onDateChange: (dates: MapDateState) => void;
  onDateNumberChange: (number: number) => void;
  onDateSelectedChange: (selected: boolean) => void;
}
