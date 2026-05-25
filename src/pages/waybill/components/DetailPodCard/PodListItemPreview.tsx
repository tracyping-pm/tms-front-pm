import { ICommonMaterial } from '@/api/types/common';
import { IPodItem } from '@/api/types/waybill';
import CommonFileItem from '@/components/CommonFileItem';
import CustomTooltip from '@/components/CustomTooltip';
import { DownSquareOutlined, UpSquareOutlined } from '@ant-design/icons';
import { useSetState } from 'ahooks';
import { Space } from 'antd';
import cls from 'classnames';
import { chunk } from 'lodash';
import { FC, useEffect } from 'react';
import styles from './index.less';
import { ReactComponent as IconField } from './static/container-filled.svg';
interface IState {
  list: ICommonMaterial[];
  twoDimensionalList: ICommonMaterial[][];
  size: 'small' | 'middle' | 'large';
  expand: boolean;
}

const initialState: IState = {
  list: [],
  twoDimensionalList: [],
  size: 'small',
  expand: false,
};

interface IProps {
  item: IPodItem;
  onCustomPreview?: (material: ICommonMaterial) => void;
}

const PodListItemPreview: FC<IProps> = ({ item, onCustomPreview }) => {
  const [state, setState] = useSetState<IState>(initialState);

  useEffect(() => {
    if (item.materialVoList?.length <= 12) {
      setState({ list: item.materialVoList, size: 'small' });
    } else if (
      item.materialVoList?.length > 12 &&
      item.materialVoList?.length <= 30
    ) {
      setState({
        twoDimensionalList: chunk(item.materialVoList, 5),
        size: 'middle',
      });
    } else {
      setState({
        twoDimensionalList: chunk(item.materialVoList?.slice?.(0, 30), 5),
        size: 'large',
        expand: false,
      });
    }
  }, [item.materialVoList]);

  return (
    <>
      <div className={cls(styles.listItemViewPreview, 'listItemViewPreview')}>
        <div className="listItemTitle">
          <div className="listItemTitleIcon">
            <IconField />
          </div>
          <CustomTooltip title={item.podType}>
            <span className={`title `}>{`${item.podType}`}</span>
          </CustomTooltip>
        </div>
        <Space size={24} wrap align="start">
          {state.size === 'small' ? (
            <div className="cardListItemMaterial">
              {state.list?.map((_item: ICommonMaterial) => (
                <CommonFileItem
                  key={_item?.fileMaterialId}
                  width={120}
                  height={120}
                  className="materialItem"
                  thumbnail={_item.fileThumbnailUrl}
                  fileType={_item.fileType}
                  fileName={_item.fileName}
                  materialId={_item.fileMaterialId}
                  driveFileId={_item.fileDriveId}
                  fileMimeType={_item.fileMimeType}
                  onCustomPreview={() => onCustomPreview?.(_item)}
                />
              ))}
            </div>
          ) : (
            <div className="listItemMaterials">
              {state.twoDimensionalList?.map(
                (_item: ICommonMaterial[], index: number) => (
                  <div className="listItemMaterial" key={index}>
                    {_item.map((i: ICommonMaterial) => (
                      <CommonFileItem
                        mode="list"
                        key={i.fileMaterialId}
                        className="materialItem"
                        thumbnail={i.fileThumbnailUrl}
                        fileType={i.fileType}
                        fileName={i.fileName}
                        materialId={i.fileMaterialId}
                        driveFileId={i.fileDriveId}
                        fileMimeType={i.fileMimeType}
                        onCustomPreview={() => onCustomPreview?.(i)}
                      />
                    ))}
                  </div>
                ),
              )}
              {state.size === 'large' &&
                (state.expand ? (
                  <span
                    className="more"
                    onClick={() => {
                      setState({
                        expand: false,
                        twoDimensionalList: chunk(
                          item.materialVoList?.slice?.(0, 30),
                          5,
                        ),
                      });
                    }}
                  >
                    <UpSquareOutlined />
                  </span>
                ) : (
                  <span
                    className="more"
                    onClick={() => {
                      setState({
                        expand: true,
                        twoDimensionalList: chunk(item.materialVoList, 5),
                      });
                    }}
                  >
                    <DownSquareOutlined />
                  </span>
                ))}
            </div>
          )}
        </Space>
      </div>
    </>
  );
};

export default PodListItemPreview;
