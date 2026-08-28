import type { FgcEvent } from "@/types";

export const gameLabels: Record<string, string> = {
  melee: "Melee",
  ultimate: "Ultimate",
  roa2: "Rivals 2",
  all: "Alle spil",
};

/** Spil-specifikke chip-farver (baggrund + kant i spillets signalfarve, mørk tekst) */
export const gameChipClasses: Record<string, string> = {
  melee: "bg-[#E57373]/20 border-[#E57373] text-ink",
  ultimate: "bg-[#00AEEF]/20 border-[#00AEEF] text-ink",
  roa2: "bg-[#34D399]/20 border-[#34D399] text-ink",
  all: "bg-[#F2C14E]/25 border-[#F2C14E] text-ink",
};

/** Prik-farve brugt i fx countdown og filterchips */
export const gameDotColors: Record<string, string> = {
  melee: "#E57373",
  ultimate: "#00AEEF",
  roa2: "#34D399",
  all: "#F2C14E",
};

export function isPastEvent(event: FgcEvent, now: Date = new Date()): boolean {
  const end = event.endDate ? new Date(event.endDate) : new Date(event.date);
  return end < now;
}
