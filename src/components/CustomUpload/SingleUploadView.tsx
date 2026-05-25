import { PlusOutlined } from '@ant-design/icons';
import { FC } from 'react';
import { SelectText, SelectView, UploadWrap } from './StatusView';

export interface IProps {
  width?: number;
  height?: number;
  onClick?: () => void;
}

const SingleUploadView: FC<IProps> = ({
  width = 120,
  height = 120,
  onClick,
}) => {
  return (
    <>
      <UploadWrap $width={width} $height={height} onClick={() => onClick?.()}>
        <SelectView $show={true}>
          <PlusOutlined />
          <SelectText>Upload</SelectText>
        </SelectView>
      </UploadWrap>
    </>
  );
};

export default SingleUploadView;
