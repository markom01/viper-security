import { useState, useEffect, useRef } from 'react';

const ROUTES = {
  spain: {
    label: 'Costa del Sol — Marbella',
    services: [
      { name: 'Airport Transfer', routes: [
        'Málaga Airport → Marbella',
        'Málaga Airport → Puerto Banús',
        'Málaga Airport → Estepona',
        'Málaga Airport → Sotogrande',
        'Málaga Airport → Gibraltar',
        'Gibraltar Airport → Marbella',
      ]},
      { name: 'Yacht Transfer', routes: [
        'Puerto Banús Marina',
        'Marbella Marina',
        'Estepona Marina',
        'Sotogrande Marina',
      ]},
      { name: 'Villa Transfer', routes: [
        'Marbella — Villa Transfer',
      ]},
      { name: 'Business Travel', routes: [
        'Marbella — Corporate & Business',
      ]},
      { name: 'Nightlife & Events', routes: [
        'Marbella — Nightlife & Events',
      ]},
    ],
  },
  italy: {
    label: 'Northern Italy & Alps — Milano',
    services: [
      { name: 'Airport Transfer', routes: [
        'Malpensa Airport → Milano',
        'Malpensa Airport → Lugano',
        'Malpensa Airport → Monte Carlo',
        'Linate Airport → Milano',
        'Bergamo Airport → St. Moritz',
        'Milano Airport → Zurich',
        'Milano Airport → Nice',
        'Milano Airport → Lago di Garda',
      ]},
      { name: 'Yacht Transfer', routes: [
        'Milano — Yacht Transfer',
      ]},
      { name: 'Villa Transfer', routes: [
        'Milano — Villa Transfer',
      ]},
      { name: 'Business Travel', routes: [
        'Milano — Corporate & Business',
      ]},
      { name: 'Nightlife & Events', routes: [
        'Milano — Nightlife & Events',
      ]},
    ],
  },
};

function getServicesFor(location) {
  if (!location || !ROUTES[location]) return [];
  return ROUTES[location].services;
}

function getRoutesFor(location, service) {
  if (!location || !service || !ROUTES[location]) return [];
  const svc = ROUTES[location].services.find(s => s.name === service);
  return svc ? svc.routes : [];
}

export default function BookingForm({ labels = {} }) {
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [destination, setDestination] = useState('');

  const services = getServicesFor(location);
  const routes = getRoutesFor(location, service);

  // Reset downstream when location changes
  useEffect(() => {
    setService('');
    setDestination('');
  }, [location]);

  // Reset destination when service changes
  useEffect(() => {
    setDestination('');
  }, [service]);

  return (
    <div className="booking-form-wrapper" style={{ overflow: 'hidden', position: 'relative', borderTop: 'none' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: '#c1a176', zIndex: 1, borderRadius: '24px 24px 0 0' }} />
      <div className="booking-form-block">
        <form name="Booking" method="POST" data-netlify="true" aria-label="Booking Form">
          <input type="hidden" name="form-name" value="Booking" />
          <div className="left-side-fields">
            <div className="booking-form-label-field">
              <label className="booking-form-label">Full Name</label>
              <input className="booking-form-field w-input" name="Full-Name" placeholder="John Doe" type="text" required />
            </div>
            <div className="booking-form-label-field">
              <label className="booking-form-label">Phone</label>
              <input className="booking-form-field w-input" name="Phone" placeholder="+39 349 663 8171" type="tel" required />
            </div>
            <div className="booking-form-label-field">
              <label className="booking-form-label">{labels.location || 'Location'}</label>
              <select className="booking-form-field w-select" value={location}
                onChange={e => setLocation(e.target.value)} required>
                <option value="">Select location...</option>
                <option value="spain">Costa del Sol — Marbella</option>
                <option value="italy">Northern Italy & Alps — Milano</option>
              </select>
            </div>
          </div>
          <div className="right-side-fields">
            <div className="booking-form-label-field">
              <label className="booking-form-label">{labels.service || 'Service'}</label>
              <select className="booking-form-field w-select" value={service}
                onChange={e => setService(e.target.value)} required disabled={!location}>
                <option value="">{location ? 'Select service...' : 'Choose location first'}</option>
                {services.map(s => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="booking-form-label-field">
              <label className="booking-form-label">{labels.destination || 'Destination'}</label>
              <select className="booking-form-field w-select" value={destination}
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
        </form>
      </div>
    </div>
  );
}
