import { formatAmount } from '@/utils/utils';
import { Badge, Table } from 'antd';
import cls from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { IBookingProjectTrendsByCustomerRecord } from '@/api/types/statistics';
import { ProjectStatusEnumColor, ProjectStatusEnumText } from '@/enums';
import styles from './index.less';

const { Column, ColumnGroup } = Table;

const CustomerProjectTable = ({
  sourceData,
  onSelectCurrentProject,
}: {
  sourceData: IBookingProjectTrendsByCustomerRecord[];
  onSelectCurrentProject: (project: {
    projectId: number;
    projectName: string;
  }) => void;
}) => {
  // const access = useAccess();

  const [dataSource, setDataSource] = useState<
    IBookingProjectTrendsByCustomerRecord[]
  >([]);
  const [tableSource, setTableSource] = useState<any[]>([]);

  const containerRef = useRef(null);

  const format = (value?: number | null) => {
    if (value === undefined) {
      return '';
    }
    if (value === null) {
      return '-';
    }
    return formatAmount(value);
  };

  const mergeTrendsByMonth = (
    list: IBookingProjectTrendsByCustomerRecord[],
  ) => {
    return list?.reduce(
      (acc: any[], project: { projectId: number; trendsVo: any[] }) => {
        const key = project.projectId;

        project.trendsVo.forEach((item) => {
          let row = acc.find((v) => v.mouthDate === item.mouthDate);

          if (!row) {
            row = { mouthDate: item.mouthDate };
            acc.push(row);
          }

          row[`delivered_${key}`] = item.delivered;
          row[`committed_${key}`] = item.committed;
        });

        return acc;
      },
      [],
    );
  };

  const fetchData = async () => {
    const _data = mergeTrendsByMonth(sourceData);
    setTableSource(_data);
    setDataSource(sourceData);
  };

  useEffect(() => {
    if (!sourceData) {
      return;
    }
    fetchData();
  }, [sourceData]);

  return (
    <>
      <div
        className={cls('customerProject', styles.customerProject)}
        ref={containerRef}
      >
        <Table<any>
          dataSource={tableSource}
          bordered
          scroll={{ x: 'max-content', y: 300 }}
          size="small"
          pagination={false}
          className="customerProjectTable"
        >
          <Column
            key="Date"
            title="Date"
            fixed="left"
            width={100}
            dataIndex="mouthDate"
          />
          {dataSource.map((item, index) => (
            <ColumnGroup
              key={item.projectId}
              title={
                <div
                  className={styles.projectNameItem}
                  onClick={() =>
                    onSelectCurrentProject({
                      projectId: item.projectId,
                      projectName: item.projectName,
                    })
                  }
                >
                  <span className={cls(index !== 0 ? styles.projectName : '')}>
                    {item.projectName}
                  </span>
                  <Badge
                    color={ProjectStatusEnumColor[item.projectStatus]}
                    text={ProjectStatusEnumText[item.projectStatus]}
                  />
                </div>
              }
              align="center"
            >
              <Column
                key="Delivered Waybill "
                title="Delivered Waybill"
                align="right"
                width={150}
                dataIndex={`delivered_${item.projectId}`}
                render={(value) => {
                  return format(value);
                }}
              />
              <Column
                key="Committed Waybill"
                title="Committed Waybill"
                align="right"
                width={150}
                dataIndex={`committed_${item.projectId}`}
                render={(value) => {
                  return format(value);
                }}
              />
            </ColumnGroup>
          ))}
        </Table>
      </div>
    </>
  );
};

export default CustomerProjectTable;
