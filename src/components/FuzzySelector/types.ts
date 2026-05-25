import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { SelectProps } from 'antd';

export type I_FIELD_PROPS = SelectProps;

export interface I_FUZZY_API_REQUEST {
  field: string;
  value: string;
  esDtoClass: string;
  type: FieldQueryHighlightTypeEnum;
  projectId?: number;
  approved?: number;
  uniqueLogic?: FieldQueryHighlightUniqueLogicEnum;
  uniqueLogicParams?: { [key: string]: any };
}

export interface I_FUZZY_API_RESPONSE {
  id: number;
  countryId: number;
  name: string;
  nameHighlight: string;
  additionalRemark: string;
  disabled: boolean;
  disabledTip: string;
  uniqueLogicParams?: { [key: string]: any };
  extraFields: string;
}

export interface I_CUSTOM_PROPS {
  isUAM?: boolean;
  startupLength?: number;
  debounceTime?: number;
  requestWithoutSpace?: boolean;
}

export interface I_FUZZY_COMMON {
  fieldProps?: I_FIELD_PROPS; // antd select 组件 props
  customProps?: I_CUSTOM_PROPS; // 组件自定义配置
  request: Omit<I_FUZZY_API_REQUEST, 'value'>; // 请求参数
}

export interface I_FUZZY_SELECTOR extends I_FUZZY_COMMON {
  value?: I_FUZZY_API_RESPONSE | I_FUZZY_API_RESPONSE[];
  onChange?: (v?: I_FUZZY_API_RESPONSE | I_FUZZY_API_RESPONSE[]) => void;
}

export interface I_OPTION extends I_FUZZY_API_RESPONSE {
  label: React.ReactNode | string;
  value: number | undefined;
}

export interface I_LABEL {
  content: string;
  additionalRemark?: string;
  disableTip?: string;
  extraFields?: string;
}

export enum ENUM_NOT_FOUND_STATUS {
  INIT = 'init',
  PENDING = 'pending',
  EMPTY = 'empty',
}

export interface I_NOT_FOUND_CONTENT {
  status: ENUM_NOT_FOUND_STATUS;
  startupLength: number;
}
