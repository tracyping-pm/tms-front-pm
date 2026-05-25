import { projectAssign, projectAssignUser } from '@/api/project';
import { IAssignUserItem, IProjectTeamRecord } from '@/api/types/project';
import PubSubContext from '@/context/pubsub';
import { MemberTypeEnum, MemberTypeEnumText } from '@/enums';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { useParams } from '@umijs/max';
import { App, Col, Divider, Form, Modal, ModalProps, Row, Select } from 'antd';
import _ from 'lodash';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  EVENT_DEPARTMENT_MANAGE_LIST_RELOAD,
  EVENT_TEAM_MEMBER_LIST_RELOAD,
} from '../ProjectDetailTeamMembers/events';
import RadioItemView from './RadioItemView';
import styles from './index.less';

const memberTypeOptions = [
  {
    label: MemberTypeEnumText[MemberTypeEnum.BD],
    value: MemberTypeEnum.BD,
  },

  {
    label: MemberTypeEnumText[MemberTypeEnum.PROCUREMENT_PIC],
    value: MemberTypeEnum.PROCUREMENT_PIC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.STRATEGY_PIC],
    value: MemberTypeEnum.STRATEGY_PIC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.RATES_PIC],
    value: MemberTypeEnum.RATES_PIC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.DISPATCHER],
    value: MemberTypeEnum.DISPATCHER,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.OC],
    value: MemberTypeEnum.OC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.ON_SITE_OC],
    value: MemberTypeEnum.ON_SITE_OC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.POD_CHECKER],
    value: MemberTypeEnum.POD_CHECKER,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.CAM],
    value: MemberTypeEnum.CAM,
  },
];

type IAssignModal = ModalProps & {
  onConfirm?: () => void;
  onCancel?: () => void;
  selectedMemberRecord?: IProjectTeamRecord;
};

