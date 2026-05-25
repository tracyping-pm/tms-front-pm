import { IImageState } from '@/api/types/common';
import {
  IAccreditationCategoryListItem,
  IAccreditationMaterialListItem,
  IVendorDetail,
} from '@/api/types/vendor';
import {
  createVendorAccreditationVersion,
  deleteVendorCategory,
  updateVendorAccreditation,
} from '@/api/vendor';
import CommonFileItem from '@/components/CommonFileItem';
import { ApplicationTypeEnum } from '@/enums';
import { PermissionEnum } from '@/enums/permission';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  HistoryOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { App, Tag } from 'antd';
import dayjs from 'dayjs';
import lodash from 'lodash';
import { useCallback, useState } from 'react';
import AccreditationHistoryModal from '../AccreditationHistoryModal';
import AccreditationVersionDrawer from '../AccreditationVersionDrawer';
import EditCategoryModal from '../EditCategoryModal';
import styles from './styles.less';

interface ItemProps extends IAccreditationCategoryListItem {
  vendorId: number;
  version?: number;
  venderData: IVendorDetail;
  vendorStatus: string;
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
  venderData,
  vendorId,
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
        const res = await deleteVendorCategory({
          id: vendorId,
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
      version,
      subFileCategory,
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
      apiFuc = updateVendorAccreditation({
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
      apiFuc = createVendorAccreditationVersion(v);
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
            access[PermissionEnum.VENDOR_DETAIL_ACCREDITATION_EDIT] && (
              <span
                className={styles.item_title_icon}
                onClick={handleDeleteItem}
              >
                <DeleteOutlined />
              </span>
            )}
          {access[PermissionEnum.VENDOR_DETAIL_ACCREDITATION_EDIT] ? (
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
          source={ApplicationTypeEnum.VENDOR}
          required={required}
          sourceData={venderData}
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
          type={ApplicationTypeEnum.VENDOR}
          fileCategory={fileCategory}
          hideDrawer={() => {
            setVersionDrawerOpen(false);
          }}
        />
      ) : null}
      {historyModalOpen ? (
        <AccreditationHistoryModal
          type={ApplicationTypeEnum.VENDOR}
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
