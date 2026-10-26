// Service-page fleet resolution, shared by VIPER and DBC.
//
// A service page shows vehicles from its own `offering.fleet[]` unless a
// dedicated `currently-selling` collection has entries, in which case the
// collection wins. Both sites order cards by `order` then id so the display
// order is stable when orders collide (or are missing).
import type { FleetEntry, FleetVehicleData } from "../types";
import { slugify } from "./slugify";

/** Minimal shape of a collection entry needed here (Astro's CollectionEntry data). */
export interface SellingEntry {
  id: string;
  data: FleetVehicleData;
}

/** Offering fields used to resolve its vehicle list. */
export interface ServiceFleetSource {
  title: string;
  slug?: string;
  fleet?: FleetVehicleData[];
}

export function resolveServiceFleet(
  offering: ServiceFleetSource,
  sellingEntries: SellingEntry[] = [],
): FleetEntry[] {
  const slug = offering.slug ?? slugify(offering.title);
  const source: FleetEntry[] = sellingEntries.length
    ? sellingEntries.map((entry) => ({
        id: entry.id,
        collection: "fleet" as const,
        data: entry.data,
      }))
    : (offering.fleet || []).map((vehicle) => ({
        id: `${slug}-${slugify(vehicle.name ?? "")}`,
        collection: "fleet" as const,
        data: vehicle,
      }));

  return source.sort(
    (a, z) =>
      (a.data.order ?? Infinity) - (z.data.order ?? Infinity) ||
      a.id.localeCompare(z.id),
  );
}
