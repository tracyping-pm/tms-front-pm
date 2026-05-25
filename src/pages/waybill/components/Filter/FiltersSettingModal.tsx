import { IWaybillFilterItem } from '@/api/types/waybill';
import {
  waybillFilterCreate,
  waybillFilterDelete,
  waybillFilterList,
} from '@/api/waybill';
import { MAX_LENGTH } from '@/constants';
import {
  App,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  ModalProps,
  Skeleton,
} from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import { IALL_NEED } from './constant';
import styles from './index.less';

const MAX = 10;

export interface IProps extends ModalProps {
  getTransformData: () => IALL_NEED;
  onApply: (ALL_NEED: IALL_NEED) => void;
}

const FiltersSettingModal: FC<IProps> = ({
  open,
  getTransformData,
  onApply,
  ...rest
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [list, setList] = useState<IWaybillFilterItem[]>([]);
  const [pending, setPending] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeItem, setActiveItem] = useState<IWaybillFilterItem>();

  const fetchList = async () => {
    setPending(true);
    const res = await waybillFilterList().finally(() => {
      setPending(false);
    });

    if (res.code === 200) {
      setList(res.data ?? []);
    }
  };

  const handleSave = useCallback(async () => {
    await form.validateFields();
    const name = form.getFieldValue('name');
    const ALL_NEED = getTransformData();
    const { FE_NEED } = ALL_NEED;

    // 移除值为 undefined 的属性
    const NEW_FE_NEED = _.omitBy(FE_NEED, _.isUndefined);
    if (Object.keys(NEW_FE_NEED).length === 0) {
      return message.error('Fail, No filter selected');
    }

    if (list.length === MAX) {
      return message.warning('Fail, Save up to 10 private filters');
    }

    const content = JSON.stringify(ALL_NEED);
    const payload = {
      name,
      content,
    };

    setSaveLoading(true);
    const res = await waybillFilterCreate(payload).finally(() => {
      setSaveLoading(false);
    });

    if (res.code === 200) {
      fetchList();
    }
  }, [list]);

  const handleDelete = useCallback(async (item: IWaybillFilterItem) => {
    setActiveItem(item);
    setDeleteLoading(true);
    const res = await waybillFilterDelete({ id: item.id }).finally(() => {
      setDeleteLoading(false);
    });

    if (res.code === 200) {
      fetchList();
    }
  }, []);

  const handleApply = useCallback((item: IWaybillFilterItem) => {
    setActiveItem(item);
    const content = item.content ?? '{}';
    const ALL_NEED = JSON.parse(content);

    onApply?.(ALL_NEED);
  }, []);

  useEffect(() => {
    if (open) {
      fetchList();
    } else {
      form.resetFields();
    }
  }, [open]);

  return (
    <>
      <Modal
        {...rest}
        open={open}
        title={'Filters Setting'}
        width={740}
        footer={null}
        destroyOnClose
        maskClosable={false}
      >
        <Form name="filters-setting-form" form={form}>
          <div
            className={cls('filters-setting-wrap', styles.filtersSettingWrap)}
          >
            <div className="input-header">
              <div className="name-input">
                <Form.Item
                  name={'name'}
                  label={'Save current filter as private filter'}
                  rules={[
                    {
                      max: MAX_LENGTH.NAME_200,
                      message: `Email cannot exceed ${MAX_LENGTH.NAME_200} characters`,
                    },
                  ]}
                >
                  <Input placeholder="Enter the filter name" allowClear />
                </Form.Item>
              </div>
              <Button type="primary" loading={saveLoading} onClick={handleSave}>
                Save
              </Button>
            </div>
            <div className="filters">
              <div className="list-title">Use private filters</div>
              <div className="list-content">
                {pending ? (
                  <Skeleton active={true} />
                ) : list.length > 0 ? (
                  list.map((item, index) => (
                    <div key={index} className="list-item">
                      <span className="name ellipsis" title={item.name}>
                        {item.name}
                      </span>
                      <span className="createdAt">{item.createdAt}</span>
                      <span className="btns">
                        <Button
                          loading={deleteLoading && activeItem?.id === item.id}
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </Button>
                        <Button onClick={() => handleApply(item)}>Apply</Button>
                      </span>
                    </div>
                  ))
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </div>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default FiltersSettingModal;
