import { InfoCircleOutlined } from '@ant-design/icons';
import { Space, Tooltip, TooltipProps } from 'antd';
import { FC } from 'react';

interface ITooltipTitleProps extends Omit<TooltipProps, 'title'> {
  tips: string;
  tipsIconFontSize?: number;
  children?: React.ReactNode;
}
const TooltipTitle: FC<ITooltipTitleProps> = ({
  tips,
  tipsIconFontSize = 16,
  children,
  ...restProps
}) => {
  return (
    <Space>
      {children}
      <Tooltip title={tips} placement="top" {...restProps}>
        <InfoCircleOutlined
          style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: tipsIconFontSize }}
        />
      </Tooltip>
    </Space>
  );
};

export default TooltipTitle;
