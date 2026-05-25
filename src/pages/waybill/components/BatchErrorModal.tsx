import { IWaybillBatchFailedDetailItem } from '@/api/types/waybill';
import { PATHS } from '@/constants';
import { openNewTag } from '@/utils/utils';
import { ExportOutlined } from '@ant-design/icons';
import { Button, Flex, List, Modal, ModalProps } from 'antd';
import { FC } from 'react';

interface IBatchErrorModalProps extends ModalProps {
  failedDetailList: IWaybillBatchFailedDetailItem[];
}
<ExportOutlined />;
const BatchErrorModal: FC<IBatchErrorModalProps> = ({
  failedDetailList,
  ...restProps
}) => {
  return (
    <Modal
      title="Error Info"
      width={600}
      centered
      destroyOnClose
      maskClosable={false}
      footer={null}
      {...restProps}
    >
      <List
        size="small"
        header={null}
        footer={null}
        bordered
        dataSource={failedDetailList}
        renderItem={(item) => (
          <List.Item key={item.waybillId}>
            <Flex gap={24} justify="space-between" style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '110px' }}>{item.waybillNumber}</div>
                <Button
                  size="small"
                  style={{
                    position: 'relative',
                    top: '1px',
                  }}
                  icon={<ExportOutlined />}
                  type="link"
                  variant="link"
                  onClick={() => {
                    openNewTag(
                      `${PATHS.WAYBILL_LIST_DETAIL}/${item.waybillId}`,
                    );
                  }}
                ></Button>
              </div>
              <span style={{ flex: 1 }}>{item.failedReason}</span>
            </Flex>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default BatchErrorModal;
