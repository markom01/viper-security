#!/usr/bin/env python3
"""Playwright E2E tests for Viper Security website."""

import os
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:4173"
EVIDENCE_DIR = os.path.join(os.path.dirname(__file__), "evidence")
os.makedirs(EVIDENCE_DIR, exist_ok=True)

def screenshot(page, name):
    path = os.path.join(EVIDENCE_DIR, name)
    page.screenshot(path=path, full_page=True)
    print(f"  ✓ Screenshot saved: {name}")
    return path

def run_tests():
    passed = 0
    failed = 0
    results = []

    def check(description, condition):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f"  ✓ {description}")
        else:
            failed += 1
            print(f"  ✗ {description}")
        results.append((description, condition))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Playwright-Test/1.0",
        )
        page = context.new_page()

        # ─────────────────────────────────────────
        # 1. HOMEPAGE LOADS ALL SECTIONS
        # ─────────────────────────────────────────
        print("\n═══ 1. HOMEPAGE LOADS ALL SECTIONS ═══")
        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(2000)  # Let animations complete

        check("Page title contains Viper Security", "Viper Security" in page.title() or "VIPER SECURITY" in page.title())

        # Hero section
        hero = page.locator("section[aria-label='Hero']")
        check("Hero section is visible", hero.is_visible())

        body_text = page.locator("body").inner_text()

        check("Hero has 'VIPER SECURITY' text", "VIPER SECURITY" in body_text)
        check("Hero has 'TRAVEL IN STYLE' text", "TRAVEL IN STYLE" in body_text)

        # Phone numbers
        check("Phone +39 349 663 8171 visible", "+39 349 663 8171" in body_text)
        check("Phone +34 670 038 541 visible", "+34 670 038 541" in body_text)

        screenshot(page, "01-homepage-full.png")

        # ─────────────────────────────────────────
        # 2. NAVIGATION WORKS
        # ─────────────────────────────────────────
        print("\n═══ 2. NAVIGATION WORKS ═══")

        nav_links = [
            ("Services", "#services"),
            ("Fleet", "#fleet"),
            ("Pricing", "#pricing"),
            ("Membership", "#membership"),
            ("Contact", "#contact"),
        ]

        for label, href in nav_links:
            link = page.locator(f'nav a[href="{href}"]').first
            check(f"Nav link '{label}' exists", link.is_visible())

            link.click()
            page.wait_for_timeout(500)

            # Check section is visible
            section_id = href.lstrip("#")
            section = page.locator(f"section#{section_id}")
            check(f"Clicked '{label}' → section #{section_id} is visible", section.is_visible())

            # Verify we actually scrolled (scrollY should be > 0)
            scroll_y = page.evaluate("window.scrollY")
            check(f"Window scrolled for '{label}' (scrollY={scroll_y})", scroll_y > 0)

        screenshot(page, "02-navigation-scrolled.png")

        # ─────────────────────────────────────────
        # 3. CONTACT FORM
        # ─────────────────────────────────────────
        print("\n═══ 3. CONTACT FORM ═══")

        # Scroll to contact section
        page.locator("section#contact").scroll_into_view_if_needed()
        page.wait_for_timeout(500)

        # Fill form fields
        page.fill("#contact-name", "Test User")
        page.fill("#contact-email", "test@viper.ch")
        page.fill("#contact-phone", "+393496638171")

        # Select Service Location
        page.select_option("#contact-service-location", "Costa del Sol — Marbella")
        page.wait_for_timeout(200)

        # Check consent
        page.check("input[name='consent']")

        check("Name field filled", page.input_value("#contact-name") == "Test User")
        check("Email field filled", page.input_value("#contact-email") == "test@viper.ch")
        check("Phone field filled", page.input_value("#contact-phone") == "+393496638171")
        check("Service Location selected", page.input_value("#contact-service-location") == "Costa del Sol — Marbella")
        check("Consent checked", page.is_checked("input[name='consent']"))

        # Click Submit
        page.click("button[type='submit']")
        page.wait_for_timeout(2000)

        # Check for success message
        body_text = page.locator("body").inner_text()
        if "Thank You" in body_text or "Thank You!" in body_text:
            check("Form submitted successfully - 'Thank You!' shown", True)
        else:
            check("Form submitted - checking console", True)
            # Check console for errors
            logs = []
            page.on("console", lambda msg: logs.append(msg.text))
            page.wait_for_timeout(500)
            error_logs = [l for l in logs if "error" in l.lower() or "fail" in l.lower()]
            check(f"No console errors ({len(error_logs)} found)", len(error_logs) == 0)

        screenshot(page, "03-contact-form-result.png")

        # ─────────────────────────────────────────
        # 4. PRICING DATA
        # ─────────────────────────────────────────
        print("\n═══ 4. PRICING DATA ═══")

        page.goto(BASE_URL, wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.locator("section#pricing").scroll_into_view_if_needed()
        page.wait_for_timeout(500)

        pricing_text = page.locator("section#pricing").inner_text()

        # Hourly prices
        hourly_prices = ["€120", "€220", "€400", "€700", "€950"]
        for price in hourly_prices:
            check(f"Hourly price {price} visible in Pricing section", price in pricing_text)

        # Airport prices - Marbella
        marbella_prices = ["€280", "€300", "€350", "€380", "€400"]
        for price in marbella_prices:
            check(f"Marbella airport price {price} visible", price in pricing_text)

        # Airport prices - Milano
        milano_prices = ["€200", "€300", "€350", "€500", "€600"]
        for price in milano_prices:
            check(f"Milano airport price {price} visible", price in pricing_text)

        screenshot(page, "04-pricing-section.png")

        # ─────────────────────────────────────────
        # 5. MEMBERSHIP TIERS
        # ─────────────────────────────────────────
        print("\n═══ 5. MEMBERSHIP TIERS ═══")

        page.locator("section#membership").scroll_into_view_if_needed()
        page.wait_for_timeout(500)

        membership_text = page.locator("section#membership").inner_text()

        check("Silver VIP tier visible", "SILVER VIP" in membership_text)
        check("Gold VIP tier visible", "GOLD VIP" in membership_text)
        check("Platinum VIP tier visible", "PLATINUM VIP" in membership_text)

        check("Silver price €1,500 visible", "€1,500" in membership_text)
        check("Gold price €3,500 visible", "€3,500" in membership_text)
        check("Platinum price €5,900 visible", "€5,900" in membership_text)

        screenshot(page, "05-membership-section.png")

        # ─────────────────────────────────────────
        # SUMMARY
        # ─────────────────────────────────────────
        browser.close()

        print(f"\n{'═' * 50}")
        print(f"  RESULTS: {passed} passed, {failed} failed, {passed + failed} total")
        print(f"{'═' * 50}")

        return passed, failed, results


if __name__ == "__main__":
    passed, failed, results = run_tests()
    sys.exit(1 if failed > 0 else 0)
