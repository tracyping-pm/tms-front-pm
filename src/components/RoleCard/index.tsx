import { BU_TYPE_PRIMARY_COLOR } from '@/enums/uam';
import { Tag } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import IconBusiness from './IconBusiness';
import IconCountry from './IconCountry';
import IconSystem from './IconSystem';
import styles from './index.less';
import { ReactComponent as IconAdmin } from './static/icon-admin.svg';

export interface IProps {
  data: RoleItem;
  highlight?: boolean;
  width?: number;
  height?: number;
  onClick?: (data: RoleItem) => void;
}

const UnifiedCard: FC<IProps> = ({
  data,
  highlight,
  width = 254,
  // height = 148,
  onClick,
}) => {
  return (
    <>
      <div
        className={cls(
          'unified-card',
          styles.unifiedCard,
          highlight && styles.highlight,
        )}
        style={{ width: `${width}px` }}
        onClick={() => onClick?.(data)}
      >
        <div className="item">
          <span className="icon">
            <IconAdmin />
          </span>
          <span className="name ellipsis" title={data?.roleName}>
            {data?.roleName}
          </span>
          <span className="icon">
            <Tag
              className="tag-system"
              icon={<IconSystem buType={data.buType} />}
              color={BU_TYPE_PRIMARY_COLOR[data.buType]}
            >
              {data?.buType}
            </Tag>
          </span>
        </div>
        {data.regionId && (
          <div className="item">
            <span className="icon">
              <IconCountry regionId={data.regionId} />
            </span>
            <span className="name ellipsis" title={data?.regionName}>
              {data?.regionName}
            </span>
          </div>
        )}
        <div className="item">
          <span className="icon">
            <IconBusiness buType={data.buType} />
          </span>
          <span className="name ellipsis" title={data?.buName}>
            {data?.buName}
          </span>
        </div>
      </div>
    </>
  );
};

export default UnifiedCard;
