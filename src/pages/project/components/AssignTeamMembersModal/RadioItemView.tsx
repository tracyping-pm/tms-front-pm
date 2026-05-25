import { IAssignUserItem } from '@/api/types/project';
import CustomTooltip from '@/components/CustomTooltip';
import { Col, Row } from 'antd';

type IRadioItemView = Partial<IAssignUserItem>;

const RadioItemView = (props: IRadioItemView) => {
  const { aliasName, roleName, departmentName } = props;

  return (
    <Row gutter={24}>
      <Col span={8} className="ellipsis">
        <CustomTooltip title={aliasName}>{aliasName}</CustomTooltip>
      </Col>
      <Col span={8} className="ellipsis">
        <CustomTooltip title={roleName}>{roleName}</CustomTooltip>
      </Col>
      <Col span={8} className="ellipsis">
        <CustomTooltip title={departmentName}>{departmentName}</CustomTooltip>
      </Col>
    </Row>
  );
};

export default RadioItemView;
