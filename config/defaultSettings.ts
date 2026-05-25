import { Settings as LayoutSettings } from '@ant-design/pro-components';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#009688',
  layout: 'mix',
  splitMenus: false, // 这里用了mix才会生效
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: false,
  colorWeak: false,
  title: 'Inteluck TMS',
  pwa: false,
  // logo: '/img/logo.png',
  iconfontUrl: '',
};

export default Settings;
