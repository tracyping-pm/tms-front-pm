import { ICommonListItem } from '@/api/types/common';
import styles from '@/components/DetailContactItem/styles.less';
// import { Popconfirm } from 'antd';
import { memo } from 'react';
import { ReactComponent as CustomerEditIcon } from '../../../public/svg/customer_edit_icon.svg';
import CustomConfirmModal from '../CustomConfirmModal';
import { IconEdit } from '../OperationIcon';

const ItemColumn = memo(function (props: {
  label: string | number;
  name: string | number;
}) {
  const { label, name } = props;
  return (
    <div className={styles.column}>
      <p className={styles.column_label}>{label}：</p>
      <p className={styles.column_name}>{name}</p>
    </div>
  );
});

/**
 * params
 */
export default memo(function DetailContactItem(props: {
  data: ICommonListItem[];
  index: number;
  editHandle?: () => void;
  deleteHandle?: () => void;
  showEditBtn?: boolean;
  showDeleteBtn?: boolean;
}) {
  const {
    data = [],
    index,
    showDeleteBtn = true,
    showEditBtn = true,
    editHandle = () => {},
    deleteHandle = () => {},
  } = props;

  return (
    <div className={styles.item}>
      <div className={styles.item_top}>
        <p className={styles.item_top_title}>{`Contact ${index + 1}`}</p>
        {showEditBtn ? (
          <IconEdit
            showPopover={false}
            className={styles.item_top_editIcon}
            onClick={editHandle}
          />
        ) : null}
        {showDeleteBtn ? (
          <CustomConfirmModal
            title="Delete"
            content="Are you sure to delete this contact?"
            onOk={deleteHandle}
            okText="Yes"
            cancelText="No"
          >
            <CustomerEditIcon className={styles.item_top_delIcon} />
          </CustomConfirmModal>
        ) : // <Popconfirm
        //   title="Delete"
        //   description="Are you sure to delete this contact?"
        //   onConfirm={deleteHandle}
        //   okText="Yes"
        //   cancelText="No"
        // >
        //   <CustomerEditIcon className={styles.item_top_delIcon} />
        // </Popconfirm>
        null}
      </div>
      <div className={styles.item_content}>
        {data.map((item, idx) => (
          <ItemColumn key={idx} label={item.label} name={item.value} />
        ))}
      </div>
    </div>
  );
});
