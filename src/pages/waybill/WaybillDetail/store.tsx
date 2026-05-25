import { createContext, useReducer } from 'react';

export const OPS_TYPE = {
  CARRIER_SELECT: 'carrier-select',
  BASIC_INFO: 'basic-info',
  BILLING_INFO: 'billing-info',
  REFRESH: 'refresh',
  REFRESH_BILLING: 'refresh-billing',
  REFRESH_BASIC_INFO: 'refresh-basic-info',
  SHOW_POD: 'show-pod',
  SHOW_RECORD: 'show-record',
  ROUTE_INFO: 'route-info',
  CLAIM_INFO: 'claim-info',
  REIMBURSEMENT_INFO: 'reimbursement-info',
};

export const DEFAULT_CARRIER_SELECT = {
  step: 1,
  vendor: null,
  truck: null,
  driver: null,
  helpers: [],
};

// 创建 Context 对象
export const StateContext = createContext(null);

// 初始化 state
const initialState = {
  loading: true,
  refreshBilling: false,
  refreshBasicInfo: false,
  showRecord: true,
  carrierSelect: DEFAULT_CARRIER_SELECT,
  waybillBasicInfo: {},
  billingInfo: {},
  routeInfo: {},
  claimInfo: {},
  reimbursementInfo: {},
};

// reducer 函数
const reducer = (
  state: any,
  action: {
    type: string;
    payload: any;
  },
) => {
  switch (action.type) {
    // carrier-select
    case OPS_TYPE.CARRIER_SELECT: {
      const { payload } = action;
      // console.log('carrierSelect:', payload.data);
      return {
        ...state,
        carrierSelect: payload.data,
      };
    }
    // basic-info
    case OPS_TYPE.BASIC_INFO: {
      const { payload } = action;
      return {
        ...state,
        waybillBasicInfo: payload.data,
      };
    }
    // billing-info
    case OPS_TYPE.BILLING_INFO: {
      const { payload } = action;
      return {
        ...state,
        billingInfo: payload.data,
      };
    }
    // route-info
    case OPS_TYPE.ROUTE_INFO: {
      const { payload } = action;
      return {
        ...state,
        routeInfo: payload.data,
      };
    }
    // claim-info
    case OPS_TYPE.CLAIM_INFO: {
      const { payload } = action;
      return {
        ...state,
        claimInfo: payload.data,
      };
    }
    // reimbursementInfo-info
    case OPS_TYPE.REIMBURSEMENT_INFO: {
      const { payload } = action;
      return {
        ...state,
        reimbursementInfo: payload.data,
      };
    }

    // refresh-basic-info
    case OPS_TYPE.REFRESH_BASIC_INFO: {
      const { payload } = action;
      return {
        ...state,
        refreshBasicInfo: payload.data,
      };
    }
    // refresh-billing
    case OPS_TYPE.REFRESH_BILLING: {
      const { payload } = action;
      return {
        ...state,
        refreshBilling: payload.data,
      };
    }
    // refresh
    case OPS_TYPE.REFRESH: {
      const { payload } = action;
      return {
        ...state,
        loading: payload.data,
      };
    }
    // show-record
    case OPS_TYPE.SHOW_RECORD: {
      const { payload } = action;
      return {
        ...state,
        showRecord: payload.data,
      };
    }
    default:
      return state;
  }
};

// 导出 Provider 组件,用于提供 state
export const StoreProvider = ({ children }: { children: any }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    // @ts-ignore
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};
