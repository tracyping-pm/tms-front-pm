import {
  IRouteOriginAndDestinationListItem,
  IWaypointListItem,
} from '@/api/types/waybill';
import CustomTooltip from '@/components/CustomTooltip';
import { CheckOutlined } from '@ant-design/icons';
import { css, styled } from '@umijs/max';
import { Col, Row } from 'antd';

export const InputSearchView = styled.div`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const StatusText = styled.div`
  color: #999999;
  text-align: center;
`;

export const Label = styled.label`
  width: 100%;
  height: 56px;
  padding: 4px;
  display: flex;
  border-bottom: 1px solid #f2f2f2;
  align-items: center;
`;

export const CheckItemWrap = styled.div<{
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

export const BaseSpan = styled.span<{
  $width?: number;
  $isRight?: boolean;
  $isCheck?: boolean;
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
    props.$isCheck &&
    css`
      color: #595959;
    `}

  ${(props) =>
    props.$isRight &&
    css`
      padding-left: 6px;
    `}

  ${(props) =>
    props.$disabled &&
    css`
      color: #bfbfbf;
    `}
`;

export const CheckedSpan = styled.span`
  display: inline-block;
  width: 16px;
  font-size: 16px;
  color: #009688;
`;

type ICheckItemView = Partial<
  IRouteOriginAndDestinationListItem & IWaypointListItem
> & {
  isSelect?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export const CheckItemView = (props: ICheckItemView) => {
  const {
    padName,
    sadName,
    tadName,
    label,
    isSelect = false,
    isActive = false,
    disabled = false,
    onClick,
  } = props;

  return (
    <Label>
      <CheckItemWrap
        $isActive={isActive}
        $disabled={disabled}
        onClick={onClick}
      >
        <Row gutter={12} style={{ height: '100%' }}>
          <Col span={6} style={{ height: '100%' }}>
            <BaseSpan $isCheck $disabled={disabled}>
              <CheckedSpan>{isSelect ? <CheckOutlined /> : ''}</CheckedSpan>
              <CustomTooltip title={padName}>
                <span style={{ marginLeft: 12 }}>{padName}</span>
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={6} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled}>
              <CustomTooltip title={sadName}>{sadName}</CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={6} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled}>
              <CustomTooltip title={tadName}>
                <span style={{ marginLeft: '4px' }}>{tadName}</span>
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={6} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip title={label}>{label}</CustomTooltip>
            </BaseSpan>
          </Col>
        </Row>
      </CheckItemWrap>
    </Label>
  );
};

export const WaypointCheckItemView = (props: ICheckItemView) => {
  const {
    waypoint,
    isSelect = false,
    isActive = false,
    disabled = false,
    onClick,
  } = props;

  return (
    <Label>
      <CheckItemWrap
        $isActive={isActive}
        $disabled={disabled}
        onClick={onClick}
      >
        <Row gutter={16} style={{ height: '100%' }}>
          <Col span={24} style={{ height: '100%' }}>
            <BaseSpan $isCheck $disabled={disabled} title={waypoint}>
              <CheckedSpan>{isSelect ? <CheckOutlined /> : ''}</CheckedSpan>
              <CustomTooltip title={waypoint}>
                <span style={{ marginLeft: 12 }}>{waypoint}</span>
              </CustomTooltip>
            </BaseSpan>
          </Col>
        </Row>
      </CheckItemWrap>
    </Label>
  );
};
