import { leadTransfer, leadUserRoleList } from '@/api/lead';
import { ICustomerUserRoleRecord } from '@/api/types/customer';
import { ILeadTransferParams } from '@/api/types/lead';
import CustomTooltip from '@/components/CustomTooltip';
import { PicTypeEnum } from '@/enums';
import { SearchOutlined } from '@ant-design/icons';
import { css, styled } from '@umijs/max';
import {
  App,
  Col,
  Form,
  Input,
  Modal,
  ModalProps,
  Radio,
  RadioChangeEvent,
  Row,
} from 'antd';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.less';

const CONTAINER_HEIGHT = 168;

const StatusText = styled.div`
  color: #999999;
  text-align: center;
`;

const Main = styled.div``;

export const Label = styled.label`
  width: 100%;
  display: flex;
  align-items: center;
`;

const RadioItemWrap = styled.div<{
  $isFixed?: boolean;
  $isActive?: boolean;
  $disabled?: boolean;
}>`
  height: 100%;
  width: 100%;
  background: #ffffff;
  border-radius: 2px;
  overflow: hidden;

  ${(props) =>
    props.$isFixed &&
    css`
      background: #fafafa;
    `}

  ${(props) =>
    props.$disabled &&
    css`
      background: #ffffff;
      cursor: not-allowed;
    `}
`;

const BaseSpan = styled.span<{
  $width?: number;
  $isRight?: boolean;
  $isRadio?: boolean;
  $disabled?: boolean;
}>`
  width: 100%;
  height: 100%;
  margin-bottom: 24px;
  display: block;
  color: rgba(0, 0, 0, 0.88);

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  ${(props) =>
    props.$isRadio &&
    css`
      color: #252525;
    `}

  ${(props) =>
    props.$isRight &&
    css`
      text-align: left;
    `}

  ${(props) =>
    props.$disabled &&
    css`
      color: #bfbfbf;
    `}
`;

type IRadioItemView = Partial<ICustomerUserRoleRecord> & {
  isFixed?: boolean;
  isActive?: boolean;
  disabled?: boolean;
};

const RadioItemView = (props: IRadioItemView) => {
  const {
    id,
    userAliasName,
    roleName,
    departmentName,
    isFixed = false,
    isActive = false,
    disabled = false,
  } = props;

  return (
    <Label>
      <RadioItemWrap
        $isFixed={isFixed}
        $isActive={isActive}
        $disabled={disabled}
      >
        <Row gutter={24} style={{ height: '100%' }}>
          <Col span={8} style={{ height: '100%' }}>
            <BaseSpan $isRadio $disabled={disabled}>
              <Radio value={id} disabled={disabled} />
              <CustomTooltip title={userAliasName}>
                <span style={{ marginLeft: 12 }}>{userAliasName}</span>
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={8} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled} title={roleName}>
              <CustomTooltip title={roleName}>{roleName}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={8} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled} $isRight title={departmentName}>
              <CustomTooltip title={departmentName}>
                {departmentName}
              </CustomTooltip>
            </BaseSpan>
          </Col>
        </Row>
      </RadioItemWrap>
    </Label>
  );
};

type ITransferLeadModal = ModalProps & {
  leadIds: number[];
  bdUserRoleIds: number[];
  onConfirm?: () => void;
};

const TransferLeadModal = ({
  open,
  leadIds = [],
  bdUserRoleIds = [],
  width = 565,
  onConfirm,
  ...restProps
}: ITransferLeadModal) => {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [data, setData] = useState<ICustomerUserRoleRecord[]>([]);
  const [originData, setOriginData] = useState<
    PaginationResponse<ICustomerUserRoleRecord>
  >({});
  const [value, setValue] = useState<number | undefined>(undefined);
  const [picType, setPicType] = useState<PicTypeEnum | undefined>(undefined);
  const pageNumRef = useRef<number>(1);

  const reset = useCallback(() => {
    setSearchValue('');
    setValue(undefined);
    setPicType(undefined);
    setData([]);
    setOriginData({});
    pageNumRef.current = 1;
  }, []);

  const handleChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };

  const fetchData = async () => {
    if (loading || originData?.hasNextPage === false) {
      return;
    }
    setLoading(true);
    const payload = {
      pageNum: pageNumRef.current,
      pageSize: 10,
      userAliasName: searchValue ? searchValue : undefined,
    };
    const res = await leadUserRoleList(payload);
    setLoading(false);
    pageNumRef.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      const newData = data.concat(list);
      setData(newData);
      setOriginData(res.data);
    }
  };

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    let offsetHeight = CONTAINER_HEIGHT;
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      offsetHeight
    ) {
      fetchData();
    }
  };

  const handleOk = () => {
    modal.confirm({
      title: 'Confirm Transfer',
      content: `Confirm transfer of leads to selected ${picType}`,
      okText: 'Confirm',
      onOk: async () => {
        const payload = {
          leadIds,
          picType,
          picUserRoleId: value,
        };
        let res = await leadTransfer(payload as ILeadTransferParams);
        if (res.code === 200) {
          message.success(res.data || 'Transfer successfully!');
          onConfirm?.();
        }
      },
    });
  };

  const onSearch = useCallback(
    debounce((val) => {
      pageNumRef.current = 1;
      setData([]);
      setOriginData({});
      setSearchValue(val);
    }, 600),
    [],
  );

  useEffect(() => {
    if (open) {
      fetchData();
    } else {
      reset();
    }
  }, [open, searchValue]);

  return (
    <>
      <Modal
        title="Transfer Leads"
        open={open}
        width={width}
        okText="OK"
        destroyOnClose
        okButtonProps={{
          disabled: value === undefined || !picType,
        }}
        onOk={handleOk}
        {...restProps}
      >
        <p style={{ marginBottom: 10, borderRadius: 6 }}>
          Transfer leads to other BD/CAM
        </p>
        <Form layout="vertical" className={styles.form}>
          <Form.Item label="Transfer to ：" name="picType" required>
            <Radio.Group
              onChange={(e) => {
                setPicType(e.target.value);
              }}
            >
              <Radio value={'BD'}>BD</Radio>
              <Radio value={'CAM'}>CAM</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
        <Input
          className={styles.search}
          style={{ marginBottom: 10 }}
          placeholder="Search for BD Name"
          allowClear
          onChange={(e) => onSearch(e.target?.value)}
          suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
        />
        <Main>
          <Radio.Group
            style={{ width: '100%', fontSize: 14 }}
            onChange={handleChange}
            value={value}
          >
            <div
              style={{
                height: `${CONTAINER_HEIGHT}px`,
                overflow: 'auto',
              }}
              onScroll={onScroll}
            >
              {data?.map((item: ICustomerUserRoleRecord) => (
                <RadioItemView
                  key={item.id}
                  {...item}
                  isActive={value === item.id}
                  disabled={bdUserRoleIds?.includes(item.id)}
                />
              ))}
              <StatusText>{loading ? 'Loading...' : 'No more data'}</StatusText>
            </div>
          </Radio.Group>
        </Main>
      </Modal>
    </>
  );
};

export default TransferLeadModal;
