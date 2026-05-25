import { EnumCountCompareResult } from '@/enums';
import { formatAmountWithRound } from '@/utils/utils';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Space } from 'antd';
import { FC, ReactNode } from 'react';

export interface IUpDownViewProps {
  result: EnumCountCompareResult;
  number: number;
  useMoneyFormat?: boolean;
  gap?: number;
  control?: boolean;
  suffix?: ReactNode;
  arrowPosition?: 'left' | 'right';
  onClick?: () => void;
}

const UpDownView: FC<IUpDownViewProps> = ({
  result,
  number,
  useMoneyFormat = true,
  control,
  gap = control ? 8 : 0,
  suffix,
  arrowPosition = 'left',
  onClick,
  ...restProps
}) => {
  let color = '';
  switch (result) {
    case EnumCountCompareResult.INCREASE:
      color = '#52C41A';
      break;
    case EnumCountCompareResult.DECREASE:
      color = '#FF4D4F';
      break;
    case EnumCountCompareResult.EQUAL:
      color = '#000000';
      break;
    default:
      color = '#000000';
      break;
  }

  return (
    <span {...restProps}>
      <Space size={gap}>
        {arrowPosition === 'left' ? (
          <>
            {result === EnumCountCompareResult.INCREASE && (
              <ArrowUpOutlined style={{ color }} />
            )}
            {result === EnumCountCompareResult.DECREASE && (
              <ArrowDownOutlined style={{ color }} />
            )}
            {result === EnumCountCompareResult.EQUAL && (
              <ArrowDownOutlined style={{ visibility: 'hidden' }} />
            )}
          </>
        ) : null}

        {control ? (
          <Space size={0} style={{ color }}>
            <span>
              {result === EnumCountCompareResult.EQUAL
                ? '-'
                : useMoneyFormat
                  ? formatAmountWithRound(number)
                  : number}
            </span>
            <span>{suffix}</span>
          </Space>
        ) : (
          <Space
            size={0}
            style={{
              color: 'var(--primary-color)',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            onClick={() => onClick?.()}
          >
            <span>
              {useMoneyFormat ? formatAmountWithRound(number) : number}
            </span>
            <span style={{ color: 'var(--primary-color)' }}>{suffix}</span>
          </Space>
        )}

        {arrowPosition === 'right' ? (
          <>
            {result === EnumCountCompareResult.INCREASE && (
              <ArrowUpOutlined style={{ color }} />
            )}
            {result === EnumCountCompareResult.DECREASE && (
              <ArrowDownOutlined style={{ color }} />
            )}
            {result === EnumCountCompareResult.EQUAL && (
              <ArrowDownOutlined style={{ visibility: 'hidden' }} />
            )}
          </>
        ) : null}
      </Space>
    </span>
  );
};

export default UpDownView;
