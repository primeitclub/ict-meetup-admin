import type { FlagshipEventVersion } from "./version";

/** Allowed social platforms — case-sensitive, enforced by the backend. */
export const SOCIAL_PLATFORMS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Twitter",
  "TikTok",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface SocialMediaLink {
  platform: SocialPlatform;
  link: string;
}

export interface ContactPerson {
  name: string;
  phone: string;
}

export interface ContactDepartment {
  department: string;
  contacts: ContactPerson[];
}

/** Per-version contact settings (Contact Management tab). At most one per version. */
export interface Settings {
  id: string;
  versionId: string;
  email: string | null;
  phoneNumber: string | null;
  contactDepartments: ContactDepartment[] | null;
  flagshipEventVersion?: FlagshipEventVersion;
  createdAt: string;
  updatedAt: string;
}

/** Global, non-versioned club settings (Club Details, Social Media, Payment Setup tabs). Always at most one row. */
export interface SiteSettings {
  id: string;
  clubEmail: string | null;
  clubPhoneNumber: string | null;
  socialMediaLinks: SocialMediaLink[] | null;
  /** Cloudinary URL — use this to display the QR code. */
  qrCodeUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
