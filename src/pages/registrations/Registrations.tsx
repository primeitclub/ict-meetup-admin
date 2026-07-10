import { useMemo, useState, useCallback } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../components/table/Table";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import { Text } from "../../shared/design-components";
import {
  RegistrationStatus,
  type EventRegistration,
} from "../../types/registration";
import type { EventItem } from "../content-management/events/types";
import { useVersionFilter } from "../../lib/hooks/use-version-filter";
import { getImageUrl } from "../../utils/imageUtils";

const statusStyles: Record<RegistrationStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-600",
  approved: "bg-emerald-500/15 text-emerald-600",
  rejected: "bg-red-500/15 text-red-500",
};

export default function Registrations() {
  const { selectedVersionId, setSelectedVersionId, versionOptions } = useVersionFilter();
  const [selectedEventId, setSelectedEventId] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmApprove, setConfirmApprove] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: eventsData, isLoading: eventsLoading } = useApiQuery(
    "events",
  )<{ data: { items: EventItem[] } }>({
    queryParams: { versionId: selectedVersionId, limit: 200 },
    enabled: !!selectedVersionId,
  });

  const events = eventsData?.data?.items ?? [];

  const { data, isLoading, refetch } = useApiQuery(
    "eventRegistrations",
  )<{ data: { items: EventRegistration[] } }>({
    queryParams: { eventId: selectedEventId },
    enabled: !!selectedEventId,
  });

  const { execute: updateStatus, isLoading: isUpdatingStatus } = useApiMutation(
    "eventRegistrationStatus",
  )<void, { status: RegistrationStatus }>({
    method: "PUT",
    onSuccess: () => {
      refetch();
      setConfirmApprove(null);
      setConfirmReject(null);
    },
    onError: (err) => toast.error(err.message || "Failed to update status"),
  });

  const { execute: deleteRegistration, isLoading: isDeleting } = useApiMutation(
    "eventRegistrationDetail",
  )<void, never>({
    method: "DELETE",
    onSuccess: () => {
      refetch();
      setConfirmDelete(null);
    },
    onError: (err) => toast.error(err.message || "Failed to delete registration"),
  });

  const handleApproveConfirm = useCallback(async () => {
    if (!confirmApprove) return;
    await updateStatus({ status: RegistrationStatus.APPROVED }, { pathParams: { registrationId: confirmApprove } });
  }, [confirmApprove, updateStatus]);

  const handleRejectConfirm = useCallback(async () => {
    if (!confirmReject) return;
    await updateStatus(
      { status: RegistrationStatus.REJECTED },
      { pathParams: { registrationId: confirmReject } },
    );
  }, [confirmReject, updateStatus]);

  const columns: ColumnDef<EventRegistration>[] = useMemo(
    () => [
      {
        id: "sn",
        header: "S.N",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "username",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "contactNumber",
        header: "Phone",
      },
      {
        accessorKey: "isStudent",
        header: "Student",
        cell: ({ row }) =>
          row.original.isStudent ? (
            <CheckCircle2 size={16} className="text-emerald-500" />
          ) : (
            <XCircle size={16} className="text-muted-foreground" />
          ),
      },
      {
        accessorKey: "educationLevel",
        header: "Education",
        cell: ({ row }) => row.original.educationLevel ?? "—",
      },
      {
        id: "payment",
        header: "Payment",
        cell: ({ row }) => {
          const selectedEvent = events.find((e) => e.id === selectedEventId);
          const val = row.original.attachedPaymentScreenshot;
          if (selectedEvent?.feeType === "free" || val === "free") {
            return <span className="text-xs font-medium text-emerald-600">Free</span>;
          }
          if (!val) return <span className="text-muted-foreground text-xs">—</span>;
          return (
            <button
              onClick={() => setPreviewUrl(val)}
              className="px-2 py-1 rounded text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 transition-colors"
            >
              View
            </button>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                statusStyles[status] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Registered",
        cell: ({ row }) => {
          const raw = row.original.createdAt;
          if (!raw) return "—";
          const d = new Date(raw);
          return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const { id, status } = row.original;
          return (
            <div className="flex items-center gap-1">
              {status !== RegistrationStatus.APPROVED && (
                <button
                  onClick={() => setConfirmApprove(id)}
                  className="px-2 py-1 rounded text-xs font-medium text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                >
                  Approve
                </button>
              )}
              {status !== RegistrationStatus.REJECTED && (
                <button
                  onClick={() => setConfirmReject(id)}
                  className="px-2 py-1 rounded text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  Reject
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(id)}
                className="px-2 py-1 rounded text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    [setConfirmApprove, setConfirmReject, setPreviewUrl, events, selectedEventId],
  );

  const items = data?.data?.items ?? [];

  const statusCounts = useMemo(() => {
    const counts = { pending: 0, approved: 0, rejected: 0 };
    items.forEach((r) => {
      if (r.status in counts) counts[r.status as keyof typeof counts]++;
    });
    return counts;
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border border-border bg-surface">
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-xs font-medium text-muted-foreground">
            Version
          </label>
          <select
            value={selectedVersionId}
            onChange={(e) => {
              setSelectedVersionId(e.target.value);
              setSelectedEventId("");
            }}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">Select a version…</option>
            {versionOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[240px]">
          <label className="text-xs font-medium text-muted-foreground">
            Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={!selectedVersionId || eventsLoading}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
          >
            <option value="">
              {eventsLoading ? "Loading…" : "Select an event…"}
            </option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      {selectedEventId && items.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { label: "Pending", key: "pending", cls: "text-yellow-600" },
              { label: "Approved", key: "approved", cls: "text-emerald-600" },
              { label: "Rejected", key: "rejected", cls: "text-red-500" },
            ] as const
          ).map(({ label, key, cls }) => (
            <div
              key={key}
              className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-1"
            >
              <Text size="xs" variant="muted">
                {label}
              </Text>
              <span className={`text-2xl font-bold ${cls}`}>
                {statusCounts[key]}
              </span>
            </div>
          ))}
        </div>
      )}

      {!selectedEventId ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Text size="sm">Select a version and event to view registrations.</Text>
        </div>
      ) : (
        <Table
          columns={columns}
          data={items}
          isLoading={isLoading}
          onRefetch={refetch}
          searchPlaceholder="Search registrations…"
        />
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 z-10 rounded-full bg-surface border border-border p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
            <img
              src={getImageUrl(previewUrl)}
              alt="Payment screenshot"
              className="w-full rounded-lg shadow-2xl object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmApprove}
        onOpenChange={(open) => !open && setConfirmApprove(null)}
        title="Approve registration?"
        description="This will approve the registration and send a confirmation email to the registrant."
        confirmLabel="Approve"
        isLoading={isUpdatingStatus}
        onConfirm={handleApproveConfirm}
      />

      <ConfirmDialog
        open={!!confirmReject}
        onOpenChange={(open) => !open && setConfirmReject(null)}
        title="Reject registration?"
        description="This will reject the registration and notify the registrant by email."
        confirmLabel="Reject"
        variant="danger"
        isLoading={isUpdatingStatus}
        onConfirm={handleRejectConfirm}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Delete registration?"
        description="This will permanently remove this registration. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={() =>
          confirmDelete &&
          deleteRegistration(undefined, {
            pathParams: { registrationId: confirmDelete },
          })
        }
      />
    </div>
  );
}
