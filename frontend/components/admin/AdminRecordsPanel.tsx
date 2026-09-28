"use client";
import { useEffect, useState } from "react";
import { accountAPI, accountFetch } from "@/lib/account-api";
import { type Order } from "@/lib/backend";
import { playersWorkbook, type PlayerReceipt } from "@/lib/exports/players";
import JSZip from "jszip";
import { AdminAuditChanges } from "./AdminAuditChanges";
export type RecordSection =
  "orders" | "legacy" | "results" | "advertisers" | "messages" | "audit";
function download(bytes: Uint8Array, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function AdminRecordsPanel({
  section,
  canWrite,
}: {
  section: RecordSection;
  canWrite: boolean;
}) {
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentOrder, setPaymentOrder] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [aff, setAff] = useState({
    code: "",
    name: "",
    active: true,
    commissionPerTicket: 0,
    commissionCurrency: "ETB",
    platform: "other",
    handleOrUrl: "",
    phone: "",
    email: "",
    payoutMethod: "telebirr",
    payoutAccount: "",
    payoutRecipientName: "",
    adminNotes: "",
  });
  const [resultDraw, setResultDraw] = useState("");
  const [video, setVideo] = useState("");
  const [winners, setWinners] = useState(
    Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      luckyNumber: "",
      prizeAmount: "",
      winnerName: "",
      payoutStatus: "pending",
    })),
  );
  useEffect(() => {
    let active = true;
    setBusy(true);
    setRows([]);
    setError("");
    accountAPI<any[]>(`/admin/${section}?offset=${offset}`)
      .then((v) => {
        if (active) setRows(v);
      })
      .catch((e) => {
        if (active) {
          setRows([]);
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [section, offset, refresh]);
  async function save(kind: string, id: string, value: any) {
    if (!canWrite) return;
    setBusy(true);
    setError("");
    try {
      await accountAPI(`/admin/${kind}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      setRefresh((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function exportPlayers(withMedia: boolean) {
    setBusy(true);
    setError("");
    try {
      const entries: PlayerReceipt[] = [];
      const media = new Map<string, { key: string; mime: string }>();
      let n = 0;
      for (;;) {
        const page = await accountAPI<any[]>(`/admin/${section}?offset=${n}`);
        if (!page.length) break;
        for (const row of page) {
          if (section === "orders") {
            const o = row as Order;
            entries.push({
              _id: o.id,
              playerName: o.name,
              playerPhone: o.phone,
              drawId: o.drawId,
              luckyNumber: String(o.number),
              amount: o.amountMinor / 100,
              currency: o.currency,
              paymentMethod: o.provider,
              paymentReference: o.paymentReference,
              promoCode: o.promoCode,
              status: o.refunded ? "refunded" : o.status,
              submittedAt: o.createdAt,
            });
          } else if (row.type === "playerEntry") {
            entries.push(row.data);
            if (row.data.mediaKey)
              media.set(row.id, {
                key: row.data.mediaKey,
                mime: row.data.mediaMime,
              });
          }
        }
        if (page.length < 100) break;
        n += 100;
        if (n > 100000)
          throw new Error(
            "Export is too large. Ask an operator for a database export.",
          );
      }
      if (!withMedia) {
        download(
          await playersWorkbook(entries),
          "rimna-players.xlsx",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        return;
      }
      const zip = new JSZip();
      const names = new Map<string, string>();
      for (const [id, { key, mime }] of media) {
        const response = await accountFetch(`/admin/media/${key}`);
        if (!response.ok)
          throw new Error(
            "An original receipt could not be downloaded. No complete archive was created.",
          );
        const bytes = new Uint8Array(await response.arrayBuffer());
        const name = `screenshots/${key}${mediaExtension(mime)}`;
        zip.file(name, bytes);
        names.set(id, name);
      }
      zip.file("players.xlsx", await playersWorkbook(entries, names));
      download(
        await zip.generateAsync({ type: "uint8array" }),
        "rimna-player-receipts.zip",
        "application/zip",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-records">
      {!canWrite && (
        <p className="admin-notice">
          Read-only staff access. An administrator can make changes.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Loading records…</p>}
      {!busy && !error && rows.length === 0 && (
        <div className="admin-empty">No records on this page yet.</div>
      )}
      {section === "orders" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save("payments", paymentOrder, { reference: paymentRef });
          }}
        >
          <fieldset disabled={!canWrite || busy}>
            <h3>Recheck a payment</h3>
            <p>
              Use the Chapa reference from the merchant dashboard if a checkout
              response or webhook was missed. Amount and order ownership are
              verified automatically.
            </p>
            <label>
              Order reference
              <input
                required
                value={paymentOrder}
                onChange={(e) => setPaymentOrder(e.target.value)}
              />
            </label>
            <label>
              Chapa reference
              <input
                required
                maxLength={128}
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />
            </label>
            <button disabled={busy}>Verify with Chapa</button>
          </fieldset>
        </form>
      )}
      {(section === "orders" || section === "legacy") && (
        <>
          <button disabled={busy} onClick={() => exportPlayers(false)}>
            Export players to Excel
          </button>
          {section === "legacy" && (
            <button disabled={busy} onClick={() => exportPlayers(true)}>
              Download receipts ZIP
            </button>
          )}
          {rows.map((r) => (
            <article className="account-ticket" key={r.id}>
              {section === "orders" ? (
                <>
                  <strong>
                    #{r.number} · {r.name}
                  </strong>
                  <p>
                    {r.currency} {r.amountMinor / 100} ·{" "}
                    {r.refunded ? "Refunded" : r.status} · {r.provider}
                  </p>
                  <small>
                    {r.id} · {r.paymentReference}
                  </small>
                  {r.status === "refund_required" && (
                    <p>
                      Payment arrived outside a valid reservation. No ticket was
                      issued. Review this transaction in Chapa and refund it
                      there.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <strong>{r.data.playerName || r.data.name || r.type}</strong>
                  <p>
                    {r.type} · {r.data.drawId} · #{r.data.luckyNumber} ·{" "}
                    {r.data.status}
                  </p>
                  <p>{r.claimedBy ? "Claimed" : "Unclaimed legacy record"}</p>
                  {r.data.mediaKey && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await accountFetch(
                            `/admin/media/${r.data.mediaKey}`,
                          );
                          if (!response.ok) throw new Error("Download failed");
                          download(
                            new Uint8Array(await response.arrayBuffer()),
                            `receipt${mediaExtension(r.data.mediaMime)}`,
                            r.data.mediaMime || "application/octet-stream",
                          );
                        } catch (e) {
                          setError((e as Error).message);
                        }
                      }}
                    >
                      Download original receipt
                    </button>
                  )}
                  {r.type === "playerEntry" && canWrite && (
                    <LegacyReview row={r} save={save} busy={busy} />
                  )}
                </>
              )}
            </article>
          ))}
        </>
      )}
      {section === "advertisers" && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save("advertisers", aff.code, aff);
            }}
          >
            <fieldset disabled={!canWrite || busy}>
              <label>
                Promo code
                <input
                  required
                  pattern="[A-Z0-9_-]{1,25}"
                  value={aff.code}
                  onChange={(e) =>
                    setAff({ ...aff, code: e.target.value.toUpperCase() })
                  }
                />
              </label>
              <label>
                Affiliate name
                <input
                  required
                  value={aff.name}
                  onChange={(e) => setAff({ ...aff, name: e.target.value })}
                />
              </label>
              <label>
                Commission per paid ticket
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={aff.commissionPerTicket}
                  onChange={(e) =>
                    setAff({
                      ...aff,
                      commissionPerTicket: Number(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={aff.active}
                  onChange={(e) => setAff({ ...aff, active: e.target.checked })}
                />
                Active
              </label>
              <button disabled={busy}>Save affiliate</button>
            </fieldset>
          </form>
          {rows.map((r) => (
            <article key={r.code} className="account-ticket">
              <strong>
                {r.name} · {r.code}
              </strong>
              <p>
                {r.paidTickets} paid tickets ·{" "}
                {r.active ? "Active" : "Disabled"}
              </p>
              <button
                onClick={() =>
                  setAff({
                    ...aff,
                    ...r.details,
                    code: r.code,
                    name: r.name,
                    active: r.active,
                  })
                }
              >
                Edit
              </button>
            </article>
          ))}
        </>
      )}
      {section === "results" && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save("results", resultDraw, {
                _id: resultDraw,
                drawId: resultDraw,
                drawDate: new Date().toISOString(),
                broadcastVideoUrl: video,
                winningNumbers: winners.filter((w) => w.luckyNumber),
              });
            }}
          >
            <fieldset disabled={!canWrite || busy}>
              <label>
                Closed draw ID
                <input
                  required
                  value={resultDraw}
                  onChange={(e) => setResultDraw(e.target.value)}
                />
              </label>
              <label>
                Broadcast recording
                <input
                  type="url"
                  value={video}
                  onChange={(e) => setVideo(e.target.value)}
                />
              </label>
              <p>
                Enter the independently verified live draw outcome. Winning
                numbers must belong to issued tickets.
              </p>
              {winners.map((w, i) => (
                <fieldset key={i}>
                  <legend>Rank {i + 1}</legend>
                  <input
                    aria-label={`Rank ${i + 1} ticket`}
                    placeholder="Ticket number"
                    value={w.luckyNumber}
                    onChange={(e) =>
                      setWinners((v) =>
                        v.map((x, j) =>
                          j === i ? { ...x, luckyNumber: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <input
                    aria-label={`Rank ${i + 1} prize`}
                    placeholder="Prize amount / description"
                    value={w.prizeAmount}
                    onChange={(e) =>
                      setWinners((v) =>
                        v.map((x, j) =>
                          j === i ? { ...x, prizeAmount: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <input
                    aria-label={`Rank ${i + 1} winner`}
                    placeholder="Public winner display name"
                    value={w.winnerName}
                    onChange={(e) =>
                      setWinners((v) =>
                        v.map((x, j) =>
                          j === i ? { ...x, winnerName: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <select
                    aria-label={`Rank ${i + 1} payout status`}
                    value={w.payoutStatus}
                    onChange={(e) =>
                      setWinners((v) =>
                        v.map((x, j) =>
                          j === i ? { ...x, payoutStatus: e.target.value } : x,
                        ),
                      )
                    }
                  >
                    <option value="pending">Payout pending</option>
                    <option value="paid">Payout paid</option>
                  </select>
                </fieldset>
              ))}
              <button disabled={busy}>Publish results</button>
            </fieldset>
          </form>
          {rows.map((r) => (
            <article className="account-ticket" key={r.drawId}>
              {r.drawId} · {r.winningNumbers?.length} winners{" "}
              <button
                onClick={() => {
                  setResultDraw(r.drawId);
                  setVideo(r.broadcastVideoUrl || "");
                  setWinners(r.winningNumbers);
                }}
              >
                Edit payout status / results
              </button>
            </article>
          ))}
        </>
      )}
      {section === "messages" &&
        rows.map((r) => (
          <article className="account-ticket" key={r.id}>
            <h3>{r.data.name || r.data.contact || r.kind}</h3>
            <p>
              {r.data.email} {r.data.phone}
            </p>
            <p>{r.data.message}</p>
            <p>{r.status}</p>
            <button
              disabled={!canWrite || busy || r.status === "resolved"}
              onClick={() => save("messages", r.id, { status: "resolved" })}
            >
              Mark resolved
            </button>
          </article>
        ))}
      {section === "audit" &&
        rows.map((r) => (
          <article key={r.id} className="account-ticket">
            {r.action} · {r.actor} · {r.resource} ·{" "}
            {new Date(r.created_at).toLocaleString()}
            <AdminAuditChanges details={r.details} />
          </article>
        ))}
      {
        <>
          <button
            disabled={!offset || busy}
            onClick={() => setOffset((v) => Math.max(0, v - 100))}
          >
            Previous
          </button>
          <button
            disabled={rows.length < 100 || busy}
            onClick={() => setOffset((v) => v + 100)}
          >
            Next
          </button>
        </>
      }
    </div>
  );
}
function LegacyReview({
  row,
  save,
  busy,
}: {
  row: any;
  save: (kind: string, id: string, value: any) => Promise<void>;
  busy: boolean;
}) {
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  return (
    <details>
      <summary>Review and assign legacy ticket</summary>
      <p>
        Verify the original payment and claimant’s evidence before assigning
        ownership. Matching a phone number is insufficient.
      </p>
      <input
        type="email"
        placeholder="Verified account email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Keep review status</option>
        <option value="paid">Approve original payment</option>
        <option value="failed">Reject original payment</option>
      </select>
      <textarea
        required
        placeholder="Evidence and review notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        disabled={busy || notes.trim().length < 10}
        onClick={() => save("legacy", row.id, { email, notes, status })}
      >
        Save review
      </button>
    </details>
  );
}

function mediaExtension(mime: string) {
  return (
    (
      {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/webp": ".webp",
        "application/pdf": ".pdf",
      } as Record<string, string>
    )[mime] || ".bin"
  );
}
