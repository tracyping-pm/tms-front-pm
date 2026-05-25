import { getAppEnv } from '@/runtime-env';
import { Tag } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import Logo from '../../../public/img/logo.png';
import styles from './index.less';

const HeaderTitle: FC = () => {
  const appEnv = getAppEnv();
  return (
    <>
      <div className={cls('header-title', styles.headerTitle)}>
        <img src={Logo} alt="header log png" />
        <span className="system-name">Inteluck TMS</span>
        {appEnv !== 'prod' && (
          <Tag bordered={false} color="#108ee9">
            {appEnv.toUpperCase()}
          </Tag>
        )}
      </div>
    </>
  );
};
const HeaderLogo: FC = () => {
  return (
    <>
      <div className={cls('header-title', styles.headerTitle)}>
        <img src={Logo} alt="header log png" />
      </div>
    </>
  );
};

export { HeaderLogo, HeaderTitle };
