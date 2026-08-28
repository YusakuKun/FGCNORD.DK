import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  QrCode,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { toDataURL } from "qrcode";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type TournamentPublic,
  joinAsGuest,
  joinTournament,
  getTournament,
  getTournamentMe,
  checkin,
} from "@/lib/tournamentApi";
import { cn } from "@/lib/utils";

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

export function TournamentLanding() {
  const { code } = useParams<{ code: string }>();
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [me, setMe] = useState<Awaited<ReturnType<typeof getTournamentMe>> | null>(null);
  const [qr, setQr] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestTag, setGuestTag] = useState("");
  const [busy, setBusy] = useState(false);

  const joinUrl = useMemo(() => {
    if (typeof window === "undefined" || !code) return "";
    return `${window.location.origin}/t/${code}`;
  }, [code]);

  useEffect(() => {
    if (!joinUrl) return;
    toDataURL(joinUrl, { width: 240, margin: 2 })
      .then(setQr)
      .catch(console.error);
  }, [joinUrl]);

  const load = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const [t, m] = await Promise.all([
        getTournament(code),
        getTournamentMe(code).catch(() => null),
      ]);
      setTournament(t);
      setMe(m);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fejl ved indlæsning");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleGuestJoin = async () => {
    if (!guestTag.trim() || !code) return;
    setBusy(true);
    try {
      await joinAsGuest(guestTag.trim());
      await joinTournament(code);
      setGuestTag("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke tilmelde");
    } finally {
      setBusy(false);
    }
  };

  const handleCheckin = async () => {
    if (!code) return;
    setBusy(true);
    try {
      await checkin(code);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in fejlede");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-ink/60">Indlæser turnering...</p>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="container-site px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Turnering ikke fundet</h1>
        <p className="mt-2 text-ink/60">{error || "Koden findes ikke."}</p>
      </div>
    );
  }

  const isOpen = tournament.status === "signup" || tournament.status === "checkin";

  return (
    <>
      <PageHeader
        eyebrow="Turnering"
        title={tournament.name}
        description={`${gameLabels[tournament.game] || tournament.game} · ${statusLabels[tournament.status] || tournament.status}`}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-2 border-ink bg-cream">
            <Trophy className="mr-1 h-3 w-3" />
            {tournament.format === "double_elim"
              ? "Double Elimination"
              : tournament.format}
          </Badge>
          <Badge variant="outline" className="border-2 border-ink bg-cream">
            <Users className="mr-1 h-3 w-3" />
            {tournament.entrants.length} tilmeldte
          </Badge>
        </div>
      </PageHeader>

      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 rounded-xl border-2 border-brick bg-cream-dim p-4 text-brick shadow-poster">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* QR + join */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-[3px] border-ink bg-cream-dim p-6 shadow-poster sm:p-8"
            >
              <h2 className="mb-4 font-heading text-xl font-bold">Scan for at tilmelde dig</h2>
              <div className="mx-auto mb-4 w-fit rounded-xl border-2 border-ink bg-white p-3 shadow-poster-sm">
                {qr ? (
                  <img src={qr} alt="QR-kode til tilmelding" className="h-48 w-48" />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center">
                    <QrCode className="h-12 w-12 text-ink/30" />
                  </div>
                )}
              </div>
              <p className="mb-6 text-center font-mono text-lg font-bold tracking-wider">
                {tournament.join_code}
              </p>

              {!me?.joined && isOpen && (
                <div className="space-y-3">
                  <p className="text-sm text-ink/70">
                    Har du ikke Discord? Indtast dit gamertag:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={guestTag}
                      onChange={(e) => setGuestTag(e.target.value)}
                      placeholder="Dit gamertag"
                      className="flex-1 rounded-lg border-2 border-ink bg-cream px-4 py-2 font-bold shadow-poster-sm outline-none focus:ring-2 focus:ring-brick"
                    />
                    <Button
                      onClick={() => void handleGuestJoin()}
                      disabled={busy || guestTag.trim().length < 2}
                      className="bg-ink text-cream hover:bg-brick hover:text-ink"
                    >
                      Tilmeld
                    </Button>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-2 border-ink"
                  >
                    <a href={`/api/auth/discord?state=/t/${code}`}>
                      Fortsæt med Discord
                    </a>
                  </Button>
                </div>
              )}

              {me?.joined && (
                <div className="rounded-xl border-2 border-ink bg-cream p-4 text-center shadow-poster-sm">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-olive" />
                  <p className="font-bold">Du er tilmeldt!</p>
                  {tournament.status === "checkin" && !me.checked_in && (
                    <Button
                      onClick={() => void handleCheckin()}
                      disabled={busy}
                      className="mt-3 bg-brick text-cream hover:bg-brick-soft"
                    >
                      <Calendar className="mr-2 h-4 w-4" /> Check in
                    </Button>
                  )}
                  {me.checked_in && (
                    <p className="mt-2 text-sm text-ink/60">Du er checket ind.</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Entrants + actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border-[3px] border-ink bg-cream p-6 shadow-poster sm:p-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold">Deltagere</h2>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="border-2 border-ink">
                    <a href={`/t/${code}/bracket`}>
                      <Swords className="mr-1 h-4 w-4" /> Bracket
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="border-2 border-ink">
                    <a href={`/t/${code}/mig`}>Min kamp</a>
                  </Button>
                </div>
              </div>

              {tournament.entrants.length === 0 ? (
                <p className="text-ink/60">Ingen tilmeldte endnu.</p>
              ) : (
                <ul className="space-y-2">
                  {tournament.entrants.map((e) => (
                    <li
                      key={e.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg border-2 border-ink px-3 py-2 shadow-poster-sm",
                        e.checked_in ? "bg-cream-dim" : "bg-cream",
                      )}
                    >
                      <span className="font-bold">{e.gamertag}</span>
                      <div className="flex items-center gap-2">
                        {e.seed !== null && (
                          <span className="text-xs font-bold text-ink/50">Seed {e.seed}</span>
                        )}
                        {e.checked_in ? (
                          <CheckCircle2 className="h-4 w-4 text-olive" />
                        ) : (
                          <span className="text-xs text-ink/40">ikke checket ind</span>
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
