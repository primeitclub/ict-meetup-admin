import type { FlagshipEventVersion } from "./version";

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imagePath: string;
  date: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  registrationDeadline: string;
  displayOrder: number;
  versionId: string;
  flagshipEventVersion: FlagshipEventVersion;
  speakerName: string;
  feeType: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  subtitle?: string;
  description?: string;
  imagePath?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  registrationDeadline: string;
  displayOrder: number;
  versionId: string;
  speakerName: string;
  feeType: string;
  location: string;
  status?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;
