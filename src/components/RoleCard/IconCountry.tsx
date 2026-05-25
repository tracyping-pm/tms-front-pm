import { REGION_ID_ENUM } from '@/enums/uam';
import { FC, useCallback } from 'react';
import { ReactComponent as IconChina } from './static/icon-china.svg';
import { ReactComponent as IconPhilippines } from './static/icon-philippines.svg';
import { ReactComponent as IconSingapore } from './static/icon-singapore.svg';
import { ReactComponent as IconThailand } from './static/icon-thailand.svg';

export interface IProps {
  regionId: REGION_ID_ENUM;
}

const IconCountry: FC<IProps> = ({ regionId }) => {
  const buildIcon = useCallback(() => {
    switch (regionId) {
      case REGION_ID_ENUM.Singapore:
        return <IconSingapore />;
      case REGION_ID_ENUM.Philippines:
        return <IconPhilippines />;
      case REGION_ID_ENUM.Thailand:
        return <IconThailand />;
      case REGION_ID_ENUM.ChinaShenZhen:
      case REGION_ID_ENUM.ChinaChengDu:
        return <IconChina />;
      default:
        return null;
    }
  }, [regionId]);

  return <>{buildIcon()}</>;
};

export default IconCountry;
