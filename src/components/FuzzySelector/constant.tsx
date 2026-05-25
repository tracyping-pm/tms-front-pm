import { SearchOutlined } from '@ant-design/icons';
import { I_CUSTOM_PROPS, I_FIELD_PROPS, I_FUZZY_API_RESPONSE } from './types';

export const DEFAULT_CUSTOM_PROPS: I_CUSTOM_PROPS = {
  isUAM: false,
  startupLength: 2,
  debounceTime: 500,
  requestWithoutSpace: true,
};

export const DEFAULT_FIELD_PROPS: I_FIELD_PROPS = {
  showSearch: true,
  allowClear: true,
  popupMatchSelectWidth: true,
  filterOption: false,
  defaultActiveFirstOption: false,
  optionLabelProp: 'name',
  // maxTagCount: 'responsive',
  prefixCls: 'fuzzy-query',
  suffixIcon: <SearchOutlined />,
  getPopupContainer: (triggerNode) => triggerNode.parentElement,
};

export const PICKED_FIELDS: Array<keyof I_FUZZY_API_RESPONSE> = [
  'id',
  'countryId',
  'name',
  'nameHighlight',
  'additionalRemark',
  'disabled',
  'disabledTip',
  'uniqueLogicParams',
  'extraFields',
];
