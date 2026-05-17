export const SOCIAL_MEDIA_PLATFORMS = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Twitter",
  "TikTok",
] as const;

export type SocialMediaPlatform = (typeof SOCIAL_MEDIA_PLATFORMS)[number];

export type SocialMediaItem = {
  id: string;
  platform: string;
  url: string;
  versionId?: string;
};

export type ContactItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  versionId?: string;
};

export type PaymentQrItem = {
  id: string;
  qr: string;
  versionId?: string;
};
