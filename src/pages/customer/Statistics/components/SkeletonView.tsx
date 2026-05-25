import { Skeleton } from 'antd';
import { FC } from 'react';

const SkeletonView: FC = () => {
  return (
    <>
      <Skeleton
        title={false}
        paragraph={{
          rows: 10,
          width: [
            '80%',
            '100%',
            '80%',
            '100%',
            '100%',
            '100%',
            '88%',
            '100%',
            '100%',
            '100%',
            '100%',
            '100%',
            '80%',
            '100%',
            '100%',
            '100%',
            '80%',
            '100%',
            '100%',
            '88%',
            '100%',
            '100%',
            '100%',
            '80%',
            '100%',
          ],
        }}
        active
      />
    </>
  );
};

export default SkeletonView;
