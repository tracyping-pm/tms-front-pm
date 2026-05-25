import { contractCheckContractNumber } from '@/api/contract';
import { followUpAdd } from '@/api/followUp';
import {
  opportunityDetail as getOpportunityDetail,
  opportunityCheckHaveProject,
  opportunityUserSelector,
} from '@/api/opportunity';
import { getTruckTypeList } from '@/api/truck';
import {
  IOpportunityDetailData,
  IOpportunityUserSelectorRecord,
} from '@/api/types/opportunity';
import { ITruckTypeListItem } from '@/api/types/truck';
import CountryIcon from '@/components/CountryIcon';
import CustomQuillFormItem from '@/components/CustomQuillFormItem';
import DraggerUpload from '@/components/CustomUpload/DraggerUpload';
import FuzzySelector from '@/components/FuzzySelector';
import {
  ES_DTO_CLASS,
  FUEL_CHANGE_FREQUENCY,
  MAX_LENGTH,
  PIC_TYPE,
  REGEXP,
} from '@/constants';
import {
  BUEnum,
  BUEnumText,
  CurrentRequirementEnumText,
  DistanceEnumText,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
  OpportunitiesStatusEnum,
  OpportunitiesStatusEnumText,
  PotentialRequirementEnumText,
  RequirementFrequencyEnumText,
  RequirementTypeEnumText,
  UploadPathTypeEnum,
  VisitTypeEnum,
  VisitTypeEnumText,
} from '@/enums';
import { formatAmount, isUndefinedOrNull } from '@/utils/utils';
import { CheckCircleFilled } from '@ant-design/icons';
import {
  ProFormDatePicker,
  ProFormRadio,
  ProFormSelect,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { useSetState } from 'ahooks';
import {
  App,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Radio,
  Row,
  Skeleton,
} from 'antd';
import { RuleObject } from 'antd/es/form';
import Select, { DefaultOptionType } from 'antd/es/select';
import cls from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import { FC, useCallback, useEffect, useState } from 'react';
import CustomBdAndCamPic from '../CustomBdAndCamPic';
import CustomPotentialVolume from '../CustomPotentialVolume';
import styles from './index.less';
import {
  getStatusListByCurrent,
  SHOW_OPPORTUNITY_INFORMATION_STATUS_LIST,
  SHOW_REASON_STATUS_LIST,
  SHOW_VISIT_ACTIVITY_STATUS_LIST,
  TEXTAREA_AUTO_SIZE,
  TEXTAREA_MAX_LENGTH,
} from './support';
const { RangePicker } = DatePicker;
const FORM_NAME = 'followingUp_form';

interface IOpportunityDetailState {
  pending: boolean;
  detail: IOpportunityDetailData;
}

const DEFAULT_OPPORTUNITY_DETAIL_STATE: IOpportunityDetailState = {
  pending: false,
  detail: {} as IOpportunityDetailData,
};

export interface IFollowingUpProps extends ModalProps {
  id: number;
  onConfirm?: () => void;
}

const FollowingUpModal: FC<IFollowingUpProps> = ({
  title = 'Following Up Opportunity',
  id,
  open,
  onCancel,
  onConfirm,
  ...rest
}) => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const opportunityStatusValue = Form.useWatch('opportunityStatus', form);
  const fuelBasisValue = Form.useWatch('fuelBasis', form);
  const baseOnFuelValue = Form.useWatch('contractBasedOnFuel', form);
  const buValue = Form.useWatch('bu', form);
  const createNewProjectValue = Form.useWatch('createNewProject', form);
  const [opportunityDetailState, setOpportunityDetailState] =
    useSetState<IOpportunityDetailState>(DEFAULT_OPPORTUNITY_DETAIL_STATE);
  const [temporaryOpportunityStatus, setTemporaryOpportunityStatus] =
    useState<OpportunitiesStatusEnum>(OpportunitiesStatusEnum.REACH_OUT);
  const [fileUploading, setFileUploading] = useState(false);
  const [confirmBtnLoading, setConfirmBtnLoading] = useState(false);
  const [opportunityStatusOptions, setOpportunityStatusOptions] = useState<
    OpportunitiesStatusEnum[]
  >([]);
  const [serviceTruckTypeList, setServiceTruckTypeList] = useState<
    DefaultOptionType[]
  >([]);
  const [bdPicOptions, setBdPicOptions] = useState<DefaultOptionType[]>([]);
  const [pricingPicOptions, setPricingPicOptions] = useState<
    DefaultOptionType[]
  >([]);
  const [vdPicOptions, setVdPicOptions] = useState<DefaultOptionType[]>([]);
  const [contractSignerOptions, setContractSignerOptions] = useState<
    DefaultOptionType[]
  >([]);
  const [deletedMaterialIdList, setDeletedMaterialIdList] = useState<number[]>(
    [],
  );
  const [isHaveProject, setIsHaveProject] = useState<boolean>(true);

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setFileUploading(true);
    } else {
      setFileUploading(false);
    }
  }, []);

  const getTruckTypeListHandle = async () => {
    const res = await getTruckTypeList();
    let list: { label: string; value: number }[] = [];
    if (res.code === 200) {
      list = res?.data?.map((item: ITruckTypeListItem) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
    }
    setServiceTruckTypeList(list);
  };

  const getPicOptionsHandle = async () => {
    const res = await Promise.all([
      opportunityUserSelector(PIC_TYPE.LEAD_BD_PIC),
      opportunityUserSelector(PIC_TYPE.PRICING_PIC),
      opportunityUserSelector(PIC_TYPE.VD_PIC),
    ]);

    let list: DefaultOptionType[][] = [];
    res.forEach((item) => {
      const _list =
        item?.data?.map((_item: IOpportunityUserSelectorRecord) => {
          return {
            ..._item,
            label: _item.userAliasName,
            value: _item.id,
          };
        }) ?? [];
      list.push(_list);
    });
    setBdPicOptions(list[0]);
    setPricingPicOptions(list[1]);
    setVdPicOptions(list[2]);
  };

  const validateContractIdUnique = useCallback(async () => {
    const contractNumber = form.getFieldValue('contractNumber');
    if (!contractNumber) {
      return;
    }
    const res = await contractCheckContractNumber({ contractNumber });
    if (res.code === 200) {
      if (res.data === 1) {
        form.setFields([
          {
            name: `contractNumber`,
            errors: ['Contract Number already exists'],
          },
        ]);
      }
    }
  }, []);

  const getDeleteMaterialId = (v: number) => {
    const idList = [...deletedMaterialIdList];
    idList.push(v);
    setDeletedMaterialIdList(idList);
  };

  const reset = useCallback(() => {
    form?.resetFields();
  }, []);

  const onFill = useCallback((curRecord: IOpportunityDetailData) => {
    const obj = curRecord;
    form?.setFieldsValue(obj);
    if (obj.potentialVolumeQuantity) {
      form?.setFieldsValue({
        potentialVolumeObj: {
          potentialVolumeQuantity: obj.potentialVolumeQuantity,
          potentialVolumeFrequency: obj.potentialVolumeFrequency,
        },
        picObj: {
          picType: obj.picType,
          picUserRoleId: obj.picUserRoleId,
        },
      });
    }
    form?.setFieldsValue({
      picObj: {
        picType: obj.picType,
        picUserRoleId: obj.picUserRoleId,
      },
      contractSigner: obj.leadId || obj.customerId,
    });
    setContractSignerOptions([
      { label: obj.customerName, value: obj.leadId || obj.customerId },
    ]);
  }, []);

  const handleOk = async () => {
    const fieldErrors = await form.getFieldsError?.();
    const hasErrorList = fieldErrors?.filter((item) => item.errors?.length);
    if (hasErrorList?.length > 0) {
      const fieldName = hasErrorList[0].name?.[0];
      const fieldId = `${FORM_NAME}_${fieldName}`;
      const fieldNode = document.getElementById(fieldId);
      if (fieldNode) {
        fieldNode.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    const values = await form.validateFields();
    const payload = {
      ...values,
      ...values.picObj,
      opportunityId: id,
      projectId: values?.projectIdObj?.id,
      potentialVolumeQuantity:
        values?.potentialVolumeObj?.potentialVolumeQuantity,
      potentialVolumeFrequency: values?.potentialVolumeObj
        ?.potentialVolumeQuantity
        ? values?.potentialVolumeObj?.potentialVolumeFrequency
        : undefined,
      quotationRequestReceivedDate: values.quotationRequestReceivedDate
        ? dayjs(values.quotationRequestReceivedDate).format('YYYY-MM-DD')
        : undefined,
      quotationSubmittedDate: values.quotationSubmittedDate
        ? dayjs(values.quotationSubmittedDate).format('YYYY-MM-DD')
        : undefined,
      rfqBiddingDeadlineDate: values.rfqBiddingDeadlineDate
        ? dayjs(values.rfqBiddingDeadlineDate).format('YYYY-MM-DD')
        : undefined,
      contractStartDate: values.contractValidityPeriod?.[0]
        ? dayjs(values.contractValidityPeriod?.[0]).format('YYYY-MM-DD')
        : undefined,
      contractEndDate: values.contractValidityPeriod?.[1]
        ? dayjs(values.contractValidityPeriod?.[1]).format('YYYY-MM-DD')
        : undefined,
    };
    delete payload.potentialVolumeObj;
    delete payload.picObj;
    delete payload.contractValidityPeriod;
    delete payload.projectIdObj;
    setConfirmBtnLoading(true);
    const res = await followUpAdd(payload).finally(() => {
      setConfirmBtnLoading(false);
    });
    if (res.code === 200) {
      if (
        payload.opportunityStatus === OpportunitiesStatusEnum.SUCCESSFUL_CLOSED
      ) {
        modal.confirm({
          icon: <CheckCircleFilled style={{ color: '#52C41A' }} />,
          title: 'Success',
          content:
            'The Opportunities has been successfully closed.and the TMS has automatically created the project information',
          okText: 'View Project',
          onOk: () => {
            history.push(res.data);
          },
          onCancel: () => {
            onConfirm?.();
          },
        });
      } else {
        message.success('Follow Up Add Successful!');
      }
      onConfirm?.();
    }
  };

  const getDetail = useCallback(async () => {
    setOpportunityDetailState({ pending: true });
    const res = await getOpportunityDetail(Number(id)).finally(() => {
      setOpportunityDetailState({ pending: false });
    });
    if (res.code === 200) {
      setOpportunityDetailState({ detail: res.data });
      setOpportunityStatusOptions(
        getStatusListByCurrent(res.data.opportunityStatus),
      );
      setTemporaryOpportunityStatus(res.data.opportunityStatus);
      onFill(res.data);
    }
  }, [id]);

  const checkHaveProject = useCallback(async () => {
    const res = await opportunityCheckHaveProject(Number(id));
    if (res.code === 200) {
      if (!res.data) {
        setIsHaveProject(res.data);
        form?.setFieldsValue({
          createNewProject: !res.data,
        });
      }
    }
  }, [id]);

  const init = useCallback(() => {
    getDetail();
    checkHaveProject();
    getTruckTypeListHandle();
    getPicOptionsHandle();
  }, []);

  useEffect(() => {
    if (open) {
      init();
    } else {
      reset();
    }
  }, [open]);

  useEffect(() => {
    setTemporaryOpportunityStatus(opportunityStatusValue);
    if (!SHOW_REASON_STATUS_LIST.includes(opportunityStatusValue)) {
      setTimeout(() => {
        form.validateFields(['remarkOrReason']);
      }, 0);
    }
    if (
      SHOW_OPPORTUNITY_INFORMATION_STATUS_LIST.includes(opportunityStatusValue)
    ) {
      // 若更新为Quotation Submitted，且RFQ Submit Date为空；则当前日期自动填入RFQ Submit Date
      const quotationSubmittedDate = form.getFieldValue(
        'quotationSubmittedDate',
      );
      if (!quotationSubmittedDate) {
        form.setFieldsValue({
          quotationSubmittedDate: dayjs().format("'YYYY-MM-DD'"),
        });
      }
    }
  }, [opportunityStatusValue]);

  return (
    <>
      <Modal
        title={title}
        open={open}
        width={1000}
        destroyOnClose
        maskClosable={false}
        onCancel={(e: React.MouseEvent<HTMLButtonElement>) => onCancel?.(e)}
        {...rest}
        footer={
          <div className={styles.modalFooter}>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                onCancel?.(e)
              }
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={fileUploading || confirmBtnLoading}
              onClick={handleOk}
            >
              {fileUploading ? 'Waiting Material Uploading' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <div
          className={cls('following-up', styles.followingUpdContainer)}
          style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'hidden' }}
        >
          <div className="top-tips">Please enter following up records</div>
          {opportunityDetailState.pending ? (
            <Skeleton active={true} />
          ) : (
            <Form
              name={FORM_NAME}
              form={form}
              layout="vertical"
              scrollToFirstError
              initialValues={{ createNewProject: true }}
            >
              <Form.Item
                name={'projectName'}
                label={'Project Name'}
                rules={[
                  {
                    required: true,
                    message: 'Please Enter Project Name',
                  },
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                name={'opportunityStatus'}
                label={'Status'}
                rules={[
                  {
                    required: true,
                    message: 'Please Select Status',
                  },
                ]}
              >
                <Radio.Group>
                  {opportunityStatusOptions.map((status) => (
                    <Radio key={status} value={status}>
                      {OpportunitiesStatusEnumText[status]}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name={'remarkOrReason'}
                label={
                  SHOW_REASON_STATUS_LIST.includes(temporaryOpportunityStatus)
                    ? 'Reason'
                    : 'Remark'
                }
                rules={[
                  {
                    required: SHOW_REASON_STATUS_LIST.includes(
                      temporaryOpportunityStatus,
                    )
                      ? true
                      : false,
                    message: `Please Enter ${
                      SHOW_REASON_STATUS_LIST.includes(
                        temporaryOpportunityStatus,
                      )
                        ? 'Reason'
                        : 'Remark'
                    }`,
                  },
                ]}
              >
                <Input.TextArea showCount maxLength={TEXTAREA_MAX_LENGTH} />
              </Form.Item>

              {SHOW_VISIT_ACTIVITY_STATUS_LIST.includes(
                temporaryOpportunityStatus,
              ) && (
                <div>
                  <Divider plain>{'Visit Activity'}</Divider>
                  <Form.Item
                    name={'visitType'}
                    label={'Visit Type'}
                    rules={[
                      {
                        required: true,
                        message: 'Please Select Visit Type',
                      },
                    ]}
                  >
                    <Radio.Group>
                      <Radio value={VisitTypeEnum.ONSITE_VISIT}>
                        {VisitTypeEnumText[VisitTypeEnum.ONSITE_VISIT]}
                      </Radio>
                      <Radio value={VisitTypeEnum.CALL}>
                        {VisitTypeEnumText[VisitTypeEnum.CALL]}
                      </Radio>
                      <Radio value={VisitTypeEnum.MESSAGE}>
                        {VisitTypeEnumText[VisitTypeEnum.MESSAGE]}
                      </Radio>
                      <Radio value={VisitTypeEnum.EMAIL}>
                        {VisitTypeEnumText[VisitTypeEnum.EMAIL]}
                      </Radio>
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name={'visitObjective'}
                    label={'Visit Objective'}
                    rules={[
                      {
                        required: true,
                        message: 'Please Enter Visit Objective',
                      },
                    ]}
                  >
                    <Input.TextArea showCount maxLength={TEXTAREA_MAX_LENGTH} />
                  </Form.Item>

                  <CustomQuillFormItem
                    name={'visitContent'}
                    label={'Visit Content'}
                    rules={[
                      {
                        required: true,
                        message: 'Please Enter Visit Content',
                      },
                      {
                        validator: (_, value) => {
                          if (value?.length >= MAX_LENGTH.MAX_2000) {
                            return Promise.reject(
                              `Visit Content Cannot Exceed ${MAX_LENGTH.MAX_2000} Characters`,
                            );
                          } else {
                            return Promise.resolve();
                          }
                        },
                      },
                    ]}
                    minHeight={100}
                  />

                  <Form.Item
                    name={'actionPlan'}
                    label={'Action Plan'}
                    rules={[
                      {
                        required: true,
                        message: 'Please Enter Action Plan',
                      },
                    ]}
                  >
                    <Input.TextArea
                      showCount
                      maxLength={TEXTAREA_MAX_LENGTH}
                      autoSize={TEXTAREA_AUTO_SIZE}
                    />
                  </Form.Item>

                  <Form.Item name="materialIds" label="Material">
                    <DraggerUpload
                      materialList={[]}
                      dto={{
                        entityId: Number(id),
                        pathType: UploadPathTypeEnum.OPPORTUNITY_FOLLOW_UP,
                      }}
                      getUploadingSize={getUploadingSize}
                    />
                  </Form.Item>
                </div>
              )}

              {SHOW_OPPORTUNITY_INFORMATION_STATUS_LIST.includes(
                temporaryOpportunityStatus,
              ) && (
                <div>
                  <Divider plain>{'Customer Contract'}</Divider>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="contractNumber"
                        label="Contract Number"
                        preserve
                        rules={[
                          {
                            required: true,
                            message: 'Please enter Contract Number',
                          },
                          {
                            whitespace: true,
                            message: 'Cannot only contain spaces',
                          },
                          {
                            max: MAX_LENGTH.MAX_2000,
                            message: `Cannot exceed ${MAX_LENGTH.MAX_2000} characters`,
                          },
                        ]}
                      >
                        <Input
                          placeholder="Please Enter Contract Number"
                          onBlur={() => validateContractIdUnique()}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="contractSigner"
                        label="Contract Signer"
                        rules={[
                          {
                            required: true,
                            message: 'Please select Contract Signer',
                          },
                        ]}
                      >
                        <Select
                          disabled={true}
                          placeholder="Please Select Contract Signer"
                          options={contractSignerOptions}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="fuelBasis"
                        label="Fuel Basis"
                        rules={[
                          {
                            pattern: REGEXP.POSITIVE_INTEGER_D2,
                            message: `Please enter a number with no more than 8 integer digits and no more than 2 decimal digits.`,
                          },
                        ]}
                      >
                        <InputNumber
                          placeholder="Please Enter Fuel Basis"
                          controls={false}
                          formatter={(value: any) => formatAmount(value)}
                          prefix={<CountryIcon />}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="contractBasedOnFuel"
                        label="Does the contract vary based on fuel?"
                      >
                        <Radio.Group
                          disabled={isUndefinedOrNull(fuelBasisValue)}
                        >
                          <Radio value={true}>Yes</Radio>
                          <Radio value={false}>No</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="fuelChangeFrequency"
                        label="Fuel change frequency"
                      >
                        <Select
                          disabled={
                            baseOnFuelValue === false ||
                            isUndefinedOrNull(baseOnFuelValue)
                          }
                          placeholder="Please Select Fuel change frequency"
                          options={FUEL_CHANGE_FREQUENCY}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="contractValidityPeriod"
                        label="Contract Validity Period"
                        rules={[
                          {
                            type: 'array',
                            required: true,
                            message: 'Please select Contract Validity Period',
                          },
                          {
                            validator: (
                              _: RuleObject,
                              value: [Dayjs, Dayjs],
                            ) => {
                              const [, end] = value ?? [];
                              if (
                                end &&
                                end?.isBefore(dayjs().add(-1, 'day'))
                              ) {
                                return Promise.reject(
                                  'The end date cannot be earlier than the current date',
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <RangePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        name="contractMaterialIdList"
                        label="Customer Contract"
                        rules={[
                          {
                            required: true,
                            message: 'Please upload Customer Contract',
                          },
                        ]}
                      >
                        <DraggerUpload
                          showModeBar={false}
                          scrollHeight={150}
                          dto={{
                            pathType: UploadPathTypeEnum.CONTRACT,
                            customParamMap: {
                              projectName:
                                opportunityDetailState?.detail?.projectName,
                            },
                          }}
                          getUploadingSize={getUploadingSize}
                          getDeleteMaterialId={getDeleteMaterialId}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Divider plain>{'Project'}</Divider>
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="createNewProject"
                        label="Opportunity conversion method"
                        rules={[
                          {
                            required: true,
                            message:
                              'Please select Opportunity conversion method',
                          },
                        ]}
                      >
                        <Radio.Group disabled={!isHaveProject}>
                          <Radio value={true}>Create a new project</Radio>
                          <Radio value={false}>
                            merge into an exist project
                          </Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                    {!createNewProjectValue && (
                      <>
                        <Col span={12}>
                          <Form.Item
                            name="projectIdObj"
                            label="Project to merge"
                            rules={[
                              {
                                required: true,
                                message: `Please select Project to merge`,
                              },
                            ]}
                          >
                            <FuzzySelector
                              fieldProps={{
                                placeholder: 'Please select Project to merge',
                              }}
                              request={{
                                field: 'projectName',
                                esDtoClass: ES_DTO_CLASS.PROJECT,
                                type: FieldQueryHighlightTypeEnum.USER_ROLE,
                                uniqueLogic:
                                  FieldQueryHighlightUniqueLogicEnum.OPPORTUNITY_PROJECT,
                                uniqueLogicParams: { opportunityId: id },
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="opportunityContentList"
                            label="Opportunity content"
                            rules={[
                              {
                                required: true,
                                message: 'Please select Opportunity content',
                              },
                            ]}
                          >
                            <Checkbox.Group>
                              <Checkbox value={'New Routes'}>
                                New Routes
                              </Checkbox>
                              <Checkbox value={'New Trucks'}>
                                New Trucks
                              </Checkbox>
                              <Checkbox value={'New Service'}>
                                New Service
                              </Checkbox>
                            </Checkbox.Group>
                          </Form.Item>
                        </Col>
                      </>
                    )}
                  </Row>
                  <Divider plain>{'Opportunity Information'}</Divider>
                  <Row gutter={24}>
                    <Col span={12}>
                      <ProFormSelect
                        name="bu"
                        label="BU"
                        placeholder="Please Select BU"
                        valueEnum={BUEnumText}
                        rules={[
                          {
                            required: true,
                            message: `Please Select BU`,
                          },
                        ]}
                      />
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="picObj"
                        label="PIC"
                        initialValue={{
                          picType: opportunityDetailState.detail.picType,
                          picUserRoleId:
                            opportunityDetailState.detail.picUserRoleId,
                        }}
                        rules={[
                          {
                            required: true,
                            message: `Please Select PIC`,
                          },
                          {
                            validator: (_, value) => {
                              if (!value?.picUserRoleId && value?.picType) {
                                return Promise.reject('Please Select PIC');
                              } else if (
                                !value?.picType &&
                                value?.picUserRoleId
                              ) {
                                return Promise.reject(
                                  'Please Select BD OR CAM',
                                );
                              } else {
                                return Promise.resolve();
                              }
                            },
                          },
                        ]}
                      >
                        <CustomBdAndCamPic bdPicOptions={bdPicOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <ProFormSelect
                        name="pricingUserRoleId"
                        label="Strategy PIC"
                        placeholder="Please Select Strategy PIC"
                        showSearch
                        fieldProps={{
                          options: pricingPicOptions,
                          optionRender: (option) => {
                            return (
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span>{option.data.label}</span>
                                <span>{option.data?.roleName}</span>
                              </div>
                            );
                          },
                        }}
                        rules={[
                          {
                            required: true,
                            message: 'Please Select Strategy PIC',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <ProFormSelect
                        name="vdUserRoleId"
                        label="Procurement PIC"
                        placeholder="Please Select Procurement PIC"
                        showSearch
                        fieldProps={{
                          options: vdPicOptions,
                          optionRender: (option) => {
                            return (
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span>{option.data.label}</span>
                                <span>{option.data?.roleName}</span>
                              </div>
                            );
                          },
                        }}
                        rules={[
                          {
                            required: true,
                            message: 'Please Select Procurement PIC',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <ProFormRadio.Group
                        name="requirementType"
                        label="Requirement Type"
                        valueEnum={RequirementTypeEnumText}
                        rules={[
                          {
                            required: true,
                            message: 'Please Select Requirement Type',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <ProFormSelect
                        name="currentRequirementList"
                        label="Current Requirement"
                        placeholder="Please Select Current Requirement"
                        valueEnum={CurrentRequirementEnumText}
                        fieldProps={{
                          mode: 'multiple',
                        }}
                        rules={[
                          {
                            required: buValue !== BUEnum.WAREHOUSE_STORAGE,
                            message: 'Please Select Current Requirement',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <ProFormSelect
                        name="potentialRequirementList"
                        label="Potential Requirement"
                        placeholder="Please Select Potential Requirement"
                        valueEnum={PotentialRequirementEnumText}
                        fieldProps={{
                          mode: 'multiple',
                        }}
                        rules={[
                          {
                            required: true,
                            message: 'Please Select Potential Requirement',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <ProFormRadio.Group
                        name="requirementFrequency"
                        label="Requirement Frequency"
                        valueEnum={RequirementFrequencyEnumText}
                        rules={[
                          {
                            required: true,
                            message: 'Please Select Requirement Frequency',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="potentialVolumeObj"
                        label="Potential Volume"
                        rules={[
                          {
                            required: buValue !== BUEnum.WAREHOUSE_STORAGE,
                            message: 'Please Enter Potential Volume',
                          },
                          {
                            validator: (_, value) => {
                              if (
                                Number.isInteger(
                                  value?.potentialVolumeQuantity,
                                ) ||
                                !value?.potentialVolumeQuantity
                              ) {
                                return Promise.resolve();
                              } else {
                                return Promise.reject(
                                  'Enter a positive whole number',
                                );
                              }
                            },
                          },
                        ]}
                      >
                        <CustomPotentialVolume />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <ProFormRadio.Group
                        name="distance"
                        label="Distance"
                        valueEnum={DistanceEnumText}
                        rules={[
                          {
                            required: buValue !== BUEnum.WAREHOUSE_STORAGE,
                            message: 'Please Select Distance',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <ProFormDatePicker
                        name="quotationRequestReceivedDate"
                        label="Quotation Request Received Date"
                        placeholder="Please Select Quotation Request Received Date"
                        fieldProps={{
                          format: (value: Dayjs) => value.format('YYYY-MM-DD'),
                          style: {
                            width: '100%',
                          },
                        }}
                        rules={[
                          {
                            required: true,
                            message:
                              'Please Select Quotation Request Received Date',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <ProFormDatePicker
                        name="quotationSubmittedDate"
                        label="Quotation Submitted Date"
                        placeholder="Please Select Quotation Submitted Date"
                        fieldProps={{
                          format: (value: Dayjs) => value.format('YYYY-MM-DD'),
                          style: {
                            width: '100%',
                          },
                        }}
                        rules={[
                          {
                            required: true,
                            message: 'Please Select Quotation Submitted Date',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <ProFormDatePicker
                        name="rfqBiddingDeadlineDate"
                        label="RFQ Bidding Deadline Date"
                        placeholder="Please Select RFQ Bidding Deadline Date"
                        fieldProps={{
                          format: (value: Dayjs) => value.format('YYYY-MM-DD'),
                          style: {
                            width: '100%',
                          },
                        }}
                        rules={[
                          {
                            required: true,
                            message: 'Please Select RFQ Bidding Deadline Date',
                          },
                        ]}
                      />
                    </Col>

                    <Col span={12}>
                      <ProFormSelect
                        name="serviceTruckTypeIds"
                        label="Service Truck"
                        placeholder="Please Select Service Truck"
                        fieldProps={{
                          filterOption: (input, option) => {
                            return (
                              (option as { label: string; value: number })
                                ?.label ?? ''
                            )
                              .toLowerCase()
                              .includes(input.toLowerCase());
                          },
                          options: serviceTruckTypeList,
                          mode: 'multiple',
                          showSearch: true,
                          maxTagCount: 3,
                          loading: serviceTruckTypeList.length === 0,
                        }}
                        rules={[
                          {
                            required: buValue !== BUEnum.WAREHOUSE_STORAGE,
                            message: 'Please Select Service Truck',
                          },
                        ]}
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </Form>
          )}
        </div>
      </Modal>
    </>
  );
};

export default FollowingUpModal;
