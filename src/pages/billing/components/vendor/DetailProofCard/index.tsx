import { useSetState } from 'ahooks';
import { Empty, Spin } from 'antd';
import { FC, useCallback, useContext, useEffect } from 'react';
import styles from './index.less';

import { statementProofDelete, statementProofList } from '@/api/billing';
import { IBillingVendorStatementDetail } from '@/api/types/billing';
import CommonTitle from '@/components/CommonTitle';
import CustomStatusButton from '@/components/CustomStatusButton';
import PubSubContext from '@/context/pubsub';
import { VendorStatementStatusEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { Access, useAccess, useParams } from '@umijs/max';
import { EVENT_PROOF_LIST_RELOAD } from '../../event';
import FileMaterialList from '../../FileMaterialList';
import { IStatementMaterialListItem } from '../../FileMaterialList/ListItem';
import ProofModal from './ProofModal';

const initialState: IState = {
  pending: false,
  typePending: false,
  list: [],
  open: false,
  canEdit: false,
  editData: undefined,
};

interface IState {
  pending: boolean;
  typePending: boolean;
  list: IStatementMaterialListItem[];
  open: boolean;
  canEdit: boolean;
  editData?: IStatementMaterialListItem;
}
interface IDetailProofCard {
  detail: IBillingVendorStatementDetail;
}

const DetailProofCard: FC<IDetailProofCard> = ({ detail }) => {
  const access = useAccess();
  const { id: statementId } = useParams();
  const { subscribe } = useContext(PubSubContext);
  const [state, setState] = useSetState<IState>(initialState);

  const getList = useCallback(async () => {
    setState({ pending: true });
    const res = await statementProofList(+statementId!);
    setState({ pending: false });
    if (res.code === 200) {
      const _list = res.data.map((item) => {
        return {
          ...item,
          title: item.proofType,
        };
      });
      setState({ list: _list || [] });
    }
  }, []);

  const onAddProof = useCallback(() => {
    setState({ open: true });
  }, []);

  const init = useCallback(() => {
    const canEdit =
      access[PermissionEnum.VENDOR_STATEMENT_DETAIL_PROOF_ADD] &&
      [
        VendorStatementStatusEnum.UNDER_PAYMENT_PREP,
        VendorStatementStatusEnum.AWAIT_VENDOR_CONFIRM,
        VendorStatementStatusEnum.AWAITING_REBILL,
        VendorStatementStatusEnum.PENDING_PAYMENT,
        VendorStatementStatusEnum.PARTIALLY_PAID,
        VendorStatementStatusEnum.FULLY_PAID,
      ].includes(detail.status);
    setState({ canEdit });
  }, [detail.status]);

  const handleDelete = async (id: number) => {
    setState({ pending: true });
    const res = await statementProofDelete(id);
    if (res.code === 200) {
      getList();
    } else {
      setState({ pending: false });
    }
  };

  useEffect(() => {
    if (!detail?.status) return;
    init();
    getList();
  }, [detail.status]);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_PROOF_LIST_RELOAD, () => {
      getList();
    });

    return unsubscribe;
  }, []);

  return (
    <div className={styles.wrap}>
      <Spin spinning={state.pending}>
        <CommonTitle
          title="Proof"
          extra={
            <Access key="addProof" accessible={state.canEdit}>
              <CustomStatusButton noStyle onClick={onAddProof}>
                Add Proof
              </CustomStatusButton>
            </Access>
          }
        />
        <div className={styles.detailWProofList}>
          {state.list?.length > 0 ? (
            <FileMaterialList
              list={state.list}
              canEdit={state.canEdit}
              showIcon={true}
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
      {state.open && (
        <ProofModal
          open={state.open}
          defaultData={state.editData}
          materialList={state.editData?.materialVoList ?? []}
          hideModal={() => setState({ open: false, editData: undefined })}
        />
      )}
    </div>
  );
};

export default DetailProofCard;
