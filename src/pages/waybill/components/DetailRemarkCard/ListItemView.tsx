import { IRemarkItem, IWaybillBaseInfoData } from '@/api/types/waybill';
import { deleteRemark } from '@/api/waybill';
import { IconDelete } from '@/components/OperationIcon';
import PubSubContext from '@/context/pubsub';
import { getOS } from '@/utils/utils';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useSetState, useSize } from 'ahooks';
import { App } from 'antd';
import cls from 'classnames';
import { FC, useContext, useEffect, useRef } from 'react';
import { EVENT_WAYBILL_REMARK_LIST_RELOAD } from '../../WaybillDetail/events';
import { StateContext } from '../../WaybillDetail/store';
import RemarkModal from './RemarkModal';
import styles from './index.less';
import { ReactComponent as IconField } from './static/container-filled.svg';

interface IState {
  modalOpen: boolean;
  readonly: boolean;
  showDot: boolean;
  itemWidth: number;
}

const initialState: IState = {
  modalOpen: false,
  readonly: false,
  showDot: false,
  itemWidth: 300,
};

interface IProps {
  item: IRemarkItem;
  canEdit: boolean;
  canDelete: boolean;
}

const ListItemView: FC<IProps> = ({ item, canEdit, canDelete }) => {
  const { modal } = App.useApp();
  const { publish } = useContext(PubSubContext);
  // @ts-ignore
  const { state } = useContext(StateContext);
  const waybillBasicInfo: IWaybillBaseInfoData = state?.waybillBasicInfo || {};

  const [modeState, setModeState] = useSetState<IState>(initialState);
  const listItemRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  const parentSize = useSize(listItemRef);
  const size = useSize(ghostRef);

  const refresh = () => {
    publish(EVENT_WAYBILL_REMARK_LIST_RELOAD);
  };

  const handleDelete = (e: any) => {
    e?.stopPropagation?.();

    modal.confirm({
      title: 'Delete Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm to delete this remark',
      okText: 'Confirm',
      cancelText: 'Cancel',
      autoFocusButton: null,
      onOk: async () => {
        const payload = {
          waybillId: waybillBasicInfo.id,
          projectId: waybillBasicInfo.projectId,
          waybillRemarkId: item.waybillRemarkId,
          generateType: item.generateType,
          deletedFileIdList: item.materialVoList?.map(
            (_item) => _item.fileMaterialId,
          ),
        };
        const res = await deleteRemark(payload);
        if (res.code === 200) {
          refresh();
        }
      },
    });
  };

  const handleItemClick = () => {
    if (canEdit) {
      setModeState({ modalOpen: true, readonly: false });
    } else {
      setModeState({ modalOpen: true, readonly: true });
    }
  };

  useEffect(() => {
    if (parentSize?.width && size?.width) {
      if (parentSize.width < size.width) {
        setModeState({ showDot: true });
      } else {
        setModeState({ showDot: false });
      }
    }
  }, [size, parentSize]);

  useEffect(() => {
    const os = getOS();
    if (os === 'Windows') {
      setModeState({ itemWidth: 300 });
    } else if (os === 'MacOS') {
      setModeState({ itemWidth: 305 });
    } else {
      setModeState({ itemWidth: 300 });
    }
  }, []);

  return (
    <>
      <div
        className={cls(styles.listItemView, 'listItemView')}
        onClick={handleItemClick}
        style={{ width: `${modeState.itemWidth}px` }}
      >
        <div className="listItemTitle">
          <span className="title">
            <span className="icon">
              <IconField />
            </span>
            <span className="text">{item.remarkType}</span>
          </span>
          {canDelete && (
            <span className="operation" onClick={handleDelete}>
              <IconDelete />
            </span>
          )}
        </div>
        <div className="listItemCreator" title={item.creator}>
          Added_by: <span>{item.creator ?? '-'}</span>
        </div>
        <div className="listItemTime">{item?.eventTime}</div>
        <div className="listItemDesc" ref={listItemRef}>
          <div className="ghostText" ref={ghostRef}>
            {item.description}
          </div>
          <pre>{item.description}</pre>
          {modeState.showDot && <span className="dot">...</span>}
        </div>
      </div>
      {modeState.modalOpen && (
        <RemarkModal
          open={modeState.modalOpen}
          readonly={modeState.readonly}
          waybillId={waybillBasicInfo?.id}
          projectId={waybillBasicInfo?.projectId}
          defaultData={item}
          materialList={item?.materialVoList ?? []}
          hideModal={() => setModeState({ modalOpen: false })}
          refresh={refresh}
        />
      )}
    </>
  );
};

export default ListItemView;
