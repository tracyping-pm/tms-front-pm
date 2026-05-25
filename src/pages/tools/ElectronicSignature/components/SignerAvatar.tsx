import { Avatar, Badge } from 'antd';
import cls from 'classnames';
import styles from './common.less';

const BORDER_COLOR: Record<string, string> = {
  solid: 'rgba(191, 191, 191, 1)',
  dashed: 'rgba(0, 0, 0, 0.06)',
};

const SignerAvatar = (props: {
  large?: boolean;
  name: string;
  bgColor: string;
  color: string;
  showBadge?: boolean;
  badgeColor?: string;
  showLine?: boolean;
  lineTop?: 'solid' | 'dashed' | 'none';
  lineBottom?: 'solid' | 'dashed' | 'none';
}) => {
  const {
    large = false,
    name,
    bgColor,
    color,
    showBadge = false,
    badgeColor = 'rgba(47, 84, 235, 1)',
    showLine = false,
    lineTop = 'solid',
    lineBottom = 'solid',
  } = props;

  const BadgeAvatar = () => {
    return showBadge ? (
      <Badge dot color={badgeColor}>
        <Avatar
          style={{
            backgroundColor: bgColor,
            color: color,
            userSelect: 'none',
          }}
          size={large ? 'large' : 'default'}
        >
          {name}
        </Avatar>
      </Badge>
    ) : (
      <Avatar
        style={{
          backgroundColor: bgColor,
          color: color,
          userSelect: 'none',
        }}
        size={large ? 'large' : 'default'}
      >
        {name}
      </Avatar>
    );
  };

  return showLine ? (
    <div className={cls(styles.process_item_left, 'process-item-left')}>
      <div
        className={cls(styles.process_item_left_line, 'process-item-left-line')}
        style={{
          borderLeft: `1px ${lineTop} ${BORDER_COLOR[lineTop]}`,
          display: lineTop === 'none' ? 'none' : 'block',
        }}
      ></div>
      <BadgeAvatar />
      <div
        className={cls(styles.process_item_left_line, 'process-item-left-line')}
        style={{
          borderLeft: `1px ${lineBottom} ${BORDER_COLOR[lineBottom]}`,
          display: lineBottom === 'none' ? 'none' : 'block',
        }}
      ></div>
    </div>
  ) : (
    <BadgeAvatar />
  );
};

export default SignerAvatar;
