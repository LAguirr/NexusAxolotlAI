import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axolotlImage from "@assets/generated_images/axolotl_ai_robot_mascot.png";

interface AIAvatarProps {
  message: string;
  isTyping?: boolean;
  className?: string;
}

export function AIAvatar({ message, isTyping = false, className = "" }: AIAvatarProps) {
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (message !== displayedMessage) {
      setIsAnimating(true);
      const timeout = setTimeout(() => {
        setDisplayedMessage(message);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [message, displayedMessage]);

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-start gap-3 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={displayedMessage}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="speech-bubble relative max-w-xs sm:max-w-sm bg-card border-2 border-primary/30 rounded-2xl p-4 shadow-xl"
          data-testid="ai-speech-bubble"
        >
          {isTyping || isAnimating ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="typing-dot w-2 h-2 bg-primary rounded-full"></span>
              <span className="typing-dot w-2 h-2 bg-primary rounded-full"></span>
              <span className="typing-dot w-2 h-2 bg-primary rounded-full"></span>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-card-foreground leading-relaxed">
              {displayedMessage}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden ai-glow animate-float bg-gradient-to-br from-primary/20 to-accent/20 p-1">
          <img
            src={axolotlImage}
            alt="Axolotl - Votre assistant IA"
            className="w-full h-full object-cover rounded-full"
            data-testid="img-ai-avatar"
          />
        </div>
        <motion.div
          className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </div>
  );
}

export function AIAvatarMini({ message, onClick }: { message: string; onClick?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-16 right-0 max-w-[280px] bg-card border-2 border-primary/30 rounded-2xl p-3 shadow-xl mb-2"
          >
            <p className="text-sm text-card-foreground">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsExpanded(!isExpanded);
          onClick?.();
        }}
        className="w-14 h-14 rounded-full overflow-hidden ai-glow bg-gradient-to-br from-primary/20 to-accent/20 p-0.5"
        data-testid="button-ai-avatar-mini"
      >
        <img
          src={axolotlImage}
          alt="Axolotl"
          className="w-full h-full object-cover rounded-full"
        />
      </motion.button>
    </div>
  );
}
