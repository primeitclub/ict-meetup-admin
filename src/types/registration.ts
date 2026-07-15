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
}

export interface EventRegistration {
  id: string;
  trackingId: string;
  username: string;
  email: string;
  contactNumber: string;
  isStudent: boolean;
  educationLevel?: string | null;
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
}
