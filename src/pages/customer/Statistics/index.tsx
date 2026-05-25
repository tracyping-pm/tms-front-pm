import { LAYOUT_HEADER_HEIGHT } from '@/constants';
import { Affix, Flex } from 'antd';
import CardView from './components/CardView';
import Filter from './components/Filter';
import Followup from './components/Followup';
import Tracking from './components/Tracking';
import GlobalFilterProvider from './GlobalFilterContext';

const CustomerStatistics: React.FC = () => {
  return (
    <GlobalFilterProvider>
      <Flex vertical gap={12}>
        <Flex vertical gap={1}>
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            <CardView
              title="Global Filter"
              borderTopLeftRadius={8}
              borderTopRightRadius={8}
            >
              <Filter />
            </CardView>
          </Affix>

          <CardView
            title="Opportunity Tracking"
            subtitle="Data scope: Created within the selected time period"
            borderBottomLeftRadius={8}
            borderBottomRightRadius={8}
          >
            <Tracking />
          </CardView>
        </Flex>

        <CardView
          title="Opportunity Follow - up Statistics"
          subtitle="Data scope: Followed up within the selected time period"
          borderTopLeftRadius={8}
          borderTopRightRadius={8}
          borderBottomLeftRadius={8}
          borderBottomRightRadius={8}
        >
          <Followup />
        </CardView>
      </Flex>
    </GlobalFilterProvider>
  );
};

export default CustomerStatistics;
