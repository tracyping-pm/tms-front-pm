import { Flex, Spin } from 'antd';
import { FC } from 'react';
import { CellLabelCase, CellValueCase } from './ViewCase';

export interface IColCell {
  label: React.ReactNode;
  value: React.ReactNode | (() => React.ReactNode);
  loading?: boolean;
}

const ColCell: FC<IColCell> = ({ label, value, loading = false }) => {
  return (
    <>
      <Flex align="start" style={{ height: '100%' }}>
        <CellLabelCase>{label}</CellLabelCase>
        <CellValueCase>
          <Spin spinning={loading}>
            {' '}
            {typeof value === 'function' ? value() : value || '-'}
          </Spin>
        </CellValueCase>
      </Flex>
    </>
  );
};

export default ColCell;
