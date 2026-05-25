import { exportStatementClaim, statementClaimList } from '@/api/billing';
import {
  IClaimSubtaskItem,
  IStatementClaimItem,
  IStatementClaimListResp,
} from '@/api/types/billing';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { LAYOUT_HEADER_HEIGHT, PATHS } from '@/constants';
import { openNewTag } from '@/utils/utils';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { history, useParams } from '@umijs/max';
import { Button } from 'antd';
import cls from 'classnames';
import { uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';

const ClaimList: React.FC = () => {
  //   const access = useAccess();
  const { id: statementId } = useParams();
  const [columns, setColumns] = useState<ProColumns[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [originData, setOriginData] = useState<IStatementClaimListResp>({
    headers: [],
    pageData: { list: [] },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [exportAllLoading, setExportAllLoading] = useState<boolean>(false);
  const formRef = useRef<ProFormInstance>();

  const getDataSource = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const payload = {
      pageNum: params?.pageNum ?? 1,
      pageSize: params?.pageSize ?? 20,
      id: Number(statementId),
    };
    setLoading(true);
    const res = await statementClaimList(payload).finally(() => {
      setLoading(false);
    });

    if (res.code === 200) {
      setOriginData(res.data);
      const {
        headers,
        pageData: { list },
      } = res.data;
      // 转换 columns
      const _columns = headers.map((header, index) => {
        const fixed =
          index === 0 ? 'left' : index === headers.length - 1 ? 'right' : false;
        return {
          key: header,
          title: header,
          dataIndex: header,
          width: 200,
          ellipsis: {
            showTitle: false,
          },
          fixed,
          render: (_: any, record: any) => {
            const value: IStatementClaimItem = record[header];

            // waybillNumber 和 subtaskLink 需要特殊处理
            if (header === 'Waybill Number') {
              return (
                <div
                  className={styles.linkText}
                  onClick={() => {
                    // 跳转到 waybill 详情页
                    openNewTag(
                      `${PATHS.WAYBILL_LIST_DETAIL}/${value.waybillId}`,
                    );
                  }}
                >
                  {value.waybillNumber}
                </div>
              );
            }

            if (header === 'Subtask Link') {
              return value?.length > 0
                ? value.map((subtaskLink: IClaimSubtaskItem) => (
                    <div
                      className={styles.linkText}
                      key={subtaskLink.procInstId}
                      onClick={() => {
                        // 跳转到 subtask 详情页
                        openNewTag(
                          `${PATHS.SUBTASK_LIST_DETAIL}/${subtaskLink.procInstId}`,
                        );
                      }}
                    >
                      {subtaskLink.subtaskName}
                    </div>
                  ))
                : '-';
            }
            return <CustomTooltip title={value}>{value}</CustomTooltip>;
          },
        };
      });
      setColumns(_columns as ProColumns[]);

      // 转换 dataSource
      const _dataSource = list?.map((row) => {
        const obj: any = {
          id: uniqueId(),
        };
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      setDataSource(_dataSource ?? []);

      console.log({ columns: _columns, dataSource: _dataSource });
    }
  };

  const onExportAll = async () => {
    setExportAllLoading(true);
    const res = await exportStatementClaim({ id: Number(statementId) }).finally(
      () => {
        setExportAllLoading(false);
      },
    );
    if (res.code === 200) {
      window.open(res.data);
    }
  };

  useEffect(() => {
    getDataSource({ pageNum: 1, pageSize: 20 });
  }, []);

  return (
    <div className={cls(styles.claims)}>
      <div className={cls(styles.toolbar)}>
        <div className="left">
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
            Back
          </Button>
        </div>
        <div className="right">
          <Button
            disabled={dataSource.length === 0}
            loading={exportAllLoading}
            onClick={onExportAll}
          >
            Export
          </Button>
        </div>
      </div>
      <CustomTable
        columns={columns}
        scroll={{ x: 1000 }}
        formRef={formRef}
        dataSource={dataSource}
        pagination={{
          showSizeChanger: true,
          current: originData.pageData.pageNum,
          pageSize: originData.pageData.pageSize,
          total: originData.pageData.total,
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
    </div>
  );
};

export default ClaimList;
