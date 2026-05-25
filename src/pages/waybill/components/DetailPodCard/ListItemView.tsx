import { ICommonMaterial } from '@/api/types/common';
import { IPodItem, IWaybillBaseInfoData } from '@/api/types/waybill';
import { deletePod, editPod } from '@/api/waybill';
import CommonFileItem from '@/components/CommonFileItem';
import CustomConfirmModal from '@/components/CustomConfirmModal';
import CustomTooltip from '@/components/CustomTooltip';
import SingleUploadView from '@/components/CustomUpload/SingleUploadView';
import { IconDelete, IconEdit } from '@/components/OperationIcon';
import PubSubContext from '@/context/pubsub';
import { FINANCIAL_SHOW_POD_EDIT } from '@/enums';
import { useSetState } from 'ahooks';
import { App } from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import { FC, useContext } from 'react';
import { EVENT_WAYBILL_POD_LIST_RELOAD } from '../../WaybillDetail/events';
import { StateContext } from '../../WaybillDetail/store';
import PodModal from './PodModal';
import styles from './index.less';
import { ReactComponent as IconField } from './static/container-filled.svg';

const WIDTH = 120;
const HEIGHT = 120;

interface IState {
  onlyShowUpload: boolean;
  modalOpen: boolean;
}

const initialState: IState = {
  onlyShowUpload: false,
  modalOpen: false,
};

interface IProps {
  item: IPodItem;
  canEdit: boolean;
  onCustomPreview?: (material: ICommonMaterial) => void;
  setPodListLoading?: (b: boolean) => void;
}

const ListItemView: FC<IProps> = ({
  item,
  canEdit,
  onCustomPreview,
  setPodListLoading,
}) => {
  const { message } = App.useApp();
  const { publish } = useContext(PubSubContext);
  // @ts-ignore
  const { state } = useContext(StateContext);
  const waybillBasicInfo: IWaybillBaseInfoData = state?.waybillBasicInfo || {};

  const [modeState, setModeState] = useSetState<IState>(initialState);

  const handleEdit = () => {
    setModeState({ onlyShowUpload: false, modalOpen: true });
  };

  const refresh = () => {
    publish(EVENT_WAYBILL_POD_LIST_RELOAD);
  };

  const handleDelete = async () => {
    const payload = {
      waybillId: waybillBasicInfo.id,
      projectId: waybillBasicInfo.projectId,
      waybillPodId: item.waybillPodId,
      generateType: item.generateType,
      deletedFileIdList: item.materialVoList?.map(
        (subItem) => subItem.fileMaterialId,
      ),
    };
    const res = await deletePod(payload);
    if (res.code === 200) {
      refresh();
    }
  };

  const onDeleteTriggerHandle = async (deletedMaterialId: number) => {
    const materialIds = item.materialVoList.map(
      (material) => material.fileMaterialId,
    );
    const idx = _.findIndex(materialIds, (id) => id === deletedMaterialId);

    if (idx > -1) {
      materialIds.splice(idx, 1);
      const payload = {
        projectId: waybillBasicInfo.projectId,
        waybillId: waybillBasicInfo.id,
        waybillPodId: item.waybillPodId,
        podType: item.podType,
        description: item.description,
        materialIds,
      };
      setPodListLoading?.(true);
      const res = await editPod(payload).finally(() => {
        setPodListLoading?.(false);
      });
      if (res.code === 200) {
        message.success('Delete file success!');
        refresh();
      }
    }
  };

  return (
    <>
      <div className={cls(styles.listItemView, 'listItemView')}>
        <div className="listItemTitle">
          <div className="listItemTitleIcon">
            <IconField />
          </div>
          <CustomTooltip title={item.podType}>
            <span
              className={`title ${!item.skippable && item.defaultPod ? 'must' : null}`}
            >
              {`${item.podType}`}
            </span>
          </CustomTooltip>

          {canEdit &&
            FINANCIAL_SHOW_POD_EDIT.includes(
              waybillBasicInfo.financialStatus,
            ) && (
              <span className="operation">
                <IconEdit onClick={handleEdit} />

                {!item.defaultPod ? (
                  <CustomConfirmModal
                    title="Delete Confirm"
                    content="Confirm to delete this POD record"
                    onOk={handleDelete}
                    okText="Confirm"
                    cancelText="Cancel"
                  >
                    <IconDelete />
                  </CustomConfirmModal>
                ) : null}
              </span>
            )}
        </div>
        <div className="listItemDesc">{item.description}</div>
        <div className="listItemMaterial">
          {item.materialVoList?.map((material: ICommonMaterial) => (
            <CommonFileItem
              key={material.fileMaterialId}
              width={118}
              height={118}
              className="materialItem"
              thumbnail={material.fileThumbnailUrl}
              fileType={material.fileType}
              fileName={material.fileName}
              materialId={material.fileMaterialId}
              driveFileId={material.fileDriveId}
              fileMimeType={material.fileMimeType}
              onCustomPreview={() => onCustomPreview?.(material)}
              showDelete={canEdit}
              onDeleteTrigger={() => {
                onDeleteTriggerHandle(material.fileMaterialId);
              }}
            />
          ))}
          {canEdit &&
          FINANCIAL_SHOW_POD_EDIT.includes(waybillBasicInfo.financialStatus) ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                columnGap: '16px',
              }}
            >
              <SingleUploadView
                width={WIDTH}
                height={HEIGHT}
                onClick={() => {
                  setModeState({ onlyShowUpload: true, modalOpen: true });
                }}
              />
            </div>
          ) : null}
          {!item.materialVoList?.length ? (
            <div className="listItemMaterialTag">
              {`Please upload POD ${item.copyType ? item.copyType : ''} ${
                item.requirementType
                  ? 'required by ' + item.requirementType
                  : ''
              }`}
            </div>
          ) : null}
        </div>
      </div>
      {modeState.modalOpen && (
        <PodModal
          open={modeState.modalOpen}
          onlyShowUpload={modeState.onlyShowUpload}
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
