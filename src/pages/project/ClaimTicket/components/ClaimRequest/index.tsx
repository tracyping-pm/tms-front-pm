import { ossGetPreviewUrl } from '@/api-uam/oss';
import { claimRequestList } from '@/api/claim';
import { IClaimRequestList } from '@/api/types/claims';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { splitFileName } from '@/components/CustomUpload/fileSupport';
import FuzzySelector from '@/components/FuzzySelector';
import IframeModal, {
  IIFrameModalState,
  initialIframeModalState,
} from '@/components/IframeModal';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import { IDocument } from '@/components/OssUpload/types';
import {
  BELONG_IMG_EXTS,
  DEFAULT_PAGINATION,
  ES_DTO_CLASS,
  LAYOUT_HEADER_HEIGHT,
  PATHS,
} from '@/constants';
import { DATE_WIDTH, DEFAULT_WIDTH } from '@/constants/table-filter';
import {
  ClaimRequestStatusEnum,
  ClaimRequestStatusEnumColor,
  ClaimRequestStatusEnumText,
  CountryCurrencyEnumText,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import { formatAmount, openNewTag } from '@/utils/utils';
import useUrlState from '@ahooksjs/use-url-state';
import { PaperClipOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { useAccess, useModel } from '@umijs/max';
import { useSetState } from 'ahooks';
import { Badge, Button, Spin } from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { default as lodash } from 'lodash';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import RequestDetailModal from './Detail';
import styles from './index.less';

const ClaimRequest: React.FC = () => {
  const access = useAccess();
  // const { message } = App.useApp();
  const { initialState: userInfo } = useModel('@@initialState');
  const countryId = userInfo?.currentUser?.countryId;
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState<boolean>(false);
  const [previewPendingId, setPreviewPendingId] = useState<number | string>('');
  const [, setUrlState] = useUrlState();
  const [originImageSrc, setOriginImageSrc] = useState<string[]>([]);
  const [iframeModalState, setIframeModalState] =
    useSetState<IIFrameModalState>(initialIframeModalState);
  const formRef = useRef<ProFormInstance>();
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [claimRequestDetailModalOpen, setClaimRequestDetailModalOpen] =
    useState<boolean>(false);
  const [claimRequestDetailId, setClaimRequestDetailId] = useState<number>(0);

  const BELONG_IMG_LIST = BELONG_IMG_EXTS.map((item) => item.split('.')[1]);

  const getDataSource = async (BE_NEED: IClaimRequestList) => {
    setLoading(true);
    const res = await claimRequestList(BE_NEED);
    setLoading(false);

    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  // 点击搜索按钮触发
  const onSubmit = async (params: any) => {
    const { pageNum = 1, pageSize = 20 } = params;

    const BE_NEED: IClaimRequestList = { pageNum, pageSize };

    const values = formRef.current?.getFieldsValue();

    if (values.claimRequestNo) {
      const _value = values.claimRequestNo?.id;
      lodash.set(BE_NEED, 'claimRequestId', _value);
    }

    if (values.claimRequestStatus) {
      lodash.set(BE_NEED, 'claimRequestStatus', values.claimRequestStatus);
    }
    if (values.claimant) {
      const _value = values.claimant?.id;
      lodash.set(BE_NEED, 'claimantId', _value);
    }
    if (values.creator) {
      const _value = values.creator?.id;
      lodash.set(BE_NEED, 'creatorId', _value);
    }
    if (values.splitTicketNum) {
      const _value = values.splitTicketNum?.id;
      lodash.set(BE_NEED, 'claimId', _value);
    }

    if (values.createdAt) {
      const [start, end] = values.createdAt;
      const startTime = start
        ? start?.format?.('YYYY-MM-DD 00:00:00')
        : undefined;
      const endTime = end ? end?.format?.('YYYY-MM-DD 23:59:59') : undefined;

      lodash.set(BE_NEED, 'creationTimeStart', startTime);
      lodash.set(BE_NEED, 'creationTimeEnd', endTime);
    }

    // BE_NEED
    getDataSource(BE_NEED);
  };

  const doFirstQuery = async () => {
    const parsed = queryString.parse(location.search);

    const claimRequestId = parsed?.id ? +parsed.id : undefined;
    const claimRequestNo = parsed?.claimRequestNo;

    console.log({ name: claimRequestNo, id: claimRequestId });

    formRef.current?.setFieldsValue({
      claimRequestNo: claimRequestNo
        ? { name: claimRequestNo, id: claimRequestId }
        : undefined,
    });
    await getDataSource({
      pageNum: 1,
      pageSize: 20,
      claimRequestId: claimRequestId,
    });
  };

  const onReset = () => {
    setUrlState({ extra: undefined });

    // 自动触发 onSubmit
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

  const handlePreviewImg = async (documentId: number) => {
    setPreviewPendingId(documentId);
    const res = await ossGetPreviewUrl({ documentId }).finally(() => {
      setPreviewPendingId('');
    });
    if (res.code === 200) {
      setOriginImageSrc([res.data]);
      setPreviewVisible(true);
    }
  };

  const handlePreviewOssFile = async (documentId: number) => {
    setPreviewPendingId(documentId);
    const res = await ossGetPreviewUrl({ documentId }).finally(() => {
      setPreviewPendingId('');
    });
    if (res.code === 200) {
      setIframeModalState({
        url: res.data,
        open: true,
      });
    }
  };

  const onPreview = (item: IDocument) => {
    const { ext } = splitFileName(item?.originalFileName);
    const isBelongImg = BELONG_IMG_LIST.includes(ext);
    if (isBelongImg) {
      handlePreviewImg(item?.documentId);
    } else {
      handlePreviewOssFile(item?.documentId);
    }
  };

  const columns: ProColumns[] = [
    {
      title: 'Claim Request No.',
      dataIndex: 'claimRequestNo',
      valueType: 'select',
      width: 160,
      order: 6,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{
            placeholder: 'Claim Request No.',
          }}
          request={{
            field: 'claimRequestNo',
            esDtoClass: ES_DTO_CLASS.CLAIM_REQUEST,
            type: FieldQueryHighlightTypeEnum.COUNTRY,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.claimRequestNo}>
            {access[PermissionEnum.CLAIM_REQUEST_Detail] ? (
              <Button
                color="primary"
                variant="link"
                style={{ padding: 0 }}
                onClick={() => {
                  setClaimRequestDetailModalOpen(true);
                  setClaimRequestDetailId(record.id);
                }}
              >
                {record.claimRequestNo}
              </Button>
            ) : (
              record.claimRequestNo
            )}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Claimant',
      dataIndex: 'claimant',
      valueType: 'select',
      width: 220,
      order: 4,
      ellipsis: {
        showTitle: false,
      },
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{
            placeholder: 'Claimant',
          }}
          request={{
            field: 'customerName',
            esDtoClass: ES_DTO_CLASS.CUSTOMER,
            type: FieldQueryHighlightTypeEnum.USER_ROLE,
            uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM_REQUEST,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.claimant}>
            {record.claimant}
          </CustomTooltip>
        );
      },
    },
    {
      title: `Requested Amount (${CountryCurrencyEnumText[countryId as number]})`,
      dataIndex: 'totalClaimAmount',
      hideInSearch: true,
      align: 'right',
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.totalClaimAmount} placement="top">
            {formatAmount(record.totalClaimAmount)}
          </CustomTooltip>
        );
      },
    },

    {
      title: 'Proof',
      dataIndex: 'claimRequestProof',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
      render: (_, record) => {
        const documentList = record.claimRequestProof;
        const content = (documentListLen: number) => {
          return documentList?.length > 0 ? (
            <div>
              {documentList.slice(0, documentListLen).map((item: any) => {
                return (
                  <Spin
                    key={item?.id}
                    spinning={previewPendingId === item?.documentId}
                  >
                    <div
                      className={cls(styles.proofUrl, 'ellipsis')}
                      onClick={() => {
                        onPreview(item);
                      }}
                    >
                      <PaperClipOutlined />
                      {item?.fileName}
                    </div>
                  </Spin>
                );
              })}
            </div>
          ) : (
            '-'
          );
        };
        return (
          <div>
            <CustomTooltip
              rootClassName={styles.requestTool}
              title={content(documentList?.length)}
            >
              {content(3)}
              {documentList?.length > 3 ? '...' : ''}
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'Split Ticket',
      dataIndex: 'splitTicketNum',
      ellipsis: {
        showTitle: false,
      },
      order: 1,
      width: 150,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{
            placeholder: 'Ticket Number',
          }}
          request={{
            field: 'ticketNumber',
            esDtoClass: ES_DTO_CLASS.CLAIM_TICKET,
            type: FieldQueryHighlightTypeEnum.None,
            uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM,
            uniqueLogicParams: { ticketType: 1 },
          }}
        />
      ),
      render: (_, record) => {
        const splitTicketNum = record.splitTicketNum;
        const content = (len: number) => {
          return splitTicketNum?.length > 0 ? (
            <div>
              {splitTicketNum.slice(0, len).map((item: any) => {
                return access[PermissionEnum.CLAIM_TICKET_DETAIL] ? (
                  <div
                    key={item.claimId}
                    className={cls(styles.proofUrl)}
                    onClick={() => {
                      openNewTag(
                        `${PATHS.CLAIM_TICKET_LIST_DETAIL}?id=${item.claimId}`,
                      );
                    }}
                  >
                    {item?.claimNum}
                  </div>
                ) : (
                  <div key={item.claimId}>{item?.claimNum}</div>
                );
              })}
            </div>
          ) : (
            '-'
          );
        };
        return (
          <div>
            <CustomTooltip
              rootClassName={styles.requestTool}
              title={content(splitTicketNum?.length)}
            >
              {content(3)}
              {splitTicketNum?.length > 3 ? '...' : ''}
            </CustomTooltip>
          </div>
        );
      },
    },
    {
      title: 'AR statement No.',
      dataIndex: 'statementNumber',
      hideInSearch: true,
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      render: (_, record) => {
        const statementNumber = record.statementNumber;
        const statementId = record.statementId;
        const content = () => {
          return access[PermissionEnum.CUSTOMER_STATEMENT_DETAIL] ? (
            <div
              className={cls(styles.proofUrl, 'ellipsis')}
              onClick={() => {
                openNewTag(
                  `${PATHS.BILLING_CUSTOMER_STATEMENT_DETAIL}/${statementId}`,
                );
              }}
            >
              {statementNumber}
            </div>
          ) : (
            <div>{statementNumber}</div>
          );
        };
        return (
          <div>
            <CustomTooltip rootClassName={styles.requestTool} title={content()}>
              {content()}
            </CustomTooltip>
          </div>
        );
      },
    },

    {
      title: 'Creation Time',
      dataIndex: 'createdAt',
      width: 140,
      order: 2,
      ellipsis: {
        showTitle: false,
      },
      valueType: 'dateRange',
      formItemProps: {
        label: null,
        style: {
          width: `${DATE_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: ['Creation Time Start', 'Creation Time End'],
      },
      render: (_, record) => {
        return (
          <CustomTooltip
            title={dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          >
            {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      order: 3,
      ellipsis: {
        showTitle: false,
      },
      width: 120,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      renderFormItem: () => (
        <FuzzySelector
          fieldProps={{
            placeholder: 'Creator',
          }}
          customProps={{
            isUAM: true,
          }}
          request={{
            field: 'aliasName',
            esDtoClass: ES_DTO_CLASS.USER,
            type: FieldQueryHighlightTypeEnum.USER_ROLE,
          }}
        />
      ),
      render: (_, record) => {
        return (
          <CustomTooltip title={record.creator} placement="top">
            {record.creator}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Requestor Status',
      dataIndex: 'claimRequestStatus',
      valueType: 'select',
      valueEnum: ClaimRequestStatusEnumText,
      ellipsis: {
        showTitle: false,
      },
      order: 5,
      formItemProps: {
        label: null,
        style: {
          width: `${DEFAULT_WIDTH}px`,
        },
      },
      fieldProps: {
        placeholder: 'Requestor Status',
      },
      width: 120,
      render: (_, record) => {
        const status: ClaimRequestStatusEnum = record.claimRequestStatus;

        const Content = (
          <Badge
            color={ClaimRequestStatusEnumColor[status]}
            text={ClaimRequestStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
  ];

  useEffect(() => {
    // 首次进入拿 URL 上的参数
    doFirstQuery();
  }, []);

  return (
    <>
      <CustomTable
        className={styles.claimRequestList}
        columns={columns}
        scroll={{ x: 1600 }}
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
        toolBarRender={false}
        onSubmit={onSubmit}
        onReset={onReset}
        manualRequest
        filterSticky={{ top: LAYOUT_HEADER_HEIGHT }}
      />
      {claimRequestDetailModalOpen ? (
        <RequestDetailModal
          id={claimRequestDetailId}
          open={claimRequestDetailModalOpen}
          onCancel={() => setClaimRequestDetailModalOpen(false)}
          onRefresh={() => {
            doFirstQuery();
          }}
        />
      ) : null}
      <ImagePreviewGroup
        visible={previewVisible}
        items={originImageSrc!}
        index={0}
        onClose={() => setPreviewVisible(false)}
      />
      <IframeModal
        url={iframeModalState.url}
        open={iframeModalState.open}
        onCancel={() => setIframeModalState({ open: false })}
      />
    </>
  );
};

export default ClaimRequest;
