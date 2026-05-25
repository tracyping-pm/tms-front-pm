import CustomStatusButton from '@/components/CustomStatusButton';
import CustomTooltip from '@/components/CustomTooltip';
import styles from '@/pages//waybill/components/DetailCard/styles.less';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import cls from 'classnames';
import { ReactNode, useMemo } from 'react';

export default function DetailCard(props: {
  title: string;
  loading?: boolean;
  editCallback?: () => void;
  editLoading?: boolean;
  showEditBtn?: boolean;
  tagInfo?: string | ReactNode;
  child?: ReactNode;
  extraBtn?: ReactNode;
  routeDetail?: any;
  hideBorder?: boolean;
}) {
  const {
    title,
    loading = false,
    tagInfo = '',
    editCallback = () => {},
    editLoading = false,
    showEditBtn = true,
    child,
    extraBtn,
    routeDetail,
    hideBorder,
  } = props;

  const BtnIcon = useMemo(() => {
    switch (title) {
      case 'Basic Information':
        return (
          <CustomStatusButton noStyle onClick={editCallback}>
            Edit Info.
          </CustomStatusButton>
        );
      case 'Financial Process Subtask':
        return (
          <CustomStatusButton noStyle onClick={editCallback}>
            Add
          </CustomStatusButton>
        );
      case 'Route':
        return (
          <CustomStatusButton
            noStyle
            onClick={editCallback}
            loading={editLoading}
          >
            Plan
          </CustomStatusButton>
        );
      case 'Carrier':
        return (
          <CustomStatusButton noStyle onClick={editCallback}>
            Assign
          </CustomStatusButton>
        );

      case 'POD':
        return (
          <CustomStatusButton noStyle onClick={editCallback}>
            Add
          </CustomStatusButton>
        );
      case 'Remark':
        return (
          <CustomStatusButton noStyle onClick={editCallback}>
            Add
          </CustomStatusButton>
        );
      case 'Billing':
        return (
          <CustomStatusButton
            className={styles.billingEdit}
            onClick={editCallback}
          >
            Billing Truck Type
          </CustomStatusButton>
        );
      case 'Claim':
        return (
          <CustomStatusButton
            className={styles.billingEdit}
            onClick={editCallback}
          >
            Edit Claim
          </CustomStatusButton>
        );
      case 'Reimbursement Expense':
        return (
          <CustomStatusButton
            className={styles.billingEdit}
            onClick={editCallback}
          >
            Edit Reimbursement Expense
          </CustomStatusButton>
        );

      default:
        return (
          <CustomStatusButton noStyle onClick={editCallback}>
            Edit
          </CustomStatusButton>
        );
    }
  }, [title, routeDetail, editLoading]);

  return (
    <Spin spinning={loading}>
      <div className={cls(styles.card, 'card')}>
        <div
          className={styles.card_header}
          style={{ borderBottom: hideBorder ? 'none' : '1px solid #eff1f3' }}
        >
          <div className={styles.card_header_left}>
            {title}
            {!!tagInfo ? (
              <CustomTooltip
                title={tagInfo}
                placement="rightTop"
                rootClassName={styles.tagInfo}
              >
                <QuestionCircleOutlined
                  style={{ color: '#838CA1', marginLeft: 8 }}
                />
              </CustomTooltip>
            ) : null}
          </div>
          <div className={styles.card_header_right}>
            {extraBtn ? extraBtn : null}
            {showEditBtn ? BtnIcon : null}
          </div>
        </div>
        {child ? child : null}
      </div>
    </Spin>
  );
}
