import { ticketLogList } from '@/api/claim';
import { IRefundDetail, ITicketLogListItem } from '@/api/types/claims';
import { Empty, Flex, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';

const { Text } = Typography;

export interface IProps {
  detail: IRefundDetail;
}

const Remark: FC<IProps> = ({ detail }) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ITicketLogListItem[]>([]);

  const fetchList = async () => {
    setLoading(true);
    const res = await ticketLogList({ id: detail.id }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setList(res.data);
    }
  };

  useEffect(() => {
    fetchList();
  }, [detail]);

  return (
    <>
      <div
        style={{
          padding: '8px',
        }}
      >
        <div>
          <Spin spinning={loading}>
            <Flex gap={8} vertical wrap>
              {list?.length > 0 ? (
                list?.map((item: ITicketLogListItem) => (
                  <div key={item.id}>
                    <div>
                      <Text type="secondary">
                        {dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}
                      </Text>
                    </div>
                    <div>
                      <Text>
                        {item.operator} {item.description}
                      </Text>
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ width: '100%' }}
                />
              )}
            </Flex>
          </Spin>
        </div>
      </div>
    </>
  );
};

export default Remark;
