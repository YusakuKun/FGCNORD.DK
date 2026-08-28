import { motion } from "framer-motion";
import { Swords } from "lucide-react";

import { SafeImage } from "@/components/SafeImage";
import { Button } from "@/components/ui/button";
import type { Stage } from "@/types";

interface RevealOverlayProps {
  stage: Stage;
  gameNumber: number;
  canReselect: boolean; // true når taberen selv valgte (game 2+)
  onConfirm: () => void;
  onReselect?: () => void;
}

export function RevealOverlay({
  stage,
  gameNumber,
  canReselect,
  onConfirm,
  onReselect,
}: RevealOverlayProps) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Game ${gameNumber} spilles på ${stage.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.6, rotateY: 70, opacity: 0 }}
        animate={{ scale: 1, rotateY: 0, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-brick bg-coal shadow-[0_0_60px_rgba(0,174,239,0.5)]"
      >
        <div className="relative aspect-video">
          {stage.image ? (
            <SafeImage
              src={stage.image}
              alt={`${stage.name} stage`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-coal via-[#123a6b] to-brick/50"
            />
          )}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-coal via-transparent to-transparent"
          />
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="absolute inset-x-0 bottom-3 text-center font-heading text-sm font-bold uppercase tracking-[0.3em] text-brick-soft"
          >
            Game {gameNumber} spilles på
          </motion.p>
        </div>
        <div className="p-6 text-center">
          <motion.h2
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 16 }}
            className="font-display text-3xl text-cream sm:text-4xl"
          >
            {stage.name}
          </motion.h2>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={onConfirm}
              className="bg-brick font-bold text-coal hover:bg-brick-soft"
              autoFocus
            >
              <Swords className="mr-2 h-5 w-5" aria-hidden="true" />
              Start kamp
            </Button>
            {canReselect && onReselect && (
              <Button
                size="lg"
                variant="outline"
                onClick={onReselect}
                className="border-cream/30 text-cream hover:bg-cream/10"
              >
                Vælg en anden stage
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
