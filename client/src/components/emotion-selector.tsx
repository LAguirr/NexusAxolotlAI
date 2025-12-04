import { motion } from "framer-motion";
import { Sword, Heart, Laugh } from "lucide-react";
import { EmotionType } from "@shared/schema";

interface EmotionSelectorProps {
  selected: EmotionType; 
  onChange: (emotion: EmotionType) => void;
}

const emotions = [
  { 
    type: "epique" as EmotionType, 
    icon: Sword, 
    label: "Épique", 
    description: "Style héroïque et grandiose" 
  },
  { 
    type: "bienveillant" as EmotionType, 
    icon: Heart, 
    label: "Bienveillant", 
    description: "Chaleureux et attentionné" 
  },
  { 
    type: "drole" as EmotionType, 
    icon: Laugh, 
    label: "Drôle", 
    description: "Léger et humoristique" 
  },
];

export function EmotionSelector({ selected, onChange }: EmotionSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Style du message de remerciement
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {emotions.map(({ type, icon: Icon, label, description }) => (
          <motion.button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            whileTap={{ scale: 0.98 }}
            className={`relative p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              selected === type
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
            data-testid={`button-emotion-${type}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selected === type ? "bg-primary/20" : "bg-muted"
              }`}>
                <Icon className={`w-5 h-5 ${selected === type ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className={`font-medium ${selected === type ? "text-primary" : "text-foreground"}`}>
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              </div>
            </div>
            {selected === type && (
              <motion.div
                layoutId="emotion-indicator"
                className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
