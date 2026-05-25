import { IOpportunityDetailCustomerData } from '@/api/types/opportunity';
import { Col, Row } from 'antd';
import { memo } from 'react';
import { ReactComponent as OpportunitiesCustomer } from '../../../../../public/svg/opportunities_customer.svg';
import styles from './styles.less';

export default memo(function CustomerContactInfo({
  data,
}: {
  data: IOpportunityDetailCustomerData;
}) {
  return (
    <div className={styles.header_customer_info}>
      <OpportunitiesCustomer />
      <div className={styles.header_customer_info_table}>
        <Row gutter={[60, 0]}>
          <Col span={3}>
            <div className={styles.header_customer_info_title}>Name</div>
          </Col>
          <Col span={3}>
            <div className={styles.header_customer_info_title}>Position</div>
          </Col>
          <Col span={4}>
            <div className={styles.header_customer_info_title}>E-mail</div>
          </Col>
          <Col span={4}>
            <div className={styles.header_customer_info_title}>Phone</div>
          </Col>
        </Row>
        {data?.contactList?.map((item) => {
          return (
            <Row gutter={[60, 0]} key={item.id + item.name}>
              <Col span={3}>
                <div className={styles.header_customer_info_grid}>
                  {item.name}
                </div>
              </Col>
              <Col span={3}>
                <div className={styles.header_customer_info_grid}>
                  {item.position ? item.position : '-'}
                </div>
              </Col>
              <Col span={4}>
                <div className={styles.header_customer_info_grid}>
                  {item.email ? item.email : '-'}
                </div>
              </Col>
              <Col span={4}>
                <div className={styles.header_customer_info_grid}>
                  {item.phoneNumber
                    ? `${item.phoneCode} ${item.phoneNumber}`
                    : '-'}
                </div>
              </Col>
            </Row>
          );
        })}
      </div>
    </div>
  );
});
