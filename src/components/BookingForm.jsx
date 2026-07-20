import { useState, useEffect } from 'react';

const ROUTES = {
  spain: {
    label: 'Costa del Sol — Marbella',
    services: [
      { name: 'Airport Transfer', routes: [
        'Málaga Airport → Marbella', 'Málaga Airport → Puerto Banús',
        'Málaga Airport → Estepona', 'Málaga Airport → Sotogrande',
        'Málaga Airport → Gibraltar', 'Gibraltar Airport → Marbella',
      ]},
      { name: 'Yacht Transfer', routes: [
        'Puerto Banús Marina', 'Marbella Marina', 'Estepona Marina', 'Sotogrande Marina',
      ]},
      { name: 'Villa Transfer', routes: ['Marbella — Villa Transfer'] },
      { name: 'Business Travel', routes: ['Marbella — Corporate & Business'] },
      { name: 'Nightlife & Events', routes: ['Marbella — Nightlife & Events'] },
    ],
  },
  italy: {
    label: 'Northern Italy & Alps — Milano',
    services: [
      { name: 'Airport Transfer', routes: [
        'Malpensa Airport → Milano', 'Malpensa Airport → Lugano',
        'Malpensa Airport → Monte Carlo', 'Linate Airport → Milano',
        'Bergamo Airport → St. Moritz', 'Milano Airport → Zurich',
        'Milano Airport → Nice', 'Milano Airport → Lago di Garda',
      ]},
      { name: 'Yacht Transfer', routes: ['Milano — Yacht Transfer'] },
      { name: 'Villa Transfer', routes: ['Milano — Villa Transfer'] },
      { name: 'Business Travel', routes: ['Milano — Corporate & Business'] },
      { name: 'Nightlife & Events', routes: ['Milano — Nightlife & Events'] },
    ],
  },
};

export default function BookingForm({ labels = {} }) {
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [destination, setDestination] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const services = location ? ROUTES[location].services : [];
  const routes = service ? services.find(s => s.name === service)?.routes || [] : [];

  useEffect(() => { setService(''); setDestination(''); }, [location]);
  useEffect(() => { setDestination(''); }, [service]);

  const handleSubmit = (e) => {
    const form = e.target;
    if (form.checkValidity()) {
      setSubmitted(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="booking-form-wrapper form-card">
      <div className="form-accent-bar" />
      <div className="booking-form-block">
        <form name="Booking" method="POST" data-netlify="true" className="booking-form" onSubmit={handleSubmit} aria-label="Booking Form">
          <input type="hidden" name="form-name" value="Booking" />
          <div className="left-side-fields">
            <div className="booking-form-label-field">
              <label className="booking-form-label">{labels.name || 'Full Name'}</label>
              <input className="booking-form-field w-input" name="Full-Name" placeholder="John Doe" type="text" required />
            </div>
            <div className="booking-form-label-field">
              <label className="booking-form-label">{labels.phone || 'Phone'}</label>
              <input className="booking-form-field w-input" name="Phone" placeholder="+39 349 663 8171" type="tel" required />
            </div>
            <div className="booking-form-label-field">
              <label className="booking-form-label">{labels.location || 'Location'}</label>
              <select className="booking-form-field w-select" name="Location" value={location}
                onChange={e => setLocation(e.target.value)} required>
                <option value="">Select location...</option>
                {Object.entries(ROUTES).map(([key, r]) => (
                  <option key={key} value={key}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="right-side-fields">
            <div className="booking-form-label-field">
              <label className="booking-form-label">{labels.service || 'Service'}</label>
              <select className="booking-form-field w-select" name="Service" value={service}
                onChange={e => setService(e.target.value)} required disabled={!location}>
                <option value="">{location ? 'Select service...' : 'Choose location first'}</option>
                {services.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="booking-form-label-field">
              <label className="booking-form-label">{labels.date || 'Date'}</label>
              <input className="booking-form-field w-input" name="Pick-Up-Date" type="date" required />
            </div>
            <div className="booking-form-label-field">
              <label className="booking-form-label">{labels.destination || 'Destination'}</label>
              <select className="booking-form-field w-select" name="Destination" value={destination}
                onChange={e => setDestination(e.target.value)} required disabled={!service}>
                <option value="">{service ? 'Select route...' : 'Choose location & service first'}</option>
                {routes.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="booking-button-wrapper">
              <input type="submit" className="booking-form-button home-booking-form w-button" value="Book Now" />
            </div>
          </div>
          {submitted && (
            <div className="booking-form-success w-form-done" role="status">
              <div>Thank you! Your booking request has been received.</div>
            </div>
          )}
          {error && (
            <div className="form-error-message w-form-fail" role="alert">
              <div>Please fill in all required fields.</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
