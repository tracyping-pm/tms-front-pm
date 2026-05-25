import { css, styled } from '@umijs/max';
import { Flex } from 'antd';
import { FC, ReactNode } from 'react';

const CardWrap = styled.div<{
  $borderTopLeftRadius?: number;
  $borderTopRightRadius?: number;
  $borderBottomLeftRadius?: number;
  $borderBottomRightRadius?: number;
}>`
  padding: 12px;
  background: #fff;

  ${(props) =>
    props.$borderTopLeftRadius &&
    css`
      border-top-left-radius: ${props.$borderTopLeftRadius}px;
    `}

  ${(props) =>
    props.$borderTopRightRadius &&
    css`
      border-top-right-radius: ${props.$borderTopRightRadius}px;
    `}

    ${(props) =>
    props.$borderBottomLeftRadius &&
    css`
      border-bottom-left-radius: ${props.$borderBottomLeftRadius}px;
    `}

  ${(props) =>
    props.$borderBottomRightRadius &&
    css`
      border-bottom-right-radius: ${props.$borderBottomRightRadius}px;
    `}
`;

const CardTitle = styled.div`
  color: rgba(0, 0, 0, 0.85);
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 24px;
`;

const CardSubtitle = styled.div`
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
`;

export interface ICardViewProps {
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: React.ReactNode;
}

const CardView: FC<ICardViewProps> = ({
  borderTopLeftRadius = 1,
  borderTopRightRadius = 1,
  borderBottomLeftRadius = 1,
  borderBottomRightRadius = 1,
  title,
  subtitle,
  children,
}) => {
  return (
    <>
      <CardWrap
        $borderTopLeftRadius={borderTopLeftRadius}
        $borderTopRightRadius={borderTopRightRadius}
        $borderBottomLeftRadius={borderBottomLeftRadius}
        $borderBottomRightRadius={borderBottomRightRadius}
      >
        <Flex vertical gap={12}>
          {title ? <CardTitle>{title}</CardTitle> : null}
          {subtitle ? <CardSubtitle>{subtitle}</CardSubtitle> : null}
          {children}
        </Flex>
      </CardWrap>
    </>
  );
};

export default CardView;
