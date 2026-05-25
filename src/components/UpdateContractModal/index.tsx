import {
  contractCheckContractNumber,
  contractValidityPeriod,
} from '@/api/contract';
import { IImageState, ISourceImage } from '@/api/types/common';
import NoRequestFileItem from '@/components/CommonFileItem/NoRequestFileItem';
import CountryIcon from '@/components/CountryIcon';
import NoRequestUpload from '@/components/CustomUpload/NoRequestUpload';
import { getExts } from '@/components/CustomUpload/fileSupport';
import FuzzySelector from '@/components/FuzzySelector';
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
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { formatString } from '@/utils/format';
import { formatAmount, isUndefinedOrNull } from '@/utils/utils';
import { useSetState } from 'ahooks';
import {
  App,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Radio,
  Row,
  Select,
} from 'antd';
import { RuleObject } from 'antd/es/form';
import dayjs, { Dayjs } from 'dayjs';
import { default as lodash, uniqueId } from 'lodash';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

const { RangePicker } = DatePicker;

const TOTAL_LIMIT_SIZE = LIMIT_SIZE * 3;
const ACCEPT = '.pdf,.png,.jpeg,.jpg';
const FILE_WIDTH = 104;
const FILE_HEIGHT = 104;

export interface IUpdateContractDto {
  contractId: number;
  contractNumber: string;
  projectId: number;
  contractType: string;
  contractSignerId: number;
  startDate: string;
  endDate: string;
  fuelBasis: number;
  contractBasedOnFuel: boolean;
  fuelChangeFrequency: string;
  contractMaterialIdList?: number[];
}

interface IProps extends ModalProps {
  contractId: number;
  contractType: string;
  projectInfo: { id: number; name: string };
  contractSignerInfo: { id: number; name: string };
  onCancel?: () => void;
  onConfirm?: (dto: IUpdateContractDto, files: File[]) => void;
}

