import { projectAssign, projectAssignUser } from '@/api/project';
import { IAssignUserItem } from '@/api/types/project';
import CustomTooltip from '@/components/CustomTooltip';
import { MemberTypeEnum, MemberTypeEnumText } from '@/enums';
import { css, styled } from '@umijs/max';
import {
  App,
  Checkbox,
  Col,
  Empty,
  Input,
  Modal,
  ModalProps,
  Row,
  Select,
} from 'antd';
import { cloneDeep } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './common.less';

const options = [
  {
    label: MemberTypeEnumText[MemberTypeEnum.BD],
    value: MemberTypeEnum.BD,
  },

  {
    label: MemberTypeEnumText[MemberTypeEnum.PROCUREMENT_PIC],
    value: MemberTypeEnum.PROCUREMENT_PIC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.STRATEGY_PIC],
    value: MemberTypeEnum.STRATEGY_PIC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.RATES_PIC],
    value: MemberTypeEnum.RATES_PIC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.DISPATCHER],
    value: MemberTypeEnum.DISPATCHER,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.OC],
    value: MemberTypeEnum.OC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.ON_SITE_OC],
    value: MemberTypeEnum.ON_SITE_OC,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.POD_CHECKER],
    value: MemberTypeEnum.POD_CHECKER,
  },
  {
    label: MemberTypeEnumText[MemberTypeEnum.CAM],
    value: MemberTypeEnum.CAM,
  },
];

const CONTAINER_HEIGHT = 280;

const StatusText = styled.div`
  margin-bottom: 12px;
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
  $isActive?: boolean;
  $disabled?: boolean;
}>`
  height: 100%;
  width: 100%;
  padding: 6px 20px;
  background: #ffffff;
  border-radius: 2px;
  overflow: hidden;

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

type IRadioItemView = Partial<IAssignUserItem> & {
  isActive?: boolean;
  disabled?: boolean;
  hide?: boolean;
};

const RadioItemView = (props: IRadioItemView) => {
  const {
    userRoleId,
    aliasName,
    roleName,
    departmentName,
    isActive = false,
    disabled = false,
    hide = false,
  } = props;

  return (
    <div style={{ width: '100%', height: hide ? '0px' : '100%' }}>
      <RadioItemWrap $isActive={isActive} $disabled={disabled}>
        <Row gutter={24} style={{ height: '100%' }}>
          <Col span={8} style={{ height: '100%' }}>
            <BaseSpan $isRadio $disabled={disabled}>
              <Checkbox value={userRoleId} disabled={disabled} />
              <CustomTooltip title={aliasName}>
                <span style={{ marginLeft: 12 }}>{aliasName}</span>
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={8} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled}>
              <CustomTooltip title={roleName}>{roleName}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={8} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip title={departmentName}>
                {departmentName}
              </CustomTooltip>
            </BaseSpan>
          </Col>
        </Row>
      </RadioItemWrap>
    </div>
  );
};

type IAssignModal = ModalProps & {
  id: number;
  onConfirm?: () => void;
};

const AssignModal = ({
  open,
  id,
  width = 834,
  onConfirm,
  ...restProps
}: IAssignModal) => {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<IAssignUserItem[]>([]);
  const [sourceData, setSourceData] = useState<IAssignUserItem[]>([]);
  const [searchValue, setSearchValue] = useState<any>(undefined);
  const [value, setValue] = useState<number[]>([]);
  const memberTypeRef = useRef<MemberTypeEnum>();

  const reset = useCallback(() => {
    setValue([]);
    setData([]);
    memberTypeRef.current = undefined;
  }, []);

  const handleChange = (checkedValues: any[]) => {
    setValue(checkedValues);
  };

  const fetchData = useCallback(async () => {
    setData([]);
    setLoading(true);
    const payload = {
      projectId: id,
      memberType: memberTypeRef.current!,
    };
    const res = await projectAssignUser(payload);
    setLoading(false);

    if (res.code === 200) {
      const list = res?.data ?? [];
      const checked = list
        .filter((item) => item.choice)
        .map((item) => item.userRoleId);
      setValue(checked);
      console.log(checked);
      setData(list);
      setSourceData(list);
    }
  }, [id]);

  const handleOk = useCallback(() => {
    modal.confirm({
      title: 'Confirm Assign',
      okText: 'Confirm',
      onOk: async () => {
        const payload = {
          id: id,
          memberType: memberTypeRef.current!,
          userRoleIds: value,
        };
        const res = await projectAssign(payload);
        if (res.code === 200) {
          message.success('Assign successfully!');
          onConfirm?.();
        }
      },
    });
  }, [id, value]);

  const onSelect = useCallback(
    (memberType: MemberTypeEnum) => {
      memberTypeRef.current = memberType;
      setSearchValue(undefined);
      fetchData();
    },
    [id],
  );

  useEffect(() => {
    if (open) {
      // fetchData();
    } else {
      reset();
    }
  }, [open]);

  return (
    <>
      <Modal
        title="Assign Project"
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
        <div className={styles.assignModal}>
          <div
            style={{
              marginBottom: '4px',
              fontSize: '14px',
              color: '#1F1F1F',
              lineHeight: '22px',
            }}
          >
            Member Type
          </div>
          <Select
            placeholder="Please select member type"
            style={{ width: '100%', borderRadius: '2px' }}
            options={options}
            onSelect={onSelect}
          />
          {memberTypeRef.current && (
            <Input
              style={{ marginTop: '24px', borderRadius: '2px' }}
              placeholder="Enter alias name to search"
              value={searchValue}
              allowClear
              onChange={(e) => {
                const source = cloneDeep(sourceData);
                const targetValue = e.target.value;
                setSearchValue(targetValue);
                const filterData = source.map((i) => {
                  if (
                    !i?.aliasName
                      ?.toLowerCase()
                      ?.includes(targetValue?.toLowerCase())
                  ) {
                    return {
                      ...i,
                      hide: true,
                    };
                  } else {
                    return i;
                  }
                });
                setData(filterData);
              }}
            />
          )}
        </div>
        <Main style={{ marginTop: '24px' }}>
          <Checkbox.Group
            style={{ width: '100%', fontSize: 14 }}
            onChange={handleChange}
            value={value}
          >
            <div
              style={{
                width: '100%',
                height: CONTAINER_HEIGHT,
                overflow: 'auto',
              }}
            >
              <div
                style={{
                  width: '100%',
                }}
              >
                {data?.map((item: IAssignUserItem) => (
                  <RadioItemView
                    key={item.userRoleId}
                    {...item}
                    isActive={value.includes(item.userRoleId)}
                  />
                ))}
              </div>
              {!data.length && !loading ? (
                <Empty
                  description={'No data'}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <StatusText>
                  {loading ? 'Loading...' : 'No more data'}
                </StatusText>
              )}
            </div>
          </Checkbox.Group>
        </Main>
      </Modal>
    </>
  );
};

export default AssignModal;
