import { css, styled } from '@umijs/max';

export enum ViewStatusEnum {
  SELECT = 'select',
  PROGRESS = 'progress',
  RESULT = 'result',
}

export const UploadWrap = styled.div<{
  $status?: ViewStatusEnum;
  $width?: number;
  $height?: number;
}>`
  width: ${(props) => `${props.$width}px`};
  height: ${(props) => `${props.$height}px`};
  background: #fafafa;
  border-radius: 4px;
  overflow: hidden;

  ${(props) =>
    props.$status &&
    css`
      background: #fafafa;
    `}
`;

export const SelectView = styled.div<{
  $show: boolean;
}>`
  width: 100%;
  height: 100%;
  background: #fafafa;
  border: 2px dashed #d9d9d9;
  cursor: pointer;
  display: ${(props) => (props.$show ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  position: relative;

  &:hover {
    border-color: #009688;
  }
`;

export const SelectText = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
  line-height: 22px;
`;

export const InputFile = styled.input`
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;
`;

export const ProgressView = styled.div<{
  $show: boolean;
}>`
  display: ${(props) => (props.$show ? 'block' : 'none')};
  width: 100%;
  height: 100%;
  // background: rgba(0, 0, 0, 0.45);
  position: relative;
`;

export const LoadingBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
`;

export const ProgressBar = styled.div`
  width: 75%;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  transform: translate(-50%, -50%);
`;

export const PreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: fill;
  opacity: 0.45;
`;

export const ResultView = styled.div<{
  $show: boolean;
}>`
  display: ${(props) => (props.$show ? 'block' : 'none')};
  width: 100%;
  height: 100%;
`;

export const ResultImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: fill;
  opacity: 0.45;
`;
