import {
  customerTransferList,
  customerUserRoleList,
  transferCAMUser,
} from '@/api/customer';
import { ICustomerUserRoleRecord } from '@/api/types/customer';
import CustomTabs from '@/components/CustomTabs';
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
import styles from './index.less';

const CONTAINER_HEIGHT = 340;

const FIXED_RADIO_ITEM = {
  id: 0,
  userAliasName: 'Without BD',
  roleName: ' ',
  departmentName: ' ',
};

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
  customerIds: number[];
  bdUserRoleIds: number[];
  camUserRoleIds: number[];
  onConfirm?: () => void;
};

const TransferModal = ({
  open,
  customerIds = [],
  bdUserRoleIds = [],
  camUserRoleIds = [],
  width = 634,
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
  const [tabKey, setTabKey] = useState<string>('bd');
  const pageNumRef = useRef<number>(1);

  const reset = useCallback(() => {
    setSearchValue('');
    setValue(undefined);
    setData([]);
    setOriginData({});
    pageNumRef.current = 1;
    setTabKey('bd');
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
    const res = await customerUserRoleList(payload);
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
    let offsetHeight;
    if (tabKey === 'bd') {
      offsetHeight = CONTAINER_HEIGHT;
    } else {
      offsetHeight = CONTAINER_HEIGHT;
    }
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop <=
      offsetHeight
    ) {
      fetchData();
    }
  };

  const handleOk = () => {
    let contentText = `selected ${tabKey === 'bd' ? 'BD' : 'CAM'}`;
    if (value === FIXED_RADIO_ITEM.id) {
      if (tabKey === 'bd') {
        contentText = 'Without BD';
      } else {
        contentText = 'Without CAM';
      }
    }
    modal.confirm({
      title: 'Confirm Transfer',
      content: `Confirm transfer of customers to ${contentText}`,
      okText: 'Confirm',
      onOk: async () => {
        const payload = {
          bdUserId: value,
          customerIds,
        };
        let res;
        if (tabKey === 'bd') {
          res = await customerTransferList(payload);
        } else {
          res = await transferCAMUser(payload);
        }
        if (res.code === 200) {
          message.success('Transfer successfully!');
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
        title="Transfer Customer"
        open={open}
        width={width}
        okText="Confirm"
        destroyOnClose
        okButtonProps={{
          disabled: value === undefined,
        }}
        onOk={handleOk}
        {...restProps}
      >
        <CustomTabs
          activeKey={tabKey}
          tabBarGutter={32}
          items={[
            // BD
            {
              key: 'bd',
              label: 'BD Transfer',
              children: (
                <>
                  <Input
                    className={styles.search}
                    style={{ marginBottom: 10 }}
                    placeholder="Search for BD Name"
                    allowClear
                    onChange={(e) => onSearch(e.target?.value)}
                    suffix={
                      <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                    }
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
                        <RadioItemView
                          {...FIXED_RADIO_ITEM}
                          isActive={value === FIXED_RADIO_ITEM.id}
                        />
                        {data?.map((item: ICustomerUserRoleRecord) => (
                          <RadioItemView
                            key={item.id}
                            {...item}
                            isActive={value === item.id}
                            disabled={bdUserRoleIds?.includes(item.id)}
                          />
                        ))}
                        <StatusText style={{ paddingTop: 4 }}>
                          {loading ? 'Loading...' : 'No more data'}
                        </StatusText>
                      </div>
                    </Radio.Group>
                  </Main>
                </>
              ),
            },
            // CAM
            {
              key: 'cam',
              label: 'CAM Transfer',
              children: (
                <>
                  <Input
                    className={styles.search}
                    style={{ marginBottom: 10 }}
                    placeholder="Search for CAM Name"
                    allowClear
                    onChange={(e) => onSearch(e.target?.value)}
                    suffix={
                      <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                    }
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
                        <RadioItemView
                          {...{
                            ...FIXED_RADIO_ITEM,
                            userAliasName: 'Without CAM',
                          }}
                          isActive={value === FIXED_RADIO_ITEM.id}
                        />
                        {data?.map((item: ICustomerUserRoleRecord) => (
                          <RadioItemView
                            key={item.id}
                            {...item}
                            isActive={value === item.id}
                            disabled={camUserRoleIds?.includes(item.id)}
                          />
                        ))}
                        <StatusText style={{ paddingTop: 6 }}>
                          {loading ? 'Loading...' : 'No more data'}
                        </StatusText>
                      </div>
                    </Radio.Group>
                  </Main>
                </>
              ),
            },
          ]}
          onChange={(key: string) => {
            setTabKey(key);
          }}
        />
      </Modal>
    </>
  );
};

export default TransferModal;
