import { subtaskCreate, subtaskList } from '@/api/subtask';
import { SubtaskCreateParams, SubtaskListParams } from '@/api/types/subtask';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import { I_FUZZY_API_RESPONSE } from '@/components/FuzzySelector/types';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import PubSubContext from '@/context/pubsub';
import {
  FieldQueryHighlightTypeEnum,
  SubtaskStatusEnum,
  SubtaskStatusEnumText,
  SubtaskStatusEnumTextColor,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import useUrlState from '@ahooksjs/use-url-state';
import { BarsOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess } from '@umijs/max';
import { App, Badge, Button } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useContext, useEffect, useRef, useState } from 'react';
import SubtaskAddModal from './components/SubtaskAddModal';
import { EVENT_SUBTASK_LIST_RELOAD } from './events';
import styles from './styles.less';

interface IFE_NEED extends SubtaskListParams {
  scrollTop?: number;
  startDueTime?: string;
  endDueTime?: string;
  startCompletionCancelTime?: string;
  endCompletionCancelTime?: string;
  projectNameObj?: I_FUZZY_API_RESPONSE;
  customerNameObj?: I_FUZZY_API_RESPONSE;
  vendorNameObj?: I_FUZZY_API_RESPONSE;
  waybillNumberObj?: I_FUZZY_API_RESPONSE;
  currentAssigneesList?: I_FUZZY_API_RESPONSE[];
}
interface ISubtaskList {
  hideInSearchAndCreate?: boolean;
  buId?: number;
}

