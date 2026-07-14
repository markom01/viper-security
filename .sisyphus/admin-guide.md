# Viper Security — Decap CMS Admin Guide

## 1. Accessing the Admin Panel

1. Open your browser and go to: **`https://[yoursite.com]/admin/`**
2. You will see the Viper Security CMS login screen

## 2. Logging In (Netlify Identity)

1. Click the **"Login with Netlify Identity"** button
2. Enter your email address and click **"Send me a login link"** (or use password if already set up)
3. Check your email inbox — you'll receive a magic link from Netlify
4. Click the link — the admin panel opens automatically

> **First time?** An admin must invite you via the Netlify dashboard → Identity tab. You'll receive an invitation email to set your password.

## 3. Navigating the CMS

Once logged in, you'll see the sidebar with these content sections:

| Section | What You Can Edit |
|---|---|
| **Hero Section** | Homepage banner: brand name, tagline, subtitle, CTA button text, phone numbers |
| **Marbella Services** | Airport routes, villa transfers, yacht marinas, business services, nightlife venues |
| **Milano Services** | Airport routes, villa transfers, yacht transfers, business services, nightlife venues |
| **Fleet** | Individual vehicle entries: name, features, passenger/capacity specs |
| **Hourly Pricing** | Hourly rate tiers: hours, price in € |
| **Airport Pricing** | Per-route airport transfer pricing |
| **VIP Membership** | Membership tiers: name, price, benefits, featured flag |

## 4. Editing Content

### Editing a Single File (Hero, Services, Pricing, Membership)

1. Click a collection in the sidebar (e.g. **Hero Section**)
2. Click the entry name to open the editor
3. Edit the fields in the form:
   - **Text fields**: type directly
   - **Lists** (routes, services, benefits): click **"Add"** to add items, click the **X** to remove
   - **Booleans** (checkboxes): toggle on/off
4. Click **"Save"** (floppy disk icon in the toolbar)
5. Optionally set a status: click the dropdown and choose **"In Review"**, then **"Publish"** to go live

### Adding a New Fleet Vehicle

1. Go to **Fleet** in the sidebar
2. Click **"New Fleet"** button
3. Fill in the fields and click **Save**

## 5. How Content Goes Live

- **Saving publishes immediately** — Decap CMS commits directly to the `main` branch, and Netlify auto-deploys
- The full pipeline: **Save in CMS → Git commit to main → Netlify builds → Site updates** (typically 1–3 minutes)
- You can view the deployment status at: Netlify Dashboard → Deploys tab

> ⚠️ **Important**: Every save triggers a new deployment. Changes are live within minutes.

## 6. Troubleshooting

| Issue | Fix |
|---|---|
| Can't log in | Check your email for the magic link. Ask an admin to re-invite you if expired. |
| Changes not showing | Wait 2–3 minutes for the build. Check Netlify Deploys for errors. |
| "Failed to save" error | Refreshing and retrying usually fixes it. If persistent, contact support. |
| Wrong content showing | Hard-refresh your browser (Cmd+Shift+R). Clear cache if needed. |
| Cannot see /admin/ page | Verify the site domain is correct and the admin build was deployed. |

## 7. Contact & Support

- **Technical contact**: Marko — markom@viper-security.com
- **For CMS access issues** (invitations, password reset): ask Marko via Slack/email
- **For content questions** (what to write, tone, accuracy): check with the marketing team
