import { Button, Input, InputProps, Tag } from 'antd';
import cls from 'classnames';
import { FC, useCallback } from 'react';
import styles from './index.less';

export interface IOcrFormInput {
  fieldProps?: InputProps;
  ocrResult?: string;
  value?: string;
  showTag?: boolean;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
}

const OcrFormInput: FC<IOcrFormInput> = ({
  fieldProps,
  ocrResult = '',
  value,
  showTag = true,
  onChange,
  onBlur,
}) => {
  const onInputOcrResult = useCallback(() => {
    onChange?.(ocrResult);
  }, [ocrResult]);

  return (
    <>
      <div className={cls('ocr-form-input', styles.ocrFormInput)}>
        <section className="form-input-content">
          <Input
            {...fieldProps}
            value={value}
            onBlur={(e) => onBlur?.(e.target.value)}
            onChange={(e) => onChange?.(e.target.value)}
          />
        </section>
        {showTag ? (
          <section className="form-ocr-extra">
            <div>
              <Tag
                style={{
                  color: 'var(--primary-color)',
                  borderColor: '#5BBDA9',
                  backgroundColor: '#EEF6F4',
                }}
              >
                <span>AI OCR</span>
              </Tag>
              <span>{ocrResult}</span>
            </div>
            <div>
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => onInputOcrResult()}
              >
                Input
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
};

export default OcrFormInput;
