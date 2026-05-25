import { SIGNATURE_STATUS_COLOR } from '@/constants';
import cls from 'classnames';
import { CSSProperties } from 'react';
import SignerAvatar from './SignerAvatar';
import styles from './common.less';

const SignerProcessItem = ({
  name,
  email,
  status,
  color,
  bgColor,
  badgeColor,
  showBadge,
  showStatus,
  showLine,
  lineTop,
  lineBottom,
  style,
}: {
  name: string;
  email: string;
  status: string;
  color: string;
  bgColor: string;
  badgeColor: string;
  showBadge?: boolean;
  showStatus: boolean;
  showLine?: boolean;
  lineTop?: 'solid' | 'dashed' | 'none';
  lineBottom?: 'solid' | 'dashed' | 'none';
  style?: CSSProperties;
}) => {
  return (
    <div className={cls(styles.process_item, 'process-item')}>
      <div
        className={cls(styles.process_item_left, 'process-item-left')}
        style={style ? style : {}}
      >
        <SignerAvatar
          large
          showBadge={showBadge}
          badgeColor={badgeColor}
          name={name?.slice(0, 1)?.toUpperCase()}
          bgColor={bgColor}
          color={color}
          showLine={showLine}
          lineTop={lineTop}
          lineBottom={lineBottom}
        />
      </div>
      <div
        className={cls(styles.process_item_box, 'process-item-box')}
        style={{ marginTop: lineTop !== 'none' && showLine ? '21px' : '0' }}
      >
        <div
          className={cls(styles.process_item_content, 'process-item-content')}
        >
          <div
            className={cls(
              styles.process_item_content_name,
              'process-item-content-name',
            )}
          >
            {name}
          </div>
          <div
            className={cls(
              styles.process_item_content_email,
              'process-item-content-email',
            )}
          >
            {email}
          </div>
        </div>
        {showStatus ? (
          <div
            className={cls(styles.process_item_right, 'process-item-right')}
            style={{ color: SIGNATURE_STATUS_COLOR[status] }}
          >
            {status}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SignerProcessItem;
