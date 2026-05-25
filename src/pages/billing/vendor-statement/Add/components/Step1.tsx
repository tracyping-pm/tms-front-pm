import { statementAddNoWaybill, statementQueryProject } from '@/api/billing';
import { IStatementAddReq } from '@/api/types/billing';
import { IProjectRecord } from '@/api/types/project';
import { vendorTaxMark } from '@/api/vendor';
import CommonCheckboxCombo from '@/components/CommonCheckboxCombo';
import CommonTitle from '@/components/CommonTitle';
import CustomTable from '@/components/CustomTable';
import CustomTooltip from '@/components/CustomTooltip';
import { ES_DTO_CLASS, LogisticsCategoryEnumText, PATHS } from '@/constants';
import {
  FieldQueryHighlightTypeEnum,
  LogisticsCategoryEnum,
  ProjectStatusEnum,
  ProjectStatusEnumColor,
  ProjectStatusEnumText,
  SettlementTimeTypeEnum,
  StatementTypeEnum,
  TaxTypeEnum,
  VendorSettledItemListOptions,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { ProColumns } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import {
  Affix,
  App,
  Badge,
  Button,
  DatePicker,
  Form,
  Radio,
  Select,
  Spin,
  TableProps,
} from 'antd';
import cls from 'classnames';
import { FC, useEffect, useState } from 'react';
import { buildPresets, DATE_WIDTH, DEFAULT_WIDTH } from '../constant';
import styles from './styles.less';

type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];
interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const { RangePicker } = DatePicker;

