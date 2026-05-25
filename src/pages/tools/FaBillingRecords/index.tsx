import { FC } from 'react';

import Transportation from './components/Transportation';
import styles from './index.less';

// export enum FABillingTabEnum {
//   TRANSPORTATION = 'Transportation',
//   GLOBAL_FORWARDING = 'Global Forwarding',
// }

// export const FABillingTabEnumText = {
//   [FABillingTabEnum.TRANSPORTATION]: 'Transportation',
//   [FABillingTabEnum.GLOBAL_FORWARDING]: 'Global Forwarding',
// };
const FaBillingRecords: FC = () => {
  // const [state, setState] = useSetState<{
  //   tabValue: FABillingTabEnum;
  // }>({
  //   tabValue: FABillingTabEnum.TRANSPORTATION,
  // });

  // const onTabChange = ({ target: { value } }: RadioChangeEvent) => {
  //   setState({ tabValue: value });
  // };
  return (
    <div className={styles.wrap}>
      <Transportation />
      {/* <Space>
        <Radio.Group
          value={state.tabValue}
          optionType="button"
          options={Object.keys(FABillingTabEnumText).map((item) => {
            return {
              label: item,
              key: item,
              value: item,
            };
          })}
          onChange={onTabChange}
        />
      </Space> */}
      {/* {state.tabValue === FABillingTabEnum.TRANSPORTATION ? (
        <Transportation />
      ) : null}
      {state.tabValue === FABillingTabEnum.GLOBAL_FORWARDING ? (
        <GlobalForwarding />
      ) : null} */}
    </div>
  );
};

export default FaBillingRecords;
