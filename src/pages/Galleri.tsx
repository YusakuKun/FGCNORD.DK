import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";

interface Photo {
  src: string;
  alt: string;
  caption: string;
}

const PHOTOS: Photo[] = [
  {
    src: "/gallery/himmerlan-05.jpg",
    alt: "Crewet samlet på trappen i venue under HimmerLAN",
    caption: "Crewet · HimmerLAN",
  },
  {
    src: "/gallery/himmerlan-01.jpg",
    alt: "Overblik over venue med setups, borde og stort lærred",
    caption: "Venue-oversigt · HimmerLAN",
  },
  {
    src: "/gallery/himmerlan-10.jpg",
    alt: "Rivals of Aether-kamp på skærmen: Zetterburn mod Maypul",
    caption: "Rivals of Aether · HimmerLAN",
  },
  {
    src: "/gallery/himmerlan-08.jpg",
    alt: "Spillere foran setups med skærme og controllere",
    caption: "Casuals ved setuppene",
  },
  {
    src: "/gallery/himmerlan-06.jpg",
    alt: "Medlem med Toad-hue i venue",
    caption: "Stemning · HimmerLAN",
  },
  {
    src: "/gallery/himmerlan-04.jpg",
    alt: "Wii Sports på skærmen med Mii-figuren Aaron",
    caption: "Side-event · Wii Sports",
  },
  {
    src: "/gallery/himmerlan-02.jpg",
    alt: "Medlem holder farverige kasser i trappeanlægget",
    caption: "Stemning · HimmerLAN",
  },
  {
    src: "/gallery/himmerlan-11.jpg",
    alt: "To medlemmer griner sammen på gaden om natten til afterparty",
    caption: "Afterparty i byen",
  },
  {
    src: "/gallery/himmerlan-07.jpg",
    alt: "To medlemmer sidder og snakker til afterparty",
    caption: "Afterparty",
  },
  {
    src: "/gallery/himmerlan-03.jpg",
    alt: "Medlem drikker en øl til afterparty",
    caption: "Afterparty",
  },
  {
    src: "/gallery/himmerlan-09.jpg",
    alt: "Håndtegnet øl-label med portræt ved siden af originalfotoet på en telefon",
    caption: "Afterparty-kunst",
  },
];

export default function Galleri() {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((cur) => (cur === null ? cur : (cur + dir + PHOTOS.length) % PHOTOS.length)),
    [],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  return (
    <>
      <PageHeader
        eyebrow="Galleri"
        title="Stemninger fra fællesskabet"
        description="Billeder fra HimmerLAN, afterparties og vores ugentlige meetups. Klik på et billede for at se det i fuld størrelse."
      />

      <section className="section-padding bg-cream text-ink">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
            {PHOTOS.map((photo, i) => (
              <motion.figure
                key={photo.src}
                initial={{ opacity: 0, y: 40, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (i % 3) * 0.08 }}
                className="break-inside-avoid"
              >
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="block w-full cursor-zoom-in overflow-hidden rounded-2xl border-[3px] border-ink shadow-poster-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-poster"
                  aria-label={`Åbn billedet: ${photo.caption}`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    className="w-full transition-transform duration-500 hover:scale-105"
                  />
                </button>
                <figcaption className="mt-2.5 px-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-olive">
                  {photo.caption}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={PHOTOS[open].caption}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 rounded-full border-2 border-cream/40 bg-coal p-2 text-cream transition-colors hover:bg-brick hover:text-coal"
              aria-label="Luk"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-cream/40 bg-coal p-2.5 text-cream transition-colors hover:bg-brick hover:text-coal sm:left-6"
              aria-label="Forrige billede"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <motion.figure
              key={PHOTOS[open].src}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-h-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={PHOTOS[open].src}
                alt={PHOTOS[open].alt}
                className="max-h-[80vh] w-auto rounded-xl border-[3px] border-cream object-contain shadow-poster-lg"
              />
              <figcaption className="mt-3 text-center font-heading text-sm font-bold uppercase tracking-widest text-cream/80">
                {PHOTOS[open].caption} · {open + 1}/{PHOTOS.length}
              </figcaption>
            </motion.figure>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border-2 border-cream/40 bg-coal p-2.5 text-cream transition-colors hover:bg-brick hover:text-coal sm:right-6"
              aria-label="Næste billede"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
