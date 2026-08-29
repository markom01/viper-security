import { resolveTemplates } from "../config/templates";
import type { PageContent, FleetEntry, MembershipTier } from "../types";
import type { HomeData, ServiceDetailData, SiteGlobalsData } from "../content/types";

export interface AssembleHomeArgs {
  home: HomeData;
  siteGlobals: SiteGlobalsData;
  siteName: string;
  fleetEntries?: FleetEntry[];
  homeCarousel?: string[];
}

export interface AssembleHomeResult {
  hero: HomeData["hero"];
  services: { offerings: HomeData["services"]["offerings"] };
  // `home.stats ?? siteGlobals.stats` — home's image is optional, site's required,
  // so the return type is the looser home shape both StatsSection consumers read.
  stats?: HomeData["stats"];
  cta?: SiteGlobalsData["cta"];
  bottomcta?: SiteGlobalsData["bottomcta"];
  about?: SiteGlobalsData["about"];
  pageContent: PageContent;
  fleetFeaturesText?: string;
  fleetVehicles?: FleetEntry[];
}

function fleetFeaturesTextFrom(vehicles: { data?: { features?: string[] } }[]): string {
  const all = [...new Set(vehicles.flatMap((v) => v.data?.features || []))];
  if (!all.length) return "";
  return all.length === 1 ? all[0] + "." : all.slice(0, -1).join(", ") + ", and " + all.slice(-1)[0] + ".";
}

export function assembleHome(args: AssembleHomeArgs): AssembleHomeResult {
  const { home, siteGlobals, siteName, fleetEntries, homeCarousel } = args;
  const bd = siteGlobals.booking_data;
  const vehicleName = siteGlobals.vehicle_name;

  const hero: HomeData["hero"] = { ...home.hero };
  if (hero.subtitle) hero.subtitle = resolveTemplates(hero.subtitle, bd, siteName, vehicleName);

  const services = {
    offerings: (home.services?.offerings || []).map((o) => ({
      ...o,
      description: resolveTemplates(o.description, bd, siteName, vehicleName),
    })),
  };

  let seo = siteGlobals.seo ? { ...siteGlobals.seo } : undefined;
  if (home.seo) seo = { ...(seo || {}), ...home.seo };
  if (seo?.title) seo.title = resolveTemplates(seo.title, bd, siteName, vehicleName);
  if (seo?.description) seo.description = resolveTemplates(seo.description, bd, siteName, vehicleName);

  let about = siteGlobals.about ? { ...siteGlobals.about } : undefined;
  if (home.about) about = { ...(about || {}), ...home.about };
  if (about?.text) about.text = resolveTemplates(about.text, bd, siteName, vehicleName);

  let cta = siteGlobals.cta ? { ...siteGlobals.cta } : undefined;
  if (home.cta) cta = { ...(cta || {}), ...home.cta };
  if (cta?.text) cta.text = resolveTemplates(cta.text, bd, siteName, vehicleName);

  let bottomcta = siteGlobals.bottomcta ? { ...siteGlobals.bottomcta } : undefined;
  if (home.bottomcta) bottomcta = { ...(bottomcta || {}), ...home.bottomcta };
  if (bottomcta?.values) bottomcta.values = bottomcta.values.map((v) => ({ ...v, text: resolveTemplates(v.text, bd, siteName, vehicleName) }));

  const jsonld = siteGlobals.jsonld ? { ...siteGlobals.jsonld } : undefined;
  if (jsonld?.org_name) jsonld.org_name = resolveTemplates(jsonld.org_name, bd, siteName, vehicleName);
  if (jsonld?.org_description) jsonld.org_description = resolveTemplates(jsonld.org_description, bd, siteName, vehicleName);

  const pageContent: PageContent = {
    jsonld,
    booking_data: siteGlobals.booking_data,
    vehicle_name: siteGlobals.vehicle_name,
    labels: { ...(siteGlobals.labels || {}), ...(home.labels || {}) },
    branding: home.branding ? { ...(siteGlobals.branding || {}), ...home.branding } : siteGlobals.branding,
    seo, about, cta, bottomcta,
    stats: home.stats ?? siteGlobals.stats,
    fleet: siteGlobals.fleetHeading ? { heading: siteGlobals.fleetHeading } : undefined,
    // HowItWorks: home.howitworks (heading + steps) overrides siteGlobals; each
    // field falls back independently so a home with only a heading/steps still
    // inherits the other from siteGlobals. VIPER home omits howitworks entirely
    // → falls back to siteGlobals (as before).
    howitworks: {
      heading: home.howitworks?.heading ?? siteGlobals.howItWorksHeading,
      steps: home.howitworks?.steps ?? siteGlobals.howItWorksSteps,
    },
    map_embed_url: siteGlobals.map_embed_url,
  };

  const fleetFeaturesText = fleetEntries ? fleetFeaturesTextFrom(fleetEntries) : undefined;

  return { hero, services, stats: home.stats ?? siteGlobals.stats, cta, bottomcta, about, pageContent, fleetFeaturesText, fleetVehicles: fleetEntries };
}

export interface AssembleServiceArgs {
  offering: ServiceDetailData;
  siteGlobals: SiteGlobalsData;
  siteName: string;
  fleetVehicles?: FleetEntry[];
  hasFleet?: boolean;
  howItWorksSteps?: { title: string; description: string; image?: string }[];
  hourly?: { rates?: { name: string; price: string }[] };
  membershipTiers?: MembershipTier[];
  aboutCarouselImages?: string[];
  fleetSection?: { heading?: string; subheadline?: string };
}

