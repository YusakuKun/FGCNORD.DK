import { motion, AnimatePresence } from "framer-motion";
import { Crown, RotateCcw, Share2, Swords, Trophy } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { GameType, Player, Stage, StageState } from "@/types";

const ULTIMATE_STAGES: Stage[] = [
  { id: "bf", name: "Battlefield", image: "/stage-thumbs/battlefield.png" },
  { id: "fd", name: "Final Destination", image: "/stage-thumbs/fd.png" },
  { id: "sv", name: "Smashville", image: "/stage-thumbs/smashville.png" },
  { id: "tc", name: "Town & City", image: "/stage-thumbs/towncity.png" },
  { id: "ps2", name: "Pokémon Stadium 2", image: "/stage-thumbs/ps2.png" },
  { id: "kalos", name: "Kalos Pokémon League", image: "/stage-thumbs/kalos.png" },
  { id: "lylat", name: "Lylat Cruise", image: "/stage-thumbs/lylat.png" },
  { id: "yoshi", name: "Yoshi's Story", image: "/stage-thumbs/yoshi.png" },
];

const MELEE_STAGES: Stage[] = [
  { id: "bf", name: "Battlefield", image: "/melee-thumbs/battlefield.png" },
  { id: "fd", name: "Final Destination", image: "/melee-thumbs/fd.png" },
  { id: "ystory", name: "Yoshi's Story", image: "/melee-thumbs/ystory.png" },
  { id: "fountain", name: "Fountain of Dreams", image: "/melee-thumbs/fountain.png" },
  { id: "dreamland", name: "Dream Land", image: "/melee-thumbs/dreamland.png" },
  { id: "pokemon", name: "Pokémon Stadium", image: "/melee-thumbs/pokemon.png" },
];

const GAME_CONFIG = {
  ultimate: { stages: ULTIMATE_STAGES, cpStrikes: 3, label: "Ultimate" },
  melee: { stages: MELEE_STAGES, cpStrikes: 1, label: "Melee" },
};

type StrikeStep =
  | "select-first"
  | "game1-strike-p1"
  | "game1-strike-p2"
  | "game1-strike-p1-2"
  | "report-winner"
  | "winner-strike"
  | "loser-pick"
  | "game-over";

