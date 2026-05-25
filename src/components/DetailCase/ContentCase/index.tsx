import { FC, ReactNode } from 'react';
import InfoListCase from '../InfoListCase';
import styles from './index.less';

interface IInfoItem {
  label: string;
  value: string | number | ReactNode;
}

export interface IContentCase {
  title: string;
  titleValue: string;
  extra?: ReactNode;
  infoList?: IInfoItem[];
  infoListRest?: any;
}

const ContentCase: FC<IContentCase> = ({
  title,
  titleValue,
  extra,
  infoList = [],
  infoListRest = {},
}) => {
  return (
    <>
      <div className={styles.contentCaseWrap}>
        <section className={styles.titleBar}>
          <span className={styles.title} title={title}>
            {title}
          </span>
          <span className={styles.extra}>{extra}</span>
        </section>
        <section className={styles.titleValue}>{titleValue}</section>
        <InfoListCase infoList={infoList} {...infoListRest} />
      </div>
    </>
  );
};

export default ContentCase;
