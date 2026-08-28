import { SignInButton, useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle,
  CreditCard,
  Loader2,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { CTASection } from "@/components/CTASection";
import { DiscordIcon } from "@/components/Navbar";
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

const PRICES = { junior: 75, senior: 150 } as const;

const tiers = [
  {
    name: "Ungdom (under 18)",
    price: PRICES.junior,
    period: "kr. / år",
    description: "For spillere under 18 år. Forældre skal blot bekræfte med deres email.",
    features: [
      "Deltagelse i alle ugentlige meetups",
      "Rabat på turneringsdeltagelse",
      "Adgang til medlemsevents",
      "Stemmeret (fra 15 år, jf. vedtægter)",
    ],
    highlighted: false,
  },
  {
    name: "Voksen (18+)",
    price: PRICES.senior,
    period: "kr. / år",
    description: "For voksne spillere og forældre, der vil være en aktiv del af fællesskabet.",
    features: [
      "Alt fra ungdomsmedlemskabet",
      "Fuld stemmeret på generalforsamlingen",
      "Kan stille op til bestyrelsen",
      "Støtter foreningens ungdomsarbejde",
    ],
    highlighted: true,
  },
];

const faqs = [
  {
    q: "Hvor gammel skal man være for at blive medlem?",
    a: "Der er ingen nedre aldersgrænse. Er du under 18, skal en forælder eller værge blot bekræfte tilmeldingen med deres email. Mange af vores yngste medlemmer er 10-12 år, og forældre er altid velkomne til at kigge med.",
  },
  {
    q: "Hvad koster det — og hvorfor to priser?",
    a: "Kontingentet er 75 kr. om året for medlemmer under 18 og 150 kr. om året for voksne. Prisen udregnes automatisk ud fra fødselsdatoen i tilmeldingen. Betaling sker via MobilePay, når du har indsendt formularen.",
  },
  {
    q: "Hvad får man som medlem?",
    a: "Adgang til ugentlige meetups, rabat på turneringer, medlemsevents og stemmeret på generalforsamlingen. Som ungt medlem udløser du desuden kommunalt tilskud til foreningen — helt gratis for dig.",
  },
  {
    q: "Kan man prøve at være med, før man melder sig ind?",
    a: "Ja! De første to besøg til vores ugentlige meetups er gratis og helt uforpligtende. Kom forbi, prøv spillet og mærk stemningen, før I beslutter jer.",
  },
  {
    q: "Er det et trygt sted for børn og unge?",
    a: "Ja. Events er altid bemandet med voksne frivillige, vi har klare regler for god opførsel, og der er nultolerance over for mobning. Forældre er altid velkomne til at blive og kigge med.",
  },
  {
    q: "Skal man være god til spillet?",
    a: "Slet ikke! Vi har medlemmer på alle niveauer, fra helt nye spillere til erfarne turneringsspillere. Vores motto er, at alle kan blive bedre sammen.",
  },
];

interface FormState {
  name: string;
  email: string;
  gamertag: string;
  game: string;
  birthdate: string;
  parentEmail: string;
  acceptBylaws: boolean;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

function calculateAge(birthdate: string): number | null {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age < 0 || age > 120 ? null : age;
}

export function BlivMedlem() {
  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    gamertag: "",
    game: "ultimate",
    birthdate: "",
    parentEmail: "",
    acceptBylaws: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const age = useMemo(
    () => calculateAge(formState.birthdate),
    [formState.birthdate]
  );
  const isMinor = age !== null && age < 18;
  const price = age === null ? null : isMinor ? PRICES.junior : PRICES.senior;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!formState.name.trim()) next.name = "Skriv venligst dit fulde navn.";
    if (!formState.email.trim()) {
      next.email = "Skriv venligst din email-adresse.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      next.email = "Email-adressen ser ikke rigtig ud. Tjek den igen.";
    }
    if (!formState.birthdate) {
      next.birthdate = "Vælg venligst din fødselsdato.";
    } else if (age === null) {
      next.birthdate = "Fødselsdatoen ser ikke rigtig ud. Tjek den igen.";
    }
    if (isMinor) {
      if (!formState.parentEmail.trim()) {
        next.parentEmail =
          "Da du er under 18, skal vi have en forældres eller værges email.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.parentEmail.trim())
      ) {
        next.parentEmail = "Forældre-emailen ser ikke rigtig ud.";
      }
    }
    if (!formState.acceptBylaws) {
      next.acceptBylaws =
        "Du skal acceptere vedtægterne for at blive medlem.";
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          gamertag: formState.gamertag.trim(),
          game: formState.game,
          birthdate: formState.birthdate,
          age,
          parentEmail: isMinor ? formState.parentEmail.trim() : undefined,
          price,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ||
            "Der opstod en fejl ved indsendelse."
        );
      }

      setSubmitted(true);
    } catch (err) {
      // Demo-fallback: hvis API'et ikke er tilgængeligt (fx lokal udvikling),
      // viser vi stadig success, så flowet kan opleves.
      const isNetworkError =
        err instanceof TypeError ||
        (err instanceof Error &&
          /failed to fetch|networkerror|load failed/i.test(err.message));
      if (isNetworkError) {
        setDemoMode(true);
        setSubmitted(true);
      } else {
        setSubmitError(
          err instanceof Error ? err.message : "Der opstod en ukendt fejl."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Medlemskab"
        title="Bliv medlem af FGC Nord"
        description="Støt foreningen og få adgang til events, turneringer og et fedt community af platform fighter-spillere i Nordjylland."
      />

      {/* Pricing */}
      <section className="section-padding bg-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Kontingent"
            title="Vælg dit medlemskab"
            description="Prisen afhænger af din alder og udregnes automatisk i tilmeldingen. Alle priser er pr. år."
            centered
            className="mx-auto"
          />
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl border-2 p-6 transition-shadow sm:p-8 ${
                  tier.highlighted
                    ? "border-ink bg-coal text-cream shadow-poster-lg"
                    : "border-ink bg-cream shadow-poster"
                }`}
              >
                {tier.highlighted && (
                  <Badge className="absolute -top-3 left-6 bg-brick text-coal">
                    Mest valgt
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
                          tier.highlighted ? "text-brick-soft" : "text-brick"
                        }`}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`mt-6 w-full ${
                    tier.highlighted
                      ? "bg-brick text-coal hover:bg-brick-soft"
                      : "bg-coal text-cream hover:bg-ink"
                  }`}
                >
                  <a href="#tilmeld">Meld dig ind</a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup form */}
      <section id="tilmeld" className="section-padding scroll-mt-20 bg-olive text-cream">
        <div className="container-site px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeader
                eyebrow="Tilmelding"
                title="Meld dig ind"
                description="Udfyld formularen, og vi vender tilbage med betalingsinstruktioner. Du kan også logge ind med Discord for at udfylde felterne automatisk."
                light
              />

              {isClerkConfigured() ? (
                <ClerkAuthBlock setFormState={setFormState} />
              ) : (
                <div className="rounded-xl border-2 border-cream/20 bg-coal p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cream/10">
                      <User className="h-6 w-6 text-cream" aria-hidden="true" />
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

              <div className="mt-6 rounded-xl border-2 border-cream/20 bg-coal p-6">
                <p className="font-heading font-bold">For forældre</p>
                <p className="mt-1 text-sm text-cream/70">
                  Er dit barn under 18? Så skal vi blot have din email til
                  bekræftelse. Du er altid velkommen til at kigge forbi til et
                  meetup og møde de voksne frivillige, før I beslutter jer.
                </p>
              </div>
            </div>

            <div>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border-2 border-cream/20 bg-coal p-8 text-center"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle className="mx-auto h-16 w-16 text-brick-soft" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-2xl">
                    Tak for din tilmelding{formState.name ? `, ${formState.name.split(" ")[0]}` : ""}!
                  </h3>
                  <p className="mt-2 text-cream/70">
                    Vi sender en bekræftelse til {formState.email} med
                    betalingsinstruktioner
                    {price !== null && (
                      <>
                        {" "}
                        — dit kontingent er{" "}
                        <strong className="text-cream">{price} kr. / år</strong>
                      </>
                    )}
                    .
                  </p>
                  {isMinor && (
                    <p className="mt-2 text-sm text-cream/60">
                      Da du er under 18, sender vi også en bekræftelse til din
                      forældre eller værge.
                    </p>
                  )}
                  {demoMode && (
                    <p className="mt-4 rounded-lg border border-brick/40 bg-brick/10 px-3 py-2 text-xs text-brick-soft">
                      Demo-tilstand: Tilmeldingen er ikke sendt til serveren,
                      da API'et ikke er tilgængeligt lige nu.
                    </p>
                  )}
                  <Button
                    asChild
                    className="mt-6 bg-brick text-coal hover:bg-brick-soft"
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
                  noValidate
                  className="rounded-2xl border-2 border-cream/20 bg-coal p-6 sm:p-8"
                >
                  {submitError && (
                    <Alert className="mb-6 border-brick bg-brick/20 text-cream" role="alert">
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      <AlertTitle>Fejl ved indsendelse</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-4">
                    <Field
                      id="name"
                      label="Fulde navn"
                      required
                      error={errors.name}
                    >
                      <Input
                        id="name"
                        autoComplete="name"
                        value={formState.name}
                        onChange={(e) => set("name", e.target.value)}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        className="border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40"
                        placeholder="Dit navn"
                      />
                    </Field>

                    <Field
                      id="email"
                      label="Email"
                      required
                      error={errors.email}
                    >
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={formState.email}
                        onChange={(e) => set("email", e.target.value)}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className="border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40"
                        placeholder="din@email.dk"
                      />
                    </Field>

                    <Field id="gamertag" label="Gamertag / Discord navn">
                      <Input
                        id="gamertag"
                        value={formState.gamertag}
                        onChange={(e) => set("gamertag", e.target.value)}
                        className="border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40"
                        placeholder="Dit tag (valgfrit)"
                      />
                    </Field>

                    <div>
                      <label
                        htmlFor="game"
                        className="mb-1 block text-sm font-bold"
                      >
                        Primært spil
                      </label>
                      <select
                        id="game"
                        value={formState.game}
                        onChange={(e) => set("game", e.target.value)}
                        className="flex h-11 w-full rounded-md border-2 border-cream/20 bg-cream/10 px-3 py-2 text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
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

                    <Field
                      id="birthdate"
                      label="Fødselsdato"
                      required
                      error={errors.birthdate}
                      hint={
                        price !== null
                          ? `Dit kontingent: ${price} kr. / år (${isMinor ? "under 18" : "18 eller over"})`
                          : "Bruges til at udregne dit kontingent automatisk."
                      }
                    >
                      <Input
                        id="birthdate"
                        type="date"
                        value={formState.birthdate}
                        onChange={(e) => set("birthdate", e.target.value)}
                        aria-invalid={!!errors.birthdate}
                        aria-describedby={
                          errors.birthdate ? "birthdate-error" : "birthdate-hint"
                        }
                        max={new Date().toISOString().split("T")[0]}
                        className="border-2 border-cream/20 bg-cream/10 text-cream [color-scheme:dark]"
                      />
                    </Field>

                    {isMinor && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border-2 border-brick/50 bg-brick/10 p-4">
                          <Field
                            id="parentEmail"
                            label="Forældres eller værges email"
                            required
                            error={errors.parentEmail}
                            hint="Vi sender en kort bekræftelse, før medlemskabet er aktivt."
                          >
                            <Input
                              id="parentEmail"
                              type="email"
                              value={formState.parentEmail}
                              onChange={(e) =>
                                set("parentEmail", e.target.value)
                              }
                              aria-invalid={!!errors.parentEmail}
                              aria-describedby={
                                errors.parentEmail
                                  ? "parentEmail-error"
                                  : "parentEmail-hint"
                              }
                              className="border-2 border-cream/20 bg-cream/10 text-cream placeholder:text-cream/40"
                              placeholder="foraeldre@email.dk"
                            />
                          </Field>
                        </div>
                      </motion.div>
                    )}

                    <div>
                      <div className="flex items-start gap-3">
                        <input
                          id="acceptBylaws"
                          type="checkbox"
                          checked={formState.acceptBylaws}
                          onChange={(e) =>
                            set("acceptBylaws", e.target.checked)
                          }
                          aria-invalid={!!errors.acceptBylaws}
                          aria-describedby={
                            errors.acceptBylaws ? "acceptBylaws-error" : undefined
                          }
                          className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-cream/40 accent-brick focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick"
                        />
                        <label htmlFor="acceptBylaws" className="text-sm text-cream/85">
                          Jeg har læst og accepterer{" "}
                          <Link
                            to="/om"
                            className="font-bold text-brick-soft underline underline-offset-2 hover:text-cream"
                          >
                            foreningens vedtægter
                          </Link>{" "}
                          og er indforstået med, at kontingentet er{" "}
                          {price !== null ? `${price} kr.` : "75/150 kr."} pr. år.
                        </label>
                      </div>
                      {errors.acceptBylaws && (
                        <p
                          id="acceptBylaws-error"
                          role="alert"
                          className="mt-1.5 flex items-center gap-1.5 pl-8 text-sm text-brick-soft"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                          {errors.acceptBylaws}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 w-full bg-brick text-coal hover:bg-brick-soft disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Sender...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
                        Indsend tilmelding
                        {price !== null && ` — ${price} kr. / år`}
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
            description="Svar til både spillere og forældre. Mangler du noget, så spørg os på Discord."
            centered
            className="mx-auto"
          />

          <div className="mx-auto max-w-3xl">
            <Accordion>
              {faqs.map((item) => (
                <AccordionItem key={item.q} title={item.q}>
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

function Field({
  id,
  label,
  required = false,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-bold">
        {label}
        {required && (
          <span className="ml-1 text-brick-soft" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-sm text-brick-soft"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-cream/60">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ClerkAuthBlock({
  setFormState,
}: {
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
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
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
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
              alt=""
              className="h-12 w-12 rounded-full border-2 border-cream/20"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-cream/20 bg-cream/10">
              <User className="h-5 w-5" aria-hidden="true" />
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
          <DiscordIcon size={24} />
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
          <span className="mr-2 inline-flex">
            <DiscordIcon size={16} />
          </span>
          Log ind med Discord
        </Button>
      </SignInButton>
    </div>
  );
}
