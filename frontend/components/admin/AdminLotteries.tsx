"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, Ticket, LockKeyhole, RefreshCw } from "lucide-react";
import { accountAPI } from "@/lib/account-api";
import { money } from "@/lib/admin";
import {
  hundredths,
  type LotteryTemplate,
  type AdminRound,
  type LotteryPage,
  type LotterySettings,
} from "@/lib/lotteries";

type Editor = {
  kind: "template" | "round";
  id: string;
  version: number;
  templateId: string;
  templateVersion: number;
  title: string;
  currency: "ETB" | "USD";
  price: string;
  capacity: string;
  deductions: { label: string; percent: string }[];
  shares: string[];
  deadline: string;
  liveVideoUrl: string;
  active: boolean;
};
function localDate(value: string) {
  const d = new Date(value);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
function editSettings(value?: LotteryTemplate | AdminRound): Editor {
  return {
    kind: "template",
    id: value?.id || crypto.randomUUID(),
    version: value?.version || 0,
    templateId: "",
    templateVersion: 0,
    title: value?.title || "",
    currency: value?.currency || "ETB",
    price: value ? (value.priceMinor / 100).toFixed(2) : "",
    capacity: value ? String(value.capacity) : "",
    deductions:
      value?.rules?.deductions.map((d) => ({
        label: d.label,
        percent: String(d.bps / 100),
      })) || [],
    shares:
      value?.rules?.prizeBps.map((p) => String(p / 100)) || Array(10).fill(""),
    deadline: "",
    liveVideoUrl: "",
    active: value && "active" in value ? value.active : true,
  };
}
export function AdminLotteries({ canWrite }: { canWrite: boolean }) {
  const [templates, setTemplates] = useState<LotteryPage<LotteryTemplate>>({
    items: [],
    hasMore: false,
  });
  const [rounds, setRounds] = useState<LotteryPage<AdminRound>>({
    items: [],
    hasMore: false,
  });
  const [templatePage, setTemplatePage] = useState(0),
    [roundPage, setRoundPage] = useState(0);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0),
    [editor, setEditor] = useState<Editor | null>(null),
    [selected, setSelected] = useState<AdminRound | null>(null);
  const [confirmation, setConfirmation] = useState<{
    round: AdminRound;
    action: "open" | "close";
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null),
    confirmationRef = useRef<HTMLDivElement>(null),
    detailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      accountAPI<LotteryPage<LotteryTemplate>>(
        `/admin/templates?offset=${templatePage * 50}`,
        { signal: c.signal },
      ),
      accountAPI<LotteryPage<AdminRound>>(
        `/admin/rounds?offset=${roundPage * 50}`,
        { signal: c.signal },
      ),
    ])
      .then(([t, r]) => {
        if (!c.signal.aborted) {
          setTemplates(t);
          setRounds(r);
        }
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [templatePage, roundPage, reload]);
  const editorId = editor?.id,
    editorKind = editor?.kind;
  useEffect(() => {
    if (editorId) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    }
  }, [editorId, editorKind]);
  useEffect(() => {
    if (confirmation) confirmationRef.current?.focus();
  }, [confirmation]);
  useEffect(() => {
    if (selected) detailRef.current?.focus();
  }, [selected]);
  const change = (patch: Partial<Editor>) =>
    setEditor((e) => (e ? { ...e, ...patch } : null));
  async function write(path: string, body: unknown, message: string) {
    if (!canWrite || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await accountAPI(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setEditor(null);
      setConfirmation(null);
      setSelected(null);
      setNotice(message);
      setReload((n) => n + 1);
    } catch (e) {
      setError(
        `${(e as Error).message} If another administrator changed this record, refresh and reopen it before trying again.`,
      );
    } finally {
      setBusy(false);
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    try {
      const rules = {
        deductions: editor.deductions.map((d) => ({
          label: d.label.trim(),
          bps: hundredths(d.percent),
        })),
        prizeBps: editor.shares.map(hundredths),
      };
      if (
        rules.prizeBps.some((p) => p <= 0) ||
        rules.prizeBps.reduce((a, b) => a + b, 0) !== 10000
      )
        throw new Error(
          "The ten prize shares must be positive and total exactly 100%.",
        );
      if (rules.deductions.reduce((a, d) => a + d.bps, 0) >= 10000)
        throw new Error("Total deductions must be less than 100%.");
      const fields: LotterySettings = {
        title: editor.title.trim(),
        currency: editor.currency,
        priceMinor: hundredths(editor.price),
        capacity: Number(editor.capacity),
        rules,
      };
      if (editor.kind === "template")
        await write(
          `/admin/templates/${editor.id}`,
          {
            ...fields,
            id: editor.id,
            version: editor.version,
            active: editor.active,
          },
          "Lottery defaults saved. Existing rounds keep their own rules.",
        );
      else
        await write(
          `/admin/rounds/${editor.id}`,
          {
            ...fields,
            action: "save",
            version: editor.version,
            templateId: editor.templateId,
            templateVersion: editor.templateVersion,
            deadline: new Date(editor.deadline).toISOString(),
            liveVideoUrl: editor.liveVideoUrl,
          },
          "Round saved as a draft. Review its rules before opening sales.",
        );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function transition(
    round: AdminRound,
    action: "open" | "pause" | "close",
  ) {
    await write(
      `/admin/rounds/${round.id}`,
      { action, version: round.version },
      action === "open"
        ? "Sales opened. Financial rules and the closing date are locked."
        : action === "pause"
          ? "New purchases paused. The closing date is unchanged; existing payments are still checked."
          : "Round closed permanently to new purchases. Existing payments are still checked.",
    );
  }
  function newRound(template: LotteryTemplate) {
    setSelected(null);
    setConfirmation(null);
    setError("");
    setEditor({
      ...editSettings(template),
      kind: "round",
      id: crypto.randomUUID(),
      version: 0,
      templateId: template.id,
      templateVersion: template.version,
    });
  }
  const refresh = () => {
    setEditor(null);
    setSelected(null);
    setConfirmation(null);
    setReload((n) => n + 1);
  };
  return (
    <div className="admin-lotteries">
      <div className="admin-card-heading">
        <p className="admin-muted">
          Templates supply defaults. Each round has its own fixed closing date
          and lucky-number range.
        </p>
        <button disabled={busy || loading} onClick={refresh}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      {error && (
        <p className="admin-alert" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="admin-notice" role="status">
          {notice}
        </p>
      )}
      {loading && <p role="status">Loading lotteries and rounds…</p>}
      {confirmation && (
        <div
          ref={confirmationRef}
          tabIndex={-1}
          className="admin-card admin-round-confirm"
          role="region"
          aria-label="Confirm sales change"
        >
          <h2>
            {confirmation.action === "open"
              ? "Open sales and lock these rules?"
              : "Permanently close this round?"}
          </h2>
          <p>
            <strong>{confirmation.round.title}</strong> ·{" "}
            {money(confirmation.round.priceMinor, confirmation.round.currency)}{" "}
            per ticket · {confirmation.round.capacity.toLocaleString()} numbers
            · closes {new Date(confirmation.round.deadline).toLocaleString()}
          </p>
          <p>
            {confirmation.action === "open"
              ? "The price, capacity, deadline, deductions and prize shares cannot change after opening. A system-wide sales pause still takes priority."
              : "This cannot be reopened. Existing payment checks continue. Closing does not cancel tickets or issue refunds."}
          </p>
          <div className="admin-round-actions">
            <button
              className="admin-primary"
              disabled={busy}
              onClick={() =>
                void transition(confirmation.round, confirmation.action)
              }
            >
              {confirmation.action === "open"
                ? "Open sales and lock rules"
                : "Confirm permanent closure"}
            </button>
            <button disabled={busy} onClick={() => setConfirmation(null)}>
              Keep unchanged
            </button>
          </div>
        </div>
      )}
      {editor && (
        <form
          ref={formRef}
          className="admin-card admin-round-editor"
          onSubmit={save}
        >
          <h2>
            {editor.version ? "Edit" : "New"}{" "}
            {editor.kind === "template" ? "lottery template" : "round"}
          </h2>
          <p className="admin-muted">
            Enter the agreed percentages. No example financial terms are applied
            automatically.
          </p>
          <fieldset disabled={busy || !canWrite}>
            <div className="admin-round-fields">
              <label>
                Title
                <input
                  required
                  maxLength={160}
                  value={editor.title}
                  onChange={(e) => change({ title: e.target.value })}
                />
              </label>
              <label>
                Currency
                <select
                  value={editor.currency}
                  onChange={(e) =>
                    change({ currency: e.target.value as Editor["currency"] })
                  }
                >
                  <option>ETB</option>
                  <option>USD</option>
                </select>
              </label>
              <label>
                Ticket price
                <input
                  type="number"
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  required
                  value={editor.price}
                  onChange={(e) => change({ price: e.target.value })}
                />
              </label>
              <label>
                Ticket capacity
                <input
                  type="number"
                  aria-label="Ticket capacity"
                  min="10"
                  max="100000"
                  step="1"
                  required
                  value={editor.capacity}
                  onChange={(e) => change({ capacity: e.target.value })}
                />
                <small>Lucky numbers run from 1 to this capacity.</small>
              </label>
              {editor.kind === "round" ? (
                <>
                  <label>
                    Sales deadline (your local time)
                    <input
                      type="datetime-local"
                      aria-label="Sales deadline (your local time)"
                      required
                      value={editor.deadline}
                      onChange={(e) => change({ deadline: e.target.value })}
                    />
                    <small>
                      {Intl.DateTimeFormat().resolvedOptions().timeZone}. Stored
                      as an absolute UTC time.
                    </small>
                  </label>
                  <label>
                    Live broadcast URL
                    <input
                      type="url"
                      pattern="https://.*"
                      maxLength={2000}
                      value={editor.liveVideoUrl}
                      onChange={(e) => change({ liveVideoUrl: e.target.value })}
                      placeholder="https://"
                    />
                  </label>
                </>
              ) : (
                <label className="admin-round-check">
                  <input
                    type="checkbox"
                    checked={editor.active}
                    onChange={(e) => change({ active: e.target.checked })}
                  />
                  Available for new rounds
                </label>
              )}
            </div>
            <h3>Disclosed deductions</h3>
            <p>
              Each percentage is taken from eligible ticket collections. Leave
              empty only if there are no deductions.
            </p>
            {editor.deductions.map((d, i) => (
              <div className="admin-deduction" key={i}>
                <label>
                  Deduction {i + 1} name
                  <input
                    required
                    maxLength={80}
                    value={d.label}
                    onChange={(e) =>
                      change({
                        deductions: editor.deductions.map((v, n) =>
                          n === i ? { ...v, label: e.target.value } : v,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Deduction {i + 1} %
                  <input
                    required
                    type="number"
                    min="0"
                    max="99.99"
                    step="0.01"
                    value={d.percent}
                    onChange={(e) =>
                      change({
                        deductions: editor.deductions.map((v, n) =>
                          n === i ? { ...v, percent: e.target.value } : v,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    change({
                      deductions: editor.deductions.filter((_, n) => n !== i),
                    })
                  }
                  aria-label={`Remove deduction ${i + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              disabled={editor.deductions.length >= 10}
              onClick={() =>
                change({
                  deductions: [
                    ...editor.deductions,
                    { label: "", percent: "" },
                  ],
                })
              }
            >
              Add deduction
            </button>
            <h3 className="admin-form-section">Ten ranked prize shares</h3>
            <p>
              Percentages of the net prize fund, after deductions. Total must be
              100%.
            </p>
            <div className="admin-prize-fields">
              {editor.shares.map((p, i) => (
                <label key={i}>
                  Rank {i + 1} %
                  <input
                    required
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={p}
                    onChange={(e) =>
                      change({
                        shares: editor.shares.map((v, n) =>
                          n === i ? e.target.value : v,
                        ),
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <p className="admin-notice">
              Prize shares entered:{" "}
              {editor.shares
                .reduce((a, p) => a + (Number(p) || 0), 0)
                .toFixed(2)}
              %. Projections use actual eligible sales. The policy for fewer
              than ten sold tickets still needs approval before result
              settlement.
            </p>
            <div className="admin-round-actions">
              <button className="admin-primary" type="submit">
                {busy
                  ? "Saving…"
                  : editor.kind === "template"
                    ? "Save template"
                    : "Save draft round"}
              </button>
              <button type="button" onClick={() => setEditor(null)}>
                Cancel editing
              </button>
            </div>
          </fieldset>
        </form>
      )}
      <section className="admin-card">
        <div className="admin-card-heading">
          <div>
            <h2>Reusable lotteries</h2>
            <p>Changing defaults preserves every existing round.</p>
          </div>
          <button
            className="admin-primary"
            disabled={!canWrite || busy || loading}
            onClick={() => {
              setError("");
              setEditor(editSettings());
              setSelected(null);
              setConfirmation(null);
            }}
          >
            <Plus size={16} /> New lottery
          </button>
        </div>
        {!loading && templates.items.length === 0 && (
          <p className="admin-empty">
            No templates yet. Create a lottery, then add its first round.
          </p>
        )}
        <div className="admin-template-grid">
          {templates.items.map((t) => (
            <article className="admin-template" key={t.id}>
              <div className="admin-card-heading">
                <Ticket size={22} />
                <span className="admin-badge">
                  {t.active ? "Available" : "Inactive"}
                </span>
              </div>
              <h3>{t.title}</h3>
              <p>
                <strong>{money(t.priceMinor, t.currency)}</strong> per ticket
                <br />
                {t.capacity.toLocaleString()} numbers · 10 prize positions
              </p>
              <div className="admin-round-actions">
                <button
                  disabled={!canWrite || busy || loading || !t.active}
                  onClick={() => newRound(t)}
                >
                  New round
                </button>
                <button
                  disabled={!canWrite || busy || loading}
                  onClick={() => {
                    setEditor(editSettings(t));
                    setSelected(null);
                    setConfirmation(null);
                  }}
                >
                  Edit defaults
                </button>
              </div>
            </article>
          ))}
        </div>
        <Pagination
          page={templatePage}
          more={templates.hasMore}
          disabled={busy || loading || !!editor}
          label="lottery templates"
          onPage={setTemplatePage}
        />
      </section>
      {selected && (
        <div
          ref={detailRef}
          tabIndex={-1}
          className="admin-card"
          aria-label="Round details"
        >
          <div className="admin-card-heading">
            <h2>{selected.title} · rules & estimates</h2>
            <button onClick={() => setSelected(null)}>Close details</button>
          </div>
          <p>
            Round reference: <code>{selected.id}</code>
            <br />
            Closes: {new Date(selected.deadline).toLocaleString()} (
            {new Date(selected.deadline).toISOString()})
          </p>
          {selected.rules ? (
            <>
              <h3>Deductions from eligible collections</h3>
              {selected.rules.deductions.length ? (
                <ul>
                  {selected.rules.deductions.map((d) => (
                    <li key={d.label}>
                      {d.label}: {d.bps / 100}%
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No deductions.</p>
              )}
              <h3>Share of net prize fund</h3>
              <div className="admin-prize-summary">
                {selected.rules.prizeBps.map((p, i) => (
                  <span key={i}>
                    #{i + 1}: <strong>{p / 100}%</strong>
                  </span>
                ))}
              </div>
              <p className="admin-muted">
                Each deduction is rounded down to the smallest currency unit for
                this estimate. Final prize rounding and any unfilled ranks
                require the approved settlement policy.
              </p>
            </>
          ) : (
            <p className="admin-notice">
              Historical round: financial rules were not recorded. No prize fund
              is inferred.
            </p>
          )}
          <p className="admin-notice">
            The live draw uses only eligible sold tickets. One customer may win
            with different tickets. Prizes are paid outside this website.
          </p>
        </div>
      )}
      <section className="admin-card">
        <h2>All rounds</h2>
        <p className="admin-muted">
          Sold excludes recorded refunds. Remaining also excludes active
          reservations and historical occupied numbers. Refresh to update these
          counts.
        </p>
        <div className="admin-table-scroll">
          <table className="admin-round-table">
            <thead>
              <tr>
                <th>Round / price</th>
                <th>Sales deadline</th>
                <th>Sold / capacity</th>
                <th>Remaining</th>
                <th>Net prize fund</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rounds.items.map((r) => (
                <tr key={r.id}>
                  <td data-label="Round / price">
                    <strong>{r.title}</strong>
                    <br />
                    {money(r.priceMinor, r.currency)}
                    <br />
                    <small>
                      {r.templateId
                        ? `Template revision ${r.templateVersion}`
                        : "Historical round"}
                    </small>
                  </td>
                  <td data-label="Closes">
                    {new Date(r.deadline).toLocaleString()}
                  </td>
                  <td data-label="Sold / capacity">
                    {r.sold.toLocaleString()} / {r.capacity.toLocaleString()}
                  </td>
                  <td data-label="Remaining">{r.remaining.toLocaleString()}</td>
                  <td data-label="Net prize fund">
                    {r.currentNetMinor === null ? (
                      "Not recorded"
                    ) : (
                      <>
                        <strong>{money(r.currentNetMinor, r.currency)}</strong>
                        <br />
                        <small>
                          Up to {money(r.maximumNetMinor!, r.currency)} when
                          full
                        </small>
                      </>
                    )}
                  </td>
                  <td data-label="Status">
                    <span className="admin-badge">{r.state}</span>
                    {r.startedAt && (
                      <div className="admin-muted">
                        <LockKeyhole size={12} /> Rules locked
                      </div>
                    )}
                  </td>
                  <td data-label="Actions">
                    <div className="admin-round-actions">
                      <button
                        disabled={busy || loading}
                        onClick={() => {
                          setSelected(r);
                          setEditor(null);
                        }}
                      >
                        View rules
                      </button>
                      {r.templateId && !r.startedAt && !r.closedAt && (
                        <button
                          disabled={!canWrite || busy || loading}
                          onClick={() => {
                            setEditor({
                              ...editSettings(r),
                              kind: "round",
                              templateId: r.templateId,
                              templateVersion: r.templateVersion,
                              deadline: localDate(r.deadline),
                              liveVideoUrl: r.liveVideoUrl,
                            });
                            setSelected(null);
                            setConfirmation(null);
                          }}
                        >
                          Edit draft
                        </button>
                      )}
                      {(r.state === "paused" ||
                        (r.state === "draft" && r.rules)) && (
                        <button
                          disabled={!canWrite || busy || loading}
                          onClick={() => {
                            setConfirmation({ round: r, action: "open" });
                            setEditor(null);
                          }}
                        >
                          {r.state === "paused" ? "Resume sales" : "Open sales"}
                        </button>
                      )}
                      {r.state === "open" && (
                        <button
                          disabled={!canWrite || busy || loading}
                          onClick={() => void transition(r, "pause")}
                        >
                          Pause sales
                        </button>
                      )}
                      {r.state !== "completed" && !r.closedAt && (
                        <button
                          disabled={!canWrite || busy || loading}
                          onClick={() => {
                            setConfirmation({ round: r, action: "close" });
                            setEditor(null);
                          }}
                        >
                          Close round
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rounds.items.length === 0 && (
          <p className="admin-empty">No rounds on this page.</p>
        )}
        <Pagination
          page={roundPage}
          more={rounds.hasMore}
          disabled={busy || loading || !!editor}
          label="rounds"
          onPage={setRoundPage}
        />
      </section>
    </div>
  );
}
function Pagination({
  page,
  more,
  disabled,
  label,
  onPage,
}: {
  page: number;
  more: boolean;
  disabled: boolean;
  label: string;
  onPage: (v: number) => void;
}) {
  return (
    <nav className="admin-round-pagination" aria-label={`${label} pagination`}>
      <button
        disabled={disabled || page === 0}
        onClick={() => onPage(page - 1)}
      >
        Previous {label}
      </button>
      <span>Page {page + 1}</span>
      <button disabled={disabled || !more} onClick={() => onPage(page + 1)}>
        Next {label}
      </button>
    </nav>
  );
}
