import { Form, GetProps, Tooltip } from 'antd';
import { cloneElement } from 'react';

export interface WithErrorTipProps extends GetProps<typeof Form.Item> {
  children: React.ReactElement;
}

const WithErrorTip = (props: WithErrorTipProps) => {
  const { children, ...rest } = props;
  const { status, errors } = Form.Item.useStatus();
  const hasError = status === 'error' && errors.length > 0;
  const clonedElement = cloneElement(children, { ...rest });

  return (
    <>
      <Tooltip
        placement={'top'}
        color="red"
        open={hasError}
        title={errors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      >
        {clonedElement}
      </Tooltip>
    </>
  );
};

export default WithErrorTip;
