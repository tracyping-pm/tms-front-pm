import { useSetState } from 'ahooks';
import { useCallback } from 'react';

type IStepCurrent = 0 | 1;
type IStepStatus = 'wait' | 'process' | 'finish' | 'error';

interface IState {
  stepCurrent: IStepCurrent;
  stepStatus: IStepStatus;
  stepData: Map<IStepCurrent, any>;
  showStepBar: boolean;
}

const initialState: IState = {
  stepCurrent: 0,
  stepStatus: 'process',
  stepData: new Map(),
  showStepBar: true,
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

  const setShowStepBar = useCallback((show: boolean) => {
    setState({ showStepBar: show });
  }, []);

  const doPrev = useCallback(() => {
    const current = state.stepCurrent - 1;
    setState({ stepCurrent: current as IStepCurrent });
  }, [state.stepCurrent]);

  const doNext = useCallback(() => {
    const current = state.stepCurrent + 1;
    setState({ stepCurrent: current as IStepCurrent });
  }, [state.stepCurrent]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    doPrev,
    doNext,
    getStepData,
    setStepData,
    setShowStepBar,
    reset,
  };
};

export default State;
