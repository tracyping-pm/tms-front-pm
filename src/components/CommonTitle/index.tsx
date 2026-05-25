import { ExclamationCircleOutlined } from '@ant-design/icons';
import { styled } from '@umijs/max';
import { FC, ReactNode } from 'react';
import CustomTooltip from '../CustomTooltip';

const Container = styled.div`
  padding: 12px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const Content = styled.div`
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 20px;
    background-color: var(--primary-color);
  }
`;

const Extra = styled.div`
  display: flex;
`;

export interface IProps {
  title: React.ReactNode;
  tooltip?: string | ReactNode;
  extra?: ReactNode;
}

const CommonTitle: FC<IProps> = ({ title, tooltip, extra }) => {
  return (
    <>
      <Container>
        <Content>
          {title}
          {tooltip && (
            <CustomTooltip title={tooltip} placement="top">
              <ExclamationCircleOutlined />
            </CustomTooltip>
          )}
        </Content>
        {extra && <Extra>{extra}</Extra>}
      </Container>
    </>
  );
};

export default CommonTitle;
