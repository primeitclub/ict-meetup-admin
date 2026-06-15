export const RegistrationStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type RegistrationStatus =
  (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export interface EventRegistration {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}
