import { createContext, useReducer } from 'react';

export const OPS_TYPE = {
  OPPORTUNITY_DETAIL: 'opportunity-detail',
};

// 创建 Context 对象
export const StateContext = createContext({});

// 初始化 state
const initialState = {
  opportunityDetail: {},
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
    case OPS_TYPE.OPPORTUNITY_DETAIL: {
      const { payload } = action;
      return {
        ...state,
        opportunityDetail: payload.data,
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
