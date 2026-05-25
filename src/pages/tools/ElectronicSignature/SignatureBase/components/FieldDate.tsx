import { useSetState } from 'ahooks';
import { DatePicker } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import _ from 'lodash';
import { CSSProperties, FC, useEffect, useRef } from 'react';

import { useFieldBase } from '@/hooks/useFieldBase';
import styles from './common.less';

interface IProps {
  mainColor: string;
  readonly: boolean;
  style?: CSSProperties;
  onChange?: (v: any) => void;
}
interface IState {
  signatureTimeValue?: string;
}
const initialState: IState = {
  signatureTimeValue: undefined,
};
const FieldDate: FC<IProps> = ({ mainColor, readonly, style, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useSetState<IState>(initialState);
  const { dynamicStyle } = useFieldBase({
    fieldValue: state.signatureTimeValue,
    mainColor: mainColor,
    container: ref.current,
  });

  useEffect(() => {
    onChange?.(state.signatureTimeValue);
  }, [state.signatureTimeValue]);

  return readonly ? (
    <div
      className={cls(styles.commonField, 'commonField', 'date', 'readonly')}
      style={style}
    >
      YYYY-MM-DD
    </div>
  ) : (
    <div
      ref={ref}
      className={cls(styles.commonField, 'commonField', 'date')}
      style={_.merge({}, style, dynamicStyle)}
    >
      <span className="space" style={_.merge({}, style, dynamicStyle)}>
        {state.signatureTimeValue ? (
          dayjs(state.signatureTimeValue).format('YYYY-MM-DD')
        ) : (
          <span className="placeholder">YYYY-MM-DD</span>
        )}
      </span>

      <DatePicker
        value={
          state.signatureTimeValue ? dayjs(state.signatureTimeValue) : undefined
        }
        placeholder="YYYY-MM-DD"
        suffixIcon={null}
        allowClear={false}
        variant={'borderless'}
        inputReadOnly={true}
        onChange={(v) => {
          setState({
            signatureTimeValue: v ? dayjs(v).format('YYYY-MM-DD') : undefined,
          });
        }}
      />
    </div>
  );
};

export default FieldDate;
