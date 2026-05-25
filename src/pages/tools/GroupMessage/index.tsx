import {
  ProForm,
  ProFormSelect,
  ProFormTextArea,
} from '@ant-design/pro-components';

import { useEffect, useState } from 'react';

import { slackGroupList, slackSendMsg } from '@/api/common';
import { Button, Form, message } from 'antd';
import styles from './index.less';

type IGroupOptions = { label: string; value: string; users: string[] };

const GroupMessage: React.FC = () => {
  const [form] = Form.useForm();
  const [groupOptions, setGroupOptions] = useState<IGroupOptions[]>([]);

  const [loading, setLoading] = useState(false);

  const getDataSource = async () => {
    const res = await slackGroupList();

    if (res.code === 200) {
      const options = res.data.map((item) => {
        return { label: item.name, value: item.id, users: item.users };
      });
      setGroupOptions(options);
    }
  };

  const handleAddFinish = async (values: any) => {
    const { groupId, msg } = values;

    const option = groupOptions.find((i: IGroupOptions) => i.value === groupId);
    const payload = {
      msg,
      users: option?.users ?? [],
    };
    setLoading(true);
    const res = await slackSendMsg(payload);
    setLoading(false);
    if (res.code === 200) {
      form.resetFields();
      message.success('Slack information sent successfully');
    }
  };
  useEffect(() => {
    getDataSource();
  }, []);

  return (
    <div className={styles.groupMessage}>
      <ProForm
        form={form}
        className={styles.groupMessageForm}
        submitter={{
          render: (props) => {
            return [
              <Button
                type="primary"
                key="submit"
                loading={loading}
                onClick={() => props.form?.submit?.()}
              >
                Send
              </Button>,
            ];
          },
        }}
        onFinish={handleAddFinish}
      >
        <ProFormSelect
          name="groupId"
          label={'Group Name'}
          placeholder={'Please select Group Name'}
          showSearch
          fieldProps={{
            showSearch: true,
            filterOption: true,
            options: groupOptions,
            optionItemRender: (item: any) => {
              return (
                <div>
                  {item.label}{' '}
                  <span style={{ fontSize: 12, color: '#00000073' }}>
                    {' '}
                    （{item.users.length} members）
                  </span>
                </div>
              );
            },
          }}
          rules={[
            {
              required: true,
              message: `Please select Group Name`,
            },
          ]}
        />
        <ProFormTextArea
          name="msg"
          label="Message"
          placeholder="Message"
          fieldProps={{ rows: 8 }}
          rules={[
            {
              required: true,
              message: 'Please enter Message',
            },
            {
              whitespace: true,
              message: 'Cannot only contain spaces',
            },
          ]}
        />
      </ProForm>
    </div>
  );
};

export default GroupMessage;
