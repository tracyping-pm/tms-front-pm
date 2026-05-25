import { Image } from 'antd';
import styles from './index.less';

const HomePage: React.FC = () => {
  return (
    <div className={styles.home}>
      <div className={styles.homeBg}>
        <Image
          src="/img/bg.svg"
          width={'100%'}
          height={'100%'}
          preview={false}
          style={{ objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};

export default HomePage;
