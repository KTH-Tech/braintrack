import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-10 pb-10 space-y-5">
            <CheckCircle className="w-16 h-16 mx-auto text-green-400" />
            <h2 className="text-2xl font-bold text-foreground">
              {isAf ? "Dankie!" : "Thank you!"}
            </h2>
            <p className="text-white text-sm leading-relaxed">
              {isAf
                ? "Jou aansoek is ontvang. Ons span sal jou binnekort kontak om jou skool by BrainTrack te registreer."
                : "Your application has been received. Our team will contact you shortly to get your school set up on BrainTrack."}
            </p>
            <Button
              onClick={() => setLocation("/")}
              className="mt-4 h-11 px-8 font-semibold"
            >
              {isAf ? "Terug na tuisblad" : "Back to home"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <img src={iconTransparent} alt="BrainTrack" className="h-8 w-8 object-contain" />
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-white hover:text-foreground transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold">{isAf ? "AF" : "EN"}</span>
          </button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <School className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>
                  {isAf ? "Skool Registrasie" : "School Registration"}
                </CardTitle>
                <p className="text-sm text-white mt-1">
                  {isAf
                    ? "Registreer jou skool by BrainTrack vir groepstoegang."
                    : "Register your school for group access to BrainTrack."}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="school-name" className="text-foreground font-medium">
                {isAf ? "Skool naam" : "School name"} <span className="text-red-400">*</span>
              </Label>
              <Input
                id="school-name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder={isAf ? "bv. Hoërskool Stellenbosch" : "e.g. Greenside High School"}
                className="text-foreground placeholder:text-white bg-black/30 border-white/20 focus:border-primary"
                data-testid="input-school-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-person" className="text-foreground font-medium">
                {isAf ? "Kontakpersoon" : "Contact person"} <span className="text-red-400">*</span>
              </Label>
              <Input
                id="contact-person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder={isAf ? "bv. Mnr. Joubert" : "e.g. Mr. Smith"}
                className="text-foreground placeholder:text-white bg-black/30 border-white/20 focus:border-primary"
                data-testid="input-contact-person"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                {isAf ? "E-posadres" : "Email address"} <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAf ? "kontakpersoon@skool.co.za" : "contact@school.co.za"}
                className="text-foreground placeholder:text-white bg-black/30 border-white/20 focus:border-primary"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">
                {isAf ? "Telefoonnommer" : "Phone number"}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+27 21 000 0000"
                className="text-foreground placeholder:text-white bg-black/30 border-white/20 focus:border-primary"
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="num-learners" className="text-foreground font-medium">
                {isAf ? "Getal leerders (ong.)" : "Number of learners (approx.)"}
              </Label>
              <Input
                id="num-learners"
                type="number"
                min="1"
                value={numLearners}
                onChange={(e) => setNumLearners(e.target.value)}
                placeholder={isAf ? "bv. 250" : "e.g. 250"}
                className="text-foreground placeholder:text-white bg-black/30 border-white/20 focus:border-primary"
                data-testid="input-num-learners"
              />
            </div>

            <p className="text-xs text-white">
              <span className="text-red-400">*</span> {isAf ? "Verpligte velde" : "Required fields"}
            </p>

            <Button
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
