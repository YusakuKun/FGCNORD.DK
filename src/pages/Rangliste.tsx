import { motion } from "framer-motion";
import { Swords, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/PageHeader";
import { getLeaderboard, type LeaderboardRow } from "@/lib/lobbyApi";

const GAMES = [
  { value: "ultimate", label: "Ultimate" },
  { value: "melee", label: "Melee" },
  { value: "roa2", label: "Rivals of Aether 2" },
];

const medals = ["🥇", "🥈", "🥉"];

function avatarUrl(p: LeaderboardRow): string | null {
  return p.discord_id && p.discord_avatar
    ? `https://cdn.discordapp.com/avatars/${p.discord_id}/${p.discord_avatar}.png?size=128`
    : null;
}

function PlayerAvatar({
  p,
  className,
}: {
  p: LeaderboardRow;
  className: string;
}) {
  const url = avatarUrl(p);
  if (url) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        className={`${className} rounded-full border-2 border-ink object-cover`}
      />
    );
  }
  return (
    <div
      className={`${className} flex items-center justify-center rounded-full border-2 border-ink bg-coal font-heading font-bold text-brick-soft`}
      aria-hidden="true"
    >
      {p.gamertag.charAt(0).toUpperCase()}
    </div>
  );
}

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
              <div className="mt-5">
                <Link
                  to="/lobby"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-brick px-5 py-2 text-sm font-bold uppercase tracking-wide text-coal shadow-poster-sm transition-all hover:-translate-y-0.5 hover:bg-brick-soft"
                >
                  <Swords className="h-4 w-4" aria-hidden="true" /> Gå til lobbyen
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Top 3 — podium (vinderen i midten) */}
              {players.length >= 2 && (
                <div className="mb-8 grid grid-cols-3 items-end gap-3">
                  {[players[1], players[0], players[2]]
                    .filter(Boolean)
                    .map((p) => {
                      const rank = players.indexOf(p);
                      const isFirst = rank === 0;
                      return (
                        <div
                          key={p.gamertag}
                          className={`flex flex-col items-center rounded-2xl border-[3px] border-ink text-center shadow-poster ${
                            isFirst
                              ? "bg-coal px-3 pb-6 pt-8 text-cream"
                              : "bg-cream-dim px-3 pb-5 pt-6"
                          }`}
                        >
                          <span className="mb-2 text-2xl" aria-hidden="true">
                            {medals[rank]}
                          </span>
                          <PlayerAvatar
                            p={p}
                            className={isFirst ? "h-16 w-16 text-2xl" : "h-12 w-12 text-lg"}
                          />
                          <p
                            className={`mt-2 max-w-full truncate font-heading font-bold ${
                              isFirst ? "text-lg" : "text-sm"
                            }`}
                          >
                            {p.gamertag}
                          </p>
                          <p
                            className={`font-heading font-extrabold ${
                              isFirst ? "text-3xl text-brick-soft" : "text-xl text-brick"
                            }`}
                          >
                            {p.rating}
                          </p>
                          <p
                            className={`mt-1 text-xs font-bold ${
                              isFirst ? "text-cream/60" : "text-ink/60"
                            }`}
                          >
                            {p.wins}W / {p.losses}L
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Resten af listen */}
              <ul className="space-y-2">
                {(players.length >= 2 ? players.slice(3) : players).map((p) => {
                  const rank = players.indexOf(p);
                  return (
                    <li
                      key={p.gamertag}
                      className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink bg-cream px-4 py-3 shadow-poster-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-center font-heading text-lg font-bold">
                          {medals[rank] ?? `${rank + 1}.`}
                        </span>
                        <PlayerAvatar p={p} className="h-9 w-9 text-sm" />
                        <div>
                          <p className="font-bold">{p.gamertag}</p>
                          <p className="text-xs font-bold text-ink/60">
                            {p.wins}W / {p.losses}L · {p.matches_played} kampe
                          </p>
                        </div>
                      </div>
                      <p className="font-heading text-xl font-bold text-brick">{p.rating}</p>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
