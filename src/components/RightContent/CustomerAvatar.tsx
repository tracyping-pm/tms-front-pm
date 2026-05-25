import { styled } from '@umijs/max';

const Avatar = styled.div`
  margin-right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #009688;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const Span = styled.span`
  position: relative;
`;

const CustomerAvatar: React.FC<{ name: string }> = ({ name }) => {
  const firstLetter = name.slice?.(0, 1).toUpperCase();
  return (
    <Avatar>
      <Span>{firstLetter}</Span>
    </Avatar>
  );
};
export default CustomerAvatar;
