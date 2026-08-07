// Shared dbc navigation — single source for home + gallery pages.
// CMS labels override literals; a page passes its `pageContent.labels`.
export function buildNav(labels) {
  return [
    { label: labels['nav.home'] || 'Home', href: '/' },
    { label: labels['nav.about'] || 'About', href: '/#about' },
    { label: labels['nav.services'] || 'Services', href: '/#services' },
    { label: labels['nav.gallery'] || 'Gallery', href: '/gallery' },
    { label: labels['nav.howItWorks'] || 'How It Works', href: '/#how-it-works' },
  ];
}
