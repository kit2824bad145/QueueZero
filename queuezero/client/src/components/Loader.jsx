const Loader = ({ label = 'Loading...', fullScreen = false, small = false }) => {
  return (
    <div className={fullScreen ? 'loader-fullscreen' : small ? 'loader-inline' : 'loader-block'}>
      <span className="spinner" aria-hidden="true" />
      {!small && <p>{label}</p>}
    </div>
  );
};

export default Loader;
