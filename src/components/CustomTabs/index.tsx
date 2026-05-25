import { LAYOUT_HEADER_HEIGHT } from '@/constants';
import { Tabs, TabsProps } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import StickyBox from 'react-sticky-box';
import styles from './index.less';

export interface ICustomTabs extends TabsProps {
  className?: string;
  useSticky?: boolean;
  zIndex?: number;
  offsetTop?: number;
}

const CustomTabs: FC<ICustomTabs> = ({
  className,
  useSticky = false,
  zIndex = 999,
  offsetTop = LAYOUT_HEADER_HEIGHT,
  ...rest
}) => {
  //   const {
  //     token: { colorPrimary },
  //   } = theme.useToken();
  const renderTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
    <StickyBox
      offsetTop={offsetTop}
      style={{ zIndex: zIndex, background: '#fff' }}
    >
      <DefaultTabBar className={styles.tabBar} {...props} />
    </StickyBox>
  );

  return (
    <>
      <Tabs
        className={cls(styles.customTabs, className)}
        renderTabBar={useSticky ? renderTabBar : undefined}
        {...rest}
      />
    </>
  );
};

export default CustomTabs;
