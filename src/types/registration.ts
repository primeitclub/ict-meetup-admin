export const RegistrationStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type RegistrationStatus =
  (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export interface Participant {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  inGameName?: string | null;
  inGameId?: string | null;
}

export interface EventRegistration {
  id: string;
  trackingId: string;
  username: string;
  email: string;
  contactNumber: string;
  isStudent: boolean;
  educationLevel?: string | null;
  collegeName?: string | null;
  faculty?: string | null;
  year?: number | null;
  attachedPaymentScreenshot: string;
  eventId: string;
  versionId: string;
  status: RegistrationStatus;
  /** Only populated for GROUP events. */
  teamName?: string | null;
  /** Only populated for GROUP events. */
  participants?: Participant[] | null;
  createdAt: string;
  updatedAt: string;
  /** Populated relation — the event this registration belongs to. */
  event?: { id: string; versionId: string; title: string } | null;
  /** Populated relation — the version this registration belongs to. */
  version?: { id: string; version_name: string; status: string } | null;
}
