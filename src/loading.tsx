import TmsLoading from '../public/gif/tms_loading.gif';

export default () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img style={{ width: '240px', height: '240px' }} src={TmsLoading} />
    </div>
  );
};
