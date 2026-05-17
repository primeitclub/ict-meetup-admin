import { ictClient } from "../api-client";
import type { ContactItem, PaymentQrItem, SocialMediaItem } from "../../types/settings";

/** Composite id: `{settingsId}::{linkIndex}` */
export const SOCIAL_LINK_SEP = "::";

export type SettingsRecord = {
  id: string;
  versionId: string;
  socialMediaLinks?: { platform: string; link: string }[];
  teamName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  qrCodeUrl?: string | null;
};

type SettingsListResponse = {
  data: {
    items: SettingsRecord[];
    meta?: { total: number; page: number; limit: number; totalPages: number };
  };
};

type SettingsItemResponse = { data: SettingsRecord };

async function fetchAllSettings(versionId?: string): Promise<SettingsRecord[]> {
  const res = await ictClient.get<SettingsListResponse>("/settings", versionId ? { versionId } : undefined);
  return res.data?.items ?? [];
}

async function fetchSettingsById(id: string): Promise<SettingsRecord> {
  const res = await ictClient.get<SettingsItemResponse>(`/settings/${id}`);
  return res.data;
}

async function findSettingsByVersion(versionId: string): Promise<SettingsRecord | undefined> {
  const items = await fetchAllSettings(versionId);
  return items[0];
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function encodeSocialId(settingsId: string, index: number): string {
  return `${settingsId}${SOCIAL_LINK_SEP}${index}`;
}

function decodeSocialId(compositeId: string): { settingsId: string; index: number } {
  const sep = compositeId.lastIndexOf(SOCIAL_LINK_SEP);
  if (sep === -1) {
    throw new Error("Invalid social media id");
  }
  return {
    settingsId: compositeId.slice(0, sep),
    index: Number(compositeId.slice(sep + SOCIAL_LINK_SEP.length)),
  };
}

// ─── Social media ─────────────────────────────────────────────────────────────

export async function listSocialMedia(): Promise<SocialMediaItem[]> {
  const settingsList = await fetchAllSettings();
  return settingsList.flatMap((settings) =>
    (settings.socialMediaLinks ?? []).map((link, index) => ({
      id: encodeSocialId(settings.id, index),
      platform: link.platform,
      url: link.link,
      versionId: settings.versionId,
    })),
  );
}

export async function getSocialMedia(compositeId: string): Promise<SocialMediaItem> {
  const { settingsId, index } = decodeSocialId(compositeId);
  const settings = await fetchSettingsById(settingsId);
  const link = settings.socialMediaLinks?.[index];
  if (!link) {
    throw new Error("Social media profile not found");
  }
  return {
    id: compositeId,
    platform: link.platform,
    url: link.link,
    versionId: settings.versionId,
  };
}

export async function createSocialMedia(payload: {
  versionId: string;
  platform: string;
  url: string;
}): Promise<SocialMediaItem> {
  const link = { platform: payload.platform, link: normalizeUrl(payload.url) };
  const existing = await findSettingsByVersion(payload.versionId);

  if (existing) {
    const links = [...(existing.socialMediaLinks ?? []), link];
    await ictClient.put<SettingsItemResponse>(`/settings/${existing.id}`, {
      socialMediaLinks: links,
    });
    return {
      id: encodeSocialId(existing.id, links.length - 1),
      platform: link.platform,
      url: link.link,
      versionId: existing.versionId,
    };
  }

  const created = await ictClient.post<SettingsItemResponse>("/settings", {
    versionId: payload.versionId,
    socialMediaLinks: [link],
  });
  return {
    id: encodeSocialId(created.data.id, 0),
    platform: link.platform,
    url: link.link,
    versionId: created.data.versionId,
  };
}

export async function updateSocialMedia(
  compositeId: string,
  payload: { platform?: string; url?: string },
): Promise<SocialMediaItem> {
  const { settingsId, index } = decodeSocialId(compositeId);
  const settings = await fetchSettingsById(settingsId);
  const links = [...(settings.socialMediaLinks ?? [])];
  const current = links[index];
  if (!current) {
    throw new Error("Social media profile not found");
  }

  links[index] = {
    platform: payload.platform ?? current.platform,
    link: payload.url ? normalizeUrl(payload.url) : current.link,
  };

  await ictClient.put<SettingsItemResponse>(`/settings/${settingsId}`, {
    socialMediaLinks: links,
  });

  return getSocialMedia(compositeId);
}

export async function deleteSocialMedia(compositeId: string): Promise<void> {
  const { settingsId, index } = decodeSocialId(compositeId);
  const settings = await fetchSettingsById(settingsId);
  const links = (settings.socialMediaLinks ?? []).filter((_, i) => i !== index);
  await ictClient.put<SettingsItemResponse>(`/settings/${settingsId}`, {
    socialMediaLinks: links,
  });
}

// ─── Contacts (one per settings / version) ────────────────────────────────────

export async function listContacts(): Promise<ContactItem[]> {
  const settingsList = await fetchAllSettings();
  return settingsList
    .filter((s) => s.teamName && s.email && s.phoneNumber)
    .map((s) => ({
      id: s.id,
      name: s.teamName!,
      email: s.email!,
      phone: s.phoneNumber!,
      versionId: s.versionId,
    }));
}

export async function getContact(settingsId: string): Promise<ContactItem> {
  const settings = await fetchSettingsById(settingsId);
  if (!settings.teamName || !settings.email || !settings.phoneNumber) {
    throw new Error("Contact not found");
  }
  return {
    id: settings.id,
    name: settings.teamName,
    email: settings.email,
    phone: settings.phoneNumber,
    versionId: settings.versionId,
  };
}

export async function createContact(payload: {
  versionId: string;
  name: string;
  email: string;
  phone: string;
}): Promise<ContactItem> {
  const existing = await findSettingsByVersion(payload.versionId);

  if (existing) {
    await ictClient.put<SettingsItemResponse>(`/settings/${existing.id}`, {
      teamName: payload.name,
      email: payload.email,
      phoneNumber: payload.phone,
    });
    return getContact(existing.id);
  }

  const created = await ictClient.post<SettingsItemResponse>("/settings", {
    versionId: payload.versionId,
    teamName: payload.name,
    email: payload.email,
    phoneNumber: payload.phone,
  });

  return {
    id: created.data.id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    versionId: created.data.versionId,
  };
}

export async function updateContact(
  settingsId: string,
  payload: { name: string; email: string; phone: string },
): Promise<ContactItem> {
  await ictClient.put<SettingsItemResponse>(`/settings/${settingsId}`, {
    teamName: payload.name,
    email: payload.email,
    phoneNumber: payload.phone,
  });
  return getContact(settingsId);
}

export async function deleteContact(settingsId: string): Promise<void> {
  // Contacts are stored as a single Settings record per flagship version.
  // Deleting the contact means deleting that Settings record.
  await ictClient.delete(`/settings/${settingsId}`);
}


// ─── Payment QR (one per settings / version) ──────────────────────────────────

export async function listPayments(): Promise<PaymentQrItem[]> {
  const settingsList = await fetchAllSettings();
  return settingsList
    .filter((s) => s.qrCodeUrl)
    .map((s) => ({
      id: s.id,
      qr: s.qrCodeUrl!,
      versionId: s.versionId,
    }));
}

export async function getPayment(settingsId: string): Promise<PaymentQrItem> {
  const settings = await fetchSettingsById(settingsId);
  if (!settings.qrCodeUrl) {
    throw new Error("Payment QR not found");
  }
  return { id: settings.id, qr: settings.qrCodeUrl, versionId: settings.versionId };
}

export async function createPayment(versionId: string, qrFile: File): Promise<PaymentQrItem> {
  const formData = new FormData();
  formData.append("versionId", versionId);
  formData.append("qrCode", qrFile);

  const existing = await findSettingsByVersion(versionId);
  if (existing) {
    await ictClient.put<SettingsItemResponse>(`/settings/${existing.id}`, formData);
    return getPayment(existing.id);
  }

  const created = await ictClient.post<SettingsItemResponse>("/settings", formData);
  return getPayment(created.data.id);
}

export async function updatePayment(settingsId: string, qrFile: File): Promise<PaymentQrItem> {
  const settings = await fetchSettingsById(settingsId);
  const formData = new FormData();
  formData.append("versionId", settings.versionId);
  formData.append("qrCode", qrFile);
  await ictClient.put<SettingsItemResponse>(`/settings/${settingsId}`, formData);
  return getPayment(settingsId);
}

export async function deletePayment(settingsId: string): Promise<void> {
  await ictClient.delete(`/settings/${settingsId}/qrcode`);
}
