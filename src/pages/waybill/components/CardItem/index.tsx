import styles from './styles.less';

export default function CardItem(props: { label: string; value: any }) {
  const { label, value } = props;
  return (
    <div className={styles.item}>
      <div className={styles.item_label}>{label}</div>
      <div className={styles.item_value}>{value ?? '-'}</div>
    </div>
  );
}
