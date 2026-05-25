import { StopOutlined } from '@ant-design/icons';
import { styled } from '@umijs/max';
import { Tooltip } from 'antd';
import { FC } from 'react';
import { I_LABEL } from './types';

const LabelWrap = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
`;

const MultipleColumns = styled.div`
  width: 30%;
  color: rgba(0, 0, 0, 0.45);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const LabelExtra = styled.span`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Ellipsis = styled.span`
  display: inline-block;
  width: 156px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: right;
`;

const Label: FC<I_LABEL> = ({
  content,
  additionalRemark,
  disableTip,
  extraFields,
}) => {
  let showExtraFields = false;
  try {
    showExtraFields =
      !!extraFields && typeof JSON?.parse(extraFields) === 'object';
  } catch (error) {
    showExtraFields = false;
  }

  return (
    <LabelWrap>
      <span
        style={{
          width: showExtraFields ? '30%' : 'auto',
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {showExtraFields && (
        <>
          <MultipleColumns>
            <span title={JSON.parse(extraFields!)?.roleName}>
              {JSON.parse(extraFields!)?.roleName}
            </span>
          </MultipleColumns>
          <MultipleColumns>
            <span title={JSON.parse(extraFields!)?.buName}>
              {JSON.parse(extraFields!)?.buName}
            </span>
          </MultipleColumns>
        </>
      )}
      <LabelExtra className="ellipsis">
        {additionalRemark && (
          <Ellipsis title={additionalRemark}>{additionalRemark}</Ellipsis>
        )}
        {disableTip && (
          <Tooltip
            placement="topLeft"
            title={disableTip}
            align={{ offset: [-12, -6] }}
            color="#FAAD14"
            styles={{ body: { color: 'var(--character-title-85)' } }}
          >
            <span>
              <StopOutlined />
            </span>
          </Tooltip>
        )}
      </LabelExtra>
    </LabelWrap>
  );
};

export default Label;
