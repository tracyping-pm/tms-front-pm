import { useFieldBase } from '@/hooks/useFieldBase';
import { useSetState } from 'ahooks';
import cls from 'classnames';
import _ from 'lodash';
import { CSSProperties, FC, useEffect, useRef } from 'react';
import styles from './common.less';
interface IState {
  value: string;
}

const initialState: IState = {
  value: '',
};

interface IProps {
  mainColor: string;
  readonly: boolean;
  placeholder?: string;
  style?: CSSProperties;
  onChange?: (v: any) => void;
}

const FieldText: FC<IProps> = ({
  mainColor,
  readonly,
  placeholder,
  style,
  onChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useSetState<IState>(initialState);
  const { dynamicStyle } = useFieldBase({
    fieldValue: state.value,
    mainColor: mainColor,
    container: ref.current,
  });

  const onInput = (e: any) => {
    const text = e.target.innerText;
    setState({ value: text });
  };

  useEffect(() => {
    onChange?.(state.value);
  }, [state.value]);

  return readonly ? (
    <div
      className={cls(styles.commonField, 'commonField', 'text', 'readonly')}
      style={_.merge({}, style)}
    >
      {placeholder}
    </div>
  ) : (
    <div
      ref={ref}
      className={cls(
        styles.commonField,
        'commonField',
        'text',
        !state.value && 'placeholder',
      )}
      data-placeholder={placeholder}
      contentEditable="true"
      onInput={(e) => onInput(e)}
      style={_.merge(
        {},
        style,
        {
          width: 'auto',
          height: 'auto',
          minWidth: style?.width,
          minHeight: style?.height,
        },
        dynamicStyle,
      )}
    ></div>
  );
};

export default FieldText;
