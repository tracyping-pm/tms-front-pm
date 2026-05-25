import { authLogout, roleChange } from '@/api-uam/common';
import { getTokenKey, PATHS } from '@/constants';
import { getOrigin, getUamUrl, UAM_RELATIVE_PATHS } from '@/constants/uam';
import { BU_TYPE_ENUM } from '@/enums/uam';
import { useScrollPenetration } from '@/hooks/useScrollPenetration';
import {
  ExclamationCircleFilled,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { App, Avatar, Dropdown, Spin } from 'antd';
import cls from 'classnames';
import Cookie from 'js-cookie';
import queryString from 'query-string';
import React, { forwardRef, useCallback } from 'react';
import { ReactComponent as DropdownIcon } from '../../../public/svg/dropdown_icon.svg';
import UnifiedCard from '../RoleCard';
import IconCountry from '../RoleCard/IconCountry';
import CustomerAvatar from './CustomerAvatar';
import styles from './index.less';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = () => {
  const { modal } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const { disableScroll, enableScroll } = useScrollPenetration();
  const [changeRoleLoading, setChangeRoleLoading] = React.useState(false);

  const doRoleChange = (role: RoleItem) => {
    return roleChange({ userRoleId: role.userRoleId });
  };

  const doLogout = async (): Promise<string> => {
    await authLogout();

    return new Promise((resolve, reject) => {
      try {
        Cookie.remove(getTokenKey());
        const search = queryString.stringify({
          redirect: location.href,
        });
        const url = `${getUamUrl(UAM_RELATIVE_PATHS.LOGIN)}?${search}`;

        resolve(url);
      } catch {
        reject();
      }
    });
  };

  const onRoleClick = useCallback(
    (role: RoleItem) => {
      if (
        initialState?.currentUser?.currentUserRole?.userRoleId ===
        role.userRoleId
      ) {
        return;
      }

      // modal.confirm({
      //   title: 'Change Role',
      //   icon: <ExclamationCircleFilled />,
      //   content: 'Confirm change role?',
      //   okText: 'Confirm',
      //   cancelText: 'Cancel',
      //   okButtonProps: {
      //     style: { outline: 'none' },
      //   },
      //   onOk() {
      setChangeRoleLoading(true);
      return new Promise((resolve, reject) => {
        doRoleChange(role)
          .then((res) => {
            if (res.code === 200) {
              const url = getOrigin(role.buType);
              resolve(true);
              // location.assign(url);
              if (
                role.buType ===
                initialState?.currentUser?.currentUserRole.buType
              ) {
                location.assign(url);
              } else {
                window.open(url, '_blank');
              }
            } else {
              reject();
            }
          })
          .catch(() => {
            reject();
          })
          .finally(() => {
            setChangeRoleLoading(false);
          });
      });
      //   },
      //   onCancel() {
      //     // do nothing
      //   },
      // });
    },
    [initialState],
  );

  const onMenuClick = useCallback((menu: any) => {
    const { key } = menu;
    if (key === 'changePassword') {
      const search = queryString.stringify({
        redirect: location.pathname + location.search,
      });
      const url = `${PATHS.CHANGE_PASSWORD}?${search}`;
      return history.push(url);
    }
    if (key === 'logout') {
      modal.confirm({
        title: 'Confirm Logout',
        icon: <ExclamationCircleFilled />,
        content: 'Confirm to log out of the current account',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk() {
          return new Promise((resolve, reject) => {
            doLogout()
              .then((url) => {
                resolve(true);
                location.replace(url);
              })
              .catch(() => {
                reject();
              });
          });
        },
        onCancel() {
          // do nothing
        },
      });

      return;
    }
  }, []);

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.name) {
    return loading;
  }

  const menuItems = [
    {
      key: 'changePassword',
      icon: <LockOutlined />,
      label: 'Change Password',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  const groupByBuTypeOrder = (arr: any) => {
    const order = [
      BU_TYPE_ENUM.TMS,
      BU_TYPE_ENUM.WMS,
      BU_TYPE_ENUM.UAM,
      BU_TYPE_ENUM.HR,
    ];
    const grouped = arr.reduce((acc: any, cur: any) => {
      const key = cur.buType;
      if (!acc[key]) acc[key] = [];
      acc[key].push(cur);
      return acc;
    }, {});

    // 再根据 order 顺序输出
    return order
      .filter((buType: string) => grouped[buType]) // 只保留存在的
      .map((buType: string) => ({
        buType,
        list: grouped[buType],
      }));
  };

  const DropdownRender = forwardRef(() => {
    return (
      <>
        <div className={styles.allInWrap}>
          <Spin spinning={changeRoleLoading}>
            <section className={cls('roleList')}>
              {groupByBuTypeOrder(currentUser?.roleList)?.map((role, index) => {
                return (
                  <div key={index}>
                    {role.list.map((item: any, roleIndex: number) => (
                      <div className="roleItem" key={roleIndex}>
                        <UnifiedCard
                          highlight={
                            initialState?.currentUser?.currentUserRole
                              ?.userRoleId === item.userRoleId
                          }
                          data={item}
                          onClick={(_role) => onRoleClick(_role)}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* {currentUser?.roleList?.map((item, index) => (
              <div className="roleItem" key={index}>
                <UnifiedCard
                  highlight={
                    initialState?.currentUser?.currentUserRole?.userRoleId ===
                    item.userRoleId
                  }
                  data={item}
                  onClick={(role) => onRoleClick(role)}
                />
              </div>
            ))} */}
            </section>
            <section className={cls('normalList')}>
              {menuItems.map((menu) => {
                return (
                  <div
                    key={menu?.key}
                    className="normalItem"
                    onClick={() => onMenuClick(menu)}
                  >
                    <span className="icon">{menu.icon}</span>
                    <span className="label">{menu.label}</span>
                  </div>
                );
              })}
            </section>
          </Spin>
        </div>
      </>
    );
  });

  const onOpenChange = (open: boolean) => {
    if (open) {
      disableScroll();
    } else {
      enableScroll();
    }
  };

  return (
    <Dropdown
      dropdownRender={() => <DropdownRender />}
      onOpenChange={onOpenChange}
    >
      <span
        className={`${styles.action} ${styles.account}`}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {currentUser.avatar ? (
          <Avatar
            className={styles.avatar}
            src={currentUser.avatar}
            alt="avatar"
          />
        ) : (
          <CustomerAvatar name={currentUser.name} />
        )}
        <span className={`${styles.name} anticon`} style={{ marginRight: 10 }}>
          {currentUser.name}
        </span>
        <IconCountry regionId={currentUser.currentUserRole.regionId} />
        <DropdownIcon className={styles.dropdownIcon} />
      </span>
    </Dropdown>
  );
};

export default AvatarDropdown;
