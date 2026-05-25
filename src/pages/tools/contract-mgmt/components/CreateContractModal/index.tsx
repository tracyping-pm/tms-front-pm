import {
  contractCheckContractNumber,
  contractQueryCustomerSigner,
  contractValidityPeriod,
} from '@/api/contract';
import { IImageState, ISourceImage } from '@/api/types/common';
import NoRequestFileItem from '@/components/CommonFileItem/NoRequestFileItem';
import CountryIcon from '@/components/CountryIcon';
import NoRequestUpload from '@/components/CustomUpload/NoRequestUpload';
import { getExts } from '@/components/CustomUpload/fileSupport';
import ImagePreviewGroup from '@/components/ImagePreviewGroup';
import {
  BELONG_IMG_EXTS,
  CONTRACT_TYPE_OPTIONS,
  ES_DTO_CLASS,
  FUEL_CHANGE_FREQUENCY,
  LIMIT_SIZE,
  MAX_LENGTH,
  REGEXP,
  initialImageState,
} from '@/constants';
import {
  ContractTypeEnum,
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { useFieldQuery } from '@/hooks/useFieldQuery';
import { formatString } from '@/utils/format';
import { formatAmount, isUndefinedOrNull } from '@/utils/utils';
import { useSetState } from 'ahooks';
import {
  App,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Radio,
  Row,
  Select,
} from 'antd';
import cls from 'classnames';
import dayjs from 'dayjs';
import { default as lodash, uniqueId } from 'lodash';
import { FC, useCallback, useEffect, useState } from 'react';
import styles from './index.less';

const { RangePicker } = DatePicker;

const TOTAL_LIMIT_SIZE = LIMIT_SIZE * 3;
const ACCEPT = '.pdf,.png,.jpeg,.jpg';
const FILE_WIDTH = 104;
const FILE_HEIGHT = 104;

export interface IDto {
  contractNumber: string;
  projectId: number;
  contractType: string;
  contractSignerId: number;
  startDate: string;
  endDate: string;
  fuelBasis: number;
  contractBasedOnFuel: boolean;
  fuelChangeFrequency: string;
}

interface IProps extends ModalProps {
  contractType?: string;
  projectInfo?: { id: number; name: string };
  onConfirm?: (dto: IDto, files: File[]) => void;
}

const CreateContractModal: FC<IProps> = ({
  contractType,
  projectInfo,
  open,
  onCancel,
  onConfirm,
  ...rest
}) => {
  const {
    options: projectNameOptions,
    onSearch: onProjectNameSearch,
    defaultFieldProps: projectNameDefaultFieldProps,
    resetAll: resetProjectName,
  } = useFieldQuery({
    field: 'projectName',
    esDtoClass: ES_DTO_CLASS.PROJECT,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.USER_ROLE,
  });
  const {
    options: contractSignerOptions,
    onSearch: onContractSignerSearch,
    defaultFieldProps: contractSignerDefaultFieldProps,
    resetAll: resetContractSigner,
  } = useFieldQuery({
    field: 'vendorName',
    esDtoClass: ES_DTO_CLASS.VENDOR,
    debounceTime: 500,
    type: FieldQueryHighlightTypeEnum.COUNTRY,
  });
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const projectNameValue = Form.useWatch('projectName', form);
  const contractTypeValue = Form.useWatch('contractType', form);
  const fuelBasisValue = Form.useWatch('fuelBasis', form);
  const baseOnFuelValue = Form.useWatch('contractBasedOnFuel', form);
  const [noRequestFiles, setNoRequestFiles] = useState<File[]>([]);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);

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

  const onCheckValidityPeriod = useCallback(async (id: number) => {
    const res = await contractValidityPeriod({ id });
    if (res.code === 200) {
      const startDate = res.data?.startDate;
      const endDate = res.data?.endDate;
      if (startDate && endDate) {
        form.setFieldsValue({
          contractValidityPeriod: [dayjs(startDate), dayjs(endDate)],
        });
      }
    }
  }, []);

  const onProjectNameChange = useCallback(async (value: any, option: any) => {
    form.resetFields(['contractType', 'contractSigner']);
    if (option) {
      form.setFieldsValue({
        projectName: lodash.merge(value, { id: option.id }),
      });
    }
    form.setFieldsValue({
      contractValidityPeriod: undefined,
    });
  }, []);

  const onContractTypeChange = useCallback((value: any) => {
    if (value === 'Vendor') {
      const projectId = form.getFieldValue('projectName')?.id;
      onCheckValidityPeriod(projectId);
    }
    form.setFieldsValue({
      contractValidityPeriod: undefined,
    });
  }, []);

  const onContractSingerChange = useCallback((value: any, option: any) => {
    if (option) {
      form.setFieldsValue({
        contractSigner: lodash.merge(value, { id: option.id }),
      });
    }
  }, []);

  const handleDeleteMaterial = (index: number) => {
    noRequestFiles.splice(index, 1);
    setNoRequestFiles([...noRequestFiles]);

    form.setFieldsValue({
      contractAttachment: [...noRequestFiles],
    });
  };

  const onFulfilled = async (file: File) => {
    noRequestFiles.push(file);
    setNoRequestFiles([...noRequestFiles]);

    form.setFieldsValue({
      contractAttachment: [...noRequestFiles],
    });
  };

  const checkTotalFileSizeLimit = useCallback(() => {
    let passed = true;
    const total = noRequestFiles.reduce((acc, current) => {
      return acc + current.size;
    }, 0);

    if (total > TOTAL_LIMIT_SIZE) {
      passed = false;
    }
    return passed;
  }, [noRequestFiles]);

  const onOk = useCallback(async () => {
    const values = await form.validateFields();
    const passed = checkTotalFileSizeLimit();
    if (!passed) {
      message.warning('The total size of the files cannot exceed 90M');
      return;
    }
    const dto: IDto = {
      contractNumber: formatString(values.contractNumber),
      projectId: values.projectName?.id,
      contractType: values.contractType,
      contractSignerId: values.contractSigner?.id,
      startDate: values.contractValidityPeriod?.[0]?.format?.('YYYY-MM-DD'),
      endDate: values.contractValidityPeriod[1]?.format?.('YYYY-MM-DD'),
      fuelBasis: values.fuelBasis,
      contractBasedOnFuel: values.contractBasedOnFuel,
      fuelChangeFrequency: values.fuelChangeFrequency,
    };
    const files = noRequestFiles;
    onConfirm?.(dto, files);
    console.log('dto', dto);
  }, [noRequestFiles]);

  const resetAll = useCallback(() => {
    form.resetFields();
    setNoRequestFiles([]);
    resetProjectName();
    resetContractSigner();
  }, []);

  const queryCustomerSigner = useCallback(async () => {
    const projectId = form.getFieldValue('projectName')?.id;
    const res = await contractQueryCustomerSigner({ id: projectId });
    if (res.code === 200) {
      form.setFields([
        {
          name: `contractSigner`,
          value: {
            id: res.data.signerId,
            name: res.data.signerName,
            label: res.data.signerName,
          },
          errors: [],
        },
      ]);
    }
  }, []);

  const initPreview = useCallback(async () => {
    const sourceImages: ISourceImage[] = [];
    noRequestFiles.forEach((file) => {
      const fileType = getExts(file);
      const isBelongImg = BELONG_IMG_EXTS.includes(fileType);
      if (isBelongImg) {
        const src = URL.createObjectURL(file);
        sourceImages.push({ src, material: file.name });
      }
      setImageState({
        sourceImages,
      });
    });
  }, [noRequestFiles]);

  const onCustomNoRequestPreview = (file: File) => {
    const index = lodash.findIndex(
      imageState.sourceImages,
      (v) => v.material === file.name,
    );
    setImageState({
      index,
      visible: true,
    });
  };

  useEffect(() => {
    if (baseOnFuelValue === true) {
      form.resetFields(['fuelChangeFrequency']);
    }
  }, [baseOnFuelValue]);

  useEffect(() => {
    if (isUndefinedOrNull(fuelBasisValue)) {
      form.resetFields(['contractBasedOnFuel', 'fuelChangeFrequency']);
    }
  }, [fuelBasisValue]);

  useEffect(() => {
    form.resetFields(['contractSigner']);
    if (contractTypeValue === ContractTypeEnum.CUSTOMER) {
      queryCustomerSigner();
    }
  }, [contractTypeValue]);

  useEffect(() => {
    if (projectInfo?.id) {
      form.setFieldsValue({
        projectName: lodash.merge(projectInfo, {
          id: projectInfo.id,
          label: projectInfo.name,
        }),
        contractType: contractType ?? undefined,
      });
    }
  }, [projectInfo]);

  useEffect(() => {
    if (!open) {
      resetAll();
    }
  }, [open]);

  useEffect(() => {
    // initPreview
    initPreview();
  }, [noRequestFiles]);

  return (
    <>
      <Modal
        title={`Create ${contractType ? contractType : ''} Contract`}
        open={open}
        width={720}
        okText="Confirm"
        onCancel={onCancel}
        onOk={onOk}
        destroyOnClose
        maskClosable={false}
        {...rest}
      >
        <div className={cls('createContractModal', styles.createContractModal)}>
          <Form
            form={form}
            name="create-contract"
            layout="vertical"
            preserve={false}
          >
            <Row gutter={[72, 0]}>
              <Col span={12}>
                <Form.Item
                  name="contractNumber"
                  label="Contract Number"
                  preserve
                  rules={[
                    { required: true, message: 'Please enter Contract Number' },
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
                  name="projectName"
                  label="Project Name"
                  rules={[
                    { required: true, message: 'Please select Project Name' },
                  ]}
                >
                  <Select
                    placeholder="Please Select Project"
                    options={projectNameOptions}
                    onSearch={onProjectNameSearch}
                    onChange={onProjectNameChange}
                    disabled={!!projectInfo?.id}
                    {...projectNameDefaultFieldProps}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[72, 0]}>
              <Col span={12}>
                <Form.Item
                  name="contractType"
                  label="Contract Type"
                  rules={[
                    { required: true, message: 'Please select Contract Type' },
                  ]}
                >
                  <Select
                    disabled={
                      isUndefinedOrNull(projectNameValue?.id) || !!contractType
                    }
                    placeholder="Please Select Contract Type"
                    options={CONTRACT_TYPE_OPTIONS}
                    onChange={onContractTypeChange}
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
                    disabled={
                      !contractTypeValue ||
                      contractTypeValue === ContractTypeEnum.CUSTOMER
                    }
                    placeholder="Please Select Contract Signer"
                    options={contractSignerOptions}
                    onSearch={(keywords) =>
                      onContractSignerSearch(keywords, {
                        uniqueLogic:
                          FieldQueryHighlightUniqueLogicEnum.CREATE_CONTRACT_VENDOR_CHOOSE,
                        uniqueLogicParams: {
                          projectId: form.getFieldValue('projectName')?.id,
                        },
                      })
                    }
                    onChange={onContractSingerChange}
                    {...contractSignerDefaultFieldProps}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[72, 0]}>
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
                  <Radio.Group disabled={isUndefinedOrNull(fuelBasisValue)}>
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[72, 0]}>
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
                    // {
                    //   validator: (_: RuleObject, value: [Dayjs, Dayjs]) => {
                    //     const [, end] = value ?? [];
                    //     if (end && end?.isBefore(dayjs().add(-1, 'day'))) {
                    //       return Promise.reject(
                    //         'The end date cannot be earlier than the current date',
                    //       );
                    //     }
                    //     return Promise.resolve();
                    //   },
                    // },
                  ]}
                >
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="contractAttachment"
              label="Contract Attachment"
              rules={[
                {
                  required: true,
                  message: 'Please upload Contract Attachment',
                },
              ]}
            >
              <div className="file-list">
                {noRequestFiles?.map((item: File, index: number) => (
                  <NoRequestFileItem
                    key={uniqueId()}
                    width={FILE_WIDTH}
                    height={FILE_HEIGHT}
                    file={item}
                    showDelete
                    onDeleteTrigger={() => handleDeleteMaterial(index)}
                    onCustomPreview={() => onCustomNoRequestPreview(item)}
                  />
                ))}

                <div className="file-with-tips">
                  <NoRequestUpload
                    width={FILE_WIDTH}
                    height={FILE_HEIGHT}
                    limitSize={LIMIT_SIZE}
                    accept={ACCEPT}
                    onFulfilled={onFulfilled}
                  />
                  <div className="file-tips">
                    <div className={styles.itemDesc}>
                      A single file cannot exceed 50 MB
                    </div>
                    Allow pdf, png, jpeg, jpg
                  </div>
                </div>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <ImagePreviewGroup
        visible={imageState.visible}
        items={imageState.sourceImages?.map((item: ISourceImage) => item.src)}
        index={imageState.index}
        onClose={() => setImageState({ visible: false })}
      />
    </>
  );
};

export default CreateContractModal;
