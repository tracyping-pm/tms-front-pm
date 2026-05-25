import { css, styled } from '@umijs/max';
import { FC } from 'react';

export const ImageStyle = styled.div<{
  $url: string;
}>`
  width: 100%;
  height: 100%;
  background-position: left center;
  background-size: contain;
  background-repeat: no-repeat;

  ${(props) =>
    props.$url &&
    css`
      background-image: url(${props.$url});
    `}
`;

export interface IEmptySignature {
  required?: boolean;
}

export const EmptySignature: FC<IEmptySignature> = ({ required }) => {
  return (
    <>
      {required && <span className="required">*</span>}
      <span>Signature</span>
    </>
  );
};
