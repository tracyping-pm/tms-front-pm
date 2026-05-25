import { createContext, useReducer } from 'react';

export const OPS_TYPE = {
  HEADER_REFRESH: 'header-refresh',
  ROUTE_REFRESH: 'route-refresh',
  CUSTOMER_REFRESH: 'customer-refresh',
  VENDOR_REFRESH: 'vendor-refresh',
  // library detail
  ROUTE_LIST: 'route-list',
  // library detail
  LIBRARY_DETAIL: 'library-detail',
};

// 创建 Context 对象
export const StateContext = createContext(null);

// 初始化 state
const initialState = {
  headerRefresh: false,
  routeRefresh: false, // routeTable
  customerPVRefresh: false,
  vendorPVRefresh: false,

  // route list
  routeList: {
    data: [],
  },
  // library detail
  libraryDetail: {},
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
    // headerRefresh
    case OPS_TYPE.HEADER_REFRESH: {
      const { payload } = action;
      console.log('HEADER_REFRESH:', payload.data);
      return {
        ...state,
        headerRefresh: payload.data,
      };
    }
    // routeRefresh
    case OPS_TYPE.ROUTE_REFRESH: {
      const { payload } = action;
      console.log('ROUTE_REFRESH:', payload.data);
      return {
        ...state,
        routeRefresh: payload.data,
      };
    }
    // customerPVRefresh
    case OPS_TYPE.CUSTOMER_REFRESH: {
      const { payload } = action;
      console.log('CUSTOMER_REFRESH:', payload.data);
      return {
        ...state,
        customerPVRefresh: payload.data,
      };
    }
    // vendorPVRefresh
    case OPS_TYPE.VENDOR_REFRESH: {
      const { payload } = action;
      console.log('VENDOR_REFRESH:', payload.data);
      return {
        ...state,
        vendorPVRefresh: payload.data,
      };
    }
    // route list
    case OPS_TYPE.ROUTE_LIST: {
      const { payload } = action;
      return {
        ...state,
        routeList: {
          data: payload.data,
        },
      };
    }
    case OPS_TYPE.LIBRARY_DETAIL: {
      const { payload } = action;
      return {
        ...state,
        libraryDetail: payload.data,
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
