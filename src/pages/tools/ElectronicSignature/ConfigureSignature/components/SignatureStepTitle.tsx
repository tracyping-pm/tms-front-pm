import { QuestionCircleOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Tooltip } from 'antd';
import cls from 'classnames';
import { FC } from 'react';

import { STEPS_TITLE } from '@/constants';
import styles from './common.less';

interface IProps {
  todo?: any;
}

const SignatureStepTitle: FC<IProps> = () => {
  const { state } = useModel('signature.detail');
  const { stepCurrent } = state;
  const currentTitle = STEPS_TITLE[stepCurrent];

  return (
    <>
      <div className={cls('signatureStepTitle', styles.signatureStepTitle)}>
        {currentTitle.title}{' '}
        <Tooltip
          trigger={'click'}
          placement="topLeft"
          title={currentTitle.tooltip}
          rootClassName={cls(
            'signatureStepTitleRoot',
            styles.signatureStepTitleRoot,
          )}
          align={{
            offset: [-12, -10],
          }}
          autoAdjustOverflow={false}
        >
          <QuestionCircleOutlined />
        </Tooltip>
      </div>
    </>
  );
};

export default SignatureStepTitle;
