import { getLibraryRouteList, projectDetail } from '@/api/project';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { DEFAULT_PAGINATION } from '@/constants';
import { CountryRegionNameText } from '@/enums';
import { OPS_TYPE, StateContext } from '@/pages/project/Detail/store';
import LibraryModal from '@/pages/project/components/LibraryModal';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { useModel, useParams } from '@umijs/max';
import { Col, Row } from 'antd';
import { memo, useCallback, useContext, useRef, useState } from 'react';
import styles from './styles.less';

export default memo(function ProjectDetailRouteLibrary(props: {
  projectName: string;
  showAddModal: boolean;
  setShowAddModal: (b: boolean) => void;
}) {
  // @ts-ignore
  const { dispatch } = useContext(StateContext);
  const { initialState } = useModel('@@initialState');
  const countryId = initialState?.currentUser?.countryId;
  const { projectName, showAddModal, setShowAddModal } = props;
  const { id: projectId } = useParams();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();

  const getDataSource = async (params: any) => {
    const payload = {
      ...params,
      projectId: Number(projectId),
      pageNum: params.current,
      pageSize: params.pageSize,
    };
    delete payload.current;
    setLoading(true);
    const res = await getLibraryRouteList(payload);
    setLoading(false);

    if (res.code === 200) {
      setOriginData(res.data || []);
      return {
        data: res.data?.list ?? [],
        success: true,
        total: res.data?.total,
      };
    }
    return {
      data: [],
      success: false,
      total: 0,
    };
  };

  const RenderTitle = useCallback(({ name }: { name: string }) => {
    return (
      <div className={styles.column_title}>
        <div className={styles.column_title_name}>{name}</div>
        <div className={styles.column_title_list}>
          <Row>
            <Col span={8}>
              <div className={styles.column_title_label}>
                {CountryRegionNameText[countryId as number][0]}
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.column_title_label}>
                {CountryRegionNameText[countryId as number][1]}
              </div>
            </Col>
            <Col span={8}>
              <div className={styles.column_title_label}>
                {CountryRegionNameText[countryId as number][2]}
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }, []);

  const WaypointTitle = useCallback(({ name }: { name: string }) => {
    return (
      <div className={styles.column_title}>
        <div className={styles.column_title_name}>{name}</div>
        <div className={styles.column_title_list}>
          <Row gutter={12}>
            <Col span={24}>{name}</Col>
          </Row>
        </div>
      </div>
    );
  }, []);

  const columns: ProColumns[] = [
    {
      title: <RenderTitle name="Origin" />,
      dataIndex: 'originPadName',
      colSpan: 3,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 180,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.originPadName}>
            {record.originPadName}
          </CustomTooltip>
        );
      },
    },
    {
      title: <RenderTitle name="Origin" />,
      dataIndex: 'originSadName',
      colSpan: 0,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 180,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.originSadName}>
            {record.originSadName}
          </CustomTooltip>
        );
      },
    },
    {
      title: <RenderTitle name="Origin" />,
      dataIndex: 'originTadName',
      colSpan: 0,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 180,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.originTadName}>
            {record.originTadName}
          </CustomTooltip>
        );
      },
    },
    {
      title: <WaypointTitle name="Waypoint" />,
      dataIndex: 'wayPoint',
      hideInSearch: true,
      align: 'center',
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => (
        <CustomTooltip
          key={`wayPoint${record.createdAt}`}
          title={record.wayPoint}
          placement="top"
        >
          <div className={styles.commonText}>{record.wayPoint}</div>
        </CustomTooltip>
      ),
    },
    {
      title: <RenderTitle name="Destination" />,
      dataIndex: 'destinationPadName',
      colSpan: 3,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 180,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.destinationPadName}>
            {record.destinationPadName}
          </CustomTooltip>
        );
      },
    },
    {
      title: <RenderTitle name="Destination" />,
      dataIndex: 'destinationSadName',
      colSpan: 0,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 180,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.destinationSadName}>
            {record.destinationSadName}
          </CustomTooltip>
        );
      },
    },
    {
      title: <RenderTitle name="Destination" />,
      dataIndex: 'destinationTadName',
      colSpan: 0,
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 180,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.destinationTadName}>
            {record.destinationTadName}
          </CustomTooltip>
        );
      },
    },
  ];

  const tableListReload = () => {
    actionRef.current?.reload();
  };

  return (
    <div className={styles.projects}>
      <CustomTable
        noStyle
        actionRef={actionRef}
        columns={columns}
        headerTitle={null}
        bordered={true}
        scroll={{ x: 1300 }}
        // @ts-ignore
        request={async (params) => getDataSource(params)}
        pagination={{
          showSizeChanger: true,
          pageSize: originData.pageSize,
          total: originData.total,
        }}
        loading={loading}
        search={false}
        toolBarRender={false}
        form={{
          syncToUrl: false,
          syncToInitialValues: false,
        }}
      />
      {showAddModal ? (
        <LibraryModal
          bindingProject={{
            id: Number(projectId),
            name: projectName,
          }}
          hideModal={() => {
            setShowAddModal(false);
          }}
          refresh={async () => {
            tableListReload();
            const res = await projectDetail({ id: +projectId! });
            if (res.code === 200) {
              dispatch({
                type: OPS_TYPE.PROJECT_DETAIL,
                payload: {
                  data: res.data,
                },
              });
            }
          }}
        />
      ) : null}
    </div>
  );
});
