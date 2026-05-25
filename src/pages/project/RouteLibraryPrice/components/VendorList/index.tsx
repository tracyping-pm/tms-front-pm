import { IPriveVendorListItemV } from '@/api/types/project';
import CustomTooltip from '@/components/CustomTooltip';
import { Select } from 'antd';
import styles from './index.less';

const ListItem = ({
  vendorName,
  active = false,
  selectVendor,
}: {
  vendorName: string;
  selectVendor: () => void;
  active?: boolean;
}) => {
  return (
    <CustomTooltip title={vendorName} placement="right">
      <div
        onClick={selectVendor}
        className={
          active
            ? styles.priceContent_list_itemActive
            : styles.priceContent_list_item
        }
      >
        {vendorName}
      </div>
    </CustomTooltip>
  );
};

export default function VendorList({
  list,
  vendorKey,
  setVendorKey,
}: {
  list: IPriveVendorListItemV[];
  vendorKey: number | null | undefined;
  setVendorKey: (n: number | undefined) => void;
}) {
  const vendorList = list.slice();
  let index = vendorList.findIndex((item) => item.value === vendorKey);
  if (index !== -1) {
    let removedItem = vendorList.splice(index, 1);
    vendorList.splice(0, 0, removedItem[0]);
  }

  return (
    <div className={styles.priceContent_list}>
      <div className={styles.priceContent_list_header}>
        <Select
          value={vendorKey}
          style={{ width: 234 }}
          options={vendorList}
          allowClear
          showSearch
          filterOption={(
            input: string,
            option?: { label: string; value: number },
          ) => {
            return (option?.label ?? '')
              .toLowerCase()
              .includes(input.toString()?.toLowerCase());
          }}
          onClear={() => setVendorKey(undefined)}
          onSelect={(value) => setVendorKey(value)}
        ></Select>
      </div>
      <div className={styles.priceContent_list_nav}>
        {vendorList.map((vendor) => {
          return (
            <ListItem
              vendorName={vendor.label}
              key={vendor.value}
              active={vendorKey === vendor.value}
              selectVendor={() => setVendorKey(vendor.value)}
            />
          );
        })}
        {vendorList.length ? null : (
          <div className={styles.priceContent_empty}>No data</div>
        )}
      </div>
    </div>
  );
}
