import { changePassword } from '@/api-uam/common';
import { IChangePassword } from '@/api-uam/types/common';
import { MAX_LENGTH, REGEXP } from '@/constants';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { App, Button, Form } from 'antd';
import { noop } from 'lodash';
import { useState } from 'react';
import ChangePasswordBackground from '../../../../public/img/change_page.webp';
import LoginLogo from '../../../../public/img/login_logo.jpg';
import styles from './index.less';

const ChangePasswordPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [pending, setPending] = useState<boolean>(false);

  const repeatPasswordValidator = (
    _: any,
    value: any,
    callback: typeof noop,
  ) => {
    const { getFieldValue } = form;
    const newPassword = getFieldValue('newPassword');
    if (value && value !== newPassword) {
      callback('The two entered passwords do not match');
    }
    callback();
  };

  const repeatOldPasswordValidator = (
    _: any,
    value: any,
    callback: typeof noop,
  ) => {
    const { getFieldValue } = form;
    const oldPassword = getFieldValue('oldPassword');

    if (value) {
      if (!REGEXP.PASSWORD.test(value)) {
        callback('The new password entered does not meet the requirements');
      } else {
        if (value === oldPassword) {
          callback('The old and new passwords cannot be the same');
        } else {
          callback();
        }
      }
    }

    callback();
  };

  const onFinish = async (values: Partial<IChangePassword>) => {
    const { oldPassword, newPassword } = values;
    const payload = {
      oldPassword,
      newPassword,
    };
    try {
      setPending(true);
      const res = await changePassword(payload as IChangePassword).finally(
        () => {
          setPending(false);
        },
      );

      if (res.code === 200) {
        message.success('Change password successfully!');
        history.back();
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      setPending(false);
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <img src={ChangePasswordBackground} className={styles.background} />
      <div className={styles.content}>
        <img src={LoginLogo} className={styles.logo} />
        <div className={styles.title}>Change Password</div>
        <div className={styles.desc}>
          To ensure the security of your account,please create a password that
          meets the following requirements:
        </div>
        <div className={styles.tips}>
          <p>Minimum length of 8 characters</p>
          <p>At least one uppercase letter (A-Z)</p>
          <p>At least one lowercase letter (a-z)</p>
          <p>At least one digit (0-9)</p>
          <p>At least one special character (e.g., !@#$%^&*)</p>
        </div>
        <section className={styles.formWrap}>
          <ProForm
            form={form}
            submitter={{
              render: (props) => {
                return [
                  <Button
                    type="primary"
                    block
                    key="submit"
                    size="large"
                    loading={pending}
                    onClick={() => props.form?.submit?.()}
                  >
                    Confirm
                  </Button>,
                  <Button
                    key="cancel"
                    block
                    size="large"
                    onClick={() => history.back()}
                  >
                    Cancel
                  </Button>,
                ];
              },
            }}
            onFinish={onFinish}
          >
            <ProFormText.Password
              name="oldPassword"
              fieldProps={{
                size: 'large',
              }}
              placeholder={'Current Password'}
              rules={[
                {
                  required: true,
                  message: 'Please enter current password',
                },
                {
                  pattern: REGEXP.WHITESPACE,
                  message: 'Cannot contain spaces',
                },
              ]}
            />
            <ProFormText.Password
              name="newPassword"
              fieldProps={{
                size: 'large',
              }}
              placeholder={'New Password'}
              rules={[
                {
                  required: true,
                  message: 'Please enter new password',
                },
                {
                  pattern: REGEXP.WHITESPACE,
                  message: 'Cannot contain spaces',
                },
                {
                  max: MAX_LENGTH.PASSWORD,
                  message: `The new password cannot exceed ${MAX_LENGTH.PASSWORD} characters`,
                },
                {
                  validator: repeatOldPasswordValidator,
                },
              ]}
            />
            <ProFormText.Password
              name="repeatPassword"
              fieldProps={{
                size: 'large',
              }}
              placeholder={'Repeat Password'}
              rules={[
                {
                  required: true,
                  message: 'Please enter repeat password',
                },
                {
                  validator: repeatPasswordValidator,
                },
              ]}
            />
          </ProForm>
        </section>
      </div>
      {/*</PageContainer>*/}
    </div>
  );
};

export default ChangePasswordPage;
