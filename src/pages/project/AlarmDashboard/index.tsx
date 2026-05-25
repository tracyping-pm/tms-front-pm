import { PermissionEnum } from '@/enums/permission';
import { Access, useAccess } from '@umijs/max';
import Statistics from './Statistics';
import TasksList from './TasksList';
export default () => {
  const access = useAccess();
  return (
    <>
      <Access
        key="list"
        accessible={access[PermissionEnum.ALARM_DASHBOARD_TASK_LIST]}
      >
        <TasksList />
      </Access>
      <Access
        key="statistics"
        accessible={access[PermissionEnum.ALARM_DASHBOARD_STATISTICS]}
      >
        <Statistics />
      </Access>
    </>
  );
};
