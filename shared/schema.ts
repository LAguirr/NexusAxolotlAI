import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Mission types
export const missionTypes = ["don", "benevolat", "contact", "informations"] as const;
export type MissionType = typeof missionTypes[number];

// Emotion types for thank you messages
export const emotionTypes = ["epique", "bienveillant", "drole"] as const;
export type EmotionType = typeof emotionTypes[number];

// Donation frequencies
export const donationFrequencies = ["ponctuel", "mensuel", "annuel"] as const;
export type DonationFrequency = typeof donationFrequencies[number];

// Contact request categories
export const contactCategories = ["technique", "generale", "inscription", "plainte", "felicitations", "autre"] as const;
export type ContactCategory = typeof contactCategories[number];

// Base submission schema
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey(),
  missionType: text("mission_type").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  message: text("message"),
  emotionPreference: text("emotion_preference").default("bienveillant"),
  aiThankYouMessage: text("ai_thank_you_message"),
  createdAt: text("created_at").notNull(),
});

// Donation specific data
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey(),
  submissionId: varchar("submission_id").notNull(),
  amount: integer("amount").notNull(),
  frequency: text("frequency").notNull(),
  customMessage: text("custom_message"),
});

// Volunteer specific data
export const volunteers = pgTable("volunteers", {
  id: varchar("id").primaryKey(),
  submissionId: varchar("submission_id").notNull(),
  skills: text("skills").array().notNull(),
  availability: text("availability").notNull(),
  motivation: text("motivation"),
});

// Contact specific data
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey(),
  submissionId: varchar("submission_id").notNull(),
  subject: text("subject").notNull(),
  category: text("category"),
  priority: text("priority"),
  aiSummary: text("ai_summary"),
});

// Information request specific data
export const infoRequests = pgTable("info_requests", {
  id: varchar("id").primaryKey(),
  submissionId: varchar("submission_id").notNull(),
  requestType: text("request_type").notNull(),
  specificQuestion: text("specific_question"),
});

// Zod schemas for validation
export const baseSubmissionSchema = z.object({
  missionType: z.enum(missionTypes),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  message: z.string().optional(),
  emotionPreference: z.enum(emotionTypes).default("bienveillant"),
});

export const donationFormSchema = baseSubmissionSchema.extend({
  missionType: z.literal("don"),
  amount: z.number().min(1, "Le montant doit être supérieur à 0"),
  frequency: z.enum(donationFrequencies),
  customMessage: z.string().optional(),
});

export const volunteerFormSchema = baseSubmissionSchema.extend({
  missionType: z.literal("benevolat"),
  skills: z.array(z.string()).min(1, "Sélectionnez au moins une compétence"),
  availability: z.string().min(1, "Veuillez indiquer vos disponibilités"),
  motivation: z.string().optional(),
});

export const contactFormSchema = baseSubmissionSchema.extend({
  missionType: z.literal("contact"),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
});

export const infoRequestFormSchema = baseSubmissionSchema.extend({
  missionType: z.literal("informations"),
  requestType: z.string().min(1, "Veuillez sélectionner un type de demande"),
  specificQuestion: z.string().optional(),
});

// Union type for all form submissions
export const submissionFormSchema = z.discriminatedUnion("missionType", [
  donationFormSchema,
  volunteerFormSchema,
  contactFormSchema,
  infoRequestFormSchema,
]);

export type SubmissionForm = z.infer<typeof submissionFormSchema>;
export type DonationForm = z.infer<typeof donationFormSchema>;
export type VolunteerForm = z.infer<typeof volunteerFormSchema>;
export type ContactForm = z.infer<typeof contactFormSchema>;
export type InfoRequestForm = z.infer<typeof infoRequestFormSchema>;

// Response types
export interface SubmissionResponse {
  id: string;
  missionType: MissionType;
  firstName: string;
  lastName: string;
  aiThankYouMessage: string;
  createdAt: string;
}

export interface AIMessage {
  role: "assistant" | "user";
  content: string;
}

// Legacy user schema (keeping for compatibility)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
