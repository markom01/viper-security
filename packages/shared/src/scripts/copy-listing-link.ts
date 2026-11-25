/**
 * Listing titles are copy-link buttons. The card's own id is the deep-link
 * anchor, so Fleet and Selling need no extra markup duplication. Bundled as
 * an external module to satisfy the strict `script-src 'self'` CSP.
 */
const COPIED_MS = 2200;

function legacyCopy(text: string): boolean {
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const ok = document.execCommand("copy");
  input.remove();
  return ok;
}

export function initListingLinkCopy(): void {
  document
    .querySelectorAll<HTMLButtonElement>("[data-listing-copy]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const anchor = button.closest<HTMLElement>(".car-card")?.id;
        const feedback = button.querySelector<HTMLElement>(
          ".car-listing-copy-feedback",
        );
        if (!anchor || !feedback) return;

        const url = new URL(`#${anchor}`, window.location.href).href;
        let copied = false;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
            copied = true;
          }
        } catch {
          // Non-secure contexts (plain HTTP) have no clipboard API.
        }
        if (!copied) copied = legacyCopy(url);

        feedback.textContent = copied ? "Link copied" : "Copy failed";
        button.dataset.copied = "";
        window.setTimeout(() => {
          delete button.dataset.copied;
          feedback.textContent = "";
        }, COPIED_MS);
      });
    });
}