export function StageStrike() {
  const [game, setGame] = useState<GameType>("ultimate");
  const [players, setPlayers] = useState<Player[]>([
    { name: "Spiller 1", score: 0, stageWins: [] },
    { name: "Spiller 2", score: 0, stageWins: [] },
  ]);
  const [step, setStep] = useState<StrikeStep>("select-first");
  const [currentStriker, setCurrentStriker] = useState<0 | 1 | null>(null);
  const [lastWinner, setLastWinner] = useState<0 | 1 | null>(null);
  const [stageStates, setStageStates] = useState<Record<string, StageState>>({});
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [strikeCount, setStrikeCount] = useState(0);
  const [currentGame, setCurrentGame] = useState(1);
  const [log, setLog] = useState<string[]>(["Vælg hvem der striker først."]);

  const config = GAME_CONFIG[game];
  const stages = config.stages;

  const reset = (keepGame = true) => {
    setPlayers([
      { name: "Spiller 1", score: 0, stageWins: [] },
      { name: "Spiller 2", score: 0, stageWins: [] },
    ]);
    setStep("select-first");
    setCurrentStriker(null);
    setLastWinner(null);
    setStageStates({});
    setSelectedStage(null);
    setStrikeCount(0);
    setCurrentGame(1);
    setLog(["Vælg hvem der striker først."]);
    if (!keepGame) setGame("ultimate");
  };

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  const handleSelectFirst = (index: 0 | 1) => {
    setCurrentStriker(index);
    setStep("game1-strike-p1");
    addLog(`${players[index].name} striker først. Vælg 1 stage at fjerne.`);
  };

  const handleStageClick = (stageId: string) => {
    if (step === "game-over") return;

    if (step.includes("strike")) {
      if (stageStates[stageId]) return;
      setStageStates((prev) => ({ ...prev, [stageId]: "striked" }));
      processStrike(stageId);
    } else if (step === "winner-strike") {
      if (stageStates[stageId]) return;
      setStageStates((prev) => ({ ...prev, [stageId]: "banned" }));
      processWinnerStrike(stageId);
    } else if (step === "loser-pick") {
      if (
        stageStates[stageId] === "striked" ||
        stageStates[stageId] === "banned"
      )
        return;
      if (
        lastWinner !== null &&
        players[lastWinner].stageWins.includes(stageId)
      ) {
        return; // DSR forbudt
      }
      setSelectedStage(stageId);
    }
  };

  const processStrike = (stageId: string) => {
    const strikerName = players[currentStriker as 0 | 1].name;

    if (step === "game1-strike-p1") {
      setStep("game1-strike-p2");
      setStrikeCount(1);
      addLog(
        `${strikerName} fjernede ${getStageName(stageId)}. Nu skal modstanderen fjerne 2 stages.`
      );
    } else if (step === "game1-strike-p2") {
      if (strikeCount === 1) {
        setStrikeCount(2);
        addLog(`${strikerName} fjernede ${getStageName(stageId)}. Vælg endnu en.`);
      } else {
        const nextStriker = currentStriker === 0 ? 1 : 0;
        setCurrentStriker(nextStriker);
        setStep("game1-strike-p1-2");
        setStrikeCount(0);
        addLog(
          `${strikerName} fjernede ${getStageName(stageId)}. ${players[nextStriker].name} fjerner den sidste stage.`
        );
      }
    } else if (step === "game1-strike-p1-2") {
      setStep("loser-pick");
      setSelectedStage(null);
      addLog(
        `${strikerName} fjernede ${getStageName(stageId)}. Vælg nu startstage ved at klikke på en af de resterende.`
      );
    }
  };

  const processWinnerStrike = (stageId: string) => {
    const winnerName = players[lastWinner as 0 | 1].name;
    const count =
      Object.values(stageStates).filter((s) => s === "banned").length + 1;

    if (count >= config.cpStrikes) {
      setStep("loser-pick");
      addLog(
        `${winnerName} bannede ${getStageName(stageId)}. ${players[getOtherPlayer(lastWinner as 0 | 1)].name} vælger stage.`
      );
    } else {
      addLog(
        `${winnerName} bannede ${getStageName(stageId)} (${count}/${config.cpStrikes}).`
      );
    }
  };

  const confirmLoserPick = () => {
    if (!selectedStage) return;
    const loserIndex = getOtherPlayer(lastWinner as 0 | 1);
    setStageStates((prev) => ({ ...prev, [selectedStage]: "picked" }));
    setStep("report-winner");
    addLog(
      `${players[loserIndex].name} valgte ${getStageName(selectedStage)}. Rapporter hvem der vandt.`
    );
  };

  const handleReportWinner = (winner: 0 | 1) => {
    const loser = getOtherPlayer(winner);
    const pickedStage = selectedStage || "";

    const newPlayers = [...players];
    newPlayers[winner].score += 1;
    newPlayers[winner].stageWins.push(pickedStage);
    setPlayers(newPlayers);
    setLastWinner(winner);

    if (newPlayers[winner].score >= 2) {
      setStep("game-over");
      addLog(`${newPlayers[winner].name} vandt kampen! Tillykke!`);
      return;
    }

    setCurrentGame((g) => g + 1);
    setStageStates({});
    setSelectedStage(null);
    setStrikeCount(0);
    setCurrentStriker(loser);
    setStep("winner-strike");
    addLog(
      `${newPlayers[winner].name} vandt Game ${currentGame}. Vinderen banner ${config.cpStrikes} stage(s).`
    );
  };

  const getStageName = (id: string) => {
    return stages.find((s) => s.id === id)?.name || id;
  };

  const getOtherPlayer = (index: 0 | 1): 0 | 1 => (index === 0 ? 1 : 0);

  const canSelectStage = (stageId: string) => {
    if (step === "game-over") return false;
    if (step.includes("strike") || step === "winner-strike") {
      return !stageStates[stageId];
    }
    if (step === "loser-pick") {
      if (
        stageStates[stageId] === "striked" ||
        stageStates[stageId] === "banned"
      )
        return false;
      if (
        lastWinner !== null &&
        players[lastWinner].stageWins.includes(stageId)
      )
        return false;
      return true;
    }
    return false;
  };

  const statusText = () => {
    switch (step) {
      case "select-first":
        return "Vælg hvem der striker først";
      case "game1-strike-p1":
        return `${players[currentStriker as 0 | 1].name} fjerner 1 stage`;
      case "game1-strike-p2":
        return `${players[currentStriker as 0 | 1].name} fjerner 2 stages`;
      case "game1-strike-p1-2":
        return `${players[currentStriker as 0 | 1].name} fjerner 1 stage`;
      case "loser-pick":
        return `${players[getOtherPlayer(lastWinner as 0 | 1)].name} vælger stage`;
      case "winner-strike":
        return `${players[lastWinner as 0 | 1].name} banner ${config.cpStrikes} stage(s)`;
      case "report-winner":
        return "Rapporter vinderen";
      case "game-over":
        return `${players.find((p) => p.score >= 2)?.name} vandt!`;
      default:
        return "";
    }
  };

  const shareResult = () => {
    const winner = players.find((p) => p.score >= 2);
    if (!winner) return;
    const text = `${winner.name} vandt i ${config.label} Stage Strike!\n\n${players[0].name}: ${players[0].score} - ${players[1].name}: ${players[1].score}`;
    navigator.clipboard.writeText(text).then(() => {
      addLog("Resultat kopieret til udklipsholder.");
    });
  };

  return (
    <div className="min-h-screen bg-cream pb-20">
      <PageHeader
        eyebrow="Værktøj"
        title="Stage Strike"
        description="Følg DSR-reglerne og strike-flowet for Smash Ultimate og Melee. Vælg spil, spillernavne og lad værktøjet guide jer."
      />

      <div className="container-site px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main area */}
          <div>
            {/* Game selector */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2 rounded-xl border-2 border-ink bg-cream-dim p-1.5 shadow-poster-sm">
                {(["ultimate", "melee"] as GameType[]).map((g) => (
                  <Button
                    key={g}
                    variant={game === g ? "default" : "ghost"}
                    onClick={() => {
                      setGame(g);
                      reset(false);
                    }}
                    className={cn(
                      game === g && "bg-brick text-cream hover:bg-brick-soft"
                    )}
                  >
                    {GAME_CONFIG[g].label}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => reset(true)}
                className="border-2 border-ink"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Nulstil
              </Button>
            </div>

            {/* Players */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {players.map((player, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border-2 border-ink bg-cream p-4 shadow-poster transition-all",
                    (currentStriker === i || lastWinner === i) &&
                      step !== "game-over" &&
                      "ring-2 ring-brick ring-offset-2 ring-offset-cream"
                  )}
                >
                  <Input
                    value={player.name}
                    onChange={(e) => {
                      const newPlayers = [...players];
                      newPlayers[i].name = e.target.value;
                      setPlayers(newPlayers);
                    }}
                    className="mb-2 border-2 border-ink bg-cream-dim font-heading text-lg font-bold"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink/60">Score</span>
                    <span className="font-display text-3xl">{player.score}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Status banner */}
            <div className="mb-6 rounded-xl border-2 border-ink bg-olive p-4 text-cream shadow-poster">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading text-lg font-bold">{statusText()}</p>
                  <p className="text-sm text-cream/70">
                    Game {currentGame} · {GAME_CONFIG[game].label}
                  </p>
                </div>
                {step === "game-over" && (
                  <Trophy className="h-8 w-8 text-brick-soft" />
                )}
              </div>
            </div>

            {/* First striker selection */}
            <AnimatePresence mode="wait">
              {step === "select-first" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 grid gap-3 sm:grid-cols-2"
                >
                  <Button size="lg" onClick={() => handleSelectFirst(0)}>
                    {players[0].name} striker først
                  </Button>
                  <Button size="lg" onClick={() => handleSelectFirst(1)}>
                    {players[1].name} striker først
                  </Button>
                </motion.div>
              )}

              {/* Winner report */}
              {step === "report-winner" && selectedStage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 grid gap-3 sm:grid-cols-2"
                >
                  <Button
                    size="lg"
                    className="bg-brick text-cream hover:bg-brick-soft"
                    onClick={() => handleReportWinner(0)}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    {players[0].name} vandt
                  </Button>
                  <Button
                    size="lg"
                    className="bg-brick text-cream hover:bg-brick-soft"
                    onClick={() => handleReportWinner(1)}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    {players[1].name} vandt
                  </Button>
                </motion.div>
              )}

              {/* Loser pick confirm */}
              {step === "loser-pick" && selectedStage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6"
                >
                  <Button
                    size="lg"
                    className="w-full bg-brick text-cream hover:bg-brick-soft"
                    onClick={confirmLoserPick}
                  >
                    <Swords className="mr-2 h-4 w-4" />
                    Bekræft valg: {getStageName(selectedStage)}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Game over summary */}
            <AnimatePresence>
              {step === "game-over" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-6 rounded-xl border-2 border-ink bg-cream-dim p-6 shadow-poster"
                >
                  <h3 className="font-display text-2xl">
                    {players.find((p) => p.score >= 2)?.name} vinder!
                  </h3>
                  <p className="mt-1 text-ink/70">
                    Slutresultat: {players[0].name} {players[0].score} -{" "}
                    {players[1].score} {players[1].name}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-ink"
                    onClick={shareResult}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Kopier resultat
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stage grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {stages.map((stage) => {
                const state = stageStates[stage.id];
                const isSelected = selectedStage === stage.id;
                const clickable = canSelectStage(stage.id);

                return (
                  <motion.button
                    key={stage.id}
                    whileHover={clickable ? { scale: 0.97 } : {}}
                    whileTap={clickable ? { scale: 0.95 } : {}}
                    onClick={() => handleStageClick(stage.id)}
                    disabled={!clickable}
                    className={cn(
                      "relative aspect-video overflow-hidden rounded-xl border-2 border-ink text-left shadow-poster transition-all",
                      state === "striked" && "grayscale opacity-50",
                      state === "banned" && "grayscale opacity-40",
                      (state === "picked" || isSelected) &&
                        "ring-4 ring-brick ring-offset-2 ring-offset-cream",
                      !clickable &&
                        !state &&
                        !isSelected &&
                        "cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cream-dim to-cream" />
                    <div className="relative flex h-full flex-col justify-between p-3">
                      <span className="font-heading text-sm font-bold leading-tight text-ink sm:text-base">
                        {stage.name}
                      </span>
                      {state === "striked" && (
                        <Badge variant="secondary" className="w-fit">
                          Fjernet
                        </Badge>
                      )}
                      {state === "banned" && (
                        <Badge variant="coal" className="w-fit">
                          Banned
                        </Badge>
                      )}
                      {state === "picked" && (
                        <Badge variant="default" className="w-fit">
                          Valgt
                        </Badge>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-xl border-2 border-ink bg-cream p-5 shadow-poster">
              <h3 className="mb-4 font-heading text-lg font-bold">Trin-for-trin</h3>
              <ol className="space-y-3 text-sm">
                <StepItem active={step === "select-first"} step={1}>
                  Vælg hvem der striker først
                </StepItem>
                <StepItem
                  active={step.startsWith("game1-strike")}
                  step={2}
                >
                  Game 1: Strike 1-2-1
                </StepItem>
                <StepItem
                  active={step === "loser-pick" && currentGame === 1}
                  step={3}
                >
                  Taber vælger startstage
                </StepItem>
                <StepItem active={step === "report-winner"} step={4}>
                  Rapporter vinder
                </StepItem>
                <StepItem active={step === "winner-strike"} step={5}>
                  Vinder banner {config.cpStrikes} CP stage(s)
                </StepItem>
                <StepItem
                  active={step === "loser-pick" && currentGame > 1}
                  step={6}
                >
                  Taber vælger (DSR forbudt)
                </StepItem>
              </ol>
            </div>

            <div className="rounded-xl border-2 border-ink bg-cream p-5 shadow-poster">
              <h3 className="mb-4 font-heading text-lg font-bold">DSR tracking</h3>
              <div className="space-y-4 text-sm">
                {players.map((player, i) => (
                  <div key={i}>
                    <p className="font-semibold">{player.name}</p>
                    {player.stageWins.length === 0 ? (
                      <p className="text-ink/50">Ingen stage-sejre endnu</p>
                    ) : (
                      <ul className="mt-1 list-disc pl-4 text-ink/70">
                        {player.stageWins.map((stageId, idx) => (
                          <li key={idx}>{getStageName(stageId)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border-2 border-ink bg-coal p-5 text-cream shadow-poster">
              <h3 className="mb-2 font-heading text-lg font-bold">Log</h3>
              <div className="max-h-64 space-y-2 overflow-y-auto text-xs text-cream/70">
                {log.map((entry, i) => (
                  <p key={i}>• {entry}</p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function StepItem({
  active,
  step,
  children,
}: {
  active: boolean;
  step: number;
  children: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex gap-2",
        active && "font-bold text-brick"
      )}
    >
      <span className="font-display">{step}.</span>
      {children}
    </li>
  );
}
