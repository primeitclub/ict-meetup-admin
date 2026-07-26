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
  teamCategories: "/team-members/category",
  teamCategoryDetail: "/team-members/category/${id}",
  designations: "/team-members/designation",
  designationDetail: "/team-members/designation/${id}",

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
  // One gallery per version. Reads/writes are keyed by version id.
  gallery: "/gallery",
  galleryByVersion: "/gallery/${versionId}",
  galleryImage: "/gallery/${versionId}/images/${imageId}",
  faqs: "/faqs",
  faqsGrouped: "/faqs/grouped",
  faqDetail: "/faqs/${id}",

  // ─── Event Registrations ──────────────────────────────────────────────────
  eventRegistrations: "/event-registrations",
  eventRegistrationStats: "/event-registrations/stats",
  eventRegistrationDetail: "/event-registrations/${registrationId}",
  eventRegistrationStatus: "/event-registrations/${registrationId}/status",

  // ─── Settings ─────────────────────────────────────────────────────────────
  // Per-version Contact Management record (email, phone, department contacts).
  settings: "/settings",
  settingDetail: "/settings/${id}",

  // ─── Site Settings ────────────────────────────────────────────────────────
  // Global, non-versioned record (club contact, social links, payment QR code).
  siteSettings: "/site-settings",
  siteSettingsQrCode: "/site-settings/qrcode",
  siteSettingsProposal: "/site-settings/proposal",
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
