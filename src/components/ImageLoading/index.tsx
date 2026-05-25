import { styled } from '@umijs/max';
import { FC } from 'react';

const LoadingDiv = styled.div`
  background: #9fafbf;
  background-image: linear-gradient(
    90deg,
    #b2b9be 0,
    #fdfdfd 20%,
    #b8bcbe 40%,
    #f6f7f8
  );
  background-repeat: no-repeat;
  background-size: 800px 304px;
  animation-duration: 1s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-name: mymove;
  animation-timing-function: linear;

  @keyframes mymove {
    from {
      background-position: right;
    }
    to {
      background-position: left;
    }
  }
`;

export interface IImageLoading {
  width?: number;
  height?: number;
}

const ImageLoading: FC<IImageLoading> = ({ width = 120, height = 120 }) => {
  return <LoadingDiv style={{ width, height }} />;
};

export default ImageLoading;
