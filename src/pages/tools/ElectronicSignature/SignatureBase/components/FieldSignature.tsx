import { useFieldBase } from '@/hooks/useFieldBase';
import { useSearchParams } from '@umijs/max';
import { useSetState } from 'ahooks';
import cls from 'classnames';
import _ from 'lodash';
import { CSSProperties, FC, useEffect, useRef } from 'react';
import ChooseSignatureModal from './ChooseSignatureModal';
import { EmptySignature, ImageStyle } from './FieldStyle';
import styles from './common.less';
interface IProps {
  mainColor: string;
  readonly: boolean;
  required: boolean;
  style?: CSSProperties;
  signingName: string;
  onChange?: (v: any) => void;
}
interface IState {
  chooseSignatureModalOpen: boolean;
  signatureId?: number | string;
  signatureUrl?: string;
}
const initialState: IState = {
  chooseSignatureModalOpen: false,
  signatureId: 0,
  signatureUrl: undefined,
};
export const FieldSignature: FC<IProps> = ({
  mainColor,
  readonly = false,
  required = false,
  signingName,
  style,
  onChange,
}) => {
  const [searchParams] = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useSetState<IState>(initialState);
  const { dynamicStyle } = useFieldBase({
    fieldValue: state.signatureUrl,
    mainColor: mainColor,
    container: ref.current,
  });

  useEffect(() => {
    onChange?.(state.signatureUrl);
  }, [state.signatureUrl]);

  return (
    <>
      {readonly ? (
        <div
          className={cls(
            styles.commonField,
            'commonField',
            'signature',
            'readonly',
          )}
          style={style}
        >
          <EmptySignature required={required} />
        </div>
      ) : (
        <div
          ref={ref}
          className={cls(styles.commonField, 'commonField', 'signature')}
          style={_.merge({}, style, dynamicStyle)}
          onClick={() => {
            setState({
              chooseSignatureModalOpen: true,
              signatureId: state.signatureId,
            });
          }}
        >
          {!state.signatureUrl ? (
            <EmptySignature required={required} />
          ) : (
            <ImageStyle
              className="js-signature-base64-container"
              $url={state.signatureUrl}
              data-url={state.signatureUrl}
            />
          )}
        </div>
      )}
      {state.chooseSignatureModalOpen && (
        <ChooseSignatureModal
          open={state.chooseSignatureModalOpen}
          signatureId={state.signatureId}
          signatureEmail={searchParams.get('email')!}
          signingName={signingName}
          getSignatureUrl={(data: { url?: string; id?: string | number }) => {
            setState({
              signatureUrl: data?.url,
              signatureId: data?.id,
            });
          }}
          hideModal={() => {
            setState({
              chooseSignatureModalOpen: false,
            });
          }}
        />
      )}
    </>
  );
};

export default FieldSignature;
