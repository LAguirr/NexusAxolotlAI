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

export async function analyzeUserIntent(userMessage: string, language: string = 'fr'): Promise<{
  intent: "don" | "benevolat" | "contact" | "informations" | "unclear";
  confidence: number;
  suggestion: string;
  redirectPath: string | null;
}> {
  const currentYear = new Date().getFullYear();

  if (!openai) {
    return analyzeIntentFallback(userMessage, language);
  }

  const prompt = `You are Axolotl, the AI assistant of the Connected Nexus for the Night of Info ${currentYear}.

Analyze the user's message and determine their intent among these missions:
- don: The user wants to make a financial donation
- benevolat: The user wants to become a volunteer
- contact: The user wants to send a message/contact the team
- informations: The user wants information about the association
- unclear: The intent is not clear

User message: "${userMessage}"
Target language for response: "${language}"

Respond in JSON with this exact format:
{
  "intent": "don|benevolat|contact|informations|unclear",
  "confidence": 0.0 to 1.0,
  "suggestion": "Short and engaging message to guide the user to the right section, written in ${language}"
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
      suggestion: result.suggestion || (language === 'fr' ? "Dis-moi en quoi je peux t'aider !" : "Tell me how I can help you!"),
      redirectPath: pathMap[intent],
    };
  } catch (error) {
    console.error("OpenAI intent analysis error:", error);
    return analyzeIntentFallback(userMessage, language);
  }
}

function analyzeIntentFallback(message: string, language: string = 'fr'): {
  intent: "don" | "benevolat" | "contact" | "informations" | "unclear";
  confidence: number;
  suggestion: string;
  redirectPath: string | null;
} {
  const lowerMessage = message.toLowerCase();
  const isFr = language === 'fr';

  if (lowerMessage.includes("don") || lowerMessage.includes("argent") || lowerMessage.includes("aider financ") || lowerMessage.includes("contribuer") || lowerMessage.includes("soutenir") ||
    lowerMessage.includes("donate") || lowerMessage.includes("money") || lowerMessage.includes("help financ") || lowerMessage.includes("contribute") || lowerMessage.includes("support")) {
    return {
      intent: "don",
      confidence: 0.8,
      suggestion: isFr
        ? "Tu veux nous soutenir financièrement ? C'est génial ! Je t'ouvre la section Don."
        : "You want to support us financially? That's great! I'm opening the Donation section.",
      redirectPath: "/mission/don",
    };
  }

  if (lowerMessage.includes("bénévol") || lowerMessage.includes("rejoindre") || lowerMessage.includes("guilde") || lowerMessage.includes("compétence") || lowerMessage.includes("temps") ||
    lowerMessage.includes("volunteer") || lowerMessage.includes("join") || lowerMessage.includes("guild") || lowerMessage.includes("skill") || lowerMessage.includes("time")) {
    return {
      intent: "benevolat",
      confidence: 0.8,
      suggestion: isFr
        ? "Tu veux rejoindre notre équipe ? Super ! Je t'ouvre la section Bénévolat."
        : "You want to join our team? Awesome! I'm opening the Volunteer section.",
      redirectPath: "/mission/benevolat",
    };
  }

  if (lowerMessage.includes("question") || lowerMessage.includes("info") || lowerMessage.includes("savoir") || lowerMessage.includes("comment") ||
    lowerMessage.includes("ask") || lowerMessage.includes("know") || lowerMessage.includes("how")) {
    return {
      intent: "informations",
      confidence: 0.7,
      suggestion: isFr
        ? "Tu cherches des informations ? Je t'ouvre la section Demande d'infos."
        : "Looking for information? I'm opening the Info Request section.",
      redirectPath: "/mission/informations",
    };
  }

  if (lowerMessage.includes("contact") || lowerMessage.includes("message") || lowerMessage.includes("parler") || lowerMessage.includes("écrire") ||
    lowerMessage.includes("talk") || lowerMessage.includes("write")) {
    return {
      intent: "contact",
      confidence: 0.7,
      suggestion: isFr
        ? "Tu veux nous contacter ? Je t'ouvre la section Contact."
        : "You want to contact us? I'm opening the Contact section.",
      redirectPath: "/mission/contact",
    };
  }

  return {
    intent: "unclear",
    confidence: 0.3,
    suggestion: isFr
      ? "Dis-moi ce que tu souhaites faire : faire un don, devenir bénévole, nous contacter, ou demander des informations ?"
      : "Tell me what you want to do: make a donation, become a volunteer, contact us, or ask for information?",
    redirectPath: null,
  };
}

export async function suggestDonationAmount(userMessage: string, language: string = 'fr'): Promise<{
  suggestedAmount: number;
  frequency: "ponctuel" | "mensuel" | "annuel";
  reason: string;
  message: string;
}> {
  const currentYear = new Date().getFullYear();

  if (!openai) {
    return suggestDonationFallback(userMessage, language);
  }

  const prompt = `You are Axolotl, the AI assistant of the Connected Nexus for the Night of Info ${currentYear}.

The user wants to make a donation and said: "${userMessage}"
Target language for response: "${language}"

Analyze their message and suggest an amount adapted to their situation.
Clues to consider:
- If they mention limited budget → suggest 5-10€
- If they seem motivated but undecided → suggest 25€
- If they seem very enthusiastic → suggest 50-100€
- If they mention regularity → suggest monthly

Respond in JSON with this exact format:
{
  "suggestedAmount": number between 5 and 100,
  "frequency": "ponctuel|mensuel|annuel",
  "reason": "Short theme related to Nexus/Night of Info ${currentYear} in ${language}",
  "message": "Personalized encouraging message of 1-2 phrases in ${language}"
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
      reason: result.reason || (language === 'fr' ? `Soutien au Nexus ${currentYear}` : `Support for Nexus ${currentYear}`),
      message: result.message || (language === 'fr' ? "Chaque contribution compte !" : "Every contribution counts!"),
    };
  } catch (error) {
    console.error("OpenAI donation suggestion error:", error);
    return suggestDonationFallback(userMessage, language);
  }
}

