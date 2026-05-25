import { BU_TYPE_ENUM } from '@/enums/uam';
import { FC, useCallback } from 'react';
import { ReactComponent as IconHR } from './static/icon-hr.svg';
import { ReactComponent as IconTMS } from './static/icon-tms.svg';
import { ReactComponent as IconUAM } from './static/icon-uam.svg';
import { ReactComponent as IconWMS } from './static/icon-wms.svg';

export interface IProps {
  buType: BU_TYPE_ENUM;
}

const IconSystem: FC<IProps> = ({ buType }) => {
  const buildIcon = useCallback(() => {
    switch (buType) {
      case BU_TYPE_ENUM.TMS:
        return <IconTMS />;
      case BU_TYPE_ENUM.WMS:
        return <IconWMS />;
      case BU_TYPE_ENUM.UAM:
        return <IconUAM />;
      case BU_TYPE_ENUM.HR:
        return <IconHR />;
      default:
        return null;
    }
  }, [buType]);

  return <>{buildIcon()}</>;
};

export default IconSystem;
