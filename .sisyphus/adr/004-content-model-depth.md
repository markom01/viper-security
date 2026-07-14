# ADR 004: Content Model Depth — Simple Flat Structure

## Status
Accepted

## Context
The user chose a simple flat content model for the Decap CMS rather than a complex structured approach with repeatable entries and data tables.

## Decision
Each page section gets one flat content entry with editable text fields. No repeatable or nested content structures. Content is stored as markdown files with frontmatter in Astro Content Collections.

## Consequences
- Each section (hero, services, fleet, pricing, membership) has a single editable markdown file
- Editing is straightforward — the CMS shows one form per section
- Less flexible for adding multiple vehicles or service items later
- Easy for a non-technical admin to understand
