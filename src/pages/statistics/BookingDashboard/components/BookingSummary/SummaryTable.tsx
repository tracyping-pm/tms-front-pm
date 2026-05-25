import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { formatAmount } from '@/utils/utils';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import styles from './index.less';

export default function SummaryTable({ sourceData }: { sourceData: any }) {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [columns, setColumns] = useState<ProColumns[]>([]);

  const typeTitle = [
    { title: 'Daily Avg Delivered', value: 'avgDelivered' },
    { title: 'Total Delivered', value: 'delivered' },
    { title: 'Daily Avg Committed', value: 'avgCommitted' },
    { title: 'Total Committed', value: 'committed' },
  ];

  const init = () => {
    const _columns = [
      {
        title: '',
        dataIndex: 'type',
        fixed: 'left',
        width: 180,
        render: (_: any, record: any, index: number) => {
          return (
            <div className={styles.summaryTableType}>
              {record.type}{' '}
              <CustomTooltip
                title={
                  <div style={{ flexDirection: 'column' }}>
                    <div>{`Daily average = Total amount / 26, rounded to the nearest
                    integer`}</div>
                    {index === 0 && (
                      <div>
                        {`"Delivered" refers to all waybills whose status has been updated to "Delivered" or "Abnormal" with a position time within the selected range.`}
                      </div>
                    )}
                    {index === 2 && (
                      <div>
                        {`"Committed" refers to waybills successfully created with a position time within the selected range.`}
                      </div>
                    )}
                  </div>
                }
                placement="bottom"
              >
                {index === 0 || index === 2 ? (
                  <InfoCircleOutlined
                    style={{ color: 'rgba(0, 0, 0, 0.25)', marginLeft: 10 }}
                  />
                ) : null}
              </CustomTooltip>
            </div>
          );
        },
      },
      ...sourceData?.mouthDate?.map((month: string) => ({
        title: month,
        dataIndex: month,
        // width: 100,
        width: 120,
        render: (_: any, record: any) => {
          const str = formatAmount(record[month]);
          return <CustomTooltip title={str}>{str}</CustomTooltip>;
        },
      })),
    ];

    const data = typeTitle.map((_type) => {
      let obj: { [key: string]: string | number } = {
        type: _type.title,
      };
      sourceData?.mouthDate?.forEach(
        (mouth: string | number, mouthIndex: number) => {
          obj[mouth] = sourceData?.[_type.value]?.[mouthIndex];
        },
      );
      return obj;
    });
    setColumns(_columns);
    setDataSource(data);
  };
  useEffect(() => {
    if (!sourceData) return;
    init();
  }, [sourceData]);

  return (
    <div>
      <CustomTable
        className={styles.summaryTable}
        rowKey={'type'}
        columns={columns}
        scroll={{ x: 'max-content' }}
        dataSource={dataSource}
        pagination={false}
        fixedSpin={false}
        toolBarRender={false}
        search={false}
        manualRequest
        bordered
      />
    </div>
  );
}
