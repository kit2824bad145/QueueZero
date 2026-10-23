import { Link } from 'react-router-dom';
import { TicketX } from 'lucide-react';

const NotFound = () => (
  <div className="not-found">
    <TicketX size={40} strokeWidth={1.5} />
    <h1>404</h1>
    <p>This page doesn't exist, or your token has expired.</p>
    <Link to="/" className="btn btn-primary">
      Back to home
    </Link>
  </div>
);

export default NotFound;
