import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Copy,
  KeyRound,
  Play,
  Plus,
  QrCode,
  RefreshCw,
  ShieldAlert,
  Swords,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adminCreateTournament,
  adminListTournaments,
  adminStartTournament,
  type AdminTournament,
} from "@/lib/tournamentApi";

const KEY_STORAGE = "fgc_admin_key";

const gameLabels: Record<string, string> = {
  melee: "Melee",
  ultimate: "Ultimate",
  roa2: "Rivals of Aether 2",
};

const statusLabels: Record<string, string> = {
  signup: "Åben for tilmelding",
  checkin: "Check-in i gang",
  live: "Igangværende",
  done: "Afsluttet",
};

const statusColors: Record<string, string> = {
  signup: "bg-brick text-coal",
  checkin: "bg-amber-400 text-coal",
  live: "bg-emerald-500 text-coal",
  done: "bg-ink/20 text-ink",
};

function formatDateTime(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || "");
  const [keyInput, setKeyInput] = useState("");
  const [tournaments, setTournaments] = useState<AdminTournament[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Opret-formular
  const [name, setName] = useState("");
  const [game, setGame] = useState("ultimate");
  const [format, setFormat] = useState("double_elim");
  const [startAt, setStartAt] = useState("");
  const [startggSlug, setStartggSlug] = useState("");

  const load = useCallback(async () => {
    if (!key) return;
    setError(null);
    try {
      const data = await adminListTournaments(key);
      setTournaments(data.tournaments);
    } catch (err) {
      setTournaments(null);
      setError(err instanceof Error ? err.message : "Kunne ikke hente turneringer");
    }
  }, [key]);

  useEffect(() => {
    void load();
  }, [load]);

  const unlock = () => {
    if (keyInput.trim().length < 8) {
      setError("Nøglen ser for kort ud.");
      return;
    }
    sessionStorage.setItem(KEY_STORAGE, keyInput.trim());
    setKey(keyInput.trim());
    setKeyInput("");
    setError(null);
  };

  const forgetKey = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    setKey("");
    setTournaments(null);
  };

  const handleCreate = async () => {
    if (name.trim().length < 2) {
      setError("Giv turneringen et navn.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const body: Parameters<typeof adminCreateTournament>[1] = {
        name: name.trim(),
        game,
        format,
      };
      if (startAt) body.start_at = new Date(startAt).getTime();
      if (startggSlug.trim()) body.startgg_slug = startggSlug.trim();
      const res = await adminCreateTournament(key, body);
      setNotice(
        `Turnering oprettet! Join-kode: ${res.tournament.join_code} — den er nu postet på Discord.`,
      );
      setName("");
      setStartAt("");
      setStartggSlug("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke oprette turnering");
    } finally {
      setBusy(false);
    }
  };

  const handleStart = async (t: AdminTournament) => {
    if (!confirm(`Start bracket for "${t.name}"?\n${t.checked_in}/${t.entrants} spillere er checket ind.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await adminStartTournament(key, t.join_code);
      setNotice(`Bracket live for "${t.name}" — ${res.matches} kampe genereret!`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke starte bracket");
    } finally {
      setBusy(false);
    }
  };

  const copyLink = (code: string) => {
    void navigator.clipboard.writeText(`${window.location.origin}/t/${code}`);
    setNotice(`Join-link kopieret: /t/${code}`);
  };

  /* ---------- Lås-skærm ---------- */
  if (!key) {
    return (
      <>
        <PageHeader
          eyebrow="Admin"
          title="LazyTO-kontrolpanel"
          description="Opret ugens turneringer og start brackets — direkte fra browseren."
        />
        <section className="section-padding bg-cream">
          <div className="container-site px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-md rounded-2xl border-[3px] border-ink bg-cream-dim p-8 text-ink shadow-poster"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-ink bg-coal shadow-poster-sm">
                <KeyRound className="h-6 w-6 text-brick-soft" aria-hidden="true" />
              </div>
              <h2 className="text-center font-heading text-xl font-bold">
                Indtast admin-nøgle
              </h2>
              <p className="mt-2 text-center text-sm text-ink/60">
                Nøglen gemmes kun i denne browser-session og sendes aldrig
                andre steder end til fgcnord.dk.
              </p>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && unlock()}
                placeholder="ADMIN_API_KEY"
                className="mt-5 w-full rounded-lg border-2 border-ink bg-cream px-4 py-3 font-mono shadow-poster-sm outline-none focus:ring-2 focus:ring-brick"
                autoComplete="off"
              />
              {error && <p className="mt-3 text-sm font-bold text-brick">{error}</p>}
              <Button
                onClick={unlock}
                className="mt-4 w-full bg-brick text-coal hover:bg-brick-soft"
              >
                Lås op
              </Button>
              <p className="mt-4 flex items-start gap-2 text-xs text-ink/50">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Del aldrig nøglen i chat eller på Discord. Tabet nulstiller
                sessionen automatisk.
              </p>
            </motion.div>
          </div>
        </section>
      </>
    );
  }

  /* ---------- Kontrolpanel ---------- */
  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="LazyTO-kontrolpanel"
        description="Turneringer oprettet her lander automatisk på Discord med join-link og QR."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={forgetKey}
          className="mt-4 border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-cream"
        >
          <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" /> Glem nøgle
        </Button>
      </PageHeader>

      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-xl border-2 border-brick bg-cream-dim p-4 font-bold text-brick shadow-poster">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-6 flex items-start gap-2 rounded-xl border-2 border-ink bg-emerald-100 p-4 font-bold text-ink shadow-poster">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              {notice}
            </div>
          )}

          <div className="grid items-start gap-8 lg:grid-cols-5">
            {/* Opret turnering */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-[3px] border-ink bg-cream-dim p-6 text-ink shadow-poster lg:col-span-2"
            >
              <h2 className="flex items-center gap-2 font-heading text-xl font-bold">
                <Plus className="h-5 w-5 text-brick" aria-hidden="true" />
                Opret turnering
              </h2>

              <label className="mt-5 block text-sm font-bold">Navn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Weekly #77 — Ultimate Singles"
                className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-4 py-2.5 shadow-poster-sm outline-none focus:ring-2 focus:ring-brick"
              />

              <label className="mt-4 block text-sm font-bold">Spil</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {Object.entries(gameLabels).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGame(value)}
                    className={`rounded-lg border-2 border-ink px-3 py-2 text-sm font-bold shadow-poster-sm transition-colors ${
                      game === value ? "bg-brick text-coal" : "bg-cream hover:bg-cream-dim"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-sm font-bold">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-4 py-2.5 font-bold shadow-poster-sm outline-none focus:ring-2 focus:ring-brick"
              >
                <option value="double_elim">Double Elimination</option>
                <option value="single_elim">Single Elimination</option>
                <option value="round_robin">Round Robin</option>
              </select>

              <label className="mt-4 block text-sm font-bold">
                Runde 1 starter (valgfri — styrer check-in vinduet)
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-4 py-2.5 shadow-poster-sm outline-none focus:ring-2 focus:ring-brick"
              />
              {startAt && (
                <p className="mt-1 text-xs text-ink/60">
                  Check-in åbner automatisk kl.{" "}
                  {new Date(new Date(startAt).getTime() - 15 * 60 * 1000).toLocaleTimeString(
                    "da-DK",
                    { hour: "2-digit", minute: "2-digit" },
                  )}{" "}
                  — 15 min før.
                </p>
              )}

              <label className="mt-4 block text-sm font-bold">
                start.gg-slug (valgfri)
              </label>
              <input
                type="text"
                value={startggSlug}
                onChange={(e) => setStartggSlug(e.target.value)}
                placeholder="tournament/weekly-77/event/ultimate-singles"
                className="mt-1 w-full rounded-lg border-2 border-ink bg-cream px-4 py-2.5 font-mono text-sm shadow-poster-sm outline-none focus:ring-2 focus:ring-brick"
              />

              <Button
                onClick={() => void handleCreate()}
                disabled={busy}
                className="mt-6 w-full bg-brick text-coal hover:bg-brick-soft"
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Opret + post på Discord
              </Button>
            </motion.div>

            {/* Turneringsoversigt */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="mb-4 flex items-center justify-between">
                <SectionHeader eyebrow="Oversigt" title="Turneringer" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void load()}
                  disabled={busy}
                  className="border-2 border-ink"
                >
                  <RefreshCw className="mr-1 h-4 w-4" aria-hidden="true" /> Genindlæs
                </Button>
              </div>

              {tournaments === null ? (
                <p className="text-ink/60">Henter turneringer...</p>
              ) : tournaments.length === 0 ? (
                <p className="text-ink/60">
                  Ingen turneringer endnu — opret den første til venstre.
                </p>
              ) : (
                <ul className="space-y-3">
                  {tournaments.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-xl border-2 border-ink bg-cream p-4 shadow-poster-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-heading font-bold">{t.name}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/60">
                            <span>{gameLabels[t.game] || t.game}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                              {formatDateTime(t.start_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" aria-hidden="true" />
                              {t.checked_in}/{t.entrants} checked ind
                            </span>
                            <span className="font-mono font-bold text-ink">
                              {t.join_code}
                            </span>
                          </p>
                        </div>
                        <Badge className={statusColors[t.status] || "bg-ink/20 text-ink"}>
                          {statusLabels[t.status] || t.status}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="border-2 border-ink">
                          <Link to={`/t/${t.join_code}`}>
                            <QrCode className="mr-1 h-4 w-4" aria-hidden="true" /> QR-side
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyLink(t.join_code)}
                          className="border-2 border-ink"
                        >
                          <Copy className="mr-1 h-4 w-4" aria-hidden="true" /> Kopiér join-link
                        </Button>
                        <Button asChild variant="outline" size="sm" className="border-2 border-ink">
                          <Link to={`/t/${t.join_code}/bracket`}>
                            <Swords className="mr-1 h-4 w-4" aria-hidden="true" /> Bracket
                          </Link>
                        </Button>
                        {(t.status === "signup" || t.status === "checkin") && (
                          <Button
                            size="sm"
                            onClick={() => void handleStart(t)}
                            disabled={busy}
                            className="bg-emerald-500 text-coal hover:bg-emerald-400"
                          >
                            <Play className="mr-1 h-4 w-4" aria-hidden="true" /> Start bracket
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