const SubtaskList: React.FC<ISubtaskList> = ({
  hideInSearchAndCreate = false,
  buId,
}) => {
  const access = useAccess();
  const { subscribe } = useContext(PubSubContext);
  const { message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [subtaskModalOpen, setSubtaskModalOpen] = useState<boolean>(false);
  const [, setUrlState] = useUrlState();
  const formRef = useRef<ProFormInstance>();

  const saveScrollTop = () => {
    // 记录滚动位置
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { FE_NEED } = extraJson;
    const scrollTop = document?.scrollingElement?.scrollTop ?? 0;
    const newExtra = { ...extraJson, FE_NEED: { ...FE_NEED, scrollTop } };
    setUrlState({
      extra: JSON.stringify(newExtra),
    });
  };

  const doScrollTop = (top: number) => {
    setTimeout(() => {
      // 滚动到记录位置
      window?.scrollTo?.({
        top: top,
        behavior: 'smooth',
      });
    }, 0);
  };

  const getDataSource = async (BE_NEED: SubtaskListParams) => {
    setLoading(true);
    const res = await subtaskList(BE_NEED);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data ?? []);
    }
  };

  const reload = () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    getDataSource(BE_NEED ?? {});
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;
    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: SubtaskListParams = { pageNum, pageSize };
    const values = formRef.current?.getFieldsValue();

    if (values.projectNameObj) {
      lodash.set(FE_NEED, 'projectNameObj', values.projectNameObj);
      lodash.set(BE_NEED, 'projectId', values.projectNameObj.id);
    }

    if (values.customerNameObj) {
      lodash.set(FE_NEED, 'customerNameObj', values.customerNameObj);
      lodash.set(BE_NEED, 'customerId', values.customerNameObj.id);
    }

    if (values.vendorNameObj) {
      lodash.set(FE_NEED, 'vendorNameObj', values.vendorNameObj);
      lodash.set(BE_NEED, 'vendorId', values.vendorNameObj.id);
    }

    if (values.waybillNumberObj) {
      lodash.set(FE_NEED, 'waybillNumberObj', values.waybillNumberObj);
      lodash.set(BE_NEED, 'buId', values.waybillNumberObj.id);
    }

    if (values.subtaskName) {
      lodash.set(FE_NEED, 'subtaskName', values.subtaskName);
      lodash.set(BE_NEED, 'subtaskName', values.subtaskName);
    }
    if (values.status) {
      lodash.set(FE_NEED, 'status', values.status);
      lodash.set(BE_NEED, 'status', values.status);
    }

    if (values.result) {
      lodash.set(FE_NEED, 'result', values.result);
      lodash.set(BE_NEED, 'result', values.result);
    }
    if (values?.currentAssigneesList?.length > 0) {
      const obj = values.currentAssigneesList?.map(
        (item: { id: number; name: string }) => ({
          assigneeId: item.id,
          assigneeName: item.name,
        }),
      );
      lodash.set(FE_NEED, 'currentAssigneesList', values.currentAssigneesList);
      lodash.set(BE_NEED, 'currentAssignees', obj);
    }

    if (values.dueTime) {
      const [start, end] = values.dueTime;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD 00:00:00')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD 23:59:59') : undefined;
      lodash.set(FE_NEED, 'startDueTime', startTime);
      lodash.set(FE_NEED, 'endDueTime', endTime);
      lodash.set(BE_NEED, 'startDueTime', startTime);
      lodash.set(BE_NEED, 'endDueTime', endTime);
    }
    if (values.completionCancelTime) {
      const [start, end] = values.completionCancelTime;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD 00:00:00')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD 23:59:59') : undefined;
      lodash.set(FE_NEED, 'startCompletionCancelTime', startTime);
      lodash.set(FE_NEED, 'endCompletionCancelTime', endTime);
      lodash.set(BE_NEED, 'startCompletionCancelTime', startTime);
      lodash.set(BE_NEED, 'endCompletionCancelTime', endTime);
    }

    const urlParams = {
      FE_NEED: FE_NEED,
      BE_NEED: BE_NEED,
    };

    const extra = JSON.stringify(urlParams);
    setUrlState({ extra: extra });
    // BE_NEED
    getDataSource(BE_NEED);
  };

  const fillTableForm = (FE_NEED: IFE_NEED) => {
    formRef.current?.setFieldsValue({
      subtaskName: FE_NEED.subtaskName,
      status: FE_NEED.status,
      result: FE_NEED.result,
      dueTime: [
        FE_NEED.startDueTime ? dayjs(FE_NEED.startDueTime) : undefined,
        FE_NEED.endDueTime ? dayjs(FE_NEED.endDueTime) : undefined,
      ],
      completionCancelTime: [
        FE_NEED.startCompletionCancelTime
          ? dayjs(FE_NEED.startCompletionCancelTime)
          : undefined,
        FE_NEED.endCompletionCancelTime
          ? dayjs(FE_NEED.endCompletionCancelTime)
          : undefined,
      ],
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      projectNameObj: FE_NEED.projectNameObj
        ? FE_NEED.projectNameObj
        : undefined,
      customerNameObj: FE_NEED.customerNameObj
        ? FE_NEED.customerNameObj
        : undefined,
      vendorNameObj: FE_NEED.vendorNameObj ? FE_NEED.vendorNameObj : undefined,
      waybillNumberObj: FE_NEED.waybillNumberObj
        ? FE_NEED.waybillNumberObj
        : undefined,
    });
    formRef.current?.setFieldsValue({
      currentAssigneesList: FE_NEED.currentAssigneesList,
    });
  };

  const doFirstQuery = async () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { FE_NEED, BE_NEED } = extraJson;
    if (FE_NEED) {
      fillTableForm(FE_NEED);
    }

    if (BE_NEED) {
      await getDataSource(BE_NEED);
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    } else {
      await getDataSource({
        pageNum: 1,
        pageSize: hideInSearchAndCreate ? 1000 : 20,
        buId: buId,
      });
      doScrollTop(FE_NEED?.scrollTop ?? 0);
    }
  };

  const onReset = () => {
    setUrlState({ extra: undefined });
    // 自动触发 onSubmit
  };

  const onSubtaskAddModalConfirm = async (values: SubtaskCreateParams) => {
    setConfirmLoading(true);
    const res = await subtaskCreate(values);
    setConfirmLoading(false);
    if (res.code === 200) {
      setSubtaskModalOpen(false);
      message.success('Subtask add success!');
      reload();
    }
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;

    await getDataSource({ ...BE_NEED, ...params });
  };

  const columns: ProColumns[] = [
    {
      title: 'Project Name',
      dataIndex: 'projectNameObj',
      valueType: 'select',
      hideInTable: true,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Project Name' }}
            request={{
              field: 'projectName',
              esDtoClass: ES_DTO_CLASS.PROJECT,
              type: FieldQueryHighlightTypeEnum.USER_ROLE,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerNameObj',
      valueType: 'select',
      hideInTable: true,
      width: 260,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Customer Name' }}
            request={{
              field: 'customerName',
              esDtoClass: ES_DTO_CLASS.CUSTOMER,
              type: FieldQueryHighlightTypeEnum.COUNTRY,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.customerName}>
            {record.customerName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendorNameObj',
      valueType: 'select',
      hideInTable: true,
      width: 240,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Vendor Name' }}
            request={{
              field: 'vendorName',
              esDtoClass: ES_DTO_CLASS.VENDOR,
              type: FieldQueryHighlightTypeEnum.COUNTRY,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.vendorName}>
            {record.vendorName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Waybill Number',
      dataIndex: 'waybillNumberObj',
      valueType: 'select',
      hideInTable: hideInSearchAndCreate,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            fieldProps={{ placeholder: 'Waybill Number' }}
            request={{
              field: 'waybillNumber',
              esDtoClass: ES_DTO_CLASS.WAYBILL,
              type: FieldQueryHighlightTypeEnum.None,
            }}
          />
        );
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.waybillNumber}>
            {record.waybillNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Subtask Name',
      dataIndex: 'subtaskName',
      // width: 150,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'SubTask Name',
      },
      render: (_, record) => (
        <CustomTooltip title={record.subtaskName}>
          {record.subtaskName ? record.subtaskName : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      // width: 120,
      ellipsis: {
        showTitle: false,
      },
      valueEnum: SubtaskStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Status',
      },
      render: (_, record) => {
        const status: SubtaskStatusEnum = record.status;
        const Content = (
          <Badge color={SubtaskStatusEnumTextColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Result',
      dataIndex: 'result',
      // width: 120,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Result',
      },
      render: (_, record) => (
        <CustomTooltip title={record.result}>
          {record.result ? record.result : '-'}
        </CustomTooltip>
      ),
    },
    {
      title: 'Current Progress',
      dataIndex: 'currentProgress',
      width: hideInSearchAndCreate ? 'auto' : 220,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      sorter: hideInSearchAndCreate
        ? false
        : (a, b) => {
            const current = a?.currentProgress ?? 'z';
            const next = b?.currentProgress ?? 'z';
            return (
              current?.slice(0, 1).charCodeAt(0) -
              next?.slice(0, 1).charCodeAt(0)
            );
          },
      showSorterTooltip: false,
      render: (_, record) => {
        const currentProgress = record?.currentProgress;
        return (
          <CustomTooltip title={currentProgress}>
            {currentProgress ? currentProgress : '-'}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Current Assignee',
      dataIndex: 'currentAssigneesList',
      valueType: 'select',
      width: hideInSearchAndCreate ? 'auto' : 220,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => {
        return (
          <FuzzySelector
            customProps={{
              isUAM: true,
            }}
            fieldProps={{
              placeholder: 'Current Assignee',
              mode: 'multiple',
            }}
            request={{
              field: 'aliasName',
              esDtoClass: ES_DTO_CLASS.USER,
              type: FieldQueryHighlightTypeEnum.None,
            }}
          />
        );
      },
      render: (_, record) => {
        const str = record?.currentAssignees?.reduce(
          (pre: string, cur: { assigneeName: string }, index: number) => {
            return `${pre}${index !== 0 ? ',' : ''} ${cur.assigneeName ?? '-'}`;
          },
          '',
        );
        return <CustomTooltip title={str}>{str ? str : '-'}</CustomTooltip>;
      },
    },

    {
      title: 'Due Time',
      dataIndex: 'dueTime',
      valueType: 'dateRange',
      ellipsis: {
        showTitle: false,
      },
      fieldProps: {
        placeholder: ['Due Time Start', 'Due Time End'],
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      render: (_, record) => {
        return record.dueTime ? (
          <CustomTooltip
            title={dayjs(record.dueTime).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.dueTime).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Completion time/ Cancel time',
      dataIndex: 'completionCancelTime',
      valueType: 'dateRange',
      width: 240,
      hideInTable: hideInSearchAndCreate,
      ellipsis: {
        showTitle: false,
      },
      fieldProps: {
        placeholder: ['Completion Time Start', 'Completion Time End'],
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      render: (_, record) => {
        return record?.completionCancelTime ? (
          <CustomTooltip
            title={dayjs(record.completionCancelTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )}
          >
            {dayjs(record.completionCancelTime).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        ) : (
          '-'
        );
      },
    },
    {
      title: 'Creation Time',
      dataIndex: 'creationTime',
      hideInSearch: true,
      hideInTable: hideInSearchAndCreate,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            title={dayjs(record.creationTime).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.creationTime).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      width: 120,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.creator}>
            {record.creator || '-'}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      hideInTable: !access[PermissionEnum.SUBTASK_DETAIL],
      width: 88,
      render: (_, record) => {
        return (
          <Access
            key="detail"
            accessible={access[PermissionEnum.SUBTASK_DETAIL]}
          >
            <Button
              icon={<BarsOutlined />}
              color="primary"
              variant="link"
              style={{ padding: 0 }}
              onClick={() => {
                saveScrollTop();
                history.push(
                  `${PATHS.SUBTASK_LIST_DETAIL}/${record.procInstId}`,
                );
              }}
            >
              Details
            </Button>
          </Access>
        );
      },
    },
  ];

  const toolBarRender = () => [
    <Access key="create" accessible={access[PermissionEnum.SUBTASK_CREATE]}>
      <Button
        type="primary"
        onClick={() => {
          setSubtaskModalOpen(true);
        }}
      >
        Create
      </Button>
    </Access>,
  ];

  useEffect(() => {
    // 首次进入拿 URL 上的参数
    if (hideInSearchAndCreate) return;
    doFirstQuery();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(EVENT_SUBTASK_LIST_RELOAD, () => {
      doFirstQuery();
    });

    return unsubscribe;
  }, [buId]);

  return (
    <>
      <CustomTable
        columns={columns}
        rowKey={'procInstId'}
        className={cls(hideInSearchAndCreate && styles.wrap)}
        scroll={{
          x: hideInSearchAndCreate ? 1280 : 1900,
          y: hideInSearchAndCreate ? 280 : undefined,
        }}
        formRef={formRef}
        dataSource={originData.list}
        pagination={
          hideInSearchAndCreate
            ? false
            : {
                showSizeChanger: true,
                current: originData.pageNum,
                pageSize: originData.pageSize,
                total: originData.total,
                onChange: (page: number, pageSize: number) => {
                  onPaginationChange({ pageNum: page, pageSize: pageSize });
                },
              }
        }
        search={
          hideInSearchAndCreate
            ? false
            : { defaultCollapsed: false, collapseRender: false }
        }
        loading={loading}
        toolBarRender={hideInSearchAndCreate ? false : toolBarRender}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />

      {subtaskModalOpen ? (
        <SubtaskAddModal
          open={subtaskModalOpen}
          onConfirm={onSubtaskAddModalConfirm}
          modalProps={{
            okText: 'Confirm',
            onCancel: () => {
              setSubtaskModalOpen(false);
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: confirmLoading,
            },
          }}
        />
      ) : null}
    </>
  );
};

export default SubtaskList;
