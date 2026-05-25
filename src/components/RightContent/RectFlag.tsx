import { useModel } from '@umijs/max';
import { ReactComponent as FlagPH } from '../../../public/svg/flag/rect/ph.svg';
import { ReactComponent as FlagTH } from '../../../public/svg/flag/rect/th.svg';

const RectFlag = () => {
  const { initialState } = useModel('@@initialState') ?? {};
  const { currentUser } = initialState ?? {};

  if (!currentUser) return null;

  return (
    <>
      <span style={{ marginRight: '4px', marginTop: '2px' }}>
        {currentUser.countryId === 1 && <FlagPH />}
        {currentUser.countryId === 2 && <FlagTH />}
      </span>
    </>
  );
};

export default RectFlag;