function suggestDonationFallback(message: string, language: string = 'fr'): {
  suggestedAmount: number;
  frequency: "ponctuel" | "mensuel" | "annuel";
  reason: string;
  message: string;
} {
  const lowerMessage = message.toLowerCase();
  const currentYear = new Date().getFullYear();
  const isFr = language === 'fr';

  if (lowerMessage.includes("pas trop") || lowerMessage.includes("peu") || lowerMessage.includes("petit") || lowerMessage.includes("budget") ||
    lowerMessage.includes("not too much") || lowerMessage.includes("little") || lowerMessage.includes("small")) {
    return {
      suggestedAmount: 5,
      frequency: "ponctuel",
      reason: isFr ? `Premier pas dans le Nexus ${currentYear}` : `First step in Nexus ${currentYear}`,
      message: isFr
        ? "Même 5€ font une vraie différence ! Chaque contribution renforce notre communauté."
        : "Even 5€ makes a real difference! Every contribution strengthens our community.",
    };
  }

  if (lowerMessage.includes("régulier") || lowerMessage.includes("mensuel") || lowerMessage.includes("chaque mois") ||
    lowerMessage.includes("regular") || lowerMessage.includes("monthly") || lowerMessage.includes("every month")) {
    return {
      suggestedAmount: 10,
      frequency: "mensuel",
      reason: isFr ? `Gardien mensuel du Nexus ${currentYear}` : `Monthly Guardian of Nexus ${currentYear}`,
      message: isFr
        ? "Un don mensuel nous permet de planifier à long terme. Tu deviens un véritable pilier !"
        : "A monthly donation allows us to plan for the long term. You become a true pillar!",
    };
  }

  if (lowerMessage.includes("généreux") || lowerMessage.includes("beaucoup") || lowerMessage.includes("maximum") ||
    lowerMessage.includes("generous") || lowerMessage.includes("lot") || lowerMessage.includes("max")) {
    return {
      suggestedAmount: 100,
      frequency: "ponctuel",
      reason: isFr ? `Chevalier du Code ${currentYear}` : `Knight of Code ${currentYear}`,
      message: isFr
        ? "Quelle générosité ! Avec ce don, tu deviens un véritable Chevalier du Code !"
        : "Such generosity! With this donation, you become a true Knight of Code!",
    };
  }

  return {
    suggestedAmount: 25,
    frequency: "ponctuel",
    reason: isFr ? `Soutien au Nexus ${currentYear}` : `Support for Nexus ${currentYear}`,
    message: isFr
      ? "25€ est un excellent choix pour soutenir nos projets ! Tu fais partie des bâtisseurs du Nexus."
      : "25€ is an excellent choice to support our projects! You are part of the Nexus builders.",
  };
}

export async function chatWithAssistant(userMessage: string, context?: string, language: string = 'fr'): Promise<string> {
  const currentYear = new Date().getFullYear();
  const isFr = language === 'fr';

  if (!openai) {
    return isFr
      ? "Je suis Axolotl, ton guide dans le Nexus ! Malheureusement, mes circuits IA sont temporairement hors ligne. Tu peux quand même explorer les différentes missions ci-dessous."
      : "I am Axolotl, your guide in the Nexus! Unfortunately, my AI circuits are temporarily offline. You can still explore the different missions below.";
  }

  const prompt = `You are Axolotl, the friendly and futuristic AI assistant of the Connected Nexus for the Night of Info ${currentYear}.

Your role:
- Guide users to the right mission (donation, volunteering, contact, information)
- Answer concisely and engagingly (max 2-3 sentences)
- Use tech/futuristic but accessible vocabulary
- Be warm and encouraging

${context ? `Context: ${context}` : ""}
Target language for response: "${language}"

User message: "${userMessage}"

Respond directly without quotes or formatting in ${language}.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 150,
    });

    return response.choices[0].message.content || (isFr ? "Dis-moi comment je peux t'aider !" : "Tell me how I can help you!");
  } catch (error) {
    console.error("OpenAI chat error:", error);
    return isFr
      ? "Mes circuits ont un petit bug ! Essaie de reformuler ta demande ou explore les missions ci-dessous."
      : "My circuits have a small bug! Try rephrasing your request or explore the missions below.";
  }
}
