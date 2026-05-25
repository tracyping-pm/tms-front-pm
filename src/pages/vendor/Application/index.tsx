import { applicationList } from '@/api/application';
import { IApplicationRecord } from '@/api/types/application';
import CustomStatusButton from '@/components/CustomStatusButton';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import FuzzySelector from '@/components/FuzzySelector';
import {
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import PubSubContext from '@/context/pubsub';
import {
  ApplicationStatusEnum,
  ApplicationStatusEnumColor,
  ApplicationStatusEnumText,
  ApplicationTypeEnum,
  ApplicationTypeEnumText,
  FieldQueryHighlightTypeEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { openNewTag } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access, history, useAccess, useParams } from '@umijs/max';
import { Badge, Button, message, Space } from 'antd';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  EVENT_ACCREDITATION_CREW_RELOAD,
  EVENT_ACCREDITATION_TRUCK_RELOAD,
  EVENT_ACCREDITATION_VENDOR_RELOAD,
} from '../event';
import ReviewModal from './components/ReviewModal';
interface IBE_NEED {
  pageNum: number;
  pageSize: number;
  id?: number;
  statusList?: ApplicationStatusEnum[];
  objectId?: number;
  vendorId?: number;
  typeList?: ApplicationTypeEnum[];
  updatedAtStart?: string;
  updatedAtEnd?: string;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
  vendorName?: string;
  objectName?: string;
  applicationNumber?: string;
}
interface IProps {
  source: ApplicationTypeEnum;
  detailRefresh: boolean;
  setDetailRefresh: (b: boolean) => void;
}

