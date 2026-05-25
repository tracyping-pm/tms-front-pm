import { IImageState } from '@/api/types/common';
import {
  IAccreditationCategoryListItem,
  IAccreditationMaterialListItem,
} from '@/api/types/vendor';
import CommonFileItem from '@/components/CommonFileItem';
import { ApplicationTypeEnum } from '@/enums';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  HistoryOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons';
import { App, Tag } from 'antd';
import dayjs from 'dayjs';
import lodash from 'lodash';
import { useCallback, useState } from 'react';

import {
  createCrewAccreditationVersion,
  deleteCrewCategory,
  updateCrewCategory,
} from '@/api/crew';
import { PermissionEnum } from '@/enums/permission';
import AccreditationHistoryModal from '@/pages/vendor/components/AccreditationHistoryModal';
import AccreditationVersionDrawer from '@/pages/vendor/components/AccreditationVersionDrawer';
import EditCategoryModal from '@/pages/vendor/components/EditCategoryModal';
import { useAccess } from '@umijs/max';
import styles from './styles.less';

interface ItemProps extends IAccreditationCategoryListItem {
  crewId: number;
  version?: number;
  imageState: IImageState;
  setImageState: (imageState: any) => void;
  reload: () => void;
}
interface DefaultDate {
  id: string;
  fileCategory: string;
  version?: number;
  subFileCategory?: string;
  startDate?: string;
  endDate?: string;
  validIndefinitely?: boolean;
}
interface IEditCategoryConfirm {
  id: number;
  fileCategory: string;
  subFileCategory?: string;
  validDateStart?: string;
  validDateEnd?: string;
  validIndefinitely: boolean;
  addMaterialIdList?: number[];
  materialIdList?: number[];
  version?: number;
}
export default function ListItem({
  id,
  crewId,
  reload,
  required,
  defaultCategory,
  fileCategory,
  subFileCategory,
  accreditationMaterialList = [],
  categoryMaterialId,
  version,
  imageState,
  validDateStart,
  validDateEnd,
  validIndefinitely,
  setImageState,
}: ItemProps) {
  const access = useAccess();
  const { message, modal } = App.useApp();
  const [editCategoryModalOpen, setEditCategoryModalOpen] =
    useState<boolean>(false);
  const [editCategoryModalLoading, setEditCategoryModalLoading] =
    useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState<boolean>(false);
  const [defaultDate, setDefaultDate] = useState<DefaultDate>();
  const [defaultMaterialList, setDefaultMaterialList] = useState<
    IAccreditationMaterialListItem[]
  >([]);

  const handleDeleteItem = async () => {
    modal.confirm({
      title: 'Delete Confirm',
      icon: <ExclamationCircleFilled />,
      content: 'Confirm delete Category',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        const res = await deleteCrewCategory({
          id: crewId,
          fileCategory,
        });
        if (res.code === 200) {
          message.success('Delete category successfully');
          reload();
        }
      },
    });
  };

  const onEdit = () => {
    setDefaultDate({
      id,
      fileCategory,
      subFileCategory,
      version,
      startDate: validDateStart,
      endDate: validDateEnd,
      validIndefinitely: validIndefinitely,
    });
    setDefaultMaterialList(accreditationMaterialList);
    setEditCategoryModalOpen(true);
  };
  const onAdd = () => {
    setDefaultDate({
      id,
      fileCategory,
      // subFileCategory,
    });
    setDefaultMaterialList([]);
    setEditCategoryModalOpen(true);
  };

  // const onHistory = () => {
  //   setHistoryModalOpen(true);
  // };

  const onCustomPreview = useCallback(
    (material: IAccreditationMaterialListItem) => {
      const index = lodash.findIndex(
        imageState.sourceImages,
        (v) => v.material.fileMaterialId === material.fileMaterialId,
      );
      setImageState({
        index,
        visible: true,
      });
    },
    [imageState, setImageState],
  );

  const onEditCategoryConfirm = async (v: IEditCategoryConfirm) => {
    setEditCategoryModalLoading(true);
    let apiFuc;
    if (v.version) {
      apiFuc = updateCrewCategory({
        id: v.id,
        fileCategory: v.fileCategory,
        version: v.version,
        subFileCategory: v.subFileCategory,
        validDateStart: v.validDateStart,
        validDateEnd: v.validDateEnd,
        validIndefinitely: v.validIndefinitely,
        addMaterialIdList: v.materialIdList,
      });
    } else {
      apiFuc = createCrewAccreditationVersion(v);
    }
    const res = await apiFuc.finally(() => {
      setEditCategoryModalLoading(false);
    });
    if (res.code === 200) {
      message.success(
        `${v.version ? 'Update' : 'Edit'} Accreditation successfully`,
      );
      setEditCategoryModalOpen(false);
      reload();
    }
  };

  return (
    <>
      <div className={styles.item}>
        <div className={styles.item_title}>
          <div>
            {required ? <span style={{ color: '#ff4d4f' }}>*</span> : null}
            <span>{fileCategory}</span>
            {validIndefinitely ? (
              <Tag style={{ marginLeft: 10 }}> Permanently Valid</Tag>
            ) : (
              ''
            )}
          </div>
          {!defaultCategory &&
            access[PermissionEnum.CREW_DETAIL_ACCREDITATION_EDIT] && (
              <span
                className={styles.item_title_icon}
                onClick={handleDeleteItem}
              >
                <DeleteOutlined />
              </span>
            )}
          {access[PermissionEnum.CREW_DETAIL_ACCREDITATION_EDIT] ? (
            <span className={styles.item_title_icon} onClick={onEdit}>
              <EditOutlined />
            </span>
          ) : null}
          {access[PermissionEnum.CREW_DETAIL_ACCREDITATION_EDIT] ? (
            <span className={styles.item_title_icon} onClick={onAdd}>
              <PlusSquareOutlined />
            </span>
          ) : null}
          <span
            className={styles.item_title_icon}
            onClick={() => setVersionDrawerOpen(true)}
          >
            <HistoryOutlined />
          </span>
        </div>
        {!validIndefinitely && (
          <div className={styles.item_time}>
            Valid Date:
            {validDateStart ? dayjs(validDateStart).format('YYYY/MM/DD') : ''}-
            {validDateEnd ? dayjs(validDateEnd).format('YYYY/MM/DD') : ''}
          </div>
        )}
        <div className={styles.item_content}>
          {accreditationMaterialList?.map(
            (fileItem: IAccreditationMaterialListItem) => (
              <div key={fileItem.fileAccreditationId}>
                <CommonFileItem
                  className={styles.file_item}
                  thumbnail={fileItem.fileThumbnailUrl}
                  fileType={fileItem.fileType}
                  fileName={fileItem.fileName}
                  materialId={categoryMaterialId}
                  driveFileId={fileItem.fileDriveId}
                  fileMimeType={fileItem.fileMimeType}
                  onCustomPreview={() => onCustomPreview(fileItem)}
                />
                <div className={styles.fileNumber}>
                  ID:{fileItem.fileNumber ?? '-'}
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      {editCategoryModalOpen ? (
        <EditCategoryModal
          open={editCategoryModalOpen}
          source={ApplicationTypeEnum.CREW}
          required={required}
          record={defaultDate as DefaultDate}
          fileCategory={fileCategory}
          materialList={defaultMaterialList}
          editCategoryModalLoading={editCategoryModalLoading}
          onConfirm={(v) => {
            onEditCategoryConfirm(v);
          }}
          hideModal={() => {
            setEditCategoryModalOpen(false);
          }}
        />
      ) : null}

      {versionDrawerOpen ? (
        <AccreditationVersionDrawer
          type={ApplicationTypeEnum.CREW}
          fileCategory={fileCategory}
          hideDrawer={() => {
            setVersionDrawerOpen(false);
          }}
        />
      ) : null}
      {historyModalOpen ? (
        <AccreditationHistoryModal
          type={ApplicationTypeEnum.CREW}
          open={historyModalOpen}
          fileCategory={fileCategory}
          hideModal={() => {
            setHistoryModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
