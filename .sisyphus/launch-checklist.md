# Viper Security — Launch Checklist

## ✅ Already Complete

| Step | Status |
|------|--------|
| GitHub repo created & pushed | ✅ `github.com/markom01/viper-security` |
| Astro 7 + Tailwind v4 + React project | ✅ |
| All 6 sections (Hero, Services, Fleet, Pricing, Membership, Contact) | ✅ |
| Contact form with Netlify Forms attributes | ✅ |
| Decap CMS config (`/admin`) with 7 collections | ✅ |
| Netlify site created | ✅ `viper-security.netlify.app` |
| Production deploy | ✅ Live at `https://viper-security.netlify.app` |
| Git auto-deploy connected | ✅ Push → auto-deploy |

## 🔧 Manual Steps (Netlify Dashboard)

### Step 1: Enable Forms
1. Go to https://app.netlify.com/sites/viper-security
2. Site settings → **Forms** → Enable
3. Test: submit the contact form on the live site → check Forms dashboard

### Step 2: Enable Identity + Git Gateway
1. Go to https://app.netlify.com/sites/viper-security/settings/identity
2. Click **Enable Identity**
3. Settings → Registration: "Invite only"
4. Scroll down → **Git Gateway** → Enable
5. Add yourself: Identity → Invite users → enter your email

### Step 3: Test the CMS
1. Visit `https://viper-security.netlify.app/admin`
2. Accept the invite email → set password
3. Edit any section → Save
4. Verify the change appears on the live site after ~30s (auto-deploy)

## Optional: Custom Domain
1. Settings → Domain management → Add custom domain → `vipersecurity.ch`
2. Update nameservers at your registrar to Netlify's (shown in dashboard)
3. SSL auto-provisions via Let's Encrypt
