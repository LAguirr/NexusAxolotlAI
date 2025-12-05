import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, HelpCircle, Search } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmotionSelector } from "@/components/emotion-selector";
import { infoRequestFormSchema, type InfoRequestForm, type EmotionType, type SubmissionResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/lib/chat-context";

const requestTypes = [
  { value: "association", label: "Informations sur l'association" },
  { value: "projets", label: "Projets en cours et à venir" },
  { value: "adhesion", label: "Comment devenir membre" },
  { value: "partenariat", label: "Propositions de partenariat" },
  { value: "evenements", label: "Événements et activités" },
  { value: "technique", label: "Questions techniques" },
  { value: "autre", label: "Autre demande" },
];

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

export default function MissionInformations() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setMessage, language } = useChat();

  const initialMessages = {
    fr: "Tu cherches des informations ? Je suis là pour t'orienter. Dis-moi ce que tu souhaites savoir et nous te répondrons avec précision !",
    en: "Looking for information? I'm here to guide you. Tell me what you want to know and we will answer you precisely!"
  };

  const [aiMessage, setAiMessage] = useState(initialMessages[language]);

  useEffect(() => {
    setAiMessage(initialMessages[language]);
  }, [language]);

  useEffect(() => {
    setMessage(aiMessage);
  }, [aiMessage, setMessage]);

  const form = useForm<InfoRequestForm>({
    resolver: zodResolver(infoRequestFormSchema),
    defaultValues: {
      missionType: "informations",
      firstName: "",
      lastName: "",
      email: "",
      requestType: "",
      specificQuestion: "",
      emotionPreference: "bienveillant",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InfoRequestForm) => {
      const response = await apiRequest("POST", "/api/submissions", data);
      return await response.json() as SubmissionResponse;
    },
    onSuccess: (data) => {
      navigate(`/confirmation/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleRequestTypeChange = (value: string) => {
    form.setValue("requestType", value);

    const messages: Record<string, string> = {
      association: "Excellente question ! Notre association a une histoire riche à partager.",
      projets: "Nos projets sont passionnants ! Nous avons hâte de te les présenter.",
      adhesion: "Rejoindre notre communauté est simple ! Je vais te guider.",
      partenariat: "Un partenariat potentiel ? Formidable ! Nous sommes ouverts aux collaborations.",
      evenements: "Nos événements sont toujours mémorables ! Voici comment en savoir plus.",
      technique: "Une question technique ? Nos experts sont là pour t'aider.",
      autre: "Toute question est bienvenue ! Décris ce que tu recherches.",
    };

    setAiMessage(messages[value] || aiMessage);
  };

  const onSubmit = (data: InfoRequestForm) => {
    setAiMessage("Analyse de ta demande en cours... Nos équipes préparent une réponse personnalisée !");
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
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
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Demander des Informations
            </h1>
            <p className="text-muted-foreground">
              Pose ta question et obtiens les réponses dont tu as besoin
            </p>
          </div>

          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="text-lg">Ta demande d'information</CardTitle>
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

                  <FormField
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de demande</FormLabel>
                        <Select
                          onValueChange={handleRequestTypeChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-request-type">
                              <SelectValue placeholder="Que souhaites-tu savoir ?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {requestTypes.map((type) => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                                data-testid={`option-request-${type.value}`}
                              >
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specificQuestion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question spécifique (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décris plus précisément ce que tu recherches..."
                            className="resize-none min-h-[100px]"
                            {...field}
                            data-testid="input-specific-question"
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
                    data-testid="button-submit-informations"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⚡</span>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Envoyer ma demande
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
