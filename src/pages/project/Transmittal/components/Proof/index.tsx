import { transmittalDetailProof } from '@/api/transmittal';
import {
  ITransmittalDetailProof,
  ITransmittalMaterialFileVos,
} from '@/api/types/transmittal';
import CommonFileItem from '@/components/CommonFileItem';
import { useParams } from '@umijs/max';
import { Spin } from 'antd';
import { memo, useEffect, useState } from 'react';
import styles from './styles.less';

export default memo(function Proof() {
  const { id: transmittalId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [proofData, setProofData] = useState<ITransmittalDetailProof>(
    {} as ITransmittalDetailProof,
  );

  const getDataSource = async () => {
    setLoading(true);
    const res = await transmittalDetailProof({
      id: Number(transmittalId),
    }).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setProofData(res.data || {});
    }
  };

  useEffect(() => {
    getDataSource();
  }, []);

  return (
    <Spin spinning={loading}>
      <div className={styles.proof}>
        <div className={styles.listItemMaterial}>
          {proofData.fileVos?.map((item: ITransmittalMaterialFileVos) => (
            <CommonFileItem
              key={item.transmittalMaterialId}
              width={118}
              height={118}
              className={styles.materialItem}
              thumbnail={item.fileThumbnailUrl}
              fileType={item.fileType}
              fileName={item.fileName}
              materialId={item.transmittalMaterialId}
              driveFileId={item.driveFileId}
              fileMimeType={item.fileMimeType}
            />
          ))}
        </div>
        {proofData.description && (
          <div className={styles.description}>
            <div className={styles.content}>Description</div>
            <pre className={styles.content}>{proofData.description}</pre>
          </div>
        )}
      </div>
    </Spin>
  );
});
