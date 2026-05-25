import { projectTeamManagers } from '@/api/project';
import { IProjectTeamManager } from '@/api/types/project';
import CustomTooltip from '@/components/CustomTooltip';
import PubSubContext from '@/context/pubsub';
import { useParams } from '@umijs/max';
import { Table, TableColumnsType } from 'antd';
import { FC, useContext, useEffect, useState } from 'react';
import styles from '../common.less';
import { EVENT_DEPARTMENT_MANAGE_LIST_RELOAD } from './events';

const DepartmentTable: FC = () => {
  const { id: projectId } = useParams();
  const { subscribe } = useContext(PubSubContext);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<IProjectTeamManager[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const res = await projectTeamManagers({ id: +projectId! });
    setLoading(false);
    if (res.code === 200) {
      const data = res?.data ?? [];
      setDataSource(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: TableColumnsType<IProjectTeamManager> = [
    {
      title: 'Department Management',
      dataIndex: 'managerAliasName',
      key: 'managerAliasName',
      ellipsis: {
        showTitle: false,
      },
      width: 140,
      render: (_, record) => (
        <CustomTooltip title={record.managerAliasName}>
          <span>{record.managerAliasName}</span>
        </CustomTooltip>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      ellipsis: {
        showTitle: false,
      },
      width: 100,
      render: (_, record) => (
        <CustomTooltip title={record.departmentName}>
          <span>{record.departmentName}</span>
        </CustomTooltip>
      ),
    },
  ];

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_DEPARTMENT_MANAGE_LIST_RELOAD, () => {
      fetchData();
    });

    return unsubscribe;
  }, []);

  return (
    <div className={styles.container}>
      <Table
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
      />
    </div>
  );
};

export default DepartmentTable;
