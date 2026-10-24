import { test, expect } from "@playwright/test";

// VIPER service-detail forms: pages whose service is NOT part of the chauffeur
// booking cascade (Vehicle Armoring, Sale of Luxury Cars) render service-specific
// fields only — the Location → Service → Destination cascade must not appear.
// Chauffeur service pages keep the cascade exactly as before.

const tomorrow = () =>
  new Date(Date.now() + 86400000).toISOString().slice(0, 10);

test.beforeEach(async ({ page }) => {
  // Capture the wa.me URL instead of opening a popup.
  await page.addInitScript(() => {
    (window as unknown as { __wa?: string }).__wa = undefined;
    window.open = ((url?: string | URL) => {
      (window as unknown as { __wa?: string }).__wa = String(url);
      return null;
    }) as typeof window.open;
  });
});

test("Vehicle Armoring page shows armoring fields and no chauffeur cascade", async ({
  page,
}) => {
  await page.goto("/services/armored-vehicles/");
  const form = page.locator("form.booking-form");
  await expect(form).toBeVisible();

  // Service-specific fields.
  await expect(form.locator("[data-vehicle-make]")).toBeVisible();
  // Only cars can be armored: no vehicle-type selector, car makes only.
  await expect(form.locator('select[name="vehicle-type"]')).toHaveCount(0);
  await expect(form.locator("label", { hasText: "Vehicle type" })).toHaveCount(
    0,
  );
  await expect(
    form.locator('input[type="hidden"][name="vehicle-type"]'),
  ).toHaveValue("car");
  await expect(form.locator('select[name="protection_level"]')).toBeVisible();
  await expect(form.locator('input[name="budget"]')).toBeVisible();
  await expect(form.locator('input[name="details"]')).toBeVisible();

  // No chauffeur cascade on this page.
  await expect(form.locator('select[name="Location"]')).toHaveCount(0);
  await expect(form.locator('select[name="Destination"]')).toHaveCount(0);
  await expect(form.locator("#form-price-value")).toHaveCount(0);

  // The service travels as a hidden preset.
  await expect(
    form.locator('input[type="hidden"][name="Service"]'),
  ).toHaveValue("Vehicle Armoring");
});

test("Vehicle Armoring submit sends service, protection level and details to WhatsApp", async ({
  page,
}) => {
  await page.goto("/services/armored-vehicles/");
  const form = page.locator("form.booking-form");
  await form.locator('input[name="Full-Name"]').fill("John Smith");
  await form.locator('input[name="Phone"]').fill("+34 600 000 000");
  await form.locator('input[name="Pick-Up-Date"]').fill(tomorrow());
  await form.locator('select[name="protection_level"]').selectOption("B6");
  await form
    .locator('input[name="details"]')
    .fill("Range Rover 2022, night routes");

  const submit = form.locator('button[type="submit"]');
  await expect(submit).toBeEnabled();
  await submit.click();

  const url = await page.evaluate(
    () => (window as unknown as { __wa?: string }).__wa ?? "",
  );
  expect(url).toContain("https://wa.me/");
  const text = new URL(url).searchParams.get("text") ?? "";
  expect(text).toContain("*Service:* Vehicle Armoring");
  expect(text).toContain("*Protection level:* B6");
  expect(text).toContain("*Details:* Range Rover 2022, night routes");
});

test("Sale of Luxury Cars page shows vehicle picker, budget and trade-in", async ({
  page,
}) => {
  await page.goto("/services/luxury-cars-sale/");
  const form = page.locator("form.booking-form");
  await expect(form).toBeVisible();

  await expect(form.locator("[data-vehicle-make]")).toBeVisible();
  // Cars only: no vehicle-type selector, hidden car value.
  await expect(form.locator("select[data-vehicle-type]")).toHaveCount(0);
  await expect(form.locator("label", { hasText: "Vehicle type" })).toHaveCount(
    0,
  );
  await expect(
    form.locator('input[type="hidden"][data-vehicle-type]'),
  ).toHaveValue("car");
  await expect(form.locator('input[name="budget"]')).toBeVisible();
  await expect(form.locator('input[name="trade_in"]')).toBeVisible();

  // No chauffeur cascade on this page.
  await expect(form.locator('select[name="Location"]')).toHaveCount(0);

  await expect(
    form.locator('input[type="hidden"][name="Service"]'),
  ).toHaveValue("Sale of Luxury Cars");
});

test("home page keeps the chauffeur booking cascade", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("form.booking-form");
  await expect(form.locator('select[name="Location"]')).toBeVisible();
  await expect(form.locator('select[name="Service"]')).toBeVisible();
  await expect(form.locator('select[name="Destination"]')).toBeVisible();
  await expect(form.locator("#form-price-value")).toBeVisible();
});
