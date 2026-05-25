import { IClaimListRecord } from '@/api/types/claims';
import {
  ClaimTicketStatusEnumColor,
  ClaimTicketStatusEnumText,
} from '@/enums/claim';
import { useHover } from 'ahooks';
import { Badge, Flex, Typography } from 'antd';
import { FC, useRef } from 'react';

const { Title, Text } = Typography;

export interface IProps {
  item: IClaimListRecord;
  isActive?: boolean;
  onClick?: () => void;
}

const ListItem: FC<IProps> = ({ item, isActive, onClick }) => {
  const ref = useRef(null);
  const isHovering = useHover(ref);

  const wrapStyle = {
    padding: '12px',
    borderWidth: '0.5px',
    borderStyle: 'solid',
    borderColor: '#D9D9D9',
    borderRadius: '8px',
    background: '#ffffff',
    cursor: 'pointer',
  };

  const activeWrapStyle = {
    ...wrapStyle,
    borderColor: '#1AA391',
    background: '#EEF6F4',
  };

  const hoveringWrapStyle = {
    ...wrapStyle,
    background: '#EEF6F4',
  };

  return (
    <>
      <div
        style={
          isActive
            ? activeWrapStyle
            : isHovering
              ? hoveringWrapStyle
              : wrapStyle
        }
        onClick={() => onClick?.()}
        ref={ref}
      >
        <Title level={5}>{item.ticketNumber}</Title>
        <Flex gap={8}>
          <Text style={{ width: '120px' }} type="secondary">
            Claimant:
          </Text>
          <Text ellipsis style={{ flex: 1 }} title={item.claimantName}>
            {item.claimantName}
          </Text>
        </Flex>
        <Flex gap={8}>
          <Text style={{ width: '120px' }} type="secondary">
            Responsible party:
          </Text>
          <Text ellipsis style={{ flex: 1 }} title={item.responsiblePartyName}>
            {item.responsiblePartyName}
          </Text>
        </Flex>
        <Flex gap={8}>
          <Text style={{ width: '120px' }} type="secondary">
            Ticket Status:
          </Text>
          <Text ellipsis style={{ flex: 1 }} title={item.ticketStatus}>
            <Badge
              color={ClaimTicketStatusEnumColor[item.ticketStatus]}
              text={ClaimTicketStatusEnumText[item.ticketStatus]}
            />
          </Text>
        </Flex>
      </div>
    </>
  );
};

export default ListItem;
