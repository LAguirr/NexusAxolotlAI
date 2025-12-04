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

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "ai",
      content: "Salut voyageur ! Explique-moi ce que tu veux faire et je te guide vers la bonne mission.",
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
  }, [messages]);

  const analyzeIntentMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/analyze-intent", { message });
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
        title: "Connexion IA interrompue",
        description: "Réessaie ou choisis une mission directement.",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: "Oups, mes circuits ont eu un bug ! Essaie de reformuler ou choisis directement une mission ci-dessous.",
        },
      ]);
    },
  });

  const getActionLabel = (intent: string): string => {
    const labels: Record<string, string> = {
      don: "Ouvrir la section Don",
      benevolat: "Rejoindre la Guilde",
      contact: "Ouvrir le formulaire Contact",
      informations: "Demander des Infos",
    };
    return labels[intent] || "Explorer";
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
    setIsOpen(false);
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
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="font-bold text-white text-sm">Axolotl - Assistant IA</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-7 w-7"
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
                      className={`max-w-[85%] rounded-lg p-3 ${
                        msg.type === "user"
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
                    placeholder="Décris ce que tu veux faire..."
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
                  Exemple: "Je veux aider mais j'ai pas trop d'argent"
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="fixed bottom-4 right-4 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 relative"
          data-testid="button-open-chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          )}
        </Button>
      </motion.div>
    </>
  );
}
