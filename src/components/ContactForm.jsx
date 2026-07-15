import React from "react";

const SERVICE_LOCATIONS = [
  { value: "", label: "Select a location" },
  { value: "Costa del Sol — Marbella", label: "Costa del Sol — Marbella" },
  { value: "Northern Italy — Milano", label: "Northern Italy — Milano" },
];

const SERVICE_INTERESTS = [
  { value: "", label: "Select an option (optional)" },
  { value: "Airport Transfer", label: "Airport Transfer" },
  { value: "Hourly Chauffeur", label: "Hourly Chauffeur" },
  { value: "Yacht Transfer", label: "Yacht Transfer" },
  { value: "Business Travel", label: "Business Travel" },
  { value: "VIP Membership", label: "VIP Membership" },
  { value: "Other", label: "Other" },
];

const inputClass =
  "w-full bg-dark-iron border border-white/10 rounded-none px-4 py-3 text-white text-sm font-body placeholder-ash/60 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-200";
const inputErrorClass =
  "w-full bg-dark-iron border border-red-500/60 rounded-none px-4 py-3 text-white text-sm font-body placeholder-ash/60 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-all duration-200";
const labelClass = "block text-white/70 text-xs uppercase tracking-[0.12em] font-body mb-2";
const errorClass = "text-red-400 text-[11px] font-body mt-1.5";

