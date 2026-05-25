import { useModel } from '@umijs/max';
import { FC } from 'react';
import styles from './index.less';

interface IUTC {
  countryId: number;
}

const UTC: FC<IUTC> = ({ countryId = 1 }) => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};

  if (!currentUser) return null;

  return (
    <>
      <span className={styles.utcTag}>UTC {countryId === 1 ? '+8' : '+7'}</span>
    </>
  );
};

export default UTC;
