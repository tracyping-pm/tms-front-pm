import { contractDeleteNote } from '@/api/contract';
import {
  customerContractAdd,
  customerContractTrackingExpireCount,
  customerContractTrackingList,
} from '@/api/customer';
import { IContractTrackingExpireCountData } from '@/api/types/contract';
import {
  ICustomerContractTrackingItem,
  ICustomerContractTrackingListParams,
} from '@/api/types/customer';
import CustomTooltip from '@/components/CustomTooltip';
import ExpiringDayFilter from '@/components/ExpiringDayFilter';
import FuzzySelector from '@/components/FuzzySelector';
import UpdateContractModal, {
  IUpdateContractDto,
} from '@/components/UpdateContractModal';
import { DEFAULT_PAGINATION, ES_DTO_CLASS, PATHS } from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  ContractTypeEnum,
  EnumCompareOperatorType,
  EnumContractExpireStatus,
  FieldQueryHighlightTypeEnum,
  ProjectStatusEnum,
  ProjectStatusEnumColor,
  ProjectStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import SkeletonView from '@/pages/statistics/common/SkeletonView';
import { openNewTag } from '@/utils/utils';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAccess, useModel } from '@umijs/max';
import {
  App,
  Badge,
  Button,
  Checkbox,
  Divider,
  Flex,
  Form,
  InputNumber,
  Popconfirm,
  Popover,
  Select,
  Space,
  Table,
  TableProps,
  Tooltip,
  Typography,
} from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './index.less';
import NoteModal from './NoteModal';

const { Text } = Typography;

