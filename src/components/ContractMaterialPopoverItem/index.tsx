import { ICommonMaterial } from '@/api/types/common';
import CustomStatusButton from '@/components/CustomStatusButton';
import { EyeOutlined, FileOutlined } from '@ant-design/icons';
import { CSSProperties, memo } from 'react';

type Props = {
  material: ICommonMaterial;
  style?: CSSProperties;
  maxNameWidth?: number;
  loading?: boolean;
  onView: (material: ICommonMaterial) => void;
};

const ContractMaterialPopoverItem = memo((props: Props) => {
  const {
    material,
    style,
    maxNameWidth = 200,
    loading = false,
    onView,
  } = props;

  return (
    <div style={style}>
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <FileOutlined />
          <span
            className="ellipsis"
            title={
              material.fileNumber
                ? `${material.fileName}（${material.fileNumber}）`
                : material.fileName
            }
            style={{
              display: 'inline-block',
              maxWidth: maxNameWidth,
            }}
          >
            {material.fileName}
          </span>
        </span>
        {material.fileNumber && (
          <span
            style={{
              fontSize: 12,
              color: 'rgba(0, 0, 0, 0.45)',
              marginLeft: 24,
            }}
          >
            {material.fileNumber}
          </span>
        )}
      </span>
      <CustomStatusButton
        noStyle
        icon={<EyeOutlined />}
        loading={loading}
        onClick={() => onView(material)}
      >
        View
      </CustomStatusButton>
    </div>
  );
});

export default ContractMaterialPopoverItem;