export interface AssembleServiceResult {
  offering: ServiceDetailData;
  pageContent: PageContent;
  hero: { subtitle?: string; cta_text?: string; tagline?: string; image?: string };
  fleetVehicles?: FleetEntry[];
  fleetFeaturesText: string;
  hasFleet: boolean;
  howItWorksSteps?: { title: string; description: string; image?: string }[];
  hourly?: { rates?: { name: string; price: string }[] };
  membershipTiers?: MembershipTier[];
  aboutCarouselImages?: string[];
}

export function assembleService(args: AssembleServiceArgs): AssembleServiceResult {
  const { offering, siteGlobals, siteName, fleetVehicles, hasFleet, howItWorksSteps, hourly, membershipTiers, aboutCarouselImages, fleetSection } = args;
  const bd = siteGlobals.booking_data;
  const vehicleName = siteGlobals.vehicle_name;

  // Site-global page copy (stats/cta/bottomcta/about/seo) carries {placeholders}
  // and is the BASE for the shared ServicePage (which spreads per-offering overrides).
  const seo = siteGlobals.seo ? { ...siteGlobals.seo } : undefined;
  if (seo?.title) seo.title = resolveTemplates(seo.title, bd, siteName, vehicleName);
  if (seo?.description) seo.description = resolveTemplates(seo.description, bd, siteName, vehicleName);

  const about = siteGlobals.about ? { ...siteGlobals.about } : undefined;
  if (about?.text) about.text = resolveTemplates(about.text, bd, siteName, vehicleName);

  const cta = siteGlobals.cta ? { ...siteGlobals.cta } : undefined;
  if (cta?.text) cta.text = resolveTemplates(cta.text, bd, siteName, vehicleName);

  const bottomcta = siteGlobals.bottomcta ? { ...siteGlobals.bottomcta } : undefined;
  if (bottomcta?.values) bottomcta.values = bottomcta.values.map((v) => ({ ...v, text: resolveTemplates(v.text, bd, siteName, vehicleName) }));

  const jsonld = siteGlobals.jsonld ? { ...siteGlobals.jsonld } : undefined;
  if (jsonld?.org_name) jsonld.org_name = resolveTemplates(jsonld.org_name, bd, siteName, vehicleName);
  if (jsonld?.org_description) jsonld.org_description = resolveTemplates(jsonld.org_description, bd, siteName, vehicleName);

  const pageContent: PageContent = {
    jsonld,
    booking_data: siteGlobals.booking_data,
    vehicle_name: siteGlobals.vehicle_name,
    labels: siteGlobals.labels,
    branding: siteGlobals.branding,
    seo,
    about,
    cta,
    bottomcta,
    stats: siteGlobals.stats,
    // Site-global chrome carried over from assembleHome so shared Fleet/HowItWorks/
    // Footer consumers (Fleet.astro fleet.heading, HowItWorks.astro howitworks.heading,
    // Footer.astro map_embed_url) keep working on service pages — the old page-content
    // collection supplied all three and service pages render them today.
    fleet: siteGlobals.fleetHeading ? { heading: siteGlobals.fleetHeading } : undefined,
    howitworks: siteGlobals.howItWorksHeading ? { heading: siteGlobals.howItWorksHeading } : undefined,
    map_embed_url: siteGlobals.map_embed_url,
  };

  // Per-offering SEO/JSON-LD merges over site globals (clone, never mutate).
  if (offering.seo) pageContent.seo = { ...(pageContent.seo || {}), ...offering.seo } as PageContent["seo"];

  // NOTE: the `fleetSection` label override (heading/subheadline per-service for
  // DBC) is intentionally omitted here. Confirmed from existing consumers:
  // Fleet.astro reads the heading from `pageContent.fleet.heading` (NOT labels),
  // and the subheadline from `labels["fleet.subheadline"]` via resolveLabels —
  // so the brief's proposed block (which wrote the heading into `labels` as a
  // JSON blob) would not drive the UI. Task 8 will wire `fleetSection` correctly
  // with the real consumer context. `fleetSection` remains in the args type.

  const heroFields: NonNullable<typeof offering.hero> & Record<string, unknown> = { ...(offering.hero || {}) } as never;
  if (heroFields.subtitle) heroFields.subtitle = resolveTemplates(heroFields.subtitle, bd, siteName, vehicleName);

  const offeringResolved: ServiceDetailData = offering.description
    ? { ...offering, description: resolveTemplates(offering.description, bd, siteName, vehicleName) }
    : offering;

  const fleetFeaturesText = fleetVehicles ? fleetFeaturesTextFrom(fleetVehicles) : "";

  return {
    offering: offeringResolved,
    pageContent,
    hero: {
      subtitle: heroFields.subtitle as string | undefined,
      cta_text: heroFields.cta_text as string | undefined,
      tagline: offering.title || (heroFields.tagline as string | undefined),
      image: heroFields.image as string | undefined,
    },
    fleetVehicles,
    fleetFeaturesText,
    hasFleet: hasFleet ?? !!fleetVehicles?.length,
    howItWorksSteps,
    hourly,
    membershipTiers,
    aboutCarouselImages,
  };
}
