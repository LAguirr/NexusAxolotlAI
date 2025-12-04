import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Users, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIAvatar } from "@/components/ai-avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { EmotionSelector } from "@/components/emotion-selector";
import { volunteerFormSchema, type VolunteerForm, type EmotionType, type SubmissionResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const availableSkills = [
  { id: "developpement", label: "Développement Web/Mobile" },
  { id: "design", label: "Design & UX" },
  { id: "communication", label: "Communication & Réseaux sociaux" },
  { id: "evenementiel", label: "Organisation d'événements" },
  { id: "redaction", label: "Rédaction & Contenu" },
  { id: "pedagogie", label: "Pédagogie & Formation" },
  { id: "technique", label: "Support technique" },
  { id: "autre", label: "Autre compétence" },
];

const availabilityOptions = [
  { value: "quelques_heures", label: "Quelques heures par mois" },
  { value: "un_jour", label: "Un jour par mois" },
  { value: "plusieurs_jours", label: "Plusieurs jours par mois" },
  { value: "regulier", label: "Engagement régulier (hebdomadaire)" },
  { value: "ponctuel", label: "Missions ponctuelles uniquement" },
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

export default function MissionBenevolat() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [aiMessage, setAiMessage] = useState("Bienvenue, futur Chevalier du Code ! Rejoins notre guilde de bénévoles. Partage tes compétences et ta disponibilité pour renforcer notre communauté.");

  const form = useForm<VolunteerForm>({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      missionType: "benevolat",
      firstName: "",
      lastName: "",
      email: "",
      skills: [],
      availability: "",
      motivation: "",
      emotionPreference: "bienveillant",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: VolunteerForm) => {
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

  const selectedSkills = form.watch("skills");

  const handleSkillToggle = (skillId: string, checked: boolean) => {
    const current = form.getValues("skills");
    if (checked) {
      form.setValue("skills", [...current, skillId]);
      if (current.length === 0) {
        setAiMessage("Excellente compétence ! Continue à nous montrer tes talents.");
      } else if (current.length >= 2) {
        setAiMessage("Impressionnant ! Tu es un véritable couteau suisse du Nexus !");
      }
    } else {
      form.setValue("skills", current.filter((s) => s !== skillId));
    }
  };

  const onSubmit = (data: VolunteerForm) => {
    setAiMessage("Enregistrement de ta candidature... Bienvenue dans la guilde !");
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
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Rejoindre la Guilde
            </h1>
            <p className="text-muted-foreground">
              Deviens bénévole et partage tes talents avec notre communauté
            </p>
          </div>

          <Card className="shadow-xl border-2">
            <CardHeader>
              <CardTitle className="text-lg">Ta candidature</CardTitle>
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
                    name="skills"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tes compétences</FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          {availableSkills.map((skill) => (
                            <label
                              key={skill.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedSkills.includes(skill.id)
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/40"
                              }`}
                            >
                              <Checkbox
                                checked={selectedSkills.includes(skill.id)}
                                onCheckedChange={(checked) => 
                                  handleSkillToggle(skill.id, checked as boolean)
                                }
                                data-testid={`checkbox-skill-${skill.id}`}
                              />
                              <span className={`text-sm ${
                                selectedSkills.includes(skill.id) 
                                  ? "text-foreground font-medium" 
                                  : "text-muted-foreground"
                              }`}>
                                {skill.label}
                              </span>
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponibilité</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-availability">
                              <SelectValue placeholder="Sélectionne ta disponibilité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availabilityOptions.map((option) => (
                              <SelectItem 
                                key={option.value} 
                                value={option.value}
                                data-testid={`option-availability-${option.value}`}
                              >
                                {option.label}
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
                    name="motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ta motivation (optionnel)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Pourquoi veux-tu rejoindre notre guilde ?"
                            className="resize-none min-h-[100px]"
                            {...field}
                            data-testid="input-motivation"
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
                    data-testid="button-submit-benevolat"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⚡</span>
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        Rejoindre la guilde
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
