import { statementAddWithWaybill } from '@/api/billing';
import {
  IStatementAddReq,
  IStatementAmountReq,
  IStatementWaybillRecord,
} from '@/api/types/billing';
import {
  PATHS,
  SettledItemFieldsMap,
  SettledItemStatusFieldsMap,
} from '@/constants';
import { SettledItemEnum } from '@/enums';
import DetailWaybillListCard from '@/pages/billing/components/vendor/DetailWaybillListCard';
import { history, useModel } from '@umijs/max';
import { Affix, App, Button } from 'antd';
import cls from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';
import styles from './styles.less';

const Step2: FC = () => {
  const { message, modal } = App.useApp();
  const { getStepData, doPrev } = useModel('bill.addVendorStatement');
  const step1Data = getStepData(0);
  const [selectedList, setSelectedList] = useState<IStatementWaybillRecord[]>(
    [],
  );
  const [generateBtnLoading, setGenerateBtnLoading] = useState(false);
  const waybillListRef = useRef<any>();

  const onGetSelectItem = (data: {
    ids: number[];
    options: IStatementWaybillRecord[];
  }) => {
    setSelectedList([...data.options]);
  };

  const fetchWaybillList = () => {
    const payload = {
      ...step1Data,
    };
    waybillListRef?.current?.getDataSource?.(payload);
  };

  const handlePrev = () => {
    modal.confirm({
      title: 'Previous',
      content: `Confirm to clear the content entered in this step and return to the previous step`,
      onOk: async () => {
        doPrev();
      },
      onCancel() {},
    });
  };

  const handleGenerate = async () => {
    const waybills = selectedList?.map?.((waybill) => {
      const amountReqs: IStatementAmountReq[] = [];

      step1Data?.settledItemList?.forEach?.((settledItem: SettledItemEnum) => {
        const amoutField = SettledItemFieldsMap[settledItem];
        const statusField = SettledItemStatusFieldsMap[settledItem];

        amountReqs.push({
          settledItem,
          // @ts-ignore
          amount: waybill[amoutField],
          // @ts-ignore
          status: waybill[statusField],
        });
      });

      return {
        waybillId: waybill.waybillId,
        amountReqs,
      };
    });
    const payload: IStatementAddReq = {
      ...step1Data,
      waybills,
    };

    console.log({ payload });
    setGenerateBtnLoading(true);
    const res = await statementAddWithWaybill(payload).finally(() => {
      setGenerateBtnLoading(false);
    });

    if (res.code === 716) {
      modal.confirm({
        title: 'Warning',
        content: `The settlement items have been updated, please recheck and generate the statement`,
        onOk: async () => {
          fetchWaybillList();
        },
        onCancel() {},
        cancelButtonProps: {
          style: { display: 'none' },
        },
      });
    } else {
      if (res.code === 200) {
        message.success('Generate Success!');
        const detailId = res.data;
        history.replace(`${PATHS.BILLING_VENDOR_STATEMENT_DETAIL}/${detailId}`);
      } else {
        message.error(res.msg);
      }
    }
  };

  useEffect(() => {
    fetchWaybillList();
  }, []);

  return (
    <>
      <div className={styles.step2}>
        <DetailWaybillListCard
          manual
          extraPayload={step1Data}
          onGetSelectItem={onGetSelectItem}
          ref={waybillListRef}
        />
        <Affix offsetBottom={0}>
          <section className={cls('footer', styles.footer)}>
            <div className="btns">
              <Button onClick={() => handlePrev()}>Previous</Button>
              <Button
                type="primary"
                disabled={selectedList?.length === 0}
                loading={generateBtnLoading}
                onClick={() => handleGenerate()}
              >
                Generate
              </Button>
            </div>
          </section>
        </Affix>
      </div>
    </>
  );
};

export default Step2;
