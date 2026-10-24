// Phone helpers shared across sites (footers, WhatsApp CTAs).
export const cleanPhone = (phone?: string) => (phone || "").replace(/\D/g, "");
