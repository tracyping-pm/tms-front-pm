import { materialFile } from '@/api/common';
import { cancelSignature, getSignatureList, remindSignature } from '@/api/tool';
import {
  ISignatureListItemCC,
  ISignatureListItemSigner,
} from '@/api/types/tool';
import CustomPopover from '@/components/CustomPopover';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { ItemType } from '@/components/TableDropdown';
import TableOperation from '@/components/TableOperation';
import {
  DEFAULT_PAGINATION,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
  SIGNATURE_STATUS_COLOR,
  SIGN_LIST_STATUS_COLOR,
} from '@/constants';
import { SignatureStatusEnum, SignatureStatusEnumText } from '@/enums';
import SignerAvatar from '@/pages/tools/ElectronicSignature/components/SignerAvatar';
import SignerProcess from '@/pages/tools/ElectronicSignature/components/SignerProcess';
import useUrlState from '@ahooksjs/use-url-state';
import {
  BellOutlined,
  DownloadOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
} from '@ant-design/icons';
import {
  ActionType,
  ProColumns,
  ProFormInstance,
} from '@ant-design/pro-components';
import { Access, history } from '@umijs/max';
import { App, Badge, Button } from 'antd';
import dayjs from 'dayjs';
import { default as lodash, uniqueId } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import { ReactComponent as DeleteIcon } from '../../../../public/svg/signature_delete_icon.svg';
import styles from './styles.less';

interface IBE_NEED {
  pageNum?: number;
  pageSize?: number;
  signingByMe?: boolean;
  name?: string;
  statusList?: string[];
  minCreatedAt?: string;
  maxCreatedAt?: string;
}
interface IFE_NEED extends IBE_NEED {
  scrollTop?: number;
}

