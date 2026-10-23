import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { TicketPercent, LayoutGrid, Ticket, History, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="brand">
          <span className="brand-mark">
            <TicketPercent size={18} />
          </span>
          <span className="brand-name">QueueZero</span>
        </Link>

        <nav className={`navbar-links ${open ? 'is-open' : ''}`}>
          <Link to="/dashboard" onClick={() => setOpen(false)}>
            <LayoutGrid size={16} /> Services
          </Link>
          <Link to="/my-token" onClick={() => setOpen(false)}>
            <Ticket size={16} /> My Token
          </Link>
          <Link to="/history" onClick={() => setOpen(false)}>
            <History size={16} /> History
          </Link>
          <div className="navbar-user">
            <span className="navbar-user-name">{user?.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </nav>

        <button className="navbar-toggle" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
