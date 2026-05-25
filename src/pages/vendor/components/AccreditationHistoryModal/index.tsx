import { crewAccreditationHistory } from '@/api/crew';
import { truckAccreditationHistory } from '@/api/truck';
import { IUpdateAccreditation } from '@/api/types/truck';
import { IAccreditationHistoryRecord } from '@/api/types/vendor';
import { vendorAccreditationHistory } from '@/api/vendor';
import { ApplicationTypeEnum } from '@/enums';
import { useParams } from '@umijs/max';
import { List, Modal, ModalProps, Spin } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';
import ListItem from './ListItem';

type IAccreditationHistoryModal = ModalProps & {
  open: boolean;
  type: ApplicationTypeEnum;
  fileCategory: string;
  hideModal: () => void;
  onConfirm?: (v: IUpdateAccreditation) => void;
};

const AccreditationHistoryModal = ({
  type,
  open,
  fileCategory,
  hideModal,
  ...restProps
}: IAccreditationHistoryModal) => {
  const { id: detailId } = useParams();

  const [list, setList] = useState<IAccreditationHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const init = async () => {
    setLoading(true);
    const payload = {
      id: Number(detailId),
      fileCategory: fileCategory,
    };

    let resObj: APIJSON<IAccreditationHistoryRecord[]> | Promise<any>;

    switch (type) {
      case ApplicationTypeEnum.VENDOR:
        resObj = vendorAccreditationHistory(payload);
        break;
      case ApplicationTypeEnum.TRUCK:
        resObj = truckAccreditationHistory(payload);
        break;
      case ApplicationTypeEnum.CREW:
        resObj = crewAccreditationHistory(payload);
        break;
    }

    const res = await resObj.finally(() => setLoading(false));
    if (res.code === 200) {
      setList(res.data);
    }
  };

  useEffect(() => {
    if (open) {
      init();
    }
  }, [open]);

  return (
    <>
      <Modal
        title={'Accreditation History'}
        maskClosable={false}
        open={open}
        onOk={hideModal}
        okText="OK"
        onCancel={hideModal}
        cancelButtonProps={{
          style: { display: 'none' },
        }}
        {...restProps}
      >
        <Spin spinning={loading}>
          <div className={styles.historyMain}>
            <List
              size="large"
              split={false}
              dataSource={list}
              renderItem={(item: IAccreditationHistoryRecord) => (
                <List.Item
                  key={item.categoryAccreditationId}
                  style={{ padding: 0 }}
                >
                  <ListItem {...item} />
                </List.Item>
              )}
            ></List>
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default AccreditationHistoryModal;
