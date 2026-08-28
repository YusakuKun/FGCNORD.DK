import { SignInButton, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle,
  CreditCard,
  Crown,
  Loader2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { CTASection } from "@/components/CTASection";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeader } from "@/components/SectionHeader";
import {
  Accordion,
  AccordionItem,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isClerkConfigured } from "@/lib/clerk";

const tiers = [
  {
    name: "Støttemedlem",
    price: "50",
    period: "kr. / år",
    description:
      "For dem der vil støtte foreningen uden at deltage aktivt.",
    features: [
      "Støtter communityet",
      "Nyhedsbrev",
      "Stemmeret på generalforsamlingen",
    ],
    highlighted: false,
  },
  {
    name: "Aktivt medlem",
    price: "150",
    period: "kr. / år",
    description:
      "For spillere der vil deltage i events og turneringer.",
    features: [
      "Alt fra Støttemedlem",
      "Rabat på turneringsdeltagelse",
      "Adgang til medlemsexclusives",
      "Stemmeret på generalforsamlingen",
    ],
    highlighted: true,
  },
];

const faqs = [
  {
    q: "Hvad får jeg som medlem?",
    a: "Afhængigt af medlemskab får du stemmeret, rabat på turneringer, adgang til medlemsevents og vores nyhedsbrev.",
  },
  {
    q: "Skal jeg være god til spillet?",
    a: "Slet ikke! Vi har medlemmer på alle niveauer, fra helt nye spillere til erfarne turneringsspillere.",
  },
  {
    q: "Hvordan betaler jeg?",
    a: "Indtil videre håndterer vi betaling via MobilePay efter du har indsendt tilmeldingen.",
  },
  {
    q: "Hvorfor Discord login?",
    a: "Det er en bekvem måde at udfylde din profil på. Det er helt frivilligt — du kan også tilmelde dig manuelt.",
  },
];

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function BlivMedlem() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    gamertag: "",
    game: "ultimate",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          gamertag: formState.gamertag,
          game: formState.game,
          tier: selectedTier,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Der opstod en fejl ved indsendelse.");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Ukendt fejl");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Medlemskab"
        title="Bliv medlem af FGC Nord"
        description="Støt foreningen og få adgang til events, turneringer og et fedt community af platform fighter-spillere."
      />

      {/* Pricing */}
      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Priser"
            title="Vælg dit medlemskab"
            description="Alle medlemskaber løber et år ad gangen og kan fornys når som helst."
            centered
            className="mx-auto"
          />

          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {tiers.map((tier, index) => {
              const isSelected = selectedTier === tier.name;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className={`card-poster-interactive relative flex flex-col p-7 sm:p-9 ${
                    tier.highlighted
                      ? "bg-brick text-cream shadow-poster-lg"
                      : "bg-cream text-ink shadow-poster"
                  } ${isSelected ? "ring-4 ring-brick/40 ring-offset-4 ring-offset-cream" : ""}`}
                >
                  {tier.highlighted && (
                    <Badge className="absolute -top-3 left-6 bg-ink text-cream shadow-poster-sm">
                      Mest populær
                    </Badge>
                  )}
                  {isSelected && (
                    <div className="absolute -top-3 right-6">
                      <span className="badge-poster bg-olive text-cream">
                        <Check className="mr-1 h-3 w-3" />
                        Valgt
                      </span>
                    </div>
                  )}

                  <h3 className="font-display text-2xl sm:text-3xl">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-5xl tracking-tight sm:text-6xl">
                      {tier.price}
                    </span>
                    <span className={`text-base font-medium ${tier.highlighted ? "text-cream/80" : "text-ink/70"}`}>
                      {tier.period}
                    </span>
                  </div>
                  <p
                    className={`mt-4 text-base leading-relaxed ${
                      tier.highlighted ? "text-cream/80" : "text-ink/70"
                    }`}
                  >
                    {tier.description}
                  </p>
                  <Separator
                    className={`my-6 ${
                      tier.highlighted ? "bg-cream/25" : "bg-ink/10"
                    }`}
                  />
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-base">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            tier.highlighted ? "bg-cream text-brick" : "bg-olive text-cream"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        <span className={tier.highlighted ? "text-cream/95" : "text-ink/90"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => setSelectedTier(tier.name)}
                    className={`mt-8 w-full ${
                      tier.highlighted
                        ? "bg-cream text-ink hover:bg-cream-dim"
                        : "bg-brick text-cream hover:bg-brick-soft"
                    } ${isSelected ? "opacity-80" : ""}`}
                  >
                    {isSelected ? "Valgt" : `Vælg ${tier.name}`}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Signup form */}
      <section id="tilmeld" className="section-padding bg-olive text-cream halftone-dark">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <PageHeader
                eyebrow="Tilmelding"
                title="Meld dig ind"
                description="Udfyld formularen nedenfor. Du kan også logge ind med Discord for at udfylde felterne automatisk."
                className="border-none bg-transparent px-0 py-0 text-left"
              />

              {isClerkConfigured() ? (
                <ClerkAuthBlock setFormState={setFormState} />
              ) : (
                <div className="rounded-2xl border-2 border-cream/20 bg-coal p-6 shadow-poster">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream/10">
                      <User className="h-7 w-7 text-cream" />
                    </div>
                    <div>
                      <p className="font-heading text-lg font-bold">Discord login</p>
                      <p className="text-sm leading-relaxed text-cream/70">
                        Discord login er ikke konfigureret i øjeblikket. Du kan
                        stadig tilmelde dig manuelt med formularen.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border-2 border-cream/20 bg-coal p-8 text-center shadow-poster-lg"
                >
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brick/20">
                    <CheckCircle className="h-10 w-10 text-brick-soft" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl sm:text-3xl">
                    Tak for din tilmelding!
                  </h3>
                  <p className="mx-auto mt-3 max-w-sm text-cream/70">
                    Vi sender en bekræftelse til din email med
                    betalingsinstruktioner.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-8 bg-brick text-cream hover:bg-brick-soft"
                  >
                    <Link to="/turneringer">
                      Se kommende events
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border-2 border-cream/20 bg-coal p-6 shadow-poster sm:p-9"
                >
                  {selectedTier && (
                    <Alert className="mb-6 border-cream/20 bg-cream/10 text-cream">
                      <Crown className="h-4 w-4" />
                      <AlertTitle>Valgt medlemskab</AlertTitle>
                      <AlertDescription>{selectedTier}</AlertDescription>
                    </Alert>
                  )}

                  {submitError && (
                    <Alert className="mb-6 border-brick bg-brick/20 text-cream">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fejl ved indsendelse</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-bold uppercase tracking-wider text-cream/90"
                      >
                        Fulde navn
                      </label>
                      <Input
                        id="name"
                        required
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                        className="h-12 border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40 focus-visible:border-brick focus-visible:ring-brick"
                        placeholder="Dit navn"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-bold uppercase tracking-wider text-cream/90"
                      >
                        Email
                      </label>
                      <Input
                        id="email"
                        required
                        type="email"
                        value={formState.email}
                        onChange={(e) =>
                          setFormState({ ...formState, email: e.target.value })
                        }
                        className="h-12 border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40 focus-visible:border-brick focus-visible:ring-brick"
                        placeholder="din@email.dk"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="gamertag"
                        className="block text-sm font-bold uppercase tracking-wider text-cream/90"
                      >
                        Gamertag / Discord navn
                      </label>
                      <Input
                        id="gamertag"
                        value={formState.gamertag}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            gamertag: e.target.value,
                          })
                        }
                        className="h-12 border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40 focus-visible:border-brick focus-visible:ring-brick"
                        placeholder="Dit tag"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="game"
                        className="block text-sm font-bold uppercase tracking-wider text-cream/90"
                      >
                        Primært spil
                      </label>
                      <Select
                        value={formState.game}
                        onValueChange={(value) =>
                          setFormState({ ...formState, game: value })
                        }
                      >
                        <SelectTrigger className="h-12 border-2 border-cream/20 bg-cream/10 text-cream focus:ring-brick [&>span]:text-cream [&>svg]:text-cream/60">
                          <SelectValue placeholder="Vælg primært spil" />
                        </SelectTrigger>
                        <SelectContent className="border-cream/20 bg-coal text-cream">
                          <SelectItem value="ultimate" className="focus:bg-cream/10 focus:text-cream">
                            Super Smash Bros. Ultimate
                          </SelectItem>
                          <SelectItem value="melee" className="focus:bg-cream/10 focus:text-cream">
                            Super Smash Bros. Melee
                          </SelectItem>
                          <SelectItem value="roa2" className="focus:bg-cream/10 focus:text-cream">
                            Rivals of Aether 2
                          </SelectItem>
                          <SelectItem value="other" className="focus:bg-cream/10 focus:text-cream">
                            Andet / flere spil
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="mt-8 w-full bg-brick text-cream shadow-poster transition-all hover:-translate-y-0.5 hover:bg-brick-soft hover:shadow-poster-lg disabled:translate-y-0 disabled:shadow-poster"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sender...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Indsend tilmelding
                      </>
                    )}
                  </Button>

                  <p className="mt-4 text-center text-xs leading-relaxed text-cream/50">
                    Betalingen håndteres manuelt indtil videre. Du modtager en
                    email med MobilePay-oplysninger.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="FAQ"
            title="Ofte stillede spørgsmål"
            centered
            className="mx-auto"
          />

          <div className="mx-auto max-w-3xl">
            <Accordion className="space-y-4">
              {faqs.map((item, i) => (
                <AccordionItem key={i} title={item.q}>
                  {item.a}
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}

function ClerkAuthBlock({
  setFormState,
}: {
  setFormState: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      gamertag: string;
      game: string;
    }>
  >;
}) {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      setFormState((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.primaryEmailAddress?.emailAddress || prev.email,
      }));
    }
  }, [isSignedIn, user, setFormState]);

  if (!isLoaded) {
    return (
      <div className="rounded-2xl border-2 border-cream/20 bg-coal p-6 shadow-poster">
        <div className="flex items-center gap-4 text-cream/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-heading">Tjekker login-status...</span>
        </div>
      </div>
    );
  }

  if (isSignedIn && user) {
    return (
      <div className="rounded-2xl border-2 border-cream/20 bg-coal p-5 shadow-poster">
        <div className="flex items-center gap-4">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "Discord bruger"}
              className="h-14 w-14 rounded-full border-2 border-cream/20 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-cream/20 bg-cream/10">
              <User className="h-6 w-6" />
            </div>
          )}
          <div>
            <p className="font-heading text-lg font-bold">
              Logget ind som {user.fullName || user.username}
            </p>
            <p className="text-sm text-cream/70">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-cream/20 bg-coal p-6 shadow-poster sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#5865F2] shadow-poster-sm">
          <DiscordIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <p className="font-heading text-lg font-bold">
            Hurtig tilmelding med Discord
          </p>
          <p className="mt-1 text-sm leading-relaxed text-cream/70">
            Vi udfylder automatisk navn og email, så du slipper for at huske
            endnu en konto. Det er helt frivilligt.
          </p>
        </div>
      </div>
      <SignInButton mode="modal" fallbackRedirectUrl="/bliv-medlem">
        <Button
          type="button"
          size="lg"
          className="mt-6 w-full bg-[#5865F2] text-white shadow-poster-sm transition-all hover:-translate-y-0.5 hover:bg-[#4752C4] hover:shadow-poster"
        >
          <DiscordIcon className="mr-2 h-5 w-5" />
          Log ind med Discord
        </Button>
      </SignInButton>
    </div>
  );
}
