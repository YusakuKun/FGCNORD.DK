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
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            {tiers.map((tier) => (
              <motion.div
                key={tier.name}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl border-2 p-6 sm:p-8 ${
                  tier.highlighted
                    ? "border-ink bg-brick text-cream shadow-poster-lg"
                    : "border-ink bg-cream shadow-poster"
                }`}
              >
                {tier.highlighted && (
                  <Badge className="absolute -top-3 left-6 bg-ink text-cream">
                    Mest populær
                  </Badge>
                )}
                <h3 className="font-display text-2xl">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-4xl">{tier.price}</span>
                  <span className="text-sm opacity-80">{tier.period}</span>
                </div>
                <p
                  className={`mt-3 text-sm ${
                    tier.highlighted ? "text-cream/80" : "text-ink/70"
                  }`}
                >
                  {tier.description}
                </p>
                <Separator
                  className={`my-6 ${
                    tier.highlighted ? "bg-cream/20" : "bg-ink/10"
                  }`}
                />
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          tier.highlighted ? "text-cream" : "text-brick"
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  onClick={() => setSelectedTier(tier.name)}
                  className={`mt-6 w-full ${
                    tier.highlighted
                      ? "bg-cream text-ink hover:bg-cream-dim"
                      : "bg-brick text-cream hover:bg-brick-soft"
                  }`}
                >
                  Vælg {tier.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup form */}
      <section id="tilmeld" className="section-padding bg-olive text-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
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
                <div className="rounded-xl border-2 border-cream/20 bg-coal p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cream/10">
                      <User className="h-6 w-6 text-cream" />
                    </div>
                    <div>
                      <p className="font-heading font-bold">Discord login</p>
                      <p className="text-sm text-cream/70">
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
                  className="rounded-2xl border-2 border-cream/20 bg-coal p-8 text-center"
                >
                  <CheckCircle className="mx-auto h-16 w-16 text-brick-soft" />
                  <h3 className="mt-4 font-display text-2xl">
                    Tak for din tilmelding!
                  </h3>
                  <p className="mt-2 text-cream/70">
                    Vi sender en bekræftelse til din email med
                    betalingsinstruktioner.
                  </p>
                  <Button
                    asChild
                    className="mt-6 bg-brick text-cream hover:bg-brick-soft"
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
                  className="rounded-2xl border-2 border-cream/20 bg-coal p-6 sm:p-8"
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

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-bold">
                        Fulde navn
                      </label>
                      <Input
                        required
                        value={formState.name}
                        onChange={(e) =>
                          setFormState({ ...formState, name: e.target.value })
                        }
                        className="border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40"
                        placeholder="Dit navn"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-bold">
                        Email
                      </label>
                      <Input
                        required
                        type="email"
                        value={formState.email}
                        onChange={(e) =>
                          setFormState({ ...formState, email: e.target.value })
                        }
                        className="border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40"
                        placeholder="din@email.dk"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-bold">
                        Gamertag / Discord navn
                      </label>
                      <Input
                        value={formState.gamertag}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            gamertag: e.target.value,
                          })
                        }
                        className="border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40"
                        placeholder="Dit tag"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-bold">
                        Primært spil
                      </label>
                      <select
                        value={formState.game}
                        onChange={(e) =>
                          setFormState({ ...formState, game: e.target.value })
                        }
                        className="flex h-11 w-full rounded-md border-2 border-cream/20 bg-cream/10 px-3 py-2 text-cream focus:outline-none focus:ring-2 focus:ring-brick"
                      >
                        <option value="ultimate" className="bg-coal text-cream">
                          Super Smash Bros. Ultimate
                        </option>
                        <option value="melee" className="bg-coal text-cream">
                          Super Smash Bros. Melee
                        </option>
                        <option value="roa2" className="bg-coal text-cream">
                          Rivals of Aether 2
                        </option>
                        <option value="other" className="bg-coal text-cream">
                          Andet / flere spil
                        </option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 w-full bg-brick text-cream hover:bg-brick-soft"
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

                  <p className="mt-4 text-center text-xs text-cream/50">
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
            <Accordion>
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
      <div className="flex items-center gap-2 text-cream/70">
        <Loader2 className="h-4 w-4 animate-spin" />
        Tjekker login-status...
      </div>
    );
  }

  if (isSignedIn && user) {
    return (
      <div className="rounded-xl border-2 border-cream/20 bg-coal p-4">
        <div className="flex items-center gap-3">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "Discord bruger"}
              className="h-12 w-12 rounded-full border-2 border-cream/20"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-cream/20 bg-cream/10">
              <User className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="font-heading font-bold">
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
    <div className="rounded-xl border-2 border-cream/20 bg-coal p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#5865F2]">
          <DiscordIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-heading font-bold">
            Hvorfor logge ind med Discord?
          </p>
          <p className="text-sm text-cream/70">
            Vi udfylder automatisk navn og email, og du slipper for at huske
            endnu en konto.
          </p>
        </div>
      </div>
      <SignInButton mode="modal" fallbackRedirectUrl="/bliv-medlem">
        <Button
          type="button"
          className="mt-4 w-full bg-[#5865F2] text-white hover:bg-[#4752C4]"
        >
          <DiscordIcon className="mr-2 h-4 w-4" />
          Log ind med Discord
        </Button>
      </SignInButton>
    </div>
  );
}
