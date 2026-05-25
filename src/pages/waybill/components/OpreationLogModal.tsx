import { IOperationLogItem } from '@/api/types/waybill';
import { getWaybillLog } from '@/api/waybill';
import { Col, Modal, ModalProps, Row, Spin } from 'antd';
import dayjs from 'dayjs';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './common.less';

const ItemView: FC<IOperationLogItem> = ({ createdAt, description }) => {
  return (
    <div className={styles.listItem}>
      <Row gutter={24}>
        <Col span={10}>
          <div className={styles.listItemSpan}>
            {dayjs(createdAt)?.format?.('YYYY-MM-DD HH:mm:ss')}
          </div>
        </Col>
        <Col span={14}>
          <div className={styles.listItemSpan} title={description}>
            {description}
          </div>
        </Col>
      </Row>
    </div>
  );
};

interface IOperationLogModal extends ModalProps {
  id: number;
  onConfirm?: () => void;
}

const OperationLogModal: FC<IOperationLogModal> = ({
  id = 1,
  width = 834,
  onConfirm,
  ...restProps
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<IOperationLogItem[]>([]);

  const handleOk = () => {
    onConfirm?.();
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await getWaybillLog({ id });
    setLoading(false);

    if (res.code === 200) {
      setList(res?.data ?? []);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Modal
        title="Operation Log"
        open={true}
        width={width}
        okText="Confirm"
        destroyOnClose
        onOk={handleOk}
        // footer={null}
        {...restProps}
      >
        <Spin spinning={loading}>
          <div className={styles.listWarp}>
            {list.map((item: IOperationLogItem) => (
              <ItemView key={item.id} {...item} />
            ))}
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default OperationLogModal;
