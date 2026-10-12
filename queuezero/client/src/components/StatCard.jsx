const StatCard = ({ icon: Icon, label, value, tone = 'default' }) => {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
