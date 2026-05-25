import { refundList } from '@/api/claim';
import { IRefundListPayload, IRefundListRecord } from '@/api/types/claims';
import FuzzySelector from '@/components/FuzzySelector';
import { DEFAULT_PAGINATION, ES_DTO_CLASS } from '@/constants';
import PubSubContext from '@/context/pubsub';
import {
  FieldQueryHighlightTypeEnum,
  FieldQueryHighlightUniqueLogicEnum,
} from '@/enums';
import { RefundTicketStatusOptions } from '@/enums/claim';
import useUrlState from '@ahooksjs/use-url-state';
import {
  Button,
  Col,
  Empty,
  Flex,
  Form,
  Pagination,
  Row,
  Select,
  Spin,
} from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { default as lodash } from 'lodash';
import { FC, useContext, useEffect, useState } from 'react';
import { EventBus } from '../../eventBus';
import ListItem from './ListItem';

interface IProps {
  ticketNumberValue?: DefaultOptionType;
  onRecordClick?: (item: IRefundListRecord) => void;
}

const DetailList: FC<IProps> = ({ ticketNumberValue, onRecordClick }) => {
  const { subscribe } = useContext(PubSubContext);
  const [, setUrlState] = useUrlState();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [originData, setOriginData] =
    useState<PaginationResponse>(DEFAULT_PAGINATION);
  const [activeId, setActiveId] = useState<number>();

  const getDataSource = async (BE_NEED: IRefundListPayload) => {
    setLoading(true);
    const res = await refundList(BE_NEED).finally(() => {
      setLoading(false);
    });
    if (res.code === 200) {
      setOriginData(res.data);
    }
  };

  const getFilterParams = () => {
    const values = form.getFieldsValue();
    console.log({ values });

    const BE_NEED = {
      pageNum: 1,
      pageSize: 10,
    };

    if (values.ticketNumberObj) {
      lodash.set(BE_NEED, 'id', values.ticketNumberObj?.id);
    }

    if (values.refundingPartyObj) {
      lodash.set(BE_NEED, 'refundingPartyId', values.refundingPartyObj?.id);
    }

    if (values.payeeObj) {
      lodash.set(BE_NEED, 'payeeId', values.payeeObj?.id);
    }

    if (values.ticketStatusList) {
      lodash.set(BE_NEED, 'ticketStatusList', values.ticketStatusList);
    }
    return BE_NEED;
  };

  const onPaginationChange = async (params: {
    pageNum: number;
    pageSize: number;
  }) => {
    const BE_NEED = getFilterParams();
    await getDataSource({ ...BE_NEED, ...params });
  };

  const onSearch = () => {
    const BE_NEED = getFilterParams();
    getDataSource(BE_NEED);
  };

  const onReset = () => {
    form.resetFields();
    getDataSource({
      pageNum: 1,
      pageSize: 10,
    });
  };

  const onItemClick = (item: IRefundListRecord) => {
    if (item.id === activeId) {
      return;
    }
    setUrlState({ id: item.id });
    setActiveId(item.id);
    onRecordClick?.(item);
  };

  useEffect(() => {
    if (ticketNumberValue) {
      form.resetFields();
      form.setFieldsValue({
        ticketNumberObj: ticketNumberValue,
      });
      getDataSource({
        pageNum: 1,
        pageSize: 10,
        id: ticketNumberValue.id,
      });
      setActiveId(ticketNumberValue.id);
    }
  }, [ticketNumberValue]);

  useEffect(() => {
    const unsubscribe = subscribe(EventBus.EDIT_OC_STATUS_SUCCESS, () => {
      onSearch();
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <section style={{ padding: '12px', backgroundColor: '#fff' }}>
        <Form name="refund-ticket-detail-list-form" form={form}>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Form.Item name="ticketNumberObj" noStyle>
                <FuzzySelector
                  fieldProps={{
                    placeholder: 'Ticket Number',
                    style: { width: '100%' },
                  }}
                  request={{
                    field: 'ticketNumber',
                    esDtoClass: ES_DTO_CLASS.CLAIM_TICKET,
                    type: FieldQueryHighlightTypeEnum.None,
                    uniqueLogic: FieldQueryHighlightUniqueLogicEnum.CLAIM,
                    uniqueLogicParams: { ticketType: 2 },
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="refundingPartyObj" noStyle>
                <FuzzySelector
                  fieldProps={{
                    placeholder: 'Refunding Party',
                    style: { width: '100%' },
                  }}
                  request={{
                    field: 'customerName',
                    esDtoClass: ES_DTO_CLASS.CUSTOMER,
                    type: FieldQueryHighlightTypeEnum.COUNTRY,
                    uniqueLogic:
                      FieldQueryHighlightUniqueLogicEnum.CLAIM_REQUEST,
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="payeeObj" noStyle>
                <FuzzySelector
                  fieldProps={{
                    placeholder: 'Payee',
                    style: { width: '100%' },
                  }}
                  request={{
                    field: 'vendorName',
                    esDtoClass: ES_DTO_CLASS.VENDOR,
                    type: FieldQueryHighlightTypeEnum.COUNTRY,
                    uniqueLogic:
                      FieldQueryHighlightUniqueLogicEnum.CLAIM_REQUEST,
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ticketStatusList" noStyle>
                <Select
                  mode="multiple"
                  allowClear
                  //   maxTagCount={1}
                  placeholder="Ticket Status"
                  options={RefundTicketStatusOptions}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Flex gap={8} style={{ marginTop: 8 }}>
            <Button type="primary" onClick={() => onSearch()}>
              Search
            </Button>
            <Button onClick={() => onReset()}>Reset</Button>
          </Flex>
        </Form>
      </section>

      <section
        style={{
          padding: '12px',
        }}
      >
        <Spin spinning={loading}>
          {originData.list && originData.list?.length > 0 ? (
            <>
              <Flex vertical gap={8}>
                {originData.list.map((item) => (
                  <ListItem
                    key={item.id}
                    item={item}
                    isActive={item.id === activeId}
                    onClick={() => onItemClick(item)}
                  />
                ))}
              </Flex>
              <Flex justify="center" style={{ padding: '10px 0' }}>
                <Pagination
                  size="small"
                  simple
                  total={originData.total}
                  current={originData.pageNum}
                  pageSize={originData.pageSize}
                  onChange={(page: number, pageSize: number) =>
                    onPaginationChange({ pageNum: page, pageSize: pageSize })
                  }
                  showSizeChanger={false}
                />
              </Flex>
            </>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Spin>
      </section>
    </>
  );
};

export default DetailList;