export default function ContactForm() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    serviceLocation: "",
    serviceInterest: "",
    pickupLocation: "",
    dropoffLocation: "",
    date: "",
    message: "",
    consent: false,
  });

  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState("idle"); // idle | submitting | success | error

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.serviceLocation) {
      newErrors.serviceLocation = "Please select a service location";
    }

    if (!formData.consent) {
      newErrors.consent = "You must agree to be contacted about your booking request";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const payload = new FormData();
      payload.append("form-name", "contact");

      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, String(value));
      });

      const response = await fetch("/", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceLocation: "",
        serviceInterest: "",
        pickupLocation: "",
        dropoffLocation: "",
        date: "",
        message: "",
        consent: false,
      });
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div class="border border-white/10 bg-dark-iron p-10 lg:p-14 text-center animate-success-in" aria-live="polite" role="status">
        <style>{`
          @keyframes success-pop {
            0% { opacity: 0; transform: scale(0.5); }
            60% { opacity: 1; transform: scale(1.15); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes success-fade-up {
            0% { opacity: 0; transform: translateY(12px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-success-in {
            animation: success-fade-up 0.5s cubic-bezier(0.25, 1, 0.5, 1) both;
          }
          .animate-success-in .checkmark {
            animation: success-pop 0.5s cubic-bezier(0.25, 1, 0.5, 1) both;
          }
        `}</style>
        <div class="text-gold text-4xl mb-5 checkmark" aria-hidden="true">&#10003;</div>
        <h3 class="font-heading text-gold text-2xl mb-3">
          Thank You
        </h3>
        <p class="text-smoke/70 font-body text-sm max-w-md mx-auto leading-relaxed">
          Your booking request has been received. Our concierge team will respond to you shortly.
        </p>
        <p class="text-ash/60 font-body text-xs mt-4 leading-relaxed">
          For urgent bookings, call us directly on <a href="tel:+393496638171" class="text-gold hover:text-gold-light no-underline">+39 349 663 8171</a> (Italy) or <a href="tel:+34670038541" class="text-gold hover:text-gold-light no-underline">+34 670 038 541</a> (Spain).
        </p>
      </div>
    );
  }

  const errorBanner =
    status === "error" ? (
      <div class="border border-red-500/30 bg-red-500/10 p-4 mb-8 text-center" role="alert">
        <p class="text-red-300 text-sm font-body">
          Something went wrong. Please try again, or contact us directly via <a href="https://wa.me/393496638171" target="_blank" rel="noopener noreferrer" class="text-red-200 underline hover:text-white">WhatsApp</a> or phone: <strong>+39 349 663 8171</strong> (Italy) / <strong>+34 670 038 541</strong> (Spain).
        </p>
      </div>
    ) : null;

  return (
    <form
      method="POST"
      action="/"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      name="contact"
      netlify
      onSubmit={handleSubmit}
      class="space-y-6"
    >
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .submit-spinner {
          animation: spin 0.6s linear infinite;
        }
      `}</style>
      <input type="hidden" name="form-name" value="contact" />
      <p class="!m-0 opacity-0 absolute -z-10" aria-hidden="true">
        <label>
          Don't fill this out: <input name="bot-field" tabindex="-1" autocomplete="off" />
        </label>
      </p>

      {errorBanner}

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label for="contact-name" class={labelClass}>
            Full Name <span class="text-red-400/80">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "error-name" : undefined}
            class={errors.name ? inputErrorClass : inputClass}
          />
          {errors.name && <p id="error-name" class={errorClass}>{errors.name}</p>}
        </div>

        <div>
          <label for="contact-email" class={labelClass}>
            Email <span class="text-red-400/80">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "error-email" : undefined}
            class={errors.email ? inputErrorClass : inputClass}
          />
          {errors.email && <p id="error-email" class={errorClass}>{errors.email}</p>}
        </div>

        <div>
          <label for="contact-phone" class={labelClass}>
            Phone <span class="text-red-400/80">*</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            required
            placeholder="+34 670 038 541"
            value={formData.phone}
            onChange={handleChange}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "error-phone" : undefined}
            class={errors.phone ? inputErrorClass : inputClass}
          />
          {errors.phone && <p id="error-phone" class={errorClass}>{errors.phone}</p>}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label for="contact-service-location" class={labelClass}>
            Service Location <span class="text-red-400/80">*</span>
          </label>
          <select
            id="contact-service-location"
            name="serviceLocation"
            required
            value={formData.serviceLocation}
            onChange={handleChange}
            aria-invalid={!!errors.serviceLocation}
            aria-describedby={errors.serviceLocation ? "error-serviceLocation" : undefined}
            class={`${errors.serviceLocation ? inputErrorClass : inputClass} appearance-none bg-[length:12px_12px] bg-[right_16px_center]`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 12 8'%3E%3Cpath stroke='%237D7D7D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M1 1.5L6 6.5L11 1.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
            }}
          >
            {SERVICE_LOCATIONS.map((opt) => (
              <option key={opt.value} value={opt.value} class="bg-dark-iron">
                {opt.label}
              </option>
            ))}
          </select>
          {errors.serviceLocation && (
            <p id="error-serviceLocation" class={errorClass}>{errors.serviceLocation}</p>
          )}
        </div>

        <div>
          <label for="contact-service-interest" class={labelClass}>
            Service Interest
          </label>
          <select
            id="contact-service-interest"
            name="serviceInterest"
            value={formData.serviceInterest}
            onChange={handleChange}
            class={`${inputClass} appearance-none bg-[length:12px_12px] bg-[right_16px_center]`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 12 8'%3E%3Cpath stroke='%237D7D7D' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='M1 1.5L6 6.5L11 1.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
            }}
          >
            {SERVICE_INTERESTS.map((opt) => (
              <option key={opt.value} value={opt.value} class="bg-dark-iron">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label for="contact-pickup" class={labelClass}>
            Pick-up Location
          </label>
          <input
            id="contact-pickup"
            name="pickupLocation"
            type="text"
            placeholder="Hotel, airport, villa..."
            value={formData.pickupLocation}
            onChange={handleChange}
            class={inputClass}
          />
        </div>
        <div>
          <label for="contact-dropoff" class={labelClass}>
            Drop-off Location
          </label>
          <input
            id="contact-dropoff"
            name="dropoffLocation"
            type="text"
            placeholder="Destination address"
            value={formData.dropoffLocation}
            onChange={handleChange}
            class={inputClass}
          />
        </div>
      </div>

      <div class="max-w-xs">
        <label for="contact-date" class={labelClass}>
          Preferred Date
        </label>
        <input
          id="contact-date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          class={`${inputClass} [color-scheme:dark]`}
        />
      </div>

      <div>
        <label for="contact-message" class={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder="Tell us about your travel requirements..."
          value={formData.message}
          onChange={handleChange}
          class={`${inputClass} resize-y min-h-[100px]`}
        ></textarea>
      </div>

      <div>
        <label class="flex items-start gap-3 cursor-pointer group">
          <input
            name="consent"
            type="checkbox"
            checked={formData.consent}
            onChange={handleChange}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "error-consent" : undefined}
            class="mt-0.5 accent-gold w-4 h-4 shrink-0"
          />
          <span class="text-smoke/70 text-xs font-body leading-relaxed group-hover:text-smoke/90 transition-colors">
            Your privacy matters. We'll only use your details to respond to your booking request.
            <span class="text-red-400/80 ml-0.5">*</span>
          </span>
        </label>
        {errors.consent && <p id="error-consent" class={errorClass}>{errors.consent}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        class="w-full bg-gold text-black text-sm uppercase tracking-[0.12em] font-body font-semibold px-10 py-4 transition-all duration-300 hover:bg-gold-light hover:shadow-[var(--gold-glow-cta)] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-gold"
      >
        {status === "submitting" ? (
          <span class="inline-flex items-center justify-center gap-2.5">
            <span class="inline-block w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full submit-spinner" aria-hidden="true"></span>
            SENDING...
          </span>
        ) : (
          "REQUEST BOOKING"
        )}
      </button>
    </form>
  );
}
