import { Users, Clock3, ArrowRight } from 'lucide-react';

const ServiceCard = ({ service, onJoin, joining }) => {
  const eta = service.waitingCount * (service.avgServiceTimeMinutes || 5);

  return (
    <div className="service-card">
      <div className="service-card-top">
        <span className="badge badge-dept">{service.department}</span>
        {service.waitingCount === 0 ? (
          <span className="badge badge-success">No wait</span>
        ) : (
          <span className="badge badge-neutral">{service.waitingCount} waiting</span>
        )}
      </div>
      <h3>{service.name}</h3>
      {service.description && <p className="service-card-desc">{service.description}</p>}

      <div className="service-card-meta">
        <span>
          <Users size={14} /> {service.waitingCount} in queue
        </span>
        <span>
          <Clock3 size={14} /> ~{eta || service.avgServiceTimeMinutes} min wait
        </span>
      </div>

      <button className="btn btn-primary btn-block" onClick={() => onJoin(service)} disabled={joining}>
        {joining ? 'Joining...' : 'Join this queue'} <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default ServiceCard;
