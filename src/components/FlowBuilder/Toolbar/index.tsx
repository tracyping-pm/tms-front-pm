import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Affix, Divider, Tooltip } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import { EnumToolType, IZoomConfig } from '../constant';
import { ReactComponent as IconAim } from './icon/aim.svg';
import { ReactComponent as IconZoomIn } from './icon/zoom-in.svg';
import { ReactComponent as IconZoomOut } from './icon/zoom-out.svg';
import styles from './index.less';

interface IProps {
  className?: string;
  zoomConfig: IZoomConfig;
  isFullscreen: boolean;
  useHistory: boolean;
  onChange?: (type: EnumToolType, e: any) => void;
}

const ToolBar: FC<IProps> = ({
  className,
  zoomConfig,
  isFullscreen,
  // useHistory,
  onChange,
}) => {
  const handleClick = (type: EnumToolType, e: any) => {
    onChange?.(type, e);
  };

  return (
    <>
      <Affix offsetTop={isFullscreen ? 0 : 60}>
        <div className={cls('toolbar-wrap', styles.toolbarWrap, className)}>
          <div className="toolbar">
            {/* {useHistory && (
            <>
              <span className="tool-item antd-icon">
                <span onClick={(e) => handleClick(EnumToolType.UNDO, e)}>
                  <Tooltip title={'Undo'}>
                    <UndoOutlined />
                  </Tooltip>
                </span>
              </span>

              <span className="tool-item antd-icon">
                <span onClick={(e) => handleClick(EnumToolType.REDO, e)}>
                  <Tooltip title={'Redo'}>
                    <RedoOutlined />
                  </Tooltip>
                </span>
              </span>
              <Divider type="vertical" style={{ borderColor: '#999' }} />
            </>
          )} */}

            <span className="tool-item">
              <span
                className={cls(
                  'zoom-item',
                  zoomConfig.outDisabled && 'disabled',
                )}
                onClick={(e) => handleClick(EnumToolType.ZOOM_OUT, e)}
              >
                <Tooltip title={'Zoom Out'}>
                  <IconZoomOut />
                </Tooltip>
              </span>
              <span onClick={(e) => handleClick(EnumToolType.ZOOM_RESET, e)}>
                <Tooltip title={'Back to 100%'}>{zoomConfig.zoomValue}</Tooltip>
              </span>
              <span
                className={cls(
                  'zoom-item',
                  zoomConfig.inDisabled && 'disabled',
                )}
                onClick={(e) => handleClick(EnumToolType.ZOOM_IN, e)}
              >
                <Tooltip title={'Zoom In'}>
                  <IconZoomIn />
                </Tooltip>
              </span>
            </span>
            <Divider type="vertical" style={{ borderColor: '#999' }} />

            <span className="tool-item antd-icon">
              <span
                onClick={(e) => handleClick(EnumToolType.FULL_SCREEN_TOOGLE, e)}
              >
                <Tooltip title={'Toogle Fullscreen'}>
                  {isFullscreen ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )}
                </Tooltip>
              </span>
            </span>

            <span className="tool-item">
              <span
                onClick={(e) => handleClick(EnumToolType.BACK_TO_ORIGINAL, e)}
              >
                <Tooltip title={'Back to Original'}>
                  <IconAim />
                </Tooltip>
              </span>
            </span>

            {/* <span className="tool-item antd-icon">
              <span onClick={(e) => handleClick(EnumToolType.DOWNLOAD_XML, e)}>
                <Tooltip title={'Download XML'}>
                  <DownloadOutlined />
                </Tooltip>
              </span>
            </span> */}
          </div>
        </div>
      </Affix>
    </>
  );
};

export default ToolBar;
