import { vendorCrewUnbind, vendorDetailCrewList } from '@/api/crew';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION, LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import { DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  CrewStatusEnum,
  CrewStatusEnumColor,
  CrewStatusEnumText,
  CrewTypeEnum,
  CrewTypeEnumText,
  TruckTransportationStatusEnum,
  TruckTransportationStatusEnumColor,
  TruckTransportationStatusEnumText,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import useUrlState from '@ahooksjs/use-url-state';
import { BarsOutlined, StopOutlined } from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, history, useAccess, useParams } from '@umijs/max';
import { Badge, Button, message, Popconfirm, Space } from 'antd';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import CrewModal from '../../Crew/components/CrewModal';

interface IBE_NEED {
  pageNum: number;
  pageSize: number;
  id: number;
}

const CrewList = (props: {
  showModal: boolean;
  setShowModal: (b: boolean) => void;
  detailRefresh: boolean;
  setDetailRefresh: (b: boolean) => void;
}) => {
  const { showModal, setShowModal } = props;
  const access = useAccess();
  const { id: vendorId } = useParams();
  const actionRef = useRef<ActionType>();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);

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

  const getDataSource = async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const payload = {
      ...BE_NEED,
    };
    const res = await vendorDetailCrewList(payload);
    setLoading(false);
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const unbindHandle = async (item: { id: number }) => {
    const res = await vendorCrewUnbind({
      vendorId: Number(vendorId),
      crewId: item.id,
    });
    if (res.code === 200) {
      message.success(`Unbind successfully!`);
      getDataSource({ pageNum: 1, pageSize: 20, id: +vendorId! });
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Crew Name',
      dataIndex: 'name',
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },

      render: (_, record) => {
        return (
          <CustomTooltip
            key={`name${record.id}`}
            title={record.name}
            placement="top"
          >
            {record.name}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Accreditation Status',
      dataIndex: 'status',
      ellipsis: { showTitle: false },
      width: 180,
      valueType: 'select',
      valueEnum: CrewStatusEnumText,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Accreditation Status',
      },
      render: (_, record) => {
        const status: CrewStatusEnum = record.status;
        const Content = (
          <Badge color={CrewStatusEnumColor[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Transportation Status',
      dataIndex: 'transportationStatus',
      valueEnum: TruckTransportationStatusEnumText,
      valueType: 'select',
      width: 160,
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Transportation Status',
      },
      render: (_, record) => {
        const transportationStatus: TruckTransportationStatusEnum =
          record.transportationStatus;
        const Content = (
          <Badge
            color={TruckTransportationStatusEnumColor[transportationStatus]}
            text={transportationStatus}
          />
        );
        return (
          <CustomTooltip title={Content}>
            {transportationStatus ? Content : '-'}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 140,
      valueEnum: CrewTypeEnumText,
      valueType: 'select',
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
        const { driverFlag, helperFlag } = record;
        const driverStr = driverFlag
          ? CrewTypeEnumText[CrewTypeEnum.DRIVER]
          : '';
        const helperStr = helperFlag
          ? CrewTypeEnumText[CrewTypeEnum.HELPER]
          : '';
        const str =
          !!driverStr && !!helperStr
            ? `${driverStr},${helperStr}`
            : driverStr
              ? driverStr
              : helperStr;
        return (
          <CustomTooltip key={`type${record.id}`} title={str}>
            {str}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'ID Number',
      dataIndex: 'idNumber',
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },

      render: (_, record) => {
        return (
          <CustomTooltip
            key={`idNumber${record.id}`}
            title={record.idNumber}
            placement="top"
          >
            {record.idNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'License Number',
      dataIndex: 'licenseNumber',
      valueType: 'select',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },

      render: (_, record) => {
        return (
          <CustomTooltip
            key={`licenseNumber${record.id}`}
            title={record.licenseNumber}
            placement="top"
          >
            {record.licenseNumber}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Contact',
      dataIndex: 'phoneNum',
      ellipsis: { showTitle: false },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },

      render: (_, record) => {
        return (
          <CustomTooltip key={`phoneNum${record.id}`} title={record.phoneNum}>
            {record.phoneCode + ' ' + record.phoneNum}
          </CustomTooltip>
        );
      },
    },

    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 160,
      hideInTable:
        !access[PermissionEnum.VENDOR_DETAIL_CREW_DETAIL] &&
        !access[PermissionEnum.VENDOR_DETAIL_CREW_UNBIND],
      render: (_, record) => {
        return (
          <Space>
            <Access
              key="detail"
              accessible={access[PermissionEnum.VENDOR_DETAIL_CREW_DETAIL]}
            >
              <Button
                icon={<BarsOutlined />}
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  saveScrollTop();
                  history.push(`${PATHS.VENDOR_CREW_DETAIL}/${record.id}`);
                }}
              >
                Details
              </Button>
            </Access>
            <Access
              key="Unbind"
              accessible={access[PermissionEnum.VENDOR_DETAIL_CREW_UNBIND]}
            >
              <Popconfirm
                title="Are you sure to unbind this crew?"
                onConfirm={() => unbindHandle(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  color="primary"
                  icon={<StopOutlined />}
                  variant="link"
                  style={{ padding: 0 }}
                >
                  Unbind
                </Button>
              </Popconfirm>
            </Access>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getDataSource({ pageNum: 1, pageSize: 20, id: +vendorId! });
  }, []);

  return (
    <>
      <CustomTable
        form={{
          name: 'crew-list',
        }}
        actionRef={actionRef}
        columns={columns}
        scroll={{ x: 1400 }}
        formRef={formRef}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            getDataSource({
              pageNum: page,
              pageSize: pageSize,
              id: +vendorId!,
            });
          },
        }}
        search={false}
        loading={loading}
        toolBarRender={false}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      {showModal ? (
        <CrewModal
          vendorId={+vendorId!}
          refresh={() => {
            getDataSource({ pageNum: 1, pageSize: 20, id: +vendorId! });
          }}
          hideModal={() => {
            setShowModal(false);
          }}
        />
      ) : null}
    </>
  );
};
export default CrewList;
