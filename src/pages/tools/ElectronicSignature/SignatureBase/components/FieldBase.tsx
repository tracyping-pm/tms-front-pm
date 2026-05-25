import { SignTypeEnum } from '@/constants';
import { useSetState } from 'ahooks';
import cls from 'classnames';
import Color from 'color';
import { FC, useEffect } from 'react';
import FieldAddress from './FieldAddress';
import FieldCompany from './FieldCompany';
import FieldDate from './FieldDate';
import FieldEmail from './FieldEmail';
import FieldSignature from './FieldSignature';
import FieldText from './FieldText';
import styles from './common.less';

interface IThemeObj extends React.CSSProperties {
  borderColor?: string;
  backgroundColor?: string;
}

interface IProps {
  signType: SignTypeEnum;
  required: boolean;
  readonly: boolean;
  mainColor: string;
  style?: React.CSSProperties;
  signingName?: string;
  onChange?: (v: any) => void;
}

const FieldBase: FC<IProps> = ({
  readonly = false,
  required = false,
  signType,
  mainColor,
  style,
  signingName,
  onChange,
}) => {
  const [themeObj, setThemeObj] = useSetState<IThemeObj>({
    borderColor: mainColor,
    width: style?.width,
    height: style?.height,
    lineHeight: style?.height,
    fontSize: style?.fontSize,
  });

  const handleChange = (v: any) => {
    onChange?.(v);
  };

  useEffect(() => {
    const backgroundColor = Color(mainColor).alpha(0.1).rgb().string();
    setThemeObj({ borderColor: mainColor, backgroundColor: backgroundColor });
  }, [mainColor]);

  useEffect(() => {
    setThemeObj({
      width: style?.width,
      height: style?.height,
      lineHeight: style?.height + 'px',
      fontSize: style?.fontSize,
    });
  }, [style?.width, style?.height, style?.fontSize]);

  return (
    <div
      className={cls(styles.fieldBase, 'fieldBase')}
      // style={_.merge({}, style, {})}
    >
      {signType === SignTypeEnum.SIGNATURE && (
        <FieldSignature
          readonly={readonly}
          required={required}
          mainColor={mainColor}
          signingName={signingName!}
          style={themeObj}
          onChange={handleChange}
        />
      )}
      {signType === SignTypeEnum.DATE && (
        <FieldDate
          readonly={readonly}
          mainColor={mainColor}
          style={themeObj}
          onChange={handleChange}
        />
      )}
      {signType === SignTypeEnum.TEXT && (
        <FieldText
          readonly={readonly}
          mainColor={mainColor}
          style={themeObj}
          placeholder="Text"
          onChange={handleChange}
        />
      )}
      {signType === SignTypeEnum.COMPANY && (
        <FieldCompany
          readonly={readonly}
          mainColor={mainColor}
          style={themeObj}
          placeholder="Company"
          onChange={handleChange}
        />
      )}
      {signType === SignTypeEnum.ADDRESS && (
        <FieldAddress
          readonly={readonly}
          mainColor={mainColor}
          style={themeObj}
          placeholder="Address"
          onChange={handleChange}
        />
      )}
      {signType === SignTypeEnum.EMAIL && (
        <FieldEmail
          readonly={readonly}
          mainColor={mainColor}
          style={themeObj}
          placeholder="Email"
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default FieldBase;
