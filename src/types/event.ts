import type { FlagshipEventVersion } from "./version";

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  registrationDeadline: string;
  displayOrder: number;
  flagshipEventVersionId: string;
  flagshipEventVersion: FlagshipEventVersion;
  speakerName: string;
  feeType: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  image?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  registrationDeadline: string;
  displayOrder: number;
  flagshipEventVersionId: string;
  speakerName: string;
  feeType: string;
  location: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;
