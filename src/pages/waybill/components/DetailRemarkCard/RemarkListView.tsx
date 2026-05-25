import { IRemarkItem } from '@/api/types/waybill';
import cls from 'classnames';
import { FC } from 'react';
import ListItemView from './ListItemView';
import styles from './index.less';

interface IProps {
  list: IRemarkItem[];
  canEdit: boolean;
  canDelete: boolean;
}

const RemarkListView: FC<IProps> = ({ list, canEdit, canDelete }) => {
  return (
    <>
      <div className={cls(styles.remarkListView, 'remarkListView')}>
        {list?.map((item) => {
          return (
            <ListItemView
              key={item.waybillRemarkId}
              item={item}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          );
        })}
      </div>
    </>
  );
};

export default RemarkListView;
