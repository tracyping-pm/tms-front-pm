import {
  bookingProjectTrendsByCustomer,
  bookingProjectTrendsComparison,
} from '@/api/statistics';
import {
  IBookingCustomerWaybillRecord,
  IBookingProjectTrendsByCustomerRecord,
  IBookingProjectTrendsComparisonRecord,
} from '@/api/types/statistics';
import { Spin } from 'antd';

import { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { BookingTrendsTypeEnum } from '../..';
import Title from '../../../Title';
import CustomerProjectLine from './CustomerProjectLine';
import CustomerProjectTable from './CustomerProjectTable';
import styles from './index.less';
import ProjectTrendsComparison from './ProjectTrendsComparison';

export default function CustomerProject({
  dateRange,
  dateType,

  selectedCustomer,
  newIsFullscreen,
  newToggleFullscreen,
}: {
  dateRange: Dayjs[];
  dateType: BookingTrendsTypeEnum;
  selectedCustomer: IBookingCustomerWaybillRecord;
  newIsFullscreen: boolean;
  newToggleFullscreen: () => void;
}) {
  const [sourceData, setSourceData] =
    useState<IBookingProjectTrendsByCustomerRecord[]>();
  const [comparisonSourceData, setComparisonSourceData] =
    useState<IBookingProjectTrendsComparisonRecord[]>();
  const [projectSelectData, setProjectSelectData] = useState<any[]>([]);
  const [projectLineData, setProjectLineData] =
    useState<IBookingProjectTrendsByCustomerRecord>();
  const [currentProject, setCurrentProject] = useState<{
    projectId: number;
    projectName: string;
  }>();
  const [projectLoading, setProjectLoading] = useState<boolean>(false);
  const [comparisonLoading, setComparisonLoading] = useState<boolean>(false);

  const fetchCustomerProjectData = async () => {
    const payload = {
      customerId: selectedCustomer.customerId,
      timeRange: dateType === BookingTrendsTypeEnum.byDay ? 1 : 2,
      startDate: dateRange[0].format('YYYY-MM-DD 00:00:00'),
      endDate: dateRange[1].format('YYYY-MM-DD 23:59:59'),
    };
    setProjectLoading(true);
    const res = await bookingProjectTrendsByCustomer(payload).finally(() => {
      setProjectLoading(false);
    });
    if (res.code === 200) {
      const data = res.data;
      const list = data
        .filter((item: any) => item.projectId !== 0)
        .map((item: any) => {
          return {
            value: item.projectId,
            label: item.projectName,
            projectStatus: item.projectStatus,
          };
        });

      setSourceData(data);
      setProjectLineData(data?.[1] ?? {});
      setProjectSelectData(list);
    }
  };
  const fetchProjectTrendsComparisonData = async () => {
    const payload = {
      customerId: selectedCustomer.customerId,
      timeRange: dateType === BookingTrendsTypeEnum.byDay ? 1 : 2,
      startDate: dateRange[0].format('YYYY-MM-DD 00:00:00'),
      endDate: dateRange[1].format('YYYY-MM-DD 23:59:59'),
    };
    setComparisonLoading(true);
    const res = await bookingProjectTrendsComparison(payload).finally(() => {
      setComparisonLoading(false);
    });
    if (res.code === 200) {
      const data = res.data;
      setComparisonSourceData(data);
    }
  };

  const onSelectCurrentProject = (project: {
    projectId: number;
    projectName: string;
  }) => {
    const obj =
      sourceData?.find((item) => item.projectId === project?.projectId) || {};
    setProjectLineData(obj as IBookingProjectTrendsByCustomerRecord);
    setCurrentProject(project);
  };

  useEffect(() => {
    setSourceData([]);
    setProjectLineData({} as IBookingProjectTrendsByCustomerRecord);
    setProjectSelectData([]);
    setComparisonSourceData([]);
    setCurrentProject(
      {} as {
        projectId: number;
        projectName: string;
      },
    );
    if (!selectedCustomer) {
      return;
    }

    fetchCustomerProjectData();
    fetchProjectTrendsComparisonData();
  }, [selectedCustomer, dateRange]);

  return (
    <div className={styles.content}>
      <Spin spinning={projectLoading}>
        <Title
          title={
            <span className={styles.title}>
              Customer Project-Based Booking Details
            </span>
          }
        />
        <CustomerProjectTable
          sourceData={sourceData!}
          onSelectCurrentProject={(project) => {
            onSelectCurrentProject(project);
          }}
        />
        <CustomerProjectLine
          newIsFullscreen={newIsFullscreen}
          newToggleFullscreen={newToggleFullscreen}
          sourceData={projectLineData as IBookingProjectTrendsByCustomerRecord}
          projectSelectOptions={projectSelectData}
          currentProject={currentProject}
          onSelectCurrentProject={(project) => {
            onSelectCurrentProject(project);
          }}
        />
      </Spin>
      <Spin spinning={comparisonLoading}>
        <ProjectTrendsComparison
          newIsFullscreen={newIsFullscreen}
          newToggleFullscreen={newToggleFullscreen}
          customerName={selectedCustomer?.customerName}
          sourceData={comparisonSourceData}
          currentProject={currentProject}
          type="Committed"
        />
        <ProjectTrendsComparison
          newIsFullscreen={newIsFullscreen}
          newToggleFullscreen={newToggleFullscreen}
          customerName={selectedCustomer?.customerName}
          sourceData={comparisonSourceData}
          currentProject={currentProject}
          type="Delivered"
        />
      </Spin>
    </div>
  );
}
