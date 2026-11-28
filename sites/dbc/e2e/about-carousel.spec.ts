import { expect, test } from "@playwright/test";

// Homepage #about must honour the CMS "About Carousel Images" field.
// The Gallery-derived carousel is only a fallback for an empty CMS field.
const CMS_IMAGES = [
  "/images/cms/960edf3e-c69d-4b11-9387-a9a6de83ccba.jpeg",
  "/images/cms/e6c8f92a-24f5-42fb-ae60-6b904681be2f.jpeg",
];

test("homepage #about carousel uses CMS About Carousel Images", async ({
  page,
}) => {
  await page.goto("/");
  const hrefs = await page
    .locator("#about .carousel-slide a.carousel-zoom")
    .evaluateAll((anchors) =>
      anchors.map(
        (a) =>
          new URL(a.getAttribute("href") ?? "", "http://localhost").pathname,
      ),
    );

  expect(hrefs).toEqual(CMS_IMAGES);
});
