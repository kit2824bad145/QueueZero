import { Users, Timer, Building2 } from 'lucide-react';

// The signature visual motif of QueueZero: a perforated digital ticket stub.
const TokenTicket = ({ token }) => {
  const statusLabel = {
    waiting: 'Waiting',
    serving: 'Now Serving',
    completed: 'Completed',
    cancelled: 'Cancelled',
    skipped: 'Skipped',
  }[token.status];

  return (
    <div className={`ticket ticket-${token.status}`}>
      <div className="ticket-main">
        <div className="ticket-row-top">
          <span className="ticket-service">
            <Building2 size={14} /> {token.service?.name}
          </span>
          <span className={`ticket-status ticket-status-${token.status}`}>{statusLabel}</span>
        </div>

        <p className="ticket-label">Your token</p>
        <p className="ticket-number">#{String(token.tokenNumber).padStart(3, '0')}</p>

        {token.status === 'waiting' && (
          <div className="ticket-stats">
            <div>
              <Users size={15} />
              <span>{token.peopleAhead} ahead of you</span>
            </div>
            <div>
              <Timer size={15} />
              <span>~{token.estimatedWaitMinutes} min estimated wait</span>
            </div>
          </div>
        )}

        {token.status === 'serving' && <p className="ticket-serving-msg">It's your turn — please proceed now.</p>}

        {token.currentlyServingNumber != null && token.status === 'waiting' && (
          <p className="ticket-now-serving">
            Now serving: <strong>#{String(token.currentlyServingNumber).padStart(3, '0')}</strong>
          </p>
        )}
      </div>
      <div className="ticket-perforation" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="ticket-stub">
        <p>QUEUEZERO</p>
        <p className="ticket-stub-id">{token._id?.slice(-6).toUpperCase()}</p>
      </div>
    </div>
  );
};

export default TokenTicket;
