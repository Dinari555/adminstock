const CardStat = ({ title, value, icon, color = 'primary' }) => {
  return (
    <div className={`card border-${color} mb-3`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className={`text-${color}`}>{value}</h3>
          </div>
          <div style={{ fontSize: '3rem' }}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default CardStat;



