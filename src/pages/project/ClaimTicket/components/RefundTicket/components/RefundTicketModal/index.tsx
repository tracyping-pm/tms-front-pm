import { claimDetail, refundCreate, refundEdit } from '@/api/claim';
import {
  IClaimDetail,
  IRefundCreateListItem,
  IRefundDetail,
} from '@/api/types/claims';
import {
  App,
  Button,
  Col,
  Flex,
  Form,
  Modal,
  ModalProps,
  Row,
  Spin,
} from 'antd';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  FieldAffiliatedProject,
  FieldDescription,
  FieldLinkedClaimTicket,
  FieldOcStatus,
  FieldPayee,
  FieldProof,
  FieldRefundParty,
  FieldRemark,
} from './Fields';

export interface IProps extends ModalProps {
  disabledLinkedClaim?: boolean;
  linkedClaimId?: number;
  detail?: IRefundDetail;
  onCancel?: () => void;
  onSuccess?: () => void;
}

const RefundTicketModal: FC<IProps> = ({
  open,
  disabledLinkedClaim = false,
  linkedClaimId,
  detail,
  onCancel,
  onSuccess,
  ...restProps
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [linkedClaimDetail, setLinkedClaimDetail] = useState<IClaimDetail>();
  const [linkedFetching, setLinkedFetching] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const claimDetailMap = useRef<Map<number, IClaimDetail>>(new Map());

  const fetchLinkedClaimDetail = async (id: number) => {
    if (claimDetailMap.current.has(id)) {
      setLinkedClaimDetail(claimDetailMap.current.get(id));
    } else {
      setLinkedFetching(true);
      const res = await claimDetail({ id }).finally(() => {
        setLinkedFetching(false);
      });
      if (res.code === 200) {
        setLinkedClaimDetail(res.data);
        claimDetailMap.current.set(id, res.data);
      }
    }
  };

  const onLinkedClaimChange = (id: number) => {
    if (id) {
      fetchLinkedClaimDetail(id);
    } else {
      setLinkedClaimDetail(undefined);
    }
  };

  const getUploadingSize = useCallback((uploadingSize: number) => {
    if (uploadingSize > 0) {
      setUploadLoading(true);
    } else {
      setUploadLoading(false);
    }
  }, []);

  const buildPayload = (values: any) => {
    const {
      linkedClaimTicketObj,
      refundingPartyObj,
      payeeObj,
      affiliatedProjectObj,
      itemList,
    } = values;

    const obj = {
      ...values,
      claimId: linkedClaimTicketObj?.id,
      claimType: linkedClaimDetail?.claimType,
      refundingPartyId: refundingPartyObj?.id ?? refundingPartyObj?.value,
      payeeId: payeeObj?.id ?? payeeObj?.value,
      projectId: affiliatedProjectObj?.id,
    };

    obj.itemList = itemList?.map((item: IRefundCreateListItem) => {
      return {
        claimItemId: item.claimItemId,
        waybillId: item.waybillId,
        detail: item.detail,
        amount: item.amount,
      };
    });

    delete obj.linkedClaimTicketObj;
    delete obj.refundingPartyObj;
    delete obj.payeeObj;
    delete obj.affiliatedProjectObj;

    return obj;
  };

  const onSubmit = async () => {
    const fieldError = await form?.getFieldsError?.();
    const hasErrorFields = fieldError?.filter((item) => item.errors?.length);

    if (hasErrorFields?.length > 0) {
      // hasErrorFields.forEach((item) => {
      //   // 校验 values 中不存在 item 的字段
      //   // TODO:
      //   console.log({ item });
      // });
      return;
    }

    await form.validateFields();
    const values = form.getFieldsValue();
    if (detail) {
      const payload = buildPayload(values);
      console.log({ payload });
      setSubmitting(true);
      const res = await refundEdit({ ...payload, id: detail.id }).finally(
        () => {
          setSubmitting(false);
        },
      );
      if (res.code === 200) {
        message.success('Edit Refund Ticket Successful!');
        onSuccess?.();
      }
    } else {
      const payload = buildPayload(values);
      console.log({ payload });
      setSubmitting(true);
      const res = await refundCreate(payload).finally(() => {
        setSubmitting(false);
      });
      if (res.code === 200) {
        message.success('Create Refund Ticket Successful!');
        onSuccess?.();
      }
    }
  };

  useEffect(() => {
    if (open) {
      if (linkedClaimId) {
        fetchLinkedClaimDetail(linkedClaimId);
      } else {
        setLinkedClaimDetail(undefined);
      }
    } else {
      form.resetFields();
      setLinkedClaimDetail(undefined);
      claimDetailMap.current.clear();
    }
  }, [open, linkedClaimId]);

  return (
    <Modal
      title={detail ? 'Edit Refund Ticket' : 'Create Refund Ticket'}
      open={open}
      width={900}
      destroyOnClose
      maskClosable={false}
      onCancel={() => onCancel?.()}
      footer={
        <>
          <Flex justify="end" gap={8}>
            <Button onClick={() => onCancel?.()}>Cancel</Button>
            <Button
              type="primary"
              loading={uploadLoading || submitting}
              onClick={() => onSubmit()}
            >
              {uploadLoading ? 'Proof Uploading...' : 'Submit'}
            </Button>
          </Flex>
        </>
      }
      {...restProps}
    >
      <Form
        name="create-refund-ticket-form"
        form={form}
        layout="vertical"
        initialValues={{ itemList: [{}] }}
      >
        <>
          <Row gutter={12}>
            <Col span={8}>
              <FieldLinkedClaimTicket
                form={form}
                disabledLinkedClaim={disabledLinkedClaim}
                linkedClaimDetail={linkedClaimDetail}
                detail={detail}
                onChange={onLinkedClaimChange}
              />
            </Col>
            <Col span={8}>
              <FieldRefundParty
                form={form}
                linkedClaimDetail={linkedClaimDetail}
                detail={detail}
              />
            </Col>
            <Col span={8}>
              <FieldPayee
                form={form}
                linkedClaimDetail={linkedClaimDetail}
                detail={detail}
              />
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <FieldAffiliatedProject
                form={form}
                linkedClaimDetail={linkedClaimDetail}
                detail={detail}
              />
            </Col>
          </Row>
          <Spin spinning={linkedFetching}>
            <FieldDescription
              form={form}
              linkedClaimDetail={linkedClaimDetail}
              detail={detail}
            />
          </Spin>
        </>

        {!detail ? (
          <>
            <Row gutter={12} style={{ marginTop: 8 }}>
              <Col span={12}>
                <FieldOcStatus form={form} />
              </Col>
              <Col span={12}>
                <FieldRemark form={form} />
              </Col>
            </Row>

            <Row gutter={12}>
              <Col span={12}>
                <FieldProof form={form} getUploadingSize={getUploadingSize} />
              </Col>
            </Row>
          </>
        ) : null}
      </Form>
    </Modal>
  );
};

export default RefundTicketModal;
