import { test, expect } from "@playwright/test";
test("gallery images load", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push("pageerror:" + err.message));
  await page.goto("http://localhost:4577/gallery/");
  await page.waitForTimeout(1500);
  const broken = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll(".gallery-item img"));
    return imgs.filter((i) => !(i as HTMLImageElement).complete || (i as HTMLImageElement).naturalWidth === 0).length;
  });
  const total = await page.evaluate(() => document.querySelectorAll(".gallery-item img").length);
  console.log(`total imgs: ${total}, broken: ${broken}`);
  console.log("console errors:", errors.length ? errors.slice(0,5) : "NONE");
  expect(broken).toBe(0);
});
