import CustomTooltip from '@/components/CustomTooltip';
import cls from 'classnames';
import styles from './common.less';
interface ItemProps {
  label: string;
  value: React.ReactNode;
  change: boolean;
}
export default function CustomInfo({
  label,
  value,
  change = false,
}: ItemProps) {
  return (
    <div className={styles.customInfo}>
      <div className={styles.customInfo_label}>{label}:</div>
      <div
        className={cls(styles.customInfo_item, change ? styles.blueText : '')}
      >
        <CustomTooltip title={value ?? '-'}>{value ?? '-'}</CustomTooltip>
      </div>
    </div>
  );
}
