import { projectTeam, projectWaybillTeam } from '@/api/project';
import { IProjectTeamRecord } from '@/api/types/project';
import CustomTooltip from '@/components/CustomTooltip';
import { Col, Modal, ModalProps, Row, Spin } from 'antd';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './common.less';

const ItemView: FC<IProjectTeamRecord> = ({
  memberTypeStr,
  aliasName,
  roleName,
  departmentName,
}) => {
  return (
    <div className={styles.listItem}>
      <Row gutter={16}>
        <Col span={6}>
          <CustomTooltip title={memberTypeStr}>
            <span
              className={styles.listItemSpan}
              // title={MemberTypeEnumText[memberType]}
              style={{ fontWeight: 'bold' }}
            >
              {memberTypeStr}
            </span>
          </CustomTooltip>
        </Col>
        <Col span={6} style={{ display: 'flex', alignItems: 'center' }}>
          <CustomTooltip title={aliasName}>{aliasName}</CustomTooltip>
        </Col>
        <Col span={6} style={{ display: 'flex', alignItems: 'center' }}>
          <CustomTooltip title={roleName}>{roleName}</CustomTooltip>
        </Col>
        <Col span={6} style={{ display: 'flex', alignItems: 'center' }}>
          <CustomTooltip title={departmentName}>{departmentName}</CustomTooltip>
        </Col>
      </Row>
    </div>
  );
};

interface ITeamMembersModal extends ModalProps {
  id: number;
  waybillId?: number;
  onConfirm?: () => void;
}

const TeamMembersModal: FC<ITeamMembersModal> = ({
  open,
  id,
  waybillId,
  width = 834,
  onConfirm,
  ...restProps
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<IProjectTeamRecord[]>([]);

  const handleOk = () => {
    onConfirm?.();
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    let res;
    if (waybillId) {
      res = await projectWaybillTeam({ id: waybillId });
    } else {
      res = await projectTeam({ id });
    }
    setLoading(false);
    if (res.code === 200) {
      setList(res?.data ?? []);
    }
  }, [id]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  return (
    <>
      <Modal
        title="Team Members"
        open={open}
        width={width}
        okText="Confirm"
        destroyOnClose
        onOk={handleOk}
        footer={null}
        {...restProps}
      >
        <Spin spinning={loading}>
          <div className={styles.listWarp}>
            {list.map((item: IProjectTeamRecord) => (
              <ItemView key={item.id} {...item} />
            ))}
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default TeamMembersModal;
