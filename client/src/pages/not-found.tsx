import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AIAvatar } from "@/components/ai-avatar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <AIAvatar 
        message="Oups ! Tu sembles t'être perdu dans les méandres du Nexus. Cette page n'existe pas dans notre dimension. Laisse-moi te ramener vers un territoire connu !"
      />

      <header className="fixed top-4 left-4 z-40">
        <ThemeToggle />
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4"
      >
        <Card className="max-w-md shadow-xl border-2">
          <CardContent className="pt-8 pb-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </motion.div>

            <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Page introuvable dans le Nexus
            </p>

            <Button
              size="lg"
              onClick={() => navigate("/")}
              className="w-full"
              data-testid="button-return-home"
            >
              <Home className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