const AssignTeamMembersModal = ({
  open,
  selectedMemberRecord,
  onCancel,
  ...restProps
}: IAssignModal) => {
  const { message } = App.useApp();
  const { publish } = useContext(PubSubContext);
  const { id: projectId } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [memberData, setMemberData] = useState<IAssignUserItem[]>([]);
  const [memberListValue, setMemberListValue] = useState<IAssignUserItem[]>([]);

  const [form] = Form.useForm();

  const memberTypeValue = Form.useWatch('memberType', form);
  const departmentManagementValue = Form.useWatch('departmentManagement', form);

  const reset = useCallback(() => {
    setMemberData([]);

    form.resetFields();
  }, [form]);

  const fetchMemberData = useCallback(async () => {
    setMemberData([]);
    setLoading(true);
    const payload = {
      projectId: +projectId!,
      memberType: memberTypeValue!,
    };
    const res = await projectAssignUser(payload).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      const list =
        res?.data.map((item) => {
          return {
            ...item,
            value: item.userRoleId,
            label: `${item.aliasName}`,
          };
        }) ?? [];
      setMemberData(list);
      const checked = res?.data.filter((item) => item.choice);
      const _memberList = checked.map((item) => item.userRoleId);
      const _memberListValue = checked.map((item) => {
        return {
          userRoleId: item?.userRoleId,
          aliasName: item?.aliasName,
          roleName: item?.roleName,
          departmentName: item?.departmentName,
          choice: true,
        };
      });
      setMemberListValue(_memberListValue);
      form.setFieldValue('memberList', _memberList);
      checked.forEach((item) => {
        form.setFieldValue(['departmentManagement', `${item.userRoleId}`], {
          departmentManagementId: item?.managerRoleId,
        });
      });
    }
  }, [memberTypeValue]);

  const handleOk = useCallback(async () => {
    await form.validateFields();
    const values = form.getFieldsValue();

    const _assignUserReqs = values.memberList.map((item: string | number) => {
      return {
        userRoleId: item,
        managerRoleId:
          values.departmentManagement[item]?.departmentManagementId,
      };
    });
    const payload = {
      id: +projectId!,
      memberType: values.memberType,
      assignUserReqs: _assignUserReqs,
    };
    setLoading(true);
    const res = await projectAssign(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      message.success('Assign successfully!');
      publish(EVENT_TEAM_MEMBER_LIST_RELOAD);
      publish(EVENT_DEPARTMENT_MANAGE_LIST_RELOAD);
      onCancel?.();
    }
  }, []);

  useEffect(() => {
    if (memberTypeValue) {
      fetchMemberData();
    }
  }, [memberTypeValue]);

  useEffect(() => {
    if (open) {
      if (selectedMemberRecord) {
        form.setFieldValue('memberType', selectedMemberRecord?.memberType);
      }
    } else {
      reset();
    }
  }, [open, selectedMemberRecord]);

  return (
    <>
      <Modal
        title="Assign Project"
        open={open}
        width={900}
        destroyOnClose
        maskClosable={false}
        onOk={handleOk}
        confirmLoading={loading}
        onCancel={onCancel}
        {...restProps}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Member Type"
            name="memberType"
            rules={[{ required: true, message: 'Please select member type' }]}
          >
            <Select
              placeholder="Please select member type"
              style={{ width: '100%' }}
              options={memberTypeOptions}
              onChange={() => {
                setMemberListValue([]);
                form.setFieldsValue({
                  memberList: undefined,
                  departmentManagement: undefined,
                });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Member"
            name="memberList"
            rules={[{ required: true, message: 'Please select member' }]}
          >
            <Select
              placeholder="Enter alias name to search"
              mode="multiple"
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              options={memberData}
              suffixIcon={
                <>
                  {loading ? (
                    <LoadingOutlined />
                  ) : (
                    <>
                      <span>
                        {memberListValue.length} / {memberData.length}
                      </span>
                      <DownOutlined />
                    </>
                  )}
                </>
              }
              optionRender={(option) => (
                <>
                  <RadioItemView
                    key={option.data.userRoleId}
                    {...option.data}
                  />
                </>
              )}
              onChange={(v, options?: IAssignUserItem | IAssignUserItem[]) => {
                setMemberListValue(options as IAssignUserItem[]);

                //手动清除不在选中列表中的部门管理
                const departmentManagementMemberIds = Object.keys(
                  form.getFieldValue('departmentManagement') ?? {},
                );
                if (departmentManagementMemberIds.length) {
                  const xorIds = _.xor(
                    v.map(Number),
                    departmentManagementMemberIds.map(Number),
                  );
                  xorIds.forEach((xorId: number) => {
                    form.setFieldValue(
                      [`departmentManagement`, `${xorId}`],
                      undefined,
                    );
                  });
                }
              }}
            />
          </Form.Item>

          {memberListValue.length > 0 ? (
            <Form.Item label="Department Management">
              <div className={styles.departmentManagement}>
                {memberListValue.map((member, index) => {
                  return (
                    <>
                      <Row gutter={12} key={member.userRoleId}>
                        <Col span={5} className="ellipsis">
                          {member.aliasName}
                        </Col>
                        <Col span={5} className="ellipsis">
                          {member.roleName}
                        </Col>
                        <Col span={5} className="ellipsis">
                          {member.departmentName}
                        </Col>
                        <Col span={9}>
                          <Form.Item
                            name={[
                              'departmentManagement',
                              `${member.userRoleId}`,
                              `departmentManagementId`,
                            ]}
                            label="Department Management"
                          >
                            <Select
                              allowClear
                              placeholder="Select"
                              options={memberData.map((memberDataItem) => {
                                return {
                                  ...memberDataItem,
                                  disabled: Object.values(
                                    departmentManagementValue ?? {},
                                  )?.some(
                                    (item: any) =>
                                      item.departmentManagementId ===
                                      memberDataItem.userRoleId,
                                  ),
                                };
                              })}
                              popupMatchSelectWidth={500}
                              optionRender={(option) => (
                                <>
                                  <RadioItemView
                                    key={option.data.userRoleId}
                                    {...option.data}
                                  />
                                </>
                              )}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {index !== memberListValue.length - 1 && (
                        <Divider orientationMargin="8"></Divider>
                      )}
                    </>
                  );
                })}
              </div>
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </>
  );
};

export default AssignTeamMembersModal;
