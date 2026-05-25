import { ICommonListItem, ICommonMaterial, ITagItem } from '@/api/types/common';

import styles from '@/components/DetailHeader/styles.less';
import {
  CustomerStatusEnum,
  CustomerStatusEnumColor,
  LeadStatusEnum,
  LeadStatusEnumTextColor,
} from '@/enums';
import {
  DoubleRightOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Badge, Button, Image } from 'antd';
import cls from 'classnames';
import { memo } from 'react';
import CustomTooltip from '../CustomTooltip';

// info item
export const InfoItem = memo(function (props: {
  label: string | number | React.ReactNode;
  name: string | number | React.ReactNode;
  tag: ITagItem | undefined;
  popover?: boolean;
  change?: boolean;
}) {
  const { label, name, tag, popover, change = false } = props;
  return (
    <div className={cls(styles.item, styles.infoItem)}>
      <div className={styles.item_label}>
        {tag ? (
          <CustomTooltip title={label} placement="top">
            <div className={styles.item_label_text}>{label}</div>
          </CustomTooltip>
        ) : (
          label
        )}
        {tag ? (
          <div style={{ ...tag.style }} className={styles.item_label_tag}>
            {tag.text}
          </div>
        ) : null}
      </div>
      {popover ? (
        <CustomTooltip title={name ?? '-'}>
          <div
            className={cls(
              styles.item_name,
              styles.ellipsis,
              change ? styles.blueText : '',
            )}
          >
            {name}
          </div>
        </CustomTooltip>
      ) : (
        <div className={styles.item_name}>{name}</div>
      )}
    </div>
  );
});

export default memo(function DetailHeader(props: {
  className?: string;
  headerName?: string;
  headerTitle: string | React.ReactNode;
  extraInfo?: React.ReactNode;
  status?: CustomerStatusEnum | LeadStatusEnum;
  infoList: ICommonListItem[];
  showEdit?: boolean;
  editDisabled?: boolean;
  defaultExpand?: boolean;
  material?: ICommonMaterial;
  isLead?: boolean;
  headerBordered?: boolean;
  editClick?: () => void;
}) {
  const {
    className,
    headerName,
    headerTitle,
    extraInfo,
    status,
    infoList = [],
    showEdit = true,
    material,
    editDisabled = false,
    defaultExpand = false,
    isLead = false,
    headerBordered = true,
    editClick,
  } = props;

  const [state, { toggle }] = useToggle(defaultExpand);

  return (
    <>
      <div className={cls(styles.header, className, 'detail-page-header')}>
        <div className="title">
          {!!material ? (
            <>
              <div
                className={cls(
                  styles.header_logo,
                  headerBordered && state && styles.header_bordered,
                )}
              >
                <Image
                  width={54}
                  height={54}
                  src={material.fileThumbnailUrl ?? material}
                  style={{ objectFit: 'contain' }}
                  preview={{
                    mask: <EyeOutlined />,
                  }}
                />
                <div className={styles.header_logo_content}>
                  <div className={styles.header_logo_title}>
                    <div>
                      <p className={styles.item_label}>{headerName}</p>
                      <div className={styles.header_logo_name}>
                        {headerTitle ?? '-'}
                      </div>
                    </div>
                    {status && (
                      <div>
                        <p className={styles.item_label}>Status</p>
                        <div className={styles.header_logo_name}>
                          <Badge
                            color={
                              isLead
                                ? LeadStatusEnumTextColor[
                                    status as LeadStatusEnum
                                  ]
                                : CustomerStatusEnumColor[
                                    status as CustomerStatusEnum
                                  ]
                            }
                            text={status}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {showEdit ? (
                    <Button
                      className={styles.header_title_edit}
                      disabled={editDisabled}
                      onClick={editClick}
                      type="link"
                    >
                      <EditOutlined className={styles.header_title_icon} />
                      Edit
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : typeof headerTitle === 'string' ? (
            <div className={cls(styles.header_title, 'headerTitle')}>
              <div className={cls(styles.header_wrap, 'headerWrap')}>
                <div className={styles.header_wrap_content}>
                  <p className={styles.header_wrap_name}>{headerName}</p>
                  <div
                    className={cls(styles.header_wrap_title, 'headerWrapTitle')}
                    title={headerTitle}
                  >
                    {headerTitle ?? '-'}
                  </div>
                </div>
              </div>

              {showEdit ? (
                <Button
                  className={styles.header_title_edit}
                  disabled={editDisabled}
                  onClick={editClick}
                  type="link"
                >
                  <EditOutlined className={styles.header_title_icon} />
                  Edit
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div
                className={cls(
                  styles.header_customTitle,
                  headerBordered && state && styles.header_bordered,
                )}
              >
                {headerTitle}
                {showEdit ? (
                  <Button
                    className={styles.header_title_edit}
                    disabled={editDisabled}
                    onClick={editClick}
                    type="link"
                  >
                    <EditOutlined className={styles.header_title_icon} />
                    Edit
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
        {state && (
          <>
            <div className={styles.header_content}>
              {infoList.map((item, index) => (
                <InfoItem
                  key={index}
                  label={item.label}
                  name={item?.value}
                  tag={item?.tag}
                  popover={item.popover}
                  change={item.change}
                />
              ))}
            </div>
            {extraInfo && extraInfo}
          </>
        )}
      </div>
      <div
        className={cls(styles.collapse, 'collapse')}
        onClick={() => toggle()}
      >
        {state ? (
          <span className="less">
            <DoubleRightOutlined />
          </span>
        ) : (
          <span className="more">
            <DoubleRightOutlined />
          </span>
        )}
      </div>
    </>
  );
});
