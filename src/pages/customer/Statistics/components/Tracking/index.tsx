import { Col, Row } from 'antd';
import { FC } from 'react';
import Chart from './Chart';
import TrackingTable from './Table';

const Tracking: FC = () => {
  return (
    <>
      <div>
        <Row gutter={24}>
          <Col span={15}>
            <TrackingTable />
          </Col>
          <Col span={9}>
            <Chart />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Tracking;
