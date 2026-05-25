import { ICommonMaterial } from '@/api/types/common';
import CommonFileItem from '@/components/CommonFileItem';
import CustomConfirmModal from '@/components/CustomConfirmModal';
import CustomPopover from '@/components/CustomPopover';
import CustomTooltip from '@/components/CustomTooltip';
import { IconEdit } from '@/components/OperationIcon';
import { CountryMapEnum, EnumVAT, EnumWHT } from '@/enums';
import {
  DeleteOutlined,
  DownSquareOutlined,
  MinusCircleOutlined,
  UpSquareOutlined,
} from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Space } from 'antd';
import cls from 'classnames';
import _, { chunk } from 'lodash';
import { FC, useEffect } from 'react';
import styles from './index.less';
import { ReactComponent as IconField } from './static/container-filled.svg';
export interface IStatementMaterialListItem {
  id: number;
  description?: string;
  wht?: EnumWHT;
  vat?: EnumVAT;
  title:
    | string
    | {
        invoiceNumber: string;
        invoiceDate: string;
        statementInvoiceNumberId?: number;
      }[];
  subTitle?:
    | string
    | {
        voucherNumber?: string;
        voucherDate?: string;
      }[];
  materialVoList: ICommonMaterial[];
  [key: string]: any;
}

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
  item: IStatementMaterialListItem;
  canEdit?: boolean;
  showCancelText?: boolean;
  showIcon?: boolean;
  showTax?: boolean;
  onCustomPreview?: (material: ICommonMaterial) => void;
  onEditHandle?: () => void;
  onDeleteHandle?: () => void;
}

const ListItem: FC<IProps> = ({
  item,
  canEdit,
  showCancelText = false,
  showIcon = false,
  showTax = false,
  onCustomPreview,
  onEditHandle,
  onDeleteHandle,
}) => {
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;
  const isTH = countryId === CountryMapEnum.Thailand;
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
      <div className={cls(styles.fileList, 'fileList')}>
        <div className="listItemTitle">
          {_.isArray(item.title) ? (
            <div className="titleList">
              {item.title?.map((title, index) => {
                const titleContent = `${title.invoiceNumber}${title.invoiceDate ? '/' + title.invoiceDate : ''}`;
                return (
                  <CustomPopover
                    key={index}
                    content={titleContent}
                    placement="top"
                  >
                    <div className="title">
                      {showIcon ? (
                        <IconField className="listItemTitleIcon" />
                      ) : null}
                      {titleContent}
                    </div>
                  </CustomPopover>
                );
              })}
            </div>
          ) : (
            <CustomPopover content={item.title} placement="top">
              <div className="title">
                {showIcon ? <IconField className="listItemTitleIcon" /> : null}
                {`${item.title}`}
              </div>
            </CustomPopover>
          )}

          {canEdit ? (
            <span className="operation">
              <IconEdit
                onClick={() => {
                  onEditHandle?.();
                }}
              />

              <CustomConfirmModal
                title={`${showCancelText ? 'Cancel' : 'Delete'} Confirm`}
                content={`Confirm to ${showCancelText ? 'cancel' : 'delete'} this record`}
                onOk={() => {
                  onDeleteHandle?.();
                }}
                okText={`${showCancelText ? 'Cancel Invoice' : 'Confirm'}`}
                cancelText={`${showCancelText ? 'Close' : 'Cancel'}`}
              >
                <CustomTooltip
                  key="delete"
                  title={`${showCancelText ? 'Cancel' : 'Delete'}`}
                  placement="top"
                >
                  {_.isArray(item.title) ? (
                    <MinusCircleOutlined
                      className={cls(styles.iconItem, styles.deleteIcon)}
                    />
                  ) : (
                    <DeleteOutlined
                      className={cls(styles.iconItem, styles.deleteIcon)}
                    />
                  )}
                </CustomTooltip>
              </CustomConfirmModal>
            </span>
          ) : null}
        </div>
        {item.subTitle ? (
          <div className="listItemTitle">
            {_.isArray(item.subTitle) ? (
              <div className="titleList">
                {item.subTitle?.map((subTitle, index) => {
                  const voucherNumber = subTitle.voucherNumber ?? '-';
                  const voucherDate = subTitle.voucherDate ?? '-';
                  const subTitleContent = `${voucherNumber}/${voucherDate}`;

                  return (
                    <CustomPopover
                      key={index}
                      content={subTitleContent}
                      placement="top"
                    >
                      <div className="title">
                        <IconField className="listItemTitleIcon" />
                        {subTitleContent}
                      </div>
                    </CustomPopover>
                  );
                })}
              </div>
            ) : (
              <CustomPopover content={item.subTitle} placement="top">
                <div className="title">
                  {showIcon ? (
                    <IconField className="listItemTitleIcon" />
                  ) : null}
                  {`${item.subTitle}`}
                </div>
              </CustomPopover>
            )}
          </div>
        ) : null}
        {item.description ? (
          <div className="listItemDesc">
            <CustomPopover
              content={item.description}
              placement={item.description.length > 5 ? 'topLeft' : 'top'}
            >
              {item.description}
            </CustomPopover>
          </div>
        ) : null}
        {showTax && isTH ? (
          <div className="listItemTax">
            <Space size={24}>
              <Space>
                <span>VAT Rate</span>
                <span>
                  {item?.vat} {item?.vat === EnumVAT.EXEMPT ? '' : '%'}
                </span>
              </Space>
              <Space>
                <span>WHT Rate</span>
                <span>{item?.wht}%</span>
              </Space>
            </Space>
          </div>
        ) : null}
        <Space size={24} wrap align="start">
          {state.size === 'small' ? (
            <div className="cardListItemMaterial">
              {state.list?.map((fileItem: ICommonMaterial) => (
                <CommonFileItem
                  key={fileItem?.fileMaterialId}
                  width={120}
                  height={120}
                  className="materialItem"
                  thumbnail={fileItem.fileThumbnailUrl}
                  fileType={fileItem.fileType}
                  fileName={fileItem.fileName}
                  materialId={fileItem.fileMaterialId}
                  driveFileId={fileItem.fileDriveId}
                  fileMimeType={fileItem.fileMimeType}
                  onCustomPreview={() => onCustomPreview?.(fileItem)}
                />
              ))}
            </div>
          ) : (
            <div className="listItemMaterials">
              {state.twoDimensionalList?.map(
                (fileItem: ICommonMaterial[], index: number) => (
                  <div className="listItemMaterial" key={index}>
                    {fileItem.map((i: ICommonMaterial) => (
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

export default ListItem;
