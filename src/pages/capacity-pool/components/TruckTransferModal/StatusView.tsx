import { ITruckVendorRefRecord } from '@/api/types/capacity';
import CustomTooltip from '@/components/CustomTooltip';
import { css, styled } from '@umijs/max';
import { Checkbox, Col, Row } from 'antd';

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

export const CheckboxItemWrap = styled.div<{
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
  $isCheckbox?: boolean;
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
    props.$isCheckbox &&
    css`
      color: #595959;
    `}

  ${(props) =>
    props.$isRight &&
    css`
      padding-left: 0;
    `}

  ${(props) =>
    props.$disabled &&
    css`
      color: #bfbfbf;
    `}
`;

type ICheckboxItemView = Partial<ITruckVendorRefRecord> & {
  isActive?: boolean;
  disabled?: boolean;
};

export const CheckboxItemView = (props: ICheckboxItemView) => {
  const {
    vendorTruckId,
    plateNumber,
    truckTypeName,
    vendorTag,
    isActive = false,
    disabled = false,
  } = props;

  return (
    <Label>
      <CheckboxItemWrap $isActive={isActive} $disabled={disabled}>
        <Row gutter={16} style={{ height: '100%' }}>
          <Col span={8} style={{ height: '100%' }}>
            <BaseSpan $isCheckbox $disabled={disabled}>
              <Checkbox value={vendorTruckId} disabled={disabled} />
              <CustomTooltip title={plateNumber}>
                <span style={{ marginLeft: 12 }}>{plateNumber}</span>
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={8} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled}>
              <CustomTooltip title={truckTypeName}>
                {truckTypeName}
              </CustomTooltip>
            </BaseSpan>
          </Col>
          <Col span={8} style={{ height: '100%' }}>
            <BaseSpan $disabled={disabled} $isRight>
              <CustomTooltip title={vendorTag}>{vendorTag}</CustomTooltip>
            </BaseSpan>
          </Col>
        </Row>
      </CheckboxItemWrap>
    </Label>
  );
};
