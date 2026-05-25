import AutoCompleteSelectNew from '@/components/AutoCompleteSelectNew';
import { IMeta } from '@/components/LocatorModal';
import { Button, Form, FormInstance, Modal, ModalProps } from 'antd';
import { FC, useRef } from 'react';
import styles from './styles.less';

type IResolveAddressModal = ModalProps & {
  open: boolean;
  onStart?: (v: any) => void;
};
const ResolveAddressModal: FC<IResolveAddressModal> = ({
  open,
  onStart,
  ...restProps
}) => {
  const formRef = useRef<FormInstance>(null);
  const metaRef = useRef<IMeta>();

  const onSelect = (meta: IMeta) => {
    metaRef.current = meta;
  };

  const handleStart = async () => {
    try {
      formRef.current?.validateFields();
      formRef.current
        ?.validateFields()
        .then(() => {
          if (!metaRef.current) {
            formRef.current?.setFields([
              {
                name: 'address',
                errors: ['Please enter the correct address'],
              },
            ]);
            return false;
          }

          const { address, lat, lng, level } = metaRef.current;
          const payload = {
            address,
            lat,
            lng,
            level,
          };
          onStart?.(payload);
        })
        .catch((errInfo) => {
          console.log('Failed:', errInfo);
        });
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <>
      <Modal
        open={open}
        title="Resolve Address"
        width={680}
        footer={null}
        maskClosable={false}
        destroyOnClose
        {...restProps}
      >
        <Form ref={formRef} name="resolve-address">
          <div className={styles.resolveAddressWrap}>
            <div className={styles.resolveAddressInput}>
              <Form.Item
                name={'address'}
                label={null}
                rules={[
                  {
                    required: true,
                    message: 'Please enter address',
                  },
                ]}
                trigger="onChange"
              >
                <AutoCompleteSelectNew onSelect={onSelect} />
              </Form.Item>
            </div>
            <div className={styles.resolveAddressBtn}>
              <Button type="primary" onClick={handleStart}>
                Start
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ResolveAddressModal;
