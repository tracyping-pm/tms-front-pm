import { SignTypeEnum } from '@/constants';
import {
  BankOutlined,
  CalendarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FontSizeOutlined,
  HolderOutlined,
  MailOutlined,
} from '@ant-design/icons';
import cls from 'classnames';
import { FC, useCallback } from 'react';
import styles from './common.less';

interface IProps {
  signType: SignTypeEnum;
  signTypeName: string;
  required: boolean;
}

const FieldOptionView: FC<IProps> = ({
  signType,
  signTypeName,
  required = false,
}) => {
  const renderIcon = useCallback(() => {
    if (signType === SignTypeEnum.SIGNATURE) {
      return <EditOutlined />;
    } else if (signType === SignTypeEnum.DATE) {
      return <CalendarOutlined />;
    } else if (signType === SignTypeEnum.TEXT) {
      return <FontSizeOutlined />;
    } else if (signType === SignTypeEnum.COMPANY) {
      return <BankOutlined />;
    } else if (signType === SignTypeEnum.ADDRESS) {
      return <EnvironmentOutlined />;
    } else if (signType === SignTypeEnum.EMAIL) {
      return <MailOutlined />;
    } else {
      console.error('Unknown signType, please check!');
      return null;
    }
  }, [signType]);

  return (
    <>
      <div
        className={cls(styles.fieldOptionView, 'fieldOptionView', {
          [styles.optionSignature]: signType === SignTypeEnum.SIGNATURE,
          [styles.optionDate]: signType === SignTypeEnum.DATE,
          [styles.optionText]: signType === SignTypeEnum.TEXT,
          [styles.optionCompany]: signType === SignTypeEnum.COMPANY,
          [styles.optionAddress]: signType === SignTypeEnum.ADDRESS,
          [styles.optionEmail]: signType === SignTypeEnum.EMAIL,
        })}
      >
        <span className="prefix">{renderIcon()}</span>
        <span className="name">
          {signTypeName}
          {required && <span className="required">*</span>}
        </span>
        <span className="suffix">
          <HolderOutlined />
        </span>
      </div>
    </>
  );
};

export default FieldOptionView;
