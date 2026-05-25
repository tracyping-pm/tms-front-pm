import { createContext, useReducer } from 'react';

export const OPS_TYPE = {
  // capacity pool detail
  CAPACITY_POOL_DETAIL: 'capacity-pool-detail',
  // truck transfer modal
  TRUCK_TRANSFER_MODAL: 'truck-transfer-modal',
  // reload all
  RELOAD_ALL: 'reload-all',
};

// 创建 Context 对象
export const StateContext = createContext({});

// 初始化 state
const initialState = {
  // capacity pool detail
  capacityPoolDetail: {
    data: {},
  },
  // truck transfer modal
  truckTransferModal: {
    open: false,
    data: {},
    submited: false,
  },
  // reload all
  reloadAll: false,
};

// reducer 函数
const reducer = (state: any, action: { type: string; payload: any }) => {
  switch (action.type) {
    // capacity pool detail
    case OPS_TYPE.CAPACITY_POOL_DETAIL: {
      const { payload } = action;
      return {
        ...state,
        capacityPoolDetail: {
          data: payload.data,
        },
      };
    }
    // truck transfer modal
    case OPS_TYPE.TRUCK_TRANSFER_MODAL: {
      const { payload } = action;
      return {
        ...state,
        truckTransferModal: {
          ...payload,
        },
      };
    }
    // reload all
    case OPS_TYPE.RELOAD_ALL: {
      const { payload } = action;
      return {
        ...state,
        reloadAll: payload.reloadAll,
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
