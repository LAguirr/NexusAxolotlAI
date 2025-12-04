import { randomUUID } from "crypto";
import type { 
  MissionType, 
  EmotionType,
  SubmissionResponse 
} from "@shared/schema";

export interface BaseSubmission {
  id: string;
  missionType: MissionType;
  firstName: string;
  lastName: string;
  email: string;
  message?: string;
  emotionPreference: EmotionType;
  aiThankYouMessage?: string;
  createdAt: string;
}

export interface DonationSubmission extends BaseSubmission {
  missionType: "don";
  amount: number;
  frequency: "ponctuel" | "mensuel" | "annuel";
  customMessage?: string;
}

export interface VolunteerSubmission extends BaseSubmission {
  missionType: "benevolat";
  skills: string[];
  availability: string;
  motivation?: string;
}

export interface ContactSubmission extends BaseSubmission {
  missionType: "contact";
  subject: string;
  category?: string;
  priority?: string;
  aiSummary?: string;
}

export interface InfoRequestSubmission extends BaseSubmission {
  missionType: "informations";
  requestType: string;
  specificQuestion?: string;
}

export type Submission = 
  | DonationSubmission 
  | VolunteerSubmission 
  | ContactSubmission 
  | InfoRequestSubmission;

export interface IStorage {
  createSubmission(data: Omit<Submission, "id" | "createdAt">): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | undefined>;
  getAllSubmissions(): Promise<Submission[]>;
  updateSubmissionAIMessage(id: string, message: string): Promise<Submission | undefined>;
}

export class MemStorage implements IStorage {
  private submissions: Map<string, Submission>;

  constructor() {
    this.submissions = new Map();
  }

  async createSubmission(data: Omit<Submission, "id" | "createdAt">): Promise<Submission> {
    const id = randomUUID();
    const submission: Submission = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    } as Submission;
    this.submissions.set(id, submission);
    return submission;
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateSubmissionAIMessage(id: string, message: string): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (submission) {
      submission.aiThankYouMessage = message;
      this.submissions.set(id, submission);
      return submission;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
