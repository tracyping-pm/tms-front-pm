import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';

interface ITitleCase {
  title: string;
  className?: string;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
  noStyle?: boolean;
}

const TitleCase: FC<ITitleCase> = ({
  title,
  extra,
  className,
  style,
  noStyle = false,
}) => {
  return (
    <>
      <div
        className={cls(styles.titleCase, className, noStyle && styles.noStyle)}
        style={style}
      >
        <span className={styles.title}>{title}</span>
        <span className={styles.extra}>{extra}</span>
      </div>
    </>
  );
};

export default TitleCase;
