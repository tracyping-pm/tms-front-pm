import {
  getWaybillStatementFieldsList,
  waybillStatementFieldsAdd,
} from '@/api/waybill';
import { PermissionEnum } from '@/enums/permission';
import { useAccess } from '@umijs/max';
import { Checkbox, Form, message, Modal, ModalProps, Spin } from 'antd';
import { FC, useEffect, useState } from 'react';
import CustomCheckboxItem from './customCheckboxItem';
import styles from './index.less';

interface ICustomExportModalProps extends ModalProps {
  open: boolean;
  onCancel: () => void;
}

const CustomExportModal: FC<ICustomExportModalProps> = ({
  onCancel,
  ...restProps
}) => {
  const access = useAccess();
  const CUSTOM_FIELDS_WAYBILL_BASIC_INFO = {
    label: 'Waybill Basic Info.',
    value: 'Waybill Basic Info.',
    children: [
      {
        label: 'Project Name',
        value: 'Project Name',
      },
      {
        label: 'BU',
        value: 'BU',
      },
      {
        label: 'Customer Name',
        value: 'Customer Name',
      },
      {
        label: 'Customer Tag',
        value: 'Customer Tag',
      },
      {
        label: 'Dispatch Type',
        value: 'Dispatch Type',
      },
      {
        label: 'Creation Time',
        value: 'Creation Time',
      },
      {
        label: 'Customer Code',
        value: 'Customer Code',
      },
    ],
  };

  const CUSTOM_FIELDS_CARRIER_INFO = {
    label: 'Carrier Info',
    value: 'Carrier Info',
    children: [
      {
        label: 'Vendor Name (Trucker Name)',
        value: 'Vendor Name (Trucker Name)',
      },
      {
        label: 'Vendor Tag',
        value: 'Vendor Tag',
      },
      {
        label: 'Plate Number',
        value: 'Plate Number',
      },
      {
        label: 'Actual Truck Type',
        value: 'Actual Truck Type',
      },
      {
        label: 'Required Truck Type',
        value: 'Required Truck Type',
      },
      {
        label: 'Truck Driver',
        value: 'Truck Driver',
      },
      {
        label: 'Driver Contact',
        value: 'Driver Contact',
      },
      {
        label: 'Helper',
        value: 'Helper',
      },
    ],
  };
  const CUSTOM_FIELDS_TRANSPORT_INFO = {
    label: 'Transport info',
    value: 'Transport info',
    children: [
      {
        label: 'Transportation Status',
        value: 'Transportation Status',
      },
      {
        label: 'Origin Label',
        value: 'Origin Label',
      },
      {
        label: 'Origin Region',
        value: 'Origin Region',
      },
      {
        label: 'Origin Address',
        value: 'Origin Address',
      },
      {
        label: 'Destination Label',
        value: 'Destination Label',
      },
      {
        label: 'Destination Region',
        value: 'Destination Region',
      },
      {
        label: 'Destination Address',
        value: 'Destination Address',
      },
      {
        label: 'Waypoint',
        value: 'Waypoint',
      },
      {
        label: 'Route Code',
        value: 'Route Code',
      },
      {
        label: 'Planning Route Distance',
        value: 'Planning Route Distance',
      },
      {
        label: 'No. of Drops',
        value: 'No. of Drops',
      },
      {
        label: 'Remark Type',
        value: 'Remark Type',
      },
      {
        label: 'Remark Description',
        value: 'Remark Description',
      },
    ],
  };

  const ACCESS_FINANCIAL_INFO = [
    {
      label: 'Financial Status',
      value: 'Financial Status',
    },

    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Basic Amount Receivable',
          value: 'Basic Amount Receivable',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Customer Additional Charge',
          value: 'Customer Additional Charge',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Customer Exception Fee',
          value: 'Customer Exception Fee',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Customer Claim',
          value: 'Customer Claim',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Customer Reimbursement',
          value: 'Customer Reimbursement',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Customer Miscellaneous Charge',
          value: 'Customer Miscellaneous Charge',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Vendor Paid In advance',
          value: 'Vendor Paid In advance',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Vendor Basic Amount Payable (Remaining)',
          value: 'Vendor Basic Amount Payable (Remaining)',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Vendor Additional Charge',
          value: 'Vendor Additional Charge',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Vendor Exception Fee',
          value: 'Vendor Exception Fee',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Vendor Claim',
          value: 'Vendor Claim',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_EXPORT_VIEW_AMOUNT] ||
    access[PermissionEnum.TEMPORARY_WAYBILL_EXPORT_VIEW_AMOUNT]
      ? {
          label: 'Vendor Reimbursement',
          value: 'Vendor Reimbursement',
        }
      : null,
    access[PermissionEnum.STANDARD_WAYBILL_VIEW_AMOUNT] &&
    access[PermissionEnum.TEMPORARY_WAYBILL_VIEW_AMOUNT]
      ? {
          label: 'Vendor Miscellaneous Charge',
          value: 'Vendor Miscellaneous Charge',
        }
      : null,
    {
      label: 'Route Pricing Tax Type',
      value: 'Route Pricing Tax Type',
    },
    {
      label: 'Billing Truck Type to Customer',
      value: 'Billing Truck Type to Customer',
    },
    {
      label: 'Billing Truck Type to Vendor',
      value: 'Billing Truck Type to Vendor',
    },
    {
      label: 'Truck Type Consistency',
      value: 'Truck Type Consistency',
    },
    {
      label: 'Invoice No.',
      value: 'Invoice No.',
    },
    {
      label: 'Linked AR Statement and Status',
      value:
        'Linked AR Statement and Status\n(There is no association between AR and AP in the same row)',
    },
    {
      label: 'Linked AP Statement and Status',
      value:
        'Linked AP Statement and Status\n(There is no association between AR and AP in the same row)',
    },
  ].filter(Boolean);
  const CUSTOM_FIELDS_FINANCIAL_INFO = {
    label: 'Financial Info',
    value: 'Financial Info',
    children: ACCESS_FINANCIAL_INFO,
  };
  const CUSTOM_FIELDS_TIME_INFO = {
    label: 'Time Info',
    value: 'Time Info',
    children: [
      {
        label: 'Unloading Time',
        value: 'Unloading Time (Op confirm unloading completion)',
      },
      {
        label: 'Position Time',
        value: 'Position Time',
      },
      {
        label: 'Required Delivery Time',
        value: 'Required Delivery Time',
      },
      {
        label: 'Confirm Delivery Time',
        value: 'Confirm Delivery Time',
      },
      {
        label: 'Time of Arrival at Origin',
        value: 'Time of Arrival at Origin',
      },
      {
        label: 'Time of Loading Commencement',
        value: 'Time of Loading Commencement',
      },
      {
        label: 'Time of Loading Completion',
        value: 'Time of Loading Completion',
      },
      {
        label: 'Time of Arrival at Destination',
        value: 'Time of Arrival at Destination',
      },
      {
        label: 'Time of Unloading Commencement',
        value: 'Time of Unloading Commencement',
      },

      {
        label: 'Time of Upload POD',
        value: 'Time of Upload POD',
      },
      {
        label: 'Time of Confirm Hardcopy of POD',
        value: 'Time of Confirm Hardcopy of POD',
      },
    ],
  };

  const CUSTOM_LIST = [
    { name: 'basicInfo', data: CUSTOM_FIELDS_WAYBILL_BASIC_INFO },
    { name: 'carrierInfo', data: CUSTOM_FIELDS_CARRIER_INFO },
    { name: 'transportInfo', data: CUSTOM_FIELDS_TRANSPORT_INFO },
    { name: 'financialInfo', data: CUSTOM_FIELDS_FINANCIAL_INFO },
    { name: 'timeInfo', data: CUSTOM_FIELDS_TIME_INFO },
  ];

  const [form] = Form.useForm();

  const [indeterminate, setIndeterminate] = useState(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const basicInfoValue = Form.useWatch('basicInfo', form);
  const carrierInfoValue = Form.useWatch('carrierInfo', form);
  const transportInfoValue = Form.useWatch('transportInfo', form);
  const financialInfoValue = Form.useWatch('financialInfo', form);
  const timeInfoValue = Form.useWatch('timeInfo', form);

  const handleOk = async () => {
    const values = form.getFieldsValue();
    const {
      basicInfo = [],
      carrierInfo = [],
      transportInfo = [],
      financialInfo = [],
      timeInfo = [],
    } = values;
    const payload = {
      fields: [
        'Waybill Number (Booking Number)',
        ...basicInfo,
        ...carrierInfo,
        ...transportInfo,
        ...financialInfo,
        ...timeInfo,
      ],
    };
    setLoading(true);
    const res = await waybillStatementFieldsAdd(payload).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      message.success('The exported fields have been saved');
      onCancel?.();
    }
  };

  function getCommonValues(
    jsonArray: ({ label: string; value: string } | null)[],
    strArray: string[],
  ) {
    const strSet = new Set(strArray);
    return jsonArray
      ?.filter(Boolean)
      .map((item) => item?.value)
      .filter((value) => strSet.has(value!));
  }

  const fillData = (data: string[]) => {
    if (data.length === 0) {
      form.resetFields();
      return;
    }
    const basicInfoValues = getCommonValues(
      CUSTOM_FIELDS_WAYBILL_BASIC_INFO.children,
      data,
    );
    const carrierInfoValues = getCommonValues(
      CUSTOM_FIELDS_CARRIER_INFO.children,
      data,
    );
    const transportInfoValues = getCommonValues(
      CUSTOM_FIELDS_TRANSPORT_INFO.children,
      data,
    );
    const financialInfoValues =
      getCommonValues(CUSTOM_FIELDS_FINANCIAL_INFO.children, data) ?? [];
    const timeInfoValues = getCommonValues(
      CUSTOM_FIELDS_TIME_INFO.children,
      data,
    );
    form.setFieldsValue({
      basicInfo: basicInfoValues,
      carrierInfo: carrierInfoValues,
      transportInfo: transportInfoValues,
      financialInfo: financialInfoValues,
      timeInfo: timeInfoValues,
    });
  };
  const handleCheckAllChange = (e: any) => {
    const checked = e.target.checked;
    const allOptions = CUSTOM_LIST.map((item) => item.data.children).flat();
    const allValues = allOptions.filter(Boolean)?.map((opt: any) => opt?.value);
    const newList = checked ? allValues : [];

    setIndeterminate(false);
    setCheckedAll(checked);
    fillData(newList);
  };

  const init = async () => {
    setModalLoading(true);
    const res = await getWaybillStatementFieldsList().finally(() => {
      setModalLoading(false);
    });

    if (res.code === 200) {
      const data = res.data ?? [];
      fillData(data);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const sourceLength =
      CUSTOM_FIELDS_WAYBILL_BASIC_INFO.children.length +
      CUSTOM_FIELDS_CARRIER_INFO.children.length +
      CUSTOM_FIELDS_TRANSPORT_INFO.children.length +
      CUSTOM_FIELDS_FINANCIAL_INFO.children.length +
      CUSTOM_FIELDS_TIME_INFO.children.length;
    const checkboxLength =
      basicInfoValue?.length +
      carrierInfoValue?.length +
      transportInfoValue?.length +
      financialInfoValue?.length +
      timeInfoValue?.length;

    setIndeterminate(!!checkboxLength && checkboxLength < sourceLength);
    setCheckedAll(checkboxLength === sourceLength);
  }, [
    basicInfoValue,
    carrierInfoValue,
    transportInfoValue,
    financialInfoValue,
    timeInfoValue,
  ]);

  return (
    <Modal
      title={'Custom Export Fields'}
      width={999}
      centered
      destroyOnClose
      maskClosable={false}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      {...restProps}
    >
      <Spin spinning={modalLoading}>
        <div className={styles.customExportFields}>
          <div className={styles.customExportFieldsAll}>
            Select the fields to be exported &nbsp;
            <Checkbox
              value=" Select All"
              indeterminate={indeterminate}
              checked={checkedAll}
              onChange={handleCheckAllChange}
            >
              Select All
            </Checkbox>
          </div>
          <Form form={form} layout="vertical">
            <div className={styles.customExportFieldsList}>
              {CUSTOM_LIST.map((item) => (
                <Form.Item label={null} name={item.name} key={item.name}>
                  <CustomCheckboxItem
                    key={item.data.value}
                    options={item.data.children}
                    customFieldName={item.data.label}
                  />
                </Form.Item>
              ))}
              {/* <Form.Item label={null} name="financialInfo">
              <CustomCheckboxItem
                options={CUSTOM_FIELDS_FINANCIAL_INFO.children}
                customFieldName={'Financial Info'}
              />
            </Form.Item> */}
            </div>
          </Form>
        </div>
      </Spin>
    </Modal>
  );
};

export default CustomExportModal;
