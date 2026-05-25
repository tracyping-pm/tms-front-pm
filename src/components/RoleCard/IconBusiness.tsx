import { BU_TYPE_ENUM } from '@/enums/uam';
import { FC, useCallback } from 'react';
import { ReactComponent as IconBu1 } from './static/icon-bu1.svg';
import { ReactComponent as IconBu2 } from './static/icon-bu2.svg';
import { ReactComponent as IconBu3 } from './static/icon-bu3.svg';
import { ReactComponent as IconBu4 } from './static/icon-bu4.svg';

export interface IProps {
  buType: BU_TYPE_ENUM;
}

const IconBusiness: FC<IProps> = ({ buType }) => {
  const buildIcon = useCallback(() => {
    switch (buType) {
      case BU_TYPE_ENUM.TMS:
        return <IconBu1 />;
      case BU_TYPE_ENUM.WMS:
        return <IconBu2 />;
      case BU_TYPE_ENUM.UAM:
        return <IconBu3 />;
      case BU_TYPE_ENUM.HR:
        return <IconBu4 />;
      default:
        return null;
    }
  }, [buType]);

  return <>{buildIcon()}</>;
};

export default IconBusiness;
