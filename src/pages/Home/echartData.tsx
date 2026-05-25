export const summaryOption = {
  // title: {
  //   text: 'Business Performance',
  // },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  legend: {
    top: 'bottom',
  },
  grid: {
    left: '0%',
    right: '4%',
    bottom: '10%',
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
  ],
  yAxis: [
    {
      type: 'value',
    },
    {
      type: 'value',
    },
  ],
  series: [
    {
      name: 'Confirmed Daily Spending',
      type: 'bar',
      // barWidth: 5, // 宽度
      stack: 'column', // 相同名称会堆叠
      emphasis: {
        focus: 'series',
      },
      data: [620, 732, 701, 734, 1090, 1130, 1120],
    },
    {
      name: 'Unconfirmed Daily Spending',
      type: 'bar',
      stack: 'column',
      emphasis: {
        focus: 'series',
      },
      data: [120, 132, 101, 134, 290, 230, 220],
    },
    {
      name: 'Confirmed Daily GP',
      type: 'bar',
      stack: 'column',
      emphasis: {
        focus: 'series',
      },
      data: [60, 72, 71, 74, 190, 130, 110],
    },
    {
      name: 'Unconfirmed Daily GP',
      type: 'bar',
      stack: 'column',
      emphasis: {
        focus: 'series',
      },
      data: [62, 82, 91, 84, 109, 110, 120],
    },
    {
      name: 'Summary Trip Numbers',
      type: 'line',
      yAxisIndex: 1,
      symbol: 'none',
      data: [969, 1098, 1271, 1583, 1926, 1684, 1974],
    },
  ],
};

export const tripNumOption: echarts.EChartsOption = {
  // title: {
  //   text: 'Trip Numbers',
  // },
  tooltip: {
    show: false,
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  grid: {
    top: 24,
    left: 0,
    right: 0,
    bottom: 0,
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: [],
    // data: ['Now-11', 'Now-12', 'Now-13'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      type: 'bar',
      barWidth: 30,
      data: [],
      // data: [120, 200, 150], // 同比月份、环比月份、当前月份的月总运单数量。
      color: ['#C6BBFF', '#9682FF', '#5D45DB'],
      colorBy: 'data',
    },
  ],
};

export const revGMOption: echarts.EChartsOption = {
  // title: {
  //   text: 'Rev & GM',
  // },
  tooltip: {
    show: false,
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  // legend: {},
  grid: {
    top: 24,
    left: 0,
    right: 0,
    bottom: 0,
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      // data: ['Now-10', 'Now-11', 'Now-12'],
    },
  ],
  yAxis: [
    {
      type: 'value',
    },
    {
      type: 'value',
      axisLabel: {
        formatter: '{value}%',
      },
    },
  ],
  series: [
    {
      name: 'Summary Monthly Spending', // 总成本（堆积柱状图下）
      type: 'bar',
      barWidth: 30,
      stack: 'column', // 相同名称会堆叠
      emphasis: {
        focus: 'series',
      },
      data: [],
      // data: [620, 732, 701],
      color: ['#85DFD7', '#12BFAF', '#009688'],
      colorBy: 'data',
    },
    {
      name: 'Summary Monthly GP', // 总利润（堆积柱状图上）
      type: 'bar',
      barWidth: 30,
      stack: 'column',
      emphasis: {
        focus: 'series',
      },
      data: [],
      // data: [120, 132, 101],
      color: '#F18532',
    },
    {
      name: 'Gross Margin', // 毛利率（折线图）
      type: 'line',
      yAxisIndex: 1,
      data: [],
      // data: [12, 14, 10],
      color: '#F18532',
    },
  ],
};

export const perTipOption: echarts.EChartsOption = {
  // title: {
  //   text: 'Rev / GP per Trip',
  // },
  tooltip: {
    show: false,
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  // legend: {},
  grid: {
    top: 24,
    left: 0,
    right: 0,
    bottom: 0,
    containLabel: true,
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      // data: ['Now-10', 'Now-11', 'Now-12'],
    },
  ],
  yAxis: [
    {
      type: 'value',
    },
  ],
  series: [
    {
      name: 'Summary Spending Per Trip',
      type: 'bar',
      barWidth: 30,
      stack: 'column', // 相同名称会堆叠
      emphasis: {
        focus: 'series',
      },
      data: [],
      // data: [720, 732, 801], // 每单成本（下）
      color: ['#85DFD7', '#12BFAF', '#009688'],
      colorBy: 'data',
    },
    {
      name: 'Summary GP Per Trip',
      type: 'bar',
      barWidth: 30, // 宽度
      stack: 'column',
      emphasis: {
        focus: 'series',
      },
      data: [],
      // data: [150, 132, 101], // 每单利润（上）
      color: '#F18532',
    },
  ],
};

export const customersOption: echarts.EChartsOption = {
  tooltip: {
    trigger: 'axis',
    borderWidth: 0,
    padding: 0,
    // alwaysShowContent: true,
    axisPointer: {
      type: 'shadow',
    },
  },
  // legend: {},
  grid: {
    // show: false,
    top: 26,
    left: 20,
    right: '5%',
    bottom: 24,
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    splitLine: {
      show: false,
    },
    axisLine: {
      show: true,
    },
    // axisLabel: {
    //   width: 100,
    //   overflow: 'truncate',
    // },
  },
  yAxis: {
    type: 'category',
    triggerEvent: true,
    splitLine: {
      show: false,
    },
    axisLine: {
      show: true,
    },
    axisLabel: {
      width: 80,
      overflow: 'truncate',
      color: '#009688',
      lineHeight: 12,
      // FIXME: BUG: https://github.com/apache/echarts/issues/17343
      backgroundColor: '#fff',
      // borderType: 'solid',
      // borderWidth: 1,
      // borderColor: '#009688',
      // padding: [0, 1, 0, 1], // 调整下划线的位置
    },
    data: [],
    // data: [
    //   'category-1',
    //   'category-2',
    //   'category-3',
    //   'category-4',
    //   'category-5',
    //   'category-6',
    //   'category-7',
    //   'category-8',
    //   'category-9',
    //   'category-10',
    //   'category-11',
    //   'category-12',
    //   'category-13',
    //   'category-14',
    //   'category-15',
    // ],
  },
  series: [
    {
      name: 'Summary Yearly Spending',
      type: 'bar',
      barWidth: 15,
      // barGap: 22,
      stack: 'total',
      label: {
        show: false,
      },
      emphasis: {
        focus: 'series',
      },
      color: '#009688',
      colorBy: 'data',
      data: [],
      // data: [
      //   100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300,
      //   1400, 1500,
      // ],
    },
    {
      name: 'Summary Yearly GP',
      type: 'bar',
      stack: 'total',
      label: {
        show: false,
      },
      emphasis: {
        focus: 'series',
      },
      color: '#F18532',
      data: [],
      // data: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
    },
  ],
};
