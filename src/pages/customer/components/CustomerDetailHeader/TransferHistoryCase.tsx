import { customerTransferHistoryList } from '@/api/customer';
import { ICustomerTransferHistoryItem } from '@/api/types/customer';
import { HistoryOutlined } from '@ant-design/icons';
import { Empty, Popover, Space, Spin, Typography } from 'antd';
import cls from 'classnames';
import { FC, useCallback, useState } from 'react';
import styles from './styles.less';

const { Text } = Typography;

export interface ITransferHistoryCase {
  buId: number;
  fieldName: 'BD' | 'CAM';
}

const TransferHistoryCase: FC<ITransferHistoryCase> = ({ buId, fieldName }) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ICustomerTransferHistoryItem[]>([]);

  const buildContent = useCallback(() => {
    const buildInner = () => {
      if (loading) {
        return (
          <div style={{ textAlign: 'center' }}>
            <Spin spinning={true} />
          </div>
        );
      }
      if (list?.length > 0) {
        return list.map((item) => (
          <Space key={item.id} direction="vertical">
            <Text>
              {item.startTime} - {item.endTime ?? 'until now'}
            </Text>
            <Text type="secondary">{item.aliasName}</Text>
          </Space>
        ));
      } else {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
      }
    };

    return (
      <Space direction="vertical" style={{ minWidth: 100 }}>
        {buildInner()}
      </Space>
    );
  }, [list, loading]);

  const fetchData = async () => {
    setLoading(true);
    const res = await customerTransferHistoryList({ buId, fieldName }).finally(
      () => {
        setLoading(false);
      },
    );
    if (res.code === 200) {
      setList(res.data);
    }
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      fetchData();
    } else {
      setList([]);
    }
  };

  return (
    <>
      <div className={cls('transferHistoryCase', styles.transferHistoryCase)}>
        {fieldName}

        <Popover
          placement="topLeft"
          content={() => buildContent()}
          trigger="click"
          align={{
            offset: [-13, -10],
          }}
          onOpenChange={onOpenChange}
        >
          <span className="icon">
            <HistoryOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
          </span>
        </Popover>
      </div>
    </>
  );
};

export default TransferHistoryCase;
