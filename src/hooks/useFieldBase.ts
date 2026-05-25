import { useSetState } from 'ahooks';
import Color from 'color';
import _ from 'lodash';
import { useEffect } from 'react';

const BASE_STYLE = {
  cursor: 'text',
};

const STYLE_BLUR = {
  backgroundColor: 'transparent',
  borderColor: 'transparent',
};

export interface IState {
  value: string;
  isFocus: boolean;
  isHover: boolean;
}

const initialState: IState = {
  value: '',
  isFocus: false,
  isHover: false,
};

export interface IUseFieldBaseOptions {
  fieldValue: any;
  mainColor: string;
  container?: HTMLDivElement | null;
}

export const useFieldBase = (options: IUseFieldBaseOptions) => {
  const { fieldValue, mainColor, container } = options;

  const [state, setState] = useSetState<IState>(initialState);

  const borderColor = mainColor;
  const backgroundColor = Color(mainColor).alpha(0.1).rgb().string();

  const hoverBorderColor = Color(borderColor).alpha(0.3).rgb().string();
  const hoverBackgroundColor = Color(backgroundColor)
    .alpha(0.05)
    .rgb()
    .string();

  const onFocus = () => {
    setState({ isFocus: true });
  };

  const onBlur = () => {
    setState({ isFocus: false });
  };

  const onMouseOver = () => {
    setState({ isHover: true });
  };

  const onMouseOut = () => {
    setState({ isHover: false });
  };

  const bindEvents = () => {
    container?.addEventListener('focus', onFocus);
    container?.addEventListener('blur', onBlur);
    container?.addEventListener('mouseover', onMouseOver);
    container?.addEventListener('mouseout', onMouseOut);
  };

  useEffect(() => {
    setState({ value: fieldValue });
  }, [fieldValue]);

  useEffect(() => {
    if (container) {
      bindEvents();
    }
  }, [container]);

  const dynamicStyle = _.merge(
    {},
    BASE_STYLE,
    !state.isFocus && state.value
      ? state.isHover
        ? {
            borderColor: hoverBorderColor,
            backgroundColor: hoverBackgroundColor,
          }
        : STYLE_BLUR
      : {},
  );

  return {
    state,
    dynamicStyle,
  };
};
