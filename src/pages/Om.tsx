import { motion } from "framer-motion";
import { ArrowRight, FileText, Heart, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

import { CTASection } from "@/components/CTASection";
import { PageHeader } from "@/components/PageHeader";
import { SafeImage } from "@/components/SafeImage";
import { SectionHeader } from "@/components/SectionHeader";
import { Sparkle } from "@/components/Sparkle";
import { Button } from "@/components/ui/button";

const milestones = [
  {
    year: "2022",
    title: "Det hele starter",
    description:
      "En lille gruppe Smash-spillere i Aalborg begynder at mødes ugentligt til casuals og friendlies.",
  },
  {
    year: "2023",
    title: "Første lokale event",
    description:
      "FGC Nord afholder den første større turnering med både Melee og Ultimate på programmet.",
  },
  {
    year: "2024",
    title: "Foreningen stiftes",
    description:
      "FGC Nord bliver en officiel forening med vedtægter, bestyrelse og medlemskab.",
  },
  {
    year: "2025",
    title: "RoA2 joiner familien",
    description:
      "Rivals of Aether 2 bliver en fast del af vores events og community.",
  },
];

const values = [
  {
    title: "Inklusion",
    description:
      "Alle er velkomne uanset niveau. Vi hjælper nye spillere i gang og fejrer personlig fremgang.",
    icon: Heart,
  },
  {
    title: "Fair play",
    description:
      "Vi tror på respektfuld konkurrence. Håndtryk før og efter kampen er obligatorisk.",
    icon: Shield,
  },
  {
    title: "Fællesskab",
    description:
      "Det sociale er lige så vigtigt som spillet. Venskaber opstår naturligt ved setups og på Discord.",
    icon: Users,
  },
];

const board = [
  {
    name: "Anders Kristensen",
    role: "Formand",
    avatar: "/board-avatars/avatar-1.png",
    game: "Ultimate",
  },
  {
    name: "Sofie Lund",
    role: "Næstformand",
    avatar: "/board-avatars/avatar-2.png",
    game: "Melee",
  },
  {
    name: "Marcus Poulsen",
    role: "Kasserer",
    avatar: "/board-avatars/avatar-3.png",
    game: "Melee",
  },
  {
    name: "Emma Nielsen",
    role: "Eventansvarlig",
    avatar: "/board-avatars/avatar-4.png",
    game: "Ultimate",
  },
  {
    name: "Jonas Møller",
    role: "Kommunikation",
    avatar: "/board-avatars/avatar-5.png",
    game: "Rivals 2",
  },
];

export function Om() {
  return (
    <>
      <PageHeader
        eyebrow="Om foreningen"
        title="FGC Nord"
        description="Nordjyllands platform fighter-forening. Drevet af frivillige, drevet af passion for fighting games."
      />

      {/* Mission */}
      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl text-ink sm:text-4xl">
                Vores mission
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-ink/70">
                FGC Nord eksisterer for at skabe et inkluderende miljø for
                platform fighter-spillere i Nordjylland. Vi vil gøre det nemt at
                finde ligesindede, træne, konkurrere og have det sjovt — uanset
                om du spiller Melee, Ultimate eller Rivals of Aether 2.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-ink/70">
                Gennem ugentlige meetups, månedlige turneringer og sociale
                arrangementer bygger vi et community, hvor alle kan udvikle sig
                som spillere og mennesker.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <SafeImage
                src="/community-photo-1.png"
                alt="FGC Nord community"
                className="rounded-2xl border-2 border-ink object-cover shadow-poster-lg"
              />
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl border-2 border-ink bg-brick shadow-poster" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="section-padding bg-olive text-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Historie"
            title="Vores rejse"
            description="Fra en håndfuld venner i en kælder til en officiel forening med events hele året rundt."
            centered
            light
            className="mx-auto"
          />

          <div className="relative mt-12">
            <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-cream/20 sm:left-1/2 sm:-ml-0.5" />
            <div className="space-y-12">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={cn(
                    "relative flex items-start",
                    i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                  )}
                >
                  <div
                    className={cn(
                      "hidden sm:block sm:w-1/2",
                      i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"
                    )}
                  >
                    <h3 className="font-display text-2xl">{milestone.year}</h3>
                    <p className="font-heading font-bold">{milestone.title}</p>
                    <p className="mt-1 text-cream/70">
                      {milestone.description}
                    </p>
                  </div>

                  <div className="absolute left-4 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-cream bg-brick sm:left-1/2">
                    <Sparkle size={14} color="#F7F1E6" />
                  </div>

                  <div className="pl-12 sm:hidden">
                    <h3 className="font-display text-2xl">{milestone.year}</h3>
                    <p className="font-heading font-bold">{milestone.title}</p>
                    <p className="mt-1 text-cream/70">
                      {milestone.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Værdier"
            title="Det vi står for"
            centered
            className="mx-auto"
          />

          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card-poster p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border-2 border-ink bg-cream-dim shadow-poster-sm">
                  <value.icon className="h-5 w-5 text-brick" />
                </div>
                <h3 className="font-heading text-xl font-bold">{value.title}</h3>
                <p className="mt-2 text-ink/70">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Board */}
      <section className="section-padding bg-coal text-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Bestyrelse"
            title="Menneskerne bag FGC Nord"
            description="Vores bestyrelse består af engagerede frivillige, der brænder for communityet."
            centered
            light
            className="mx-auto"
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {board.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-xl border-2 border-cream/10 bg-ink p-6 text-center shadow-poster"
              >
                <SafeImage
                  src={member.avatar}
                  alt={member.name}
                  className="mx-auto h-28 w-28 rounded-full border-4 border-cream/20 object-cover"
                />
                <h3 className="mt-4 font-heading text-lg font-bold">
                  {member.name}
                </h3>
                <p className="text-brick-soft">{member.role}</p>
                <p className="mt-1 text-sm text-cream/60">{member.game}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bylaws & join */}
      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeader
                eyebrow="Vedtægter"
                title="Ordentlighed og transparens"
                description="FGC Nord er en demokratisk forening med vedtægter, årlige generalforsamlinger og transparent økonomi."
              />
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 shrink-0 text-brick" />
                  <p className="text-ink/70">
                    Vedtægterne fastlægger formålet med foreningen, medlemskab,
                    kontingent og bestyrelsens ansvar.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-1 h-5 w-5 shrink-0 text-brick" />
                  <p className="text-ink/70">
                    Generalforsamlingen afholdes én gang årligt og er
                    foreningens øverste myndighed.
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="mt-8 bg-brick text-cream hover:bg-brick-soft"
              >
                <Link to="/bliv-medlem">
                  Bliv medlem
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border-2 border-ink bg-cream-dim p-8 shadow-poster-lg"
            >
              <h3 className="font-display text-2xl">Vil du vide mere?</h3>
              <p className="mt-2 text-ink/70">
                Har du spørgsmål til vedtægter, medlemskab eller
                bestyrelsesarbejde? Tag fat i os på Discord eller til et af
                vores events.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-6 border-2 border-ink"
              >
                <a
                  href="https://discord.gg/fgcnord"
                  target="_blank"
                  rel="noreferrer"
                >
                  Kontakt os på Discord
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
