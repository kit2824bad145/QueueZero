import { Link } from 'react-router-dom';
import {
  TicketPercent,
  ArrowRight,
  QrCode,
  BellRing,
  Gauge,
  Building2,
  Landmark,
  Stethoscope,
  GraduationCap,
  Scissors,
  Store,
  ShieldCheck,
} from 'lucide-react';

const industries = [
  { icon: Stethoscope, label: 'Hospitals' },
  { icon: Landmark, label: 'Banks' },
  { icon: Building2, label: 'Government Offices' },
  { icon: GraduationCap, label: 'Colleges' },
  { icon: Store, label: 'Restaurants' },
  { icon: Scissors, label: 'Salons' },
];

const steps = [
  {
    title: 'Pick a service',
    text: 'Browse the live list of services at a location and choose the one you need.',
  },
  {
    title: 'Get your token',
    text: 'QueueZero issues a token instantly — no counter, no paper, no standing in line.',
  },
  {
    title: 'Track in real time',
    text: 'Watch your position and estimated wait update live from wherever you are.',
  },
  {
    title: 'Walk in at the right time',
    text: 'Arrive when your token is close to being called instead of waiting on your feet.',
  },
];

const features = [
  {
    icon: QrCode,
    title: 'Instant digital tokens',
    text: 'Every join generates a unique, trackable token number tied to your account — no printed slips.',
  },
  {
    icon: BellRing,
    title: 'Live position tracking',
    text: 'See exactly how many people are ahead of you and the currently serving token, refreshed automatically.',
  },
  {
    icon: Gauge,
    title: 'Smart wait estimates',
    text: 'Estimated wait time is calculated from real service speed, not a guess — so plans stay realistic.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for staff too',
    text: 'Admins get a live queue console to call, skip, or complete tokens and monitor every counter at once.',
  },
];

const LandingPage = () => {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="brand">
            <span className="brand-mark">
              <TicketPercent size={18} />
            </span>
            <span className="brand-name">QueueZero</span>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="hero-eyebrow">Digital queue management</p>
          <h1>
            Skip the Line.
            <br />
            Save Your Time.
          </h1>
          <p className="hero-subtitle">
            QueueZero is a smart digital queue management platform that lets you join, track, and
            manage queues without standing in line.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Join a Queue <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Admin / Staff Login
            </Link>
          </div>
          <div className="hero-industries">
            {industries.map(({ icon: Icon, label }) => (
              <span key={label}>
                <Icon size={14} /> {label}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="ticket hero-ticket">
            <div className="ticket-main">
              <div className="ticket-row-top">
                <span className="ticket-service">
                  <Building2 size={14} /> General OPD Consultation
                </span>
                <span className="ticket-status ticket-status-waiting">Waiting</span>
              </div>
              <p className="ticket-label">Your token</p>
              <p className="ticket-number">#042</p>
              <div className="ticket-stats">
                <div>
                  <span>6 ahead of you</span>
                </div>
                <div>
                  <span>~18 min estimated wait</span>
                </div>
              </div>
              <p className="ticket-now-serving">
                Now serving: <strong>#036</strong>
              </p>
            </div>
            <div className="ticket-perforation">
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} />
              ))}
            </div>
            <div className="ticket-stub">
              <p>QUEUEZERO</p>
              <p className="ticket-stub-id">7F92AE</p>
            </div>
          </div>
          <div className="hero-visual-card hero-visual-card-1">
            <Gauge size={16} /> Live wait estimate
          </div>
          <div className="hero-visual-card hero-visual-card-2">
            <BellRing size={16} /> Token #042 called soon
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <p className="section-eyebrow">How it works</p>
        <h2 className="section-title">From counter chaos to four simple steps</h2>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div className="step-card" key={step.title}>
              <span className="step-index">{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-muted" id="features">
        <p className="section-eyebrow">Why QueueZero</p>
        <h2 className="section-title">Everything a front desk needs, without the front desk</h2>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <h2>Your next visit doesn't need a waiting room.</h2>
          <p>Create a free account and join your first digital queue in under a minute.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Join a Queue <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="brand">
          <span className="brand-mark">
            <TicketPercent size={18} />
          </span>
          <span className="brand-name">QueueZero</span>
        </div>
        <p>&copy; {new Date().getFullYear()} QueueZero. Built as an academic full-stack project.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
