import { IContractTrackingExpireCountData } from '@/api/types/contract';
import { EnumContractExpireStatus } from '@/enums';

export interface ExpiringOption {
  key: EnumContractExpireStatus;
  label: string;
  count?: number;
}

export interface ExpiringDayFilterProps {
  value?: EnumContractExpireStatus;
  onChange?: (value: EnumContractExpireStatus) => void;
  dataSource?: IContractTrackingExpireCountData;
  expireFileType?: string;
}
