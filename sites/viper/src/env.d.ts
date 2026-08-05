/// <reference types="astro/client" />

interface NetlifyIdentity {
  on(event: string, callback: (user?: unknown) => void): void;
}

interface Window {
  netlifyIdentity?: NetlifyIdentity;
}
