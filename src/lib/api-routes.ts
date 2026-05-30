/**
 * Type-safe API route definitions.
 *
 * All API paths are defined here as a single `as const` object.
 * The `${variable}` syntax marks dynamic path segments that will
 * be interpolated at runtime and type-checked at compile time.
 *
 * Usage:
 *   API_ROUTES.events       → "/events"
 *   API_ROUTES.eventDetail  → "/events/${eventId}"  (requires pathParams.eventId)
 */

export const API_ROUTES = {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  login: "/auth/login",
  logout: "/auth/logout",

  // ─── Versions ─────────────────────────────────────────────────────────────
  versions: "/flagship-event/versions",
  versionDetail: "/flagship-event/versions/${id}",
  currentVersion: "/flagship-event/versions/current",
  versionBySlug: "/flagship-event/versions/slug/${slug}",

  // ─── Events ───────────────────────────────────────────────────────────────
  events: "/events",
  eventDetail: "/events/${eventId}",
  eventCategories: "/events/category",
  eventCategoryDetail: "/events/category/${id}",
  // GET a single category is served from /events/${id}, not the /category path.
  eventCategoryById: "/events/category/${id}",

  // ─── Speakers ─────────────────────────────────────────────────────────────
  speakers: "/speakers",
  speakerDetail: "/speakers/${speakerId}",

  // ─── Teams ────────────────────────────────────────────────────────────────
  teams: "/team-members",
  teamDetail: "/team-members/${teamId}",

  // ─── Sponsors ─────────────────────────────────────────────────────────────
  sponsorCategories: "/sponsors/category",
  sponsorCategoryDetail: "/sponsors/category/${categoryId}",
  sponsors: "/sponsors",
  sponsorDetail: "/sponsors/${sponsorId}",

  // ─── Content ──────────────────────────────────────────────────────────────
  heroSections: "/hero-sections",
  heroSectionDetail: "/hero-sections/${id}",
  about: "/about-sections",
  aboutDetail: "/about-sections/${id}",
  gallery: "/gallery",
  galleryDetail: "/gallery/${id}",
  faqs: "/faqs",
  faqDetail: "/faqs/${id}",

  // ─── Settings ─────────────────────────────────────────────────────────────
  socialMedia: "/settings/social-media",
  contacts: "/settings/contacts",
  payments: "/settings/payments",
} as const;

/**
 * Type of the API_ROUTES object.
 * Used to constrain generic parameters in hooks.
 */
export type ApiRoutes = typeof API_ROUTES;

/**
 * All valid route keys — e.g. "events" | "eventDetail" | "speakers" | ...
 */
export type ApiRouteKey = keyof ApiRoutes;
