import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Gift, Users, MessageSquare, HelpCircle } from "lucide-react";
import { AIAvatar } from "@/components/ai-avatar";
import { MissionCard } from "@/components/mission-card";
import { ThemeToggle } from "@/components/theme-toggle";

const missions = [
  {
    id: "don",
    title: "Offrir un Don",
    description: "Soutenez notre cause avec une contribution financière. Chaque don compte pour notre mission.",
    icon: Gift,
    path: "/mission/don",
  },
  {
    id: "benevolat",
    title: "Rejoindre la Guilde",
    description: "Devenez bénévole et partagez vos compétences pour renforcer notre communauté.",
    icon: Users,
    path: "/mission/benevolat",
  },
  {
    id: "contact",
    title: "Établir le Contact",
    description: "Envoyez-nous un message. Nous sommes à l'écoute de vos idées et questions.",
    icon: MessageSquare,
    path: "/mission/contact",
  },
  {
    id: "informations",
    title: "Demander des Infos",
    description: "Besoin d'informations ? Posez vos questions et nous vous répondrons rapidement.",
    icon: HelpCircle,
    path: "/mission/informations",
  },
];

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute inset-0 circuit-pattern opacity-20" />
      
      <AIAvatar 
        message="Salutations, voyageur des flux de données ! Je suis Axolotl, ton guide dans le Nexus. Quelle mission choisis-tu ?"
      />

      <header className="fixed top-4 left-4 z-40">
        <ThemeToggle />
      </header>

      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-accent/5 to-background" />
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 sm:pt-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-full border border-primary/30 glow-border backdrop-blur-sm">
              <span className="opacity-60">[</span> Le Nexus Connecté - {new Date().getFullYear()} <span className="opacity-60">]</span>
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="holographic">L'Écho Personnalisé</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Bienvenue dans le Nexus, voyageur. Notre communauté a besoin de toi. 
            Choisis ta mission et ensemble, renforçons les liens de notre réseau.
          </p>
        </motion.div>
      </section>

      <section className="relative py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Quelle mission choisis-tu, voyageur ?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Chaque choix compte. Sélectionne la voie qui correspond à ton intention.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {missions.map((mission, index) => (
              <MissionCard
                key={mission.id}
                title={mission.title}
                description={mission.description}
                icon={mission.icon}
                onClick={() => navigate(mission.path)}
                delay={0.5 + index * 0.1}
                testId={`card-mission-${mission.id}`}
              />
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-primary/20 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary/80">///</span> Le Nexus Connecté - Propulsé par la puissance du code depuis {new Date().getFullYear()} <span className="text-primary/80">///</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
