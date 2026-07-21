/**
 * Technical UI constants for VIPER Security.
 * Business-editable content is managed via CMS (pageContent).
 * This file contains only values that have no CMS path.
 */

const SITE_NAME = 'VIPER Security';
const SITE_URL = 'https://vipersecurity.com';

const STRINGS = {
  nav: {
    homeAria: 'home',
    menuAria: 'menu',
    cancelAlt: 'Close menu',
  },

  seo: {
    ogLocale: 'en_US',
    ogType: 'website',
    twitterCard: 'summary_large_image',
  },

  jsonld: {
    webSiteName: SITE_NAME,
    webSiteUrl: SITE_URL,
  },

  admin: {
    title: 'Viper Security — Admin',
  },

  hero: {
    formName: 'Booking',
    bookingFormAria: 'Booking Form',
  },

  icons: {
    arrowAlt: '',
  },

  services: {
    availableIn: 'Available in ',
    regionSuffix: '. ',
  },

  fleet: {
    vehicleAltFallback: 'VIPER Security vehicle',
  },

  stepNumber: ['1', '2', '3'],
};

export default STRINGS;
