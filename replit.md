# Le Nexus Connecté - L'Écho Personnalisé

## Overview

Le Nexus Connecté is a futuristic, AI-powered contact and engagement platform designed for an association participating in "La Nuit de l'Info." The application guides users through different "missions" (donation, volunteering, contact, information requests) with an AI companion named Axolotl. Each submission generates a personalized AI thank-you message based on the user's chosen emotional tone (epic, benevolent, or humorous).

The application features a sophisticated, tech-forward design inspired by SFEIR's aesthetic, combining professional polish with futuristic AI interface elements. The user experience is built around guided journeys, dynamic form adaptation, and AI-enhanced interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18+ with TypeScript
- Vite for build tooling and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management
- React Hook Form with Zod validation for form handling
- Framer Motion for animations and transitions

**UI Component System:**
- Shadcn UI component library (New York style variant)
- Radix UI primitives for accessible components
- Tailwind CSS for styling with custom design tokens
- Custom theme system supporting light/dark modes

**Design System:**
- Color palette based on deep blues (#1E40AF to #2563EB) with electric blue accents
- Inter font family for modern, tech-forward typography
- Responsive design with mobile-first approach
- AI avatar companion (Axolotl) with speech bubble interface
- Emotion-based UI customization (epic, benevolent, humorous tones)

**Page Structure:**
- Home page with mission selection cards
- Four mission-specific form pages (donation, volunteering, contact, information)
- Dynamic confirmation page with AI-generated personalized messages
- 404 not found page with AI guidance

**Form Architecture:**
- Mission-specific forms with conditional field rendering
- Real-time validation using Zod schemas
- Emotion selector component for thank-you message tone
- Character counters and preset value selectors where applicable
- Optimistic UI updates with error handling

### Backend Architecture

**Server Framework:**
- Express.js server with TypeScript
- HTTP server creation for potential WebSocket support
- Custom middleware for request logging and JSON parsing
- Raw body capture for webhook verification (if needed)

**API Design:**
- RESTful API endpoints under `/api` prefix
- POST `/api/submissions` - Creates new submission with AI message generation
- JSON request/response format
- Comprehensive error handling with Zod validation errors

**Request Flow:**
1. Client submits form data
2. Server validates against Zod schema
3. For contact missions, AI classifies request (category, priority, summary)
4. Submission stored in data layer
5. OpenAI generates personalized thank-you message
6. AI message stored and returned to client
7. Client navigates to confirmation page

**AI Integration (OpenAI):**
- GPT-5 model for message generation (latest as of August 2025)
- Emotion-specific prompt engineering (epic, benevolent, humorous)
- Mission-specific context incorporation
- Contact request classification (category, priority, summary)
- Dynamic year injection for temporal relevance
- Conditional API usage (gracefully handles missing API key)

### Data Storage Solutions

**ORM & Database:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as primary database (configured via `DATABASE_URL`)
- Migration system using Drizzle Kit

**Schema Design:**
- Base `submissions` table with common fields (id, missionType, firstName, lastName, email, message, emotionPreference, aiThankYouMessage, createdAt)
- Mission-specific tables:
  - `donations` - amount, frequency, customMessage
  - `volunteers` - skills array, availability, motivation
  - Contact and info requests use base table with additional JSON fields
- Discriminated union type system for type safety across mission types

**Storage Abstraction:**
- In-memory storage implementation for development/testing
- Interface-based design allows database swap without code changes
- UUID-based primary keys using `crypto.randomUUID()`
- ISO timestamp strings for temporal data

### Authentication and Authorization

**Current State:**
- No authentication system implemented
- Public submission endpoints
- Future consideration: Session management infrastructure present (`connect-pg-simple`, `express-session`)

### External Dependencies

**Third-Party Services:**
- **OpenAI API** - GPT-5 for AI message generation and request classification
  - Configured via `OPENAI_API_KEY` environment variable
  - Graceful degradation when API key missing

**Frontend Libraries:**
- **Radix UI** - Accessible component primitives (18+ components)
- **Framer Motion** - Animation library for transitions and micro-interactions
- **React Hook Form** - Form state management
- **Zod** - Runtime type validation and schema definition
- **TanStack Query** - Server state management and caching
- **Wouter** - Lightweight routing (~1.5KB)
- **Tailwind CSS** - Utility-first styling framework
- **Class Variance Authority** - Component variant management
- **date-fns** - Date manipulation utilities

**Backend Libraries:**
- **Express** - Web server framework
- **Drizzle ORM** - Database ORM with PostgreSQL dialect
- **Zod Validation Error** - Human-readable validation error formatting
- **OpenAI SDK** - Official OpenAI API client

**Build Tools:**
- **Vite** - Frontend build tool and dev server
- **esbuild** - Server bundling for production
- **TypeScript** - Type safety across full stack
- **PostCSS** - CSS processing with Tailwind
- **tsx** - TypeScript execution for development

**Development Tools:**
- Replit-specific plugins (cartographer, dev banner, runtime error overlay)
- Drizzle Kit for database migrations
- Custom build script for production bundling