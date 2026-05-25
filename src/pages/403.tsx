import { PATHS } from '@/constants';
import { history } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';

const NoFoundPage: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, Not Authorizated to access this page."
    extra={
      <Button type="primary" onClick={() => history.push(PATHS.HOME)}>
        Back Home
      </Button>
    }
  />
);

export default NoFoundPage;
