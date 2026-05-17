import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContact,
  createPayment,
  createSocialMedia,
  deleteContact,
  deletePayment,
  deleteSocialMedia,
  getContact,
  getPayment,
  getSocialMedia,
  listContacts,
  listPayments,
  listSocialMedia,
  updateContact,
  updatePayment,
  updateSocialMedia,
} from "../settings/settings-api";

export const settingsQueryKeys = {
  socialMedia: ["settings", "social-media"] as const,
  contacts: ["settings", "contacts"] as const,
  payments: ["settings", "payments"] as const,
};

export function useSocialMediaList() {
  return useQuery({
    queryKey: settingsQueryKeys.socialMedia,
    queryFn: async () => ({ items: await listSocialMedia() }),
  });
}

export function useSocialMediaDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...settingsQueryKeys.socialMedia, id],
    queryFn: () => getSocialMedia(id!),
    enabled: !!id,
  });
}

export function useSocialMediaMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: settingsQueryKeys.socialMedia });

  return {
    create: useMutation({
      mutationFn: createSocialMedia,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, ...payload }: { id: string; platform?: string; url?: string }) =>
        updateSocialMedia(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: deleteSocialMedia,
      onSuccess: invalidate,
    }),
  };
}

export function useContactsList() {
  return useQuery({
    queryKey: settingsQueryKeys.contacts,
    queryFn: async () => ({ items: await listContacts() }),
  });
}

export function useContactDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...settingsQueryKeys.contacts, id],
    queryFn: () => getContact(id!),
    enabled: !!id,
  });
}

export function useContactMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: settingsQueryKeys.contacts });

  return {
    create: useMutation({
      mutationFn: createContact,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({
        id,
        ...payload
      }: {
        id: string;
        name: string;
        email: string;
        phone: string;
      }) => updateContact(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: deleteContact,
      onSuccess: invalidate,
    }),
  };
}

export function usePaymentsList() {
  return useQuery({
    queryKey: settingsQueryKeys.payments,
    queryFn: async () => ({ items: await listPayments() }),
  });
}

export function usePaymentDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...settingsQueryKeys.payments, id],
    queryFn: () => getPayment(id!),
    enabled: !!id,
  });
}

export function usePaymentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: settingsQueryKeys.payments });

  return {
    create: useMutation({
      mutationFn: ({ versionId, file }: { versionId: string; file: File }) =>
        createPayment(versionId, file),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, file }: { id: string; file: File }) => updatePayment(id, file),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: deletePayment,
      onSuccess: invalidate,
    }),
  };
}