const SignatureList = () => {
  const { modal, message } = App.useApp();
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterInitiator, setFilterInitiator] = useState<boolean>(false);
  const [downloadPending, setDownloadPending] = useState<boolean>(false);

  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType>();
  const needSignRef = useRef<boolean>(false);
  const activeRecordKeyRef = useRef<number | undefined>(undefined);
  const [, setUrlState] = useUrlState();

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

  const getDataSource = async (BE_NEED: IBE_NEED) => {
    setLoading(true);
    const res = await getSignatureList(BE_NEED).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };
  // const getDataSource = async (value: any) => {
  //   setLoading(true);
  //   const res = await getSignatureList({
  //     name: value?.name,
  //     signingByMe: needSignRef.current,
  //     pageNum: value?.current,
  //     pageSize: value?.pageSize,
  //     statusList: value?.status,
  //     minCreatedAt: value?.createdAt
  //       ? dayjs(value?.createdAt?.[0])
  //           .startOf('day')
  //           .format('YYYY-MM-DD HH:mm:ss')
  //       : undefined,
  //     maxCreatedAt: value?.createdAt
  //       ? dayjs(value?.createdAt?.[1])
  //           .endOf('day')
  //           .format('YYYY-MM-DD HH:mm:ss')
  //       : undefined,
  //   });
  //   setLoading(false);
  //   if (res.code === 200) {
  //     setOriginData(res.data);
  //     const list = res.data?.list ?? [];
  //     return {
  //       data: [...list],
  //       success: true,
  //       total: res.data?.total,
  //     };
  //   }
  //   return {
  //     data: [],
  //     success: false,
  //     total: 0,
  //   };
  // };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;

    const FE_NEED: IFE_NEED = { pageNum, pageSize };
    const BE_NEED: IBE_NEED = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();

    if (values.name) {
      lodash.set(FE_NEED, 'name', values.name);
      lodash.set(BE_NEED, 'name', values.name);
    }

    lodash.set(FE_NEED, 'signingByMe', needSignRef.current);
    lodash.set(BE_NEED, 'signingByMe', needSignRef.current);

    if (values.status) {
      lodash.set(FE_NEED, 'statusList', values.status);
      lodash.set(BE_NEED, 'statusList', values.status);
    }

    if (values.createdAt) {
      const [start, end] = values.createdAt;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD HH:mm:ss') : undefined;

      lodash.set(FE_NEED, 'minCreatedAt', startTime);
      lodash.set(FE_NEED, 'maxCreatedAt', endTime);

      lodash.set(BE_NEED, 'minCreatedAt', startTime);
      lodash.set(BE_NEED, 'maxCreatedAt', endTime);
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
      name: FE_NEED.name,
      status: FE_NEED.statusList,
      createdAt: [
        FE_NEED.minCreatedAt ? dayjs(FE_NEED.minCreatedAt) : undefined,
        FE_NEED.maxCreatedAt ? dayjs(FE_NEED.maxCreatedAt) : undefined,
      ],
      signingByMe: FE_NEED.signingByMe,
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
  const toolBarRender = () => [
    <Access key="Create" accessible={true}>
      <Button
        type="primary"
        onClick={() => {
          saveScrollTop();
          history.replace(PATHS.TOOL_SIGNATURES_CREATE);
        }}
      >
        Create Signature
      </Button>
    </Access>,
  ];

  const cancel = async (id: number) => {
    modal.confirm({
      title: 'Cancel Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to cancel this Signature?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await cancelSignature({ id });
        if (res.code === 200) {
          message.success('Cancel successfully!');
          actionRef?.current?.reload();
        }
      },
      onCancel() {
        // do nothing
      },
    });
  };

  const remind = async (id: number) => {
    modal.confirm({
      title: 'Send Reminder',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to send an email to notify unsigned signers',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await remindSignature({ id });
        if (res.code === 200) {
          message.success('Remind successfully!');
          actionRef?.current?.reload();
        }
      },
      onCancel() {
        // do nothing
      },
    });
  };

  const downLoad = async (
    materialId: number,
    driveFileId: string,
    fileName: string,
  ) => {
    setDownloadPending(true);
    const payload = {
      materialId,
      driveFileId,
      fileName,
    };
    const res = await materialFile(payload);
    setDownloadPending(false);
    if (res.code === 200) {
      const link = document.createElement('a');
      link.href = res.data;
      link.download = `${fileName}`;

      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  const onReset = () => {
    setFilterInitiator(false);
    needSignRef.current = false;
    setUrlState({ extra: undefined });
    // 自动触发 onSubmit
  };

  const columns: ProColumns[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 240,
      formItemProps: {
        label: null,
      },
      order: 4,
      ellipsis: { showTitle: false },
      fieldProps: {
        placeholder: ['Name'],
        style: {
          width: `220px`,
        },
      },
      render: (_, record) => {
        return <CustomTooltip title={record.name}>{record.name}</CustomTooltip>;
      },
    },
    {
      title: 'Signer',
      dataIndex: 'signer',
      hideInSearch: true,
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        return (
          <CustomPopover
            key={`signer_${record.id}`}
            autoAdjustOverflow={true}
            content={<SignerProcess signerList={record.signerList} />}
          >
            <div className={styles.signer}>
              {record.signerList?.map(
                (item: ISignatureListItemSigner, index: number) => {
                  if (index <= 3) {
                    return (
                      <SignerAvatar
                        key={`${item.id}_${index}`}
                        name={item?.name?.slice(0, 1)?.toUpperCase()}
                        bgColor={item.mainColor}
                        color={'#fff'}
                        showBadge={!!item.status}
                        badgeColor={SIGNATURE_STATUS_COLOR[item.status]}
                      />
                    );
                  }
                  if (index === 4) {
                    return (
                      <SignerAvatar
                        key={`${item.id}_${index}`}
                        name={`+${record.signerList?.length - 4}`}
                        bgColor="rgba(255, 216, 191, 1)"
                        color="rgba(250, 84, 28, 1)"
                      />
                    );
                  }
                  return null;
                },
              )}
            </div>
          </CustomPopover>
        );
      },
    },
    {
      title: 'CC',
      dataIndex: 'cc',
      hideInSearch: true,
      width: 200,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        return (
          <CustomPopover
            key={`cc_${record.id}`}
            autoAdjustOverflow={true}
            content={
              <SignerProcess
                signerList={record.ccList}
                showStatus={false}
                showLine={false}
                showBadge={false}
              />
            }
          >
            <div className={styles.signer}>
              {record.ccList?.map(
                (item: ISignatureListItemCC, index: number) => {
                  if (index <= 3) {
                    return (
                      <SignerAvatar
                        key={`${item.id}_${index}`}
                        name={item?.name?.slice(0, 1)?.toUpperCase()}
                        bgColor={item.mainColor}
                        color={'#fff'}
                      />
                    );
                  }
                  if (index === 4) {
                    return (
                      <SignerAvatar
                        key={`${item.id}_${index}`}
                        name={`+${record.ccList?.length - 4}`}
                        bgColor="rgba(255, 216, 191, 1)"
                        color="rgba(250, 84, 28, 1)"
                      />
                    );
                  }
                  return null;
                },
              )}
            </div>
          </CustomPopover>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      ellipsis: {
        showTitle: false,
      },
      order: 3,
      valueType: 'select',
      valueEnum: SignatureStatusEnumText,
      formItemProps: {
        label: null,
      },
      fieldProps: {
        mode: 'multiple',
        maxTagCount: 'responsive',
        placeholder: 'Status',
        style: {
          width: `210px`,
        },
      },
      width: 150,
      render: (_, record) => {
        const status = record.status;
        const Content = (
          <Badge color={SIGN_LIST_STATUS_COLOR[status]} text={status} />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Initiator',
      dataIndex: 'createdByName',
      renderFormItem: () => (
        <Button
          type={filterInitiator ? 'primary' : 'default'}
          onClick={() => {
            setFilterInitiator(!filterInitiator);
            needSignRef.current = !needSignRef.current;
            actionRef.current?.reload();
          }}
        >
          I need to Sign
        </Button>
      ),
      order: 1,
      width: 150,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        const Content = (
          <div>
            {record.createdByName}
            {record.oneself ? (
              <span style={{ color: '#009688' }}>(me)</span>
            ) : null}
          </div>
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Initiation Time',
      dataIndex: 'createdAt',
      formItemProps: {
        label: null,
      },
      order: 2,
      valueType: 'dateRange',
      fieldProps: {
        placeholder: ['Initiation Time', 'Initiation Time'],
        style: {
          width: `320px`,
        },
      },
      width: 180,
      ellipsis: { showTitle: false },
      render: (_, record) => {
        return (
          <CustomTooltip title={record.createdAt}>
            {record.createdAt}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Operate',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      align: 'center',
      width: 220,
      render: (_, record) => {
        const operationList = [
          {
            key: 'view',
            title: 'View',
            icon: <EyeOutlined />,
            label: 'View',
            loading: false,
          },
          record.oneself
            ? record.status === SignatureStatusEnum.PENDING
              ? {
                  key: 'remind',
                  title: 'Remind',
                  icon: <BellOutlined />,
                  label: 'Remind',
                  loading: false,
                }
              : null
            : {
                key: 'download',
                title: 'Download',
                icon: <DownloadOutlined />,
                label: 'Download',
                loading:
                  downloadPending && activeRecordKeyRef.current === record.id,
              },
          record.oneself
            ? {
                key: 'download',
                title: 'Download',
                icon: <DownloadOutlined />,
                label: 'Download',
                loading:
                  downloadPending && activeRecordKeyRef.current === record.id,
              }
            : null,
          record.oneself && record.status === SignatureStatusEnum.PENDING
            ? {
                key: 'cancel',
                title: 'Cancel',
                icon: <DeleteIcon />,
                label: 'Cancel',
                loading: false,
              }
            : null,
        ].filter(Boolean) as ItemType[];
        return (
          <TableOperation
            key={uniqueId()}
            list={operationList.slice()}
            onTrigger={async (item: ItemType) => {
              activeRecordKeyRef.current = record.id;
              if (item.key === 'view') {
                const url = `${PATHS.SIGNATURES_DETAIL}?id=${record.idAES}&email=${record.emailAES}`;
                window.open(url, '_blank');
                return Promise.resolve();
              } else if (item.key === 'cancel') {
                await cancel(record.id);
                return Promise.resolve();
              } else if (item.key === 'remind') {
                await remind(record.id);
                return Promise.resolve();
              } else if (item.key === 'download') {
                await downLoad(
                  record.materialId,
                  record.driveFileId,
                  record.name,
                );
                return Promise.resolve();
              }
            }}
          />
        );
      },
    },
  ];

  useEffect(() => {
    doFirstQuery();
  }, []);

  return (
    <>
      <CustomTable
        columns={columns}
        scroll={{ x: 1400 }}
        actionRef={actionRef}
        formRef={formRef}
        dataSource={originData.list}
        pagination={{
          showSizeChanger: true,
          current: originData.pageNum,
          pageSize: originData.pageSize,
          total: originData.total,
          onChange: (page: number, pageSize: number) => {
            onPaginationChange({ pageNum: page, pageSize: pageSize });
          },
        }}
        loading={loading}
        toolBarRender={toolBarRender}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
    </>
  );
};

export default SignatureList;
