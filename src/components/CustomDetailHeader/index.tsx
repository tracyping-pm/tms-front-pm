import { DoubleRightOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { Badge, Flex, Space } from 'antd';
import cls from 'classnames';
import { FC } from 'react';
import styles from './index.less';
import PreviewAvatar from './PreviewAvatar';
import { LabelCase, ValueCase } from './ViewCase';

interface ITitleItem {
  label: React.ReactNode;
  value: React.ReactNode;
  statusColor?: string;
}

export interface ICustomDetailHeader {
  showAvatar?: boolean;
  defaultExpand?: boolean;
  avatar?: string;
  titleList?: ITitleItem[];
  titleExtra?: React.ReactNode;
  content?: React.ReactNode;
  extraInfo?: React.ReactNode;
}

const CustomDetailHeader: FC<ICustomDetailHeader> = ({
  showAvatar = false,
  defaultExpand = false,
  avatar,
  titleList = [],
  titleExtra,
  content,
  extraInfo,
}) => {
  const [expandState, { toggle }] = useToggle(defaultExpand);

  return (
    <>
      <div className={cls('customDetailHeader', styles.customDetailHeader)}>
        <section className={'title'}>
          <Flex gap={24} justify="space-between">
            <Space size={24}>
              {showAvatar && <PreviewAvatar src={avatar} />}

              {titleList?.map((item, index) => (
                <Space key={index} direction="vertical" size={8}>
                  <LabelCase>{item.label}</LabelCase>
                  {item.value ? (
                    <>
                      {item.statusColor ? (
                        <Badge
                          color={item.statusColor}
                          text={
                            <ValueCase $fontSize={20} $lineHeight={28}>
                              {item.value}
                            </ValueCase>
                          }
                        />
                      ) : (
                        <ValueCase $fontSize={20} $lineHeight={28}>
                          {item.value}
                        </ValueCase>
                      )}
                    </>
                  ) : (
                    '-'
                  )}
                </Space>
              ))}
            </Space>
            {titleExtra}
          </Flex>
        </section>
        {expandState && (
          <>
            <section className={'content'}>{content}</section>
            <section className={'extra'}>{extraInfo}</section>
          </>
        )}
      </div>

      <div
        className={cls(styles.collapse, 'collapse')}
        onClick={() => toggle()}
      >
        {expandState ? (
          <span className="less">
            <DoubleRightOutlined />
          </span>
        ) : (
          <span className="more">
            <DoubleRightOutlined />
          </span>
        )}
      </div>
    </>
  );
};

export default CustomDetailHeader;
