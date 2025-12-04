import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { submissionFormSchema } from "@shared/schema";
import { 
  generateThankYouMessage, 
  classifyContactRequest, 
  analyzeUserIntent, 
  suggestDonationAmount,
  chatWithAssistant 
} from "./openai";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/submissions", async (req, res) => {
    try {
      const validatedData = submissionFormSchema.parse(req.body);
      
      let submissionData: any = { ...validatedData };
      
      if (validatedData.missionType === "contact") {
        const classification = await classifyContactRequest(
          validatedData.message,
          validatedData.subject
        );
        submissionData.category = classification.category;
        submissionData.priority = classification.priority;
        submissionData.aiSummary = classification.summary;
      }
      
      const submission = await storage.createSubmission(submissionData);
      
      const aiMessage = await generateThankYouMessage(submission);
      await storage.updateSubmissionAIMessage(submission.id, aiMessage);
      
      const response = {
        id: submission.id,
        missionType: submission.missionType,
        firstName: submission.firstName,
        lastName: submission.lastName,
        aiThankYouMessage: aiMessage,
        createdAt: submission.createdAt,
      };
      
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ 
          error: "Validation error", 
          details: validationError.message 
        });
      } else {
        console.error("Submission error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/submissions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const submission = await storage.getSubmission(id);
      
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      
      const response = {
        id: submission.id,
        missionType: submission.missionType,
        firstName: submission.firstName,
        lastName: submission.lastName,
        aiThankYouMessage: submission.aiThankYouMessage,
        createdAt: submission.createdAt,
      };
      
      res.json(response);
    } catch (error) {
      console.error("Get submission error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/submissions", async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      
      const response = submissions.map(s => ({
        id: s.id,
        missionType: s.missionType,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        createdAt: s.createdAt,
      }));
      
      res.json(response);
    } catch (error) {
      console.error("Get all submissions error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ai/analyze-intent", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      
      const result = await analyzeUserIntent(message);
      res.json(result);
    } catch (error) {
      console.error("Intent analysis error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ai/suggest-donation", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      
      const result = await suggestDonationAmount(message);
      res.json(result);
    } catch (error) {
      console.error("Donation suggestion error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }
      
      const response = await chatWithAssistant(message, context);
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return httpServer;
}
