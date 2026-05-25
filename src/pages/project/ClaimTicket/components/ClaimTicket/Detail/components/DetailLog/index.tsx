import { IClaimDetail } from '@/api/types/claims';
import { Flex, Typography } from 'antd';
import { FC } from 'react';
import Remark from './Log';

const { Title } = Typography;

export interface IProps {
  detail?: IClaimDetail;
}

const DetailLog: FC<IProps> = ({ detail }) => {
  if (!detail) return null;

  return (
    <>
      <div
        style={{
          marginTop: '12px',
          border: '0.5px solid #f0f0f0',
          borderRight: 'none',
          borderBottom: 'none',
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          style={{
            height: '40px',
            lineHeight: '40px',
            margin: 0,
            padding: '0 12px',
            borderRight: '0.5px solid #f0f0f0',
            borderBottom: '0.5px solid #f0f0f0',
          }}
        >
          <Title level={5} style={{ padding: '8px 0', margin: 0 }}>
            Operation Log
          </Title>
        </Flex>
        <div
          style={{
            padding: '8px',
            borderBottom: '1px solid #D9D9D9',
          }}
        >
          <Remark detail={detail} />
        </div>
      </div>
    </>
  );
};

export default DetailLog;
