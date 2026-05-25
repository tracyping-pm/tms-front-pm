import { STATISTICS_RANK_OPTION } from '@/constants';
import { Col, Radio, Row } from 'antd';
import { FC } from 'react';
import { useGlobalFilter } from '../../GlobalFilterContext';
import Chart from './Chart';
import FollowupTable from './Table';

const Followup: FC = () => {
  const { globalFilter, setGlobalFilter } = useGlobalFilter();
  const onRankChange = (e: any) => {
    setGlobalFilter({ rankedBy: e.target.value });
  };

  return (
    <>
      <div>
        <Radio.Group
          buttonStyle="solid"
          value={globalFilter.rankedBy}
          onChange={onRankChange}
        >
          <Radio.Button value={STATISTICS_RANK_OPTION.SUCCESSFUL_CLOSED}>
            Ranked by Successful Closed
          </Radio.Button>
          <Radio.Button value={STATISTICS_RANK_OPTION.TOTAL_OPPORTUNITIES}>
            Ranked by Total Opportunities
          </Radio.Button>
        </Radio.Group>
      </div>

      <div>
        <Row gutter={24}>
          <Col span={15}>
            <FollowupTable />
          </Col>
          <Col span={9}>
            <Chart />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Followup;