const Step1: FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { setShowStepBar, setStepData, doNext } = useModel(
    'bill.addVendorStatement',
  );

  const isBasedOnWaybillValue = Form.useWatch(
    'isStatementBasedOnWaybill',
    form,
  );
  const vendorNameValue = Form.useWatch('vendorName', form);

  const [generateBtnLoading, setGenerateBtnLoading] = useState(false);
  const [projectData, setProjectData] = useState<IProjectRecord[]>([]);
  const [projectLoading, setProjectLoading] = useState<boolean>(false);
  const [projectSelectedRowKeys, setProjectSelectedRowKeys] = useState<
    React.Key[]
  >([]);
  const [vendorTaxMarkLoading, setVendorTaxMarkLoading] =
    useState<boolean>(false);
  const [vendorTaxMarkValue, setVendorTaxMarkValue] = useState<string>('');
  const [presets, setPresets] = useState<any[]>([]);

  const {
    options: vendorNameOptions,
    onSearch: vendorNameSearch,
    defaultFieldProps: vendorNameDefaultFieldProps,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });

  const fetchProject = async () => {
    const values = form.getFieldsValue();
    const entityId = values?.vendorName?.value;
    if (entityId) {
      setProjectLoading(true);
      const res = await statementQueryProject({
        type: StatementTypeEnum.VENDOR,
        entityId,
      }).finally(() => {
        setProjectLoading(false);
      });

      if (res.code === 200) {
        setProjectData(res.data ?? []);
      }
    }
  };

  const fetchVendorTaxMark = async () => {
    const values = form.getFieldsValue();
    const entityId = values?.vendorName?.value;
    if (entityId) {
      setVendorTaxMarkLoading(true);
      const res = await vendorTaxMark({
        id: entityId,
      }).finally(() => {
        setVendorTaxMarkLoading(false);
      });

      if (res.code === 200) {
        setVendorTaxMarkValue(res.data ?? '');

        let isTaxInclusiveValue;
        if (res.data === TaxTypeEnum.TAX_INCLUSIVE) {
          isTaxInclusiveValue = true;
        } else if (res.data === TaxTypeEnum.TAX_EXCLUSIVE) {
          isTaxInclusiveValue = false;
        } else {
          isTaxInclusiveValue = undefined;
        }
        form.setFieldsValue({ isTaxInclusive: isTaxInclusiveValue });
      }
    }
  };

  const handleGenerate = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    const payload: IStatementAddReq = {
      type: StatementTypeEnum.VENDOR,
      entityId: values.vendorName.value,
      billedProjectId: values.billedProjectId,
      reconciliationPeriodStart: values.reconciliationPeriod?.[0]?.format?.(
        'YYYY-MM-DD 00:00:00',
      ),
      reconciliationPeriodEnd: values.reconciliationPeriod?.[1]?.format?.(
        'YYYY-MM-DD 23:59:59',
      ),
      settlementTimeType: SettlementTimeTypeEnum.UNLOADING_TIME,
    };

    setGenerateBtnLoading(true);
    const res = await statementAddNoWaybill(payload).finally(() => {
      setGenerateBtnLoading(false);
    });
    if (res.code === 200) {
      message.success('Generate Success!');
      const detailId = res.data;
      history.replace(`${PATHS.BILLING_VENDOR_STATEMENT_DETAIL}/${detailId}`);
    }
  };

  const handleNext = async () => {
    await form.validateFields();
    if (projectSelectedRowKeys.length === 0) {
      message.error('Please select project!');
      return;
    }
    const formValues = form.getFieldsValue();
    const step1Data = {
      type: StatementTypeEnum.VENDOR,
      entityId: formValues.vendorName.value,
      reconciliationPeriodStart: formValues.reconciliationPeriod?.[0]?.format?.(
        'YYYY-MM-DD 00:00:00',
      ),
      reconciliationPeriodEnd: formValues.reconciliationPeriod?.[1]?.format?.(
        'YYYY-MM-DD 23:59:59',
      ),
      settlementTimeType: SettlementTimeTypeEnum.UNLOADING_TIME,
      projectIdList: projectSelectedRowKeys,
      settledItemList: formValues.settledItemList,
      isTaxInclusive: formValues.isTaxInclusive,
    };
    setStepData(0, step1Data);
    doNext();
  };

  const tableAlertRender = () => {
    return (
      <>
        <div className={styles.customTableAlert}>
          <span className="len">{projectData.length}</span> projects in total,
          <span className="len">{projectSelectedRowKeys.length}</span> projects
          selected
        </div>
      </>
    );
  };

  const onProjectSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setProjectSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys: projectSelectedRowKeys,
    onChange: onProjectSelectChange,
  };

  const projectColumns: ProColumns[] = [
    {
      title: 'Project Name',
      dataIndex: 'projectName',
      ellipsis: {
        showTitle: false,
      },
      width: 300,
      render: (_, record) => {
        return (
          <CustomTooltip title={record.projectName}>
            {record.projectName}
          </CustomTooltip>
        );
      },
    },
    {
      title: 'Project Status',
      dataIndex: 'projectStatus',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const status: ProjectStatusEnum = record.projectStatus;
        const Content = (
          <Badge
            color={ProjectStatusEnumColor[status]}
            text={ProjectStatusEnumText[status]}
          />
        );
        return <CustomTooltip title={Content}>{Content}</CustomTooltip>;
      },
    },
    {
      title: 'Logistics Category',
      dataIndex: 'logisticsCategory',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => {
        const logisticsCategory: LogisticsCategoryEnum =
          record.logisticsCategory;
        const logisticsCategoryValue =
          LogisticsCategoryEnumText[logisticsCategory];
        return (
          <CustomTooltip title={logisticsCategoryValue}>
            {logisticsCategoryValue}
          </CustomTooltip>
        );
      },
    },
  ];

  useEffect(() => {
    setShowStepBar(!!isBasedOnWaybillValue);

    if (isBasedOnWaybillValue) {
      setProjectSelectedRowKeys([]);

      if (vendorNameValue) {
        fetchProject();
        fetchVendorTaxMark();
      } else {
        setProjectData([]);
        setVendorTaxMarkValue('');
        form.setFieldsValue({ isTaxInclusive: undefined });
      }
    } else {
      setProjectData([]);
      form.setFieldsValue({ billedProjectId: undefined });
      fetchProject();
    }
  }, [isBasedOnWaybillValue, vendorNameValue]);

  return (
    <>
      <div className={styles.step1}>
        <section className="basic-setting">
          <CommonTitle title="Basic Setting" />
          <Form
            form={form}
            name="vendor-statement-basic-settings"
            // layout="vertical"
          >
            <div className="case-item">
              <Form.Item
                name={'isStatementBasedOnWaybill'}
                label="Is statement based on waybill"
                initialValue={true}
                rules={[
                  {
                    required: true,
                    message: 'Please select',
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value={true}> Yes </Radio>
                  <Radio value={false}> No </Radio>
                </Radio.Group>
              </Form.Item>
            </div>

            <div className="case-item">
              <div className="inline-form">
                <div className="inline-form-item">
                  <Form.Item
                    name={'vendorName'}
                    label={'Vendor Name'}
                    rules={[
                      {
                        required: true,
                        message: 'Please Select Vendor',
                      },
                    ]}
                  >
                    <Select
                      {...vendorNameDefaultFieldProps}
                      placeholder="Vendor Name"
                      options={vendorNameOptions}
                      onSearch={vendorNameSearch}
                      style={{ width: DEFAULT_WIDTH }}
                    />
                  </Form.Item>
                </div>

                {/* {isBasedOnWaybillValue && (
                  <div className="inline-form-item">
                    <Form.Item
                      name={'settlementTimeType'}
                      label={'Settlement Time Type'}
                      rules={[
                        {
                          required: true,
                          message: 'Please Select Settlement Time Type',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Settlement Time Type"
                        options={SettlementTimeTypeOptions}
                        allowClear
                        style={{ width: DEFAULT_WIDTH }}
                      />
                    </Form.Item>
                  </div>
                )} */}

                <div className="inline-form-item">
                  <Form.Item
                    name={'reconciliationPeriod'}
                    label={'Reconciliation Period'}
                    rules={[
                      {
                        required: true,
                        message: 'Please Select Reconciliation Period',
                      },
                    ]}
                  >
                    <RangePicker
                      placeholder={[
                        isBasedOnWaybillValue
                          ? 'Unloading Time Start'
                          : 'Time Start',
                        isBasedOnWaybillValue
                          ? 'Unloading Time End'
                          : 'Time End',
                      ]}
                      presets={presets}
                      // showTime
                      allowClear
                      onOpenChange={(boolean) => {
                        if (boolean) {
                          setPresets(buildPresets());
                        }
                      }}
                      style={{ width: DATE_WIDTH }}
                    />
                  </Form.Item>
                </div>
                {!isBasedOnWaybillValue && (
                  <div className="inline-form-item">
                    <Form.Item
                      name={'billedProjectId'}
                      label={'Billed Project'}
                      rules={[
                        {
                          required: true,
                          message: 'Please Select Billed Project',
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        loading={projectLoading}
                        placeholder="Please Select Billed Project"
                        options={projectData.map((item) => ({
                          label: item.projectName,
                          value: item.id,
                          projectStatus: item.projectStatus,
                        }))}
                        allowClear
                        style={{ width: 300 }}
                        optionRender={(option) => {
                          return (
                            <div className={styles.billedProjectOption}>
                              <div className={styles.billedProjectOptionLabel}>
                                {option.data.label}
                              </div>
                              <div className={styles.billedProjectOptionRState}>
                                {option.data?.projectStatus}
                              </div>
                            </div>
                          );
                        }}
                        filterOption={(input, option) => {
                          return (
                            (option as { label: string; value: number })
                              ?.label ?? ''
                          )
                            .toLowerCase()
                            .includes(input.toLowerCase());
                        }}
                      />
                    </Form.Item>
                  </div>
                )}
              </div>
            </div>

            {isBasedOnWaybillValue && (
              <>
                <div className="case-item">
                  <Form.Item
                    name={'settledItemList'}
                    label={'Items To Be Settled'}
                    rules={[
                      {
                        required: true,
                        message: 'Please Select Items',
                      },
                    ]}
                  >
                    <CommonCheckboxCombo
                      plainOptions={VendorSettledItemListOptions}
                    />
                  </Form.Item>
                </div>

                <div className="case-item">
                  <div className="inline-form">
                    <div className="inline-form-item">
                      <Form.Item label={'Vendor Tax Mark'} layout="horizontal">
                        <span>
                          {vendorTaxMarkLoading ? (
                            <Spin spinning={true} size="small" />
                          ) : (
                            vendorTaxMarkValue || '-'
                          )}
                        </span>
                      </Form.Item>
                    </div>

                    <div
                      className="inline-form-item"
                      style={{ marginLeft: '200px' }}
                    >
                      <Form.Item
                        name={'isTaxInclusive'}
                        label="Is the Settlement Tax-inclusive"
                        rules={[
                          {
                            required: true,
                            message: 'Please Confirm Tax-inclusive',
                          },
                        ]}
                      >
                        <Radio.Group>
                          <Radio value={true}> Yes </Radio>
                          <Radio value={false}> No </Radio>
                        </Radio.Group>
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Form>
        </section>
        {isBasedOnWaybillValue && (
          <section className="projects">
            <CommonTitle
              title={
                <span className={cls(styles.requiredLike, 'required-like')}>
                  Billed Projects
                </span>
              }
            />
            <CustomTable
              className="project-list"
              columns={projectColumns}
              scroll={{ y: 500 }}
              loading={projectLoading}
              dataSource={projectData}
              search={false}
              pagination={false}
              fixedSpin={false}
              rowSelection={rowSelection}
              tableAlertRender={tableAlertRender}
              manualRequest
            />
          </section>
        )}

        <Affix offsetBottom={0}>
          <section className={cls('footer', styles.footer)}>
            <div className="btns">
              {isBasedOnWaybillValue ? (
                <Button type="primary" onClick={() => handleNext()}>
                  Next
                </Button>
              ) : (
                <Button
                  type="primary"
                  loading={generateBtnLoading}
                  onClick={() => handleGenerate()}
                >
                  Generate
                </Button>
              )}
            </div>
          </section>
        </Affix>
      </div>
    </>
  );
};

export default Step1;
