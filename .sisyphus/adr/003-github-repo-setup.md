# ADR 003: GitHub Repository Setup

## Status
Accepted

## Context
Decap CMS + Netlify deploy require a Git repository. The user doesn't have one yet and needs help.

## Decision
Include GitHub repo creation as part of the project scaffolding in the plan. Steps: create repo via `gh repo create` or GitHub web UI, push local code, connect to Netlify for auto-deploy.

## Consequences
- Task 1 (scaffolding) expanded to include `git init`, initial commit, repo creation, and push
- Task 4 (Netlify config) expanded to include connecting the GitHub repo to Netlify
- No external CI needed — Netlify auto-deploys on push to main
