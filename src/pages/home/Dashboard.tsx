import { useApiQuery } from "../../lib";
import { Text } from "../../shared/design-components";
import type { FlagshipEventVersion } from "../../types/version";
import { EventVersionStatus } from "../../types/version";
import type { EventItem } from "../content-management/events/types";
import type { Speaker } from "../../types/speaker";
import type { Sponsor } from "../../types/sponsor";
import { CheckCircle2, Calendar, Users, Handshake, Layers } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}

function StatCard({ label, value, sub, icon, accent = "text-accent" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 flex items-start gap-4">
      <div className={`mt-0.5 ${accent}`}>{icon}</div>
      <div className="flex flex-col gap-0.5">
        <Text size="xs" variant="muted" className="uppercase tracking-wide font-medium">
          {label}
        </Text>
        <span className="text-2xl font-bold">{value}</span>
        {sub && <Text size="xs" variant="muted">{sub}</Text>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: versionsData } = useApiQuery("versions")<{
    data: { items: FlagshipEventVersion[]; meta: { total: number } };
  }>({ queryParams: { limit: 100 } });

  const { data: eventsData } = useApiQuery("events")<{
    data: { items: EventItem[]; meta: { total: number } };
  }>({ queryParams: { limit: 1 } });

  const { data: speakersData } = useApiQuery("speakers")<{
    data: { items: Speaker[]; meta: { total: number } };
  }>({ queryParams: { limit: 1 } });

  const { data: sponsorsData } = useApiQuery("sponsors")<{
    data: { items: Sponsor[]; meta: { total: number } };
  }>({ queryParams: { limit: 1 } });

  const versions = versionsData?.data?.items ?? [];
  const currentVersion = versions.find((v) => v.is_current);
  const activeVersions = versions.filter(
    (v) => v.status === EventVersionStatus.ACTIVE,
  ).length;

  const totalVersions = versionsData?.data?.meta?.total ?? versions.length;
  const totalEvents = eventsData?.data?.meta?.total ?? 0;
  const totalSpeakers = speakersData?.data?.meta?.total ?? 0;
  const totalSponsors = sponsorsData?.data?.meta?.total ?? 0;

  return (
    <div className="space-y-8">
      {/* Current version banner */}
      {currentVersion && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 flex items-center gap-4">
          <CheckCircle2 size={24} className="text-accent shrink-0" />
          <div>
            <Text size="sm" variant="muted">
              Current live version
            </Text>
            <p className="font-semibold text-lg">
              {currentVersion.version_name}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                v{currentVersion.version_number}
              </span>
            </p>
            {currentVersion.start_date && currentVersion.end_date && (
              <Text size="xs" variant="muted">
                {new Date(currentVersion.start_date).toLocaleDateString()} →{" "}
                {new Date(currentVersion.end_date).toLocaleDateString()}
              </Text>
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Versions"
          value={totalVersions}
          sub={`${activeVersions} active`}
          icon={<Layers size={22} />}
        />
        <StatCard
          label="Events"
          value={totalEvents}
          icon={<Calendar size={22} />}
          accent="text-violet-500"
        />
        <StatCard
          label="Speakers"
          value={totalSpeakers}
          icon={<Users size={22} />}
          accent="text-sky-500"
        />
        <StatCard
          label="Sponsors"
          value={totalSponsors}
          icon={<Handshake size={22} />}
          accent="text-amber-500"
        />
      </div>

      {/* All versions table */}
      {versions.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <Text size="sm" weight="medium">
              All Versions
            </Text>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Slug</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Current</th>
                <th className="text-left px-5 py-3 font-medium">Dates</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
                >
                  <td className="px-5 py-3 font-medium">{v.version_name}</td>
                  <td className="px-5 py-3">
                    <code className="text-xs bg-foreground/5 px-1.5 py-0.5 rounded">
                      {v.slug}
                    </code>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        v.status === "active"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : v.status === "draft"
                            ? "bg-yellow-500/15 text-yellow-600"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {v.is_current ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {v.start_date
                      ? `${new Date(v.start_date).toLocaleDateString()} → ${new Date(v.end_date).toLocaleDateString()}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