const UpdateContractModal: FC<IProps> = ({
  contractId,
  contractType,
  projectInfo,
  contractSignerInfo,
  open,
  onCancel,
  onConfirm,
  ...restProps
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const fuelBasisValue = Form.useWatch('fuelBasis', form);
  const baseOnFuelValue = Form.useWatch('contractBasedOnFuel', form);
  const [noRequestFiles, setNoRequestFiles] = useState<File[]>([]);
  const [imageState, setImageState] =
    useSetState<IImageState>(initialImageState);
  const lastVerifyRes = useRef<{ value: string; error?: string | null } | null>(
    null,
  );

  const checkUniqueContract = useCallback(async (_: any, value: string) => {
    // 1. 基础校验跳过
    if (!value || value.trim() === '') return Promise.resolve();

    // 2. 命中缓存：如果当前值与上次校验值一致，直接根据上次结果判断
    if (lastVerifyRes.current?.value === value) {
      if (lastVerifyRes.current.error) {
        return Promise.reject(new Error(lastVerifyRes.current.error));
      }
      return Promise.resolve();
    }

    try {
      // 3. 发起请求
      const res = await contractCheckContractNumber({ contractNumber: value });

      if (res?.code === 200 && res.data === 1) {
        const errMsg = 'Contract Number already exists';
        // 记录失败缓存
        lastVerifyRes.current = { value, error: errMsg };
        return Promise.reject(new Error(errMsg));
      }

      // 4. 记录成功缓存
      lastVerifyRes.current = { value, error: null };
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error('Verification failed, please try again'));
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
    form.resetFields(['contractType', 'contractSignerObj']);
    if (option) {
      form.setFieldsValue({
        projectNameObj: lodash.merge(value, { id: option.id }),
      });
    }
    form.setFieldsValue({
      contractValidityPeriod: undefined,
    });
  }, []);

  const onContractTypeChange = useCallback((value: any) => {
    if (value === 'Vendor') {
      const projectId = form.getFieldValue('projectNameObj')?.id;
      onCheckValidityPeriod(projectId);
    }
    form.setFieldsValue({
      contractValidityPeriod: undefined,
    });
  }, []);

  const onContractSingerChange = useCallback((value: any, option: any) => {
    if (option) {
      form.setFieldsValue({
        contractSignerObj: lodash.merge(value, { id: option.id }),
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
    const dto: IUpdateContractDto = {
      contractId,
      contractNumber: formatString(values.contractNumber),
      projectId: values.projectNameObj?.id,
      contractType: values.contractType,
      contractSignerId: values.contractSignerObj?.id,
      startDate: values.contractValidityPeriod?.[0]?.format?.('YYYY-MM-DD'),
      endDate: values.contractValidityPeriod[1]?.format?.('YYYY-MM-DD'),
      fuelBasis: values.fuelBasis,
      contractBasedOnFuel: values.contractBasedOnFuel,
      fuelChangeFrequency: values.fuelChangeFrequency,
    };
    console.log({ dto });

    const files = noRequestFiles;
    onConfirm?.(dto, files);
  }, [noRequestFiles]);

  const resetAll = useCallback(() => {
    form.resetFields();
    setNoRequestFiles([]);
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

  //   useEffect(() => {
  //     form.resetFields(['contractSignerObj']);
  //     if (contractTypeValue === ContractTypeEnum.CUSTOMER) {
  //       queryCustomerSigner();
  //     }
  //   }, [contractTypeValue]);

  useEffect(() => {
    form.setFieldsValue({
      contractType: contractType ?? undefined,
    });

    if (projectInfo?.id) {
      form.setFieldsValue({
        projectNameObj: lodash.merge(projectInfo, {
          id: projectInfo.id,
          label: projectInfo.name,
        }),
      });
    }

    if (contractSignerInfo?.id) {
      form.setFieldsValue({
        contractSignerObj: lodash.merge(contractSignerInfo, {
          id: contractSignerInfo.id,
          label: contractSignerInfo.name,
        }),
      });
    }
  }, [contractType, projectInfo, contractSignerInfo]);

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
        title={`Update Contract`}
        open={open}
        width={720}
        okText="Confirm"
        onCancel={onCancel}
        onOk={onOk}
        destroyOnClose
        maskClosable={false}
        {...restProps}
      >
        <Form
          form={form}
          name="update-contract"
          layout="vertical"
          preserve={false}
        >
          <Row gutter={[72, 0]}>
            <Col span={12}>
              <Form.Item
                name="contractNumber"
                label="Contract Number"
                // 关键：仅在失去焦点时触发校验
                validateTrigger="onBlur"
                // 关键：按顺序执行校验，前一个失败则不执行后面的异步请求
                validateFirst
                hasFeedback
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
                  { validator: checkUniqueContract },
                ]}
              >
                <Input placeholder="Please Enter Contract Number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="projectNameObj"
                label="Project Name"
                rules={[
                  { required: true, message: 'Please select Project Name' },
                ]}
              >
                <FuzzySelector
                  fieldProps={{
                    placeholder: 'Please Select Project',
                    onChange: onProjectNameChange,
                    disabled: true,
                  }}
                  request={{
                    field: 'projectName',
                    esDtoClass: ES_DTO_CLASS.PROJECT,
                    type: FieldQueryHighlightTypeEnum.USER_ROLE,
                  }}
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
                  disabled={true}
                  placeholder="Please Select Contract Type"
                  options={CONTRACT_TYPE_OPTIONS}
                  onChange={onContractTypeChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contractSignerObj"
                label="Contract Signer"
                rules={[
                  {
                    required: true,
                    message: 'Please select Contract Signer',
                  },
                ]}
              >
                <FuzzySelector
                  fieldProps={{
                    placeholder: 'Please Select Contract Signer',
                    onChange: onContractSingerChange,
                    disabled: true,
                  }}
                  request={{
                    field: 'vendorName',
                    esDtoClass: ES_DTO_CLASS.VENDOR,
                    type: FieldQueryHighlightTypeEnum.COUNTRY,
                    uniqueLogic:
                      FieldQueryHighlightUniqueLogicEnum.CREATE_CONTRACT_VENDOR_CHOOSE,
                    uniqueLogicParams: {
                      projectId: form.getFieldValue('projectNameObj')?.id,
                    },
                  }}
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
                  {
                    validator: (_: RuleObject, value: [Dayjs, Dayjs]) => {
                      const [, end] = value ?? [];
                      if (end && end?.isBefore(dayjs().add(-1, 'day'))) {
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
            <Flex wrap align="center" gap={24}>
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

              <Flex align="center" gap={16}>
                <NoRequestUpload
                  width={FILE_WIDTH}
                  height={FILE_HEIGHT}
                  limitSize={LIMIT_SIZE}
                  accept={ACCEPT}
                  onFulfilled={onFulfilled}
                />
                <div
                  style={{
                    width: '166px',
                    color: 'var(--character-title-45)',
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '22px',
                  }}
                >
                  <div>A single file cannot exceed 50 MB</div>
                  Allow pdf, png, jpeg, jpg
                </div>
              </Flex>
            </Flex>
          </Form.Item>
        </Form>
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

export default UpdateContractModal;
