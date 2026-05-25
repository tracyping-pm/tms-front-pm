import { ticketRemarkList } from '@/api/claim';
import { IClaimDetail, ITicketRemarkListItem } from '@/api/types/claims';
import { Empty, Flex, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

const { Text } = Typography;

export interface IProps {
  detail: IClaimDetail;
  ref?: any;
}

const Remark: FC<IProps> = forwardRef(({ detail }, ref) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ITicketRemarkListItem[]>([]);

  const fetchList = async () => {
    setLoading(true);
    const res = await ticketRemarkList({ id: detail.id }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setList(res.data);
    }
  };

  useEffect(() => {
    fetchList();
  }, [detail]);

  useImperativeHandle(ref, () => ({
    reload: () => fetchList(),
  }));

  return (
    <>
      <div
        style={{
          padding: '8px',
          background: 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <div>
          <Text type="secondary">Remark</Text>
        </div>
        <div>
          <Spin spinning={loading}>
            {list?.length > 0 ? (
              <Flex gap={8} vertical wrap>
                {list?.map((item: ITicketRemarkListItem) => (
                  <div key={item.id}>
                    <div>
                      <Text type="secondary">
                        {dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}{' '}
                        {item.creatorName} Add
                      </Text>
                    </div>
                    <div>
                      <Text>{item.remark}</Text>
                    </div>
                  </div>
                ))}
              </Flex>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ width: '100%' }}
              />
            )}
          </Spin>
        </div>
      </div>
    </>
  );
});

export default Remark;
