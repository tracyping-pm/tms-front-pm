import { useModel } from '@umijs/max';
import { FC } from 'react';
import PHP from './PHP';
import THB from './THB';

const CountryIcon: FC = () => {
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;

  return countryId === 1 ? <PHP /> : <THB />;
};

export default CountryIcon;
