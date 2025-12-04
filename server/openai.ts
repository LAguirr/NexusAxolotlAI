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
