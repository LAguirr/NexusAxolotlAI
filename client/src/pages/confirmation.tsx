import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Home, CheckCircle, Sparkles, Gift, Users, MessageSquare, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubmissionResponse, MissionType } from "@shared/schema";
import { useChat } from "@/lib/chat-context";

const missionIcons: Record<MissionType, typeof Gift> = {
  don: Gift,
  benevolat: Users,
  contact: MessageSquare,
  informations: HelpCircle,
};

const missionLabels: Record<MissionType, string> = {
  don: "Don",
  benevolat: "Bénévolat",
  contact: "Contact",
  informations: "Informations",
};

export default function Confirmation() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const [showConfetti, setShowConfetti] = useState(true);
  const { setMessage } = useChat();

  const { data: submission, isLoading, error } = useQuery<SubmissionResponse>({
    queryKey: ["/api/submissions", params.id],
    enabled: !!params.id,
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (submission) {
      setMessage(`Mission accomplie, ${submission.firstName} ! Tu as fait un grand pas pour le Nexus. Nous te remercions du fond du code !`);
    } else {
      setMessage("Chargement de ta confirmation...");
    }
  }, [submission, setMessage]);

  const Icon = submission ? missionIcons[submission.missionType as MissionType] : CheckCircle;
  const missionLabel = submission ? missionLabels[submission.missionType as MissionType] : "Mission";

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Une erreur est survenue</p>
            <Button onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">

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

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                y: -20,
                x: Math.random() * window.innerWidth,
                rotate: 0,
                opacity: 1
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: 0
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B'][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </div>
      )}

      <div className="pt-32 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-green-500/10 rounded-full mb-6"
            >
              <CheckCircle className="w-12 h-12 text-green-500" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4"
            >
              Mission Accomplie !
            </motion.h1>

            {isLoading ? (
              <Skeleton className="h-6 w-48 mx-auto" />
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-muted-foreground"
              >
                Merci, <span className="text-primary font-semibold">{submission?.firstName}</span> !
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-2xl border-2 overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/80">Mission complétée</p>
                    <p className="text-xl font-bold">{missionLabel}</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 sm:p-8">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-6">
                      <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div className="prose prose-lg dark:prose-invert">
                        <p
                          className="text-foreground leading-relaxed text-lg"
                          data-testid="text-ai-message"
                        >
                          {submission?.aiThankYouMessage || "Merci pour ta contribution au Nexus !"}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6 mt-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium text-foreground">
                            {submission?.createdAt
                              ? new Date(submission.createdAt).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })
                              : '-'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Référence</p>
                          <p className="font-mono text-foreground">
                            {submission?.id?.slice(0, 8) || '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-4 mt-6">
                      <p className="text-sm text-center text-muted-foreground">
                        Ton soutien en <span className="font-semibold text-foreground">{new Date().getFullYear()}</span> est crucial pour notre progression !
                        Reste connecté pour suivre nos exploits tout au long de l'année.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/")}
              data-testid="button-new-mission"
            >
              <Home className="w-5 h-5 mr-2" />
              Nouvelle mission
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
