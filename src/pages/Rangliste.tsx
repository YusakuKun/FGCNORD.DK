import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { getLeaderboard, type LeaderboardRow } from "@/lib/lobbyApi";

const GAMES = [
  { value: "ultimate", label: "Ultimate" },
  { value: "melee", label: "Melee" },
  { value: "roa2", label: "Rivals of Aether 2" },
];

const medals = ["🥇", "🥈", "🥉"];

export function Rangliste() {
  const [game, setGame] = useState("ultimate");
  const [players, setPlayers] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (g: string) => {
    try {
      const res = await getLeaderboard(g);
      setPlayers(res.players);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunne ikke hente ranglisten");
    }
  }, []);

  useEffect(() => {
    setPlayers(null);
    void load(game);
  }, [game, load]);

  return (
    <>
      <PageHeader
        eyebrow="Rangliste"
        title="Skakklub-rating"
        description="Alle bekræftede kampe tæller — både lobby-casuals og weekly-turneringer. Start-rating 1000, Elo-systemet."
      />
      <section className="section-padding bg-cream">
        <div className="container-site max-w-3xl px-4 sm:px-6 lg:px-8 text-ink">
          <div className="mb-6 flex flex-wrap gap-2">
            {GAMES.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGame(g.value)}
                className={`rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold shadow-poster-sm transition-colors ${
                  game === g.value ? "bg-brick text-coal" : "bg-cream hover:bg-cream-dim"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-6 rounded-xl border-2 border-brick bg-cream-dim p-4 font-bold text-brick shadow-poster">
              {error}
            </div>
          )}

          {players === null ? (
            <p className="text-ink/60">Henter ranglisten…</p>
          ) : players.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border-[3px] border-ink bg-cream-dim p-8 text-center shadow-poster"
            >
              <Trophy className="mx-auto mb-3 h-10 w-10 text-brick" aria-hidden="true" />
              <p className="font-heading text-xl font-bold">Ingen ratede kampe endnu</p>
              <p className="mt-2 text-ink/60">
                Spil casuals i lobbyen eller weekly-turneringen — så ryger du på listen.
              </p>
            </motion.div>
          ) : (
            <motion.ul
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              {players.map((p, i) => (
                <li
                  key={p.gamertag}
                  className={`flex items-center justify-between gap-3 rounded-xl border-2 border-ink px-4 py-3 shadow-poster-sm ${
                    i === 0 ? "bg-brick-soft/40" : "bg-cream"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center font-heading text-lg font-bold">
                      {medals[i] ?? `${i + 1}.`}
                    </span>
                    <div>
                      <p className="font-bold">{p.gamertag}</p>
                      <p className="text-xs font-bold text-ink/60">
                        {p.wins}W / {p.losses}L · {p.matches_played} kampe
                      </p>
                    </div>
                  </div>
                  <p className="font-heading text-xl font-bold text-brick">{p.rating}</p>
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      </section>
    </>
  );
}
