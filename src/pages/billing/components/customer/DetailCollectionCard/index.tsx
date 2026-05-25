import { useSetState } from 'ahooks';
import { App, Empty, Spin } from 'antd';
import { FC, useCallback, useEffect } from 'react';
import styles from './index.less';

import {
  statementCheckWaybillInvoice,
  statementReceiptOrPaymentList,
} from '@/api/billing';
import {
  IBillingCustomerStatementDetail,
  IStatementReceiptNumberItem,
} from '@/api/types/billing';
import CommonTitle from '@/components/CommonTitle';
import CustomStatusButton from '@/components/CustomStatusButton';
import { useParams } from '@umijs/max';

import { BILLING_DETAIL_ANCHOR_ID_MAP } from '@/constants';
import { CountryCurrencyEnumText, CustomerStatementStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatAmount } from '@/utils/utils';
import { Access, useAccess, useModel } from '@umijs/max';
import FileMaterialList from '../../FileMaterialList';
import { IStatementMaterialListItem } from '../../FileMaterialList/ListItem';
import EnterReceiptModal from '../EnterReceiptModal';

const initState: IState = {
  pending: false,
  typePending: false,
  list: [],
  open: false,
  canEdit: false,
  receiptLoading: false,
};

interface IState {
  pending: boolean;
  typePending: boolean;
  list: IStatementMaterialListItem[];
  open: boolean;
  canEdit: boolean;
  receiptLoading: boolean;
}
interface IDetailCollectionCard {
  detail: IBillingCustomerStatementDetail;
}

const DetailCollectionCard: FC<IDetailCollectionCard> = ({ detail }) => {
  const { message } = App.useApp();
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

  const onAddReceipt = useCallback(async () => {
    setState({ receiptLoading: true });
    const res = await statementCheckWaybillInvoice(+statementId!).finally(
      () => {
        setState({ receiptLoading: false });
      },
    );
    if (res.code === 200) {
      if (res.data.code === 1) {
        message.error(
          <>
            There are
            <a
              style={{ margin: '0 4px' }}
              onClick={() => {
                const element = document.getElementById(
                  BILLING_DETAIL_ANCHOR_ID_MAP.CUSTOMER_WAYBILL_LIST,
                );
                if (element) {
                  element?.scrollIntoView?.({
                    behavior: 'smooth',
                    block: 'end',
                  });
                }
              }}
            >
              waybills
            </a>
            not associated with an invoice number. Please check
          </>,
        );
        return;
      } else {
        setState({ open: true });
      }
    }
  }, []);

  const init = useCallback(() => {
    const canEdit =
      access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL_COLLECTION_ADD] &&
      [
        CustomerStatementStatusEnum.PENDING_COLLECTION,
        CustomerStatementStatusEnum.PARTIALLY_COLLECTED,
        CustomerStatementStatusEnum.OVER_COLLECTED,
        CustomerStatementStatusEnum.FULLY_COLLECTED,
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
          title="Collection"
          extra={
            <Access key="addReceipt" accessible={state.canEdit}>
              <CustomStatusButton
                noStyle
                onClick={onAddReceipt}
                loading={state.receiptLoading}
              >
                Add Receipt
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
        <EnterReceiptModal
          materialList={[]}
          onRefresh={getList}
          onCancel={() => setState({ open: false })}
        />
      )}
    </div>
  );
};

export default DetailCollectionCard;
