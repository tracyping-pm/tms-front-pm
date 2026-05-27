// 运行时配置

import { AccountBookFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { MenuDataItem } from '@ant-design/pro-components';
import { Link, RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import 'animate.css';
import {
  App,
  Button,
  ConfigProvider,
  notification,
  message as toast,
} from 'antd';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import Cookie from 'js-cookie';
import queryString from 'query-string';
import React from 'react';
import { ReactComponent as IconCustomer } from '../public/svg/menu/customer.svg';
import { ReactComponent as IconHome } from '../public/svg/menu/home.svg';
import { ReactComponent as IconPermission } from '../public/svg/menu/permission.svg';
import { ReactComponent as IconProject } from '../public/svg/menu/project.svg';
import { ReactComponent as IconUser } from '../public/svg/menu/user.svg';
import { ReactComponent as IconVendor } from '../public/svg/menu/vendor.svg';
import { getBuOriginUrl, getUserInfo } from './api-uam/common';
import CustomErrorBoundary from './components/CustomErrorBoundary';
import { HeaderLogo, HeaderTitle } from './components/HeaderLogo';
import RightContent from './components/RightContent';
import { getTokenKey, PATHS } from './constants';
import {
  getUamUrl,
  setBuOriginUrls,
  UAM_RELATIVE_PATHS,
} from './constants/uam';
import { PubSubProvider } from './context/pubsub';
import NoFoundPage from './pages/403';
import { getAppEnv } from './runtime-env';
import './theme/font.less';
import './theme/map.less';
import {
  proLayoutToken,
  tableStyleConfig,
  themeConfig,
} from './theme/themeConfig';
import './theme/variables.less';
import { buildCurrentInfo, consumeLocalhostRedirectToken, isLocalhost } from './utils/utils';

const whiteList = [PATHS.SIGNATURES_DETAIL];

dayjs.extend(weekday);
dayjs.extend(localeData);

consumeLocalhostRedirectToken(getTokenKey());

const menuIconList = [
  {
    icon: <IconHome />,
    key: 'home',
  },
  {
    icon: <IconCustomer />,
    key: 'customer',
  },
  {
    icon: <IconVendor />,
    key: 'vendor',
  },
  {
    icon: <AccountBookFilled />,
    key: 'billing',
  },
  {
    icon: <IconProject />,
    key: 'project',
  },
  {
    icon: <IconUser />,
    key: 'user',
  },
  {
    icon: <IconPermission />,
    key: 'permission',
  },
];

console.log('🌞🌞APP_ENV: ', getAppEnv());
const timeout = getAppEnv() === 'dev' ? 60000 : 30000;

// import defaultSettings from '../config/defaultSettings';

/** 获取用户信息比较慢的时候会展示一个 loading */
// export const initialStateConfig = {
//   loading: <PageLoading />,
// };

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{
  name: string;
  currentUser?: CurrentUser;
  fetchUserInfo?: () => Promise<UserInfo | undefined>;
}> {
  try {
    const list = await getBuOriginUrl();
    setBuOriginUrls(list);
  } catch (e) {
    console.warn('getBuOriginUrl failed', e);
  }

  const fetchUserInfo = async () => {
    try {
      const res = await getUserInfo();

      if (res.code === 200) {
        return buildCurrentInfo(res.data);
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  };

  if (whiteList.includes(location.pathname)) {
    return {
      name: 'inteluck tms',
      currentUser: undefined,
    };
  } else {
    const currentUser = await fetchUserInfo();
    return {
      name: 'inteluck tms',
      fetchUserInfo,
      currentUser,
      // settings: defaultSettings,
    };
  }
}

// @ts-ignore
export const layout: RunTimeLayoutConfig = () => {
  const onPageChange = () => {
    // 如果没有登录，重定向到 login
    // localhost 本地开发时跳过，mock 会提供用户信息
    if (!Cookie.get(getTokenKey()) && !isLocalhost()) {
      const pathname = getUamUrl(UAM_RELATIVE_PATHS.LOGIN);
      const search = queryString.stringify({
        redirect: location.href,
      });
      const url = `${pathname}?${search}`;
      return location.assign(url);
    }
  };

  const menuItemRender = (item: MenuDataItem, defaultDom: React.ReactNode) => {
    return <Link to={item.path!}>{defaultDom}</Link>;
  };

  const postMenuData = (menuData: MenuDataItem[]) => {
    return menuData.map((item: MenuDataItem) => {
      const { meta } = item;
      // 根据menuIconList的key匹配  meta.icon 的内容
      const findIconItem = menuIconList.find((iconItem) => {
        return iconItem.key === meta?.icon;
      });
      return {
        ...item,
        icon: findIconItem?.icon ?? item.icon,
      };
    });
  };

  return {
    headerTitleRender: () => <HeaderTitle />,
    logo: () => <HeaderLogo />,
    menu: {
      locale: false,
    },
    layout: 'mix',
    splitMenus: false, // 这里用了mix才会生效
    locale: 'en-US',
    siderWidth: 220,
    rightContentRender: () => <RightContent />,
    onPageChange: onPageChange,
    token: proLayoutToken,
    menuItemRender: menuItemRender,
    postMenuData: postMenuData,
    unAccessible: <NoFoundPage />,
    // ErrorBoundary: CustomErrorBoundary,
    // headerContentRender: false,
    // // 自定义 404 页面
    // noFound: <div>noFound</div>,
  };
};

export const request: RequestConfig = {
  timeout,
  // other axios options you want
  errorConfig: {
    errorHandler: (error: any) => {
      const { code } = error;
      if (code === 'ECONNABORTED') {
        notification.destroy?.();
        notification.open({
          message: 'Timeout',
          description:
            'Connection to the service timed out, please try again later.',
          btn: (
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#009688',
                },
              }}
            >
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  window?.location?.reload?.();
                }}
              >
                Reload
              </Button>
            </ConfigProvider>
          ),
          icon: <ExclamationCircleFilled style={{ color: '#FFA940' }} />,
          duration: null,
        });
      }
    },
    errorThrower: () => {},
  },
  requestInterceptors: [
    (config: any) => {
      let token = Cookie.get(getTokenKey());
      if (token?.startsWith('"')) {
        token = JSON.parse(token);
      }
      if (token) {
        config.headers.token = token;
      }
      config.headers['X-Requested-Bu'] = 'TMS';
      return config;
    },
    (error: any) => {
      return error;
    },
  ],
  responseInterceptors: [
    (response: any) => {
      const { config, data = {} } = response;
      const { code, msg } = data;

      if (config?.skipErrorHandler) {
        return response;
      }
      if (+code === 401 && !whiteList.includes(location.pathname) && !isLocalhost()) {
        Cookie.remove(getTokenKey());

        const pathname = getUamUrl(UAM_RELATIVE_PATHS.LOGIN);
        const search = queryString.stringify({
          redirect: location.href,
        });
        const url = `${pathname}?${search}`;

        location.assign(url);
        return response;
        // throw new Error(`${status}  Not Authorization`);
      }

      if (+code === 403) {
        const url = getUamUrl(UAM_RELATIVE_PATHS.NO_AUTH);
        location.assign(url);
        return response;
        // throw new Error(`${status}  Not Authorizated to access this page`);
      }

      if (+code === 808) {
        const url = getUamUrl(UAM_RELATIVE_PATHS.CHANGE_ROLE);
        location.assign(url);
        return response;
        // throw new Error(`${status}  Not Authorizated to access this page`);
      }

      if (+code === 815) {
        const url = getUamUrl(UAM_RELATIVE_PATHS.CHANGE_PASSWORD);
        location.assign(url);
        return response;
        // throw new Error(`${status}  Not Authorizated to access this page`);
      }

      if (+code !== 200) {
        if (+code !== 401 && +code !== 403 && +code !== 808 && +code !== 815) {
          toast.error(msg);
          return response;
          // throw new Error(msg);
        }
      }

      return response;
    },
  ],
};

export const onRouteChange = () => {
  // 路由切换的时候默认滚动到顶部
  window?.scrollTo?.(0, 0);
};

export function rootContainer(container: React.ReactNode) {
  return (
    <ConfigProvider theme={themeConfig} table={tableStyleConfig}>
      <App message={{ maxCount: 1 }}>
        <PubSubProvider>
          <CustomErrorBoundary>{container}</CustomErrorBoundary>
        </PubSubProvider>
      </App>
    </ConfigProvider>
  );
}
