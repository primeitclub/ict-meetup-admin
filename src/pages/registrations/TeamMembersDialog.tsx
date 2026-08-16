import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import type { EventRegistration } from "../../types/registration";

interface TeamMembersDialogProps {
  /** The registration whose team is being inspected; null closes the dialog. */
  registration: EventRegistration | null;
  onClose: () => void;
}

export default function TeamMembersDialog({
  registration,
  onClose,
}: Readonly<TeamMembersDialogProps>) {
  const participants = registration?.participants ?? [];

  return (
    <Dialog.Root
      open={!!registration}
      onOpenChange={(open) => !open && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-lg max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {registration?.teamName || "Team Details"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Registered by {registration?.username} · {participants.length}{" "}
                {participants.length === 1 ? "member" : "members"}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-5 space-y-3">
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No members were submitted with this registration.
              </p>
            ) : (
              participants.map((participant, index) => (
                <div
                  key={`${participant.email}-${index}`}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {participant.fullName || "—"}
                    </span>
                  </div>
                  <dl className="mt-2 space-y-1 pl-8 text-xs">
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-muted-foreground">
                        Email
                      </dt>
                      <dd className="break-all text-foreground">
                        {participant.email || "—"}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="w-16 shrink-0 text-muted-foreground">
                        Phone
                      </dt>
                      <dd className="text-foreground">
                        {participant.phoneNumber || "—"}
                      </dd>
                    </div>
                    {participant.inGameName && (
                      <div className="flex gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground font-medium text-accent">
                          IGN
                        </dt>
                        <dd className="font-semibold text-foreground">
                          {participant.inGameName}
                        </dd>
                      </div>
                    )}
                    {participant.inGameId && (
                      <div className="flex gap-2">
                        <dt className="w-16 shrink-0 text-muted-foreground">
                          Game ID
                        </dt>
                        <dd className="text-foreground font-mono">
                          {participant.inGameId}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
