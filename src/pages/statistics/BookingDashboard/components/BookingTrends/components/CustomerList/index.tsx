import { bookingGetAllCustomer } from '@/api/statistics';
import { IBookingCustomerWaybillRecord } from '@/api/types/statistics';
import FuzzySelector from '@/components/FuzzySelector';
import { I_FUZZY_API_RESPONSE } from '@/components/FuzzySelector/types';
import { ES_DTO_CLASS } from '@/constants';
import { FieldQueryHighlightTypeEnum } from '@/enums';
import { Empty, Spin, Tag } from 'antd';
import cls from 'classnames';
import { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

export default function CustomerList({
  dateRange,
  onSelectCustomerHandle,
}: {
  dateRange: Dayjs[];
  onSelectCustomerHandle: (customerObj: IBookingCustomerWaybillRecord) => void;
}) {
  const [sourceData, setSourceData] =
    useState<IBookingCustomerWaybillRecord[]>();
  const [customerList, setCustomerList] =
    useState<IBookingCustomerWaybillRecord[]>();
  const [activeCustomerObj, setActiveCustomerObj] = useState<
    IBookingCustomerWaybillRecord & { index?: number }
  >();
  const [loading, setLoading] = useState(false);

  const [customerObj, setCustomerObj] = useState<I_FUZZY_API_RESPONSE>();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const onCustomerChange = (obj?: I_FUZZY_API_RESPONSE) => {
    setCustomerObj(obj);
    if (obj) {
      setCustomerList([
        {
          customerId: obj?.id as number,
          customerName: obj?.name as string,
        },
      ]);
      setActiveCustomerObj({
        customerId: obj?.id as number,
        customerName: obj?.name as string,
      });
      onSelectCustomerHandle?.({
        customerId: obj?.id as number,
        customerName: obj?.name as string,
      });
    } else {
      setCustomerList(sourceData);
      setActiveCustomerObj({
        customerId: sourceData?.[0]?.customerId as number,
        customerName: sourceData?.[0]?.customerName as string,
      });
      onSelectCustomerHandle?.(
        sourceData?.[0] as IBookingCustomerWaybillRecord,
      );
    }
  };

  const init = async (_dateRange: Dayjs[]) => {
    const payload = {
      startDate: _dateRange[0].format('YYYY-MM-DD 00:00:00'),
      endDate: _dateRange[1].format('YYYY-MM-DD 23:59:59'),
    };
    setLoading(true);
    const res = await bookingGetAllCustomer(payload).finally(() => {
      setLoading(false);
    });
    if (res?.code === 200) {
      const data = res.data;
      setSourceData(data);
      setCustomerList(data);
      if (!activeCustomerObj) {
        setActiveCustomerObj({
          ...data[0],
          index: 0,
        });
        onSelectCustomerHandle?.(data[0]);
      } else {
        const index = data.findIndex(
          (item) => item.customerId === activeCustomerObj?.customerId,
        );
        setActiveCustomerObj({
          ...activeCustomerObj,
          index,
        });
      }
    }
  };

  useEffect(() => {
    init(dateRange);
  }, [dateRange]);

  return (
    <div className={styles.customerList}>
      <FuzzySelector
        fieldProps={{
          placeholder: 'Customer Name',
          style: { width: 240 },
        }}
        request={{
          field: 'customerName',
          esDtoClass: ES_DTO_CLASS.CUSTOMER,
          type: FieldQueryHighlightTypeEnum.USER_ROLE,
        }}
        value={customerObj}
        onChange={(obj: any) => onCustomerChange(obj)}
      />

      <p className={styles.committedQty}>Committed Qty: Descending</p>
      <Spin spinning={loading}>
        <p className={styles.customerNameTitle}>No. Customer Name</p>
        <Tag
          title={activeCustomerObj?.customerName}
          className={styles.customerNameTag}
        >
          {`${(activeCustomerObj?.index ?? 0) + 1 || ''}.  ${activeCustomerObj?.customerName}`}
        </Tag>
        <div className={styles.customerNameList}>
          {customerList?.map((item, index) => (
            <div
              ref={(el) => {
                itemRefs.current[item.customerId] = el;
              }}
              className={cls(
                styles.customerNameItem,
                activeCustomerObj?.customerId === item.customerId
                  ? styles.activeCustomerNameItem
                  : '',
              )}
              key={index}
              title={item.customerName}
              onClick={() => {
                setActiveCustomerObj({
                  ...item,
                  index,
                });
                onSelectCustomerHandle?.(item);
              }}
            >
              {`${index + 1}. ${item.customerName}`}
            </div>
          ))}
          {customerList?.length === 0 && (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
          )}
        </div>
      </Spin>
    </div>
  );
}
