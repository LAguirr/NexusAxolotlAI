import OpenAI from "openai";
import type { MissionType, EmotionType } from "@shared/schema";
import type { Submission } from "./storage";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const emotionStyles: Record<EmotionType, string> = {
  epique: "Utilise un style héroïque et épique, comme un maître de jeu RPG. Utilise des termes comme 'Chevalier du Code', 'Nexus', 'quête', 'légende'. Sois grandiloquent et inspirant.",
  bienveillant: "Utilise un style chaleureux, attentionné et sincère. Exprime une vraie gratitude et de l'empathie. Sois encourageant et positif.",
  drole: "Utilise un style léger et humoristique. Fais des jeux de mots geek/tech, utilise l'ironie positive. Reste respectueux mais amuse l'utilisateur.",
};

const missionContexts: Record<MissionType, string> = {
  don: "L'utilisateur a fait un don financier pour soutenir l'association.",
  benevolat: "L'utilisateur a proposé ses compétences comme bénévole pour rejoindre l'équipe.",
  contact: "L'utilisateur a envoyé un message de contact à l'association.",
  informations: "L'utilisateur a demandé des informations sur l'association.",
};

export async function generateThankYouMessage(submission: Submission): Promise<string> {
  const currentYear = new Date().getFullYear();
  const emotion = submission.emotionPreference || "bienveillant";
  const emotionStyle = emotionStyles[emotion];
  const missionContext = missionContexts[submission.missionType];

  let specificDetails = "";
  
  switch (submission.missionType) {
    case "don":
      specificDetails = `Montant du don: ${submission.amount}€, Fréquence: ${submission.frequency}.`;
      if (submission.customMessage) {
        specificDetails += ` Message personnel: "${submission.customMessage}"`;
      }
      break;
    case "benevolat":
      specificDetails = `Compétences proposées: ${submission.skills.join(", ")}. Disponibilité: ${submission.availability}.`;
      if (submission.motivation) {
        specificDetails += ` Motivation: "${submission.motivation}"`;
      }
      break;
    case "contact":
      specificDetails = `Sujet du message: "${submission.subject}".`;
      break;
    case "informations":
      specificDetails = `Type de demande: ${submission.requestType}.`;
      if (submission.specificQuestion) {
        specificDetails += ` Question spécifique: "${submission.specificQuestion}"`;
      }
      break;
  }

  const prompt = `Tu es Axolotl, l'assistant IA du Nexus Connecté, une association liée à la Nuit de l'Info ${currentYear}.

${emotionStyle}

Contexte: ${missionContext}
Nom de l'utilisateur: ${submission.firstName} ${submission.lastName}
${specificDetails}

Génère un message de remerciement personnalisé en 2-3 phrases (maximum 150 mots). 
- Mentionne le prénom de l'utilisateur
- Fais référence à sa mission spécifique
- Mentionne l'année ${currentYear}
- Utilise le thème du Nexus et de la communauté tech
- Ne commence pas par "Salutations" car c'est déjà utilisé ailleurs

Réponds uniquement avec le message de remerciement, sans guillemets ni formatage supplémentaire.`;

  if (!openai) {
    console.log("OpenAI not configured, using fallback message");
    return getFallbackMessage(submission, currentYear);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 256,
    });

    return response.choices[0].message.content || getFallbackMessage(submission, currentYear);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return getFallbackMessage(submission, currentYear);
  }
}

function getFallbackMessage(submission: Submission, year: number): string {
  const { firstName, missionType } = submission;
  
  const fallbacks: Record<MissionType, string> = {
    don: `Merci infiniment ${firstName} ! Ton don renforce les fondations du Nexus en ${year}. Chaque contribution nous rapproche de notre objectif et permet à notre communauté de continuer à innover ensemble.`,
    benevolat: `Bienvenue dans la guilde, ${firstName} ! En ${year}, le Nexus a besoin de talents comme le tien. Tes compétences seront précieuses pour notre communauté et nous avons hâte de collaborer avec toi.`,
    contact: `Message bien reçu, ${firstName} ! Les Agents du Nexus en ${year} sont mobilisés pour te répondre. Ta voix compte dans notre communauté et nous te contacterons très prochainement.`,
    informations: `Ta demande est enregistrée, ${firstName} ! L'équipe du Nexus ${year} va analyser ta requête et te fournir toutes les informations dont tu as besoin. Reste connecté !`,
  };

  return fallbacks[missionType];
}

