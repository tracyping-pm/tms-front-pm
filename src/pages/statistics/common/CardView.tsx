import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { css, styled } from '@umijs/max';
import { useFullscreen } from 'ahooks';
import { Button, Flex, Typography } from 'antd';
import { FC, ReactNode, useEffect, useRef } from 'react';
import SkeletonView from './SkeletonView';

const { Title } = Typography;

const CardWrap = styled.div<{
  $borderTopLeftRadius?: number;
  $borderTopRightRadius?: number;
  $borderBottomLeftRadius?: number;
  $borderBottomRightRadius?: number;
}>`
  padding: 12px;
  background: #fff;
  overflow: hidden;

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
  loading?: boolean;
  showFullScreen?: boolean;
  fullScreenChanged?: (isFullScreen: boolean) => void;
}

const CardView: FC<ICardViewProps> = ({
  borderTopLeftRadius = 8,
  borderTopRightRadius = 8,
  borderBottomLeftRadius = 8,
  borderBottomRightRadius = 8,
  title,
  subtitle,
  children,
  loading,
  showFullScreen = false,
  fullScreenChanged,
}) => {
  const containerRef = useRef(null);
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(containerRef, {
    pageFullscreen: { zIndex: 800 },
  });

  useEffect(() => {
    fullScreenChanged?.(isFullscreen);
  }, [isFullscreen]);

  return (
    <>
      <CardWrap
        $borderTopLeftRadius={borderTopLeftRadius}
        $borderTopRightRadius={borderTopRightRadius}
        $borderBottomLeftRadius={borderBottomLeftRadius}
        $borderBottomRightRadius={borderBottomRightRadius}
        ref={containerRef}
      >
        <Flex vertical gap={8}>
          {title ? (
            <Flex gap={8} justify="space-between">
              <Title level={4} style={{ marginBottom: 0 }}>
                {title}
              </Title>
              {showFullScreen && (
                <Button
                  icon={
                    isFullscreen ? (
                      <FullscreenExitOutlined />
                    ) : (
                      <FullscreenOutlined />
                    )
                  }
                  color="default"
                  variant="link"
                  style={{ fontSize: '20px' }}
                  onClick={() => {
                    toggleFullscreen();
                  }}
                />
              )}
            </Flex>
          ) : null}
          {subtitle ? <CardSubtitle>{subtitle}</CardSubtitle> : null}
          {loading ? <SkeletonView /> : children}
        </Flex>
      </CardWrap>
    </>
  );
};

export default CardView;
