import {
  checkProjectStart,
  projectAdditionSettingConfirm,
  projectCancel,
  projectCompleted,
  projectDetail,
  projectLog,
  projectResume,
  projectStart,
  projectSuspend,
  projectTerminate,
  projectUpdate,
} from '@/api/project';
import { AdditionSettingRecord, IProjectRecord } from '@/api/types/project';
import CustomDetailHeader from '@/components/CustomDetailHeader';
import ColCell from '@/components/CustomDetailHeader/ColCell';
import OperationLogModal, {
  IOperationLogModalState,
  initialOperationLogModalState,
} from '@/components/OperationLogModal';
import { LAYOUT_HEADER_HEIGHT, LogisticsCategoryEnumText } from '@/constants';
import {
  BUEnum,
  BUEnumText,
  CurrentRequirementEnum,
  CurrentRequirementEnumText,
  FinancialStatusEnumText,
  ProjectStatusEnum,
  ProjectStatusEnumColor,
  ProjectStatusEnumText,
  RequirementFrequencyEnumText,
  TransportationStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import ProjectModal from '@/pages/project/components/ProjectModal';
import QuickDispatchModal from '@/pages/waybill/components/QuickDispatchModal';
import WaybillModal from '@/pages/waybill/components/WaybillModal';
import { isValidityPeriod } from '@/utils/utils';
import { ArrowLeftOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import {
  Access,
  history,
  useAccess,
  useParams,
  useSearchParams,
} from '@umijs/max';
import { useSetState } from 'ahooks';
import { Affix, App, Badge, Button, Col, Row, Space, Spin } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { OPS_TYPE, StateContext } from '../../Detail/store';
import AssignTeamMembersModal from '../AssignTeamMembersModal';
import CustomerCodeConfigurationModal from '../CustomerCodeConfigurationModal';
import PodConfigurationModal from '../PodConfigurationModal';
import ProjectAdditionSettingsModal from '../ProjectAdditionSettingsModal';
import ProjectBatchPriceUpdateModal from '../ProjectBatchPriceUpdateModal';
import SubtaskConfigurationModal from '../SubtaskConfigurationModal';
import TeamMembersModal from '../TeamMembersModal';
import TerminateOrCompleteModal from '../TerminateOrCompleteModal';
import styles from './styles.less';

const TerminateOrCompleteEnum = {
  TERMINATED: 'terminated',
  COMPLETED: 'completed',
};

export default memo(function ProjectDetailHeader() {
  const access = useAccess();
  // @ts-ignore
  const { state, dispatch } = useContext(StateContext);
  const [searchParams] = useSearchParams();
  const { id: projectId } = useParams();
  const { message, modal } = App.useApp();
  const [showDispatch, setShowDispatch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [projectConfirmLoading, setProjectConfirmLoading] =
    useState<boolean>(false);
  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false);
  const [resumeLoading, setResumeLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<IProjectRecord>({} as IProjectRecord);
  const [teamMembersOpen, setTeamMemberModalOpen] = useState<boolean>(false);
  const [operationLogModalState, setOperationLogModalState] =
    useSetState<IOperationLogModalState>(initialOperationLogModalState);
  const [terminateOrCompleteModalOpen, setTerminateOrCompleteModalOpen] =
    useState<boolean>(false);
  const [font, setFont] = useState<string>('');
  const terminateOrCompleteType = useRef<string>();
  const [showAddWaybill, setShowAddWaybill] = useState<boolean>(false);
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);

  const [subtaskConfigurationModalOpen, setSubtaskConfigurationModalOpen] =
    useState<boolean>(false);
  const [podConfigurationModalOpen, setPodConfigurationModalOpen] =
    useState<boolean>(false);
  const [additionSettingsModalOpen, setAdditionSettingsModalOpen] =
    useState<boolean>(false);
  const [additionSettingsConfirmLoading, setAdditionSettingsConfirmLoading] =
    useState<boolean>(false);
  const [batchPriceUpdateModalOpen, setBatchPriceUpdateModalOpen] =
    useState<boolean>(false);

  const [showCustomerCodeConfigModal, setShowCustomerCodeConfigModal] =
    useState<boolean>(false);

  const fetchLogList = useCallback(async () => {
    setOperationLogModalState({ loading: true });
    const res = await projectLog({ id: Number(projectId) });
    setOperationLogModalState({ loading: false });

    if (res.code === 200) {
      const list =
        res.data?.map((item) => ({
          id: item.id,
          createdAt: item.createdAt,
          description: item.describe,
        })) ?? [];
      setOperationLogModalState({ list, open: true });
    }
  }, [projectId]);

  const getDetail = useCallback(async () => {
    setLoading(true);
    const res = await projectDetail({ id: +projectId! }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setDetail(res.data);
      dispatch({
        type: OPS_TYPE.PROJECT_DETAIL,
        payload: {
          data: res.data,
        },
      });
    }
  }, [projectId]);

  useEffect(() => {
    getDetail();
  }, [projectId]);

  // 编辑
  const handleEdit = () => {
    setProjectModalOpen(true);
  };

  const onConfirm = useCallback(
    async (values: any) => {
      const {
        projectName,
        customerId,
        commodity,
        daysForPod,
        agreedStartTime,
        agreedEndTime,
        confirmationWindow,
        logisticsCategory,
        serviceCategory,
        logisticsFlow,
        distance,
        bu,
        buList,
        currentRequirementList,
        requirementType,
        potentialVolumeQuantity,
        potentialVolumeFrequency,
        requirementFrequency,
        serviceTruckTypeIds,
        creditTerms,
      } = values;
      const params = {
        id: +projectId!,
        projectName,
        customerId,
        commodity,
        daysForPod,
        agreedStartTime,
        agreedEndTime,
        confirmationWindow,
        logisticsCategory,
        serviceCategory,
        logisticsFlow,
        distance,
        bu,
        buList,
        currentRequirementList,
        requirementType,
        potentialVolumeQuantity,
        potentialVolumeFrequency,
        requirementFrequency,
        serviceTruckTypeIds,
        creditTerms,
      };
      setProjectConfirmLoading(true);
      const res = await projectUpdate(params);
      setProjectConfirmLoading(false);
      if (res.code === 200) {
        setProjectModalOpen(false);
        message.success('Edit project successfully!');
        getDetail();
      }
    },
    [projectId],
  );
  const onAdditionSettingsConfirm = async (values: any) => {
    const data: AdditionSettingRecord = {
      projectId: projectId!,
      additionSettingList: values,
    };

    setAdditionSettingsConfirmLoading(true);
    const res = await projectAdditionSettingConfirm(data);
    setAdditionSettingsConfirmLoading(false);
    if (res.code === 200) {
      setAdditionSettingsModalOpen(false);
      message.success('Addition settings successfully!');
    }
  };

  const doSuspend = useCallback(async () => {
    modal.confirm({
      title: 'Confirm Suspend',
      icon: <ExclamationCircleFilled />,
      content:
        'After the project is suspended, shipment orders for the project cannot be created. The project can be resumed at any time after being suspended',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await projectSuspend({
          id: +projectId!,
        });
        if (res.code === 200) {
          message.success('Suspend project successfully!');
          getDetail();
        }
      },
    });
  }, [projectId]);

  const doResume = useCallback(async () => {
    setResumeLoading(true);
    const res = await projectResume({
      id: +projectId!,
    });
    setResumeLoading(false);
    if (res.code === 200) {
      message.success('The project status has been updated to In Progress.');
      getDetail();
    }
  }, [projectId]);

  const doCancel = useCallback(async () => {
    modal.confirm({
      title: 'Cancel Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to cancel this project?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        const res = await projectCancel({
          id: +projectId!,
        });
        setLoading(false);
        if (res.code === 200) {
          message.success('Cancel project successfully!');
          getDetail();
        }
      },
      onCancel() {
        // do nothing
      },
    });
  }, [projectId]);

  const doStart = useCallback(async () => {
    const res = await checkProjectStart({ id: Number(projectId) });
    if (res.code === 200) {
      modal.confirm({
        title: 'Start Confirm',
        icon: <ExclamationCircleFilled />,
        content: 'Confirm the kickoff project and notify all stakeholders?',
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk: async () => {
          setLoading(true);
          const okRes = await projectStart({
            id: +projectId!,
          });
          setLoading(false);
          if (okRes.code === 200) {
            message.success('Start project successfully!');
            getDetail();
          }
        },
        onCancel() {
          // do nothing
        },
      });
    }
  }, [projectId]);

  const isBeforeNow = useCallback(
    (date: string) => {
      const now = dayjs();
      const endTime = dayjs(date);
      return endTime?.isBefore(now);
    },
    [detail],
  );

  const isAfterNow = useCallback(
    (date: string) => {
      const now = dayjs();
      const endTime = dayjs(dayjs(date).format('YYYY-MM-DD') + '23:59:59');
      return endTime?.isAfter(now);
    },
    [detail],
  );

  const getInfoItemTagContent = useCallback(
    (startDate: string, endDate: string) => {
      if (startDate && endDate) {
        return {
          text: isAfterNow(endDate)
            ? `Expires in ${dayjs(endDate).diff(dayjs(), 'day') + 1} days`
            : 'Expired',
          style: {
            border: `1px solid ${isAfterNow(endDate) ? '#5BBDA9' : '#D9D9D9'}`,
            backgroundColor: isAfterNow(endDate) ? '#EEF6F4' : '#FAFAFA',
            color: isAfterNow(endDate) ? '#009688' : 'rgba(0, 0, 0, 0.85)',

            borderRadius: '2px',
            padding: '1px 8px',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '20px',
            whiteSpace: 'nowrap',
          },
        };
      }
      return;
    },
    [detail],
  );

  const buildTagContent = (startDate: string, endDate: string) => {
    const tag = getInfoItemTagContent(startDate, endDate);

    if (tag) {
      return (
        <span style={{ ...tag.style }} className={styles.item_label_tag}>
          {tag.text}
        </span>
      );
    } else {
      return null;
    }
  };

  const isTimeValidityPeriod = useCallback(() => {
    const { agreedEndTime, agreedStartTime } = detail;
    return isValidityPeriod(agreedStartTime, agreedEndTime);
  }, [detail]);

  const doTerminated = useCallback(() => {
    modal.confirm({
      title: `Terminated Confirm`,
      icon: <ExclamationCircleFilled />,
      content: `You are trying to terminated this project. After doing this, the project will end. Please enter your email address and confirm`,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        terminateOrCompleteType.current = TerminateOrCompleteEnum.TERMINATED;
        setFont(
          'You are trying to terminate this project. After doing this,the project will end. Please enter your email address and confirm',
        );
        setTerminateOrCompleteModalOpen(true);
      },
      onCancel() {
        // do nothing
      },
    });
  }, []);

  const doComplete = useCallback(() => {
    modal.confirm({
      title: `Complete Confirm`,
      icon: <ExclamationCircleFilled />,
      content: `You are trying to complete this project. After doing this, the project will end. Please enter your email address and confirm`,
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        terminateOrCompleteType.current = TerminateOrCompleteEnum.COMPLETED;
        setFont(
          'You are trying to complete this project. After doing this,the project will end. Please enter your email address and confirm',
        );
        setTerminateOrCompleteModalOpen(true);
      },
      onCancel() {
        // do nothing
      },
    });
  }, []);

  const terminateOrCompleteModalConfirm = useCallback(
    async (values: any) => {
      const isTerminated =
        terminateOrCompleteType.current === TerminateOrCompleteEnum.TERMINATED;
      const { email } = values;
      const params = {
        id: +projectId!,
        email,
      };
      const method = isTerminated ? projectTerminate : projectCompleted;
      setLoading(true);
      const res = await method(params);
      setLoading(false);
      if (res.code === 200) {
        setTerminateOrCompleteModalOpen(false);
        message.success('Operation successfully!');
        getDetail();
      }
    },
    [projectId],
  );

  return (
    <>
      <Spin spinning={loading}>
        <div className={styles.header}>
          {/*top function btn*/}
          <Affix offsetTop={LAYOUT_HEADER_HEIGHT}>
            <div className={styles.header_top}>
              <div className={styles.header_top_left}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  disabled={!!searchParams.get('type')}
                  onClick={() => history.back()}
                >
                  Back
                </Button>
              </div>
              <div className={styles.header_top_right}>
                <Access
                  accessible={
                    access[PermissionEnum.PROJECT_DETAIL_OPERATION_LOG]
                  }
                >
                  <Button
                    onClick={() => fetchLogList()}
                    loading={operationLogModalState.loading}
                  >
                    Operation Log
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.PROJECT_DETAIL_BATCH_PRICE_UPDATE]
                  }
                >
                  <Button
                    onClick={() => {
                      setBatchPriceUpdateModalOpen(true);
                    }}
                  >
                    Batch Price Update
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[
                      PermissionEnum.PROJECT_DETAIL_SUBTASK_CONFIGURATION
                    ] &&
                    [
                      ProjectStatusEnum.INPROGRESS,
                      ProjectStatusEnum.PREPARING,
                      ProjectStatusEnum.SUSPEND,
                    ].includes(detail?.projectStatus)
                  }
                >
                  <Button
                    onClick={() => {
                      setSubtaskConfigurationModalOpen(true);
                    }}
                  >
                    Subtask Configuration
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.PROJECT_DETAIL_POD_CONFIGURATION] &&
                    [
                      ProjectStatusEnum.INPROGRESS,
                      ProjectStatusEnum.PREPARING,
                      ProjectStatusEnum.SUSPEND,
                    ].includes(detail?.projectStatus)
                  }
                >
                  <Button
                    onClick={() => {
                      setPodConfigurationModalOpen(true);
                    }}
                  >
                    POD Configuration
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[
                      PermissionEnum.PROJECT_DETAIL_CUSTOMER_CODE_CONFIGURATION
                    ]
                  }
                >
                  <Button onClick={() => setShowCustomerCodeConfigModal(true)}>
                    Customer Code Configuration
                  </Button>
                </Access>

                <Access
                  accessible={access[PermissionEnum.PROJECT_DETAIL_CANCEL]}
                >
                  {detail?.projectStatus === ProjectStatusEnum.PREPARING && (
                    <Button onClick={() => doCancel()}>Cancel</Button>
                  )}
                </Access>

                <Access
                  accessible={access[PermissionEnum.PROJECT_DETAIL_COMPLETE]}
                >
                  {[
                    ProjectStatusEnum.INPROGRESS,
                    ProjectStatusEnum.SUSPEND,
                  ].includes(detail?.projectStatus) &&
                    isBeforeNow(detail?.agreedEndTime) && (
                      <Button onClick={() => doComplete()}>Complete</Button>
                    )}
                </Access>
                <Access
                  accessible={access[PermissionEnum.PROJECT_DETAIL_START]}
                >
                  {detail?.projectStatus === ProjectStatusEnum.PREPARING && (
                    <Button onClick={() => doStart()}>Start</Button>
                  )}
                </Access>
                <Access
                  accessible={access[PermissionEnum.PROJECT_DETAIL_SUSPEND]}
                >
                  {detail?.projectStatus === ProjectStatusEnum.INPROGRESS && (
                    <Button onClick={() => doSuspend()}>Suspend</Button>
                  )}
                </Access>
                <Access
                  accessible={access[PermissionEnum.PROJECT_DETAIL_RESUME]}
                >
                  {detail?.projectStatus === ProjectStatusEnum.SUSPEND && (
                    <Button onClick={() => doResume()} loading={resumeLoading}>
                      Resume
                    </Button>
                  )}
                </Access>
                <Access
                  accessible={access[PermissionEnum.PROJECT_DETAIL_TERMINATED]}
                >
                  {(detail?.projectStatus === ProjectStatusEnum.INPROGRESS ||
                    detail?.projectStatus === ProjectStatusEnum.SUSPEND) &&
                    !isBeforeNow(detail?.agreedEndTime) && (
                      <Button onClick={() => doTerminated()}>Terminated</Button>
                    )}
                </Access>

                {/* <Access
                  accessible={
                    access[PermissionEnum.PROJECT_DETAIL_TEAM_MEMBERS]
                  }
                >
                  <Button
                    onClick={() => {
                      setTeamMemberModalOpen(true);
                    }}
                  >
                    Team Members
                  </Button>
                </Access> */}
                <Access
                  accessible={access[PermissionEnum.PROJECT_DETAIL_ASSIGN]}
                >
                  <Button
                    type="primary"
                    onClick={() => setAssignModalOpen(true)}
                  >
                    Assign
                  </Button>
                </Access>
                <Access
                  accessible={
                    access[PermissionEnum.PROJECT_DETAIL_CREATE_WAYBILL]
                  }
                >
                  {detail?.projectStatus === ProjectStatusEnum.INPROGRESS && (
                    <Button
                      type="primary"
                      onClick={() => {
                        setShowAddWaybill(true);
                      }}
                    >
                      Create Waybill
                    </Button>
                  )}
                </Access>
              </div>
            </div>
          </Affix>
          {/*info detail*/}
          <CustomDetailHeader
            defaultExpand={true}
            titleList={[
              { label: 'Project Name', value: detail.projectName },
              {
                label: 'Project Status',
                value: (
                  <Space size={8}>
                    <Badge
                      color={ProjectStatusEnumColor[detail?.projectStatus]}
                    />
                    <span>{ProjectStatusEnumText[detail?.projectStatus]}</span>
                  </Space>
                ),
              },
              {
                label: 'Transportation Status',
                value: (
                  <Space size={8}>
                    <Badge
                      color={
                        ProjectStatusEnumColor[detail?.transportationStatus]
                      }
                    />
                    <span>
                      {
                        TransportationStatusEnumText[
                          detail?.transportationStatus
                        ]
                      }
                    </span>
                  </Space>
                ),
              },
              {
                label: 'Financial Status',
                value: (
                  <Space size={8}>
                    <Badge
                      color={ProjectStatusEnumColor[detail?.financialStatus]}
                    />
                    <span>
                      {FinancialStatusEnumText[detail?.financialStatus]}
                    </span>
                  </Space>
                ),
              },
              {
                label: 'BU',
                value: detail?.buList?.length
                  ? detail?.buList
                      ?.map((item: BUEnum) => BUEnumText[item])
                      .join(',')
                  : '-',
              },
            ]}
            titleExtra={
              <Access accessible={access[PermissionEnum.PROJECT_DETAIL_EDIT]}>
                <Button type="link" onClick={() => handleEdit()}>
                  Edit
                </Button>
              </Access>
            }
            content={
              <>
                <Row>
                  <Col span={6}>
                    <ColCell label="Customer" value={detail?.customerName} />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Customer Tag" value={detail?.customerTag} />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Commodity" value={detail?.commodity} />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Days for POD" value={detail?.daysForPod} />
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <ColCell
                      label="Confirmation Window"
                      value={
                        detail?.confirmationWindow
                          ? `${detail?.confirmationWindow} Hours`
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Current Requirement"
                      value={
                        detail?.currentRequirementList?.length > 0 ? (
                          <div>
                            {detail.currentRequirementList.map(
                              (currentRequirement: CurrentRequirementEnum) => (
                                <div key={currentRequirement}>
                                  {
                                    CurrentRequirementEnumText[
                                      currentRequirement
                                    ]
                                  }
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          '-'
                        )
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Creation time" value={detail?.createdAt} />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Completed Time"
                      value={detail?.completedTime}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <ColCell
                      label={
                        <>
                          <div>Project Validity Period</div>
                          <div>
                            {buildTagContent(
                              detail?.agreedStartTime,
                              detail?.agreedEndTime,
                            )}
                          </div>
                        </>
                      }
                      value={
                        detail?.agreedStartTime && detail?.agreedEndTime
                          ? dayjs(detail?.agreedStartTime).format(
                              'YYYY-MM-DD',
                            ) +
                            ' - ' +
                            dayjs(detail?.agreedEndTime).format('YYYY-MM-DD')
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Service Category"
                      value={detail?.serviceCategory}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Logistics Flow"
                      value={detail?.logisticsFlow}
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell label="Distance" value={detail?.distance} />
                  </Col>
                </Row>

                <Row>
                  <Col span={6}>
                    <ColCell
                      label="Requirement Frequency"
                      value={
                        detail?.requirementFrequency
                          ? RequirementFrequencyEnumText[
                              detail?.requirementFrequency
                            ]
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label={
                        <>
                          <div>Customer Latest Price Validity Period</div>
                          <div>
                            {buildTagContent(
                              detail?.customerLatestVerStartDate,
                              detail?.customerLatestVerEndDate,
                            )}
                          </div>
                        </>
                      }
                      value={
                        detail?.customerLatestVerStartDate &&
                        detail?.customerLatestVerEndDate
                          ? detail?.customerLatestVerStartDate +
                            ' - ' +
                            detail?.customerLatestVerEndDate
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Logistics Category"
                      value={
                        detail?.logisticsCategory
                          ? LogisticsCategoryEnumText[detail.logisticsCategory]
                          : '-'
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <ColCell
                      label="Credit Terms"
                      value={
                        detail?.creditTerms
                          ? `${detail?.creditTerms} Days`
                          : '-'
                      }
                    />
                  </Col>
                </Row>

                <Row>
                  <Col span={24}>
                    <ColCell
                      label="Service Truck"
                      value={
                        detail?.serviceTruck?.length > 0 ? (
                          <div>
                            {detail.serviceTruck.map((serviceTruck: string) => (
                              <div key={serviceTruck}>{serviceTruck}</div>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )
                      }
                    />
                  </Col>
                </Row>
              </>
            }
          />
        </div>
      </Spin>
      <ProjectModal
        title={'Edit Project'}
        record={detail}
        isEdit={true}
        open={projectModalOpen}
        onConfirm={onConfirm}
        modalProps={{
          maskClosable: false,
          okText: 'Confirm',
          onCancel: () => {
            setProjectModalOpen(false);
          },
        }}
        submitter={{
          submitButtonProps: {
            loading: projectConfirmLoading,
          },
        }}
      />

      <TeamMembersModal
        id={+projectId!}
        open={teamMembersOpen}
        onConfirm={() => {
          setTeamMemberModalOpen(false);
        }}
        onCancel={() => {
          setTeamMemberModalOpen(false);
        }}
      />

      <OperationLogModal
        list={operationLogModalState.list}
        open={operationLogModalState.open}
        onConfirm={() => setOperationLogModalState({ open: false })}
        onCancel={() => setOperationLogModalState({ open: false })}
      />

      <TerminateOrCompleteModal
        open={terminateOrCompleteModalOpen}
        onConfirm={terminateOrCompleteModalConfirm}
        font={font}
        modalProps={{
          okText: 'Confirm',
          onCancel: () => {
            setTerminateOrCompleteModalOpen(false);
          },
        }}
        submitter={{
          submitButtonProps: {
            loading: loading,
            className: cls('submitWarnBtn'),
          },
          resetButtonProps: {
            className: cls('resetWarnBtn'),
          },
        }}
      />

      {assignModalOpen ? (
        <AssignTeamMembersModal
          open={assignModalOpen}
          onCancel={() => setAssignModalOpen(false)}
          onConfirm={() => {
            setAssignModalOpen(false);
            getDetail();
          }}
        />
      ) : null}
      {showAddWaybill ? (
        <WaybillModal
          defaultProject={detail}
          isTimeValidityPeriod={isTimeValidityPeriod()}
          refresh={() => {
            dispatch({
              type: OPS_TYPE.REFRESH_FLAG,
              payload: {
                data: !state?.refreshFlag,
              },
            });
          }}
          hideModal={() => setShowAddWaybill(false)}
        />
      ) : null}

      {subtaskConfigurationModalOpen && (
        <SubtaskConfigurationModal
          open={subtaskConfigurationModalOpen}
          projectId={projectId}
          onConfirm={() => {
            setSubtaskConfigurationModalOpen(false);
          }}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setSubtaskConfigurationModalOpen(false);
            },
          }}
        />
      )}

      {podConfigurationModalOpen && (
        <PodConfigurationModal
          open={podConfigurationModalOpen}
          projectId={Number(projectId)}
          onConfirm={() => {
            setPodConfigurationModalOpen(false);
          }}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setPodConfigurationModalOpen(false);
            },
          }}
        />
      )}
      {batchPriceUpdateModalOpen && (
        <ProjectBatchPriceUpdateModal
          projectId={projectId}
          batchPriceUpdateModalOpen={batchPriceUpdateModalOpen}
          onCancel={() => setBatchPriceUpdateModalOpen(false)}
        />
      )}

      {additionSettingsModalOpen && (
        <ProjectAdditionSettingsModal
          title={'Manage Addition'}
          open={additionSettingsModalOpen}
          projectId={projectId}
          onConfirm={onAdditionSettingsConfirm}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setAdditionSettingsModalOpen(false);
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: additionSettingsConfirmLoading,
            },
          }}
        />
      )}
      {showDispatch ? (
        <QuickDispatchModal
          width={680}
          projectDetail={detail}
          hideModal={() => {
            setShowDispatch(false);
            dispatch({
              type: OPS_TYPE.REFRESH_FLAG,
              payload: {
                data: !state?.refreshFlag,
              },
            });
          }}
        />
      ) : null}
      {showCustomerCodeConfigModal && (
        <CustomerCodeConfigurationModal
          projectId={+projectId!}
          canEdit={[
            ProjectStatusEnum.PREPARING,
            ProjectStatusEnum.INPROGRESS,
            ProjectStatusEnum.SUSPEND,
          ].includes(detail?.projectStatus)}
          open={showCustomerCodeConfigModal}
          onConfirm={() => setShowCustomerCodeConfigModal(false)}
          modalProps={{
            onCancel: () => setShowCustomerCodeConfigModal(false),
          }}
        />
      )}
    </>
  );
});
