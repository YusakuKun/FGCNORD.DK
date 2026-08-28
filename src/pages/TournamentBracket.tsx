import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type Match,
  getBracket,
  type TournamentPublic,
  getTournament,
} from "@/lib/tournamentApi";
import { cn } from "@/lib/utils";

const gameLabels: Record<string, string> = {
  melee: "Melee",
  ultimate: "Ultimate",
  roa2: "Rivals of Aether 2",
};

export function TournamentBracket() {
  const { code } = useParams<{ code: string }>();
  const [tournament, setTournament] = useState<TournamentPublic | null>(null);
  const [bracket, setBracket] = useState<Awaited<ReturnType<typeof getBracket>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    Promise.all([getTournament(code), getBracket(code)])
      .then(([t, b]) => {
        if (cancelled) return;
        setTournament(t);
        setBracket(b);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Fejl");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const rounds = useMemo(() => {
    if (!bracket) return [];
    const map = new Map<number, Match[]>();
    for (const m of bracket.matches) {
      const list = map.get(m.round) || [];
      list.push(m);
      map.set(m.round, list);
    }
    return Array.from(map.entries()).sort((a, b) => {
      // Winners rounds descending (1,2,3...), then GF (0), then losers negative ascending (-1,-2...)
      if (a[0] > 0 && b[0] > 0) return b[0] - a[0];
      if (a[0] > 0) return -1;
      if (b[0] > 0) return 1;
      if (a[0] === 0) return -1;
      if (b[0] === 0) return 1;
      return a[0] - b[0];
    });
  }, [bracket]);

  const entrantName = (id: string | null) => {
    if (!id) return "—";
    return bracket?.entrants.find((e) => e.id === id)?.gamertag || "Ukendt";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-ink/60">Indlæser bracket...</p>
      </div>
    );
  }

  if (error || !tournament || !bracket) {
    return (
      <div className="container-site px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Bracket ikke fundet</h1>
        <p className="mt-2 text-ink/60">{error || "Turneringen findes ikke."}</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Bracket"
        title={tournament.name}
        description={`${gameLabels[tournament.game] || tournament.game}`}
      >
        <Button asChild variant="outline" className="mt-4 border-2 border-ink">
          <a href={`/t/${code}`}>Tilbage til turnering</a>
        </Button>
      </PageHeader>

      <section className="section-padding overflow-x-auto bg-cream">
        <div className="container-site min-w-[800px] px-4 sm:px-6 lg:px-8">
          {tournament.status !== "live" && tournament.status !== "done" && (
            <div className="mb-6 rounded-xl border-2 border-ink bg-cream-dim p-4 text-center shadow-poster">
              Bracket genereres først når turneringen starter.
            </div>
          )}

          <div className="flex gap-8">
            {rounds.map(([round, matches]) => (
              <div key={round} className="flex flex-col gap-4">
                <h3 className="text-center font-heading text-sm font-bold uppercase tracking-widest">
                  {roundLabel(round)}
                </h3>
                <div className="flex flex-1 flex-col justify-around gap-4">
                  {matches.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "w-44 rounded-xl border-2 border-ink bg-cream p-2 shadow-poster-sm",
                        m.status === "confirmed" && "bg-cream-dim",
                        m.status === "reported" && "border-olive",
                        m.status === "disputed" && "border-brick",
                        m.round === 0 && "border-brick bg-brick/5",
                      )}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-ink/50">
                          {m.round === 0 ? "GF" : `R${m.round}`} · {m.slot + 1}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {m.status}
                        </Badge>
                      </div>
                      <div
                        className={cn(
                          "rounded-lg border border-ink px-2 py-1 text-sm font-bold",
                          m.winner_id === m.player1_id
                            ? "bg-olive text-cream"
                            : "bg-cream-dim",
                        )}
                      >
                        {entrantName(m.player1_id)}
                      </div>
                      <div
                        className={cn(
                          "mt-1 rounded-lg border border-ink px-2 py-1 text-sm font-bold",
                          m.winner_id === m.player2_id
                            ? "bg-olive text-cream"
                            : "bg-cream-dim",
                        )}
                      >
                        {entrantName(m.player2_id)}
                      </div>
                      {m.score1 !== null && m.score2 !== null && (
                        <p className="mt-1 text-center text-xs font-bold">
                          {m.score1} - {m.score2}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function roundLabel(round: number): string {
  if (round === 0) return "Grand Finals";
  if (round > 0) return `Winners R${round}`;
  return `Losers R${Math.abs(round)}`;
}
