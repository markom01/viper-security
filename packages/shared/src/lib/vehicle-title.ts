import type { FleetVehicleData } from "../types";

const present = (value: unknown): string | undefined => {
  const text = String(value ?? "").trim();
  return text || undefined;
};

/**
 * Card title from NHTSA `vehicle` fields (year make model), with the legacy
 * `name` fallback for chauffeur/armored entries that have no breakdown.
 */
export function vehicleTitle(vehicle: FleetVehicleData): string {
  const make = present(vehicle.vehicle?.make);
  const model = present(vehicle.vehicle?.model);
  if (!make && !model) return present(vehicle.name) || "";
  return [present(vehicle.vehicle?.year || vehicle.year), make, model]
    .filter((part): part is string => !!part)
    .join(" ");
}
