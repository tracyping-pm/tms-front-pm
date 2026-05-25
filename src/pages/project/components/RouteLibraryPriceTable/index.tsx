import { CountryCurrencyEnumText } from '@/enums';
import { Form, FormInstance, InputNumber, Table } from 'antd';
import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import styles from './styles.less';

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  truckTypeId: number;
  dataIndex: string;
  record: any;
  handleSave: (record: any, d: number) => void;
}

interface PriceTableProps {
  countryId: any;
  // routeMode: ROUTE_LIBRARY_MODE;
  dataLoading: boolean;
  // versionIndex: number;
  pageNum: number;
  pageSize: number;
  totalNum: number;
  pageSizeOptions: number[];
  setPageNum: (n: number) => void;
  onShowSizeChange: (c: number, s: number) => void;
  columnList: any[];
  dataSource: any[];
  rowKey?: any;
  scrollY?: number;
}

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

const BillingEditableRow = memo(
  ({ index, ...props }: EditableRowProps): React.JSX.Element => {
    console.log(index);
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  },
);

const BillingEditableCell = memo(
  (props: PriceTableProps & EditableCellProps) => {
    const {
      countryId,
      title,
      editable,
      children,
      dataIndex,
      // versionIndex,
      truckTypeId,
      record,
      handleSave,
      ...restProps
    } = props;
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
      if (editing) {
        inputRef.current!.focus();
      }
    }, [editing]);

    const toggleEdit = async () => {
      setEditing(!editing);
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        // 未填或者未变
        if (
          values[dataIndex] === null ||
          values[dataIndex] === undefined ||
          record[dataIndex] === values[dataIndex]
        ) {
          return;
        }
        handleSave({ ...record, ...values }, truckTypeId);
      } catch {
        console.log(title);
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item style={{ margin: 0 }} name={dataIndex}>
          <InputNumber
            ref={inputRef}
            prefix={CountryCurrencyEnumText[countryId as any]}
            style={{ width: '100%' }}
            min={0}
            max={99999999.99}
            precision={2}
            onBlur={save}
            onPressEnter={save}
          />
        </Form.Item>
      ) : (
        <div className="editable-cell-value-wrap" onClick={toggleEdit}>
          {children}
        </div>
      );
    }

    return <td {...restProps}>{childNode}</td>;
  },
);

export default function RouteLibraryPriceTable(props: PriceTableProps) {
  const {
    // versionIndex,
    rowKey,
    columnList,
    dataLoading,
    dataSource,
    pageNum,
    pageSize,
    pageSizeOptions,
    setPageNum,
    onShowSizeChange,
    totalNum,
  } = props;

  const components = {
    body: {
      row: BillingEditableRow,
      cell: (itemProps: any) => {
        return <BillingEditableCell {...itemProps} />;
      },
    },
  };

  return (
    <div className={styles.projects}>
      <Table
        bordered
        rowClassName={() => 'editable-row'}
        sticky={{ offsetHeader: 54, offsetScroll: 0 }}
        rowKey={rowKey ? rowKey : 'id'}
        loading={dataLoading}
        components={components}
        pagination={{
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          pageSizeOptions: pageSizeOptions,
          current: pageNum,
          pageSize: pageSize,
          total: totalNum,
          onChange: (value) => setPageNum(value),
        }}
        columns={columnList?.slice()}
        scroll={{ x: 1000 }}
        dataSource={dataSource?.slice()}
      />
    </div>
  );
}
