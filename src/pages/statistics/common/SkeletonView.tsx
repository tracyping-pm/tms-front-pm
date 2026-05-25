import { Flex, Skeleton } from 'antd';
import { FC } from 'react';

interface ISkeletonView {
  rows?: number;
  cols?: number;
}
const SkeletonView: FC<ISkeletonView> = ({ rows = 10, cols = 1 }) => {
  const colList = Array.from({ length: cols }, (_, index) => index + 1);

  return (
    <Flex gap={12}>
      {colList?.map((n) => (
        <Skeleton
          key={n}
          title={false}
          paragraph={{
            rows,
            width: [
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
              '100%',
            ],
          }}
          active
        />
      ))}
    </Flex>
  );
};

export default SkeletonView;
