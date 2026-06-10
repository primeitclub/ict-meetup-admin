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

/** Per-version contact / branding settings. At most one per version. */
export interface Settings {
  id: string;
  versionId: string;
  email: string | null;
  phoneNumber: string | null;
  teamName: string | null;
  socialMediaLinks: SocialMediaLink[] | null;
  /** Cloudinary URL — use this to display the QR code. */
  qrCodeUrl: string | null;
  /** Internal — ignore on the frontend. */
  qrCodePath?: string | null;
  qrCodeLocalPath?: string | null;
  flagshipEventVersion?: FlagshipEventVersion;
  createdAt: string;
  updatedAt: string;
}
