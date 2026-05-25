import { styled } from '@umijs/max';
import { Spin } from 'antd';
import { FC } from 'react';
import { ENUM_NOT_FOUND_STATUS, I_NOT_FOUND_CONTENT } from './types';

const Span = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

const NotFoundContent: FC<I_NOT_FOUND_CONTENT> = ({
  status,
  startupLength,
}) => {
  return status === ENUM_NOT_FOUND_STATUS.INIT ? (
    <Span>{`Minimum length of ${startupLength} characters to search`}</Span>
  ) : status === ENUM_NOT_FOUND_STATUS.PENDING ? (
    <Spin size="small" />
  ) : (
    <Span>No results found</Span>
  );
};

export default NotFoundContent;
