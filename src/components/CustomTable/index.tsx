import { COMMON_TABLE_FORM_SETTING, LAYOUT_HEADER_HEIGHT } from '@/constants';
import { ProTable, ProTableProps } from '@ant-design/pro-components';
import { useMount } from 'ahooks';
import { Button } from 'antd';
import cls from 'classnames';
import { FC, Key, useEffect, useRef, useState } from 'react';
import styles from './index.less';

const DEFAULT_SCROLL_Y = 300;
const GAP = 16;
const TABLE_HEADER_H = 55;

export interface ICustomTable extends ProTableProps<any, any> {
  noStyle?: boolean;
  rowSelection?: any;
  scroll?: { x?: number | true | string; y?: number | string };
  scrollOffsetY?: number; // 额外偏移量
  filterSticky?: false | { top: number; zIndex?: number };
  getSelectTableItem?: (values: any) => void;
  selectedKey?: string;
  fixedSpin?: boolean;
}

const CustomTable: FC<ICustomTable> = ({
  className,
  noStyle = false,
  rowSelection = false,
  scroll,
  scrollOffsetY,
  rowKey = 'id',
  defaultSize = 'middle',
  getSelectTableItem,
  toolBarRender,
  options,
  form,
  filterSticky,
  selectedKey = 'id',
  fixedSpin = true,
  dataSource,
  ...rest
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [scrollY, setScrollY] = useState<number>(DEFAULT_SCROLL_Y);
  const tableRef = useRef<HTMLDivElement>(null);
  const selectedALL = useRef<any>([]);

  const headerTitleRender = () => {
    return toolBarRender ? (
      <>
        {/* @ts-ignore */}
        <div className={styles.toolBarWrap}>{toolBarRender()}</div>
      </>
    ) : null;
  };

  // 多选
  const onHandleSelect = (record: any, selected: any) => {
    const idx = selectedALL.current.findIndex(
      (i: any) => i[selectedKey] === record[selectedKey],
    );
    if (selected) {
      selectedALL.current.push(record);
    } else {
      selectedALL.current.splice(idx, 1);
    }
    const a = selectedALL.current.map((i: any) => i[selectedKey]);
    setSelectedRowKeys(a);
    getSelectTableItem?.({ ids: a, options: selectedALL.current });
  };

  const onHandleSelectAll = (
    selected: any,
    selectedRows: { current: any[] },
    changeRows: any[],
  ) => {
    if (selected) {
      // eslint-disable-next-line no-param-reassign
      selectedALL.current = selectedALL.current.concat(changeRows);
    } else {
      changeRows.forEach((i) => {
        selectedALL.current.forEach((m: any, mIndex: any) => {
          if (i[selectedKey] === m[selectedKey]) {
            selectedALL.current.splice(mIndex, 1);
          }
        });
      });
    }
    const a = selectedALL.current.map((i: any) => i[selectedKey]);
    setSelectedRowKeys(a);
    getSelectTableItem?.({ ids: a, options: selectedALL.current });
  };

  useMount(() => {
    if (filterSticky && tableRef.current) {
      const filterEl = tableRef.current?.querySelector?.(
        '.ant-pro-table-search-query-filter',
      ) as HTMLElement;

      if (filterEl) {
        filterEl.classList.add('filterSticky');
        filterEl.style.position = 'sticky';
        filterEl.style.top = `${filterSticky.top}px`;
        filterEl.style.zIndex = `${filterSticky.zIndex || 10}`;
      }
    }

    // 计算 scrollY
    const filterEl = tableRef.current?.querySelector?.(
      '.ant-pro-table-search-query-filter',
    ) as HTMLElement;

    const toolbarEl = tableRef.current?.querySelector?.(
      '.ant-pro-table-list-toolbar',
    ) as HTMLElement;

    const screenH = document.body.clientHeight;
    const filterH = filterEl?.clientHeight ?? 0;
    const toolbarH = toolbarEl?.clientHeight ?? 0;

    let calcScrollY =
      screenH -
      LAYOUT_HEADER_HEIGHT -
      GAP * 2 -
      filterH -
      toolbarH -
      TABLE_HEADER_H -
      76 -
      (scrollOffsetY ?? 0);
    setScrollY(calcScrollY);
  });

  useEffect(() => {
    if (selectedRowKeys.length > 0) {
      // update
      // getSelectTableItem?.({ ids: a, options: selectedALL.current });
    }
  }, [dataSource, selectedRowKeys]);

  return (
    <>
      <div
        className={cls(styles.customTableContainer, 'customTableContainer')}
        ref={tableRef}
      >
        <ProTable
          className={cls(
            'customTable',
            styles.customTable,
            fixedSpin && styles.fixedSpin,
            noStyle && styles.noStyle,
            className,
          )}
          scroll={
            scroll
              ? {
                  x: scroll?.x,
                  y: scroll?.y
                    ? scroll.y
                    : scrollY < DEFAULT_SCROLL_Y
                      ? undefined
                      : scrollY,
                }
              : {
                  x: undefined,
                  y: undefined,
                }
          }
          search={{
            defaultCollapsed: false,
            collapseRender: false,
          }}
          headerTitle={headerTitleRender()}
          rowKey={rowKey}
          defaultSize={defaultSize}
          options={{
            density: false,
            fullScreen: false,
            setting: false,
            reload: false,
            ...options,
          }}
          // @ts-ignore
          rowSelection={
            rowSelection
              ? !rowSelection?.all
                ? { ...rowSelection }
                : {
                    selectedRowKeys,
                    onSelect: onHandleSelect,
                    // @ts-ignore
                    onSelectAll: onHandleSelectAll,
                  }
              : false
          }
          tableAlertRender={false}
          tableAlertOptionRender={false}
          form={{
            ...COMMON_TABLE_FORM_SETTING,
            className: 'xxxxxx',
            optionRender: (searchConfig) => [
              <Button
                key="submit"
                type="primary"
                onClick={() => searchConfig?.form?.submit()}
              >
                Search
              </Button>,
              <Button
                key="reset"
                onClick={() => {
                  //@ts-ignore
                  rest?.onReset?.();
                  searchConfig?.form?.resetFields();
                  searchConfig?.form?.submit();
                }}
              >
                Reset
              </Button>,
            ],
            ...form,
          }}
          dataSource={dataSource}
          {...rest}
        />
      </div>
    </>
  );
};

export default CustomTable;
