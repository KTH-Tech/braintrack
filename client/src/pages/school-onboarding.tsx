import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { useSEO } from "@/hooks/use-seo";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Loader2, School, ArrowRight, Globe, CheckCircle } from "lucide-react";
import iconTransparent from "@/assets/handoff/icon-transparent.png";

// Brand shell — mirrors parent-activate-child: #050508 ground, #0e0d12 card
// with a solid pastel border + rainbow top rule, Bebas kicker, Poppins body.
const cardStyle: React.CSSProperties = {
  background: "#0e0d12",
  border: "1.5px solid #9FD8FF",
};

const INPUT_CLASSES =
  "text-white placeholder:text-[#9FD8FF] bg-[#050508] border-[#1b1922] focus:border-[#9FF5E8]";

export default function SchoolOnboardingPage() {
  const { language, toggleLanguage } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const isAf = language === "af";

  // Application form, not a marketing page — noindex.
  useSEO({
    title: "School partnership application | BrainTrack",
    description:
      "Apply to bring BrainTrack to your South African high school. No cost to schools, POPIA-aligned, English & Afrikaans.",
    canonical: "https://braintrack.tech/school-onboarding",
    noIndex: true,
  });

  const [schoolName, setSchoolName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [numLearners, setNumLearners] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/school/onboarding", {
        schoolName: schoolName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        numLearners: numLearners ? parseInt(numLearners, 10) : undefined,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: isAf ? "Aansoek ontvang!" : "Application received!",
        description: isAf
          ? "Ons sal jou binnekort kontak."
          : "We'll be in touch with you shortly.",
      });
    },
    onError: () => {
      toast({
        title: isAf ? "Fout" : "Error",
        description: isAf
          ? "Kon nie aansoek indien nie. Probeer asseblief weer."
          : "Could not submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const canSubmit =
    schoolName.trim().length >= 2 &&
    contactPerson.trim().length >= 2 &&
    email.trim().includes("@") &&
    !submit.isPending;

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif" }}
      >
        <div className="max-w-lg w-full rounded-3xl overflow-hidden text-center" style={{ ...cardStyle, border: "1.5px solid #94F7C5" }}>
          <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
          <div className="pt-10 pb-10 px-6 space-y-5">
            <CheckCircle className="w-16 h-16 mx-auto" style={{ color: "#94F7C5" }} />
            <h2 className="text-2xl font-bold text-white">
              {isAf ? "Dankie!" : "Thank you!"}
            </h2>
            <p className="text-white text-sm leading-relaxed">
              {isAf
                ? "Jou aansoek is ontvang. Ons span sal jou binnekort kontak om jou skool by BrainTrack te registreer."
                : "Your application has been received. Our team will contact you shortly to get your school set up on BrainTrack."}
            </p>
            <Button
              variant="primary"
              onClick={() => setLocation("/")}
              className="mt-4 h-11 px-8 font-semibold"
            >
              {isAf ? "Terug na tuisblad" : "Back to home"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#050508", color: "#fff", fontFamily: "'Poppins',sans-serif" }}
    >
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <img src={iconTransparent} alt="BrainTrack" className="h-8 w-8 object-contain" />
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-white hover:opacity-80 transition-opacity"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold">{isAf ? "AF" : "EN"}</span>
          </button>
        </div>

        <div className="rounded-3xl overflow-hidden" style={cardStyle}>
          <div aria-hidden className="h-[3px]" style={{ background: "linear-gradient(95deg,#FFB7E5,#FFE29A,#9FF5E8,#9FD8FF,#C5B3FF,#FFB7E5)" }} />
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "#050508", border: "1.5px solid #9FD8FF" }}
              >
                <School className="w-6 h-6" style={{ color: "#9FD8FF" }} />
              </div>
              <div>
                <p
                  className="uppercase leading-none"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: "0.16em", color: "#9FF5E8", transform: "rotate(-2deg)", display: "inline-block" }}
                >
                  {isAf ? "bring jou skool in!" : "bring your school in!"}
                </p>
                <h1 className="text-xl font-black text-white leading-tight">
                  {isAf ? "Skool Registrasie" : "School Registration"}
                </h1>
                <p className="text-sm text-white mt-1">
                  {isAf
                    ? "Registreer jou skool by BrainTrack vir groepstoegang."
                    : "Register your school for group access to BrainTrack."}
                </p>
              </div>
            </div>

            <div className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="school-name" className="text-white font-medium">
                {isAf ? "Skool naam" : "School name"} <span className="text-[#FFB7E5]">*</span>
              </Label>
              <Input
                id="school-name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder={isAf ? "bv. Hoërskool Stellenbosch" : "e.g. Greenside High School"}
                className={INPUT_CLASSES}
                data-testid="input-school-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-person" className="text-white font-medium">
                {isAf ? "Kontakpersoon" : "Contact person"} <span className="text-[#FFB7E5]">*</span>
              </Label>
              <Input
                id="contact-person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder={isAf ? "bv. Mnr. Joubert" : "e.g. Mr. Smith"}
                className={INPUT_CLASSES}
                data-testid="input-contact-person"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium">
                {isAf ? "E-posadres" : "Email address"} <span className="text-[#FFB7E5]">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAf ? "kontakpersoon@skool.co.za" : "contact@school.co.za"}
                className={INPUT_CLASSES}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white font-medium">
                {isAf ? "Telefoonnommer" : "Phone number"}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27 21 000 0000"
                className={INPUT_CLASSES}
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num-learners" className="text-white font-medium">
                {isAf ? "Getal leerders (ong.)" : "Number of learners (approx.)"}
              </Label>
              <Input
                id="num-learners"
                type="number"
                min="1"
                value={numLearners}
                onChange={(e) => setNumLearners(e.target.value)}
                placeholder={isAf ? "bv. 250" : "e.g. 250"}
                className={INPUT_CLASSES}
                data-testid="input-num-learners"
              />
            </div>

            <p className="text-xs text-white">
              <span className="text-[#FFB7E5]">*</span> {isAf ? "Verpligte velde" : "Required fields"}
            </p>

            <Button
              variant="primary"
              onClick={() => submit.mutate()}
              disabled={!canSubmit}
              className="w-full h-12 text-base font-semibold"
              data-testid="button-submit-school-onboarding"
            >
              {submit.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <School className="w-4 h-4 mr-2" />
              )}
              {isAf ? "Dien aansoek in" : "Submit application"}
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
