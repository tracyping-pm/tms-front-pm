import { CSSProperties, FC } from 'react';
import FieldText from './FieldText';

interface IProps {
  mainColor: string;
  readonly: boolean;
  placeholder?: string;
  style?: CSSProperties;
  onChange?: (v: any) => void;
}

const FieldCompany: FC<IProps> = ({
  mainColor,
  readonly,
  placeholder,
  style,
  onChange,
}) => {
  return (
    <FieldText
      readonly={readonly}
      mainColor={mainColor}
      style={style}
      placeholder={placeholder}
      onChange={(v) => onChange?.(v)}
    />
  );
};

export default FieldCompany;
