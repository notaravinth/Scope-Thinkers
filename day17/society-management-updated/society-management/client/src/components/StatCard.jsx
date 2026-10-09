const StatCard = ({ label, value, hint, tone = "cream", icon = "•" }) => (
  <div className={`stat-tile stat-${tone}`}>
    <div className="stat-top">
      <span>{label}</span>
      <b>{icon}</b>
    </div>
    <strong>{value}</strong>
    <p>{hint}</p>
  </div>
);

export default StatCard;
