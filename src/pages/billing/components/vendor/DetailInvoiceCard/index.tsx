import { useSetState } from 'ahooks';
import { App, Empty, Space, Spin } from 'antd';
import { FC, useCallback, useContext, useEffect } from 'react';
import styles from './index.less';

import { statementInvoiceDelete, statementInvoiceList } from '@/api/billing';
import { IBillingVendorStatementDetail } from '@/api/types/billing';
import CommonTitle from '@/components/CommonTitle';
import CustomStatusButton from '@/components/CustomStatusButton';
import { useParams } from '@umijs/max';

import PubSubContext from '@/context/pubsub';
import { VendorStatementStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { Access, useAccess } from '@umijs/max';
import CancelledInvoiceModal from '../../CancelledInvoiceModal';
import {
  EVENT_BILLING_STATEMENT_DETAIL_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_INVOICE_RELOAD,
  EVENT_BILLING_STATEMENT_WAYBILL_RELOAD,
  EVENT_INVOICE_LIST_RELOAD,
} from '../../event';
import FileMaterialList from '../../FileMaterialList';
import { IStatementMaterialListItem } from '../../FileMaterialList/ListItem';
import InvoiceModal from '../../InvoiceModal';

const initialState: IState = {
  pending: false,
  typePending: false,
  list: [],
  open: false,
  canEdit: false,
  editData: undefined,
  cancelledInvoiceOpen: false,
};

interface IState {
  pending: boolean;
  typePending: boolean;
  list: IStatementMaterialListItem[];
  open: boolean;
  canEdit: boolean;
  editData?: IStatementMaterialListItem;
  cancelledInvoiceOpen: boolean;
}
interface IDetailInvoiceCard {
  detail: IBillingVendorStatementDetail;
}

const DetailInvoiceCard: FC<IDetailInvoiceCard> = ({ detail }) => {
  const access = useAccess();
  const { message } = App.useApp();
  const { id: statementId } = useParams();
  const { subscribe, publish } = useContext(PubSubContext);
  const [state, setState] = useSetState<IState>(initialState);

  const getList = useCallback(async () => {
    setState({ pending: true });
    const res = await statementInvoiceList(+statementId!);
    setState({ pending: false });
    if (res.code === 200) {
      const _list = res.data.map((item) => {
        return {
          ...item,
          id: +item.id!,
          title: item?.invoiceNumberList?.map((_item) => {
            return {
              invoiceNumber: _item.invoiceNumber,
              invoiceDate: _item.invoiceDate,
              statementInvoiceNumberId: _item.statementInvoiceNumberId,
            };
          }),
        };
      });
      setState({ list: _list ?? [] });
    }
  }, []);

  const onAddInvoice = useCallback(() => {
    setState({ open: true });
  }, []);

  const onCancelledInvoice = useCallback(() => {
    setState({ cancelledInvoiceOpen: true });
  }, []);

  const handleDelete = async (id: number) => {
    setState({ pending: true });
    const res = await statementInvoiceDelete(id);
    if (res.code === 200) {
      getList();
      message.success('Cancel Invoice successfully!');
      publish(EVENT_BILLING_STATEMENT_DETAIL_RELOAD);
      publish(EVENT_BILLING_STATEMENT_WAYBILL_RELOAD);
      publish(EVENT_BILLING_STATEMENT_WAYBILL_INVOICE_RELOAD);
    } else {
      setState({ pending: false });
    }
  };

  const init = useCallback(() => {
    const canEdit =
      access[PermissionEnum.VENDOR_STATEMENT_DETAIL_INVOICE_Add] &&
      [
        VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
        VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM,
        VendorStatementStatusEnum.AWAITING_REBILL,
      ].includes(detail.status);
    setState({ canEdit });
  }, [detail.status]);

  useEffect(() => {
    if (!detail?.status) return;
    init();
    getList();
  }, [detail.status]);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_INVOICE_LIST_RELOAD, () => {
      getList();
    });

    return unsubscribe;
  }, []);

  return (
    <div className={styles.wrap}>
      <Spin spinning={state.pending}>
        <CommonTitle
          title="Invoice"
          extra={
            <Space>
              <Access key="cancelledInvoice" accessible={true}>
                <CustomStatusButton noStyle onClick={onCancelledInvoice}>
                  Cancelled Invoice
                </CustomStatusButton>
              </Access>
              <Access key="addInvoice" accessible={state.canEdit}>
                <CustomStatusButton noStyle onClick={onAddInvoice}>
                  Add Invoice
                </CustomStatusButton>
              </Access>
            </Space>
          }
        />
        <div className={styles.content}>
          {state.list?.length > 0 ? (
            <FileMaterialList
              showIcon
              // showTax
              showCancelText={true}
              list={state.list}
              canEdit={state.canEdit}
              onGetEditData={(v) => {
                setState({
                  open: true,
                  editData: v,
                });
              }}
              onDeleteData={(v) => {
                handleDelete(v.id);
              }}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </Spin>
      <InvoiceModal
        defaultData={state.editData}
        open={state.open}
        materialList={state?.editData?.materialVoList ?? []}
        onCancel={() => setState({ open: false, editData: undefined })}
      />
      {state.cancelledInvoiceOpen ? (
        <CancelledInvoiceModal
          onCancel={() => setState({ cancelledInvoiceOpen: false })}
        />
      ) : null}
    </div>
  );
};

export default DetailInvoiceCard;
