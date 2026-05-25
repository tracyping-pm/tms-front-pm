import { SyncFromSheetData, SyncFromSheetDataItem } from '@/api/types/project';
import CustomTooltip from '@/components/CustomTooltip';
import { formatAmount } from '@/utils/utils';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Modal, Tabs, TabsProps } from 'antd';
import { memo, useMemo, useState } from 'react';
import { ReactComponent as SyncSheetIcon } from '../../../../public/svg/sync_sheet_icon.svg';
import styles from './common.less';

const TabChildren = ({ data }: { data: SyncFromSheetDataItem }) => {
  return (
    <div className={styles.tab}>
      <div
        className={styles.tab_text}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <SyncSheetIcon style={{ marginBottom: '2px', marginRight: '5px' }} />
        Total number of Routes: {formatAmount(data?.totalNumber) || 0}
      </div>

      <div
        className={styles.tab_text_se}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <SyncSheetIcon style={{ marginBottom: '2px', marginRight: '5px' }} />
        Total number of Routes with correct route information:
        {formatAmount(data?.correctNumber) || 0}
      </div>

      <div
        className={styles.tab_text_th}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <SyncSheetIcon style={{ marginBottom: '2px', marginRight: '5px' }} />
        Total number of Routes with complete data synchronization:
        {formatAmount(data?.completeNumber) || 0}
      </div>

      <div
        className={styles.tab_text_th}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <SyncSheetIcon style={{ marginBottom: '2px', marginRight: '5px' }} />
        The total number of Routes with incomplete data synchronization:
        {formatAmount(data?.incompleteNumber)}
        <CustomTooltip
          title={
            'The route information recorded here is correct and can hit the route library or the newly created route. But these routes were skipped because of other Mileage Range errors, or not all imported because some prices were wrong'
          }
          placement="top"
        >
          <QuestionCircleOutlined
            style={{ color: '#838CA1', marginLeft: 16 }}
          />
        </CustomTooltip>
      </div>
      {data?.incompleteNumber ? (
        <>
          <div className={styles.tab_text_fo}>Route number (row of Sheet):</div>
          <div className={styles.tab_text_fo}>
            {data?.incompleteList?.join(',')}
          </div>
        </>
      ) : null}

      <div
        className={styles.tab_text_se}
        style={
          data?.incorrectNumber
            ? { display: 'flex', alignItems: 'center' }
            : {
                marginBottom: 0,
                display: 'flex',
                alignItems: 'center',
              }
        }
      >
        <SyncSheetIcon style={{ marginBottom: '2px', marginRight: '5px' }} />
        Total number of Routes with incorrect route information:
        {formatAmount(data?.incorrectNumber)}
        <CustomTooltip
          title={
            'The routes recorded here are routes with incorrect route information. These routes cannot be used to create new routes or modify existing routes in the route library. It is necessary to focus on checking whether the Region in the Sheet meets the standards.'
          }
          placement="top"
        >
          <QuestionCircleOutlined
            style={{ color: '#838CA1', marginLeft: 16 }}
          />
        </CustomTooltip>
      </div>
      {data?.incorrectNumber ? (
        <>
          <div className={styles.tab_text_th}>Route number (row of Sheet):</div>
          <div className={styles.tab_text_th} style={{ marginBottom: 0 }}>
            {data?.incorrectList?.join(',')}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default memo(function SheetCompletedModal(props: {
  confirm: () => void;
  versionData: SyncFromSheetData;
}) {
  const { versionData, confirm } = props;
  const [tabKey, setTabKey] = useState<string>('');

  const items: TabsProps['items'] = useMemo(() => {
    return versionData?.importVersionVoList?.map((item) => {
      return {
        key: item.version,
        label: item.version,
        children: <TabChildren data={item} />,
      };
    });
  }, [versionData]);

  return (
    <Modal
      title={'Data synchronization results'}
      open={true}
      cancelButtonProps={{
        style: { display: 'none' },
      }}
      width={680}
      onOk={confirm}
      maskClosable={false}
      closeIcon={false}
    >
      <Tabs
        activeKey={tabKey ? tabKey : items?.[items.length - 1]?.key}
        onChange={(activeKey) => setTabKey(activeKey)}
        items={items}
      />
    </Modal>
  );
});
