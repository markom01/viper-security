/**
 * Shared UI strings for VIPER Security.
 * Import and use as fallback values instead of hardcoding strings in components.
 * Strings managed via CMS (pageContent) take precedence over these defaults.
 */

const SITE_NAME = 'VIPER Security';
const SITE_URL = 'https://vipersecurity.com';
const LOGO_ALT = 'VIPER Security home';
const IMAGE_ALT_FLEET = 'VIPER Security luxury chauffeur fleet';
const SPAIN_LABEL = 'Costa del Sol — Marbella';
const ITALY_LABEL = 'Northern Italy & Alps — Milano';

const STRINGS = {
  nav: {
    homeAria: 'home',
    menuAria: 'menu',
    cancelAlt: 'Close menu',
  },

  seo: {
    title: SITE_NAME + ' — Luxury Chauffeur & VIP Transport',
    description: SITE_NAME + ' — luxury chauffeur, executive transport, airport transfers, and VIP travel in Marbella and Milano. Premium private driver services with a fleet of luxury vehicles.',
    ogLocale: 'en_US',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    themeColor: '#000000',
  },

  jsonld: {
    orgName: SITE_NAME,
    orgUrl: SITE_URL,
    orgLogo: SITE_URL + '/template_files/678ba669a9998141bea0c6a9_logo.svg',
    orgDescription: 'Luxury chauffeur & VIP transport services in Marbella and Milano.',
    webSiteName: SITE_NAME,
    webSiteUrl: SITE_URL,
    phoneItaly: '+39 349 663 8171',
    phoneSpain: '+34 670 038 541',
  },

  admin: {
    title: 'Viper Security — Admin',
  },

  notFoundTitle: 'Page Not Found — ' + SITE_NAME,

  hero: {
    imageAlt: IMAGE_ALT_FLEET,
    bookingFormAria: 'Booking Form',
    formName: 'Booking',
    namePlaceholder: 'Your full name',
    phonePlaceholder: 'Your phone number',
    selectLocation: 'Select location...',
    optionSpain: SPAIN_LABEL,
    optionItaly: ITALY_LABEL,
    chooseLocationFirst: 'Choose location first',
    selectService: 'Select service...',
    chooseServiceFirst: 'Choose location & service first',
    selectRoute: 'Select route...',
    bookNow: 'Book Now',
    successMessage: 'Thank you! Your booking request has been received.',
    errorMessage: 'Please fill in all required fields.',
  },

  bookingData: {
    spain: {
      label: SPAIN_LABEL,
      services: [
        { name: 'Airport Transfer', routes: [
          'Malaga Airport → Marbella', 'Malaga Airport → Puerto Banus',
          'Malaga Airport → Estepona', 'Malaga Airport → Sotogrande',
          'Malaga Airport → Gibraltar', 'Gibraltar Airport → Marbella',
        ]},
        { name: 'Yacht Transfer', routes: [
          'Puerto Banus Marina', 'Marbella Marina', 'Estepona Marina', 'Sotogrande Marina',
        ]},
        { name: 'Villa Transfer', routes: ['Marbella — Villa Transfer'] },
        { name: 'Business Travel', routes: ['Marbella — Corporate & Business'] },
        { name: 'Nightlife & Events', routes: ['Marbella — Nightlife & Events'] },
      ],
    },
    italy: {
      label: ITALY_LABEL,
      services: [
        { name: 'Airport Transfer', routes: [
          'Malpensa Airport → Milano', 'Malpensa Airport → Lugano',
          'Malpensa Airport → Monte Carlo', 'Linate Airport → Milano',
          'Bergamo Airport → St. Moritz', 'Milano Airport → Zurich',
          'Milano Airport → Nice', 'Milano Airport → Lago di Garda',
        ]},
        { name: 'Yacht Transfer', routes: ['Milano — Yacht Transfer'] },
        { name: 'Villa Transfer', routes: ['Milano — Villa Transfer'] },
        { name: 'Business Travel', routes: ['Milano — Corporate & Business'] },
        { name: 'Nightlife & Events', routes: ['Milano — Nightlife & Events'] },
      ],
    },
  },

  icons: {
    arrowAlt: '',
    logoAlt: LOGO_ALT,
  },

  marquee: {
    ariaLabel: 'Trusted Luxury Service Provider',
    srHeading: 'Trusted Luxury Service Provider',
  },

  about: {
    imageAlt: IMAGE_ALT_FLEET,
  },

  cta: {
    imageAlt: 'Luxury chauffeur vehicle service',
  },

  services: {
    availableIn: 'Available in ',
    regionMarbella: 'Marbella',
    regionMilano: 'Milano',
    regionSuffix: '. ',
  },

  fleet: {
    vehicleAltFallback: 'VIPER Security vehicle',
  },

  footer: {
    logoAlt: LOGO_ALT,
    socialX: 'Follow us on X',
    socialTikTok: 'Follow us on TikTok',
    socialInstagram: 'Follow us on Instagram',
    socialWhatsApp: 'Contact us on WhatsApp',
    descriptionPrefix: 'Premium chauffeur services across Marbella, Milano, and beyond. ',
    phoneSeparator: ' / ',
    copyright: 'Copyright © ',
  },

  notFound: {
    code: '404',
    heading: 'Page Not Found',
    body: "The page you're looking for doesn't exist.",
    returnAria: 'Return to home page',
    returnLink: 'Return Home',
  },

  skipLink: 'Skip to content',
  stepNumber: ['1', '2', '3'],
};

export default STRINGS;
