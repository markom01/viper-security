# ADR 002: Contact Form Routing by Geography

## Status
Accepted

## Context
The user has two phone numbers for different regions: Spain (+34 670 038 541) and Italy (+39 349 663 8171). When a contact form is submitted, it needs to reach the right person.

## Decision
Use a single contact form with a "Location" dropdown (Marbella/Costa del Sol or Milano/Italy). Netlify Forms sends all submissions to one email inbox. The email subject line will include the selected location so the right regional operator responds. Both phone numbers are displayed on the page with their respective location context.

## Consequences
- Form has a "Service Location" dropdown: Costa del Sol — Marbella / Northern Italy & Milano
- Email notification subject includes the location
- Phone numbers displayed in a location-specific contact section
- Future enhancement: separate email routing per location
