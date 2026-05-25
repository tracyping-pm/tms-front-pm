import { SIGNATURE_STATUS_COLOR } from '@/constants';
import { SignerStatusEnum } from '@/enums';
import cls from 'classnames';
import { useMemo } from 'react';
import SignerProcessItem from './SignerProcessItem';
import styles from './common.less';

const ProcessItem = ({
  data,
  beforeData,
  index,
  length,
  showLine,
  showBadge,
  showStatus,
}: {
  data: any;
  beforeData: any;
  index: number;
  length: number;
  showLine: boolean;
  showBadge: boolean;
  showStatus: boolean;
}) => {
  const lineTop = useMemo(() => {
    if (index === 0) {
      return 'none';
    } else {
      return beforeData.status === SignerStatusEnum.SIGNED ? 'solid' : 'dashed';
    }
  }, [index, beforeData]);

  const lineBottom = useMemo(() => {
    if (index === length - 1) {
      return 'none';
    } else {
      return data.status === SignerStatusEnum.SIGNED ? 'solid' : 'dashed';
    }
  }, [index, length, data]);

  return (
    <SignerProcessItem
      name={data.name}
      email={data.email}
      status={data.status}
      color="#fff"
      bgColor={data.mainColor}
      showBadge={showBadge}
      badgeColor={SIGNATURE_STATUS_COLOR[data.status]}
      showStatus={showStatus}
      showLine={showLine}
      lineTop={lineTop}
      lineBottom={lineBottom}
      style={{ paddingBottom: showLine ? '0' : '12px' }}
    />
  );
};

const SignerProcess = (props: {
  maxHeight?: number;
  signerList: any[];
  showStatus?: boolean;
  showLine?: boolean;
  showBadge?: boolean;
}) => {
  const {
    maxHeight = 292,
    signerList,
    showStatus = true,
    showLine = true,
    showBadge = true,
  } = props;
  return (
    <div
      className={cls(styles.process, 'process')}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      {signerList?.map((item, index) => {
        return (
          <ProcessItem
            key={item.id}
            index={index}
            length={signerList.length}
            data={item}
            beforeData={index > 0 ? signerList[index - 1] : {}}
            showLine={showLine}
            showBadge={showBadge && !!item.status}
            showStatus={showStatus}
          />
        );
      })}
    </div>
  );
};

export default SignerProcess;
