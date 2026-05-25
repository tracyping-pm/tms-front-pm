import { crewAccreditationList } from '@/api/crew';
import { truckAccreditationList } from '@/api/truck';
import { IAccreditationCategoryListItem } from '@/api/types/vendor';
import { vendorAccreditationList } from '@/api/vendor';
import { EnumAccreditationSortTypeStatus, UploadPathTypeEnum } from '@/enums';
import { ModalFormProps } from '@ant-design/pro-components';
import { Divider, Empty, Modal, Spin } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import UpdateForm from './UpdateForm';

type IBatchUpdateAccreditationModal = ModalFormProps & {
  recordId: number;
  recordName?: string;
  source: UploadPathTypeEnum;

  hideModal: () => void;
};

const BatchUpdateAccreditationModal = ({
  recordId,
  recordName,
  open,
  source,
  hideModal,
  ...restProps
}: IBatchUpdateAccreditationModal) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [accreditationList, setAccreditationList] = useState<
    IAccreditationCategoryListItem[]
  >([]);

  const init = useCallback(async () => {
    setLoading(true);

    let fetchApi;

    switch (source) {
      case UploadPathTypeEnum.VENDOR:
        fetchApi = vendorAccreditationList({
          id: recordId,
          sortType: EnumAccreditationSortTypeStatus.EXPIRATION,
        });
        break;
      case UploadPathTypeEnum.CREW:
        fetchApi = crewAccreditationList({
          id: recordId,
          sortType: EnumAccreditationSortTypeStatus.EXPIRATION,
        });
        break;
      case UploadPathTypeEnum.TRUCK:
        fetchApi = truckAccreditationList({
          id: recordId,
          sortType: EnumAccreditationSortTypeStatus.EXPIRATION,
        });
        break;
    }

    const res = await fetchApi?.finally(() => {
      setLoading(false);
    });

    if (res?.code === 200) {
      setAccreditationList(res?.data?.accreditationCategoryList);
    }
  }, []);

  useEffect(() => {
    if (open) {
      init();
    } else {
    }
  }, [open]);

  return (
    <>
      <Modal
        open={open}
        title={'Update Accreditation'}
        width={600}
        style={{ marginTop: '14px' }}
        onCancel={hideModal}
        maskClosable={false}
        footer={null}
        // onFinish={onFinish}
        onClose={hideModal}
        {...restProps}
      >
        <Spin spinning={loading}>
          <div
            style={{
              // minHeight: '400px',
              maxHeight: '700px',
              overflowY: 'auto',
            }}
          >
            {accreditationList.map((item, index) => {
              return (
                <>
                  <UpdateForm
                    key={item.id}
                    item={item}
                    listItemName={recordName as string}
                    listItemId={recordId}
                    source={source}
                  />
                  {index !== accreditationList.length - 1 && (
                    <Divider></Divider>
                  )}
                </>
              );
            })}

            {accreditationList.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
            )}
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default BatchUpdateAccreditationModal;
