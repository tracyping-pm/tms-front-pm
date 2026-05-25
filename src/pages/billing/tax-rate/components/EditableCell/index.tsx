import { ITaxRateTableDataItem } from '@/api/types/billing';
import { EnumTaxRateStatus } from '@/enums';
import { formatAmount } from '@/utils/utils';
import { EditOutlined } from '@ant-design/icons';
import { Badge } from 'antd';
import cls from 'classnames';
import _ from 'lodash';
import { FC, useState } from 'react';
import EditableModal from '../EditableModal';
import styles from './index.less';

const fields = ['Truck Type', 'Status'];

interface EditableCellProps {
  className?: string;
  editable: boolean;
  name: string;
  code: string;
  rowData: ITaxRateTableDataItem;
  onSaved: () => void;
}

const EditableCell: FC<React.PropsWithChildren<EditableCellProps>> = ({
  className,
  editable,
  name,
  code,
  rowData,
  onSaved,
  ...restProps
}) => {
  const [editableModalOpen, setEditableModalOpen] = useState(false);
  const onEdit = () => {
    setEditableModalOpen(true);
  };

  const buildStatus = (status: EnumTaxRateStatus) => {
    console.log('☀️☀️☀️', { status });
    const statusMap = {
      [EnumTaxRateStatus.DISABLEMENT]: {
        text: EnumTaxRateStatus.DISABLEMENT,
        color: '#D9D9D9',
      },
      [EnumTaxRateStatus.ENABLEMENT]: {
        text: EnumTaxRateStatus.ENABLEMENT,
        color: '#52C41A',
      },
    };
    return (
      <Badge color={statusMap[status].color} text={statusMap[status].text} />
    );
  };

  const buildDataMap = (map: { vat?: number; wht?: number }) => {
    const { vat, wht } = map;
    const vatStr = _.isNumber(vat) ? `${formatAmount(vat)}%` : '-';
    const whtStr = _.isNumber(wht) ? `${formatAmount(wht)}%` : '-';

    return `${vatStr}, ${whtStr}`;
  };

  return (
    <>
      <td
        {...restProps}
        className={cls(
          className,
          'ant-table-cell',
          editable && styles.editable,
        )}
        valign="top"
      >
        {editable && (
          <div className={cls('btn-edit-wrap', styles.btnEditWrap)}>
            <a href="javascript:;" className={'btn-edit'} onClick={onEdit}>
              <EditOutlined />
            </a>
          </div>
        )}
        {fields.includes(name) ? (
          <>
            {name === 'Truck Type' && rowData['truckTypeName']}
            {name === 'Status' && rowData['status']
              ? buildStatus(rowData['status'])
              : ''}
          </>
        ) : (
          <>
            {code && rowData && rowData['dataMap'] && rowData['dataMap'][code]
              ? buildDataMap(rowData['dataMap'][code])
              : ''}
          </>
        )}
      </td>
      <EditableModal
        rowData={rowData}
        name={name}
        code={code}
        open={editableModalOpen}
        onCancel={() => setEditableModalOpen(false)}
        onSaved={() => {
          setEditableModalOpen(false);
          onSaved?.();
        }}
      />
    </>
  );
};

export default EditableCell;
