import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Gift, Check, Sparkles, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AIChatWidget } from "@/components/ai-chat-widget";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmotionSelector } from "@/components/emotion-selector";
import { Badge } from "@/components/ui/badge";
import { donationFormSchema, type DonationForm, type EmotionType, type SubmissionResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/lib/chat-context";

interface DonationSuggestion {
  suggestedAmount: number;
  frequency: "ponctuel" | "mensuel" | "annuel";
  reason: string;
  message: string;
}

const presetAmounts = [5, 10, 25, 50, 100];

const firstNameSuggestions = [
  "Alexandre", "Antoine", "Benjamin", "Camille", "Charlotte",
  "David", "Emma", "François", "Gabriel", "Hugo",
  "Isabelle", "Julie", "Kevin", "Laura", "Lucas",
  "Marie", "Nicolas", "Olivier", "Pierre", "Quentin",
  "Raphael", "Sophie", "Thomas", "Valentin", "Xavier",
];

const lastNameSuggestions = [
  "Martin", "Bernard", "Dubois", "Thomas", "Robert",
  "Richard", "Petit", "Durand", "Leroy", "Moreau",
  "Simon", "Laurent", "Lefebvre", "Michel", "Garcia",
  "David", "Bertrand", "Roux", "Vincent", "Fournier",
];

export default function MissionDon() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setMessage, language } = useChat();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const initialMessages = {
    fr: "Ah, une âme généreuse ! Ton don sera précieux pour notre cause. Choisis le montant qui te convient et ensemble, nous renforcerons le Nexus !",
    en: "Ah, a generous soul! Your donation will be precious to our cause. Choose the amount that suits you and together, we will strengthen the Nexus!"
  };

  const [aiMessage, setAiMessage] = useState(initialMessages[language]);
  const [suggestionInput, setSuggestionInput] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<DonationSuggestion | null>(null);

  // Update message when language changes
  useEffect(() => {
    setAiMessage(initialMessages[language]);
  }, [language]);

  useEffect(() => {
    setMessage(aiMessage);
  }, [aiMessage, setMessage]);

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      amount: 0,
      frequency: "ponctuel",
      customMessage: "",
      emotionPreference: "joy",
    },
  });

  const handlePresetClick = (amount: number) => {
    form.setValue("amount", amount);
    setSelectedPreset(amount);
  };

  const suggestionMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest("POST", "/api/ai/suggest-donation", {
        message: prompt,
        language
      });
      return await response.json() as DonationSuggestion;
    },
    onSuccess: (data) => {
      setAiSuggestion(data);
      setAiMessage(data.message);
    },
    onError: (error) => {
      toast({
        title: "Erreur de suggestion IA",
        description: error.message || "Impossible d'obtenir une suggestion pour le moment.",
        variant: "destructive",
      });
    },
  });

  const handleAskSuggestion = () => {
    if (suggestionInput.trim()) {
      suggestionMutation.mutate(suggestionInput);
    }
  };

  const applySuggestion = () => {
    if (aiSuggestion) {
      form.setValue("amount", aiSuggestion.suggestedAmount);
      form.setValue("frequency", aiSuggestion.frequency);
      setSelectedPreset(aiSuggestion.suggestedAmount);
      setAiSuggestion(null); // Clear suggestion after applying
      setSuggestionInput(""); // Clear input after applying
      toast({
        title: "Suggestion appliquée",
        description: "Le montant et la fréquence suggérés ont été appliqués.",
      });
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: DonationForm) => {
      const response = await apiRequest("POST", "/api/submissions", data);
      return await response.json() as SubmissionResponse;
    },
    onSuccess: (data) => {
      toast({
        title: "Don confirmé !",
        description: data.message,
      });
      navigate("/confirmation");
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la confirmation",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DonationForm) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </header>

      <div className="pt-20 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Offrir un Don
            </h1>
            <p className="text-muted-foreground">
              Contribue au renforcement du Nexus avec un don
            </p>
          </div>

          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="text-lg">Détails de ta contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <AutocompleteInput
                              placeholder="Ton prénom"
                              suggestions={firstNameSuggestions}
                              value={field.value}
                              onChange={field.onChange}
                              data-testid="input-firstname"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <AutocompleteInput
                              placeholder="Ton nom"
                              suggestions={lastNameSuggestions}
                              value={field.value}
                              onChange={field.onChange}
                              data-testid="input-lastname"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ton.email@exemple.com"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Suggestion IA</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Dis-moi ta situation et je te suggère un montant adapté !
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={suggestionInput}
                        onChange={(e) => setSuggestionInput(e.target.value)}
                        placeholder="Ex: J'ai pas trop de budget ce mois-ci..."
                        className="flex-1 text-sm"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAskSuggestion())}
                        data-testid="input-ai-suggestion"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={handleAskSuggestion}
                        disabled={!suggestionInput.trim() || suggestionMutation.isPending}
                        data-testid="button-ask-suggestion"
                      >
                        {suggestionMutation.isPending ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {aiSuggestion && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 bg-background rounded-md border"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {aiSuggestion.suggestedAmount}€
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {aiSuggestion.frequency}
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={applySuggestion}
                            data-testid="button-apply-suggestion"
                          >
                            Appliquer
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{aiSuggestion.reason}</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <FormLabel>Montant du don</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {presetAmounts.map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant={selectedPreset === amount ? "default" : "outline"}
                          onClick={() => handlePresetClick(amount)}
                          className="flex-1 min-w-[60px]"
                          data-testid={`button-amount-${amount}`}
                        >
                          {amount}€
                        </Button>
                      ))}
                    </div>
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ou entre un montant personnalisé"
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                field.onChange(value);
                                setSelectedPreset(null);
                              }}
                              data-testid="input-amount-custom"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fréquence</FormLabel>
                        <div className="flex gap-2">
                          {[
                            { value: "ponctuel", label: "Ponctuel" },
                            { value: "mensuel", label: "Mensuel" },
                            { value: "annuel", label: "Annuel" },
                          ].map((freq) => (
                            <Button
                              key={freq.value}
                              type="button"
                              variant={field.value === freq.value ? "default" : "outline"}
                              onClick={() => field.onChange(freq.value)}
                              className="flex-1"
                              data-testid={`button-frequency-${freq.value}`}
                            >
                              {field.value === freq.value && <Check className="w-4 h-4 mr-1" />}
                              {freq.label}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Un message pour accompagner ton don..."
                            className="resize-none"
                            {...field}
                            data-testid="input-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emotionPreference"
                    render={({ field }) => (
                      <FormItem>
                        <EmotionSelector
                          selected={field.value as EmotionType}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit-don"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⚡</span>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5 mr-2" />
                        Confirmer mon don
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
