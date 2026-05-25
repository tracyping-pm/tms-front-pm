import { useSetState } from 'ahooks';
import { useCallback } from 'react';

type IStepCurrent = 0 | 1 | 2 | 3;
type IStepStatus = 'wait' | 'process' | 'finish' | 'error';

interface IState {
  stepCurrent: IStepCurrent;
  stepStatus: IStepStatus;
  stepData: Map<IStepCurrent, any>;
  completeInfo: any;
}

const initialState: IState = {
  stepCurrent: 0,
  stepStatus: 'process',
  stepData: new Map(),
  completeInfo: {},
};

const State = () => {
  const [state, setState] = useSetState<IState>(initialState);

  const getStepData = useCallback(
    (stepCurrent: IStepCurrent) => {
      return state.stepData.get(stepCurrent);
    },
    [state.stepData],
  );

  const setStepData = useCallback(
    (stepCurrent: IStepCurrent, data: any) => {
      state.stepData.set(stepCurrent, data);
      setState({ stepData: state.stepData });
    },
    [state.stepData],
  );

  const doPrev = useCallback(() => {
    const current = state.stepCurrent - 1;
    setState({ stepCurrent: current as IStepCurrent });
  }, [state.stepCurrent]);

  const doNext = useCallback(() => {
    const current = state.stepCurrent + 1;
    setState({ stepCurrent: current as IStepCurrent });
  }, [state.stepCurrent]);

  const doInitiate = useCallback((completeInfo: any) => {
    setState({ stepStatus: 'finish', completeInfo });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    doPrev,
    doNext,
    getStepData,
    setStepData,
    doInitiate,
    reset,
  };
};

export default State;
