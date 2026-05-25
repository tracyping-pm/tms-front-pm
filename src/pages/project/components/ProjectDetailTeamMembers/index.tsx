import { Col, Divider, Row } from 'antd';
import { FC } from 'react';
import styles from '../common.less';
import DepartmentTable from './DepartmentTable';
import TeamMembersTable from './TeamMembersTable';

const ProjectDetailTeamMembers: FC = () => {
  return (
    <div className={styles.container}>
      <Row gutter={24}>
        <Col span={7}>
          <DepartmentTable />
        </Col>
        <Col span={1} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Divider type="vertical" style={{ height: '100%' }} />
        </Col>
        <Col span={16}>
          <TeamMembersTable />
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDetailTeamMembers;
