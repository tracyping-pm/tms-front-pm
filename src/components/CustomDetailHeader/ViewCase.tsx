import { styled } from '@umijs/max';

export const LabelCase = styled.span`
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
`;

export const ValueCase = styled.span<{
  $fontSize?: number;
  $lineHeight?: number;
}>`
  color: rgba(0, 0, 0, 0.88);
  font-weight: 500;
  font-size: ${(props) => `${props.$fontSize ?? 14}px`};
  line-height: ${(props) => `${props.$lineHeight ?? 22}px`};
`;

export const CellLabelCase = styled.span`
  height: 100%;
  flex-basis: 174px;
  padding: 12px 8px;
  background: rgba(0, 0, 0, 0.02);
  border-right: 0.5px solid #f0f0f0;
  border-bottom: 0.5px solid #f0f0f0;
  color: rgba(0, 0, 0, 0.88);
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  word-break: break-word;
`;

export const CellValueCase = styled.span`
  height: 100%;
  flex: 1;
  padding: 12px 8px;
  border-right: 0.5px solid #f0f0f0;
  border-bottom: 0.5px solid #f0f0f0;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  word-break: break-word;
`;

export const CellItem = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  padding: 12px 8px;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  word-break: break-all;
`;
