import { ICustomerUserRoleRecord } from '@/api/types/customer';
import { getVendorRoleList, transferVendorList } from '@/api/vendor';
import CustomTooltip from '@/components/CustomTooltip';
import { SearchOutlined } from '@ant-design/icons';
import { css, styled } from '@umijs/max';
import {
  App,
  Col,
  Input,
  Modal,
  ModalProps,
  Radio,
  RadioChangeEvent,
  Row,
} from 'antd';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

const CONTAINER_HEIGHT = 280;

const StatusText = styled.div`
  color: #999999;
  text-align: center;
`;

const Main = styled.div`
  border: 1px solid #f2f2f2;
`;

export const Label = styled.label`
  width: 100%;
  height: 56px;
  padding: 4px;
  display: flex;
  border-bottom: 1px solid #f2f2f2;
  align-items: center;
`;

const RadioItemWrap = styled.div<{
  $isFixed?: boolean;
  $isActive?: boolean;
  $disabled?: boolean;
}>`
  height: 100%;
  width: 100%;
  padding: 0 20px;
  background: #ffffff;
  border-radius: 2px;
  overflow: hidden;

  ${(props) =>
    props.$isFixed &&
    css`
      background: #fafafa;
    `}

  ${(props) =>
    props.$isActive &&
    css`
      background: rgba(0, 150, 136, 0.1);
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
  line-height: 46px;
  display: block;
  color: #595959;

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

type ITransferModal = ModalProps & {
  vendorIds: number[];
  bdUserRoleIds: number[];
  onConfirm?: () => void;
};

const VendorTransferModal = ({
  vendorIds = [],
  bdUserRoleIds = [],
  width = 834,
  onConfirm,
  ...restProps
}: ITransferModal) => {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [data, setData] = useState<ICustomerUserRoleRecord[]>([]);
  const [originData, setOriginData] = useState<
    PaginationResponse<ICustomerUserRoleRecord>
  >({});
  const [value, setValue] = useState<any>(undefined);
  const pageNumRef = useRef<number>(1);

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
    const res = await getVendorRoleList(payload);
    setLoading(false);
    pageNumRef.current += 1;

    if (res.code === 200) {
      const list = res?.data?.list ?? [];
      const newData = data.concat(list);
      setData(newData);
      setOriginData(res.data);
    }
  };

  // 上拉加载更多
  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      CONTAINER_HEIGHT
    ) {
      fetchData();
    }
  };

  const handleOk = () => {
    modal.confirm({
      title: 'Transfer Confirm',
      content: `Confirm transfer of Vendor to selected BD`,
      okText: 'Confirm',
      onOk: async () => {
        const payload = {
          bdUserId: value,
          vendorIds,
        };
        const res = await transferVendorList(payload);
        if (res.code === 200) {
          message.success('Transfer successfully!');
          onConfirm?.();
        }
      },
    });
  };

  const search = useCallback(
    debounce((_value) => {
      pageNumRef.current = 1;
      setData([]);
      setOriginData({});
      setSearchValue(_value);
    }, 600),
    [],
  );

  useEffect(() => {
    fetchData();
  }, [searchValue]);

  return (
    <>
      <Modal
        title="Transfer Vendor"
        open={true}
        width={width}
        okText="Confirm"
        destroyOnClose
        okButtonProps={{
          disabled: value === undefined,
        }}
        maskClosable={false}
        onOk={handleOk}
        {...restProps}
      >
        <Input
          style={{ width: '364px', marginBottom: '24px' }}
          placeholder="Search for BD Name"
          onChange={(even) => search(even?.target?.value)}
          prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
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

export default VendorTransferModal;
