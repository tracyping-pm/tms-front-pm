import { EyeOutlined } from '@ant-design/icons';
import { useHover } from 'ahooks';
import { Avatar, AvatarProps, Image } from 'antd';
import { FC, useRef, useState } from 'react';
import defaultURL from '../../../public/svg/default-sku.svg';

export interface IPreviewAvatar extends AvatarProps {
  src?: string;
}

const PreviewAvatar: FC<IPreviewAvatar> = ({
  shape = 'square',
  size = 64,
  src = defaultURL,
  ...restProps
}) => {
  const ref = useRef(null);
  const isHovering = useHover(ref);
  const [previewVisible, setPreviewVisible] = useState(false);

  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
        <Avatar shape={shape} size={size} src={src} {...restProps} />
        {isHovering && (
          <section
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              cursor: 'pointer',
            }}
          >
            <EyeOutlined
              style={{ color: 'white' }}
              onClick={() => setPreviewVisible(true)}
            />
          </section>
        )}

        <Image
          style={{ display: 'none' }}
          preview={{
            visible: previewVisible,
            src: src,
            onVisibleChange: (open) => {
              setPreviewVisible(open);
            },
            mask: <EyeOutlined />,
          }}
        />
      </div>
    </>
  );
};

export default PreviewAvatar;
