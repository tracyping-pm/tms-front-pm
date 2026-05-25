import { useFullscreen, useHover } from 'ahooks';
import { useRef } from 'react';
import { ChartRef } from '../types';

/**
 * 管理多个图表引用的自定义 Hook
 */
export const useChartRefs = (count: number): ChartRef[] => {
  // 创建固定数量的 refs
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const ref4 = useRef<HTMLDivElement>(null);
  const ref5 = useRef<HTMLDivElement>(null);
  const ref6 = useRef<HTMLDivElement>(null);
  const ref7 = useRef<HTMLDivElement>(null);
  const ref8 = useRef<HTMLDivElement>(null);
  const ref9 = useRef<HTMLDivElement>(null);
  const ref10 = useRef<HTMLDivElement>(null);
  const ref11 = useRef<HTMLDivElement>(null);
  const ref12 = useRef<HTMLDivElement>(null);

  // 创建对应的全屏和悬停状态
  const [isFullscreen1, { toggleFullscreen: toggleFullscreen1 }] =
    useFullscreen(ref1, { pageFullscreen: true });
  const [isFullscreen2, { toggleFullscreen: toggleFullscreen2 }] =
    useFullscreen(ref2, { pageFullscreen: true });
  const [isFullscreen3, { toggleFullscreen: toggleFullscreen3 }] =
    useFullscreen(ref3, { pageFullscreen: true });
  const [isFullscreen4, { toggleFullscreen: toggleFullscreen4 }] =
    useFullscreen(ref4, { pageFullscreen: true });
  const [isFullscreen5, { toggleFullscreen: toggleFullscreen5 }] =
    useFullscreen(ref5, { pageFullscreen: true });
  const [isFullscreen6, { toggleFullscreen: toggleFullscreen6 }] =
    useFullscreen(ref6, { pageFullscreen: true });
  const [isFullscreen7, { toggleFullscreen: toggleFullscreen7 }] =
    useFullscreen(ref7, { pageFullscreen: true });
  const [isFullscreen8, { toggleFullscreen: toggleFullscreen8 }] =
    useFullscreen(ref8, { pageFullscreen: true });
  const [isFullscreen9, { toggleFullscreen: toggleFullscreen9 }] =
    useFullscreen(ref9, { pageFullscreen: true });
  const [isFullscreen10, { toggleFullscreen: toggleFullscreen10 }] =
    useFullscreen(ref10, { pageFullscreen: true });
  const [isFullscreen11, { toggleFullscreen: toggleFullscreen11 }] =
    useFullscreen(ref11, { pageFullscreen: true });
  const [isFullscreen12, { toggleFullscreen: toggleFullscreen12 }] =
    useFullscreen(ref12, { pageFullscreen: true });

  const isHovering1 = useHover(ref1);
  const isHovering2 = useHover(ref2);
  const isHovering3 = useHover(ref3);
  const isHovering4 = useHover(ref4);
  const isHovering5 = useHover(ref5);
  const isHovering6 = useHover(ref6);
  const isHovering7 = useHover(ref7);
  const isHovering8 = useHover(ref8);
  const isHovering9 = useHover(ref9);
  const isHovering10 = useHover(ref10);
  const isHovering11 = useHover(ref11);
  const isHovering12 = useHover(ref12);

  const allRefs = [
    {
      ref: ref1,
      isFullscreen: isFullscreen1,
      toggleFullscreen: toggleFullscreen1,
      isHovering: isHovering1,
    },
    {
      ref: ref2,
      isFullscreen: isFullscreen2,
      toggleFullscreen: toggleFullscreen2,
      isHovering: isHovering2,
    },
    {
      ref: ref3,
      isFullscreen: isFullscreen3,
      toggleFullscreen: toggleFullscreen3,
      isHovering: isHovering3,
    },
    {
      ref: ref4,
      isFullscreen: isFullscreen4,
      toggleFullscreen: toggleFullscreen4,
      isHovering: isHovering4,
    },
    {
      ref: ref5,
      isFullscreen: isFullscreen5,
      toggleFullscreen: toggleFullscreen5,
      isHovering: isHovering5,
    },
    {
      ref: ref6,
      isFullscreen: isFullscreen6,
      toggleFullscreen: toggleFullscreen6,
      isHovering: isHovering6,
    },
    {
      ref: ref7,
      isFullscreen: isFullscreen7,
      toggleFullscreen: toggleFullscreen7,
      isHovering: isHovering7,
    },
    {
      ref: ref8,
      isFullscreen: isFullscreen8,
      toggleFullscreen: toggleFullscreen8,
      isHovering: isHovering8,
    },
    {
      ref: ref9,
      isFullscreen: isFullscreen9,
      toggleFullscreen: toggleFullscreen9,
      isHovering: isHovering9,
    },
    {
      ref: ref10,
      isFullscreen: isFullscreen10,
      toggleFullscreen: toggleFullscreen10,
      isHovering: isHovering10,
    },
    {
      ref: ref11,
      isFullscreen: isFullscreen11,
      toggleFullscreen: toggleFullscreen11,
      isHovering: isHovering11,
    },
    {
      ref: ref12,
      isFullscreen: isFullscreen12,
      toggleFullscreen: toggleFullscreen12,
      isHovering: isHovering12,
    },
  ];

  return allRefs.slice(0, count);
};

/**
 * 为特定数量的图表创建引用
 */
export const useMultipleChartRefs = () => {
  // 第一组图表 (8个)
  const chartRefs1 = useChartRefs(8);

  // 第二组图表 (4个)
  const chartRefs2 = useChartRefs(4);

  return {
    // 第一组
    ref1_1: chartRefs1[0],
    ref1_2: chartRefs1[1],
    ref1_3: chartRefs1[2],
    ref1_4: chartRefs1[3],
    ref1_5: chartRefs1[4],
    ref1_6: chartRefs1[5],
    ref1_7: chartRefs1[6],
    ref1_8: chartRefs1[7],

    // 第二组
    ref2_1: chartRefs2[0],
    ref2_2: chartRefs2[1],
    ref2_3: chartRefs2[2],
    ref2_4: chartRefs2[3],
  };
};