const ApplicationList: React.FC<IProps> = ({
  source,
  detailRefresh,
  setDetailRefresh,
}) => {
  const access = useAccess();
  const { id: _id } = useParams();
  const { publish } = useContext(PubSubContext);
  // 列表展示配置
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);

  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [reviewRecord, setReviewRecord] = useState<IApplicationRecord>(
    {} as IApplicationRecord,
  );
  const [loading, setLoading] = useState<boolean>(true);
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
    if (!!source) return;
    setTimeout(() => {
      // 滚动到记录位置
      window?.scrollTo?.({
        top: top,
        behavior: 'smooth',
      });
    }, 0);
  };

  const getDataSource = async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const payload = !source
      ? {
          ...BE_NEED,
        }
      : {
          ...BE_NEED,
          vendorId: source === ApplicationTypeEnum.VENDOR ? +_id! : undefined,
          type: source !== ApplicationTypeEnum.VENDOR ? source : undefined,
          objectId: source !== ApplicationTypeEnum.VENDOR ? +_id! : undefined,
        };
    const res = await applicationList(payload);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const reload = () => {
    const parsed = queryString.parse(location.search);
    const extraJson = JSON.parse((parsed?.extra as string) ?? '{}');
    const { BE_NEED } = extraJson;
    getDataSource(BE_NEED ?? {});
    setDetailRefresh?.(!detailRefresh);
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;
    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();

    if (values.number) {
      lodash.set(FE_NEED, 'id', values.number?.id);
      lodash.set(FE_NEED, 'applicationNumber', values.number?.name);
      lodash.set(BE_NEED, 'id', values.number?.id);
    }
    if (values.status) {
      lodash.set(FE_NEED, 'statusList', values.status);
      lodash.set(BE_NEED, 'statusList', values.status);
    }
    if (values.applicant) {
      lodash.set(FE_NEED, 'vendorId', values.applicant.id);
      lodash.set(FE_NEED, 'vendorName', values.applicant.name);
      lodash.set(BE_NEED, 'vendorId', values.applicant.id);
    }
    if (values.type) {
      lodash.set(FE_NEED, 'typeList', values.type);
      lodash.set(BE_NEED, 'typeList', values.type);
    }
    if (values.objectName) {
      lodash.set(FE_NEED, 'objectName', values.objectName);
      lodash.set(BE_NEED, 'objectName', values.objectName);
    }

    if (values.updatedAt) {
      const [start, end] = values.updatedAt;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;

      lodash.set(FE_NEED, 'updatedAtStart', startTime);
      lodash.set(FE_NEED, 'updatedAtEnd', endTime);

      lodash.set(BE_NEED, 'updatedAtStart', startTime);
      lodash.set(BE_NEED, 'updatedAtEnd', endTime);
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
      status: FE_NEED.statusList,
      objectName: FE_NEED.objectName,
      type: FE_NEED.typeList,
      updateAt: [
        FE_NEED.updatedAtStart ? dayjs(FE_NEED.updatedAtStart) : undefined,
        FE_NEED.updatedAtEnd ? dayjs(FE_NEED.updatedAtEnd) : undefined,
      ],
    });

    // 模糊查询的单独设置
    formRef.current?.setFieldsValue({
      number: FE_NEED.id
        ? { id: FE_NEED.id, name: FE_NEED.applicationNumber }
        : undefined,
    });
    formRef.current?.setFieldsValue({
      applicant: FE_NEED.vendorId
        ? { id: FE_NEED.vendorId, name: FE_NEED.vendorName }
        : undefined,
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
      await getDataSource({ pageNum: 1, pageSize: 20 });
      doScrollTop(FE_NEED?.scrollTop ?? 0);
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

  const onReset = () => {
    setUrlState({ extra: undefined });
    // setVendorNameValue(undefined);
  };
  const accessibleHandle = () => {
    if (!source) {
      return access[PermissionEnum.APPLICATION_LIST_REVIEW];
    } else {
      let bol;
      switch (source) {
        case ApplicationTypeEnum.VENDOR:
          bol = access[PermissionEnum.VENDOR_DETAIL_APPLICATION_REVIEW];
          break;
        case ApplicationTypeEnum.TRUCK:
          bol = access[PermissionEnum.TRUCK_DETAIL_APPLICATION_REVIEW];
          break;
        case ApplicationTypeEnum.CREW:
          bol = access[PermissionEnum.CREW_DETAIL_APPLICATION_REVIEW];
          break;

        default:
          break;
      }
      return bol;
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Application No.',
      dataIndex: 'number',
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Application No.' }}
          request={{
            field: 'accredApplicationNumber',
            esDtoClass: ES_DTO_CLASS.ACCRED_APPLICATION,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`applicationNumber${record.id}`}
            title={record.number}
            placement="top"
          >
            <Button
              color="primary"
              variant="link"
              style={{ padding: 0 }}
              onClick={() => {
                history.push(
                  `${PATHS.VENDOR_APPLICATION_DETAIL}/${record.id}?type=${record.type}`,
                );
              }}
            >
              {record.number}
            </Button>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      ellipsis: { showTitle: false },
      width: 180,
      valueType: 'select',
      valueEnum: ApplicationStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',

        placeholder: 'Status',
      },
      render: (_, record) => {
        const status: ApplicationStatusEnum = record.status;
        const Content = (
          <Badge
            color={ApplicationStatusEnumColor[status]}
            text={ApplicationStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Applicant',
      dataIndex: 'applicant',
      valueType: 'select',
      ellipsis: { showTitle: false },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{ placeholder: 'Applicant' }}
          request={{
            field: 'vendorName',
            esDtoClass: ES_DTO_CLASS.VENDOR,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },

      render: (_, record) => {
        return (
          <CustomTooltip
            key={`applicant${record.id}`}
            title={record.applicant}
            placement="top"
          >
            {record.applicant}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: ApplicationTypeEnumText,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        mode: 'multiple',
        placeholder: 'Type',
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`type${record.id}`}
            title={record.type}
            placement="top"
          >
            {record.type}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Object',
      dataIndex: 'objectName',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Object',
      },

      render: (_, record) => {
        const { objectName, objectId, type } = record;

        let str = '';
        switch (type) {
          case ApplicationTypeEnum.CREW:
            str = `${PATHS.VENDOR_CREW_DETAIL}/${objectId}`;
            break;
          case ApplicationTypeEnum.TRUCK:
            str = `${PATHS.VENDOR_TRUCK_DETAIL}/${objectId}`;
            break;
          case ApplicationTypeEnum.VENDOR:
            str = `${PATHS.VENDOR_DETAIL}/${objectId}`;
            break;

          default:
            break;
        }
        return (
          <CustomTooltip
            key={`object${record.id}`}
            title={record.objectName}
            // placement="top"
          >
            <Button
              color={'primary'}
              variant="link"
              style={{
                padding: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-start',
                color: objectId ? '#009688' : 'rgba(0, 0, 0, 0.25)',
                cursor: objectId ? 'pointer' : 'not-allowed',
              }}
              onClick={() => {
                if (!objectId) {
                  message.error('Review has not been approved yet.');
                  return;
                }
                openNewTag(str);
              }}
            >
              <div className="ellipsis">{objectName}</div>
            </Button>
          </CustomTooltip>
        );
      },
    },

    {
      title: 'Update Time',
      dataIndex: 'updatedAt',
      width: 180,
      valueType: 'dateTimeRange',
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Update Time Start', 'Update Time End'],
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`updateTime${record.id}`}
            title={dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creatorEmail',
      ellipsis: { showTitle: false },
      hideInSearch: true,
      render: (_, record) => {
        return (
          <CustomTooltip
            key={`creator${record.id}`}
            title={record.creatorEmail}
            placement="top"
          >
            {record.creatorEmail}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 120,
      hideInTable: !accessibleHandle(),
      render: (_, record) => {
        return (
          <Space>
            <Access key="review" accessible={accessibleHandle()}>
              {record.status === ApplicationStatusEnum.UNDER_REVIEW ? (
                <CustomStatusButton
                  noStyle
                  onClick={() => {
                    saveScrollTop();
                    setReviewRecord(record);
                    setShowReviewModal(true);
                  }}
                >
                  Review
                </CustomStatusButton>
              ) : null}
            </Access>
            <Access key="detail" accessible={true}>
              <CustomStatusButton
                noStyle
                onClick={() => {
                  history.push(
                    `${PATHS.VENDOR_APPLICATION_DETAIL}/${record.id}?type=${record.type}`,
                  );
                }}
              >
                Detail
              </CustomStatusButton>
            </Access>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  return (
    <>
      <div style={{ margin: !source ? '' : '0 -24px' }}>
        <CustomTable
          form={{
            name: 'application-list',
          }}
          columns={columns}
          fixedSpin={!source}
          scroll={{ x: 1400 }}
          formRef={formRef}
          dataSource={originData.list}
          pagination={{
            showSizeChanger: true,
            current: originData.pageNum,
            pageSize: originData.pageSize,
            total: originData.total,
            onChange: (page: number, pageSize: number) => {
              onPaginationChange({ pageNum: page, pageSize: pageSize });
              // onSubmit({ pageNum: page, pageSize: pageSize });
            },
          }}
          search={
            !source
              ? {
                  defaultCollapsed: false,
                  collapseRender: false,
                }
              : false
          }
          loading={loading}
          toolBarRender={false}
          onSubmit={onSubmit}
          onReset={onReset}
          manualRequest
          filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
        />
      </div>
      {showReviewModal ? (
        <ReviewModal
          type={reviewRecord?.type}
          reviewId={reviewRecord?.id}
          open={showReviewModal}
          onCancel={() => setShowReviewModal(false)}
          refresh={() => {
            reload();
            if (reviewRecord?.type === ApplicationTypeEnum.TRUCK) {
              publish(EVENT_ACCREDITATION_TRUCK_RELOAD);
            } else if (reviewRecord?.type === ApplicationTypeEnum.CREW) {
              publish(EVENT_ACCREDITATION_CREW_RELOAD);
            } else if (reviewRecord?.type === ApplicationTypeEnum.VENDOR) {
              publish(EVENT_ACCREDITATION_VENDOR_RELOAD);
            }
          }}
        />
      ) : null}
    </>
  );
};
export default ApplicationList;
