import { createContext, useReducer } from 'react';

export const OPS_TYPE = {
  REFRESH_FLAG: 'refresh-flag',
  // project detail
  PROJECT_DETAIL: 'project-detail',
  // capacity pool
  CREATE_POOL_MODAL: 'create-pool-modal',
};

// 创建 Context 对象
export const StateContext = createContext({});

// 初始化 state
const initialState = {
  refreshFlag: false,
  // project detail
  projectDetail: {
    data: {},
  },
  // capacity pool
  capacityPoolCreateModal: {
    open: false,
    data: {},
  },
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
    // project detail
    case OPS_TYPE.REFRESH_FLAG: {
      const { payload } = action;
      return {
        ...state,
        refreshFlag: payload.data,
      };
    } // project detail
    case OPS_TYPE.PROJECT_DETAIL: {
      const { payload } = action;
      return {
        ...state,
        projectDetail: {
          data: payload.data,
        },
      };
    }
    // capacity pool
    case OPS_TYPE.CREATE_POOL_MODAL: {
      const { payload } = action;

      return {
        ...state,
        capacityPoolCreateModal: {
          open: payload.open,
          data: payload.data,
        },
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