export async function classifyContactRequest(message: string, subject: string): Promise<{
  category: string;
  priority: string;
  summary: string;
}> {
  if (!openai) {
    return {
      category: "autre",
      priority: "moyenne",
      summary: subject || "Demande de contact",
    };
  }

  const prompt = `Analyse cette demande de contact et classifie-la.

Sujet: ${subject}
Message: ${message}

Réponds en JSON avec ce format exact:
{
  "category": "technique|generale|inscription|plainte|felicitations|autre",
  "priority": "haute|moyenne|basse",
  "summary": "résumé en une phrase"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 128,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      category: result.category || "autre",
      priority: result.priority || "moyenne",
      summary: result.summary || "Demande de contact",
    };
  } catch (error) {
    console.error("OpenAI classification error:", error);
    return {
      category: "autre",
      priority: "moyenne",
      summary: "Demande de contact",
    };
  }
}

export async function analyzeUserIntent(userMessage: string): Promise<{
  intent: "don" | "benevolat" | "contact" | "informations" | "unclear";
  confidence: number;
  suggestion: string;
  redirectPath: string | null;
}> {
  const currentYear = new Date().getFullYear();
  
  if (!openai) {
    return analyzeIntentFallback(userMessage);
  }

  const prompt = `Tu es Axolotl, l'assistant IA du Nexus Connecté pour la Nuit de l'Info ${currentYear}.

Analyse le message de l'utilisateur et détermine son intention parmi ces missions:
- don: L'utilisateur veut faire un don financier
- benevolat: L'utilisateur veut devenir bénévole
- contact: L'utilisateur veut envoyer un message/contacter l'équipe
- informations: L'utilisateur veut des informations sur l'association
- unclear: L'intention n'est pas claire

Message de l'utilisateur: "${userMessage}"

Réponds en JSON avec ce format exact:
{
  "intent": "don|benevolat|contact|informations|unclear",
  "confidence": 0.0 à 1.0,
  "suggestion": "Message court et engageant pour guider l'utilisateur vers la bonne section"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 256,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const intent = result.intent || "unclear";
    
    const pathMap: Record<string, string | null> = {
      don: "/mission/don",
      benevolat: "/mission/benevolat",
      contact: "/mission/contact",
      informations: "/mission/informations",
      unclear: null,
    };

    return {
      intent,
      confidence: result.confidence || 0.5,
      suggestion: result.suggestion || "Dis-moi en quoi je peux t'aider !",
      redirectPath: pathMap[intent],
    };
  } catch (error) {
    console.error("OpenAI intent analysis error:", error);
    return analyzeIntentFallback(userMessage);
  }
}

function analyzeIntentFallback(message: string): {
  intent: "don" | "benevolat" | "contact" | "informations" | "unclear";
  confidence: number;
  suggestion: string;
  redirectPath: string | null;
} {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("don") || lowerMessage.includes("argent") || lowerMessage.includes("aider financ") || lowerMessage.includes("contribuer") || lowerMessage.includes("soutenir")) {
    return {
      intent: "don",
      confidence: 0.8,
      suggestion: "Tu veux nous soutenir financièrement ? C'est génial ! Je t'ouvre la section Don.",
      redirectPath: "/mission/don",
    };
  }
  
  if (lowerMessage.includes("bénévol") || lowerMessage.includes("rejoindre") || lowerMessage.includes("guilde") || lowerMessage.includes("compétence") || lowerMessage.includes("temps")) {
    return {
      intent: "benevolat",
      confidence: 0.8,
      suggestion: "Tu veux rejoindre notre équipe ? Super ! Je t'ouvre la section Bénévolat.",
      redirectPath: "/mission/benevolat",
    };
  }
  
  if (lowerMessage.includes("question") || lowerMessage.includes("info") || lowerMessage.includes("savoir") || lowerMessage.includes("comment")) {
    return {
      intent: "informations",
      confidence: 0.7,
      suggestion: "Tu cherches des informations ? Je t'ouvre la section Demande d'infos.",
      redirectPath: "/mission/informations",
    };
  }
  
  if (lowerMessage.includes("contact") || lowerMessage.includes("message") || lowerMessage.includes("parler") || lowerMessage.includes("écrire")) {
    return {
      intent: "contact",
      confidence: 0.7,
      suggestion: "Tu veux nous contacter ? Je t'ouvre la section Contact.",
      redirectPath: "/mission/contact",
    };
  }
  
  return {
    intent: "unclear",
    confidence: 0.3,
    suggestion: "Dis-moi ce que tu souhaites faire : faire un don, devenir bénévole, nous contacter, ou demander des informations ?",
    redirectPath: null,
  };
}

