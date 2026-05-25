import CustomTooltip from '@/components/CustomTooltip';
import { QuestionCircleOutlined } from '@ant-design/icons';
import cls from 'classnames';
import { FC, ReactNode } from 'react';
import styles from './common.less';

interface ITitle {
  className?: string;
  title: string;
  subTitle?: string;
  tooltip?: ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}

const Title: FC<ITitle> = ({
  title,
  subTitle,
  tooltip,
  extra,
  className,
  style,
}) => {
  return (
    <>
      <div className={cls(styles.titleWrap, className)} style={style}>
        <div className="left">
          <div className="title">
            <span className="mainTitle">{title}</span>
            {tooltip && (
              <span className="tooltip">
                <CustomTooltip title={tooltip} placement="top">
                  <QuestionCircleOutlined />
                </CustomTooltip>
              </span>
            )}
          </div>
          {subTitle && <div className="subTitle">{subTitle}</div>}
        </div>
        <span className="right">{extra}</span>
      </div>
    </>
  );
};

export default Title;

export const OutSideTitle: FC<ITitle> = ({ title }) => {
  return (
    <>
      <div className={styles.outSideTitle}>{title}</div>
    </>
  );
};
