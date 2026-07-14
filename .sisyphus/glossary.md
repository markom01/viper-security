# Glossary: Viper Security MVP

| Term | Definition |
|------|-----------|
| **Viper Security** | The brand name for the luxury chauffeur service website. Parent company / brand. |
| **Elite Adventure** | The service experience name (from the original brand asset). Not displayed on the MVP website. |
| **Decap CMS** | Git-based content management system. Allows admin to edit website content via a web UI at /admin. Changes are saved as commits to the Git repo. |
| **Netlify Identity** | Authentication service from Netlify. Used to secure the Decap CMS admin panel. |
| **Git Gateway** | Netlify service that acts as a bridge between Netlify Identity and the Git repo, allowing CMS edits to be committed without giving direct GitHub access to editors. |
| **Netlify Forms** | Netlify's built-in form handling. No backend needed — form submissions are captured and emailed. |
| **Astro Content Collections** | Astro's built-in content management system. Type-safe Markdown/MDX files with frontmatter validation via Zod schemas. |
| **Cruip Open** | Free, dark-themed Next.js + Tailwind template used as design inspiration (not code source) for the website's visual direction. |
| **Playwright MCP** | Playwright's Model Context Protocol integration. Used for automated browser testing and QA verification. |
| **Lighthouse** | Google's automated tool for auditing web page quality (Performance, Accessibility, Best Practices, SEO). |
| **Liquid Glass** | A design aesthetic combining glassmorphism (frosted glass effect) with glossy, reflective surfaces. Used for luxury visual feel. |
| **GDPR Consent Banner** | A mandatory notice for EU websites informing visitors about cookie/data collection and obtaining consent. |
| **OSS Booking Widget** | Open Source Software booking widget for v2 — a future embeddable component for online ride reservations. |
