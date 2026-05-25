import cls from 'classnames';
import _ from 'lodash';
import { FC } from 'react';
import styles from './common.less';

interface IProps {
  style?: React.CSSProperties;
}

const ThumbFieldView: FC<IProps> = ({ style }) => {
  return (
    <div
      className={cls(styles.thumbField, 'thumbField')}
      style={_.merge({}, style)}
    ></div>
  );
};

export default ThumbFieldView;
