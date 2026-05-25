import { Button, ConfigProvider } from 'antd';
import { BaseButtonProps } from 'antd/es/button/button';
import cls from 'classnames';
import { FC, useEffect, useState } from 'react';
import styles from './index.less';

export enum ThemeEnum {
  ORANGE = 'orange',
  BLUE = 'blue',
  GREEN = 'green',
  RED = 'red',
  GRAY = 'gray',
  PRIMARY = 'primary',
  MAGENTA = 'magenta',
}

export const TOKEN_COLOR_MAP = {
  [ThemeEnum.ORANGE]: '#f28532',
  [ThemeEnum.BLUE]: '#1890ff',
  [ThemeEnum.GREEN]: '#52c41a',
  [ThemeEnum.RED]: '#ff4d4f',
  [ThemeEnum.GRAY]: '#b9b9b9',
  [ThemeEnum.PRIMARY]: '#009688',
  [ThemeEnum.MAGENTA]: '#FF85C0',
};

export interface ICustomStatusButton extends BaseButtonProps {
  className?: string;
  theme?: ThemeEnum;
  noStyle?: boolean;
  onClick?: () => void;
  color?: string;
}

const CustomStatusButton: FC<ICustomStatusButton> = ({
  theme = ThemeEnum.PRIMARY,
  color,
  className = '',
  noStyle,
  ...rest
}) => {
  const [tokenColor, setTokenColor] = useState(
    color ?? TOKEN_COLOR_MAP[ThemeEnum.PRIMARY],
  );

  useEffect(() => {
    if (theme) {
      const themeColor = TOKEN_COLOR_MAP[theme];
      setTokenColor(themeColor);
    }

    if (color) {
      setTokenColor(color);
    }
  }, [theme, color]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: tokenColor,
          colorLink: tokenColor,
        },
      }}
    >
      <Button
        className={cls(
          'customStatusButton',
          styles.customStatusButton,
          className,
          noStyle && styles.noStyle,
        )}
        type="link"
        {...rest}
      />
    </ConfigProvider>
  );
};

export default CustomStatusButton;
