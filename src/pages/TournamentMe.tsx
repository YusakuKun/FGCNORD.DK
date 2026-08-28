import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type Match,
  type TournamentPublic,
  checkin,
  confirmMatch,
  disputeMatch,
  getBracket,
  getTournament,
  getTournamentMe,
  joinAsGuest,
  joinTournament,
  reportMatch,
} from "@/lib/tournamentApi";


const gameLabels: Record<string, string> = {
  melee: "Melee",
  ultimate: "Ultimate",
  roa2: "Rivals of Aether 2",
};

export function TournamentMe() {
  const { code } = useParams<{ code: string }>();
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [me, setMe] = useState<Awaited<ReturnType<typeof getTournamentMe>> | null>(null);
  const [bracket, setBracket] = useState<Awaited<ReturnType<typeof getBracket>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestTag, setGuestTag] = useState("");
  const [busy, setBusy] = useState(false);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  const load = useCallback(async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const [t, m, b] = await Promise.all([
        getTournament(code),
        getTournamentMe(code).catch(() => null),
        getBracket(code).catch(() => null),
      ]);
      setTournament(t);
      setMe(m);
      setBracket(b);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fejl ved indlæsning");
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 10000);
    return () => clearInterval(id);
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

  const handleReport = async (matchId: string) => {
    const s1 = Number(score1);
    const s2 = Number(score2);
    if (!Number.isFinite(s1) || !Number.isFinite(s2)) return;
    setBusy(true);
    try {
      await reportMatch(matchId, s1, s2);
      setScore1("");
      setScore2("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke rapportere");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async (matchId: string) => {
    setBusy(true);
    try {
      await confirmMatch(matchId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke bekræfte");
    } finally {
      setBusy(false);
    }
  };

  const handleDispute = async (matchId: string) => {
    setBusy(true);
    try {
      await disputeMatch(matchId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke dispute");
    } finally {
      setBusy(false);
    }
  };

  const opponent = (match: Match | null) => {
    if (!match || !me?.player_id) return null;
    const id =
      match.player1_id === me.player_id ? match.player2_id : match.player1_id;
    return bracket?.entrants.find((e) => e.id === id) || null;
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-ink/60">Indlæser...</p>
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

  const currentMatch = me?.match || null;
  const opp = currentMatch ? opponent(currentMatch) : null;

  return (
    <>
      <PageHeader
        eyebrow="Min turnering"
        title={tournament.name}
        description={`${gameLabels[tournament.game] || tournament.game}`}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-2 border-ink bg-cream">
            <Trophy className="mr-1 h-3 w-3" />
            {tournament.status === "live" ? "Igang" : statusLabel(tournament.status)}
          </Badge>
          <Badge variant="outline" className="border-2 border-ink bg-cream">
            <Users className="mr-1 h-3 w-3" />
            {tournament.entrants.length}
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

          {!me?.joined && tournament.status !== "done" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-md rounded-2xl border-[3px] border-ink bg-cream-dim p-6 shadow-poster"
            >
              <h2 className="mb-4 font-heading text-xl font-bold">Tilmeld dig</h2>
              <p className="mb-4 text-sm text-ink/70">
                Log ind eller brug gæste-tilmelding.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={guestTag}
                  onChange={(e) => setGuestTag(e.target.value)}
                  placeholder="Dit gamertag"
                  className="w-full rounded-lg border-2 border-ink bg-cream px-4 py-2 font-bold shadow-poster-sm outline-none focus:ring-2 focus:ring-brick"
                />
                <Button
                  onClick={() => void handleGuestJoin()}
                  disabled={busy || guestTag.trim().length < 2}
                  className="w-full bg-ink text-cream hover:bg-brick hover:text-ink"
                >
                  Tilmeld som gæst
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-2 border-ink"
                >
                  <a href={`/api/auth/discord?state=/t/${code}/mig`}>
                    Fortsæt med Discord
                  </a>
                </Button>
              </div>
            </motion.div>
          )}

          {me?.joined && (
            <div className="mx-auto max-w-2xl space-y-6">
              {tournament.status === "checkin" && !me.checked_in && (
                <div className="rounded-xl border-2 border-ink bg-cream-dim p-4 shadow-poster">
                  <p className="font-bold">Check in for at bekræfte din tilstedeværelse.</p>
                  <Button
                    onClick={() => void handleCheckin()}
                    disabled={busy}
                    className="mt-3 bg-brick text-cream hover:bg-brick-soft"
                  >
                    Check in
                  </Button>
                </div>
              )}

              {tournament.status === "live" && currentMatch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border-[3px] border-ink bg-cream p-6 shadow-poster"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                      <Swords className="h-5 w-5 text-brick" /> Din næste kamp
                    </h2>
                    <Badge variant="outline" className="border-2 border-ink">
                      {currentMatch.status === "reported"
                        ? "Afventer bekræftelse"
                        : currentMatch.status === "ready"
                          ? "Klar"
                          : currentMatch.status === "disputed"
                            ? "Under review"
                            : "Afventer"}
                    </Badge>
                  </div>

                  <div className="mb-6 flex items-center justify-center gap-4 text-center">
                    <div className="rounded-xl border-2 border-ink bg-cream-dim px-5 py-3 shadow-poster-sm">
                      <p className="font-bold">Dig</p>
                    </div>
                    <span className="font-display text-xl">VS</span>
                    <div className="rounded-xl border-2 border-ink bg-cream-dim px-5 py-3 shadow-poster-sm">
                      <p className="font-bold">{opp?.gamertag || "Bye"}</p>
                    </div>
                  </div>

                  {currentMatch.status === "ready" && (
                    <div className="space-y-3">
                      <p className="text-sm text-ink/70">Rapporter resultat:</p>
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={score1}
                          onChange={(e) => setScore1(e.target.value)}
                          className="w-20 rounded-lg border-2 border-ink bg-cream px-3 py-2 text-center font-bold shadow-poster-sm"
                          placeholder="0"
                        />
                        <span className="font-bold">-</span>
                        <input
                          type="number"
                          min={0}
                          value={score2}
                          onChange={(e) => setScore2(e.target.value)}
                          className="w-20 rounded-lg border-2 border-ink bg-cream px-3 py-2 text-center font-bold shadow-poster-sm"
                          placeholder="0"
                        />
                      </div>
                      <Button
                        onClick={() => void handleReport(currentMatch.id)}
                        disabled={busy}
                        className="w-full bg-ink text-cream hover:bg-brick hover:text-ink"
                      >
                        Indsend resultat
                      </Button>
                      {opp && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-2 border-ink"
                        >
                          <a
                            href={`/stage-strike?p1=${encodeURIComponent(
                              "Dig",
                            )}&p2=${encodeURIComponent(opp.gamertag)}`}
                          >
                            Åbn Stage Strike
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  {currentMatch.status === "reported" && (
                    <div className="space-y-3">
                      <div className="rounded-xl border-2 border-olive bg-cream-dim p-3 text-center">
                        <p className="font-bold">
                          {currentMatch.score1} - {currentMatch.score2}
                        </p>
                        <p className="text-sm text-ink/70">
                          Modstanderen har rapporteret. Bekræft eller dispute.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => void handleConfirm(currentMatch.id)}
                          disabled={busy}
                          className="flex-1 bg-olive text-cream hover:bg-olive/90"
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Bekræft
                        </Button>
                        <Button
                          onClick={() => void handleDispute(currentMatch.id)}
                          disabled={busy}
                          variant="outline"
                          className="flex-1 border-2 border-brick text-brick hover:bg-brick hover:text-cream"
                        >
                          <AlertCircle className="mr-1 h-4 w-4" /> Dispute
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentMatch.status === "disputed" && (
                    <div className="rounded-xl border-2 border-brick bg-cream-dim p-4 text-center">
                      <AlertCircle className="mx-auto mb-2 h-8 w-8 text-brick" />
                      <p className="font-bold">Kampen er under review</p>
                      <p className="text-sm text-ink/70">
                        Find en referee for at afgøre resultatet.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {tournament.status === "live" && !currentMatch && (
                <div className="rounded-2xl border-[3px] border-ink bg-cream p-6 text-center shadow-poster">
                  <p className="font-bold">Ingen aktuel kamp</p>
                  <p className="text-ink/60">
                    Du har ingen pending kamp lige nu. Tillykke, måske du vandt!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    signup: "Tilmelding",
    checkin: "Check-in",
    live: "Igang",
    done: "Færdig",
  };
  return map[status] || status;
}
