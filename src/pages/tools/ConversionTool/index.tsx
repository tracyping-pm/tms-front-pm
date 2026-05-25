import { locationConvert } from '@/api/common';
import { SyncOutlined } from '@ant-design/icons';
import { Button, Form, Input, Tag } from 'antd';
import cls from 'classnames';
import { useState } from 'react';
import styles from './index.less';

const ConversionTool: React.FC = () => {
  const [pending, setPending] = useState<boolean>(false);
  const onFinish = async (values: any) => {
    setPending(true);
    const resp = await locationConvert(values);
    setPending(false);
    if (resp.code === 200) {
      console.log('resp.data', resp.data);
    }
  };

  return (
    <>
      <div className={cls(styles.locationConvertContainer)}>
        <Form
          name="ConversionTool"
          initialValues={{ spreadsheetId: undefined, sheetName: undefined }}
          labelCol={{ span: 4 }}
          style={{ maxWidth: 700 }}
          onFinish={onFinish}
          layout="inline"
        >
          <Form.Item
            label={'Sheet Link'}
            name={'url'}
            rules={[{ required: true, message: 'Please input sheetLink!' }]}
          >
            <Input style={{ width: 450 }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={pending}>
              Start
            </Button>
          </Form.Item>
          {pending && (
            <Form.Item wrapperCol={{ offset: 7 }}>
              <Tag color="orange" icon={<SyncOutlined spin />}>
                Please be patient as it may take time to write the data.
              </Tag>
            </Form.Item>
          )}
        </Form>
      </div>
    </>
  );
};

export default ConversionTool;
