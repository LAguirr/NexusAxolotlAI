import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Gift, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AIAvatar } from "@/components/ai-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmotionSelector } from "@/components/emotion-selector";
import { donationFormSchema, type DonationForm, type EmotionType, type SubmissionResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const presetAmounts = [5, 10, 25, 50, 100];

export default function MissionDon() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [aiMessage, setAiMessage] = useState("Ah, une âme généreuse ! Ton don sera précieux pour notre cause. Choisis le montant qui te convient et ensemble, nous renforcerons le Nexus !");

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      missionType: "don",
      firstName: "",
      lastName: "",
      email: "",
      amount: 0,
      frequency: "ponctuel",
      customMessage: "",
      emotionPreference: "bienveillant",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: DonationForm) => {
      const response = await apiRequest("POST", "/api/submissions", data);
      return await response.json() as SubmissionResponse;
    },
    onSuccess: (data) => {
      navigate(`/confirmation/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    form.setValue("amount", amount);
    
    if (amount <= 10) {
      setAiMessage("Chaque contribution compte ! Même les plus petits dons créent de grandes ondes dans le Nexus.");
    } else if (amount <= 50) {
      setAiMessage("Généreux voyageur ! Avec cette contribution, tu aides vraiment notre mission à progresser.");
    } else {
      setAiMessage("Par les circuits de l'éternité ! Un don de cette envergure est une bénédiction pour notre cause. Tu es un véritable Chevalier du Code !");
    }
  };

  const onSubmit = (data: DonationForm) => {
    setAiMessage("Traitement de ton don en cours... Les serveurs du Nexus s'activent !");
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <AIAvatar message={aiMessage} isTyping={submitMutation.isPending} />

      <header className="fixed top-4 left-4 z-40 flex items-center gap-2">
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
                            <Input 
                              placeholder="Ton prénom" 
                              {...field} 
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
                            <Input 
                              placeholder="Ton nom" 
                              {...field}
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
