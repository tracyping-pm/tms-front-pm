import { ProTokenType } from '@ant-design/pro-components';
import { ThemeConfig } from 'antd';
import { ComponentStyleConfig } from 'antd/es/config-provider/context';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#009688',
    borderRadius: 6,
    // borderRadiusLG: 8,
    // borderRadiusSM: 2,
    colorLink: '#009688',
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    Button: {
      primaryShadow: 'none',
    },
    // Select: {
    //   borderRadius: 2,
    // },
    // Checkbox: {
    //   borderRadius: 2,
    // },
    // Table: {
    // headerBg: '#FAFAFA',
    // cellPaddingBlock: 24,
    // cellPaddingInline: 24,
    // borderColor: '#FFFFFF',
    // cellFontSize: 14,
    // selectionColumnWidth: 48,
    // },
    // Modal: {
    //   borderRadius: 8,
    // },
  },
};

export const proLayoutToken: ProTokenType['layout'] = {
  bgLayout: '#F5F5F5',
  header: {
    colorBgHeader: '#FFFFFF',
    colorHeaderTitle: '#000000',
  },
  sider: {
    colorMenuBackground: '#FFFFFF',
    colorTextMenu: '#262626',
    colorBgMenuItemSelected: '#ECF6F4',
    colorTextMenuSelected: '#009688',
  },
  pageContainer: {
    paddingBlockPageContainerContent: 16,
    paddingInlinePageContainerContent: 16,
  },
};

export const tableStyleConfig: ComponentStyleConfig = {
  className: 'inteluck-table',
};
