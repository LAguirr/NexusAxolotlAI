import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, ArrowRight, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/lib/chat-context";

import axolotlImage from "@assets/generated_images/axolotl_ai_robot_mascot.png";

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  action?: {
    label: string;
    path: string;
  };
}

interface IntentResponse {
  intent: string;
  confidence: number;
  suggestion: string;
  redirectPath: string | null;
}

const translations = {
  fr: {
    welcome: "Salut voyageur ! Explique-moi ce que tu veux faire et je te guide vers la bonne mission.",
    title: "Axolotl - Assistant IA",
    placeholder: "Décris ce que tu veux faire...",
    example: 'Exemple: "Je veux aider mais j\'ai pas trop d\'argent"',
    error: "Oups, mes circuits ont eu un bug ! Essaie de reformuler ou choisis directement une mission ci-dessous.",
    connectionErrorTitle: "Connexion IA interrompue",
    connectionErrorDesc: "Réessaie ou choisis une mission directement.",
    actions: {
      don: "Ouvrir la section Don",
      benevolat: "Rejoindre la Guilde",
      contact: "Ouvrir le formulaire Contact",
      informations: "Demander des Infos",
      explore: "Explorer"
    }
  },
  en: {
    welcome: "Hello traveler! Explain what you want to do and I'll guide you to the right mission.",
    title: "Axolotl - AI Assistant",
    placeholder: "Describe what you want to do...",
    example: 'Example: "I want to help but I don\'t have much money"',
    error: "Oops, my circuits had a bug! Try rephrasing or choose a mission directly below.",
    connectionErrorTitle: "AI Connection Interrupted",
    connectionErrorDesc: "Retry or choose a mission directly.",
    actions: {
      don: "Open Donation Section",
      benevolat: "Join the Guild",
      contact: "Open Contact Form",
      informations: "Request Info",
      explore: "Explore"
    }
  }
};

export function AIChatWidget() {
  const { isOpen, setIsOpen, message, language } = useChat();
  const t = translations[language];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "ai",
      content: t.welcome,
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Reset welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      // If the first message is the welcome message, update it
      if (prev.length > 0 && prev[0].id === "welcome") {
        return [
          {
            ...prev[0],
            content: t.welcome,
          },
          ...prev.slice(1),
        ];
      }
      return prev;
    });
  }, [language, t.welcome]);

  const analyzeIntentMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/analyze-intent", { message, language });
      return await response.json() as IntentResponse;
    },
    onSuccess: (data) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "ai",
        content: data.suggestion,
        action: data.redirectPath ? {
          label: getActionLabel(data.intent),
          path: data.redirectPath,
        } : undefined,
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: () => {
      toast({
        title: t.connectionErrorTitle,
        description: t.connectionErrorDesc,
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: t.error,
        },
      ]);
    },
  });

  const getActionLabel = (intent: string): string => {
    const labels: Record<string, string> = {
      don: t.actions.don,
      benevolat: t.actions.benevolat,
      contact: t.actions.contact,
      informations: t.actions.informations,
    };
    return labels[intent] || t.actions.explore;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    analyzeIntentMutation.mutate(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAction = (path: string) => {
    // We don't close the chat here anymore to keep it persistent
    // setIsOpen(false); 
    navigate(path);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-50 w-[350px] max-w-[calc(100vw-2rem)]"
          >
            <Card className="overflow-hidden shadow-2xl border-2 border-primary/20">
              <div className="bg-gradient-to-r from-primary to-accent p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-black" />
                  <span className="font-bold text-black text-sm">{t.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-black hover:bg-black/10 h-7 w-7"
                  data-testid="button-close-chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-[300px] overflow-y-auto p-3 space-y-3 bg-background/95 backdrop-blur">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 ${msg.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                        }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      {msg.action && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="mt-2 w-full text-xs"
                          onClick={() => handleAction(msg.action!.path)}
                          data-testid={`button-go-to-${msg.action.path.replace(/^\//, "").replace(/\//g, "-")}`}
                        >
                          {msg.action.label}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {analyzeIntentMutation.isPending && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary/60 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-primary/60 rounded-full typing-dot" />
                        <span className="w-2 h-2 bg-primary/60 rounded-full typing-dot" />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.placeholder}
                    className="flex-1 text-sm"
                    disabled={analyzeIntentMutation.isPending}
                    data-testid="input-chat-message"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || analyzeIntentMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {t.example}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <div className="fixed bottom-4 right-4 z-50 flex items-end gap-3">
            {message && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="speech-bubble relative max-w-xs sm:max-w-sm bg-card border-2 border-primary/30 rounded-2xl p-4 shadow-xl mb-4 mr-2"
                data-testid="ai-speech-bubble"
              >
                <p className="text-sm sm:text-base text-card-foreground leading-relaxed">
                  {message}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="relative cursor-pointer"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-open-chat"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden ai-glow animate-float bg-gradient-to-br from-primary/20 to-accent/20 p-1">
                <img
                  src={axolotlImage}
                  alt="Axolotl - Votre assistant IA"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <motion.div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
