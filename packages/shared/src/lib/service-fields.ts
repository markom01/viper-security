import { slugify } from "./slugify";
import type { SiteGlobalsData } from "../content/types";

export type ServiceFieldType = "text" | "location" | "country" | "vehicle" | "select" | "number";
export type ServiceFieldSide = "left" | "right";

export interface ServiceFieldDef {
  label: string;
  placeholder?: string;
  name: string;
  type?: ServiceFieldType;
  options?: string[];
  side?: ServiceFieldSide;
}

export interface OfferingLike {
  title: string;
  slug?: string;
  [key: string]: unknown;
}

export interface ServiceEntryLike {
  title: string;
  slug?: string;
  form_fields?: ServiceFieldDef[];
}

type EntryInput = ServiceEntryLike | { data: ServiceEntryLike; id?: string };

function asData(e: EntryInput): ServiceEntryLike {
  if ("data" in e && e.data && typeof e.data === "object") {
    const d = e.data as ServiceEntryLike;
    // Collection-entry id fallback (e.g. "customizing.yaml") when the entry
    // carries no explicit slug — mirrors the previous per-site merge logic.
    if (!d.slug && typeof e.id === "string") {
      const base = e.id.replace(/\.ya?ml$/, "").split("/").pop() || "";
      if (base) return { ...d, slug: base };
    }
    return d;
  }
  return e as ServiceEntryLike;
}

/**
 * Merge per-service `form_fields` (service collection) into a list of
 * offerings (home offerings, booking service names, …) so the shared hero
 * BookingForm can inject service-specific fields on service select.
 *
 * Match order per offering: slug first, then title. No match → `form_fields: []`.
 * Accepts raw service data objects or `getCollection("service")` entries.
 */
export function withServiceFields<T extends OfferingLike>(offerings: T[], entries: EntryInput[]): (T & { form_fields: ServiceFieldDef[] })[] {
  const data = entries.map(asData);
  const bySlug = new Map<string, ServiceFieldDef[]>();
  const byTitle = new Map<string, ServiceFieldDef[]>();
  for (const d of data) {
    if (!d || !d.title) continue;
    const fields = d.form_fields ?? [];
    bySlug.set(d.slug ?? slugify(d.title), fields);
    if (!byTitle.has(d.title)) byTitle.set(d.title, fields);
  }
  return offerings.map((o) => ({
    ...o,
    form_fields: (o.slug ? bySlug.get(o.slug) : undefined) ?? byTitle.get(o.title) ?? [],
  }));
}

/**
 * Unique booking service names across all booking_data regions
 * (spain + italy), in first-seen order. Used to key the hero
 * `services` prop on booking-driven sites (VIPER) so the shared
 * BookingForm can load service-specific fields per selected service.
 */
export function bookingServiceNames(booking_data?: SiteGlobalsData["booking_data"] | null): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const region of [booking_data?.spain, booking_data?.italy]) {
    for (const s of region?.services ?? []) {
      if (s?.name && !seen.has(s.name)) {
        seen.add(s.name);
        names.push(s.name);
      }
    }
  }
  return names;
}
