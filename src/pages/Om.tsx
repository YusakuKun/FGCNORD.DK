import { motion } from "framer-motion";
import {
  ArrowRight,
  AtSign,
  FileText,
  Heart,
  Mail,
  MessageCircle,
  Shield,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

import { CTASection } from "@/components/CTASection";
import { DiscordIcon } from "@/components/Navbar";
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
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream-dim px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-poster-sm">
                <Sparkle size={12} />
                Vores mission
              </span>
              <h2 className="mt-5 font-display text-3xl leading-[1.1] text-ink sm:text-4xl lg:text-5xl">
                Et inkluderende hjem for platform fighters
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-olive">
                FGC Nord eksisterer for at skabe et inkluderende miljø for
                platform fighter-spillere i Nordjylland. Vi vil gøre det nemt at
                finde ligesindede, træne, konkurrere og have det sjovt — uanset
                om du spiller Melee, Ultimate eller Rivals of Aether 2.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-olive">
                Gennem ugentlige meetups, månedlige turneringer og sociale
                arrangementer bygger vi et community, hvor alle kan udvikle sig
                som spillere og mennesker.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto w-full max-w-md lg:max-w-none"
            >
              <div className="relative">
                <SafeImage
                  src="/community-photo-1.png"
                  alt="FGC Nord community"
                  className="aspect-[4/3] w-full rounded-2xl border-[3px] border-ink object-cover shadow-poster-lg"
                />
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl border-[3px] border-ink bg-brick shadow-poster" />
                <div className="absolute -left-4 -top-4 -z-10 h-full w-full rounded-2xl border-[3px] border-ink bg-cream-dim shadow-poster" />
                <div className="absolute -bottom-5 left-6 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-1.5 text-sm font-bold uppercase tracking-wider shadow-poster-sm">
                  <Sparkle size={14} color="#A84434" />
                  Est. 2022
                </div>
              </div>
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

          <div className="relative mt-4">
            <div className="absolute bottom-0 left-4 top-0 w-1 rounded-full bg-cream/15 sm:left-1/2 sm:-ml-0.5" />
            <div className="space-y-10 sm:space-y-14">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
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
                    <div
                      className={cn(
                        "inline-block rounded-xl border-[3px] border-ink bg-cream p-5 text-left shadow-poster transition-all duration-200 hover:-translate-y-1 hover:shadow-poster-lg",
                        i % 2 === 0 ? "sm:text-right" : ""
                      )}
                    >
                      <span className="inline-block rounded-full border-2 border-ink bg-brick px-3 py-1 text-sm font-bold text-cream shadow-poster-sm">
                        {milestone.year}
                      </span>
                      <h3 className="mt-3 font-heading text-xl font-bold text-ink">
                        {milestone.title}
                      </h3>
                      <p className="mt-1 text-ink/70">
                        {milestone.description}
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-4 top-2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-cream bg-brick shadow-poster sm:left-1/2">
                    <Sparkle size={18} color="#F7F1E6" />
                  </div>

                  <div className="pl-12 sm:hidden">
                    <div className="rounded-xl border-[3px] border-ink bg-cream p-5 shadow-poster">
                      <span className="inline-block rounded-full border-2 border-ink bg-brick px-3 py-1 text-sm font-bold text-cream shadow-poster-sm">
                        {milestone.year}
                      </span>
                      <h3 className="mt-3 font-heading text-xl font-bold text-ink">
                        {milestone.title}
                      </h3>
                      <p className="mt-1 text-ink/70">
                        {milestone.description}
                      </p>
                    </div>
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
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="card-poster-interactive group relative overflow-hidden p-6"
              >
                <div className="absolute -right-4 -top-4 text-cream-dim/60 transition-transform duration-300 group-hover:rotate-12">
                  <Sparkle size={80} color="#EFE6D5" />
                </div>
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-ink bg-brick shadow-poster-sm transition-transform duration-300 group-hover:scale-110">
                    <value.icon className="h-6 w-6 text-cream" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-ink">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-ink/70">{value.description}</p>
                </div>
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
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: i * 0.1,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative overflow-hidden rounded-xl border-[3px] border-cream/10 bg-ink p-6 text-center shadow-poster transition-all duration-200 hover:-translate-y-1 hover:border-cream/25 hover:shadow-poster-lg"
              >
                <div className="absolute -right-6 -top-6 text-cream/5 transition-transform duration-300 group-hover:rotate-12">
                  <Sparkle size={100} color="#F7F1E6" />
                </div>
                <div className="relative">
                  <div className="mx-auto w-fit">
                    <SafeImage
                      src={member.avatar}
                      alt={member.name}
                      className="h-36 w-36 rounded-full border-[4px] border-cream/20 object-cover shadow-poster transition-all duration-300 group-hover:border-cream/40 group-hover:shadow-poster-lg"
                    />
                  </div>
                  <h3 className="mt-5 font-heading text-lg font-bold">
                    {member.name}
                  </h3>
                  <p className="mt-1 inline-block rounded-full bg-brick px-3 py-0.5 text-sm font-semibold text-cream">
                    {member.role}
                  </p>
                  <p className="mt-2 text-sm text-cream/60">
                    Spiller: {member.game}
                  </p>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <a
                      href="mailto:kontakt@fgcnord.dk"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream/20 text-cream/70 transition-all duration-200 hover:border-cream/40 hover:bg-cream hover:text-ink"
                      aria-label={`Send mail til ${member.name}`}
                    >
                      <Mail size={16} />
                    </a>
                    <a
                      href="https://discord.gg/fgcnord"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream/20 text-cream/70 transition-all duration-200 hover:border-cream/40 hover:bg-cream hover:text-ink"
                      aria-label={`Kontakt ${member.name} på Discord`}
                    >
                      <DiscordIcon size={16} />
                    </a>
                    <a
                      href="#"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream/20 text-cream/70 transition-all duration-200 hover:border-cream/40 hover:bg-cream hover:text-ink"
                      aria-label={`Sociale medier for ${member.name}`}
                    >
                      <AtSign size={16} />
                    </a>
                    <a
                      href="#"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream/20 text-cream/70 transition-all duration-200 hover:border-cream/40 hover:bg-cream hover:text-ink"
                      aria-label={`Send besked til ${member.name}`}
                    >
                      <MessageCircle size={16} />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bylaws & join */}
      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <SectionHeader
                eyebrow="Vedtægter"
                title="Ordentlighed og transparens"
                description="FGC Nord er en demokratisk forening med vedtægter, årlige generalforsamlinger og transparent økonomi."
              />
              <div className="mt-6 grid gap-4">
                <div className="card-poster-interactive flex items-start gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-brick shadow-poster-sm">
                    <FileText className="h-5 w-5 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-ink">
                      Vedtægter
                    </h3>
                    <p className="mt-1 text-ink/70">
                      Vedtægterne fastlægger formålet med foreningen, medlemskab,
                      kontingent og bestyrelsens ansvar.
                    </p>
                  </div>
                </div>
                <div className="card-poster-interactive flex items-start gap-4 p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-brick shadow-poster-sm">
                    <Users className="h-5 w-5 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-ink">
                      Generalforsamling
                    </h3>
                    <p className="mt-1 text-ink/70">
                      Generalforsamlingen afholdes én gang årligt og er
                      foreningens øverste myndighed.
                    </p>
                  </div>
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative rounded-2xl border-[3px] border-ink bg-cream-dim p-8 shadow-poster-lg sm:p-10">
                <div className="absolute -right-3 -top-3 -z-10 h-full w-full rounded-2xl border-[3px] border-ink bg-brick shadow-poster" />
                <Sparkle
                  size={40}
                  className="mb-4 text-brick"
                />
                <h3 className="font-display text-2xl text-ink sm:text-3xl">
                  Vil du vide mere?
                </h3>
                <p className="mt-2 text-ink/70">
                  Har du spørgsmål til vedtægter, medlemskab eller
                  bestyrelsesarbejde? Tag fat i os på Discord eller til et af
                  vores events.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-6 border-2 border-ink hover:bg-ink hover:text-cream"
                >
                  <a
                    href="https://discord.gg/fgcnord"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Kontakt os på Discord
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
