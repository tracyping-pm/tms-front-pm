import { IWaybillLinkStatementData } from '@/api/types/waybill';
import { PATHS } from '@/constants';
import { SettledItemListText } from '@/enums';
import { openNewTag } from '@/utils/utils';
import { ModalFormProps } from '@ant-design/pro-components';
import { Empty, Modal } from 'antd';
import styles from './common.less';

type ICustomerModal = ModalFormProps & {
  list: IWaybillLinkStatementData[];
  hideModal: () => void;
};

const WaybillLinkStatementModal = ({
  list = [],
  width = 750,
  hideModal,
}: ICustomerModal) => {
  return (
    <>
      <Modal
        open={true}
        title={`Linked Statement`}
        style={{ marginTop: '14px' }}
        width={width}
        onCancel={hideModal}
        footer={false}
      >
        <div className={styles.statement}>
          <div className={styles.statement_table}>
            <div className={styles.statement_table_name}>Statement Items</div>
            <div className={styles.statement_table_num}>Statement Number</div>
            <div className={styles.statement_table_operate}>Operation</div>
          </div>
          <div className={styles.statement_list}>
            {list.length ? (
              list?.map((s, i) => (
                <div
                  key={s.statementId}
                  className={styles.statement_item}
                  style={{
                    borderBottom:
                      i !== list.length - 1
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : 'node',
                  }}
                >
                  <div className={styles.statement_item_name}>
                    {!!s?.settledItemList?.length
                      ? s?.settledItemList
                          ?.map((item) => SettledItemListText[item])
                          .join(', ')
                      : '-'}
                  </div>
                  <div className={styles.statement_item_num}>
                    {s?.statementNumber ? s.statementNumber : '-'}
                  </div>
                  <div
                    className={styles.statement_item_operate}
                    onClick={() => {
                      openNewTag(
                        `${s.statementType === 'Customer' ? PATHS.BILLING_CUSTOMER_STATEMENT_DETAIL : PATHS.BILLING_VENDOR_STATEMENT_DETAIL}/${s.statementId}`,
                      );
                    }}
                  >
                    View
                  </div>
                </div>
              ))
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default WaybillLinkStatementModal;
