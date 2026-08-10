import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Regression Tests", () => {
  test("main landmark has accessible label", async ({ page }) => {
    await page.goto("/");
    const main = page.locator('main[aria-label="Main content"]');
    await expect(main).toBeVisible();
  });

  test("logo-link has brand-identifying aria-label", async ({ page }) => {
    await page.goto("/");
    const logoLink = page.locator("a.logo-link").first();
    await expect(logoLink).toHaveAttribute("aria-label", /VIPER Security/i);
  });

  test("form inputs have accessible names via aria-label", async ({ page }) => {
    await page.goto("/");
    const bookingForm = page.locator('form[aria-label="Booking Form"]');
    await expect(bookingForm).toBeVisible();

    const fullName = bookingForm.locator('input[name="Full-Name"]');
    await expect(fullName).toHaveAttribute("aria-label", "Full Name");

    const phone = bookingForm.locator('input[name="Phone"]');
    await expect(phone).toHaveAttribute("aria-label", "Phone");

    const location = bookingForm.locator('select[name="Location"]');
    await expect(location).toHaveAttribute("aria-label", "Location");

    const service = bookingForm.locator('select[name="Service"]');
    await expect(service).toHaveAttribute("aria-label", "Service");

    const date = bookingForm.locator('input[name="Pick-Up-Date"]');
    await expect(date).toHaveAttribute("aria-label", "Date");

    const destination = bookingForm.locator('select[name="Destination"]');
    await expect(destination).toHaveAttribute("aria-label", "Destination");
  });

  test("decorative arrow SVGs have aria-hidden", async ({ page }) => {
    await page.goto("/");
    const arrowSvgs = page.locator("span.button-arrow");
    const count = await arrowSvgs.count();
    expect(count).toBeGreaterThan(3);
    for (let i = 0; i < count; i++) {
      await expect(arrowSvgs.nth(i)).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("no broken links to /vehicles/", async ({ page }) => {
    await page.goto("/");
    const vehicleLinks = page.locator('a[href^="/vehicles/"]');
    await expect(vehicleLinks).toHaveCount(0);
  });

  test("fleet images have layout-stabilizing dimensions", async ({ page }) => {
    await page.goto("/");
    const fleetImages = page.locator(".car-listing-image");
    const count = await fleetImages.count();
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const img = fleetImages.nth(i);
        const width = await img.getAttribute("width");
        const height = await img.getAttribute("height");
        if (!width || !height) {
          // If no explicit width/height, check that CSS aspect-ratio is set
          const aspectRatio = await img.evaluate(
            (el) => window.getComputedStyle(el).aspectRatio,
          );
          expect(aspectRatio).toBeTruthy();
        }
      }
    }
  });

  test("meta description length is within limits", async ({ page }) => {
    await page.goto("/");
    const metaDesc = page.locator('meta[name="description"]');
    const content = await metaDesc.getAttribute("content");
    expect(content?.length).toBeLessThanOrEqual(160);
    expect(content?.length).toBeGreaterThan(50);
  });

  test("JSON-LD contains privacyPolicy", async ({ page }) => {
    await page.goto("/");
    const jsonld = page.locator('script[type="application/ld+json"]').first();
    const text = await jsonld.textContent();
    expect(text).toContain('"privacyPolicy"');
  });

  test("axe scan: no critical or serious violations on home", async ({
    page,
  }) => {
    await page.goto("/");
    // Complete the scroll-reveal: elements start at opacity:0 and animate in
    // via IntersectionObserver (0.7s CSS transition). Axe scans mid-reveal
    // would blend text colors toward the background and report phantom
    // contrast failures, so force the final state and let it settle.
    await page.evaluate(() => {
      document
        .querySelectorAll("[data-scroll-reveal]")
        .forEach((el) => el.setAttribute("data-scroll-reveal-visible", ""));
    });
    await page.waitForTimeout(900);
    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations.filter(
      (v) =>
        ["critical", "serious"].includes(v.impact ?? "") &&
        // The skip-link is intentionally outside <main> (it targets it) —
        // axe's `region` rule flags that as moderate; not a real defect.
        v.id !== "region",
    );
    expect(violations).toEqual([]);
  });
});