const ContractTracking: FC = () => {
  const { message, modal } = App.useApp();
  const access = useAccess();
  const userId = useModel('@@initialState')?.initialState?.currentUser?.id;
  const [contractExpireStatus, setContractExpireStatus] =
    useState<EnumContractExpireStatus>();
  const [form] = Form.useForm();
  const [expireCountLoading, setExpireCountLoading] = useState(false);
  const [expireCountData, setExpireCountData] =
    useState<IContractTrackingExpireCountData>();
  const [tableLoading, setTableLoading] = useState(false);
  const [originData, setOriginData] =
    useState<PaginationResponse<ICustomerContractTrackingItem>>(
      DEFAULT_PAGINATION,
    );
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] =
    useState<ICustomerContractTrackingItem>();
  const [noteDeleteLoading, setNoteDeleteLoading] = useState(false);
  const [updateContractModalOpen, setUpdateContractModalOpen] = useState(false);
  const [updateContractConfirming, setUpdateContractConfirming] =
    useState(false);

  const getFormValue = () => {
    const values = form.getFieldsValue();
    const payload = {
      projectId: values?.projectNameObj?.id,
      projectActivityStatus: values?.projectActivityStatus,
      customerId: values?.customerNameObj?.id,
      bdUserId: values?.onlyMeForBD ? userId : values?.bdObj?.id,
      camUserId: values?.onlyMeForCAM ? userId : values?.camObj?.id,
      operatorType: values?.operatorType,
      operatorDays: values?.operatorDays,
    };
    return payload;
  };

  const getExpireCount = async () => {
    setExpireCountLoading(true);
    const res = await customerContractTrackingExpireCount().finally(() => {
      setExpireCountLoading(false);
    });

    if (res.code === 200) {
      setExpireCountData(res.data);
    }
  };

  const getTableDataSource = async (
    payload?: ICustomerContractTrackingListParams,
  ) => {
    setTableLoading(true);
    const res = await customerContractTrackingList(payload ?? {}).finally(
      () => {
        setTableLoading(false);
      },
    );

    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const reloadTableData = (options?: {
    keepPagination?: boolean;
    keepFormValues?: boolean;
  }) => {
    let payload: ICustomerContractTrackingListParams = {};

    if (contractExpireStatus) {
      payload.contractExpireStatus = contractExpireStatus;
    } else {
      if (options?.keepFormValues) {
        const formValue = getFormValue();
        payload = { ...payload, ...formValue };
      }
    }

    if (options?.keepPagination) {
      payload.pageNum = originData.pageNum;
      payload.pageSize = originData.pageSize;
    }

    getTableDataSource(payload);
  };

  const onExpireStatusChange = async (v: EnumContractExpireStatus) => {
    form.resetFields();
    const _status = v === contractExpireStatus ? undefined : v;
    setContractExpireStatus(_status);
    getTableDataSource({ contractExpireStatus: _status });
  };

  const onSearch = async () => {
    setContractExpireStatus(undefined);

    const formValue = getFormValue();
    getTableDataSource(formValue);
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const formValue = getFormValue();
    await getTableDataSource({
      ...params,
      ...formValue,
      ...(contractExpireStatus ? { contractExpireStatus } : {}),
    });
  };

  const onAddNote = (record: ICustomerContractTrackingItem) => {
    setActiveRecord(record);
    setNoteModalOpen(true);
  };

  const onDeleteNote = async (record: ICustomerContractTrackingItem) => {
    const { contractId } = record;

    setNoteDeleteLoading(true);
    const res = await contractDeleteNote({ contractId }).finally(() => {
      setNoteDeleteLoading(false);
    });

    if (res.code === 200) {
      reloadTableData({ keepPagination: true, keepFormValues: true });
      message.success('Note deleted successfully');
    }
  };

  const onUpdateContract = (record: ICustomerContractTrackingItem) => {
    setActiveRecord(record);
    setUpdateContractModalOpen(true);
  };

  const onUpdateContractConfirm = async (
    dto: IUpdateContractDto,
    files: File[],
  ) => {
    setUpdateContractModalOpen(false);

    const formData = new FormData();
    const blob = new Blob([JSON.stringify(dto)], {
      type: 'application/json',
    });
    formData.append('dto', blob);
    files.forEach((item: File) => {
      formData.append('files', item);
    });
    setUpdateContractConfirming(true);
    const res = await customerContractAdd(formData).finally(() => {
      setUpdateContractConfirming(false);
    });
    if (res.code === 200) {
      if (res.data) {
        message.success('Update contract successfully!');
        reloadTableData({ keepPagination: true, keepFormValues: true });
      } else {
        modal.warning({
          title: 'Warning',
          content:
            'A route library must be created under the project to create a contract',
        });
      }
    }
  };

  const columns: TableProps<ICustomerContractTrackingItem>['columns'] = [
    {
      title: 'No.',
      dataIndex: 'No.',
      key: 'No.',
      width: '60px',
      fixed: 'left',
      render: (_value, _record, index: number) => <span>{index + 1}</span>,
    },
    {
      title: 'Contract Number',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      fixed: 'left',
      width: 160,
      render: (_value, record) => (
        <CustomTooltip title={record.contractNumber}>
          <span>{record.contractNumber}</span>
        </CustomTooltip>
      ),
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 220,
      render: (_value, record) => (
        <Text
          underline
          style={{ color: 'var(--primary-color)', cursor: 'pointer' }}
          onClick={() => {
            openNewTag(`${PATHS.PROJECT_DETAIL_BASE}/${record.projectId}`);
          }}
        >
          {record.projectName}
        </Text>
      ),
    },
    {
      title: 'Project Status',
      dataIndex: 'projectStatus',
      key: 'projectStatus',
      width: 140,
      render: (_, record) => {
        const status: ProjectStatusEnum = record.projectStatus;
        const Content = (
          <Badge
            color={ProjectStatusEnumColor[status]}
            text={ProjectStatusEnumText[status]}
          />
        );
        return <Popover content={Content}>{Content}</Popover>;
      },
    },
    {
      title: (
        <Space>
          Project Activity Status
          <Tooltip
            title={`A project is classified as "Active" if it has non-canceled waybills within the last 30 days; otherwise, it is classified as "Inactive."`}
          >
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'projectActivityStatus',
      key: 'projectActivityStatus',
      width: 190,
      render: (_, record) => {
        const color = record.projectActivityStatus ? 'green' : 'red';
        const text = record.projectActivityStatus ? 'Active' : 'Inactive';
        const Content = <Badge color={color} text={text} />;
        return <Popover content={Content}>{Content}</Popover>;
      },
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 180,
      render: (_value, record) => (
        <CustomTooltip title={record.customerName}>
          <span>{record.customerName}</span>
        </CustomTooltip>
      ),
    },
    {
      title: 'BD',
      dataIndex: 'bdName',
      key: 'bdName',
      width: 140,
      render: (_value, record) => (
        <CustomTooltip title={record.bdName}>
          <span>{record.bdName}</span>
        </CustomTooltip>
      ),
    },
    {
      title: 'CAM',
      dataIndex: 'camName',
      key: 'camName',
      width: 140,
      render: (_value, record) => (
        <CustomTooltip title={record.camName}>
          <span>{record.camName}</span>
        </CustomTooltip>
      ),
    },
    {
      title: 'Customer Contract Period',
      dataIndex: 'customerContractPeriod',
      key: 'customerContractPeriod',
      width: 200,
      render: (_value, record) => (
        <Flex vertical>
          <span>Start: {record.customerContractPeriod?.startDate}</span>
          <span>End: {record.customerContractPeriod?.endDate}</span>
        </Flex>
      ),
    },
    {
      title: 'Remaining Days',
      dataIndex: 'remainingDays',
      key: 'remainingDays',
      width: 140,
      render: (_, record) => {
        const getStatusClass = (key: number): string => {
          const days = Number(key);
          if (isNaN(days)) return 'status-normal';

          if (days >= 7) return 'status-normal';
          if (days >= 3) return 'status-warning';
          if (days >= 0) return 'status-danger';
          return 'status-disabled'; // 负数情况
        };

        const statusClass = getStatusClass(record.remainingDays);

        return (
          <span className={cls(styles.expiringDay, styles[statusClass])}>
            {record.remainingDays}
          </span>
        );
      },
    },
    {
      title: 'Note',
      dataIndex: 'customerNote',
      key: 'customerNote',
      width: 240,
      render: (_value, record) => {
        const { customerNote } = record;
        if (!customerNote) return '-';
        const { note, createdName, createdAt } = customerNote;
        return (
          <Flex gap={4} align="flex-start">
            <Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
              <Text ellipsis={{ tooltip: note }}>{note}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {createdName}
                {createdAt &&
                  ` · ${dayjs(createdAt).format('YYYY-MM-DD HH:mm')}`}
              </Text>
            </Flex>
            <Popconfirm
              title={'Confirm delete the Note?'}
              onConfirm={() => onDeleteNote(record)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ loading: noteDeleteLoading }}
            >
              <DeleteOutlined
                style={{ marginTop: 4, color: 'var(--danger-color)' }}
              />
            </Popconfirm>
          </Flex>
        );
      },
    },
    {
      title: 'Operate',
      dataIndex: 'operate',
      key: 'operate',
      fixed: 'right',
      width: 190,
      render: (_value, record) => (
        <Space split={<Divider type="vertical" />}>
          <Button
            color="primary"
            variant="link"
            style={{ padding: 0 }}
            onClick={() => onAddNote(record)}
          >
            Add Note
          </Button>
          {access[PermissionEnum.CUSTOMER_CONTRACT_TRACKING_UPDATE] && (
            <Button
              color="primary"
              variant="link"
              style={{ padding: 0 }}
              loading={
                updateContractConfirming &&
                record.contractId === activeRecord?.contractId
              }
              onClick={() => onUpdateContract(record)}
            >
              Update Contract
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const refreshAllData = useCallback(() => {
    console.log('[Scheduled Task] 执行凌晨数据自动刷新');
    getExpireCount();

    reloadTableData({ keepPagination: true, keepFormValues: true });
  }, [getExpireCount, reloadTableData]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const setupMidnightRefresh = () => {
      const now = new Date();
      const midnight = new Date(now);

      // 设置为次日凌晨 00:00:01
      midnight.setDate(now.getDate() + 1);
      midnight.setHours(0, 0, 1, 0);

      const msToMidnight = midnight.getTime() - now.getTime();

      // 1. 设置第一个定时器，等待到凌晨
      timerId = setTimeout(() => {
        refreshAllData();

        // 2. 到达凌晨后，开启每 24 小时一次的循环
        intervalId = setInterval(
          () => {
            refreshAllData();
          },
          24 * 60 * 60 * 1000,
        );
      }, msToMidnight);
    };

    setupMidnightRefresh();

    // 销毁组件时必须清除计时器，防止内存泄漏
    return () => {
      clearTimeout(timerId);
      clearInterval(intervalId);
    };
  }, [refreshAllData]);

  useEffect(() => {
    getExpireCount();
    getTableDataSource();
  }, []);

  return (
    <>
      <Flex gap={12} vertical>
        <section style={{ marginBottom: '12px' }}>
          {expireCountLoading ? (
            <SkeletonView rows={3} cols={4} />
          ) : (
            <ExpiringDayFilter
              dataSource={expireCountData}
              value={contractExpireStatus}
              onChange={onExpireStatusChange}
            />
          )}
        </section>

        <Form form={form} name="vendor-contract-tracking-form">
          <Flex gap={10} align="center" wrap>
            <section>
              <Form.Item name="projectNameObj" noStyle>
                <FuzzySelector
                  fieldProps={{
                    placeholder: 'Project Name',
                    style: { width: `${DEFAULT_WIDTH}px` },
                  }}
                  request={{
                    field: 'projectName',
                    esDtoClass: ES_DTO_CLASS.PROJECT,
                    type: FieldQueryHighlightTypeEnum.COUNTRY,
                  }}
                />
              </Form.Item>
            </section>

            <section>
              <Form.Item name="projectActivityStatus" noStyle>
                <Select
                  placeholder="Project Activity Status"
                  options={[
                    { label: 'Active', value: true },
                    { label: 'Inactive', value: false },
                  ]}
                  style={{ width: `${DEFAULT_WIDTH}px` }}
                  allowClear
                />
              </Form.Item>
            </section>

            <section>
              <Form.Item name="customerNameObj" noStyle>
                <FuzzySelector
                  fieldProps={{
                    placeholder: 'Customer Name',
                    style: { width: `${DEFAULT_WIDTH}px` },
                  }}
                  request={{
                    field: 'customerName',
                    esDtoClass: ES_DTO_CLASS.CUSTOMER,
                    type: FieldQueryHighlightTypeEnum.USER_ROLE,
                  }}
                />
              </Form.Item>
            </section>

            <section style={{ width: `${DEFAULT_WIDTH}px` }}>
              <Space.Compact>
                <Form.Item
                  name="operatorType"
                  noStyle
                  initialValue={EnumCompareOperatorType.EQ}
                >
                  <Select
                    options={[
                      {
                        label: '>=',
                        key: EnumCompareOperatorType.GE,
                        value: EnumCompareOperatorType.GE,
                      },
                      {
                        label: '<=',
                        key: EnumCompareOperatorType.LE,
                        value: EnumCompareOperatorType.LE,
                      },
                      {
                        label: '=',
                        key: EnumCompareOperatorType.EQ,
                        value: EnumCompareOperatorType.EQ,
                      },
                    ]}
                  />
                </Form.Item>

                <div style={{ flex: 1 }}>
                  <Form.Item name="operatorDays" noStyle>
                    <InputNumber
                      placeholder="Remaining Days"
                      controls={false}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
              </Space.Compact>
            </section>

            <section>
              <Form.Item name="bdObj" noStyle>
                <FuzzySelector
                  customProps={{ isUAM: true }}
                  fieldProps={{
                    placeholder: 'BD',
                    style: { width: `${DEFAULT_WIDTH}px` },
                  }}
                  request={{
                    field: 'aliasName',
                    esDtoClass: ES_DTO_CLASS.USER,
                    type: FieldQueryHighlightTypeEnum.USER_ROLE,
                  }}
                />
              </Form.Item>
            </section>

            <section>
              <Form.Item name="camObj" noStyle>
                <FuzzySelector
                  customProps={{ isUAM: true }}
                  fieldProps={{
                    placeholder: 'CAM',
                    style: { width: `${DEFAULT_WIDTH}px` },
                  }}
                  request={{
                    field: 'aliasName',
                    esDtoClass: ES_DTO_CLASS.USER,
                    type: FieldQueryHighlightTypeEnum.USER_ROLE,
                  }}
                />
              </Form.Item>
            </section>

            <section>
              <Form.Item name="onlyMeForBD" valuePropName="checked" noStyle>
                <Checkbox>Only me for BD</Checkbox>
              </Form.Item>
            </section>

            <section>
              <Form.Item name="onlyMeForCAM" valuePropName="checked" noStyle>
                <Checkbox>Only me for CAM</Checkbox>
              </Form.Item>
            </section>

            <section>
              <Space>
                <Button type="primary" htmlType="submit" onClick={onSearch}>
                  Search
                </Button>

                <Button
                  onClick={() => {
                    form.resetFields();
                    setContractExpireStatus(undefined);
                    reloadTableData();
                  }}
                >
                  Reset
                </Button>
              </Space>
            </section>
          </Flex>
        </Form>

        <section>
          <Table<ICustomerContractTrackingItem>
            scroll={{ x: 3000 }}
            columns={columns}
            dataSource={originData.list}
            loading={tableLoading}
            pagination={{
              size: 'small',
              showSizeChanger: true,
              showQuickJumper: false,
              showTotal: (total, [start, end]) => {
                return total
                  ? `${start}-${end} of ${total} items`
                  : `0 of ${total} items`;
              },
              current: originData.pageNum,
              pageSize: originData.pageSize,
              total: originData.total,
              onChange: (page: number, pageSize: number) => {
                onPaginationChange({ pageNum: page, pageSize: pageSize });
              },
            }}
          />
        </section>
      </Flex>
      <NoteModal
        contractId={activeRecord?.contractId}
        open={noteModalOpen}
        onCancel={() => setNoteModalOpen(false)}
        onSubmit={() => {
          setNoteModalOpen(false);
          reloadTableData({ keepPagination: true, keepFormValues: true });
        }}
      />
      {activeRecord ? (
        <UpdateContractModal
          contractId={activeRecord.contractId}
          contractType={ContractTypeEnum.CUSTOMER}
          projectInfo={{
            id: activeRecord.projectId,
            name: activeRecord.projectName,
          }}
          contractSignerInfo={{
            id: activeRecord.customerId,
            name: activeRecord.customerName,
          }}
          open={updateContractModalOpen}
          onCancel={() => setUpdateContractModalOpen(false)}
          onConfirm={onUpdateContractConfirm}
        />
      ) : null}
    </>
  );
};

export default ContractTracking;
