import { projectDeleteTeamMember, projectTeam } from '@/api/project';
import { IProjectTeamRecord } from '@/api/types/project';
import CustomTooltip from '@/components/CustomTooltip';
import PubSubContext from '@/context/pubsub';
import { PermissionEnum } from '@/enums/permission';
import { Access, useAccess, useParams } from '@umijs/max';
import {
  Button,
  message,
  Popconfirm,
  Spin,
  Table,
  TableColumnsType,
} from 'antd';
import { FC, useContext, useEffect, useState } from 'react';
import AssignTeamMembersModal from '../AssignTeamMembersModal';
import styles from '../common.less';
import {
  EVENT_DEPARTMENT_MANAGE_LIST_RELOAD,
  EVENT_TEAM_MEMBER_LIST_RELOAD,
} from './events';

const TeamMembersTable: FC = () => {
  const access = useAccess();
  const { id: projectId } = useParams();
  const { subscribe, publish } = useContext(PubSubContext);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedMemberRecord, setSelectedMemberRecord] =
    useState<IProjectTeamRecord>();

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<IProjectTeamRecord[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const res = await projectTeam({ id: +projectId! });
    setLoading(false);
    if (res.code === 200) {
      const data = res?.data ?? [];
      setDataSource(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const handleAddClick = (record: IProjectTeamRecord) => {
    setSelectedMemberRecord(record);
    setAssignModalOpen(true);
  };

  const handleAssignConfirm = () => {
    setAssignModalOpen(false);
  };
  const columns: TableColumnsType<IProjectTeamRecord> = [
    {
      title: '',
      dataIndex: 'memberTypeStr',
      key: 'memberTypeStr',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      className: styles.memberTypeCell,
      render: (_, record: IProjectTeamRecord) => (
        <CustomTooltip title={record.memberTypeStr}>
          <span>{record.memberTypeStr}</span>
        </CustomTooltip>
      ),
    },
    {
      title: 'Member Name',
      dataIndex: 'aliasName',
      key: 'aliasName',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record: IProjectTeamRecord) => (
        <CustomTooltip title={record.aliasName}>
          {record.aliasName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record: IProjectTeamRecord) => (
        <CustomTooltip title={record.roleName}>{record.roleName}</CustomTooltip>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record: IProjectTeamRecord) => (
        <CustomTooltip title={record.departmentName}>
          {record.departmentName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Department Management',
      dataIndex: 'managerAliasName',
      key: 'managerAliasName',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record: IProjectTeamRecord) => (
        <CustomTooltip title={record.managerAliasName}>
          {record.managerAliasName}
        </CustomTooltip>
      ),
    },
    {
      title: 'Operate',
      key: 'operation',
      width: 120,
      fixed: 'right',
      hidden:
        !access[PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS_DELETE] &&
        !access[PermissionEnum.PROJECT_DETAIL_ASSIGN],
      render: (_, record: IProjectTeamRecord) => (
        <div>
          <Access accessible={access[PermissionEnum.PROJECT_DETAIL_ASSIGN]}>
            <Button
              type="link"
              size="small"
              onClick={() => handleAddClick(record)}
            >
              Add
            </Button>
          </Access>
          <Access
            accessible={
              access[PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS_DELETE]
            }
          >
            <Popconfirm
              title="Are you sure to delete this member?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                const res = await projectDeleteTeamMember({
                  id: record.id,
                });
                if (res.code === 200) {
                  message.success('Delete successfully');
                  fetchData();
                  publish(EVENT_DEPARTMENT_MANAGE_LIST_RELOAD);
                }
              }}
            >
              {record.id && (
                <Button type="link" size="small">
                  Delete
                </Button>
              )}
            </Popconfirm>
          </Access>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_TEAM_MEMBER_LIST_RELOAD, () => {
      fetchData();
    });

    return unsubscribe;
  }, []);

  return (
    <Spin spinning={loading}>
      <Table
        bordered
        scroll={{ x: 800 }}
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={false}
        size="small"
      />
      {assignModalOpen ? (
        <AssignTeamMembersModal
          open={assignModalOpen}
          selectedMemberRecord={selectedMemberRecord}
          onConfirm={handleAssignConfirm}
          onCancel={() => setAssignModalOpen(false)}
        />
      ) : null}
    </Spin>
  );
};

export default TeamMembersTable;