export async function suggestDonationAmount(userMessage: string): Promise<{
  suggestedAmount: number;
  frequency: "ponctuel" | "mensuel" | "annuel";
  reason: string;
  message: string;
}> {
  const currentYear = new Date().getFullYear();
  
  if (!openai) {
    return suggestDonationFallback(userMessage);
  }

  const prompt = `Tu es Axolotl, l'assistant IA du Nexus Connecté pour la Nuit de l'Info ${currentYear}.

L'utilisateur veut faire un don et a dit: "${userMessage}"

Analyse son message et suggère un montant adapté à sa situation.
Indices à considérer:
- S'il mentionne un budget limité → suggérer 5-10€
- S'il semble motivé mais indécis → suggérer 25€
- S'il semble très enthousiaste → suggérer 50-100€
- S'il mentionne la régularité → suggérer mensuel

Réponds en JSON avec ce format exact:
{
  "suggestedAmount": nombre entre 5 et 100,
  "frequency": "ponctuel|mensuel|annuel",
  "reason": "Thème court lié au Nexus/Nuit de l'Info ${currentYear}",
  "message": "Message personnalisé encourageant de 1-2 phrases"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 256,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      suggestedAmount: result.suggestedAmount || 10,
      frequency: result.frequency || "ponctuel",
      reason: result.reason || `Soutien au Nexus ${currentYear}`,
      message: result.message || "Chaque contribution compte !",
    };
  } catch (error) {
    console.error("OpenAI donation suggestion error:", error);
    return suggestDonationFallback(userMessage);
  }
}

function suggestDonationFallback(message: string): {
  suggestedAmount: number;
  frequency: "ponctuel" | "mensuel" | "annuel";
  reason: string;
  message: string;
} {
  const lowerMessage = message.toLowerCase();
  const currentYear = new Date().getFullYear();
  
  if (lowerMessage.includes("pas trop") || lowerMessage.includes("peu") || lowerMessage.includes("petit") || lowerMessage.includes("budget")) {
    return {
      suggestedAmount: 5,
      frequency: "ponctuel",
      reason: `Premier pas dans le Nexus ${currentYear}`,
      message: "Même 5€ font une vraie différence ! Chaque contribution renforce notre communauté.",
    };
  }
  
  if (lowerMessage.includes("régulier") || lowerMessage.includes("mensuel") || lowerMessage.includes("chaque mois")) {
    return {
      suggestedAmount: 10,
      frequency: "mensuel",
      reason: `Gardien mensuel du Nexus ${currentYear}`,
      message: "Un don mensuel nous permet de planifier à long terme. Tu deviens un véritable pilier !",
    };
  }
  
  if (lowerMessage.includes("généreux") || lowerMessage.includes("beaucoup") || lowerMessage.includes("maximum")) {
    return {
      suggestedAmount: 100,
      frequency: "ponctuel",
      reason: `Chevalier du Code ${currentYear}`,
      message: "Quelle générosité ! Avec ce don, tu deviens un véritable Chevalier du Code !",
    };
  }
  
  return {
    suggestedAmount: 25,
    frequency: "ponctuel",
    reason: `Soutien au Nexus ${currentYear}`,
    message: "25€ est un excellent choix pour soutenir nos projets ! Tu fais partie des bâtisseurs du Nexus.",
  };
}

export async function chatWithAssistant(userMessage: string, context?: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  if (!openai) {
    return "Je suis Axolotl, ton guide dans le Nexus ! Malheureusement, mes circuits IA sont temporairement hors ligne. Tu peux quand même explorer les différentes missions ci-dessous.";
  }

  const prompt = `Tu es Axolotl, l'assistant IA amical et futuriste du Nexus Connecté pour la Nuit de l'Info ${currentYear}.

Ton rôle:
- Guider les utilisateurs vers la bonne mission (don, bénévolat, contact, informations)
- Répondre de façon concise et engageante (max 2-3 phrases)
- Utiliser un vocabulaire tech/futuriste mais accessible
- Être chaleureux et encourageant

${context ? `Contexte: ${context}` : ""}

Message de l'utilisateur: "${userMessage}"

Réponds directement sans guillemets ni formatage.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 150,
    });

    return response.choices[0].message.content || "Dis-moi comment je peux t'aider !";
  } catch (error) {
    console.error("OpenAI chat error:", error);
    return "Mes circuits ont un petit bug ! Essaie de reformuler ta demande ou explore les missions ci-dessous.";
  }
}
