import { useSetState } from 'ahooks';
import { Empty, Spin } from 'antd';
import { FC, useCallback, useEffect } from 'react';
import styles from './index.less';

import { statementReceiptOrPaymentList } from '@/api/billing';
import {
  IBillingVendorStatementDetail,
  IStatementReceiptNumberItem,
} from '@/api/types/billing';
import CommonTitle from '@/components/CommonTitle';
import CustomStatusButton from '@/components/CustomStatusButton';
import { useParams } from '@umijs/max';

import { CountryCurrencyEnumText, VendorStatementStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatAmount } from '@/utils/utils';
import { Access, useAccess, useModel } from '@umijs/max';
import FileMaterialList from '../../FileMaterialList';
import { IStatementMaterialListItem } from '../../FileMaterialList/ListItem';
import EnterPaymentModal from '../EnterPaymentModal';

const initState: IState = {
  pending: false,
  typePending: false,
  list: [],
  open: false,
  canEdit: false,
};

interface IState {
  pending: boolean;
  typePending: boolean;
  list: IStatementMaterialListItem[];
  open: boolean;
  canEdit: boolean;
}
interface IDetailPaymentCard {
  detail: IBillingVendorStatementDetail;
}

const DetailPaymentCard: FC<IDetailPaymentCard> = ({ detail }) => {
  const access = useAccess();
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const { id: statementId } = useParams();

  const [state, setState] = useSetState<IState>(initState);

  const getList = useCallback(async () => {
    setState({ pending: true });
    const res = await statementReceiptOrPaymentList(+statementId!).finally(
      () => {
        setState({ pending: false });
      },
    );

    if (res.code === 200) {
      const _list = res.data.map((item) => {
        return {
          ...item,
          description: `Upload time: ${item.receiptTime}`,
          title: `${CountryCurrencyEnumText[countryId as number]} ${formatAmount(item.receiptAmount)}`,
          subTitle:
            item?.receiptNumberList && item.receiptNumberList?.length > 0
              ? item?.receiptNumberList?.map?.(
                  (receiptNumberItem: IStatementReceiptNumberItem) => {
                    return {
                      voucherNumber: receiptNumberItem.voucherNumber,
                      voucherDate: receiptNumberItem.voucherDate,
                    };
                  },
                )
              : undefined,
        };
      });
      setState({ list: _list || [] });
    }
  }, []);

  const onAddPayment = useCallback(() => {
    setState({ open: true });
  }, []);

  const init = useCallback(() => {
    const canEdit =
      access[PermissionEnum.VENDOR_STATEMENT_DETAIL_PAYMENT_ADD] &&
      [
        VendorStatementStatusEnum.PENDING_PAYMENT,
        VendorStatementStatusEnum.PARTIALLY_PAID,
        VendorStatementStatusEnum.FULLY_PAID,
      ].includes(detail.status);
    setState({ canEdit });
  }, [detail.status]);

  useEffect(() => {
    if (!detail?.status) return;
    init();
    getList();
  }, [detail.status]);

  return (
    <div className={styles.wrap}>
      <Spin spinning={state.pending}>
        <CommonTitle
          title="Payment"
          extra={
            <Access key="addPayment" accessible={state.canEdit}>
              <CustomStatusButton noStyle onClick={onAddPayment}>
                Add Payment
              </CustomStatusButton>
            </Access>
          }
        />
        <div className={styles.content}>
          {state.list?.length > 0 ? (
            <FileMaterialList list={state.list} canEdit={false} />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </Spin>
      {state.open && (
        <EnterPaymentModal
          materialList={[]}
          onRefresh={getList}
          unCollectedAmount={
            Math.abs(detail?.billingInfo?.unCollectedAmount) ?? 0
          }
          onCancel={() => setState({ open: false })}
        />
      )}
    </div>
  );
};

export default DetailPaymentCard;
