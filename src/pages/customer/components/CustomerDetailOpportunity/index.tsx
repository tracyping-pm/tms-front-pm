import { opportunityAdd, opportunityInCustomer } from '@/api/opportunity';
import { IOpportunityRecord } from '@/api/types/opportunity';
import CustomTable from '@/components/CustomTable';
import { DEFAULT_PAGINATION, LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  BUEnumText,
  OpportunitiesStatusEnum,
  OpportunitiesStatusEnumColor,
  OpportunitiesStatusEnumText,
} from '@/enums';
import { BarsOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Access } from '@umijs/max';
import { Badge, Divider, message, Space } from 'antd';
import dayjs from 'dayjs';
import { useContext, useEffect, useRef, useState } from 'react';

import CustomTooltip from '@/components/CustomTooltip';
import PubSubContext from '@/context/pubsub';
import { PermissionEnum } from '@/enums/permission';
import { formatAmount } from '@/utils/utils';
import { history, useAccess, useParams } from '@umijs/max';
import { EVENT_LEAD_DETAIL_RELOAD } from '../../events';
import OpportunitiesAddModal from '../../Opportunities/components/OpportunitiesAddModal';
import styles from './styles.less';

interface ICustomerDetailOpportunity {
  showModal?: boolean;
  setShowModal?: (b: boolean) => void;
  customerName?: string;
  leadName?: string;
  isCustomer?: boolean;
}

const CustomerDetailOpportunity: React.FC<ICustomerDetailOpportunity> = ({
  showModal = false,
  isCustomer = false,
  setShowModal,
  customerName,
  leadName,
}) => {
  const access = useAccess();
  const { publish } = useContext(PubSubContext);
  const { id } = useParams();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);

  const [opportunityModalOpen, setOpportunityModalOpen] =
    useState<boolean>(false);
  const [confirmOpportunityLoading, setConfirmOpportunityLoading] =
    useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();

  const getDataSource = async (params?: {
    pageNum: number;
    pageSize: number;
  }) => {
    setLoading(true);
    const payload = {
      pageNum: params?.pageNum ?? 1,
      pageSize: params?.pageSize ?? 20,
      customerId: isCustomer ? +id! : undefined,
      leadId: !isCustomer ? +id! : undefined,
    };
    const res = await opportunityInCustomer(payload);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const onAddModalConfirm = async (values: IOpportunityRecord) => {
    setConfirmOpportunityLoading(true);
    const res = await opportunityAdd(values);
    setConfirmOpportunityLoading(false);
    if (res.code === 200) {
      message.success('Add Opportunity successfully!');
      getDataSource();
      setOpportunityModalOpen(false);
      setShowModal?.(false);
      publish(EVENT_LEAD_DETAIL_RELOAD);
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      valueType: 'select',
      ellipsis: {
        showTitle: false,
      },
      order: 6,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName} placement="top">
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Opportunity Status',
      dataIndex: 'opportunityStatus',
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: OpportunitiesStatusEnumText,
      order: 7,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Opportunity Status',
        mode: 'multiple',
        maxTagCount: 2,
      },
      render: (_, record) => {
        const status: OpportunitiesStatusEnum = record.opportunityStatus;
        const Content = (
          <Badge color={OpportunitiesStatusEnumColor[status]} text={status} />
        );
        return (
          <CustomTooltip title={Content}>
            <div className={styles.opportunityStatus}>{Content}</div>
          </CustomTooltip>
        );
      },
    },
    {
      title: 'BU',
      dataIndex: 'bu',
      ellipsis: { showTitle: false },
      valueType: 'select',
      valueEnum: BUEnumText,
      order: 9,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'BU',
        mode: 'multiple',
        maxTagCount: 2,
      },

      render: (_, record) => {
        return <CustomTooltip title={record.bu}>{record.bu}</CustomTooltip>;
      },
    },

    {
      title: 'BD/CAM PIC',
      dataIndex: 'bdUserRoleIdList',
      ellipsis: { showTitle: false },
      valueType: 'select',
      order: 8,

      render: (_, record) => {
        const { picType, picUserAliasName } = record;
        const content = `${picType}:${picUserAliasName}`;
        return <CustomTooltip title={content}>{content}</CustomTooltip>;
      },
    },
    {
      title: 'Potential Volume',
      dataIndex: 'potentialVolumeQuantity',
      order: 2,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Potential Volume', 'Potential Volume'],
      },
      render: (_, record) => {
        const { potentialVolumeQuantityPerMonth } = record;
        const str =
          potentialVolumeQuantityPerMonth ||
          potentialVolumeQuantityPerMonth === 0
            ? `${formatAmount(potentialVolumeQuantityPerMonth)}/M`
            : '';
        return <CustomTooltip title={str}>{str}</CustomTooltip>;
      },
    },

    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      order: 1,
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Creation Time Time Start', 'Creation Time Time End'],
      },
      render: (_, record) => {
        const formatData = dayjs(record.createdAt).format(
          'YYYY-MM-DD HH:mm:ss',
        );
        return <CustomTooltip title={formatData}>{formatData}</CustomTooltip>;
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 100,
      hideInTable: isCustomer
        ? !access[PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES_DETAIL]
        : !access[PermissionEnum.LEAD_DETAIL_OPPORTUNITIES_DETAIL],
      render: (_, record) => {
        return (
          <Space split={<Divider type="vertical" />} size="small">
            <Access
              key="detail"
              accessible={
                isCustomer
                  ? access[PermissionEnum.CUSTOMER_DETAIL_OPPORTUNITIES_DETAIL]
                  : access[PermissionEnum.LEAD_DETAIL_OPPORTUNITIES_DETAIL]
              }
            >
              <div
                className={styles.btn}
                onClick={() => {
                  history.push(
                    `${PATHS.OPPORTUNITIES_LIST_DETAIL}/${record.opportunityId}`,
                  );
                }}
              >
                <BarsOutlined />
                Detail
              </div>
            </Access>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getDataSource();
  }, []);

  useEffect(() => {
    setOpportunityModalOpen(showModal);
  }, [showModal]);

  return (
    <div className={styles.opportunityList}>
      <CustomTable
        rowKey={'opportunityId'}
        columns={columns}
        scroll={{ x: 1000 }}
        formRef={formRef}
        form={{
          name: 'opportunity-list',
        }}
        dataSource={originData?.list ?? []}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            getDataSource({ pageNum: page, pageSize: pageSize });
          },
        }}
        fixedSpin={false}
        loading={loading}
        toolBarRender={false}
        search={false}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      {opportunityModalOpen ? (
        <OpportunitiesAddModal
          open={opportunityModalOpen}
          onConfirm={onAddModalConfirm}
          customerName={customerName}
          leadName={leadName}
          modalProps={{
            maskClosable: false,
            okText: 'Confirm',
            onCancel: () => {
              setOpportunityModalOpen(false);
              setShowModal?.(false);
            },
          }}
          submitter={{
            submitButtonProps: {
              loading: confirmOpportunityLoading,
            },
          }}
        />
      ) : null}
    </div>
  );
};

export default CustomerDetailOpportunity;
