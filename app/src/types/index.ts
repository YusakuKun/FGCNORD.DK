export interface FgcEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  description?: string;
  location?: string;
  game?: "melee" | "ultimate" | "roa2" | "all";
  format?: "offline" | "online";
  url?: string;
  image?: string;
  attendees?: number;
  maxAttendees?: number;
  startggUrl?: string;
}

export interface Stage {
  id: string;
  name: string;
  image: string;
}

export interface Player {
  name: string;
  score: number;
  stageWins: string[];
}

export type StageState = "idle" | "striked" | "banned" | "picked" | "inactive";

export type GameType = "ultimate" | "melee";

export type StrikeStep =
  | "select-first"
  | "game1-strike-p1"
  | "game1-strike-p2"
  | "game1-strike-p1-2"
  | "report-winner"
  | "winner-strike"
  | "loser-pick"
  | "game-over";
