import { money } from "@/lib/admin";

type Snapshot = Record<string, unknown>;
function description(value: unknown): string {
  return value == null ? "—" : String(value);
}
function terms(s: Snapshot | null | undefined): Record<string, string> {
  if (!s) return {};
  const currency = typeof s.currency === "string" ? s.currency : "ETB";
  const price = s.priceMinor ?? s.price_minor;
  const rules = s.rules as
    | { deductions?: { label: string; bps: number }[]; prizeBps?: number[] }
    | undefined;
  return {
    Title: description(s.title),
    Currency: description(s.currency),
    "Ticket price": typeof price === "number" ? money(price, currency) : "—",
    Capacity: description(s.capacity),
    Version: description(s.version),
    Status: description(
      s.status ??
        (s.active === true
          ? "Available"
          : s.active === false
            ? "Inactive"
            : undefined),
    ),
    "Closing date":
      typeof s.deadline === "string"
        ? new Date(s.deadline).toLocaleString()
        : "—",
    "Sales first opened": description(s.startedAt ?? s.sales_started_at),
    "Sales permanently closed": description(s.closedAt ?? s.sales_closed_at),
    "Broadcast URL": description(s.liveVideoUrl ?? s.live_video_url),
    Deductions: rules
      ? rules.deductions
          ?.map((d) => `${d.label}: ${d.bps / 100}%`)
          .join("; ") || "None"
      : "Not recorded",
    "Ranked prize shares":
      rules?.prizeBps?.map((p, i) => `#${i + 1}: ${p / 100}%`).join("; ") ||
      "Not recorded",
  };
}
export function AdminAuditChanges({
  details,
}: {
  details?: { before?: Snapshot | null; after?: Snapshot };
}) {
  if (!details?.after) return null;
  const before = terms(details.before),
    after = terms(details.after);
  return (
    <details className="admin-audit-changes">
      <summary>View recorded changes</summary>
      <div className="admin-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Before</th>
              <th>After</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(after)
              .filter(([key, value]) => before[key] !== value)
              .map(([key, value]) => (
                <tr key={key}>
                  <th scope="row">{key}</th>
                  <td>{before[key] || "—"}</td>
                  <td>{value}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
