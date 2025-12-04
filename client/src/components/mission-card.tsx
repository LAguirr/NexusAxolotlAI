import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MissionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  delay?: number;
  testId: string;
}

export function MissionCard({ title, description, icon: Icon, onClick, delay = 0, testId }: MissionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card
        onClick={onClick}
        className="group cursor-pointer h-full min-h-[220px] bg-card border-2 border-transparent hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-xl relative overflow-hidden"
        data-testid={testId}
      >
        <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full border-4 border-gray-400/30 group-hover:border-gray-300/50 transition-all duration-500 group-hover:rotate-45" />
        <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full border-2 border-gray-500/20 group-hover:border-gray-400/40 transition-all duration-700 group-hover:-rotate-12" />
        <CardContent className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center gap-4 relative z-10">
          <motion.div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/20 transition-colors duration-300"
            whileHover={{ rotate: 5, scale: 1.05 }}
          >
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>

          <motion.div
            className="mt-auto pt-2"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <span className="text-sm font-medium text-primary">
              Choisir cette mission
            </span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
