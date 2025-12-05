import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";
import { useChat } from "@/lib/chat-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmotionSelector } from "@/components/emotion-selector";
import { contactFormSchema, type ContactForm, type EmotionType, type SubmissionResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const subjectSuggestions = [
  "Question générale",
  "Question sur les dons",
  "Question sur le bénévolat",
  "Demande de partenariat",
  "Demande d'information",
  "Demande de collaboration",
  "Proposition de projet",
  "Problème technique",
  "Retour d'expérience",
  "Réclamation",
  "Suggestion d'amélioration",
  "Autre demande",
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

export default function MissionContact() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setMessage, language } = useChat();

  const initialMessages = {
    fr: "Tu souhaites établir le contact ! Je suis tout ouïe. Décris-nous ta requête et nos Agents de Support te répondront dans les plus brefs délais.",
    en: "You wish to establish contact! I am all ears. Describe your request and our Support Agents will answer you as soon as possible."
  };

  const [aiMessage, setAiMessage] = useState(initialMessages[language]);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setAiMessage(initialMessages[language]);
  }, [language]);

  useEffect(() => {
    setMessage(aiMessage);
  }, [aiMessage, setMessage]);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      missionType: "contact",
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
      emotionPreference: "bienveillant",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const response = await apiRequest("POST", "/api/submissions", data);
      return await response.json() as SubmissionResponse;
    },
    onSuccess: (data) => {
      navigate(`/confirmation/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleMessageChange = (value: string) => {
    setCharCount(value.length);
    if (value.length > 200) {
      setAiMessage("Message détaillé ! Nos équipes apprécient les descriptions complètes.");
    } else if (value.length > 50) {
      setAiMessage("Très bien ! Continue à nous expliquer ta demande.");
    }
  };

  const onSubmit = (data: ContactForm) => {
    setAiMessage("Transmission de ton message vers nos serveurs centraux...");
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
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Établir le Contact
            </h1>
            <p className="text-muted-foreground">
              Envoie-nous un message et nous te répondrons rapidement
            </p>
          </div>

          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="text-lg">Ton message</CardTitle>
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
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sujet</FormLabel>
                        <FormControl>
                          <AutocompleteInput
                            placeholder="De quoi souhaites-tu nous parler ?"
                            suggestions={subjectSuggestions}
                            value={field.value}
                            onChange={field.onChange}
                            data-testid="input-subject"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              placeholder="Détaille ta demande ici..."
                              className="resize-none min-h-[150px]"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleMessageChange(e.target.value);
                              }}
                              data-testid="input-message"
                            />
                            <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                              {charCount} caractères
                            </span>
                          </div>
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
                    data-testid="button-submit-contact"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⚡</span>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer le message
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
