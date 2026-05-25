import CustomTooltip from '@/components/CustomTooltip';
import { Col, Row } from 'antd';
import { Gutter } from 'antd/es/grid/row';
import cls from 'classnames';
import { FC, ReactNode, memo } from 'react';
import styles from './index.less';

interface IInfoItem {
  label: string;
  value: string | number | ReactNode;
  hasDivider?: boolean;
  labelColor?: string;
  valueColor?: string;
  popover?: boolean;
  pointer?: boolean;
  handle?: () => void;
}

export interface IContentCase {
  infoList: IInfoItem[];
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
  gutter?: [Gutter, Gutter];
  span?: number;
  flex?: any;
  labelStyle?: object;
  valueStyle?: object;
}

const InfoListCase: FC<IContentCase> = ({
  infoList = [],
  justify = 'space-between',
  gutter = [24, 16], // [水平间距, 垂直间距]
  span = 4,
  flex,
  labelStyle = {},
  valueStyle = {},
}) => {
  const InfoItem = memo(function ({
    label,
    value,
    labelColor = 'var(--character-primary-45)',
    valueColor = '#262626',
    hasDivider = false,
    popover = false,
    pointer,
    handle,
  }: IInfoItem) {
    return (
      <div className={styles.infoItemWrap}>
        <div className={styles.infoItem}>
          <div
            className={styles.infoItemLabel}
            style={{
              color: labelColor,
              ...labelStyle,
            }}
            title={label}
          >
            {label}
          </div>

          {popover ? (
            <CustomTooltip title={value ?? '-'}>
              <div
                className={cls(styles.infoItemValue, styles.ellipsis)}
                style={{
                  color: valueColor,
                  cursor: pointer ? 'pointer' : 'default',
                  ...valueStyle,
                }}
                onClick={() => handle?.()}
              >
                {value ?? '-'}
              </div>
            </CustomTooltip>
          ) : (
            <div
              className={styles.infoItemValue}
              style={{
                color: valueColor,
                cursor: pointer ? 'pointer' : 'default',
                ...valueStyle,
              }}
              onClick={() => handle?.()}
            >
              {value ?? '-'}
            </div>
          )}
        </div>
        {hasDivider && <div className={styles.divider} />}
      </div>
    );
  });

  return (
    <>
      <section className={styles.infoList}>
        <Row gutter={gutter} justify={justify}>
          {infoList.map((item, index) => (
            <Col key={index} span={span} flex={flex}>
              <InfoItem
                label={item.label}
                value={item.value}
                popover={item.popover}
                hasDivider={item.hasDivider}
                labelColor={item.labelColor}
                valueColor={item.valueColor}
                pointer={item.pointer}
                handle={item.handle}
              />
            </Col>
          ))}
        </Row>
      </section>
    </>
  );
};

export default InfoListCase;
